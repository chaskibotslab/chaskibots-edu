# 🚀 Plan de Migración: Airtable → Supabase

## Estado actual
- **23 tablas** en Airtable
- **26 endpoints API** dependiendo de Airtable
- Cache en memoria (`src/lib/cache.ts`) para mitigar lentitud de Airtable
- Login custom con campo `password` en tabla `users`

## Por qué migrar

| Problema actual (Airtable) | Solución (Supabase) |
|----------------------------|---------------------|
| Rate limit 5 req/seg → errores 429 | Sin límites prácticos |
| Lecturas lentas (necesitamos cache) | PostgreSQL nativo, sub-100ms |
| Sin foreign keys reales | Integridad referencial |
| Sin queries complejas | SQL completo + JOINs |
| Costo escala con usuarios | $0 hasta 500MB, $25 ilimitado |
| Auth manual (passwords en tabla) | Auth integrada (JWT, OAuth) |
| Sin storage para imágenes | Storage 1GB gratis |

---

## 📋 FASES DE MIGRACIÓN

### **FASE 0: Preparación** (1-2 horas)

#### 0.1 Crear proyecto Supabase
1. Ve a https://supabase.com → Sign up
2. Crear nuevo proyecto: `chaskibots-edu`
3. Región: `us-east-1` (más cercana a Railway)
4. Guardar password de la base de datos

#### 0.2 Obtener credenciales
Dashboard → Settings → API:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (secreto)

#### 0.3 Variables de entorno
Agregar a `.env.local` y Railway:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

#### 0.4 Instalar dependencia
```bash
npm install @supabase/supabase-js
```

---

### **FASE 1: Crear esquema** (30 min)

1. Abrir Supabase Dashboard → SQL Editor
2. Copiar contenido de `supabase/schema.sql`
3. Ejecutar (RUN)
4. Verificar en Table Editor que aparezcan las 20 tablas

---

### **FASE 2: Migrar datos** (1-2 horas)

```bash
# Migrar todo de una vez
node scripts/migrate-airtable-to-supabase.js all

# O migrar tabla por tabla
node scripts/migrate-airtable-to-supabase.js programs
node scripts/migrate-airtable-to-supabase.js levels
node scripts/migrate-airtable-to-supabase.js lessons
# ... etc
```

**Orden recomendado** (por foreign keys):
1. programs
2. levels
3. schools
4. modules
5. simulators
6. kits
7. lessons (la más importante)
8. students, tasks, projects, etc.

**Verificación:** En Table Editor de Supabase, contar registros y comparar con CSVs.

---

### **FASE 3: Migración por endpoints** (5-8 horas)

⚠️ **Importante:** Hacer un endpoint a la vez, verificar localmente, deploy, esperar 24h, siguiente.

**Orden recomendado:**

| # | Endpoint | Prioridad | Notas |
|---|----------|-----------|-------|
| 1 | `/api/lessons` | 🔴 Alta | Más usado. Ya hay ejemplo en `route.supabase.example.ts` |
| 2 | `/api/levels` | 🔴 Alta | Referencia desde muchos lugares |
| 3 | `/api/programs` | 🔴 Alta | Referencia desde muchos lugares |
| 4 | `/api/admin/lessons/[id]` | 🟡 Media | CRUD admin |
| 5 | `/api/students` | 🟡 Media | |
| 6 | `/api/tasks` | 🟡 Media | |
| 7 | `/api/submissions` | 🟡 Media | Crear nuevas entregas |
| 8 | `/api/grades` | 🟡 Media | |
| 9 | `/api/virtual-files` | 🟢 Baja | Hacking terminal |
| 10 | `/api/blockly-projects` | 🟢 Baja | |
| 11 | `/api/projects`, `/api/kits`, `/api/experiencias` | 🟢 Baja | Catálogos |
| 12 | `/api/auth/*` | 🔴 Especial | Migrar a Supabase Auth (FASE 5) |

**Patrón de migración por endpoint:**
1. Copiar `route.ts` → `route.airtable.backup.ts`
2. Reescribir con cliente Supabase (ver `route.supabase.example.ts`)
3. `npm run build` para verificar
4. Probar localmente
5. Commit + deploy
6. Validar en producción

---

### **FASE 4: Limpieza** (1 hora)

Una vez todos los endpoints migrados:
- Eliminar `src/lib/airtable-errors.ts`
- Eliminar `src/lib/cache.ts` (Supabase es suficientemente rápido)
- Quitar variables `AIRTABLE_*` de Railway
- Cancelar suscripción de Airtable (después de 1 mes de validación)

---

### **FASE 5: Auth con Supabase** (Opcional, 2-3 horas)

Migrar de auth custom a Supabase Auth:
- Email + password → soportado nativo
- Recovery de contraseñas → automático
- OAuth (Google, GitHub) → 1 click
- Roles via JWT claims o tabla `profiles`

⚠️ Requiere migrar passwords (los usuarios deberán resetear).

---

### **FASE 6: Storage de imágenes** (Opcional, 1 hora)

Migrar imágenes de Google Drive → Supabase Storage:
- Bucket público: `lesson-images`
- URL directa: `https://xxx.supabase.co/storage/v1/object/public/lesson-images/page-01.png`
- Más rápido que Drive
- CDN incluido

---

## 🛡️ Estrategia de rollback

Si algo sale mal:
1. **Por endpoint:** Restaurar `route.airtable.backup.ts` → `route.ts`
2. **Total:** Revertir commit en GitHub → Railway redeploy automático
3. Los datos en Airtable no se tocan, solo se leen

---

## 📊 Estimación total

| Fase | Tiempo | Dificultad |
|------|--------|------------|
| 0. Preparación | 2h | ⭐ |
| 1. Esquema SQL | 30m | ⭐ |
| 2. Migrar datos | 2h | ⭐⭐ |
| 3. Migrar endpoints | 8h | ⭐⭐⭐ |
| 4. Limpieza | 1h | ⭐ |
| 5. Auth (opcional) | 3h | ⭐⭐⭐ |
| 6. Storage (opcional) | 1h | ⭐⭐ |
| **Total mínimo** | **13h** | |
| **Total con extras** | **17h** | |

Puede hacerse en **2-3 sesiones** sin romper producción.

---

## 🎯 Beneficios esperados

- ⚡ **5-10x más rápido** que Airtable
- 💰 **Ahorro $20+/mes** (Airtable Pro)
- 🚫 **Cero errores 429** rate limit
- 🔍 **SQL queries** complejas (reportes, analytics)
- 🔐 **Auth robusta** (sin guardar passwords plain)
- 📈 **Escalable** a miles de estudiantes

---

## 🆘 Soporte durante migración

Si te trabas en algún punto:
1. Pásame el error específico
2. Te ayudo con el endpoint problemático
3. Tenemos rollback fácil si algo falla

## 📁 Archivos creados en este plan

- `supabase/schema.sql` - Esquema completo de tablas
- `supabase/MIGRATION_PLAN.md` - Este documento
- `src/lib/supabase.ts` - Cliente Supabase + tipos
- `scripts/migrate-airtable-to-supabase.js` - Script de migración de datos
- `src/app/api/lessons/route.supabase.example.ts` - Ejemplo de endpoint migrado
