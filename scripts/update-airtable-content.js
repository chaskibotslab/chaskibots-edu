const fs = require('fs');

// Leer credenciales
let AIRTABLE_API_KEY = '';
let AIRTABLE_BASE_ID = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('AIRTABLE_API_KEY=')) AIRTABLE_API_KEY = line.split('=')[1].trim();
    if (line.startsWith('AIRTABLE_BASE_ID=')) AIRTABLE_BASE_ID = line.split('=')[1].trim();
  });
} catch (e) {
  console.log('Error leyendo .env.local');
  process.exit(1);
}

// Contenido mejorado para actualizar
const contentUpdates = [
  {
    filter: { levelId: 'noveno-egb', title: 'Arquitectura de sistemas embebidos', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=K3e8Hn3HYXE',
      content: `# Arquitectura de Sistemas Embebidos

## 🎯 Objetivos de Aprendizaje
Al finalizar esta lección podrás:
- Definir qué es un sistema embebido
- Identificar componentes: CPU, memoria, periféricos
- Reconocer aplicaciones reales

## 📹 Video Tutorial
Mira el video explicativo sobre arquitectura de sistemas embebidos.

## 📚 Contenido Teórico

### ¿Qué es un Sistema Embebido?
Un sistema embebido es una computadora especializada diseñada para tareas específicas, optimizada para:
- **Bajo consumo** de energía
- **Tamaño reducido**
- **Alta confiabilidad**

### Componentes Principales
1. **Microcontrolador (MCU)**
   - CPU: Procesa instrucciones
   - RAM: 2KB-256KB típico
   - Flash: 16KB-2MB típico

2. **Periféricos**
   - GPIO, ADC, UART, SPI, I2C, PWM

### Ejemplos Reales
- Marcapasos cardíacos
- Sistemas de frenos ABS
- Drones y robots
- Electrodomésticos inteligentes

## 💻 Actividad Práctica
1. Lista 5 sistemas embebidos en tu casa
2. Investiga qué MCU usa Arduino UNO
3. Compara Arduino vs ESP32

## 📖 Recursos
- Datasheet ATmega328P
- Tutorial ARM Cortex-M`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'RTOS: Sistemas operativos de tiempo real', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=F321087yYy4',
      content: `# RTOS: Sistemas Operativos de Tiempo Real

## 🎯 Objetivos
- Entender qué es un RTOS
- Conocer FreeRTOS
- Implementar tareas concurrentes

## 📹 Video Tutorial
Aprende los fundamentos de FreeRTOS.

## 📚 Contenido

### ¿Por qué usar RTOS?
Permite ejecutar múltiples tareas "simultáneamente" con garantías de tiempo.

### Conceptos Clave
- **Tasks**: Funciones independientes
- **Scheduler**: Decide qué ejecutar
- **Prioridades**: Tareas críticas primero
- **Queues**: Comunicación entre tareas
- **Semaphores**: Sincronización

### Código de Ejemplo
\`\`\`cpp
void tareaLED(void *params) {
    while(1) {
        digitalWrite(LED, !digitalRead(LED));
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}

void tareaSensor(void *params) {
    while(1) {
        int valor = analogRead(SENSOR);
        Serial.println(valor);
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
}
\`\`\`

## 💻 Práctica
Usa el simulador Wokwi para probar FreeRTOS en ESP32.

## 📖 Recursos
- Documentación FreeRTOS
- Tutorial ESP32 + FreeRTOS`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Bajo consumo de energía', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=9FLKm2Gq5Pg',
      content: `# Técnicas de Bajo Consumo

## 🎯 Objetivos
- Comprender modos de bajo consumo
- Implementar deep sleep
- Diseñar sistemas IoT eficientes

## 📚 Contenido

### Modos de Consumo ESP32
| Modo | Corriente | Duración batería 2000mAh |
|------|-----------|--------------------------|
| Activo | 240mA | 8 horas |
| Modem Sleep | 20mA | 4 días |
| Light Sleep | 0.8mA | 104 días |
| Deep Sleep | 10µA | 22 años |

### Código Deep Sleep
\`\`\`cpp
#include <esp_sleep.h>

void setup() {
    // Hacer trabajo
    leerSensor();
    enviarDatos();
    
    // Dormir 1 hora
    esp_sleep_enable_timer_wakeup(3600 * 1000000);
    esp_deep_sleep_start();
}
\`\`\`

### Técnicas de Optimización
1. Reducir frecuencia CPU
2. Apagar WiFi/BT cuando no se usen
3. Usar interrupciones vs polling

## 💻 Práctica
Calcula cuánto duraría tu proyecto con batería.`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Proyecto: Sensor IoT con batería', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=oCMOYS71NIU',
      content: `# Proyecto: Sensor IoT de Bajo Consumo

## 🎯 Objetivo
Crear un sensor que funcione 6 meses con batería.

## 📋 Materiales
- ESP32 DevKit
- Sensor DHT22
- Batería LiPo 2000mAh

## 📚 Implementación

### Circuito
ESP32 GPIO4 → DHT22 DATA
ESP32 3.3V → DHT22 VCC
ESP32 GND → DHT22 GND

### Código
\`\`\`cpp
#include <WiFi.h>
#include <DHT.h>
#include <esp_sleep.h>

DHT dht(4, DHT22);

void setup() {
    dht.begin();
    
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    
    WiFi.begin("SSID", "PASS");
    // Enviar a ThingSpeak
    
    WiFi.disconnect(true);
    esp_sleep_enable_timer_wakeup(3600000000);
    esp_deep_sleep_start();
}
\`\`\`

## 🏆 Evaluación
- Sensor funciona: 25%
- Datos en la nube: 25%
- Deep sleep: 25%
- Cálculo batería: 25%`
    }
  }
];

async function findAndUpdate() {
  console.log('Buscando lecciones para actualizar...\n');
  
  for (const update of contentUpdates) {
    const { levelId, title, programId } = update.filter;
    
    // Buscar el registro
    const filterFormula = `AND({levelId}="${levelId}",{title}="${title}",{programId}="${programId}")`;
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?filterByFormula=${encodeURIComponent(filterFormula)}`;
    
    try {
      const searchResp = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
      });
      const searchData = await searchResp.json();
      
      if (searchData.records && searchData.records.length > 0) {
        const recordId = searchData.records[0].id;
        
        // Actualizar el registro
        const updateUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons/${recordId}`;
        const updateResp = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields: update.updates })
        });
        
        if (updateResp.ok) {
          console.log(`✅ Actualizado: ${title}`);
        } else {
          const error = await updateResp.text();
          console.log(`❌ Error en ${title}: ${error}`);
        }
      } else {
        console.log(`⚠️ No encontrado: ${title}`);
      }
      
      // Esperar para no exceder límites
      await new Promise(r => setTimeout(r, 250));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Actualización completada');
}

findAndUpdate();
