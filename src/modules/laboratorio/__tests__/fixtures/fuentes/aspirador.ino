// Robot aspirador: recorre la sala para limpiar todo el piso que pueda.
//  1. Empieza en espiral: limpia bien alrededor de donde lo dejaste.
//  2. Después avanza recto. Si un IR de las esquinas ve algo a un costado (LOW),
//     curva para alejarse sin frenar.
//  3. Si el ultrasonido ve un mueble cerca al frente (o lo ven los dos IR),
//     retrocede y gira un ángulo al azar.
//  4. Cada 10 s cambia de rumbo aunque no choque, para no repetir el camino.
//  5. Si la distancia al frente no cambia en 2 s, o lleva mucho rato curvando
//     entre patas de muebles, está trabado: retrocede y gira.
// Los IR ven las patas finas de mesas y sillas, que el ultrasonido a veces no ve.

const int TRIG = 12;
const int ECHO = 11;
const int IR_IZQ = 2;
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

const int AVANCE = 170;
const int CERCA_CM = 15;
const unsigned long ESPIRAL_MS = 8000;
const unsigned long CAMBIO_MS = 10000;

bool enEspiral = true;
unsigned long inicio = 0;
unsigned long ultimoGiro = 0;
unsigned long ultimaRevision = 0;
long cmAnterior = 0;
int iguales = 0;   // revisiones seguidas con la misma distancia
unsigned long curvandoDesde = 0;   // desde cuándo está curvando para esquivar (0 = no)

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

// Gira en el lugar un ángulo al azar (entre 250 y 750 ms de giro).
void girarAlAzar(bool aLaDerecha) {
  if (aLaDerecha) motores(180, -180);
  else motores(-180, 180);
  delay(250 + random(500));
  ultimoGiro = millis();
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(IR_IZQ, INPUT);
  pinMode(IR_DER, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  Serial.println("Aspirando...");
  digitalWrite(LED_BUILTIN, HIGH);   // LED encendido = aspiradora funcionando
  inicio = millis();
  ultimoGiro = millis();
}

// Salir de donde se trabó: retroceder bastante y girar al azar.
void escapar(const char* motivo) {
  Serial.println(motivo);
  enEspiral = false;
  iguales = 0;
  curvandoDesde = 0;
  motores(-170, -170);
  delay(500);
  girarAlAzar(random(2) == 0);
}

void loop() {
  long cm = medirCm();
  bool izq = digitalRead(IR_IZQ) == LOW;
  bool der = digitalRead(IR_DER) == LOW;

  // ¿Trabado? Si la distancia al frente no cambia en 2 s, el robot no se mueve
  // aunque tenga los motores encendidos (las ruedas patinan contra algo).
  if (millis() - ultimaRevision > 1000) {
    ultimaRevision = millis();
    if (cm < 400 && abs(cm - cmAnterior) <= 1) iguales++;
    else iguales = 0;
    cmAnterior = cm;
    if (iguales >= 2) { escapar("¡Trabado! Retrocedo"); return; }
  }

  if (cm < CERCA_CM || (izq && der)) {
    enEspiral = false;
    Serial.println("Mueble al frente: retrocedo y giro");
    motores(-150, -150);
    delay(250);
    girarAlAzar(random(2) == 0);
    return;
  }
  if (izq || der) {
    enEspiral = false;
    // Si lleva mucho rato curvando, está dando vueltas entre patas de muebles.
    if (curvandoDesde == 0) curvandoDesde = millis();
    if (millis() - curvandoDesde > 2500) { escapar("Me enredé: retrocedo"); return; }
    if (izq) motores(AVANCE, AVANCE / 4);   // algo a la izquierda: curvar a la derecha
    else motores(AVANCE / 4, AVANCE);       // algo a la derecha: curvar a la izquierda
    return;
  }
  curvandoDesde = 0;

  if (enEspiral) {
    unsigned long t = millis() - inicio;
    if (t > ESPIRAL_MS) { enEspiral = false; return; }
    // La rueda de afuera va rápido y la de adentro acelera de a poco: la vuelta se agranda.
    motores(AVANCE + 40, map(t, 0, ESPIRAL_MS, 40, AVANCE));
    return;
  }

  if (millis() - ultimoGiro > CAMBIO_MS) {
    Serial.println("Cambio de rumbo");
    girarAlAzar(random(2) == 0);
    return;
  }
  motores(AVANCE, AVANCE);
}
