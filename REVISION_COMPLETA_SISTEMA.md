# 🔍 REVISIÓN COMPLETA DEL SISTEMA - ChaskiBots EDU
**Fecha:** 17 de Marzo, 2026

---

## 📊 RESUMEN EJECUTIVO

ChaskiBots EDU es una plataforma educativa completa para enseñar **Robótica, Inteligencia Artificial y Hacking Ético** a estudiantes desde Inicial hasta Bachillerato.

### Estadísticas del Proyecto
| Métrica | Valor |
|---------|-------|
| **Framework** | Next.js 14 (App Router) |
| **Lenguaje** | TypeScript |
| **Base de datos** | Airtable (API REST) |
| **Páginas/Rutas** | 46+ |
| **Endpoints API** | 30+ |
| **Componentes** | 24+ |
| **Lecciones** | 100+ activas en Airtable |
| **Niveles** | 25 niveles educativos |
| **Programas** | 32 programas activos |

---

## ✅ APIS FUNCIONANDO CORRECTAMENTE

| API | Estado | Registros | Notas |
|-----|--------|-----------|-------|
| `/api/lessons` | ✅ OK | 100+ | Filtro por levelId y programId funciona |
| `/api/levels` | ✅ OK | 25 | Incluye niveles SLM personalizados |
| `/api/programs` | ✅ OK | 32 | Todos los programas activos |
| `/api/tasks` | ✅ OK | 30+ | Tareas por nivel funcionando |
| `/api/grades` | ✅ OK | 10+ | Calificaciones guardadas |
| `/api/submissions` | ✅ OK | Varios | Con imágenes base64 |
| `/api/admin/users` | ✅ OK | - | CRUD completo |
| `/api/auth/login` | ✅ OK | - | AccessCode y Email/Password |

---

## ❌ APIS CON ERROR 500

| API | Error | Causa Raíz |
|-----|-------|------------|
| `/api/kits` | 500 | `INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND` - La tabla `kits` no existe en Airtable o el token no tiene permisos |
| `/api/simulators` | 500 | Mismo problema - La tabla `simulators` no existe en Airtable |

### Solución Requerida:
1. Ir a Airtable y crear las tablas `kits` y `simulators`
2. O verificar en https://airtable.com/create/tokens que el token tenga acceso a estas tablas
3. Importar datos desde:
   - `airtable/kits_para_importar.csv`
   - `airtable/simulators_v2.csv`

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Estructura de Carpetas
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # 30+ endpoints REST
│   │   ├── admin/         # APIs de administración
│   │   ├── auth/          # Login, logout, refresh
│   │   ├── lessons/       # CRUD lecciones
│   │   ├── tasks/         # CRUD tareas
│   │   └── ...
│   ├── admin/             # Panel de administración
│   ├── nivel/[id]/        # Página de nivel dinámico
│   └── ...
├── components/            # 24+ componentes React
│   ├── AuthProvider.tsx   # Context de autenticación
│   ├── LessonViewer.tsx   # Visualizador de lecciones
│   ├── BlocklyEditor.tsx  # Editor de programación visual
│   ├── RobotSimulator3D.tsx # Simulador 3D
│   └── ...
├── hooks/                 # 6 hooks reutilizables
├── lib/                   # Utilidades
│   ├── airtable-auth.ts   # Autenticación con Airtable
│   ├── cache.ts           # Sistema de caché en memoria
│   ├── validation.ts      # Validación con Zod
│   └── ...
├── services/              # Servicios API centralizados
└── types/                 # Tipos TypeScript
```

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### Flujo de Login
1. **Código de Acceso** (Estudiantes/Profesores)
   - Prefijo `ES` = Estudiante
   - Prefijo `PR` = Profesor
   - Prefijo `AD` = Admin

2. **Email/Password** (Alternativo)
   - Busca en tabla `users` de Airtable
   - Compara password o accessCode

### Roles y Permisos
| Rol | Acceso Admin | Acceso Dashboard | Acceso Cursos |
|-----|--------------|------------------|---------------|
| `admin` | ✅ Completo | ✅ | ✅ Todos |
| `teacher` | ✅ Limitado | ✅ | ✅ Asignados |
| `student` | ❌ | ✅ | ✅ Su nivel |

### Middleware de Protección
- Rutas `/admin/*` requieren rol `admin` o `teacher`
- Rutas `/dashboard/*`, `/curso/*`, `/tareas/*` requieren autenticación
- Cookie `chaskibots_session` con TTL de 7 días

---

## 💾 SISTEMA DE CACHÉ

### Configuración TTL por Tipo
| Tipo de Dato | TTL | Razón |
|--------------|-----|-------|
| `levels` | 30 min | Cambian poco |
| `programs` | 30 min | Cambian poco |
| `kits` | 1 hora | Casi nunca cambian |
| `lessons` | 15 min | Contenido educativo |
| `users` | 2 min | Cambian frecuentemente |
| `submissions` | 1 min | Muy dinámico |

### Invalidación
- Se invalida automáticamente al crear/actualizar/eliminar registros
- Método `cache.invalidateByPrefix('users:')` para invalidar por tipo

---

## 🎨 COMPONENTES PRINCIPALES

### Componentes Grandes (>20KB)
| Componente | Tamaño | Función |
|------------|--------|---------|
| `RobotSimulator3D.tsx` | 86KB | Simulador 3D con Three.js |
| `BlocklyEditor.tsx` | 67KB | Programación visual |
| `AIVision.tsx` | 46KB | Visión por computadora TensorFlow |
| `GradingPanel.tsx` | 45KB | Panel de calificaciones |
| `TasksPanel.tsx` | 33KB | Gestión de tareas |
| `AIModule.tsx` | 33KB | Teachable Machine |
| `PythonSimulator.tsx` | 32KB | Simulador Python |
| `LessonViewer.tsx` | 29KB | Visualizador de lecciones |

### Componentes de Administración
- `admin/LevelEditor.tsx` - Editor de niveles
- `admin/LessonEditor.tsx` - Editor de lecciones
- `admin/UserManager.tsx` - Gestión de usuarios

---

## 🐛 BUGS Y PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS

1. **Tablas faltantes en Airtable**
   - `kits` - Error 500 al acceder
   - `simulators` - Error 500 al acceder
   - **Impacto**: Los estudiantes no pueden ver kits ni simuladores

### 🟡 MEDIOS

2. **Encoding de caracteres**
   - Algunos textos muestran `Ã³` en lugar de `ó`
   - **Causa**: Encoding UTF-8 no consistente en Airtable
   - **Solución**: Verificar encoding al importar CSVs

3. **Falta de 9° EGB en niveles estáticos**
   - `noveno-egb` existe en Airtable pero no en `EDUCATION_LEVELS`
   - **Impacto**: Funciona porque carga dinámicamente, pero no óptimo

### 🟢 MENORES

4. **Caché de lecciones no incluye programId en cacheKeys**
   - En `@/lib/cache.ts` línea 145: `lessons: (levelId: string) => \`lessons:${levelId}\``
   - Debería ser: `lessons: (levelId: string, programId?: string) => \`lessons:${levelId}_${programId || 'all'}\``
   - **Impacto**: Posible inconsistencia al cambiar de programa

5. **Tipo `ExternalLink` duplicado**
   - En `LessonViewer.tsx` línea 18-22 define `ExternalLink` que ya existe en Lucide
   - **Solución**: Renombrar a `LessonExternalLink`

---

## 📋 TABLAS DE AIRTABLE REQUERIDAS

### Tablas Existentes y Funcionando
| Tabla | Campos Clave | Estado |
|-------|--------------|--------|
| `users` | accessCode, name, role, levelId, schoolId | ✅ OK |
| `lessons` | levelId, programId, moduleName, title, content | ✅ OK |
| `levels` | id, name, fullName, category, gradeNumber | ✅ OK |
| `programs` | id, name, levelId, type, price | ✅ OK |
| `tasks` | levelId, title, description, points, dueDate | ✅ OK |
| `submissions` | taskId, studentName, levelId, status | ✅ OK |
| `grades` | studentName, lessonId, score, feedback | ✅ OK |
| `schools` | id, name, code | ✅ OK |
| `courses_catalog` | id, name, levelId, teacherName | ✅ OK |
| `teacher_courses` | teacherId, courseId, levelId | ✅ OK |

### Tablas Faltantes
| Tabla | Campos Requeridos | CSV para Importar |
|-------|-------------------|-------------------|
| `kits` | levelId, name, description, components, skills, images | `kits_para_importar.csv` |
| `simulators` | id, name, description, icon, url, levels, programs | `simulators_v2.csv` |

---

## 🚀 RECOMENDACIONES

### Prioridad Alta
1. **Crear tablas faltantes en Airtable** (kits, simulators)
2. **Verificar permisos del token de Airtable**
3. **Corregir encoding UTF-8** en datos importados

### Prioridad Media
4. **Agregar 9° EGB a constantes estáticas** para mejor rendimiento
5. **Corregir cacheKey de lecciones** para incluir programId
6. **Renombrar tipo ExternalLink** en LessonViewer

### Prioridad Baja
7. **Agregar tests unitarios** para hooks y servicios
8. **Implementar lazy loading** para componentes pesados
9. **Agregar sistema de progreso** para estudiantes

---

## 📁 ARCHIVOS CSV DISPONIBLES PARA IMPORTAR

| Archivo | Registros | Descripción |
|---------|-----------|-------------|
| `lessons_all_levels.csv` | 527 | Todas las lecciones |
| `kits_para_importar.csv` | 15 | Kits de robótica |
| `simulators_v2.csv` | 6 | Simuladores |
| `tasks.csv` | 30+ | Tareas por nivel |
| `year_plans.csv` | 15 | Plan anual por nivel |

---

## ✅ CONCLUSIÓN

El sistema está **85% funcional**. Los problemas principales son:
1. Dos tablas faltantes en Airtable (kits, simulators)
2. Algunos problemas menores de encoding

Una vez creadas las tablas faltantes, la plataforma estará completamente operativa.

---

*Revisión generada el 17 de Marzo, 2026*
