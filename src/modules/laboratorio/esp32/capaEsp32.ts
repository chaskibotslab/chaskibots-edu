// ESP32 simulado a nivel de API Arduino.
//
// El sketch del alumno (escrito para un ESP32) se compila para un ATmega2560
// emulado, anteponiéndole esta «capa» que imita las funciones del ESP32:
//   - GPIO: el GPIOn del ESP32 es el pin n del Mega (todos los GPIO del
//     ESP32 son ≤ 39 y el Mega tiene 54 pines digitales).
//   - analogRead: 12 bits (0–4095) en los GPIO con ADC (36, 39, 34, 35, 32,
//     33, 25, 26), sobre los canales A0–A7 del Mega.
//   - ledcAttach/ledcWrite (core 3.x) y ledcSetup/ledcAttachPin (core 2.x),
//     analogWrite y ESP32Servo: en el ESP32 real los genera el hardware en
//     cualquier pin; aquí se avisan al simulador por los registros GPIOR
//     (ver engine/avrRunner.ts), así se miden exactos en cualquier pin.
//   - BluetoothSerial usa el mismo canal que Serial (el monitor y el control
//     remoto en pantalla); WiFi está simulado (siempre «conectado»).
// Límite conocido: en el AVR, `int` es de 16 bits (en el ESP32, 32).

const CAPA = String.raw`// ===== Capa ESP32 del simulador ChaskiBots Lab (no forma parte de tu programa) =====
#include <Arduino.h>

#undef LED_BUILTIN
#define LED_BUILTIN 2

static inline void cb_avisar(uint8_t cmd, uint8_t pin, uint8_t valor) { GPIOR1 = pin; GPIOR2 = valor; GPIOR0 = cmd; }

static inline int8_t cb_canal(uint8_t g) {
  switch (g) { case 36: return 0; case 39: return 1; case 34: return 2; case 35: return 3;
               case 32: return 4; case 33: return 5; case 25: return 6; case 26: return 7; }
  return -1;
}
static inline int cb_analogRead(uint8_t g) {
  int8_t c = cb_canal(g);
  if (c < 0) return digitalRead(g) ? 4095 : 0;
  return analogRead(A0 + c) * 4;
}
#define analogRead(p) cb_analogRead(p)
#define analogReadResolution(b)
#define analogSetAttenuation(a)
#define analogSetPinAttenuation(p, a)

static uint8_t cb_bits_pin[54];
static uint8_t cb_canal_pin[16];
static uint8_t cb_canal_bits[16];

static inline void cb_pwm(uint8_t pin, uint32_t duty, uint8_t bits) {
  if (pin > 53) return;
  if (bits < 1 || bits > 16) bits = 8;
  uint32_t maximo = (1UL << bits) - 1;
  if (duty > maximo) duty = maximo;
  pinMode(pin, OUTPUT);
  cb_avisar(1, pin, (uint8_t)((duty * 255UL) / maximo));
}

// LEDC del core 3.x
static inline bool ledcAttach(uint8_t pin, uint32_t freq, uint8_t bits) { if (pin < 54) cb_bits_pin[pin] = bits; pinMode(pin, OUTPUT); return true; }
static inline bool ledcAttachChannel(uint8_t pin, uint32_t freq, uint8_t bits, uint8_t canal) { if (canal < 16) { cb_canal_pin[canal] = pin + 1; cb_canal_bits[canal] = bits; } return ledcAttach(pin, freq, bits); }
static inline bool ledcDetach(uint8_t pin) { return true; }
// LEDC del core 2.x
static inline uint32_t ledcSetup(uint8_t canal, uint32_t freq, uint8_t bits) { if (canal < 16) cb_canal_bits[canal] = bits; return freq; }
static inline void ledcAttachPin(uint8_t pin, uint8_t canal) { if (canal < 16) cb_canal_pin[canal] = pin + 1; pinMode(pin, OUTPUT); }
static inline void ledcDetachPin(uint8_t pin) {}
// ledcWrite recibe un canal (core 2.x, si se usó ledcAttachPin) o un pin (core 3.x).
static inline bool ledcWrite(uint8_t pinOCanal, uint32_t duty) {
  if (pinOCanal < 16 && cb_canal_pin[pinOCanal]) cb_pwm(cb_canal_pin[pinOCanal] - 1, duty, cb_canal_bits[pinOCanal]);
  else cb_pwm(pinOCanal, duty, pinOCanal < 54 && cb_bits_pin[pinOCanal] ? cb_bits_pin[pinOCanal] : 8);
  return true;
}
#define analogWrite(p, v) cb_pwm((p), (v), 8)

// ESP32Servo
class ESP32PWM { public: static void allocateTimer(int) {} };
class CbServo {
 public:
  void setPeriodHertz(int) {}
  int attach(int pin) { return attach(pin, 544, 2400); }
  int attach(int pin, int minUs, int maxUs) { _pin = pin; _min = minUs; _max = maxUs; pinMode(pin, OUTPUT); write(90); return 1; }
  void write(int valor) {
    if (valor < 200) { valor = constrain(valor, 0, 180); _us = map(valor, 0, 180, _min, _max); }
    else _us = valor;
    avisar();
  }
  void writeMicroseconds(int us) { _us = us; avisar(); }
  int read() { return map(_us, _min, _max, 0, 180); }
  int readMicroseconds() { return _us; }
  bool attached() { return _pin >= 0; }
  void detach() { _pin = -1; }
 private:
  int _pin = -1, _min = 544, _max = 2400, _us = 1500;
  void avisar() { if (_pin >= 0) cb_avisar(2, _pin, (uint8_t)constrain(_us / 10, 0, 255)); }
};
#define Servo CbServo

// BluetoothSerial: mismo canal que Serial (control remoto en pantalla y monitor).
class BluetoothSerial {
 public:
  // Si el sketch ya inició Serial (TXEN0 activo), no se reinicia: cortaría lo que se está enviando.
  bool begin(const char*) { if (!(UCSR0B & _BV(TXEN0))) Serial.begin(115200); return true; }
  bool begin(String n) { return begin(n.c_str()); }
  bool begin() { return begin(""); }
  int available() { return Serial.available(); }
  int read() { return Serial.read(); }
  int peek() { return Serial.peek(); }
  bool hasClient() { return true; }
  String readString() { return Serial.readString(); }
  String readStringUntil(char c) { return Serial.readStringUntil(c); }
  size_t write(uint8_t b) { return Serial.write(b); }
  template <typename T> size_t print(T v) { return Serial.print(v); }
  template <typename T> size_t println(T v) { return Serial.println(v); }
  size_t println() { return Serial.println(); }
};

// WiFi simulado: se conecta al instante (no sale a internet).
#define WL_CONNECTED 3
#define WL_DISCONNECTED 6
#define WIFI_STA 1
#define WIFI_AP 2
#define WIFI_AP_STA 3
class CbWiFi {
 public:
  bool mode(int) { return true; }
  int begin(const char*, const char* = nullptr) { _ok = true; return WL_CONNECTED; }
  int status() { return _ok ? WL_CONNECTED : WL_DISCONNECTED; }
  String localIP() { return String("192.168.1.50"); }
  bool softAP(const char*, const char* = nullptr) { return true; }
  String softAPIP() { return String("192.168.4.1"); }
  bool disconnect() { _ok = false; return true; }
  long RSSI() { return -55; }
 private:
  bool _ok = false;
};
static CbWiFi WiFi;

static inline uint16_t touchRead(uint8_t) { return 60; }
static inline uint32_t esp_random() { return ((uint32_t)random(0x7FFF) << 16) | random(0xFFFF); }
// ===== Fin de la capa ESP32 =====
`

/** Librerías del ESP32 que la capa ya reemplaza (se quitan del sketch). */
const REEMPLAZADAS = ['ESP32Servo.h', 'ESP32_Servo.h', 'Servo.h', 'WiFi.h', 'BluetoothSerial.h', 'analogWrite.h']

/** Librerías del ESP32 que el simulador no tiene: error claro en español. */
const NO_DISPONIBLES = ['WebServer.h', 'ESPAsyncWebServer.h', 'HTTPClient.h', 'PubSubClient.h', 'Preferences.h', 'SPIFFS.h', 'esp_now.h', 'BLEDevice.h', 'ArduinoJson.h']

export interface SketchEsp32 { codigo: string; error?: string }

/**
 * Prepara un sketch de ESP32 para compilarlo en el ATmega2560 del simulador:
 * quita los #include que la capa reemplaza y la antepone. La directiva #line
 * hace que los errores del compilador apunten a las líneas del alumno.
 */
export function prepararSketchEsp32(codigo: string): SketchEsp32 {
  for (const lib of NO_DISPONIBLES) {
    if (new RegExp(`#include\\s*[<"]${lib.replace('.', '\\.')}[>"]`).test(codigo)) {
      return { codigo, error: `La librería ${lib} todavía no está en el simulador del ESP32 (sí funciona en tu placa real).` }
    }
  }
  const limpio = codigo
    .split('\n')
    .map(l => (REEMPLAZADAS.some(lib => new RegExp(`^\\s*#include\\s*[<"]${lib.replace('.', '\\.')}[>"]`).test(l)) ? `// ${l.trim()}  (lo provee el simulador)` : l))
    .join('\n')
  return { codigo: `${CAPA}\n#line 1 "sketch.ino"\n${limpio}` }
}

/** Cuántas líneas tiene la capa (para descontar si el compilador marca un error dentro de ella). */
export const LINEAS_CAPA = CAPA.split('\n').length + 1
