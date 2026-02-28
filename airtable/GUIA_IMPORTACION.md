# 📋 GUÍA DE IMPORTACIÓN A AIRTABLE - ChaskiBots EDU

## ⚠️ IMPORTANTE: Lee esto primero

Tu contenido actual de **Robótica** (tabla `lessons`) **NO se verá afectado** si sigues estas instrucciones. Los nuevos CSVs usan los mismos `levelId` que ya tienes, por lo que se **compaginan** perfectamente.

---

## 📁 ARCHIVOS A IMPORTAR (en orden)

### 1️⃣ TABLAS BASE (si no las tienes ya)

| Archivo | Tabla en Airtable | Registros | ¿Ya existe? |
|---------|-------------------|-----------|-------------|
| `levels.csv` | Levels | 18 | ✅ Probablemente sí |
| `simulators.csv` | Simulators | 7 | ✅ Probablemente sí |
| `programs.csv` | Programs | 27 | ✅ Probablemente sí |

---

### 2️⃣ LECCIONES NUEVAS (CREAR TABLAS SEPARADAS)

| Archivo | Tabla Nueva | Registros | Descripción |
|---------|-------------|-----------|-------------|
| `lessons_ia_v2.csv` | **lessons_ia** | 156 | Lecciones de IA con simuladores |
| `lessons_hacking_v2.csv` | **lessons_hacking** | 120 | Lecciones de Hacking con simuladores |

**Columnas de estos CSVs:**
- `levelId` - Vincula con tabla Levels
- `moduleName` - Nombre del módulo
- `title` - Título de la lección
- `type` - video/tutorial/activity/project
- `duration` - Duración estimada
- `order` - Orden dentro del nivel
- `videoUrl` - URL del video (vacío para agregar después)
- `content` - Descripción del contenido
- `locked` - true/false
- `programId` - "ia" o "hacking"
- `simulatorId` - Vincula con tabla Simulators (scratch, wokwi, colab, etc.)

---

### 3️⃣ TAREAS

| Archivo | Tabla | Registros | Descripción |
|---------|-------|-----------|-------------|
| `tasks_ia_hacking.csv` | **tasks_ia_hacking** | 96 | Tareas para IA y Hacking |

**Columnas:**
- `levelId` - Vincula con Levels
- `moduleName` - Módulo relacionado
- `taskTitle` - Título de la tarea
- `taskType` - dibujo/actividad/práctica/proyecto/investigación
- `description` - Descripción detallada
- `dueWeek` - Semana de entrega
- `points` - Puntos
- `category` - "ia" o "hacking"

---

## 🔧 PASOS PARA IMPORTAR

### Paso 1: Crear tabla `lessons_ia`
1. Ir a Airtable → Tu base de ChaskiBots
2. Click en **"+ Add a table"** → **"Import data"**
3. Seleccionar `lessons_ia_v2.csv`
4. Nombrar la tabla: `lessons_ia`
5. Verificar que las columnas se mapeen correctamente

### Paso 2: Crear tabla `lessons_hacking`
1. Click en **"+ Add a table"** → **"Import data"**
2. Seleccionar `lessons_hacking_v2.csv`
3. Nombrar la tabla: `lessons_hacking`

### Paso 3: Crear tabla `tasks_ia_hacking`
1. Click en **"+ Add a table"** → **"Import data"**
2. Seleccionar `tasks_ia_hacking.csv`
3. Nombrar la tabla: `tasks_ia_hacking`

### Paso 4: Vincular tablas (opcional pero recomendado)
1. En `lessons_ia`, cambiar `levelId` a tipo **Link to another record** → Levels
2. En `lessons_ia`, cambiar `simulatorId` a tipo **Link to another record** → Simulators
3. Repetir para `lessons_hacking` y `tasks_ia_hacking`

---

## 📊 RESUMEN FINAL

| Tabla | Registros | Programa |
|-------|-----------|----------|
| lessons (existente) | 173 | Robótica |
| lessons_ia (nueva) | 156 | IA |
| lessons_hacking (nueva) | 120 | Hacking |
| tasks_ia_hacking (nueva) | 96 | IA + Hacking |
| **TOTAL NUEVO** | **372** | - |

---

## ✅ CHECKLIST DE IMPORTACIÓN

- [ ] Crear tabla `lessons_ia` desde `lessons_ia_v2.csv`
- [ ] Crear tabla `lessons_hacking` desde `lessons_hacking_v2.csv`
- [ ] Crear tabla `tasks_ia_hacking` desde `tasks_ia_hacking.csv`
- [ ] Verificar que los `levelId` coincidan con tu tabla Levels
- [ ] Verificar que los `simulatorId` coincidan con tu tabla Simulators
- [ ] Agregar videos a las lecciones (campo `videoUrl`)

---

## 🗂️ ARCHIVOS EN TU CARPETA airtable/

### Para importar (NUEVOS):
```
lessons_ia_v2.csv        ← 156 lecciones de IA
lessons_hacking_v2.csv   ← 120 lecciones de Hacking
tasks_ia_hacking.csv     ← 96 tareas
```

### Documentación (NO importar, solo referencia):
```
DOC_TEMARIO_ROBOTICA.md  ← Documentación Robótica
DOC_TEMARIO_IA.md        ← Documentación IA
DOC_TEMARIO_HACKING.md   ← Documentación Hacking
GUIA_IMPORTACION.md      ← Este archivo
```

### Ya existentes (probablemente ya importados):
```
levels.csv               ← 18 niveles
simulators.csv           ← 7 simuladores
programs.csv             ← 27 programas
lessons.csv              ← Robótica existente
```

---

*Generado para ChaskiBots EDU*
