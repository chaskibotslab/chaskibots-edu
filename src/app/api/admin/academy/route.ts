import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Entity = 'course' | 'module' | 'lesson'
const TABLES: Record<Entity, string> = {
  course: 'simulator_courses',
  module: 'simulator_modules',
  lesson: 'simulator_lessons',
}

function isEntity(value: any): value is Entity {
  return value === 'course' || value === 'module' || value === 'lesson'
}

// GET /api/admin/academy — árbol completo: cursos -> módulos -> lecciones (con conteos)
export async function GET() {
  try {
    const [{ data: courses, error: cErr }, { data: modules, error: mErr }, { data: lessons, error: lErr }] = await Promise.all([
      supabaseAdmin.from('simulator_courses').select('*').order('sort_order'),
      supabaseAdmin.from('simulator_modules').select('*').order('sort_order'),
      supabaseAdmin.from('simulator_lessons').select('*').order('sort_order'),
    ])
    if (cErr) throw cErr
    if (mErr) throw mErr
    if (lErr) throw lErr

    const tree = (courses || []).map((course: any) => ({
      ...course,
      modules: (modules || [])
        .filter((m: any) => m.course_id === course.id)
        .map((mod: any) => ({
          ...mod,
          lessons: (lessons || []).filter((l: any) => l.module_id === mod.id),
        })),
    }))

    return NextResponse.json({ success: true, courses: tree })
  } catch (error: any) {
    console.error('[Admin Academy] GET error:', error)
    return NextResponse.json({ success: false, error: error.message, courses: [] }, { status: 500 })
  }
}

// POST /api/admin/academy — body: { entity: 'course'|'module'|'lesson', ...campos }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entity, ...fields } = body
    if (!isEntity(entity)) {
      return NextResponse.json({ error: 'entity debe ser course, module o lesson' }, { status: 400 })
    }
    if (!fields.title) {
      return NextResponse.json({ error: 'title es requerido' }, { status: 400 })
    }
    if (entity === 'module' && !fields.course_id) {
      return NextResponse.json({ error: 'course_id es requerido para un módulo' }, { status: 400 })
    }
    if (entity === 'lesson' && !fields.module_id) {
      return NextResponse.json({ error: 'module_id es requerido para una lección' }, { status: 400 })
    }
    if (entity !== 'lesson' && !fields.slug) {
      return NextResponse.json({ error: 'slug es requerido' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from(TABLES[entity]).insert(fields).select().single()
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('[Admin Academy] POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/admin/academy — body: { entity, id, ...campos a actualizar }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { entity, id, ...fields } = body
    if (!isEntity(entity) || !id) {
      return NextResponse.json({ error: 'entity e id son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from(TABLES[entity]).update(fields).eq('id', id).select().single()
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('[Admin Academy] PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/academy?entity=lesson&id=uuid
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entity = searchParams.get('entity')
    const id = searchParams.get('id')
    if (!isEntity(entity) || !id) {
      return NextResponse.json({ error: 'entity e id son requeridos' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from(TABLES[entity]).delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Admin Academy] DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
