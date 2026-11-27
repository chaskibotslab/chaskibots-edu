// Sígueme: el robot sigue a la caja que tiene adelante sin tocarla.
// El ultrasonido mide a qué distancia está:
//   - lejos (más de 25 cm)  -> avanza para alcanzarla
//   - cerca (menos de 15 cm) -> retrocede para no chocarla
//   - entre 15 y 25 cm       -> se queda quieto: está a la distancia justa
//   - más de 60 cm           -> no hay nada que seguir: espera

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
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long d = medirCm();

  if (d > 60) {
    motores(0, 0);               // nadie a quien seguir
  } else if (d > 25) {
    motores(150, 150);           // se aleja: la sigo
  } else if (d < 15) {
    motores(-150, -150);         // demasiado cerca: retrocedo
  } else {
    motores(0, 0);               // distancia justa
  }
  delay(30);
}
