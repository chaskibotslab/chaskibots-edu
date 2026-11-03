// Robô WiFi: el ESP32 crea su propia red WiFi y una página web con botones.
// En el robot real: conecta el celular a la red "RoboWiFi" (clave 12345678),
// abre http://192.168.4.1 y cada botón visita una dirección del robot:
//   /F adelante   /B atrás   /L izquierda   /R derecha   /S parar
//   /G /I curvas adelante   /H /J curvas atrás   /0 a /9 velocidad
// En el simulador no hay celular: el control remoto (o el teclado) hace esas visitas.
#include <WiFi.h>
#include <WebServer.h>

WebServer servidor(80);

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

// La página que ve el celular: cada botón visita /F, /B, /L, /R o /S.
const char PAGINA[] =
  "<html><body style='font-size:2em;text-align:center'>"
  "<h3>Robo WiFi</h3>"
  "<button onclick=\"fetch('/F')\">Adelante</button><br>"
  "<button onclick=\"fetch('/L')\">Izq</button>"
  "<button onclick=\"fetch('/S')\">Parar</button>"
  "<button onclick=\"fetch('/R')\">Der</button><br>"
  "<button onclick=\"fetch('/B')\">Atras</button>"
  "</body></html>";

void pagina()    { servidor.send(200, "text/html", PAGINA); }
void adelante()  { motores(velocidad, velocidad); servidor.send(200); }
void atras()     { motores(-velocidad, -velocidad); servidor.send(200); }
void izquierda() { motores(-velocidad / 2, velocidad); servidor.send(200); }
void derecha()   { motores(velocidad, -velocidad / 2); servidor.send(200); }
void parar()     { motores(0, 0); servidor.send(200); }
void curvaIzq()  { motores(velocidad * 2 / 5, velocidad); servidor.send(200); }
void curvaDer()  { motores(velocidad, velocidad * 2 / 5); servidor.send(200); }
void atrasIzq()  { motores(-velocidad * 2 / 5, -velocidad); servidor.send(200); }
void atrasDer()  { motores(-velocidad, -velocidad * 2 / 5); servidor.send(200); }

// Las direcciones /0 a /9 cambian la velocidad.
void otraDireccion() {
  String uri = servidor.uri();
  char c = uri.length() > 1 ? uri[1] : ' ';
  if (c >= '0' && c <= '9') velocidad = map(c - '0', 0, 9, 90, 255);
  servidor.send(200);
}

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  Serial.begin(115200);
  WiFi.softAP("RoboWiFi", "12345678");
  Serial.print("Red RoboWiFi lista. Abre http://");
  Serial.println(WiFi.softAPIP());

  servidor.on("/", pagina);
  servidor.on("/F", adelante);
  servidor.on("/B", atras);
  servidor.on("/L", izquierda);
  servidor.on("/R", derecha);
  servidor.on("/S", parar);
  servidor.on("/G", curvaIzq);
  servidor.on("/I", curvaDer);
  servidor.on("/H", atrasIzq);
  servidor.on("/J", atrasDer);
  servidor.onNotFound(otraDireccion);
  servidor.begin();
}

void loop() {
  servidor.handleClient();   // atiende cada visita de la página
}
