// La perilla regula el brillo del LED (PWM).
const int PERILLA = A0;
const int LED = 9;   // pin con ~: puede dar PWM

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lectura = analogRead(PERILLA);        // 0 a 1023
  int brillo = map(lectura, 0, 1023, 0, 255);
  analogWrite(LED, brillo);                 // 0 a 255
  Serial.print("Perilla: ");
  Serial.print(lectura);
  Serial.print("  brillo: ");
  Serial.println(brillo);
  delay(100);
}
