import type { PiezaDef, PinDef } from '../tipos'

const pinesUno: PinDef[] = [
  { nombre: 'D0', tipo: 'digital', ayuda: 'RX del Serial: mejor no usarlo' },
  { nombre: 'D1', tipo: 'digital', ayuda: 'TX del Serial: mejor no usarlo' },
  { nombre: 'D2', tipo: 'digital', ayuda: 'Digital, con interrupción' },
  { nombre: 'D3', tipo: 'pwm', ayuda: 'Digital con PWM (~), con interrupción' },
  { nombre: 'D4', tipo: 'digital' },
  { nombre: 'D5', tipo: 'pwm', ayuda: 'PWM (~): sirve para regular velocidad' },
  { nombre: 'D6', tipo: 'pwm', ayuda: 'PWM (~): sirve para regular velocidad' },
  { nombre: 'D7', tipo: 'digital' },
  { nombre: 'D8', tipo: 'digital' },
  { nombre: 'D9', tipo: 'pwm', ayuda: 'PWM (~). La librería Servo lo deja sin PWM' },
  { nombre: 'D10', tipo: 'pwm', ayuda: 'PWM (~). La librería Servo lo deja sin PWM' },
  { nombre: 'D11', tipo: 'pwm', ayuda: 'PWM (~)' },
  { nombre: 'D12', tipo: 'digital' },
  { nombre: 'D13', tipo: 'digital', ayuda: 'Tiene el LED «L» de la placa' },
  { nombre: 'A0', tipo: 'analogico', ayuda: 'Entrada analógica 0–5 V → 0–1023' },
  { nombre: 'A1', tipo: 'analogico' },
  { nombre: 'A2', tipo: 'analogico' },
  { nombre: 'A3', tipo: 'analogico' },
  { nombre: 'A4', tipo: 'i2c', ayuda: 'Analógica o SDA (I2C)' },
  { nombre: 'A5', tipo: 'i2c', ayuda: 'Analógica o SCL (I2C)' },
  { nombre: '5V', tipo: 'alim', ayuda: 'Salida de 5 V para sensores' },
  { nombre: '3V3', tipo: 'alim', ayuda: 'Salida de 3,3 V (poca corriente)' },
  { nombre: 'VIN', tipo: 'alim', ayuda: 'Entrada de 7–12 V (batería)' },
  { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra (negativo común)' },
]

export const ARDUINO_UNO: PiezaDef = {
  id: 'arduino-uno',
  nombre: 'Arduino UNO R3',
  familia: 'placa',
  descripcion: 'La placa más usada para aprender. Microcontrolador ATmega328P a 16 MHz y 5 V.',
  enKits: true,
  modelo: 'proc:arduino-uno',
  glb: '/lab/modelos/arduino-uno.glb',
  masa_g: 25,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [68.6, 12, 53.4], centro: [0, 6, 0] }],
  // El modelo real con su USB y su conector de alimentación (medido del GLB).
  huella: [{ forma: 'caja', medidas: [75.7, 12, 59.2], centro: [0, 6, -2.8] }],
  montajes: [],
  encaja: ['placa'],
  pines: pinesUno,
  comportamiento: { tipo: 'mcu', placa: 'uno', frecuencia_hz: 16_000_000, vLogica: 5 },
  datos: [['Microcontrolador', 'ATmega328P'], ['Reloj', '16 MHz'], ['Voltaje lógico', '5 V'], ['Pines PWM', 'D3, D5, D6, D9, D10, D11'], ['Entradas analógicas', 'A0–A5 (10 bits)']],
  fuente: 'Arduino UNO R3, hoja de datos oficial',
}

export const ARDUINO_NANO: PiezaDef = {
  id: 'arduino-nano',
  nombre: 'Arduino Nano V3',
  familia: 'placa',
  descripcion: 'El mismo cerebro que el UNO (ATmega328P, 5 V) en una placa chiquita de 45 × 18 mm. Tiene dos entradas analógicas más: A6 y A7.',
  enKits: true,
  modelo: 'proc:arduino-nano',
  masa_g: 7,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [45, 8, 18], centro: [0, 4, 0] }],
  huella: [{ forma: 'caja', medidas: [48, 8, 18], centro: [-1.5, 4, 0] }], // con el mini USB
  montajes: [],
  encaja: ['placa'],
  pines: [
    ...pinesUno.filter(p => p.nombre !== '3V3'),
    { nombre: 'A6', tipo: 'analogico', ayuda: 'Solo entrada analógica (no sirve como digital)' },
    { nombre: 'A7', tipo: 'analogico', ayuda: 'Solo entrada analógica (no sirve como digital)' },
    { nombre: '3V3', tipo: 'alim', ayuda: 'Salida de 3,3 V (poca corriente)' },
  ],
  comportamiento: { tipo: 'mcu', placa: 'nano', frecuencia_hz: 16_000_000, vLogica: 5 },
  datos: [['Microcontrolador', 'ATmega328P'], ['Reloj', '16 MHz'], ['Voltaje lógico', '5 V'], ['Entradas analógicas', 'A0–A7 (A6 y A7 solo analógicas)'], ['Tamaño', '45 × 18 mm']],
  fuente: 'Arduino Nano, hoja de datos oficial',
}

// Arduino Mega 2560: el chip que emula el simulador. Marco: el largo va a lo
// largo de z (USB hacia −z) para que entre al lado de la protoboard.
const PWM_MEGA = (n: number) => (n >= 2 && n <= 13) || (n >= 44 && n <= 46)
const AYUDA_MEGA: Record<number, string> = {
  0: 'RX0 del Serial: mejor no usarlo', 1: 'TX0 del Serial: mejor no usarlo', 13: 'Tiene el LED «L» de la placa',
  20: 'SDA (I2C)', 21: 'SCL (I2C)', 2: 'PWM (~), con interrupción', 3: 'PWM (~), con interrupción',
}
const pinesMega: PinDef[] = [
  ...Array.from({ length: 54 }, (_, n): PinDef => ({ nombre: `D${n}`, tipo: PWM_MEGA(n) ? 'pwm' : 'digital', ayuda: AYUDA_MEGA[n] ?? (PWM_MEGA(n) ? 'Digital con PWM (~)' : undefined) })),
  ...Array.from({ length: 16 }, (_, n): PinDef => ({ nombre: `A${n}`, tipo: 'analogico', ayuda: n === 0 ? 'Entrada analógica 0–5 V → 0–1023' : undefined })),
  { nombre: '5V', tipo: 'alim', ayuda: 'Salida de 5 V para sensores' },
  { nombre: '3V3', tipo: 'alim', ayuda: 'Salida de 3,3 V (poca corriente)' },
  { nombre: 'VIN', tipo: 'alim', ayuda: 'Entrada de 7–12 V (batería)' },
  { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra (negativo común)' },
]

export const ARDUINO_MEGA: PiezaDef = {
  id: 'arduino-mega',
  nombre: 'Arduino Mega 2560',
  familia: 'placa',
  descripcion: 'La hermana grande del UNO: el mismo lenguaje y 5 V, pero con 54 pines digitales (15 con PWM), 16 entradas analógicas y 4 puertos serie. Para proyectos con muchos sensores, LEDs o motores.',
  modelo: 'proc:arduino-mega',
  masa_g: 37,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [53.3, 12, 101.6], centro: [0, 6, 0] }],
  huella: [{ forma: 'caja', medidas: [53.3, 12, 104.8], centro: [0, 6, -1.6] }], // con el USB-B
  montajes: [],
  encaja: ['placa'],
  pines: pinesMega,
  comportamiento: { tipo: 'mcu', placa: 'mega', frecuencia_hz: 16_000_000, vLogica: 5 },
  datos: [
    ['Microcontrolador', 'ATmega2560'], ['Reloj', '16 MHz'], ['Voltaje lógico', '5 V'], ['Pines digitales', 'D0–D53 (PWM: D2–D13, D44–D46)'],
    ['Entradas analógicas', 'A0–A15 (10 bits)'], ['Memoria', '256 KB de programa, 8 KB de RAM'],
  ],
  fuente: 'Arduino Mega 2560 Rev3, hoja de datos oficial',
}

// Raspberry Pi Pico (RP2040). Se programa en C++ con el core arduino-pico y se
// simula a nivel de API Arduino sobre el ATmega2560 (ver esp32/capasPlacas.ts).
const gpPico = (g: number, extra = ''): PinDef => ({ nombre: `GP${g}`, tipo: 'pwm', ayuda: `GP${g}: digital y PWM${extra}` })
const adcPico = (g: number, canal: number): PinDef => ({ nombre: `GP${g}`, tipo: 'analogico', ayuda: `GP${g} = A${canal} (ADC${canal}): entrada analógica 0–3,3 V, también digital` })
const pinesPico: PinDef[] = [
  ...Array.from({ length: 23 }, (_, g) => gpPico(g, g === 0 ? ' · TX de Serial1' : g === 1 ? ' · RX de Serial1' : g === 4 ? ' · SDA (I2C0)' : g === 5 ? ' · SCL (I2C0)' : '')),
  adcPico(26, 0), adcPico(27, 1), adcPico(28, 2),
  { nombre: '3V3', tipo: 'alim', ayuda: '3V3(OUT): salida de 3,3 V para sensores' },
  { nombre: 'VBUS', tipo: 'alim', ayuda: '5 V del USB: para servos y módulos de 5 V' },
  { nombre: 'VSYS', tipo: 'alim', ayuda: 'Entrada de 1,8–5,5 V (batería)' },
  { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra (negativo común)' },
]

export const RASPBERRY_PICO: PiezaDef = {
  id: 'raspberry-pico',
  nombre: 'Raspberry Pi Pico',
  familia: 'placa',
  descripcion: 'Placa de Raspberry Pi con el chip RP2040 (dos núcleos a 133 MHz). Lógica de 3,3 V, PWM en todos sus pines y tres entradas analógicas (GP26–GP28). Aquí se programa en C++ como un Arduino.',
  modelo: 'proc:pico',
  masa_g: 3,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [51, 4, 21], centro: [0, 2, 0] }],
  montajes: [],
  encaja: ['placa'],
  pines: pinesPico,
  comportamiento: { tipo: 'mcu', placa: 'pico', frecuencia_hz: 133_000_000, vLogica: 3.3 },
  datos: [
    ['Microcontrolador', 'RP2040 (2 núcleos ARM Cortex-M0+)'], ['Reloj', '133 MHz'], ['Voltaje lógico', '3,3 V (¡no le pongas 5 V en un pin!)'],
    ['Entradas analógicas', 'GP26–GP28 = A0–A2 (12 bits con analogReadResolution(12))'], ['LED de la placa', 'GP25 (LED_BUILTIN)'],
    ['En el simulador', 'Tu código Arduino (core arduino-pico); MicroPython todavía no. Los int son de 16 bits (en la placa real, 32)'],
  ],
  fuente: 'Raspberry Pi Pico, hoja de datos oficial',
}

// Raspberry Pi 4: una computadora con Linux. Se programa en Python con
// gpiozero (python.worker.ts); los GPIO van con numeración BCM y 3,3 V.
const gpioPi = (g: number, extra = ''): PinDef => ({ nombre: `GPIO${g}`, tipo: 'pwm', ayuda: `GPIO${g} (BCM): digital, y PWM por software con gpiozero${extra}` })
const pinesPi: PinDef[] = [
  gpioPi(4), gpioPi(17), gpioPi(27), gpioPi(22), gpioPi(5), gpioPi(6), gpioPi(13, ' · PWM por hardware'), gpioPi(19, ' · PWM por hardware'), gpioPi(26),
  gpioPi(18, ' · PWM por hardware'), gpioPi(23), gpioPi(24), gpioPi(25), gpioPi(12, ' · PWM por hardware'), gpioPi(16), gpioPi(20), gpioPi(21), gpioPi(8), gpioPi(7),
  { nombre: 'GPIO2', tipo: 'digital', ayuda: 'SDA (I2C): mejor dejarlo para sensores I2C' },
  { nombre: 'GPIO3', tipo: 'digital', ayuda: 'SCL (I2C): mejor dejarlo para sensores I2C' },
  { nombre: 'GPIO14', tipo: 'digital', ayuda: 'TX de la UART: mejor no usarlo' },
  { nombre: 'GPIO15', tipo: 'digital', ayuda: 'RX de la UART: mejor no usarlo' },
  { nombre: '3V3', tipo: 'alim', ayuda: 'Salida de 3,3 V para sensores' },
  { nombre: '5V', tipo: 'alim', ayuda: '5 V: alimenta la placa (en el robot real, con un regulador de 5 V y 3 A)' },
  { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra (negativo común)' },
  { nombre: 'CSI', tipo: 'csi', ayuda: 'Conector de la cámara (cable plano)' },
]

export const RASPBERRY_PI_4: PiezaDef = {
  id: 'raspberry-pi-4',
  nombre: 'Raspberry Pi 4',
  familia: 'placa',
  descripcion: 'Una computadora completa del tamaño de una tarjeta, con Linux. Se programa en Python con gpiozero: LED, botones, motores, sensores y servos. Lógica de 3,3 V y sin entradas analógicas.',
  modelo: 'proc:raspberry-pi-4',
  masa_g: 46,
  material: 'pcb',
  // Placa de 85 × 56 mm con los puertos USB y Ethernet (17 mm de alto); el ancla queda en los agujeros de montaje.
  colisionadores: [{ forma: 'caja', medidas: [85, 17, 56], centro: [4, 8.5, 0] }],
  montajes: [],
  encaja: ['placa'],
  pines: pinesPi,
  comportamiento: { tipo: 'mcu', placa: 'rpi', frecuencia_hz: 1_500_000_000, vLogica: 3.3 },
  datos: [
    ['Procesador', 'Broadcom BCM2711, 4 núcleos a 1,5 GHz'], ['Sistema', 'Raspberry Pi OS (Linux)'], ['Voltaje lógico', '3,3 V (¡no le pongas 5 V en un GPIO!)'],
    ['Programación', 'Python con gpiozero (numeración BCM: LED(17) = GPIO17)'], ['Entradas analógicas', 'No tiene: se usa un conversor (MCP3008)'],
    ['En el simulador', 'Tu programa en Python corre en el navegador (Pyodide); sleep() va al ritmo de la simulación'],
  ],
  fuente: 'Raspberry Pi 4 Model B, hoja de datos oficial; documentación de gpiozero',
}

// Jetson Nano (kit de desarrollo B01): computadora con GPU para visión e IA.
// Se programa en Python con Jetson.GPIO; los pines se llaman por su número
// físico en el conector de 40 pines (GPIO.BOARD), como en los ejemplos de NVIDIA.
const pinJ = (n: number, extra = ''): PinDef => ({ nombre: `PIN${n}`, tipo: 'digital', ayuda: `Pin ${n} del conector: digital${extra}` })
const pinesJetson: PinDef[] = [
  { nombre: 'PIN32', tipo: 'pwm', ayuda: 'Pin 32: digital y PWM por hardware (GPIO.PWM)' },
  { nombre: 'PIN33', tipo: 'pwm', ayuda: 'Pin 33: digital y PWM por hardware (GPIO.PWM)' },
  pinJ(7), pinJ(11), pinJ(12), pinJ(13), pinJ(15), pinJ(16), pinJ(18), pinJ(19), pinJ(21), pinJ(22), pinJ(23), pinJ(24), pinJ(26),
  pinJ(29), pinJ(31), pinJ(35), pinJ(36), pinJ(37), pinJ(38), pinJ(40),
  { nombre: 'PIN3', tipo: 'digital', ayuda: 'SDA (I2C): mejor dejarlo para sensores I2C' },
  { nombre: 'PIN5', tipo: 'digital', ayuda: 'SCL (I2C): mejor dejarlo para sensores I2C' },
  { nombre: 'PIN8', tipo: 'digital', ayuda: 'TX de la UART: mejor no usarlo' },
  { nombre: 'PIN10', tipo: 'digital', ayuda: 'RX de la UART: mejor no usarlo' },
  { nombre: '3V3', tipo: 'alim', ayuda: 'Salida de 3,3 V para sensores (pines 1 y 17)' },
  { nombre: '5V', tipo: 'alim', ayuda: '5 V (pines 2 y 4): en el robot real, la placa necesita una fuente de 5 V y 4 A' },
  { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra (negativo común)' },
  { nombre: 'CSI', tipo: 'csi', ayuda: 'Conector de la cámara (cable plano): CAM0' },
]

export const JETSON_NANO: PiezaDef = {
  id: 'jetson-nano',
  nombre: 'Jetson Nano',
  familia: 'placa',
  descripcion: 'La computadora de NVIDIA para robots que ven: Linux, una GPU para visión e inteligencia artificial y una cámara CSI. Se programa en Python con Jetson.GPIO (pines por su número físico) y la cámara entrega imágenes como tablas de números.',
  modelo: 'proc:jetson-nano',
  masa_g: 140,
  material: 'pcb',
  // 80 × 100 mm con el disipador (29 mm de alto); va de costado y 3 mm adelante del ancla para dejar lugar al driver.
  colisionadores: [{ forma: 'caja', medidas: [80, 29, 100], centro: [3, 14.5, 0] }],
  montajes: [],
  encaja: ['placa'],
  pines: pinesJetson,
  comportamiento: { tipo: 'mcu', placa: 'jetson', frecuencia_hz: 1_430_000_000, vLogica: 3.3 },
  datos: [
    ['Procesador', 'ARM Cortex-A57 de 4 núcleos a 1,43 GHz + GPU Maxwell de 128 núcleos'], ['Sistema', 'Ubuntu (JetPack de NVIDIA)'],
    ['Voltaje lógico', '3,3 V (¡no le pongas 5 V en un pin!)'], ['Programación', 'Python con Jetson.GPIO (GPIO.BOARD: el pin 32 es el 32)'],
    ['PWM', 'Solo en los pines 32 y 33'], ['Cámara', 'CSI (cable plano), como la cámara de la Raspberry Pi v2'],
    ['En el simulador', 'Tu programa en Python corre en el navegador (Pyodide); la cámara da imágenes chicas en escala de grises'],
  ],
  fuente: 'NVIDIA Jetson Nano Developer Kit, guía del usuario; documentación de Jetson.GPIO',
}

// ESP32 DevKit V1 (30 pines). Se simula a nivel de API Arduino sobre un
// ATmega2560 (ver esp32/capaEsp32.ts): GPIOn del ESP32 = pin n.
const ana = (g: number, extra = ''): PinDef => ({ nombre: `GPIO${g}`, tipo: 'analogico', ayuda: `GPIO${g} con ADC (0–4095)${extra}` })
const gp = (g: number, extra = ''): PinDef => ({ nombre: `GPIO${g}`, tipo: 'pwm', ayuda: `GPIO${g}: digital y PWM${extra}` })
const pinesEsp32: PinDef[] = [
  ana(36, ' · solo entrada (VP)'), ana(39, ' · solo entrada (VN)'), ana(34, ' · solo entrada'), ana(35, ' · solo entrada'),
  ana(32), ana(33), ana(25), ana(26), gp(27), gp(14), gp(12, ' · evita usarlo al encender'), gp(13),
  gp(23), gp(22), gp(21, ' · SDA (I2C)'), gp(19), gp(18), gp(5), gp(17), gp(16), gp(4), gp(2, ' · LED azul de la placa'), gp(15),
  { nombre: 'GPIO1', tipo: 'digital', ayuda: 'TX0 del Serial: mejor no usarlo' },
  { nombre: 'GPIO3', tipo: 'digital', ayuda: 'RX0 del Serial: mejor no usarlo' },
  { nombre: '3V3', tipo: 'alim', ayuda: 'Salida de 3,3 V para sensores' },
  { nombre: 'VIN', tipo: 'alim', ayuda: '5 V (del USB) o entrada de 5–12 V' },
  { nombre: 'GND', tipo: 'gnd', ayuda: 'Tierra (negativo común)' },
]

export const ESP32: PiezaDef = {
  id: 'esp32-devkit',
  nombre: 'ESP32 DevKit V1',
  familia: 'placa',
  descripcion: 'La placa de los kits de BGU: doble núcleo a 240 MHz, WiFi y Bluetooth, lógica de 3,3 V. Cualquier GPIO de salida da PWM.',
  enKits: true,
  modelo: 'proc:esp32',
  glb: '/lab/modelos/esp32.glb',
  masa_g: 10,
  material: 'pcb',
  colisionadores: [{ forma: 'caja', medidas: [51.4, 6.3, 28.6], centro: [0, 3.2, 0] }],
  montajes: [],
  encaja: ['placa'],
  pines: pinesEsp32,
  comportamiento: { tipo: 'mcu', placa: 'esp32', frecuencia_hz: 240_000_000, vLogica: 3.3 },
  datos: [
    ['Microcontrolador', 'ESP32 (Xtensa LX6, 2 núcleos)'], ['Reloj', '240 MHz'], ['Voltaje lógico', '3,3 V (¡no le pongas 5 V en un pin!)'],
    ['Conexión', 'WiFi + Bluetooth (simulados)'], ['En el simulador', 'Se ejecuta tu mismo código Arduino; los int son de 16 bits (en la placa real, 32)'],
  ],
}
