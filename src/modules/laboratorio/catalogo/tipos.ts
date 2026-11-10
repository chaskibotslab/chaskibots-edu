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

export type Familia = 'placa' | 'chasis' | 'movimiento' | 'servo' | 'sensor' | 'electronica' | 'circuito' | 'arma'

export const FAMILIAS: { id: Familia; nombre: string }[] = [
  { id: 'chasis', nombre: 'Chasis y bases' },
  { id: 'placa', nombre: 'Placas' },
  { id: 'movimiento', nombre: 'Motores y ruedas' },
  { id: 'servo', nombre: 'Servos' },
  { id: 'sensor', nombre: 'Sensores' },
  { id: 'electronica', nombre: 'Electrónica' },
  { id: 'circuito', nombre: 'Componentes' },
  { id: 'arma', nombre: 'Armas de combate' },
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
  | 'maqueta'         // maqueta del proyecto (basurero…) junto a la protoboard
  | 'piso'            // segundo piso sobre separadores (cuando abajo no cabe todo)
  | 'fuente-protoboard' // fuente MB102 pinchada en los rieles de la protoboard
  | 'modulo-mesa'     // módulo sobre la mesa junto a la protoboard (joystick)
  | 'arma'            // arma de un robot de combate (battlebot)

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

/** `csi`: conector de cámara (cable plano); `eth`: conector de red (RJ45). No son pines de señal. */
export type TipoPin = 'digital' | 'pwm' | 'analogico' | 'i2c' | 'alim' | 'gnd' | 'potencia' | 'csi' | 'eth'

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
  | { tipo: 'mcu'; placa: 'uno' | 'nano' | 'mega' | 'esp32' | 'pico' | 'rpi' | 'jetson'; frecuencia_hz: number; vLogica: 5 | 3.3 }
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
  /**
   * Cámara (cable plano al conector CSI de la placa). `origen`: centro de la
   * lente; mira hacia +x, inclinada `inclinacion_grados` hacia el piso. La
   * imagen es chica y en escala de grises: ancho_px × alto_px números de 0 a 255.
   */
  | { tipo: 'camara'; ancho_px: number; alto_px: number; fov_h_grados: number; fov_v_grados: number; inclinacion_grados: number; origen: V3; fps: number }
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
  /** Joystick de dos ejes (dos potenciómetros) con botón que une SW a tierra. */
  | { tipo: 'joystick'; ohm: number }
  /** Maqueta del proyecto (basurero, su tapa): no tiene pines, solo se ve y se mueve con el servo. */
  | { tipo: 'maqueta' }
  /**
   * Arma giratoria de battlebot: un motor sin escobillas con su ESC hace girar una
   * masa de acero. `giro`: 'horizontal' = gira acostada alrededor del eje vertical
   * (barra); 'vertical' = gira de pie alrededor del eje lateral (tambor, disco) y
   * lanza al rival hacia arriba. `forma` define la inercia: barra m·L²/12;
   * tambor y disco ½·m·r². `alto_mm`: altura del eje (o del plano) sobre el ancla;
   * `ancho_mm`: lo que ocupa a lo largo del eje (tambor) o el espesor (disco, barra).
   */
  | { tipo: 'arma-giratoria'; giro?: 'horizontal' | 'vertical'; forma?: 'barra' | 'tambor' | 'disco'; rpm_max: number; radio_mm: number; masa_barra_g: number; tau_s: number; alto_mm: number; ancho_mm?: number }
  /**
   * Perro robot cuadrúpedo (como el Unitree Go2): trae sus 12 motores, su batería y
   * el controlador de marcha. No se programan las patas una por una: la placa le
   * manda órdenes de alto nivel por el cable de red (caminar a tal velocidad,
   * girar, pararse, sentarse) y el controlador mueve las patas. `caderas`: dónde
   * arranca cada pata (adelante izq., adelante der., atrás izq., atrás der.).
   * `alturas_mm`: altura de las caderas en cada postura. `distancia`: sensor de
   * profundidad de la cabeza (mira hacia +x, ignora el piso).
   */
  | {
      tipo: 'cuadrupedo'; caderas: [V3, V3, V3, V3]; muslo_mm: number; pierna_mm: number
      alturas_mm: { parado: number; echado: number; sentado_adelante: number; sentado_atras: number }
      v_max: number; v_lateral_max: number; giro_max_grados: number
      distancia: { origen: V3; alcance_cm: number }
    }
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
  /** Lo que ocupa a la vista si es más que sus colisionadores (USB, conectores): cuenta
   *  para ver si choca con otra pieza al armar, pero no cambia la física. */
  huella?: Colisionador[]
  /** Dónde se le puede encastrar algo. */
  montajes: PuntoMontaje[]
  /** En qué tipos de montaje encastra esta pieza (vacío = solo como raíz). */
  encaja: TipoMontaje[]
  pines: PinDef[]
  /** Pines que quedan unidos por dentro con pines del padre al encastrarla
   *  ([pin propio, pin del padre]): la fuente MB102 pinchada en los rieles. */
  unePinesConPadre?: [string, string][]
  comportamiento: Comportamiento
  /** Datos técnicos para la ficha (texto libre). */
  datos?: [string, string][]
  /** De dónde salen los datos técnicos. */
  fuente?: string
}

export function grados(v: number) { return (v * Math.PI) / 180 }
