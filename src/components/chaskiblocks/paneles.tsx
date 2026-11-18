'use client'

/** ChaskiBlocks IA: ventanas de actividades, entrenamiento de la IA y biblioteca de personajes. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { X, Camera, Loader2, Trash2, Plus, Upload, Clock, ChevronLeft, PlayCircle, Eye, Lightbulb, Package, Circle } from 'lucide-react'
import { ACTIVIDADES, type Actividad } from './actividades'
import { COLORES } from './bloques'
import type { MotorIA } from './ia'

export function Ventana({ titulo, alCerrar, ancho = 'max-w-3xl', children }: { titulo: string; alCerrar: () => void; ancho?: string; children: ReactNode }) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [alCerrar])
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/45 p-3" onPointerDown={e => { if (e.target === e.currentTarget) alCerrar() }}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className={`flex max-h-full w-full ${ancho} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
          <button onClick={alCerrar} aria-label="Cerrar" className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ actividades
const COLOR_TIPO: Record<Actividad['tipo'], string> = {
  'Programación': COLORES.movimiento, 'IA · Imagen': COLORES.ia_imagen, 'IA · Objetos': COLORES.ia_objetos, 'IA · Cuerpo': COLORES.ia_cuerpo, 'IA · Voz': COLORES.ia_voz,
}
const FILTROS = ['Todas', 'Programación', 'IA · Imagen', 'IA · Objetos', 'IA · Cuerpo', 'IA · Voz'] as const

export function Etiqueta({ tipo }: { tipo: Actividad['tipo'] }) {
  return <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: COLOR_TIPO[tipo] }}>{tipo}</span>
}

export function PanelActividades({ alElegir, alCerrar }: { alElegir: (a: Actividad, modo: 'guiada' | 'solucion') => void; alCerrar: () => void }) {
  const [vista, setVista] = useState<Actividad | null>(null)
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>('Todas')
  const lista = ACTIVIDADES.filter(a => filtro === 'Todas' || a.tipo === filtro)

  return (
    <Ventana titulo={vista ? vista.titulo : 'Actividades'} alCerrar={alCerrar} ancho="max-w-4xl">
      {!vista ? (
        <div className="p-4">
          <p className="mb-3 text-sm text-slate-600">Elige una actividad. Cada una trae los personajes listos y te guía paso a paso.</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {FILTROS.map(f => (
              <button key={f} onClick={() => setFiltro(f)} className={`rounded-full px-3 py-1 text-xs font-semibold ${filtro === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{f}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map(a => (
              <button key={a.id} onClick={() => setVista(a)} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
                <div className="mb-2 flex h-20 items-center justify-center rounded-lg text-5xl" style={{ background: COLOR_TIPO[a.tipo] + '22' }}>{a.emoji}</div>
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <Etiqueta tipo={a.tipo} />
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{a.nivel}</span>
                  <span className="ml-auto flex items-center gap-0.5 text-[11px] text-slate-500"><Clock className="h-3 w-3" />{a.minutos} min</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{a.titulo}</h3>
                <p className="mt-0.5 text-xs leading-snug text-slate-600">{a.resumen}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <button onClick={() => setVista(null)} className="mb-3 flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"><ChevronLeft className="h-4 w-4" /> Todas las actividades</button>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl text-7xl md:w-40" style={{ background: COLOR_TIPO[vista.tipo] + '22' }}>{vista.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <Etiqueta tipo={vista.tipo} />
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{vista.nivel}</span>
                <span className="flex items-center gap-0.5 text-[11px] text-slate-500"><Clock className="h-3 w-3" />{vista.minutos} min · {vista.pasos.length} pasos</span>
              </div>
              <p className="text-sm text-slate-700">{vista.resumen}</p>
              <div className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-900"><b>La idea:</b> {vista.idea}</p>
              </div>
              <div className="mt-2 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <p className="text-xs leading-relaxed text-slate-700"><b>Necesitas:</b> {vista.necesita}</p>
              </div>
            </div>
          </div>
          <ol className="mt-4 space-y-1.5">
            {vista.pasos.map((p, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">{i + 1}</span>{p}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={() => alElegir(vista, 'guiada')} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"><PlayCircle className="h-4 w-4" /> Empezar paso a paso</button>
            <button onClick={() => alElegir(vista, 'solucion')} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Eye className="h-4 w-4" /> Abrir el proyecto terminado</button>
            <span className="text-[11px] text-slate-500">Reemplaza tu proyecto actual. Guárdalo antes si quieres conservarlo.</span>
          </div>
        </div>
      )}
    </Ventana>
  )
}

// -------------------------------------------------------------- entrenar la IA
const COLORES_CLASE = ['#2f9e44', '#e03131', '#1c7ed6', '#f08c00', '#9c36b5', '#0c8599']

function CampoNombre({ valor, alCambiar, etiqueta }: { valor: string; alCambiar: (v: string) => void; etiqueta: string }) {
  const [texto, setTexto] = useState(valor)
  useEffect(() => setTexto(valor), [valor])
  const confirmar = () => { const v = texto.trim().slice(0, 18); if (v && v !== valor) alCambiar(v); else setTexto(valor) }
  return <input value={texto} onChange={e => setTexto(e.target.value)} onBlur={confirmar} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} aria-label={etiqueta}
    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 focus:border-slate-500 focus:outline-none" />
}

export function PanelEntrenar({ ia, clases, miniaturas, alGrabar, alRenombrar, alAgregarClase, alQuitarClase, alBorrarClase, alCerrar }: {
  ia: MotorIA; clases: string[]; miniaturas: string[][]
  alGrabar: (i: number) => void; alRenombrar: (i: number, nombre: string) => void
  alAgregarClase: () => void; alQuitarClase: () => void; alBorrarClase: (i: number) => void; alCerrar: () => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const grabando = useRef<any>(null)
  const [clasificadorListo, setClasificadorListo] = useState(false)
  const [fallo, setFallo] = useState('')

  const vivo = useRef(true)
  const preparar = useCallback(() => {
    setFallo('')
    ia.prepararClasificador().then(() => { if (vivo.current) setClasificadorListo(true) }).catch(() => { if (vivo.current) setFallo('No pude descargar el modelo de IA. Revisa tu conexión a internet.') })
  }, [ia])
  useEffect(() => {
    vivo.current = true
    ia.encenderCamara()
    preparar()
    return () => { vivo.current = false; clearInterval(grabando.current) }
  }, [ia, preparar])

  useEffect(() => {
    if (video.current && ia.flujo && video.current.srcObject !== ia.flujo) { video.current.srcObject = ia.flujo; video.current.play().catch(() => {}) }
  })

  const empezar = (i: number) => { clearInterval(grabando.current); alGrabar(i); grabando.current = setInterval(() => alGrabar(i), 140) }
  const terminar = () => clearInterval(grabando.current)
  const puede = ia.camara === 'lista' && clasificadorListo
  const total = ia.totalEjemplos()

  return (
    <Ventana titulo="Entrenar IA: tu clasificador de imágenes" alCerrar={alCerrar} ancho="max-w-4xl">
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <div className="relative overflow-hidden rounded-xl bg-slate-900" style={{ aspectRatio: '4 / 3' }}>
            <video ref={video} muted playsInline className="h-full w-full -scale-x-100 object-cover" />
            {!puede && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/70 px-4 text-center text-sm font-semibold text-white">
                {ia.camara === 'apagada' ? (
                  <button onClick={() => ia.encenderCamara()} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-slate-900"><Camera className="h-4 w-4" /> Encender cámara</button>
                ) : <><Loader2 className="h-6 w-6 animate-spin" />{ia.camara === 'cargando' ? 'Encendiendo la cámara…' : 'Preparando la IA (la primera vez tarda un poco)…'}</>}
                {ia.camara === 'apagada' && ia.mensaje && <span className="text-xs font-normal text-red-200">{ia.mensaje}</span>}
              </div>
            )}
          </div>
          {fallo && <p role="alert" className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700"><span className="flex-1">{fallo}</span><button onClick={preparar} className="shrink-0 rounded bg-red-600 px-2 py-0.5 font-bold text-white">Reintentar</button></p>}
          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Lo que la IA cree que ve</p>
            {total === 0 ? <p className="text-xs text-slate-500">Aún no hay ejemplos. Graba algunos en cada clase y aquí verás qué tan segura está la IA.</p> : clases.map((c, i) => (
              <div key={i} className="mb-1.5 flex items-center gap-2 text-xs">
                <span className={`w-24 truncate ${ia.clase === c ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{c}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-150" style={{ width: `${ia.confianzas[i] || 0}%`, background: COLORES_CLASE[i % COLORES_CLASE.length] }} /></div>
                <span className="w-9 text-right font-mono text-slate-700">{ia.confianzas[i] || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-sm text-slate-700"><b>1.</b> Ponle nombre a cada clase. <b>2.</b> Muestra el objeto a la cámara y mantén presionado <b>Grabar ejemplos</b>. <b>3.</b> Mira las barras para probar tu modelo.</p>
          {clases.map((c, i) => (
            <div key={i} className="rounded-xl border-2 p-2.5" style={{ borderColor: COLORES_CLASE[i % COLORES_CLASE.length] + '66' }}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLORES_CLASE[i % COLORES_CLASE.length] }} />
                <CampoNombre valor={c} alCambiar={v => alRenombrar(i, v)} etiqueta={`Nombre de la clase ${i + 1}`} />
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{ia.ejemplos[i] || 0} ejemplos</span>
                <button onClick={() => alBorrarClase(i)} disabled={!ia.ejemplos[i]} aria-label={`Borrar los ejemplos de ${c}`} title="Borrar los ejemplos" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button disabled={!puede} onPointerDown={e => { e.preventDefault(); empezar(i) }} onPointerUp={terminar} onPointerLeave={terminar} onPointerCancel={terminar}
                  onKeyDown={e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) empezar(i) }} onKeyUp={terminar} onBlur={terminar}
                  className="flex shrink-0 select-none items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-40" style={{ background: COLORES_CLASE[i % COLORES_CLASE.length], touchAction: 'none' }}>
                  <Circle className="h-3 w-3 fill-current" /> Grabar ejemplos
                </button>
                <div className="flex min-w-0 flex-1 gap-1 overflow-hidden">
                  {(miniaturas[i] || []).slice(-7).map((m, j) => <img key={j} src={m} alt="" className="h-9 w-12 shrink-0 rounded object-cover" />)}
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            {clases.length < 6 && <button onClick={alAgregarClase} className="flex items-center gap-1 rounded-lg border border-dashed border-slate-400 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /> Agregar clase</button>}
            {clases.length > 2 && <button onClick={alQuitarClase} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">Quitar la última clase</button>}
          </div>
          <ul className="list-disc space-y-0.5 pl-4 text-[11px] leading-relaxed text-slate-500">
            <li>Graba unos 20 ejemplos por clase y mueve el objeto: cerca, lejos, girado.</li>
            <li>Las imágenes no salen de esta computadora: la IA aprende aquí mismo, en el navegador.</li>
            <li>Tu entrenamiento se guarda dentro del archivo al usar «Guardar».</li>
          </ul>
          <button onClick={alCerrar} className="self-end rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900">Listo, usar mi modelo</button>
        </div>
      </div>
    </Ventana>
  )
}

// ------------------------------------------------------------------ biblioteca
export const BIBLIOTECA: { grupo: string; items: [string, string][] }[] = [
  { grupo: 'Personajes', items: [['🤖', 'Robot'], ['🧒', 'Niño'], ['👧', 'Niña'], ['🧑‍🚀', 'Astronauta'], ['🧙', 'Mago'], ['🦸', 'Héroe'], ['👻', 'Fantasma'], ['👽', 'Alien'], ['🤡', 'Payaso'], ['😀', 'Feliz'], ['😠', 'Enojado'], ['😴', 'Dormido']] },
  { grupo: 'Animales', items: [['🐶', 'Perro'], ['🐱', 'Gato'], ['🦊', 'Zorro'], ['🐸', 'Rana'], ['🐵', 'Mono'], ['🐼', 'Panda'], ['🦁', 'León'], ['🐰', 'Conejo'], ['🐧', 'Pingüino'], ['🦉', 'Búho'], ['🦋', 'Mariposa'], ['🐝', 'Abeja'], ['🐢', 'Tortuga'], ['🐟', 'Pez'], ['🐙', 'Pulpo'], ['🦖', 'Dinosaurio'], ['🦄', 'Unicornio'], ['🦙', 'Llama'], ['🦅', 'Cóndor'], ['🐛', 'Oruga']] },
  { grupo: 'Transporte', items: [['🚗', 'Carro'], ['🚌', 'Bus'], ['🚀', 'Cohete'], ['✈️', 'Avión'], ['🚁', 'Helicóptero'], ['🚲', 'Bicicleta'], ['🚂', 'Tren'], ['⛵', 'Velero'], ['🛸', 'Platillo'], ['🚜', 'Tractor']] },
  { grupo: 'Cosas', items: [['⚽', 'Balón'], ['🏀', 'Pelota'], ['🎈', 'Globo'], ['⭐', 'Estrella'], ['💎', 'Diamante'], ['🍎', 'Manzana'], ['🍌', 'Banana'], ['🍕', 'Pizza'], ['🎁', 'Regalo'], ['🔑', 'Llave'], ['💡', 'Foco'], ['🔥', 'Fuego'], ['☁️', 'Nube'], ['🌙', 'Luna'], ['☀️', 'Sol'], ['🌳', 'Árbol'], ['🌵', 'Cactus'], ['🍄', 'Hongo'], ['🏠', 'Casa'], ['🏰', 'Castillo'], ['🎩', 'Sombrero'], ['🕶️', 'Gafas'], ['👑', 'Corona'], ['✏️', 'Lápiz']] },
  { grupo: 'Señales', items: [['🟢', 'Verde'], ['🔴', 'Rojo'], ['🟡', 'Amarillo'], ['🔵', 'Azul'], ['❤️', 'Corazón'], ['✅', 'Correcto'], ['❌', 'Incorrecto'], ['❓', 'Pregunta'], ['🗑️', 'Tacho'], ['♻️', 'Reciclar'], ['✊', 'Piedra'], ['✋', 'Papel'], ['✌️', 'Tijera'], ['🖐️', 'Mano'], ['👍', 'Bien'], ['👎', 'Mal']] },
]

export function PanelBiblioteca({ titulo, alElegir, alSubir, alCerrar }: { titulo: string; alElegir: (emoji: string, nombre: string) => void; alSubir: (dataUrl: string, nombre: string) => void; alCerrar: () => void }) {
  const archivo = useRef<HTMLInputElement>(null)
  const subir = (f: File | undefined) => {
    if (!f) return
    const lector = new FileReader()
    lector.onload = () => {
      const img = new Image()
      img.onload = () => {
        const k = Math.min(1, 200 / Math.max(img.width, img.height))
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k))
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        alSubir(c.toDataURL('image/png'), f.name.replace(/\.[^.]+$/, '').slice(0, 16) || 'Imagen')
      }
      img.src = String(lector.result)
    }
    lector.readAsDataURL(f)
  }
  return (
    <Ventana titulo={titulo} alCerrar={alCerrar}>
      <div className="p-4">
        <button onClick={() => archivo.current?.click()} className="mb-3 flex items-center gap-1.5 rounded-lg border border-dashed border-slate-400 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Upload className="h-4 w-4" /> Subir una imagen de mi computadora</button>
        <input ref={archivo} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => { subir(e.target.files?.[0]); e.target.value = '' }} />
        {BIBLIOTECA.map(g => (
          <div key={g.grupo} className="mb-3">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">{g.grupo}</p>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
              {g.items.map(([e, nombre]) => (
                <button key={e} onClick={() => alElegir(e, nombre)} title={nombre} aria-label={nombre} className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-3xl transition hover:scale-105 hover:border-slate-400 hover:bg-white">{e}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Ventana>
  )
}
