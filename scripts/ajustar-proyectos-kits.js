/**
 * Ajusta proyectos de los kits de la Academia para que cada clase tenga lógica
 * con las piezas que trae el kit:
 *  - (10mo pasó al ESP32: ver scripts/decimo-esp32.js)
 *  - 1ro BGU: la estación muestra los datos en el celular (página web por WiFi)
 *    y con dos luces: la azul de la propia placa (todo normal) y un LED rojo (alerta).
 *  - Las prácticas que eran solo un pulsador ahora encienden un LED.
 *  - 8vo: el kit trae 1 pulsador, así que el Piano elige la nota con el potenciómetro.
 *  - 3ro BGU: el sensor ultrasónico HC-SR04P se alimenta a 3,3 V, para que su
 *    pin Echo no envíe 5 V a un pin del ESP32.
 *  - Textos de alimentación y notas de materiales según la lista real de cada kit.
 * Reemplaza conexiones, código y textos de cada proyecto listado.
 * Por defecto solo simula; con --apply escribe. Guarda respaldo en backups/.
 * Después hay que recargar las guías: node scripts/seed-kit-guias.js <kit-id>
 */
const fs = require('fs')
const path = require('path')

const APPLY = process.argv.includes('--apply')
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)
const base = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' }
const get = async (t, q) => { const r = await fetch(`${base}${t}?${q}&limit=5000`, { headers }); const j = await r.json(); if (!Array.isArray(j)) throw new Error(JSON.stringify(j).slice(0, 200)); return j }
const send = async (method, t, q, body) => {
  const r = await fetch(`${base}${t}${q ? `?${q}` : ''}`, { method, headers: { ...headers, Prefer: 'return=minimal,resolution=merge-duplicates' }, body: body ? JSON.stringify(body) : undefined })
  if (!r.ok) throw new Error(`${method} ${t}: ${r.status} ${(await r.text()).slice(0, 300)}`)
}

// Piezas que se repiten: [componente, pata, pin de la placa, nota]
const led = (nombre, pin, r = 'R330') => [[nombre, `Ánodo (+) via ${r}`, pin], [nombre, 'Cátodo (-)', 'GND']]
const pulsador = (nombre, pin) => [[nombre, 'Pin 1', pin, 'INPUT_PULLUP'], [nombre, 'Pin 2', 'GND']]
const buzzer = (nombre, pin) => [[nombre, '+', pin], [nombre, '-', 'GND']]
const modulo = (nombre, v, senal, pin) => [[nombre, 'VCC', v], [nombre, 'GND', 'GND'], [nombre, senal, pin]]
const pot = (nombre, v, pin) => [[nombre, 'Terminal A', v], [nombre, 'Wiper', pin], [nombre, 'Terminal B', 'GND']]

// LDR suelta de 2 patas en serie con la resistencia de 1 kΩ: la señal sale de la unión de las dos.
const LDR_C3 = [['LDR + R1K (divisor)', 'Terminal superior', '3V3'], ['LDR + R1K (divisor)', 'Punto medio', 'GPIO0'], ['LDR + R1K (divisor)', 'Terminal inferior', 'GND']]
const DHT_C3 = modulo('SENSOR DHT11', '3V3', 'DATA', 'GPIO3')

const CAMBIOS = {
  // 10mo EGB pasó al ESP32: su fuente ahora es scripts/decimo-esp32.js.

  // ───────────── 1ro BGU — Estación meteorológica ─────────────
  'practica-ldr': {
    descripcion: 'Practica con el sensor de luz solo: mira cómo cambia el valor al tapar el sensor con la mano.',
    conexiones: LDR_C3,
  },

  'practica-pulsador-modo': {
    descripcion: 'Practica con un pulsador y un LED: cada vez que presionas, el LED cambia entre encendido y apagado.',
    objetivos: ['Leer una entrada digital con INPUT_PULLUP en un ESP32.', 'Detectar un cambio de estado (flanco) para que cada pulsación cuente una sola vez.'],
    conexiones: [...pulsador('PULSADOR (modo)', 'GPIO10'), ...led('LED ROJO', 'GPIO5')],
    codigo: `/*
  Practica: lee el pulsador de modo
  Kit 1ro BGU - ESP32-C3 Super Mini
  Cada pulsacion cambia el LED entre encendido y apagado. En la
  estacion meteorologica este boton activara o silenciara la alarma.
*/
const int PULSADOR = 10;
const int LED = 5;

bool encendido = false;
bool anterior = HIGH;

void setup() {
  Serial.begin(115200);
  pinMode(PULSADOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool actual = digitalRead(PULSADOR);
  if (actual == LOW && anterior == HIGH) {
    encendido = !encendido;
    digitalWrite(LED, encendido ? HIGH : LOW);
    Serial.println(encendido ? "Modo: ENCENDIDO" : "Modo: APAGADO");
  }
  anterior = actual;
  delay(50);
}
`,
  },

  'estacion-meteorologica-iot': {
    descripcion: 'Mide temperatura, humedad y luz ambiental, y muestra los datos en el celular con una página web que crea la propia placa por WiFi. La luz azul de la placa indica que todo está normal; un LED rojo y el buzzer avisan cuando algún valor sale de rango.',
    objetivos: [
      'Soldar correctamente los pines de una placa ESP32-C3 con supervisión docente.',
      'Leer temperatura y humedad ambiental con un sensor digital (DHT11) y la luz con una LDR en divisor de voltaje.',
      'Crear una red WiFi y una página web dentro del ESP32 para ver los datos desde un celular.',
      'Combinar dos condiciones (temperatura y humedad) en una sola alerta con el operador OR.',
    ],
    conexiones: [
      ...DHT_C3, ...LDR_C3, ...buzzer('BUZZER ACTIVO', 'GPIO4'),
      ...led('LED ROJO (alerta)', 'GPIO5'),
      ...pulsador('PULSADOR (modo)', 'GPIO10'),
    ],
    codigo: `/*
  Estacion meteorologica con monitoreo de variables ambientales
  Kit 1ro BGU - ESP32-C3 Super Mini
  Academia Militar Lizardo Alfonzo Villamarin

  Lee temperatura y humedad (DHT11) y nivel de luz (LDR con su
  resistencia de 1k).
  La placa crea su propia red WiFi y una pagina web: conecta tu
  celular a esa red y abre http://192.168.4.1 para ver los datos.
  Luz azul de la placa = todo normal. LED rojo + buzzer = alerta.
  El pulsador activa o silencia el sonido de la alarma.

  Requiere instalar: "DHT sensor library" (Adafruit) + "Adafruit
  Unified Sensor".

  IMPORTANTE: ESP32-C3 trabaja a 3.3V. No conectar ningun componente
  de 5V directo a sus pines.
*/

#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

// Cambia el numero por el de tu grupo para no confundir las redes.
const char* NOMBRE_RED = "Estacion-Grupo1";
const char* CLAVE_RED = "clima1234"; // minimo 8 caracteres

const int PIN_LDR = 0;
const int PIN_DHT = 3;
const int BUZZER = 4;
const int LED_ROJO = 5;
const int LED_PLACA = 8; // luz azul que ya viene soldada en la placa; enciende con LOW
const int PULSADOR = 10;

const float TEMP_MAXIMA = 28.0;
const float HUMEDAD_MAXIMA = 70.0;
const unsigned long INTERVALO_MS = 2000; // el DHT11 mide una vez cada 2 segundos

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);
WebServer servidor(80);

float temperatura = NAN;
float humedad = NAN;
int luz = 0;
bool alerta = false;
bool sonido = true;
bool anterior = HIGH;
unsigned long ultimaLectura = 0;

// Arma la pagina que ve el celular. Se recarga sola cada 3 segundos.
void paginaPrincipal() {
  String html = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<meta http-equiv='refresh' content='3'>";
  html += "<title>Estacion</title></head>";
  html += "<body style='font-family:sans-serif;text-align:center'>";
  html += "<h1>Estacion meteorologica</h1>";
  html += "<h2>Temperatura: " + String(temperatura, 1) + " C</h2>";
  html += "<h2>Humedad: " + String(humedad, 0) + " %</h2>";
  html += "<h2>Luz: " + String(luz) + "</h2>";
  if (alerta) {
    html += "<h2 style='color:red'>ALERTA</h2>";
  } else {
    html += "<h2 style='color:green'>Todo normal</h2>";
  }
  html += "</body></html>";
  servidor.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_PLACA, OUTPUT);
  pinMode(PULSADOR, INPUT_PULLUP);

  WiFi.mode(WIFI_AP);
  WiFi.softAP(NOMBRE_RED, CLAVE_RED);
  WiFi.setTxPower(WIFI_POWER_8_5dBm); // mejora la senal de la antena pequena de esta placa
  servidor.on("/", paginaPrincipal);
  servidor.begin();

  Serial.print("Red WiFi: ");
  Serial.println(NOMBRE_RED);
  Serial.print("Abre en el celular: http://");
  Serial.println(WiFi.softAPIP());
}

void loop() {
  servidor.handleClient(); // atiende al celular si pide la pagina

  // El pulsador activa o silencia el sonido de la alarma
  bool actual = digitalRead(PULSADOR);
  if (actual == LOW && anterior == HIGH) {
    sonido = !sonido;
    Serial.println(sonido ? "Sonido: ACTIVADO" : "Sonido: SILENCIADO");
    delay(50);
  }
  anterior = actual;

  // Cada 2 segundos: medir, decidir y avisar
  if (millis() - ultimaLectura >= INTERVALO_MS) {
    ultimaLectura = millis();

    temperatura = dht.readTemperature();
    humedad = dht.readHumidity();
    luz = analogRead(PIN_LDR);

    alerta = (!isnan(temperatura) && temperatura > TEMP_MAXIMA)
          || (!isnan(humedad) && humedad > HUMEDAD_MAXIMA);

    digitalWrite(LED_ROJO, alerta ? HIGH : LOW);
    digitalWrite(LED_PLACA, alerta ? HIGH : LOW); // esta luz funciona al reves: LOW la enciende
    if (alerta && sonido) tone(BUZZER, 2000, 200);

    Serial.print("Temp: "); Serial.print(temperatura);
    Serial.print(" C  Humedad: "); Serial.print(humedad);
    Serial.print(" %  Luz: "); Serial.println(luz);
  }
}
`,
  },

  'luz-automatica': {
    conexiones: [...LDR_C3, ...led('LED (lampara)', 'GPIO5')],
    codigo: `/*
  Luz automatica
  Kit 1ro BGU - ESP32-C3 Super Mini - Proyecto adicional
  Mismo armado de la estacion meteorologica (usa solo la LDR y un
  LED). Enciende el LED cuando detecta poca luz ambiental.
*/
const int PIN_LDR = 0;
const int LED_LUZ = 5;

const int UMBRAL_OSCURIDAD = 1500; // 0-4095, ajustar segun el ambiente

void setup() {
  pinMode(LED_LUZ, OUTPUT);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  digitalWrite(LED_LUZ, luz < UMBRAL_OSCURIDAD ? HIGH : LOW);
  delay(300);
}
`,
  },

  'registro-datos-nube': { conexiones: [...DHT_C3, ...LDR_C3] },

  // ───────────── 2do BGU — Domótica ─────────────
  'practica-pulsador-domotica': {
    descripcion: 'Último paso antes de la domótica completa: practica el botón del control manual. Mientras lo presionas se enciende el LED de confirmación.',
    objetivos: ['Leer una entrada digital con INPUT_PULLUP en un ESP32.', 'Entender por qué un control manual sigue siendo útil aunque todo sea automático.'],
    conexiones: [...pulsador('PULSADOR MANUAL', 'GPIO14'), ...led('LED DE CONFIRMACION', 'GPIO25')],
    codigo: `/*
  Practica: prueba el control manual
  Kit 2do BGU - ESP32 DevKit V1
  Mismos pines que usara la domotica inteligente: pulsador en GPIO14
  y LED de confirmacion en GPIO25.
*/
const int PULSADOR = 14;
const int LED = 25;

void setup() {
  Serial.begin(115200);
  pinMode(PULSADOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool presionado = (digitalRead(PULSADOR) == LOW);
  digitalWrite(LED, presionado ? HIGH : LOW);
  if (presionado) Serial.println("Control manual activado");
  delay(200);
}
`,
  },

  // ───────────── 8vo EGB — Piano ─────────────
  'piano-pulsadores': {
    titulo: 'Piano con pulsador y potenciómetro',
    descripcion: 'Un piano de una sola tecla: giras el potenciómetro para elegir la nota y presionas el pulsador para que suene en el buzzer.',
    objetivos: [
      'Leer una entrada analógica (potenciómetro) y una digital (pulsador) en el mismo programa.',
      'Convertir un rango de valores en posiciones de una lista con map().',
      'Generar tonos de distinta frecuencia con la función tone(), ideal para el buzzer pasivo de este kit.',
    ],
    conexiones: [...pulsador('PULSADOR (tecla)', 'D2'), ...pot('POTENCIOMETRO (nota)', '5V', 'A0'), ...buzzer('BUZZER PASIVO', 'D8')],
    codigo: `/*
  Piano con pulsador y potenciometro
  Kit 8vo EGB - Arduino UNO R3 - Proyecto adicional
  El potenciometro elige la nota (do, re, mi, fa, sol, la, si, do)
  y el pulsador la hace sonar en el buzzer pasivo. El pulsador usa
  la resistencia interna del Arduino (INPUT_PULLUP): presionado = LOW.
*/
const int PULSADOR = 2;
const int POTENCIOMETRO = A0;
const int BUZZER = 8;

const int NOTAS[8] = {262, 294, 330, 349, 392, 440, 494, 523};

void setup() {
  pinMode(PULSADOR, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  int posicion = map(analogRead(POTENCIOMETRO), 0, 1023, 0, 7);

  if (digitalRead(PULSADOR) == LOW) {
    tone(BUZZER, NOTAS[posicion]);
    Serial.print("Nota numero: ");
    Serial.println(posicion + 1);
  } else {
    noTone(BUZZER);
  }

  delay(20);
}
`,
  },
}

// Textos del kit y notas de materiales, según la lista real de cada kit.
const KITS = {
}
const CANTIDADES = [['kit-lv-octavo-egb', 'pulsador', 1]]
const NOTAS_MATERIAL = [
  ['kit-lv-octavo-egb', 'resistencia-10k', 'Repuesto / experimentación libre'],
  ['kit-lv-primero-bach', 'resistencia-1k', 'Divisor de voltaje de la LDR'],
]

;(async () => {
  const proyectos = await get('kit_proyectos', 'select=*&kit_id=like.kit-lv-*')
  const ids = proyectos.map(p => p.id).join(',')
  const conexiones = await get('kit_conexiones', `select=*&proyecto_id=in.(${ids})`)
  const codigos = await get('kit_codigos', `select=*&proyecto_id=in.(${ids})`)

  for (const [slug, c] of Object.entries(CAMBIOS)) {
    const p = proyectos.find(x => x.slug === slug)
    if (!p) throw new Error(`no existe el proyecto ${slug}`)
    if (c.codigo && !codigos.some(x => x.proyecto_id === p.id)) throw new Error(`${slug} no tiene código que reemplazar`)
    const partes = [c.conexiones && `${c.conexiones.length} conexiones`, c.codigo && 'código', (c.titulo || c.descripcion || c.objetivos || c.orden !== undefined) && 'textos'].filter(Boolean)
    console.log(`${slug}: ${partes.join(', ')}`)
  }
  if (!APPLY) { console.log('\nSIMULACIÓN: no se cambió nada. Ejecuta con --apply.'); return }

  const dir = path.join(__dirname, '..', 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const sello = new Date().toISOString().replace(/[:.]/g, '-')
  fs.writeFileSync(path.join(dir, `ajuste-kits-${sello}.json`), JSON.stringify({ proyectos, conexiones, codigos }))

  for (const [slug, c] of Object.entries(CAMBIOS)) {
    const p = proyectos.find(x => x.slug === slug)
    const textos = {}
    for (const k of ['titulo', 'descripcion', 'objetivos', 'orden']) if (c[k] !== undefined) textos[k] = c[k]
    if (Object.keys(textos).length) await send('PATCH', 'kit_proyectos', `id=eq.${p.id}`, textos)
    if (c.codigo) await send('PATCH', 'kit_codigos', `proyecto_id=eq.${p.id}`, { contenido: c.codigo })
    if (c.conexiones) {
      await send('DELETE', 'kit_conexiones', `proyecto_id=eq.${p.id}`)
      await send('POST', 'kit_conexiones', '', c.conexiones.map(([componente, pin_componente, pin_placa, nota], i) => (
        { proyecto_id: p.id, componente, pin_componente, pin_placa, nota: nota || null, orden: i + 1 }
      )))
    }
  }
  for (const [id, textos] of Object.entries(KITS)) await send('PATCH', 'kits', `id=eq.${id}`, textos)
  for (const [kit, material, nota] of NOTAS_MATERIAL) await send('PATCH', 'kit_materiales', `kit_id=eq.${kit}&material_id=eq.${material}`, { nota })

  for (const [kit, material, cantidad] of CANTIDADES) await send('PATCH', 'kit_materiales', `kit_id=eq.${kit}&material_id=eq.${material}`, { cantidad })
  // 1ro BGU trae la LDR suelta de 2 patas, no el módulo de 3 pines de otros kits.
  await send('POST', 'materiales', 'on_conflict=id', { id: 'ldr-2-patas', nombre: 'LDR (fotorresistencia de 2 patas)', categoria: 'sensor' })
  await send('PATCH', 'kit_materiales', 'kit_id=eq.kit-lv-primero-bach&material_id=eq.sensor-ldr', { material_id: 'ldr-2-patas' })

  // 3ro BGU: HC-SR04P a 3,3 V
  const tercero = proyectos.filter(p => p.kit_id === 'kit-lv-tercero-bach').map(p => p.id).join(',')
  await send('PATCH', 'kit_conexiones', `proyecto_id=in.(${tercero})&componente=eq.SENSOR HC-SR04P&pin_componente=eq.VCC`, { pin_placa: '3V3' })

  // Los pasos de las guías señalan conexiones por posición: el orden no puede tener números repetidos.
  const actuales = await get('kit_conexiones', `select=id,proyecto_id,orden&proyecto_id=in.(${ids})&order=orden`)
  let renumeradas = 0
  for (const p of proyectos) {
    const filas = actuales.filter(c => c.proyecto_id === p.id)
    if (new Set(filas.map(f => f.orden)).size === filas.length) continue
    for (const [i, f] of filas.entries()) if (f.orden !== i + 1) { await send('PATCH', 'kit_conexiones', `id=eq.${f.id}`, { orden: i + 1 }); renumeradas++ }
  }
  console.log(`conexiones renumeradas: ${renumeradas}`)
  console.log('listo')
})().catch(e => { console.error(e.message); process.exit(1) })
