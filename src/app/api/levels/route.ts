import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('levels')
      .select('*')
      .order('grade_number', { ascending: true })

    if (error) {
      console.error('[Levels] Supabase error:', error)
      return NextResponse.json([])
    }

    const levels = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      fullName: row.full_name,
      category: row.category,
      ageRange: row.age_range,
      gradeNumber: row.grade_number,
      color: row.color || 'from-blue-500 to-cyan-600',
      neonColor: row.neon_color || '#00d4ff',
      icon: row.icon || '📚',
      kitPrice: row.kit_price || 50,
      hasHacking: row.has_hacking || false,
      hasAdvancedIA: row.has_advanced_ia || false,
    }))

    return NextResponse.json(levels)
  } catch (error: any) {
    console.error('Error fetching levels:', error)
    return NextResponse.json([])
  }
}
