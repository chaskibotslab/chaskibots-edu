# 📥 Instrucciones para Importar Tablas a Airtable

## Tablas a Crear

Necesitas crear **2 tablas** en tu base de Airtable:

---

## 1️⃣ Tabla: `kits`

### Paso 1: Crear la tabla
1. Ve a tu base de Airtable
2. Click en **"+ Add or import"** → **"Import data"** → **"CSV file"**
3. Selecciona el archivo: `kits_para_importar.csv`

### Paso 2: Configurar tipos de campo
Después de importar, ajusta los tipos de campo:

| Campo | Tipo en Airtable |
|-------|------------------|
| `Name` | Single line text (Primary) |
| `levelId` | Single line text |
| `description` | Long text |
| `price` | Number |
| `components` | Long text |
| `skills` | Long text |
| `image_urls` | Long text |
| `videoUrl` | URL |
| `tutorialUrl` | URL |

### Datos incluidos (15 kits):
- Kit Inicial 1 - Mis Primeras Luces
- Kit Inicial 2
- Kit 3 Robots Preparatoria
- Kit 3 Robots Elemental (2° y 3° EGB)
- Kit Rueda de la Fortuna + FM
- Kit Rueda + Radio RF-FM
- Kit Robot 4 en 1 + Circuito
- Kit Robot 4 en 1 + Avión
- Carro Bluetooth WiFi ESP32
- Seguidor de Línea 2 Sensores
- Robot Evita Obstáculos
- Robot Otto + Kit Práctico
- Kit Robot Soccer y Mini Sumo
- Kit IoT ESP32

---

## 2️⃣ Tabla: `simulators`

### Paso 1: Crear la tabla
1. Click en **"+ Add or import"** → **"Import data"** → **"CSV file"**
2. Selecciona el archivo: `simulators_v2.csv`

### Paso 2: Configurar tipos de campo

| Campo | Tipo en Airtable |
|-------|------------------|
| `id` | Single line text (Primary) |
| `name` | Single line text |
| `description` | Long text |
| `icon` | Single line text |
| `url` | URL |
| `levels` | Long text |
| `programs` | Long text |
| `enabled` | Checkbox |

### Simuladores incluidos (12):
1. **Scratch** - Programación visual con bloques
2. **MakeCode Arcade** - Crea videojuegos retro
3. **Tinkercad Circuits** - Simulador de circuitos Arduino
4. **Wokwi ESP32** - Simulador ESP32 avanzado
5. **Python Tutor** - Visualiza código Python
6. **Google Colab** - Notebooks para IA
7. **Teachable Machine** - Entrena modelos de IA
8. **Blockly Games** - Juegos de programación
9. **Trinket Python** - Python en navegador
10. **PicoCTF** - Plataforma CTF principiantes
11. **TryHackMe** - Laboratorios de hacking
12. **HackTheBox** - Práctica de pentesting

---

## ⚠️ IMPORTANTE: Verificar Permisos del Token

Después de crear las tablas, verifica que tu token de API tenga acceso:

1. Ve a: https://airtable.com/create/tokens
2. Busca tu token (el que usas en `.env.local`)
3. Click en **"Edit"**
4. En **"Scopes"**, asegúrate de tener:
   - `data.records:read`
   - `data.records:write`
5. En **"Access"**, verifica que tu base esté incluida
6. Si agregaste tablas nuevas, click en **"Regenerate"** o actualiza el acceso

---

## 🧪 Probar que Funciona

Después de importar, prueba las APIs:

```bash
# Probar kits
curl http://localhost:3000/api/kits

# Probar simulators
curl http://localhost:3000/api/simulators
```

O en el navegador:
- http://localhost:3000/api/kits
- http://localhost:3000/api/simulators

---

## 📁 Archivos CSV Ubicación

Los archivos están en:
```
c:\Users\CHASKI\CascadeProjects\chaskibots-edu\airtable\
├── kits_para_importar.csv      ← Para tabla kits
└── simulators_v2.csv           ← Para tabla simulators
```

---

¡Listo! Una vez importadas las tablas, tu plataforma estará 100% funcional.
