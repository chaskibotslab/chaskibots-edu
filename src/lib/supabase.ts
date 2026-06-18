import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Cliente público (para frontend - respeta RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente admin (solo para servidor - bypassa RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================================
// Tipos TypeScript - alineados con schema.sql
// ============================================================
export interface Lesson {
  id: string
  level_id: string
  program_id: string
  module_name: string | null
  title: string
  type: 'video' | 'activity' | 'tutorial' | 'project'
  duration: string
  display_order: number
  video_url: string | null
  pdf_url: string | null
  content: string | null
  locked: boolean
  images: string[] | null
  created_at: string
  updated_at: string
}

export interface Level {
  id: string
  name: string
  full_name: string | null
  category: string | null
  age_range: string | null
  grade_number: number | null
  color: string | null
  icon: string | null
}

export interface Program {
  id: string
  name: string
  description: string | null
  is_active: boolean
}

export interface User {
  id: string
  access_code: string | null
  email: string
  name: string
  level_id: string | null
  role: 'admin' | 'teacher' | 'student'
  school_id: string | null
  program_id: string | null
  is_active: boolean
}

export interface Submission {
  id: string
  task_id: string | null
  student_name: string | null
  student_email: string | null
  level_id: string | null
  code: string | null
  output: string | null
  status: string
  grade: number | null
  feedback: string | null
  submitted_at: string
}
