// Módulos inalámbricos «de cable serie»: lo que el robot recibe por el aire
// le llega a la placa por RX como si viniera por un cable. Van en el soporte
// «módulo inalámbrico» del chasis.
// Origen: centro de la base del módulo; la tira de pines queda del lado −x.

import type { PiezaDef, PinDef } from '../tipos'

const pines = (alim: string): PinDef[] => [
  { nombre: 'VCC', tipo: 'alim', ayuda: alim },
  { nombre: 'GND', tipo: 'gnd' },
  { nombre: 'TXD', tipo: 'digital', ayuda: 'Lo que el módulo recibe por el aire sale por aquí: va al RX de la placa' },
  { nombre: 'RXD', tipo: 'digital', ayuda: 'Lo que la placa quiere enviar entra por aquí: va al TX de la placa' },
]

const base = {
  familia: 'electronica' as const,
  material: 'pcb' as const,
  montajes: [],
  encaja: ['modulo-radio' as const],
}

export const HC05: PiezaDef = {
  ...base,
  id: 'hc05',
  nombre: 'Módulo Bluetooth HC-05',
  descripcion: 'Le da Bluetooth al Arduino: el robot recibe las órdenes de un celular o de una compu como letras por el puerto serie.',
  modelo: 'proc:hc05',
  masa_g: 3.5,
  colisionadores: [{ forma: 'caja', medidas: [37.3, 5, 15.5], centro: [0, 2.5, 0] }],
  pines: pines('3,6–6 V: se conecta a 5 V'),
  comportamiento: { tipo: 'radio-serie', radio: 'Bluetooth', baudios: 9600 },
  datos: [['Tipo', 'Bluetooth clásico 2.0 (maestro o esclavo)'], ['Alcance', '≈ 10 m'], ['Velocidad', '9600 baudios de fábrica'], ['Clave para enlazar', '1234 o 0000'], ['En el robot real', 'Su RXD trabaja a 3,3 V: se le pone un divisor de dos resistencias']],
}

export const HC06: PiezaDef = {
  ...base,
  id: 'hc06',
  nombre: 'Módulo Bluetooth HC-06',
  descripcion: 'El hermano sencillo del HC-05: solo recibe conexiones (esclavo). Para manejar un robot desde el celular alcanza y sobra.',
  modelo: 'proc:hc06',
  masa_g: 3.2,
  colisionadores: [{ forma: 'caja', medidas: [37.3, 5, 15.5], centro: [0, 2.5, 0] }],
  pines: pines('3,6–6 V: se conecta a 5 V'),
  comportamiento: { tipo: 'radio-serie', radio: 'Bluetooth', baudios: 9600 },
  datos: [['Tipo', 'Bluetooth clásico 2.0 (solo esclavo)'], ['Alcance', '≈ 10 m'], ['Velocidad', '9600 baudios de fábrica'], ['Clave para enlazar', '1234']],
}

export const HC12: PiezaDef = {
  ...base,
  id: 'hc12',
  nombre: 'Módulo de radio HC-12 (433 MHz)',
  descripcion: 'Radio de largo alcance: dos HC-12 se hablan como si hubiera un cable serie entre ellos. Uno va en el mando y otro en el robot.',
  modelo: 'proc:hc12',
  masa_g: 2.5,
  colisionadores: [{ forma: 'caja', medidas: [27.8, 5, 14.4], centro: [0, 2.5, 0] }],
  // La antena de resorte sobresale: cuenta para no encimar piezas.
  huella: [{ forma: 'caja', medidas: [27.8, 22, 14.4], centro: [0, 11, 0] }],
  pines: pines('3,2–5,5 V: se conecta a 5 V'),
  comportamiento: { tipo: 'radio-serie', radio: '433 MHz', baudios: 9600 },
  datos: [['Frecuencia', '433 MHz (100 canales)'], ['Alcance', 'hasta 1 km a campo abierto'], ['Velocidad', '9600 baudios de fábrica'], ['Se usan', 'de a dos: mando y robot']],
}
