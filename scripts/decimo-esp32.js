/**
 * Kit de 10mo EGB (riego): pasa del Arduino Nano al ESP32 DevKit V1 30 pines.
 * Mismos 8 proyectos y mismas piezas; cambian pines, voltajes y código:
 *   A0 → GPIO34 (sensor)   A1 → GPIO35 (potenciómetro)   D7 → GPIO26 (relé)
 *   D9 → GPIO25 (LED rojo) D11 → GPIO33 (LED verde)       D2 → GPIO27 (pulsador)
 *   D8 → GPIO13 (buzzer)
 *   Sensor y potenciómetro a 3V3 (el ESP32 no tolera 5 V en sus pines); el relé
 *   a VIN (5 V del USB). Lecturas de 0 a 4095 (antes 0 a 1023), Serial a 115200.
 * Las conexiones conservan su orden: los pasos de las guías siguen apuntando bien.
 *
 * Genera supabase/migrations/2026_10_decimo_esp32.sql para pegarlo en Supabase:
 *   node scripts/decimo-esp32.js
 */
const fs = require('fs')
const path = require('path')
const guias = require('./guias/kit-lv-decimo-egb.js')

const KIT = 'kit-lv-decimo-egb'

const led = (nombre, pin) => [[nombre, 'Ánodo (+) via R330', pin], [nombre, 'Cátodo (-)', 'GND']]
const pulsador = (nombre, pin) => [[nombre, 'Pin 1', pin, 'INPUT_PULLUP'], [nombre, 'Pin 2', 'GND']]
const buzzer = (nombre, pin) => [[nombre, '+', pin], [nombre, '-', 'GND']]
const modulo = (nombre, v, senal, pin, nota) => [[nombre, 'VCC', v], [nombre, 'GND', 'GND'], [nombre, senal, pin, nota]]

const SUELO = modulo('SENSOR HUMEDAD SUELO', '3V3', 'AOUT', 'GPIO34', 'ADC1, solo entrada')
const RELE = modulo('MODULO RELE 1 CANAL', 'VIN (5V)', 'IN', 'GPIO26')
const BOMBA = [
  ['BOMBA DE AGUA 5V', '+ : va al NO del rele (comparte el USB-V8 con la placa)', 'USB-V8 compartido'],
  ['BOMBA DE AGUA 5V', '- (GND comun con el ESP32)', 'GND'],
]

const CABECERA = (titulo, extra = '') => `/*
  ${titulo}
  Kit 10mo EGB - ESP32 DevKit V1${extra}
  En Arduino IDE: Placa "ESP32 Dev Module". Monitor Serial a 115200.
*/`

const PROYECTOS = {
  'practica-humedad-suelo': {
    conexiones: [
      ['SENSOR HUMEDAD SUELO', 'VCC', '3V3'],
      ['SENSOR HUMEDAD SUELO', 'GND', 'GND'],
      ['SENSOR HUMEDAD SUELO', 'AOUT', 'GPIO34', 'mismo pin que el principal'],
    ],
    codigo: `${CABECERA('Practica: lee la humedad del suelo')}
// Mismo pin que usara el sistema de riego (GPIO34).
// El valor crudo va de 0 a 4095.
const int SENSOR = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int valor = analogRead(SENSOR);
  Serial.print("Humedad (crudo): ");
  Serial.println(valor);
  delay(300);
}
`,
  },

  'practica-rele': {
    conexiones: [
      ['MODULO RELE 1 CANAL', 'IN', 'GPIO26', 'mismo pin que el principal'],
      ['MODULO RELE 1 CANAL', 'VCC', 'VIN (5V)'],
      ['MODULO RELE 1 CANAL', 'GND', 'GND'],
    ],
    codigo: `${CABECERA('Practica: enciende la bomba con el rele')}
// Mismo pin que usara el sistema de riego (GPIO26).
// El rele se activa y desactiva cada segundo.
const int RELE = 26;

void setup() {
  pinMode(RELE, OUTPUT);
}

void loop() {
  digitalWrite(RELE, HIGH);
  delay(1000);
  digitalWrite(RELE, LOW);
  delay(1000);
}
`,
  },

  'practica-pulsador-manual': {
    conexiones: [...pulsador('PULSADOR MANUAL', 'GPIO27'), ...led('LED ROJO', 'GPIO25')],
    codigo: `${CABECERA('Practica: enciende una luz con el pulsador')}
// El LED rojo (GPIO25) es el mismo que usara el sistema de riego.
const int PULSADOR = 27;
const int LED = 25;

void setup() {
  pinMode(PULSADOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool presionado = (digitalRead(PULSADOR) == LOW);
  digitalWrite(LED, presionado ? HIGH : LOW);
}
`,
  },

  'practica-potenciometro': {
    conexiones: [
      ['POTENCIOMETRO (umbral)', 'Terminal A', '3V3', 'mismo pin que el principal'],
      ['POTENCIOMETRO (umbral)', 'Wiper', 'GPIO35'],
      ['POTENCIOMETRO (umbral)', 'Terminal B', 'GND'],
    ],
    codigo: `${CABECERA('Practica: ajusta el umbral con el potenciometro')}
// Mismo pin que usara el Mini invernadero (GPIO35).
const int POT = 35;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int valor = analogRead(POT);
  Serial.print("Umbral (0-4095): ");
  Serial.println(valor);
  delay(300);
}
`,
  },

  'sistema-riego-automatico': {
    conexiones: [...SUELO, ...RELE, ...BOMBA, ...led('LED ROJO (regando)', 'GPIO25'), ...led('LED VERDE (tierra humeda)', 'GPIO33')],
    codigo: `/*
  Sistema de riego automatico para plantas
  Kit 10mo EGB - ESP32 DevKit V1
  Academia Militar Lizardo Alfonzo Villamarin
  En Arduino IDE: Placa "ESP32 Dev Module". Monitor Serial a 115200.

  Mide la humedad de la tierra. Si esta seca, enciende la bomba de
  agua a traves del rele durante unos segundos y luego espera a que
  el agua se reparta antes de volver a medir.
  LED rojo = regando. LED verde = la tierra tiene suficiente agua.

  ALIMENTACION: la placa y la bomba comparten el mismo cable USB-V8,
  conectado a un cargador de celular de al menos 1A (no incluido). El
  rele toma 5 V del pin VIN y solo conmuta; no necesita fuente aparte.
  El sensor va a 3V3: el ESP32 no tolera 5 V en sus pines.

  NOTA: el valor crudo del sensor (0 a 4095) puede variar segun el
  modelo (algunos dan un numero MAS ALTO cuando la tierra esta mas
  SECA, y otros al reves). Prueba el tuyo e invierte la comparacion
  si hace falta.
*/

const int SENSOR_HUMEDAD = 34;
const int RELE_BOMBA = 26;
const int LED_ROJO = 25;
const int LED_VERDE = 33;

// Usa el valor que anotaste en la practica del sensor para "tierra seca".
const int UMBRAL_SECO = 2400;
const unsigned long TIEMPO_RIEGO_MS = 4000;
const unsigned long TIEMPO_ESPERA_MS = 5000;

void setup() {
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  digitalWrite(RELE_BOMBA, LOW);
  Serial.begin(115200);
}

void loop() {
  int humedad = analogRead(SENSOR_HUMEDAD);
  Serial.print("Humedad: ");
  Serial.println(humedad);

  if (humedad > UMBRAL_SECO) {
    // Tierra seca: regar
    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_ROJO, HIGH);
    digitalWrite(RELE_BOMBA, HIGH);
    delay(TIEMPO_RIEGO_MS);
    digitalWrite(RELE_BOMBA, LOW);
    digitalWrite(LED_ROJO, LOW);
    delay(TIEMPO_ESPERA_MS); // el agua tarda en llegar al sensor
  } else {
    // Tierra humeda: todo bien
    digitalWrite(LED_VERDE, HIGH);
  }

  delay(500);
}
`,
  },

  'control-nivel-agua': {
    conexiones: [
      ...modulo('SENSOR DE NIVEL (humedad)', '3V3', 'AOUT', 'GPIO34', 'ADC1, solo entrada'), ...RELE,
      ...buzzer('BUZZER ACTIVO', 'GPIO13'), ...led('LED ROJO (nivel bajo)', 'GPIO25'), ...led('LED VERDE (nivel ok)', 'GPIO33'),
    ],
    codigo: `${CABECERA('Control de nivel de agua', ' - Proyecto adicional')}
// Mismo armado del sistema de riego. Usa el sensor como si midiera
// el nivel de un tanque: si el nivel (humedad) esta bajo, activa la
// bomba para "llenar" hasta que vuelva a un nivel correcto.
const int SENSOR_NIVEL = 34;
const int RELE_BOMBA = 26;
const int BUZZER = 13;
const int LED_ROJO = 25;
const int LED_VERDE = 33;

const int UMBRAL_BAJO = 2400;

void setup() {
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
}

void loop() {
  int nivel = analogRead(SENSOR_NIVEL);
  bool nivelBajo = (nivel > UMBRAL_BAJO); // valor alto = nivel mas bajo, en este sensor

  digitalWrite(RELE_BOMBA, nivelBajo ? HIGH : LOW);
  digitalWrite(LED_ROJO, nivelBajo ? HIGH : LOW);
  digitalWrite(LED_VERDE, nivelBajo ? LOW : HIGH);
  if (nivelBajo) {
    // Buzzer activo: suena con solo darle energia
    digitalWrite(BUZZER, HIGH);
    delay(100);
    digitalWrite(BUZZER, LOW);
  }

  delay(500);
}
`,
  },

  'mini-invernadero': {
    conexiones: [
      ['SENSOR HUMEDAD SUELO', 'AOUT', 'GPIO34', 'ADC1, solo entrada'],
      ['POTENCIOMETRO (umbral)', 'Wiper', 'GPIO35'],
      ['MODULO RELE 1 CANAL', 'IN', 'GPIO26'],
      ['LED (estado)', 'Ánodo (+) via R330', 'GPIO25'],
      ['PULSADOR MANUAL', 'Pin 1', 'GPIO27', 'INPUT_PULLUP'],
      ['SENSOR HUMEDAD SUELO', 'VCC', '3V3'],
      ['SENSOR HUMEDAD SUELO', 'GND', 'GND'],
      ['POTENCIOMETRO (umbral)', 'Terminal A', '3V3'],
      ['POTENCIOMETRO (umbral)', 'Terminal B', 'GND'],
      ['MODULO RELE 1 CANAL', 'VCC', 'VIN (5V)'],
      ['MODULO RELE 1 CANAL', 'GND', 'GND'],
      ['LED (estado)', 'Cátodo (-)', 'GND'],
      ['PULSADOR MANUAL', 'Pin 2', 'GND'],
    ],
    codigo: `${CABECERA('Mini invernadero inteligente', ' - Proyecto adicional')}
// Mismo armado del sistema de riego. Riega automaticamente segun el
// umbral del potenciometro, o manualmente con el pulsador.
const int SENSOR_HUMEDAD = 34;
const int POTENCIOMETRO = 35;
const int RELE_BOMBA = 26;
const int LED_ESTADO = 25;
const int PULSADOR_MANUAL = 27;

void setup() {
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(LED_ESTADO, OUTPUT);
  pinMode(PULSADOR_MANUAL, INPUT_PULLUP);
}

void loop() {
  int humedad = analogRead(SENSOR_HUMEDAD);
  int umbral = map(analogRead(POTENCIOMETRO), 0, 4095, 1200, 3200);
  bool riego = (humedad > umbral) || (digitalRead(PULSADOR_MANUAL) == LOW);

  digitalWrite(RELE_BOMBA, riego ? HIGH : LOW);
  digitalWrite(LED_ESTADO, riego ? HIGH : LOW);
  delay(300);
}
`,
  },

  'automatizacion-cultivos': {
    conexiones: [...SUELO, ...RELE, ...buzzer('BUZZER ACTIVO', 'GPIO13'), ...led('LED VERDE (cultivo ok)', 'GPIO33')],
    codigo: `${CABECERA('Automatizacion de cultivos', ' - Proyecto adicional')}
// Mismo armado del sistema de riego. En vez de regar todo el tiempo
// que la tierra este seca, riega por pulsos cortos cada cierto
// intervalo usando millis() (sin bloquear el programa con delay()).
const int SENSOR_HUMEDAD = 34;
const int RELE_BOMBA = 26;
const int BUZZER = 13;
const int LED_VERDE = 33;

const unsigned long INTERVALO_REVISION_MS = 5000;
const unsigned long DURACION_RIEGO_MS = 1500;
const int UMBRAL_SECO = 2400;

unsigned long ultimaRevision = 0;

void setup() {
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
}

void loop() {
  if (millis() - ultimaRevision >= INTERVALO_REVISION_MS) {
    ultimaRevision = millis();
    int humedad = analogRead(SENSOR_HUMEDAD);

    if (humedad > UMBRAL_SECO) {
      digitalWrite(RELE_BOMBA, HIGH);
      digitalWrite(BUZZER, HIGH); // buzzer activo: aviso corto
      delay(150);
      digitalWrite(BUZZER, LOW);
      delay(DURACION_RIEGO_MS);
      digitalWrite(RELE_BOMBA, LOW);
      digitalWrite(LED_VERDE, LOW);
    } else {
      digitalWrite(LED_VERDE, HIGH);
    }
  }
}
`,
  },
}

const TEXTOS_KIT = {
  name: 'Sistema de Riego Inteligente con ESP32',
  placa_id: 'placa-esp32-devkit-v1',
  alimentacion: 'Cable USB V8 para programar y alimentar con un cargador de celular de al menos 1 A (cargador NO incluido). La bomba usa esa misma alimentación, pasando por el relé, que toma 5 V del pin VIN.',
  notas: 'El módulo relé ya trae transistor y diodo; se alimenta desde VIN (5 V) y su entrada IN acepta la señal de 3,3 V del ESP32. El sensor de humedad y el potenciómetro van a 3V3, porque el ESP32 no tolera 5 V en sus pines. La bomba se alimenta del mismo USB a través del relé, con GND común con el ESP32.',
}

// ── SQL ──────────────────────────────────────────────────────────────
const q = s => (s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`)
const dolar = (s, tag) => {
  if (s.includes(`$${tag}$`)) throw new Error(`el texto contiene $${tag}$`)
  return `$${tag}$${s}$${tag}$`
}
const proyecto = slug => `(SELECT id FROM kit_proyectos WHERE kit_id = '${KIT}' AND slug = '${slug}')`

let sql = `-- Kit 10mo EGB: Arduino Nano → ESP32 DevKit V1 30 pines.
-- Generado por scripts/decimo-esp32.js (no editar a mano).
-- Mismos 8 proyectos; cambian pines, voltajes, código y guías.
-- Se puede ejecutar más de una vez.

BEGIN;

UPDATE kits SET
  name = ${q(TEXTOS_KIT.name)},
  placa_id = ${q(TEXTOS_KIT.placa_id)},
  alimentacion = ${q(TEXTOS_KIT.alimentacion)},
  notas = ${q(TEXTOS_KIT.notas)}
WHERE id = '${KIT}';

UPDATE kit_materiales SET material_id = 'board-esp32-devkit'
WHERE kit_id = '${KIT}' AND material_id = 'board-nano-v3-microusb';
`

for (const [slug, p] of Object.entries(PROYECTOS)) {
  sql += `\n-- ${slug}\n`
  sql += `DELETE FROM kit_conexiones WHERE proyecto_id = ${proyecto(slug)};\n`
  sql += `INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES\n`
  sql += p.conexiones.map(([c, pc, pp, nota], i) => `  (${proyecto(slug)}, ${q(c)}, ${q(pc)}, ${q(pp)}, ${q(nota)}, ${i + 1})`).join(',\n') + ';\n'
  sql += `UPDATE kit_codigos SET contenido = ${dolar(p.codigo, 'codigo')} WHERE proyecto_id = ${proyecto(slug)};\n`
  if (guias[slug]) sql += `UPDATE kit_proyectos SET guia = ${dolar(JSON.stringify(guias[slug]), 'guia')}::jsonb WHERE id = ${proyecto(slug)};\n`
}

sql += `
COMMIT;

-- Comprobación: la placa del kit y los pines del proyecto principal
SELECT name, placa_id FROM kits WHERE id = '${KIT}';
SELECT componente, pin_componente, pin_placa FROM kit_conexiones
WHERE proyecto_id = ${proyecto('sistema-riego-automatico')} ORDER BY orden;
`

// Comprobaciones antes de escribir: cada paso de guía apunta a una conexión existente.
for (const [slug, g] of Object.entries(guias)) {
  const n = PROYECTOS[slug]?.conexiones.length
  if (!n) throw new Error(`la guía ${slug} no tiene proyecto`)
  for (const paso of g.pasos || []) for (const i of paso.conexiones || []) {
    if (i >= n) throw new Error(`${slug}: el paso "${paso.titulo}" apunta a la conexión ${i}, solo hay ${n}`)
  }
}

const out = path.join(__dirname, '..', 'supabase', 'migrations', '2026_10_decimo_esp32.sql')
fs.writeFileSync(out, sql)
console.log(`SQL generado: ${path.relative(process.cwd(), out)} (${Object.keys(PROYECTOS).length} proyectos)`)
