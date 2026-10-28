'use client'

// Pestaña «Cablear»: esquema 2D del robot. La placa va al centro con sus pines
// y cada pieza a un costado; un cable se hace tocando un pin y luego otro
// (con mouse o con el dedo). Tocar un cable lo selecciona para quitarlo.
// La verificación eléctrica corre en vivo y marca los pines con problemas.

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, Trash2, Wand2, XCircle } from 'lucide-react'
import { pieza } from '../../catalogo/piezas'
import type { PinDef } from '../../catalogo/tipos'
import { autocablear } from '../../engine/autocableado'
import { verificar } from '../../engine/verificacion'
import type { Cable, RobotDoc } from '../../robots/doc'

const ROJO = '#ef4444', NEGRO = '#111827'
const SENALES = ['#a855f7', '#3b82f6', '#22c55e', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#84cc16', '#f59e0b', '#14b8a6']

const PASO = 22          // separación entre pines (unidades del esquema)
const ANCHO_PIEZA = 170
const ANCHO_PLACA = 190

interface Tarjeta { id: string; titulo: string; x: number; y: number; ancho: number; alto: number; pines: { pin: PinDef; x: number; y: number; lado: 'izq' | 'der' }[] }

function colorPara(a: PinDef, b: PinDef, usados: number) {
  if (a.tipo === 'gnd' || b.tipo === 'gnd') return NEGRO
  if (a.tipo === 'alim' || b.tipo === 'alim' || a.tipo === 'potencia') return ROJO
  return SENALES[usados % SENALES.length]
}

/** Ubica la placa al centro y reparte las demás piezas a los costados. */
function disponer(doc: RobotDoc): Tarjeta[] {
  const tarjetas: Tarjeta[] = []
  const mcu = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'mcu-avr')
  const conPines = doc.piezas.filter(p => p.id !== mcu?.id && pieza(p.pieza).pines.length)
  const xPlaca = 2 * ANCHO_PIEZA + 120
  if (mcu) {
    const pines = pieza(mcu.pieza).pines
    const izq = pines.filter(p => /^D\d+$/.test(p.nombre))
    const der = pines.filter(p => !/^D\d+$/.test(p.nombre))
    const alto = 46 + Math.max(izq.length, der.length) * PASO
    tarjetas.push({
      id: mcu.id, titulo: mcu.etiqueta, x: xPlaca, y: 20, ancho: ANCHO_PLACA, alto,
      pines: [
        ...izq.map((pin, i) => ({ pin, x: xPlaca, y: 20 + 40 + i * PASO, lado: 'izq' as const })),
        ...der.map((pin, i) => ({ pin, x: xPlaca + ANCHO_PLACA, y: 20 + 40 + i * PASO, lado: 'der' as const })),
      ],
    })
  }
  // Sensores y servos a la izquierda de la placa; driver, motores y batería a la derecha.
  const aLaIzquierda = (t: string) => ['ir-reflectivo', 'ir-obstaculo', 'ultrasonido', 'servo'].includes(t)
  const columnas = [
    { piezas: conPines.filter(p => aLaIzquierda(pieza(p.pieza).comportamiento.tipo)), x: [20, ANCHO_PIEZA + 60], lado: 'der' as const },
    { piezas: conPines.filter(p => !aLaIzquierda(pieza(p.pieza).comportamiento.tipo)), x: [xPlaca + ANCHO_PLACA + 100, xPlaca + ANCHO_PLACA + ANCHO_PIEZA + 140], lado: 'izq' as const },
  ]
  for (const col of columnas) {
    const ys = [20, 20]
    col.piezas.forEach((p, i) => {
      const k = i % 2
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
  const tarjetas = useMemo(() => disponer(doc), [doc])
  const problemas = useMemo(() => verificar(doc), [doc])
  const { tabla } = useMemo(() => autocablear(doc, { conservar: true }), [doc])
  const posPin = useMemo(() => {
    const m = new Map<string, { x: number; y: number; lado: 'izq' | 'der' }>()
    for (const t of tarjetas) for (const p of t.pines) m.set(`${t.id}.${p.pin.nombre}`, p)
    return m
  }, [tarjetas])
  const conProblema = useMemo(() => new Set([...problemas.flatMap(p => p.pines), ...resaltar]), [problemas, resaltar])
  const errores = problemas.filter(p => p.nivel === 'error')
  const ancho = Math.max(...tarjetas.map(t => t.x + t.ancho)) + 20
  const alto = Math.max(...tarjetas.map(t => t.y + t.alto)) + 20

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

  const curva = (c: Cable) => {
    const a = posPin.get(`${c.de[0]}.${c.de[1]}`), b = posPin.get(`${c.a[0]}.${c.a[1]}`)
    if (!a || !b) return null
    const sa = a.lado === 'der' ? 1 : -1, sb = b.lado === 'der' ? 1 : -1
    const t = Math.max(40, Math.abs(b.x - a.x) * 0.4)
    return `M ${a.x} ${a.y} C ${a.x + sa * t} ${a.y}, ${b.x + sb * t} ${b.y}, ${b.x} ${b.y}`
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* ---------- Esquema ---------- */}
      <div className="relative min-h-[320px] flex-1 overflow-auto bg-[#0f1320]">
        <div className="sticky left-0 top-0 z-10 flex flex-wrap items-center gap-2 border-b border-white/10 bg-labdark-surface/90 px-3 py-2 text-xs backdrop-blur">
          <span className={`rounded-full px-2 py-0.5 font-semibold ${doc.cableado === 'manual' ? 'bg-amber-500/15 text-amber-300' : 'bg-sky-500/15 text-sky-300'}`}>
            {doc.cableado === 'manual' ? 'Cableado a mano' : 'Cableado automático'}
          </span>
          <span className="text-slate-400">
            {elegido ? <>Ahora toca el otro pin para unir <b className="text-white">{elegido[1]}</b> · toca el mismo para cancelar</> : 'Toca un pin y luego otro para poner un cable. Toca un cable para quitarlo.'}
          </span>
          <div className="ml-auto flex gap-1.5">
            <button
              onClick={() => { if (window.confirm('¿Reemplazar todos los cables por el cableado automático?')) cambiar({ ...doc, cableado: 'auto', cables: autocablear(doc).cables }, 'Cableado automático', false) }}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 hover:bg-white/5"
            ><Wand2 className="h-3.5 w-3.5" /> Conectar automáticamente</button>
            <button
              onClick={() => { if (window.confirm('¿Quitar todos los cables?')) cambiar({ ...doc, cableado: 'manual', cables: [] }, 'Sin cables', false) }}
              className="flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-red-300 hover:bg-red-500/10"
            ><Trash2 className="h-3.5 w-3.5" /> Quitar todos</button>
          </div>
        </div>
        <svg viewBox={`0 0 ${ancho} ${alto}`} className="h-auto min-w-[760px] w-full" onClick={() => { setCableSel(null) }}>
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
          {tarjetas.map(t => (
            <g key={t.id}>
              <rect x={t.x} y={t.y} width={t.ancho} height={t.alto} rx={10} fill={t.ancho === ANCHO_PLACA ? '#0e5c63' : '#1c2233'} stroke="rgba(255,255,255,.15)" />
              <text x={t.x + t.ancho / 2} y={t.y + 22} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={600}>{t.titulo.length > 24 ? t.titulo.slice(0, 23) + '…' : t.titulo}</text>
              {t.pines.map(p => {
                const k = `${t.id}.${p.pin.nombre}`
                const sel = elegido && elegido[0] === t.id && elegido[1] === p.pin.nombre
                const conectado = doc.cables.some(c => `${c.de[0]}.${c.de[1]}` === k || `${c.a[0]}.${c.a[1]}` === k)
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
          <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/80 px-4 py-2 text-xs text-white backdrop-blur">
            <span className="font-mono">{doc.cables[cableSel].de[1]} → {doc.cables[cableSel].a[1]}</span>
            <button onClick={() => quitarCable(cableSel)} className="flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-red-200 hover:bg-red-500/30"><Trash2 className="h-3.5 w-3.5" /> Quitar cable</button>
          </div>
        )}
      </div>

      {/* ---------- Revisión y tabla ---------- */}
      <aside className="max-h-[45vh] w-full overflow-y-auto border-t border-white/10 bg-labdark-surface p-3 text-xs lg:max-h-none lg:w-96 lg:border-l lg:border-t-0">
        <h3 className="mb-2 text-sm font-semibold text-white">Revisión del cableado</h3>
        {problemas.length === 0 ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Todo bien: el robot está listo para probar.</div>
        ) : (
          <div className="mb-3 space-y-1.5">
            {errores.length > 0 && <p className="text-red-300">Corrige los errores (rojo) antes de probar: en la vida real algo se quemaría o no funcionaría.</p>}
            {problemas.map((p, i) => (
              <button key={i} onMouseEnter={() => setResaltar(p.pines)} onMouseLeave={() => setResaltar([])} onClick={() => setResaltar(p.pines)}
                className={`flex w-full gap-2 rounded-lg px-2.5 py-2 text-left leading-snug ${p.nivel === 'error' ? 'bg-red-500/10 text-red-200' : 'bg-amber-500/10 text-amber-200'}`}>
                {p.nivel === 'error' ? <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />} {p.texto}
              </button>
            ))}
          </div>
        )}
        <h3 className="mb-1.5 mt-4 text-sm font-semibold text-white">Tabla de pines (para tu código)</h3>
        {tabla.length === 0 ? <p className="text-slate-500">Todavía no hay piezas conectadas a la placa.</p> : (
          <table className="w-full">
            <tbody>
              {tabla.map((f, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-1 pr-2 text-slate-300">{f.etiqueta}</td>
                  <td className="py-1 pr-2 font-mono text-white">{f.pin}</td>
                  <td className="py-1 font-mono text-chaski-primary">{f.placa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 flex gap-1.5 text-slate-500"><Info className="h-3.5 w-3.5 shrink-0" /> Colores de los pines: <span className="text-sky-400">digital</span>, <span className="text-purple-400">PWM ~</span>, <span className="text-lime-400">analógico</span>, <span className="text-red-400">alimentación</span>, <span className="text-gray-400">tierra</span>.</p>
      </aside>
    </div>
  )
}
