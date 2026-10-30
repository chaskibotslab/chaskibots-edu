// Raspberry Pi Pico: el LED de GP15 y el de la placa (GP25) se turnan.
const int LED = 15;   // en la Pico el número es el del GP

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);   // LED_BUILTIN = GP25
}

void loop() {
  digitalWrite(LED, HIGH);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
  digitalWrite(LED, LOW);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
}
