import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/requireAdmin'
import { getUserScope } from '@/lib/scope'

export const dynamic = 'force-dynamic'

// GET — grupos y programas que le corresponden al usuario logueado
export async function GET(request: NextRequest) {
  const auth = await requireSession(request)
  if (!auth.ok) return auth.response
  try {
    return NextResponse.json({ success: true, scope: await getUserScope(auth.session) })
  } catch (error) {
    console.error('[Scope] error:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener el alcance' }, { status: 500 })
  }
}
