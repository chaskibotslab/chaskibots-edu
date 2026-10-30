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

// Minisumo: 76 × 96 mm + pala de acero de 1,5 mm que baja hasta el piso
// (de x = 36 a x = 60). Con la pala el robot mide 98 × 96 mm: entra en el
// cuadrado de 10 × 10 cm del reglamento. Motores N20 debajo, ruedas de 34 mm
// (el piso queda en y = −24,5). Masa = placa + pala (25 g).
const PISO_MINISUMO = -24.5
export const CHASIS_MINISUMO: PiezaDef = {
  id: 'chasis-minisumo',
  nombre: 'Chasis minisumo con pala',
  familia: 'chasis',
  descripcion: 'Base de 10 × 10 cm con pala de acero al frente: mete la pala debajo del rival, lo levanta y le quita tracción.',
  modelo: 'proc:chasis-minisumo',
  masa_g: 47,
  material: 'pla',
  variantes: [
    { id: 'pla', nombre: 'Impreso en 3D (PLA negro)', material: 'pla', masa_g: 47, color: '#1f2430' },
    { id: 'pla-rojo', nombre: 'Impreso en 3D (PLA rojo)', material: 'pla', masa_g: 47, color: '#b91c1c' },
    { id: 'aluminio', nombre: 'Aluminio 3 mm', material: 'aluminio', masa_g: 84, color: '#c3c8cd' },
  ],
  colisionadores: [
    { forma: 'caja', medidas: [76, 3, 96] },
    // Pala: 30 mm inclinada 37°, el filo a medio milímetro del piso.
    { forma: 'caja', medidas: [30, 1.5, 96], centro: [48, -14.8, 0], rotacion: [0, 0, -37], friccion: 0.15 },
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa', posicion: [-14, ARRIBA + 10, 0], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver', posicion: [-22, ARRIBA, -24], rotacionesPermitidas: [0, 90, 180, 270] },
    { id: 'bateria', tipo: 'bateria', nombre: 'Batería', posicion: [-16, ARRIBA, 24] },
    // Una batería grande (2×18650) no cabe al costado sin tocar la rueda: va al centro,
    // entre las ruedas (sin pasarse de los 10 cm), y la placa y el driver suben al
    // piso de arriba. Ahí ya no cabe el ultrasonido al frente: quedan los FC-51.
    { id: 'bateria-centro', tipo: 'bateria', nombre: 'Batería (al centro, entre las ruedas)', posicion: [1, ARRIBA, 0] },
    { id: 'motor-izq', tipo: 'soporte-motor', nombre: 'Motor izquierdo', posicion: [-4, -7.5, -33], rotacion: COLGADO },
    { id: 'motor-der', tipo: 'soporte-motor', nombre: 'Motor derecho', posicion: [-4, -7.5, 33] },
    { id: 'frente', tipo: 'sensor-frontal', nombre: 'Sensor frontal', posicion: [22, ARRIBA, 0] },
    { id: 'frente-izq', tipo: 'sensor-frontal', nombre: 'Sensor frontal izquierdo', posicion: [30, ARRIBA, -31], rotacion: [0, 15, 0] },
    { id: 'frente-der', tipo: 'sensor-frontal', nombre: 'Sensor frontal derecho', posicion: [30, ARRIBA, 31], rotacion: [0, -15, 0] },
    { id: 'piso-izq', tipo: 'sensor-piso', nombre: 'Sensor de borde izquierdo', posicion: [28, PISO_MINISUMO + 12.5, -38] },
    { id: 'piso-der', tipo: 'sensor-piso', nombre: 'Sensor de borde derecho', posicion: [28, PISO_MINISUMO + 12.5, 38] },
    { id: 'arriba', tipo: 'piso', nombre: 'Piso de arriba', posicion: [-10, ARRIBA, 0] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [['Medidas', '98 × 96 mm con pala'], ['Pala', 'Acero 1,5 mm, 37°'], ['Tracción', '2 motores N20 + ruedas de 34 mm'], ['Reglamento', 'Minisumo: ≤ 10 × 10 cm, ≤ 500 g']],
}

// Piso de arriba del minisumo: placa de 56 × 80 × 3 mm sobre cuatro
// separadores de latón M3 de 24 mm (más altos que el L298N y que el pack de
// 18650). Sirve cuando abajo no cabe todo: la placa (ESP32, UNO) o el driver
// suben aquí. Marco: origen sobre la cara de arriba del chasis.
export const SEPARADOR_PISO = 24
/** Largo × ancho de la placa del piso (mm) y dónde van sus 4 separadores. */
export const PLACA_PISO: [number, number] = [56, 80]
export const SEPARADORES_PISO: [number, number][] = [[-24, -36], [-24, 36], [24, -36], [24, 36]]
const ARRIBA_PISO = SEPARADOR_PISO + 3
export const PISO_ARRIBA_MINISUMO: PiezaDef = {
  id: 'piso-arriba-minisumo',
  nombre: 'Piso de arriba (minisumo)',
  familia: 'chasis',
  descripcion: 'Una segunda base sobre separadores de 24 mm. Cuando la placa, el driver y la batería no caben juntos en el minisumo, sube la placa o el driver aquí.',
  modelo: 'proc:piso-arriba',
  masa_g: 16,
  material: 'pla',
  color: '#334155',
  colisionadores: [
    { forma: 'caja', medidas: [PLACA_PISO[0], 3, PLACA_PISO[1]], centro: [0, SEPARADOR_PISO + 1.5, 0] },
    // Los 4 separadores: lo que va abajo no puede pasar por donde están.
    ...SEPARADORES_PISO.map(([x, z]) => ({ forma: 'caja' as const, medidas: [5, SEPARADOR_PISO, 5] as [number, number, number], centro: [x, SEPARADOR_PISO / 2, z] as [number, number, number] })),
  ],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Placa (arriba)', posicion: [0, ARRIBA_PISO + 10, -18], rotacionesPermitidas: [0, 180] },
    { id: 'driver', tipo: 'driver', nombre: 'Driver (arriba)', posicion: [0, ARRIBA_PISO, 20], rotacionesPermitidas: [0, 90, 180, 270] },
  ],
  encaja: ['piso'],
  pines: [],
  comportamiento: { tipo: 'chasis' },
  datos: [['Medidas', '56 × 80 × 3 mm'], ['Separadores', '4 de latón M3 × 24 mm'], ['Masa', '16 g con tornillos']],
}
