import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'

export const dynamic = 'force-dynamic'

const BUCKET = 'kit-esquemas'

async function ensureBucket() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
  if (listError) throw listError
  if (buckets?.some(b => b.id === BUCKET)) return
  const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true })
  if (createError) throw createError
}

// Reemplaza el esquema de un proyecto por una imagen o PDF subido a mano
// desde el admin, en vez del diagrama SVG generado. Borra el esquema
// anterior (sea SVG generado o una imagen previa) e inserta uno nuevo.
export async function POST(request: NextRequest, { params }: { params: { id: string; proyectoId: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const { data: proyecto, error: proyErr } = await supabaseAdmin
      .from('kit_proyectos')
      .select('id')
      .eq('id', params.proyectoId)
      .eq('kit_id', params.id)
      .maybeSingle()
    if (proyErr) return NextResponse.json({ success: false, error: proyErr.message }, { status: 500 })
    if (!proyecto) return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ success: false, error: 'No se proporcionó archivo' }, { status: 400 })

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (!isImage && !isPdf) {
      return NextResponse.json({ success: false, error: 'Solo se permiten imágenes (JPG, PNG, WEBP) o PDF' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Archivo muy grande. Máximo 10MB.' }, { status: 400 })
    }

    await ensureBucket()

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filePath = `${params.proyectoId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: file.type, upsert: true })
    if (uploadError) return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)
    const url = publicUrlData.publicUrl

    // La columna tipo solo admite 'svg'|'wokwi'|'imagen' -- un PDF tambien
    // se guarda como 'imagen' (el frontend distingue por la extension .pdf
    // de la URL para mostrar un link en vez de una etiqueta <img>).
    await supabaseAdmin.from('kit_esquemas').delete().eq('proyecto_id', proyecto.id)
    const { error: insErr } = await supabaseAdmin.from('kit_esquemas').insert({
      proyecto_id: proyecto.id,
      tipo: 'imagen',
      url,
      contenido: null,
    })
    if (insErr) return NextResponse.json({ success: false, error: insErr.message }, { status: 500 })

    return NextResponse.json({ success: true, url, tipo: isPdf ? 'pdf' : 'imagen' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error interno' }, { status: 500 })
  }
}

// Borra el esquema actual del proyecto (vuelve a quedar sin esquema -- si
// es una practica/adicional sin armado propio, el modal del estudiante
// usara el esquema del proyecto principal como respaldo).
export async function DELETE(request: NextRequest, { params }: { params: { id: string; proyectoId: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  const { data: proyecto, error: proyErr } = await supabaseAdmin
    .from('kit_proyectos')
    .select('id')
    .eq('id', params.proyectoId)
    .eq('kit_id', params.id)
    .maybeSingle()
  if (proyErr) return NextResponse.json({ success: false, error: proyErr.message }, { status: 500 })
  if (!proyecto) return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 })

  const { error: delErr } = await supabaseAdmin.from('kit_esquemas').delete().eq('proyecto_id', proyecto.id)
  if (delErr) return NextResponse.json({ success: false, error: delErr.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
