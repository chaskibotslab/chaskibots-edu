'use client'

// Pestaña «Cablear»: esquema 2D del robot. La placa va al centro con sus pines
// y cada pieza a un costado; un cable se hace tocando un pin y luego otro
// (con mouse o con el dedo). Tocar un cable lo selecciona para quitarlo.
// Cada bloque se puede arrastrar para ordenar el esquema a gusto.
// La verificación eléctrica corre en vivo y marca los pines con problemas.
//
// Dos vistas del mismo cableado: «En las piezas» (3D: se toca el pin real de
// cada pieza y el cable Dupont aparece entre ellas, como en la mesa) y
// «Esquema» (2D, más cómodo para ver todo de un vistazo). Al costado, la
// explicación de cada pin y cada cable y la guía de lo que falta conectar.

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle, Box, CheckCircle2, Code2, LayoutGrid, Lightbulb, Loader2, MousePointerClick, Network, Trash2, Wand2, XCircle } from 'lucide-react'
import { pieza } from '../../catalogo/piezas'
import type { PinDef } from '../../catalogo/tipos'
import { autocablear } from '../../engine/autocableado'
import { verificar } from '../../engine/verificacion'
import { infoPlaca, mcuDe } from '../../engine/placa'
import { esBanco } from '../../engine/ensamblaje'
import { explicarCable, explicarPin, pasosPendientes } from '../../engine/explicacion'
import type { Cable, RobotDoc } from '../../robots/doc'
import type { NivelCalidad } from '../calidad'

const EscenaCablear = dynamic(() => import('../Escena3D').then(m => m.EscenaCablear), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center gap-2 text-sm text-lab-suave"><Loader2 className="h-5 w-5 animate-spin" /> Preparando la mesa…</div>,
})

type Vista = '3d' | 'esquema'
const CLAVE_VISTA = 'chaskibots-lab:cablear-vista'

const ROJO = '#ef4444', NEGRO = '#111827'
const SENALES = ['#a855f7', '#3b82f6', '#22c55e', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#84cc16', '#f59e0b', '#14b8a6']

const PASO = 22          // separación entre pines (unidades del esquema)
const ANCHO_PIEZA = 170
const ANCHO_PLACA = 190

interface Tarjeta {
  id: string; titulo: string; x: number; y: number; ancho: number; alto: number
  pines: { pin: PinDef; x: number; y: number; lado: 'izq' | 'der' }[]
  /** Rieles de la protoboard: cada pin es una barra con un punto en cada punta. */
  rieles?: boolean
}
const ALTO_RIEL = 34

function colorPara(a: PinDef, b: PinDef, usados: number) {
  // Los rieles de la protoboard se llaman «+ arriba», «- abajo»…
  const riel = (p: PinDef, signo: string) => p.nombre.startsWith(`${signo} `)
  if (a.tipo === 'gnd' || b.tipo === 'gnd' || riel(a, '-') || riel(b, '-')) return NEGRO
  if (a.tipo === 'alim' || b.tipo === 'alim' || a.tipo === 'potencia' || riel(a, '+') || riel(b, '+')) return ROJO
  return SENALES[usados % SENALES.length]
}

/** Ubica la placa al centro y reparte las demás piezas a los costados. */
function disponer(doc: RobotDoc): Tarjeta[] {
  const tarjetas: Tarjeta[] = []
  const mcu = mcuDe(doc)
  // La protoboard no es una pieza que se cablea: sus rieles + y − van al centro, como barras.
  const base = doc.piezas.find(p => !p.padre)
  const proto = base && pieza(base.pieza).comportamiento.tipo === 'protoboard' ? base : null
  const conPines = doc.piezas.filter(p => p.id !== mcu?.id && p.id !== proto?.id && pieza(p.pieza).pines.length)
  const xPlaca = 2 * ANCHO_PIEZA + 120
  if (mcu) {
    const pines = pieza(mcu.pieza).pines
    // Arduino: digitales a la izquierda; ESP32 y Pico: la mitad de los pines a cada lado.
    const esp = !pines.some(p => /^D\d+$/.test(p.nombre))
    const izq = esp ? pines.slice(0, Math.ceil(pines.length / 2)) : pines.filter(p => /^D\d+$/.test(p.nombre))
    const der = esp ? pines.slice(Math.ceil(pines.length / 2)) : pines.filter(p => !/^D\d+$/.test(p.nombre))
    const alto = 46 + Math.max(izq.length, der.length) * PASO
    tarjetas.push({
      // El nombre real de la placa (la etiqueta de la instancia puede venir de otro proyecto).
      id: mcu.id, titulo: infoPlaca(doc).nombre, x: xPlaca, y: 20, ancho: ANCHO_PLACA, alto,
      pines: [
        ...izq.map((pin, i) => ({ pin, x: xPlaca, y: 20 + 40 + i * PASO, lado: 'izq' as const })),
        ...der.map((pin, i) => ({ pin, x: xPlaca + ANCHO_PLACA, y: 20 + 40 + i * PASO, lado: 'der' as const })),
      ],
    })
  }
  if (proto) {
    const y0 = tarjetas.length ? tarjetas[0].y + tarjetas[0].alto + 30 : 20
    const rieles = pieza(proto.pieza).pines
    tarjetas.push({
      id: proto.id, titulo: 'Rieles de la protoboard', x: xPlaca, y: y0, ancho: ANCHO_PLACA, alto: 56 + rieles.length * ALTO_RIEL, rieles: true,
      pines: rieles.flatMap((pin, i) => {
        const y = y0 + 62 + i * ALTO_RIEL
        return [{ pin, x: xPlaca, y, lado: 'izq' as const }, { pin, x: xPlaca + ANCHO_PLACA, y, lado: 'der' as const }]
      }),
    })
  }
  // Sensores y servos a la izquierda de la placa; driver, motores y batería a la derecha.
  // Mesa de electrónica: LED, resistencias, pulsadores y buzzers también, cerca de los pines digitales.
  const aLaIzquierda = (t: string) => ['ir-reflectivo', 'ir-obstaculo', 'ultrasonido', 'servo', 'led', 'led-rgb', 'resistencia', 'pulsador', 'buzzer'].includes(t)
  const columnas = [
    { piezas: conPines.filter(p => aLaIzquierda(pieza(p.pieza).comportamiento.tipo)), x: [20, ANCHO_PIEZA + 60], lado: 'der' as const },
    { piezas: conPines.filter(p => !aLaIzquierda(pieza(p.pieza).comportamiento.tipo)), x: [xPlaca + ANCHO_PLACA + 100, xPlaca + ANCHO_PLACA + ANCHO_PIEZA + 140], lado: 'izq' as const },
  ]
  for (const col of columnas) {
    const ys = [20, 20]
    col.piezas.forEach((p, i) => {
      // Sin placa (pila y rieles) van en una sola columna junto a los rieles: ningún cable pasa por detrás de otra pieza.
      const k = proto && !mcu ? 1 : i % 2
      const pines = pieza(p.pieza).pines
      const alto = 40 + pines.length * PASO
      const x = col.x[k]
      tarjetas.push({
        id: p.id, titulo: p.etiqueta, x, y: ys[k], ancho: ANCHO_PIEZA, alto,
        pines: pines.map((pin, j) => ({ pin, x: col.lado === 'der' ? x + ANCHO_PIEZA : x, y: ys[k] + 38 + j * PASO, lado: col.lado })),
      })
      ys[k] += alto + 24
    })
  }
  return tarjetas
}

interface Props {
  doc: RobotDoc
  cambiar: (d: RobotDoc, texto?: string, recablear?: boolean) => void
  nivel: NivelCalidad
  onNivel: (n: NivelCalidad) => void
}

export default function Cablear({ doc, cambiar, nivel, onNivel }: Props) {
  const [vista, setVista] = useState<Vista>('3d')
  useEffect(() => { try { if (localStorage.getItem(CLAVE_VISTA) === 'esquema') setVista('esquema') } catch { /* almacenamiento bloqueado */ } }, [])
  const elegirVista = (v: Vista) => { setVista(v); try { localStorage.setItem(CLAVE_VISTA, v) } catch { /* modo privado */ } }
  const [elegido, setElegido] = useState<[string, string] | null>(null)
  const [cableSel, setCableSel] = useState<number | null>(null)
  const [resaltar, setResaltar] = useState<string[]>([])
  /** Pin bajo el puntero: se explica al costado sin tener que tocarlo. */
  const [sobre, setSobre] = useState<[string, string] | null>(null)
  // Bloques movidos por el alumno (desplazamiento desde su lugar automático).
  const [movidas, setMovidas] = useState<Record<string, { dx: number; dy: number }>>({})
  const svg = useRef<SVGSVGElement>(null)
  const arrastre = useRef<{ id: string; x: number; y: number; dx: number; dy: number } | null>(null)
  const base = useMemo(() => disponer(doc), [doc])
  const tarjetas = useMemo(() => base.map(t => {
    const m = movidas[t.id]
    return m ? { ...t, x: t.x + m.dx, y: t.y + m.dy, pines: t.pines.map(p => ({ ...p, x: p.x + m.dx, y: p.y + m.dy })) } : t
  }), [base, movidas])
  /** Punto del puntero en coordenadas del esquema. */
  const enEsquema = (e: React.PointerEvent) => {
    const ctm = svg.current?.getScreenCTM()
    if (!ctm) return { x: e.clientX, y: e.clientY }
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }
  const empezarArrastre = (id: string) => (e: React.PointerEvent) => {
    e.stopPropagation()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    const p = enEsquema(e)
    arrastre.current = { id, x: p.x, y: p.y, dx: movidas[id]?.dx ?? 0, dy: movidas[id]?.dy ?? 0 }
  }
  const arrastrar = (e: React.PointerEvent) => {
    const a = arrastre.current
    if (!a) return
    const p = enEsquema(e)
    setMovidas(m => ({ ...m, [a.id]: { dx: a.dx + p.x - a.x, dy: a.dy + p.y - a.y } }))
  }
  const soltar = () => { arrastre.current = null }
  const problemas = useMemo(() => verificar(doc), [doc])
  const { tabla } = useMemo(() => autocablear(doc, { conservar: true }), [doc])
  const posPin = useMemo(() => {
    // Un riel tiene dos puntas: el cable sale de la más cercana a su otra punta.
    const m = new Map<string, { x: number; y: number; lado: 'izq' | 'der' }[]>()
    for (const t of tarjetas) for (const p of t.pines) { const k = `${t.id}.${p.pin.nombre}`; m.set(k, [...(m.get(k) ?? []), p]) }
    return m
  }, [tarjetas])
  const conProblema = useMemo(() => new Set([...problemas.flatMap(p => p.pines), ...resaltar]), [problemas, resaltar])
  const errores = problemas.filter(p => p.nivel === 'error')
  // El esquema crece para que un bloque arrastrado nunca quede fuera (y no se achica: no cambia el zoom).
  const ancho = Math.max(...[...base, ...tarjetas].map(t => t.x + t.ancho)) + 20
  const alto = Math.max(...[...base, ...tarjetas].map(t => t.y + t.alto)) + 20
  const minX = Math.min(0, ...tarjetas.map(t => t.x - 20)), minY = Math.min(0, ...tarjetas.map(t => t.y - 20))

  const pinDef = (inst: string, pin: string) => pieza(doc.piezas.find(p => p.id === inst)!.pieza).pines.find(p => p.nombre === pin)!

  const mismo = (c: Pick<Cable, 'de' | 'a'>, a: [string, string], b: [string, string]) =>
    (c.de.join() === a.join() && c.a.join() === b.join()) || (c.de.join() === b.join() && c.a.join() === a.join())

  /** Pone un cable y lo deja elegido: al costado se lee para qué sirve. */
  const ponerCable = (a: [string, string], b: [string, string], color?: string) => {
    const ya = doc.cables.findIndex(c => mismo(c, a, b))
    if (ya >= 0) { setCableSel(ya); setElegido(null); return }
    const nuevo: Cable = { de: a, a: b, color: color ?? colorPara(pinDef(...a), pinDef(...b), doc.cables.length) }
    cambiar({ ...doc, cableado: 'manual', cables: [...doc.cables, nuevo] }, `Cable: ${a[1]} → ${b[1]}`, false)
    setElegido(null)
    setCableSel(doc.cables.length)
  }

  const tocarPin = (inst: string, pin: string) => {
    setCableSel(null)
    if (!elegido) { setElegido([inst, pin]); return }
    if (elegido[0] === inst && elegido[1] === pin) { setElegido(null); return }
    ponerCable(elegido, [inst, pin])
  }

  // Guía: lo que falta conectar, con su porqué. El primer paso late en la escena.
  const pasos = useMemo(() => pasosPendientes(doc), [doc])
  const paso = pasos[0] ?? null
  const sugeridos = useMemo(() => new Set(paso ? [paso.cable.de.join('.'), paso.cable.a.join('.')] : []), [paso])

  // Qué se explica al costado: el pin bajo el puntero; si no, el cable elegido; si no, el pin elegido.
  const pinExplicado = sobre ?? (cableSel === null ? elegido : null)
  const exCable = useMemo(() => (!sobre && cableSel !== null && doc.cables[cableSel] ? explicarCable(doc, doc.cables[cableSel]) : null), [doc, cableSel, sobre])
  const exPin = useMemo(() => (pinExplicado ? explicarPin(doc, pinExplicado[0], pinExplicado[1]) : null), [doc, pinExplicado])

  const cableado3D = useMemo(() => ({
    elegido, cableSel, problemas: conProblema, sugeridos,
    onPin: tocarPin,
    onCable: (i: number | null) => { setCableSel(i); if (i !== null) setElegido(null) },
    onSobre: setSobre,
    // tocarPin cambia con doc y elegido, que ya están en la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [doc, elegido, cableSel, conProblema, sugeridos])

  const quitarCable = (i: number) => {
    const c = doc.cables[i]
    cambiar({ ...doc, cableado: 'manual', cables: doc.cables.filter((_, k) => k !== i) }, `Cable quitado: ${c.de[1]} → ${c.a[1]}`, false)
    setCableSel(null)
  }

  // Uniones por dentro (la fuente MB102 pinchada en los rieles): se dibujan punteadas, no se pueden quitar.
  const internas = useMemo(() => doc.piezas.flatMap(p => p.padre
    ? (pieza(p.pieza).unePinesConPadre ?? []).map(([propio, delPadre]): Cable => ({ de: [p.id, propio], a: [p.padre!.instancia, delPadre], color: propio.startsWith('-') ? NEGRO : ROJO }))
    : []), [doc.piezas])

  const curva = (c: Cable) => {
    const as = posPin.get(`${c.de[0]}.${c.de[1]}`), bs = posPin.get(`${c.a[0]}.${c.a[1]}`)
    if (!as || !bs) return null
    let a = as[0], b = bs[0]
    for (const x of as) for (const y of bs) if (Math.abs(x.x - y.x) < Math.abs(a.x - b.x)) { a = x; b = y }
    const sa = a.lado === 'der' ? 1 : -1, sb = b.lado === 'der' ? 1 : -1
    const t = Math.max(40, Math.abs(b.x - a.x) * 0.4)
    return `M ${a.x} ${a.y} C ${a.x + sa * t} ${a.y}, ${b.x + sb * t} ${b.y}, ${b.x} ${b.y}`
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* ---------- Mesa (3D) o esquema ---------- */}
      <div className={`relative flex min-h-[320px] flex-1 flex-col ${vista === 'esquema' ? 'lab-plano overflow-auto' : 'overflow-hidden'}`}>
        <div className="sticky left-0 top-0 z-10 flex h-11 shrink-0 items-center gap-x-3 overflow-x-auto whitespace-nowrap border-b border-lab-borde/20 bg-lab-superficie px-3 text-xs">
          <div className="flex shrink-0 rounded-md bg-lab-fondo2 p-0.5" role="group" aria-label="Cómo ver el cableado">
            {([['3d', 'En las piezas', Box], ['esquema', 'Esquema', Network]] as const).map(([id, txt, I]) => (
              <button key={id} onClick={() => elegirVista(id)} aria-pressed={vista === id} title={id === '3d' ? 'Cablear sobre las piezas reales, en 3D' : 'Ver todas las conexiones en un esquema'}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium ${vista === id ? 'bg-lab-superficie text-lab-tinta shadow-sm' : 'text-lab-suave hover:text-lab-tinta'}`}>
                <I className="h-3.5 w-3.5" /> {txt}
              </button>
            ))}
          </div>
          <span className="lab-etiqueta hidden shrink-0 xl:inline">
            {doc.cableado === 'manual' ? 'Cableado a mano' : 'Cableado automático'}
          </span>
          <span className="min-w-0 flex-1 truncate text-lab-suave">
            {elegido ? <>Ahora toca el otro pin para unir <b className="text-lab-tinta">{elegido[1]}</b> · toca el mismo para cancelar</>
              : vista === '3d' ? 'Toca una pieza para acercarte. Toca un pin y luego otro para poner un cable.'
                : 'Toca un pin y luego otro para poner un cable. Arrastra un bloque para moverlo.'}
          </span>
          <div className="ml-auto flex shrink-0 gap-1.5">
            {vista === 'esquema' && Object.keys(movidas).length > 0 && (
              <button onClick={() => setMovidas({})} className="flex items-center gap-1 lab-secundario rounded-md px-2.5 py-1.5 font-medium" title="Volver a poner los bloques en su lugar">
                <LayoutGrid className="h-3.5 w-3.5" /> Ordenar bloques
              </button>
            )}
            <button
              onClick={() => { if (window.confirm('¿Reemplazar todos los cables por el cableado automático?')) cambiar({ ...doc, cableado: 'auto', cables: autocablear(doc).cables }, 'Cableado automático', false) }}
              className="flex items-center gap-1 lab-secundario rounded-md px-2.5 py-1.5 font-medium"
            ><Wand2 className="h-3.5 w-3.5" /> Conectar automáticamente</button>
            <button
              onClick={() => { if (window.confirm('¿Quitar todos los cables?')) cambiar({ ...doc, cableado: 'manual', cables: [] }, 'Sin cables', false) }}
              className="flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium text-red-700 hover:bg-red-50"
            ><Trash2 className="h-3.5 w-3.5" /> Quitar todos</button>
          </div>
        </div>
        {vista === '3d' && (
          <div className="relative min-h-0 flex-1 touch-none">
            <EscenaCablear doc={doc} cableado={cableado3D} nivel={nivel} onNivel={onNivel} />
            <p className="pointer-events-none absolute bottom-3 left-3 hidden rounded-md bg-lab-superficie/90 px-2.5 py-1.5 text-[11px] text-lab-suave shadow-sm sm:block">
              Arrastra para girar · rueda o dos dedos para acercar · botón derecho para mover
            </p>
          </div>
        )}
        {vista === 'esquema' && <svg ref={svg} viewBox={`${minX} ${minY} ${ancho - minX} ${alto - minY}`} className="h-auto min-w-[760px] w-full touch-none" onClick={() => { setCableSel(null) }} onPointerMove={arrastrar} onPointerUp={soltar} onPointerCancel={soltar}>
          {/* Uniones por dentro de la protoboard */}
          {internas.map((c, i) => {
            const d = curva(c)
            return d && (
              <path key={`interna-${i}`} d={d} fill="none" stroke={c.color === NEGRO ? '#6b7280' : c.color} strokeWidth={2} strokeDasharray="5 5" opacity={0.7}>
                <title>Unido por dentro: está pinchada en los rieles</title>
              </path>
            )
          })}
          {/* Cables */}
          {doc.cables.map((c, i) => {
            const d = curva(c)
            if (!d) return null
            return (
              <g key={i} onClick={e => { e.stopPropagation(); setCableSel(i); setElegido(null) }} className="cursor-pointer">
                <path d={d} fill="none" stroke="transparent" strokeWidth={12} />
                <path d={d} fill="none" stroke={c.color === NEGRO ? '#4b5563' : c.color} strokeWidth={cableSel === i ? 5 : 2.5} strokeLinecap="round" opacity={cableSel === null || cableSel === i ? 0.95 : 0.35} />
              </g>
            )
          })}
          {/* Piezas */}
          {tarjetas.map(t => t.rieles ? (
            <g key={t.id}>
              <rect x={t.x} y={t.y} width={t.ancho} height={t.alto} rx={6} fill="#ffffff" stroke="#cbd5e1" className="cursor-move" onPointerDown={empezarArrastre(t.id)}><title>Arrástralo para moverlo</title></rect>
              <text x={t.x + t.ancho / 2} y={t.y + 22} pointerEvents="none" textAnchor="middle" fill="#1f2937" fontSize={13} fontWeight={700}>{t.titulo}</text>
              <text x={t.x + t.ancho / 2} y={t.y + 38} pointerEvents="none" textAnchor="middle" fill="#57534e" fontSize={10}>{internas.length ? 'Punteado: la fuente está pinchada en los rieles' : 'Cada riel une todos sus agujeros'}</text>
              {t.pines.filter(p => p.lado === 'izq').map(p => {
                const k = `${t.id}.${p.pin.nombre}`
                const mas = p.pin.nombre.startsWith('+')
                const color = mas ? '#dc2626' : '#2563eb'
                const sel = elegido && elegido[0] === t.id && elegido[1] === p.pin.nombre
                const conectado = [...doc.cables, ...internas].some(c => `${c.de[0]}.${c.de[1]}` === k || `${c.a[0]}.${c.a[1]}` === k)
                return (
                  <g key={k} onClick={e => { e.stopPropagation(); tocarPin(t.id, p.pin.nombre) }} onPointerEnter={() => setSobre([t.id, p.pin.nombre])} onPointerLeave={() => setSobre(null)} className="cursor-pointer">
                    <title>{p.pin.ayuda ?? p.pin.nombre}</title>
                    <rect x={t.x} y={p.y - 13} width={t.ancho} height={26} fill="transparent" />
                    <line x1={t.x + 12} x2={t.x + t.ancho - 12} y1={p.y} y2={p.y} stroke={color} strokeWidth={sel ? 5 : 3} strokeLinecap="round" />
                    <text x={t.x + t.ancho / 2} y={p.y - 6} textAnchor="middle" fill={color} fontSize={11} fontWeight={600}>{mas ? 'riel +' : 'riel −'} {p.pin.nombre.endsWith('arriba') ? 'de arriba' : 'de abajo'}</text>
                    {[t.x, t.x + t.ancho].map(x => <circle key={x} cx={x} cy={p.y} r={sel ? 7.5 : 5.5} fill={conectado ? color : '#ffffff'} stroke={sugeridos.has(k) ? '#22c55e' : color} strokeWidth={sugeridos.has(k) ? 3.5 : 2} />)}
                  </g>
                )
              })}
            </g>
          ) : (
            <g key={t.id}>
              <rect x={t.x} y={t.y} width={t.ancho} height={t.alto} rx={6} fill={t.ancho === ANCHO_PLACA ? '#eef6f7' : '#ffffff'} stroke={t.ancho === ANCHO_PLACA ? '#0f6e78' : '#cbd5e1'} className="cursor-move" onPointerDown={empezarArrastre(t.id)}><title>Arrástralo para moverlo</title></rect>
              <text x={t.x + t.ancho / 2} y={t.y + 22} pointerEvents="none" textAnchor="middle" fill="#0f172a" fontSize={13} fontWeight={600}>{t.titulo.length > 24 ? t.titulo.slice(0, 23) + '…' : t.titulo}</text>
              {t.pines.map(p => {
                const k = `${t.id}.${p.pin.nombre}`
                const sel = elegido && elegido[0] === t.id && elegido[1] === p.pin.nombre
                const conectado = [...doc.cables, ...internas].some(c => `${c.de[0]}.${c.de[1]}` === k || `${c.a[0]}.${c.a[1]}` === k)
                const mal = conProblema.has(k)
                const color = p.pin.tipo === 'gnd' ? '#64748b' : p.pin.tipo === 'alim' || p.pin.tipo === 'potencia' ? '#dc2626' : p.pin.tipo === 'pwm' ? '#9333ea' : p.pin.tipo === 'analogico' ? '#65a30d' : '#2563eb'
                const tx = p.lado === 'der' ? p.x - 12 : p.x + 12
                return (
                  <g key={k} onClick={e => { e.stopPropagation(); tocarPin(t.id, p.pin.nombre) }} onPointerEnter={() => setSobre([t.id, p.pin.nombre])} onPointerLeave={() => setSobre(null)} className="cursor-pointer">
                    <title>{p.pin.ayuda ?? p.pin.nombre}</title>
                    <circle cx={p.x} cy={p.y} r={13} fill="transparent" />
                    {mal && <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="#f59e0b" strokeWidth={2} />}
                    {sugeridos.has(k) && <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="#22c55e" strokeWidth={2.5}><animate attributeName="r" values="8;12;8" dur="1.2s" repeatCount="indefinite" /></circle>}
                    <circle cx={p.x} cy={p.y} r={sel ? 7.5 : 5.5} fill={conectado ? color : '#ffffff'} stroke={color} strokeWidth={2} />
                    <text x={tx} y={p.y + 4} textAnchor={p.lado === 'der' ? 'end' : 'start'} fill={sel ? '#0f172a' : '#475569'} fontWeight={sel ? 700 : 400} fontSize={11} fontFamily="monospace">
                      {p.pin.nombre}{p.pin.tipo === 'pwm' ? '~' : ''}
                    </text>
                  </g>
                )
              })}
            </g>
          ))}
        </svg>}
        {cableSel !== null && doc.cables[cableSel] && (
          <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-md lab-vidrio px-3 py-1.5 text-xs text-lab-tinta lg:hidden">
            <span className="font-mono">{doc.cables[cableSel].de[1]} → {doc.cables[cableSel].a[1]}</span>
            <button onClick={() => quitarCable(cableSel)} className="flex items-center gap-1 rounded px-2 py-1 font-medium text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Quitar cable</button>
          </div>
        )}
      </div>

      {/* ---------- Revisión y tabla ---------- */}
      <aside className="max-h-[45vh] w-full overflow-y-auto border-t border-lab-borde/20 bg-lab-superficie p-4 text-xs lg:max-h-none lg:w-80 lg:border-l lg:border-t-0">
        {/* Explicación de lo que se está tocando */}
        <h3 className="lab-seccion mb-2">Qué es</h3>
        <div className="mb-5 min-h-[6.5rem] rounded-md border border-lab-borde/20 bg-lab-fondo px-3 py-2.5 leading-relaxed" aria-live="polite">
          {exCable && cableSel !== null ? (
            <>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: doc.cables[cableSel].color === NEGRO ? '#4b5563' : doc.cables[cableSel].color }} />
                <span className="font-mono text-sm font-semibold text-lab-tinta">{exCable.titulo}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wide text-lab-tenue">Cable</span>
              </div>
              <p className="mt-1.5 text-lab-tinta2">{exCable.texto}</p>
              {exCable.codigo && <p className="mt-1.5 flex gap-1.5 text-lab-tinta2"><Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lab-acento" /><span className="font-mono text-[11px]">{exCable.codigo}</span></p>}
              <button onClick={() => quitarCable(cableSel)} className="mt-2 flex items-center gap-1 rounded px-2 py-1 font-medium text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Quitar este cable</button>
            </>
          ) : exPin ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-semibold text-lab-tinta">{exPin.titulo}</span>
                <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-lab-tenue">{exPin.tipo}</span>
              </div>
              <p className="mt-1.5 text-lab-tinta2">{exPin.que}</p>
              {exPin.codigo && <p className="mt-1.5 flex gap-1.5 text-lab-tinta2"><Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lab-acento" /><span className="font-mono text-[11px]">{exPin.codigo}</span></p>}
              <p className="mt-1.5 text-lab-suave">{exPin.unidoA.length ? <>Ahora está unido a: <b className="font-medium text-lab-tinta2">{exPin.unidoA.join(', ')}</b>.</> : 'Ahora está suelto: no tiene ningún cable.'}</p>
              {exPin.cuidado && <p className="mt-1.5 flex gap-1.5 text-amber-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {exPin.cuidado}</p>}
            </>
          ) : (
            <p className="flex gap-2 text-lab-suave"><MousePointerClick className="mt-0.5 h-4 w-4 shrink-0" /> Pasa por encima de un pin o toca un cable: aquí se explica qué hace, a qué está unido y cómo se usa en el programa.</p>
          )}
        </div>

        {/* Guía paso a paso */}
        <h3 className="lab-seccion mb-2">Guía paso a paso</h3>
        {paso ? (
          <div className="mb-5">
            <p className="mb-2 text-lab-suave">{pasos.length === 1 ? 'Falta 1 cable' : `Faltan ${pasos.length} cables`} para que todo funcione. El siguiente:</p>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 leading-relaxed text-emerald-900">
              <p className="flex gap-1.5 font-semibold"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {paso.titulo}</p>
              <p className="mt-1">{paso.porque}</p>
              {paso.codigo && <p className="mt-1 font-mono text-[11px]">{paso.codigo}</p>}
              <p className="mt-1.5 text-emerald-800">{vista === '3d' ? 'Los dos pines laten en verde: tócalos, uno y después el otro.' : 'Toca esos dos pines en el esquema.'}</p>
              <button onClick={() => ponerCable(paso.cable.de, paso.cable.a, paso.cable.color)} className="mt-2 rounded border border-emerald-300 bg-white px-2 py-1 font-medium text-emerald-800 hover:bg-emerald-100">Poner este cable por mí</button>
            </div>
            {pasos.length > 1 && (
              <ol start={2} className="mt-2 list-decimal space-y-1 pl-5 text-lab-suave">
                {pasos.slice(1, 6).map((x, i) => <li key={i}>{x.titulo.replace(/^Conecta /, '')}</li>)}
                {pasos.length > 6 && <li className="list-none">… y {pasos.length - 6} más</li>}
              </ol>
            )}
          </div>
        ) : (
          <p className="mb-5 flex items-center gap-2 text-lab-suave"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> No falta ningún cable: cada pieza está conectada.</p>
        )}

        <h3 className="lab-seccion mb-2">Revisión</h3>
        {problemas.length === 0 ? (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Todo bien: {esBanco(doc) ? 'el circuito' : 'el robot'} está listo para probar.</div>
        ) : (
          <div className="mb-3 space-y-1.5">
            {errores.length > 0 && <p className="text-red-700">Corrige los errores (rojo) antes de probar: en la vida real algo se quemaría o no funcionaría.</p>}
            {problemas.map((p, i) => (
              <button key={i} onMouseEnter={() => setResaltar(p.pines)} onMouseLeave={() => setResaltar([])} onClick={() => setResaltar(p.pines)}
                className={`flex w-full gap-2 rounded-md border px-2.5 py-2 text-left leading-snug ${p.nivel === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                {p.nivel === 'error' ? <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />} {p.texto}
              </button>
            ))}
          </div>
        )}
        <h3 className="lab-seccion mb-1 mt-5">Tabla de pines</h3>
        <p className="mb-2 text-lab-tenue">Úsala en tu código: cada pieza y el pin de la placa al que va.</p>
        {tabla.length === 0 ? <p className="text-lab-tenue">Todavía no hay piezas conectadas a la placa.</p> : (
          <table className="w-full">
            <tbody>
              {tabla.map((f, i) => (
                <tr key={i} className="border-t border-lab-borde/10">
                  <td className="py-1 pr-2 text-lab-tinta2">{f.etiqueta}</td>
                  <td className="py-1 pr-2 font-mono text-lab-tinta">{f.pin}</td>
                  <td className="py-1 text-right font-mono font-semibold text-lab-acento">{f.placa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h3 className="lab-seccion mb-2 mt-5">Colores de los pines</h3>
        <ul className="grid grid-cols-2 gap-1.5 text-lab-tinta2">
          {([['#2563eb', 'Digital'], ['#9333ea', 'PWM ~'], ['#65a30d', 'Analógico'], ['#dc2626', 'Alimentación'], ['#64748b', 'Tierra (GND)']] as const).map(([c, n]) => (
            <li key={n} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{n}</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
