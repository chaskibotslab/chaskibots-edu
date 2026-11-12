// Robots de combate con modelo real (diseños de competencia publicados con
// licencia CC BY): la carrocería, las ruedas y el arma salen del mismo modelo
// 3D, separados con scripts/preparar-robots.mjs, y cada uno es una pieza del
// catálogo con sus medidas reales. La electrónica va ADENTRO de la carrocería,
// como en un robot de combate de verdad (en «Cablear» se ve a través de ella).

import type { PiezaDef } from '../tipos'

const COLGADO: [number, number, number] = [180, 0, 0]

// ---------------------------------------------------------------------------
// «Abyss» (Floating Castle Robotics): tambor ancho al frente, dos ruedas a los
// costados y la electrónica dentro del tubo de atrás. Escala: ruedas de 60 mm.
// Marco del chasis: origen en el centro del eje de las ruedas; +x hacia el
// tambor; el piso queda en y = −30.
// ---------------------------------------------------------------------------

/** Brazos que sostienen el tambor y terminan en una púa: su punta hace de patín. */
export const BRAZOS_ABYSS = [-90, 0, 90].map(z => ({ medidas: [50, 26, 8] as [number, number, number], centro: [72, -15.5, z] as [number, number, number] }))

export const CHASIS_ABYSS: PiezaDef = {
  id: 'chasis-abyss',
  nombre: 'Carrocería «Abyss» (robot de tambor de competencia)',
  familia: 'chasis',
  descripcion: 'La carrocería de un robot de combate real: un tubo blindado que guarda la electrónica y tres brazos con púas que sostienen el tambor. Las púas rozan el piso y hacen de patín.',
  modelo: 'glb:abyss-casco',
  glb: '/lab/modelos/abyss-casco.glb',
  carcasa: true,
  masa_g: 420,
  material: 'plastico',
  color: '#15171a',
  colisionadores: [
    // El tubo de la electrónica (también marca hasta dónde pueden ir la placa, el driver y la batería).
    { forma: 'caja', medidas: [50, 54, 170] },
    ...BRAZOS_ABYSS.map(b => ({ forma: 'caja' as const, ...b, friccion: 0.15 })),
  ],
  montajes: [
    // Adentro del tubo, a lo largo: placa, driver y batería entre los dos motores.
    { id: 'placa', tipo: 'placa', nombre: 'Placa (adentro)', posicion: [0, -14, -30], rotacion: [0, 90, 0], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver (adentro)', posicion: [0, -14, 5], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería (adentro)', posicion: [0, -14, 37], rotacion: [0, 90, 0] },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [0, 0, -96.5], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [0, 0, 96.5] },
    { id: 'arma', tipo: 'arma', nombre: 'Tambor (entre los brazos)', posicion: [60, 0, 0] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [
    ['Medidas', '≈ 125 × 235 mm con ruedas, 60 mm de alto'], ['Material', 'Polietileno UHMW negro'],
    ['Apoyo', 'Dos ruedas atrás y las púas de los brazos adelante'], ['Categoría', 'Beetle: hasta 1,5 kg'],
  ],
  fuente: 'Diseño «Abyss» de Floating Castle Robotics (Sketchfab, CC BY), a escala de ruedas de 60 mm',
}

export const RUEDA_ABYSS: PiezaDef = {
  id: 'rueda-abyss',
  nombre: 'Rueda «Abyss» 60 mm (goma con dibujo)',
  familia: 'movimiento',
  descripcion: 'La rueda del robot Abyss: llanta ancha de goma con dibujo y rin de rayos. Agarra bien para empujar al rival.',
  modelo: 'glb:abyss-rueda',
  glb: '/lab/modelos/abyss-rueda.glb',
  masa_g: 28,
  material: 'goma',
  color: '#111827',
  colisionadores: [{ forma: 'cilindro', radio: 30, alto: 25, eje: 'z' }],
  montajes: [],
  encaja: ['eje-motor'],
  pines: [],
  comportamiento: { tipo: 'rueda', radio_mm: 30, ancho_mm: 25 },
  datos: [['Diámetro', '60 mm'], ['Ancho', '25 mm'], ['Llanta', 'Goma con dibujo']],
  fuente: 'Diseño «Abyss» de Floating Castle Robotics (Sketchfab, CC BY)',
}

export const TAMBOR_ABYSS: PiezaDef = {
  id: 'tambor-abyss',
  nombre: 'Tambor «Abyss» de 170 mm (dos barras de dientes)',
  familia: 'arma',
  descripcion: 'Un tambor tan ancho como el robot, con dos barras de dientes atornilladas. Gira de pie a 7000 rpm: su frente sube y lanza al rival por el aire. Casi no hay forma de esquivarlo de frente.',
  modelo: 'glb:abyss-tambor',
  glb: '/lab/modelos/abyss-tambor.glb',
  masa_g: 380,
  material: 'metal',
  colisionadores: [{ forma: 'cilindro', radio: 26, alto: 170, eje: 'z', friccion: 0.3 }],
  montajes: [],
  encaja: ['arma'],
  pines: [
    { nombre: 'SIG', tipo: 'pwm', ayuda: 'Señal del ESC: analogWrite(pin, 0) = quieta … 255 = máxima' },
    { nombre: 'BAT+', tipo: 'potencia', ayuda: 'El ESC toma la corriente directo de la batería (+)' },
    { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra común con la batería y la placa' },
  ],
  comportamiento: { tipo: 'arma-giratoria', giro: 'vertical', forma: 'tambor', rpm_max: 7000, radio_mm: 26, masa_barra_g: 300, tau_s: 1.1, alto_mm: 0, ancho_mm: 170 },
  datos: [['Tambor', 'Acero, 52 mm × 170 mm (300 g)'], ['Dientes', '2 barras atornilladas'], ['Velocidad', '≈ 7000 rpm a 7,4 V'], ['Energía', '≈ 27 J girando a fondo']],
  fuente: 'Diseño «Abyss» de Floating Castle Robotics (Sketchfab, CC BY)',
}
