import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/academy/progress?userId=xxx&courseSlug=python
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const courseSlug = searchParams.get('courseSlug')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('simulator_progress')
      .select('*, lesson:simulator_lessons(id, slug, title, module:simulator_modules(id, slug, course:simulator_courses(slug)))')
      .eq('user_id', userId)

    const { data, error } = await query

    if (error) throw error

    // Filter by course if specified
    let progress = data || []
    if (courseSlug) {
      progress = progress.filter((p: any) => p.lesson?.module?.course?.slug === courseSlug)
    }

    return NextResponse.json({ progress })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/academy/progress - Save progress
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, lessonId, completed, score, codeSubmitted } = body

    if (!userId || !lessonId) {
      return NextResponse.json({ error: 'userId and lessonId required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('simulator_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed: completed || false,
        score: score || 0,
        code_submitted: codeSubmitted || '',
        completed_at: completed ? new Date().toISOString() : null,
      }, {
        onConflict: 'user_id,lesson_id'
      })
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
