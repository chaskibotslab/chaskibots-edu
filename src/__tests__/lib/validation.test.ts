// ============================================
// TESTS DE VALIDACIÓN - ChaskiBots EDU
// ============================================

import { describe, it, expect } from 'vitest'
import {
  validate,
  createUserSchema,
  createTaskSchema,
  createStudentSchema,
  loginSchema,
  gradeSubmissionSchema,
} from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate a valid user', () => {
      const validUser = {
        name: 'Juan Pérez',
        role: 'student',
        levelId: 'quinto-egb',
      }
      
      const result = validate(createUserSchema, validUser)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should reject user with short name', () => {
      const invalidUser = {
        name: 'J',
        role: 'student',
      }
      
      const result = validate(createUserSchema, invalidUser)
      expect(result.success).toBe(false)
      expect(result.errors?.name).toBeDefined()
    })

    it('should reject invalid role', () => {
      const invalidUser = {
        name: 'Juan Pérez',
        role: 'superadmin',
      }
      
      const result = validate(createUserSchema, invalidUser)
      expect(result.success).toBe(false)
      expect(result.errors?.role).toBeDefined()
    })
  })

  describe('createTaskSchema', () => {
    it('should validate a valid task', () => {
      const validTask = {
        title: 'Tarea de Robótica',
        description: 'Construir un robot básico con sensores',
        levelId: 'quinto-egb',
        points: 10,
      }
      
      const result = validate(createTaskSchema, validTask)
      expect(result.success).toBe(true)
    })

    it('should reject task with short title', () => {
      const invalidTask = {
        title: 'Ta',
        description: 'Descripción válida de la tarea',
        levelId: 'quinto-egb',
      }
      
      const result = validate(createTaskSchema, invalidTask)
      expect(result.success).toBe(false)
      expect(result.errors?.title).toBeDefined()
    })

    it('should reject task without levelId', () => {
      const invalidTask = {
        title: 'Tarea válida',
        description: 'Descripción válida de la tarea',
      }
      
      const result = validate(createTaskSchema, invalidTask)
      expect(result.success).toBe(false)
      expect(result.errors?.levelId).toBeDefined()
    })

    it('should reject points out of range', () => {
      const invalidTask = {
        title: 'Tarea válida',
        description: 'Descripción válida de la tarea',
        levelId: 'quinto-egb',
        points: 150,
      }
      
      const result = validate(createTaskSchema, invalidTask)
      expect(result.success).toBe(false)
    })
  })

  describe('createStudentSchema', () => {
    it('should validate a valid student', () => {
      const validStudent = {
        name: 'María García',
        levelId: 'sexto-egb',
        courseId: 'curso-robotica',
      }
      
      const result = validate(createStudentSchema, validStudent)
      expect(result.success).toBe(true)
    })

    it('should accept student with email', () => {
      const validStudent = {
        name: 'Carlos López',
        email: 'carlos@example.com',
      }
      
      const result = validate(createStudentSchema, validStudent)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidStudent = {
        name: 'Carlos López',
        email: 'not-an-email',
      }
      
      const result = validate(createStudentSchema, invalidStudent)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate login with accessCode', () => {
      const validLogin = {
        accessCode: 'ES4X8P3Q',
      }
      
      const result = validate(loginSchema, validLogin)
      expect(result.success).toBe(true)
    })

    it('should validate login with email and password', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'password123',
      }
      
      const result = validate(loginSchema, validLogin)
      expect(result.success).toBe(true)
    })

    it('should reject login without credentials', () => {
      const invalidLogin = {}
      
      const result = validate(loginSchema, invalidLogin)
      expect(result.success).toBe(false)
    })

    it('should reject login with only email', () => {
      const invalidLogin = {
        email: 'user@example.com',
      }
      
      const result = validate(loginSchema, invalidLogin)
      expect(result.success).toBe(false)
    })
  })

  describe('gradeSubmissionSchema', () => {
    it('should validate a valid grade', () => {
      const validGrade = {
        id: 'rec123456',
        grade: 8.5,
        feedback: 'Buen trabajo',
      }
      
      const result = validate(gradeSubmissionSchema, validGrade)
      expect(result.success).toBe(true)
    })

    it('should reject grade above 10', () => {
      const invalidGrade = {
        id: 'rec123456',
        grade: 11,
      }
      
      const result = validate(gradeSubmissionSchema, invalidGrade)
      expect(result.success).toBe(false)
    })

    it('should reject negative grade', () => {
      const invalidGrade = {
        id: 'rec123456',
        grade: -1,
      }
      
      const result = validate(gradeSubmissionSchema, invalidGrade)
      expect(result.success).toBe(false)
    })

    it('should reject grade without id', () => {
      const invalidGrade = {
        grade: 8,
      }
      
      const result = validate(gradeSubmissionSchema, invalidGrade)
      expect(result.success).toBe(false)
    })
  })
})
