import { NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''

interface AirtableRecord {
  id: string
  fields: Record<string, any>
}

// Función para obtener todos los registros de una tabla (con paginación)
async function fetchAllRecords(tableName: string): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`)
    if (offset) url.searchParams.append('offset', offset)

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Error fetching ${tableName}: ${response.status}`)
    }

    const data = await response.json()
    allRecords.push(...data.records)
    offset = data.offset
  } while (offset)

  return allRecords
}

// Función para actualizar un registro
async function updateRecord(tableName: string, recordId: string, fields: Record<string, any>): Promise<void> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}/${recordId}`
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error updating record: ${error}`)
  }
}

// POST - Sincronizar levelId en teacher_courses con los de programs/courses
export async function POST() {
  try {
    console.log('[Sync] Iniciando sincronización de teacher_courses...')

    // 1. Obtener todos los programas/cursos para crear un mapa de courseId -> levelId
    const [programs, courses] = await Promise.all([
      fetchAllRecords('programs'),
      fetchAllRecords('courses')
    ])

    // Crear mapa de courseId/programId -> levelId correcto
    const levelIdMap: Record<string, string> = {}
    
    programs.forEach(p => {
      if (p.fields.id && p.fields.levelId) {
        levelIdMap[p.fields.id] = p.fields.levelId
      }
    })
    
    courses.forEach(c => {
      if (c.fields.id && c.fields.levelId) {
        levelIdMap[c.fields.id] = c.fields.levelId
      }
    })

    console.log('[Sync] Mapa de levelId creado:', Object.keys(levelIdMap).length, 'entradas')

    // 2. Obtener todas las asignaciones de teacher_courses
    const teacherCourses = await fetchAllRecords('teacher_courses')
    console.log('[Sync] Asignaciones encontradas:', teacherCourses.length)

    // 3. Verificar y corregir levelId inconsistentes
    const corrections: { recordId: string; courseId: string; oldLevelId: string; newLevelId: string }[] = []

    for (const tc of teacherCourses) {
      const courseId = tc.fields.courseId
      const currentLevelId = tc.fields.levelId || ''
      const correctLevelId = levelIdMap[courseId]

      if (correctLevelId && currentLevelId !== correctLevelId) {
        corrections.push({
          recordId: tc.id,
          courseId,
          oldLevelId: currentLevelId,
          newLevelId: correctLevelId
        })
      }
    }

    console.log('[Sync] Correcciones necesarias:', corrections.length)

    // 4. Aplicar correcciones
    let corrected = 0
    const errors: string[] = []

    for (const correction of corrections) {
      try {
        await updateRecord('teacher_courses', correction.recordId, {
          levelId: correction.newLevelId
        })
        corrected++
        console.log(`[Sync] Corregido: ${correction.courseId} - ${correction.oldLevelId} -> ${correction.newLevelId}`)
      } catch (error) {
        const errorMsg = `Error corrigiendo ${correction.courseId}: ${error}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada`,
      stats: {
        totalAssignments: teacherCourses.length,
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
    // 1. Obtener todos los programas/cursos
    const [programs, courses] = await Promise.all([
      fetchAllRecords('programs'),
      fetchAllRecords('courses')
    ])

    // Crear mapa de courseId -> levelId
    const levelIdMap: Record<string, string> = {}
    
    programs.forEach(p => {
      if (p.fields.id && p.fields.levelId) {
        levelIdMap[p.fields.id] = p.fields.levelId
      }
    })
    
    courses.forEach(c => {
      if (c.fields.id && c.fields.levelId) {
        levelIdMap[c.fields.id] = c.fields.levelId
      }
    })

    // 2. Obtener asignaciones
    const teacherCourses = await fetchAllRecords('teacher_courses')

    // 3. Identificar inconsistencias
    const inconsistencies: { courseId: string; courseName: string; teacherName: string; currentLevelId: string; correctLevelId: string }[] = []

    for (const tc of teacherCourses) {
      const courseId = tc.fields.courseId
      const currentLevelId = tc.fields.levelId || ''
      const correctLevelId = levelIdMap[courseId]

      if (correctLevelId && currentLevelId !== correctLevelId) {
        inconsistencies.push({
          courseId,
          courseName: tc.fields.courseName || '',
          teacherName: tc.fields.teacherName || '',
          currentLevelId,
          correctLevelId
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalAssignments: teacherCourses.length,
      totalPrograms: programs.length,
      totalCourses: courses.length,
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
