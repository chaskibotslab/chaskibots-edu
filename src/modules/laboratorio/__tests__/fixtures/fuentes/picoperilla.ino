// Raspberry Pi Pico: la perilla (en GP26 = A0) regula el brillo del LED.
// El ADC de la Pico es de 12 bits: con analogReadResolution(12) lee de 0 a 4095.
const int PERILLA = A0;   // GP26
const int LED = 15;       // en la Pico todos los GP tienen PWM

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  pinMode(LED, OUTPUT);
}

void loop() {
  int lectura = analogRead(PERILLA);          // 0 a 4095
  int brillo = map(lectura, 0, 4095, 0, 255);
  analogWrite(LED, brillo);
  Serial.print("Perilla: ");
  Serial.print(lectura);
  Serial.print("  voltaje: ");
  Serial.println(lectura * 3.3 / 4095);
  delay(100);
}
