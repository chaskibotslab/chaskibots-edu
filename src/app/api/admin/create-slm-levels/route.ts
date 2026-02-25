import { NextResponse } from 'next/server'
import Airtable from 'airtable'

export const dynamic = 'force-dynamic'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

const TABLE_NAME = 'levels'

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

    // Primero obtener los niveles existentes
    const existingRecords = await base(TABLE_NAME).select().all()
    const existingIds = new Set(existingRecords.map((r: any) => r.fields.id))

    console.log('[Create SLM Levels] Niveles existentes:', existingIds.size)

    // Filtrar solo los que no existen
    const levelsToCreate = SLM_LEVELS.filter(level => !existingIds.has(level.id))

    console.log('[Create SLM Levels] Niveles a crear:', levelsToCreate.length)

    if (levelsToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Todos los niveles SLM ya existen',
        created: 0
      })
    }

    // Crear los niveles faltantes
    const created: string[] = []
    const errors: string[] = []

    for (const level of levelsToCreate) {
      try {
        await base(TABLE_NAME).create([
          {
            fields: {
              id: level.id,
              name: level.name,
              fullName: level.fullName,
              category: level.category,
              ageRange: level.ageRange,
              gradeNumber: level.gradeNumber,
              color: level.color,
              neonColor: level.neonColor,
              icon: level.icon,
              kitPrice: level.kitPrice,
              hasHacking: level.hasHacking,
              hasAdvancedIA: level.hasAdvancedIA,
            }
          }
        ])
        created.push(level.id)
        console.log(`[Create SLM Levels] Creado: ${level.id}`)
      } catch (error) {
        const errorMsg = `Error creando ${level.id}: ${error}`
        errors.push(errorMsg)
        console.error(errorMsg)
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
    const existingRecords = await base(TABLE_NAME).select().all()
    const existingIds = new Set(existingRecords.map((r: any) => r.fields.id))

    const missingLevels = SLM_LEVELS.filter(level => !existingIds.has(level.id))
    const existingSlmLevels = SLM_LEVELS.filter(level => existingIds.has(level.id))

    return NextResponse.json({
      success: true,
      totalLevelsInDb: existingRecords.length,
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
