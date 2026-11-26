/** Misiones del simulador EV3: cada una trae su tapete, objetivo, guía y logro. */
import { LegoMotor, Tapete } from './engine'
import { CSS } from './colores'

export interface Mision {
  id: string
  emoji: string
  titulo: string
  nivel: 'Fácil' | 'Medio' | 'Reto'
  objetivo: string
  pista: string[]
  tapete: Tapete
  /** Se evalúa en cada tick; si devuelve true, la misión se marca como lograda. */
  logro: (m: LegoMotor) => boolean
}

const quieto = (m: LegoMotor) => Math.abs(m.vL) + Math.abs(m.vR) < 1
const CAMPO = 200

function base(obstaculos: Tapete['obstaculos'] = [], meta?: Tapete['meta'], inicio = { x: -80, z: 0, ang: 0 }, pintar?: Tapete['pintar']): Tapete {
  return { ancho: CAMPO, alto: CAMPO, colorPiso: '#eef2f7', obstaculos, meta, inicio, pintar }
}

export const MISIONES_EV3: Mision[] = [
  {
    id: 'libre', emoji: '🧪', titulo: 'Modo libre', nivel: 'Fácil',
    objetivo: 'Experimenta: programa el robot y míralo moverse por el campo.',
    pista: ['Arrastra bloques desde «Motores» debajo de «▶ al empezar».', 'Pulsa ▶ Ejecutar y observa el robot.', 'Prueba los sensores y los bucles.'],
    tapete: base([], undefined, { x: 0, z: 0, ang: 0 }),
    logro: () => false,
  },
  {
    id: 'linea', emoji: '🎨', titulo: 'Detente en la línea', nivel: 'Fácil',
    objetivo: 'Avanza y detente justo sobre la línea negra usando el sensor de color.',
    pista: [
      'Usa «por siempre».',
      'Dentro: «avanzar» un poco y un «si ¿el color es Negro?» → «detener motores».',
      'Truco: avanza en modo «segundos» con un valor pequeño, o usa «esperar hasta ¿color es Negro?» y luego «detener».',
    ],
    tapete: base([], { x: 40, z: 0, r: 14 }, { x: -80, z: 0, ang: 0 }, ctx => {
      ctx.fillStyle = CSS.negro
      ctx.fillRect(32, -CAMPO / 2, 16, CAMPO) // banda negra vertical en x≈40
    }),
    logro: m => m.enMeta() && quieto(m) && m.color() === 'negro',
  },
  {
    id: 'muro', emoji: '🧱', titulo: 'Frena antes del muro', nivel: 'Medio',
    objetivo: 'Acércate al muro y detente antes de chocar, usando el sensor de distancia.',
    pista: [
      'Usa «esperar hasta ¿obstáculo a menos de 20 cm?» y luego «detener motores».',
      'O un «por siempre» con «si ¿obstáculo a menos de 20 cm? → detener».',
      'No toques el muro: si chocas, no cuenta.',
    ],
    tapete: base([{ x: 70, z: 0, r: 18, color: '#b45309' }], { x: 30, z: 0, r: 16 }, { x: -80, z: 0, ang: 0 }),
    logro: m => m.enMeta() && !m.tocando && quieto(m),
  },
  {
    id: 'slalom', emoji: '🚧', titulo: 'Slalom a la meta', nivel: 'Reto',
    objetivo: 'Esquiva los conos y llega a la zona meta verde.',
    pista: [
      'Combina «avanzar» y «girar a la derecha/izquierda X grados».',
      'Puedes usar «¿obstáculo a menos de X cm?» para decidir cuándo girar.',
      'Llega al círculo verde sin chocar.',
    ],
    tapete: base(
      [{ x: -20, z: -22, r: 12 }, { x: 25, z: 22, r: 12 }, { x: 60, z: -20, r: 12 }],
      { x: 85, z: 10, r: 14 }, { x: -85, z: 10, ang: 0 },
    ),
    logro: m => m.enMeta(),
  },
  {
    id: 'aparca', emoji: '🅿️', titulo: 'Gira y aparca', nivel: 'Medio',
    objetivo: 'Avanza, gira y estaciona dentro de la zona marcada.',
    pista: [
      'Avanza una distancia, luego «girar a la derecha 90 grados».',
      'Vuelve a avanzar hasta entrar en la zona.',
      'Ajusta los grados y las distancias hasta encajar.',
    ],
    tapete: base([], { x: 50, z: 55, r: 15 }, { x: -70, z: -40, ang: 0 }, ctx => {
      ctx.strokeStyle = CSS.amarillo; ctx.lineWidth = 3
      ctx.strokeRect(50 - 16, 55 - 16, 32, 32)
    }),
    logro: m => m.enMeta() && quieto(m),
  },
]
