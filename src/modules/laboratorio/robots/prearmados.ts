// Robots prearmados (F2): se arman con las mismas operaciones del taller,
// así que son robots normales que el alumno puede abrir y modificar.
// Su código usa los pines que dio el cableado automático.

import { autocablear, pinCodigo, pinDePlaca, type FilaPin } from '../engine/autocableado'
import { pieza } from '../catalogo/piezas'
import type { ProgramaBloques } from '../bloques/generador'
import { encastrar, robotVacio } from '../engine/ensamblaje'
import { infoPlaca } from '../engine/placa'
import type { RobotDoc } from './doc'
import { PROYECTOS_CIRCUITO, plantillasCircuito } from './circuitos'
import { PROYECTOS_AULAS, tema } from './proyectosAulas'
import { PROYECTOS_RPI } from './raspberry'
import { esBanco } from '../engine/ensamblaje'

export interface PlantillaCodigo { id: string; nombre: string; descripcion: string; codigo: string; bloques?: ProgramaBloques }

export interface Prearmado {
  id: string
  nombre: string
  descripcion: string
  dificultad: 'inicial' | 'intermedio' | 'avanzado'
  /** Cómo piensa el robot, paso a paso (se muestra en la galería). */
  logica: string[]
  arena: string
  /** Robot o proyecto de la mesa de electrónica (por defecto, robot). */
  categoria?: 'robot' | 'electronica'
  /** Kit de la plataforma al que corresponde (se muestra en la galería). */
  kit?: string
  /** De qué tema de un curso externo viene la idea (se muestra en la galería). */
  tema?: string
  construir: () => RobotDoc
  plantillas: (doc: RobotDoc, tabla: FilaPin[]) => PlantillaCodigo[]
}

/** En el ESP32 los servos usan la librería ESP32Servo (misma forma de uso). */
function incluirServo(doc: RobotDoc) {
  return infoPlaca(doc).placa === 'esp32' ? '#include <ESP32Servo.h>' : '#include <Servo.h>'
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
/** Driver del robot (L298N, TB6612…): el que tenga comportamiento de puente H. */
function driverDe(doc: RobotDoc) {
  for (const p of doc.piezas) {
    const c = pieza(p.pieza).comportamiento
    if (c.tipo === 'puente-h') return { id: p.id, canales: c.canales }
  }
  return null
}

/**
 * Pines del driver (canal A = lado izquierdo, canal B = derecho). En el código
 * se llaman ENA/IN1/IN2… como en el L298N; con un TB6612 son PWMA/AIN1/AIN2.
 */
function pinesDriver(tabla: FilaPin[], doc: RobotDoc) {
  const d = driverDe(doc)
  const p = (pin: string | undefined) => pinCodigo(d && pin ? pinDePlaca(tabla, d.id, pin) : null)
  const [a, b] = d?.canales ?? []
  return { ENA: p(a?.en), IN1: p(a?.in_a), IN2: p(a?.in_b), ENB: p(b?.en), IN3: p(b?.in_a), IN4: p(b?.in_b) }
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
// Seguidor de velocidad (competencia): acelera en las rectas y frena para las curvas
// ---------------------------------------------------------------------------

function codigoSeguidorVelocidad(tabla: FilaPin[], doc: RobotDoc) {
  const s = sensoresLinea(tabla, doc)
  return `// Seguidor de velocidad para competencia: tres vueltas contra el reloj.
// Idea de los robots de competencia: VELOCIDAD ADAPTATIVA.
//  - Mientras la línea sigue entre los sensores (una recta), acelera poco a
//    poco desde BASE hasta RAPIDO.
//  - Cuando un sensor toca la línea (empieza una curva), corrige girando y
//    vuelve a BASE: llegar rápido a la curva hace que el robot se pase.
// Prueba a cambiar BASE, RAPIDO, GIRO y ACELERA: ¿cuál es tu mejor vuelta sin salirte?

const int IR_IZQ = ${s.DO_IZQ};   // HIGH = ve la línea negra
const int IR_DER = ${s.DO_DER};

${bloqueMotores(tabla, doc)}

const int BASE = 150;      // velocidad al salir de una curva (0 a 255)
const int RAPIDO = 255;    // velocidad máxima en las rectas
const int GIRO = 180;      // fuerza de la corrección
const int ACELERA = 2;     // cada cuántos ms sube 1 la velocidad en la recta

unsigned long ultimaCorreccion = 0;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  ${SETUP_MOTORES}
  Serial.begin(9600);
  Serial.println("Seguidor de velocidad listo");
}

void loop() {
  bool izq = digitalRead(IR_IZQ) == HIGH;
  bool der = digitalRead(IR_DER) == HIGH;

  if (izq && !der) {
    motores(-GIRO / 2, GIRO);        // la línea se fue a la izquierda
    ultimaCorreccion = millis();
  } else if (der && !izq) {
    motores(GIRO, -GIRO / 2);        // la línea se fue a la derecha
    ultimaCorreccion = millis();
  } else {
    // Recta (o cruce): cuanto más dura sin corregir, más rápido.
    int v = constrain(BASE + (millis() - ultimaCorreccion) / ACELERA, BASE, RAPIDO);
    motores(v, v);
  }
}
`
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
${incluirServo(doc)}

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
${incluirServo(doc)}

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

// ---------------------------------------------------------------------------
// Robot que no se cae de la mesa
// ---------------------------------------------------------------------------

function codigoAnticaida(tabla: FilaPin[], doc: RobotDoc) {
  const s = sensoresLinea(tabla, doc)
  return `// Robot que no se cae de la mesa.
// Los sensores IR de abajo miran la mesa. Si uno deja de ver piso (pasa el
// borde), el sensor da HIGH, igual que con la línea negra: no vuelve luz.
// Entonces el robot frena, retrocede y gira hacia el lado contrario.

const int IR_IZQ = ${s.DO_IZQ};   // sensor de piso izquierdo
const int IR_DER = ${s.DO_DER};   // sensor de piso derecho

${bloqueMotores(tabla, doc)}

const int VELOCIDAD = 140;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  ${SETUP_MOTORES}
  Serial.begin(9600);
  Serial.println("Explorando la mesa...");
}

void loop() {
  bool bordeIzq = digitalRead(IR_IZQ) == HIGH;   // HIGH = no hay piso
  bool bordeDer = digitalRead(IR_DER) == HIGH;

  if (!bordeIzq && !bordeDer) {
    motores(VELOCIDAD, VELOCIDAD);   // todo bien: seguir explorando
    return;
  }

  // ¡Borde! Frenar, retroceder y girar hacia el lado que todavía tiene mesa.
  Serial.println(bordeIzq ? "Borde a la izquierda" : "Borde a la derecha");
  motores(-150, -150);
  delay(350);
  if (bordeIzq) motores(160, -160);   // girar a la derecha
  else motores(-160, 160);            // girar a la izquierda
  delay(300 + random(300));           // un poco al azar para no repetir el camino
  motores(0, 0);
}
`
}

export function construirAnticaida(): RobotDoc {
  const a = new Armador('chasis-2wd', 'pla', 'No me caigo')
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
  return a.terminar(codigoAnticaida)
}

// ---------------------------------------------------------------------------
// Explorador 4WD: dos IR a los costados + ultrasonido adelante
// ---------------------------------------------------------------------------

function pinesObstaculo(tabla: FilaPin[], doc: RobotDoc, montaje: string) {
  const s = doc.piezas.find(p => p.padre?.montaje === montaje)?.id ?? ''
  return pinCodigo(pinDePlaca(tabla, s, 'OUT'))
}

function codigoExplorador(tabla: FilaPin[], doc: RobotDoc) {
  const us = doc.piezas.find(p => p.pieza === 'hcsr04')?.id ?? ''
  return `// Explorador 4WD: esquiva con tres "ojos".
//  - Dos sensores IR FC-51 en las esquinas de adelante (LOW = hay algo cerca).
//  - Un ultrasonido al frente que mide la distancia.
// Lógica: si algo está adelante, retrocede y gira hacia el lado libre;
// si un IR ve algo a un costado, se aleja curvando hacia el otro lado.
// Memoria de escape: si se bloquea 3 veces seguidas (está en un rincón),
// retrocede más y da media vuelta.

const int IR_IZQ = ${pinesObstaculo(tabla, doc, 'frente-izq')};
const int IR_DER = ${pinesObstaculo(tabla, doc, 'frente-der')};
const int TRIG = ${pinCodigo(pinDePlaca(tabla, us, 'TRIG'))};
const int ECHO = ${pinCodigo(pinDePlaca(tabla, us, 'ECHO'))};

${bloqueMotores(tabla, doc)}

${MEDIR_CM}

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  ${SETUP_MOTORES}
  Serial.begin(9600);
}

int bloqueos = 0;                // cuántas veces seguidas se bloqueó
unsigned long ultimoBloqueo = 0;

void loop() {
  long frente = medirCm();
  bool algoIzq = digitalRead(IR_IZQ) == LOW;
  bool algoDer = digitalRead(IR_DER) == LOW;

  if (frente < 30 || (algoIzq && algoDer)) {
    // Bloqueado. ¿Es la tercera vez en poco tiempo? Entonces es un rincón.
    if (millis() - ultimoBloqueo < 2500) bloqueos++;
    else bloqueos = 1;
    ultimoBloqueo = millis();
    bool rincon = bloqueos >= 3;
    Serial.println(rincon ? "Rincon: media vuelta" : "Bloqueado: retrocedo");

    motores(-170, -170);
    delay(rincon ? 650 : 350);
    // Girar hacia el lado libre; si los dos están libres, elegir al azar.
    bool aLaDerecha = algoIzq || (!algoDer && random(2) == 0);
    if (aLaDerecha) motores(210, -210);
    else motores(-210, 210);
    delay(rincon ? 950 : 450);
    if (rincon) bloqueos = 0;
  } else if (algoIzq) {
    motores(210, 60);      // algo a la izquierda: curvar a la derecha
  } else if (algoDer) {
    motores(60, 210);      // algo a la derecha: curvar a la izquierda
  } else {
    motores(190, 190);     // camino libre
  }
  delay(30);
}
`
}

export function construirExplorador(): RobotDoc {
  const a = new Armador('chasis-4wd', 'aluminio', 'Explorador 4WD')
  a.poner('arduino-uno', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  for (const m of ['motor-del-izq', 'motor-tra-izq', 'motor-del-der', 'motor-tra-der']) {
    const id = a.poner('motor-tt', 'chasis', m)
    a.poner('rueda-65', id, 'eje')
  }
  a.poner('fc51', 'chasis', 'frente-izq')
  a.poner('fc51', 'chasis', 'frente-der')
  a.poner('hcsr04', 'chasis', 'frente')
  return a.terminar(codigoExplorador)
}

// ---------------------------------------------------------------------------
// Resuelve laberintos: regla de la mano derecha
// ---------------------------------------------------------------------------

function codigoLaberinto(tabla: FilaPin[], doc: RobotDoc) {
  const us = doc.piezas.find(p => p.pieza === 'hcsr04')?.id ?? ''
  return `// Resuelve laberintos con la "regla de la mano derecha":
// si caminas tocando siempre la pared derecha, tarde o temprano sales.
//  - Un sensor IR (FC-51) mira adelante-derecha: LOW = la pared está cerca.
//  - El ultrasonido mira al frente.
// Lógica:
//   1. Pared adelante  -> girar a la izquierda sin avanzar.
//   2. Pared a la derecha -> avanzar abriéndose un poco a la izquierda.
//   3. Sin pared a la derecha -> curvar a la derecha para buscarla.

const int IR_DER = ${pinesObstaculo(tabla, doc, 'frente-der')};
const int TRIG = ${pinCodigo(pinDePlaca(tabla, us, 'TRIG'))};
const int ECHO = ${pinCodigo(pinDePlaca(tabla, us, 'ECHO'))};

${bloqueMotores(tabla, doc)}

${MEDIR_CM}

void setup() {
  pinMode(IR_DER, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  ${SETUP_MOTORES}
  Serial.begin(9600);
}

void loop() {
  long frente = medirCm();
  bool paredDer = digitalRead(IR_DER) == LOW;

  if (frente < 18) {
    Serial.println("Pared adelante: giro a la izquierda");
    motores(-150, 150);
    delay(120);
  } else if (paredDer) {
    motores(120, 175);     // pegado a la pared: abrirse un poco
  } else {
    motores(175, 85);      // perdí la pared: buscarla a la derecha
  }
  delay(20);
}
`
}

export function construirLaberinto(): RobotDoc {
  const a = new Armador('chasis-2wd', 'acrilico', 'Resuelve laberintos')
  a.poner('arduino-uno', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  const mi = a.poner('motor-tt', 'chasis', 'motor-izq')
  const md = a.poner('motor-tt', 'chasis', 'motor-der')
  a.poner('rueda-65', mi, 'eje')
  a.poner('rueda-65', md, 'eje')
  a.poner('rueda-loca', 'chasis', 'loca')
  a.poner('fc51', 'chasis', 'frente-der')
  a.poner('hcsr04', 'chasis', 'frente')
  return a.terminar(codigoLaberinto)
}

// ---------------------------------------------------------------------------
// Seguidor de línea que frena ante obstáculos
// ---------------------------------------------------------------------------

function codigoSeguidorFreno(tabla: FilaPin[], doc: RobotDoc) {
  const s = sensoresLinea(tabla, doc)
  const us = doc.piezas.find(p => p.pieza === 'hcsr04')?.id ?? ''
  return `// Seguidor de línea con freno de seguridad.
// Sigue la línea como el seguidor básico, pero cada 60 ms mira adelante con
// el ultrasonido: si hay algo a menos de 15 cm se detiene y avisa con el LED 13.
// Cuando quitas el obstáculo, sigue solo.

const int IR_IZQ = ${s.DO_IZQ};
const int IR_DER = ${s.DO_DER};
const int TRIG = ${pinCodigo(pinDePlaca(tabla, us, 'TRIG'))};
const int ECHO = ${pinCodigo(pinDePlaca(tabla, us, 'ECHO'))};

${bloqueMotores(tabla, doc)}

const int VELOCIDAD = 150;
const int GIRO = 170;
const int FRENAR_CM = 15;

${MEDIR_CM}

long distancia = 400;
unsigned long ultimaMedida = 0;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  ${SETUP_MOTORES}
  Serial.begin(9600);
}

void loop() {
  // Medir no muy seguido: pulseIn tarda y el robot debe seguir corrigiendo.
  if (millis() - ultimaMedida > 60) {
    ultimaMedida = millis();
    distancia = medirCm();
  }

  if (distancia < FRENAR_CM) {
    motores(0, 0);
    digitalWrite(LED_BUILTIN, (millis() / 200) % 2);   // parpadea: ¡obstáculo!
    return;
  }
  digitalWrite(LED_BUILTIN, LOW);

  int izq = digitalRead(IR_IZQ);
  int der = digitalRead(IR_DER);
  if (izq == HIGH && der == LOW) motores(-GIRO / 2, GIRO);
  else if (izq == LOW && der == HIGH) motores(GIRO, -GIRO / 2);
  else motores(VELOCIDAD, VELOCIDAD);
}
`
}

export function construirSeguidorFreno(): RobotDoc {
  const a = new Armador('chasis-2wd', 'acrilico', 'Seguidor con freno')
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
  a.poner('hcsr04', 'chasis', 'frente')
  return a.terminar(codigoSeguidorFreno)
}

// ---------------------------------------------------------------------------
// ESP32: seguidor de línea y robot de radiocontrol por Bluetooth
// ---------------------------------------------------------------------------

export function construirSeguidorEsp32(): RobotDoc {
  const a = new Armador('chasis-2wd', 'acrilico', 'Seguidor ESP32')
  a.poner('esp32-devkit', 'chasis', 'placa')
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

/**
 * Manejar el robot con letras. El ESP32 las recibe por su Bluetooth; las otras
 * placas, por el puerto serie (en el robot real, con un módulo HC-05 en RX/TX).
 */
export function codigoRc(tabla: FilaPin[], doc: RobotDoc) {
  const bt = infoPlaca(doc).placa === 'esp32'
  const puerto = bt ? 'SerialBT' : 'Serial'
  return `// Robot de radiocontrol: lo manejas tú, con el teclado de la compu
// (flechas o WASD), el control en pantalla o un control de videojuego.
// Cada tecla llega como una letra y el robot obedece:
//   F = adelante   B = atrás   L = izquierda   R = derecha   S = parar
//   G / I = curva adelante a la izq. / der.   H / J = curva atrás a la izq. / der.
//   0–9 = velocidad (0 = lenta, 9 = máxima)
${bt
    ? `// El ESP32 tiene Bluetooth: en el robot real, las letras las manda una app del celular.
#include <BluetoothSerial.h>

BluetoothSerial SerialBT;
`
    : '// En el robot real, las letras llegan con un módulo Bluetooth HC-05 conectado a RX y TX.\n'}
${bloqueMotores(tabla, doc)}

int velocidad = 200;   // 0 a 255

void setup() {
  ${SETUP_MOTORES}
  ${bt ? 'Serial.begin(115200);\n  SerialBT.begin("RobotChaski");   // nombre que verás en el celular\n  Serial.println("Listo: conéctate a RobotChaski por Bluetooth");' : 'Serial.begin(9600);\n  Serial.println("Listo: maneja con las flechas");'}
}

void loop() {
  if (!${puerto}.available()) return;
  char c = ${puerto}.read();

  if (c >= '0' && c <= '9') {            // un número cambia la velocidad
    velocidad = map(c - '0', 0, 9, 90, 255);
    return;
  }
  switch (c) {
    case 'F': motores(velocidad, velocidad); break;
    case 'B': motores(-velocidad, -velocidad); break;
    case 'L': motores(-velocidad / 2, velocidad); break;
    case 'R': motores(velocidad, -velocidad / 2); break;
    case 'G': motores(velocidad * 2 / 5, velocidad); break;
    case 'I': motores(velocidad, velocidad * 2 / 5); break;
    case 'H': motores(-velocidad * 2 / 5, -velocidad); break;
    case 'J': motores(-velocidad, -velocidad * 2 / 5); break;
    case 'S': motores(0, 0); break;
  }
}
`
}

export function construirRcEsp32(): RobotDoc {
  const a = new Armador('chasis-4wd', 'pla', 'Robot RC Bluetooth')
  a.poner('esp32-devkit', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  for (const m of ['motor-del-izq', 'motor-tra-izq', 'motor-del-der', 'motor-tra-der']) {
    const id = a.poner('motor-tt', 'chasis', m)
    a.poner('rueda-65', id, 'eje')
  }
  return a.terminar(codigoRc)
}

// ---------------------------------------------------------------------------
// Minisumo (F5): Nano + TB6612 + LiPo, dos N20, pala de acero
// ---------------------------------------------------------------------------

function pinesMinisumo(tabla: FilaPin[], doc: RobotDoc) {
  const us = doc.piezas.find(p => p.pieza === 'hcsr04')?.id ?? ''
  const borde = (montaje: string) => pinCodigo(pinDePlaca(tabla, doc.piezas.find(p => p.padre?.montaje === montaje)?.id ?? '', 'DO'))
  return {
    TRIG: pinCodigo(pinDePlaca(tabla, us, 'TRIG')), ECHO: pinCodigo(pinDePlaca(tabla, us, 'ECHO')),
    IR_IZQ: pinesObstaculo(tabla, doc, 'frente-izq'), IR_DER: pinesObstaculo(tabla, doc, 'frente-der'),
    BORDE_IZQ: borde('piso-izq'), BORDE_DER: borde('piso-der'),
  }
}

function codigoMinisumo(tabla: FilaPin[], doc: RobotDoc) {
  const p = pinesMinisumo(tabla, doc)
  return `// Minisumo: espera los 5 s del reglamento, busca al rival girando, lo
// empuja con la pala y se aleja del borde blanco del dohyo.
//  - Ultrasonido HC-SR04 al frente: ve al rival a distancia.
//  - Dos FC-51 en las esquinas (LOW = hay algo cerca).
//  - Dos TCRT5000 abajo: HIGH sobre el negro del dohyo, LOW sobre el borde blanco.

const int TRIG = ${p.TRIG};
const int ECHO = ${p.ECHO};
const int IR_IZQ = ${p.IR_IZQ};
const int IR_DER = ${p.IR_DER};
const int BORDE_IZQ = ${p.BORDE_IZQ};
const int BORDE_DER = ${p.BORDE_DER};

${bloqueMotores(tabla, doc)}

const int ATAQUE = 255;   // a todo lo que da: empujar
const int BUSCAR = 150;   // girar buscando
const int VER_CM = 60;    // a esta distancia (o menos) el rival está al frente
const int MEMORIA_MS = 400; // sigue empujando un rato aunque deje de verlo

// Pegado al rival el ultrasonido no mide (zona ciega de 2 cm): por eso el
// robot "recuerda" que lo vio y sigue empujando.
unsigned long atacarHasta = 0;

${MEDIR_CM}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(IR_IZQ, INPUT); pinMode(IR_DER, INPUT);
  pinMode(BORDE_IZQ, INPUT); pinMode(BORDE_DER, INPUT);
  ${SETUP_MOTORES}
  motores(0, 0);
  Serial.begin(9600);
  Serial.println("Esperando 5 s (reglamento)...");
  delay(5000);              // ¡obligatorio! si se mueve antes, pierde la ronda
  Serial.println("¡A pelear!");
}

void loop() {
  // 1. Lo primero es no caerse: si un sensor ve el borde blanco, retroceder
  //    y girar hacia el centro.
  bool bordeIzq = digitalRead(BORDE_IZQ) == LOW;
  bool bordeDer = digitalRead(BORDE_DER) == LOW;
  if (bordeIzq || bordeDer) {
    motores(-255, -255);                // un poquito atrás (atrás también hay borde)…
    delay(120);
    if (bordeIzq) motores(220, -220);   // …y girar en el lugar hacia el centro
    else motores(-220, 220);
    delay(300);
    return;
  }

  // 2. ¿Dónde está el rival?
  long cm = medirCm();
  bool izq = digitalRead(IR_IZQ) == LOW;
  bool der = digitalRead(IR_DER) == LOW;

  if (cm < VER_CM) atacarHasta = millis() + MEMORIA_MS;

  if (millis() < atacarHasta) {
    // ¡Empujar! Si un IR lateral lo ve más de su lado, corregir hacia él
    // para pegarle de frente (si no, la pala resbala y se dan vueltas).
    if (izq && !der) motores(ATAQUE / 2, ATAQUE);
    else if (der && !izq) motores(ATAQUE, ATAQUE / 2);
    else motores(ATAQUE, ATAQUE);
  }
  else if (izq) motores(-BUSCAR, BUSCAR);            // a la izquierda: girar hacia él
  else if (der) motores(BUSCAR, -BUSCAR);            // a la derecha
  else motores(BUSCAR, -BUSCAR);                     // no se ve: buscar girando
}
`
}

function codigoLecturaMinisumo(tabla: FilaPin[], doc: RobotDoc) {
  const p = pinesMinisumo(tabla, doc)
  return `// Prueba de sensores del minisumo: mira los valores en el Monitor Serie
// mientras mueves el robot (doble clic en el dohyo para ponerlo en otro lugar).

const int TRIG = ${p.TRIG};
const int ECHO = ${p.ECHO};
const int IR_IZQ = ${p.IR_IZQ};
const int IR_DER = ${p.IR_DER};
const int BORDE_IZQ = ${p.BORDE_IZQ};
const int BORDE_DER = ${p.BORDE_DER};

${MEDIR_CM}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(IR_IZQ, INPUT); pinMode(IR_DER, INPUT);
  pinMode(BORDE_IZQ, INPUT); pinMode(BORDE_DER, INPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.print("Frente: "); Serial.print(medirCm()); Serial.print(" cm");
  Serial.print("  IR izq: "); Serial.print(digitalRead(IR_IZQ) == LOW ? "VE" : "--");
  Serial.print("  IR der: "); Serial.print(digitalRead(IR_DER) == LOW ? "VE" : "--");
  Serial.print("  Borde: "); Serial.print(digitalRead(BORDE_IZQ) == LOW ? "B" : "n");
  Serial.println(digitalRead(BORDE_DER) == LOW ? "B" : "n");
  delay(300);
}
`
}

/** Minisumo del alumno (y, con otra variante de chasis, el rival de práctica). */
export function construirMinisumo(variante = 'pla', nombre = 'Minisumo'): RobotDoc {
  const a = new Armador('chasis-minisumo', variante, nombre)
  a.poner('arduino-nano', 'chasis', 'placa')
  a.poner('tb6612', 'chasis', 'driver')
  a.poner('bateria-lipo-2s', 'chasis', 'bateria')
  const mi = a.poner('motor-n20', 'chasis', 'motor-izq')
  const md = a.poner('motor-n20', 'chasis', 'motor-der')
  a.poner('rueda-34', mi, 'eje')
  a.poner('rueda-34', md, 'eje')
  a.poner('hcsr04', 'chasis', 'frente')
  a.poner('fc51', 'chasis', 'frente-izq')
  a.poner('fc51', 'chasis', 'frente-der')
  a.poner('tcrt5000', 'chasis', 'piso-izq')
  a.poner('tcrt5000', 'chasis', 'piso-der')
  return a.terminar(codigoMinisumo)
}

/**
 * Minisumo con ESP32: la placa no cabe abajo junto a la LiPo y el ultrasonido,
 * así que la placa y el driver suben al piso de arriba. El ultrasonido queda
 * abajo, a la altura del rival (arriba, su haz pasaría por encima). Driver
 * TB6612: el L298N también cabe arriba, pero pierde 2 V y no empuja al rival.
 */
export function construirMinisumoEsp32(): RobotDoc {
  const a = new Armador('chasis-minisumo', 'aluminio', 'Minisumo ESP32')
  const mi = a.poner('motor-n20', 'chasis', 'motor-izq')
  const md = a.poner('motor-n20', 'chasis', 'motor-der')
  a.poner('rueda-34', mi, 'eje')
  a.poner('rueda-34', md, 'eje')
  a.poner('bateria-lipo-2s', 'chasis', 'bateria')
  a.poner('hcsr04', 'chasis', 'frente')
  const piso = a.poner('piso-arriba-minisumo', 'chasis', 'arriba')
  a.poner('esp32-devkit', piso, 'placa')
  a.poner('tb6612', piso, 'driver')
  a.poner('fc51', 'chasis', 'frente-izq')
  a.poner('fc51', 'chasis', 'frente-der')
  a.poner('tcrt5000', 'chasis', 'piso-izq')
  a.poner('tcrt5000', 'chasis', 'piso-der')
  return a.terminar(codigoMinisumo)
}

/**
 * Minisumo RC: lo maneja el alumno, así que no lleva sensores. Sin ultrasonido ni
 * piso de arriba, el ESP32 cabe abajo. Sin el peso de los sensores no tenía agarre
 * para empujar al rival: por eso el chasis es de aluminio, que hace de lastre.
 */
export function construirMinisumoRc(): RobotDoc {
  const a = new Armador('chasis-minisumo', 'aluminio', 'Minisumo RC')
  a.poner('esp32-devkit', 'chasis', 'placa')
  a.poner('tb6612', 'chasis', 'driver')
  a.poner('bateria-lipo-2s', 'chasis', 'bateria')
  const mi = a.poner('motor-n20', 'chasis', 'motor-izq')
  const md = a.poner('motor-n20', 'chasis', 'motor-der')
  a.poner('rueda-34', mi, 'eje')
  a.poner('rueda-34', md, 'eje')
  return a.terminar(codigoRc)
}


// ---------------------------------------------------------------------------
// Battlebots: chasis con cuña, arma giratoria con ESC, arena de combate
// ---------------------------------------------------------------------------

/** Pin del ESC del arma (su señal SIG), sea barra, tambor o disco. */
function pinArma(tabla: FilaPin[], doc: RobotDoc) {
  return pinCodigo(pinDePlaca(tabla, doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'arma-giratoria')?.id ?? '', 'SIG'))
}

const ESC_REAL = `// En el robot real, el ESC se maneja con la librería Servo: esc.attach(ARMA);
// esc.writeMicroseconds(1000) = quieta … 2000 = máxima (y se «arma» con 1000 al empezar).
// En el laboratorio también entiende analogWrite: 0 = quieta, 255 = máxima.`

function codigoBattlebotRc(tabla: FilaPin[], doc: RobotDoc) {
  return `// Robot de combate de radiocontrol: lo manejas tú y decides cuándo girar el arma.
// Cada tecla llega como una letra (en el robot real, por Bluetooth con un HC-05):
//   F = adelante   B = atrás   L = izquierda   R = derecha   S = parar
//   G / I = curva adelante a la izq. / der.   H / J = curva atrás
//   0–9 = velocidad      X = arma a fondo      Y = arma apagada
// Consejo: el arma tarda ~1 s en llegar a toda velocidad. Enciéndela antes de
// acercarte y pega de frente: después de cada golpe pierde velocidad.
${ESC_REAL}

${bloqueMotores(tabla, doc)}

const int ARMA = ${pinArma(tabla, doc)};   // señal del ESC del arma

int velocidad = 200;   // 0 a 255

void setup() {
  ${SETUP_MOTORES}
  pinMode(ARMA, OUTPUT);
  analogWrite(ARMA, 0);   // el arma empieza quieta (por seguridad)
  Serial.begin(9600);
  Serial.println("Listo: maneja con las flechas y enciende el arma con E");
}

void loop() {
  if (!Serial.available()) return;
  char c = Serial.read();

  if (c >= '0' && c <= '9') {
    velocidad = map(c - '0', 0, 9, 90, 255);
    return;
  }
  switch (c) {
    case 'F': motores(velocidad, velocidad); break;
    case 'B': motores(-velocidad, -velocidad); break;
    case 'L': motores(-velocidad / 2, velocidad); break;
    case 'R': motores(velocidad, -velocidad / 2); break;
    case 'G': motores(velocidad * 2 / 5, velocidad); break;
    case 'I': motores(velocidad, velocidad * 2 / 5); break;
    case 'H': motores(-velocidad * 2 / 5, -velocidad); break;
    case 'J': motores(-velocidad, -velocidad * 2 / 5); break;
    case 'S': motores(0, 0); break;
    case 'X': analogWrite(ARMA, 255); Serial.println("Arma a fondo"); break;
    case 'Y': analogWrite(ARMA, 0); Serial.println("Arma apagada"); break;
  }
}
`
}

function codigoBattlebotAuto(tabla: FilaPin[], doc: RobotDoc) {
  const us = doc.piezas.find(p => p.pieza === 'hcsr04')?.id ?? ''
  return `// Robot de combate autónomo: sale al centro de la arena, busca girando con el
// ultrasonido, ataca con el arma a fondo y retrocede después de cada pasada
// (para que la barra recupere velocidad).
// Ojo: el ultrasonido no distingue al rival de una pared. Desde el centro, las
// paredes quedan a más de 1,2 m: lo que esté más cerca debería ser el rival.
// ¿Se te ocurre algo mejor?
${ESC_REAL}

const int TRIG = ${pinCodigo(pinDePlaca(tabla, us, 'TRIG'))};
const int ECHO = ${pinCodigo(pinDePlaca(tabla, us, 'ECHO'))};
const int ARMA = ${pinArma(tabla, doc)};

${bloqueMotores(tabla, doc)}

${MEDIR_CM}

const int CERCA_CM = 115;   // más cerca que las paredes: ahí está el rival

void setup() {
  ${SETUP_MOTORES}
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(ARMA, OUTPUT);
  Serial.begin(9600);
  delay(3000);               // la cuenta del juez: quieto hasta que empiece
  analogWrite(ARMA, 255);    // el arma a fondo durante todo el combate
  motores(200, 200);         // sale de la esquina hacia el centro (≈ 1 m)
  delay(2000);
  motores(0, 0);
}

void loop() {
  long cm = medirCm();
  if (cm < CERCA_CM) {
    Serial.print("Ataque a "); Serial.print(cm); Serial.println(" cm");
    motores(255, 255);       // a fondo contra lo que tiene delante
    delay(700);
    motores(-200, -200);     // retrocede para volver a tomar impulso
    delay(400);
  } else {
    motores(150, -150);      // busca girando en el lugar
    delay(60);
  }
}
`
}

/**
 * Robot de combate de verdad (beetle): chasis blindado, Nano como receptor,
 * TB6612, LiPo 2S, motores de 22 mm con ruedas de combate y el arma (tambor o
 * disco vertical). El autónomo lleva además un ultrasonido al frente.
 */
export function construirWarbot(arma: 'tambor' | 'disco', variante = 'aluminio', nombre = arma === 'tambor' ? 'Tambor' : 'Disco vertical', sensor = false): RobotDoc {
  const a = new Armador(arma === 'tambor' ? 'chasis-tambor' : 'chasis-disco', variante, nombre)
  a.poner('arduino-nano', 'chasis', 'placa')
  a.poner('tb6612', 'chasis', 'driver')
  a.poner('bateria-lipo-2s', 'chasis', 'bateria')
  const mi = a.poner('motor-combate', 'chasis', 'motor-izq')
  const md = a.poner('motor-combate', 'chasis', 'motor-der')
  a.poner('rueda-combate', mi, 'eje')
  a.poner('rueda-combate', md, 'eje')
  a.poner(arma === 'tambor' ? 'arma-tambor' : 'arma-disco', 'chasis', 'arma')
  if (sensor) a.poner('hcsr04', 'chasis', 'frente')
  return a.terminar(sensor ? codigoBattlebotAuto : codigoBattlebotRc)
}

/** El rival de práctica de cada arena de competencia. */
export function rivalPara(categoria: 'minisumo' | 'sumo' | 'beetle'): RobotDoc {
  return categoria === 'beetle' ? construirWarbot('tambor', 'rojo', 'Rival') : construirMinisumo('pla-rojo', 'Rival')
}

// ---------------------------------------------------------------------------
// Evita obstáculos con IR: el más simple, sin servo ni ultrasonido
// ---------------------------------------------------------------------------

function codigoEvitaIr(tabla: FilaPin[], doc: RobotDoc) {
  return `// Evita obstáculos con dos sensores IR (FC-51) al frente.
// Cada FC-51 da LOW cuando tiene algo cerca (unos 20 cm) y HIGH si no.

const int IR_IZQ = ${pinesObstaculo(tabla, doc, 'frente-izq')};
const int IR_DER = ${pinesObstaculo(tabla, doc, 'frente-der')};

${bloqueMotores(tabla, doc)}

const int AVANCE = 160;
const int GIRO = 180;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  ${SETUP_MOTORES}
  Serial.begin(9600);
}

void loop() {
  bool izq = digitalRead(IR_IZQ) == LOW;
  bool der = digitalRead(IR_DER) == LOW;

  if (izq && der) {
    // Pared al frente: retrocede un poco y da media vuelta.
    Serial.println("Obstaculo al frente");
    motores(-AVANCE, -AVANCE);
    delay(300);
    motores(GIRO, -GIRO);
    delay(450);
  } else if (izq) {
    Serial.println("Obstaculo a la izquierda");
    motores(GIRO, -GIRO);     // gira a la derecha, lejos del obstáculo
  } else if (der) {
    Serial.println("Obstaculo a la derecha");
    motores(-GIRO, GIRO);     // gira a la izquierda
  } else {
    motores(AVANCE, AVANCE);  // camino libre: adelante
  }
}
`
}

function codigoLecturaIr(tabla: FilaPin[], doc: RobotDoc) {
  return `// Prueba de los dos FC-51: acerca una caja (o mueve el robot) y mira el Monitor Serie.

const int IR_IZQ = ${pinesObstaculo(tabla, doc, 'frente-izq')};
const int IR_DER = ${pinesObstaculo(tabla, doc, 'frente-der')};

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.print("Izquierdo: ");
  Serial.print(digitalRead(IR_IZQ) == LOW ? "ve algo" : "libre");
  Serial.print("   Derecho: ");
  Serial.println(digitalRead(IR_DER) == LOW ? "ve algo" : "libre");
  delay(300);
}
`
}

export function construirEvitaIr(): RobotDoc {
  const a = new Armador('chasis-2wd', 'pla', 'Evita obstáculos IR')
  a.poner('arduino-uno', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  const mi = a.poner('motor-tt', 'chasis', 'motor-izq')
  const md = a.poner('motor-tt', 'chasis', 'motor-der')
  a.poner('rueda-65', mi, 'eje')
  a.poner('rueda-65', md, 'eje')
  a.poner('rueda-loca', 'chasis', 'loca')
  a.poner('fc51', 'chasis', 'frente-izq')
  a.poner('fc51', 'chasis', 'frente-der')
  return a.terminar(codigoEvitaIr)
}

// ---------------------------------------------------------------------------
// Primeros motores: el chasis 2WD sin sensores, que sigue un camino fijo
// ---------------------------------------------------------------------------

function codigoCuadrado(tabla: FilaPin[], doc: RobotDoc) {
  return `// Mis primeros motores: el robot dibuja un cuadrado.
// No tiene sensores: avanza y gira durante un tiempo fijo (con delay).
// Ajusta GIRO_MS hasta que cada giro sea de 90°: depende de la batería y del piso.
${bloqueMotores(tabla, doc)}

const int VELOCIDAD = 180;
const int AVANCE_MS = 1200;   // cuánto avanza en cada lado
const int GIRO_MS = 250;      // cuánto gira en cada esquina

void setup() {
  ${SETUP_MOTORES}
  Serial.begin(9600);
  delay(1000);
}

void loop() {
  for (int lado = 1; lado <= 4; lado++) {
    Serial.print("Lado ");
    Serial.println(lado);
    motores(VELOCIDAD, VELOCIDAD);    // adelante
    delay(AVANCE_MS);
    motores(0, 0);
    delay(200);
    motores(-VELOCIDAD, VELOCIDAD);   // girar a la izquierda en el lugar
    delay(GIRO_MS);
    motores(0, 0);
    delay(200);
  }
  Serial.println("¡Cuadrado listo!");
  delay(2000);
}
`
}

function codigoCadaMotor(tabla: FilaPin[], doc: RobotDoc) {
  return `// Cada motor por separado: así se descubre si alguno está conectado al revés.
// Si una rueda gira hacia atrás cuando dice "adelante", invierte sus dos cables
// en el driver (o cambia HIGH por LOW en la función motores).
${bloqueMotores(tabla, doc)}

void setup() {
  ${SETUP_MOTORES}
  Serial.begin(9600);
}

void loop() {
  Serial.println("Izquierdo adelante");
  motores(180, 0);
  delay(1500);
  Serial.println("Izquierdo atras");
  motores(-180, 0);
  delay(1500);
  Serial.println("Derecho adelante");
  motores(0, 180);
  delay(1500);
  Serial.println("Derecho atras");
  motores(0, -180);
  delay(1500);
  motores(0, 0);
  delay(1000);
}
`
}

export function construirPrimerosMotores(): RobotDoc {
  const a = new Armador('chasis-2wd', 'mdf', 'Mis primeros motores')
  a.poner('arduino-uno', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  const mi = a.poner('motor-tt', 'chasis', 'motor-izq')
  const md = a.poner('motor-tt', 'chasis', 'motor-der')
  a.poner('rueda-65', mi, 'eje')
  a.poner('rueda-65', md, 'eje')
  a.poner('rueda-loca', 'chasis', 'loca')
  return a.terminar(codigoCuadrado)
}

// ---------------------------------------------------------------------------
// Robot aspirador: recorre la sala sin chocar para limpiar todo lo que pueda
// ---------------------------------------------------------------------------

function codigoAspirador(tabla: FilaPin[], doc: RobotDoc) {
  const us = doc.piezas.find(p => p.pieza === 'hcsr04')?.id ?? ''
  return `// Robot aspirador: recorre la sala para limpiar todo el piso que pueda.
//  1. Empieza en espiral: limpia bien alrededor de donde lo dejaste.
//  2. Después avanza recto. Si un IR de las esquinas ve algo a un costado (LOW),
//     curva para alejarse sin frenar.
//  3. Si el ultrasonido ve un mueble cerca al frente (o lo ven los dos IR),
//     retrocede y gira un ángulo al azar.
//  4. Cada 10 s cambia de rumbo aunque no choque, para no repetir el camino.
//  5. Si la distancia al frente no cambia en 2 s, o lleva mucho rato curvando
//     entre patas de muebles, está trabado: retrocede y gira.
// Los IR ven las patas finas de mesas y sillas, que el ultrasonido a veces no ve.

const int TRIG = ${pinCodigo(pinDePlaca(tabla, us, 'TRIG'))};
const int ECHO = ${pinCodigo(pinDePlaca(tabla, us, 'ECHO'))};
const int IR_IZQ = ${pinesObstaculo(tabla, doc, 'frente-izq')};
const int IR_DER = ${pinesObstaculo(tabla, doc, 'frente-der')};

${bloqueMotores(tabla, doc)}

const int AVANCE = 170;
const int CERCA_CM = 15;
const unsigned long ESPIRAL_MS = 8000;
const unsigned long CAMBIO_MS = 10000;

bool enEspiral = true;
unsigned long inicio = 0;
unsigned long ultimoGiro = 0;
unsigned long ultimaRevision = 0;
long cmAnterior = 0;
int iguales = 0;   // revisiones seguidas con la misma distancia
unsigned long curvandoDesde = 0;   // desde cuándo está curvando para esquivar (0 = no)

${MEDIR_CM}

// Gira en el lugar un ángulo al azar (entre 250 y 750 ms de giro).
void girarAlAzar(bool aLaDerecha) {
  if (aLaDerecha) motores(180, -180);
  else motores(-180, 180);
  delay(250 + random(500));
  ultimoGiro = millis();
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  ${SETUP_MOTORES}
  Serial.begin(9600);
  Serial.println("Aspirando...");
  digitalWrite(LED_BUILTIN, HIGH);   // LED encendido = aspiradora funcionando
  inicio = millis();
  ultimoGiro = millis();
}

// Salir de donde se trabó: retroceder bastante y girar al azar.
void escapar(const char* motivo) {
  Serial.println(motivo);
  enEspiral = false;
  iguales = 0;
  curvandoDesde = 0;
  motores(-170, -170);
  delay(500);
  girarAlAzar(random(2) == 0);
}

void loop() {
  long cm = medirCm();
  bool izq = digitalRead(IR_IZQ) == LOW;
  bool der = digitalRead(IR_DER) == LOW;

  // ¿Trabado? Si la distancia al frente no cambia en 2 s, el robot no se mueve
  // aunque tenga los motores encendidos (las ruedas patinan contra algo).
  if (millis() - ultimaRevision > 1000) {
    ultimaRevision = millis();
    if (cm < 400 && abs(cm - cmAnterior) <= 1) iguales++;
    else iguales = 0;
    cmAnterior = cm;
    if (iguales >= 2) { escapar("¡Trabado! Retrocedo"); return; }
  }

  if (cm < CERCA_CM || (izq && der)) {
    enEspiral = false;
    Serial.println("Mueble al frente: retrocedo y giro");
    motores(-150, -150);
    delay(250);
    girarAlAzar(random(2) == 0);
    return;
  }
  if (izq || der) {
    enEspiral = false;
    // Si lleva mucho rato curvando, está dando vueltas entre patas de muebles.
    if (curvandoDesde == 0) curvandoDesde = millis();
    if (millis() - curvandoDesde > 2500) { escapar("Me enredé: retrocedo"); return; }
    if (izq) motores(AVANCE, AVANCE / 4);   // algo a la izquierda: curvar a la derecha
    else motores(AVANCE / 4, AVANCE);       // algo a la derecha: curvar a la izquierda
    return;
  }
  curvandoDesde = 0;

  if (enEspiral) {
    unsigned long t = millis() - inicio;
    if (t > ESPIRAL_MS) { enEspiral = false; return; }
    // La rueda de afuera va rápido y la de adentro acelera de a poco: la vuelta se agranda.
    motores(AVANCE + 40, map(t, 0, ESPIRAL_MS, 40, AVANCE));
    return;
  }

  if (millis() - ultimoGiro > CAMBIO_MS) {
    Serial.println("Cambio de rumbo");
    girarAlAzar(random(2) == 0);
    return;
  }
  motores(AVANCE, AVANCE);
}
`
}

export function construirAspirador(): RobotDoc {
  const a = new Armador('chasis-2wd', 'pla', 'Robot aspirador')
  a.poner('arduino-uno', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  const mi = a.poner('motor-tt', 'chasis', 'motor-izq')
  const md = a.poner('motor-tt', 'chasis', 'motor-der')
  a.poner('rueda-65', mi, 'eje')
  a.poner('rueda-65', md, 'eje')
  a.poner('rueda-loca', 'chasis', 'loca')
  a.poner('hcsr04', 'chasis', 'frente')
  a.poner('fc51', 'chasis', 'frente-izq')
  a.poner('fc51', 'chasis', 'frente-der')
  return a.terminar(codigoAspirador)
}

// ---------------------------------------------------------------------------
// Robô WiFi: el ESP32 crea su red y una página web con botones
// ---------------------------------------------------------------------------

function codigoRoboWifi(tabla: FilaPin[], doc: RobotDoc) {
  return `// Robô WiFi: el ESP32 crea su propia red WiFi y una página web con botones.
// En el robot real: conecta el celular a la red "RoboWiFi" (clave 12345678),
// abre http://192.168.4.1 y cada botón visita una dirección del robot:
//   /F adelante   /B atrás   /L izquierda   /R derecha   /S parar
//   /G /I curvas adelante   /H /J curvas atrás   /0 a /9 velocidad
// En el simulador no hay celular: el control remoto (o el teclado) hace esas visitas.
#include <WiFi.h>
#include <WebServer.h>

WebServer servidor(80);

${bloqueMotores(tabla, doc)}

int velocidad = 200;   // 0 a 255

// La página que ve el celular: cada botón visita /F, /B, /L, /R o /S.
const char PAGINA[] =
  "<html><body style='font-size:2em;text-align:center'>"
  "<h3>Robo WiFi</h3>"
  "<button onclick=\\"fetch('/F')\\">Adelante</button><br>"
  "<button onclick=\\"fetch('/L')\\">Izq</button>"
  "<button onclick=\\"fetch('/S')\\">Parar</button>"
  "<button onclick=\\"fetch('/R')\\">Der</button><br>"
  "<button onclick=\\"fetch('/B')\\">Atras</button>"
  "</body></html>";

void pagina()    { servidor.send(200, "text/html", PAGINA); }
void adelante()  { motores(velocidad, velocidad); servidor.send(200); }
void atras()     { motores(-velocidad, -velocidad); servidor.send(200); }
void izquierda() { motores(-velocidad / 2, velocidad); servidor.send(200); }
void derecha()   { motores(velocidad, -velocidad / 2); servidor.send(200); }
void parar()     { motores(0, 0); servidor.send(200); }
void curvaIzq()  { motores(velocidad * 2 / 5, velocidad); servidor.send(200); }
void curvaDer()  { motores(velocidad, velocidad * 2 / 5); servidor.send(200); }
void atrasIzq()  { motores(-velocidad * 2 / 5, -velocidad); servidor.send(200); }
void atrasDer()  { motores(-velocidad, -velocidad * 2 / 5); servidor.send(200); }

// Las direcciones /0 a /9 cambian la velocidad.
void otraDireccion() {
  String uri = servidor.uri();
  char c = uri.length() > 1 ? uri[1] : ' ';
  if (c >= '0' && c <= '9') velocidad = map(c - '0', 0, 9, 90, 255);
  servidor.send(200);
}

void setup() {
  ${SETUP_MOTORES}
  Serial.begin(115200);
  WiFi.softAP("RoboWiFi", "12345678");
  Serial.print("Red RoboWiFi lista. Abre http://");
  Serial.println(WiFi.softAPIP());

  servidor.on("/", pagina);
  servidor.on("/F", adelante);
  servidor.on("/B", atras);
  servidor.on("/L", izquierda);
  servidor.on("/R", derecha);
  servidor.on("/S", parar);
  servidor.on("/G", curvaIzq);
  servidor.on("/I", curvaDer);
  servidor.on("/H", atrasIzq);
  servidor.on("/J", atrasDer);
  servidor.onNotFound(otraDireccion);
  servidor.begin();
}

void loop() {
  servidor.handleClient();   // atiende cada visita de la página
}
`
}

export function construirRoboWifi(): RobotDoc {
  const a = new Armador('chasis-2wd', 'acrilico', 'Robô WiFi')
  a.poner('esp32-devkit', 'chasis', 'placa')
  a.poner('l298n', 'chasis', 'driver')
  a.poner('bateria-2x18650', 'chasis', 'bateria')
  const mi = a.poner('motor-tt', 'chasis', 'motor-izq')
  const md = a.poner('motor-tt', 'chasis', 'motor-der')
  a.poner('rueda-65', mi, 'eje')
  a.poner('rueda-65', md, 'eje')
  a.poner('rueda-loca', 'chasis', 'loca')
  return a.terminar(codigoRoboWifi)
}

export const PREARMADOS: Prearmado[] = [
  {
    id: 'primeros-motores',
    nombre: 'Mis primeros motores',
    descripcion: 'El chasis 2WD sin sensores: dos motores TT, el driver L298N y el Arduino UNO. Dibuja un cuadrado en el piso.',
    dificultad: 'inicial',
    tema: tema('las Aulas 31 y 32'),
    logica: [
      'El driver recibe del Arduino la dirección (IN1–IN4) y la velocidad (ENA y ENB, con PWM) de cada motor.',
      'Para avanzar, los dos motores giran hacia adelante; para girar en el lugar, uno adelante y el otro atrás.',
      'Sin sensores, el robot no sabe cuánto giró: avanza y gira durante un tiempo fijo.',
      'Mira el rastro en el piso y ajusta GIRO_MS hasta que las esquinas sean de 90°.',
    ],
    arena: 'campo-libre',
    construir: construirPrimerosMotores,
    plantillas: (doc, tabla) => [
      { id: 'cuadrado', nombre: 'Dibujar un cuadrado', descripcion: 'Avanza y gira 4 veces', codigo: codigoCuadrado(tabla, doc) },
      { id: 'cada-motor', nombre: 'Cada motor por separado', descripcion: 'Para ver si alguno está al revés', codigo: codigoCadaMotor(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'aspirador',
    nombre: 'Robot aspirador',
    descripcion: 'Limpia una sala con muebles: el piso empieza sucio y se limpia por donde pasa el robot. Ultrasonido al frente y dos IR en las esquinas.',
    dificultad: 'intermedio',
    tema: tema('la Aula 31 (robot aspirador)'),
    logica: [
      'Empieza en espiral, para limpiar bien alrededor de donde lo dejaste.',
      'Después avanza recto. Si un IR de las esquinas ve algo a un costado (una pata de mesa, la pared), curva para alejarse sin frenar.',
      'Si el ultrasonido ve un mueble a menos de 15 cm al frente, retrocede y gira un ángulo al azar.',
      'Cada 10 s cambia de rumbo aunque no choque, para no repetir siempre el mismo camino.',
      'Si el ultrasonido mide lo mismo durante 2 s, o lleva 2,5 s curvando entre patas de muebles, está trabado: retrocede y gira.',
      'Arriba a la izquierda ves cuánto del piso ya está limpio. Prueba a cambiar los tiempos para limpiar más rápido.',
    ],
    arena: 'sala',
    construir: construirAspirador,
    plantillas: (doc, tabla) => [
      { id: 'aspirador', nombre: 'Aspirador (espiral y rebote)', descripcion: 'Espiral, recto y giro al azar', codigo: codigoAspirador(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'robo-wifi',
    nombre: 'Robô WiFi (ESP32)',
    descripcion: 'El ESP32 crea su red WiFi y una página con botones para manejarlo desde el celular. En el laboratorio lo manejas con el teclado o el control en pantalla.',
    dificultad: 'intermedio',
    tema: 'Idea del modelo «Robô WiFi» de Sketchfab',
    logica: [
      'El ESP32 crea su propia red WiFi (softAP) y un servidor web en el puerto 80.',
      'Cada botón de la página visita una dirección: /F adelante, /B atrás, /L, /R y /S para parar.',
      'Con servidor.on() cada dirección llama a una función que mueve los motores.',
      'En el simulador, cada tecla del control remoto hace la visita a esa dirección.',
    ],
    arena: 'campo-libre',
    construir: construirRoboWifi,
    plantillas: (doc, tabla) => [
      { id: 'robo-wifi', nombre: 'Robô WiFi (página web)', descripcion: 'Servidor web con una dirección por botón', codigo: codigoRoboWifi(tabla, doc) },
      { id: 'rc', nombre: 'Manejar por Bluetooth (RC)', descripcion: 'Obedece las letras del control', codigo: codigoRc(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'seguidor',
    nombre: 'Seguidor de línea',
    descripcion: 'Dos sensores IR miran el piso y el robot corrige para no salirse de la cinta negra.',
    dificultad: 'inicial',
    tema: tema('la Aula 33'),
    logica: [
      'Los dos sensores miran el piso: sobre blanco dan LOW, sobre la cinta negra dan HIGH.',
      'Si ninguno ve la línea, está entre los dos: sigue recto.',
      'Si el izquierdo la ve, la línea se fue a la izquierda: gira a la izquierda (y al revés).',
    ],
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
    id: 'seguidor-velocidad',
    nombre: 'Seguidor de velocidad (competencia)',
    descripcion: 'El seguidor de línea en modo carrera: tres vueltas contra el reloj en la pista de curvas. Acelera en las rectas y frena para las curvas.',
    dificultad: 'intermedio',
    logica: [
      'Presiona «Compilar y ejecutar»: arranca el cronómetro y cuenta cada vuelta.',
      'Mientras la línea sigue entre los sensores (una recta), acelera poco a poco hasta RAPIDO.',
      'Cuando un sensor toca la línea, corrige girando y vuelve a la velocidad BASE para no pasarse en la curva.',
      'Si se aleja de la línea más de 1 s, la vuelta se anula y vuelve a la salida.',
      'Desafío: ajusta BASE, RAPIDO, GIRO y ACELERA hasta lograr tu mejor tiempo sin salirte.',
    ],
    arena: 'circuito-velocidad',
    construir: () => { const d = construirSeguidor(); const { tabla } = autocablear(d); return { ...d, nombre: 'Seguidor de velocidad', programa: { modo: 'codigo', cpp: codigoSeguidorVelocidad(tabla, d) } } },
    plantillas: (doc, tabla) => [
      { id: 'velocidad', nombre: 'Seguidor de velocidad', descripcion: 'Acelera en las rectas, frena para las curvas', codigo: codigoSeguidorVelocidad(tabla, doc) },
      { id: 'seguidor', nombre: 'Seguidor de línea básico', descripcion: 'Para comparar tiempos', codigo: codigoSeguidor(tabla, doc) },
    ],
  },
  {
    id: 'evita-obstaculos',
    nombre: 'Evita obstáculos',
    descripcion: 'Un ultrasonido sobre un servo mira adelante y a los lados para esquivar cajas y paredes.',
    dificultad: 'intermedio',
    logica: [
      'Avanza midiendo con el ultrasonido: 58 µs de eco = 1 cm.',
      'Si algo está a menos de 25 cm: frena y retrocede un poco.',
      'Gira el servo para mirar a la izquierda y a la derecha, y se va hacia el lado con más espacio.',
    ],
    arena: 'campo-libre',
    construir: construirEvitaObstaculos,
    plantillas: (doc, tabla) => [
      { id: 'evita', nombre: 'Evita obstáculos', descripcion: 'Avanza, frena, mira a los lados y gira', codigo: codigoEvita(tabla, doc) },
      { id: 'radar', nombre: 'Radar', descripcion: 'El servo barre y mide distancias', codigo: codigoLecturaUltrasonido(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
      { id: 'blink', nombre: 'Blink (LED 13)', descripcion: 'Primer programa', codigo: BLINK },
    ],
  },
  {
    id: 'anticaida',
    nombre: 'No me caigo de la mesa',
    descripcion: 'Explora una mesa sin caerse: los sensores de piso detectan el borde.',
    dificultad: 'inicial',
    logica: [
      'Los sensores de piso ven la mesa (LOW). Pasado el borde no vuelve luz: dan HIGH.',
      'Mientras los dos vean mesa, avanza.',
      'Si uno ve el borde: retrocede y gira hacia el otro lado, un poco al azar para no repetir el camino.',
    ],
    arena: 'mesa',
    construir: construirAnticaida,
    plantillas: (doc, tabla) => [
      { id: 'anticaida', nombre: 'No me caigo', descripcion: 'Detecta el borde y vuelve', codigo: codigoAnticaida(tabla, doc) },
      { id: 'sensores', nombre: 'Lectura de sensores', descripcion: 'Valores de los IR en el Monitor Serie', codigo: codigoLecturaLinea(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'seguidor-freno',
    nombre: 'Seguidor con freno',
    descripcion: 'Sigue la línea y frena solo si algo se cruza en el camino.',
    dificultad: 'intermedio',
    logica: [
      'Sigue la línea igual que el seguidor básico.',
      'Cada 60 ms mide adelante con el ultrasonido (sin dejar de corregir).',
      'Si hay algo a menos de 15 cm: se detiene y parpadea el LED 13 hasta que el camino quede libre.',
    ],
    arena: 'ovalo-barrera',
    construir: construirSeguidorFreno,
    plantillas: (doc, tabla) => [
      { id: 'seguidor-freno', nombre: 'Seguidor con freno', descripcion: 'Línea + ultrasonido', codigo: codigoSeguidorFreno(tabla, doc) },
      { id: 'seguidor', nombre: 'Seguidor sin freno', descripcion: 'Para comparar: choca con la barrera', codigo: codigoSeguidor(tabla, doc) },
    ],
  },
  {
    id: 'explorador',
    nombre: 'Explorador 4WD',
    descripcion: 'Cuatro ruedas de tracción y tres "ojos": dos IR en las esquinas y un ultrasonido al frente.',
    dificultad: 'intermedio',
    logica: [
      'Los IR FC-51 dan LOW cuando algo está cerca de una esquina.',
      'Si algo aparece a un costado, curva hacia el otro lado sin frenar.',
      'Si el ultrasonido ve algo a menos de 30 cm (o los dos IR se activan): retrocede y gira hacia el lado libre.',
      'Si se bloquea 3 veces seguidas, está en un rincón: retrocede más y da media vuelta.',
    ],
    arena: 'campo-explorador',
    construir: construirExplorador,
    plantillas: (doc, tabla) => [
      { id: 'explorador', nombre: 'Explorador', descripcion: 'IR laterales + ultrasonido', codigo: codigoExplorador(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'laberinto',
    nombre: 'Resuelve laberintos',
    descripcion: 'Sale de un laberinto siguiendo siempre la pared de la derecha.',
    dificultad: 'avanzado',
    logica: [
      'Regla de la mano derecha: si caminas tocando la pared derecha, llegas a la salida.',
      'Si hay pared adelante: gira a la izquierda sin avanzar.',
      'Si siente la pared a la derecha: avanza abriéndose un poco; si la pierde: curva a la derecha para buscarla.',
    ],
    arena: 'laberinto',
    construir: construirLaberinto,
    plantillas: (doc, tabla) => [
      { id: 'laberinto', nombre: 'Mano derecha', descripcion: 'Sigue la pared derecha', codigo: codigoLaberinto(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'seguidor-esp32',
    nombre: 'Seguidor de línea con ESP32',
    descripcion: 'El mismo seguidor, con la placa ESP32 de los kits de BGU (lógica de 3,3 V, PWM en cualquier GPIO).',
    dificultad: 'intermedio',
    logica: [
      'Igual que el seguidor con Arduino: los sensores dan HIGH sobre la línea negra.',
      'Los pines se llaman por su número de GPIO (por ejemplo GPIO14 → 14 en el código).',
      'Los sensores se alimentan con 3V3: el ESP32 no soporta 5 V en sus pines.',
    ],
    arena: 'ovalo',
    construir: construirSeguidorEsp32,
    plantillas: (doc, tabla) => [
      { id: 'seguidor', nombre: 'Seguidor de línea (ESP32)', descripcion: 'Lógica sí/no con los sensores digitales', codigo: codigoSeguidor(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
      { id: 'sensores', nombre: 'Lectura de sensores', descripcion: 'Valores de los IR en el Monitor Serie', codigo: codigoLecturaLinea(tabla, doc) },
    ],
  },
  {
    id: 'rc-esp32',
    nombre: 'Robot RC por Bluetooth (ESP32)',
    descripcion: 'Manéjalo con el control en pantalla, el teclado o un control de videojuego: el ESP32 recibe las órdenes por Bluetooth.',
    dificultad: 'inicial',
    logica: [
      'El control envía una letra por Bluetooth: F, B, L, R o S.',
      'El programa lee cada letra con SerialBT.read() y mueve los motores.',
      'Un número del 0 al 9 cambia la velocidad.',
    ],
    arena: 'campo-libre',
    construir: construirRcEsp32,
    plantillas: (doc, tabla) => [
      { id: 'rc', nombre: 'Radiocontrol Bluetooth', descripcion: 'Obedece letras F B L R S', codigo: codigoRc(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'minisumo',
    nombre: 'Minisumo autónomo',
    descripcion: 'Pelea solo, con su programa y sus sensores. Robot de 10 × 10 cm con pala de acero, micromotores N20 y Arduino Nano, contra un rival de práctica en el dohyo: gana quien saque al otro (2 de 3 rondas).',
    dificultad: 'intermedio',
    tema: tema('la Aula 38 (sumô)'),
    logica: [
      'Espera 5 s quieto al empezar cada ronda (reglamento).',
      'Si un sensor de abajo ve el borde blanco: retrocede un poco y gira en el lugar hacia el centro.',
      'Si el ultrasonido ve al rival a menos de 60 cm: ¡ataca a fondo! Y sigue empujando 0,4 s aunque deje de verlo (pegado al rival el ultrasonido no mide).',
      'Mientras empuja, corrige hacia el lado donde el IR ve al rival para pegarle de frente.',
      'Si lo ve un IR de costado, gira hacia ese lado; si no ve nada, busca girando.',
    ],
    arena: 'dohyo-minisumo',
    construir: () => construirMinisumo(),
    plantillas: (doc, tabla) => [
      { id: 'minisumo', nombre: 'Minisumo (buscar y atacar)', descripcion: 'Espera, busca, ataca y evita el borde', codigo: codigoMinisumo(tabla, doc) },
      { id: 'sensores', nombre: 'Prueba de sensores', descripcion: 'Distancia, IR y borde en el Monitor Serie', codigo: codigoLecturaMinisumo(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'minisumo-esp32',
    nombre: 'Minisumo autónomo ESP32 (dos pisos)',
    descripcion: 'El minisumo autónomo con ESP32. La placa y el driver van en el piso de arriba, sobre separadores de latón, y abajo quedan la batería y los sensores.',
    dificultad: 'avanzado',
    logica: [
      'El mismo programa del minisumo: espera 5 s, busca girando, ataca y evita el borde.',
      'Abajo: motores N20, LiPo 2S, el ultrasonido al frente (a la altura del rival), dos FC-51 en las esquinas y dos TCRT5000 mirando el piso.',
      'Arriba, sobre separadores de 24 mm: el ESP32 y el driver TB6612.',
      'Prueba a cambiar el TB6612 por un L298N: también cabe arriba, pero pierde 2 V (los N20 reciben 5,4 V en vez de 6,9 V), empuja menos y no saca al rival.',
      'Con dos pilas 18650 no cabe el ultrasonido abajo, y arriba su haz pasaría por encima de un rival bajo: por eso los minisumos usan LiPo.',
    ],
    arena: 'dohyo-minisumo',
    construir: construirMinisumoEsp32,
    plantillas: (doc, tabla) => [
      { id: 'minisumo', nombre: 'Minisumo (buscar y atacar)', descripcion: 'Espera, busca, ataca y evita el borde', codigo: codigoMinisumo(tabla, doc) },
      { id: 'sensores', nombre: 'Prueba de sensores', descripcion: 'Distancia, IR y borde en el Monitor Serie', codigo: codigoLecturaMinisumo(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'minisumo-rc',
    nombre: 'Minisumo RC',
    descripcion: 'El minisumo que manejas tú con el teclado de la compu: flechas o WASD. Sin sensores, con ESP32. Pelea contra el rival de práctica en el dohyo.',
    dificultad: 'inicial',
    logica: [
      'Presiona «Compilar y ejecutar»: empieza el combate y aparece el control remoto.',
      'Espera la cuenta de 5 s: hasta que termine, el robot no obedece, para que no haya salida en falso.',
      'Maneja con las flechas o WASD. Dos teclas a la vez hacen una curva, y Espacio frena.',
      'Las teclas 0 a 9 cambian la velocidad. Empuja de frente con la pala para levantar al rival.',
    ],
    arena: 'dohyo-minisumo',
    construir: construirMinisumoRc,
    plantillas: (doc, tabla) => [
      { id: 'rc', nombre: 'Manejar con el teclado (RC)', descripcion: 'Obedece las letras del control', codigo: codigoRc(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'warbot-tambor',
    nombre: 'Robot de combate con tambor',
    descripcion: 'Un beetle de competencia de verdad: chasis blindado de aluminio, horquillas de acero y un tambor de 250 g que gira a 7000 rpm y lanza al rival por el aire. Lo manejas tú.',
    dificultad: 'intermedio',
    logica: [
      'Presiona «Compilar y ejecutar»: empieza el combate (2 minutos) y aparece el control remoto.',
      'Maneja con las flechas o WASD; la tecla E (o «Encender arma») hace girar el tambor.',
      'El tambor gira de pie: su frente sube, así que golpea al rival por abajo y lo levanta.',
      'Guarda energía al girar (½·I·ω²): un golpe a fondo le quita unos 20 de vida. Después pierde velocidad: aléjate y vuelve a cargar.',
      'KO si el rival se queda sin vida, cae al pozo o pasa 10 s sin moverse (por ejemplo, dado vuelta).',
    ],
    arena: 'arena-combate',
    construir: () => construirWarbot('tambor'),
    plantillas: (doc, tabla) => [
      { id: 'rc', nombre: 'Manejar con el teclado (RC)', descripcion: 'Flechas para moverse, X/Y para el arma', codigo: codigoBattlebotRc(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'warbot-disco',
    nombre: 'Robot de combate con disco vertical',
    descripcion: 'Un beetle con un disco de acero de 110 mm que gira de pie en el centro. Más lento que el tambor, pero con la masa lejos del eje: cada golpe pega fuerte. Lo manejas tú.',
    dificultad: 'intermedio',
    logica: [
      'Presiona «Compilar y ejecutar» y enciende el disco con la tecla E.',
      'El disco tarda más que el tambor en llegar a toda velocidad (≈ 1,4 s): enciéndelo antes de acercarte.',
      'Compara: el disco gira a 3500 rpm y el tambor a 7000, pero el disco guarda más energía porque su masa está más lejos del eje (I = ½·m·r²).',
      'Ataca de frente: el disco golpea solo lo que tiene delante, por eso hay que apuntar bien.',
    ],
    arena: 'arena-combate',
    construir: () => construirWarbot('disco'),
    plantillas: (doc, tabla) => [
      { id: 'rc', nombre: 'Manejar con el teclado (RC)', descripcion: 'Flechas para moverse, X/Y para el arma', codigo: codigoBattlebotRc(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  {
    id: 'warbot-auto',
    nombre: 'Robot de combate autónomo (tambor)',
    descripcion: 'El robot de tambor, pero piensa solo: sale al centro, busca con el ultrasonido, ataca con el tambor a fondo y retrocede para volver a cargar.',
    dificultad: 'avanzado',
    logica: [
      'Espera los 3 s de la cuenta, enciende el tambor y sale de la esquina hacia el centro.',
      'Gira en el lugar midiendo la distancia con el HC-SR04.',
      'Si algo está a menos de 1,15 m (desde el centro, las paredes están más lejos), avanza a fondo 0,7 s y retrocede 0,4 s.',
      'Problema para pensar: el ultrasonido también ve las paredes. ¿Cómo distinguirías al rival?',
    ],
    arena: 'arena-combate',
    construir: () => construirWarbot('tambor', 'uhmw', 'Tambor autónomo', true),
    plantillas: (doc, tabla) => [
      { id: 'auto', nombre: 'Buscar y atacar', descripcion: 'Ultrasonido + tambor a fondo', codigo: codigoBattlebotAuto(tabla, doc) },
      { id: 'rc', nombre: 'Manejar con el teclado (RC)', descripcion: 'Flechas para moverse, X/Y para el arma', codigo: codigoBattlebotRc(tabla, doc) },
    ],
  },
  {
    id: 'evita-ir',
    nombre: 'Evita obstáculos IR',
    descripcion: 'El evita obstáculos más simple: dos sensores infrarrojos FC-51 al frente, sin servo ni ultrasonido. Ideal para empezar.',
    dificultad: 'inicial',
    logica: [
      'Cada FC-51 da LOW cuando tiene algo cerca.',
      'Si ninguno ve nada, avanza.',
      'Si lo ve el izquierdo, gira a la derecha (y al revés).',
      'Si los dos lo ven, hay una pared al frente: retrocede y da media vuelta.',
    ],
    arena: 'campo-libre',
    construir: construirEvitaIr,
    plantillas: (doc, tabla) => [
      { id: 'evita-ir', nombre: 'Evita obstáculos (2 IR)', descripcion: 'Avanza y esquiva con los FC-51', codigo: codigoEvitaIr(tabla, doc) },
      { id: 'sensores', nombre: 'Prueba de los IR', descripcion: 'Qué ve cada sensor en el Monitor Serie', codigo: codigoLecturaIr(tabla, doc) },
      { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) },
    ],
  },
  ...PROYECTOS_CIRCUITO,
  ...PROYECTOS_AULAS,
  ...PROYECTOS_RPI(construirSeguidor),
]

/** Las del proyecto primero; después, las genéricas y los ejemplos de cada pieza del robot. */
export function plantillasDe(doc: RobotDoc, prearmado: string | null): PlantillaCodigo[] {
  const { tabla } = autocablear(doc, { conservar: true })
  const pre = PREARMADOS.find(p => p.id === prearmado)
  const propias = pre ? pre.plantillas(doc, tabla) : []
  return [...propias, ...plantillasGenericas(doc, tabla).filter(g => !propias.some(x => x.id === g.id))]
}

/**
 * Al cambiar una pieza pueden cambiar los pines. Si el programa es una plantilla sin
 * tocar, se rehace con los pines nuevos. Si el alumno ya la editó no se toca su código:
 * `desactualizado` avisa que sus pines pueden haber quedado viejos.
 */
export function programaConPinesNuevos(antes: RobotDoc, despues: RobotDoc, prearmado: string | null): { doc: RobotDoc; desactualizado: boolean } {
  const cpp = despues.programa.cpp
  if (despues.programa.modo !== 'codigo' || !cpp.trim()) return { doc: despues, desactualizado: false }
  const previa = plantillasDe(antes, prearmado).find(p => p.codigo === cpp)
  const nueva = previa && plantillasDe(despues, prearmado).find(p => p.id === previa.id)
  if (nueva) return { doc: { ...despues, programa: { modo: 'codigo', cpp: nueva.codigo } }, desactualizado: false }
  const pines = (d: RobotDoc) => JSON.stringify(autocablear(d, { conservar: true }).tabla)
  return { doc: despues, desactualizado: pines(antes) !== pines(despues) }
}

/** Plantillas genéricas para un robot armado desde cero. */
export function plantillasGenericas(doc: RobotDoc, tabla: FilaPin[]): PlantillaCodigo[] {
  if (esBanco(doc)) return plantillasCircuito(doc, tabla)
  const out: PlantillaCodigo[] = []
  if (driverDe(doc)) {
    out.push({ id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) })
    out.push({ id: 'rc', nombre: 'Manejar con el teclado (RC)', descripcion: 'Obedece las letras del control', codigo: codigoRc(tabla, doc) })
  }
  if (doc.piezas.some(p => p.padre?.montaje === 'piso-izq') && doc.piezas.some(p => p.padre?.montaje === 'piso-der')) {
    out.push({ id: 'seguidor', nombre: 'Seguidor de línea', descripcion: 'Con los sensores de piso', codigo: codigoSeguidor(tabla, doc) })
  }
  if (doc.piezas.some(p => p.pieza === 'hcsr04') && doc.piezas.some(p => p.pieza === 'sg90' || p.pieza === 'mg90s')) {
    out.push({ id: 'evita', nombre: 'Evita obstáculos', descripcion: 'Ultrasonido sobre servo', codigo: codigoEvita(tabla, doc) })
  }
  if (doc.piezas.some(p => p.pieza === 'chasis-minisumo')) {
    out.push({ id: 'minisumo', nombre: 'Minisumo (buscar y atacar)', descripcion: 'Espera, busca, ataca y evita el borde', codigo: codigoMinisumo(tabla, doc) })
  }
  out.push(...ejemplosPorPieza(doc, tabla))
  out.push({ id: 'blink', nombre: 'Blink (LED 13)', descripcion: 'Primer programa', codigo: BLINK })
  return out
}

/**
 * Un ejemplo corto para cada sensor y servo conectado: el alumno ve cómo se
 * lee o se mueve esa pieza con los pines de SU robot (Monitor Serie).
 */
export function ejemplosPorPieza(doc: RobotDoc, tabla: FilaPin[]): PlantillaCodigo[] {
  const out: PlantillaCodigo[] = []
  const pin = (inst: string, p: string) => pinDePlaca(tabla, inst, p)
  const nombre = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')
  for (const p of doc.piezas) {
    const c = pieza(p.pieza).comportamiento
    if (c.tipo === 'ultrasonido') {
      const trig = pin(p.id, 'TRIG'), echo = pin(p.id, 'ECHO')
      if (!trig || !echo) continue
      out.push({
        id: `leer-${p.id}`, nombre: `Leer: ${p.etiqueta}`, descripcion: 'Distancia en cm en el Monitor Serie',
        codigo: `// ${p.etiqueta}: muestra la distancia en el Monitor Serie.
const int TRIG = ${pinCodigo(trig)};
const int ECHO = ${pinCodigo(echo)};

${MEDIR_CM}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.print("Distancia: ");
  Serial.print(medirCm());
  Serial.println(" cm");
  delay(200);
}
`,
      })
    } else if (c.tipo === 'ir-reflectivo') {
      const d = pin(p.id, 'DO'), a = pin(p.id, 'AO')
      if (!d && !a) continue
      const n = nombre(p.etiqueta)
      out.push({
        id: `leer-${p.id}`, nombre: `Leer: ${p.etiqueta}`, descripcion: 'Negro o blanco debajo del sensor',
        codigo: `// ${p.etiqueta}: dice si debajo hay negro (línea) o blanco.
${d ? `const int ${n} = ${pinCodigo(d)};   // DO: HIGH = negro
` : ''}${a ? `const int ${n}_A = ${pinCodigo(a)};  // AO: más alto = más oscuro
` : ''}
void setup() {
${d ? `  pinMode(${n}, INPUT);
` : ''}  Serial.begin(9600);
}

void loop() {
${d ? `  Serial.print(digitalRead(${n}) == HIGH ? "negro" : "blanco");
` : ''}${a ? `  Serial.print("  valor: ");
  Serial.print(analogRead(${n}_A));
` : ''}  Serial.println();
  delay(200);
}
`,
      })
    } else if (c.tipo === 'ir-obstaculo') {
      const o = pin(p.id, 'OUT')
      if (!o) continue
      const n = nombre(p.etiqueta)
      out.push({
        id: `leer-${p.id}`, nombre: `Leer: ${p.etiqueta}`, descripcion: '¿Hay algo cerca?',
        codigo: `// ${p.etiqueta}: avisa si hay algo adelante (LOW = hay obstáculo).
const int ${n} = ${pinCodigo(o)};

void setup() {
  pinMode(${n}, INPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.println(digitalRead(${n}) == LOW ? "hay algo" : "libre");
  delay(200);
}
`,
      })
    } else if (c.tipo === 'servo') {
      const sig = pin(p.id, 'SIG')
      if (!sig) continue
      out.push({
        id: `mover-${p.id}`, nombre: `Mover: ${p.etiqueta}`, descripcion: 'De 0° a 180° y de vuelta',
        codigo: `// ${p.etiqueta}: barre de 0° a 180° y vuelve, de a 10°.
#include <Servo.h>

Servo servo;

void setup() {
  servo.attach(${pinCodigo(sig)});
  Serial.begin(9600);
}

void loop() {
  for (int a = 0; a <= 180; a += 10) { servo.write(a); Serial.println(a); delay(150); }
  for (int a = 180; a >= 0; a -= 10) { servo.write(a); Serial.println(a); delay(150); }
}
`,
      })
    }
  }
  return out
}
