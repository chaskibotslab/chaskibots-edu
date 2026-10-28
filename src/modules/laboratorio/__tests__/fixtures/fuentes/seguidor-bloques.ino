// Programa hecho con bloques en ChaskiBots Lab

const int ENA = 5, IN1 = 7, IN2 = 8;   // motores del lado izquierdo
const int ENB = 6, IN3 = 9, IN4 = 10;   // motores del lado derecho
const int LINEA_IZQ = 2;   // sensor de línea izquierdo (DO)
const int LINEA_DER = 3;   // sensor de línea derecho (DO)

// Convierte un porcentaje (-100 a 100) en la velocidad del driver (-255 a 255)
int vel(float porcentaje) {
  return constrain(porcentaje, -100, 100) * 255 / 100;
}

// Velocidad de cada lado: positivo = adelante, negativo = atrás
void motores(int izq, int der) {
  digitalWrite(IN1, izq >= 0 ? HIGH : LOW);
  digitalWrite(IN2, izq >= 0 ? LOW : HIGH);
  analogWrite(ENA, abs(izq));
  digitalWrite(IN3, der >= 0 ? HIGH : LOW);
  digitalWrite(IN4, der >= 0 ? LOW : HIGH);
  analogWrite(ENB, abs(der));
}

void setup() {
  Serial.begin(9600);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(LINEA_IZQ, INPUT);
  pinMode(LINEA_DER, INPUT);

  // al encender
  Serial.println("Seguidor listo");
}

void loop() {
  if (digitalRead(LINEA_IZQ) == HIGH) {
    motores(vel(-33), vel(67));
  } else if (digitalRead(LINEA_DER) == HIGH) {
    motores(vel(67), vel(-33));
  } else {
    motores(vel(59), vel(59));   // avanzar
  }
}
