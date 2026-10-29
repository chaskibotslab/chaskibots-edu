// Proyectos de la mesa de electrónica (E1): los del kit de 8vo EGB (semáforo
// inteligente) con los mismos pines y el mismo código que la clase, y algunos
// extra con las mismas piezas. Se arman con las operaciones del taller, así
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
  out.push({ id: 'blink', nombre: 'Blink (LED de la placa)', descripcion: 'El LED «L» del pin 13', codigo: `void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(500);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(500);\n}\n` })
  return out
}

// ---------------------------------------------------------------------------
// Galería
// ---------------------------------------------------------------------------

const KIT_8VO = 'Kit 8vo EGB · Semáforo'

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
