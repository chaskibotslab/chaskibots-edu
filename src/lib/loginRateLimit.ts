// Protección anti fuerza bruta para los endpoints de login.
// Bloquea la IP de origen después de varios intentos fallidos seguidos.
//
// Estado en memoria del proceso: alcanza porque el servicio corre con una
// sola réplica en Railway (numReplicas: 1 en railway.json). Si el servicio
// se escala a más réplicas, esto debe migrar a un store compartido
// (Redis, o una tabla en Supabase) porque cada réplica tendría su propio
// contador y el límite dejaría de ser efectivo.

const MAX_ATTEMPTS = 4
const WINDOW_MS = 15 * 60 * 1000 // ventana para contar intentos fallidos
const LOCKOUT_MS = 15 * 60 * 1000 // duración del bloqueo una vez superado el límite

interface Entry {
  count: number
  firstAttempt: number
  lockedUntil: number | null
}

const attemptsByIp = new Map<string, Entry>()

// Limpieza periódica para no acumular IPs viejas en memoria indefinidamente.
function cleanupStale() {
  const now = Date.now()
  for (const [key, entry] of attemptsByIp) {
    const expired = entry.lockedUntil ? entry.lockedUntil < now : now - entry.firstAttempt > WINDOW_MS
    if (expired) attemptsByIp.delete(key)
  }
}

export function getClientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export function checkLoginLock(ip: string): { locked: boolean; retryAfterSeconds?: number } {
  const entry = attemptsByIp.get(ip)
  if (!entry?.lockedUntil) return { locked: false }
  const remainingMs = entry.lockedUntil - Date.now()
  if (remainingMs <= 0) {
    attemptsByIp.delete(ip)
    return { locked: false }
  }
  return { locked: true, retryAfterSeconds: Math.ceil(remainingMs / 1000) }
}

export function recordFailedLogin(ip: string): { locked: boolean; retryAfterSeconds?: number } {
  cleanupStale()
  const now = Date.now()
  const entry = attemptsByIp.get(ip)

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    attemptsByIp.set(ip, { count: 1, firstAttempt: now, lockedUntil: null })
    return { locked: false }
  }

  entry.count += 1
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS
    return { locked: true, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) }
  }
  return { locked: false }
}

export function resetLoginAttempts(ip: string): void {
  attemptsByIp.delete(ip)
}

export const LOGIN_MAX_ATTEMPTS = MAX_ATTEMPTS
