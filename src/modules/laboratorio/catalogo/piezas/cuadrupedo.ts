// Perro robot cuadrúpedo: el chasis ya trae las patas, sus 12 motores, la
// batería y el controlador de marcha (como el Unitree Go2, a escala de aula).
// La placa (Jetson Nano o Raspberry Pi) va en el lomo y le habla por el cable
// de red: no mueve cada motor, le pide «camina a 0,3 m/s» o «siéntate».
// Marco: origen en el centro de la cara de abajo del cuerpo; +x hacia la cabeza.

import type { PiezaDef, V3 } from '../tipos'

const CADERA_X = 115, CADERA_Y = 15, CADERA_Z = 62
/** Caderas en el orden adelante izq., adelante der., atrás izq., atrás der. (izquierda = −z). */
export const CADERAS: [V3, V3, V3, V3] = [
  [CADERA_X, CADERA_Y, -CADERA_Z], [CADERA_X, CADERA_Y, CADERA_Z],
  [-CADERA_X, CADERA_Y, -CADERA_Z], [-CADERA_X, CADERA_Y, CADERA_Z],
]
/** Lo que baja de la pata como colisionador (el resto es el pie, que apoya por rayo). */
const PATA_COLISION = 70

export const PERRO_ROBOT: PiezaDef = {
  id: 'perro-robot',
  nombre: 'Perro robot cuadrúpedo',
  familia: 'chasis',
  descripcion: 'Un robot de cuatro patas con 12 motores, como el Unitree Go2. El controlador de marcha mueve las patas solo: tu placa le da órdenes de alto nivel por el cable de red (caminar, girar, ir de costado, pararse, sentarse) y lee su sensor de distancia.',
  modelo: 'proc:perro-robot',
  // Modelo real del Unitree Go1, por partes (scripts/preparar-robots.mjs).
  glb: '/lab/modelos/perro-go1.glb',
  masa_g: 3000,
  material: 'aluminio',
  color: '#3f4650',
  colisionadores: [
    { forma: 'caja', medidas: [300, 70, 110], centro: [0, 35, 0] },
    // Cabeza con el sensor de profundidad al frente.
    { forma: 'caja', medidas: [60, 55, 70], centro: [170, 55, 0] },
    // Muslos: chocan con paredes y cajas; los pies se apoyan con la suspensión de cada pata.
    ...CADERAS.map(([x, y, z]) => ({ forma: 'caja' as const, medidas: [26, PATA_COLISION, 26] as V3, centro: [x, y - PATA_COLISION / 2, z] as V3, friccion: 0.2 })),
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa (en el lomo)', posicion: [-35, 72, 0], rotacionesPermitidas: [0, 180] },
    { id: 'cabeza', tipo: 'sensor-frontal', nombre: 'Cabeza (cámara)', posicion: [188, 82.5, 0] },
  ],
  encaja: [],
  pines: [
    { nombre: 'ETH', tipo: 'eth', ayuda: 'Cable de red: por aquí la placa le manda las órdenes de marcha y lee sus sensores' },
    { nombre: '5V', tipo: 'alim', ayuda: 'Salida de 5 V de la batería del perro para la placa' },
    { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra' },
  ],
  comportamiento: {
    tipo: 'cuadrupedo', caderas: CADERAS, muslo_mm: 100, pierna_mm: 100,
    alturas_mm: { parado: 160, echado: 80, sentado_adelante: 170, sentado_atras: 80 },
    v_max: 0.5, v_lateral_max: 0.25, giro_max_grados: 90,
    distancia: { origen: [200, 55, 0], alcance_cm: 200 },
  },
  datos: [
    ['Medidas', '36 × 15 cm (de pie, 25 cm de alto)'], ['Masa', '3 kg con batería'],
    ['Patas', '4 × 3 motores (cadera, muslo y rodilla); muslo y pierna de 10 cm'],
    ['Velocidad', 'Hasta 0,5 m/s adelante, 0,25 m/s de costado y 90°/s de giro'],
    ['Sensores', 'Distancia al frente (hasta 2 m) y orientación (giroscopio)'],
    ['Programación', 'Python con el módulo perro: pararse(), mover(vx, vy, giro), sentarse()…'],
  ],
  fuente: 'Proporciones y modos de marcha del Unitree Go2 (modo deportivo de alto nivel), a escala',
}
