import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'

export const dynamic = 'force-dynamic'

function parseCsv(value: any): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter((v: any) => typeof v === 'string')
  return String(value)
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean)
}

function rowToKit(row: any) {
  return {
    id: row.id,
    levelId: row.level_id || '',
    name: row.name || '',
    description: row.description || '',
    components: parseCsv(row.components),
    skills: parseCsv(row.skills),
    images: parseCsv(row.images),
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
    if (levelId) {
      // Esta consulta (por levelId) la usa KitDisplay en la pagina publica
      // /nivel/[id]: debe devolver el kit del catalogo GENERAL, nunca el
      // kit de un colegio especifico (ej. Lizardo Villamarin), o su precio
      // y descripcion particulares se verian como si fueran para cualquier
      // visitante del sitio. Los kits de un colegio se consultan aparte,
      // filtrando por school_id, desde el panel de ese colegio.
      query = query.eq('level_id', levelId).is('school_id', null)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ kits: [] })
    const kits = (data || []).map(rowToKit)
    if (levelId) return NextResponse.json(kits[0] || null)
    return NextResponse.json({ success: true, kits })
  } catch (error) {
    return NextResponse.json({ kits: [] })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
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
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
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
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
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
