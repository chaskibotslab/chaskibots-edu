// Servos. Origen en el centro de la base; el eje de salida es vertical (+y)
// y está corrido hacia +x. Lo que se encastra en el eje gira con el servo:
// 90° = mirando al frente; 0° y 180° = a los costados.

import type { PiezaDef } from '../tipos'

const pinesServo = [
  { nombre: 'GND', tipo: 'gnd' as const, ayuda: 'Cable marrón' },
  { nombre: 'V+', tipo: 'alim' as const, ayuda: 'Cable rojo: 5 V' },
  { nombre: 'SIG', tipo: 'pwm' as const, ayuda: 'Cable naranja: señal (pulsos de 0,5 a 2,4 ms)' },
]

export const SG90: PiezaDef = {
  id: 'sg90',
  nombre: 'Servo SG90',
  familia: 'servo',
  descripcion: 'Servo pequeño de engranajes plásticos. Gira de 0° a 180° a la posición que le pidas.',
  enKits: true,
  modelo: 'proc:servo',
  masa_g: 9,
  material: 'plastico',
  color: '#2563eb',
  colisionadores: [{ forma: 'caja', medidas: [23, 23, 12.2], centro: [0, 11.5, 0] }],
  montajes: [{ id: 'eje', tipo: 'eje-servo', nombre: 'Eje del servo', posicion: [6, 28, 0] }],
  encaja: ['soporte-servo'],
  pines: pinesServo,
  comportamiento: { tipo: 'servo', torque_kgcm: 1.8, seg_por_60: 0.1, angulo_max: 180, corriente_a: 0.25 },
  datos: [['Torque', '1,8 kg·cm a 4,8 V'], ['Velocidad', '0,1 s cada 60°'], ['Giro', '0–180°'], ['Engranajes', 'Plástico']],
  fuente: 'TowerPro SG90, hoja de datos',
}

export const MG90S: PiezaDef = {
  ...SG90,
  id: 'mg90s',
  nombre: 'Servo MG90S',
  descripcion: 'Mismo tamaño que el SG90 pero con engranajes metálicos: más fuerte y rápido.',
  enKits: false,
  masa_g: 13.4,
  color: '#111827',
  comportamiento: { tipo: 'servo', torque_kgcm: 2.2, seg_por_60: 0.08, angulo_max: 180, corriente_a: 0.3 },
  datos: [['Torque', '2,2 kg·cm a 4,8 V'], ['Velocidad', '0,08 s cada 60°'], ['Giro', '0–180°'], ['Engranajes', 'Metal']],
  fuente: 'TowerPro MG90S, hoja de datos',
}
