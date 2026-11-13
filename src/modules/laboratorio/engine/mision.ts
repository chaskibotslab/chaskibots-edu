// Misiones guiadas: cada proyecto del laboratorio como una clase completa.
// El alumno parte del chasis vacío (o de la protoboard vacía) y recorre las
// mismas etapas de las guías de la plataforma:
//   El reto → Piezas → Arma → Conecta → Programa → Prueba → Demuestra
// El laboratorio revisa solo lo que se puede revisar (cada pieza en su lugar,
// cada cable, que el programa corra y que el robot se mueva); lo demás
// (leer, responder, el reto extra) lo marca el alumno.
// La misión sale del proyecto ya armado: no hay que escribir una por una.

import { datosVariante, pieza } from '../catalogo/piezas'
import { PROGRAMA_VACIO } from '../bloques/definiciones'
import { autocablear } from './autocableado'
import { esBanco, montajeDe, raiz } from './ensamblaje'
import { aprendizajes, pasosPendientes } from './explicacion'
import { verificar } from './verificacion'
import type { PiezaEnRobot, RobotDoc } from '../robots/doc'

export type EtapaId = 'reto' | 'piezas' | 'arma' | 'conecta' | 'programa' | 'prueba' | 'demuestra'
export type PestanaTaller = 'armar' | 'cablear' | 'programar' | 'probar'

/** Lo que la misión necesita saber del proyecto (un `Prearmado` lo cumple). */
export interface ProyectoMision {
  id: string
  nombre: string
  descripcion: string
  dificultad: 'inicial' | 'intermedio' | 'avanzado'
  logica: string[]
  kit?: string
  construir: () => RobotDoc
}

export interface Material { nombre: string; cantidad: number; paraQue: string }

export interface Mision {
  id: string
  nombre: string
  dificultad: ProyectoMision['dificultad']
  kit?: string
  /** El reto, en una frase. */
  objetivo: string
  logica: string[]
  aprende: string[]
  materiales: Material[]
  preguntas: string[]
  retoExtra: string
  /** Minutos de clase estimados. */
  minutos: number
  /** El robot terminado (la respuesta) y el punto de partida (solo la base). */
  meta: RobotDoc
  inicio: RobotDoc
  /** Cables del cableado de referencia. */
  cablesMeta: number
}

/** Lo que el alumno ya hizo y no se puede deducir del robot. */
export interface Avance {
  confirmados: string[]
  /** El programa compiló y corrió con el robot completo. */
  corrio: boolean
  /** El robot se movió (o el circuito funcionó) el tiempo suficiente. */
  probado: boolean
  /** Usó «Conectar automáticamente». */
  ayudaCables: boolean
  inicio: number
  fin?: number
}

export const avanceNuevo = (): Avance => ({ confirmados: [], corrio: false, probado: false, ayudaCables: false, inicio: Date.now() })

export interface PasoMision {
  id: string
  titulo: string
  detalle?: string
  /** Lo revisa el laboratorio; si no, lo marca el alumno. */
  auto: boolean
  hecho: boolean
  /** Para los pasos de armar: qué pieza buscar en el cajón. */
  pieza?: string
  codigo?: string
}

export interface EtapaMision {
  id: EtapaId
  titulo: string
  /** Qué se hace en la etapa, en una línea. */
  resumen: string
  pestana?: PestanaTaller
  pasos: PasoMision[]
  hechos: number
  total: number
  completa: boolean
}

export const ETAPAS: { id: EtapaId; titulo: string; pestana?: PestanaTaller }[] = [
  { id: 'reto', titulo: 'El reto' },
  { id: 'piezas', titulo: 'Piezas' },
  { id: 'arma', titulo: 'Arma', pestana: 'armar' },
  { id: 'conecta', titulo: 'Conecta', pestana: 'cablear' },
  { id: 'programa', titulo: 'Programa', pestana: 'programar' },
  { id: 'prueba', titulo: 'Prueba', pestana: 'probar' },
  { id: 'demuestra', titulo: 'Demuestra' },
]

// ---------------------------------------------------------------------------
// Contenido que sale de las piezas
// ---------------------------------------------------------------------------

const PARA_QUE: Record<string, string> = {
  chasis: 'La base donde se atornilla todo',
  protoboard: 'Tablero para conectar componentes sin soldar',
  mcu: 'El cerebro: guarda y ejecuta tu programa',
  'puente-h': 'Da a los motores la corriente que la placa no puede dar',
  'motor-dc': 'Convierte electricidad en giro',
  rueda: 'Transmite el giro del motor al piso',
  'rueda-loca': 'Tercer apoyo: gira libre hacia cualquier lado',
  bateria: 'La energía del robot',
  'ir-reflectivo': 'Distingue el negro del blanco en el piso',
  'ir-obstaculo': 'Avisa si hay algo cerca',
  ultrasonido: 'Mide distancias con el eco de un sonido',
  servo: 'Gira a un ángulo exacto',
  led: 'Luz que el programa enciende y apaga',
  'led-rgb': 'Tres luces en una: mezcla colores',
  resistencia: 'Limita la corriente para no quemar el LED',
  pulsador: 'Botón: una entrada que el programa lee',
  potenciometro: 'Perilla que entrega un valor de 0 a 1023',
  buzzer: 'Hace sonidos',
  ldr: 'Mide cuánta luz hay',
  joystick: 'Palanca con dos ejes y un botón',
  camara: 'Los ojos del robot',
  'arma-giratoria': 'El arma del robot de combate',
  cuadrupedo: 'Robot con patas listo para programar',
  maqueta: 'La maqueta del proyecto',
}

const PREGUNTAS: [string, string][] = [
  ['puente-h', '¿Por qué la placa no puede mover los motores directamente y necesita un driver?'],
  ['ir-reflectivo', '¿Qué lee el sensor sobre la línea negra y qué lee sobre el piso claro? ¿Por qué cambia?'],
  ['ultrasonido', 'Si el eco tarda el doble en volver, ¿a qué distancia está el obstáculo?'],
  ['ir-obstaculo', '¿En qué se diferencia este sensor del de ultrasonido? ¿Cuál te dice la distancia?'],
  ['servo', '¿Qué diferencia hay entre un servo y un motor común?'],
  ['resistencia', '¿Qué le pasaría al LED si lo conectaras sin la resistencia?'],
  ['pulsador', '¿Qué lee la placa cuando el botón está suelto y qué lee cuando lo presionas?'],
  ['potenciometro', '¿Por qué la perilla se lee con analogRead y no con digitalRead?'],
  ['ldr', '¿Cómo cambia la lectura cuando tapas el sensor de luz?'],
  ['buzzer', '¿Qué número cambias en el programa para que el sonido sea más agudo?'],
  ['camara', 'Para el programa, una imagen es una tabla de números. ¿Qué representa cada número?'],
  ['bateria', '¿Por qué el polo negativo (GND) de la batería y el de la placa van unidos?'],
]

const RETOS: [string, string][] = [
  ['ir-reflectivo', 'Sube la velocidad en el programa hasta que el robot se salga de la línea. ¿Cuál es la máxima con la que todavía completa la pista?'],
  ['ultrasonido', 'Cambia en el programa la distancia a la que reacciona el robot y comprueba en la arena que frena antes.'],
  ['ir-obstaculo', 'Haz que el robot retroceda un poco antes de girar cuando detecta un obstáculo.'],
  ['servo', 'Cambia los ángulos del servo en el programa y anota qué hace con cada uno.'],
  ['arma-giratoria', 'Cambia la estrategia: que el robot espere al rival en lugar de buscarlo. ¿Gana más veces?'],
  ['motor-dc', 'Cambia la velocidad y los tiempos del programa para que el robot dibuje un triángulo en lugar de un cuadrado.'],
  ['led', 'Cambia los tiempos del programa y agrega un LED más con su resistencia.'],
  ['buzzer', 'Cambia las notas para tocar otra melodía.'],
]

const tipoDe = (p: PiezaEnRobot) => pieza(p.pieza).comportamiento.tipo as string

/** Sin programa: el alumno elige una plantilla o lo escribe. */
function programaEnBlanco(meta: RobotDoc): RobotDoc['programa'] {
  if (meta.programa.modo === 'bloques') return { modo: 'bloques', bloques: PROGRAMA_VACIO, cpp: '' }
  return { modo: 'codigo', cpp: '' }
}

export function crearMision(p: ProyectoMision): Mision {
  const meta = p.construir()
  const base = raiz(meta)
  const tipos = new Set(meta.piezas.map(tipoDe))
  const mapa = new Map<string, Material>()
  for (const x of meta.piezas) {
    const def = pieza(x.pieza)
    const nombre = datosVariante(def, x.variante).nombre
    const m = mapa.get(nombre) ?? { nombre, cantidad: 0, paraQue: PARA_QUE[tipoDe(x)] ?? def.descripcion }
    m.cantidad++
    mapa.set(nombre, m)
  }
  const preguntas = PREGUNTAS.filter(([t]) => tipos.has(t)).map(([, q]) => q).slice(0, 3)
  preguntas.push('Explica con tus palabras, paso a paso, qué hace el programa desde que se enciende.')
  const cablesMeta = Math.max(meta.cables.length, 1)
  return {
    id: p.id,
    nombre: p.nombre,
    dificultad: p.dificultad,
    kit: p.kit,
    objetivo: p.descripcion,
    logica: p.logica,
    aprende: aprendizajes(meta),
    materiales: Array.from(mapa.values()),
    preguntas,
    retoExtra: RETOS.find(([t]) => tipos.has(t))?.[1] ?? 'Cambia un valor del programa, predice qué va a pasar y compruébalo.',
    minutos: Math.round((10 + meta.piezas.length * 1.5 + cablesMeta * 1 + 15) / 5) * 5,
    meta,
    inicio: { ...meta, piezas: [base], cables: [], cableado: 'manual', programa: programaEnBlanco(meta) },
    cablesMeta,
  }
}

// ---------------------------------------------------------------------------
// Revisión del armado
// ---------------------------------------------------------------------------

/** Dónde va una pieza, sin depender de su id: «arduino-uno@placa<chasis-2wd». */
function firma(doc: RobotDoc, p: PiezaEnRobot): string {
  const partes: string[] = []
  let x: PiezaEnRobot | undefined = p
  while (x) {
    partes.push(x.padre ? `${x.pieza}@${x.padre.montaje}` : x.pieza)
    const arriba: string | undefined = x.padre?.instancia
    x = arriba ? doc.piezas.find(y => y.id === arriba) : undefined
  }
  return partes.join('<')
}

const giroDe = (p: PiezaEnRobot) => (((p.padre?.giro ?? 0) % 360) + 360) % 360

/** Pasos de armado: una pieza de la meta por paso, en el orden en que se atornilla. */
export function pasosArmado(m: Mision, doc: RobotDoc): PasoMision[] {
  const puestas = new Map(doc.piezas.map(p => [firma(doc, p), p]))
  return m.meta.piezas.filter(p => p.padre).map(p => {
    const def = pieza(p.pieza)
    const padre = m.meta.piezas.find(x => x.id === p.padre!.instancia)!
    const mt = montajeDe(m.meta, p)
    const nombre = datosVariante(def, p.variante).nombre
    const donde = mt?.nombre ?? p.padre!.montaje
    const sobre = padre.padre ? ` de «${padre.etiqueta}»` : ''
    const girar = giroDe(p)
    const puesta = puestas.get(firma(m.meta, p))
    const bienGirada = !!puesta && giroDe(puesta) === girar
    return {
      id: `arma:${firma(m.meta, p)}`,
      titulo: `Pon «${nombre}» en «${donde}»${sobre}`,
      detalle: puesta && !bienGirada
        ? `Ya está en su lugar: ahora gírala (botón «Girar») hasta que quede como en la foto del proyecto.`
        : `${PARA_QUE[tipoDe(p)] ?? def.descripcion}.${girar ? ' Después de ponerla, gírala con el botón «Girar».' : ''}`,
      auto: true,
      hecho: bienGirada,
      pieza: p.pieza,
    }
  })
}

const SEG_PRUEBA = 8

/** ¿Ya se puede dar por probado? `segundos` corriendo y, si tiene motores, `metros` recorridos. */
export function pruebaCumplida(m: Mision, segundos: number, metros: number): boolean {
  const seMueve = m.meta.piezas.some(p => ['motor-dc', 'cuadrupedo'].includes(tipoDe(p)))
  return segundos >= SEG_PRUEBA && (!seMueve || metros >= 0.15)
}

/** Todas las etapas con su avance. */
export function etapasMision(m: Mision, doc: RobotDoc, av: Avance): EtapaMision[] {
  const conf = new Set(av.confirmados)
  const manual = (id: string, titulo: string, detalle?: string): PasoMision => ({ id, titulo, detalle, auto: false, hecho: conf.has(id) })
  const banco = esBanco(doc)
  const cosa = banco ? 'circuito' : 'robot'

  const arma = pasosArmado(m, doc)
  const armado = arma.every(p => p.hecho)

  // Conecta: solo tiene sentido con todas las piezas puestas.
  let conecta: PasoMision[] = []
  let cablesHechos = 0
  let total = m.cablesMeta
  if (armado) {
    const faltan = pasosPendientes(doc)
    const errores = verificar(doc).filter(x => x.nivel === 'error')
    total = Math.max(m.cablesMeta, faltan.length) + 1
    conecta = faltan.map((f, i) => ({ id: `cable:${i}:${f.cable.de.join('.')}-${f.cable.a.join('.')}`, titulo: f.titulo, detalle: f.porque, auto: true, hecho: false, codigo: f.codigo }))
    const revisado = faltan.length === 0 && errores.length === 0 && doc.cables.length > 0
    conecta.push({
      id: 'cable:revision', auto: true, hecho: revisado,
      titulo: 'Revisión eléctrica sin errores',
      detalle: errores[0]?.texto ?? (faltan.length ? 'Se revisa sola cuando termines de conectar.' : 'Sin cortocircuitos ni pines sueltos.'),
    })
    cablesHechos = total - conecta.filter(p => !p.hecho).length
  } else {
    conecta = [{ id: 'cable:espera', titulo: `Primero termina de armar el ${cosa}`, auto: true, hecho: false }]
    total = m.cablesMeta + 1
  }
  const conectado = armado && conecta.every(p => p.hecho)

  const tienePrograma = doc.programa.cpp.trim().length > 0
  const programa: PasoMision[] = [
    { id: 'prog:escribir', auto: true, hecho: tienePrograma, titulo: 'Carga una plantilla o escribe tu programa', detalle: 'En «Programar», a la derecha, están las plantillas hechas para los pines de tu robot. Elige la primera y léela completa.' },
    manual('prog:leer', 'Lee el programa y ubica dónde está cada pin', 'Compara los números del código con la lista «Pines de tu robot»: deben coincidir con tus cables.'),
    { id: 'prog:correr', auto: true, hecho: av.corrio, titulo: 'Compila y ejecuta sin errores', detalle: 'Botón «Compilar y ejecutar». Si hay un error, el laboratorio te marca la línea.' },
  ]

  const prueba: PasoMision[] = [
    { id: 'prueba:mirar', auto: true, hecho: av.probado, titulo: banco ? 'Deja el circuito funcionando unos segundos' : 'Deja al robot funcionar en la arena', detalle: banco ? 'En «Probar», ejecuta y usa los controles (botones, perillas) si los tiene.' : 'En «Probar», ejecuta y obsérvalo al menos 8 segundos. Activa «Sensores» para ver lo que el robot detecta.' },
    manual('prueba:comparar', `Compara lo que hace con «Cómo piensa»`, m.logica[0] ? `Debería cumplir esto: ${m.logica[0]}` : undefined),
  ]

  const demuestra: PasoMision[] = [
    ...m.preguntas.map((q, i) => manual(`dem:pregunta:${i}`, q, 'Respóndela en tu cuaderno o en voz alta a tu docente.')),
    manual('dem:reto', 'Reto extra', m.retoExtra),
  ]

  const crudas: Omit<EtapaMision, 'hechos' | 'total' | 'completa'>[] = [
    { id: 'reto', titulo: 'El reto', resumen: 'Qué vas a construir y para qué', pasos: [manual('reto:leer', 'Lee el reto y cómo piensa el robot')] },
    { id: 'piezas', titulo: 'Piezas', resumen: 'Conoce cada pieza y para qué sirve', pasos: [manual('piezas:conocer', 'Revisa la lista de piezas y para qué sirve cada una')] },
    { id: 'arma', titulo: 'Arma', resumen: `Pon cada pieza en su lugar`, pestana: 'armar', pasos: arma },
    { id: 'conecta', titulo: 'Conecta', resumen: 'Une los pines con cables, uno por uno', pestana: 'cablear', pasos: conecta },
    { id: 'programa', titulo: 'Programa', resumen: 'Carga el programa y entiéndelo', pestana: 'programar', pasos: programa },
    { id: 'prueba', titulo: 'Prueba', resumen: `Mira si el ${cosa} hace lo que debe`, pestana: 'probar', pasos: prueba },
    { id: 'demuestra', titulo: 'Demuestra', resumen: 'Explica lo que aprendiste y supera el reto extra', pasos: demuestra },
  ]
  return crudas.map(e => {
    if (e.id === 'conecta') return { ...e, hechos: conectado ? total : Math.min(cablesHechos, total - 1), total, completa: conectado }
    const hechos = e.pasos.filter(p => p.hecho).length
    return { ...e, hechos, total: e.pasos.length, completa: hechos === e.pasos.length }
  })
}

/** La primera etapa sin terminar (o la última si ya está todo). */
export function etapaActual(etapas: EtapaMision[]): number {
  const i = etapas.findIndex(e => !e.completa)
  return i < 0 ? etapas.length - 1 : i
}

export function progreso(etapas: EtapaMision[]): number {
  const total = etapas.reduce((s, e) => s + e.total, 0)
  return total ? etapas.reduce((s, e) => s + e.hechos, 0) / total : 0
}

/** Cables de referencia de un robot (para saber cuántos son al planear la clase). */
export const cablesDeReferencia = (doc: RobotDoc) => autocablear({ ...doc, cables: [] }).cables.length
