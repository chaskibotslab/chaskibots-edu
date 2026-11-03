// Sensor de estacionamiento: mientras más cerca, más rápido suena y más luces.
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
