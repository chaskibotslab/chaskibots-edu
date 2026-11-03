'use client'

// Pestaña «Cablear»: esquema 2D del robot. La placa va al centro con sus pines
// y cada pieza a un costado; un cable se hace tocando un pin y luego otro
// (con mouse o con el dedo). Tocar un cable lo selecciona para quitarlo.
// Cada bloque se puede arrastrar para ordenar el esquema a gusto.
// La verificación eléctrica corre en vivo y marca los pines con problemas.

import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, LayoutGrid, Trash2, Wand2, XCircle } from 'lucide-react'
import { pieza } from '../../catalogo/piezas'
import type { PinDef } from '../../catalogo/tipos'
import { autocablear } from '../../engine/autocableado'
import { verificar } from '../../engine/verificacion'
import { mcuDe } from '../../engine/placa'
import { esBanco } from '../../engine/ensamblaje'
import type { Cable, RobotDoc } from '../../robots/doc'

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
      id: mcu.id, titulo: mcu.etiqueta, x: xPlaca, y: 20, ancho: ANCHO_PLACA, alto,
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

export default function Cablear({ doc, cambiar }: { doc: RobotDoc; cambiar: (d: RobotDoc, texto?: string, recablear?: boolean) => void }) {
  const [elegido, setElegido] = useState<[string, string] | null>(null)
  const [cableSel, setCableSel] = useState<number | null>(null)
  const [resaltar, setResaltar] = useState<string[]>([])
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

  const tocarPin = (inst: string, pin: string) => {
    setCableSel(null)
    if (!elegido) { setElegido([inst, pin]); return }
    if (elegido[0] === inst && elegido[1] === pin) { setElegido(null); return }
    const nuevo: Cable = { de: elegido, a: [inst, pin], color: colorPara(pinDef(...elegido), pinDef(inst, pin), doc.cables.length) }
    cambiar({ ...doc, cableado: 'manual', cables: [...doc.cables, nuevo] }, `Cable: ${elegido[1]} → ${pin}`, false)
    setElegido(null)
  }

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
      {/* ---------- Esquema ---------- */}
      <div className="lab-plano relative min-h-[320px] flex-1 overflow-auto">
        <div className="sticky left-0 top-0 z-10 flex flex-wrap items-center gap-2 border-b border-lab-borde/15 bg-lab-superficie/90 px-3 py-2 text-xs backdrop-blur">
          <span className={`rounded-full px-2 py-0.5 font-semibold ${doc.cableado === 'manual' ? 'bg-amber-500/15 text-amber-700' : 'bg-sky-500/15 text-sky-700'}`}>
            {doc.cableado === 'manual' ? 'Cableado a mano' : 'Cableado automático'}
          </span>
          <span className="text-lab-suave">
            {elegido ? <>Ahora toca el otro pin para unir <b className="text-lab-tinta">{elegido[1]}</b> · toca el mismo para cancelar</> : 'Toca un pin y luego otro para poner un cable. Toca un cable para quitarlo. Arrastra un bloque para moverlo.'}
          </span>
          <div className="ml-auto flex gap-1.5">
            {Object.keys(movidas).length > 0 && (
              <button onClick={() => setMovidas({})} className="flex items-center gap-1 rounded-lg border border-lab-borde/15 px-2.5 py-1.5 hover:bg-lab-tinta/[0.04]" title="Volver a poner los bloques en su lugar">
                <LayoutGrid className="h-3.5 w-3.5" /> Ordenar bloques
              </button>
            )}
            <button
              onClick={() => { if (window.confirm('¿Reemplazar todos los cables por el cableado automático?')) cambiar({ ...doc, cableado: 'auto', cables: autocablear(doc).cables }, 'Cableado automático', false) }}
              className="flex items-center gap-1 rounded-lg border border-lab-borde/15 px-2.5 py-1.5 hover:bg-lab-tinta/[0.04]"
            ><Wand2 className="h-3.5 w-3.5" /> Conectar automáticamente</button>
            <button
              onClick={() => { if (window.confirm('¿Quitar todos los cables?')) cambiar({ ...doc, cableado: 'manual', cables: [] }, 'Sin cables', false) }}
              className="flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-red-700 hover:bg-red-500/10"
            ><Trash2 className="h-3.5 w-3.5" /> Quitar todos</button>
          </div>
        </div>
        <svg ref={svg} viewBox={`${minX} ${minY} ${ancho - minX} ${alto - minY}`} className="h-auto min-w-[760px] w-full touch-none" onClick={() => { setCableSel(null) }} onPointerMove={arrastrar} onPointerUp={soltar} onPointerCancel={soltar}>
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
              <rect x={t.x} y={t.y} width={t.ancho} height={t.alto} rx={10} fill="#ecebe4" stroke="rgba(255,255,255,.25)" className="cursor-move" onPointerDown={empezarArrastre(t.id)}><title>Arrástralo para moverlo</title></rect>
              <text x={t.x + t.ancho / 2} y={t.y + 22} pointerEvents="none" textAnchor="middle" fill="#1f2937" fontSize={13} fontWeight={700}>{t.titulo}</text>
              <text x={t.x + t.ancho / 2} y={t.y + 38} pointerEvents="none" textAnchor="middle" fill="#57534e" fontSize={10}>{internas.length ? 'Punteado: la fuente está pinchada en los rieles' : 'Cada riel une todos sus agujeros'}</text>
              {t.pines.filter(p => p.lado === 'izq').map(p => {
                const k = `${t.id}.${p.pin.nombre}`
                const mas = p.pin.nombre.startsWith('+')
                const color = mas ? '#dc2626' : '#2563eb'
                const sel = elegido && elegido[0] === t.id && elegido[1] === p.pin.nombre
                const conectado = [...doc.cables, ...internas].some(c => `${c.de[0]}.${c.de[1]}` === k || `${c.a[0]}.${c.a[1]}` === k)
                return (
                  <g key={k} onClick={e => { e.stopPropagation(); tocarPin(t.id, p.pin.nombre) }} className="cursor-pointer">
                    <title>{p.pin.ayuda ?? p.pin.nombre}</title>
                    <rect x={t.x} y={p.y - 13} width={t.ancho} height={26} fill="transparent" />
                    <line x1={t.x + 12} x2={t.x + t.ancho - 12} y1={p.y} y2={p.y} stroke={color} strokeWidth={sel ? 5 : 3} strokeLinecap="round" />
                    <text x={t.x + t.ancho / 2} y={p.y - 6} textAnchor="middle" fill={color} fontSize={11} fontWeight={600}>{mas ? 'riel +' : 'riel −'} {p.pin.nombre.endsWith('arriba') ? 'de arriba' : 'de abajo'}</text>
                    {[t.x, t.x + t.ancho].map(x => <circle key={x} cx={x} cy={p.y} r={sel ? 7.5 : 5.5} fill={conectado ? color : '#ecebe4'} stroke={color} strokeWidth={2} />)}
                  </g>
                )
              })}
            </g>
          ) : (
            <g key={t.id}>
              <rect x={t.x} y={t.y} width={t.ancho} height={t.alto} rx={10} fill={t.ancho === ANCHO_PLACA ? '#0e5c63' : '#1c2233'} stroke="rgba(255,255,255,.15)" className="cursor-move" onPointerDown={empezarArrastre(t.id)}><title>Arrástralo para moverlo</title></rect>
              <text x={t.x + t.ancho / 2} y={t.y + 22} pointerEvents="none" textAnchor="middle" fill="#fff" fontSize={13} fontWeight={600}>{t.titulo.length > 24 ? t.titulo.slice(0, 23) + '…' : t.titulo}</text>
              {t.pines.map(p => {
                const k = `${t.id}.${p.pin.nombre}`
                const sel = elegido && elegido[0] === t.id && elegido[1] === p.pin.nombre
                const conectado = [...doc.cables, ...internas].some(c => `${c.de[0]}.${c.de[1]}` === k || `${c.a[0]}.${c.a[1]}` === k)
                const mal = conProblema.has(k)
                const color = p.pin.tipo === 'gnd' ? '#9ca3af' : p.pin.tipo === 'alim' || p.pin.tipo === 'potencia' ? '#f87171' : p.pin.tipo === 'pwm' ? '#c084fc' : p.pin.tipo === 'analogico' ? '#a3e635' : '#60a5fa'
                const tx = p.lado === 'der' ? p.x - 12 : p.x + 12
                return (
                  <g key={k} onClick={e => { e.stopPropagation(); tocarPin(t.id, p.pin.nombre) }} className="cursor-pointer">
                    <title>{p.pin.ayuda ?? p.pin.nombre}</title>
                    <circle cx={p.x} cy={p.y} r={13} fill="transparent" />
                    {mal && <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="#f59e0b" strokeWidth={2} />}
                    <circle cx={p.x} cy={p.y} r={sel ? 7.5 : 5.5} fill={conectado ? color : '#0f1320'} stroke={color} strokeWidth={2} />
                    <text x={tx} y={p.y + 4} textAnchor={p.lado === 'der' ? 'end' : 'start'} fill={sel ? '#fff' : '#cbd5e1'} fontSize={11} fontFamily="monospace">
                      {p.pin.nombre}{p.pin.tipo === 'pwm' ? '~' : ''}
                    </text>
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
        {cableSel !== null && doc.cables[cableSel] && (
          <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full lab-vidrio px-4 py-2 text-xs text-lab-tinta backdrop-blur">
            <span className="font-mono">{doc.cables[cableSel].de[1]} → {doc.cables[cableSel].a[1]}</span>
            <button onClick={() => quitarCable(cableSel)} className="flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-red-700 hover:bg-red-500/30"><Trash2 className="h-3.5 w-3.5" /> Quitar cable</button>
          </div>
        )}
      </div>

      {/* ---------- Revisión y tabla ---------- */}
      <aside className="max-h-[45vh] w-full overflow-y-auto border-t border-lab-borde/15 bg-lab-superficie p-3 text-xs lg:max-h-none lg:w-96 lg:border-l lg:border-t-0">
        <h3 className="mb-2 text-sm font-semibold text-lab-tinta">Revisión del cableado</h3>
        {problemas.length === 0 ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Todo bien: {esBanco(doc) ? 'el circuito' : 'el robot'} está listo para probar.</div>
        ) : (
          <div className="mb-3 space-y-1.5">
            {errores.length > 0 && <p className="text-red-700">Corrige los errores (rojo) antes de probar: en la vida real algo se quemaría o no funcionaría.</p>}
            {problemas.map((p, i) => (
              <button key={i} onMouseEnter={() => setResaltar(p.pines)} onMouseLeave={() => setResaltar([])} onClick={() => setResaltar(p.pines)}
                className={`flex w-full gap-2 rounded-lg px-2.5 py-2 text-left leading-snug ${p.nivel === 'error' ? 'bg-red-500/10 text-red-700' : 'bg-amber-500/10 text-amber-700'}`}>
                {p.nivel === 'error' ? <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />} {p.texto}
              </button>
            ))}
          </div>
        )}
        <h3 className="mb-1.5 mt-4 text-sm font-semibold text-lab-tinta">Tabla de pines (para tu código)</h3>
        {tabla.length === 0 ? <p className="text-lab-tenue">Todavía no hay piezas conectadas a la placa.</p> : (
          <table className="w-full">
            <tbody>
              {tabla.map((f, i) => (
                <tr key={i} className="border-t border-lab-borde/10">
                  <td className="py-1 pr-2 text-lab-tinta2">{f.etiqueta}</td>
                  <td className="py-1 pr-2 font-mono text-lab-tinta">{f.pin}</td>
                  <td className="py-1 font-mono text-lab-acento">{f.placa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 flex gap-1.5 text-lab-tenue"><Info className="h-3.5 w-3.5 shrink-0" /> Colores de los pines: <span className="text-sky-600">digital</span>, <span className="text-purple-600">PWM ~</span>, <span className="text-lime-600">analógico</span>, <span className="text-red-600">alimentación</span>, <span className="text-lab-suave">tierra</span>.</p>
      </aside>
    </div>
  )
}
