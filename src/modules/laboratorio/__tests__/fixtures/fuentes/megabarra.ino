// Arduino Mega: barra de 7 LEDs que sube con la perilla.
// Usa los pines que el UNO no tiene: D22–D28 y la entrada analógica A8.
const int PERILLA = A8;
const int PRIMER_LED = 22;
const int CANTIDAD = 7;

void setup() {
  for (int i = 0; i < CANTIDAD; i++) pinMode(PRIMER_LED + i, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lectura = analogRead(PERILLA);                  // 0 a 1023
  int encendidos = map(lectura, 0, 1023, 0, CANTIDAD);
  for (int i = 0; i < CANTIDAD; i++) {
    digitalWrite(PRIMER_LED + i, i < encendidos ? HIGH : LOW);
  }
  Serial.print("LEDs encendidos: ");
  Serial.println(encendidos);
  delay(50);
}
