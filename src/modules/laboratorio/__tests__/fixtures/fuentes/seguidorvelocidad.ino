// Seguidor de velocidad para competencia: tres vueltas contra el reloj.
// Idea de los robots de competencia: VELOCIDAD ADAPTATIVA.
//  - Mientras la línea sigue entre los sensores (una recta), acelera poco a
//    poco desde BASE hasta RAPIDO.
//  - Cuando un sensor toca la línea (empieza una curva), corrige girando y
//    vuelve a BASE: llegar rápido a la curva hace que el robot se pase.
// Prueba a cambiar BASE, RAPIDO, GIRO y ACELERA: ¿cuál es tu mejor vuelta sin salirte?

const int IR_IZQ = 2;   // HIGH = ve la línea negra
const int IR_DER = 3;

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

const int BASE = 150;      // velocidad al salir de una curva (0 a 255)
const int RAPIDO = 255;    // velocidad máxima en las rectas
const int GIRO = 180;      // fuerza de la corrección
const int ACELERA = 2;     // cada cuántos ms sube 1 la velocidad en la recta

unsigned long ultimaCorreccion = 0;

void setup() {
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  Serial.println("Seguidor de velocidad listo");
}

void loop() {
  bool izq = digitalRead(IR_IZQ) == HIGH;
  bool der = digitalRead(IR_DER) == HIGH;

  if (izq && !der) {
    motores(-GIRO / 2, GIRO);        // la línea se fue a la izquierda
    ultimaCorreccion = millis();
  } else if (der && !izq) {
    motores(GIRO, -GIRO / 2);        // la línea se fue a la derecha
    ultimaCorreccion = millis();
  } else {
    // Recta (o cruce): cuanto más dura sin corregir, más rápido.
    int v = constrain(BASE + (millis() - ultimaCorreccion) / ACELERA, BASE, RAPIDO);
    motores(v, v);
  }
}
