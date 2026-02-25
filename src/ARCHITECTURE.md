# Arquitectura Modular - ChaskiBots EDU

## 📁 Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router (páginas y APIs)
│   ├── api/               # Endpoints de API
│   └── [pages]/           # Páginas de la aplicación
├── components/            # Componentes React reutilizables
│   ├── admin/            # Componentes del panel de administración
│   └── activities/       # Componentes de actividades
├── hooks/                 # Custom hooks reutilizables
│   ├── index.ts          # Exportaciones centralizadas
│   ├── useLevels.ts      # Hook para niveles educativos
│   ├── useUserCourses.ts # Hook para cursos del usuario
│   ├── useAdminData.ts   # Hook para datos de administración
│   └── useDynamicLevels.ts # Hook legacy (mantener compatibilidad)
├── services/              # Servicios de API centralizados
│   └── api.ts            # Funciones para llamadas a API
├── types/                 # Tipos TypeScript centralizados
│   └── index.ts          # Interfaces y tipos
├── lib/                   # Utilidades y configuraciones
│   ├── airtable-auth.ts  # Autenticación con Airtable
│   ├── constants.ts      # Constantes y datos estáticos
│   └── ...
├── context/               # Context providers
└── data/                  # Datos estáticos de cursos
```

---

## 🎣 Hooks Disponibles

### `useLevels()`
Obtiene los niveles educativos combinando Airtable con fallback local.

```typescript
import { useLevels } from '@/hooks'

const { levels, loading, error, getLevelById, getLevelName, refetch } = useLevels()
```

**Retorna:**
- `levels`: Array de niveles educativos
- `loading`: Estado de carga
- `error`: Mensaje de error (si hay)
- `getLevelById(id)`: Función para obtener nivel por ID
- `getLevelName(id)`: Función para obtener nombre del nivel
- `refetch()`: Función para recargar datos

---

### `useUserCourses(allLevels)`
Obtiene los cursos asignados al usuario actual.

```typescript
import { useLevels, useUserCourses } from '@/hooks'

const { levels } = useLevels()
const { userCourses, loading, allowedLevelIds, refetch } = useUserCourses(levels)
```

**Parámetros:**
- `allLevels`: Array de niveles (de `useLevels()`)

**Retorna:**
- `userCourses`: Array de cursos del usuario
- `loading`: Estado de carga
- `error`: Mensaje de error
- `allowedLevelIds`: IDs de niveles que el usuario puede ver
- `refetch()`: Función para recargar datos

**Comportamiento por rol:**
- **Admin**: `allowedLevelIds` incluye todos los niveles
- **Teacher**: Incluye niveles de asignaciones + levelId del usuario
- **Student**: Solo incluye su levelId

---

### `useAdminData()`
Carga todos los datos necesarios para el panel de administración.

```typescript
import { useAdminData } from '@/hooks'

const {
  users, teachers, students,
  courses, schools, assignments,
  levels, getLevelName,
  loading, refetch
} = useAdminData()
```

**Retorna:**
- `users`: Todos los usuarios
- `teachers`: Solo profesores
- `students`: Solo estudiantes
- `courses`: Cursos y programas
- `schools`: Colegios
- `assignments`: Asignaciones profesor-curso
- `levels`: Niveles educativos
- `getLevelName(id)`: Función para obtener nombre
- `loading`: Estado de carga general
- `refetch()`: Recargar todos los datos

---

## 🔌 Servicios de API

### Importación
```typescript
import { 
  usersApi, 
  levelsApi, 
  coursesApi, 
  teacherCoursesApi,
  schoolsApi,
  lessonsApi,
  tasksApi,
  submissionsApi,
  gradesApi 
} from '@/services/api'
```

### Ejemplos de Uso

```typescript
// Obtener todos los usuarios
const users = await usersApi.getAll()

// Obtener niveles
const levels = await levelsApi.getAll()

// Obtener cursos de un profesor
const courses = await teacherCoursesApi.getByTeacher(accessCode, name)

// Crear una asignación
await teacherCoursesApi.create({
  teacherId: 'PR123456',
  teacherName: 'Juan Pérez',
  courseId: 'prog-robotica',
  courseName: 'Robótica',
  levelId: 'septimo-egb',
})

// Sincronizar levelIds
await teacherCoursesApi.sync()
```

---

## 📝 Tipos Centralizados

### Importación
```typescript
import type { 
  User, 
  Level, 
  Course, 
  TeacherCourse,
  School,
  Lesson,
  Task,
  Submission,
  Grade,
  ApiResponse 
} from '@/types'
```

### Interfaces Principales

```typescript
interface User {
  id: string
  accessCode?: string
  name: string
  email?: string
  role: 'admin' | 'teacher' | 'student'
  levelId?: string
  courseId?: string
  schoolId?: string
}

interface Level {
  id: string
  name: string
  fullName: string
  category: string
  ageRange: string
  gradeNumber: number
  color?: string
  icon?: string
}

interface TeacherCourse {
  id: string
  recordId: string
  teacherId: string
  teacherName: string
  courseId: string
  courseName: string
  levelId: string
  schoolId?: string
}
```

---

## 🔄 Migración de Código Legacy

### Antes (código duplicado)
```typescript
// En cada página se repetía esto:
const [userCourses, setUserCourses] = useState([])
const [allLevels, setAllLevels] = useState([])

useEffect(() => {
  // Cargar niveles...
  fetch('/api/admin/levels')...
}, [])

useEffect(() => {
  // Cargar cursos del usuario...
  if (user.role === 'teacher') {
    fetch('/api/teacher-courses')...
  }
}, [user])

const allowedLevelIds = useMemo(() => {
  // Lógica duplicada...
}, [user, userCourses])
```

### Después (hooks modulares)
```typescript
import { useLevels, useUserCourses } from '@/hooks'

const { levels } = useLevels()
const { allowedLevelIds } = useUserCourses(levels)
```

---

## ✅ Beneficios de la Arquitectura Modular

1. **DRY (Don't Repeat Yourself)**: Lógica centralizada en hooks
2. **Mantenibilidad**: Cambios en un solo lugar afectan toda la app
3. **Testabilidad**: Hooks y servicios se pueden testear aisladamente
4. **Consistencia**: Misma lógica de permisos en todas las páginas
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades
6. **Tipado fuerte**: Tipos centralizados evitan errores

---

## 📋 Checklist para Nuevas Páginas

- [ ] Importar hooks desde `@/hooks`
- [ ] Usar `useLevels()` para niveles
- [ ] Usar `useUserCourses(levels)` para permisos
- [ ] Usar tipos desde `@/types`
- [ ] No duplicar lógica de carga de datos
- [ ] No hacer fetch directo a APIs (usar servicios)
