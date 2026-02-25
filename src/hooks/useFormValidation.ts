// ============================================
// HOOK DE VALIDACIÓN DE FORMULARIOS - ChaskiBots EDU
// ============================================

import { useState, useCallback } from 'react'
import { z } from 'zod'

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
  onError?: (errors: Record<string, string>) => void
}

interface FormState<T> {
  data: Partial<T>
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
}

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  onSubmit,
  onError,
}: UseFormValidationOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    data: {},
    errors: {},
    isSubmitting: false,
    isValid: false,
  })

  // Validar un campo individual
  const validateField = useCallback(
    (field: keyof T, value: unknown) => {
      // Validar el campo intentando parsear todo el objeto con el valor actualizado
      const testData = { ...state.data, [field]: value }
      const result = schema.safeParse(testData)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, [field as string]: '' },
        }))
        return true
      }
      
      // Buscar error específico del campo
      const issues = (result.error as any).issues || []
      const fieldError = issues.find((issue: any) => 
        issue.path && issue.path[0] === field
      )
      
      if (fieldError) {
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, [field as string]: fieldError.message },
        }))
      }
      
      return !fieldError
    },
    [schema, state.data]
  )

  // Actualizar un campo
  const setField = useCallback(
    (field: keyof T, value: unknown) => {
      setState(prev => ({
        ...prev,
        data: { ...prev.data, [field]: value },
      }))
      // Validar en tiempo real (opcional)
      validateField(field, value)
    },
    [validateField]
  )

  // Validar todo el formulario
  const validate = useCallback((): boolean => {
    const result = schema.safeParse(state.data)
    
    if (result.success) {
      setState(prev => ({ ...prev, errors: {}, isValid: true }))
      return true
    }
    
    const errors: Record<string, string> = {}
    // Zod v4 usa issues en lugar de errors
    const issues = (result.error as any).issues || []
    issues.forEach((err: any) => {
      const path = Array.isArray(err.path) ? err.path.join('.') : ''
      errors[path || 'general'] = err.message
    })
    
    setState(prev => ({ ...prev, errors, isValid: false }))
    onError?.(errors)
    return false
  }, [schema, state.data, onError])

  // Enviar formulario
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      
      if (!validate()) return
      
      setState(prev => ({ ...prev, isSubmitting: true }))
      
      try {
        const result = schema.parse(state.data)
        await onSubmit(result)
      } catch (error) {
        console.error('Submit error:', error)
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }))
      }
    },
    [validate, schema, state.data, onSubmit]
  )

  // Resetear formulario
  const reset = useCallback((initialData?: Partial<T>) => {
    setState({
      data: initialData || {},
      errors: {},
      isSubmitting: false,
      isValid: false,
    })
  }, [])

  // Establecer datos iniciales
  const setData = useCallback((data: Partial<T>) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  return {
    data: state.data,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setField,
    validateField,
    validate,
    handleSubmit,
    reset,
    setData,
  }
}

// Hook simplificado para validación inline
export function useValidation<T>(schema: z.ZodSchema<T>) {
  const validate = useCallback(
    (data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
      const result = schema.safeParse(data)
      
      if (result.success) {
        return { success: true, data: result.data }
      }
      
      const errors: Record<string, string> = {}
      // Zod v4 usa issues en lugar de errors
      const issues = (result.error as any).issues || []
      issues.forEach((err: any) => {
        const path = Array.isArray(err.path) ? err.path.join('.') : ''
        errors[path || 'general'] = err.message
      })
      
      return { success: false, errors }
    },
    [schema]
  )

  return { validate }
}
