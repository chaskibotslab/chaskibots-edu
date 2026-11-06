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
