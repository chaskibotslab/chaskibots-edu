// Proyectos con los temas del curso de Robótica Paraná (colecciones de Sketchfab,
// ver la hoja de ruta, pasos C1–C3): se arman con las piezas del catálogo y el
// código es propio, así que corren con el micro emulado como todos los demás.

import { Banco, conPlantillas } from './circuitos'
import type { RobotDoc } from './doc'
import type { Prearmado } from './prearmados'

const NEGRO = '#111827'
const NARANJA = '#f97316', AMARILLO = '#eab308', VERDE = '#22c55e', AZUL = '#3b82f6', VIOLETA = '#a855f7'

export const tema = (aulas: string) => `Tema de ${aulas} · Robótica Paraná`

function pulsador(b: Banco, hueco: number, pin: string) {
  const p = b.poner('pulsador', hueco)
  b.cable([p, '1'], ['placa', pin], AZUL)
  b.cable([p, '2'], ['placa', 'GND'], NEGRO)
}

function buzzer(b: Banco, hueco: number, pin: string) {
  const z = b.poner('buzzer-pasivo', hueco)
  b.cable([z, '+'], ['placa', pin], VIOLETA)
  b.cable([z, '-'], ['placa', 'GND'], NEGRO)
}

// ---------------------------------------------------------------------------
// C1 · Luces
// ---------------------------------------------------------------------------

const TRES_BRILLOS = `// El mismo LED con tres resistencias: a más ohmios, menos corriente y menos brillo.
void setup() {
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  digitalWrite(8, HIGH);    // con 220 ohmios: brilla mucho
  digitalWrite(9, HIGH);    // con 1000 ohmios: brilla menos
  digitalWrite(10, HIGH);   // con 10000 ohmios: apenas se ve
}

void loop() {
}
`

function construirTresBrillos(): RobotDoc {
  const b = new Banco('LED y resistencias')
  b.ledConResistencia('led-rojo', 1, 'D8', NARANJA, 'resistencia-220')
  b.ledConResistencia('led-rojo', 2, 'D9', NARANJA, 'resistencia-1000')
  b.ledConResistencia('led-rojo', 3, 'D10', NARANJA, 'resistencia-10000')
  return b.terminar(TRES_BRILLOS)
}

const FADE = `// Fade: el LED se enciende y se apaga poco a poco con PWM.
// analogWrite va de 0 (apagado) a 255 (máximo). Solo funciona en los pines con ~.
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  for (int brillo = 0; brillo <= 255; brillo += 5) {   // fade in
    analogWrite(LED, brillo);
    delay(20);
  }
  for (int brillo = 255; brillo >= 0; brillo -= 5) {   // fade out
    analogWrite(LED, brillo);
    delay(20);
  }
}
`

const FADE_IN = `// Fade in: de apagado a máximo, y vuelve a empezar.
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  for (int brillo = 0; brillo <= 255; brillo += 5) {
    analogWrite(LED, brillo);
    delay(20);
  }
}
`

const FADE_OUT = `// Fade out: de máximo a apagado, y vuelve a empezar.
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  for (int brillo = 255; brillo >= 0; brillo -= 5) {
    analogWrite(LED, brillo);
    delay(20);
  }
}
`

function construirFade(): RobotDoc {
  const b = new Banco('Fade con PWM')
  b.ledConResistencia('led-azul', 2, 'D9', AZUL, 'resistencia-220')
  return b.terminar(FADE)
}

const PINES_BARRIDO = [3, 5, 6, 9, 10, 11]

const BARRIDO = `// Super Máquina: una luz roja corre de un lado a otro, como el auto de la serie de los 80.
const int LEDS[] = {${PINES_BARRIDO.join(', ')}};
const int CUANTOS = 6;

void setup() {
  for (int i = 0; i < CUANTOS; i++) pinMode(LEDS[i], OUTPUT);
}

void encender(int i) {
  digitalWrite(LEDS[i], HIGH);
  delay(90);
  digitalWrite(LEDS[i], LOW);
}

void loop() {
  for (int i = 0; i < CUANTOS; i++) encender(i);        // ida
  for (int i = CUANTOS - 2; i > 0; i--) encender(i);    // vuelta
}
`

const BARRIDO_ESTELA = `// Super Máquina con estela: la luz deja una cola que se apaga poco a poco (PWM).
const int LEDS[] = {${PINES_BARRIDO.join(', ')}};
const int CUANTOS = 6;
int brillo[6];

void setup() {
  for (int i = 0; i < CUANTOS; i++) pinMode(LEDS[i], OUTPUT);
}

void paso(int actual) {
  brillo[actual] = 255;
  for (int i = 0; i < CUANTOS; i++) {
    analogWrite(LEDS[i], brillo[i]);
    brillo[i] = brillo[i] / 3;           // cada paso, cada LED baja su brillo
  }
  delay(90);
}

void loop() {
  for (int i = 0; i < CUANTOS; i++) paso(i);
  for (int i = CUANTOS - 2; i > 0; i--) paso(i);
}
`

function construirBarrido(): RobotDoc {
  const b = new Banco('Super Máquina')
  PINES_BARRIDO.forEach((pin, i) => b.ledConResistencia('led-rojo', i + 1, `D${pin}`, NARANJA))
  return b.terminar(BARRIDO)
}

// ---------------------------------------------------------------------------
// C2 · Semáforos
// ---------------------------------------------------------------------------

function semaforoCarros(b: Banco) {
  b.ledConResistencia('led-rojo', 1, 'D8', NARANJA)
  b.ledConResistencia('led-amarillo', 2, 'D9', AMARILLO)
  b.ledConResistencia('led-verde', 3, 'D10', VERDE)
}

const SEMAFORO_CARROS = `// Semáforo de carros: verde, amarillo y rojo, con los tiempos de una calle.
const int ROJO = 8, AMARILLO = 9, VERDE = 10;

void luz(int pin, int ms) {
  digitalWrite(pin, HIGH);
  delay(ms);
  digitalWrite(pin, LOW);
}

void setup() {
  pinMode(ROJO, OUTPUT);
  pinMode(AMARILLO, OUTPUT);
  pinMode(VERDE, OUTPUT);
}

void loop() {
  luz(VERDE, 4000);
  luz(AMARILLO, 1000);
  luz(ROJO, 4000);
}
`

function construirSemaforoCarros(): RobotDoc {
  const b = new Banco('Semáforo de carros')
  semaforoCarros(b)
  return b.terminar(SEMAFORO_CARROS)
}

const SEMAFORO_CRUCE = `// Cruce: dos semáforos que nunca están en verde a la vez.
const int ROJO_A = 8, AMARILLO_A = 9, VERDE_A = 10;
const int ROJO_B = 11, AMARILLO_B = 12, VERDE_B = 13;

// Deja encendidas solo estas dos luces, una de cada semáforo.
void luces(int a, int b, int ms) {
  for (int pin = 8; pin <= 13; pin++) digitalWrite(pin, LOW);
  digitalWrite(a, HIGH);
  digitalWrite(b, HIGH);
  delay(ms);
}

void setup() {
  for (int pin = 8; pin <= 13; pin++) pinMode(pin, OUTPUT);
}

void loop() {
  luces(VERDE_A, ROJO_B, 4000);
  luces(AMARILLO_A, ROJO_B, 1000);
  luces(ROJO_A, VERDE_B, 4000);
  luces(ROJO_A, AMARILLO_B, 1000);
}
`

function construirSemaforoCruce(): RobotDoc {
  const b = new Banco('Semáforo de cruce')
  semaforoCarros(b)
  b.ledConResistencia('led-rojo', 4, 'D11', NARANJA)
  b.ledConResistencia('led-amarillo', 5, 'D12', AMARILLO)
  b.ledConResistencia('led-verde', 6, 'D13', VERDE)
  return b.terminar(SEMAFORO_CRUCE)
}

const SEMAFORO_PEATONES = `// Semáforo de carros y de peatones: cuando los carros paran, cruza la gente.
const int ROJO = 8, AMARILLO = 9, VERDE = 10;
const int PEATON_ROJO = 11, PEATON_VERDE = 12;

void setup() {
  for (int pin = 8; pin <= 12; pin++) pinMode(pin, OUTPUT);
  digitalWrite(PEATON_ROJO, HIGH);
}

void loop() {
  digitalWrite(VERDE, HIGH);
  delay(4000);
  digitalWrite(VERDE, LOW);
  digitalWrite(AMARILLO, HIGH);
  delay(1000);
  digitalWrite(AMARILLO, LOW);

  digitalWrite(ROJO, HIGH);          // los carros paran…
  digitalWrite(PEATON_ROJO, LOW);
  digitalWrite(PEATON_VERDE, HIGH);  // …y los peatones cruzan
  delay(4000);
  digitalWrite(PEATON_VERDE, LOW);
  digitalWrite(PEATON_ROJO, HIGH);
  digitalWrite(ROJO, LOW);
}
`

const PEATONES_BOTON = `// Con botón: el semáforo sigue en verde hasta que un peatón presiona.
const int ROJO = 8, AMARILLO = 9, VERDE = 10;
const int PEATON_ROJO = 11, PEATON_VERDE = 12;
const int BOTON = 2;

void setup() {
  for (int pin = 8; pin <= 12; pin++) pinMode(pin, OUTPUT);
  pinMode(BOTON, INPUT_PULLUP);
  digitalWrite(VERDE, HIGH);
  digitalWrite(PEATON_ROJO, HIGH);
}

void loop() {
  if (digitalRead(BOTON) == HIGH) return;   // nadie presionó: todo sigue igual

  digitalWrite(VERDE, LOW);
  digitalWrite(AMARILLO, HIGH);
  delay(1000);
  digitalWrite(AMARILLO, LOW);
  digitalWrite(ROJO, HIGH);
  digitalWrite(PEATON_ROJO, LOW);
  digitalWrite(PEATON_VERDE, HIGH);
  delay(4000);
  digitalWrite(PEATON_VERDE, LOW);
  digitalWrite(PEATON_ROJO, HIGH);
  digitalWrite(ROJO, LOW);
  digitalWrite(VERDE, HIGH);
}
`

function construirSemaforoPeatones(): RobotDoc {
  const b = new Banco('Semáforo con peatones')
  semaforoCarros(b)
  b.ledConResistencia('led-rojo', 5, 'D11', NARANJA)
  b.ledConResistencia('led-verde', 6, 'D12', VERDE)
  pulsador(b, 7, 'D2')
  return b.terminar(PEATONES_BOTON)
}

// ---------------------------------------------------------------------------
// C3 · Distancia
// ---------------------------------------------------------------------------

const ESTACIONAMIENTO = `// Sensor de estacionamiento: mientras más cerca, más rápido suena y más luces.
const int TRIG = 9, ECHO = 10;
const int VERDE = 5, AMARILLO = 6, ROJO = 7;
const int BUZZER = 3;

long medirCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 400;      // sin eco: nada cerca
  return us / 58;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(VERDE, OUTPUT);
  pinMode(AMARILLO, OUTPUT);
  pinMode(ROJO, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long cm = medirCm();
  Serial.print(cm);
  Serial.println(" cm");

  digitalWrite(VERDE, cm < 50 ? HIGH : LOW);
  digitalWrite(AMARILLO, cm < 25 ? HIGH : LOW);
  digitalWrite(ROJO, cm < 10 ? HIGH : LOW);

  if (cm >= 50) {               // lejos: silencio
    delay(100);
    return;
  }
  tone(BUZZER, 1000);
  delay(80);
  noTone(BUZZER);
  delay(cm * 8);                // más cerca = pitidos más seguidos
}
`

function construirEstacionamiento(): RobotDoc {
  const b = new Banco('Sensor de estacionamiento')
  b.ultrasonido()
  b.ledConResistencia('led-verde', 1, 'D5', VERDE)
  b.ledConResistencia('led-amarillo', 2, 'D6', AMARILLO)
  b.ledConResistencia('led-rojo', 3, 'D7', NARANJA)
  buzzer(b, 5, 'D3')
  return b.terminar(ESTACIONAMIENTO)
}

export const PROYECTOS_AULAS: Prearmado[] = [
  {
    id: 'tres-brillos', categoria: 'electronica', tema: tema('la Aula 08'),
    nombre: 'LED y resistencias', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'Tres LED iguales con resistencias distintas: se ve de un vistazo qué hace la resistencia.',
    logica: ['Los tres pines dan 5 V', 'Más ohmios dejan pasar menos corriente', 'Menos corriente: menos brillo'],
    construir: construirTresBrillos,
    plantillas: conPlantillas([{ id: 'tres-brillos', nombre: 'Tres brillos', descripcion: '220 Ω, 1 kΩ y 10 kΩ', codigo: TRES_BRILLOS }]),
  },
  {
    id: 'fade', categoria: 'electronica', tema: tema('las Aulas 18, 19 y 20'),
    nombre: 'Fade con PWM', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'El LED se enciende y se apaga poco a poco. Los pines con ~ simulan un voltaje intermedio.',
    logica: ['analogWrite(pin, 0) apaga y analogWrite(pin, 255) da el máximo', 'Un for sube el valor de a poco', 'Otro for lo baja y vuelve a empezar'],
    construir: construirFade,
    plantillas: conPlantillas([
      { id: 'fade', nombre: 'Fade in y fade out', descripcion: 'Sube y baja', codigo: FADE },
      { id: 'fade-in', nombre: 'Solo fade in', descripcion: 'De apagado a máximo', codigo: FADE_IN },
      { id: 'fade-out', nombre: 'Solo fade out', descripcion: 'De máximo a apagado', codigo: FADE_OUT },
    ]),
  },
  {
    id: 'super-maquina', categoria: 'electronica', tema: tema('las Aulas 21 y 22'),
    nombre: 'Super Máquina', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Seis LED rojos con una luz que corre de un lado a otro. Primero con arreglos y for; después, con estela.',
    logica: ['Los pines se guardan en un arreglo', 'Un for enciende cada LED por turno, de ida', 'Otro for lo hace de vuelta, sin repetir las puntas'],
    construir: construirBarrido,
    plantillas: conPlantillas([
      { id: 'super-maquina', nombre: 'Luz que corre', descripcion: 'Versión de los 80', codigo: BARRIDO },
      { id: 'super-maquina-estela', nombre: 'Con estela (PWM)', descripcion: 'La cola se apaga de a poco', codigo: BARRIDO_ESTELA },
    ]),
  },
  {
    id: 'semaforo-carros', categoria: 'electronica', tema: tema('la Aula 09'),
    nombre: 'Semáforo de carros', dificultad: 'inicial', arena: 'mesa-electronica',
    descripcion: 'El semáforo básico, sin botón ni buzzer, con una función que evita repetir código.',
    logica: ['Verde 4 s', 'Amarillo 1 s', 'Rojo 4 s y vuelve a empezar'],
    construir: construirSemaforoCarros,
    plantillas: conPlantillas([{ id: 'semaforo-carros', nombre: 'Semáforo de carros', descripcion: 'Verde, amarillo, rojo', codigo: SEMAFORO_CARROS }]),
  },
  {
    id: 'semaforo-cruce', categoria: 'electronica', tema: tema('la Aula 10'),
    nombre: 'Semáforo de cruce', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Dos semáforos coordinados para un cruce de calles: nunca están en verde a la vez.',
    logica: ['A en verde y B en rojo', 'A en amarillo y B sigue en rojo', 'A en rojo y B en verde', 'B en amarillo y vuelve a empezar'],
    construir: construirSemaforoCruce,
    plantillas: conPlantillas([{ id: 'semaforo-cruce', nombre: 'Cruce', descripcion: 'Dos semáforos coordinados', codigo: SEMAFORO_CRUCE }]),
  },
  {
    id: 'semaforo-peatones', categoria: 'electronica', tema: tema('las Aulas 11 y 15'),
    nombre: 'Semáforo con peatones y botón', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Semáforo de carros y de peatones. Sigue en verde hasta que presionas el botón; la plantilla sin botón cambia sola.',
    logica: ['Mientras nadie presiona: carros en verde, peatones en rojo', 'Al presionar: amarillo 1 s', 'Carros en rojo y peatones en verde 4 s', 'Vuelve al inicio'],
    construir: construirSemaforoPeatones,
    plantillas: conPlantillas([
      { id: 'semaforo-peatones', nombre: 'Con botón', descripcion: 'Cambia cuando un peatón presiona', codigo: PEATONES_BOTON },
      { id: 'semaforo-peatones-auto', nombre: 'Sin botón', descripcion: 'Cambia solo, por tiempo', codigo: SEMAFORO_PEATONES },
    ]),
  },
  {
    id: 'estacionamiento', categoria: 'electronica', tema: tema('la Aula 35'),
    nombre: 'Sensor de estacionamiento', dificultad: 'intermedio', arena: 'mesa-electronica',
    descripcion: 'Como en los autos: mientras más cerca está tu mano, más luces se encienden y más seguido pita.',
    logica: ['Mide la distancia con el HC-SR04', 'A menos de 50, 25 y 10 cm enciende verde, amarillo y rojo', 'Espera 8 ms por cada cm entre pitidos: más cerca, más seguidos'],
    construir: construirEstacionamiento,
    plantillas: conPlantillas([{ id: 'estacionamiento', nombre: 'Estacionamiento', descripcion: 'Luces y pitidos según la distancia', codigo: ESTACIONAMIENTO }]),
  },
]
