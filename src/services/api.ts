// ============================================
// SERVICIOS DE API CENTRALIZADOS - ChaskiBots EDU
// ============================================

import type { 
  User, Level, Course, TeacherCourse, School, 
  Lesson, Task, Submission, Grade, ApiResponse 
} from '@/types'

const API_BASE = ''

// ============================================
// UTILIDADES
// ============================================

async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    const data = await res.json()
    
    if (!res.ok) {
      return { success: false, error: data.error || `Error ${res.status}` }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    return { success: false, error: String(error) }
  }
}

// ============================================
// AUTENTICACIÓN
// ============================================

export const authApi = {
  login: async (credentials: { accessCode?: string; email?: string; password?: string }) => {
    return fetchApi<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  refresh: async (identifier: { accessCode?: string; email?: string }) => {
    return fetchApi<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(identifier),
    })
  },
}

// ============================================
// USUARIOS
// ============================================

export const usersApi = {
  getAll: async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    return data.users as User[] || []
  },

  getByCourse: async (courseId: string) => {
    const res = await fetch(`/api/admin/users?courseId=${courseId}`)
    const data = await res.json()
    return data.users as User[] || []
  },

  create: async (userData: Partial<User> & { 
    levelId: string
    schoolId?: string
    schoolName?: string
    programId?: string
    programName?: string
    expiresAt?: string
  }) => {
    return fetchApi<{ user: User }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  update: async (userId: string, userData: Partial<User>) => {
    return fetchApi<{ user: User }>('/api/admin/users', {
      method: 'PATCH',
      body: JSON.stringify({ id: userId, ...userData }),
    })
  },

  delete: async (userId: string) => {
    return fetchApi('/api/admin/users', {
      method: 'DELETE',
      body: JSON.stringify({ id: userId }),
    })
  },
}

// ============================================
// NIVELES
// ============================================

export const levelsApi = {
  getAll: async (): Promise<Level[]> => {
    try {
      const res = await fetch('/api/admin/levels')
      const data = await res.json()
      return data.levels || []
    } catch (error) {
      console.error('Error fetching levels:', error)
      return []
    }
  },

  create: async (levelData: Partial<Level>) => {
    return fetchApi<{ level: Level }>('/api/admin/levels', {
      method: 'POST',
      body: JSON.stringify(levelData),
    })
  },

  update: async (levelId: string, levelData: Partial<Level>) => {
    return fetchApi<{ level: Level }>('/api/admin/levels', {
      method: 'PATCH',
      body: JSON.stringify({ id: levelId, ...levelData }),
    })
  },

  delete: async (levelId: string) => {
    return fetchApi('/api/admin/levels', {
      method: 'DELETE',
      body: JSON.stringify({ id: levelId }),
    })
  },
}

// ============================================
// CURSOS / PROGRAMAS
// ============================================

export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    try {
      const [coursesRes, programsRes] = await Promise.all([
        fetch('/api/admin/courses'),
        fetch('/api/admin/programs'),
      ])
      const coursesData = await coursesRes.json()
      const programsData = await programsRes.json()
      
      const allCourses: Course[] = []
      
      // Agregar cursos
      if (coursesData.courses) {
        coursesData.courses.forEach((c: any) => {
          allCourses.push({
            id: c.id,
            name: c.name,
            description: c.description,
            levelId: c.levelId || '',
          })
        })
      }
      
      // Agregar programas (evitar duplicados)
      if (programsData.programs) {
        programsData.programs.forEach((p: any) => {
          if (!allCourses.find(c => c.id === p.id)) {
            allCourses.push({
              id: p.id,
              name: p.name,
              description: p.description,
              levelId: p.levelId || '',
            })
          }
        })
      }
      
      return allCourses
    } catch (error) {
      console.error('Error fetching courses:', error)
      return []
    }
  },

  getPrograms: async (): Promise<Course[]> => {
    try {
      const res = await fetch('/api/admin/programs')
      const data = await res.json()
      return data.programs || []
    } catch (error) {
      console.error('Error fetching programs:', error)
      return []
    }
  },
}

// ============================================
// ASIGNACIONES PROFESOR-CURSO
// ============================================

export const teacherCoursesApi = {
  getAll: async (): Promise<TeacherCourse[]> => {
    try {
      const res = await fetch('/api/teacher-courses')
      const data = await res.json()
      return data.assignments || []
    } catch (error) {
      console.error('Error fetching teacher courses:', error)
      return []
    }
  },

  getByTeacher: async (teacherId?: string, teacherName?: string): Promise<TeacherCourse[]> => {
    try {
      const params = new URLSearchParams()
      if (teacherId) params.append('teacherId', teacherId)
      if (teacherName) params.append('teacherName', teacherName)
      
      const res = await fetch(`/api/teacher-courses?${params.toString()}`)
      const data = await res.json()
      return data.assignments || []
    } catch (error) {
      console.error('Error fetching teacher courses:', error)
      return []
    }
  },

  create: async (assignment: {
    teacherId: string
    teacherName: string
    courseId: string
    courseName: string
    levelId: string
    schoolId?: string
    schoolName?: string
  }) => {
    return fetchApi<{ assignment: TeacherCourse }>('/api/teacher-courses', {
      method: 'POST',
      body: JSON.stringify(assignment),
    })
  },

  delete: async (recordId: string) => {
    return fetchApi(`/api/teacher-courses?recordId=${recordId}`, {
      method: 'DELETE',
    })
  },

  sync: async () => {
    return fetchApi<{ stats: any; corrections: any[]; errors: any[] }>(
      '/api/admin/sync-teacher-courses',
      { method: 'POST' }
    )
  },
}

// ============================================
// COLEGIOS
// ============================================

export const schoolsApi = {
  getAll: async (): Promise<School[]> => {
    try {
      const res = await fetch('/api/schools')
      const data = await res.json()
      return data.schools || []
    } catch (error) {
      console.error('Error fetching schools:', error)
      return []
    }
  },

  create: async (schoolData: Partial<School>) => {
    return fetchApi<{ school: School }>('/api/schools', {
      method: 'POST',
      body: JSON.stringify(schoolData),
    })
  },

  delete: async (schoolId: string) => {
    return fetchApi(`/api/schools?id=${schoolId}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// LECCIONES
// ============================================

export const lessonsApi = {
  getByLevel: async (levelId: string): Promise<Lesson[]> => {
    try {
      const res = await fetch(`/api/lessons?levelId=${levelId}`)
      const data = await res.json()
      return data.lessons || []
    } catch (error) {
      console.error('Error fetching lessons:', error)
      return []
    }
  },

  create: async (lessonData: Partial<Lesson>) => {
    return fetchApi<{ lesson: Lesson }>('/api/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    })
  },

  update: async (lessonId: string, lessonData: Partial<Lesson>) => {
    return fetchApi<{ lesson: Lesson }>('/api/lessons', {
      method: 'PUT',
      body: JSON.stringify({ id: lessonId, ...lessonData }),
    })
  },

  delete: async (lessonId: string) => {
    return fetchApi(`/api/lessons?id=${lessonId}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// TAREAS
// ============================================

export const tasksApi = {
  getByLevel: async (levelId: string): Promise<Task[]> => {
    try {
      const res = await fetch(`/api/tasks?levelId=${levelId}`)
      const data = await res.json()
      return data.tasks || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  },

  getAll: async (): Promise<Task[]> => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      return data.tasks || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  },

  create: async (taskData: Partial<Task>) => {
    return fetchApi<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  },

  update: async (taskId: string, taskData: Partial<Task>) => {
    return fetchApi<{ task: Task }>('/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify({ id: taskId, ...taskData }),
    })
  },

  delete: async (taskId: string) => {
    return fetchApi(`/api/tasks?id=${taskId}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// ENTREGAS
// ============================================

export const submissionsApi = {
  getAll: async (filters?: { levelId?: string; status?: string; courseId?: string }): Promise<Submission[]> => {
    try {
      const params = new URLSearchParams()
      if (filters?.levelId) params.append('levelId', filters.levelId)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.courseId) params.append('courseId', filters.courseId)
      
      const res = await fetch(`/api/submissions?${params.toString()}`)
      const data = await res.json()
      return data.submissions || []
    } catch (error) {
      console.error('Error fetching submissions:', error)
      return []
    }
  },

  create: async (submissionData: Partial<Submission>) => {
    return fetchApi<{ submission: Submission }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    })
  },

  grade: async (submissionId: string, gradeData: { grade: number; feedback?: string; gradedBy: string }) => {
    return fetchApi<{ submission: Submission }>('/api/submissions', {
      method: 'PATCH',
      body: JSON.stringify({ id: submissionId, ...gradeData, status: 'graded' }),
    })
  },

  delete: async (submissionId: string) => {
    return fetchApi(`/api/submissions?id=${submissionId}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// CALIFICACIONES
// ============================================

export const gradesApi = {
  getByStudent: async (studentId: string): Promise<Grade[]> => {
    try {
      const res = await fetch(`/api/grades?studentId=${studentId}`)
      const data = await res.json()
      return data.grades || []
    } catch (error) {
      console.error('Error fetching grades:', error)
      return []
    }
  },

  getByLevel: async (levelId: string): Promise<Grade[]> => {
    try {
      const res = await fetch(`/api/grades?levelId=${levelId}`)
      const data = await res.json()
      return data.grades || []
    } catch (error) {
      console.error('Error fetching grades:', error)
      return []
    }
  },

  create: async (gradeData: Partial<Grade>) => {
    return fetchApi<{ grade: Grade }>('/api/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    })
  },
}
