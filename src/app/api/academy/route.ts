import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/academy?course=python
// GET /api/academy?course=python&module=fundamentos
// GET /api/academy?lesson=uuid
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const courseSlug = searchParams.get('course')
    const moduleSlug = searchParams.get('module')
    const lessonId = searchParams.get('lesson')

    // Get single lesson
    if (lessonId) {
      const { data, error } = await supabaseAdmin
        .from('simulator_lessons')
        .select('*, module:simulator_modules(id, slug, title, course:simulator_courses(id, slug, title))')
        .eq('id', lessonId)
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }

    // Get all courses
    if (!courseSlug) {
      const { data, error } = await supabaseAdmin
        .from('simulator_courses')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return NextResponse.json({ courses: data })
    }

    // Get course with modules
    if (courseSlug && !moduleSlug) {
      const { data: course, error: courseError } = await supabaseAdmin
        .from('simulator_courses')
        .select('*')
        .eq('slug', courseSlug)
        .single()

      if (courseError) throw courseError

      const { data: modules, error: modError } = await supabaseAdmin
        .from('simulator_modules')
        .select('*, lessons:simulator_lessons(id, slug, title, description, difficulty, estimated_minutes, sort_order)')
        .eq('course_id', course.id)
        .eq('is_active', true)
        .order('sort_order')

      if (modError) throw modError

      // Sort lessons within each module
      modules?.forEach((m: any) => {
        m.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order)
      })

      return NextResponse.json({ course, modules })
    }

    // Get module with full lessons
    if (courseSlug && moduleSlug) {
      const { data: course } = await supabaseAdmin
        .from('simulator_courses')
        .select('id, slug, title')
        .eq('slug', courseSlug)
        .single()

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      const { data: module, error: modError } = await supabaseAdmin
        .from('simulator_modules')
        .select('*')
        .eq('course_id', course.id)
        .eq('slug', moduleSlug)
        .single()

      if (modError) throw modError

      const { data: lessons, error: lessonsError } = await supabaseAdmin
        .from('simulator_lessons')
        .select('*')
        .eq('module_id', module.id)
        .eq('is_active', true)
        .order('sort_order')

      if (lessonsError) throw lessonsError

      return NextResponse.json({ course, module, lessons })
    }

    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  } catch (error: any) {
    console.error('Academy API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
