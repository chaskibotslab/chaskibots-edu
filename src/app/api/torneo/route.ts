import { NextRequest, NextResponse } from 'next/server'
import { esJuez, leerTorneo, sinNotas } from '@/lib/torneo'

export const dynamic = 'force-dynamic'

// Lectura pública del torneo. Si quien consulta es juez, incluye las notas internas.
export async function GET(request: NextRequest) {
  try {
    const juez = await esJuez(request)
    const categorias = await leerTorneo()
    return NextResponse.json(
      { success: true, juez, categorias: juez ? categorias : sinNotas(categorias) },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (e) {
    console.error('[torneo] lectura', e)
    return NextResponse.json({ success: false, error: 'No se pudo leer el torneo' }, { status: 500 })
  }
}
