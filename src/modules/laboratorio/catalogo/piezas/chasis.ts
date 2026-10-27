// Chasis: la pieza raíz del robot. Sus montajes definen dónde va cada cosa.
// Marco del chasis: origen en el centro de la placa, a media altura de su
// espesor. Los montajes de abajo (motores, batería, rueda loca) van girados
// 180° en X para que la pieza "cuelgue" de la placa.

import type { PiezaDef, PuntoMontaje, Variante } from '../tipos'

const ARRIBA = 1.5    // cara superior de la placa (3 mm de espesor)
const ABAJO = -1.5
const COLGADO: [number, number, number] = [180, 0, 0]

function variantes(base: { acrilico: number; mdf: number; aluminio: number; pla: number }): Variante[] {
  return [
    { id: 'acrilico', nombre: 'Acrílico 3 mm', material: 'acrilico', masa_g: base.acrilico, color: '#cfe6f7' },
    { id: 'mdf', nombre: 'MDF 3 mm', material: 'mdf', masa_g: base.mdf, color: '#b8895a' },
    { id: 'aluminio', nombre: 'Aluminio 2 mm', material: 'aluminio', masa_g: base.aluminio, color: '#c3c8cd' },
    { id: 'pla', nombre: 'Impreso en 3D (PLA)', material: 'pla', masa_g: base.pla, color: '#f97316' },
  ]
}

function montajesComunes(largo: number, frenteSensorPiso: number): PuntoMontaje[] {
  const frente = largo / 2
  return [
    { id: 'piso-izq', tipo: 'sensor-piso', nombre: 'Sensor de piso izquierdo', posicion: [frenteSensorPiso, -35, -14] },
    { id: 'piso-der', tipo: 'sensor-piso', nombre: 'Sensor de piso derecho', posicion: [frenteSensorPiso, -35, 14] },
    { id: 'frente', tipo: 'sensor-frontal', nombre: 'Sensor frontal', posicion: [frente, ARRIBA, 0] },
    { id: 'frente-izq', tipo: 'sensor-frontal', nombre: 'Sensor frontal izquierdo', posicion: [frente - 8, ARRIBA, -45], rotacion: [0, 35, 0] },
    { id: 'frente-der', tipo: 'sensor-frontal', nombre: 'Sensor frontal derecho', posicion: [frente - 8, ARRIBA, 45], rotacion: [0, -35, 0] },
    { id: 'servo', tipo: 'soporte-servo', nombre: 'Servo', posicion: [frente - 25, ARRIBA, 0] },
  ]
}

// 160 × 120 × 3 mm. Acrílico 1,19 g/cm³ → 68 g; MDF 0,75 → 43 g;
// aluminio 2 mm 2,7 g/cm³ → 104 g; PLA al 70 % de relleno → 50 g.
export const CHASIS_2WD: PiezaDef = {
  id: 'chasis-2wd',
  nombre: 'Chasis 2WD',
  familia: 'chasis',
  descripcion: 'Dos ruedas motrices y una rueda loca. Gira fácil y es el más común para seguidores de línea.',
  modelo: 'proc:chasis-2wd',
  masa_g: 68,
  material: 'acrilico',
  variantes: variantes({ acrilico: 68, mdf: 43, aluminio: 104, pla: 50 }),
  colisionadores: [{ forma: 'caja', medidas: [160, 3, 120] }],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa', posicion: [5, ARRIBA + 10, 0], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver', posicion: [-55, ARRIBA, 0], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería', posicion: [-23, ABAJO, 0], rotacion: COLGADO },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [5, -15, -46], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [5, -15, 46] },
    { id: 'loca', tipo: 'rueda-loca', nombre: 'Rueda loca', posicion: [-65, ABAJO, 0], rotacion: COLGADO },
    ...montajesComunes(160, 100),
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [['Medidas', '160 × 120 mm'], ['Tracción', '2 ruedas + rueda loca']],
}

// 200 × 130 mm. Acrílico 93 g; MDF 58 g; aluminio 140 g; PLA 68 g.
export const CHASIS_4WD: PiezaDef = {
  id: 'chasis-4wd',
  nombre: 'Chasis 4WD',
  familia: 'chasis',
  descripcion: 'Cuatro ruedas motrices: más tracción y empuje, pero gira derrapando (como un tanque).',
  modelo: 'proc:chasis-4wd',
  masa_g: 93,
  material: 'acrilico',
  variantes: variantes({ acrilico: 93, mdf: 58, aluminio: 140, pla: 68 }),
  colisionadores: [{ forma: 'caja', medidas: [200, 3, 130] }],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa', posicion: [10, ARRIBA + 10, 0], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver', posicion: [-62, ARRIBA, 0], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería', posicion: [0, ABAJO, 0], rotacion: COLGADO },
    { id: 'motor-del-izq', tipo: 'soporte-motor', nombre: 'Motor delantero izquierdo', posicion: [60, -15, -50], rotacion: COLGADO },
    { id: 'motor-tra-izq', tipo: 'soporte-motor', nombre: 'Motor trasero izquierdo', posicion: [-60, -15, -50], rotacion: COLGADO },
    { id: 'motor-del-der', tipo: 'soporte-motor', nombre: 'Motor delantero derecho', posicion: [60, -15, 50] },
    { id: 'motor-tra-der', tipo: 'soporte-motor', nombre: 'Motor trasero derecho', posicion: [-60, -15, 50] },
    ...montajesComunes(200, 115),
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [['Medidas', '200 × 130 mm'], ['Tracción', '4 ruedas motrices']],
}
