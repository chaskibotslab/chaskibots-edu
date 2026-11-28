import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySessionCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { buildKitFichas } from '@/lib/kitFicha'
import { academiaAccessFor, ACADEMIAS_CON_ADICIONALES } from '@/lib/academiaAccess'

export const dynamic = 'force-dynamic'

// Ficha completa de UN kit de Academia, para /academia/[schoolId]/[kitId].
// Requiere sesion valida y que el curso sea de la persona (ver academiaAccess).
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

    // Solo quien tiene este curso (su colegio y nivel) puede abrirlo. Antes
    // bastaba cualquier sesión y el enlace: se podía leer el curso de otro colegio.
    const access = await academiaAccessFor(session)
    if (access !== 'all' && !access.has(kitRow.school_id + '|' + kitRow.level_id)) {
      return NextResponse.json({ success: false, error: 'Este curso no está asignado a tu usuario.' }, { status: 403 })
    }

    const [kit] = await buildKitFichas([kitRow])
    // Los cursos de Academia muestran solo el proyecto principal + sus
    // practicas (maximo 3-4 "circuitos" por kit, a pedido del cliente).
    // Los "adicionales" se mantienen en la base de datos (no se borran,
    // el admin los sigue viendo en /admin/kits) pero no se exponen aqui.
    // Excepción: los colegios cuyo plan del año usa los adicionales.
    if (kit && !ACADEMIAS_CON_ADICIONALES.has(kitRow.school_id)) kit.proyectos = kit.proyectos.filter((p: any) => p.tipo !== 'adicional')
    return NextResponse.json({ success: true, kit })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error interno' }, { status: 500 })
  }
}
