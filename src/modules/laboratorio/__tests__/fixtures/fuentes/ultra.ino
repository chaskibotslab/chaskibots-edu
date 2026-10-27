// Prueba: mide con el HC-SR04 (TRIG 12, ECHO 11) y lo imprime
const int TRIG = 12, ECHO = 11;
void setup() { pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); Serial.begin(115200); }
void loop() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  Serial.println(us / 58);
  delay(50);
}
