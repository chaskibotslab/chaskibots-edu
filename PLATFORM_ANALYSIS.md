# ChaskiBots EDU - Análisis Completo de la Plataforma

## 📋 Resumen General

**ChaskiBots EDU** es una plataforma educativa de robótica e inteligencia artificial para estudiantes desde Inicial 1 hasta 3° de Bachillerato. Utiliza **Next.js 14** como framework, **Airtable** como base de datos, **Railway** para deploy, y **Google Drive** para almacenamiento de archivos.

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Airtable (REST API)
- **Almacenamiento**: Google Drive API
- **3D/Simulación**: Three.js, @react-three/fiber
- **IA/ML**: TensorFlow.js, COCO-SSD, MobileNet
- **Programación Visual**: Blockly
- **Deploy**: Railway (NO Netlify)

### Variables de Entorno Requeridas
```
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=
```

---

## 📊 Tablas de Airtable

### 1. `users` - Usuarios del Sistema
| Campo | Tipo | Descripción |
|-------|------|-------------|
| accessCode | String | Código único de acceso (ej: ES123456) |
| name | String | Nombre del usuario |
| email | String | Email (opcional) |
| password | String | Contraseña (opcional, usa accessCode si no existe) |
| role | String | admin, teacher, student |
| levelId | String | Nivel educativo asignado |
| courseId | String | ID del curso asignado |
| courseName | String | Nombre del curso |
| schoolId | String | ID del colegio |
| schoolName | String | Nombre del colegio |
| programId | String | ID del programa |
| programName | String | Nombre del programa |
| isActive | Boolean | Usuario activo |
| createdAt | Date | Fecha de creación |
| lastLogin | DateTime | Último acceso |
| expiresAt | Date | Fecha de expiración (opcional) |

### 2. `schools` - Colegios/Instituciones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID único del colegio |
| name | String | Nombre del colegio |
| code | String | Código corto |
| address | String | Dirección |
| city | String | Ciudad |
| country | String | País |
| email | String | Email de contacto |
| logo | String | URL del logo |
| isActive | Boolean | Activo |
| maxStudents | Number | Máximo de estudiantes |
| maxTeachers | Number | Máximo de profesores |
| createdAt | Date | Fecha de creación |

### 3. `courses_catalog` - Catálogo de Cursos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID único del curso |
| name | String | Nombre del curso |
| description | String | Descripción |
| levelId | String | Nivel educativo |
| teacherName | String | Nombre del profesor |
| schoolId | String | ID del colegio |
| schoolName | String | Nombre del colegio |
| maxStudents | Number | Máximo de estudiantes |
| currentStudents | Number | Estudiantes actuales |
| isActive | Boolean | Curso activo |
| createdAt | Date | Fecha de creación |

### 4. `teacher_courses` - Asignación Profesor-Curso
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID de asignación |
| teacherId | String | ID/código del profesor |
| teacherName | String | Nombre del profesor |
| courseId | String | ID del curso |
| courseName | String | Nombre del curso |
| levelId | String | Nivel educativo |
| schoolId | String | ID del colegio |
| schoolName | String | Nombre del colegio |
| createdAt | Date | Fecha de creación |

### 5. `lessons` - Lecciones/Contenido
| Campo | Tipo | Descripción |
|-------|------|-------------|
| levelId | String | Nivel educativo |
| moduleName | String | Nombre del módulo |
| title | String | Título de la lección |
| type | String | Tipo (video, lectura, etc.) |
| duration | String | Duración estimada |
| order | Number | Orden de la lección |
| videoUrl | String | URL del video (YouTube/Drive) |
| content | String | Contenido HTML/texto |
| pdfUrl | String | URL del PDF adjunto |
| locked | Boolean | Lección bloqueada |

### 6. `tasks` - Tareas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| levelId | String | Nivel educativo |
| title | String | Título de la tarea |
| description | String | Descripción (incluye metadatos: [type|category|difficulty|attachmentUrl]) |
| points | Number | Puntos de la tarea |
| dueDate | Date | Fecha límite |
| isActive | Boolean | Tarea activa |
| questions | String | Preguntas separadas por \| |
| createdAt | Date | Fecha de creación |

### 7. `submissions` - Entregas de Estudiantes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| taskId | String | ID de la tarea |
| studentName | String | Nombre del estudiante |
| studentEmail | String | Email del estudiante |
| levelId | String | Nivel educativo |
| lessonId | String | ID de la lección |
| courseId | String | ID del curso |
| schoolId | String | ID del colegio |
| code | String | Código/respuesta enviada |
| output | String | Salida/resultado |
| submittedAt | DateTime | Fecha de envío |
| status | String | pending, graded, returned |
| grade | Number | Calificación (0-10) |
| feedback | String | Retroalimentación |
| gradedAt | DateTime | Fecha de calificación |
| gradedBy | String | Quién calificó |
| drawing | String | Dibujo en base64 |
| files | String | JSON con archivos adjuntos |

### 8. `grades` - Calificaciones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| studentId | String | ID del estudiante |
| studentName | String | Nombre del estudiante |
| lessonId | String | ID de la lección |
| levelId | String | Nivel educativo |
| courseId | String | ID del curso |
| schoolId | String | ID del colegio |
| score | Number | Puntuación |
| feedback | String | Retroalimentación |
| taskId | String | ID de la tarea |
| submittedAt | DateTime | Fecha de envío |
| gradedAt | DateTime | Fecha de calificación |
| gradedBy | String | Quién calificó |

### 9. `simulators` - Simuladores Externos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID del simulador |
| name | String | Nombre |
| description | String | Descripción |
| icon | String | Icono (lucide) |
| url | String | URL del simulador |
| levels | String | Niveles separados por coma |
| enabled | Boolean | Habilitado |

### 10. `simulator_challenges` - Retos del Simulador 3D (NUEVA)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| challengeId | String | ID del reto |
| challengeName | String | Nombre del reto |
| challengeCategory | String | laberinto, coleccionables, minisumo |
| challengeDifficulty | String | easy, medium, hard |
| studentName | String | Nombre del estudiante |
| studentEmail | String | Email del estudiante |
| courseId | String | ID del curso |
| schoolId | String | ID del colegio |
| completedAt | DateTime | Fecha de completado |
| status | String | completed, verified |
| verifiedBy | String | Quién verificó |
| verifiedAt | DateTime | Fecha de verificación |

### 11. `students` - Estudiantes (registro simple)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | String | Nombre |
| levelId | String | Nivel educativo |
| courseId | String | ID del curso |
| email | String | Email |
| createdAt | Date | Fecha de creación |

### 12. `experiencias` - Experiencias/Testimonios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| orden | Number | Orden de visualización |
| (otros campos según necesidad) | | |

---

## 🔐 Sistema de Autenticación

### Flujo de Login
1. **Por Código de Acceso**: Usuario ingresa código único (ej: ES123456)
2. **Por Email/Password**: Usuario ingresa email y contraseña

### Roles
- **admin**: Acceso total al sistema
- **teacher**: Acceso a cursos asignados, calificaciones, entregas
- **student**: Acceso a contenido de su nivel, envío de tareas

### Generación de Códigos
- Prefijo `AD` = Admin
- Prefijo `PR` = Profesor
- Prefijo `ES` = Estudiante
- Seguido de 6 caracteres alfanuméricos

---

## 📚 Niveles Educativos

| ID | Nombre | Categoría | Edad |
|----|--------|-----------|------|
| inicial-1 | Inicial 1 | inicial | 3-4 años |
| inicial-2 | Inicial 2 | inicial | 4-5 años |
| primero-egb | 1° EGB | preparatoria | 5-6 años |
| segundo-egb | 2° EGB | elemental | 6-7 años |
| tercero-egb | 3° EGB | elemental | 7-8 años |
| cuarto-egb | 4° EGB | elemental | 8-9 años |
| quinto-egb | 5° EGB | media | 9-10 años |
| sexto-egb | 6° EGB | media | 10-11 años |
| septimo-egb | 7° EGB | media | 11-12 años |
| octavo-egb | 8° EGB | superior | 12-13 años |
| noveno-egb | 9° EGB | superior | 13-14 años |
| decimo-egb | 10° EGB | superior | 14-15 años |
| primero-bach | 1° BGU | bachillerato | 15-16 años |
| segundo-bach | 2° BGU | bachillerato | 16-17 años |
| tercero-bach | 3° BGU | bachillerato | 17-18 años |

---

## 🎮 Componentes Principales

### Simulador 3D (`RobotSimulator3D.tsx`)
- Simulador de robot con Three.js
- Categorías: Laberintos, Coleccionables, Mini Sumo
- Programación con Blockly
- Envío de retos completados al API

### Editor Blockly (`BlocklyEditor.tsx`)
- Programación visual por bloques
- Generación de código Python/JavaScript
- Integración con simulador

### Panel de Entregas (`SubmissionsPanel.tsx`)
- Vista de entregas de estudiantes
- Calificación y retroalimentación
- Filtros por nivel, estado, curso

### Panel de Retos Simulador (`SimulatorChallengesPanel.tsx`)
- Vista de retos completados del simulador 3D
- Verificación por docentes
- Estadísticas por estudiante

### Módulo IA (`AIModule.tsx`, `AIVision.tsx`)
- Reconocimiento de objetos (COCO-SSD)
- Clasificación de imágenes (MobileNet)
- Actividades interactivas de IA

---

## 🛣️ Rutas de la Aplicación

### Públicas
- `/` - Página principal
- `/login` - Inicio de sesión
- `/register` - Registro
- `/niveles` - Lista de niveles educativos
- `/simuladores` - Simuladores disponibles
- `/robotica` - Sección de robótica
- `/hacking` - Sección de hacking ético

### Protegidas (requieren autenticación)
- `/dashboard` - Panel del estudiante
- `/nivel/[id]` - Contenido del nivel
- `/ia` - Módulo de IA

### Administración
- `/admin` - Panel de administración
- `/admin/entregas` - Gestión de entregas (incluye tab de retos simulador)
- `/admin/calificaciones` - Gestión de calificaciones
- `/admin/colegios` - Gestión de colegios
- `/admin/contenido` - Gestión de contenido
- `/admin/gestion` - Gestión de usuarios
- `/admin/kits` - Gestión de kits
- `/admin/tareas` - Gestión de tareas
- `/admin/lecciones` - Gestión de lecciones
- `/admin/proyectos` - Gestión de proyectos
- `/admin/ia` - Configuración de IA

---

## 🔌 APIs Disponibles

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/auth/login` | POST | Autenticación |
| `/api/auth/login-code` | POST | Login por código |
| `/api/auth/course-access` | GET | Verificar acceso a curso |
| `/api/admin/users` | GET, POST, PATCH, DELETE | Gestión de usuarios |
| `/api/admin/courses` | GET, POST, PATCH, DELETE | Gestión de cursos |
| `/api/admin/levels` | GET | Niveles educativos |
| `/api/admin/programs` | GET, POST | Programas |
| `/api/schools` | GET, POST, DELETE | Colegios |
| `/api/students` | GET, POST, DELETE | Estudiantes |
| `/api/teacher-courses` | GET, POST, DELETE | Asignación profesor-curso |
| `/api/lessons` | GET, POST, PUT, DELETE | Lecciones |
| `/api/tasks` | GET, POST, PATCH, DELETE | Tareas |
| `/api/submissions` | GET, POST, PATCH, DELETE | Entregas |
| `/api/grades` | GET, POST, DELETE | Calificaciones |
| `/api/simulators` | GET, POST, PUT, DELETE | Simuladores |
| `/api/simulator-challenges` | GET, POST, PATCH, DELETE | Retos del simulador 3D |
| `/api/kits` | GET | Kits educativos |
| `/api/documents` | GET | Documentos |
| `/api/experiencias` | GET | Experiencias |
| `/api/blockly-projects` | GET, POST | Proyectos Blockly |
| `/api/projects` | GET, POST | Proyectos |
| `/api/year-plans` | GET | Planes anuales |
| `/api/ai-activities` | GET | Actividades de IA |
| `/api/upload` | POST | Subida de archivos |
| `/api/image-proxy` | GET | Proxy de imágenes |

---

## 🚀 Deploy en Railway

### Configuración
1. Conectar repositorio GitHub: `chaskibotslab/chaskibots-edu`
2. Branch: `main`
3. Build Command: `npm run build`
4. Start Command: `npm start`

### Variables de Entorno en Railway
Configurar todas las variables de entorno mencionadas arriba en el panel de Railway.

### Deploy Automático
- Push a `main` → Railway detecta y despliega automáticamente

---

## 📝 Notas Importantes

1. **NO usar Netlify** - El proyecto usa Railway para deploy
2. **Airtable como BD** - Todas las tablas deben existir en Airtable
3. **Google Drive** - Para almacenar archivos de entregas
4. **Simulador 3D** - Retos se guardan en tabla `simulator_challenges`
5. **Códigos de acceso** - Sistema principal de autenticación para estudiantes

---

## 🔄 Flujo de Trabajo Típico

### Estudiante
1. Login con código de acceso
2. Accede a su nivel educativo
3. Ve lecciones y videos
4. Completa tareas y envía respuestas
5. Usa simulador 3D y envía retos completados
6. Ve sus calificaciones

### Profesor
1. Login con código de acceso o email/password
2. Ve entregas de sus cursos asignados
3. Califica tareas y da retroalimentación
4. Verifica retos del simulador 3D
5. Ve progreso de estudiantes

### Administrador
1. Login con credenciales admin
2. Gestiona colegios, cursos, usuarios
3. Crea contenido (lecciones, tareas)
4. Ve todas las entregas y calificaciones
5. Configura simuladores y programas
