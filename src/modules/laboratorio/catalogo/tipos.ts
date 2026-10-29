// Tipos del catálogo de piezas (F2).
//
// Una pieza se describe una sola vez y de su ficha sale todo: el modelo 3D,
// la física (masa, colisionadores, material), dónde se encastra, qué se le
// puede encastrar, sus pines y cómo se comporta en la simulación.
//
// Unidades: milímetros, gramos y grados. Marco de cada pieza: su origen es el
// punto que se apoya sobre el montaje del padre ("ancla"). Marco del robot:
// +x hacia adelante, +y hacia arriba, +z hacia la derecha.

export type V3 = [number, number, number]

export type Familia = 'placa' | 'chasis' | 'movimiento' | 'servo' | 'sensor' | 'electronica' | 'circuito'

export const FAMILIAS: { id: Familia; nombre: string }[] = [
  { id: 'chasis', nombre: 'Chasis y bases' },
  { id: 'placa', nombre: 'Placas' },
  { id: 'movimiento', nombre: 'Motores y ruedas' },
  { id: 'servo', nombre: 'Servos' },
  { id: 'sensor', nombre: 'Sensores' },
  { id: 'electronica', nombre: 'Electrónica' },
  { id: 'circuito', nombre: 'Componentes' },
]

/** Tipos de punto de montaje: una pieza solo encastra donde su tipo coincide. */
export type TipoMontaje =
  | 'placa'           // Arduino / ESP32
  | 'driver'          // L298N, TB6612
  | 'bateria'
  | 'soporte-motor'   // motor TT / N20 en el chasis
  | 'eje-motor'       // rueda en el eje de un motor
  | 'rueda-loca'
  | 'sensor-piso'     // sensores que miran al piso (línea)
  | 'sensor-frontal'  // sensores que miran hacia adelante (distancia, obstáculos)
  | 'soporte-servo'
  | 'eje-servo'       // lo que gira con el servo
  | 'protoboard'      // LED, resistencia, pulsador… pinchados en la protoboard

export interface PuntoMontaje {
  id: string
  tipo: TipoMontaje
  nombre: string
  posicion: V3
  /** Giro del hijo respecto de la pieza (grados, orden XYZ). */
  rotacion?: V3
  /** Giros extra (alrededor de +y del montaje) que el alumno puede elegir. */
  rotacionesPermitidas?: number[]
}

export type MaterialFisico = 'goma' | 'plastico' | 'acrilico' | 'mdf' | 'aluminio' | 'pla' | 'pcb' | 'metal' | 'melamina'

/** Coeficiente de fricción rueda–piso según el material de cada uno. */
const MU: Partial<Record<MaterialFisico, Partial<Record<MaterialFisico, number>>>> = {
  goma: { melamina: 0.9 },
  plastico: { melamina: 0.45 },
}
export function friccion(rueda: MaterialFisico, piso: MaterialFisico): number {
  return MU[rueda]?.[piso] ?? 0.5
}

/** `friccion`: contra el piso u otros robots (por defecto 0,5); la pala de sumo usa poca. */
export type Colisionador =
  | { forma: 'caja'; medidas: V3; centro?: V3; /** Giro de la caja (grados, orden XYZ). */ rotacion?: V3; friccion?: number }
  | { forma: 'cilindro'; radio: number; alto: number; eje: 'x' | 'y' | 'z'; centro?: V3; friccion?: number }
  | { forma: 'esfera'; radio: number; centro?: V3; friccion?: number }

export type TipoPin = 'digital' | 'pwm' | 'analogico' | 'i2c' | 'alim' | 'gnd' | 'potencia'

export interface PinDef {
  nombre: string
  tipo: TipoPin
  /** Qué hace el pin, en palabras para el alumno. */
  ayuda?: string
}

export interface CanalPuenteH { en: string; in_a: string; in_b: string; out_a: string; out_b: string }

/** Pines de alimentación de un driver (cambian de nombre según el modelo). */
export interface AlimDriver {
  motor: string        // entrada de la batería de motores (L298N: 12V, TB6612: VM)
  gnd: string
  salida5v?: string    // salida de 5 V que puede alimentar la placa (L298N)
  vcc?: string         // entrada de lógica que hay que alimentar con 5 V (TB6612)
  standby?: string     // pin que debe estar en HIGH para que funcione (TB6612: STBY)
}

export type Comportamiento =
  /** El «cerebro»: la placa define qué se emula y cómo se compila (engine/placa.ts). */
  | { tipo: 'mcu'; placa: 'uno' | 'nano' | 'esp32'; frecuencia_hz: number; vLogica: 5 | 3.3 }
  | { tipo: 'chasis' }
  | { tipo: 'motor-dc'; v_nominal: number; rpm_sin_carga: number; torque_bloqueo_nm: number; zona_muerta_v: number; tau_s: number; corriente_a: number }
  | { tipo: 'rueda'; radio_mm: number; ancho_mm: number }
  | { tipo: 'rueda-loca'; radio_mm: number }
  | { tipo: 'servo'; torque_kgcm: number; seg_por_60: number; angulo_max: number; corriente_a: number }
  | { tipo: 'puente-h'; caida_v: number; canales: CanalPuenteH[]; alim: AlimDriver }
  | { tipo: 'bateria'; voltaje: number; capacidad_mah: number; corriente_max_a: number }
  | { tipo: 'ir-reflectivo'; umbral: number; altura_max_mm: number; radio_lectura_mm: number }
  | { tipo: 'ir-obstaculo'; alcance_mm: number; origen: V3 }
  | { tipo: 'ultrasonido'; alcance_max_cm: number; apertura_grados: number; origen: V3 }
  /** Base de la mesa de electrónica: protoboard con lugar para la placa al lado. */
  | { tipo: 'protoboard' }
  // Componentes del circuito (engine/circuito.ts los resuelve con análisis nodal).
  | { tipo: 'led'; color: string; vf: number }
  | { tipo: 'led-rgb'; vf: [number, number, number] }
  | { tipo: 'resistencia'; ohm: number }
  | { tipo: 'pulsador' }
  | { tipo: 'buzzer'; activo: boolean; ohm: number }
  | { tipo: 'potenciometro'; ohm: number }
  | { tipo: 'ldr'; ohmLuz: number; ohmOscuro: number }
  /** Pieza que se ve en el catálogo pero todavía no se simula (llega en una fase futura). */
  | { tipo: 'sin-simular' }

export interface Variante {
  id: string
  nombre: string
  material: MaterialFisico
  masa_g: number
  color: string
}

export interface PiezaDef {
  id: string
  nombre: string
  familia: Familia
  descripcion: string
  /** Existe en los kits ChaskiBots (lista `materiales` de la plataforma). */
  enKits?: boolean
  /** "proc:<nombre>" = modelo generado por código con medidas reales (también es el
   *  respaldo mientras carga el modelo real y la clave para ubicar los pines). */
  modelo: string
  /** Modelo 3D real (GLB ya preparado con scripts/preparar-modelos.mjs, en metros y en el marco de la pieza). */
  glb?: string
  /** Escala del modelo real (p. ej. la rueda de 48 mm usa el modelo de 65 mm reducido). */
  escalaGlb?: number
  /** Se muestra en el cajón pero todavía no se puede usar: texto de cuándo llega. */
  proximamente?: string
  masa_g: number
  /** Material de la pieza (fricción, aspecto). Las variantes lo pueden cambiar. */
  material: MaterialFisico
  color?: string
  variantes?: Variante[]
  /** Formas simples para los choques (separadas del modelo visual). */
  colisionadores: Colisionador[]
  /** Dónde se le puede encastrar algo. */
  montajes: PuntoMontaje[]
  /** En qué tipos de montaje encastra esta pieza (vacío = solo como raíz). */
  encaja: TipoMontaje[]
  pines: PinDef[]
  comportamiento: Comportamiento
  /** Datos técnicos para la ficha (texto libre). */
  datos?: [string, string][]
  /** De dónde salen los datos técnicos. */
  fuente?: string
}

export function grados(v: number) { return (v * Math.PI) / 180 }
