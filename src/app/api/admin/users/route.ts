import { NextRequest, NextResponse } from 'next/server'
import { 
  createCourseUser, 
  createBulkUsers, 
  getCourseUsers,
  getAllUsers,
  updateUser,
  regenerateAccessCode 
} from '@/lib/airtable-auth'
import { cache } from '@/lib/cache'
import { getUserFriendlyError } from '@/lib/airtable-errors'

export const dynamic = 'force-dynamic'

// GET - Obtener usuarios (todos o filtrados)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')
  
  // Caché de usuarios - 5 minutos (los usuarios pueden cambiar más frecuentemente)
  const CACHE_KEY = `users:${courseId || 'all'}`

  try {
    // Intentar obtener del caché primero
    const cached = cache.get<any[]>(CACHE_KEY)
    if (cached) {
      console.log('[API Users] Usando caché para:', courseId || 'todos')
      return NextResponse.json({ success: true, users: cached })
    }

    console.log('[API Users] Consultando Airtable, courseId:', courseId)

    // Si hay courseId, filtrar por curso
    if (courseId) {
      const users = await getCourseUsers(courseId)
      console.log('[API Users] Got', users.length, 'users for course')
      cache.set(CACHE_KEY, users, 5 * 60 * 1000) // 5 minutos
      return NextResponse.json({ success: true, users })
    }

    // Si no hay courseId, obtener todos los usuarios
    const users = await getAllUsers()
    console.log('[API Users] Got', users.length, 'total users from Airtable')
    cache.set(CACHE_KEY, users, 5 * 60 * 1000) // 5 minutos
    return NextResponse.json({ success: true, users })

  } catch (error: any) {
    console.error('[API Users] Error getting users:', error)
    
    const errorMessage = error?.message || ''
    if (errorMessage.includes('429') || errorMessage.includes('BILLING_LIMIT')) {
      return NextResponse.json(
        { success: false, error: getUserFriendlyError(429, errorMessage), users: [] },
        { status: 429 }
      )
    }
    
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
      namePrefix,
      programId,
      programName
    } = body

    // Importar lista de nombres
    if (action === 'import') {
      const { names, schoolId, schoolName } = body
      
      if (!names || !Array.isArray(names) || names.length === 0 || !levelId) {
        return NextResponse.json(
          { success: false, error: 'Se requiere una lista de nombres y nivel' },
          { status: 400 }
        )
      }

      // Crear usuarios uno por uno con sus nombres reales
      const createdUsers = []
      const errors = []

      for (const studentName of names) {
        try {
          const result = await createCourseUser(
            studentName,
            'student',
            courseId || '',
            courseName || '',
            levelId,
            '', // email
            '', // expiresAt
            programId || '',
            programName || '',
            schoolId || '',
            schoolName || ''
          )
          if (result.success) {
            createdUsers.push(result.user)
          } else {
            errors.push({ name: studentName, error: result.error })
          }
        } catch (err) {
          errors.push({ name: studentName, error: 'Error de conexión' })
        }
      }

      // Invalidar caché de usuarios
      cache.invalidateByPrefix('users:')

      return NextResponse.json({
        success: true,
        created: createdUsers.length,
        users: createdUsers,
        errors: errors.length > 0 ? errors : undefined,
        message: `${createdUsers.length} de ${names.length} usuarios creados`
      })
    }

    // Crear múltiples usuarios con prefijo
    if (action === 'bulk') {
      if (!levelId || !count) {
        return NextResponse.json(
          { success: false, error: 'Faltan campos requeridos para creación en lote' },
          { status: 400 }
        )
      }

      const result = await createBulkUsers(
        courseId || '',
        courseName || '',
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

      // Invalidar caché de usuarios
      cache.invalidateByPrefix('users:')

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

    // No generar valores automáticos - dejar vacío si no se proporciona
    const finalCourseId = courseId || ''
    const finalCourseName = courseName || ''

    // Obtener schoolId y schoolName del body
    const { schoolId, schoolName } = body

    const result = await createCourseUser(
      name,
      role,
      finalCourseId,
      finalCourseName,
      levelId,
      email,
      expiresAt,
      programId || '',
      programName || '',
      schoolId || '',
      schoolName || ''
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Si es profesor y tiene curso asignado, crear entrada en teacher_courses
    if (role === 'teacher' && finalCourseId && result.user?.accessCode) {
      try {
        const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
        const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
        const TEACHER_COURSES_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/teacher_courses`
        
        const assignmentId = `tc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
        
        const assignmentFields = {
          id: assignmentId,
          teacherId: result.user.accessCode,
          teacherName: name,
          courseId: finalCourseId,
          courseName: finalCourseName,
          levelId: levelId,
          schoolId: schoolId || '',
          schoolName: schoolName || '',
          createdAt: new Date().toISOString().split('T')[0]
        }
        
        await fetch(TEACHER_COURSES_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ records: [{ fields: assignmentFields }] }),
        })
        console.log('[API Users] Created teacher_courses assignment for new teacher')
      } catch (assignError) {
        console.error('[API Users] Error creating teacher_courses assignment:', assignError)
        // No fallar la creación del usuario por esto
      }
    }

    // Invalidar caché de usuarios
    cache.invalidateByPrefix('users:')

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
      // Invalidar caché de usuarios
      cache.invalidateByPrefix('users:')

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
      // Invalidar caché de usuarios
      cache.invalidateByPrefix('users:')

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
      // Invalidar caché de usuarios
      cache.invalidateByPrefix('users:')

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
      // Invalidar caché de usuarios
      cache.invalidateByPrefix('users:')

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

    // Invalidar caché de usuarios
    cache.invalidateByPrefix('users:')

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
