// «Mis robots»: listar y crear. La lógica vive en src/modules/laboratorio/server/robots.ts.
import { NextResponse } from 'next/server'
import { docValido, errorBase, exigirSesion, guardarVersion, supabaseAdmin } from '@/modules/laboratorio/server/robots'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { sesion, error } = await exigirSesion()
  if (error) return error
  const { data, error: e } = await supabaseAdmin
    .from('lab_robots').select('id, nombre, actualizado, doc->piezas')
    .eq('user_id', sesion.id).order('actualizado', { ascending: false }).limit(100)
  if (e) return errorBase(e)
  return NextResponse.json({
    robots: (data ?? []).map(r => ({ id: r.id, nombre: r.nombre, actualizado: r.actualizado, piezas: Array.isArray(r.piezas) ? r.piezas.length : 0 })),
  })
}

export async function POST(req: Request) {
  const { sesion, error } = await exigirSesion()
  if (error) return error
  const body = await req.json().catch(() => null)
  const malo = docValido(body?.doc)
  if (malo) return NextResponse.json({ error: malo }, { status: 400 })
  const nombre = String(body.nombre ?? 'Mi robot').slice(0, 60)
  const { data, error: e } = await supabaseAdmin.from('lab_robots').insert({ user_id: sesion.id, nombre, doc: body.doc }).select('id').single()
  if (e || !data) return errorBase(e)
  await guardarVersion(data.id, body.doc)
  return NextResponse.json({ id: data.id })
}
