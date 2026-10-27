// Prueba: el servo va a 0, 90 y 180 grados, 400 ms en cada uno
#include <Servo.h>
Servo s;
void setup() { s.attach(3); Serial.begin(115200); }
void loop() {
  s.write(0); Serial.println(0); delay(400);
  s.write(90); Serial.println(90); delay(400);
  s.write(180); Serial.println(180); delay(400);
}
