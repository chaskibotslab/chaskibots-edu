// Proxy al servicio compilador (servicio separado en Railway).
// La clave del compilador nunca llega al navegador: la agrega este servidor.
import { NextResponse } from 'next/server'
import { laboratorioActivo, sesionLaboratorio } from '@/modules/laboratorio/server/acceso'
import { prepararSketch } from '@/modules/laboratorio/esp32/capasPlacas'

export const dynamic = 'force-dynamic'

const PLACAS = new Set(['uno', 'nano', 'mega', 'esp32', 'pico'])

export async function POST(req: Request) {
  if (!laboratorioActivo()) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const sesion = await sesionLaboratorio()
  if (!sesion) return NextResponse.json({ error: 'Inicia sesión para compilar' }, { status: 401 })

  const url = process.env.LAB_COMPILER_URL
  const key = process.env.LAB_COMPILER_KEY
  if (!url || !key) return NextResponse.json({ error: 'El compilador no está configurado' }, { status: 503 })

  let body: { board?: unknown; code?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }
  let board = String(body.board ?? 'uno')
  let code = String(body.code ?? '')
  if (!PLACAS.has(board)) return NextResponse.json({ error: 'Placa no soportada' }, { status: 400 })
  if (code.length > 64 * 1024) return NextResponse.json({ error: 'El código supera 64 KB' }, { status: 413 })
  // ESP32, Pico y Mega: se compilan sobre el ATmega2560 del simulador con la capa de su placa delante.
  const listo = prepararSketch(board, code)
  if (listo.error) return NextResponse.json({ ok: false, errors: [{ line: 1, col: 1, severity: 'error', message: listo.error }] })
  code = listo.codigo
  board = listo.board

  const destino = `${url.replace(/\/$/, '')}/compile`
  try {
    const res = await fetch(destino, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-lab-key': key, 'x-user-id': sesion.id },
      body: JSON.stringify({ board, code }),
      signal: AbortSignal.timeout(45_000), // incluye el arranque en frío del servicio dormido
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({ error: `Respuesta inválida del compilador (HTTP ${res.status})` }))
    if (!res.ok && !data.errors) console.error(`[lab] compilador respondió ${res.status}:`, data.error)
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    // El motivo real (DNS, conexión rechazada, tiempo agotado…) va al registro
    // del servidor y, resumido, a la pantalla para poder diagnosticar.
    const e = err as Error & { cause?: { code?: string; message?: string } }
    const motivo = e.cause?.code || e.name || 'desconocido'
    console.error(`[lab] no se pudo contactar al compilador en ${destino}:`, e.name, e.message, e.cause)
    return NextResponse.json({ error: `No se pudo contactar al compilador (${motivo}). Intenta de nuevo en unos segundos.` }, { status: 502 })
  }
}
