// Robots de combate (battlebots, categoría escolar «beetle» de hasta 1,5 kg).
// El chasis es como el 2WD pero más largo, con una cuña de acero al frente y
// un poste para el arma. El arma giratoria es una barra de acero que hace
// girar un motor sin escobillas con su ESC: el ESC recibe una señal PWM de la
// placa (0 = quieta, 255 = máxima) y toma la corriente directo de la batería.

import type { PiezaDef } from '../tipos'

const ARRIBA = 1.5
const ABAJO = -1.5
const COLGADO: [number, number, number] = [180, 0, 0]
/** Con motores TT y ruedas de 65 mm el piso queda en y = −48 (igual que el 2WD). */
const PISO = -48

// Cuña: de la punta de la placa (x = 110) baja hasta el piso con 50° de inclinación.
const CUNA_GRADOS = 50
const CUNA_RUN = (-PISO - 0.5) / Math.tan((CUNA_GRADOS * Math.PI) / 180)
const CUNA_LARGO = Math.hypot(CUNA_RUN, -PISO - 0.5)
/** Centro y largo de la cuña (mm, marco del chasis): también los usa el modelo 3D. */
export const CUNA = { x: 110 + CUNA_RUN / 2, y: (PISO + 0.5) / 2, largo: CUNA_LARGO, grados: CUNA_GRADOS, ancho: 130 }

// 220 × 120 mm. Aluminio 2 mm → 143 g + cuña de acero 1,5 mm (≈ 75 g); PLA → 70 + 75 g.
export const CHASIS_BATTLEBOT: PiezaDef = {
  id: 'chasis-battlebot',
  nombre: 'Chasis battlebot con cuña',
  familia: 'chasis',
  descripcion: 'Base de 22 × 12 cm con una cuña de acero al frente y un poste para el arma giratoria. Para la arena de combate (hasta 1,5 kg).',
  modelo: 'proc:chasis-battlebot',
  masa_g: 218,
  material: 'aluminio',
  variantes: [
    { id: 'aluminio', nombre: 'Aluminio 2 mm', material: 'aluminio', masa_g: 218, color: '#b8bec6' },
    { id: 'pla', nombre: 'Impreso en 3D (PLA negro)', material: 'pla', masa_g: 145, color: '#1f2430' },
    { id: 'pla-rojo', nombre: 'Impreso en 3D (PLA rojo)', material: 'pla', masa_g: 145, color: '#b91c1c' },
  ],
  colisionadores: [
    { forma: 'caja', medidas: [220, 3, 120] },
    { forma: 'caja', medidas: [CUNA_LARGO, 1.5, CUNA.ancho], centro: [CUNA.x, CUNA.y, 0], rotacion: [0, 0, -CUNA_GRADOS], friccion: 0.15 },
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa', posicion: [5, ARRIBA + 10, 0], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver', posicion: [-80, ARRIBA, 0], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería', posicion: [-23, ABAJO, 0], rotacion: COLGADO },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [5, -15, -46], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [5, -15, 46] },
    { id: 'loca', tipo: 'rueda-loca', nombre: 'Rueda loca', posicion: [-95, ABAJO, 0], rotacion: COLGADO },
    { id: 'arma', tipo: 'arma', nombre: 'Arma (poste delantero)', posicion: [80, ARRIBA, 0] },
    { id: 'frente', tipo: 'sensor-frontal', nombre: 'Sensor frontal', posicion: [103, ARRIBA, 0] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [['Medidas', '220 × 120 mm + cuña de 50°'], ['Cuña', 'Acero 1,5 mm, el filo casi en el piso'], ['Tracción', '2 motores TT + rueda loca'], ['Categoría', 'Beetle escolar: hasta 1,5 kg']],
}

// Barra de acero de 130 × 20 × 6 mm (≈ 60 g) sobre un motor sin escobillas
// 2212 con ESC de 30 A. A 7,4 V gira a unas 6000 rpm sin carga.
export const ARMA_GIRATORIA: PiezaDef = {
  id: 'arma-giratoria',
  nombre: 'Arma giratoria (barra + motor con ESC)',
  familia: 'arma',
  descripcion: 'Una barra de acero que gira a miles de rpm. Guarda energía al girar y la descarga de golpe al tocar al rival. El ESC se maneja con un pin PWM: 0 = quieta, 255 = máxima.',
  modelo: 'proc:arma-giratoria',
  masa_g: 140,
  material: 'metal',
  colisionadores: [
    // Poste y motor; arriba, el círculo que barre la barra al girar.
    { forma: 'cilindro', radio: 12, alto: 38, eje: 'y', centro: [0, 19, 0] },
    { forma: 'cilindro', radio: 65, alto: 6, eje: 'y', centro: [0, 42, 0], friccion: 0.2 },
  ],
  montajes: [],
  encaja: ['arma'],
  pines: [
    { nombre: 'SIG', tipo: 'pwm', ayuda: 'Señal del ESC: analogWrite(pin, 0) = quieta … 255 = máxima' },
    { nombre: 'BAT+', tipo: 'potencia', ayuda: 'El ESC toma la corriente directo de la batería (+)' },
    { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra común con la batería y la placa' },
  ],
  comportamiento: { tipo: 'arma-giratoria', rpm_max: 6000, radio_mm: 65, masa_barra_g: 60, tau_s: 1.2, alto_mm: 42 },
  datos: [['Barra', 'Acero 130 × 20 × 6 mm (60 g)'], ['Motor', 'Sin escobillas 2212 + ESC 30 A'], ['Velocidad', '≈ 6000 rpm a 7,4 V'], ['Arranque', '≈ 1,2 s hasta la velocidad máxima'], ['Energía', '≈ 17 J girando a fondo']],
}

// ---------------------------------------------------------------------------
// Robots de combate «de verdad» (beetle de 1,5 kg): chasis blindado, motores de
// 22 mm con reductora metálica, ruedas de combate y armas que giran de pie.
// Marco del chasis: origen en el centro de la placa (4 mm de espesor); con
// ruedas de 60 mm el piso queda en y = −44.
// ---------------------------------------------------------------------------

const PISO_COMBATE = -44
const ARRIBA_C = 2

// Motor de 22 mm: origen sobre el eje en la cara de la reductora; el cuerpo
// (40 mm) queda hacia −z, adentro del robot, y el eje sale 6 mm hacia +z.
export const MOTOR_COMBATE: PiezaDef = {
  id: 'motor-combate',
  nombre: 'Motor 22 mm con reductora metálica (900 rpm)',
  familia: 'movimiento',
  descripcion: 'El motor de tracción de los robots de combate pequeños: caja de engranajes de metal que aguanta los golpes. Mucho más fuerte que el TT.',
  modelo: 'proc:motor-combate',
  masa_g: 55,
  material: 'metal',
  colisionadores: [{ forma: 'caja', medidas: [22, 22, 40], centro: [0, 0, -20] }],
  montajes: [{ id: 'eje', tipo: 'eje-motor', nombre: 'Eje', posicion: [0, 0, 6] }],
  encaja: ['soporte-motor'],
  pines: [
    { nombre: 'M+', tipo: 'potencia', ayuda: 'Terminal del motor (va a una salida del driver)' },
    { nombre: 'M-', tipo: 'potencia', ayuda: 'Terminal del motor (va a la otra salida del driver)' },
  ],
  comportamiento: { tipo: 'motor-dc', v_nominal: 7.4, rpm_sin_carga: 900, torque_bloqueo_nm: 0.3, zona_muerta_v: 0.5, tau_s: 0.05, corriente_a: 1.5 },
  datos: [['Voltaje', '7,4 V (LiPo 2S)'], ['Velocidad', '≈ 900 rpm'], ['Torque de bloqueo', '≈ 3 kg·cm'], ['Reductora', 'Planetaria de metal']],
  fuente: 'Motorreductor de 22 mm típico de la categoría beetle',
}

export const RUEDA_COMBATE: PiezaDef = {
  id: 'rueda-combate',
  nombre: 'Rueda de combate 60 mm (espuma y aluminio)',
  familia: 'movimiento',
  descripcion: 'Llanta de espuma maciza sobre un cubo de aluminio: no se pincha y absorbe los golpes. La de los robots de combate.',
  modelo: 'proc:rueda-combate',
  masa_g: 25,
  material: 'goma',
  color: '#111827',
  colisionadores: [{ forma: 'cilindro', radio: 30, alto: 22, eje: 'z' }],
  montajes: [],
  encaja: ['eje-motor'],
  pines: [],
  comportamiento: { tipo: 'rueda', radio_mm: 30, ancho_mm: 22 },
  datos: [['Diámetro', '60 mm'], ['Ancho', '22 mm'], ['Llanta', 'Espuma maciza'], ['Cubo', 'Aluminio']],
}

type P3 = [number, number, number]

/** Montajes que comparten los dos chasis blindados (tracción atrás, electrónica arriba). */
function montajesCombate(x: number, placaZ: number, driverZ: number): PiezaDef['montajes'] {
  return [
    { id: 'placa', tipo: 'placa', nombre: 'Placa', posicion: [x, ARRIBA_C + 10, placaZ], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver', posicion: [x, ARRIBA_C, driverZ], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería', posicion: [-62, ARRIBA_C, 0] },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [-45, -14, -62], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [-45, -14, 62] },
  ]
}

const VARIANTES_BLINDADO = (masa: number, masaUhmw: number): PiezaDef['variantes'] => [
  { id: 'aluminio', nombre: 'Aluminio 4 mm + horquillas de acero', material: 'aluminio', masa_g: masa, color: '#4b5563' },
  { id: 'uhmw', nombre: 'Polietileno UHMW 6 mm (negro)', material: 'plastico', masa_g: masaUhmw, color: '#1f2937' },
  { id: 'rojo', nombre: 'Aluminio anodizado rojo', material: 'aluminio', masa_g: masa, color: '#991b1b' },
]

/** Placa (136 × 110 mm) y horquillas de cada chasis: también las dibuja el modelo 3D. */
export const PLACA_COMBATE = { largo: 136, ancho: 110, centroX: -20 }
// Las horquillas del tambor bajan hasta 2 mm del piso: su punta hace de patín
// (poco roce) y el robot se apoya en ellas y en las ruedas de atrás, como los
// tambores de competencia (su centro de masa queda adelante, cerca del tambor).
export const HORQUILLAS_TAMBOR: { medidas: P3; centro: P3 }[] = [
  { medidas: [68, 48, 6], centro: [74, -18, -58] },
  { medidas: [68, 48, 6], centro: [74, -18, 58] },
]
/** Patines delanteros del disco (bajo roce): el robot se apoya en ellos y en las ruedas. */
export const PATINES_DISCO: { medidas: P3; centro: P3 }[] = [
  { medidas: [30, 40, 10], centro: [60, -22, -42] },
  { medidas: [30, 40, 10], centro: [60, -22, 42] },
]
export const HORQUILLAS_DISCO: { medidas: P3; centro: P3 }[] = [
  { medidas: [50, 32, 4], centro: [72, 18, -12] },
  { medidas: [50, 32, 4], centro: [72, 18, 12] },
]

// Tambor: la placa termina antes del tambor y dos horquillas de acero lo
// sostienen. Aluminio 4 mm (160 g) + horquillas (230 g).
export const CHASIS_TAMBOR: PiezaDef = {
  id: 'chasis-tambor',
  nombre: 'Chasis blindado para tambor',
  familia: 'chasis',
  descripcion: 'Placa de aluminio de 4 mm con dos horquillas de acero al frente que sostienen el tambor. Tracción atrás; adelante se apoya en patines de poco roce.',
  modelo: 'proc:chasis-tambor',
  masa_g: 390,
  material: 'aluminio',
  variantes: VARIANTES_BLINDADO(390, 300),
  colisionadores: [
    { forma: 'caja', medidas: [PLACA_COMBATE.largo, 4, PLACA_COMBATE.ancho], centro: [PLACA_COMBATE.centroX, 0, 0] },
    ...HORQUILLAS_TAMBOR.map(h => ({ forma: 'caja' as const, ...h, friccion: 0.15 })),
  ],
  montajes: [
    ...montajesCombate(-15, -22, 25),
    { id: 'arma', tipo: 'arma', nombre: 'Tambor (entre las horquillas)', posicion: [80, PISO_COMBATE + 32, 0] },
    { id: 'frente', tipo: 'sensor-frontal', nombre: 'Sensor frontal', posicion: [36, ARRIBA_C, 0] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [['Medidas', '≈ 196 × 158 mm con ruedas'], ['Placa', 'Aluminio 4 mm'], ['Horquillas', 'Acero 6 mm'], ['Categoría', 'Beetle: hasta 1,5 kg']],
}

// Disco vertical: la placa es entera atrás (x < 0, ahí va la electrónica) y
// adelante tiene una ranura al centro por donde pasa el disco, sostenido por
// dos horquillas sobre la placa.
export const CHASIS_DISCO: PiezaDef = {
  id: 'chasis-disco',
  nombre: 'Chasis blindado para disco vertical',
  familia: 'chasis',
  descripcion: 'Placa con una ranura al centro para el disco y dos horquillas de acero que sostienen su eje. Tracción atrás; adelante se apoya en patines de poco roce.',
  modelo: 'proc:chasis-disco',
  masa_g: 360,
  material: 'aluminio',
  variantes: VARIANTES_BLINDADO(360, 280),
  colisionadores: [
    { forma: 'caja', medidas: [88, 4, PLACA_COMBATE.ancho], centro: [-44, 0, 0] },
    { forma: 'caja', medidas: [48, 4, 47], centro: [24, 0, -31.5] },
    { forma: 'caja', medidas: [48, 4, 47], centro: [24, 0, 31.5] },
    ...HORQUILLAS_DISCO.map(h => ({ forma: 'caja' as const, ...h })),
    ...PATINES_DISCO.map(h => ({ forma: 'caja' as const, ...h, friccion: 0.15 })),
  ],
  montajes: [
    ...montajesCombate(-25, -28, 28),
    { id: 'arma', tipo: 'arma', nombre: 'Disco (en la ranura)', posicion: [72, PISO_COMBATE + 63, 0] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [['Medidas', '≈ 200 × 158 mm con ruedas'], ['Placa', 'Aluminio 4 mm con ranura'], ['Horquillas', 'Acero 4 mm'], ['Categoría', 'Beetle: hasta 1,5 kg']],
}

const PINES_ESC: PiezaDef['pines'] = [
  { nombre: 'SIG', tipo: 'pwm', ayuda: 'Señal del ESC: analogWrite(pin, 0) = quieta … 255 = máxima' },
  { nombre: 'BAT+', tipo: 'potencia', ayuda: 'El ESC toma la corriente directo de la batería (+)' },
  { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra común con la batería y la placa' },
]

// Tambor de acero de 56 mm × 100 mm (250 g) con el motor sin escobillas adentro.
export const ARMA_TAMBOR: PiezaDef = {
  id: 'arma-tambor',
  nombre: 'Tambor giratorio de acero (motor adentro)',
  familia: 'arma',
  descripcion: 'Un cilindro de acero con dientes que gira de pie a 7000 rpm: golpea al rival por abajo y lo lanza por el aire. El arma más común en las competencias.',
  modelo: 'proc:arma-tambor',
  masa_g: 330,
  material: 'metal',
  colisionadores: [{ forma: 'cilindro', radio: 28, alto: 100, eje: 'z', friccion: 0.3 }],
  montajes: [],
  encaja: ['arma'],
  pines: PINES_ESC,
  comportamiento: { tipo: 'arma-giratoria', giro: 'vertical', forma: 'tambor', rpm_max: 7000, radio_mm: 28, masa_barra_g: 250, tau_s: 1, alto_mm: 0, ancho_mm: 100 },
  datos: [['Tambor', 'Acero, 56 mm × 100 mm (250 g)'], ['Dientes', '2 hileras'], ['Velocidad', '≈ 7000 rpm a 7,4 V'], ['Energía', '≈ 26 J girando a fondo']],
}

// Disco de acero de 110 mm × 8 mm (300 g) con su motor al costado del eje.
export const ARMA_DISCO: PiezaDef = {
  id: 'arma-disco',
  nombre: 'Disco vertical de acero (110 mm)',
  familia: 'arma',
  descripcion: 'Un disco grueso con dos dientes que gira de pie en el centro del robot. Más lento que el tambor pero con la masa lejos del eje: cada golpe pega fuerte.',
  modelo: 'proc:arma-disco',
  masa_g: 380,
  material: 'metal',
  colisionadores: [
    { forma: 'cilindro', radio: 55, alto: 8, eje: 'z', friccion: 0.3 },
    { forma: 'cilindro', radio: 12, alto: 18, eje: 'z' },
  ],
  montajes: [],
  encaja: ['arma'],
  pines: PINES_ESC,
  comportamiento: { tipo: 'arma-giratoria', giro: 'vertical', forma: 'disco', rpm_max: 3500, radio_mm: 55, masa_barra_g: 300, tau_s: 1.4, alto_mm: 0, ancho_mm: 8 },
  datos: [['Disco', 'Acero, 110 × 8 mm (300 g)'], ['Dientes', '2'], ['Velocidad', '≈ 3500 rpm a 7,4 V'], ['Energía', '≈ 30 J girando a fondo']],
}
