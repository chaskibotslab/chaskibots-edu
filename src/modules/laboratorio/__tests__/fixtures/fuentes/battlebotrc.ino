// Battlebot de radiocontrol: lo manejas tú y decides cuándo girar el arma.
// Cada tecla llega como una letra (en el robot real, por Bluetooth con un HC-05):
//   F = adelante   B = atrás   L = izquierda   R = derecha   S = parar
//   G / I = curva adelante a la izq. / der.   H / J = curva atrás
//   0–9 = velocidad      X = arma a fondo      Y = arma apagada
// Consejo: la barra tarda ~1 s en llegar a toda velocidad. Enciéndela antes de
// acercarte y pega de frente: después de cada golpe pierde velocidad.
// En el robot real, el ESC se maneja con la librería Servo: esc.attach(ARMA);
// esc.writeMicroseconds(1000) = quieta … 2000 = máxima (y se «arma» con 1000 al empezar).
// En el laboratorio también entiende analogWrite: 0 = quieta, 255 = máxima.

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

const int ARMA = 3;   // señal del ESC del arma

int velocidad = 200;   // 0 a 255

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ARMA, OUTPUT);
  analogWrite(ARMA, 0);   // el arma empieza quieta (por seguridad)
  Serial.begin(9600);
  Serial.println("Listo: maneja con las flechas y enciende el arma con E");
}

void loop() {
  if (!Serial.available()) return;
  char c = Serial.read();

  if (c >= '0' && c <= '9') {
    velocidad = map(c - '0', 0, 9, 90, 255);
    return;
  }
  switch (c) {
    case 'F': motores(velocidad, velocidad); break;
    case 'B': motores(-velocidad, -velocidad); break;
    case 'L': motores(-velocidad / 2, velocidad); break;
    case 'R': motores(velocidad, -velocidad / 2); break;
    case 'G': motores(velocidad * 2 / 5, velocidad); break;
    case 'I': motores(velocidad, velocidad * 2 / 5); break;
    case 'H': motores(-velocidad * 2 / 5, -velocidad); break;
    case 'J': motores(-velocidad, -velocidad * 2 / 5); break;
    case 'S': motores(0, 0); break;
    case 'X': analogWrite(ARMA, 255); Serial.println("Arma a fondo"); break;
    case 'Y': analogWrite(ARMA, 0); Serial.println("Arma apagada"); break;
  }
}
