// Minisumo: espera los 5 s del reglamento, busca al rival girando, lo
// empuja con la pala y se aleja del borde blanco del dohyo.
//  - Ultrasonido HC-SR04 al frente: ve al rival a distancia.
//  - Dos FC-51 en las esquinas (LOW = hay algo cerca).
//  - Dos TCRT5000 abajo: HIGH sobre el negro del dohyo, LOW sobre el borde blanco.

const int TRIG = 12;
const int ECHO = 11;
const int IR_IZQ = 4;
const int IR_DER = 13;
const int BORDE_IZQ = 2;
const int BORDE_DER = 3;

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

const int ATAQUE = 255;   // a todo lo que da: empujar
const int BUSCAR = 150;   // girar buscando
const int VER_CM = 60;    // a esta distancia (o menos) el rival está al frente
const int MEMORIA_MS = 400; // sigue empujando un rato aunque deje de verlo

// Pegado al rival el ultrasonido no mide (zona ciega de 2 cm): por eso el
// robot "recuerda" que lo vio y sigue empujando.
unsigned long atacarHasta = 0;

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
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(IR_IZQ, INPUT); pinMode(IR_DER, INPUT);
  pinMode(BORDE_IZQ, INPUT); pinMode(BORDE_DER, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  motores(0, 0);
  Serial.begin(9600);
  Serial.println("Esperando 5 s (reglamento)...");
  delay(5000);              // ¡obligatorio! si se mueve antes, pierde la ronda
  Serial.println("¡A pelear!");
}

void loop() {
  // 1. Lo primero es no caerse: si un sensor ve el borde blanco, retroceder
  //    y girar hacia el centro.
  bool bordeIzq = digitalRead(BORDE_IZQ) == LOW;
  bool bordeDer = digitalRead(BORDE_DER) == LOW;
  if (bordeIzq || bordeDer) {
    motores(-255, -255);                // un poquito atrás (atrás también hay borde)…
    delay(120);
    if (bordeIzq) motores(220, -220);   // …y girar en el lugar hacia el centro
    else motores(-220, 220);
    delay(300);
    return;
  }

  // 2. ¿Dónde está el rival?
  long cm = medirCm();
  bool izq = digitalRead(IR_IZQ) == LOW;
  bool der = digitalRead(IR_DER) == LOW;

  if (cm < VER_CM) atacarHasta = millis() + MEMORIA_MS;

  if (millis() < atacarHasta) {
    // ¡Empujar! Si un IR lateral lo ve más de su lado, corregir hacia él
    // para pegarle de frente (si no, la pala resbala y se dan vueltas).
    if (izq && !der) motores(ATAQUE / 2, ATAQUE);
    else if (der && !izq) motores(ATAQUE, ATAQUE / 2);
    else motores(ATAQUE, ATAQUE);
  }
  else if (izq) motores(-BUSCAR, BUSCAR);            // a la izquierda: girar hacia él
  else if (der) motores(BUSCAR, -BUSCAR);            // a la derecha
  else motores(BUSCAR, -BUSCAR);                     // no se ve: buscar girando
}
