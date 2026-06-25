import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Niveles SLM que necesitan ser creados
const SLM_LEVELS = [
  {
    id: 'sexto-slm',
    name: '6° EGB - SLM',
    fullName: 'Sexto de EGB - Santa Luisa de Marillac',
    category: 'media',
    ageRange: '10-11',
    gradeNumber: 106,
    color: 'from-purple-500 to-pink-600',
    neonColor: '#a855f7',
    icon: 'BookOpen',
    kitPrice: 15,
    hasHacking: false,
    hasAdvancedIA: false,
  },
  {
    id: 'septimo-egb-slm',
    name: '7° EGB - SLM',
    fullName: 'Séptimo de EGB - Santa Luisa de Marillac',
    category: 'media',
    ageRange: '11-12',
    gradeNumber: 107,
    color: 'from-purple-500 to-pink-600',
    neonColor: '#a855f7',
    icon: 'BookOpen',
    kitPrice: 15,
    hasHacking: false,
    hasAdvancedIA: false,
  },
  {
    id: 'octavo-slm',
    name: '8° EGB - SLM',
    fullName: 'Octavo de EGB - Santa Luisa de Marillac',
    category: 'superior',
    ageRange: '12-13',
    gradeNumber: 108,
    color: 'from-cyan-500 to-blue-600',
    neonColor: '#06b6d4',
    icon: 'Cpu',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false,
  },
  {
    id: 'noveno-slm',
    name: '9° EGB - SLM',
    fullName: 'Noveno de EGB - Santa Luisa de Marillac',
    category: 'superior',
    ageRange: '13-14',
    gradeNumber: 109,
    color: 'from-cyan-500 to-blue-600',
    neonColor: '#06b6d4',
    icon: 'Cpu',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false,
  },
  {
    id: 'decimo-slm',
    name: '10° EGB - SLM',
    fullName: 'Décimo de EGB - Santa Luisa de Marillac',
    category: 'superior',
    ageRange: '14-15',
    gradeNumber: 110,
    color: 'from-cyan-500 to-blue-600',
    neonColor: '#06b6d4',
    icon: 'Cpu',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false,
  },
  {
    id: 'primero-slm-bgu',
    name: '1° BGU - SLM',
    fullName: 'Primero de BGU - Santa Luisa de Marillac',
    category: 'bachillerato',
    ageRange: '15-16',
    gradeNumber: 111,
    color: 'from-orange-500 to-red-600',
    neonColor: '#f97316',
    icon: 'GraduationCap',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false,
  },
  {
    id: 'segundo-slm-bgu',
    name: '2° BGU - SLM',
    fullName: 'Segundo de BGU - Santa Luisa de Marillac',
    category: 'bachillerato',
    ageRange: '16-17',
    gradeNumber: 112,
    color: 'from-orange-500 to-red-600',
    neonColor: '#f97316',
    icon: 'GraduationCap',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false,
  },
  {
    id: 'tercero-slm-bgu',
    name: '3° BGU - SLM',
    fullName: 'Tercero de BGU - Santa Luisa de Marillac',
    category: 'bachillerato',
    ageRange: '17-18',
    gradeNumber: 113,
    color: 'from-orange-500 to-red-600',
    neonColor: '#f97316',
    icon: 'GraduationCap',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false,
  },
]

// POST - Crear los niveles SLM faltantes
export async function POST() {
  try {
    console.log('[Create SLM Levels] Iniciando creación de niveles SLM...')

    const { data: existingRecords, error: fetchError } = await supabaseAdmin
      .from('levels')
      .select('id')
    if (fetchError) throw fetchError

    const existingIds = new Set((existingRecords || []).map((r: any) => r.id))
    console.log('[Create SLM Levels] Niveles existentes:', existingIds.size)

    const levelsToCreate = SLM_LEVELS.filter(level => !existingIds.has(level.id))
    console.log('[Create SLM Levels] Niveles a crear:', levelsToCreate.length)

    if (levelsToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Todos los niveles SLM ya existen',
        created: 0
      })
    }

    const created: string[] = []
    const errors: string[] = []

    for (const level of levelsToCreate) {
      const { error: insertError } = await supabaseAdmin.from('levels').insert({
        id: level.id,
        name: level.name,
        full_name: level.fullName,
        category: level.category,
        age_range: level.ageRange,
        grade_number: level.gradeNumber,
        color: level.color,
        neon_color: level.neonColor,
        icon: level.icon,
        kit_price: level.kitPrice,
        has_hacking: level.hasHacking,
        has_advanced_ia: level.hasAdvancedIA,
      })
      if (insertError) {
        const errorMsg = `Error creando ${level.id}: ${insertError.message}`
        errors.push(errorMsg)
        console.error(errorMsg)
      } else {
        created.push(level.id)
        console.log(`[Create SLM Levels] Creado: ${level.id}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se crearon ${created.length} niveles SLM`,
      created,
      errors
    })

  } catch (error) {
    console.error('[Create SLM Levels] Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// GET - Ver qué niveles SLM faltan
export async function GET() {
  try {
    const { data: existingRecords, error: fetchError } = await supabaseAdmin
      .from('levels')
      .select('id')
    if (fetchError) throw fetchError

    const existingIds = new Set((existingRecords || []).map((r: any) => r.id))
    const missingLevels = SLM_LEVELS.filter(level => !existingIds.has(level.id))
    const existingSlmLevels = SLM_LEVELS.filter(level => existingIds.has(level.id))

    return NextResponse.json({
      success: true,
      totalLevelsInDb: existingRecords?.length || 0,
      slmLevelsNeeded: SLM_LEVELS.length,
      missingLevels: missingLevels.map(l => ({ id: l.id, name: l.name })),
      existingSlmLevels: existingSlmLevels.map(l => ({ id: l.id, name: l.name })),
      message: missingLevels.length > 0
        ? `Faltan ${missingLevels.length} niveles SLM. Usa POST para crearlos.`
        : 'Todos los niveles SLM ya existen.'
    })

  } catch (error) {
    console.error('[Create SLM Levels] Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
