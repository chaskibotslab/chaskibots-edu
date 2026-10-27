// Robots prearmados (F2): se arman con las mismas operaciones del taller,
// así que son robots normales que el alumno puede abrir y modificar.
// Su código usa los pines que dio el cableado automático.

import { autocablear, pinCodigo, pinDePlaca, type FilaPin } from '../engine/autocableado'
import { encastrar, robotVacio } from '../engine/ensamblaje'
import type { RobotDoc } from './doc'

export interface PlantillaCodigo { id: string; nombre: string; descripcion: string; codigo: string }

export interface Prearmado {
  id: string
  nombre: string
  descripcion: string
  dificultad: 'inicial' | 'intermedio' | 'avanzado'
  arena: string
  construir: () => RobotDoc
  plantillas: (doc: RobotDoc, tabla: FilaPin[]) => PlantillaCodigo[]
}

class Armador {
  doc: RobotDoc
  constructor(chasis: string, variante: string, nombre: string) { this.doc = robotVacio(chasis, variante, nombre) }
  poner(piezaId: string, en: string, montaje: string) {
    const r = encastrar(this.doc, piezaId, en, montaje)
    this.doc = r.doc
    return r.id
  }
  terminar(codigo: (tabla: FilaPin[], doc: RobotDoc) => string): RobotDoc {
    const { cables, tabla } = autocablear(this.doc)
    const doc = { ...this.doc, cables }
    return { ...doc, programa: { modo: 'codigo', cpp: codigo(tabla, doc) } }
  }
}

/** Pines del driver (lado izquierdo = canal A, derecho = canal B). */
function pinesDriver(tabla: FilaPin[], doc: RobotDoc) {
  const d = doc.piezas.find(p => p.pieza === 'l298n')?.id ?? ''
  const p = (pin: string) => pinCodigo(pinDePlaca(tabla, d, pin))
  return { ENA: p('ENA'), IN1: p('IN1'), IN2: p('IN2'), ENB: p('ENB'), IN3: p('IN3'), IN4: p('IN4') }
}

function bloqueMotores(tabla: FilaPin[], doc: RobotDoc) {
  const m = pinesDriver(tabla, doc)
  return `const int ENA = ${m.ENA}, IN1 = ${m.IN1}, IN2 = ${m.IN2};   // motores del lado izquierdo
const int ENB = ${m.ENB}, IN3 = ${m.IN3}, IN4 = ${m.IN4};   // motores del lado derecho

// Velocidad de cada lado: de -255 (atrás) a 255 (adelante)
void motores(int izq, int der) {
  izq = constrain(izq, -255, 255);
  der = constrain(der, -255, 255);
  digitalWrite(IN1, izq >= 0 ? HIGH : LOW);
  digitalWrite(IN2, izq >= 0 ? LOW : HIGH);
  analogWrite(ENA, abs(izq));
  digitalWrite(IN3, der >= 0 ? HIGH : LOW);
  digitalWrite(IN4, der >= 0 ? LOW : HIGH);
  analogWrite(ENB, abs(der));
}`
}

const SETUP_MOTORES = 'pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);'

// ---------------------------------------------------------------------------
// Seguidor de línea (el robot de F1)
// ---------------------------------------------------------------------------

function sensoresLinea(tabla: FilaPin[], doc: RobotDoc) {
  const izq = doc.piezas.find(p => p.padre?.montaje === 'piso-izq')?.id ?? ''
  const der = doc.piezas.find(p => p.padre?.montaje === 'piso-der')?.id ?? ''
  return {
    DO_IZQ: pinCodigo(pinDePlaca(tabla, izq, 'DO')), DO_DER: pinCodigo(pinDePlaca(tabla, der, 'DO')),
    AO_IZQ: pinCodigo(pinDePlaca(tabla, izq, 'AO')), AO_DER: pinCodigo(pinDePlaca(tabla, der, 'AO')),
  }
}

function codigoSeguidor(tabla: FilaPin[], doc: RobotDoc) {
  const s = sensoresLinea(tabla, doc)
  return `// Robot seguidor de línea con 2 sensores IR y driver L298N
// Los sensores TCRT5000 dan HIGH (1) sobre la línea negra y LOW (0) sobre blanco.

const int IR_IZQ = ${s.DO_IZQ};   // sensor izquierdo  (DO)
const int IR_DER = ${s.DO_DER};   // sensor derecho    (DO)

${bloqueMotores(tabla, doc)}

const int VELOCIDAD = 150;   // 0 a 255
const int GIRO = 170;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  ${SETUP_MOTORES}
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Seguidor de linea listo");
}

void loop() {
  int izq = digitalRead(IR_IZQ);
  int der = digitalRead(IR_DER);

  if (izq == LOW && der == LOW) {
    motores(VELOCIDAD, VELOCIDAD);      // la línea está entre los sensores: recto
  } else if (izq == HIGH && der == LOW) {
    motores(-GIRO / 2, GIRO);           // la línea se fue a la izquierda
  } else if (izq == LOW && der == HIGH) {
    motores(GIRO, -GIRO / 2);           // la línea se fue a la derecha
  } else {
    motores(VELOCIDAD, VELOCIDAD);      // cruce: seguir recto
  }

  digitalWrite(LED_BUILTIN, izq || der);  // el LED 13 avisa cuando un sensor ve la línea
}
`
}

function codigoProporcional(tabla: FilaPin[], doc: RobotDoc) {
  const s = sensoresLinea(tabla, doc)
  return `// Seguidor proporcional con los sensores analógicos
// En vez de "sí/no", mide CUÁNTO ve cada sensor la línea y corrige suave.
${bloqueMotores(tabla, doc)}

const int BASE = 140;
const float KP = 0.35;

void setup() {
  ${SETUP_MOTORES}
  Serial.begin(9600);
}

void loop() {
  int izq = analogRead(${s.AO_IZQ});   // sube sobre negro
  int der = analogRead(${s.AO_DER});
  int error = der - izq;      // > 0: la línea está a la derecha
  int correccion = KP * error;
  motores(BASE + correccion, BASE - correccion);

  static unsigned long ultimo = 0;
  if (millis() - ultimo > 500) {
    ultimo = millis();
    Serial.print("error = ");
    Serial.println(error);
  }
}
`
}

function codigoLecturaLinea(tabla: FilaPin[], doc: RobotDoc) {
  const s = sensoresLinea(tabla, doc)
  return `// Leer los sensores IR por el Monitor Serie (digital y analógico)
// Mueve el robot con doble clic sobre la pista para ver cómo cambian.
void setup() {
  pinMode(${s.DO_IZQ}, INPUT);
  pinMode(${s.DO_DER}, INPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.print("Izq: ");
  Serial.print(digitalRead(${s.DO_IZQ}));
  Serial.print(" (");
  Serial.print(analogRead(${s.AO_IZQ}));
  Serial.print(")   Der: ");
  Serial.print(digitalRead(${s.DO_DER}));
  Serial.print(" (");
  Serial.print(analogRead(${s.AO_DER}));
  Serial.println(")");
  delay(300);
}
`
}

export function codigoPruebaMotores(tabla: FilaPin[], doc: RobotDoc) {
  return `// Prueba de motores: adelante, giro y reversa
${bloqueMotores(tabla, doc)}

void setup() {
  ${SETUP_MOTORES}
  Serial.begin(9600);
}

void loop() {
  Serial.println("Adelante");
  motores(200, 200);
  delay(1500);
  Serial.println("Girar a la derecha");
  motores(180, -180);
  delay(600);
  Serial.println("Reversa");
  motores(-150, -150);
  delay(1000);
  Serial.println("Alto");
  motores(0, 0);
  delay(1000);
}
`
}

const BLINK = `// El clásico: parpadear el LED del pin 13
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("Encendido");
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("Apagado");
  delay(500);
}
`

export function construirSeguidor(): RobotDoc {
  const a = new Armador('chasis-2wd', 'acrilico', 'Seguidor de línea')
  a.poner('arduino-uno', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  const mi = a.poner('motor-tt', 'chasis', 'motor-izq')
  const md = a.poner('motor-tt', 'chasis', 'motor-der')
  a.poner('rueda-65', mi, 'eje')
  a.poner('rueda-65', md, 'eje')
  a.poner('rueda-loca', 'chasis', 'loca')
  a.poner('tcrt5000', 'chasis', 'piso-izq')
  a.poner('tcrt5000', 'chasis', 'piso-der')
  return a.terminar(codigoSeguidor)
}

// ---------------------------------------------------------------------------
// Evita obstáculos: ultrasonido sobre un servo que "mira" a los lados
// ---------------------------------------------------------------------------

function pinesUltrasonido(tabla: FilaPin[], doc: RobotDoc) {
  const us = doc.piezas.find(p => p.pieza === 'hcsr04')?.id ?? ''
  const sv = doc.piezas.find(p => p.pieza === 'sg90' || p.pieza === 'mg90s')?.id ?? ''
  return {
    TRIG: pinCodigo(pinDePlaca(tabla, us, 'TRIG')),
    ECHO: pinCodigo(pinDePlaca(tabla, us, 'ECHO')),
    SERVO: pinCodigo(pinDePlaca(tabla, sv, 'SIG')),
  }
}

const MEDIR_CM = `// Mide la distancia en cm con el HC-SR04 (400 si no hay eco)
long medirCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);      // pulso de 10 µs = "dispara"
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);  // cuánto dura el eco (máx. 30 ms)
  if (us == 0) return 400;               // sin eco: nada adelante
  return us / 58;                        // 58 µs por cada cm (ida y vuelta)
}`

function codigoEvita(tabla: FilaPin[], doc: RobotDoc) {
  const u = pinesUltrasonido(tabla, doc)
  return `// Robot evita obstáculos: avanza mirando con el ultrasonido.
// Si algo está cerca, retrocede, gira el "cuello" (servo) para mirar a cada
// lado y se va hacia donde haya más espacio.
#include <Servo.h>

const int TRIG = ${u.TRIG};
const int ECHO = ${u.ECHO};
const int SERVO_PIN = ${u.SERVO};

${bloqueMotores(tabla, doc)}

const int VELOCIDAD = 160;
const int DISTANCIA_MINIMA = 25;   // cm

Servo cuello;

${MEDIR_CM}

// Gira el cuello, espera a que llegue y mide
long mirar(int angulo) {
  cuello.write(angulo);
  delay(350);
  return medirCm();
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  ${SETUP_MOTORES}
  cuello.attach(SERVO_PIN);
  cuello.write(90);                // 90° = mirando al frente
  Serial.begin(9600);
  delay(500);
}

void loop() {
  long d = medirCm();
  Serial.print("Distancia: ");
  Serial.print(d);
  Serial.println(" cm");

  if (d > DISTANCIA_MINIMA) {
    motores(VELOCIDAD, VELOCIDAD);   // camino libre
    delay(60);
    return;
  }

  motores(0, 0);                     // ¡obstáculo! frenar
  delay(150);
  motores(-140, -140);               // retroceder un poco
  delay(300);
  motores(0, 0);

  long izq = mirar(170);             // mirar a la izquierda
  long der = mirar(10);              // mirar a la derecha
  cuello.write(90);
  Serial.print("Izquierda: "); Serial.print(izq);
  Serial.print(" cm  Derecha: "); Serial.print(der); Serial.println(" cm");

  if (izq > der) motores(-170, 170); // girar hacia el lado más libre
  else motores(170, -170);
  delay(380);
  motores(0, 0);
  delay(100);
}
`
}

function codigoLecturaUltrasonido(tabla: FilaPin[], doc: RobotDoc) {
  const u = pinesUltrasonido(tabla, doc)
  return `// Radar: el servo barre de 10° a 170° y el ultrasonido mide en cada ángulo
#include <Servo.h>

const int TRIG = ${u.TRIG};
const int ECHO = ${u.ECHO};
Servo cuello;

${MEDIR_CM}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  cuello.attach(${u.SERVO});
  Serial.begin(9600);
}

void loop() {
  for (int a = 10; a <= 170; a += 20) {
    cuello.write(a);
    delay(250);
    Serial.print(a);
    Serial.print("°: ");
    Serial.print(medirCm());
    Serial.println(" cm");
  }
}
`
}

export function construirEvitaObstaculos(): RobotDoc {
  const a = new Armador('chasis-2wd', 'mdf', 'Evita obstáculos')
  a.poner('arduino-uno', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  const mi = a.poner('motor-tt', 'chasis', 'motor-izq')
  const md = a.poner('motor-tt', 'chasis', 'motor-der')
  a.poner('rueda-65', mi, 'eje')
  a.poner('rueda-65', md, 'eje')
  a.poner('rueda-loca', 'chasis', 'loca')
  const servo = a.poner('sg90', 'chasis', 'servo')
  a.poner('hcsr04', servo, 'eje')
  return a.terminar(codigoEvita)
}

export const PREARMADOS: Prearmado[] = [
  {
    id: 'seguidor',
    nombre: 'Seguidor de línea',
    descripcion: 'Dos sensores IR miran el piso y el robot corrige para no salirse de la cinta negra.',
    dificultad: 'inicial',
    arena: 'ovalo',
    construir: construirSeguidor,
    plantillas: (doc, tabla) => [
      { id: 'seguidor', nombre: 'Seguidor de línea (2 sensores)', descripcion: 'Lógica sí/no con los sensores digitales', codigo: codigoSeguidor(tabla, doc) },
      { id: 'proporcional', nombre: 'Seguidor proporcional', descripcion: 'Corrección suave con analogRead', codigo: codigoProporcional(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
      { id: 'sensores', nombre: 'Lectura de sensores', descripcion: 'Valores de los IR en el Monitor Serie', codigo: codigoLecturaLinea(tabla, doc) },
      { id: 'blink', nombre: 'Blink (LED 13)', descripcion: 'Primer programa', codigo: BLINK },
    ],
  },
  {
    id: 'evita-obstaculos',
    nombre: 'Evita obstáculos',
    descripcion: 'Un ultrasonido sobre un servo mira adelante y a los lados para esquivar cajas y paredes.',
    dificultad: 'intermedio',
    arena: 'campo-libre',
    construir: construirEvitaObstaculos,
    plantillas: (doc, tabla) => [
      { id: 'evita', nombre: 'Evita obstáculos', descripcion: 'Avanza, frena, mira a los lados y gira', codigo: codigoEvita(tabla, doc) },
      { id: 'radar', nombre: 'Radar', descripcion: 'El servo barre y mide distancias', codigo: codigoLecturaUltrasonido(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
      { id: 'blink', nombre: 'Blink (LED 13)', descripcion: 'Primer programa', codigo: BLINK },
    ],
  },
]

/** Plantillas genéricas para un robot armado desde cero. */
export function plantillasGenericas(doc: RobotDoc, tabla: FilaPin[]): PlantillaCodigo[] {
  const out: PlantillaCodigo[] = []
  if (doc.piezas.some(p => p.pieza === 'l298n')) out.push({ id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) })
  if (doc.piezas.some(p => p.padre?.montaje === 'piso-izq') && doc.piezas.some(p => p.padre?.montaje === 'piso-der')) {
    out.push({ id: 'seguidor', nombre: 'Seguidor de línea', descripcion: 'Con los sensores de piso', codigo: codigoSeguidor(tabla, doc) })
  }
  if (doc.piezas.some(p => p.pieza === 'hcsr04') && doc.piezas.some(p => p.pieza === 'sg90' || p.pieza === 'mg90s')) {
    out.push({ id: 'evita', nombre: 'Evita obstáculos', descripcion: 'Ultrasonido sobre servo', codigo: codigoEvita(tabla, doc) })
  }
  out.push({ id: 'blink', nombre: 'Blink (LED 13)', descripcion: 'Primer programa', codigo: BLINK })
  return out
}
