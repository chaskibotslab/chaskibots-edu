// Seguidor de línea con freno de seguridad.
// Sigue la línea como el seguidor básico, pero cada 60 ms mira adelante con
// el ultrasonido: si hay algo a menos de 15 cm se detiene y avisa con el LED 13.
// Cuando quitas el obstáculo, sigue solo.

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

const int VELOCIDAD = 150;
const int GIRO = 170;
const int FRENAR_CM = 15;

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

long distancia = 400;
unsigned long ultimaMedida = 0;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // Medir no muy seguido: pulseIn tarda y el robot debe seguir corrigiendo.
  if (millis() - ultimaMedida > 60) {
    ultimaMedida = millis();
    distancia = medirCm();
  }

  if (distancia < FRENAR_CM) {
    motores(0, 0);
    digitalWrite(LED_BUILTIN, (millis() / 200) % 2);   // parpadea: ¡obstáculo!
    return;
  }
  digitalWrite(LED_BUILTIN, LOW);

  int izq = digitalRead(IR_IZQ);
  int der = digitalRead(IR_DER);
  if (izq == HIGH && der == LOW) motores(-GIRO / 2, GIRO);
  else if (izq == LOW && der == HIGH) motores(GIRO, -GIRO / 2);
  else motores(VELOCIDAD, VELOCIDAD);
}
