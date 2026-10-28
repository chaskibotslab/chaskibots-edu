// Prueba de la capa ESP32: LED, entrada, PWM (LEDC), servo, analogRead y Serial
#include <ESP32Servo.h>

Servo cuello;
const int LED = 2;
const int BOTON = 4;

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  pinMode(BOTON, INPUT);
  ledcAttach(25, 5000, 8);
  cuello.attach(13);
  cuello.write(45);
  Serial.println("ESP32 listo");
}

void loop() {
  digitalWrite(LED, digitalRead(BOTON));
  ledcWrite(25, 128);
  Serial.println(analogRead(34));
  delay(100);
}
