import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST - Sincronizar levelId en teacher_courses con los de programs/courses
export async function POST() {
  try {
    console.log('[Sync] Iniciando sincronización de teacher_courses...')

    // 1. Obtener programas y courses_catalog
    const { data: programs, error: progError } = await supabaseAdmin
      .from('programs')
      .select('id, level_id')
    if (progError) console.error('[Sync] Error obteniendo programs:', progError.message)

    const { data: courses, error: courseError } = await supabaseAdmin
      .from('courses_catalog')
      .select('id, level_id')
    if (courseError) console.error('[Sync] Error obteniendo courses_catalog:', courseError.message)

    // Mapa de courseId -> levelId
    const levelIdMap: Record<string, string> = {}
    ;(programs || []).forEach(p => { if (p.id && p.level_id) levelIdMap[p.id] = p.level_id })
    ;(courses || []).forEach(c => { if (c.id && c.level_id) levelIdMap[c.id] = c.level_id })

    console.log('[Sync] Mapa de levelId creado:', Object.keys(levelIdMap).length, 'entradas')

    // 2. Obtener asignaciones
    const { data: teacherCourses, error: tcError } = await supabaseAdmin
      .from('teacher_courses')
      .select('*')
    if (tcError) throw tcError

    console.log('[Sync] Asignaciones encontradas:', teacherCourses?.length || 0)

    // 3. Identificar correcciones
    const corrections: { recordId: string; courseId: string; oldLevelId: string; newLevelId: string }[] = []
    ;(teacherCourses || []).forEach(tc => {
      const correctLevelId = levelIdMap[tc.course_id || '']
      const currentLevelId = tc.level_id || ''
      if (correctLevelId && currentLevelId !== correctLevelId) {
        corrections.push({
          recordId: tc.id,
          courseId: tc.course_id || '',
          oldLevelId: currentLevelId,
          newLevelId: correctLevelId
        })
      }
    })

    console.log('[Sync] Correcciones necesarias:', corrections.length)

    // 4. Aplicar correcciones
    let corrected = 0
    const errors: string[] = []
    for (const correction of corrections) {
      const { error } = await supabaseAdmin
        .from('teacher_courses')
        .update({ level_id: correction.newLevelId })
        .eq('id', correction.recordId)
      if (error) {
        const errorMsg = `Error corrigiendo ${correction.courseId}: ${error.message}`
        errors.push(errorMsg)
        console.error(errorMsg)
      } else {
        corrected++
        console.log(`[Sync] Corregido: ${correction.courseId} - ${correction.oldLevelId} -> ${correction.newLevelId}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sincronización completada',
      stats: {
        totalAssignments: teacherCourses?.length || 0,
        correctionsNeeded: corrections.length,
        corrected,
        errors: errors.length
      },
      corrections,
      errors
    })

  } catch (error) {
    console.error('[Sync] Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// GET - Ver estado actual sin hacer cambios
export async function GET() {
  try {
    const { data: programs } = await supabaseAdmin.from('programs').select('id, level_id')
    const { data: courses } = await supabaseAdmin.from('courses_catalog').select('id, level_id')
    const { data: teacherCourses, error: tcError } = await supabaseAdmin.from('teacher_courses').select('*')
    if (tcError) throw tcError

    const levelIdMap: Record<string, string> = {}
    ;(programs || []).forEach(p => { if (p.id && p.level_id) levelIdMap[p.id] = p.level_id })
    ;(courses || []).forEach(c => { if (c.id && c.level_id) levelIdMap[c.id] = c.level_id })

    const inconsistencies: { courseId: string; courseName: string; teacherName: string; currentLevelId: string; correctLevelId: string }[] = []
    ;(teacherCourses || []).forEach(tc => {
      const correctLevelId = levelIdMap[tc.course_id || '']
      const currentLevelId = tc.level_id || ''
      if (correctLevelId && currentLevelId !== correctLevelId) {
        inconsistencies.push({
          courseId: tc.course_id || '',
          courseName: tc.course_name || '',
          teacherName: tc.teacher_name || '',
          currentLevelId,
          correctLevelId
        })
      }
    })

    return NextResponse.json({
      success: true,
      totalAssignments: teacherCourses?.length || 0,
      totalPrograms: programs?.length || 0,
      totalCourses: courses?.length || 0,
      inconsistencies,
      message: inconsistencies.length > 0
        ? `Se encontraron ${inconsistencies.length} inconsistencias. Usa POST para corregirlas.`
        : 'No hay inconsistencias. Todos los levelId están correctos.'
    })

  } catch (error) {
    console.error('[Sync] Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
