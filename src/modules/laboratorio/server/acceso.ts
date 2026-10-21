// Acceso al laboratorio desde el servidor: flag LAB_ENABLED + sesión actual.
// No toca el middleware ni la autenticación existente: solo REUTILIZA la
// verificación de la cookie firmada que ya usa la plataforma.

import { cookies } from 'next/headers'
import { verifySessionCookie, SESSION_COOKIE_NAME, type SessionPayload } from '@/lib/session'

/** Con LAB_ENABLED distinto de "true", el laboratorio no existe (404). */
export function laboratorioActivo(): boolean {
  return process.env.LAB_ENABLED === 'true'
}

export async function sesionLaboratorio(): Promise<SessionPayload | null> {
  return verifySessionCookie(cookies().get(SESSION_COOKIE_NAME)?.value)
}
