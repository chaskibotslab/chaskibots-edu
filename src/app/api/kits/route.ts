import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToKit(row: any) {
  return {
    id: row.id,
    levelId: row.level_id || '',
    name: row.name || '',
    description: row.description || '',
    components: row.components || '',
    skills: row.skills || '',
    images: row.images || '',
    videoUrl: row.video_url || '',
    tutorialUrl: row.tutorial_url || '',
    price: row.price || 0,
    imageUrl: row.image_url || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')

    let query = supabaseAdmin.from('kits').select('*').order('name')
    if (levelId) query = query.eq('level_id', levelId)

    const { data, error } = await query
    if (error) return NextResponse.json({ kits: [] })
    return NextResponse.json({ success: true, kits: (data || []).map(rowToKit) })
  } catch (error) {
    return NextResponse.json({ kits: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, levelId, name, description, components, skills, images, videoUrl, tutorialUrl, price, imageUrl } = body
    if (!name || !levelId) return NextResponse.json({ error: 'name y levelId requeridos' }, { status: 400 })

    const kitId = id || `kit-${levelId}-${Date.now()}`

    const { data, error } = await supabaseAdmin.from('kits').insert({
      id: kitId, level_id: levelId, name,
      description: description || null, components: components || null, skills: skills || null,
      images: images || null, video_url: videoUrl || null, tutorial_url: tutorialUrl || null,
      price: price || null, image_url: imageUrl || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, kit: rowToKit(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, levelId, name, description, components, skills, images, videoUrl, tutorialUrl, price, imageUrl } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('kits')
      .update({
        level_id: levelId,
        name,
        description: description || null,
        components: components || null,
        skills: skills || null,
        images: images || null,
        video_url: videoUrl || null,
        tutorial_url: tutorialUrl || null,
        price: price || null,
        image_url: imageUrl || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, kit: rowToKit(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const { error } = await supabaseAdmin.from('kits').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
