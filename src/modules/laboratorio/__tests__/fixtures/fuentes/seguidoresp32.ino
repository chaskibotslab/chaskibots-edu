// Robot seguidor de línea con 2 sensores IR y driver L298N
// Los sensores TCRT5000 dan HIGH (1) sobre la línea negra y LOW (0) sobre blanco.

const int IR_IZQ = 4;   // sensor izquierdo  (DO)
const int IR_DER = 16;   // sensor derecho    (DO)

const int ENA = 14, IN1 = 27, IN2 = 26;   // motores del lado izquierdo
const int ENB = 32, IN3 = 25, IN4 = 33;   // motores del lado derecho

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

const int VELOCIDAD = 150;   // 0 a 255
const int GIRO = 170;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Seguidor de linea listo");
}

void loop() {
  int izq = digitalRead(IR_IZQ);
  int der = digitalRead(IR_DER);

  if (izq == LOW && der == LOW) {
    motores(VELOCIDAD, VELOCIDAD);      // la línea está entre los sensores: recto
  } else if (izq == HIGH && der == LOW) {
    motores(-GIRO / 2, GIRO);           // la línea se fue a la izquierda
  } else if (izq == LOW && der == HIGH) {
    motores(GIRO, -GIRO / 2);           // la línea se fue a la derecha
  } else {
    motores(VELOCIDAD, VELOCIDAD);      // cruce: seguir recto
  }

  digitalWrite(LED_BUILTIN, izq || der);  // el LED 13 avisa cuando un sensor ve la línea
}
