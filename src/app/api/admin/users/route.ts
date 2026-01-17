import { NextRequest, NextResponse } from 'next/server'
import { 
  createCourseUser, 
  createBulkUsers, 
  getCourseUsers,
  getAllUsers,
  updateUser,
  regenerateAccessCode 
} from '@/lib/airtable-auth'

// GET - Obtener usuarios (todos o filtrados)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    console.log('[API Users] Fetching users, courseId:', courseId)

    // Si hay courseId, filtrar por curso
    if (courseId) {
      const users = await getCourseUsers(courseId)
      console.log('[API Users] Got', users.length, 'users for course')
      return NextResponse.json({ success: true, users })
    }

    // Si no hay courseId, obtener todos los usuarios
    const users = await getAllUsers()
    console.log('[API Users] Got', users.length, 'total users from Airtable')
    return NextResponse.json({ success: true, users })

  } catch (error) {
    console.error('[API Users] Error getting users:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios', users: [] },
      { status: 500 }
    )
  }
}

// POST - Crear usuario(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      action,
      name, 
      role, 
      courseId, 
      courseName, 
      levelId, 
      email,
      expiresAt,
      count,
      namePrefix
    } = body

    // Crear múltiples usuarios
    if (action === 'bulk') {
      if (!courseId || !courseName || !levelId || !count) {
        return NextResponse.json(
          { success: false, error: 'Faltan campos requeridos para creación en lote' },
          { status: 400 }
        )
      }

      const result = await createBulkUsers(
        courseId,
        courseName,
        levelId,
        count,
        namePrefix || 'Estudiante',
        expiresAt
      )

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        users: result.users,
        message: `${count} usuarios creados exitosamente`
      })
    }

    // Crear usuario individual
    if (!name || !role || !levelId) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: nombre, rol y nivel' },
        { status: 400 }
      )
    }

    // Generar courseId si no se proporciona
    const finalCourseId = courseId || `curso-${Date.now()}`
    const finalCourseName = courseName || 'Sin asignar'

    const result = await createCourseUser(
      name,
      role,
      finalCourseId,
      finalCourseName,
      levelId,
      email,
      expiresAt
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'Usuario creado exitosamente'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar usuario (regenerar código, desactivar)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId y action son requeridos' },
        { status: 400 }
      )
    }

    if (action === 'regenerate') {
      const result = await regenerateAccessCode(userId)
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }
      return NextResponse.json({
        success: true,
        newCode: result.newCode,
        message: 'Código regenerado exitosamente'
      })
    }

    if (action === 'deactivate') {
      const result = await updateUser(userId, { isActive: false })
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: 'Error al desactivar usuario' },
          { status: 400 }
        )
      }
      return NextResponse.json({
        success: true,
        message: 'Usuario desactivado exitosamente'
      })
    }

    if (action === 'activate') {
      const result = await updateUser(userId, { isActive: true })
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: 'Error al activar usuario' },
          { status: 400 }
        )
      }
      return NextResponse.json({
        success: true,
        message: 'Usuario activado exitosamente'
      })
    }

    if (action === 'update') {
      const { name, email, levelId, role, courseId, courseName, programId, programName, expiresAt } = body
      const result = await updateUser(userId, {
        name,
        email,
        levelId,
        role,
        courseId,
        courseName,
        programId,
        programName,
        expiresAt
      })
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }
      return NextResponse.json({
        success: true,
        message: 'Usuario actualizado exitosamente'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Acción no válida' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Eliminar usuario de Airtable
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error deleting user from Airtable:', errorText)
      return NextResponse.json(
        { success: false, error: 'Error al eliminar usuario de Airtable' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
