import { NextRequest, NextResponse } from 'next/server'
import { createCourse, getAllCourses, getTeacherCourses } from '@/lib/airtable-auth'

// GET - Obtener cursos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    let courses
    if (teacherId) {
      courses = await getTeacherCourses(teacherId)
    } else {
      courses = await getAllCourses()
    }

    return NextResponse.json({ success: true, courses })

  } catch (error) {
    console.error('Error getting courses:', error)
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
    const { name, levelId, teacherId, teacherName, description, maxStudents } = body

    if (!name || !levelId || !teacherId || !teacherName) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const result = await createCourse(
      name,
      levelId,
      teacherId,
      teacherName,
      description,
      maxStudents
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
