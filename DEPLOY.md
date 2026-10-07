# 🚀 Guía de Deploy - ChaskiBots EDU

## Pasos para publicar tu aplicación

---

## 1️⃣ Preparar GitHub

### Crear repositorio en GitHub
1. Ve a [github.com](https://github.com) y crea una cuenta si no tienes
2. Clic en **"New repository"**
3. Nombre: `chaskibots-edu`
4. Selecciona **Private** (recomendado)
5. NO marques "Add README" (ya tienes uno)
6. Clic en **"Create repository"**

### Subir código a GitHub
Abre terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit - ChaskiBots EDU"

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/chaskibots-edu.git

# Subir código
git branch -M main
git push -u origin main
```

---

## 2️⃣ Deploy en Railway

### Crear cuenta y proyecto
1. Ve a [railway.app](https://railway.app)
2. Clic en **"Login"** → **"Login with GitHub"**
3. Autoriza Railway para acceder a tu GitHub

### Crear nuevo proyecto
1. Clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona `chaskibots-edu`
4. Railway detectará automáticamente que es Next.js

### Configurar variables de entorno
1. En tu proyecto de Railway, ve a **"Variables"**
2. Agrega las siguientes variables (copia de tu `.env.local`):

```
AIRTABLE_API_KEY=<tu_token_de_airtable>
AIRTABLE_BASE_ID=<tu_base_id>
AIRTABLE_KITS_TABLE_ID=kits_para_importar
GOOGLE_DRIVE_FOLDER_ID=16SM93MXpHiVXE6cVPkfD4rcVS3FrhKDH
GOOGLE_SERVICE_ACCOUNT_EMAIL=chaskibots-drive@chaskibots-edu.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...(tu clave completa)...\n-----END PRIVATE KEY-----\n"
```

### Generar dominio
1. Ve a **"Settings"** → **"Domains"**
2. Clic en **"Generate Domain"**
3. Obtendrás algo como: `chaskibots-edu-production.up.railway.app`

---

## 3️⃣ Conectar con tu Dominio WordPress

### Opción A: Subdominio (Recomendado)
Si tu WordPress está en `tudominio.com`, puedes crear `app.tudominio.com`

1. En tu panel de hosting (cPanel, Cloudflare, etc.)
2. Ve a **DNS** o **Dominios**
3. Agrega un registro **CNAME**:
   - Nombre: `app` (o `edu`, `plataforma`, etc.)
   - Valor: `chaskibots-edu-production.up.railway.app`
   - TTL: Auto o 3600

4. En Railway:
   - Ve a **Settings** → **Domains**
   - Clic en **"Add Custom Domain"**
   - Escribe: `app.tudominio.com`
   - Railway te dará instrucciones para verificar

### Opción B: Iframe en WordPress
Si prefieres mantener todo en WordPress:

1. Instala el plugin **"Insert Headers and Footers"** o similar
2. Crea una página nueva en WordPress
3. Usa el bloque **HTML personalizado** y agrega:

```html
<iframe 
  src="https://chaskibots-edu-production.up.railway.app" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border: none; border-radius: 12px;">
</iframe>
```

### Opción C: Redirección
Simplemente redirige desde WordPress a tu app de Railway.

---

## 4️⃣ Configurar Airtable para Usuarios

### Crear tabla de usuarios
En tu base de Airtable, crea una tabla llamada `users` con estos campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| accessCode | Single line text | Código único de acceso (ej: ES4K7NP2) |
| name | Single line text | Nombre del usuario |
| email | Email | Email (opcional) |
| role | Single select | admin, teacher, student |
| courseId | Single line text | ID del curso |
| courseName | Single line text | Nombre del curso |
| levelId | Single line text | Nivel educativo |
| isActive | Checkbox | Si el usuario está activo |
| createdAt | Date | Fecha de creación |
| lastLogin | Date | Último acceso |
| expiresAt | Date | Fecha de expiración (opcional) |

### Crear tabla de cursos
Crea una tabla llamada `courses`:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | Single line text | Nombre del curso |
| description | Long text | Descripción |
| levelId | Single line text | Nivel educativo |
| teacherId | Single line text | ID del profesor |
| teacherName | Single line text | Nombre del profesor |
| maxStudents | Number | Máximo de estudiantes |
| currentStudents | Number | Estudiantes actuales |
| isActive | Checkbox | Si está activo |
| createdAt | Date | Fecha de creación |

---

## 5️⃣ Administrar Usuarios

### Crear usuarios manualmente en Airtable
1. Ve a tu tabla `users`
2. Agrega una fila con:
   - accessCode: `ESABC123` (código único)
   - name: `Juan Pérez`
   - role: `student`
   - courseId: `curso-1`
   - courseName: `Robótica 8vo`
   - levelId: `octavo-egb`
   - isActive: ✓

### Códigos de acceso
- **Profesores**: Empiezan con `PR` (ej: `PR7K9M2N`)
- **Estudiantes**: Empiezan con `ES` (ej: `ES4X8P3Q`)
- **Admin**: Empiezan con `AD` (ej: `AD1A2B3C`)

---

## 6️⃣ Actualizar la App

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Railway detectará el push y desplegará automáticamente.

---

## 🔧 Solución de Problemas

### Error de build en Railway
- Revisa los logs en Railway → Deployments
- Verifica que todas las variables de entorno estén configuradas

### La app no carga
- Verifica que el dominio esté correctamente configurado
- Revisa la consola del navegador (F12)

### Usuarios no pueden entrar
- Verifica que el código de acceso esté en Airtable
- Asegúrate que `isActive` esté marcado
- Revisa que no haya expirado

---

## 📞 Soporte

Si tienes problemas, revisa:
1. Logs de Railway
2. Consola del navegador
3. Tabla de Airtable

¡Listo! Tu app estará disponible en tu dominio personalizado 🎉
