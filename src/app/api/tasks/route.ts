import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'
import { verifySessionCookie, SESSION_COOKIE_NAME, type SessionPayload } from '@/lib/session'
import { alcanceColegio, puedeVer, colegiosDelNivel } from '@/lib/academiaAccess'

export const dynamic = 'force-dynamic'

// Parsea formato legacy [type|category|difficulty|url] description
function parseLegacyDescription(desc: string) {
  if (!desc) return { type: null, category: null, difficulty: null, attachmentUrl: null, description: '' }
  const m4 = desc.match(/^\[([^|]*)\|([^|]*)\|([^|]*)\|([^\]]*)\]\s*(.*)$/)
  const m3 = desc.match(/^\[([^|]+)\|([^|]+)\|([^\]]+)\]\s*(.*)$/)
  if (m4) return { type: m4[1] || null, category: m4[2] || null, difficulty: m4[3] || null, attachmentUrl: m4[4] || null, description: m4[5] || '' }
  if (m3) return { type: m3[1] || null, category: m3[2] || null, difficulty: m3[3] || null, attachmentUrl: null, description: m3[4] || '' }
  return { type: null, category: null, difficulty: null, attachmentUrl: null, description: desc }
}

function rowToTask(row: any) {
  // Si columnas nuevas tienen valor, usarlas; sino parsear legacy
  const legacy = parseLegacyDescription(row.description || '')
  return {
    id: row.id,
    levelId: row.level_id || '',
    // Colegio dueño de la tarea; vacío = tarea general.
    schoolId: row.school_id || '',
    title: row.title || '',
    description: row.type ? (row.description || '') : legacy.description,
    type: row.type || legacy.type || 'concept',
    category: row.category || legacy.category || 'general',
    difficulty: row.difficulty || legacy.difficulty || 'basico',
    points: row.points || 10,
    dueDate: row.due_date || '',
    isActive: row.is_active !== false,
    questions: Array.isArray(row.questions)
      ? row.questions
      : (row.questions_text ? row.questions_text.split('|').filter(Boolean) : []),
    createdAt: row.created_at || new Date().toISOString(),
    attachmentUrl: row.attachment_url || legacy.attachmentUrl || '',
    attachmentType: (row.attachment_url || legacy.attachmentUrl) ? 'drive' : 'none',
  }
}

// Colegio que tendrá una tarea nueva de ese grado.
async function colegioParaCrear(session: SessionPayload, levelId: string, pedido?: string): Promise<{ ok: true; schoolId: string | null } | { ok: false; error: string }> {
  if (session.role === 'admin') return { ok: true, schoolId: pedido && pedido !== 'general' ? pedido : null }
  const alcance = await alcanceColegio(session)
  const colegios = colegiosDelNivel(alcance, levelId)
  if (colegios.length > 0) return { ok: true, schoolId: pedido && colegios.includes(pedido) ? pedido : colegios[0] }
  if (alcance.niveles.has(levelId)) return { ok: true, schoolId: null }
  return { ok: false, error: 'No tienes asignado ese grado.' }
}

// Un docente solo cambia o borra las tareas que le corresponden: las de su colegio
// y grado (o las generales, si su grado no es de una institución).
async function puedeModificar(session: SessionPayload, taskId: string): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (session.role === 'admin') return { ok: true }
  const { data: tarea } = await supabaseAdmin.from('tasks').select('*').eq('id', taskId).maybeSingle()
  if (!tarea) return { ok: false, error: 'La tarea no existe', status: 404 }
  const alcance = await alcanceColegio(session)
  if (!puedeVer(alcance, tarea.level_id, tarea.school_id)) return { ok: false, error: 'Esta tarea no es de tus cursos.', status: 403 }
  return { ok: true }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const activeOnly = searchParams.get('activeOnly') !== 'false'
    // Solo para el administrador: 'general' o el id de un colegio.
    const schoolFilter = searchParams.get('schoolId')
    const session = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value)
    const alcance = await alcanceColegio(session)

    let query = supabaseAdmin.from('tasks').select('*').order('created_at', { ascending: false })
    if (levelId) query = query.eq('level_id', levelId)
    if (activeOnly) query = query.eq('is_active', true)

    const { data, error } = await query
    if (error) {
      console.error('[Tasks] Supabase error:', error)
      return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
    }

    // Cada quien ve las tareas de su colegio y grado; lo general, solo quien no
    // tiene ese grado en una institución. Sin sesión: solo lo general.
    const visibles = (data || []).filter((row: any) => {
      if (alcance.esAdmin) return !schoolFilter || (schoolFilter === 'general' ? !row.school_id : row.school_id === schoolFilter)
      if (!session) return !row.school_id
      return puedeVer(alcance, row.level_id, row.school_id)
    })
    const tasks = visibles.map(rowToTask)
    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    const { levelId, title, description, type, category, difficulty, points, dueDate, questions, attachmentUrl } = body

    if (!levelId || !title) {
      return NextResponse.json({ error: 'levelId y title son requeridos' }, { status: 400 })
    }

    const questionsArr = Array.isArray(questions) ? questions.filter((q: string) => q && q.trim()) : []

    // A qué colegio pertenece. El docente no lo elige: sale de sus cursos.
    // El administrador puede indicarlo (vacío = tarea general).
    const destino = await colegioParaCrear(auth.session, levelId, body.schoolId)
    if (!destino.ok) return NextResponse.json({ error: destino.error }, { status: 403 })

    const { data, error } = await supabaseAdmin.from('tasks').insert({
      level_id: levelId,
      school_id: destino.schoolId,
      title,
      description: description || '',
      type: type || 'concept',
      category: category || 'general',
      difficulty: difficulty || 'basico',
      points: Number(points) || 10,
      due_date: dueDate || null,
      is_active: true,
      questions: questionsArr.length > 0 ? questionsArr : null,
      questions_text: questionsArr.join('|') || null,
      attachment_url: attachmentUrl || null,
      attachment_type: attachmentUrl ? 'drive' : null,
    }).select().single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, task: rowToTask(data), message: 'Tarea creada correctamente' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    const { taskId, ...updates } = body

    if (!taskId) return NextResponse.json({ error: 'taskId es requerido' }, { status: 400 })

    const permiso = await puedeModificar(auth.session, taskId)
    if (!permiso.ok) return NextResponse.json({ error: permiso.error }, { status: permiso.status })

    const fields: Record<string, any> = {}
    // Solo el administrador puede mover una tarea de grado o de colegio.
    if (auth.session.role === 'admin') {
      if (updates.levelId !== undefined) fields.level_id = updates.levelId
      if (updates.schoolId !== undefined) fields.school_id = updates.schoolId && updates.schoolId !== 'general' ? updates.schoolId : null
    }
    if (updates.title !== undefined) fields.title = updates.title
    if (updates.description !== undefined) fields.description = updates.description
    if (updates.type !== undefined) fields.type = updates.type
    if (updates.category !== undefined) fields.category = updates.category
    if (updates.difficulty !== undefined) fields.difficulty = updates.difficulty
    if (updates.points !== undefined) fields.points = Number(updates.points) || 10
    if (updates.dueDate !== undefined) fields.due_date = updates.dueDate || null
    if (updates.isActive !== undefined) fields.is_active = Boolean(updates.isActive)
    if (updates.attachmentUrl !== undefined) {
      fields.attachment_url = updates.attachmentUrl || null
      fields.attachment_type = updates.attachmentUrl ? 'drive' : null
    }
    if (updates.questions !== undefined) {
      const arr = Array.isArray(updates.questions) ? updates.questions.filter((q: string) => q && q.trim()) : []
      fields.questions = arr.length > 0 ? arr : null
      fields.questions_text = arr.join('|') || null
    }

    const { error } = await supabaseAdmin.from('tasks').update(fields).eq('id', taskId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Tarea actualizada' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    const { taskId } = body
    if (!taskId) return NextResponse.json({ error: 'taskId es requerido' }, { status: 400 })

    const permiso = await puedeModificar(auth.session, taskId)
    if (!permiso.ok) return NextResponse.json({ error: permiso.error }, { status: permiso.status })

    const { error } = await supabaseAdmin.from('tasks').delete().eq('id', taskId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
