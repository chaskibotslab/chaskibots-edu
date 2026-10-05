import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySessionCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { buildKitFichas } from '@/lib/kitFicha'

export const dynamic = 'force-dynamic'

// Ficha completa de UN kit de Academia, para /academia/[schoolId]/[kitId].
// Requiere sesion valida (cualquier rol), igual que /api/academia/instituciones.
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { data: kitRow, error } = await supabaseAdmin
      .from('kits')
      .select('*')
      .eq('id', params.id)
      .eq('visible', true)
      .maybeSingle()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    if (!kitRow) return NextResponse.json({ success: false, error: 'Kit no encontrado' }, { status: 404 })

    const [kit] = await buildKitFichas([kitRow])
    return NextResponse.json({ success: true, kit })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error interno' }, { status: 500 })
  }
}
