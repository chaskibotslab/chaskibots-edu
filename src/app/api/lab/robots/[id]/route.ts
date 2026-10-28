// «Mis robots»: abrir, guardar cambios (con historial) y borrar un robot propio.
import { NextResponse } from 'next/server'
import { docValido, errorBase, exigirSesion, guardarVersion, supabaseAdmin } from '@/modules/laboratorio/server/robots'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }
const uuid = /^[0-9a-f-]{36}$/i

export async function GET(req: Request, { params }: Ctx) {
  const { sesion, error } = await exigirSesion()
  if (error) return error
  if (!uuid.test(params.id)) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const url = new URL(req.url)
  const { data, error: e } = await supabaseAdmin.from('lab_robots').select('id, nombre, doc, actualizado').eq('id', params.id).eq('user_id', sesion.id).maybeSingle()
  if (e) return errorBase(e)
  if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  // ?versiones → lista del historial; ?version=<id> → una versión anterior.
  if (url.searchParams.has('versiones')) {
    const { data: vs, error: e2 } = await supabaseAdmin.from('lab_robot_versiones').select('id, creado').eq('robot_id', params.id).order('creado', { ascending: false })
    if (e2) return errorBase(e2)
    return NextResponse.json({ versiones: vs ?? [] })
  }
  const version = url.searchParams.get('version')
  if (version && uuid.test(version)) {
    const { data: v, error: e3 } = await supabaseAdmin.from('lab_robot_versiones').select('doc, creado').eq('id', version).eq('robot_id', params.id).maybeSingle()
    if (e3) return errorBase(e3)
    if (!v) return NextResponse.json({ error: 'Versión no encontrada' }, { status: 404 })
    return NextResponse.json({ id: data.id, nombre: data.nombre, doc: v.doc, actualizado: v.creado })
  }
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: Ctx) {
  const { sesion, error } = await exigirSesion()
  if (error) return error
  if (!uuid.test(params.id)) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const body = await req.json().catch(() => null)
  const malo = docValido(body?.doc)
  if (malo) return NextResponse.json({ error: malo }, { status: 400 })
  const nombre = String(body.nombre ?? 'Mi robot').slice(0, 60)
  const { data, error: e } = await supabaseAdmin.from('lab_robots')
    .update({ nombre, doc: body.doc, actualizado: new Date().toISOString() })
    .eq('id', params.id).eq('user_id', sesion.id).select('id').maybeSingle()
  if (e) return errorBase(e)
  if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  await guardarVersion(params.id, body.doc)
  return NextResponse.json({ id: params.id })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { sesion, error } = await exigirSesion()
  if (error) return error
  if (!uuid.test(params.id)) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const { error: e } = await supabaseAdmin.from('lab_robots').delete().eq('id', params.id).eq('user_id', sesion.id)
  if (e) return errorBase(e)
  return NextResponse.json({ ok: true })
}
