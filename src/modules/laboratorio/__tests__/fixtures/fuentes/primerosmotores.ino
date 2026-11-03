// Mis primeros motores: el robot dibuja un cuadrado.
// No tiene sensores: avanza y gira durante un tiempo fijo (con delay).
// Ajusta GIRO_MS hasta que cada giro sea de 90°: depende de la batería y del piso.
const int ENA = 5, IN1 = 7, IN2 = 8;   // motores del lado izquierdo
const int ENB = 6, IN3 = 9, IN4 = 10;   // motores del lado derecho

// Velocidad de cada lado: de -255 (atrás) a 255 (adelante)
void motores(int izq, int der) {
  izq = constrain(izq, -255, 255);
  der = constrain(der, -255, 255);
  digitalWrite(IN1, izq >= 0 ? HIGH : LOW);
  digitalWrite(IN2, izq >= 0 ? LOW : HIGH);
  analogWrite(ENA, abs(izq));
  digitalWrite(IN3, der >= 0 ? HIGH : LOW);
  digitalWrite(IN4, der >= 0 ? LOW : HIGH);
  analogWrite(ENB, abs(der));
}

const int VELOCIDAD = 180;
const int AVANCE_MS = 1200;   // cuánto avanza en cada lado
const int GIRO_MS = 250;      // cuánto gira en cada esquina

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  delay(1000);
}

void loop() {
  for (int lado = 1; lado <= 4; lado++) {
    Serial.print("Lado ");
    Serial.println(lado);
    motores(VELOCIDAD, VELOCIDAD);    // adelante
    delay(AVANCE_MS);
    motores(0, 0);
    delay(200);
    motores(-VELOCIDAD, VELOCIDAD);   // girar a la izquierda en el lugar
    delay(GIRO_MS);
    motores(0, 0);
    delay(200);
  }
  Serial.println("¡Cuadrado listo!");
  delay(2000);
}
