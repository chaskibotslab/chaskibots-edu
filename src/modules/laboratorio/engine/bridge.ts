// Puente microcontrolador ↔ mundo físico.
//
// Funciones puras (sin Three.js, sin Rapier, sin avr8js) que traducen señales
// eléctricas a magnitudes físicas y viceversa. Están separadas para poder
// probarlas con tests unitarios y reutilizarlas en cualquier placa emulada.

export const VCC = 5 // voltaje lógico del Arduino UNO/Nano

// ---------------------------------------------------------------------------
// PWM → voltaje promedio
// analogWrite(pin, 128) no produce 2,5 V "de verdad": el pin conmuta entre 0 y
// 5 V muy rápido (490 Hz o 980 Hz). Lo que importa para un motor o un LED es el
// promedio, que es VCC × ciclo de trabajo. El ciclo de trabajo lo mide el
// emulador contando cuántos ciclos de CPU el pin estuvo en ALTO (ver avrRunner).
// ---------------------------------------------------------------------------
export function pwmToVoltage(duty: number, vcc = VCC): number {
  return Math.max(0, Math.min(1, duty)) * vcc
}

// ---------------------------------------------------------------------------
// Driver L298N (un canal)
// IN1/IN2 eligen el sentido; ENA (con PWM) la velocidad:
//   IN1=1 IN2=0 → adelante · IN1=0 IN2=1 → atrás · iguales → freno.
// El L298N usa transistores bipolares y "se come" cerca de 2 V, así que con
// una batería de 7,4 V el motor recibe como máximo unos 5,4 V.
// Las entradas reciben el ciclo de trabajo (0–1) de cada pin, así que un pin
// fijo en HIGH vale 1 y uno en LOW vale 0.
// ---------------------------------------------------------------------------
export const L298N_DROP = 2

export function l298nChannel(in1: number, in2: number, en: number, vBattery: number, drop = L298N_DROP): number {
  const a = in1 > 0.5
  const b = in2 > 0.5
  if (a === b) return 0
  const vMax = Math.max(0, vBattery - drop)
  const v = vMax * Math.max(0, Math.min(1, en))
  return a ? v : -v
}

// ---------------------------------------------------------------------------
// Motor DC con reductora (motor TT amarillo, "BO")
// Modelo simple pero realista:
//   - La velocidad de equilibrio es proporcional al voltaje (ω = ω0 · V/Vnom).
//   - Por debajo de ~1 V el motor no vence la fricción de la reductora: no gira.
//   - La inercia hace que la rueda no cambie de velocidad al instante: sigue
//     a la velocidad objetivo con una constante de tiempo τ (primer orden).
// ---------------------------------------------------------------------------
export interface MotorParams {
  vNominal: number      // V
  rpmNoLoad: number     // rpm de la rueda a vNominal sin carga
  stallTorque: number   // N·m en la rueda a vNominal
  deadband: number      // V por debajo de los cuales no gira
  tau: number           // s, constante de tiempo (inercia)
}

export const MOTOR_TT: MotorParams = { vNominal: 6, rpmNoLoad: 200, stallTorque: 0.08, deadband: 1, tau: 0.08 }

export function motorTargetOmega(volts: number, m: MotorParams = MOTOR_TT): number {
  if (Math.abs(volts) < m.deadband) return 0
  const omega0 = (m.rpmNoLoad * 2 * Math.PI) / 60
  return omega0 * (volts / m.vNominal)
}

/** Avanza la velocidad angular de la rueda un paso dt (integración exacta del primer orden). */
export function motorStep(omega: number, volts: number, dt: number, m: MotorParams = MOTOR_TT): number {
  const target = motorTargetOmega(volts, m)
  return target + (omega - target) * Math.exp(-dt / m.tau)
}

// ---------------------------------------------------------------------------
// Sensor IR TCRT5000 (módulo con comparador)
// Emite infrarrojo y mide cuánto rebota. El blanco refleja mucho y el negro casi
// nada. El módulo tiene un comparador: su salida digital DO queda en ALTO sobre
// negro (no hay reflejo) y en BAJO sobre blanco. La salida analógica AO sube
// cuanto más oscuro es el piso.
// `reflectance` va de 0 (negro) a 1 (blanco).
// ---------------------------------------------------------------------------
export function irDigital(reflectance: number, threshold = 0.5): boolean {
  return reflectance < threshold
}

export function irAnalogVolts(reflectance: number, vcc = VCC): number {
  return (1 - Math.max(0, Math.min(1, reflectance))) * vcc * 0.95 + 0.1
}

// ---------------------------------------------------------------------------
// ADC de 10 bits: 0–5 V → 0–1023 (lo que devuelve analogRead)
// ---------------------------------------------------------------------------
export function voltsToAdc(volts: number, vref = VCC): number {
  return Math.max(0, Math.min(1023, Math.round((volts / vref) * 1023)))
}

// ---------------------------------------------------------------------------
// HC-SR04 (se usa en F2): el eco dura el tiempo de ida y vuelta del sonido.
// 343 m/s → 1 cm ida y vuelta ≈ 58 µs. Alcance máximo ~400 cm; sin eco, el
// módulo devuelve un pulso largo (~38 ms).
// ---------------------------------------------------------------------------
export const HCSR04_US_PER_CM = 58
export const HCSR04_MAX_CM = 400

export function hcsr04EchoMicros(distanceCm: number | null): number {
  if (distanceCm === null || distanceCm > HCSR04_MAX_CM || distanceCm < 2) return 38000
  return distanceCm * HCSR04_US_PER_CM
}

// ---------------------------------------------------------------------------
// Servo (se usa en F2): periodo 20 ms; el ancho del pulso fija el ángulo.
// La teoría dice 1 ms → 0° y 2 ms → 180°, pero la librería Servo de Arduino
// usa 544 µs → 0° y 2400 µs → 180°, y el SG90 real responde a ese rango.
// Usamos el rango de la librería para que servo.write(90) dé 90°.
// ---------------------------------------------------------------------------
export const SERVO_MIN_MS = 0.544
export const SERVO_MAX_MS = 2.4

export function servoPulseToAngle(pulseMs: number): number {
  return Math.max(0, Math.min(180, ((pulseMs - SERVO_MIN_MS) / (SERVO_MAX_MS - SERVO_MIN_MS)) * 180))
}
