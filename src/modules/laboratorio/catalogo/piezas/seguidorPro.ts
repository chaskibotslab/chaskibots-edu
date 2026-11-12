// Seguidor de línea de competencia con modelo real («Line Follower Robot» de
// zoe.goodward, CC BY): base de acrílico en T, piso de arriba para la
// electrónica, micromotores N20, ruedas Pololu de 42 mm, rueda loca de bola y
// una barra de sensores al frente, a 5 mm del piso.
// Marco del chasis: origen en el centro de la base; +x hacia la barra de
// sensores; con ruedas de 42 mm el piso queda en y = −14,5.

import type { PiezaDef } from '../tipos'

const COLGADO: [number, number, number] = [180, 0, 0]
/** Cara de arriba de la base (3 mm) y del piso de arriba (a 23 mm). */
const SOBRE_BASE = 1.5
const SOBRE_PISO = 24.5
/** Barra de sensores: su centro (x) y la cara de abajo (y). */
export const BARRA_SENSORES = { x: 54, abajo: -10.2 }

export const CHASIS_SEGUIDOR_PRO: PiezaDef = {
  id: 'chasis-seguidor-pro',
  nombre: 'Chasis de seguidor de competencia (con barra de sensores)',
  familia: 'chasis',
  descripcion: 'El chasis de los seguidores de línea de carrera: liviano, bajo, con los motores atrás y una barra de sensores bien adelante para ver la curva antes de llegar. La electrónica va en el piso de arriba.',
  modelo: 'glb:seguidor-pro-chasis',
  glb: '/lab/modelos/seguidor-pro-chasis.glb',
  masa_g: 70,
  material: 'acrilico',
  color: '#d4d4d8',
  colisionadores: [
    { forma: 'caja', medidas: [120, 3, 146] },
    { forma: 'caja', medidas: [64, 3, 66], centro: [-27, 23, 0] },
    { forma: 'caja', medidas: [26, 1.6, 140], centro: [BARRA_SENSORES.x, BARRA_SENSORES.abajo + 0.8, 0] },
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa (piso de arriba)', posicion: [-27, SOBRE_PISO + 10, -13], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver (piso de arriba)', posicion: [-27, SOBRE_PISO, 16], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería (entre los dos pisos)', posicion: [-27, SOBRE_BASE, 0] },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [-36, 6.5, -80.35], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [-36, 6.5, 80.35] },
    { id: 'loca', tipo: 'rueda-loca', nombre: 'Rueda loca', posicion: [29, -SOBRE_BASE, 0], rotacion: COLGADO },
    { id: 'piso-izq', tipo: 'sensor-piso', nombre: 'Sensor de línea izquierdo', posicion: [BARRA_SENSORES.x, BARRA_SENSORES.abajo, -14] },
    { id: 'piso-der', tipo: 'sensor-piso', nombre: 'Sensor de línea derecho', posicion: [BARRA_SENSORES.x, BARRA_SENSORES.abajo, 14] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [
    ['Medidas', '≈ 127 × 196 mm con ruedas'], ['Base', 'Acrílico de 3 mm en forma de T'],
    ['Sensores', 'Barra al frente, a 5 mm del piso y 90 mm delante del eje'], ['Tracción', '2 micromotores N20 + rueda loca de bola'],
  ],
  fuente: 'Diseño «Line Follower Robot» de zoe.goodward (Sketchfab, CC BY)',
}

export const RUEDA_42: PiezaDef = {
  id: 'rueda-42',
  nombre: 'Rueda 42 × 19 mm de goma (para N20)',
  familia: 'movimiento',
  descripcion: 'Rueda de goma con dibujo para micromotores N20 (eje en D de 3 mm). La de los seguidores de línea rápidos.',
  modelo: 'proc:rueda',
  glb: '/lab/modelos/rueda-42.glb',
  masa_g: 9,
  material: 'goma',
  color: '#1f2937',
  colisionadores: [{ forma: 'cilindro', radio: 21, alto: 19, eje: 'z' }],
  montajes: [],
  encaja: ['eje-motor'],
  pines: [],
  comportamiento: { tipo: 'rueda', radio_mm: 21, ancho_mm: 19 },
  datos: [['Diámetro', '42 mm'], ['Ancho', '19 mm'], ['Llanta', 'Goma con dibujo'], ['Eje', 'En D de 3 mm']],
  fuente: 'Modelo «Line Follower Robot» de zoe.goodward (Sketchfab, CC BY)',
}

export const RUEDA_LOCA_CHICA: PiezaDef = {
  id: 'rueda-loca-chica',
  nombre: 'Rueda loca de bola de 1/2"',
  familia: 'movimiento',
  descripcion: 'Una bola de acero de 12,7 mm que gira libre: sostiene el frente de los robots bajos sin frenar las curvas.',
  modelo: 'proc:rueda-loca',
  masa_g: 5,
  material: 'metal',
  colisionadores: [{ forma: 'esfera', radio: 6.35 }],
  montajes: [],
  encaja: ['rueda-loca'],
  pines: [],
  comportamiento: { tipo: 'rueda-loca', radio_mm: 6.35 },
  datos: [['Bola', '12,7 mm de acero']],
}

// Sensor de la barra: el mismo principio que el TCRT5000 (un LED infrarrojo y
// un fototransistor que mira el piso), pero diminuto y soldado en la barra.
// Origen en su cara de abajo (la que mira al piso).
export const SENSOR_BARRA: PiezaDef = {
  id: 'sensor-linea-barra',
  nombre: 'Sensor de línea de la barra (QRE1113)',
  familia: 'sensor',
  descripcion: 'Un sensor infrarrojo diminuto soldado en la barra: mira el piso desde 5 mm y distingue la línea negra del fondo blanco. Funciona igual que el TCRT5000.',
  modelo: 'proc:sensor-barra',
  masa_g: 1,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [5, 3, 4], centro: [0, 1.5, 0] }],
  montajes: [],
  encaja: ['sensor-piso'],
  pines: [
    { nombre: 'VCC', tipo: 'alim', ayuda: '3,3–5 V' },
    { nombre: 'GND', tipo: 'gnd' },
    { nombre: 'DO', tipo: 'digital', ayuda: 'HIGH sobre negro, LOW sobre blanco' },
    { nombre: 'AO', tipo: 'analogico', ayuda: 'Sube cuanto más oscuro es el piso' },
  ],
  comportamiento: { tipo: 'ir-reflectivo', umbral: 0.5, altura_max_mm: 12, radio_lectura_mm: 2 },
  datos: [['Distancia al piso', '1–12 mm'], ['Salidas', 'Digital (DO) y analógica (AO)']],
}
