import { pinoutForBoard, normalizePin, isPowerPin, isGroundPin } from '@/lib/boardPinouts'
import { partFor, sortPins, PART_WIDTH } from './WiringParts'

// Diagrama de conexiones generado a partir de la tabla de conexiones del
// proyecto (no es una imagen fija: si cambia un pin, el dibujo cambia).
//
// Reglas de dibujo:
//  - La placa muestra sus pines en la posición real.
//  - 5V/3V3 y GND llegan a la tira de alimentación de la protoboard; cada
//    pieza toma corriente de un agujero de esa tira con un cable corto,
//    como se arma de verdad. Ningún cable se divide en dos.
//  - Un cable nunca se une a otro: sale de un pin y termina en un punto.
//  - Cada cable de señal tiene su propio color y su propio carril: dos
//    cables nunca van uno encima de otro, solo se cruzan en ángulo recto.
//  - Los pines de la placa y las filas de las piezas están en rejillas
//    desfasadas media fila, así un tramo horizontal nunca cae sobre otro.
//  - Lo que no se conecta a la placa (por ejemplo la bomba, que va al relé)
//    se muestra como texto en la pieza, sin inventar un pin ni un cable.
//  - Cada pieza se dibuja como es (WiringParts) y el cable llega a su pata.

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
// Tramo final del cable, donde va escrito el nombre de la pata
const LEAD = 150
const ROW = PITCH

const resistorOf = (c: WiringConnection): string | null => {
  const m = `${c.pinComponente} ${c.nota || ''}`.match(/v[ií]a\s+R\s?(\d+(?:[.,]\d+)?\s?k?)\b|v[ií]a\s+(\d+(?:[.,]\d+)?\s?k?)\s?(?:Ω|ohm)/i)
  if (!m) return null
  const v = (m[1] || m[2]).replace(/\s/g, '').toLowerCase()
  return `${v.replace('k', ' k')}${v.includes('k') ? 'Ω' : ' Ω'}`
}
const short = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s)
// Quita la resistencia (se dibuja aparte) y las aclaraciones largas entre paréntesis; "(+)" y "(-)" se quedan.
const cleanPinLabel = (s: string, max = 18) =>
  short(s.replace(/\s*v[ií]a\s+R?\s?\d+\s?k?(?:Ω|ohm)?/i, '').replace(/\s*\([^)]{3,}\)/g, '').trim(), max)

export default function WiringDiagram({ boardName, conexiones, resaltar = [], rieles = [] }: Props) {
  const base = pinoutForBoard(boardName)
  const known = new Set([...base.left, ...base.right])
  // 5V y VIN son el mismo pin en las placas que solo traen uno de los dos.
  const resolve = (raw: string) => {
    const p = normalizePin(raw)
    if (p === '5V' && !known.has('5V') && known.has('VIN')) return 'VIN'
    if (p === 'VIN' && !known.has('VIN') && known.has('5V')) return '5V'
    return p
  }
  const all = conexiones.map((c, i) => ({ ...c, i, pin: resolve(c.pinPlaca) }))
  // Solo se dibuja cable hacia pines que la placa tiene de verdad.
  const conns = all.filter(c => known.has(c.pin))
  const left = base.left
  const right = base.right

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
  const compNames = Array.from(new Set(all.map(c => c.componente)))
  const signal = conns.filter(c => !isPowerPin(c.pin) && !isGroundPin(c.pin))
  const railPins = Array.from(new Set(conns.filter(c => isPowerPin(c.pin) || isGroundPin(c.pin)).map(c => c.pin)))
    .sort((a, b) => Number(isGroundPin(a)) - Number(isGroundPin(b)))

  const laneX0 = BX + BW + 46
  const railX0 = laneX0 + signal.length * 14 + 28
  const railX = (pin: string) => railX0 + railPins.indexOf(pin) * 26
  const compX = railX0 + Math.max(railPins.length, 1) * 26 + 60

  // Piezas apiladas a la derecha, cada una con sus patas en el orden real
  const pinX = compX + LEAD
  let cursor = BOARD_TOP - 4
  const cards = compNames.map(name => {
    const part = partFor(name)
    const pins = sortPins(part, all.filter(c => c.componente === name))
    const h = 44 + pins.length * ROW
    const card = { name, y: cursor, h, pins, part }
    cursor += h + 28
    return card
  })
  const targetY = new Map<number, number>()
  for (const card of cards) card.pins.forEach((p, j) => targetY.set(p.i, card.y + 44 + j * ROW + ROW / 2))

  // Cables que salen del lado izquierdo de la placa: rodean la placa por abajo. El pin más bajo usa el canal
  // más pegado a la placa y los de arriba lo envuelven, así no se cruzan entre ellos.
  const leftKeys = [
    ...signal.filter(c => locate(c.pin).side === 'left').map(c => ({ key: `s${c.i}`, y: locate(c.pin).y })),
    ...railPins.filter(p => locate(p).side === 'left').map(p => ({ key: `r${p}`, y: locate(p).y })),
  ].sort((a, b) => b.y - a.y).map(k => k.key)
  const leftRoute = (key: string) => {
    const k = leftKeys.indexOf(key)
    return { x: BX - 22 - k * 10, y: boardBottom + 18 + k * PITCH }
  }

  // Carriles de señal: el cable que sale más arriba y baja usa el carril más alejado, para no cruzarse con los demás.
  // Un cable que viene del lado izquierdo llega desde abajo de la placa.
  const src = (c: typeof conns[number]) => locate(c.pin)
  const fromY = (c: typeof conns[number]) => (src(c).side === 'left' ? leftRoute(`s${c.i}`).y : src(c).y)
  const down = signal.filter(c => targetY.get(c.i)! >= fromY(c)).sort((a, b) => fromY(a) - fromY(b))
  const up = signal.filter(c => targetY.get(c.i)! < fromY(c)).sort((a, b) => fromY(b) - fromY(a))
  const laneOrder = [...down, ...up]
  const laneX = (i: number) => laneX0 + (signal.length - 1 - laneOrder.findIndex(c => c.i === i)) * 14

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
    if (s.side === 'right') return `M${BX + BW},${s.y} H${lx} V${ty} H${pinX}`
    const r = leftRoute(`s${c.i}`)
    return `M${BX},${s.y} H${r.x} V${r.y} H${lx} V${ty} H${pinX}`
  }
  // Cable de la placa a la protoboard: termina en un agujero de su fila.
  const railFeeds = railPins.map(pin => {
    const s = locate(pin)
    const x = railX(pin)
    if (s.side === 'right') return { pin, d: `M${BX + BW},${s.y} H${x}`, joinY: s.y }
    const r = leftRoute(`r${pin}`)
    return { pin, d: `M${BX},${s.y} H${r.x} V${r.y} H${x}`, joinY: r.y }
  })

  // Protoboard: una tira con agujeros de arriba a abajo. Los cables terminan en un agujero; ninguno se divide.
  const stripTop = BOARD_TOP - 26
  const stripBottom = Math.max(boardBottom + 10 + leftKeys.length * PITCH, cursor - 20)
  const stripX1 = railX0 - 18
  const stripX2 = railX0 + (Math.max(railPins.length, 1) - 1) * 26 + 16
  const holes: number[] = []
  for (let y = BOARD_TOP + 16; y <= stripBottom - 8; y += PITCH / 2) holes.push(y)

  const W = pinX + PART_WIDTH + 14
  const H = stripBottom + 14
  const usedPins = new Set(conns.map(c => c.pin))
  const dim = 0.13

  // Un cable nunca se une a otro: empieza en un pin y termina en un punto. Donde dos se cruzan, solo se cruzan.
  const Wire = ({ d, color, strong }: { d: string; color: string; strong: boolean }) => (
    <path d={d} fill="none" stroke={color} strokeWidth={strong ? 4.5 : 3} strokeLinecap="round" strokeLinejoin="round" />
  )

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Diagrama de conexiones" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <rect x="0" y="0" width={W} height={H} rx="18" fill="#FFFFFF" />

      {/* Protoboard: tira de alimentación */}
      {railPins.length > 0 && (
        <g>
          <text x={(stripX1 + stripX2) / 2} y={stripTop - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="#94A3B8">Protoboard</text>
          <rect x={stripX1} y={stripTop} width={stripX2 - stripX1} height={stripBottom - stripTop} rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          {railPins.map(pin => {
            const x = railX(pin)
            const col = isGroundPin(pin) ? GROUND : POWER
            return (
              <g key={pin}>
                <text x={x - 2} y={stripTop + 17} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={col} opacity={railOn(pin) ? 1 : 0.4}>{pin}</text>
                <line x1={x - 9} y1={stripTop + 26} x2={x - 9} y2={stripBottom - 8} stroke={col} strokeWidth="1.5" opacity="0.45" />
                {holes.map(y => <circle key={y} cx={x} cy={y} r="2.2" fill="#CBD5E1" />)}
              </g>
            )
          })}
        </g>
      )}

      {/* Cables de la placa a la protoboard */}
      {railFeeds.map(f => {
        const col = isGroundPin(f.pin) ? GROUND : POWER
        return (
          <g key={f.pin} opacity={railOn(f.pin) ? 1 : dim}>
            <Wire d={f.d} color={col} strong={railOn(f.pin) && focusing} />
            <circle cx={railX(f.pin)} cy={f.joinY} r="4.5" fill={col} stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )
      })}

      {/* Cables cortos de la protoboard a cada pieza */}
      {conns.filter(c => isPowerPin(c.pin) || isGroundPin(c.pin)).map(c => {
        const y = targetY.get(c.i)!
        const x = railX(c.pin)
        return (
          <g key={c.i} opacity={on(c.i) ? 1 : dim}>
            <Wire d={`M${x},${y} H${pinX}`} color={wireColor(c)} strong={on(c.i) && focusing} />
            <circle cx={x} cy={y} r="4.5" fill={wireColor(c)} stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )
      })}

      {/* Cables de señal */}
      {signal.map(c => (
        <g key={c.i} opacity={on(c.i) ? 1 : dim}>
          <Wire d={signalPath(c)} color={wireColor(c)} strong={on(c.i) && focusing} />
        </g>
      ))}

      {/* Resistencias dibujadas sobre su cable */}
      {conns.map(c => {
        const value = resistorOf(c)
        if (!value) return null
        const y = targetY.get(c.i)!
        const x = compX - 50
        return (
          <g key={`r${c.i}`} opacity={on(c.i) ? 1 : dim}>
            <rect x={x} y={y - 8} width="40" height="16" rx="5" fill="#F3E3B8" stroke="#8A6D2F" strokeWidth="1.2" />
            <text x={x + 20} y={y + 3.2} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#78350F">{value}</text>
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
        const top = card.y + 44
        return (
          <g key={card.name}>
            <text x={compX + 4} y={card.y + 26} fontSize="12.5" fontWeight="700" fill="#22252A" opacity={active ? 1 : 0.35}>{card.name}</text>
            <g transform={`translate(${pinX} ${top})`} opacity={active ? 1 : 0.3}>
              {card.part.draw(card.pins.map((_, j) => j * ROW + ROW / 2), card.name)}
            </g>
            {card.pins.map(p => {
              const y = targetY.get(p.i)!
              if (!known.has(p.pin)) {
                return (
                  <text key={p.i} x={compX + 4} y={y + 4} fontSize="10" fontStyle="italic" fill="#64748B" opacity={on(p.i) ? 1 : 0.4}>
                    {cleanPinLabel(p.pinComponente, 28)}
                  </text>
                )
              }
              return (
                <g key={p.i} opacity={on(p.i) ? 1 : 0.4}>
                  <text x={compX + 4} y={y - 6} fontSize="10" fill="#334155">{cleanPinLabel(p.pinComponente)}</text>
                  <text x={pinX - 6} y={y - 6} textAnchor="end" fontSize="10" fontWeight="700" fill={wireColor(p)}>{short(p.pin, 8)}</text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
