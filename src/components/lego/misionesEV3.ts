/**
 * Clases del simulador EV3, agrupadas en cursos. Cada actividad trae su tapete, el robot
 * con el que se resuelve, pistas, la condición de logro y un programa de solución que funciona
 * (se comprueba con la página de pruebas: ver README de scripts/ldraw).
 */
import { LegoMotor, Tapete } from './engine'
import { CSS } from './colores'
import {
  type Programa, programa, avanzar, retroceder, girar, tanque, encender, parar, esperar, porSiempre, repetir, esperarHasta, si, decir,
  esColor, lineaEs, luz, cerca, tactil, angulo, no, y, o, comparar, operar, variable, fijar,
} from './programasEV3'

export interface Mision {
  id: string
  curso: string
  emoji: string
  titulo: string
  nivel: 'Fácil' | 'Medio' | 'Reto'
  /** Robot (id de la guía de armado) con el que se resuelve. */
  robot: string
  objetivo: string
  pista: string[]
  tapete: Tapete
  /** Se evalúa mientras corre el programa; si devuelve true, la actividad queda lograda. */
  logro: (m: LegoMotor) => boolean
  /** Programa de ejemplo que resuelve la actividad. */
  solucion?: Programa
}

export const CURSOS = [
  { id: 'inicio', nombre: '1 · Primeros pasos', emoji: '🚀' },
  { id: 'sensores', nombre: '2 · Sensores', emoji: '📡' },
  { id: 'linea1', nombre: '3 · Seguidor de línea (1 sensor)', emoji: '〰️' },
  { id: 'linea2', nombre: '4 · Seguidor de 2 sensores', emoji: '👀' },
  { id: 'linea4', nombre: '5 · Seguidor de 4 sensores', emoji: '🏁' },
  { id: 'sumo', nombre: '6 · Sumo', emoji: '🥋' },
  { id: 'laberinto', nombre: '7 · Laberintos', emoji: '🧱' },
]

const CAMPO = 200
const VUELTA = 2 * Math.PI * 2.75 // cm que avanza el robot por cada rotación de rueda
/** Convierte centímetros a rotaciones de rueda (con 2 decimales). */
const rot = (cm: number) => Math.round(cm / VUELTA * 100) / 100

type Extra = Partial<Omit<Tapete, 'ancho' | 'alto' | 'inicio'>>
const campo = (inicio: Tapete['inicio'], extra: Extra = {}): Tapete =>
  ({ ancho: CAMPO, alto: CAMPO, colorPiso: '#eef2f7', obstaculos: [], inicio, ...extra })

type Ctx = CanvasRenderingContext2D
/** Dibuja una línea negra de pista (3 cm de ancho) con el trazo que arma `f`. */
const pista = (ctx: Ctx, f: (c: Ctx) => void, esquinas: CanvasLineJoin = 'round') => {
  ctx.strokeStyle = CSS.negro; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = esquinas
  ctx.beginPath(); f(ctx); ctx.stroke()
}
const franja = (ctx: Ctx, x: number, ancho = 8, color = CSS.negro) => { ctx.fillStyle = color; ctx.fillRect(x - ancho / 2, -CAMPO / 2, ancho, CAMPO) }

// Pista ovalada: dos rectas de 80 cm y dos medias vueltas de radio 40
const ovalo = (c: Ctx) => {
  c.moveTo(-40, 40); c.lineTo(40, 40); c.arc(40, 0, 40, Math.PI / 2, -Math.PI / 2, true)
  c.lineTo(-40, -40); c.arc(-40, 0, 40, -Math.PI / 2, Math.PI / 2, true); c.closePath()
}
const PUNTOS_OVALO = [{ x: 80, z: 0, r: 13 }, { x: 0, z: -40, r: 13 }, { x: -80, z: 0, r: 13 }, { x: -25, z: 40, r: 13 }]
const tapeteOvalo = () => campo({ x: -30, z: 40, ang: 0 }, { pintar: ctx => pista(ctx, ovalo), puntos: PUNTOS_OVALO })
const vueltaCompleta = (m: LegoMotor) => m.puntosHechos >= (m.tapete?.puntos?.length || 99)

// Ring de sumo: tarima negra con borde blanco, sin paredes alrededor
const RING = { x: 0, z: 0, r: 70 }
const sumo = (inicio: Tapete['inicio'], moviles: Tapete['moviles'] = []) => campo(inicio, {
  colorPiso: '#cbd5e1', paredes: false, ring: RING, moviles,
  pintar: ctx => {
    ctx.fillStyle = CSS.negro; ctx.beginPath(); ctx.arc(0, 0, RING.r, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = CSS.blanco; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, RING.r - 2.5, 0, Math.PI * 2); ctx.stroke()
  },
})
const todosFuera = (m: LegoMotor) => !m.caido && m.moviles.length > 0 && m.moviles.every(x => x.fuera)
const veBorde = () => o(lineaEs(1, 'blanco'), lineaEs(2, 'blanco'))
/**
 * Busca girando, embiste hasta el borde y retrocede: la estrategia básica de sumo.
 * Los sensores van 9 cm adelante del centro del robot: al ver el borde todavía queda tarima,
 * por eso empuja 0,3 s más antes de retroceder (así el rival sí termina de caer).
 */
const buscarYEmbestir = (potencia: number) => porSiempre(
  encender(25, -25), esperarHasta(cerca(150)),
  encender(potencia, potencia), esperarHasta(veBorde()), esperar(0.3),
  retroceder(60, 1.2, 'seg'),
)

// Figura en ocho: las dos mitades se cruzan en el centro casi en ángulo recto
const ocho = (c: Ctx) => {
  for (let i = 0; i <= 240; i++) {
    const t = i / 240 * Math.PI * 2
    const x = 70 * Math.sin(t), z = 40 * Math.sin(2 * t)
    if (i === 0) c.moveTo(x, z); else c.lineTo(x, z)
  }
}
/** Avanza hasta tener una pared a menos de 15 cm y se detiene. */
const hastaPared = () => [encender(40, 40), esperarHasta(cerca(15)), parar()]

// Seguidores
const seguir1 = () => porSiempre(si([[esColor('negro'), [encender(15, 50)]]], [encender(50, 15)]))
const seguir2 = (extra: [ReturnType<typeof esColor>, ReturnType<typeof parar>[]][] = []) => porSiempre(si([
  ...extra,
  [lineaEs(1, 'negro'), [encender(5, 45)]],
  [lineaEs(2, 'negro'), [encender(45, 5)]],
], [encender(45, 45)]))
/** 4 sensores: los de afuera (1 y 4) detectan esquinas y cruces; los de adentro (2 y 3) siguen la línea. */
const seguir4 = (primeroDerecha: boolean) => {
  const derecha: [ReturnType<typeof esColor>, ReturnType<typeof parar>[]] = [lineaEs(4, 'negro'), [avanzar(30, 0.6), girar('der', 90)]]
  const izquierda: [ReturnType<typeof esColor>, ReturnType<typeof parar>[]] = [lineaEs(1, 'negro'), [avanzar(30, 0.6), girar('izq', 90)]]
  return porSiempre(si([
    ...(primeroDerecha ? [derecha, izquierda] : [izquierda, derecha]),
    [lineaEs(2, 'negro'), [encender(15, 45)]],
    [lineaEs(3, 'negro'), [encender(45, 15)]],
  ], [encender(45, 45)]))
}

export const MISIONES_EV3: Mision[] = [
  // ───────────────────────────────────────────── 1 · Primeros pasos
  {
    id: 'libre', curso: 'inicio', emoji: '🧪', titulo: 'Modo libre', nivel: 'Fácil', robot: 'explorador',
    objetivo: 'Experimenta: programa el robot y míralo moverse por el campo.',
    pista: ['Arrastra bloques desde «Motores» debajo de «▶ al empezar».', 'Pulsa ▶ Ejecutar y observa el robot.', 'Prueba los sensores y los bucles.'],
    tapete: campo({ x: 0, z: 0, ang: 0 }),
    logro: () => false,
    solucion: programa([avanzar(50, 2), girar('der', 90), avanzar(50, 2), decir('¡Hola!', 2)]),
  },
  {
    id: 'meta', curso: 'inicio', emoji: '🎯', titulo: 'Llega a la meta', nivel: 'Fácil', robot: 'basico',
    objetivo: 'Avanza en línea recta y detente dentro del círculo verde.',
    pista: ['Un solo bloque basta: «avanzar potencia 50 por … rotaciones».', 'Cada rotación de rueda avanza unos 17 cm. La meta está a 120 cm.', 'Si te pasas o te quedas corto, cambia el número y vuelve a probar.'],
    tapete: campo({ x: -70, z: 0, ang: 0 }, { meta: { x: 50, z: 0, r: 14 } }),
    logro: m => m.enMeta() && m.quieto(),
    solucion: programa([avanzar(50, rot(120))]),
  },
  {
    id: 'ida_vuelta', curso: 'inicio', emoji: '↔️', titulo: 'Ida y vuelta', nivel: 'Fácil', robot: 'basico',
    objetivo: 'Llega hasta el punto azul, da media vuelta y regresa a la zona verde donde empezaste.',
    pista: ['Avanza hasta el punto azul (120 cm).', 'Gira 180 grados: media vuelta.', 'Avanza otra vez la misma distancia.'],
    tapete: campo({ x: -70, z: 0, ang: 0 }, { puntos: [{ x: 50, z: 0, r: 14 }], meta: { x: -70, z: 0, r: 14 } }),
    logro: m => m.puntosHechos >= 1 && m.enMeta() && m.quieto(),
    solucion: programa([avanzar(50, rot(120)), girar('der', 180), avanzar(50, rot(120))]),
  },
  {
    id: 'cuadrado', curso: 'inicio', emoji: '⬜', titulo: 'Dibuja un cuadrado', nivel: 'Medio', robot: 'basico',
    objetivo: 'Pasa por las cuatro esquinas (puntos azules) en orden, haciendo un cuadrado.',
    pista: ['Un cuadrado es lo mismo 4 veces: avanzar un lado y girar 90 grados.', 'Usa «repetir 4 veces» para no copiar los bloques.', 'Cada lado mide 80 cm.'],
    tapete: campo({ x: -40, z: -40, ang: 0 }, { puntos: [{ x: 40, z: -40, r: 13 }, { x: 40, z: 40, r: 13 }, { x: -40, z: 40, r: 13 }, { x: -40, z: -40, r: 13 }] }),
    logro: vueltaCompleta,
    solucion: programa([repetir(4, avanzar(50, rot(80)), girar('der', 90))]),
  },
  {
    id: 'aparca', curso: 'inicio', emoji: '🅿️', titulo: 'Gira y aparca', nivel: 'Medio', robot: 'explorador',
    objetivo: 'Avanza, gira y estaciona dentro de la zona marcada.',
    pista: ['Avanza una distancia, luego «girar a la derecha 90 grados».', 'Vuelve a avanzar hasta entrar en la zona.', 'Ajusta las distancias hasta encajar.'],
    tapete: campo({ x: -70, z: -40, ang: 0 }, {
      meta: { x: 50, z: 55, r: 15 },
      pintar: ctx => { ctx.strokeStyle = CSS.amarillo; ctx.lineWidth = 3; ctx.strokeRect(50 - 16, 55 - 16, 32, 32) },
    }),
    logro: m => m.enMeta() && m.quieto(),
    solucion: programa([avanzar(50, rot(120)), girar('der', 90), avanzar(50, rot(95))]),
  },
  {
    id: 'slalom', curso: 'inicio', emoji: '🚧', titulo: 'Slalom a la meta', nivel: 'Reto', robot: 'explorador',
    objetivo: 'Esquiva los conos y llega a la zona meta verde sin chocar.',
    pista: ['Combina «avanzar» y «girar» con ángulos de 45 grados.', 'Planea el camino antes: ¿por dónde cabe el robot?', 'Si chocas, no cuenta: ajusta las distancias.'],
    tapete: campo({ x: -85, z: 10, ang: 0 }, {
      obstaculos: [{ x: -20, z: -22, r: 12 }, { x: 25, z: 22, r: 12 }, { x: 60, z: -20, r: 12 }],
      meta: { x: 85, z: 10, r: 14 },
    }),
    logro: m => m.enMeta() && m.golpes === 0,
    solucion: programa([
      avanzar(50, rot(85)), girar('izq', 45), avanzar(50, rot(21)), girar('der', 45), avanzar(50, rot(20)),
      girar('der', 45), avanzar(50, rot(21)), girar('izq', 45), avanzar(50, rot(35)),
    ]),
  },

  {
    id: 'triangulo', curso: 'inicio', emoji: '🔺', titulo: 'Dibuja un triángulo', nivel: 'Medio', robot: 'basico',
    objetivo: 'Pasa por las tres esquinas del triángulo, en orden.',
    pista: ['Un triángulo de lados iguales se hace repitiendo 3 veces: avanzar y girar.', 'Ojo: el robot no gira 60 grados, gira 120 (lo que le falta para seguir el siguiente lado).', 'Cada lado mide 80 cm.'],
    tapete: campo({ x: -40, z: 30, ang: 0 }, { puntos: [{ x: 40, z: 30, r: 13 }, { x: 0, z: -39, r: 13 }, { x: -40, z: 30, r: 13 }] }),
    logro: vueltaCompleta,
    solucion: programa([repetir(3, avanzar(50, rot(80)), girar('izq', 120))]),
  },
  {
    id: 'escalera', curso: 'inicio', emoji: '🪜', titulo: 'Sube la escalera', nivel: 'Medio', robot: 'basico',
    objetivo: 'Sube en zigzag pasando por todos los puntos azules, como los peldaños de una escalera.',
    pista: ['Cada peldaño es: avanzar 50 cm, girar a la izquierda, avanzar 50 cm, girar a la derecha.', 'Repite el peldaño 2 veces y avanza una vez más.'],
    tapete: campo({ x: -80, z: 60, ang: 0 }, { puntos: [{ x: -30, z: 60, r: 12 }, { x: -30, z: 10, r: 12 }, { x: 20, z: 10, r: 12 }, { x: 20, z: -40, r: 12 }, { x: 70, z: -40, r: 12 }] }),
    logro: vueltaCompleta,
    solucion: programa([repetir(2, avanzar(50, rot(50)), girar('izq', 90), avanzar(50, rot(50)), girar('der', 90)), avanzar(50, rot(50))]),
  },
  {
    id: 'curva', curso: 'inicio', emoji: '↩️', titulo: 'Media vuelta en curva', nivel: 'Reto', robot: 'basico',
    objetivo: 'Rodea el muro haciendo una curva suave, sin usar el bloque «girar», y llega a la meta.',
    pista: ['Si un motor va más rápido que el otro, el robot avanza en curva.', 'Usa «motores izq … der … por … segundos»: izquierdo 40 y derecho 50.', 'Ajusta los segundos hasta que la curva termine en la meta.'],
    tapete: campo({ x: 0, z: 60, ang: 0 }, {
      muros: [{ x: -10, z: 6, w: 60, h: 30 }], puntos: [{ x: 54, z: 6, r: 13 }], meta: { x: 0, z: -48, r: 13 },
    }),
    logro: m => m.puntosHechos >= 1 && m.enMeta() && m.golpes === 0,
    solucion: programa([tanque(40, 50, 10.8)]),
  },
  // ───────────────────────────────────────────── 2 · Sensores
  {
    id: 'linea', curso: 'sensores', emoji: '🎨', titulo: 'Detente en la línea', nivel: 'Fácil', robot: 'explorador',
    objetivo: 'Avanza y detente justo cuando el sensor de color vea la franja negra.',
    pista: ['«encender motores» pone el robot a andar sin esperar.', 'Luego «esperar hasta ¿el color es Negro?».', 'Y al final «detener motores».'],
    tapete: campo({ x: -80, z: 0, ang: 0 }, { meta: { x: 31, z: 0, r: 13 }, pintar: ctx => franja(ctx, 40, 16) }),
    logro: m => m.enMeta() && m.quieto() && m.color() === 'negro',
    solucion: programa([encender(40, 40), esperarHasta(esColor('negro')), parar()]),
  },
  {
    id: 'cuenta_lineas', curso: 'sensores', emoji: '🔢', titulo: 'Detente en la tercera línea', nivel: 'Medio', robot: 'explorador',
    objetivo: 'Hay tres franjas negras. Pasa las dos primeras y detente sobre la tercera.',
    pista: ['Para «contar» una franja hay que esperar a verla y luego esperar a salir de ella.', 'Repite eso 2 veces.', 'A la tercera vez que veas negro, detén los motores.'],
    tapete: campo({ x: -80, z: 0, ang: 0 }, { meta: { x: 41, z: 0, r: 10 }, pintar: ctx => { franja(ctx, -30); franja(ctx, 10); franja(ctx, 50) } }),
    logro: m => m.enMeta() && m.quieto() && m.color() === 'negro',
    solucion: programa([
      encender(35, 35),
      repetir(2, esperarHasta(esColor('negro')), esperarHasta(no(esColor('negro')))),
      esperarHasta(esColor('negro')), parar(),
    ]),
  },
  {
    id: 'muro', curso: 'sensores', emoji: '📏', titulo: 'Frena antes del muro', nivel: 'Fácil', robot: 'explorador',
    objetivo: 'Acércate al obstáculo y detente antes de chocar, usando el sensor de distancia.',
    pista: ['Enciende los motores.', '«esperar hasta ¿obstáculo a menos de 20 cm?».', 'Detén los motores. Si chocas, no cuenta.'],
    tapete: campo({ x: -80, z: 0, ang: 0 }, { obstaculos: [{ x: 70, z: 0, r: 18, color: '#b45309' }], meta: { x: 30, z: 0, r: 16 } }),
    logro: m => m.enMeta() && m.golpes === 0 && m.quieto(),
    solucion: programa([encender(40, 40), esperarHasta(cerca(20)), parar()]),
  },
  {
    id: 'esquiva', curso: 'sensores', emoji: '↪️', titulo: 'Rodea el obstáculo', nivel: 'Medio', robot: 'explorador',
    objetivo: 'Avanza hasta ver el obstáculo, rodéalo y llega a la meta que está detrás.',
    pista: ['Avanza hasta que el obstáculo esté a menos de 15 cm.', 'Rodéalo haciendo una «U»: izquierda, avanzar, derecha, avanzar, derecha, avanzar, izquierda.', 'Termina avanzando hasta la meta.'],
    tapete: campo({ x: -80, z: 0, ang: 0 }, { obstaculos: [{ x: 0, z: 0, r: 14, color: '#b45309' }], meta: { x: 70, z: 0, r: 14 } }),
    logro: m => m.enMeta() && m.golpes === 0,
    solucion: programa([
      encender(40, 40), esperarHasta(cerca(15)), parar(),
      girar('izq', 90), avanzar(50, rot(40)), girar('der', 90), avanzar(50, rot(76)),
      girar('der', 90), avanzar(50, rot(40)), girar('izq', 90), avanzar(50, rot(32)),
    ]),
  },
  {
    id: 'toca_regresa', curso: 'sensores', emoji: '👆', titulo: 'Toca la pared y regresa', nivel: 'Fácil', robot: 'parachoques',
    objetivo: 'Avanza hasta que el parachoques toque la pared y regresa de espaldas a la zona verde.',
    pista: ['Enciende los motores y «esperar hasta ¿botón tocado?».', 'Luego retrocede la misma distancia que avanzaste (unos 127 cm).', 'Este robot usa el sensor táctil con su parachoques.'],
    tapete: campo({ x: -60, z: 0, ang: 0 }, { muros: [{ x: 80, z: 0, w: 10, h: 120, color: '#b45309' }], meta: { x: -60, z: 0, r: 14 } }),
    logro: m => m.golpes >= 1 && m.enMeta() && m.quieto(),
    solucion: programa([encender(50, 50), esperarHasta(tactil()), retroceder(50, rot(127))]),
  },
  {
    id: 'gira_giro', curso: 'sensores', emoji: '🧭', titulo: 'Media vuelta con giroscopio', nivel: 'Medio', robot: 'giroscopio',
    objetivo: 'Llega al punto azul, da media vuelta mirando el giroscopio y regresa a la zona verde.',
    pista: ['Avanza 80 cm hasta el punto azul.', 'Enciende los motores en sentidos contrarios (30 y −30) para girar sobre tu eje.', '«esperar hasta ángulo ≥ 180», detén los motores y regresa.'],
    tapete: campo({ x: -50, z: 0, ang: 0 }, { puntos: [{ x: 30, z: 0, r: 13 }], meta: { x: -50, z: 0, r: 14 } }),
    logro: m => m.puntosHechos >= 1 && m.enMeta() && m.quieto(),
    solucion: programa([
      avanzar(50, rot(80)), encender(30, -30), esperarHasta(comparar(angulo(), 'GTE', 180)), parar(), avanzar(50, rot(80)),
    ]),
  },

  {
    id: 'semaforo', curso: 'sensores', emoji: '🚦', titulo: 'Para en la franja roja', nivel: 'Fácil', robot: 'explorador',
    objetivo: 'Hay franjas de varios colores. Pasa de largo las negras y la verde y detente solo sobre la roja.',
    pista: ['El sensor de color distingue colores, no solo negro y blanco.', 'Enciende los motores y «esperar hasta ¿el color es Rojo?».', 'Detén los motores.'],
    tapete: campo({ x: -80, z: 0, ang: 0 }, {
      meta: { x: 41, z: 0, r: 10 },
      pintar: ctx => { franja(ctx, -40, 8, CSS.verde); franja(ctx, -10); franja(ctx, 20); franja(ctx, 50, 8, CSS.rojo) },
    }),
    logro: m => m.enMeta() && m.quieto() && m.color() === 'rojo',
    solucion: programa([encender(35, 35), esperarHasta(esColor('rojo')), parar()]),
  },
  {
    id: 'ronda', curso: 'sensores', emoji: '👁️', titulo: 'Ronda del guardián', nivel: 'Medio', robot: 'guardian',
    objetivo: 'Patrulla de pared a pared: llega cerca de una pared, da media vuelta y ve hasta la otra, sin chocar.',
    pista: ['Avanza hasta tener la pared a menos de 20 cm y detente.', 'Gira 180 grados.', 'Repite 2 veces.'],
    tapete: campo({ x: 0, z: 0, ang: 0 }, { puntos: [{ x: 68, z: 0, r: 13 }, { x: -68, z: 0, r: 13 }] }),
    logro: m => vueltaCompleta(m) && m.golpes === 0,
    solucion: programa([repetir(2, encender(40, 40), esperarHasta(cerca(20)), parar(), girar('der', 180))]),
  },
  {
    id: 'cuadrado_giro', curso: 'sensores', emoji: '🧭', titulo: 'Cuadrado con giroscopio', nivel: 'Reto', robot: 'giroscopio',
    objetivo: 'Haz un cuadrado, pero esta vez cada esquina la decide el giroscopio: gira hasta que marque 90, 180 y 270 grados.',
    pista: ['Avanza un lado (60 cm).', 'Enciende los motores 25 y −25 para girar y «esperar hasta ángulo ≥ 90». Detén.', 'Repite con 180 y con 270, y avanza el último lado.'],
    tapete: campo({ x: -30, z: -30, ang: 0 }, { puntos: [{ x: 30, z: -30, r: 12 }, { x: 30, z: 30, r: 12 }, { x: -30, z: 30, r: 12 }, { x: -30, z: -30, r: 12 }] }),
    logro: vueltaCompleta,
    solucion: programa([
      ...[90, 180, 270].flatMap(a => [avanzar(50, rot(60)), encender(25, -25), esperarHasta(comparar(angulo(), 'GTE', a)), parar()]),
      avanzar(50, rot(60)),
    ]),
  },
  // ───────────────────────────────────────────── 3 · Seguidor de 1 sensor
  {
    id: 'linea_s', curso: 'linea1', emoji: '〰️', titulo: 'Sigue la línea', nivel: 'Medio', robot: 'seguidor',
    objetivo: 'Sigue la línea negra hasta la meta. Con un solo sensor, el robot avanza en zigzag por el borde de la línea.',
    pista: ['Dentro de «por siempre» pon un «si … si no».', 'Si ve negro: gira un poco a la izquierda (motor izq 15, der 50).', 'Si no (ve blanco): gira un poco a la derecha (izq 50, der 15).'],
    tapete: campo({ x: -80, z: 20, ang: 0 }, {
      meta: { x: 80, z: -20, r: 13 },
      pintar: ctx => pista(ctx, c => { c.moveTo(-92, 20); c.lineTo(-60, 20); c.bezierCurveTo(-20, 20, -20, -20, 20, -20); c.lineTo(92, -20) }),
    }),
    logro: m => m.enMeta(),
    solucion: programa([seguir1()]),
  },
  {
    id: 'ovalo_1', curso: 'linea1', emoji: '⭕', titulo: 'Una vuelta al óvalo', nivel: 'Medio', robot: 'seguidor',
    objetivo: 'Da una vuelta completa a la pista ovalada siguiendo la línea.',
    pista: ['Es el mismo programa del zigzag: negro → izquierda, blanco → derecha.', 'Prueba distintas potencias: más diferencia = curvas más cerradas pero más lento.', 'Usa el botón de velocidad ×2 o ×4 para no esperar.'],
    tapete: tapeteOvalo(),
    logro: vueltaCompleta,
    solucion: programa([seguir1()]),
  },
  {
    id: 'proporcional', curso: 'linea1', emoji: '💡', titulo: 'Seguidor suave (proporcional)', nivel: 'Reto', robot: 'seguidor',
    objetivo: 'Da la vuelta al óvalo sin zigzaguear: usa la luz reflejada para corregir «un poquito» o «mucho» según haga falta.',
    pista: ['En el borde de la línea la luz reflejada vale cerca de 50.', 'Crea la variable «error» = luz reflejada − 50.', 'Motor izquierdo = 35 + error × 0.5 y motor derecho = 35 − error × 0.5.'],
    tapete: tapeteOvalo(),
    logro: vueltaCompleta,
    solucion: programa([porSiempre(
      fijar('error', operar(luz(1), 'MINUS', 50)),
      encender(operar(35, 'ADD', operar(variable('error'), 'MULTIPLY', 0.5)), operar(35, 'MINUS', operar(variable('error'), 'MULTIPLY', 0.5))),
    )], ['error']),
  },

  {
    id: 'linea_roja', curso: 'linea1', emoji: '🟥', titulo: 'Sigue la línea hasta la marca roja', nivel: 'Medio', robot: 'seguidor',
    objetivo: 'Sigue la línea negra y detente cuando el sensor vea la marca roja del final.',
    pista: ['Primero pregunta por el rojo: si el color es Rojo → detener motores.', 'Si no, si es Negro → gira a la izquierda. Si no → gira a la derecha.', 'Usa el engranaje azul del bloque «si» para agregarle un «si no si».'],
    tapete: campo({ x: -80, z: 20, ang: 0 }, {
      meta: { x: 60, z: -20, r: 12 },
      pintar: ctx => {
        pista(ctx, c => { c.moveTo(-92, 20); c.lineTo(-60, 20); c.bezierCurveTo(-20, 20, -20, -20, 20, -20); c.lineTo(66, -20) })
        ctx.fillStyle = CSS.rojo; ctx.fillRect(64, -27, 12, 14)
      },
    }),
    logro: m => m.enMeta() && m.quieto() && m.color() === 'rojo',
    solucion: programa([porSiempre(si([[esColor('rojo'), [parar()]], [esColor('negro'), [encender(15, 50)]]], [encender(50, 15)]))]),
  },
  // ───────────────────────────────────────────── 4 · Seguidor de 2 sensores
  {
    id: 'dos_ovalo', curso: 'linea2', emoji: '👀', titulo: 'Dos sensores: vuelta al óvalo', nivel: 'Medio', robot: 'seguidor2',
    objetivo: 'Con un sensor a cada lado de la línea, da la vuelta al óvalo. ¡Mira cuánto más rápido va!',
    pista: ['Si el sensor 1 (izquierdo) ve negro, la línea se fue a la izquierda: gira a la izquierda.', 'Si no, si el sensor 2 (derecho) ve negro: gira a la derecha.', 'Si no (los dos ven blanco): avanza recto.'],
    tapete: tapeteOvalo(),
    logro: vueltaCompleta,
    solucion: programa([seguir2()]),
  },
  {
    id: 'dos_s', curso: 'linea2', emoji: '🐍', titulo: 'Curvas en S', nivel: 'Medio', robot: 'seguidor2',
    objetivo: 'Sigue la pista con curvas a los dos lados hasta la meta.',
    pista: ['El mismo programa de dos sensores sirve para curvas a la izquierda y a la derecha.', 'Si el robot se sale en una curva, baja la potencia o haz el giro más fuerte.'],
    tapete: campo({ x: -82, z: 50, ang: 0 }, {
      meta: { x: 82, z: -50, r: 13 },
      pintar: ctx => pista(ctx, c => { c.moveTo(-92, 50); c.lineTo(-60, 50); c.bezierCurveTo(-20, 50, -40, 0, 0, 0); c.bezierCurveTo(40, 0, 20, -50, 60, -50); c.lineTo(92, -50) }),
    }),
    logro: m => m.enMeta(),
    solucion: programa([seguir2()]),
  },
  {
    id: 'dos_cruce', curso: 'linea2', emoji: '➕', titulo: 'Cruza las intersecciones', nivel: 'Reto', robot: 'seguidor2',
    objetivo: 'La pista tiene dos cruces. Pásalos de frente, sin desviarte, y llega a la meta.',
    pista: ['En un cruce los DOS sensores ven negro al mismo tiempo.', 'Agrega primero esa pregunta: si sensor 1 Y sensor 2 ven negro → avanza recto.', 'El orden de las preguntas importa: la del cruce va de primera.'],
    tapete: campo({ x: -82, z: 30, ang: 0 }, {
      meta: { x: 82, z: -10, r: 13 },
      pintar: ctx => {
        pista(ctx, c => { c.moveTo(-92, 30); c.lineTo(-50, 30); c.bezierCurveTo(-20, 30, -30, -10, 0, -10); c.lineTo(92, -10) })
        pista(ctx, c => { c.moveTo(25, -45); c.lineTo(25, 25) })
        pista(ctx, c => { c.moveTo(55, -45); c.lineTo(55, 25) })
      },
    }),
    logro: m => m.enMeta(),
    solucion: programa([seguir2([[y(lineaEs(1, 'negro'), lineaEs(2, 'negro')), [encender(45, 45)]]])]),
  },
  {
    id: 'dos_final', curso: 'linea2', emoji: '🛑', titulo: 'Detente en la marca final', nivel: 'Medio', robot: 'seguidor2',
    objetivo: 'Sigue la línea y detente sobre la barra negra del final.',
    pista: ['La barra del final es ancha: los dos sensores la ven a la vez.', 'Si sensor 1 Y sensor 2 ven negro → detener motores.', 'El resto es el seguidor de dos sensores.'],
    tapete: campo({ x: -82, z: -40, ang: 0 }, {
      meta: { x: 61, z: 30, r: 11 },
      pintar: ctx => {
        pista(ctx, c => { c.moveTo(-92, -40); c.lineTo(-40, -40); c.bezierCurveTo(0, -40, 0, 30, 40, 30); c.lineTo(70, 30) })
        ctx.fillStyle = CSS.negro; ctx.fillRect(68, 16, 6, 28)
      },
    }),
    logro: m => m.enMeta() && m.quieto(),
    solucion: programa([seguir2([[y(lineaEs(1, 'negro'), lineaEs(2, 'negro')), [parar()]]])]),
  },

  {
    id: 'dos_ocho', curso: 'linea2', emoji: '♾️', titulo: 'La pista en ocho', nivel: 'Reto', robot: 'seguidor2',
    objetivo: 'Recorre el ocho completo. En el centro la pista se cruza consigo misma: hay que pasar de frente.',
    pista: ['Es el seguidor de dos sensores con la regla del cruce.', 'Si los dos sensores ven negro a la vez → avanza recto.', 'Si te sales en las curvas, baja la potencia.'],
    tapete: campo({ x: 11, z: 13, ang: 46 }, {
      puntos: [{ x: 70, z: 0, r: 13 }, { x: -70, z: 0, r: 13 }, { x: 17, z: 19, r: 13 }],
      pintar: ctx => pista(ctx, ocho),
    }),
    logro: vueltaCompleta,
    solucion: programa([seguir2([[y(lineaEs(1, 'negro'), lineaEs(2, 'negro')), [encender(45, 45)]]])]),
  },
  {
    id: 'dos_obstaculo', curso: 'linea2', emoji: '⛔', titulo: 'Obstáculo en la pista', nivel: 'Medio', robot: 'seguidor2',
    objetivo: 'Sigue el óvalo, pero alguien dejó una caja sobre la línea. Detente antes de chocarla.',
    pista: ['Este robot también tiene sensor de distancia.', 'Pregunta primero: si hay un obstáculo a menos de 12 cm → detener motores.', 'Después van las preguntas del seguidor de dos sensores.'],
    tapete: campo({ x: -30, z: 40, ang: 0 }, {
      obstaculos: [{ x: -10, z: -40, r: 8, color: '#b45309', alto: 14 }], puntos: [{ x: 80, z: 0, r: 13 }], meta: { x: 19, z: -40, r: 9 },
      pintar: ctx => pista(ctx, ovalo),
    }),
    logro: m => m.puntosHechos >= 1 && m.enMeta() && m.quieto() && m.golpes === 0,
    solucion: programa([seguir2([[cerca(12), [parar()]]])]),
  },
  // ───────────────────────────────────────────── 5 · Seguidor de 4 sensores
  {
    id: 'cuatro_esquinas', curso: 'linea4', emoji: '📐', titulo: 'Esquinas de 90 grados', nivel: 'Reto', robot: 'seguidor4',
    objetivo: 'Da la vuelta a la pista rectangular. Las esquinas son tan cerradas que hacen falta los sensores de afuera.',
    pista: ['Los sensores 2 y 3 (los de adentro) siguen la línea como antes.', 'Si el sensor 1 (el de más a la izquierda) ve negro, hay una esquina: avanza 0.6 rotaciones (para que el centro del robot quede sobre la esquina) y gira 90 grados a la izquierda.', 'Haz lo mismo hacia la derecha con los sensores 4 y 3.'],
    tapete: campo({ x: -30, z: 45, ang: 0 }, {
      puntos: [{ x: 60, z: 0, r: 13 }, { x: 0, z: -45, r: 13 }, { x: -60, z: 0, r: 13 }, { x: -25, z: 45, r: 13 }],
      pintar: ctx => pista(ctx, c => { c.rect(-60, -45, 120, 90) }, 'miter'),
    }),
    logro: vueltaCompleta,
    solucion: programa([seguir4(false)]),
  },
  {
    id: 'cuatro_derecha', curso: 'linea4', emoji: '↘️', titulo: 'Toma el desvío', nivel: 'Reto', robot: 'seguidor4',
    objetivo: 'La pista se divide. Toma el camino de la derecha para llegar a la meta: el otro no lleva a ningún lado.',
    pista: ['El sensor 4 (el de más a la derecha) ve el desvío antes que nadie.', 'Pregunta primero por el sensor 4: así el robot siempre prefiere girar a la derecha.', 'Cuando lo vea: avanza 0.6 rotaciones (para que el centro del robot quede sobre el cruce) y gira 90 grados a la derecha.'],
    tapete: campo({ x: -82, z: -30, ang: 0 }, {
      meta: { x: 70, z: 50, r: 13 },
      pintar: ctx => {
        pista(ctx, c => { c.moveTo(-92, -30); c.lineTo(85, -30) }, 'miter')
        pista(ctx, c => { c.moveTo(0, -30); c.lineTo(0, 50); c.lineTo(80, 50) }, 'miter')
      },
    }),
    logro: m => m.enMeta(),
    solucion: programa([seguir4(true)]),
  },
  {
    id: 'cuatro_circuito', curso: 'linea4', emoji: '🏁', titulo: 'Circuito de competencia', nivel: 'Reto', robot: 'seguidor4',
    objetivo: 'Rectas, esquinas cerradas y curvas en una sola pista. Da la vuelta completa.',
    pista: ['Usa todo lo aprendido: sensores de adentro para seguir, sensores de afuera para las esquinas.', 'Cuando funcione, sube las potencias poco a poco: ¿cuál es tu mejor tiempo?'],
    tapete: campo({ x: -45, z: 60, ang: 0 }, {
      puntos: [{ x: 50, z: 35, r: 13 }, { x: 20, z: -55, r: 13 }, { x: -25, z: -65, r: 13 }, { x: -70, z: 0, r: 13 }, { x: -40, z: 60, r: 13 }],
      pintar: ctx => pista(ctx, c => {
        c.moveTo(-70, 60); c.lineTo(50, 60); c.lineTo(50, 10); c.bezierCurveTo(50, -20, 20, -20, 20, -45); c.lineTo(20, -65); c.lineTo(-70, -65); c.closePath()
      }, 'miter'),
    }),
    logro: vueltaCompleta,
    solucion: programa([seguir4(false)]),
  },

  {
    id: 'cuatro_laberinto', curso: 'linea4', emoji: '🗺️', titulo: 'Laberinto de líneas', nivel: 'Reto', robot: 'competencia',
    objetivo: 'La pista tiene caminos falsos. Usa la regla de la mano derecha: si hay camino a la derecha, tómalo.',
    pista: ['Es el seguidor de 4 sensores preguntando PRIMERO por el sensor 4 (derecha).', 'En cada cruce: avanza 0.6 rotaciones y gira 90 grados hacia el lado que vio la línea.', 'Los caminos que siguen de frente no llevan a ningún lado.'],
    tapete: campo({ x: -82, z: 0, ang: 0 }, {
      meta: { x: 30, z: -50, r: 12 },
      pintar: ctx => {
        pista(ctx, c => { c.moveTo(-92, 0); c.lineTo(-20, 0) }, 'miter')
        pista(ctx, c => { c.moveTo(-50, 0); c.lineTo(-50, 50); c.lineTo(40, 50) }, 'miter')
        pista(ctx, c => { c.moveTo(10, 50); c.lineTo(10, 80); c.lineTo(70, 80); c.lineTo(70, -50); c.lineTo(20, -50) }, 'miter')
      },
    }),
    logro: m => m.enMeta(),
    solucion: programa([seguir4(true)]),
  },
  // ───────────────────────────────────────────── 6 · Sumo
  {
    id: 'sumo_borde', curso: 'sumo', emoji: '⚪', titulo: 'No te caigas del ring', nivel: 'Medio', robot: 'sumo',
    objetivo: 'Muévete por el ring durante 20 segundos sin salirte. El borde blanco avisa que se acaba la tarima.',
    pista: ['Avanza mientras los dos sensores vean negro.', 'Si el sensor 1 O el sensor 2 ven blanco: retrocede un poco y gira.', 'Todo dentro de «por siempre».'],
    tapete: sumo({ x: 0, z: 0, ang: 0 }),
    logro: m => !m.caido && m.tiempo >= 20 && m.recorrido >= 250,
    solucion: programa([porSiempre(si([[veBorde(), [retroceder(50, 0.6, 'seg'), girar('der', 140)]]], [encender(50, 50)]))]),
  },
  {
    id: 'sumo_caja', curso: 'sumo', emoji: '📦', titulo: 'Saca la caja', nivel: 'Fácil', robot: 'sumo',
    objetivo: 'Empuja la caja fuera del ring… ¡pero sin caerte tú!',
    pista: ['La caja está justo enfrente: enciende los motores.', 'Espera hasta que algún sensor vea el borde blanco.', 'Retrocede enseguida para no salirte.'],
    tapete: sumo({ x: -30, z: 0, ang: 0 }, [{ x: 20, z: 0, r: 8, tipo: 'caja', color: '#f59e0b' }]),
    logro: todosFuera,
    solucion: programa([encender(60, 60), esperarHasta(veBorde()), retroceder(60, 1, 'seg')]),
  },
  {
    id: 'sumo_limpia', curso: 'sumo', emoji: '🧹', titulo: 'Limpia el ring', nivel: 'Reto', robot: 'sumo',
    objetivo: 'Hay tres latas repartidas por el ring. Búscalas con el sensor de distancia y sácalas todas.',
    pista: ['Gira sobre tu eje hasta que el sensor vea algo a menos de 150 cm (fuera del ring no hay nada).', 'Embiste hasta ver el borde blanco, empuja 0,3 segundos más (tus sensores van adelante: aún queda tarima) y retrocede.', 'Repite por siempre: buscar, embestir, retroceder.'],
    tapete: sumo({ x: 0, z: 0, ang: 0 }, [
      { x: 42, z: 8, r: 7, tipo: 'caja', color: '#ef4444' }, { x: -18, z: 44, r: 7, tipo: 'caja', color: '#3b82f6' }, { x: -34, z: -34, r: 7, tipo: 'caja', color: '#22c55e' },
    ]),
    logro: todosFuera,
    solucion: programa([buscarYEmbestir(70)]),
  },
  {
    id: 'sumo_rival', curso: 'sumo', emoji: '🤖', titulo: 'Rival dormido', nivel: 'Medio', robot: 'sumo',
    objetivo: 'Un robot rival está quieto en algún lugar del ring. Encuéntralo y sácalo.',
    pista: ['Es la misma estrategia: buscar girando, embestir, retroceder.', 'Un robot pesa más que una lata: usa más potencia.'],
    tapete: sumo({ x: -30, z: 20, ang: 180 }, [{ x: 30, z: -32, r: 8, tipo: 'rival', vel: 0, color: '#7c3aed' }]),
    logro: todosFuera,
    solucion: programa([buscarYEmbestir(90)]),
  },
  {
    id: 'sumo_combate', curso: 'sumo', emoji: '🥋', titulo: '¡Combate!', nivel: 'Reto', robot: 'sumo',
    objetivo: 'El rival te persigue y te empuja. Sácalo del ring antes de que él te saque a ti.',
    pista: ['Si te quedas quieto, te saca. Búscalo y embiste a máxima potencia.', 'No olvides el borde: si lo ves, retrocede.', 'Gana el que empuja con más velocidad.'],
    tapete: sumo({ x: -40, z: 0, ang: 0 }, [{ x: 40, z: 0, r: 8, tipo: 'rival', vel: 9, color: '#dc2626' }]),
    logro: todosFuera,
    solucion: programa([buscarYEmbestir(100)]),
  },

  {
    id: 'sumo_veloz', curso: 'sumo', emoji: '⚡', titulo: 'Rival veloz', nivel: 'Reto', robot: 'sumo',
    objetivo: 'Este rival es más rápido y empuja más fuerte. Solo a máxima potencia le ganas.',
    pista: ['La misma estrategia: buscar girando, embestir, retroceder.', 'Con potencia 100 empujas más que él. Con menos, te saca.'],
    tapete: sumo({ x: -45, z: 0, ang: 0 }, [{ x: 45, z: 0, r: 8, tipo: 'rival', vel: 14, color: '#ea580c' }]),
    logro: todosFuera,
    solucion: programa([buscarYEmbestir(100)]),
  },
  {
    id: 'sumo_dos', curso: 'sumo', emoji: '👥', titulo: 'Dos contra uno', nivel: 'Reto', robot: 'sumo',
    objetivo: 'Hay dos rivales: uno dormido y otro que te persigue. Saca a los dos.',
    pista: ['No hace falta cambiar el programa: después de sacar a uno, el robot vuelve a buscar.', 'Mira cómo el «por siempre» repite la estrategia sola.'],
    tapete: sumo({ x: -40, z: 0, ang: 0 }, [
      { x: 25, z: -32, r: 8, tipo: 'rival', vel: 0, color: '#7c3aed' }, { x: 40, z: 20, r: 8, tipo: 'rival', vel: 7, color: '#dc2626' },
    ]),
    logro: todosFuera,
    solucion: programa([buscarYEmbestir(100)]),
  },
  {
    id: 'sumo_barre', curso: 'sumo', emoji: '🤼', titulo: 'Barre el ring a ciegas', nivel: 'Medio', robot: 'sumo_tactil',
    objetivo: 'Este sumo no tiene sensor de distancia. Recorre el ring rebotando en el borde hasta sacar las tres latas.',
    pista: ['Avanza mientras los dos sensores vean negro: lo que esté delante se va empujando.', 'Si algún sensor ve blanco: retrocede y gira.', 'Prueba distintos ángulos de giro: ¿con cuál barre mejor?'],
    tapete: sumo({ x: 0, z: 0, ang: 0 }, [
      { x: 35, z: 0, r: 7, tipo: 'caja', color: '#ef4444' }, { x: -25, z: 35, r: 7, tipo: 'caja', color: '#3b82f6' }, { x: -20, z: -40, r: 7, tipo: 'caja', color: '#22c55e' },
    ]),
    logro: todosFuera,
    solucion: programa([porSiempre(si([[veBorde(), [esperar(0.3), retroceder(50, 0.8, 'seg'), girar('der', 130)]]], [encender(50, 50)]))]),
  },
  // ───────────────────────────────────────────── 7 · Laberintos
  {
    id: 'pasillo', curso: 'laberinto', emoji: '🧱', titulo: 'Pasillo en U', nivel: 'Medio', robot: 'explorador',
    objetivo: 'Recorre el pasillo hasta la meta sin tocar las paredes. Usa el sensor de distancia para saber cuándo girar.',
    pista: ['Avanza hasta tener una pared a menos de 15 cm y detente.', 'Gira 90 grados a la derecha.', 'Repite eso 2 veces y avanza una vez más hasta la última pared.'],
    tapete: campo({ x: -70, z: -62, ang: 0 }, {
      muros: [{ x: 50, z: -45, w: 6, h: 110 }, { x: 0, z: 83, w: 200, h: 6 }, { x: -32.5, z: -5, w: 75, h: 60 }],
      meta: { x: -74, z: 56, r: 13 },
    }),
    logro: m => m.enMeta() && m.quieto() && m.golpes === 0,
    solucion: programa([
      repetir(2, encender(40, 40), esperarHasta(cerca(15)), parar(), girar('der', 90)),
      encender(40, 40), esperarHasta(cerca(15)), parar(),
    ]),
  },
  {
    id: 'rebota', curso: 'laberinto', emoji: '🛡️', titulo: 'Rebota y gira', nivel: 'Medio', robot: 'parachoques',
    objetivo: 'Este robot no ve las paredes: las siente. Cada vez que choque, que retroceda y gire a la izquierda, hasta llegar a la meta.',
    pista: ['Enciende los motores y espera hasta que el botón esté tocado.', 'Retrocede medio segundo y gira 90 grados a la izquierda.', 'Ponlo todo dentro de «por siempre».'],
    tapete: campo({ x: -70, z: 70, ang: 0 }, { muros: [{ x: -10, z: 10, w: 120, h: 100 }], meta: { x: 0, z: -84, r: 13 } }),
    logro: m => m.enMeta() && m.golpes >= 2,
    solucion: programa([porSiempre(encender(50, 50), esperarHasta(tactil()), retroceder(40, 0.5, 'seg'), girar('izq', 90))]),
  },
  {
    id: 'lab_zigzag', curso: 'laberinto', emoji: '🌀', titulo: 'Laberinto en zigzag', nivel: 'Reto', robot: 'guardian',
    objetivo: 'Cuatro giros hasta la meta, sin tocar ninguna pared. En cada pared decide: ¿izquierda o derecha?',
    pista: ['Cada tramo es igual: avanzar hasta tener una pared a menos de 15 cm y detenerse.', 'Los giros van en este orden: izquierda, derecha, derecha, izquierda.', 'Después del último giro, avanza hasta la pared final.'],
    tapete: campo({ x: -80, z: 70, ang: 0 }, {
      muros: [{ x: -20, z: 67.5, w: 6, h: 65 }, { x: -45, z: -10, w: 110, h: 6 }, { x: 50, z: -20, w: 6, h: 160 }],
      meta: { x: 76, z: 76, r: 13 },
    }),
    logro: m => m.enMeta() && m.quieto() && m.golpes === 0,
    solucion: programa([
      ...hastaPared(), girar('izq', 90), ...hastaPared(), girar('der', 90), ...hastaPared(), girar('der', 90),
      ...hastaPared(), girar('izq', 90), ...hastaPared(),
    ]),
  },
]
