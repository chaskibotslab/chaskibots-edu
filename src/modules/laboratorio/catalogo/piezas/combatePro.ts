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

// ---------------------------------------------------------------------------
// «RipTide» (Floating Castle Robotics): un tambor enorme de tres tramos entre
// dos brazos, ruedas atrás y dos patines que llegan hasta delante del tambor.
// Escala: ruedas de 60 mm. Marco: origen en el centro del eje de las ruedas;
// +x hacia el tambor; el piso queda en y = −30.
// ---------------------------------------------------------------------------

export const CHASIS_RIPTIDE: PiezaDef = {
  id: 'chasis-riptide',
  nombre: 'Carrocería «RipTide» (tambor gigante)',
  familia: 'chasis',
  descripcion: 'Un tubo que guarda la electrónica, dos brazos que sostienen un tambor casi tan grande como el robot y dos patines largos que lo apoyan adelante y se meten debajo del rival.',
  modelo: 'glb:riptide-casco',
  glb: '/lab/modelos/riptide-casco.glb',
  carcasa: true,
  masa_g: 380,
  material: 'plastico',
  color: '#8fd9c3',
  colisionadores: [
    { forma: 'caja', medidas: [57, 48, 200], centro: [1, -5, 0] },
    ...[-80, 80].map(z => ({ forma: 'caja' as const, medidas: [140, 8, 28] as [number, number, number], centro: [75, -25, z] as [number, number, number], friccion: 0.15 })),
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa (adentro)', posicion: [1, -24, -30], rotacion: [0, 90, 0], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver (adentro)', posicion: [1, -24, 5], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería (adentro)', posicion: [1, -24, 37], rotacion: [0, 90, 0] },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [0, 0, -111.5], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [0, 0, 111.5] },
    { id: 'arma', tipo: 'arma', nombre: 'Tambor (entre los brazos)', posicion: [92.5, 20, 0] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [
    ['Medidas', '≈ 175 × 260 mm con ruedas, 100 mm de alto'], ['Apoyo', 'Dos ruedas atrás y dos patines adelante'],
    ['Categoría', 'Beetle: hasta 1,5 kg'],
  ],
  fuente: 'Diseño «RipTide» de Floating Castle Robotics (Sketchfab, CC BY), a escala de ruedas de 60 mm',
}

export const RUEDA_RIPTIDE: PiezaDef = {
  id: 'rueda-riptide',
  nombre: 'Rueda «RipTide» 60 mm (rin de colores)',
  familia: 'movimiento',
  descripcion: 'Rueda de goma con dibujo y un rin de gajos de colores: al girar se ve qué tan rápido va.',
  modelo: 'proc:rueda',
  glb: '/lab/modelos/riptide-rueda.glb',
  masa_g: 28,
  material: 'goma',
  color: '#a3b81a',
  colisionadores: [{ forma: 'cilindro', radio: 30, alto: 24, eje: 'z' }],
  montajes: [],
  encaja: ['eje-motor'],
  pines: [],
  comportamiento: { tipo: 'rueda', radio_mm: 30, ancho_mm: 24 },
  datos: [['Diámetro', '60 mm'], ['Ancho', '24 mm'], ['Llanta', 'Goma con dibujo']],
  fuente: 'Diseño «RipTide» de Floating Castle Robotics (Sketchfab, CC BY)',
}

export const TAMBOR_RIPTIDE: PiezaDef = {
  id: 'tambor-riptide',
  nombre: 'Tambor «RipTide» de 3 tramos (200 mm)',
  familia: 'arma',
  descripcion: 'Un tambor ovalado en tres tramos: al girar de pie, sus bordes largos golpean hacia arriba y lanzan al rival. Pesa mucho: tarda en tomar velocidad, pero guarda mucha energía.',
  modelo: 'glb:riptide-tambor',
  glb: '/lab/modelos/riptide-tambor.glb',
  escalaGlb: 0.78,
  masa_g: 420,
  material: 'metal',
  colisionadores: [{ forma: 'cilindro', radio: 33, alto: 196, eje: 'z', friccion: 0.3 }],
  montajes: [],
  encaja: ['arma'],
  pines: [
    { nombre: 'SIG', tipo: 'pwm', ayuda: 'Señal del ESC: analogWrite(pin, 0) = quieta … 255 = máxima' },
    { nombre: 'BAT+', tipo: 'potencia', ayuda: 'El ESC toma la corriente directo de la batería (+)' },
    { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra común con la batería y la placa' },
  ],
  comportamiento: { tipo: 'arma-giratoria', giro: 'vertical', forma: 'tambor', rpm_max: 5500, radio_mm: 35, masa_barra_g: 340, tau_s: 1.4, alto_mm: 0, ancho_mm: 196 },
  datos: [['Tambor', 'Ovalado, 3 tramos, ≈ 70 × 200 mm (340 g)'], ['Velocidad', '≈ 5500 rpm a 7,4 V'], ['Arranque', '≈ 1,4 s hasta girar a fondo']],
  fuente: 'Diseño «RipTide» de Floating Castle Robotics (Sketchfab, CC BY)',
}

// ---------------------------------------------------------------------------
// «Fathom» (Floating Castle Robotics): un tiburón con arpón, de cuatro ruedas
// motrices. No tiene arma giratoria: gana empujando al rival al pozo.
// Escala: 20 cm de ancho. Marco: origen entre los dos ejes, a la altura de las
// ruedas; +x hacia el arpón; el piso queda en y = −27.
// ---------------------------------------------------------------------------

export const CHASIS_FATHOM: PiezaDef = {
  id: 'chasis-fathom',
  nombre: 'Carrocería «Fathom» (tiburón con arpón, 4 ruedas)',
  familia: 'chasis',
  descripcion: 'Un robot de combate con forma de tiburón: carrocería baja con cuatro ruedas motrices y un arpón al frente. No corta ni golpea: empuja con toda su tracción.',
  modelo: 'glb:fathom-casco',
  glb: '/lab/modelos/fathom-casco.glb',
  carcasa: true,
  masa_g: 900,
  material: 'plastico',
  color: '#1b1c1f',
  colisionadores: [
    { forma: 'caja', medidas: [185, 62, 120], centro: [7, 11, 0] },
    { forma: 'caja', medidas: [70, 8, 30], centro: [142, -1, 0], friccion: 0.2 },
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa (adentro)', posicion: [-25, -14, 0], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver (adentro)', posicion: [12, -14, 0], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería (adentro)', posicion: [38, -14, 0], rotacion: [0, 90, 0] },
    { id: 'motor-del-izq', tipo: 'soporte-motor', nombre: 'Motor delantero izquierdo', posicion: [65, 0, -70.5], rotacion: COLGADO },
    { id: 'motor-tra-izq', tipo: 'soporte-motor', nombre: 'Motor trasero izquierdo', posicion: [-65, 0, -70.5], rotacion: COLGADO },
    { id: 'motor-del-der', tipo: 'soporte-motor', nombre: 'Motor delantero derecho', posicion: [65, 0, 70.5] },
    { id: 'motor-tra-der', tipo: 'soporte-motor', nombre: 'Motor trasero derecho', posicion: [-65, 0, 70.5] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [
    ['Medidas', '≈ 275 × 205 mm con el arpón, 90 mm de alto'], ['Tracción', '4 ruedas motrices'],
    ['Arma', 'Arpón fijo: empuja, no golpea'], ['Categoría', 'Beetle: hasta 1,5 kg'],
  ],
  fuente: 'Diseño «Fathom» de Floating Castle Robotics (Sketchfab, CC BY), a escala de 20 cm de ancho',
}

export const RUEDA_FATHOM: PiezaDef = {
  id: 'rueda-fathom',
  nombre: 'Rueda «Fathom» 54 mm (banda blanca)',
  familia: 'movimiento',
  descripcion: 'Rueda ancha de auto clásico, con banda blanca. Cuatro de estas le dan al robot mucha tracción para empujar.',
  modelo: 'proc:rueda',
  glb: '/lab/modelos/fathom-rueda.glb',
  masa_g: 24,
  material: 'goma',
  color: '#111827',
  colisionadores: [{ forma: 'cilindro', radio: 27, alto: 27, eje: 'z' }],
  montajes: [],
  encaja: ['eje-motor'],
  pines: [],
  comportamiento: { tipo: 'rueda', radio_mm: 27, ancho_mm: 27 },
  datos: [['Diámetro', '54 mm'], ['Ancho', '27 mm'], ['Llanta', 'Goma']],
  fuente: 'Diseño «Fathom» de Floating Castle Robotics (Sketchfab, CC BY)',
}

// ---------------------------------------------------------------------------
// «Cuña» (Ant Weight Battle Bot de WilliamMezitis): una caja con tapa, dos
// ruedas grandes y una pala curva al frente. El robot se apoya en el filo de
// la pala. Marco: origen en el centro del eje; +x hacia la pala; piso en y = −34,5.
// ---------------------------------------------------------------------------

export const CHASIS_CUNA: PiezaDef = {
  id: 'chasis-cuna',
  nombre: 'Carrocería «Cuña» (pala curva)',
  familia: 'chasis',
  descripcion: 'El robot de combate más simple y uno de los más difíciles de vencer: una caja cerrada, dos ruedas grandes y una pala que se mete debajo del rival y lo lleva hasta el pozo.',
  modelo: 'glb:cuna-casco',
  glb: '/lab/modelos/cuna-casco.glb',
  carcasa: true,
  masa_g: 460,
  material: 'pla',
  color: '#e3c400',
  colisionadores: [
    { forma: 'caja', medidas: [90, 53, 90], centro: [-13, 1.5, 0] },
    // La pala de acero: pesa tanto como la caja, para que el peso quede adelante y el robot se apoye en su filo.
    { forma: 'caja', medidas: [66, 12, 90], centro: [57, -1, 0], rotacion: [0, 0, -50], friccion: 0.15 },
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa (adentro)', posicion: [-45, -22, 0], rotacion: [0, 90, 0], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver (adentro)', posicion: [-23, -22, 0], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería (adentro, adelante)', posicion: [21, -22, 0], rotacion: [0, 90, 0] },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [0, 0, -53.2], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [0, 0, 53.2] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [
    ['Medidas', '≈ 140 × 150 mm con ruedas, 70 mm de alto'], ['Material', 'Caja impresa en 3D y pala de acero'],
    ['Arma', 'Pala curva: levanta y empuja'], ['Categoría', 'Antweight / beetle liviano'],
  ],
  fuente: 'Diseño «Ant Weight Battle Bot» de WilliamMezitis (Sketchfab, CC BY)',
}

export const RUEDA_CUNA: PiezaDef = {
  id: 'rueda-cuna',
  nombre: 'Rueda 69 mm todoterreno (rin de 5 rayos)',
  familia: 'movimiento',
  descripcion: 'Rueda grande con dibujo profundo. Al ser más alta que la carrocería, el robot sigue andando aunque lo den vuelta.',
  modelo: 'proc:rueda',
  glb: '/lab/modelos/cuna-rueda.glb',
  masa_g: 30,
  material: 'goma',
  color: '#9ca3af',
  colisionadores: [{ forma: 'cilindro', radio: 34.4, alto: 30, eje: 'z' }],
  montajes: [],
  encaja: ['eje-motor'],
  pines: [],
  comportamiento: { tipo: 'rueda', radio_mm: 34.4, ancho_mm: 30 },
  datos: [['Diámetro', '69 mm'], ['Ancho', '30 mm'], ['Llanta', 'Goma con dibujo profundo']],
  fuente: 'Modelo «Ant Weight Battle Bot» de WilliamMezitis (Sketchfab, CC BY)',
}
