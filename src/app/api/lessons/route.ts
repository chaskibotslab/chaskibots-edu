/**
 * EJEMPLO de refactor: API /lessons usando Supabase
 * 
 * Compara este archivo con route.ts (versión Airtable)
 * Renombrar a route.ts cuando estés listo para migrar
 */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function getVideoEmbedUrl(url: string): string {
  if (!url) return ''
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/)
    if (match?.[1]) return `https://drive.google.com/file/d/${match[1]}/preview`
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`
  }
  return url
}

// ============================================================
// GET /api/lessons?levelId=X&programId=Y
// ============================================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')
  const programId = searchParams.get('programId') || 'robotica'

  try {
    let query = supabaseAdmin
      .from('lessons')
      .select('*')
      .order('display_order', { ascending: true })

    if (levelId) query = query.eq('level_id', levelId)
    if (programId) query = query.eq('program_id', programId)

    const { data, error } = await query

    if (error) {
      console.error('[Lessons] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transformar al formato esperado por el frontend
    const lessons = (data || []).map((row: any) => {
      const moduleName = row.module_name || ''
      const moduleId = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sin-modulo'

      const videoUrlRaw = row.video_url || ''
      const allUrls = videoUrlRaw.split(/[|\n]/).map((u: string) => u.trim()).filter(Boolean)
      const videos: string[] = []
      const images: string[] = []

      allUrls.forEach((url: string, idx: number) => {
        if (idx === 0) { videos.push(url); return }
        const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url) || url.includes('drive.google.com/uc?id=')
        if (isImage) {
          if (url.includes('drive.google.com/file/d/')) {
            const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
            if (m?.[1]) images.push(`https://drive.google.com/uc?id=${m[1]}`)
          } else images.push(url)
        } else videos.push(url)
      })

      return {
        id: row.id,
        levelId: row.level_id,
        programId: row.program_id,
        moduleId,
        moduleName,
        title: row.title,
        type: row.type,
        duration: row.duration,
        order: row.display_order,
        videoUrl: videoUrlRaw,
        videoEmbedUrl: getVideoEmbedUrl(videos[0] || ''),
        videos,
        images: [...images, ...(row.images || [])],
        content: row.content || '',
        locked: row.locked || false,
        pdfUrl: row.pdf_url || '',
      }
    })

    return NextResponse.json(lessons)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// POST /api/lessons - Crear lección
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        level_id: body.levelId,
        program_id: body.programId || 'robotica',
        module_name: body.moduleName,
        title: body.title,
        type: body.type || 'video',
        duration: body.duration || '10 min',
        display_order: body.order || 0,
        video_url: body.videoUrl,
        pdf_url: body.pdfUrl,
        content: body.content,
        locked: body.locked || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, record: data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// PUT /api/lessons - Actualizar lección
// ============================================================
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const updates: any = {}
    if (rest.levelId !== undefined) updates.level_id = rest.levelId
    if (rest.programId !== undefined) updates.program_id = rest.programId
    if (rest.moduleName !== undefined) updates.module_name = rest.moduleName
    if (rest.title !== undefined) updates.title = rest.title
    if (rest.type !== undefined) updates.type = rest.type
    if (rest.duration !== undefined) updates.duration = rest.duration
    if (rest.order !== undefined) updates.display_order = rest.order
    if (rest.videoUrl !== undefined) updates.video_url = rest.videoUrl
    if (rest.pdfUrl !== undefined) updates.pdf_url = rest.pdfUrl
    if (rest.content !== undefined) updates.content = rest.content
    if (rest.locked !== undefined) updates.locked = rest.locked

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, record: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// DELETE /api/lessons?id=X
// ============================================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
