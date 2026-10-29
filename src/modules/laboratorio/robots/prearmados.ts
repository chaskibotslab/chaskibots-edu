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

function codigoRc(tabla: FilaPin[], doc: RobotDoc) {
  return `// Robot de radiocontrol por Bluetooth (ESP32).
// El ESP32 tiene Bluetooth: desde el celular (o el control en pantalla del
// laboratorio) llegan letras y el robot obedece:
//   F = adelante   B = atrás   L = izquierda   R = derecha   S = parar
//   0–9 = velocidad (0 = lenta, 9 = máxima)
#include <BluetoothSerial.h>

BluetoothSerial SerialBT;

${bloqueMotores(tabla, doc)}

int velocidad = 200;   // 0 a 255

void setup() {
  ${SETUP_MOTORES}
  Serial.begin(115200);
  SerialBT.begin("RobotChaski");   // nombre que verás en el celular
  Serial.println("Listo: conéctate a RobotChaski por Bluetooth");
}

void loop() {
  if (!SerialBT.available()) return;
  char c = SerialBT.read();

  if (c >= '0' && c <= '9') {            // un número cambia la velocidad
    velocidad = map(c - '0', 0, 9, 90, 255);
    return;
  }
  switch (c) {
    case 'F': motores(velocidad, velocidad); break;
    case 'B': motores(-velocidad, -velocidad); break;
    case 'L': motores(-velocidad / 2, velocidad); break;
    case 'R': motores(velocidad, -velocidad / 2); break;
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

export const PREARMADOS: Prearmado[] = [
  {
    id: 'seguidor',
    nombre: 'Seguidor de línea',
    descripcion: 'Dos sensores IR miran el piso y el robot corrige para no salirse de la cinta negra.',
    dificultad: 'inicial',
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
    nombre: 'Minisumo',
    descripcion: 'Robot de 10 × 10 cm con pala de acero, micromotores N20 y Arduino Nano. Pelea contra un rival de práctica en el dohyo: gana quien saque al otro (2 de 3 rondas).',
    dificultad: 'intermedio',
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
  ...PROYECTOS_CIRCUITO,
]

/** Plantillas genéricas para un robot armado desde cero. */
export function plantillasGenericas(doc: RobotDoc, tabla: FilaPin[]): PlantillaCodigo[] {
  if (esBanco(doc)) return plantillasCircuito(doc, tabla)
  const out: PlantillaCodigo[] = []
  if (driverDe(doc)) out.push({ id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: codigoPruebaMotores(tabla, doc) })
  if (doc.piezas.some(p => p.padre?.montaje === 'piso-izq') && doc.piezas.some(p => p.padre?.montaje === 'piso-der')) {
    out.push({ id: 'seguidor', nombre: 'Seguidor de línea', descripcion: 'Con los sensores de piso', codigo: codigoSeguidor(tabla, doc) })
  }
  if (doc.piezas.some(p => p.pieza === 'hcsr04') && doc.piezas.some(p => p.pieza === 'sg90' || p.pieza === 'mg90s')) {
    out.push({ id: 'evita', nombre: 'Evita obstáculos', descripcion: 'Ultrasonido sobre servo', codigo: codigoEvita(tabla, doc) })
  }
  out.push({ id: 'blink', nombre: 'Blink (LED 13)', descripcion: 'Primer programa', codigo: BLINK })
  return out
}
