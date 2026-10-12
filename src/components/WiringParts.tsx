// Dibujos de las piezas del diagrama de conexiones (LED, pulsador, sensores,
// servo…). WiringDiagram elige el dibujo según el nombre de la pieza.
//
// Reglas de dibujo:
//  - Toda pieza se dibuja con sus patas hacia la izquierda: la pata j termina
//    en el punto (0, ys[j]), que es donde llega su cable.
//  - Las patas se ordenan como en la pieza real (por ejemplo el HC-SR04 es
//    VCC, Trig, Echo, GND), no como estén escritas en la tabla.
//  - Una pieza que no se reconoce se dibuja como un módulo genérico.

type Draw = (ys: number[], name: string) => JSX.Element

export interface WiringPart {
  /** Orden real de las patas: la primera expresión que coincide con el nombre de la pata da su posición. */
  order: RegExp[]
  draw: Draw
}

const METAL = '#B8BEC9'
const GOLD = '#D4A84B'
const DARK = '#1F2937'

const span = (ys: number[]) => {
  const a = ys[0]
  const b = ys[ys.length - 1]
  return { a, b, m: (a + b) / 2 }
}

// Patas metálicas sueltas (LED, pulsador, potenciómetro…)
const Legs = ({ ys, to }: { ys: number[]; to: number }) => (
  <>
    {ys.map(y => <line key={y} x1={0} y1={y} x2={to} y2={y} stroke={METAL} strokeWidth="3" strokeLinecap="round" />)}
  </>
)

// Tira de pines de un módulo; la placa del módulo empieza en x = 20
const Header = ({ ys }: { ys: number[] }) => {
  const { a, b } = span(ys)
  return (
    <>
      {ys.map(y => <rect key={y} x={0} y={y - 2.5} width="16" height="5" rx="1" fill={GOLD} />)}
      <rect x={12} y={a - 10} width="10" height={b - a + 20} rx="2" fill={DARK} />
    </>
  )
}

const Trimpot = ({ x, y }: { x: number; y: number }) => (
  <>
    <rect x={x - 11} y={y - 11} width="22" height="22" rx="3" fill="#2563EB" stroke="#93C5FD" />
    <circle cx={x} cy={y} r="6" fill="#E2E8F0" />
    <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke="#64748B" strokeWidth="1.5" />
    <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke="#64748B" strokeWidth="1.5" />
  </>
)

const LED_COLORS: [RegExp, { main: string; dark: string }][] = [
  [/VERDE|CONFIRMA|\bOK\b/, { main: '#22C55E', dark: '#15803D' }],
  [/AMARILLO/, { main: '#FACC15', dark: '#CA8A04' }],
  [/AZUL/, { main: '#3B82F6', dark: '#1D4ED8' }],
  [/BLANCO|LAMPARA|LUZ/, { main: '#FDE68A', dark: '#D97706' }],
]
const ledColor = (name: string) => LED_COLORS.find(([re]) => re.test(name))?.[1] || { main: '#EF4444', dark: '#B91C1C' }

const led: Draw = (ys, name) => {
  const { m } = span(ys)
  const c = ledColor(name)
  return (
    <g>
      <Legs ys={ys} to={58} />
      <rect x={54} y={m - 23} width="7" height="46" rx="2" fill={c.dark} />
      <path d={`M60,${m - 19} H82 a19,19 0 0 1 0,38 H60 Z`} fill={c.main} />
      <path d={`M66,${m - 12} H82 a12,12 0 0 1 9,4`} fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

const buzzer: Draw = ys => {
  const { m } = span(ys)
  return (
    <g>
      <Legs ys={ys} to={60} />
      <circle cx={84} cy={m} r="27" fill={DARK} />
      <circle cx={84} cy={m} r="20" fill="none" stroke="#4B5563" strokeWidth="2" />
      <circle cx={84} cy={m} r="5" fill="#0B1220" />
      <text x={84} y={m - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#9CA3AF">+</text>
    </g>
  )
}

const button: Draw = ys => {
  const { a, b, m } = span(ys)
  return (
    <g>
      <Legs ys={ys} to={60} />
      {[a, b].map(y => <line key={y} x1={102} y1={y} x2={114} y2={y} stroke={METAL} strokeWidth="3" strokeLinecap="round" />)}
      <rect x={56} y={m - 24} width="48" height="48" rx="6" fill="#2B3038" />
      {[[-17, -17], [17, -17], [-17, 17], [17, 17]].map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} cx={80 + dx} cy={m + dy} r="2.5" fill="#6B7280" />
      ))}
      <circle cx={80} cy={m} r="15" fill="#E57361" stroke="#B4513F" strokeWidth="2" />
      <path d={`M71,${m - 5} a11,11 0 0 1 12,-6`} fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

const pot: Draw = ys => {
  const { m } = span(ys)
  return (
    <g>
      <Legs ys={ys} to={52} />
      <rect x={46} y={m - 32} width="16" height="64" rx="3" fill="#475569" />
      <circle cx={94} cy={m} r="34" fill="#94A3B8" stroke="#64748B" strokeWidth="2" />
      <circle cx={94} cy={m} r="21" fill={DARK} />
      <line x1={94} y1={m} x2={107} y2={m - 13} stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  )
}

// Cable del servo: café (GND), rojo (5V) y naranja (señal)
const SERVO_WIRES = ['#7C4A1E', '#DC2626', '#F59E0B']
const servo: Draw = ys => {
  const { a, b, m } = span(ys)
  return (
    <g>
      {ys.map((y, j) => {
        const end = m + (j - (ys.length - 1) / 2) * 5
        return (
          <path key={y} d={`M18,${y} C44,${y} 40,${end} 66,${end}`} fill="none"
            stroke={ys.length === 3 ? SERVO_WIRES[j] : '#64748B'} strokeWidth="4" strokeLinecap="round" />
        )
      })}
      <rect x={0} y={a - 10} width="20" height={b - a + 20} rx="2" fill={DARK} />
      {ys.map(y => <circle key={y} cx={7} cy={y} r="2.5" fill={GOLD} />)}
      <rect x={60} y={m - 9} width="96" height="9" rx="2" fill="#1D4ED8" />
      <rect x={70} y={m - 22} width="76" height="50" rx="5" fill="#2563EB" />
      <rect x={116} y={m - 31} width="16" height="10" rx="2" fill="#1E40AF" />
      <rect x={96} y={m - 39} width="58" height="8" rx="4" fill="#F8FAFC" stroke="#94A3B8" />
      <circle cx={124} cy={m - 35} r="2" fill="#64748B" />
      <text x={108} y={m + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">SG90</text>
    </g>
  )
}

const sonar: Draw = ys => {
  const { a, b, m } = span(ys)
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={a - 16} width="78" height={b - a + 32} rx="5" fill="#1D4ED8" />
      {[m - 25, m + 25].map(cy => (
        <g key={cy}>
          <circle cx={64} cy={cy} r="22" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" />
          <circle cx={64} cy={cy} r="16" fill="#111827" />
          <circle cx={64} cy={cy} r="9" fill="none" stroke="#374151" strokeWidth="2" />
        </g>
      ))}
      <rect x={28} y={m - 4} width="12" height="8" rx="4" fill="#CBD5E1" />
    </g>
  )
}

const relay: Draw = ys => {
  const { a, b, m } = span(ys)
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={a - 14} width="136" height={b - a + 28} rx="5" fill="#1E3A8A" />
      <circle cx={34} cy={a - 3} r="3" fill="#EF4444" />
      <rect x={30} y={m + 6} width="16" height="12" rx="2" fill="#111827" />
      <rect x={56} y={m - 27} width="58" height="54" rx="4" fill="#3B82F6" />
      <rect x={56} y={m - 27} width="58" height="10" rx="4" fill="#60A5FA" />
      <text x={85} y={m + 7} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#FFFFFF">RELÉ</text>
      <rect x={124} y={m - 30} width="24" height="60" rx="3" fill="#16A34A" />
      {[m - 20, m, m + 20].map(cy => (
        <g key={cy}>
          <circle cx={136} cy={cy} r="6" fill="#D1D5DB" />
          <line x1={132} y1={cy} x2={140} y2={cy} stroke="#6B7280" strokeWidth="1.5" />
        </g>
      ))}
    </g>
  )
}

const pump: Draw = ys => {
  const { m } = span(ys)
  const colors = ['#DC2626', '#111827']
  return (
    <g>
      {ys.map((y, j) => (
        <path key={y} d={`M0,${y} C26,${y} 22,${m + (j ? 5 : -5)} 46,${m + (j ? 5 : -5)}`} fill="none"
          stroke={colors[j] || '#64748B'} strokeWidth="3.5" strokeLinecap="round" />
      ))}
      <rect x={44} y={m - 22} width="72" height="44" rx="10" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      <rect x={44} y={m - 22} width="18" height="44" rx="8" fill="#94A3B8" />
      <rect x={114} y={m - 7} width="22" height="14" rx="3" fill="#CBD5E1" stroke="#94A3B8" />
      <text x={88} y={m + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">BOMBA</text>
      <path d={`M150,${m - 11} c6,8 8,12 8,15 a8,8 0 0 1 -16,0 c0,-3 2,-7 8,-15 z`} fill="#38BDF8" />
    </g>
  )
}

const lcd: Draw = ys => {
  const { a, b, m } = span(ys)
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={a - 18} width="150" height={b - a + 36} rx="5" fill="#15803D" />
      <rect x={30} y={m - 36} width="130" height="72" rx="3" fill="#111827" />
      <rect x={36} y={m - 28} width="118" height="56" rx="2" fill="#1D4ED8" />
      <text x={43} y={m - 5} fontSize="12" fontFamily="ui-monospace, Menlo, Consolas, monospace" fill="#E0F2FE">Hola, mundo!</text>
      <text x={43} y={m + 15} fontSize="12" fontFamily="ui-monospace, Menlo, Consolas, monospace" fill="#E0F2FE">ChaskiBots</text>
    </g>
  )
}

const dht: Draw = ys => {
  const { a, b } = span(ys)
  const top = a - 10
  const h = b - a + 20
  const rows = Math.max(2, Math.floor((h - 10) / 14))
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={a - 12} width="46" height={b - a + 24} rx="4" fill="#1E3A8A" />
      <rect x={52} y={top} width="72" height={h} rx="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
      {Array.from({ length: rows }).map((_, r) =>
        [0, 1, 2, 3].map(c => (
          <rect key={`${r}${c}`} x={62 + c * 14} y={top + (h - rows * 14) / 2 + r * 14 + 3} width="8" height="8" rx="2" fill="#0C4A6E" opacity="0.75" />
        ))
      )}
    </g>
  )
}

const pir: Draw = ys => {
  const { m } = span(ys)
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={m - 42} width="96" height="84" rx="6" fill="#166534" />
      <circle cx={70} cy={m} r="35" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
      <circle cx={70} cy={m} r="23" fill="none" stroke="#E2E8F0" strokeWidth="2" />
      <circle cx={70} cy={m} r="11" fill="none" stroke="#E2E8F0" strokeWidth="2" />
      {[0, 60, 120].map(deg => (
        <line key={deg} x1={70 - 35} y1={m} x2={70 + 35} y2={m} stroke="#E2E8F0" strokeWidth="1.5" transform={`rotate(${deg} 70 ${m})`} />
      ))}
    </g>
  )
}

const ir: Draw = ys => {
  const { a, b, m } = span(ys)
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={a - 8} width="112" height={b - a + 16} rx="4" fill="#1E40AF" />
      <Trimpot x={52} y={m} />
      <rect x={78} y={m - 9} width="28" height="18" rx="2" fill="#111827" />
      <path d={`M132,${a - 3} h14 a8,8 0 0 1 0,16 h-14 z`} fill="#E0F2FE" stroke="#94A3B8" />
      <path d={`M132,${b - 13} h14 a8,8 0 0 1 0,16 h-14 z`} fill="#111827" />
    </g>
  )
}

const soil: Draw = ys => {
  const { a, b } = span(ys)
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={a - 8} width="44" height={b - a + 16} rx="4" fill="#111827" />
      {[a - 8, b - 16].map(y => (
        <g key={y}>
          <path d={`M60,${y} H148 l18,12 l-18,12 H60 Z`} fill="#111827" />
          <line x1={66} y1={y + 12} x2={148} y2={y + 12} stroke={GOLD} strokeWidth="7" strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

const LdrDisc = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <>
    <circle cx={x} cy={y} r={r} fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
    <path d={`M${x - r + 5},${y - 6} H${x + r - 5} V${y - 1} H${x - r + 5} V${y + 4} H${x + r - 5}`} fill="none" stroke="#7C2D12" strokeWidth="1.8" strokeLinejoin="round" />
  </>
)

const ldrModule: Draw = ys => {
  const { a, b, m } = span(ys)
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={a - 8} width="96" height={b - a + 16} rx="4" fill="#1E40AF" />
      <Trimpot x={50} y={m} />
      <rect x={74} y={m - 8} width="26" height="16" rx="2" fill="#111827" />
      {[m - 6, m + 6].map(y => <line key={y} x1={116} y1={y} x2={126} y2={y} stroke={METAL} strokeWidth="2.5" />)}
      <LdrDisc x={140} y={m} r={16} />
    </g>
  )
}

// LDR suelto con su resistencia en serie (divisor): la LDR va entre la pata de
// arriba y la del medio; la resistencia, entre la del medio y la de abajo.
const ldr: Draw = (ys, name) => {
  if (ys.length !== 3) {
    const { m } = span(ys)
    return (
      <g>
        <Legs ys={ys} to={70} />
        <LdrDisc x={88} y={m} r={20} />
      </g>
    )
  }
  const [top, mid, bottom] = ys
  const r = name.match(/R\s?(\d+(?:[.,]\d+)?)\s?K/i)
  return (
    <g>
      <Legs ys={[top, mid]} to={104} />
      <Legs ys={[bottom]} to={72} />
      <line x1={72} y1={mid} x2={72} y2={bottom} stroke={METAL} strokeWidth="3" strokeLinecap="round" />
      <circle cx={72} cy={mid} r="3.5" fill="#64748B" />
      <rect x={66} y={(mid + bottom) / 2 - 8} width="12" height="16" rx="3" fill="#F3E3B8" stroke="#8A6D2F" strokeWidth="1.2" />
      <text x={84} y={(mid + bottom) / 2 + 3.5} fontSize="9" fontWeight="700" fill="#78350F">{r ? `${r[1]} kΩ` : 'R'}</text>
      <LdrDisc x={122} y={(top + mid) / 2} r={19} />
      <text x={122} y={bottom + 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#B45309">LDR</text>
    </g>
  )
}

const generic: Draw = ys => {
  const { a, b, m } = span(ys)
  return (
    <g>
      <Header ys={ys} />
      <rect x={20} y={a - 12} width="104" height={b - a + 24} rx="5" fill="#0F766E" />
      <rect x={54} y={m - 9} width="36" height="18" rx="2" fill="#111827" />
    </g>
  )
}

const PARTS: [RegExp, WiringPart][] = [
  [/\bLEDS?\b/, { order: [/[aá]nodo|\+/i, /c[aá]todo|-/i], draw: led }],
  [/BUZZER|ZUMBADOR/, { order: [/\+/, /-/], draw: buzzer }],
  [/PULSADOR|BOTON/, { order: [], draw: button }],
  [/POTENCI/, { order: [/\bA\b/i, /wiper|cursor|medio/i, /\bB\b/i], draw: pot }],
  [/SERVO/, { order: [/gnd|-/i, /vcc|5v|\+/i, /se[ñn]al|pwm|sig/i], draw: servo }],
  [/SR04|ULTRAS/, { order: [/vcc/i, /trig/i, /echo/i, /gnd/i], draw: sonar }],
  [/RELE/, { order: [/vcc/i, /gnd/i, /\bin\b/i], draw: relay }],
  [/BOMBA/, { order: [/\+/, /-/], draw: pump }],
  [/LCD/, { order: [/gnd/i, /vcc/i, /sda/i, /scl/i], draw: lcd }],
  [/DHT/, { order: [/vcc|\+/i, /data|out/i, /gnd|-/i], draw: dht }],
  [/\bPIR\b/, { order: [/vcc/i, /out/i, /gnd/i], draw: pir }],
  [/\bIR\b|FC-?51/, { order: [/out/i, /gnd/i, /vcc/i], draw: ir }],
  [/HUMEDAD|NIVEL/, { order: [/out/i, /gnd/i, /vcc/i], draw: soil }],
  [/LDR.*MODULO/, { order: [/vcc/i, /gnd/i, /out/i], draw: ldrModule }],
  [/LDR|FOTORRESIST/, { order: [/superior/i, /medio/i, /inferior/i], draw: ldr }],
]

export function partFor(name: string): WiringPart {
  const n = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
  return PARTS.find(([re]) => re.test(n))?.[1] || { order: [], draw: generic }
}

/** Ordena las patas como están en la pieza real; las que no se reconocen quedan al final, en su orden. */
export function sortPins<T extends { pinComponente: string }>(part: WiringPart, pins: T[]): T[] {
  const rank = (p: T) => {
    const k = part.order.findIndex(re => re.test(p.pinComponente))
    return k < 0 ? part.order.length : k
  }
  return pins.map((p, i) => ({ p, i, r: rank(p) })).sort((x, y) => x.r - y.r || x.i - y.i).map(x => x.p)
}

export const PART_WIDTH = 172
