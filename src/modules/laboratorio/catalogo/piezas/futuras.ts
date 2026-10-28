// Piezas que ya tienen modelo 3D real pero se simulan en fases futuras.
// Aparecen en el cajón con «Próximamente» y no se pueden encastrar todavía.

import type { PiezaDef } from '../tipos'

const futura = {
  montajes: [],
  encaja: [],
  pines: [],
  material: 'pcb' as const,
  comportamiento: { tipo: 'sin-simular' as const },
}

export const JOYSTICK: PiezaDef = {
  ...futura,
  id: 'joystick',
  nombre: 'Joystick analógico KY-023',
  familia: 'sensor',
  descripcion: 'Palanca de dos ejes con botón: para manejar robots en vivo (radiocontrol).',
  proximamente: 'Ya puedes manejar tus robots con el botón «Control» de la pestaña Probar (teclado, pantalla o control de videojuego). El joystick como pieza física llega con la estación de control.',
  modelo: 'proc:joystick',
  glb: '/lab/modelos/joystick.glb',
  masa_g: 12,
  colisionadores: [{ forma: 'caja', medidas: [29.6, 22.3, 37.8], centro: [0, 11, 0] }],
  datos: [['Ejes', 'X e Y analógicos (0–1023)'], ['Botón', 'Al presionar la palanca']],
}

export const MPU6050: PiezaDef = {
  ...futura,
  id: 'mpu6050',
  nombre: 'Giroscopio y acelerómetro MPU6050 (GY-521)',
  familia: 'sensor',
  descripcion: 'Mide inclinación, giro y aceleración en 3 ejes. Sirve para robots que se equilibran o saben hacia dónde miran.',
  proximamente: 'Llega con las competencias (fase F5).',
  modelo: 'proc:mpu6050',
  glb: '/lab/modelos/mpu6050.glb',
  masa_g: 2,
  colisionadores: [{ forma: 'caja', medidas: [20.8, 8, 16.4], centro: [0, 4, 0] }],
  datos: [['Ejes', '3 de giro + 3 de aceleración'], ['Conexión', 'I2C (SDA, SCL)']],
}

export const DRV8825: PiezaDef = {
  ...futura,
  id: 'drv8825',
  nombre: 'Driver de motor paso a paso DRV8825',
  familia: 'electronica',
  descripcion: 'Controla motores paso a paso con precisión: cada pulso mueve el motor un pasito.',
  proximamente: 'Llega con el brazo robótico (fase F7).',
  modelo: 'proc:drv8825',
  glb: '/lab/modelos/drv8825.glb',
  masa_g: 2,
  colisionadores: [{ forma: 'caja', medidas: [20.4, 7.9, 15.2], centro: [0, 4, 0] }],
  datos: [['Corriente', 'hasta 2,2 A'], ['Micropasos', 'hasta 1/32']],
}
