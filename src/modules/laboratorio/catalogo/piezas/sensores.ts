// Sensores.
// De piso: origen = punto desde donde mira hacia abajo (−y).
// Frontales: origen en el centro de la base trasera; miran hacia +x.

import type { PiezaDef } from '../tipos'

export const TCRT5000: PiezaDef = {
  id: 'tcrt5000',
  nombre: 'Sensor IR de línea TCRT5000',
  familia: 'sensor',
  descripcion: 'Mira el piso con luz infrarroja: distingue la línea negra del fondo blanco.',
  enKits: true,
  modelo: 'proc:tcrt5000',
  masa_g: 4,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [32, 10, 14], centro: [0, 6, 0] }],
  montajes: [],
  encaja: ['sensor-piso'],
  pines: [
    { nombre: 'VCC', tipo: 'alim', ayuda: '3,3–5 V' },
    { nombre: 'GND', tipo: 'gnd' },
    { nombre: 'DO', tipo: 'digital', ayuda: 'HIGH sobre negro, LOW sobre blanco' },
    { nombre: 'AO', tipo: 'analogico', ayuda: 'Sube cuanto más oscuro es el piso' },
  ],
  comportamiento: { tipo: 'ir-reflectivo', umbral: 0.5, altura_max_mm: 25, radio_lectura_mm: 3 },
  datos: [['Distancia al piso', '2–25 mm'], ['Salidas', 'Digital (DO) y analógica (AO)']],
}

export const FC51: PiezaDef = {
  id: 'fc51',
  nombre: 'Sensor IR de obstáculos FC-51',
  familia: 'sensor',
  descripcion: 'Detecta si hay algo adelante (de 2 a 30 cm, se ajusta con su perilla). Su salida baja a LOW cuando ve algo.',
  enKits: true,
  modelo: 'proc:fc51',
  glb: '/lab/modelos/ir-obstaculo.glb',
  masa_g: 3,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [31, 4, 9.6], centro: [15.5, 2, 0] }],
  montajes: [],
  encaja: ['sensor-frontal', 'eje-servo'],
  pines: [
    { nombre: 'VCC', tipo: 'alim', ayuda: '3,3–5 V' },
    { nombre: 'GND', tipo: 'gnd' },
    { nombre: 'OUT', tipo: 'digital', ayuda: 'LOW = hay obstáculo; HIGH = libre' },
  ],
  comportamiento: { tipo: 'ir-obstaculo', alcance_mm: 200, origen: [31, 2, 0] },
  datos: [['Alcance', '2–30 cm (ajustable; aquí 20 cm)'], ['Salida', 'Digital, activa en LOW']],
}

export const HCSR04: PiezaDef = {
  id: 'hcsr04',
  nombre: 'Sensor ultrasónico HC-SR04',
  familia: 'sensor',
  descripcion: 'Mide distancias con sonido, como un murciélago: de 2 a 400 cm.',
  enKits: true,
  modelo: 'proc:hcsr04',
  glb: '/lab/modelos/hcsr04.glb',
  masa_g: 8.5,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [17.8, 26.2, 45], centro: [4.5, 13.1, 0] }],
  montajes: [],
  encaja: ['sensor-frontal', 'eje-servo'],
  pines: [
    { nombre: 'VCC', tipo: 'alim', ayuda: '5 V' },
    { nombre: 'TRIG', tipo: 'digital', ayuda: 'Un pulso de 10 µs dispara una medición' },
    { nombre: 'ECHO', tipo: 'digital', ayuda: 'Queda en HIGH el tiempo que tarda el eco (58 µs por cm)' },
    { nombre: 'GND', tipo: 'gnd' },
  ],
  comportamiento: { tipo: 'ultrasonido', alcance_max_cm: 400, apertura_grados: 15, origen: [13.4, 16, 0] },
  datos: [['Alcance', '2–400 cm'], ['Apertura', '≈ 15°'], ['Voltaje', '5 V'], ['Fórmula', 'cm = µs del eco ÷ 58']],
  fuente: 'HC-SR04, hoja de datos (ElecFreaks)',
}

/**
 * Joystick KY-023 (modelo real del paquete «Electronics Components»): dos
 * potenciómetros de 10 kΩ (ejes X e Y) y un botón al presionar la palanca.
 * Sus pines salen por el borde +z, en el orden de la serigrafía.
 */
export const JOYSTICK: PiezaDef = {
  id: 'joystick',
  nombre: 'Joystick analógico KY-023',
  familia: 'sensor',
  descripcion: 'Palanca de dos ejes con botón. Cada eje es un potenciómetro: en el centro analogRead da unos 512, y de 0 a 1023 hacia cada lado. El botón (SW) va a tierra al presionar la palanca: se lee con INPUT_PULLUP.',
  modelo: 'proc:joystick',
  glb: '/lab/modelos/joystick.glb',
  masa_g: 12,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [29.6, 22.3, 37.8], centro: [0, 11, -2] }],
  montajes: [],
  encaja: ['modulo-mesa'],
  pines: [
    { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra' },
    { nombre: '+5V', tipo: 'alim', ayuda: 'Alimentación: 5 V (o 3,3 V en el ESP32 y la Pico)' },
    { nombre: 'VRx', tipo: 'analogico', ayuda: 'Eje X: a una entrada analógica' },
    { nombre: 'VRy', tipo: 'analogico', ayuda: 'Eje Y: a una entrada analógica' },
    { nombre: 'SW', tipo: 'digital', ayuda: 'Botón: a un pin digital con INPUT_PULLUP (presionado = LOW)' },
  ],
  comportamiento: { tipo: 'joystick', ohm: 10000 },
  datos: [['Ejes', 'X e Y analógicos (0–1023, centro ≈ 512)'], ['Botón', 'Al presionar la palanca (SW a tierra)'], ['Alimentación', '3,3–5 V']],
}
