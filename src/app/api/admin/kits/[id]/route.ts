import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'
import { buildKitFichas } from '@/lib/kitFicha'

export const dynamic = 'force-dynamic'

// Ficha completa de un kit: datos generales + placa + materiales + cada
// proyecto (principal y adicionales) con sus conexiones, esquema y codigo.
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const { data: kitRow, error: kitError } = await supabaseAdmin
      .from('kits')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (kitError) return NextResponse.json({ success: false, error: kitError.message }, { status: 500 })
    if (!kitRow) return NextResponse.json({ success: false, error: 'Kit no encontrado' }, { status: 404 })

    const [kit] = await buildKitFichas([kitRow])
    return NextResponse.json({ success: true, kit })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error interno' }, { status: 500 })
  }
}
