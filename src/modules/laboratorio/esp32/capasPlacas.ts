// Raspberry Pi Pico y Arduino Mega simulados sobre el ATmega2560, igual que
// el ESP32 (ver capaEsp32.ts): el sketch del alumno se compila para el Mega
// con una «capa» delante que imita lo que cambia en cada placa.
//
// Raspberry Pi Pico (core arduino-pico): GPn = pin n del Mega (GP0–GP28).
//   - analogRead en GP26–GP28 (A0–A2), 10 bits por defecto y
//     analogReadResolution(12) como en la Pico real.
//   - analogWrite en cualquier GP, con analogWriteRange/analogWriteResolution.
//   - LED_BUILTIN = GP25. Servo.h lo provee la capa.
// Arduino Mega 2560: es el chip que se emula, así que corre su propio core.
//   La capa solo informa el PWM (D2–D13 y D44–D46) y los servos al
//   simulador, porque de los timers 1–5 solo se emula el 2 (tone).
// MicroPython no se simula: la Pico se programa en C++ (Arduino), como en el IDE.

import { CB_PWM, CB_SERVO, prepararSketchEsp32 } from './capaEsp32'

const CAPA_PICO = String.raw`// ===== Capa Raspberry Pi Pico del simulador ChaskiBots Lab (no forma parte de tu programa) =====
#include <Arduino.h>

#undef LED_BUILTIN
#define LED_BUILTIN 25

${CB_PWM}
// ADC: GP26–GP28 son A0–A2 del Mega emulado.
static uint8_t cb_bits_adc = 10;
static inline int cb_analogRead(uint8_t gp) {
  if (gp < 26 || gp > 28) return digitalRead(gp) ? (1 << cb_bits_adc) - 1 : 0;
  int v = analogRead(54 + (gp - 26));
  return cb_bits_adc >= 10 ? v << (cb_bits_adc - 10) : v >> (10 - cb_bits_adc);
}
#define A0 26
#define A1 27
#define A2 28
#define analogRead(p) cb_analogRead(p)
#define analogReadResolution(b) (cb_bits_adc = (b))

// PWM en cualquier GP (por defecto de 0 a 255).
static uint32_t cb_rango_pwm = 255;
static inline void cb_analogWrite(uint8_t pin, uint32_t v) {
  if (v > cb_rango_pwm) v = cb_rango_pwm;
  cb_pwm(pin, (v * 255UL) / cb_rango_pwm, 8);
}
#define analogWrite(p, v) cb_analogWrite((p), (v))
#define analogWriteRange(r) (cb_rango_pwm = (r))
#define analogWriteResolution(b) (cb_rango_pwm = (1UL << (b)) - 1)
#define analogWriteFreq(f)

${CB_SERVO}
#define sleep_ms(ms) delay(ms)
#define sleep_us(us) delayMicroseconds(us)
// ===== Fin de la capa Pico =====
`

const CAPA_MEGA = String.raw`// ===== Capa Arduino Mega del simulador ChaskiBots Lab (no forma parte de tu programa) =====
#include <Arduino.h>

${CB_PWM}
// Como en el Mega real: PWM solo en D2–D13 y D44–D46; en los demás pines,
// analogWrite pone HIGH desde 128 y LOW por debajo.
static inline void cb_analogWrite(uint8_t pin, int v) {
  if (!digitalPinHasPWM(pin)) { pinMode(pin, OUTPUT); digitalWrite(pin, v < 128 ? LOW : HIGH); return; }
  cb_pwm(pin, constrain(v, 0, 255), 8);
}
#define analogWrite(p, v) cb_analogWrite((p), (v))

${CB_SERVO}
// ===== Fin de la capa Mega =====
`

export interface SketchListo { board: string; codigo: string; error?: string }

/** Quita los #include que la capa reemplaza (los deja comentados para que las líneas no cambien). */
function sinIncludes(codigo: string, libs: string[]) {
  return codigo
    .split('\n')
    .map(l => (libs.some(lib => new RegExp(`^\\s*#include\\s*[<"]${lib.replace('.', '\\.')}[>"]`).test(l)) ? `// ${l.trim()}  (lo provee el simulador)` : l))
    .join('\n')
}

/**
 * Prepara el sketch para el compilador: el ESP32, la Pico y el Mega se
 * compilan para el ATmega2560 con su capa delante; el UNO y el Nano, tal cual.
 * La directiva #line hace que los errores apunten a las líneas del alumno.
 */
export function prepararSketch(board: string, codigo: string): SketchListo {
  if (board === 'esp32') {
    const r = prepararSketchEsp32(codigo)
    return { board: 'mega', codigo: r.codigo, error: r.error }
  }
  if (board === 'pico') {
    if (/#include\s*[<"]WiFi\.h[>"]/.test(codigo)) return { board: 'mega', codigo, error: 'El WiFi de la Pico W todavía no está en el simulador (sí funciona en tu placa real).' }
    return { board: 'mega', codigo: `${CAPA_PICO}\n#line 1 "sketch.ino"\n${sinIncludes(codigo, ['Servo.h'])}` }
  }
  if (board === 'mega') return { board: 'mega', codigo: `${CAPA_MEGA}\n#line 1 "sketch.ino"\n${sinIncludes(codigo, ['Servo.h'])}` }
  return { board, codigo }
}
