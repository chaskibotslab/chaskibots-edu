// Con botón: el semáforo sigue en verde hasta que un peatón presiona.
const int ROJO = 8, AMARILLO = 9, VERDE = 10;
const int PEATON_ROJO = 11, PEATON_VERDE = 12;
const int BOTON = 2;

void setup() {
  for (int pin = 8; pin <= 12; pin++) pinMode(pin, OUTPUT);
  pinMode(BOTON, INPUT_PULLUP);
  digitalWrite(VERDE, HIGH);
  digitalWrite(PEATON_ROJO, HIGH);
}

void loop() {
  if (digitalRead(BOTON) == HIGH) return;   // nadie presionó: todo sigue igual

  digitalWrite(VERDE, LOW);
  digitalWrite(AMARILLO, HIGH);
  delay(1000);
  digitalWrite(AMARILLO, LOW);
  digitalWrite(ROJO, HIGH);
  digitalWrite(PEATON_ROJO, LOW);
  digitalWrite(PEATON_VERDE, HIGH);
  delay(4000);
  digitalWrite(PEATON_VERDE, LOW);
  digitalWrite(PEATON_ROJO, HIGH);
  digitalWrite(ROJO, LOW);
  digitalWrite(VERDE, HIGH);
}
