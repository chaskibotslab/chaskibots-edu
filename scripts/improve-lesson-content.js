/**
 * Script para mejorar el contenido de las lecciones
 * Convierte descripciones básicas en contenido tipo "libro de texto tecnológico"
 * 
 * Uso: node scripts/improve-lesson-content.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// Contenido enriquecido por nivel y tema
const CONTENIDO_ENRIQUECIDO = {
  // INICIAL 1 - ROBÓTICA
  'inicial-1_robotica': {
    'Bienvenidos al curso': `📚 BIENVENIDA AL MUNDO DE LA TECNOLOGÍA

¡Hola pequeño inventor! Bienvenido al emocionante mundo de la robótica.

🎯 EN ESTA LECCIÓN APRENDERÁS:
• Qué es la tecnología
• Para qué sirven los robots
• Cómo será nuestro curso

🤖 ¿QUÉ ES UN ROBOT?
Un robot es una máquina especial que puede:
- Moverse sola
- Hacer tareas repetitivas
- Ayudarnos en el trabajo

📦 TU KIT INCLUYE:
• LEDs de colores (rojo, verde, azul, amarillo)
• Cables de conexión
• Pila CR2032 (como una moneda plateada)
• Stickers conductores
• Cinta de cobre
• Tarjetas ilustradas
• Guía para padres

⚠️ REGLAS DE SEGURIDAD:
1. Siempre trabaja con un adulto
2. No te lleves las piezas a la boca
3. Guarda todo en tu caja al terminar

🎉 ¡Estás listo para comenzar tu aventura tecnológica!`,

    'Qué es un robot': `📚 ¿QUÉ ES UN ROBOT?

🤖 DEFINICIÓN SIMPLE:
Un robot es una máquina que puede hacer cosas por sí sola, siguiendo instrucciones.

🧠 PARTES DE UN ROBOT:
1. CEREBRO (Computadora) - Piensa y decide
2. OJOS (Sensores) - Ve y siente el mundo
3. MANOS/PIES (Motores) - Se mueve y trabaja
4. ENERGÍA (Batería) - Le da fuerza para funcionar

🏠 ROBOTS EN TU CASA:
• Aspiradora robot - Limpia el piso sola
• Lavadora - Lava la ropa automáticamente
• Microondas - Calienta comida con un botón

🎯 ACTIVIDAD:
Dibuja un robot y señala sus partes:
□ Cerebro
□ Ojos (sensores)
□ Manos o ruedas
□ Donde va la batería

💡 DATO CURIOSO:
La palabra "robot" viene del checo "robota" que significa "trabajo forzado".`,

    'LEDs mágicos': `📚 LEDS MÁGICOS - TU PRIMERA LUZ

💡 ¿QUÉ ES UN LED?
LED significa "Diodo Emisor de Luz". Es una lucecita pequeña que:
- Gasta muy poca energía
- No se calienta como un foco normal
- Puede ser de muchos colores

🌈 COLORES DE LED EN TU KIT:
• 🔴 ROJO - Pata larga al +
• 🟢 VERDE - Pata larga al +
• 🔵 AZUL - Pata larga al +
• 🟡 AMARILLO - Pata larga al +

⚡ CÓMO ENCENDER UN LED:
1. Identifica la pata LARGA (es el +, positivo)
2. Identifica la pata CORTA (es el -, negativo)
3. Conecta la pata larga al + de la pila
4. Conecta la pata corta al - de la pila
5. ¡El LED se enciende!

📋 MATERIALES:
• 1 LED de cualquier color
• 1 Pila CR2032
• Tus dedos para sostener

🔧 PASO A PASO:
1. Toma la pila (lado + tiene un símbolo +)
2. Pon la pata larga del LED tocando el +
3. Pon la pata corta tocando el otro lado
4. ¡Brilla!

✅ COMPLETA:
□ Encendí un LED rojo
□ Encendí un LED verde
□ Encendí un LED azul`,

    'Circuito con stickers': `📚 PROYECTO: CIRCUITO CON STICKERS CONDUCTORES

🎨 ¿QUÉ SON LOS STICKERS CONDUCTORES?
Son stickers especiales que dejan pasar la electricidad. ¡Puedes hacer circuitos pegándolos!

📋 MATERIALES DE TU KIT:
• Stickers conductores (plateados)
• 2 LEDs de colores
• Pila CR2032
• Hoja de papel grueso
• Colores para decorar

🔧 INSTRUCCIONES PASO A PASO:

PASO 1: DIBUJA TU DISEÑO
- Dibuja una casa, un árbol, o lo que quieras
- Marca dónde irán las luces (ventanas, estrellas, etc.)

PASO 2: PEGA EL CAMINO
- Pega stickers conductores haciendo un camino
- El camino debe ir desde donde pondrás la pila hasta los LEDs

PASO 3: COLOCA LOS LEDS
- Pata larga del LED sobre el sticker del camino +
- Pata corta sobre el sticker del camino -

PASO 4: CONECTA LA PILA
- Pon la pila al final del camino
- Lado + tocando el camino +
- Lado - tocando el camino -

PASO 5: ¡ENCIENDE!
- Presiona suavemente la pila
- ¡Tu dibujo se ilumina!

🏆 RETO EXTRA:
¿Puedes hacer que 2 LEDs se enciendan al mismo tiempo?`,
  },

  // INICIAL 2 - ROBÓTICA (con Generador Eólico)
  'inicial-2_robotica': {
    'Bienvenidos de vuelta': `📚 ¡BIENVENIDOS AL SEGUNDO AÑO!

🎉 ¡Hola de nuevo, pequeño ingeniero!

Este año aprenderemos cosas más emocionantes. Ya sabes encender LEDs, ahora haremos cosas que se MUEVEN.

📦 TU KIT DE ESTE AÑO INCLUYE:
• LED y cables jumper
• Pila CR 2032
• Adhesivo temático de robótica
• Cinta de cobre
• 🌬️ GENERADOR EÓLICO (¡nuevo!)
• Caja de herramientas plástica

🎯 ESTE AÑO APRENDERÁS:
• Circuitos más grandes
• Energía del viento
• Cómo funciona un generador
• Construir tu propio generador eólico

📝 REPASO RÁPIDO:
¿Recuerdas qué necesita un circuito?
1. Fuente de energía (pila)
2. Cables (camino)
3. Componente (LED)
4. Circuito CERRADO

¡Prepárate para una aventura increíble!`,

    'Primer Circuito con LED': `📚 REPASO: MI PRIMER CIRCUITO

⚡ ¿QUÉ ES UN CIRCUITO?
Un circuito es un camino CERRADO por donde viaja la electricidad.

🔄 PARTES DEL CIRCUITO:
┌─────────────────────────────┐
│  PILA (+) ──► CABLE ──► LED │
│    ▲                    │   │
│    └──── CABLE ◄────────┘   │
└─────────────────────────────┘

📋 MATERIALES:
• 1 LED (el que prefieras)
• Cinta de cobre
• Pila CR2032
• Plantilla de papel

🔧 PASO A PASO:

1️⃣ PREPARA LA PLANTILLA
   - Toma tu hoja de papel
   - Dibuja dos líneas paralelas (serán los caminos)

2️⃣ PEGA LA CINTA DE COBRE
   - Pega cinta de cobre sobre cada línea
   - Una línea será el camino + (positivo)
   - Otra línea será el camino - (negativo)

3️⃣ COLOCA EL LED
   - Pata LARGA sobre la cinta +
   - Pata CORTA sobre la cinta -
   - Dobla las patas para que toquen bien

4️⃣ CONECTA LA PILA
   - Lado + de la pila toca la cinta +
   - Lado - de la pila toca la cinta -

5️⃣ ¡ENCIENDE!
   - Si no enciende, revisa las conexiones
   - ¿Está todo bien pegado?

✅ LISTA DE VERIFICACIÓN:
□ Mi cinta de cobre está bien pegada
□ El LED tiene la pata larga en el +
□ La pila está bien conectada
□ ¡Mi LED enciende!`,

    'Energía Renovable': `📚 ENERGÍA RENOVABLE - EL PODER DEL VIENTO

🌍 ¿DE DÓNDE VIENE LA ELECTRICIDAD?

La electricidad puede venir de diferentes fuentes:

❌ ENERGÍA NO RENOVABLE (se acaba):
• Petróleo
• Gas natural
• Carbón
Problema: Contaminan y se van a acabar

✅ ENERGÍA RENOVABLE (no se acaba):
• ☀️ Sol (energía solar)
• 💨 Viento (energía eólica)
• 💧 Agua (energía hidroeléctrica)
Ventaja: Limpia y nunca se acaba

🌬️ ENERGÍA EÓLICA
"Eólico" viene de Eolo, el dios griego del viento.

¿CÓMO FUNCIONA?
1. El viento sopla
2. Las aspas del molino giran
3. El movimiento genera electricidad
4. ¡Tenemos energía limpia!

🎯 EXPERIMENTO SIMPLE:
1. Toma un molinete de papel
2. Sopla sobre él
3. ¿Qué pasa? ¡GIRA!
4. Ese movimiento puede generar electricidad

📊 DATO INCREÍBLE:
Un aerogenerador grande puede dar electricidad a 1,500 casas.

🌱 ¿POR QUÉ ES IMPORTANTE?
• No contamina el aire
• El viento es GRATIS
• Ayuda al planeta`,

    'Experimentos con Viento': `📚 EXPERIMENTOS CON EL GENERADOR EÓLICO

🌬️ TU GENERADOR EÓLICO

El generador eólico de tu kit convierte el movimiento del viento en electricidad.

📋 MATERIALES:
• Generador eólico (de tu kit)
• LED
• Cables
• ¡Tu soplido!

🔧 EXPERIMENTO 1: ENCENDER UN LED CON VIENTO

PASO 1: Arma el generador
- Coloca las aspas en el eje
- Asegúrate de que giren libremente

PASO 2: Conecta el LED
- Cable rojo del generador → pata larga del LED
- Cable negro del generador → pata corta del LED

PASO 3: ¡Sopla!
- Sopla fuerte sobre las aspas
- ¡El LED debe encenderse!

🔬 EXPERIMENTO 2: VIENTO SUAVE VS FUERTE

Prueba esto:
• Sopla SUAVE → LED brilla poco
• Sopla FUERTE → LED brilla más

¿Por qué? Más viento = más movimiento = más electricidad

📊 REGISTRA TUS RESULTADOS:
┌──────────────┬─────────────┐
│ Tipo de soplo│ Brillo LED  │
├──────────────┼─────────────┤
│ Suave        │ □Poco □Nada │
│ Normal       │ □Medio      │
│ Fuerte       │ □Mucho      │
└──────────────┴─────────────┘

🏆 RETO:
¿Puedes encender 2 LEDs al mismo tiempo?
Necesitarás soplar muy fuerte o usar un ventilador.`,

    'Feria de Robótica': `📚 PROYECTO FINAL: FERIA DE ROBÓTICA

🎉 ¡FELICIDADES! Has llegado al final del curso.

Es hora de mostrar todo lo que aprendiste en una FERIA DE ROBÓTICA.

📋 TU PRESENTACIÓN INCLUIRÁ:

1️⃣ CIRCUITO CON LED
- Muestra cómo enciendes un LED
- Explica las partes del circuito

2️⃣ GENERADOR EÓLICO
- Demuestra cómo el viento genera electricidad
- Explica por qué es energía limpia

3️⃣ EXPLICACIÓN ORAL
Prepara respuestas para:
• ¿Qué es un circuito?
• ¿Qué es energía renovable?
• ¿Cómo funciona tu generador?

🎤 GUIÓN PARA TU PRESENTACIÓN:

"Hola, me llamo _______.
Hoy les voy a mostrar mi generador eólico.

Primero, el viento hace girar las aspas.
Después, el generador convierte el movimiento en electricidad.
Finalmente, la electricidad enciende el LED.

La energía eólica es importante porque:
- No contamina
- El viento es gratis
- Ayuda al planeta

¡Gracias por su atención!"

🏆 CERTIFICADO:
Al terminar recibirás tu certificado de:
"PEQUEÑO INGENIERO NIVEL 2"

¡Felicidades por completar el curso!`,
  },

  // OCTAVO EGB - ESP32
  'octavo-egb_robotica': {
    'ESP32': `📚 INTRODUCCIÓN AL ESP32

🔌 ¿QUÉ ES EL ESP32?
El ESP32 es un microcontrolador potente con WiFi y Bluetooth integrados.

📦 TU KIT INCLUYE:
• ESP32 de 30 pines
• TB6612FNG (driver de motores)
• 2 Motores reductores TT
• Adaptador de batería
• Switch 3 terminales
• Cables jumper (M-M, M-H, H-H)
• Placa controladora
• Chassis impreso en 3D
• Tornillos M3

⚡ ESPECIFICACIONES ESP32:
• Procesador: Dual-core 240MHz
• WiFi: 802.11 b/g/n
• Bluetooth: v4.2 BR/EDR y BLE
• GPIO: 30 pines
• ADC: 18 canales
• Voltaje: 3.3V

🔧 CONEXIONES BÁSICAS:
┌─────────────────────────────┐
│ ESP32          TB6612FNG    │
│ ─────          ──────────   │
│ GPIO 25   →    AIN1         │
│ GPIO 26   →    AIN2         │
│ GPIO 27   →    BIN1         │
│ GPIO 14   →    BIN2         │
│ GPIO 32   →    PWMA         │
│ GPIO 33   →    PWMB         │
│ GND       →    GND          │
│ VIN       →    VM (motor)   │
└─────────────────────────────┘

💻 CÓDIGO BÁSICO (Arduino IDE):
\`\`\`cpp
// Definir pines
#define AIN1 25
#define AIN2 26
#define PWMA 32

void setup() {
  pinMode(AIN1, OUTPUT);
  pinMode(AIN2, OUTPUT);
  pinMode(PWMA, OUTPUT);
}

void loop() {
  // Motor adelante
  digitalWrite(AIN1, HIGH);
  digitalWrite(AIN2, LOW);
  analogWrite(PWMA, 200);
  delay(2000);
  
  // Motor atrás
  digitalWrite(AIN1, LOW);
  digitalWrite(AIN2, HIGH);
  analogWrite(PWMA, 200);
  delay(2000);
}
\`\`\``,
  },

  // NOVENO EGB - Seguidor de línea
  'noveno-egb_robotica': {
    'Seguidor': `📚 ROBOT SEGUIDOR DE LÍNEA

🤖 ¿QUÉ ES UN SEGUIDOR DE LÍNEA?
Un robot que detecta y sigue una línea negra sobre fondo blanco.

📦 TU KIT INCLUYE:
• 2 Sensores infrarrojos
• TB6612FNG (driver)
• ESP Super Mini
• 2 Motores reductores TT
• Chassis impreso en 3D
• Adaptador de batería
• Cables jumper

🔍 CÓMO FUNCIONAN LOS SENSORES IR:
1. El sensor emite luz infrarroja
2. La superficie refleja la luz
3. Blanco = mucha reflexión = sensor detecta
4. Negro = poca reflexión = sensor no detecta

📊 LÓGICA DEL SEGUIDOR:
┌─────────────┬─────────────┬─────────────┐
│ Sensor Izq  │ Sensor Der  │ Acción      │
├─────────────┼─────────────┼─────────────┤
│ Blanco      │ Blanco      │ Adelante    │
│ Negro       │ Blanco      │ Girar Izq   │
│ Blanco      │ Negro       │ Girar Der   │
│ Negro       │ Negro       │ Detenerse   │
└─────────────┴─────────────┴─────────────┘

💻 CÓDIGO:
\`\`\`cpp
#define SENSOR_IZQ 34
#define SENSOR_DER 35

void loop() {
  int izq = digitalRead(SENSOR_IZQ);
  int der = digitalRead(SENSOR_DER);
  
  if (izq == HIGH && der == HIGH) {
    adelante();
  } else if (izq == LOW && der == HIGH) {
    girarIzquierda();
  } else if (izq == HIGH && der == LOW) {
    girarDerecha();
  } else {
    detener();
  }
}
\`\`\`

🏁 CALIBRACIÓN:
1. Coloca el robot sobre línea negra
2. Ajusta la sensibilidad con el potenciómetro
3. El LED del sensor debe cambiar al pasar de blanco a negro`,
  },

  // PRIMERO BACHILLERATO - Arduino Nano / Robot Otto
  'primero-bach_robotica': {
    'Otto': `📚 ROBOT OTTO CON ARDUINO NANO

🤖 ¿QUÉ ES OTTO?
Otto es un robot bípedo de código abierto que camina, baila y evita obstáculos.

📦 TU KIT INCLUYE:
• 4 Servo motores SG90
• Arduino Nano
• Shield para Arduino Nano
• Sensor ultrasónico HC-SR04
• Buzzer
• Porta pilas AA×4
• Piezas impresas en 3D
• Cables jumper

🔧 CONEXIONES:
┌─────────────────────────────┐
│ Arduino Nano    Componente  │
│ ────────────    ──────────  │
│ D2          →   Servo Pie Izq│
│ D3          →   Servo Pie Der│
│ D4          →   Servo Pierna Izq│
│ D5          →   Servo Pierna Der│
│ D6          →   Trigger US  │
│ D7          →   Echo US     │
│ D8          →   Buzzer      │
│ VIN         →   Porta pilas │
│ GND         →   GND común   │
└─────────────────────────────┘

💻 CÓDIGO BÁSICO:
\`\`\`cpp
#include <Servo.h>
#include <Otto.h>

Otto Otto;

void setup() {
  Otto.init(2, 3, 4, 5, true, 6, 7, 8);
  Otto.home();
}

void loop() {
  Otto.walk(2, 1000, 1); // 2 pasos adelante
  Otto.turn(2, 1000, 1); // Girar
  
  int distancia = Otto.getDistance();
  if (distancia < 15) {
    Otto.sing(S_surprise);
    Otto.walk(2, 1000, -1); // Retroceder
  }
}
\`\`\`

🎵 FUNCIONES DE OTTO:
• Otto.walk() - Caminar
• Otto.turn() - Girar
• Otto.bend() - Inclinarse
• Otto.shakeLeg() - Mover pierna
• Otto.moonwalker() - Moonwalk
• Otto.sing() - Reproducir sonido`,
  },
};

async function fetchAllLessons() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?pageSize=100`;
  let allRecords = [];
  let offset = null;
  
  do {
    const fetchUrl = offset ? `${url}&offset=${offset}` : url;
    const response = await fetch(fetchUrl, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    
    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
    
    await new Promise(resolve => setTimeout(resolve, 200));
  } while (offset);
  
  return allRecords;
}

function findBestContent(lesson) {
  const fields = lesson.fields;
  const levelId = fields.levelId || '';
  const programId = fields.programId || 'robotica';
  const title = (fields.title || '').toLowerCase();
  
  const key = `${levelId}_${programId}`;
  const contentMap = CONTENIDO_ENRIQUECIDO[key];
  
  if (!contentMap) return null;
  
  // Buscar por título parcial
  for (const [keyword, content] of Object.entries(contentMap)) {
    if (title.includes(keyword.toLowerCase())) {
      return content;
    }
  }
  
  return null;
}

async function updateLesson(recordId, content) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons/${recordId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: { content } }),
  });
  
  return response.ok;
}

async function main() {
  console.log('📚 Mejorando contenido de lecciones...\n');
  
  const lessons = await fetchAllLessons();
  console.log(`Total lecciones: ${lessons.length}\n`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const lesson of lessons) {
    const newContent = findBestContent(lesson);
    
    if (newContent) {
      const success = await updateLesson(lesson.id, newContent);
      if (success) {
        updated++;
        console.log(`✅ "${lesson.fields.title}" → Contenido mejorado`);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      skipped++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMEN:`);
  console.log(`   ✅ Mejoradas: ${updated}`);
  console.log(`   ⏭️  Sin cambios: ${skipped}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
