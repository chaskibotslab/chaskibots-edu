// Robot de radiocontrol por Bluetooth (ESP32).
// El ESP32 tiene Bluetooth: desde el celular (o el control en pantalla del
// laboratorio) llegan letras y el robot obedece:
//   F = adelante   B = atrás   L = izquierda   R = derecha   S = parar
//   0–9 = velocidad (0 = lenta, 9 = máxima)
#include <BluetoothSerial.h>

BluetoothSerial SerialBT;

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

int velocidad = 200;   // 0 a 255

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(115200);
  SerialBT.begin("RobotChaski");   // nombre que verás en el celular
  Serial.println("Listo: conéctate a RobotChaski por Bluetooth");
}

void loop() {
  if (!SerialBT.available()) return;
  char c = SerialBT.read();

  if (c >= '0' && c <= '9') {            // un número cambia la velocidad
    velocidad = map(c - '0', 0, 9, 90, 255);
    return;
  }
  switch (c) {
    case 'F': motores(velocidad, velocidad); break;
    case 'B': motores(-velocidad, -velocidad); break;
    case 'L': motores(-velocidad / 2, velocidad); break;
    case 'R': motores(velocidad, -velocidad / 2); break;
    case 'S': motores(0, 0); break;
  }
}
