// Joystick: cuatro LEDs muestran hacia dónde mueves la palanca.
// Cada eje es un potenciómetro: al centro lee unos 512; de 0 a 1023 hacia cada lado.
const int EJE_X = A0;
const int EJE_Y = A1;
const int BOTON = 2;        // SW: va a tierra al presionar la palanca
const int ARRIBA = 8;
const int ABAJO = 9;
const int IZQUIERDA = 10;
const int DERECHA = 11;

void setup() {
  pinMode(ARRIBA, OUTPUT);
  pinMode(ABAJO, OUTPUT);
  pinMode(IZQUIERDA, OUTPUT);
  pinMode(DERECHA, OUTPUT);
  pinMode(BOTON, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  int x = analogRead(EJE_X);
  int y = analogRead(EJE_Y);
  bool presionado = digitalRead(BOTON) == LOW;   // presionado: se encienden todos

  digitalWrite(DERECHA, x > 700 || presionado);
  digitalWrite(IZQUIERDA, x < 300 || presionado);
  digitalWrite(ARRIBA, y > 700 || presionado);
  digitalWrite(ABAJO, y < 300 || presionado);

  Serial.print("X: ");
  Serial.print(x);
  Serial.print("  Y: ");
  Serial.print(y);
  Serial.println(presionado ? "  (botón)" : "");
  delay(100);
}
