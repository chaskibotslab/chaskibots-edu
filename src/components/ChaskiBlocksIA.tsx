'use client'

/**
 * ChaskiBlocks IA: editor de bloques con escenario, al estilo de Scratch y PictoBlox.
 * Varios personajes con sus propios programas, eventos, sensores, variables, lápiz y
 * extensiones de inteligencia artificial (imagen, objetos, cuerpo y voz).
 *
 * Todo corre en el navegador: las imágenes de la cámara no se envían a ningún servidor.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  Flag, Octagon, Sparkles, BrainCircuit, GraduationCap, FilePlus2, FolderOpen, Download, Maximize2, Minimize2, Plus, Trash2,
  Eye, EyeOff, ChevronLeft, ChevronRight, X, Mic, Loader2, RotateCcw, Check, Trophy, Send,
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { ANCHO, ALTO, FONDOS, CATEGORIAS, TOOLBOX, BLOQUES_SOMBRERO, OBJETOS, dinamicos, definirBloques, crearTema, crearGenerador } from './chaskiblocks/bloques'
import { Motor, miraIzquierda, type Proyecto, type SpriteDef, type ScriptCompilado } from './chaskiblocks/motor'
import { MotorIA } from './chaskiblocks/ia'
import { proyectoNuevo, proyectoInicial, type Actividad } from './chaskiblocks/actividades'
import { PanelActividades, PanelEntrenar, PanelBiblioteca, Etiqueta } from './chaskiblocks/paneles'

const CLAVE_GUARDADO = 'chaskiblocks-ia:proyecto-v2'
const ESTILOS = `
.cbia .blocklyToolbox, .cbia .blocklyToolboxDiv { background: #fff; border-right: 1px solid #e2e8f0; padding: 6px 0; min-width: 136px; overflow-x: hidden; }
.cbia .blocklyToolboxCategory, .cbia .blocklyTreeRow { border-left: 0 !important; margin: 1px 6px; padding: 5px 8px !important; height: auto; line-height: 18px; border-radius: 8px; background: transparent !important; cursor: pointer; }
.cbia .blocklyToolboxCategory:hover, .cbia .blocklyTreeRow:hover { background: #f1f5f9 !important; }
.cbia .blocklyToolboxCategoryIcon, .cbia .blocklyTreeIcon { display: inline-block !important; visibility: visible !important; width: 14px; height: 14px; margin: 0 8px 0 0; border-radius: 50%; background: var(--cb, #94a3b8) !important; vertical-align: -2px; }
.cbia .blocklyToolboxCategoryLabel, .cbia .blocklyTreeLabel { color: #334155 !important; font: 600 12.5px "Helvetica Neue", Helvetica, Arial, sans-serif; }
.cbia .blocklyToolboxSelected, .cbia .blocklyTreeSelected { background: color-mix(in srgb, var(--cb, #94a3b8) 20%, white) !important; }
.cbia .blocklyToolboxSelected .blocklyToolboxCategoryLabel, .cbia .blocklyTreeSelected .blocklyTreeLabel { color: #0f172a !important; }
.cbia .blocklyFlyoutLabelText { fill: #475569; font-weight: 600; }
.cbia .blocklyFlyoutBackground { fill: #eef2f7 !important; fill-opacity: 0.97 !important; }
.cbia .blocklyFlyoutLabelText { fill: #475569 !important; }
.cbia .blocklyMainBackground { stroke: none; }
.cbia .blocklyFlyoutButton .blocklyFlyoutButtonBackground { fill: #FF8C1A; stroke: none; }
.cbia .blocklyFlyoutButton .blocklyFlyoutButtonShadow { fill: #d9730d; }
.cbia .blocklyFlyoutButton:hover .blocklyFlyoutButtonBackground { fill: #f07d0c; }
.cbia .blocklyFlyoutButton .blocklyText { fill: #fff !important; font-weight: 700; }
.cbia .blocklyScrollbarVertical, .cbia .blocklyScrollbarHorizontal, .cbia .blocklyFlyoutScrollbar { display: block !important; }
.cbia .blocklyToolbox, .cbia .blocklyToolboxDiv { background: #fff !important; border-right: 1px solid #e2e8f0 !important; }
.cbia input, .cbia button { font-family: inherit; }
`

const AsyncFunction = Object.getPrototypeOf(async function () { /* molde */ }).constructor

/** Cambia el valor de un campo en bloques guardados (al renombrar un personaje o una clase). */
function renombrarCampo(nodo: any, campo: string, viejo: string, nuevo: string) {
  if (!nodo || typeof nodo !== 'object') return
  if (nodo.fields && nodo.fields[campo] === viejo) nodo.fields[campo] = nuevo
  for (const k of Object.keys(nodo)) renombrarCampo(nodo[k], campo, viejo, nuevo)
}

function CampoNumero({ etiqueta, valor, alCambiar, ancho = 'w-14' }: { etiqueta: string; valor: number; alCambiar: (v: number) => void; ancho?: string }) {
  return (
    <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
      {etiqueta}
      <input type="number" value={Math.round(valor)} onChange={e => alCambiar(Number(e.target.value) || 0)} className={`${ancho} rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs font-semibold text-slate-900 focus:border-slate-500 focus:outline-none`} />
    </label>
  )
}

function CampoTexto({ valor, alConfirmar, etiqueta, className }: { valor: string; alConfirmar: (v: string) => void; etiqueta: string; className: string }) {
  const [texto, setTexto] = useState(valor)
  useEffect(() => setTexto(valor), [valor])
  const confirmar = () => { const v = texto.trim(); if (v && v !== valor) alConfirmar(v); else setTexto(valor) }
  return <input value={texto} aria-label={etiqueta} onChange={e => setTexto(e.target.value)} onBlur={confirmar} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} className={className} />
}

function Disfraz({ valor, px }: { valor: string; px: number }) {
  return valor.startsWith('data:')
    ? <img src={valor} alt="" draggable={false} style={{ height: px * 1.3, maxWidth: 'none', display: 'block' }} />
    : <span style={{ fontSize: px, lineHeight: 1, display: 'block', fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif' }}>{valor}</span>
}

export default function ChaskiBlocksIA() {
  const raiz = useRef<HTMLDivElement>(null)
  const divBloques = useRef<HTMLDivElement>(null)
  const marcoEscenario = useRef<HTMLDivElement>(null)
  const lienzoLapiz = useRef<HTMLCanvasElement>(null)
  const lienzoVideo = useRef<HTMLCanvasElement>(null)
  const videoIA = useRef<HTMLVideoElement>(null)
  const archivo = useRef<HTMLInputElement>(null)
  const ws = useRef<any>(null)
  const libs = useRef<any>(null)

  const iaRef = useRef<MotorIA>()
  if (!iaRef.current) iaRef.current = new MotorIA()
  const motorRef = useRef<Motor>()
  if (!motorRef.current) motorRef.current = new Motor(iaRef.current)
  const ia = iaRef.current
  const motor = motorRef.current
  const proyecto = useRef<Proyecto>(proyectoNuevo())
  const iaSucia = useRef(false)
  const videoPintado = useRef(false)
  const guardado = useRef<any>(null)

  const [, repintar] = useReducer((c: number) => c + 1, 0)
  const [listo, setListo] = useState(false)
  const [actual, setActual] = useState('s1')
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'info'; texto: string } | null>(null)
  const [completa, setCompleta] = useState(false)
  const [panel, setPanel] = useState<null | 'actividades' | 'entrenar' | 'personaje' | 'disfraz'>(null)
  const [guia, setGuia] = useState<{ a: Actividad; paso: number } | null>(null)
  const [pestana, setPestana] = useState<'personajes' | 'fondos'>('personajes')
  const [miniaturas, setMiniaturas] = useState<string[][]>([])
  const [escala, setEscala] = useState(0.8)
  const [respuesta, setRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [modalEnviar, setModalEnviar] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const { user } = useAuth()
  const actualRef = useRef(actual)
  actualRef.current = actual

  const sprites = proyecto.current.sprites
  const sprite = sprites.find(s => s.id === actual) || sprites[0]

  // ------------------------------------------------------------- guardado local
  const guardarActual = useCallback(() => {
    if (!ws.current || !libs.current) return
    const st = libs.current.Blockly.serialization.workspaces.save(ws.current)
    const s = proyecto.current.sprites.find(x => x.id === actualRef.current)
    if (s) s.bloques = st.blocks || { languageVersion: 0, blocks: [] }
    proyecto.current.variables = st.variables || []
  }, [])

  const programarGuardado = useCallback(() => {
    clearTimeout(guardado.current)
    guardado.current = setTimeout(() => {
      try {
        guardarActual()
        localStorage.setItem(CLAVE_GUARDADO, JSON.stringify({ ...proyecto.current, fondo: motor.fondo, entrenamiento: undefined }))
      } catch { /* almacenamiento no disponible */ }
    }, 700)
  }, [guardarActual, motor])

  const cambio = useCallback(() => { motor.sucio = true; programarGuardado() }, [motor, programarGuardado])

  // ---------------------------------------------------------- cargar en Blockly
  const mostrarSprite = useCallback((id: string) => {
    const p = proyecto.current
    const s = p.sprites.find(x => x.id === id) || p.sprites[0]
    dinamicos.sprites = p.sprites.map(x => x.nombre)
    dinamicos.clases = p.clases
    actualRef.current = s.id
    setActual(s.id)
    if (!ws.current || !libs.current) return
    const { Blockly } = libs.current
    Blockly.Events.disable()
    try {
      const estado: any = { variables: p.variables || [] }
      if (s.bloques?.blocks?.length) estado.blocks = s.bloques
      Blockly.serialization.workspaces.load(estado, ws.current)
    } catch (e) {
      console.error('ChaskiBlocks IA: no se pudieron cargar los bloques', e)
      ws.current.clear()
    } finally { Blockly.Events.enable() }
    ws.current.scroll(24, 24)
  }, [])

  const cargarProyecto = useCallback((p: Proyecto) => {
    motor.detener()
    proyecto.current = p
    motor.sprites = p.sprites
    motor.fondo = FONDOS[p.fondo] ? p.fondo : 'cielo'
    motor.V = {}
    motor.ef.clear()
    motor.video = false
    motor.videoOpacidad = 0.7
    motor.borrarLapiz()
    ia.usar = { objetos: false, cuerpo: false, mano: false }
    ia.fijarClases(p.clases)
    ia.importarEntrenamiento(p.entrenamiento)
    setMiniaturas([])
    setAviso(null)
    mostrarSprite(p.sprites[0].id)
    motor.sucio = true
    programarGuardado()
  }, [ia, motor, mostrarSprite, programarGuardado])

  // ------------------------------------------------------------- iniciar Blockly
  useEffect(() => {
    let vivo = true
    ;(async () => {
      const Blockly: any = await import('blockly')
      const jsMod: any = await import('blockly/javascript')
      const Es: any = await import('blockly/msg/es')
      if (!vivo || !divBloques.current) return
      Blockly.setLocale(Es.default || Es)
      Blockly.Msg.VARIABLES_SET = 'fijar %1 a %2'
      Blockly.Msg.MATH_CHANGE_TITLE = 'cambiar %1 por %2'
      Blockly.Msg.MATH_RANDOM_INT_TITLE = 'número al azar entre %1 y %2'
      Blockly.Msg.NEW_VARIABLE = 'Crear una variable…'
      definirBloques(Blockly)
      libs.current = { Blockly, gen: crearGenerador(jsMod) }
      ws.current = Blockly.inject(divBloques.current, {
        toolbox: TOOLBOX, theme: crearTema(Blockly), renderer: 'zelos', media: '/blockly-media/', trashcan: true,
        zoom: { controls: true, wheel: true, startScale: 0.75, maxScale: 1.6, minScale: 0.35, scaleSpeed: 1.15 },
        move: { scrollbars: true, drag: true, wheel: false },
        grid: { spacing: 28, length: 2, colour: '#dbe2ec', snap: false },
      })
      ws.current.getToolbox()?.getToolboxItems().forEach((it: any, i: number) => it.getDiv?.()?.style.setProperty('--cb', CATEGORIAS[i]?.color || '#94a3b8'))

      let inicial: Proyecto | null = null
      try {
        const g = JSON.parse(localStorage.getItem(CLAVE_GUARDADO) || 'null')
        if (g?.formato === 'chaskiblocks-ia' && Array.isArray(g.sprites) && g.sprites.length) inicial = g
      } catch { /* sin proyecto guardado */ }
      cargarProyecto(inicial || proyectoNuevo())
      ws.current.addChangeListener((e: any) => { if (!e.isUiEvent) programarGuardado() })
      setListo(true)
    })()
    return () => {
      vivo = false
      clearTimeout(guardado.current)
      motor.detener()
      ia.apagar()
      ws.current?.dispose(); ws.current = null
    }
  }, [cargarProyecto, ia, motor, programarGuardado])

  // Blockly debe medir de nuevo su espacio cuando cambia el tamaño del panel
  useEffect(() => {
    const el = divBloques.current
    if (!el) return
    const ro = new ResizeObserver(() => { if (ws.current && libs.current) libs.current.Blockly.svgResize(ws.current) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = marcoEscenario.current
    if (!el) return
    const ro = new ResizeObserver(() => setEscala(el.clientWidth / ANCHO))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!completa) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [completa])

  // ------------------------------------------------------- motores y repintado
  useEffect(() => {
    ia.video = videoIA.current
    ia.alCambiar = () => { iaSucia.current = true }
    motor.ctx = lienzoLapiz.current?.getContext('2d') || null
    motor.alError = texto => setAviso({ tipo: 'error', texto })
    motor.alPedirCamara = () => { ia.encenderCamara() }

    let cuadro = 0
    const pintar = () => {
      const c = lienzoVideo.current?.getContext('2d')
      const v = videoIA.current
      const conVideo = motor.video && ia.camara === 'lista' && !!v && v.readyState >= 2
      if (c && (conVideo || videoPintado.current)) {
        c.clearRect(0, 0, ANCHO, ALTO)
        videoPintado.current = conVideo
        if (conVideo) {
          c.save(); c.globalAlpha = motor.videoOpacidad; c.translate(ANCHO, 0); c.scale(-1, 1); c.drawImage(v!, 0, 0, ANCHO, ALTO); c.restore()
          if (ia.usar.objetos) {
            c.lineWidth = 2; c.font = 'bold 12px sans-serif'; c.textBaseline = 'top'
            for (const o of ia.objetos) {
              const x = ANCHO / 2 + o.x - o.ancho / 2, y = ALTO / 2 - o.y - o.alto / 2
              const nombre = `${OBJETOS.find(k => k[1] === o.clase)?.[0] || o.clase} ${o.seguridad}%`
              c.strokeStyle = '#22c55e'; c.strokeRect(x, y, o.ancho, o.alto)
              c.fillStyle = '#16a34a'; c.fillRect(x, Math.max(0, y - 16), c.measureText(nombre).width + 8, 16)
              c.fillStyle = '#fff'; c.fillText(nombre, x + 4, Math.max(0, y - 16) + 2)
            }
          }
          if (ia.usar.cuerpo || ia.usar.mano) {
            for (const p of Object.values(ia.cuerpo)) {
              if (!p.ok) continue
              c.beginPath(); c.arc(ANCHO / 2 + p.x, ALTO / 2 - p.y, 4, 0, Math.PI * 2)
              c.fillStyle = '#facc15'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1e293b'; c.stroke()
            }
          }
        }
      }
      if (motor.sucio || iaSucia.current) { motor.sucio = false; iaSucia.current = false; repintar() }
      cuadro = requestAnimationFrame(pintar)
    }
    cuadro = requestAnimationFrame(pintar)
    return () => cancelAnimationFrame(cuadro)
  }, [ia, motor])

  // ---------------------------------------------------------------- teclado
  useEffect(() => {
    const nombre = (e: KeyboardEvent) => (e.key === ' ' ? 'espacio' : e.key.length === 1 ? e.key.toLowerCase() : e.key)
    const escribiendo = (e: KeyboardEvent) => { const el = e.target as HTMLElement | null; return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) }
    const abajo = (e: KeyboardEvent) => {
      if (!motor.activo || escribiendo(e)) return
      if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault()
      motor.teclaAbajo(nombre(e))
    }
    const arriba = (e: KeyboardEvent) => motor.teclaArriba(nombre(e))
    window.addEventListener('keydown', abajo)
    window.addEventListener('keyup', arriba)
    return () => { window.removeEventListener('keydown', abajo); window.removeEventListener('keyup', arriba) }
  }, [motor])

  // ------------------------------------------------------------ ejecutar y parar
  const compilar = (): { scripts: ScriptCompilado[]; codigo: string } => {
    guardarActual()
    const { Blockly, gen } = libs.current
    const p = proyecto.current
    const scripts: ScriptCompilado[] = []
    let codigo = ''
    dinamicos.sprites = p.sprites.map(x => x.nombre)
    dinamicos.clases = p.clases
    Blockly.Events.disable()
    try {
      for (const s of p.sprites) {
        if (!s.bloques?.blocks?.length) continue
        const h = new Blockly.Workspace()
        try {
          Blockly.serialization.workspaces.load({ blocks: s.bloques, variables: p.variables || [] }, h)
          gen.init(h)
          const partes = h.getTopBlocks(true).filter((b: any) => BLOQUES_SOMBRERO.includes(b.type) && b.isEnabled()).map((b: any) => {
            const c = gen.blockToCode(b)
            return { tipo: b.type as string, arg: String(b.getFieldValue('K') ?? b.getFieldValue('M') ?? b.getFieldValue('C') ?? ''), cuerpo: Array.isArray(c) ? c[0] : c }
          })
          const previo = gen.finish('')
          for (const x of partes) {
            scripts.push({ spriteId: s.id, tipo: x.tipo, arg: x.arg, fn: new AsyncFunction('api', 'V', `${previo}\n${x.cuerpo}`) })
            codigo += x.cuerpo + '\n'
          }
        } finally { h.dispose() }
      }
    } finally { Blockly.Events.enable() }
    return { scripts, codigo }
  }

  const ejecutar = () => {
    if (!listo) return
    setAviso(null)
    let c: ReturnType<typeof compilar>
    try { c = compilar() } catch (e: any) { setAviso({ tipo: 'error', texto: 'No pude leer el programa: ' + (e?.message || e) }); return }
    if (!c.scripts.length) { setAviso({ tipo: 'error', texto: 'Falta un bloque de Eventos. Empieza tu programa con «al presionar 🚩».' }); return }
    for (const v of proyecto.current.variables || []) if (!(v.name in motor.V)) motor.V[v.name] = 0

    const usaClasificador = /api\.ia(Ve|Clase|Seguridad)\(/.test(c.codigo) || c.scripts.some(s => s.tipo === 'ia_cuando_ve')
    const usaObjetos = /api\.obj[A-Z]/.test(c.codigo)
    // Qué parte del cuerpo pide el programa: las muñecas van por el detector de manos (preciso de cerca), el resto por MoveNet.
    const partes = [...c.codigo.matchAll(/api\.(?:irAParte|parteX|parteY|parteVisible)\("([^"]+)"/g)].map(m => m[1])
    const usaMano = partes.some(p => p.includes('wrist'))
    const usaCuerpo = partes.some(p => !p.includes('wrist'))
    ia.usar = { objetos: usaObjetos, cuerpo: usaCuerpo, mano: usaMano }
    if (usaClasificador || usaObjetos || usaCuerpo || usaMano) {
      ia.encenderCamara()
      const fallo = () => setAviso({ tipo: 'error', texto: 'No pude descargar el modelo de IA. Revisa tu conexión a internet.' })
      if (usaClasificador) ia.prepararClasificador().catch(fallo)
      if (usaObjetos) ia.prepararObjetos().catch(fallo)
      if (usaCuerpo) ia.prepararCuerpo().catch(fallo)
      if (usaMano) ia.prepararMano().catch(fallo)
      if (usaClasificador && ia.totalEjemplos() === 0) setAviso({ tipo: 'info', texto: 'Tu IA todavía no tiene ejemplos. Abre «Entrenar IA» y enséñale qué debe reconocer.' })
    }
    motor.iniciar(c.scripts)
  }

  const parar = () => motor.detener()

  // -------------------------------------------------------------- personajes
  const nombreLibre = (base: string, salvo?: string) => {
    const usados = proyecto.current.sprites.filter(s => s.id !== salvo).map(s => s.nombre)
    if (!usados.includes(base)) return base
    let i = 2
    while (usados.includes(`${base} ${i}`)) i++
    return `${base} ${i}`
  }

  const agregarPersonaje = (disfraz: string, nombre: string) => {
    guardarActual()
    const s: SpriteDef = {
      id: 's' + Date.now().toString(36), nombre: nombreLibre(nombre), disfraces: [disfraz], disfraz: 0,
      x: Math.round((Math.random() - 0.5) * 200), y: Math.round((Math.random() - 0.5) * 120), dir: 90, tam: 100, visible: true, rot: 'lr',
      bloques: { languageVersion: 0, blocks: [] },
    }
    proyecto.current.sprites.push(s)
    setPanel(null)
    mostrarSprite(s.id)
    cambio()
  }

  const eliminarPersonaje = (id: string) => {
    const p = proyecto.current
    if (p.sprites.length <= 1) return
    motor.detener()
    if (id !== actualRef.current) guardarActual()
    p.sprites = p.sprites.filter(s => s.id !== id)
    motor.sprites = p.sprites
    mostrarSprite(id === actualRef.current ? p.sprites[0].id : actualRef.current)
    cambio()
  }

  const renombrarPersonaje = (s: SpriteDef, nombre: string) => {
    guardarActual()
    const nuevo = nombreLibre(nombre.slice(0, 16), s.id)
    for (const x of proyecto.current.sprites) renombrarCampo(x.bloques, 'O', s.nombre, nuevo)
    s.nombre = nuevo
    mostrarSprite(actualRef.current)
    cambio()
  }

  const seleccionar = (id: string) => { if (id !== actualRef.current) { guardarActual(); mostrarSprite(id) } }

  const agregarDisfraz = (disfraz: string) => { sprite.disfraces.push(disfraz); sprite.disfraz = sprite.disfraces.length - 1; setPanel(null); cambio() }
  const quitarDisfraz = (i: number) => {
    if (sprite.disfraces.length <= 1) return
    sprite.disfraces.splice(i, 1)
    sprite.disfraz = Math.min(sprite.disfraz, sprite.disfraces.length - 1)
    cambio()
  }

  // ------------------------------------------------------------------ clases IA
  const fijarClases = (clases: string[]) => {
    proyecto.current.clases = clases
    dinamicos.clases = clases
    ia.fijarClases(clases)
    cambio()
  }
  const renombrarClase = (i: number, nombre: string) => {
    const clases = [...proyecto.current.clases]
    if (clases.includes(nombre)) return
    guardarActual()
    for (const x of proyecto.current.sprites) renombrarCampo(x.bloques, 'C', clases[i], nombre)
    clases[i] = nombre
    fijarClases(clases)
    mostrarSprite(actualRef.current)
  }
  const agregarClase = () => {
    const clases = proyecto.current.clases
    let i = clases.length + 1
    while (clases.includes(`Clase ${i}`)) i++
    fijarClases([...clases, `Clase ${i}`])
  }
  const quitarClase = () => {
    const clases = proyecto.current.clases
    if (clases.length <= 2) return
    ia.borrarClase(clases.length - 1)
    setMiniaturas(m => m.slice(0, clases.length - 1))
    fijarClases(clases.slice(0, -1))
  }
  const grabarEjemplo = (i: number) => {
    const mini = ia.agregarEjemplo(i)
    if (mini) setMiniaturas(m => { const c = m.map(x => [...x]); while (c.length <= i) c.push([]); c[i] = [...c[i], mini].slice(-7); return c })
  }
  const borrarClase = (i: number) => { ia.borrarClase(i); setMiniaturas(m => m.map((x, j) => (j === i ? [] : x))) }

  // ------------------------------------------------------------------- archivo
  const descargar = () => {
    guardarActual()
    const datos = { ...proyecto.current, fondo: motor.fondo, entrenamiento: ia.exportarEntrenamiento() || undefined }
    const url = URL.createObjectURL(new Blob([JSON.stringify(datos)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${(proyecto.current.nombre || 'proyecto').replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'proyecto'}.chaski.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // Enviar la tarea al profesor: queda ligada a la cuenta del estudiante (como los demás simuladores).
  const enviarAlProfesor = async () => {
    if (!listo || enviando) return
    setEnviando(true)
    try {
      let codigo = ''
      try { codigo = compilar().codigo } catch { /* proyecto sin bloques */ }
      const p = proyecto.current
      const resumen = {
        proyecto: p.nombre,
        actividad: guia?.a.titulo || null,
        personajes: p.sprites.map(s => s.nombre),
        bloques: p.sprites.reduce((a, s) => a + (s.bloques?.blocks?.length || 0), 0),
        clasesIA: p.clases,
        ejemplosIA: ia.totalEjemplos(),
      }
      const ficha = `ChaskiBlocks IA — ${guia?.a.titulo ? `actividad «${guia.a.titulo}»` : `proyecto «${p.nombre}»`} · ${resumen.personajes.length} personaje(s), ${resumen.bloques} bloque(s)${resumen.ejemplosIA ? `, ${resumen.ejemplosIA} ejemplos de IA` : ''}`
      const nota = mensaje.trim()
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: `CB-${Date.now().toString(36).toUpperCase()}`,
          output: nota ? `📝 ${nota}\n\n${ficha}` : ficha,
          code: codigo || '(sin bloques de programa)',
          files: { chaskiblocks: { ...resumen, mensaje: nota || undefined } },
        }),
      })
      if (res.ok) { setEnviado(true); setModalEnviar(false); setMensaje(''); setTimeout(() => setEnviado(false), 4000) }
      else setAviso({ tipo: 'error', texto: 'No pude enviar la tarea. Inicia sesión e inténtalo de nuevo.' })
    } catch { setAviso({ tipo: 'error', texto: 'No pude enviar la tarea. Revisa tu conexión.' }) }
    setEnviando(false)
  }

  const abrir = async (f: File | undefined) => {
    if (!f) return
    try {
      const p = JSON.parse(await f.text())
      if (p?.formato !== 'chaskiblocks-ia' || !Array.isArray(p.sprites) || !p.sprites.length) throw new Error('formato')
      if (!Array.isArray(p.clases) || p.clases.length < 2) p.clases = ['Clase 1', 'Clase 2']
      setGuia(null)
      cargarProyecto(p)
    } catch { setAviso({ tipo: 'error', texto: 'Ese archivo no es un proyecto de ChaskiBlocks IA.' }) }
  }

  const elegirActividad = (a: Actividad, modo: 'guiada' | 'solucion') => {
    setPanel(null)
    cargarProyecto(modo === 'guiada' ? proyectoInicial(a) : a.solucion())
    setGuia({ a, paso: modo === 'guiada' ? 0 : a.pasos.length })
  }

  const reiniciarEscenario = () => {
    motor.detener()
    motor.borrarLapiz()
    motor.V = {}
    motor.video = false
    cambio()
  }

  // ---------------------------------------------------------------- escenario
  const aEscenario = (e: { clientX: number; clientY: number }) => {
    const r = marcoEscenario.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / escala - ANCHO / 2, y: ALTO / 2 - (e.clientY - r.top) / escala }
  }
  const arrastre = useRef<{ id: string; dx: number; dy: number; movido: boolean } | null>(null)

  const alBajar = (e: React.PointerEvent, s: SpriteDef) => {
    e.stopPropagation()
    const p = aEscenario(e)
    arrastre.current = { id: s.id, dx: s.x - p.x, dy: s.y - p.y, movido: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    motor.raton.abajo = true
  }
  const alMover = (e: React.PointerEvent) => {
    const p = aEscenario(e)
    motor.raton.x = Math.max(-ANCHO / 2, Math.min(ANCHO / 2, p.x)); motor.raton.y = Math.max(-ALTO / 2, Math.min(ALTO / 2, p.y))
    const a = arrastre.current
    if (!a) return
    const s = proyecto.current.sprites.find(x => x.id === a.id)
    if (!s) return
    const nx = Math.max(-ANCHO / 2, Math.min(ANCHO / 2, p.x + a.dx)), ny = Math.max(-ALTO / 2, Math.min(ALTO / 2, p.y + a.dy))
    if (!a.movido && Math.hypot(nx - s.x, ny - s.y) < 4) return
    a.movido = true
    s.x = Math.round(nx); s.y = Math.round(ny)
    motor.sucio = true
  }
  const alSoltar = () => {
    const a = arrastre.current
    arrastre.current = null
    motor.raton.abajo = false
    if (!a) return
    if (a.movido) programarGuardado()
    else { motor.clic(a.id); seleccionar(a.id) }
  }

  const transformar = (s: SpriteDef) => {
    const d = s.disfraces[s.disfraz] || ''
    const base = miraIzquierda(d) ? -1 : 1
    if (s.rot === 'todo') return `rotate(${s.dir - 90}deg) scaleX(${base})`
    if (s.rot === 'lr') return `scaleX(${(s.dir < 0 ? -1 : 1) * base})`
    return `scaleX(${base})`
  }

  const variablesVisibles = (proyecto.current.variables || []).filter((v: any) => v.name in motor.V)
  const ejecutando = motor.activo
  const iaActiva = ia.camara === 'lista' && ia.totalEjemplos() > 0 && !!ia.clase

  return (
    <div ref={raiz} className={`cbia flex flex-col overflow-hidden bg-slate-100 text-slate-900 ${completa ? 'fixed inset-0 z-[200]' : 'relative h-full min-h-[540px] rounded-xl border border-slate-300'}`}>
      <style>{ESTILOS}</style>
      <video ref={videoIA} muted playsInline className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0" />
      <input ref={archivo} type="file" accept=".json,application/json" className="hidden" onChange={e => { abrir(e.target.files?.[0]); e.target.value = '' }} />

      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#4C97FF] px-3 py-1.5 text-white">
        <Sparkles className="h-5 w-5" />
        <span className="mr-1 text-sm font-extrabold tracking-tight">ChaskiBlocks IA</span>
        <CampoTexto valor={proyecto.current.nombre} etiqueta="Nombre del proyecto" alConfirmar={v => { proyecto.current.nombre = v.slice(0, 40); cambio(); repintar() }}
          className="w-36 rounded-md border border-white/40 bg-white/15 px-2 py-1 text-xs font-semibold text-white placeholder-white/70 focus:bg-white focus:text-slate-900 focus:outline-none sm:w-44" />
        <button onClick={() => { setGuia(null); cargarProyecto(proyectoNuevo()) }} title="Proyecto nuevo" className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-white/20"><FilePlus2 className="h-4 w-4" /><span className="hidden md:inline">Nuevo</span></button>
        <button onClick={() => archivo.current?.click()} title="Abrir un proyecto de tu computadora" className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-white/20"><FolderOpen className="h-4 w-4" /><span className="hidden md:inline">Abrir</span></button>
        <button onClick={descargar} title="Guardar el proyecto en tu computadora" className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-white/20"><Download className="h-4 w-4" /><span className="hidden md:inline">Guardar</span></button>
        <div className="ml-auto flex items-center gap-1.5">
          {user?.name && (
            <button onClick={() => setModalEnviar(true)} disabled={enviado} title={`Enviar la tarea como ${user.name}`} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition disabled:opacity-80 ${enviado ? 'bg-green-600 text-white' : 'bg-white/90 text-green-700 hover:bg-white'}`}><Send className="h-4 w-4" /> {enviado ? '✓ Enviado' : 'Enviar tarea'}</button>
          )}
          <button onClick={() => setPanel('actividades')} className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#2b6fd6] hover:bg-blue-50"><GraduationCap className="h-4 w-4" /> Actividades</button>
          <button onClick={() => setPanel('entrenar')} className="flex items-center gap-1.5 rounded-md bg-[#E8456B] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#d63a5f]"><BrainCircuit className="h-4 w-4" /> Entrenar IA</button>
          <button onClick={() => setCompleta(c => !c)} title={completa ? 'Salir de pantalla completa' : 'Pantalla completa'} aria-label={completa ? 'Salir de pantalla completa' : 'Pantalla completa'} className="rounded-md p-1.5 hover:bg-white/20">{completa ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Bloques */}
        <div className="relative min-h-[380px] flex-1 border-slate-300 lg:border-r">
          <div ref={divBloques} className="absolute inset-0" />
          {!listo && <div className="absolute inset-0 grid place-items-center bg-white text-sm text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {listo && sprite && (
            <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-center opacity-60">
              <Disfraz valor={sprite.disfraces[sprite.disfraz] || '🤖'} px={34} />
              <span className="mt-0.5 text-[10px] font-bold text-slate-500">{sprite.nombre}</span>
            </div>
          )}

          {guia && (
            <div className="absolute bottom-3 left-[150px] right-16 z-10 mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">{guia.a.emoji}</span>
                <span className="truncate text-xs font-bold text-slate-900">{guia.a.titulo}</span>
                <Etiqueta tipo={guia.a.tipo} />
                <button onClick={() => setGuia(null)} aria-label="Cerrar la guía" className="ml-auto rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
              </div>
              {guia.paso < guia.a.pasos.length ? (
                <p className="mt-2 text-[13px] leading-relaxed text-slate-800"><b className="text-[#2b6fd6]">Paso {guia.paso + 1} de {guia.a.pasos.length}.</b> {guia.a.pasos[guia.paso]}</p>
              ) : (
                <p className="mt-2 flex gap-1.5 text-[13px] leading-relaxed text-slate-800"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span><b>Reto:</b> {guia.a.reto}</span></p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1">
                  {[...guia.a.pasos, 'reto'].map((_, i) => <span key={i} className={`h-1.5 w-4 rounded-full ${i <= guia.paso ? 'bg-[#4C97FF]' : 'bg-slate-200'}`} />)}
                </div>
                <button onClick={() => { cargarProyecto(guia.a.solucion()); setGuia({ a: guia.a, paso: guia.a.pasos.length }) }} className="ml-auto rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100">Ver solución</button>
                <button disabled={guia.paso === 0} onClick={() => setGuia({ a: guia.a, paso: guia.paso - 1 })} aria-label="Paso anterior" className="rounded-md border border-slate-300 p-1 text-slate-700 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                <button disabled={guia.paso >= guia.a.pasos.length} onClick={() => setGuia({ a: guia.a, paso: guia.paso + 1 })} className="flex items-center gap-0.5 rounded-md bg-[#4C97FF] px-2.5 py-1 text-xs font-bold text-white disabled:opacity-30">Siguiente <ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Escenario y personajes */}
        <div className={`flex w-full shrink-0 flex-col gap-2 overflow-y-auto bg-slate-100 p-2 ${completa ? 'lg:w-[500px]' : 'lg:w-[400px]'}`}>
          <div className="flex items-center gap-1.5">
            <button onClick={ejecutar} disabled={!listo} title="Empezar" aria-label="Empezar el programa" className={`rounded-lg p-1.5 transition ${ejecutando && motor.hilosVivos > 0 ? 'bg-green-200 ring-2 ring-green-500' : 'hover:bg-green-100'}`}><Flag className="h-6 w-6 fill-green-500 text-green-600" /></button>
            <button onClick={parar} title="Detener" aria-label="Detener el programa" className={`rounded-lg p-1.5 transition hover:bg-red-100 ${ejecutando ? '' : 'opacity-50'}`}><Octagon className="h-6 w-6 fill-red-500 text-red-600" /></button>
            {ejecutando && <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" /> En marcha</span>}
            <button onClick={reiniciarEscenario} title="Limpiar el escenario: borra los dibujos y las variables" className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-200"><RotateCcw className="h-3.5 w-3.5" /> Limpiar</button>
          </div>

          <div ref={marcoEscenario} className="relative w-full shrink-0 touch-none select-none overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm" style={{ aspectRatio: `${ANCHO} / ${ALTO}` }}
            onPointerMove={alMover} onPointerUp={alSoltar} onPointerCancel={alSoltar} onPointerDown={() => { motor.raton.abajo = true }}>
            <div className="absolute left-0 top-0 origin-top-left" style={{ width: ANCHO, height: ALTO, transform: `scale(${escala})`, background: FONDOS[motor.fondo]?.css || FONDOS.cielo.css }}>
              <canvas ref={lienzoVideo} width={ANCHO} height={ALTO} className="absolute inset-0" />
              <canvas ref={lienzoLapiz} width={ANCHO} height={ALTO} className="absolute inset-0" />
              {sprites.map(s => s.visible && (
                <div key={s.id} onPointerDown={e => alBajar(e, s)} className="absolute cursor-grab active:cursor-grabbing" style={{ left: ANCHO / 2 + s.x, top: ALTO / 2 - s.y, transform: 'translate(-50%, -50%)' }}>
                  <div style={{ transform: transformar(s), filter: s.id === actual && !ejecutando ? 'drop-shadow(0 0 3px #4C97FF)' : undefined }}><Disfraz valor={s.disfraces[s.disfraz] || '❓'} px={48 * s.tam / 100} /></div>
                </div>
              ))}
              {sprites.map(s => {
                const e = motor.ef.get(s.id)
                if (!s.visible || !e?.dice) return null
                const izq = Math.max(6, Math.min(ANCHO - 176, ANCHO / 2 + s.x - 10))
                return (
                  <div key={s.id} className={`pointer-events-none absolute max-w-[170px] rounded-2xl border-2 border-slate-300 bg-white px-2.5 py-1.5 text-[13px] font-medium leading-snug text-slate-900 shadow ${e.piensa ? 'border-dashed italic' : ''}`}
                    style={{ left: izq, bottom: Math.min(ALTO - 30, ALTO / 2 + s.y + 26 * s.tam / 100 + 4), overflowWrap: 'anywhere' }}>{e.dice}</div>
                )
              })}
              {variablesVisibles.length > 0 && (
                <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-col gap-1">
                  {variablesVisibles.map((v: any) => (
                    <div key={v.id} className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-slate-700">
                      {v.name}<span className="min-w-[22px] rounded bg-[#FF8C1A] px-1.5 text-center text-white">{String(typeof motor.V[v.name] === 'number' ? Math.round(motor.V[v.name] * 100) / 100 : motor.V[v.name])}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pointer-events-none absolute bottom-1.5 right-1.5 flex flex-col items-end gap-1">
                {ia.escuchando && <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white"><Mic className="h-3 w-3" /> Te escucho…</span>}
                {iaActiva && <span className="rounded-full bg-slate-900/75 px-2 py-0.5 text-[11px] text-white">La IA ve: <b>{ia.clase}</b> {ia.seguridad}%</span>}
                {ia.mensaje && ia.camara !== 'apagada' && <span className="flex items-center gap-1 rounded-full bg-slate-900/75 px-2 py-0.5 text-[11px] text-white"><Loader2 className="h-3 w-3 animate-spin" /> {ia.mensaje}</span>}
              </div>
              {motor.pregunta && (
                <form className="absolute inset-x-2 bottom-2 flex gap-1.5 rounded-xl border-2 border-[#5CB1D6] bg-white p-1.5 shadow-lg" onPointerDown={e => e.stopPropagation()}
                  onSubmit={e => { e.preventDefault(); const r = respuesta; setRespuesta(''); motor.pregunta?.responder(r) }}>
                  <input autoFocus value={respuesta} onChange={e => setRespuesta(e.target.value)} aria-label={motor.pregunta.texto || 'Tu respuesta'} placeholder="Escribe tu respuesta…" className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none" />
                  <button type="submit" aria-label="Responder" className="rounded-md bg-[#5CB1D6] px-2 text-white"><Check className="h-4 w-4" /></button>
                </form>
              )}
            </div>
          </div>

          {aviso && (
            <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${aviso.tipo === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
              <span className="flex-1">{aviso.texto}</span>
              {aviso.tipo === 'info' && <button onClick={() => { setAviso(null); setPanel('entrenar') }} className="shrink-0 rounded bg-amber-500 px-2 py-0.5 font-bold text-white">Entrenar IA</button>}
              <button onClick={() => setAviso(null)} aria-label="Cerrar aviso" className="shrink-0 opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}

          {/* Personajes y fondos */}
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-300 bg-white">
            <div className="flex border-b border-slate-200 text-xs font-bold">
              {(['personajes', 'fondos'] as const).map(p => (
                <button key={p} onClick={() => setPestana(p)} className={`flex-1 px-3 py-2 capitalize ${pestana === p ? 'border-b-2 border-[#4C97FF] text-[#2b6fd6]' : 'text-slate-500 hover:text-slate-800'}`}>{p}</button>
              ))}
            </div>
            {pestana === 'personajes' && sprite && (
              <div className="flex flex-col gap-2 p-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <CampoTexto valor={sprite.nombre} etiqueta="Nombre del personaje" alConfirmar={v => renombrarPersonaje(sprite, v)} className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:border-slate-500 focus:outline-none" />
                  <CampoNumero etiqueta="x" valor={sprite.x} alCambiar={v => { sprite.x = Math.max(-240, Math.min(240, v)); cambio() }} />
                  <CampoNumero etiqueta="y" valor={sprite.y} alCambiar={v => { sprite.y = Math.max(-180, Math.min(180, v)); cambio() }} />
                  <button onClick={() => { sprite.visible = !sprite.visible; cambio() }} title={sprite.visible ? 'Esconder' : 'Mostrar'} aria-label={sprite.visible ? 'Esconder el personaje' : 'Mostrar el personaje'} className="rounded-md border border-slate-300 p-1 text-slate-600 hover:bg-slate-50">{sprite.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  <CampoNumero etiqueta="tamaño" valor={sprite.tam} alCambiar={v => { sprite.tam = Math.max(10, Math.min(400, v)); cambio() }} />
                  <CampoNumero etiqueta="dirección" valor={sprite.dir} alCambiar={v => { sprite.dir = Math.max(-179, Math.min(180, v)); cambio() }} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sprites.map(s => (
                    <div key={s.id} className="relative">
                      <button onClick={() => seleccionar(s.id)} aria-pressed={s.id === actual} className={`flex h-[68px] w-[68px] flex-col items-center justify-center overflow-hidden rounded-lg border-2 ${s.id === actual ? 'border-[#4C97FF] bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-400'}`}>
                        <span className="flex h-9 items-center justify-center overflow-hidden"><Disfraz valor={s.disfraces[s.disfraz] || '❓'} px={26} /></span>
                        <span className={`mt-0.5 w-full truncate px-1 text-center text-[10px] font-bold ${s.id === actual ? 'text-[#2b6fd6]' : 'text-slate-600'}`}>{s.nombre}</span>
                      </button>
                      {s.id === actual && sprites.length > 1 && (
                        <button onClick={() => eliminarPersonaje(s.id)} aria-label={`Eliminar a ${s.nombre}`} title="Eliminar personaje" className="absolute -right-1.5 -top-1.5 rounded-full bg-[#4C97FF] p-1 text-white shadow hover:bg-red-500"><Trash2 className="h-3 w-3" /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setPanel('personaje')} aria-label="Agregar un personaje" className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-[#4C97FF] hover:text-[#2b6fd6]"><Plus className="h-5 w-5" /><span className="text-[10px] font-bold">Agregar</span></button>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Disfraces de {sprite.nombre}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {sprite.disfraces.map((d, i) => (
                      <div key={i} className="group relative">
                        <button onClick={() => { sprite.disfraz = i; cambio() }} aria-label={`Disfraz ${i + 1}`} aria-pressed={i === sprite.disfraz} className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border-2 ${i === sprite.disfraz ? 'border-[#9966FF] bg-purple-50' : 'border-slate-200 bg-slate-50'}`}><Disfraz valor={d} px={22} /></button>
                        <span className="pointer-events-none absolute bottom-0 left-0.5 text-[9px] font-bold text-slate-400">{i + 1}</span>
                        {sprite.disfraces.length > 1 && <button onClick={() => quitarDisfraz(i)} aria-label={`Quitar el disfraz ${i + 1}`} className="absolute -right-1 -top-1 hidden rounded-full bg-slate-600 p-0.5 text-white group-hover:block group-focus-within:block"><X className="h-2.5 w-2.5" /></button>}
                      </div>
                    ))}
                    <button onClick={() => setPanel('disfraz')} aria-label="Agregar un disfraz" className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-[#9966FF] hover:text-[#7a4fe0]"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            )}
            {pestana === 'fondos' && (
              <div className="grid grid-cols-4 gap-1.5 p-2">
                {Object.entries(FONDOS).map(([k, f]) => (
                  <button key={k} onClick={() => { motor.fondo = k; cambio() }} aria-pressed={motor.fondo === k} className={`overflow-hidden rounded-lg border-2 text-[10px] font-bold ${motor.fondo === k ? 'border-[#4C97FF] text-[#2b6fd6]' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                    <span className="block w-full" style={{ aspectRatio: '4 / 3', background: f.css, backgroundSize: k === 'cuadricula' ? '480px 360px' : undefined }} />
                    <span className="block py-0.5">{f.nombre}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {panel === 'actividades' && <PanelActividades alElegir={elegirActividad} alCerrar={() => setPanel(null)} />}
      {panel === 'entrenar' && (
        <PanelEntrenar ia={ia} clases={proyecto.current.clases} miniaturas={miniaturas} alGrabar={grabarEjemplo} alRenombrar={renombrarClase}
          alAgregarClase={agregarClase} alQuitarClase={quitarClase} alBorrarClase={borrarClase} alCerrar={() => setPanel(null)} />
      )}
      {panel === 'personaje' && <PanelBiblioteca titulo="Elige un personaje" alElegir={agregarPersonaje} alSubir={agregarPersonaje} alCerrar={() => setPanel(null)} />}
      {panel === 'disfraz' && <PanelBiblioteca titulo={`Elige un disfraz para ${sprite?.nombre || ''}`} alElegir={agregarDisfraz} alSubir={agregarDisfraz} alCerrar={() => setPanel(null)} />}

      {modalEnviar && (
        <div className="absolute inset-0 z-[210] flex items-center justify-center bg-slate-900/50 p-4" onPointerDown={() => !enviando && setModalEnviar(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-green-100 text-green-700"><Send className="h-4 w-4" /></span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Enviar tarea a tu profesor</h3>
                <p className="text-[11px] text-slate-500">Se enviará como <b>{user?.name}</b>{guia?.a.titulo ? ` · actividad «${guia.a.titulo}»` : ` · proyecto «${proyecto.current.nombre}»`}</p>
              </div>
            </div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Mensaje para tu profesor (opcional)</label>
            <textarea value={mensaje} onChange={e => setMensaje(e.target.value.slice(0, 500))} rows={4} autoFocus
              placeholder="Cuéntale qué hiciste, qué aprendiste o qué te costó…"
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-green-500 focus:outline-none" />
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Se adjunta tu programa y los datos de la actividad.</span>
              <span>{mensaje.length}/500</span>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalEnviar(false)} disabled={enviando} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50">Cancelar</button>
              <button onClick={enviarAlProfesor} disabled={enviando || !listo} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60">
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {enviando ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
