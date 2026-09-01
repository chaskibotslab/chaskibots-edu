// Sesión firmada (HMAC-SHA256) para la cookie `chaskibots_session`.
// Antes la cookie era solo base64(JSON) sin firma: cualquiera podía
// escribir document.cookie con un role:"admin" falso y el middleware
// lo aceptaba sin validar nada. Usamos Web Crypto (crypto.subtle) porque
// debe funcionar tanto en rutas API (Node) como en middleware (Edge).

export interface SessionPayload {
  id: string
  role: 'admin' | 'teacher' | 'student'
  email?: string
  exp: number // epoch ms
}

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 días

// SESSION_SECRET es obligatorio: este repo es público en GitHub, así que
// cualquier valor de respaldo escrito aquí en el código sería visible para
// cualquiera y le permitiría fabricar una cookie de sesión válida con
// role:"admin" sin loguearse. Antes había un FALLBACK_SECRET hardcodeado
// para cuando la variable no llegaba al contenedor en Railway — eso
// anulaba por completo la firma HMAC. Ahora, sin la variable configurada,
// simplemente no hay sesiones válidas (falla cerrado, no abierto).
function getSecret(): string | null {
  return process.env.SESSION_SECRET || null
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = ''
  bytes.forEach(b => { str += String.fromCharCode(b) })
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(input.length + (4 - (input.length % 4 || 4)) % 4, '=')
  const str = atob(padded)
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i)
  return bytes
}

async function hmac(data: string): Promise<Uint8Array> {
  const secret = getSecret()
  if (!secret) throw new Error('SESSION_SECRET no configurado')
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return new Uint8Array(sig)
}

export async function createSessionCookie(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const full: SessionPayload = { ...payload, exp: Date.now() + SESSION_MAX_AGE_MS }
  const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify(full)))
  const sig = base64UrlEncode(await hmac(body))
  return `${body}.${sig}`
}

export async function verifySessionCookie(cookieValue: string | undefined | null): Promise<SessionPayload | null> {
  if (!cookieValue) return null
  const parts = cookieValue.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  try {
    const expectedSig = base64UrlEncode(await hmac(body))
    if (expectedSig !== sig) return null
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as SessionPayload
    if (!payload.exp || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export const SESSION_COOKIE_NAME = 'chaskibots_session'
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000
