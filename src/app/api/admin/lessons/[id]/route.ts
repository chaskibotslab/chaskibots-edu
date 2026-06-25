import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const fields: Record<string, any> = {}
    if (body.videoUrl !== undefined) fields.video_url = body.videoUrl || null
    if (body.imageUrl !== undefined) fields.images = body.imageUrl ? [body.imageUrl] : []
    if (body.resources !== undefined) fields.resources = body.resources || null
    if (body.externalLinks !== undefined) fields.external_links = body.externalLinks || null
    if (body.title !== undefined) fields.title = body.title || null
    if (body.description !== undefined) fields.description = body.description || null
    if (body.levelId !== undefined) fields.level_id = body.levelId || null
    if (body.programId !== undefined) fields.program_id = body.programId || null
    if (body.isActive !== undefined) fields.is_active = body.isActive

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating lesson:', error)
      return NextResponse.json(
        { error: 'Failed to update lesson' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      fields: data
    })

  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('id', id)
      .limit(1)

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: data[0].id,
      ...data[0]
    })

  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
