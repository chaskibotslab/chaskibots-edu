// Evita obstáculos con dos sensores IR (FC-51) al frente.
// Cada FC-51 da LOW cuando tiene algo cerca (unos 20 cm) y HIGH si no.

const int IR_IZQ = 2;
const int IR_DER = 3;

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

const int AVANCE = 160;
const int GIRO = 180;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool izq = digitalRead(IR_IZQ) == LOW;
  bool der = digitalRead(IR_DER) == LOW;

  if (izq && der) {
    // Pared al frente: retrocede un poco y da media vuelta.
    Serial.println("Obstaculo al frente");
    motores(-AVANCE, -AVANCE);
    delay(300);
    motores(GIRO, -GIRO);
    delay(450);
  } else if (izq) {
    Serial.println("Obstaculo a la izquierda");
    motores(GIRO, -GIRO);     // gira a la derecha, lejos del obstáculo
  } else if (der) {
    Serial.println("Obstaculo a la derecha");
    motores(-GIRO, GIRO);     // gira a la izquierda
  } else {
    motores(AVANCE, AVANCE);  // camino libre: adelante
  }
}
