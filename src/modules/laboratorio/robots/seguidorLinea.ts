// Robot predefinido de F1: seguidor de línea 2WD con Arduino UNO, L298N,
// 2 motores TT y 2 sensores TCRT5000.
//
// Marco del robot (mm): +x hacia adelante, +y hacia arriba, +z hacia la
// derecha. El origen está en el centro del eje de las ruedas.

export interface Instancia {
  id: string            // nombre dentro del robot (ej. "ir_izq")
  tipo: string          // id en el catálogo (ej. "tcrt5000")
  etiqueta: string
  posicion: [number, number, number] // mm, marco del robot
}

export interface Conexion {
  de: [string, string]  // [instancia, pin]
  a: [string, string]
  color: string
}

export interface RobotDef {
  nombre: string
  placa: 'uno'
  mcu: string                       // id de la instancia que es el microcontrolador
  instancias: Instancia[]
  conexiones: Conexion[]
  geometria: {
    vias_mm: number                 // distancia entre centros de las ruedas
    radio_rueda_mm: number
    rueda_loca_mm: [number, number, number]
    chasis_mm: { largo: number; ancho: number; espesor: number; centro_x: number; altura: number }
  }
}

export const SEGUIDOR_LINEA: RobotDef = {
  nombre: 'Seguidor de línea 2WD',
  placa: 'uno',
  mcu: 'uno',
  instancias: [
    { id: 'chasis', tipo: 'chasis-2wd', etiqueta: 'Chasis', posicion: [-5, 15, 0] },
    { id: 'uno', tipo: 'arduino-uno', etiqueta: 'Arduino UNO', posicion: [10, 28, 0] },
    { id: 'driver', tipo: 'l298n', etiqueta: 'L298N', posicion: [-55, 30, 0] },
    { id: 'bateria', tipo: 'bateria-2x18650', etiqueta: 'Batería 7,4 V', posicion: [-28, 0, 0] },
    { id: 'motor_izq', tipo: 'motor-tt', etiqueta: 'Motor izquierdo', posicion: [-8, 0, -46] },
    { id: 'motor_der', tipo: 'motor-tt', etiqueta: 'Motor derecho', posicion: [-8, 0, 46] },
    { id: 'rueda_izq', tipo: 'rueda-65', etiqueta: 'Rueda izquierda', posicion: [0, 0, -70] },
    { id: 'rueda_der', tipo: 'rueda-65', etiqueta: 'Rueda derecha', posicion: [0, 0, 70] },
    { id: 'loca', tipo: 'rueda-loca', etiqueta: 'Rueda loca', posicion: [-70, -25, 0] },
    { id: 'ir_izq', tipo: 'tcrt5000', etiqueta: 'Sensor IR izquierdo', posicion: [95, -20, -14] },
    { id: 'ir_der', tipo: 'tcrt5000', etiqueta: 'Sensor IR derecho', posicion: [95, -20, 14] },
  ],
  conexiones: [
    // Control del L298N
    { de: ['uno', 'D5'], a: ['driver', 'ENA'], color: '#a855f7' },
    { de: ['uno', 'D7'], a: ['driver', 'IN1'], color: '#3b82f6' },
    { de: ['uno', 'D8'], a: ['driver', 'IN2'], color: '#22c55e' },
    { de: ['uno', 'D6'], a: ['driver', 'ENB'], color: '#f97316' },
    { de: ['uno', 'D9'], a: ['driver', 'IN3'], color: '#eab308' },
    { de: ['uno', 'D10'], a: ['driver', 'IN4'], color: '#ffffff' },
    // Motores
    { de: ['driver', 'OUT1'], a: ['motor_izq', 'M+'], color: '#ef4444' },
    { de: ['driver', 'OUT2'], a: ['motor_izq', 'M-'], color: '#111827' },
    { de: ['driver', 'OUT3'], a: ['motor_der', 'M+'], color: '#ef4444' },
    { de: ['driver', 'OUT4'], a: ['motor_der', 'M-'], color: '#111827' },
    // Sensores
    { de: ['ir_izq', 'DO'], a: ['uno', 'D2'], color: '#06b6d4' },
    { de: ['ir_der', 'DO'], a: ['uno', 'D3'], color: '#ec4899' },
    { de: ['ir_izq', 'AO'], a: ['uno', 'A0'], color: '#84cc16' },
    { de: ['ir_der', 'AO'], a: ['uno', 'A1'], color: '#f59e0b' },
    { de: ['ir_izq', 'VCC'], a: ['uno', '5V'], color: '#ef4444' },
    { de: ['ir_der', 'VCC'], a: ['uno', '5V'], color: '#ef4444' },
    { de: ['ir_izq', 'GND'], a: ['uno', 'GND'], color: '#111827' },
    { de: ['ir_der', 'GND'], a: ['uno', 'GND'], color: '#111827' },
    // Alimentación
    { de: ['bateria', '+'], a: ['driver', '12V'], color: '#ef4444' },
    { de: ['bateria', '-'], a: ['driver', 'GND'], color: '#111827' },
    { de: ['driver', '5V'], a: ['uno', '5V'], color: '#ef4444' },
    { de: ['driver', 'GND'], a: ['uno', 'GND'], color: '#111827' },
  ],
  geometria: {
    vias_mm: 140,
    radio_rueda_mm: 33,
    rueda_loca_mm: [-70, -25, 0],
    chasis_mm: { largo: 170, ancho: 112, espesor: 3, centro_x: -5, altura: 15 },
  },
}
