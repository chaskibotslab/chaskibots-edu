# 📁 Estructura de Datos - ChaskiBots EDU

Esta carpeta contiene todos los datos de los cursos organizados por nivel educativo.

## 📂 Estructura de Carpetas

```
src/data/
├── README.md              ← Este archivo
└── courses/
    ├── index.ts           ← Exporta todos los cursos
    ├── types.ts           ← Tipos TypeScript
    ├── inicial-1.ts       ← Curso Inicial 1 (3-4 años)
    ├── inicial-2.ts       ← Curso Inicial 2 (4-5 años)
    ├── primero-egb.ts     ← (Por crear) 1° EGB
    ├── segundo-egb.ts     ← (Por crear) 2° EGB
    └── ...                ← Más cursos
```

## 🎯 Cómo Agregar un Nuevo Curso

### Paso 1: Crear el archivo del curso

Crea un nuevo archivo en `courses/` con el nombre del nivel:

```typescript
// courses/primero-egb.ts

import { CourseData } from './types'

export const PRIMERO_EGB: CourseData = {
  id: 'primero-egb',
  title: 'Curso 1° EGB - Nombre del Curso',
  description: 'Descripción del curso',
  duration: '9 meses',
  totalLessons: 20,
  modules: [
    // ... módulos y lecciones
  ],
  kit: {
    // ... información del kit
  },
  yearPlan: [
    // ... plan del año
  ]
}
```

### Paso 2: Exportar en index.ts

Agrega el export en `courses/index.ts`:

```typescript
// Agregar import
export { PRIMERO_EGB } from './primero-egb'
import { PRIMERO_EGB } from './primero-egb'

// Agregar al objeto ALL_COURSES
export const ALL_COURSES: Record<string, CourseData> = {
  'inicial-1': INICIAL_1,
  'inicial-2': INICIAL_2,
  'primero-egb': PRIMERO_EGB,  // ← Agregar aquí
}
```

## 📝 Estructura de un Curso

Cada curso tiene la siguiente estructura:

```typescript
interface CourseData {
  id: string              // ID único (ej: 'inicial-1')
  title: string           // Título completo
  description: string     // Descripción breve
  duration: string        // Duración (ej: '9 meses')
  totalLessons: number    // Total de lecciones
  modules: Module[]       // Array de módulos
  kit: Kit                // Información del kit
  yearPlan: YearPlanItem[] // Plan del año escolar
}
```

### Módulos y Lecciones

```typescript
interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
  duration: string
  completed: boolean
  locked: boolean
  videoUrl?: string      // URL del video (Google Drive o YouTube)
  content?: string       // Descripción del contenido
  steps?: string[]       // Pasos para tutoriales
}
```

### Kit de Robótica

```typescript
interface Kit {
  name: string
  price: number
  components: string[]
  assemblySteps: AssemblyStep[]
}

interface AssemblyStep {
  step: number
  title: string
  description: string
  image?: string         // URL de imagen
  videoUrl?: string      // URL de video tutorial
}
```

## 🔗 Agregar Videos e Imágenes

### Desde Google Drive:

1. Sube el archivo a Google Drive
2. Click derecho → "Compartir" → "Cualquier persona con el enlace"
3. Copia el ID del archivo
4. Usa estos formatos:

**Para videos:**
```
https://drive.google.com/file/d/TU_FILE_ID/preview
```

**Para imágenes:**
```
https://drive.google.com/uc?export=view&id=TU_FILE_ID
```

### Desde YouTube:

```
https://www.youtube.com/embed/VIDEO_ID
```

## 📊 Archivos CSV para Airtable

Los archivos CSV en `/airtable/` están sincronizados con esta estructura:

| Archivo | Descripción |
|---------|-------------|
| `levels.csv` | Niveles educativos |
| `modules.csv` | Módulos por nivel |
| `courses.csv` | Lecciones detalladas |
| `kits.csv` | Kits de robótica |
| `users.csv` | Usuarios y credenciales |

## 🛠️ Archivos Principales

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `types.ts` | `src/data/courses/` | Tipos TypeScript |
| `index.ts` | `src/data/courses/` | Exporta todos los cursos |
| `inicial-1.ts` | `src/data/courses/` | Datos de Inicial 1 |
| `inicial-2.ts` | `src/data/courses/` | Datos de Inicial 2 |
| `constants.ts` | `src/lib/` | Niveles y simuladores |
| `database.ts` | `src/lib/` | Estructura de BD |

## ✅ Checklist para Nuevo Curso

- [ ] Crear archivo `[nivel].ts` en `courses/`
- [ ] Definir módulos y lecciones
- [ ] Agregar información del kit
- [ ] Definir plan del año
- [ ] Exportar en `index.ts`
- [ ] Agregar nivel en `constants.ts` si no existe
- [ ] Actualizar CSVs de Airtable
- [ ] Probar en la aplicación
