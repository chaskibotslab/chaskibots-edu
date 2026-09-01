/**
 * pythonRunner — Motor compartido de ejecución Python (Pyodide)
 * Usado por PythonIDE y AITerminal.
 *
 * Características:
 *  - input() real (dialog nativo con echo en terminal)
 *  - stdout/stderr en streaming (línea por línea)
 *  - Soporte de top-level await (runPythonAsync)
 *  - Auto-instalación de paquetes al importar (numpy, matplotlib, pandas...)
 *  - Captura de gráficos matplotlib como imágenes PNG base64
 *  - Cámara web real: activar_camara() / tomar_foto() / cerrar_camara()
 *  - Subir imágenes propias: subir_imagen() / obtener_imagen()
 *  - Timing real de ejecución
 *  - Tracebacks de Python limpios
 */

declare global {
  interface Window {
    loadPyodide: any
    pyodide: any
    __chaskiInput?: (promptText: string) => string | null
    __chaskiCameraStart?: () => Promise<void>
    __chaskiCameraStop?: () => void
    __chaskiCameraCapture?: () => string | null
    __chaskiUploadImage?: () => void
    __chaskiGetUploadedImage?: () => string | null
  }
}

const PYODIDE_VERSION = 'v0.24.1'
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`

// Prefijo especial para imágenes en la salida del terminal
export const IMG_PREFIX = '__IMG__'

/** Línea especial: la terminal debe renderizarla como un botón real de "recargar" */
export const RELOAD_BUTTON_MARKER = '__RELOAD_BUTTON__'

/**
 * true si el error viene de que el navegador bloqueó/canceló el cuadro de
 * input() (ver __chaski_input en PY_BOOTSTRAP). El componente que renderiza
 * la terminal debe mostrar un botón real de "recargar" cuando esto ocurra —
 * el texto del error por sí solo es fácil de pasar por alto.
 */
export function isInputBlockedError(error: string | null): boolean {
  return !!error && error.includes('No se recibió ninguna entrada')
}

// ─────────────────────────────────────────────────────────────
// CÁMARA WEB — activar_camara() / tomar_foto() / cerrar_camara()
// Estado compartido a nivel de módulo (como window.pyodide): así el
// estudiante puede activar_camara() en un Ejecutar y tomar_foto() en el
// siguiente, y el stream sigue vivo entre corridas hasta que la cierre.
// ─────────────────────────────────────────────────────────────
let cameraStream: MediaStream | null = null
let cameraVideoEl: HTMLVideoElement | null = null
const cameraListeners = new Set<(active: boolean) => void>()

/** El componente que renderiza el <video> debe registrarlo aquí (y des-registrarlo con null al desmontar) */
export function registerCameraVideoElement(el: HTMLVideoElement | null) {
  cameraVideoEl = el
  if (el && cameraStream) el.srcObject = cameraStream
}

/** Suscribirse a cambios de estado (cámara prendida/apagada). Devuelve función para des-suscribirse. */
export function onCameraStateChange(cb: (active: boolean) => void): () => void {
  cameraListeners.add(cb)
  return () => cameraListeners.delete(cb)
}

export function isCameraActive(): boolean {
  return !!cameraStream
}

/** Pide permiso y activa la cámara. Pública — usada por activar_camara() y por comandos como HackingTerminal's "webcam". */
export async function startCamera(): Promise<{ ok: boolean; error?: string }> {
  if (cameraStream) return { ok: true }
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { ok: false, error: 'Este navegador no soporta acceso a la cámara.' }
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    if (cameraVideoEl) cameraVideoEl.srcObject = cameraStream
    cameraListeners.forEach(cb => cb(true))
    return { ok: true }
  } catch (e: any) {
    let error = 'No se pudo acceder a la cámara.'
    if (e?.name === 'NotAllowedError') error = 'Permiso de cámara denegado. Revisa los permisos del sitio (icono de candado en la barra de direcciones) y vuelve a intentar.'
    else if (e?.name === 'NotFoundError') error = 'No se encontró ninguna cámara en este dispositivo.'
    else if (e?.name === 'NotReadableError') error = 'La cámara está siendo usada por otra aplicación.'
    return { ok: false, error }
  }
}

/** Apaga la cámara. Pública — usada tanto por cerrar_camara() como por el botón manual y el cleanup al desmontar. */
export function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop())
    cameraStream = null
  }
  if (cameraVideoEl) cameraVideoEl.srcObject = null
  cameraListeners.forEach(cb => cb(false))
}

function captureCameraFrame(): string | null {
  if (!cameraVideoEl || !cameraStream) return null
  const canvas = document.createElement('canvas')
  canvas.width = cameraVideoEl.videoWidth || 320
  canvas.height = cameraVideoEl.videoHeight || 240
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(cameraVideoEl, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png').split(',')[1] || null
}

// ─────────────────────────────────────────────────────────────
// SUBIR IMAGEN — subir_imagen() / obtener_imagen()
// Mismo patrón de 2 pasos que la cámara: abrir el selector es async
// (esperando que el usuario elija un archivo), así que subir_imagen()
// dispara el selector y obtener_imagen() recoge el resultado una vez listo.
// ─────────────────────────────────────────────────────────────
let uploadedImageBase64: string | null = null
let uploadedImageName: string | null = null
const uploadListeners = new Set<(fileName: string | null) => void>()

/** Suscribirse a cuando el usuario termina de subir una imagen. Devuelve función para des-suscribirse. */
export function onImageUploaded(cb: (fileName: string | null) => void): () => void {
  uploadListeners.add(cb)
  return () => uploadListeners.delete(cb)
}

export function getUploadedImageName(): string | null {
  return uploadedImageName
}

function triggerImageUpload(onDone: (ok: boolean, error?: string) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return onDone(false, 'No se seleccionó ningún archivo.')
    if (file.size > 8 * 1024 * 1024) return onDone(false, 'La imagen es muy grande (máximo 8MB).')
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      uploadedImageBase64 = dataUrl.split(',')[1] || null
      uploadedImageName = file.name
      uploadListeners.forEach(cb => cb(uploadedImageName))
      onDone(true)
    }
    reader.onerror = () => onDone(false, 'No se pudo leer el archivo.')
    reader.readAsDataURL(file)
  }
  input.click()
}

export interface PyRunOptions {
  /** Callback por cada línea de salida en tiempo real */
  onLine?: (line: string, type: 'stdout' | 'stderr') => void
  /** Handler personalizado para input(). Por defecto usa window.prompt */
  inputHandler?: (promptText: string) => string | null
}

export interface PyRunResult {
  lines: { text: string; type: 'stdout' | 'stderr' }[]
  /** Imágenes PNG en base64 (gráficos matplotlib) */
  images: string[]
  /** Traceback de Python formateado, o null si no hubo error */
  error: string | null
  elapsedMs: number
}

/** Falla con un mensaje claro si la promesa no resuelve dentro de `ms` (evita cuelgues silenciosos por red lenta/caída) */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (v) => { clearTimeout(timer); resolve(v) },
      (e) => { clearTimeout(timer); reject(e) }
    )
  })
}

// Promesa compartida: si dos componentes (Python IDE + AI Terminal) llaman a
// ensurePyodide() casi al mismo tiempo, ambos deben esperar la MISMA carga en
// vez de instanciar cada uno su propio intérprete de Pyodide (eso dejaba a
// medias el bootstrap de input()/matplotlib en la instancia que no "ganaba").
let pyodideLoadPromise: Promise<any> | null = null

/** Carga Pyodide (idempotente — reutiliza la instancia global) */
export async function ensurePyodide(onStatus?: (msg: string) => void): Promise<any> {
  if (typeof window === 'undefined') throw new Error('Pyodide solo funciona en el navegador')
  if (window.pyodide) return window.pyodide
  if (pyodideLoadPromise) return pyodideLoadPromise

  pyodideLoadPromise = (async () => {
    onStatus?.('Descargando Python 3.11 (~12MB, solo la primera vez)...')

    if (!document.querySelector('script[src*="pyodide"]')) {
      const script = document.createElement('script')
      script.src = `${PYODIDE_BASE}pyodide.js`
      script.async = true
      document.head.appendChild(script)
      await withTimeout(
        new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('No se pudo descargar Pyodide. Verifica tu conexión.'))
        }),
        30000,
        'Pyodide tardó demasiado en descargar. Verifica tu conexión e intenta de nuevo.'
      )
    }

    // Esperar a que loadPyodide esté disponible (por si el script ya estaba en el DOM cargándose)
    let retries = 0
    while (!window.loadPyodide && retries < 100) {
      await new Promise(r => setTimeout(r, 100))
      retries++
    }
    if (!window.loadPyodide) throw new Error('Pyodide no se inicializó')

    const pyodide = await withTimeout<any>(
      window.loadPyodide({ indexURL: PYODIDE_BASE }),
      60000,
      'Pyodide tardó demasiado en inicializar. Verifica tu conexión e intenta de nuevo.'
    )
    window.pyodide = pyodide

    // Configuración inicial: matplotlib headless + input() personalizado
    pyodide.runPython(PY_BOOTSTRAP)

    onStatus?.('Python listo')
    return pyodide
  })()

  try {
    return await pyodideLoadPromise
  } catch (e) {
    // Permite reintentar en el próximo click en vez de quedar atascado con una promesa rota
    pyodideLoadPromise = null
    throw e
  }
}

/** Bootstrap que se ejecuta UNA vez al cargar Pyodide */
const PY_BOOTSTRAP = `
import os, builtins
# matplotlib sin display — renderiza a buffer (capturamos como PNG)
os.environ['MPLBACKEND'] = 'AGG'

import js as __js

def __chaski_input(prompt=''):
    """input() real: muestra un diálogo y hace echo en el terminal."""
    p = str(prompt)
    if p:
        print(p, end='', flush=True)
    try:
        res = __js.window.__chaskiInput(p)
    except Exception:
        res = None
    if res is None:
        # El navegador canceló o BLOQUEÓ el cuadro de diálogo (p. ej. el
        # usuario marcó "No permitir más cuadros de diálogo en esta página").
        # Antes esto devolvía '' silenciosamente y el error real (ValueError
        # al convertir '' a int/float, etc.) confundía más que ayudaba.
        # input() de Python real lanza EOFError cuando no hay más entrada —
        # es el comportamiento correcto y además explica qué pasó.
        print('', flush=True)
        raise EOFError(
            'No se recibió ninguna entrada. Si cancelaste el cuadro de texto, '
            'o tu navegador bloqueó las ventanas emergentes de esta página '
            '("No permitir más cuadros de diálogo"), recarga la página (F5) '
            'e inténtalo de nuevo.'
        )
    res = str(res)
    print(res, flush=True)
    return res

builtins.input = __chaski_input

def activar_camara():
    """Activa tu camara web (el navegador te pedira permiso) y la muestra en vivo en la terminal."""
    __js.window.__chaskiCameraStart()

def tomar_foto():
    """Toma una foto desde la camara activa, la muestra en la terminal, y la devuelve
    como una imagen PIL para que puedas procesarla (filtros, blanco y negro, etc).
    Devuelve None si la camara no esta activa."""
    b64 = __js.window.__chaskiCameraCapture()
    if b64 is None:
        print("No hay una foto disponible - activa la camara primero con activar_camara()")
        return None
    import base64 as __b64mod, io as __io_mod
    from PIL import Image as __PILImage
    return __PILImage.open(__io_mod.BytesIO(__b64mod.b64decode(str(b64))))

def cerrar_camara():
    """Apaga la camara web."""
    __js.window.__chaskiCameraStop()

def subir_imagen():
    """Abre el selector de archivos de tu computadora para elegir una imagen.
    Es un proceso de 2 pasos: corre subir_imagen(), elige el archivo en el
    cuadro que se abre, y luego en un SIGUIENTE Ejecutar usa obtener_imagen()
    para recibirla como imagen PIL lista para procesar."""
    __js.window.__chaskiUploadImage()
    print("Selecciona una imagen en el cuadro que se abrió. Cuando termines, usa obtener_imagen().")

def obtener_imagen():
    """Devuelve la ultima imagen subida con subir_imagen(), como imagen PIL.
    Devuelve None si todavia no has subido ninguna."""
    b64 = __js.window.__chaskiGetUploadedImage()
    if b64 is None:
        print("No hay ninguna imagen subida todavia. Usa subir_imagen() primero.")
        return None
    import base64 as __b64mod2, io as __io_mod2
    from PIL import Image as __PILImage2
    return __PILImage2.open(__io_mod2.BytesIO(__b64mod2.b64decode(str(b64))))
`

/** Script que captura los gráficos matplotlib después de cada ejecución */
const PY_CAPTURE_FIGURES = `
import sys as __sys, json as __json
__figs = []
if 'matplotlib' in __sys.modules:
    try:
        import matplotlib.pyplot as __plt
        import base64 as __b64, io as __io
        for __n in __plt.get_fignums():
            __buf = __io.BytesIO()
            __plt.figure(__n).savefig(__buf, format='png', dpi=140, bbox_inches='tight', facecolor='#0d1117', edgecolor='none')
            __buf.seek(0)
            __figs.append(__b64.b64encode(__buf.read()).decode())
        __plt.close('all')
    except Exception:
        pass
__json.dumps(__figs)
`

/** Limpia el traceback de Pyodide dejando solo la parte útil de Python */
function cleanTraceback(raw: string): string {
  const lines = raw.split('\n')
  // Buscar el inicio del traceback de Python
  const tbIndex = lines.findIndex(l => l.startsWith('Traceback'))
  let relevant = tbIndex >= 0 ? lines.slice(tbIndex) : lines
  // Filtrar frames internos de pyodide (no son del código del estudiante)
  relevant = relevant.filter(l =>
    !l.includes('pyodide/_base.py') &&
    !l.includes('/lib/python311.zip/') &&
    !l.trim().startsWith('await CodeRunner')
  )
  const cleaned = relevant.join('\n').trim()
  return cleaned || raw.split('\n').slice(-3).join('\n')
}

/**
 * Ejecuta código Python de forma robusta.
 * - Streaming de salida vía opts.onLine
 * - input() interactivo
 * - Auto-instala paquetes importados
 * - Captura gráficos matplotlib
 */
export async function runPython(code: string, opts: PyRunOptions = {}): Promise<PyRunResult> {
  const pyodide = await ensurePyodide()
  const lines: { text: string; type: 'stdout' | 'stderr' }[] = []

  const push = (text: string, type: 'stdout' | 'stderr') => {
    lines.push({ text, type })
    opts.onLine?.(text, type)
  }

  // Registrar el handler global de input()
  window.__chaskiInput = (promptText: string) => {
    if (opts.inputHandler) return opts.inputHandler(promptText)
    return window.prompt(promptText || 'Entrada (input):')
  }

  // Registrar los handlers de cámara (activar_camara/tomar_foto/cerrar_camara)
  window.__chaskiCameraStart = async () => {
    const res = await startCamera()
    if (!res.ok) push(`⚠️ ${res.error}`, 'stderr')
    else push('📷 Cámara activada', 'stdout')
  }
  window.__chaskiCameraStop = () => {
    stopCamera()
    push('📷 Cámara apagada', 'stdout')
  }
  window.__chaskiCameraCapture = () => {
    const photo = captureCameraFrame()
    if (photo) push(IMG_PREFIX + photo, 'stdout')
    return photo
  }

  // Registrar los handlers de subida de imagen (subir_imagen/obtener_imagen)
  window.__chaskiUploadImage = () => {
    triggerImageUpload((ok, error) => {
      if (ok) push(`🖼️ Imagen "${uploadedImageName}" subida — usa obtener_imagen() para procesarla`, 'stdout')
      else push(`⚠️ ${error}`, 'stderr')
    })
  }
  window.__chaskiGetUploadedImage = () => uploadedImageBase64

  // Salida en streaming
  pyodide.setStdout({ batched: (t: string) => push(t, 'stdout') })
  pyodide.setStderr({ batched: (t: string) => push(t, 'stderr') })

  const t0 = performance.now()
  let error: string | null = null

  try {
    // Auto-instalar paquetes según los imports del código (numpy, matplotlib, pandas...)
    try {
      await withTimeout(
        pyodide.loadPackagesFromImports(code),
        20000,
        'timeout instalando paquetes'
      )
    } catch { /* paquete no disponible o red lenta — el error real saldrá al ejecutar, o el import fallará con un mensaje claro */ }

    // tomar_foto()/obtener_imagen() usan PIL internamente aunque el código del
    // usuario no lo importe explícitamente — loadPackagesFromImports no lo detecta
    // porque el `from PIL import ...` vive dentro de la función inyectada, no en `code`.
    if (/\b(tomar_foto|obtener_imagen)\s*\(/.test(code)) {
      try {
        await withTimeout(pyodide.loadPackage('pillow'), 20000, 'timeout instalando pillow')
      } catch { /* si falla, el error real saldrá al ejecutar */ }
    }

    // runPythonAsync soporta top-level await (asyncio)
    await pyodide.runPythonAsync(code)
  } catch (e: any) {
    error = cleanTraceback(e?.message || String(e))
  }

  const elapsedMs = performance.now() - t0

  // Capturar gráficos matplotlib (si el usuario los generó)
  let images: string[] = []
  try {
    const figsJson = pyodide.runPython(PY_CAPTURE_FIGURES)
    images = JSON.parse(figsJson)
  } catch { /* sin matplotlib */ }

  // Restaurar stdout/stderr por defecto
  pyodide.setStdout()
  pyodide.setStderr()

  return { lines, images, error, elapsedMs }
}

/** Instala un paquete explícitamente (botones de pip install) */
export async function installPyPackage(pkg: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const pyodide = await ensurePyodide()
    await withTimeout(pyodide.loadPackage(pkg), 30000, `${pkg} tardó demasiado en instalar. Verifica tu conexión.`)
    return { ok: true }
  } catch (e: any) {
    // Intentar con micropip (paquetes puros de PyPI no incluidos en pyodide)
    try {
      const pyodide = window.pyodide
      await withTimeout(pyodide.loadPackage('micropip'), 30000, 'micropip tardó demasiado en instalar')
      const micropip = pyodide.pyimport('micropip')
      await withTimeout(micropip.install(pkg), 30000, `${pkg} tardó demasiado en instalar. Verifica tu conexión.`)
      return { ok: true }
    } catch (e2: any) {
      return { ok: false, error: e2?.message || e?.message || 'Paquete no disponible' }
    }
  }
}
