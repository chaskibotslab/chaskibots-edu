// Battlebot autónomo: sale al centro de la arena, busca girando con el
// ultrasonido, ataca con el arma a fondo y retrocede después de cada pasada
// (para que la barra recupere velocidad).
// Ojo: el ultrasonido no distingue al rival de una pared. Desde el centro, las
// paredes quedan a más de 1,2 m: lo que esté más cerca debería ser el rival.
// ¿Se te ocurre algo mejor?
// En el robot real, el ESC se maneja con la librería Servo: esc.attach(ARMA);
// esc.writeMicroseconds(1000) = quieta … 2000 = máxima (y se «arma» con 1000 al empezar).
// En el laboratorio también entiende analogWrite: 0 = quieta, 255 = máxima.

const int TRIG = 12;
const int ECHO = 11;
const int ARMA = 3;

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

const int CERCA_CM = 115;   // más cerca que las paredes: ahí está el rival

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(ARMA, OUTPUT);
  Serial.begin(9600);
  delay(3000);               // la cuenta del juez: quieto hasta que empiece
  analogWrite(ARMA, 255);    // el arma a fondo durante todo el combate
  motores(200, 200);         // sale de la esquina hacia el centro (≈ 1 m)
  delay(2000);
  motores(0, 0);
}

void loop() {
  long cm = medirCm();
  if (cm < CERCA_CM) {
    Serial.print("Ataque a "); Serial.print(cm); Serial.println(" cm");
    motores(255, 255);       // a fondo contra lo que tiene delante
    delay(700);
    motores(-200, -200);     // retrocede para volver a tomar impulso
    delay(400);
  } else {
    motores(150, -150);      // busca girando en el lugar
    delay(60);
  }
}
