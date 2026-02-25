import { NextRequest, NextResponse } from 'next/server'
import { createCourse, getAllCourses, getTeacherCourses, updateCourse, deleteCourse } from '@/lib/airtable-auth'
import { cache } from '@/lib/cache'
import { getUserFriendlyError } from '@/lib/airtable-errors'

export const dynamic = 'force-dynamic'

// GET - Obtener cursos
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teacherId = searchParams.get('teacherId')
  
  // Caché de cursos - 10 minutos
  const CACHE_KEY = `courses:${teacherId || 'all'}`

  try {
    // Intentar obtener del caché primero
    const cached = cache.get<any[]>(CACHE_KEY)
    if (cached) {
      console.log('[Courses API] Usando caché para:', teacherId || 'todos')
      return NextResponse.json({ success: true, courses: cached })
    }

    console.log('[Courses API] Consultando Airtable para:', teacherId || 'todos')

    let courses
    if (teacherId) {
      courses = await getTeacherCourses(teacherId)
    } else {
      courses = await getAllCourses()
    }

    // Guardar en caché
    cache.set(CACHE_KEY, courses, 10 * 60 * 1000)

    return NextResponse.json({ success: true, courses })

  } catch (error: any) {
    console.error('Error getting courses:', error)
    
    const errorMessage = error?.message || ''
    if (errorMessage.includes('429') || errorMessage.includes('BILLING_LIMIT')) {
      return NextResponse.json(
        { success: false, error: getUserFriendlyError(429, errorMessage), courses: [] },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al obtener cursos' },
      { status: 500 }
    )
  }
}

// POST - Crear curso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, levelId, teacherId, teacherName, description, maxStudents, schoolId, schoolName } = body

    if (!name || !levelId) {
      return NextResponse.json(
        { success: false, error: 'Nombre y nivel son requeridos' },
        { status: 400 }
      )
    }

    const result = await createCourse(
      name,
      levelId,
      teacherId || '',
      teacherName || '',
      description,
      maxStudents,
      schoolId,
      schoolName
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      course: result.course,
      message: 'Curso creado exitosamente'
    })

  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear curso' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar curso
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, name, description, levelId, teacherId, teacherName, schoolId, schoolName, maxStudents, isActive } = body

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId es requerido' },
        { status: 400 }
      )
    }

    const result = await updateCourse(courseId, {
      name,
      description,
      levelId,
      teacherId,
      teacherName,
      schoolId,
      schoolName,
      maxStudents,
      isActive
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Curso actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar curso' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar curso
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId es requerido' },
        { status: 400 }
      )
    }

    const result = await deleteCourse(courseId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Curso eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar curso' },
      { status: 500 }
    )
  }
}
