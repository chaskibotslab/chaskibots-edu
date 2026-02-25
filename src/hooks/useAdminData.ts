'use client'

import { useState, useEffect, useCallback } from 'react'
import { usersApi, coursesApi, schoolsApi, teacherCoursesApi } from '@/services/api'
import { useLevels } from './useLevels'
import type { User, Course, School, TeacherCourse } from '@/types'

interface UseAdminDataReturn {
  // Data
  users: User[]
  teachers: User[]
  students: User[]
  courses: Course[]
  schools: School[]
  assignments: TeacherCourse[]
  
  // Loading states
  loading: boolean
  usersLoading: boolean
  coursesLoading: boolean
  schoolsLoading: boolean
  assignmentsLoading: boolean
  
  // Levels from hook
  levels: ReturnType<typeof useLevels>['levels']
  getLevelName: ReturnType<typeof useLevels>['getLevelName']
  
  // Actions
  refetch: () => Promise<void>
  refetchUsers: () => Promise<void>
  refetchAssignments: () => Promise<void>
}

/**
 * Hook para cargar todos los datos necesarios en el panel de administración
 */
export function useAdminData(): UseAdminDataReturn {
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [assignments, setAssignments] = useState<TeacherCourse[]>([])
  
  const [usersLoading, setUsersLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [schoolsLoading, setSchoolsLoading] = useState(true)
  const [assignmentsLoading, setAssignmentsLoading] = useState(true)

  const { levels, loading: levelsLoading, getLevelName } = useLevels()

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (error) {
      console.error('[useAdminData] Error loading users:', error)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true)
    try {
      const data = await coursesApi.getAll()
      setCourses(data)
    } catch (error) {
      console.error('[useAdminData] Error loading courses:', error)
    } finally {
      setCoursesLoading(false)
    }
  }, [])

  const loadSchools = useCallback(async () => {
    setSchoolsLoading(true)
    try {
      const data = await schoolsApi.getAll()
      setSchools(data)
    } catch (error) {
      console.error('[useAdminData] Error loading schools:', error)
    } finally {
      setSchoolsLoading(false)
    }
  }, [])

  const loadAssignments = useCallback(async () => {
    setAssignmentsLoading(true)
    try {
      const data = await teacherCoursesApi.getAll()
      
      // Filtrar asignaciones huérfanas (profesores que ya no existen)
      const teacherIds = new Set(
        users.filter(u => u.role === 'teacher').map(t => t.accessCode)
      )
      
      const validAssignments = data.filter(a => teacherIds.has(a.teacherId))
      
      // Eliminar asignaciones huérfanas en segundo plano
      const orphanAssignments = data.filter(a => !teacherIds.has(a.teacherId))
      if (orphanAssignments.length > 0) {
        console.log(`[useAdminData] Eliminando ${orphanAssignments.length} asignaciones huérfanas`)
        orphanAssignments.forEach(async (a) => {
          try {
            await teacherCoursesApi.delete(a.recordId)
          } catch (err) {
            console.error('Error eliminando asignación huérfana:', err)
          }
        })
      }
      
      setAssignments(validAssignments)
    } catch (error) {
      console.error('[useAdminData] Error loading assignments:', error)
    } finally {
      setAssignmentsLoading(false)
    }
  }, [users])

  const refetch = useCallback(async () => {
    await Promise.all([
      loadUsers(),
      loadCourses(),
      loadSchools(),
    ])
    // Cargar asignaciones después de usuarios para filtrar huérfanos
    await loadAssignments()
  }, [loadUsers, loadCourses, loadSchools, loadAssignments])

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers()
    loadCourses()
    loadSchools()
  }, [])

  // Cargar asignaciones después de que los usuarios estén listos
  useEffect(() => {
    if (!usersLoading && users.length > 0) {
      loadAssignments()
    }
  }, [usersLoading, users.length])

  // Filtrar usuarios por rol
  const teachers = users.filter(u => u.role === 'teacher')
  const students = users.filter(u => u.role === 'student')

  const loading = usersLoading || coursesLoading || schoolsLoading || assignmentsLoading || levelsLoading

  return {
    users,
    teachers,
    students,
    courses,
    schools,
    assignments,
    loading,
    usersLoading,
    coursesLoading,
    schoolsLoading,
    assignmentsLoading,
    levels,
    getLevelName,
    refetch,
    refetchUsers: loadUsers,
    refetchAssignments: loadAssignments,
  }
}
