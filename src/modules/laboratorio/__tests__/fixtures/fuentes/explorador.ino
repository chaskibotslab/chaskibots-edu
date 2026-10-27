// Explorador 4WD: esquiva con tres "ojos".
//  - Dos sensores IR FC-51 en las esquinas de adelante (LOW = hay algo cerca).
//  - Un ultrasonido al frente que mide la distancia.
// Lógica: si algo está adelante, retrocede y gira hacia el lado libre;
// si un IR ve algo a un costado, se aleja curvando hacia el otro lado.
// Memoria de escape: si se bloquea 3 veces seguidas (está en un rincón),
// retrocede más y da media vuelta.

const int IR_IZQ = 2;
const int IR_DER = 3;
const int TRIG = 12;
const int ECHO = 11;

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

// Mide la distancia en cm con el HC-SR04 (400 si no hay eco)
long medirCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);      // pulso de 10 µs = "dispara"
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);  // cuánto dura el eco (máx. 30 ms)
  if (us == 0) return 400;               // sin eco: nada adelante
  return us / 58;                        // 58 µs por cada cm (ida y vuelta)
}

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
}

int bloqueos = 0;                // cuántas veces seguidas se bloqueó
unsigned long ultimoBloqueo = 0;

void loop() {
  long frente = medirCm();
  bool algoIzq = digitalRead(IR_IZQ) == LOW;
  bool algoDer = digitalRead(IR_DER) == LOW;

  if (frente < 30 || (algoIzq && algoDer)) {
    // Bloqueado. ¿Es la tercera vez en poco tiempo? Entonces es un rincón.
    if (millis() - ultimoBloqueo < 2500) bloqueos++;
    else bloqueos = 1;
    ultimoBloqueo = millis();
    bool rincon = bloqueos >= 3;
    Serial.println(rincon ? "Rincon: media vuelta" : "Bloqueado: retrocedo");

    motores(-170, -170);
    delay(rincon ? 650 : 350);
    // Girar hacia el lado libre; si los dos están libres, elegir al azar.
    bool aLaDerecha = algoIzq || (!algoDer && random(2) == 0);
    if (aLaDerecha) motores(210, -210);
    else motores(-210, 210);
    delay(rincon ? 950 : 450);
    if (rincon) bloqueos = 0;
  } else if (algoIzq) {
    motores(210, 60);      // algo a la izquierda: curvar a la derecha
  } else if (algoDer) {
    motores(60, 210);      // algo a la derecha: curvar a la izquierda
  } else {
    motores(190, 190);     // camino libre
  }
  delay(30);
}
