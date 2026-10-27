// Robot evita obstáculos: avanza mirando con el ultrasonido.
// Si algo está cerca, retrocede, gira el "cuello" (servo) para mirar a cada
// lado y se va hacia donde haya más espacio.
#include <Servo.h>

const int TRIG = 12;
const int ECHO = 11;
const int SERVO_PIN = 3;

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

const int VELOCIDAD = 160;
const int DISTANCIA_MINIMA = 25;   // cm

Servo cuello;

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

// Gira el cuello, espera a que llegue y mide
long mirar(int angulo) {
  cuello.write(angulo);
  delay(350);
  return medirCm();
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
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
