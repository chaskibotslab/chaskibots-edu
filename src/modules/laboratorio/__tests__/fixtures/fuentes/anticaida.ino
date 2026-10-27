// Robot que no se cae de la mesa.
// Los sensores IR de abajo miran la mesa. Si uno deja de ver piso (pasa el
// borde), el sensor da HIGH, igual que con la línea negra: no vuelve luz.
// Entonces el robot frena, retrocede y gira hacia el lado contrario.

const int IR_IZQ = 2;   // sensor de piso izquierdo
const int IR_DER = 3;   // sensor de piso derecho

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

const int VELOCIDAD = 140;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  Serial.println("Explorando la mesa...");
}

void loop() {
  bool bordeIzq = digitalRead(IR_IZQ) == HIGH;   // HIGH = no hay piso
  bool bordeDer = digitalRead(IR_DER) == HIGH;

  if (!bordeIzq && !bordeDer) {
    motores(VELOCIDAD, VELOCIDAD);   // todo bien: seguir explorando
    return;
  }

  // ¡Borde! Frenar, retroceder y girar hacia el lado que todavía tiene mesa.
  Serial.println(bordeIzq ? "Borde a la izquierda" : "Borde a la derecha");
  motores(-150, -150);
  delay(350);
  if (bordeIzq) motores(160, -160);   // girar a la derecha
  else motores(-160, 160);            // girar a la izquierda
  delay(300 + random(300));           // un poco al azar para no repetir el camino
  motores(0, 0);
}
