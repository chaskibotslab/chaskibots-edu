// Seguidor de luz: va hacia la linterna.
// Tiene dos sensores de luz (LDR), uno mirando a cada lado.
// analogRead da un número de 0 a 1023: más luz, número más alto.
// Si el izquierdo recibe más luz, la linterna está a la izquierda: gira hacia allá.

const int LUZ_IZQ = A0;
const int LUZ_DER = A1;

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

const int OSCURO = 95;    // menos que esto: no ve la linterna
const int CERCA = 600;    // más que esto: ya llegó
const int MARGEN = 12;    // diferencia mínima para girar

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int izq = analogRead(LUZ_IZQ);
  int der = analogRead(LUZ_DER);

  if (izq < OSCURO && der < OSCURO) {
    motores(130, -130);          // no la ve: gira buscándola
  } else if (izq > CERCA || der > CERCA) {
    motores(0, 0);               // llegó a la luz
  } else if (izq > der + MARGEN) {
    motores(60, 180);            // la luz está a la izquierda
  } else if (der > izq + MARGEN) {
    motores(180, 60);            // la luz está a la derecha
  } else {
    motores(170, 170);           // la tiene de frente
  }
  delay(20);
}
