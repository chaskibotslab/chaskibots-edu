/*
  Basurero inteligente con apertura automatica
  Kit 9no EGB - Arduino Nano V3
  Academia Militar Lizardo Alfonzo Villamarin

  Un sensor ultrasonico mide la distancia a la mano o al objeto. Si
  esta lo bastante cerca, el servomotor abre la tapa y un LED
  parpadea para confirmar (este kit no incluye buzzer: la
  confirmacion es visual).
*/

#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int LED_TAPA = 8;

const int DISTANCIA_APERTURA_CM = 15;
const int ANGULO_CERRADO = 0;
const int ANGULO_ABIERTO = 90;
const unsigned long TIEMPO_ABIERTA_MS = 3000;

Servo tapa;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_TAPA, OUTPUT);
  tapa.attach(SERVO_PIN);
  tapa.write(ANGULO_CERRADO);
  Serial.begin(9600);
}

void loop() {
  long distancia = medirDistanciaCm();
  if (distancia > 0 && distancia <= DISTANCIA_APERTURA_CM) {
    abrirTapa();
  }
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}

void abrirTapa() {
  tapa.write(ANGULO_ABIERTO);
  parpadearConfirmacion();
  delay(TIEMPO_ABIERTA_MS);
  tapa.write(ANGULO_CERRADO);
  digitalWrite(LED_TAPA, LOW);
  delay(500);
}

void parpadearConfirmacion() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_TAPA, HIGH);
    delay(100);
    digitalWrite(LED_TAPA, LOW);
    delay(100);
  }
  digitalWrite(LED_TAPA, HIGH);
}
