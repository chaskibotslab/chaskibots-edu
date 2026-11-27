// Minisumo con modelo real («Micro sumo paladin» de matheus.nfranca97, CC BY):
// carrocería impresa de 10 × 10 cm con rampa al frente, ventana para los
// sensores y una placa arriba para la electrónica. Las ruedas van ADENTRO,
// protegidas por las paredes, como en los minisumos de competencia.
// Marco del chasis: origen en el centro del eje de las ruedas; +x hacia la
// rampa; con ruedas de 31 mm el piso queda en y = −15,5.

import type { PiezaDef } from '../tipos'

const COLGADO: [number, number, number] = [180, 0, 0]
/** Cara de arriba de la cuna de los motores (adentro) y de la placa de arriba. */
const SOBRE_CUNA = 21.5
const SOBRE_TAPA = 49

export const CHASIS_PALADIN: PiezaDef = {
  id: 'chasis-paladin',
  nombre: 'Carrocería «Paladín» (minisumo de competencia)',
  familia: 'chasis',
  descripcion: 'La carrocería de un minisumo de torneo: cerrada, baja y con una rampa que se mete debajo del rival. Las ruedas y los motores van adentro; los sensores miran por la ventana del frente.',
  modelo: 'glb:paladin-casco',
  glb: '/lab/modelos/paladin-casco.glb',
  carcasa: true,
  masa_g: 150,
  material: 'pla',
  color: '#2b2d31',
  colisionadores: [
    // La caja de atrás (deja 2,5 mm al piso), la cara inclinada y la rampa, con el filo a 1 mm del piso.
    { forma: 'caja', medidas: [55, 56, 100], centro: [-10, 15, 0] },
    { forma: 'caja', medidas: [3, 54, 100], centro: [29.5, 17, 0], rotacion: [0, 0, 28] },
    { forma: 'caja', medidas: [20, 1.5, 100], centro: [50.8, -9.5, 0], rotacion: [0, 0, -30], friccion: 0.15 },
  ],
  // El casco por dentro (medido del modelo): piso, paredes, la bandeja de los motores y la tapa.
  // Los cables bajan por los costados de la tapa, cruzan la bandeja y llegan a los sensores de borde
  // por un agujero en la pared de adelante.
  paredes: [
    { forma: 'caja', medidas: [78, 6, 100], centro: [1, -18, 0] },                        // piso
    { forma: 'caja', medidas: [4, 62, 100], centro: [-35, 14, 0] },                       // pared de atrás
    { forma: 'caja', medidas: [78, 60, 4], centro: [1, 13, -50] },                        // costados
    { forma: 'caja', medidas: [78, 60, 4], centro: [1, 13, 50] },
    { forma: 'caja', medidas: [60, 2, 96], centro: [-1, 20, 0] },                         // bandeja de los motores
    { forma: 'caja', medidas: [56, 2, 54], centro: [-9, 48, 0] },                         // tapa de arriba
    { forma: 'caja', medidas: [4, 30, 100], centro: [34.6, 6.5, 0], rotacion: [0, 0, 28] }, // cara inclinada (abajo)
    { forma: 'caja', medidas: [4, 25, 23], centro: [22, 31, -38.5], rotacion: [0, 0, 28] }, // pilares de la ventana
    { forma: 'caja', medidas: [4, 25, 23], centro: [22, 31, 38.5], rotacion: [0, 0, 28] },
    { forma: 'caja', medidas: [4, 5, 54], centro: [18, 40, 0], rotacion: [0, 0, 28] },    // dintel de la ventana
    { forma: 'caja', medidas: [5, 18, 100], centro: [37, -8, 0] },                        // pared de adelante (abajo)
    { forma: 'caja', medidas: [24, 3, 100], centro: [51.5, -8.5, 0], rotacion: [0, 0, -30] }, // rampa
    { forma: 'caja', medidas: [22, 14, 4], centro: [50, -10, -50] },                      // costados de la rampa
    { forma: 'caja', medidas: [22, 14, 4], centro: [50, -10, 50] },
  ],
  pasosCable: [
    { de: [24, -1, -39], a: [41, -7, -39], radio: 8 },
    { de: [24, -1, 39], a: [41, -7, 39], radio: 8 },
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa (arriba)', posicion: [-11, SOBRE_TAPA + 10, -13], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver (arriba)', posicion: [-11, SOBRE_TAPA, 15], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería (adentro)', posicion: [-23.5, SOBRE_CUNA, 0], rotacion: [0, 90, 0] },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [0, 0, -27.5], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [0, 0, 27.5] },
    // Detrás de la ventana del frente: el ultrasonido al centro y un IR a cada lado.
    // Entre la batería y el ultrasonido queda lugar para los conectores de sus cables.
    { id: 'frente', tipo: 'sensor-frontal', nombre: 'Sensor frontal (en la ventana)', posicion: [4, SOBRE_CUNA, 0] },
    { id: 'frente-izq', tipo: 'sensor-frontal', nombre: 'Sensor frontal izquierdo', posicion: [-16, 30, -30] },
    { id: 'frente-der', tipo: 'sensor-frontal', nombre: 'Sensor frontal derecho', posicion: [-16, 30, 30] },
    // Debajo de la rampa, bien adelante: ven el borde antes que las ruedas.
    { id: 'piso-izq', tipo: 'sensor-piso', nombre: 'Sensor de borde izquierdo', posicion: [44, -12, -39] },
    { id: 'piso-der', tipo: 'sensor-piso', nombre: 'Sensor de borde derecho', posicion: [44, -12, 39] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [
    ['Medidas', '98 × 100 mm, 65 mm de alto'], ['Material', 'Impreso en 3D (PLA negro)'],
    ['Rampa', 'Al frente, con el filo a 1 mm del piso'], ['Reglamento', 'Minisumo: ≤ 10 × 10 cm, ≤ 500 g'],
  ],
  fuente: 'Diseño «Micro sumo paladin» de matheus.nfranca97 (Sketchfab, CC BY)',
}

export const RUEDA_31: PiezaDef = {
  id: 'rueda-31',
  nombre: 'Rueda 31 × 15 mm de silicona (minisumo)',
  familia: 'movimiento',
  descripcion: 'Rueda ancha y chica con llanta de silicona: la de los minisumos de torneo. Más agarre y más fuerza de empuje que una rueda grande.',
  modelo: 'proc:rueda',
  glb: '/lab/modelos/rueda-31.glb',
  masa_g: 8,
  material: 'goma',
  color: '#1f2937',
  colisionadores: [{ forma: 'cilindro', radio: 15.5, alto: 15, eje: 'z' }],
  montajes: [],
  encaja: ['eje-motor'],
  pines: [],
  comportamiento: { tipo: 'rueda', radio_mm: 15.5, ancho_mm: 15 },
  datos: [['Diámetro', '31 mm'], ['Ancho', '15 mm'], ['Llanta', 'Silicona']],
  fuente: 'Modelo «Micro sumo paladin» de matheus.nfranca97 (Sketchfab, CC BY)',
}
