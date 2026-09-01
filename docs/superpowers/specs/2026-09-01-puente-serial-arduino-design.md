# Diseño: Puente Serial USB (Arduino / ESP32 / Raspberry Pi Pico)

**Fecha:** 2026-09-01
**Estado:** Aprobado por el usuario en conversación

## Contexto

`src/lib/pythonRunner.ts` ya tiene un puente JS↔Python para cámara web (`activar_camara()` /
`tomar_foto()` / `cerrar_camara()`, añadido en `f5f57b3`) y para subir imágenes propias
(`subir_imagen()` / `obtener_imagen()`, añadido en `4e13dd3`). Ambos siguen el mismo patrón: estado de
módulo en JS, funciones Python inyectadas que llaman a `__js.window.__chaski*()`, y limpieza automática
al desmontar el componente.

Este documento agrega un tercer puente del mismo tipo: conexión USB en vivo con una placa real
(Arduino, ESP32, Raspberry Pi Pico) usando la Web Serial API del navegador (`navigator.serial`), para
que el código Python del alumno pueda leer sensores y prender/apagar actuadores en hardware real, no
solo simulado.

Es el primero de una lista más larga que el usuario quiere eventualmente (Bluetooth/Web Bluetooth,
dashboard de sensores en vivo, "retos" de hardware con verificación automática, exportar código a
`.ino`, guardado opcional de lecturas en Supabase). Cada uno de esos ítems es un sub-proyecto aparte con
su propio diseño; este documento cubre **solo** el puente serial.

## Alcance

**Dentro de alcance:**
- Nuevas funciones Python: `conectar_arduino(baudrate=9600)`, `enviar_dato(texto)`, `leer_linea()`,
  `desconectar_arduino()`.
- Nuevo panel "Monitor Serial" en `PythonIDE` y `AITerminal` (mismo lugar/estilo que el panel de video
  de la cámara) que muestra en vivo cada línea recibida, con badge de estado y baud rate, y un botón
  manual de "Desconectar" siempre visible mientras hay conexión.
- Detección de navegador sin soporte (Firefox, Safari, móvil) con mensaje claro en español.
- Manejo de: cancelación del selector de puerto, desconexión física a mitad de sesión, limpieza
  automática al desmontar el componente o cambiar de simulador.
- Feature flag natural por navegador: si `navigator.serial` no existe, las funciones imprimen un
  mensaje explicativo en vez de fallar con un error críptico de JS.

**Fuera de alcance (sub-proyectos futuros, no se tocan aquí):**
- Web Bluetooth (conexión sin cable).
- Dashboard de sensores en vivo con gráficos (más allá del Monitor Serial de texto plano).
- "Retos" de hardware con verificación automática / calificación.
- Exportar código del simulador a `.ino` para flashear fuera del navegador.
- Guardado de lecturas en Supabase — decisión explícita del usuario: por ahora el puente es solo para
  practicar en vivo, nada se persiste en base de datos.
- Envío de bytes crudos / protocolos binarios — `enviar_dato()` solo maneja texto, igual que `print()`.
  Decisión explícita: menos superficie de API para un alumno que recién empieza.

## Arquitectura

Todo vive en `src/lib/pythonRunner.ts`, igual que cámara y subida de imágenes:

```
let serialPort: SerialPort | null = null
let serialReader: ReadableStreamDefaultReader | null = null
let serialWriter: WritableStreamDefaultWriter | null = null
let serialLineBuffer: string[] = []
let serialConnected = false
let serialBaudRate = 0

const serialStateListeners = new Set<(state: {connected: boolean; baudRate: number}) => void>()
const serialLineListeners = new Set<(line: string) => void>()

export function onSerialStateChange(cb): () => void   // para el badge de estado del panel
export function onSerialLine(cb): () => void            // para el Monitor Serial en vivo
```

`connectSerial(baudRate)`:
1. Verifica `'serial' in navigator`; si no existe, devuelve `{ok: false, error: '...'}` sin tocar nada más.
2. `await navigator.serial.requestPort()` (requiere gesto de usuario — ya lo tenemos porque esto se
   dispara dentro de la cadena síncrona del click en "Ejecutar", igual que `getUserMedia()` para la
   cámara).
3. `await port.open({baudRate})`.
4. Lanza un loop de lectura en segundo plano (`pipeThrough(new TextDecoderStream())`, lee de a chunks,
   separa por `\n`, empuja líneas completas a `serialLineBuffer` y notifica a `serialLineListeners`).
   El loop corre hasta que se llama a `disconnectSerial()` o el `reader.read()` lanza (cable
   desconectado) — en ese caso actualiza el estado a desconectado y notifica a `serialStateListeners`.
5. Notifica `serialStateListeners` con `{connected: true, baudRate}`.

`writeSerialLine(text)`: si no hay `serialWriter` activo, devuelve `false` (Python lo traduce en el
mensaje "no hay placa conectada"). Si lo hay, escribe `text + '\n'` codificado en UTF-8.

`readSerialLine()`: `serialLineBuffer.shift() ?? null` — no bloquea, es un pop simple del buffer.

`disconnectSerial()`: cancela el reader, cierra writer y puerto, limpia estado, notifica listeners.
Se llama también automáticamente en el cleanup de desmontaje del componente (mismo patrón que
`stopCamera` ya usa hoy).

### Funciones Python inyectadas

```python
def conectar_arduino(baudrate=9600):
    """Pide permiso para elegir tu placa por USB y la conecta.
    Funciona en Chrome/Edge de escritorio. En Firefox, Safari o celular no está disponible."""
    __js.window.__chaskiSerialConnect(baudrate)
    print("Elige tu placa en el cuadro que se abrió. Cuando conecte, ya puedes usar enviar_dato()/leer_linea().")

def enviar_dato(texto):
    """Envía una línea de texto a la placa conectada por USB."""
    ok = __js.window.__chaskiSerialWrite(str(texto))
    if not ok:
        print("No hay ninguna placa conectada. Usa conectar_arduino() primero.")

def leer_linea():
    """Devuelve la última línea recibida de la placa, o None si no hay nada nuevo todavía."""
    linea = __js.window.__chaskiSerialRead()
    return linea if linea else None

def desconectar_arduino():
    """Cierra la conexión con la placa USB."""
    __js.window.__chaskiSerialDisconnect()
```

Igual que `activar_camara()`, estas llamadas son fire-and-forget desde Python (no hay `await` real):
`conectar_arduino()` dispara el permiso y la apertura del puerto de forma asíncrona, y el alumno usa
`enviar_dato()`/`leer_linea()` en ese mismo `Ejecutar` (una vez que el mensaje de conexión aparezca) o
en un siguiente `Ejecutar`. Para leer continuamente, el patrón esperado en el código del alumno es un
`while True` con `time.sleep()` sondeando `leer_linea()`, igual que se haría con `Serial.available()`
en Arduino real — no se introduce `async`/`await` de Python, manteniendo la consistencia pedagógica del
resto del simulador.

## UI (`PythonIDE` y `AITerminal`)

- Nuevo estado `serialState: {connected: boolean; baudRate: number}` y `serialLines: string[]`
  (capadas a las últimas ~200 líneas para no crecer sin límite), suscritos vía `onSerialStateChange` /
  `onSerialLine` en un `useEffect`, mismo lugar donde ya vive el `useEffect` de la cámara.
- Panel "Monitor Serial": aparece solo cuando `serialState.connected` es `true`, mismo estilo visual que
  el panel de cámara (franja con ícono, texto de estado, botón de acción). Debajo, una lista
  monoespaciada con las líneas recibidas (más reciente abajo, auto-scroll).
- Badge de estado: "● Conectado · 9600 baud" en verde, o nada si no hay conexión.
- Botón "Desconectar" siempre visible mientras `serialState.connected` es `true` — llama a
  `disconnectSerial()` directamente (no requiere pasar por Python), igual que el botón manual de apagar
  cámara.
- No hay botón de "Conectar": se dispara solo al ejecutar `conectar_arduino()` en el código, igual que
  la cámara.

## Manejo de errores

| Caso | Comportamiento |
|---|---|
| Navegador sin `navigator.serial` | Mensaje claro: "Tu navegador no soporta conexión USB directa (Web Serial). Usa Chrome o Edge en una computadora." Sin excepción JS sin capturar. |
| Alumno cancela el selector de puerto | `requestPort()` rechaza con `NotFoundError` — se captura, se imprime "No se seleccionó ninguna placa." La pestaña sigue respondiendo normalmente (a diferencia del selector de `<input type=file>`, el picker de Web Serial no bloquea la página al cancelar). |
| Cable desconectado a mitad de sesión | El `reader.read()` del loop de fondo lanza; se captura, se marca `serialConnected = false`, se notifica el cambio de estado y se imprime "⚠️ Se desconectó la placa." en la terminal. |
| Alumno llama `conectar_arduino()` estando ya conectado | Se desconecta la conexión anterior primero (cierre limpio) antes de abrir el nuevo picker, para no dejar un puerto bloqueado sin liberar. |
| Salir del simulador / cambiar de pestaña de ejercicio | Cleanup de desmontaje llama `disconnectSerial()`, igual que ya hace `stopCamera` hoy. |
| `enviar_dato()` / `leer_linea()` sin conexión activa | No lanzan excepción Python — devuelven `False`/`None` con mensaje explicativo, para que un alumno principiante no se enfrente a un traceback confuso. |

## Testing

No hay una placa física conectada a la máquina de desarrollo, así que la verificación de este
sub-proyecto se hace en dos niveles:

1. **Lógica de buffer/parseo de líneas**: se simula un `navigator.serial` falso vía
   `javascript_tool` (un `SerialPort` de mentira que devuelve un `ReadableStream` con bytes de prueba)
   para confirmar que el split por `\n`, el buffer, y `leer_linea()` funcionan como se espera — mismo
   enfoque que se usó para verificar `subir_imagen()`/`obtener_imagen()` sin abrir el diálogo nativo real.
2. **Conexión con hardware real**: queda pendiente de que el usuario la pruebe con su propio
   Arduino/ESP32/Pico una vez implementado, ya que este entorno no tiene una placa física disponible.

## Fuera de alcance explícito (para evitar ambigüedad)

- No se agrega ningún ejercicio nuevo al currículum de `AITerminal` en este sub-proyecto (a diferencia
  de `subir_imagen()`, que sí vino con un ejercicio guiado). Se puede agregar como sub-proyecto aparte
  una vez que el puente esté probado con hardware real.
- No se modifica `HackingTerminal` — el puente serial es exclusivo de `PythonIDE` y `AITerminal`.
