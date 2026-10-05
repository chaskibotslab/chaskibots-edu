import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySessionCookie, SESSION_COOKIE_NAME } from '@/lib/session'

export const dynamic = 'force-dynamic'

// Lista, agrupados por institucion, los cursos de Academia (kits con
// school_id) visibles -- para la seccion "Cursos por institucion" en
// /niveles. Generico: cualquier colegio que tenga kits aparece aqui
// solo, no esta hardcodeado a ninguna academia en particular.
//
// Requiere sesion valida (cualquier rol). El middleware protege la
// pagina /niveles, pero las rutas de API tienen su propio matcher, asi
// que el chequeo va tambien aqui.
export async function GET(request: NextRequest) {
  const session = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
  }

  try {
    // curso_id IS NOT NULL es lo que distingue un "curso de Academia"
    // (este sistema nuevo) del catalogo viejo de kits por nivel (kits
    // genericos tipo KitDisplay, sin curso ni institucion propios) --
    // sin este filtro, los 16 kits genericos caerian todos en un falso
    // grupo "Otros cursos".
    const { data: kits, error: kitsError } = await supabaseAdmin
      .from('kits')
      .select('id, name, level_id, school_id, curso_id, price')
      .eq('visible', true)
      .not('curso_id', 'is', null)

    if (kitsError) return NextResponse.json({ success: false, error: kitsError.message }, { status: 500 })

    const cursoIds = [...new Set((kits || []).map(k => k.curso_id).filter(Boolean))]
    const schoolIds = [...new Set((kits || []).map(k => k.school_id).filter(Boolean))]

    const [coursesRes, schoolsRes] = await Promise.all([
      cursoIds.length ? supabaseAdmin.from('courses').select('id, name').in('id', cursoIds) : Promise.resolve({ data: [], error: null } as any),
      schoolIds.length ? supabaseAdmin.from('schools').select('id, name, city').in('id', schoolIds) : Promise.resolve({ data: [], error: null } as any),
    ])
    if (coursesRes.error) return NextResponse.json({ success: false, error: coursesRes.error.message }, { status: 500 })
    if (schoolsRes.error) return NextResponse.json({ success: false, error: schoolsRes.error.message }, { status: 500 })

    const courseNameById = new Map<string, string>((coursesRes.data || []).map((c: any) => [c.id, c.name]))
    const schoolById = new Map<string, any>((schoolsRes.data || []).map((s: any) => [s.id, s]))

    const groups = new Map<string, { schoolId: string; schoolName: string; city: string | null; cursos: any[] }>()

    for (const kit of kits || []) {
      const hasSchool = !!kit.school_id
      const groupId = hasSchool ? kit.school_id! : 'otros'
      if (!groups.has(groupId)) {
        const school = hasSchool ? schoolById.get(kit.school_id) : null
        groups.set(groupId, {
          schoolId: groupId,
          schoolName: hasSchool ? (school?.name || kit.school_id!) : 'Otros cursos',
          city: hasSchool ? (school?.city || null) : null,
          cursos: [],
        })
      }
      groups.get(groupId)!.cursos.push({
        kitId: kit.id,
        courseId: kit.curso_id,
        courseName: kit.curso_id ? courseNameById.get(kit.curso_id) || kit.name : kit.name,
        levelId: kit.level_id,
        price: kit.price,
      })
    }

    // Solo instituciones con al menos un curso (si un colegio no tiene
    // ningun kit visible, no aparece -- nada que mostrar ahi todavia).
    const instituciones = [...groups.values()].sort((a, b) => a.schoolName.localeCompare(b.schoolName))

    return NextResponse.json({ success: true, instituciones })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error interno' }, { status: 500 })
  }
}
