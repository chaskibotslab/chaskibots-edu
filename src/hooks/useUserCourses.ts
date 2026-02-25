'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { teacherCoursesApi } from '@/services/api'
import type { TeacherCourse, Level } from '@/types'

interface UserCourse {
  courseId: string
  courseName?: string
  levelId: string
}

interface UseUserCoursesReturn {
  userCourses: UserCourse[]
  loading: boolean
  error: string | null
  allowedLevelIds: string[]
  refetch: () => Promise<void>
}

/**
 * Hook para obtener los cursos asignados a un usuario
 * - Para profesores: obtiene asignaciones de teacher_courses
 * - Para estudiantes: usa el levelId del usuario
 * - Para admins: permite todos los niveles
 */
export function useUserCourses(allLevels: Level[] = []): UseUserCoursesReturn {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [userCourses, setUserCourses] = useState<UserCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserCourses = async () => {
    if (!user) {
      setUserCourses([])
      setLoading(false)
      return
    }

    // Admin no necesita cargar cursos específicos
    if (user.role === 'admin') {
      setUserCourses([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (user.role === 'teacher') {
        // Buscar asignaciones por accessCode y nombre
        const assignments = await teacherCoursesApi.getByTeacher(
          user.accessCode,
          user.name
        )

        if (assignments.length > 0) {
          setUserCourses(assignments.map(a => ({
            courseId: a.courseId,
            courseName: a.courseName,
            levelId: a.levelId,
          })))
        } else if (user.levelId) {
          // Fallback: usar levelId del usuario
          setUserCourses([{ 
            courseId: user.courseId || '', 
            levelId: user.levelId 
          }])
        } else {
          setUserCourses([])
        }
      } else if (user.role === 'student') {
        // Para estudiantes: solo su curso asignado
        if (user.levelId) {
          setUserCourses([{ 
            courseId: user.courseId || '', 
            levelId: user.levelId 
          }])
        } else {
          setUserCourses([])
        }
      } else {
        setUserCourses([])
      }
    } catch (err) {
      console.error('[useUserCourses] Error:', err)
      setError('Error al cargar cursos')
      // Fallback al levelId del usuario
      if (user.levelId) {
        setUserCourses([{ 
          courseId: user.courseId || '', 
          levelId: user.levelId 
        }])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        loadUserCourses()
      } else {
        setUserCourses([])
        setLoading(false)
      }
    }
  }, [authLoading, isAuthenticated, user?.id])

  // Calcular niveles permitidos
  const allowedLevelIds = useMemo(() => {
    if (!user) return []
    
    // Admin puede ver todos los niveles
    if (user.role === 'admin') {
      return allLevels.map(l => l.id)
    }

    const levelIds = new Set<string>()

    // Siempre agregar el levelId del usuario si existe
    if (user.levelId) {
      levelIds.add(user.levelId)
    }

    // Agregar niveles de los cursos asignados
    userCourses.forEach(course => {
      if (course.levelId) {
        levelIds.add(course.levelId)
      }
    })

    return Array.from(levelIds)
  }, [user, userCourses, allLevels])

  return {
    userCourses,
    loading: loading || authLoading,
    error,
    allowedLevelIds,
    refetch: loadUserCourses,
  }
}
