/*
  Semaforo inteligente con paso peatonal
  Kit 8vo EGB - Arduino UNO R3

  El semaforo cicla rojo -> verde -> amarillo -> rojo. Si un peaton
  presiona el pulsador mientras el semaforo esta en verde, se corta
  el ciclo, pasa a amarillo y luego a rojo para dejar cruzar,
  avisando con el buzzer.

  IMPORTANTE: el buzzer de este kit es PASIVO. Un buzzer pasivo solo
  suena con tone()/noTone() (necesita una señal oscilante); si le
  mandas digitalWrite(HIGH) se queda en silencio o hace un clic.
*/

const int LED_ROJO = 8;
const int LED_AMARILLO = 9;
const int LED_VERDE = 10;
const int PULSADOR_PEATON = 2;
const int BUZZER = 7;

const unsigned long TIEMPO_VERDE = 5000;
const unsigned long TIEMPO_AMARILLO = 1500;
const unsigned long TIEMPO_ROJO = 4000;

bool peatonEsperando = false;

void setup() {
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(PULSADOR_PEATON, INPUT_PULLUP);

  apagarTodo();
  digitalWrite(LED_ROJO, HIGH);
}

void loop() {
  cicloVerdeConInterrupcion();

  apagarTodo();
  digitalWrite(LED_AMARILLO, HIGH);
  delay(TIEMPO_AMARILLO);

  apagarTodo();
  digitalWrite(LED_ROJO, HIGH);
  if (peatonEsperando) {
    avisoSonoroCruce();
    peatonEsperando = false;
  }
  delay(TIEMPO_ROJO);
}

void cicloVerdeConInterrupcion() {
  apagarTodo();
  digitalWrite(LED_VERDE, HIGH);

  unsigned long inicio = millis();
  while (millis() - inicio < TIEMPO_VERDE) {
    if (digitalRead(PULSADOR_PEATON) == LOW) {
      peatonEsperando = true;
      break;
    }
  }
}

void avisoSonoroCruce() {
  for (int i = 0; i < 3; i++) {
    tone(BUZZER, 1500, 150);
    delay(300);
  }
  noTone(BUZZER);
}

void apagarTodo() {
  digitalWrite(LED_ROJO, LOW);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_VERDE, LOW);
}
