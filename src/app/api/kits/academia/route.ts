import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySessionCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { buildKitFichas } from '@/lib/kitFicha'

export const dynamic = 'force-dynamic'

// Ficha(s) completa(s) de los kits de colegio (school_id IS NOT NULL)
// para un nivel, para mostrar en /nivel/[id] el bloque "Curso de tu
// Academia". A diferencia de GET /api/kits (catalogo general, sin
// colegio), esta ruta es justo lo contrario: solo kits CON colegio.
//
// Requiere sesion valida (cualquier rol: admin, profesor o estudiante)
// -- el middleware ya protege la pagina /nivel/[id], pero las rutas de
// API no pasan por el middleware (son otro matcher), asi que el chequeo
// de sesion va aqui tambien.
export async function GET(request: NextRequest) {
  const session = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    if (!levelId) return NextResponse.json({ success: false, error: 'levelId requerido' }, { status: 400 })

    const { data: kitRows, error: kitError } = await supabaseAdmin
      .from('kits')
      .select('*')
      .eq('level_id', levelId)
      .eq('visible', true)
      .not('school_id', 'is', null)

    if (kitError) return NextResponse.json({ success: false, error: kitError.message }, { status: 500 })

    const kits = await buildKitFichas(kitRows || [])
    return NextResponse.json({ success: true, kits })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error interno' }, { status: 500 })
  }
}
