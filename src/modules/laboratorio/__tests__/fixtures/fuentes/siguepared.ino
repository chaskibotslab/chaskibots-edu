// Sigue paredes: recorre la sala sin separarse de la pared de su derecha.
//  - El ultrasonido mira en diagonal, adelante y a la derecha: mide qué tan
//    lejos está la pared.
//  - Un sensor IR (FC-51) mira al frente: LOW = hay una pared adelante.
// Lógica:
//   1. Pared adelante o encima -> girar a la izquierda sin avanzar.
//   2. Pared demasiado cerca   -> abrirse a la izquierda.
//   3. Pared demasiado lejos   -> cerrarse a la derecha (así dobla las esquinas).
//   4. Distancia justa         -> seguir derecho.

const int IR_FRENTE = 2;
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

const int CERCA = 22;   // cm: menos que esto, se abre
const int LEJOS = 32;   // cm: más que esto, se cierra
const int PEGADO = 12;  // cm: menos que esto, gira sin avanzar

void setup() {
  pinMode(IR_FRENTE, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long pared = medirCm();

  if (digitalRead(IR_FRENTE) == LOW || pared < PEGADO) {
    motores(-150, 150);          // pared adelante (o encima): giro a la izquierda
    delay(100);
  } else if (pared < CERCA) {
    motores(80, 170);            // muy cerca: me abro
  } else if (pared > LEJOS) {
    motores(170, 128);           // muy lejos: me cierro
  } else {
    motores(160, 160);           // distancia justa
  }
  delay(20);
}
