// Huye de la luz, como una cucaracha: si le da la linterna, se da vuelta y escapa.
// Tiene dos sensores de luz (LDR): más luz, número más alto en analogRead.
// Si el izquierdo recibe más luz, la linterna está a la izquierda: gira a la derecha.

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

const int OSCURO = 95;    // menos que esto: está tranquilo, a oscuras

bool escapando = false;

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int izq = analogRead(LUZ_IZQ);
  int der = analogRead(LUZ_DER);

  if (izq > OSCURO || der > OSCURO) {
    // Le da la luz: gira hasta darle la espalda.
    if (izq > der) motores(160, -160);
    else motores(-160, 160);
    escapando = true;
  } else if (escapando) {
    Serial.println("¡Luz! Me escapo");
    motores(200, 200);           // ya no la ve: corre un momento
    delay(700);
    escapando = false;
  } else {
    motores(0, 0);               // a oscuras: se queda quieto
  }
  delay(20);
}
