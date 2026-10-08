import { pinoutForBoard, normalizePin, isPowerPin, isGroundPin } from '@/lib/boardPinouts'

// Diagrama de conexiones generado a partir de la tabla de conexiones del
// proyecto (no es una imagen fija: si cambia un pin, el dibujo cambia).
//
// Reglas de dibujo:
//  - La placa muestra sus pines en la posición real.
//  - 5V/3V3 y GND llegan a las líneas de alimentación de la protoboard
//    (rojo y negro); cada pieza toma corriente de ahí con un cable corto,
//    como se arma de verdad. Así no hay manojos de cables.
//  - Cada cable de señal tiene su propio color y su propio carril: dos
//    cables nunca van uno encima de otro, solo se cruzan en ángulo recto.

export interface WiringConnection {
  componente: string
  pinComponente: string
  pinPlaca: string
  nota?: string | null
}

interface Props {
  boardName?: string | null
  conexiones: WiringConnection[]
  /** Índices de `conexiones` a resaltar; el resto se atenúa. Vacío = todo visible. */
  resaltar?: number[]
  /** Líneas de alimentación a resaltar ("5V", "GND"…). */
  rieles?: string[]
}

const SIGNAL_COLORS = ['#2563EB', '#16A34A', '#EA580C', '#9333EA', '#0891B2', '#DB2777', '#CA8A04', '#4F46E5']
const POWER = '#DC2626'
const GROUND = '#111827'

const PITCH = 24
const BX = 110
const BW = 156
const BOARD_TOP = 54
const CARD_W = 236
const ROW = 28

const resistorOf = (c: WiringConnection): string | null => {
  const m = `${c.pinComponente} ${c.nota || ''}`.match(/R\s?(\d+(?:[.,]\d+)?\s?k?)\b|(\d+(?:[.,]\d+)?\s?k?)\s?(?:Ω|ohm)/i)
  if (!m) return null
  const v = (m[1] || m[2]).replace(/\s/g, '').toLowerCase()
  return `${v.replace('k', ' k')}${v.includes('k') ? 'Ω' : ' Ω'}`
}
const short = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s)
const cleanPinLabel = (s: string) => short(s.replace(/\s*v[ií]a\s+R?\s?\d+\s?k?(?:Ω|ohm)?/i, '').trim(), 24)

export default function WiringDiagram({ boardName, conexiones, resaltar = [], rieles = [] }: Props) {
  const base = pinoutForBoard(boardName)
  const conns = conexiones.map((c, i) => ({ ...c, i, pin: normalizePin(c.pinPlaca) }))

  // Pines que la tabla usa pero el dibujo de la placa no trae: se añaden abajo a la derecha.
  const known = new Set([...base.left, ...base.right])
  const extras = Array.from(new Set(conns.map(c => c.pin).filter(p => !known.has(p))))
  const left = base.left
  const right = [...base.right, ...extras]

  const rows = Math.max(left.length, right.length)
  const boardH = rows * PITCH + 46
  const boardBottom = BOARD_TOP + boardH
  const pinY = (idx: number) => BOARD_TOP + 40 + idx * PITCH

  // Dónde está cada pin. Si existe a ambos lados (GND), se prefiere el derecho: queda más cerca de las piezas.
  const locate = (pin: string) => {
    const r = right.indexOf(pin)
    if (r >= 0) return { side: 'right' as const, y: pinY(r) }
    const l = left.indexOf(pin)
    return { side: 'left' as const, y: pinY(Math.max(l, 0)) }
  }

  // Piezas, en orden de aparición
  const compNames = Array.from(new Set(conns.map(c => c.componente)))
  const signal = conns.filter(c => !isPowerPin(c.pin) && !isGroundPin(c.pin))
  const railPins = Array.from(new Set(conns.filter(c => isPowerPin(c.pin) || isGroundPin(c.pin)).map(c => c.pin)))
    .sort((a, b) => Number(isGroundPin(a)) - Number(isGroundPin(b)))

  const laneX0 = BX + BW + 46
  const railX0 = laneX0 + signal.length * 14 + 26
  const railX = (pin: string) => railX0 + railPins.indexOf(pin) * 26
  const compX = railX0 + Math.max(railPins.length, 1) * 26 + 46

  // Tarjetas de piezas apiladas a la derecha
  let cursor = BOARD_TOP
  const cards = compNames.map(name => {
    const pins = conns.filter(c => c.componente === name)
    const h = 44 + pins.length * ROW + 10
    const card = { name, y: cursor, h, pins }
    cursor += h + 18
    return card
  })
  const targetY = new Map<number, number>()
  for (const card of cards) card.pins.forEach((p, j) => targetY.set(p.i, card.y + 44 + j * ROW + ROW / 2))

  // Carriles de señal: el cable que sale más arriba y baja usa el carril más alejado, para no cruzarse con los demás.
  const src = (c: typeof conns[number]) => locate(c.pin)
  const down = signal.filter(c => targetY.get(c.i)! >= src(c).y).sort((a, b) => src(a).y - src(b).y)
  const up = signal.filter(c => targetY.get(c.i)! < src(c).y).sort((a, b) => src(b).y - src(a).y)
  const laneOrder = [...down, ...up]
  const laneX = (i: number) => laneX0 + (signal.length - 1 - laneOrder.findIndex(c => c.i === i)) * 14

  // Cables que salen del lado izquierdo de la placa: rodean la placa por abajo, cada uno por su canal.
  const leftWires: string[] = []
  const leftRoute = (key: string) => {
    if (!leftWires.includes(key)) leftWires.push(key)
    const k = leftWires.indexOf(key)
    return { x: BX - 22 - k * 10, y: boardBottom + 18 + k * 12 }
  }

  const colorOf = new Map<number, string>()
  signal.forEach((c, k) => colorOf.set(c.i, SIGNAL_COLORS[k % SIGNAL_COLORS.length]))
  const wireColor = (c: typeof conns[number]) => (isPowerPin(c.pin) ? POWER : isGroundPin(c.pin) ? GROUND : colorOf.get(c.i)!)

  const focusing = resaltar.length > 0 || rieles.length > 0
  const on = (i: number) => !focusing || resaltar.includes(i)
  const railOn = (pin: string) =>
    !focusing || rieles.includes(pin) || conns.some(c => c.pin === pin && resaltar.includes(c.i))

  // Recorridos
  const signalPath = (c: typeof conns[number]) => {
    const s = src(c)
    const ty = targetY.get(c.i)!
    const lx = laneX(c.i)
    if (s.side === 'right') return `M${BX + BW},${s.y} H${lx} V${ty} H${compX}`
    const r = leftRoute(`s${c.i}`)
    return `M${BX},${s.y} H${r.x} V${r.y} H${lx} V${ty} H${compX}`
  }
  const railFeeds = railPins.map(pin => {
    const s = locate(pin)
    const x = railX(pin)
    if (s.side === 'right') return { pin, d: `M${BX + BW},${s.y} H${x}`, joinY: s.y }
    const r = leftRoute(`r${pin}`)
    return { pin, d: `M${BX},${s.y} H${r.x} V${r.y} H${x}`, joinY: r.y }
  })
  const railSpan = (pin: string) => {
    const ys = [railFeeds.find(f => f.pin === pin)!.joinY, ...conns.filter(c => c.pin === pin).map(c => targetY.get(c.i)!)]
    return { y1: Math.min(...ys) - 12, y2: Math.max(...ys) + 12 }
  }

  const W = compX + CARD_W + 18
  const H = Math.max(boardBottom + 18 + leftWires.length * 12 + 26, cursor + 6)
  const usedPins = new Set(conns.map(c => c.pin))
  const dim = 0.13

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Diagrama de conexiones" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <rect x="0" y="0" width={W} height={H} rx="18" fill="#FFFFFF" />

      {/* Protoboard: líneas de alimentación */}
      {railPins.map(pin => {
        const span = railSpan(pin)
        const x = railX(pin)
        const col = isGroundPin(pin) ? GROUND : POWER
        return (
          <g key={pin} opacity={railOn(pin) ? 1 : dim}>
            <line x1={x} y1={span.y1} x2={x} y2={span.y2} stroke={col} strokeWidth="5" strokeLinecap="round" />
            <text x={x} y={span.y1 - 9} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={col}>{pin}</text>
          </g>
        )
      })}
      {railPins.length > 0 && (
        <text x={railX0 + (railPins.length - 1) * 13} y={BOARD_TOP - 30} textAnchor="middle" fontSize="10" fontWeight="600" fill="#94A3B8">
          Protoboard
        </text>
      )}

      {/* Cables de la placa a la protoboard */}
      {railFeeds.map(f => (
        <path key={f.pin} d={f.d} fill="none" stroke={isGroundPin(f.pin) ? GROUND : POWER} strokeWidth={railOn(f.pin) && focusing ? 4.5 : 3}
          strokeLinecap="round" strokeLinejoin="round" opacity={railOn(f.pin) ? 1 : dim} />
      ))}

      {/* Cables de señal */}
      {signal.map(c => (
        <path key={c.i} d={signalPath(c)} fill="none" stroke={wireColor(c)} strokeWidth={on(c.i) && focusing ? 4.5 : 3}
          strokeLinecap="round" strokeLinejoin="round" opacity={on(c.i) ? 1 : dim} />
      ))}

      {/* Cables cortos de la protoboard a cada pieza */}
      {conns.filter(c => isPowerPin(c.pin) || isGroundPin(c.pin)).map(c => {
        const y = targetY.get(c.i)!
        const x = railX(c.pin)
        return (
          <g key={c.i} opacity={on(c.i) ? 1 : dim}>
            <path d={`M${x},${y} H${compX}`} fill="none" stroke={wireColor(c)} strokeWidth={on(c.i) && focusing ? 4.5 : 3} strokeLinecap="round" />
            <circle cx={x} cy={y} r="4.5" fill={wireColor(c)} stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )
      })}

      {/* Resistencias dibujadas sobre su cable */}
      {conns.map(c => {
        const value = resistorOf(c)
        if (!value) return null
        const y = targetY.get(c.i)!
        const x = compX - 44
        return (
          <g key={`r${c.i}`} opacity={on(c.i) ? 1 : dim}>
            <rect x={x} y={y - 7} width="30" height="14" rx="4" fill="#E8D5A8" stroke="#8A6D2F" strokeWidth="1.2" />
            <line x1={x + 8} y1={y - 7} x2={x + 8} y2={y + 7} stroke="#C2410C" strokeWidth="2.5" />
            <line x1={x + 15} y1={y - 7} x2={x + 15} y2={y + 7} stroke="#C2410C" strokeWidth="2.5" />
            <line x1={x + 22} y1={y - 7} x2={x + 22} y2={y + 7} stroke="#78350F" strokeWidth="2.5" />
            <text x={x + 15} y={y - 12} textAnchor="middle" fontSize="9" fontWeight="600" fill="#78350F">{value}</text>
          </g>
        )
      })}

      {/* Placa */}
      <rect x={BX + BW / 2 - 22} y={BOARD_TOP - 14} width="44" height="24" rx="4" fill="#CBD5E1" stroke="#94A3B8" />
      <rect x={BX} y={BOARD_TOP} width={BW} height={boardH} rx="12" fill={base.color} />
      <rect x={BX + BW / 2 - 24} y={BOARD_TOP + boardH / 2 - 24} width="48" height="48" rx="5" fill="#0B1220" opacity="0.85" />
      <text x={BX + BW / 2} y={BOARD_TOP + 22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF">{base.label}</text>
      {[['left', left] as const, ['right', right] as const].map(([side, list]) =>
        list.map((pin, idx) => {
          const y = pinY(idx)
          const x = side === 'left' ? BX : BX + BW
          const used = usedPins.has(pin) && locate(pin).side === side
          return (
            <g key={`${side}${idx}`} opacity={used ? 1 : 0.5}>
              <rect x={x - 4} y={y - 4} width="8" height="8" rx="1.5" fill={used ? '#FCD34D' : '#D4A84B'} />
              <text x={side === 'left' ? x + 10 : x - 10} y={y + 3.5} textAnchor={side === 'left' ? 'start' : 'end'}
                fontSize="9.5" fontWeight={used ? 700 : 500} fill="#FFFFFF">{short(pin, 9)}</text>
            </g>
          )
        })
      )}

      {/* Piezas */}
      {cards.map(card => {
        const active = !focusing || card.pins.some(p => on(p.i))
        return (
          <g key={card.name} opacity={active ? 1 : 0.35}>
            <rect x={compX} y={card.y} width={CARD_W} height={card.h} rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x={compX + 16} y={card.y + 27} fontSize="12.5" fontWeight="700" fill="#22252A">{card.name}</text>
            {card.pins.map(p => {
              const y = targetY.get(p.i)!
              return (
                <g key={p.i} opacity={on(p.i) ? 1 : 0.4}>
                  <circle cx={compX} cy={y} r="5.5" fill={wireColor(p)} stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x={compX + 16} y={y + 4} fontSize="11.5" fill="#334155">{cleanPinLabel(p.pinComponente)}</text>
                  <text x={compX + CARD_W - 14} y={y + 4} textAnchor="end" fontSize="10.5" fontWeight="700" fill={wireColor(p)}>{short(p.pin, 8)}</text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
