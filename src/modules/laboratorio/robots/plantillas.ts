// Plantillas de código para el robot seguidor de línea (Arduino UNO).
// Los pines coinciden con el cableado de robots/seguidorLinea.ts.

export interface Plantilla {
  id: string
  nombre: string
  descripcion: string
  codigo: string
}

export const SEGUIDOR_BASICO = `// Robot seguidor de línea con 2 sensores IR y driver L298N
// Los sensores TCRT5000 dan HIGH (1) sobre la línea negra y LOW (0) sobre blanco.

const int IR_IZQ = 2;   // sensor izquierdo  (DO)
const int IR_DER = 3;   // sensor derecho    (DO)

const int ENA = 5;      // velocidad motor izquierdo (PWM)
const int IN1 = 7;
const int IN2 = 8;
const int ENB = 6;      // velocidad motor derecho (PWM)
const int IN3 = 9;
const int IN4 = 10;

const int VELOCIDAD = 150;   // 0 a 255
const int GIRO = 170;

// Velocidad de cada motor: positivo = adelante, negativo = atrás
void motores(int izq, int der) {
  digitalWrite(IN1, izq >= 0 ? HIGH : LOW);
  digitalWrite(IN2, izq >= 0 ? LOW : HIGH);
  analogWrite(ENA, abs(izq));
  digitalWrite(IN3, der >= 0 ? HIGH : LOW);
  digitalWrite(IN4, der >= 0 ? LOW : HIGH);
  analogWrite(ENB, abs(der));
}

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
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

export const PRUEBA_MOTORES = `// Prueba de motores: adelante, giro y reversa
const int ENA = 5, IN1 = 7, IN2 = 8;
const int ENB = 6, IN3 = 9, IN4 = 10;

void motores(int izq, int der) {
  digitalWrite(IN1, izq >= 0); digitalWrite(IN2, izq < 0); analogWrite(ENA, abs(izq));
  digitalWrite(IN3, der >= 0); digitalWrite(IN4, der < 0); analogWrite(ENB, abs(der));
}

void setup() {
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
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

export const LECTURA_SENSORES = `// Leer los sensores IR por el Monitor Serial (digital y analógico)
// Mueve el robot con doble clic sobre la pista para ver cómo cambian.
void setup() {
  pinMode(2, INPUT);
  pinMode(3, INPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.print("Izq: ");
  Serial.print(digitalRead(2));
  Serial.print(" (");
  Serial.print(analogRead(A0));
  Serial.print(")   Der: ");
  Serial.print(digitalRead(3));
  Serial.print(" (");
  Serial.print(analogRead(A1));
  Serial.println(")");
  delay(300);
}
`

export const SEGUIDOR_PROPORCIONAL = `// Seguidor proporcional con los sensores analógicos (A0 y A1)
// En vez de "sí/no", mide CUÁNTO ve cada sensor la línea y corrige suave.
const int ENA = 5, IN1 = 7, IN2 = 8;
const int ENB = 6, IN3 = 9, IN4 = 10;

const int BASE = 140;
const float KP = 0.35;

void motores(int izq, int der) {
  izq = constrain(izq, -255, 255);
  der = constrain(der, -255, 255);
  digitalWrite(IN1, izq >= 0); digitalWrite(IN2, izq < 0); analogWrite(ENA, abs(izq));
  digitalWrite(IN3, der >= 0); digitalWrite(IN4, der < 0); analogWrite(ENB, abs(der));
}

void setup() {
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int izq = analogRead(A0);   // sube sobre negro
  int der = analogRead(A1);
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

export const BLINK = `// El clásico: parpadear el LED del pin 13
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

export const PLANTILLAS: Plantilla[] = [
  { id: 'seguidor', nombre: 'Seguidor de línea (2 sensores)', descripcion: 'Lógica sí/no con los sensores digitales', codigo: SEGUIDOR_BASICO },
  { id: 'proporcional', nombre: 'Seguidor proporcional', descripcion: 'Corrección suave con analogRead', codigo: SEGUIDOR_PROPORCIONAL },
  { id: 'motores', nombre: 'Prueba de motores', descripcion: 'Adelante, giro, reversa', codigo: PRUEBA_MOTORES },
  { id: 'sensores', nombre: 'Lectura de sensores', descripcion: 'Valores de los IR en el Monitor Serial', codigo: LECTURA_SENSORES },
  { id: 'blink', nombre: 'Blink (LED 13)', descripcion: 'Primer programa', codigo: BLINK },
]
