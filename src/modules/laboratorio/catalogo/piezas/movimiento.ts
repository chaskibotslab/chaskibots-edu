// Motores y ruedas.
// Motor: origen sobre el eje de salida; el eje sale hacia +z (afuera).
// Rueda: origen en su centro; gira alrededor de z.

import type { PiezaDef } from '../tipos'

export const MOTOR_TT: PiezaDef = {
  id: 'motor-tt',
  nombre: 'Motor TT con reductora 1:48',
  familia: 'movimiento',
  descripcion: 'El motor amarillo de casi todos los kits. Lento pero con fuerza gracias a su reductora.',
  modelo: 'proc:motor-tt',
  glb: '/lab/modelos/motor-tt.glb',
  masa_g: 30,
  material: 'plastico',
  colisionadores: [{ forma: 'caja', medidas: [65, 22, 19], centro: [-8, 0, 0] }],
  montajes: [{ id: 'eje', tipo: 'eje-motor', nombre: 'Eje', posicion: [0, 0, 24] }],
  encaja: ['soporte-motor'],
  pines: [
    { nombre: 'M+', tipo: 'potencia', ayuda: 'Terminal del motor (va a una salida del driver)' },
    { nombre: 'M-', tipo: 'potencia', ayuda: 'Terminal del motor (va a la otra salida del driver)' },
  ],
  comportamiento: { tipo: 'motor-dc', v_nominal: 6, rpm_sin_carga: 200, torque_bloqueo_nm: 0.08, zona_muerta_v: 1, tau_s: 0.08, corriente_a: 0.25 },
  datos: [['Voltaje', '3–6 V'], ['Velocidad', '≈ 200 rpm a 6 V'], ['Torque de bloqueo', '≈ 0,8 kg·cm'], ['Corriente', '≈ 250 mA andando']],
  fuente: 'Motor DC TT 1:48, datos típicos de fabricante',
}

const ruedaBase = {
  familia: 'movimiento' as const,
  montajes: [],
  encaja: ['eje-motor' as const],
  pines: [],
}

export const RUEDA_65: PiezaDef = {
  ...ruedaBase,
  id: 'rueda-65',
  nombre: 'Rueda 65 mm de goma',
  descripcion: 'La rueda de los kits: llanta de goma con buen agarre.',
  modelo: 'proc:rueda',
  glb: '/lab/modelos/rueda-65.glb',
  masa_g: 15,
  material: 'goma',
  color: '#1f2937',
  colisionadores: [{ forma: 'cilindro', radio: 33, alto: 26, eje: 'z' }],
  comportamiento: { tipo: 'rueda', radio_mm: 33, ancho_mm: 26 },
  datos: [['Diámetro', '66 mm'], ['Ancho', '26 mm'], ['Llanta', 'Goma (agarra mucho)']],
}

export const RUEDA_65_PLASTICO: PiezaDef = {
  ...ruedaBase,
  id: 'rueda-65-plastico',
  nombre: 'Rueda 65 mm de plástico',
  descripcion: 'Sin llanta de goma: más liviana, pero patina el doble.',
  modelo: 'proc:rueda',
  masa_g: 11,
  material: 'plastico',
  color: '#facc15',
  colisionadores: [{ forma: 'cilindro', radio: 33, alto: 26, eje: 'z' }],
  comportamiento: { tipo: 'rueda', radio_mm: 33, ancho_mm: 26 },
  datos: [['Diámetro', '66 mm'], ['Ancho', '26 mm'], ['Llanta', 'Plástico duro (patina)']],
}

export const RUEDA_48: PiezaDef = {
  ...ruedaBase,
  id: 'rueda-48',
  nombre: 'Rueda 48 mm de goma',
  descripcion: 'Más pequeña: el robot va más lento pero con más fuerza y queda más bajo.',
  modelo: 'proc:rueda',
  glb: '/lab/modelos/rueda-65.glb',
  escalaGlb: 24 / 33,
  masa_g: 10,
  material: 'goma',
  color: '#1f2937',
  colisionadores: [{ forma: 'cilindro', radio: 24, alto: 20, eje: 'z' }],
  comportamiento: { tipo: 'rueda', radio_mm: 24, ancho_mm: 20 },
  datos: [['Diámetro', '48 mm'], ['Ancho', '20 mm'], ['Llanta', 'Goma']],
}

export const RUEDA_LOCA: PiezaDef = {
  id: 'rueda-loca',
  nombre: 'Rueda loca de bola',
  descripcion: 'Una bola que gira libre en cualquier dirección y sostiene el robot. Se ajusta su altura con separadores.',
  familia: 'movimiento',
  modelo: 'proc:rueda-loca',
  masa_g: 8,
  material: 'metal',
  colisionadores: [{ forma: 'esfera', radio: 8 }],
  montajes: [],
  encaja: ['rueda-loca'],
  pines: [],
  comportamiento: { tipo: 'rueda-loca', radio_mm: 8 },
  datos: [['Bola', '16 mm de acero']],
}

// N20: origen sobre el eje en la cara de la reductora; el cuerpo (reductora
// 9 mm + motor 15 mm) queda hacia −z y el eje sale 8 mm hacia +z.
export const MOTOR_N20: PiezaDef = {
  id: 'motor-n20',
  nombre: 'Micromotor N20 1:100 (300 rpm)',
  familia: 'movimiento',
  descripcion: 'Motor metálico diminuto con reductora: el de los minisumos y robots pequeños. Rápido y liviano.',
  modelo: 'proc:motor-n20',
  masa_g: 10,
  material: 'metal',
  colisionadores: [{ forma: 'caja', medidas: [12, 10, 24], centro: [0, 0, -12] }],
  montajes: [{ id: 'eje', tipo: 'eje-motor', nombre: 'Eje', posicion: [0, 0, 8] }],
  encaja: ['soporte-motor'],
  pines: [
    { nombre: 'M+', tipo: 'potencia', ayuda: 'Terminal del motor (va a una salida del driver)' },
    { nombre: 'M-', tipo: 'potencia', ayuda: 'Terminal del motor (va a la otra salida del driver)' },
  ],
  comportamiento: { tipo: 'motor-dc', v_nominal: 6, rpm_sin_carga: 300, torque_bloqueo_nm: 0.045, zona_muerta_v: 0.6, tau_s: 0.03, corriente_a: 0.1 },
  datos: [['Voltaje', '3–6 V'], ['Velocidad', '≈ 300 rpm a 6 V'], ['Torque de bloqueo', '≈ 0,45 kg·cm'], ['Tamaño', '12 × 10 × 24 mm']],
  fuente: 'Micromotor N20 con reductora 1:100, datos típicos de fabricante',
}

export const RUEDA_34: PiezaDef = {
  ...ruedaBase,
  id: 'rueda-34',
  nombre: 'Rueda 34 mm de silicona',
  descripcion: 'Rueda chica con llanta de silicona blanda: la que más agarra. Para minisumo y robots N20.',
  modelo: 'proc:rueda',
  masa_g: 6,
  material: 'goma',
  color: '#111827',
  colisionadores: [{ forma: 'cilindro', radio: 17, alto: 12, eje: 'z' }],
  comportamiento: { tipo: 'rueda', radio_mm: 17, ancho_mm: 12 },
  datos: [['Diámetro', '34 mm'], ['Ancho', '12 mm'], ['Llanta', 'Silicona (agarra mucho)']],
}
