// Proyectos de la mesa de electrónica: los de los kits con los mismos pines y
// el mismo código que la clase (E1: 8vo EGB, semáforo inteligente con UNO;
// E2: 9no EGB, basurero inteligente con Nano, HC-SR04 y servo) y algunos extra
// con las mismas piezas. Se arman con las operaciones del taller, así
// que el alumno los puede abrir, cambiar y volver a cablear.

import { pinCodigo, pinDePlaca, type FilaPin } from '../engine/autocableado'
import { pieza } from '../catalogo/piezas'
import { bancoVacio, encastrar } from '../engine/ensamblaje'
import type { RobotDoc } from './doc'
import type { PlantillaCodigo, Prearmado } from './prearmados'

const NEGRO = '#111827'
const ROJO = '#ef4444'
const GRIS = '#94a3b8'

class Banco {
  doc: RobotDoc
  constructor(nombre: string, placa = 'arduino-uno') { this.doc = bancoVacio(placa, nombre) }
  /** Pincha un componente en un hueco (1–8 arriba de la canaleta, 9–16 abajo). */
  poner(piezaId: string, hueco: number) {
    const r = encastrar(this.doc, piezaId, 'protoboard', `hueco-${hueco}`)
    this.doc = r.doc
    return r.id
  }
  cable(a: [string, string], b: [string, string], color: string) {
    this.doc = { ...this.doc, cables: [...this.doc.cables, { de: a, a: b, color }] }
  }
  /** Encastra una pieza en cualquier montaje (la maqueta, el sensor de la maqueta, el eje del servo…). */
  montar(piezaId: string, padre: string, montaje: string) {
    const r = encastrar(this.doc, piezaId, padre, montaje)
    this.doc = r.doc
    return r.id
  }
  /** HC-SR04: 5 V y tierra de la placa; TRIG y ECHO a los pines del kit de 9no. */
  ultrasonido(padre = 'protoboard', montaje = 'sensor', trig = 'D9', echo = 'D10') {
    const u = this.montar('hcsr04', padre, montaje)
    this.cable([u, 'VCC'], ['placa', '5V'], ROJO)
    this.cable([u, 'TRIG'], ['placa', trig], '#ea580c')
    this.cable([u, 'ECHO'], ['placa', echo], '#9333ea')
    this.cable([u, 'GND'], ['placa', 'GND'], NEGRO)
    return u
  }
  /** Servo SG90: marrón a tierra, rojo a 5 V y naranja (señal) al pin PWM. */
  servo(padre = 'protoboard', montaje = 'servo', senal = 'D6') {
    const sv = this.montar('sg90', padre, montaje)
    this.cable([sv, 'GND'], ['placa', 'GND'], '#7c2d12')
    this.cable([sv, 'V+'], ['placa', '5V'], ROJO)
    this.cable([sv, 'SIG'], ['placa', senal], '#0891b2')
    return sv
  }
  /** LED con su resistencia: ánodo al pin, cátodo → resistencia → tierra. */
  ledConResistencia(led: string, huecoLed: number, pin: string, color: string, resistencia = 'resistencia-330') {
    const l = this.poner(led, huecoLed)
    const r = this.poner(resistencia, huecoLed + 8)
    this.cable([l, 'A'], ['placa', pin], color)
    this.cable([l, 'K'], [r, '1'], GRIS)
    this.cable([r, '2'], ['placa', 'GND'], NEGRO)
    return l
  }
  terminar(cpp: string): RobotDoc {
    // Cables como en la guía del kit: el cableado automático no los rehace.
    return { ...this.doc, cableado: 'manual', programa: { modo: 'codigo', cpp } }
  }
}

// ---------------------------------------------------------------------------
// Códigos (los del kit de 8vo, con sus comentarios)
// ---------------------------------------------------------------------------

const PRIMER_LED = `// Mi primer LED: se enciende y se apaga una vez por segundo.
const int LED = 8;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
`

const SOS = `// Reto: señal de auxilio (SOS) con el LED del pin 8.
const int LED = 8;

void destello(int duracion) {
  digitalWrite(LED, HIGH);
  delay(duracion);
  digitalWrite(LED, LOW);
  delay(200);
}

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  for (int i = 0; i < 3; i++) destello(150);  // S: tres cortos
  for (int i = 0; i < 3; i++) destello(500);  // O: tres largos
  for (int i = 0; i < 3; i++) destello(150);  // S: tres cortos
  delay(1500);
}
`

const PULSADOR_LED = `// El LED se enciende mientras presionas el botón.
const int PULSADOR = 2;
const int LED = 8;

void setup() {
  // INPUT_PULLUP: el pin queda en HIGH hasta que el botón lo une a tierra.
  pinMode(PULSADOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool presionado = (digitalRead(PULSADOR) == LOW);
  digitalWrite(LED, presionado ? HIGH : LOW);
}
`

const INTERRUPTOR = `// Reto: cada vez que presionas, el LED cambia (encendido ↔ apagado).
const int PULSADOR = 2;
const int LED = 8;

bool encendido = false;
bool antes = HIGH;

void setup() {
  pinMode(PULSADOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool ahora = digitalRead(PULSADOR);
  if (antes == HIGH && ahora == LOW) {   // recién presionado
    encendido = !encendido;
    digitalWrite(LED, encendido ? HIGH : LOW);
    delay(50);                           // espera a que el botón deje de rebotar
  }
  antes = ahora;
}
`

const BUZZER = `// El buzzer suena medio segundo y calla un segundo.
const int BUZZER = 7;

void setup() {
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  tone(BUZZER, 1000);   // 1000 vibraciones por segundo
  delay(500);
  noTone(BUZZER);
  delay(1000);
}
`

const MELODIA = `// Reto: una melodía corta (Do Re Mi Fa Sol).
const int BUZZER = 7;
const int NOTAS[] = {262, 294, 330, 349, 392};

void setup() {
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  for (int i = 0; i < 5; i++) {
    tone(BUZZER, NOTAS[i], 250);
    delay(300);
  }
  delay(1000);
}
`

const TRES_LEDS = `// Los tres colores del semáforo, uno tras otro.
const int ROJO = 8;
const int AMARILLO = 9;
const int VERDE = 10;

void setup() {
  pinMode(ROJO, OUTPUT);
  pinMode(AMARILLO, OUTPUT);
  pinMode(VERDE, OUTPUT);
}

void loop() {
  digitalWrite(ROJO, HIGH);
  delay(1000);
  digitalWrite(ROJO, LOW);
  digitalWrite(AMARILLO, HIGH);
  delay(500);
  digitalWrite(AMARILLO, LOW);
  digitalWrite(VERDE, HIGH);
  delay(1000);
  digitalWrite(VERDE, LOW);
}
`

export const SEMAFORO = `/*
  Semaforo inteligente con paso peatonal
  Kit 8vo EGB - Arduino UNO R3

  El semaforo cicla rojo -> verde -> amarillo -> rojo. Si un peaton
  presiona el pulsador mientras el semaforo esta en verde, se corta
  el ciclo, pasa a amarillo y luego a rojo para dejar cruzar,
  avisando con el buzzer.

  IMPORTANTE: el buzzer de este kit es PASIVO. Un buzzer pasivo solo
  suena con tone()/noTone() (necesita una señal oscilante); si le
  mandas digitalWrite(HIGH) se queda en silencio o hace un clic.
*/

const int LED_ROJO = 8;
const int LED_AMARILLO = 9;
const int LED_VERDE = 10;
const int PULSADOR_PEATON = 2;
const int BUZZER = 7;

const unsigned long TIEMPO_VERDE = 5000;
const unsigned long TIEMPO_AMARILLO = 1500;
const unsigned long TIEMPO_ROJO = 4000;

bool peatonEsperando = false;

void setup() {
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(PULSADOR_PEATON, INPUT_PULLUP);

  apagarTodo();
  digitalWrite(LED_ROJO, HIGH);
}

void loop() {
  cicloVerdeConInterrupcion();

  apagarTodo();
  digitalWrite(LED_AMARILLO, HIGH);
  delay(TIEMPO_AMARILLO);

  apagarTodo();
  digitalWrite(LED_ROJO, HIGH);
  if (peatonEsperando) {
    avisoSonoroCruce();
    peatonEsperando = false;
  }
  delay(TIEMPO_ROJO);
}

void cicloVerdeConInterrupcion() {
  apagarTodo();
  digitalWrite(LED_VERDE, HIGH);

  unsigned long inicio = millis();
  while (millis() - inicio < TIEMPO_VERDE) {
    if (digitalRead(PULSADOR_PEATON) == LOW) {
      peatonEsperando = true;
      break;
    }
  }
}

void avisoSonoroCruce() {
  for (int i = 0; i < 3; i++) {
    tone(BUZZER, 1500, 150);
    delay(300);
  }
  noTone(BUZZER);
}

void apagarTodo() {
  digitalWrite(LED_ROJO, LOW);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_VERDE, LOW);
}
`

const POT_BRILLO = `// La perilla regula el brillo del LED (PWM).
const int PERILLA = A0;
const int LED = 9;   // pin con ~: puede dar PWM

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lectura = analogRead(PERILLA);        // 0 a 1023
  int brillo = map(lectura, 0, 1023, 0, 255);
  analogWrite(LED, brillo);                 // 0 a 255
  Serial.print("Perilla: ");
  Serial.print(lectura);
  Serial.print("  brillo: ");
  Serial.println(brillo);
  delay(100);
}
`

const LUZ_NOCTURNA = `// Luz nocturna: si está oscuro, el LED se enciende solo.
const int SENSOR_LUZ = A0;   // LDR con resistencia de 1 kΩ (divisor)
const int LED = 8;
const int UMBRAL = 300;      // por debajo de este número, "está oscuro"

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int luz = analogRead(SENSOR_LUZ);   // más luz → número más alto
  Serial.print("Luz: ");
  Serial.println(luz);
  digitalWrite(LED, luz < UMBRAL ? HIGH : LOW);
  delay(200);
}
`

const RGB_ARCOIRIS = `// LED RGB: mezcla rojo, verde y azul para hacer todos los colores.
const int R = 9;
const int G = 10;
const int B = 11;

void color(int r, int g, int b) {
  analogWrite(R, r);
  analogWrite(G, g);
  analogWrite(B, b);
}

void setup() {
  pinMode(R, OUTPUT);
  pinMode(G, OUTPUT);
  pinMode(B, OUTPUT);
}

void loop() {
  color(255, 0, 0);   delay(700);   // rojo
  color(255, 120, 0); delay(700);   // naranja
  color(0, 255, 0);   delay(700);   // verde
  color(0, 255, 255); delay(700);   // celeste
  color(0, 0, 255);   delay(700);   // azul
  color(255, 0, 255); delay(700);   // morado
  color(255, 255, 255); delay(700); // blanco
}
`

const REFLEJOS = `// Juego de reflejos: cuando se prenda el LED verde, presiona lo más rápido que puedas.
const int LED_ESPERA = 8;    // rojo: espera
const int LED_YA = 10;       // verde: ¡ahora!
const int PULSADOR = 2;
const int BUZZER = 7;

void setup() {
  pinMode(LED_ESPERA, OUTPUT);
  pinMode(LED_YA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(PULSADOR, INPUT_PULLUP);
  Serial.begin(9600);
  randomSeed(micros());
}

void loop() {
  digitalWrite(LED_ESPERA, HIGH);
  digitalWrite(LED_YA, LOW);
  delay(random(1500, 4000));           // espera un tiempo que nadie adivina
  digitalWrite(LED_ESPERA, LOW);
  digitalWrite(LED_YA, HIGH);
  unsigned long inicio = millis();
  while (digitalRead(PULSADOR) == HIGH) {}   // espera el botón
  unsigned long tiempo = millis() - inicio;
  digitalWrite(LED_YA, LOW);
  tone(BUZZER, 1200, 120);
  Serial.print("Tu tiempo: ");
  Serial.print(tiempo);
  Serial.println(" ms");
  delay(1500);
}
`

// ---------------------------------------------------------------------------
// Códigos del kit de 9no (Arduino Nano V3), tal como están en la plataforma
// ---------------------------------------------------------------------------

const LED_TAPA = `/*
  Practica: enciende el LED indicador
  Kit 9no EGB - Arduino Nano V3
  Mismo pin que usara el basurero inteligente (D8).
*/
const int LED = 8;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
`

const MIDE_DISTANCIA = `/*
  Practica: mide distancia con el sensor ultrasonico
  Kit 9no EGB - Arduino Nano V3
  Mismos pines que usara el basurero inteligente (D9 y D10). Abre el
  Monitor Serial (9600 baudios) para ver la distancia en centimetros.
*/
const int TRIG = 9;
const int ECHO = 10;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duracion = pulseIn(ECHO, HIGH, 25000);
  long distanciaCm = duracion / 58;

  Serial.print("Distancia: ");
  Serial.print(distanciaCm);
  Serial.println(" cm");
  delay(300);
}
`

const MUEVE_SERVO = `/*
  Practica: mueve el servomotor
  Kit 9no EGB - Arduino Nano V3
  Mismo pin que usara el basurero inteligente (D6). El servo gira de
  0 a 90 grados y vuelve, una y otra vez.
*/
#include <Servo.h>

const int SERVO_PIN = 6;
Servo motor;

void setup() {
  motor.attach(SERVO_PIN);
}

void loop() {
  motor.write(0);
  delay(800);
  motor.write(90);
  delay(800);
}
`

export const BASURERO = `/*
  Basurero inteligente con apertura automatica
  Kit 9no EGB - Arduino Nano V3
  Academia Militar Lizardo Alfonzo Villamarin

  Un sensor ultrasonico mide la distancia a la mano o al objeto. Si
  esta lo bastante cerca, el servomotor abre la tapa y un LED
  parpadea para confirmar (este kit no incluye buzzer: la
  confirmacion es visual).
*/

#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int LED_TAPA = 8;

const int DISTANCIA_APERTURA_CM = 15;
const int ANGULO_CERRADO = 0;
const int ANGULO_ABIERTO = 90;
const unsigned long TIEMPO_ABIERTA_MS = 3000;

Servo tapa;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_TAPA, OUTPUT);
  tapa.attach(SERVO_PIN);
  tapa.write(ANGULO_CERRADO);
  Serial.begin(9600);
}

void loop() {
  long distancia = medirDistanciaCm();
  if (distancia > 0 && distancia <= DISTANCIA_APERTURA_CM) {
    abrirTapa();
  }
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}

void abrirTapa() {
  tapa.write(ANGULO_ABIERTO);
  parpadearConfirmacion();
  delay(TIEMPO_ABIERTA_MS);
  tapa.write(ANGULO_CERRADO);
  digitalWrite(LED_TAPA, LOW);
  delay(500);
}

void parpadearConfirmacion() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_TAPA, HIGH);
    delay(100);
    digitalWrite(LED_TAPA, LOW);
    delay(100);
  }
  digitalWrite(LED_TAPA, HIGH);
}
`

const CONTADOR = `/*
  Contador de personas
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Mismo armado del basurero inteligente (sin el servo). Cada vez que
  algo pasa frente al sensor, suma 1 al contador, lo muestra por el
  Monitor Serial y el LED confirma (este kit no trae buzzer).
*/
const int TRIG = 9;
const int ECHO = 10;
const int LED_CONTADOR = 8;

const int DISTANCIA_DETECCION_CM = 20;
int contador = 0;
bool detectadoAntes = false;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_CONTADOR, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long distancia = medirDistanciaCm();
  bool detectadoAhora = (distancia > 0 && distancia <= DISTANCIA_DETECCION_CM);

  if (detectadoAhora && !detectadoAntes) {
    contador++;
    Serial.print("Personas contadas: ");
    Serial.println(contador);
    digitalWrite(LED_CONTADOR, HIGH);
  } else if (!detectadoAhora) {
    digitalWrite(LED_CONTADOR, LOW);
  }

  detectadoAntes = detectadoAhora;
  delay(150);
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
`

const DISPENSADOR = `/*
  Dispensador automatico
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Mismo armado del basurero inteligente. Al acercar la mano, el
  servomotor abre la compuerta un momento y el LED confirma (sin
  buzzer).
*/
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int LED_CONFIRMA = 8;

const int DISTANCIA_CM = 10;
const unsigned long TIEMPO_ABIERTO_MS = 1000;

Servo compuerta;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_CONFIRMA, OUTPUT);
  compuerta.attach(SERVO_PIN);
  compuerta.write(0);
}

void loop() {
  long distancia = medirDistanciaCm();
  if (distancia > 0 && distancia <= DISTANCIA_CM) {
    compuerta.write(90);
    digitalWrite(LED_CONFIRMA, HIGH);
    delay(TIEMPO_ABIERTO_MS);
    compuerta.write(0);
    digitalWrite(LED_CONFIRMA, LOW);
    delay(1000);
  }
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
`

const PUERTA = `/*
  Puerta automatica
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Mismo armado del basurero inteligente. La puerta se abre cuando
  alguien se acerca y se mantiene abierta mientras siga cerca.
*/
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int LED_PUERTA_ABIERTA = 8;

const int DISTANCIA_CM = 30;

Servo puerta;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_PUERTA_ABIERTA, OUTPUT);
  puerta.attach(SERVO_PIN);
  puerta.write(0);
}

void loop() {
  long distancia = medirDistanciaCm();
  bool hayAlguien = (distancia > 0 && distancia <= DISTANCIA_CM);

  puerta.write(hayAlguien ? 90 : 0);
  digitalWrite(LED_PUERTA_ABIERTA, hayAlguien ? HIGH : LOW);
  delay(200);
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
`

const ALARMA_PROXIMIDAD = `/*
  Alarma de proximidad (visual con LEDs)
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Un LED parpadea mas rapido mientras mas cerca esta un objeto del
  sensor (este kit no tiene buzzer: la alarma es 100% visual). El
  potenciometro ajusta la sensibilidad y el pulsador enciende/apaga
  la alarma.
*/
const int TRIG = 9;
const int ECHO = 10;
const int LED_ALARMA = 8;
const int POTENCIOMETRO = A0;
const int PULSADOR_ON_OFF = 2;

bool alarmaEncendida = true;
bool pulsadorAntes = false;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_ALARMA, OUTPUT);
  pinMode(PULSADOR_ON_OFF, INPUT_PULLUP);
}

void loop() {
  bool pulsadorAhora = (digitalRead(PULSADOR_ON_OFF) == LOW);
  if (pulsadorAhora && !pulsadorAntes) {
    alarmaEncendida = !alarmaEncendida;
    delay(50);
  }
  pulsadorAntes = pulsadorAhora;

  if (!alarmaEncendida) {
    digitalWrite(LED_ALARMA, LOW);
    return;
  }

  long distancia = medirDistanciaCm();
  int sensibilidadCm = map(analogRead(POTENCIOMETRO), 0, 1023, 10, 100);

  if (distancia > 0 && distancia <= sensibilidadCm) {
    int pausa = map(distancia, 0, sensibilidadCm, 50, 400); // mas cerca = parpadeo mas rapido
    digitalWrite(LED_ALARMA, HIGH);
    delay(pausa / 2);
    digitalWrite(LED_ALARMA, LOW);
    delay(pausa / 2);
  } else {
    digitalWrite(LED_ALARMA, LOW);
  }
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
`

// ---------------------------------------------------------------------------
// Armado de cada proyecto
// ---------------------------------------------------------------------------

export function construirPrimerLed(): RobotDoc {
  const b = new Banco('Mi primer LED')
  b.ledConResistencia('led-rojo', 2, 'D8', '#f97316')
  return b.terminar(PRIMER_LED)
}

export function construirPulsadorLed(): RobotDoc {
  const b = new Banco('Pulsador y LED')
  b.ledConResistencia('led-rojo', 2, 'D8', '#f97316')
  const p = b.poner('pulsador', 5)
  b.cable([p, '1'], ['placa', 'D2'], '#3b82f6')
  b.cable([p, '2'], ['placa', 'GND'], NEGRO)
  return b.terminar(PULSADOR_LED)
}

export function construirBuzzer(): RobotDoc {
  const b = new Banco('El buzzer suena')
  const z = b.poner('buzzer-pasivo', 3)
  b.cable([z, '+'], ['placa', 'D7'], '#a855f7')
  b.cable([z, '-'], ['placa', 'GND'], NEGRO)
  return b.terminar(BUZZER)
}

export function construirTresLeds(): RobotDoc {
  const b = new Banco('Tres LED en secuencia')
  b.ledConResistencia('led-rojo', 1, 'D8', '#f97316')
  b.ledConResistencia('led-amarillo', 2, 'D9', '#eab308')
  b.ledConResistencia('led-verde', 3, 'D10', '#22c55e')
  return b.terminar(TRES_LEDS)
}

export function construirSemaforo(): RobotDoc {
  const b = new Banco('Semáforo inteligente')
  b.ledConResistencia('led-rojo', 1, 'D8', '#f97316')
  b.ledConResistencia('led-amarillo', 2, 'D9', '#eab308')
  b.ledConResistencia('led-verde', 3, 'D10', '#22c55e')
  const p = b.poner('pulsador', 5)
  b.cable([p, '1'], ['placa', 'D2'], '#3b82f6')
  b.cable([p, '2'], ['placa', 'GND'], NEGRO)
  const z = b.poner('buzzer-pasivo', 7)
  b.cable([z, '+'], ['placa', 'D7'], '#a855f7')
  b.cable([z, '-'], ['placa', 'GND'], NEGRO)
  return b.terminar(SEMAFORO)
}

export function construirPotBrillo(): RobotDoc {
  const b = new Banco('Perilla y brillo')
  b.ledConResistencia('led-azul', 2, 'D9', '#3b82f6', 'resistencia-220')
  const pt = b.poner('potenciometro-10k', 5)
  b.cable([pt, '1'], ['placa', '5V'], ROJO)
  b.cable([pt, 'W'], ['placa', 'A0'], '#22c55e')
  b.cable([pt, '2'], ['placa', 'GND'], NEGRO)
  return b.terminar(POT_BRILLO)
}

export function construirLuzNocturna(): RobotDoc {
  const b = new Banco('Luz nocturna')
  b.ledConResistencia('led-blanco', 2, 'D8', '#f97316', 'resistencia-220')
  const l = b.poner('ldr', 5)
  const r = b.poner('resistencia-1000', 13)
  b.cable([l, '1'], ['placa', '5V'], ROJO)
  b.cable([l, '2'], ['placa', 'A0'], '#22c55e')
  b.cable([l, '2'], [r, '1'], GRIS)
  b.cable([r, '2'], ['placa', 'GND'], NEGRO)
  return b.terminar(LUZ_NOCTURNA)
}

export function construirRgb(): RobotDoc {
  const b = new Banco('LED RGB arcoíris')
  const l = b.poner('led-rgb', 3)
  const resistencias = [b.poner('resistencia-220', 1), b.poner('resistencia-220', 2), b.poner('resistencia-220', 4)]
  const pines: [string, string, string][] = [['R', 'D9', '#ef4444'], ['G', 'D10', '#22c55e'], ['B', 'D11', '#3b82f6']]
  pines.forEach(([pin, placa, color], i) => {
    b.cable([resistencias[i], '1'], ['placa', placa], color)
    b.cable([resistencias[i], '2'], [l, pin], GRIS)
  })
  b.cable([l, 'K'], ['placa', 'GND'], NEGRO)
  return b.terminar(RGB_ARCOIRIS)
}

export function construirReflejos(): RobotDoc {
  const b = new Banco('Juego de reflejos')
  b.ledConResistencia('led-rojo', 1, 'D8', '#f97316')
  b.ledConResistencia('led-verde', 3, 'D10', '#22c55e')
  const p = b.poner('pulsador', 5)
  b.cable([p, '1'], ['placa', 'D2'], '#3b82f6')
  b.cable([p, '2'], ['placa', 'GND'], NEGRO)
  const z = b.poner('buzzer-pasivo', 7)
  b.cable([z, '+'], ['placa', 'D7'], '#a855f7')
  b.cable([z, '-'], ['placa', 'GND'], NEGRO)
  return b.terminar(REFLEJOS)
}

// Sin placa: la pila alimenta el circuito (no hace falta programa).
const LED_PILA = `// Este circuito no necesita programa: la pila de 9 V lo alimenta.
// Prueba cambiar la resistencia de 1 kΩ por una de 220 Ω (brilla más)
// o por una de 10 kΩ (casi no brilla). Sin resistencia, el LED se quema.
void setup() {}
void loop() {}
`

// ---------------------------------------------------------------------------
// Raspberry Pi Pico y Arduino Mega
// ---------------------------------------------------------------------------

const PICO_PARPADEO = `// Raspberry Pi Pico: el LED de GP15 y el de la placa (GP25) se turnan.
const int LED = 15;   // en la Pico el número es el del GP

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);   // LED_BUILTIN = GP25
}

void loop() {
  digitalWrite(LED, HIGH);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
  digitalWrite(LED, LOW);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
}
`

const PICO_PERILLA = `// Raspberry Pi Pico: la perilla (en GP26 = A0) regula el brillo del LED.
// El ADC de la Pico es de 12 bits: con analogReadResolution(12) lee de 0 a 4095.
const int PERILLA = A0;   // GP26
const int LED = 15;       // en la Pico todos los GP tienen PWM

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  pinMode(LED, OUTPUT);
}

void loop() {
  int lectura = analogRead(PERILLA);          // 0 a 4095
  int brillo = map(lectura, 0, 4095, 0, 255);
  analogWrite(LED, brillo);
  Serial.print("Perilla: ");
  Serial.print(lectura);
  Serial.print("  voltaje: ");
  Serial.println(lectura * 3.3 / 4095);
  delay(100);
}
`

const MEGA_BARRA = `// Arduino Mega: barra de 7 LEDs que sube con la perilla.
// Usa los pines que el UNO no tiene: D22–D28 y la entrada analógica A8.
const int PERILLA = A8;
const int PRIMER_LED = 22;
const int CANTIDAD = 7;

void setup() {
  for (int i = 0; i < CANTIDAD; i++) pinMode(PRIMER_LED + i, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lectura = analogRead(PERILLA);                  // 0 a 1023
  int encendidos = map(lectura, 0, 1023, 0, CANTIDAD);
  for (int i = 0; i < CANTIDAD; i++) {
    digitalWrite(PRIMER_LED + i, i < encendidos ? HIGH : LOW);
  }
  Serial.print("LEDs encendidos: ");
  Serial.println(encendidos);
  delay(50);
}
`

export function construirPicoParpadeo(): RobotDoc {
  const b = new Banco('Pico: primer LED', 'raspberry-pico')
  b.ledConResistencia('led-rojo', 2, 'GP15', '#ef4444', 'resistencia-220')
  return b.terminar(PICO_PARPADEO)
}

export function construirPicoPerilla(): RobotDoc {
  const b = new Banco('Pico: perilla y brillo', 'raspberry-pico')
  b.ledConResistencia('led-verde', 2, 'GP15', '#22c55e', 'resistencia-220')
  const pt = b.poner('potenciometro-10k', 5)
  // En la Pico la perilla va a 3,3 V: su ADC no aguanta 5 V.
  b.cable([pt, '1'], ['placa', '3V3'], ROJO)
  b.cable([pt, 'W'], ['placa', 'GP26'], '#a855f7')
  b.cable([pt, '2'], ['placa', 'GND'], NEGRO)
  return b.terminar(PICO_PERILLA)
}

export function construirMegaBarra(): RobotDoc {
  const b = new Banco('Mega: barra de LEDs', 'arduino-mega')
  const colores = ['led-verde', 'led-verde', 'led-verde', 'led-amarillo', 'led-amarillo', 'led-rojo', 'led-rojo']
  colores.forEach((led, i) => b.ledConResistencia(led, i + 1, `D${22 + i}`, SENAL_MEGA[i], 'resistencia-330'))
  const pt = b.poner('potenciometro-10k', 16)
  b.cable([pt, '1'], ['placa', '5V'], ROJO)
  b.cable([pt, 'W'], ['placa', 'A8'], '#a855f7')
  b.cable([pt, '2'], ['placa', 'GND'], NEGRO)
  return b.terminar(MEGA_BARRA)
}
const SENAL_MEGA = ['#3b82f6', '#06b6d4', '#14b8a6', '#84cc16', '#eab308', '#f97316', '#ec4899']

const JOYSTICK_LEDS = `// Joystick: cuatro LEDs muestran hacia dónde mueves la palanca.
// Cada eje es un potenciómetro: al centro lee unos 512; de 0 a 1023 hacia cada lado.
const int EJE_X = A0;
const int EJE_Y = A1;
const int BOTON = 2;        // SW: va a tierra al presionar la palanca
const int ARRIBA = 8;
const int ABAJO = 9;
const int IZQUIERDA = 10;
const int DERECHA = 11;

void setup() {
  pinMode(ARRIBA, OUTPUT);
  pinMode(ABAJO, OUTPUT);
  pinMode(IZQUIERDA, OUTPUT);
  pinMode(DERECHA, OUTPUT);
  pinMode(BOTON, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  int x = analogRead(EJE_X);
  int y = analogRead(EJE_Y);
  bool presionado = digitalRead(BOTON) == LOW;   // presionado: se encienden todos

  digitalWrite(DERECHA, x > 700 || presionado);
  digitalWrite(IZQUIERDA, x < 300 || presionado);
  digitalWrite(ARRIBA, y > 700 || presionado);
  digitalWrite(ABAJO, y < 300 || presionado);

  Serial.print("X: ");
  Serial.print(x);
  Serial.print("  Y: ");
  Serial.print(y);
  Serial.println(presionado ? "  (botón)" : "");
  delay(100);
}
`

export function construirJoystickLeds(): RobotDoc {
  const b = new Banco('Joystick y LEDs')
  const colores = ['#3b82f6', '#22c55e', '#f97316', '#ec4899']
  ;(['led-verde', 'led-verde', 'led-amarillo', 'led-amarillo'] as const).forEach((led, i) => b.ledConResistencia(led, i + 1, `D${8 + i}`, colores[i]))
  const j = b.montar('joystick', 'protoboard', 'modulo')
  b.cable([j, 'GND'], ['placa', 'GND'], NEGRO)
  b.cable([j, '+5V'], ['placa', '5V'], ROJO)
  b.cable([j, 'VRx'], ['placa', 'A0'], '#a855f7')
  b.cable([j, 'VRy'], ['placa', 'A1'], '#06b6d4')
  b.cable([j, 'SW'], ['placa', 'D2'], '#eab308')
  return b.terminar(JOYSTICK_LEDS)
}

// Sin Arduino: la pila (o la fuente) alimenta los rieles y los componentes
// toman de ahí la corriente, como se arma en la protoboard real.
const P = 'protoboard'

export function construirLedPila(): RobotDoc {
  const b = new Banco('LED con pila')
  b.doc = { ...b.doc, piezas: b.doc.piezas.filter(p => p.id !== 'placa') }
  const pila = b.montar('bateria-9v', P, 'bateria')
  const r = b.poner('resistencia-1000', 10)
  const l = b.poner('led-rojo', 12)
  b.cable([pila, '+'], [P, '+ abajo'], ROJO)
  b.cable([pila, '-'], [P, '- abajo'], NEGRO)
  b.cable([P, '+ abajo'], [r, '1'], ROJO)
  b.cable([r, '2'], [l, 'A'], GRIS)
  b.cable([l, 'K'], [P, '- abajo'], NEGRO)
  return b.terminar(LED_PILA)
}

const SIN_PROGRAMA = `// Este circuito no necesita programa: la fuente de la protoboard lo alimenta.
// Entra a «Probar» y presiona el botón en la escena (o en el panel).
`

/** Fuente MB102 en los rieles, un pulsador y un LED: se enciende solo mientras presionas. */
export function construirBotonSinArduino(): RobotDoc {
  const b = new Banco('Botón y LED con fuente')
  b.doc = { ...b.doc, piezas: b.doc.piezas.filter(p => p.id !== 'placa') }
  b.montar('fuente-mb102', P, 'fuente')
  const s = b.poner('pulsador', 2)
  const r = b.poner('resistencia-330', 4)
  const l = b.poner('led-verde', 6)
  b.cable([P, '+ arriba'], [s, '1'], ROJO)
  b.cable([s, '2'], [r, '1'], GRIS)
  b.cable([r, '2'], [l, 'A'], GRIS)
  b.cable([l, 'K'], [P, '- arriba'], NEGRO)
  return b.terminar(SIN_PROGRAMA)
}

const DOS_PILAS = `// Este circuito no necesita programa: el portapilas lo alimenta.
// Entra a «Probar»: el rojo brilla y el azul apenas, porque 3 V no le alcanzan.
`

/** Portapilas de 2 AA (3 V) con LED rojo y azul en paralelo: el azul (3 V) casi no prende. */
export function construirDosPilas(): RobotDoc {
  const b = new Banco('LED con dos pilas AA')
  b.doc = { ...b.doc, piezas: b.doc.piezas.filter(p => p.id !== 'placa') }
  const pila = b.montar('portapilas-2aa', P, 'bateria')
  b.cable([pila, '+'], [P, '+ abajo'], ROJO)
  b.cable([pila, '-'], [P, '- abajo'], NEGRO)
  for (const [led, hueco] of [['led-rojo', 10], ['led-azul', 13]] as const) {
    const r = b.poner('resistencia-220', hueco)
    const l = b.poner(led, hueco + 1)
    b.cable([P, '+ abajo'], [r, '1'], ROJO)
    b.cable([r, '2'], [l, 'A'], GRIS)
    b.cable([l, 'K'], [P, '- abajo'], NEGRO)
  }
  return b.terminar(DOS_PILAS)
// Entra a «Probar» y presiona el botón en la escena (o en el panel).', '
// Entra a «Probar»: el rojo brilla y el azul apenas, porque 3 V no le alcanzan.'))
}

// Kit de 9no: todo con Arduino Nano y los pines de la guía (LED D8, TRIG D9,
// ECHO D10, servo D6, potenciómetro A0, pulsador D2).
const NANO = 'arduino-nano'
const D8 = '#4f46e5'

export function construirLedTapa(): RobotDoc {
  const b = new Banco('LED indicador', NANO)
  b.ledConResistencia('led-verde', 2, 'D8', D8)
  return b.terminar(LED_TAPA)
}

export function construirMideDistancia(): RobotDoc {
  const b = new Banco('Mide distancia', NANO)
  b.ultrasonido()
  return b.terminar(MIDE_DISTANCIA)
}

export function construirMueveServo(): RobotDoc {
  const b = new Banco('Mueve el servomotor', NANO)
  b.servo()
  return b.terminar(MUEVE_SERVO)
}

export function construirBasurero(): RobotDoc {
  const b = new Banco('Basurero inteligente', NANO)
  const basurero = b.montar('maqueta-basurero', 'protoboard', 'maqueta')
  b.ultrasonido(basurero, 'sensor')
  const sv = b.servo(basurero, 'servo')
  b.montar('tapa-basurero', sv, 'eje')
  b.ledConResistencia('led-verde', 2, 'D8', D8)
  return b.terminar(BASURERO)
}

export function construirContador(): RobotDoc {
  const b = new Banco('Contador de personas', NANO)
  b.ultrasonido()
  b.ledConResistencia('led-amarillo', 2, 'D8', D8)
  return b.terminar(CONTADOR)
}

export function construirDispensador(): RobotDoc {
  const b = new Banco('Dispensador automático', NANO)
  b.ultrasonido()
  b.servo()
  b.ledConResistencia('led-verde', 2, 'D8', D8)
  return b.terminar(DISPENSADOR)
}

export function construirPuerta(): RobotDoc {
  const b = new Banco('Puerta automática', NANO)
  b.ultrasonido()
  b.servo()
  b.ledConResistencia('led-verde', 2, 'D8', D8)
  return b.terminar(PUERTA)
}

export function construirAlarmaProximidad(): RobotDoc {
  const b = new Banco('Alarma de proximidad', NANO)
  b.ultrasonido()
  b.ledConResistencia('led-rojo', 2, 'D8', D8)
  const pt = b.poner('potenciometro-10k', 5)
  b.cable([pt, '1'], ['placa', '5V'], ROJO)
  b.cable([pt, 'W'], ['placa', 'A0'], '#22c55e')
  b.cable([pt, '2'], ['placa', 'GND'], NEGRO)
  const p = b.poner('pulsador', 7)
  b.cable([p, '1'], ['placa', 'D2'], '#3b82f6')
  b.cable([p, '2'], ['placa', 'GND'], NEGRO)
  return b.terminar(ALARMA_PROXIMIDAD)
}

// ---------------------------------------------------------------------------
// Plantillas para cualquier circuito (usan los pines que tenga cada uno)
// ---------------------------------------------------------------------------

export function plantillasCircuito(doc: RobotDoc, tabla: FilaPin[]): PlantillaCodigo[] {
  const de = (tipo: string) => doc.piezas.filter(p => pieza(p.pieza).comportamiento.tipo === tipo)
  const pin = (inst: string, p: string) => pinCodigo(pinDePlaca(tabla, inst, p))
  const nombreC = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'PIN'
  const leds = de('led').filter(l => pinDePlaca(tabla, l.id, 'A'))
  const botones = de('pulsador').filter(p => pinDePlaca(tabla, p.id, '1'))
  const buzzers = de('buzzer').filter(z => pinDePlaca(tabla, z.id, '+'))
  const analogicos = [...de('potenciometro').map(p => ({ p, pin: 'W' })), ...de('ldr').map(p => ({ p, pin: '2' }))].filter(x => pinDePlaca(tabla, x.p.id, x.pin))
  const out: PlantillaCodigo[] = []
  const constantes = (lista: { nombre: string; pin: string }[]) => lista.map(x => `const int ${x.nombre} = ${x.pin};`).join('\n')

  if (leds.length) {
    const ls = leds.map(l => ({ nombre: nombreC(l.etiqueta), pin: pin(l.id, 'A') }))
    out.push({
      id: 'secuencia', nombre: leds.length > 1 ? 'LED en secuencia' : 'Parpadeo', descripcion: 'Enciende cada LED por turno',
      codigo: `// Cada LED se enciende por turno.\n${constantes(ls)}\n\nvoid setup() {\n${ls.map(x => `  pinMode(${x.nombre}, OUTPUT);`).join('\n')}\n}\n\nvoid loop() {\n${ls.map(x => `  digitalWrite(${x.nombre}, HIGH);\n  delay(500);\n  digitalWrite(${x.nombre}, LOW);`).join('\n')}\n  delay(500);\n}\n`,
    })
  }
  if (leds.length && botones.length) {
    const l = { nombre: nombreC(leds[0].etiqueta), pin: pin(leds[0].id, 'A') }
    const b = { nombre: 'PULSADOR', pin: pin(botones[0].id, '1') }
    out.push({
      id: 'boton-led', nombre: 'Botón enciende LED', descripcion: 'Con INPUT_PULLUP',
      codigo: `// El LED se enciende mientras presionas el botón.\n${constantes([b, l])}\n\nvoid setup() {\n  pinMode(${b.nombre}, INPUT_PULLUP);\n  pinMode(${l.nombre}, OUTPUT);\n}\n\nvoid loop() {\n  bool presionado = (digitalRead(${b.nombre}) == LOW);\n  digitalWrite(${l.nombre}, presionado ? HIGH : LOW);\n}\n`,
    })
  }
  if (buzzers.length) {
    out.push({
      id: 'melodia', nombre: 'Melodía', descripcion: 'Do Re Mi Fa Sol con tone()',
      codigo: MELODIA.replace('const int BUZZER = 7;', `const int BUZZER = ${pin(buzzers[0].id, '+')};`),
    })
  }
  if (analogicos.length) {
    const a = analogicos[0]
    out.push({
      id: 'lectura', nombre: 'Leer valor analógico', descripcion: 'analogRead en el Monitor Serie',
      codigo: `// Muestra en el Monitor Serie lo que lee la entrada analógica.\nconst int SENSOR = ${pin(a.p.id, a.pin)};\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int valor = analogRead(SENSOR);   // 0 a 1023\n  Serial.println(valor);\n  delay(200);\n}\n`,
    })
  }
  const ultras = de('ultrasonido').filter(u => pinDePlaca(tabla, u.id, 'TRIG') && pinDePlaca(tabla, u.id, 'ECHO'))
  if (ultras.length) {
    out.push({
      id: 'distancia', nombre: 'Medir distancia', descripcion: 'HC-SR04 en el Monitor Serie',
      codigo: MIDE_DISTANCIA.replace('const int TRIG = 9;', `const int TRIG = ${pin(ultras[0].id, 'TRIG')};`).replace('const int ECHO = 10;', `const int ECHO = ${pin(ultras[0].id, 'ECHO')};`),
    })
  }
  const servos = de('servo').filter(sv => pinDePlaca(tabla, sv.id, 'SIG'))
  if (servos.length) {
    out.push({
      id: 'servo', nombre: 'Mover el servo', descripcion: 'De 0° a 90° y de vuelta',
      codigo: MUEVE_SERVO.replace('const int SERVO_PIN = 6;', `const int SERVO_PIN = ${pin(servos[0].id, 'SIG')};`),
    })
  }
  out.push({ id: 'blink', nombre: 'Blink (LED de la placa)', descripcion: 'El LED «L» del pin 13', codigo: `void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(500);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(500);\n}\n` })
  return out
}

// ---------------------------------------------------------------------------
// Galería
// ---------------------------------------------------------------------------

const KIT_8VO = 'Kit 8vo EGB · Semáforo'
const KIT_9NO = 'Kit 9no EGB · Basurero'

const conPlantillas = (principal: { id: string; nombre: string; descripcion: string; codigo: string }[]) =>
  (doc: RobotDoc, tabla: FilaPin[]) => [...principal, ...plantillasCircuito(doc, tabla).filter(p => !principal.some(x => x.id === p.id))]

export const PROYECTOS_CIRCUITO: Prearmado[] = [
  {
    id: 'primer-led', categoria: 'electronica', kit: KIT_8VO,
    nombre: 'Mi primer LED', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'Un LED rojo que se enciende y se apaga solo. Es el primer programa de cualquier persona que aprende Arduino.',
    logica: ['Pin 8 en HIGH: pasa corriente y el LED se enciende', 'Espera medio segundo', 'Pin 8 en LOW: se apaga', 'Espera y vuelve a empezar'],
    construir: construirPrimerLed,
    plantillas: conPlantillas([{ id: 'primer-led', nombre: 'Parpadeo (kit)', descripcion: 'Medio segundo encendido y medio apagado', codigo: PRIMER_LED }, { id: 'sos', nombre: 'Reto: SOS', descripcion: 'Tres cortos, tres largos, tres cortos', codigo: SOS }]),
  },
  {
    id: 'pulsador-led', categoria: 'electronica', kit: KIT_8VO,
    nombre: 'Pulsador y LED', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'El LED se enciende mientras presionas el botón. Haz clic sobre el pulsador en 3D o usa el botón del panel.',
    logica: ['INPUT_PULLUP deja el pin en HIGH', 'Al presionar, el botón lo une a tierra: se lee LOW', 'Si está presionado, enciende el LED; si no, lo apaga'],
    construir: construirPulsadorLed,
    plantillas: conPlantillas([{ id: 'pulsador', nombre: 'Pulsador (kit)', descripcion: 'Encendido mientras presionas', codigo: PULSADOR_LED }, { id: 'interruptor', nombre: 'Reto: interruptor', descripcion: 'Cada clic cambia el LED', codigo: INTERRUPTOR }]),
  },
  {
    id: 'buzzer', categoria: 'electronica', kit: KIT_8VO,
    nombre: 'El buzzer suena', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'Un buzzer pasivo hace sonidos con tone(). Sube el volumen de tu equipo para escucharlo.',
    logica: ['tone(pin, 1000): vibra mil veces por segundo', 'Espera medio segundo', 'noTone(): silencio', 'Espera un segundo y repite'],
    construir: construirBuzzer,
    plantillas: conPlantillas([{ id: 'buzzer', nombre: 'Pitido (kit)', descripcion: 'Medio segundo de tono', codigo: BUZZER }, { id: 'melodia', nombre: 'Reto: melodía', descripcion: 'Do Re Mi Fa Sol', codigo: MELODIA }]),
  },
  {
    id: 'tres-leds', categoria: 'electronica', kit: KIT_8VO,
    nombre: 'Tres LED en secuencia', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'Rojo, amarillo y verde, uno tras otro. Es el último paso antes del semáforo.',
    logica: ['Enciende el rojo un segundo', 'Cambia al amarillo medio segundo', 'Cambia al verde un segundo', 'Repite'],
    construir: construirTresLeds,
    plantillas: conPlantillas([{ id: 'tres-leds', nombre: 'Secuencia (kit)', descripcion: 'Rojo, amarillo, verde', codigo: TRES_LEDS }]),
  },
  {
    id: 'semaforo', categoria: 'electronica', kit: KIT_8VO,
    nombre: 'Semáforo inteligente', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'El proyecto del kit de 8vo: un semáforo con botón para el peatón. Si presionas durante el verde, cambia a rojo y avisa con el buzzer.',
    logica: ['Verde 5 s, mirando el botón todo el tiempo (millis)', 'Si un peatón presiona, lo anota y corta el verde', 'Amarillo 1,5 s', 'Rojo 4 s; si había peatón, tres pitidos para cruzar'],
    construir: construirSemaforo,
    plantillas: conPlantillas([{ id: 'semaforo', nombre: 'Semáforo inteligente (kit)', descripcion: 'Con paso peatonal y aviso sonoro', codigo: SEMAFORO }, { id: 'tres-leds', nombre: 'Solo la secuencia', descripcion: 'Sin botón ni buzzer', codigo: TRES_LEDS }]),
  },
  {
    id: 'led-tapa', categoria: 'electronica', kit: KIT_9NO,
    nombre: 'LED indicador', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'Práctica con el Arduino Nano: el LED del pin 8 parpadea. Es el que después avisa que la tapa del basurero está abierta.',
    logica: ['Pin 8 en HIGH: el LED se enciende', 'Espera medio segundo', 'Pin 8 en LOW: se apaga', 'Vuelve a empezar'],
    construir: construirLedTapa,
    plantillas: conPlantillas([{ id: 'led-tapa', nombre: 'Parpadeo (kit)', descripcion: 'El LED del pin 8', codigo: LED_TAPA }]),
  },
  {
    id: 'mide-distancia', categoria: 'electronica', kit: KIT_9NO,
    nombre: 'Mide distancia con el ultrasónico', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'El HC-SR04 mide a qué distancia está tu mano. Acércala o aléjala con el control del panel y mira los centímetros en el Monitor Serie.',
    logica: ['Un pulso de 10 µs en TRIG dispara el sonido', 'pulseIn mide cuánto tarda el eco en ECHO', 'Microsegundos ÷ 58 = centímetros', 'Lo escribe en el Monitor Serie'],
    construir: construirMideDistancia,
    plantillas: conPlantillas([{ id: 'mide-distancia', nombre: 'Medir distancia (kit)', descripcion: 'Centímetros en el Monitor Serie', codigo: MIDE_DISTANCIA }]),
  },
  {
    id: 'mueve-servo', categoria: 'electronica', kit: KIT_9NO,
    nombre: 'Mueve el servomotor', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'El servo SG90 va de 0° a 90° y vuelve, una y otra vez. Así abrirá la tapa del basurero.',
    logica: ['La librería Servo genera los pulsos', 'write(0): el brazo va a 0°', 'Espera 0,8 s', 'write(90): va a 90° y repite'],
    construir: construirMueveServo,
    plantillas: conPlantillas([{ id: 'mueve-servo', nombre: 'Mover el servo (kit)', descripcion: '0° ↔ 90°', codigo: MUEVE_SERVO }]),
  },
  {
    id: 'basurero', categoria: 'electronica', kit: KIT_9NO,
    nombre: 'Basurero inteligente', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'El proyecto del kit de 9no: acerca la mano y la tapa se abre sola. El LED parpadea para confirmar y queda encendido mientras la tapa está abierta.',
    logica: ['Mide la distancia con el ultrasónico todo el tiempo', 'Si hay algo a 15 cm o menos, el servo abre la tapa (90°)', 'El LED parpadea 3 veces y queda encendido', 'A los 3 s cierra la tapa (0°) y apaga el LED'],
    construir: construirBasurero,
    plantillas: conPlantillas([{ id: 'basurero', nombre: 'Basurero inteligente (kit)', descripcion: 'Tapa automática con aviso del LED', codigo: BASURERO }]),
  },
  {
    id: 'contador-personas', categoria: 'electronica', kit: KIT_9NO,
    nombre: 'Contador de personas', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Cada vez que pasa algo frente al sensor suma 1. Acerca y aleja la mano: el total aparece en el Monitor Serie y el LED confirma.',
    logica: ['Mide la distancia cada 0,15 s', 'Algo a 20 cm o menos = alguien pasando', 'Solo cuenta cuando recién aparece (no mientras sigue ahí)', 'Muestra el total y enciende el LED'],
    construir: construirContador,
    plantillas: conPlantillas([{ id: 'contador-personas', nombre: 'Contador de personas (kit)', descripcion: 'Cuenta en el Monitor Serie', codigo: CONTADOR }]),
  },
  {
    id: 'dispensador', categoria: 'electronica', kit: KIT_9NO,
    nombre: 'Dispensador automático', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Al acercar la mano a 10 cm o menos, el servo abre la compuerta un segundo y el LED confirma, como un dispensador de gel.',
    logica: ['Mide la distancia', 'Si la mano está a 10 cm o menos, abre la compuerta (90°) y prende el LED', 'Espera 1 s y cierra', 'Espera 1 s más antes de volver a medir'],
    construir: construirDispensador,
    plantillas: conPlantillas([{ id: 'dispensador', nombre: 'Dispensador (kit)', descripcion: 'Compuerta de 1 s', codigo: DISPENSADOR }]),
  },
  {
    id: 'puerta-automatica', categoria: 'electronica', kit: KIT_9NO,
    nombre: 'Puerta automática', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'La puerta (el servo) se abre cuando alguien está a 30 cm o menos y se queda abierta mientras siga cerca.',
    logica: ['Mide la distancia cada 0,2 s', '¿Hay alguien a 30 cm o menos?', 'Sí: puerta a 90° y LED encendido', 'No: puerta a 0° y LED apagado'],
    construir: construirPuerta,
    plantillas: conPlantillas([{ id: 'puerta-automatica', nombre: 'Puerta automática (kit)', descripcion: 'Abierta mientras haya alguien', codigo: PUERTA }]),
  },
  {
    id: 'alarma-proximidad', categoria: 'electronica', kit: KIT_9NO,
    nombre: 'Alarma de proximidad', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'El LED parpadea más rápido cuanto más cerca está tu mano. La perilla cambia desde qué distancia se activa y el pulsador enciende o apaga la alarma.',
    logica: ['El pulsador prende o apaga la alarma', 'La perilla fija el alcance: de 10 a 100 cm', 'Si hay algo dentro del alcance, el LED parpadea', 'Más cerca = parpadeo más rápido (map)'],
    construir: construirAlarmaProximidad,
    plantillas: conPlantillas([{ id: 'alarma-proximidad', nombre: 'Alarma de proximidad (kit)', descripcion: 'Parpadeo según la distancia', codigo: ALARMA_PROXIMIDAD }]),
  },
  {
    id: 'joystick-leds', categoria: 'electronica',
    nombre: 'Joystick: hacia dónde va la palanca', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Un joystick KY-023 y cuatro LEDs: se enciende el LED del lado hacia donde mueves la palanca, y los cuatro al presionarla. Mueve la palanca en el panel o con las flechas del teclado.',
    logica: ['Cada eje es un potenciómetro: analogRead da 0–1023 y unos 512 al centro', 'Pasado 700 (o bajo 300) la palanca está inclinada hacia ese lado', 'El botón (SW) va a tierra: con INPUT_PULLUP, presionado se lee LOW'],
    construir: construirJoystickLeds,
    plantillas: conPlantillas([{ id: 'joystick-leds', nombre: 'Joystick y LEDs', descripcion: 'Cuatro direcciones y el botón', codigo: JOYSTICK_LEDS }]),
  },
  {
    id: 'pico-parpadeo', categoria: 'electronica',
    nombre: 'Raspberry Pi Pico: primer LED', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'La Raspberry Pi Pico programada en C++ como un Arduino: un LED en GP15 y el LED verde de la placa (GP25) se turnan cada medio segundo.',
    logica: ['En la Pico el número de pin es el del GP: GP15 → 15', 'LED_BUILTIN es el LED de la placa (GP25)', 'digitalWrite y delay funcionan igual que en Arduino'],
    construir: construirPicoParpadeo,
    plantillas: conPlantillas([{ id: 'pico-parpadeo', nombre: 'Parpadeo (Pico)', descripcion: 'GP15 y GP25 se turnan', codigo: PICO_PARPADEO }]),
  },
  {
    id: 'pico-perilla', categoria: 'electronica',
    nombre: 'Raspberry Pi Pico: perilla y brillo', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'La perilla en GP26 (A0) se lee con 12 bits (0 a 4095) y regula el brillo del LED de GP15 con PWM. La Pico trabaja con 3,3 V: la perilla va a 3V3, no a 5 V.',
    logica: ['analogReadResolution(12) da lecturas de 0 a 4095', 'map la pasa a 0–255', 'analogWrite regula el brillo (en la Pico, cualquier GP tiene PWM)'],
    construir: construirPicoPerilla,
    plantillas: conPlantillas([{ id: 'pico-perilla', nombre: 'Perilla → brillo (Pico)', descripcion: 'ADC de 12 bits y PWM', codigo: PICO_PERILLA }]),
  },
  {
    id: 'mega-barra', categoria: 'electronica',
    nombre: 'Arduino Mega: barra de LEDs', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Siete LEDs en D22–D28 y una perilla en A8: pines que el UNO no tiene. Al girar la perilla se encienden más LEDs, como un medidor de nivel.',
    logica: ['analogRead(A8) lee la perilla: 0 a 1023', 'map la pasa a 0–7 LEDs', 'Un for enciende los primeros y apaga el resto'],
    construir: construirMegaBarra,
    plantillas: conPlantillas([{ id: 'mega-barra', nombre: 'Barra de nivel (Mega)', descripcion: 'D22–D28 y A8', codigo: MEGA_BARRA }]),
  },
  {
    id: 'boton-sin-arduino', categoria: 'electronica',
    nombre: 'Botón y LED con fuente (sin Arduino)', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'La fuente MB102 pinchada en la protoboard alimenta los rieles. Un pulsador, una resistencia y un LED: mientras presionas, el LED se enciende. Sin programa.',
    logica: ['La fuente deja 5 V en el riel + y tierra en el −', 'Del riel + la corriente pasa por el pulsador (solo si está presionado)', 'Sigue por la resistencia y el LED', 'Vuelve al riel −'],
    construir: construirBotonSinArduino,
    plantillas: conPlantillas([]),
  },
  {
    id: 'dos-pilas', categoria: 'electronica',
    nombre: 'Dos pilas AA: LED rojo y azul', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'Un portapilas de 3 V en los rieles y dos LED en paralelo. El rojo necesita 2 V y brilla; el azul necesita 3 V y casi no prende. ¿Por qué los kits usan 5 V?',
    logica: ['Cada LED necesita un voltaje para encender: rojo 2 V, azul 3 V', 'Con 3 V al rojo le sobra 1 V para su resistencia: pasa corriente', 'Al azul no le sobra nada: casi no pasa corriente', 'Cambia la pila por la de 9 V y compara'],
    construir: construirDosPilas,
    plantillas: conPlantillas([]),
  },
  {
    id: 'led-pila', categoria: 'electronica',
    nombre: 'LED con pila (sin Arduino)', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'El circuito más simple: una pila de 9 V, una resistencia y un LED. Los cables de la pila van a los rieles + y − de la protoboard. No hace falta programa: entra a «Probar» y el LED ya está encendido. Cambia la resistencia y mira qué pasa.',
    logica: ['La pila deja su + en el riel rojo y su − en el azul', 'Del riel + la corriente pasa por la resistencia, que la frena', 'Entra al LED por la pata larga y lo enciende', 'Sale por la pata corta al riel − y vuelve a la pila'],
    construir: construirLedPila,
    plantillas: conPlantillas([]),
  },
  {
    id: 'pot-brillo', categoria: 'electronica',
    nombre: 'Perilla que regula el brillo', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'Un potenciómetro en A0 y un LED en un pin PWM: al girar la perilla, el LED brilla más o menos.',
    logica: ['analogRead lee la perilla: 0 a 1023', 'map la pasa a 0–255', 'analogWrite regula el brillo con PWM'],
    construir: construirPotBrillo,
    plantillas: conPlantillas([{ id: 'pot-brillo', nombre: 'Perilla → brillo', descripcion: 'analogRead + analogWrite', codigo: POT_BRILLO }]),
  },
  {
    id: 'luz-nocturna', categoria: 'electronica',
    nombre: 'Luz nocturna con LDR', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'La fotorresistencia mide la luz; cuando oscurece, el LED se enciende solo. Mueve la luz con el control del panel.',
    logica: ['La LDR y la resistencia de 1 kΩ forman un divisor', 'analogRead da más número con más luz', 'Por debajo del umbral, enciende el LED'],
    construir: construirLuzNocturna,
    plantillas: conPlantillas([{ id: 'luz-nocturna', nombre: 'Luz nocturna', descripcion: 'LED automático', codigo: LUZ_NOCTURNA }]),
  },
  {
    id: 'rgb', categoria: 'electronica',
    nombre: 'LED RGB arcoíris', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Un LED con tres colores adentro. Con analogWrite en cada uno se mezclan para formar cualquier color.',
    logica: ['Cada pata de color va a un pin PWM con su resistencia', 'analogWrite(0–255) decide cuánto de cada color', 'Rojo + verde = amarillo; los tres = blanco'],
    construir: construirRgb,
    plantillas: conPlantillas([{ id: 'rgb', nombre: 'Arcoíris', descripcion: 'Siete colores', codigo: RGB_ARCOIRIS }]),
  },
  {
    id: 'reflejos', categoria: 'electronica',
    nombre: 'Juego de reflejos', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Cuando se prende el verde, presiona lo más rápido que puedas. Tu tiempo aparece en el Monitor Serie.',
    logica: ['Rojo: espera un tiempo al azar', 'Verde: empieza a contar con millis()', 'Al presionar, calcula el tiempo y lo muestra'],
    construir: construirReflejos,
    plantillas: conPlantillas([{ id: 'reflejos', nombre: 'Juego de reflejos', descripcion: 'Mide tu tiempo de reacción', codigo: REFLEJOS }]),
  },
]
