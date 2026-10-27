// Resuelve laberintos con la "regla de la mano derecha":
// si caminas tocando siempre la pared derecha, tarde o temprano sales.
//  - Un sensor IR (FC-51) mira adelante-derecha: LOW = la pared está cerca.
//  - El ultrasonido mira al frente.
// Lógica:
//   1. Pared adelante  -> girar a la izquierda sin avanzar.
//   2. Pared a la derecha -> avanzar abriéndose un poco a la izquierda.
//   3. Sin pared a la derecha -> curvar a la derecha para buscarla.

const int IR_DER = 2;
const int TRIG = 12;
const int ECHO = 11;

const int ENA = 5, IN1 = 7, IN2 = 8;   // motores del lado izquierdo
const int ENB = 6, IN3 = 9, IN4 = 10;   // motores del lado derecho

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
}

// Mide la distancia en cm con el HC-SR04 (400 si no hay eco)
long medirCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);      // pulso de 10 µs = "dispara"
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);  // cuánto dura el eco (máx. 30 ms)
  if (us == 0) return 400;               // sin eco: nada adelante
  return us / 58;                        // 58 µs por cada cm (ida y vuelta)
}

void setup() {
  pinMode(IR_DER, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
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
