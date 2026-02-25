import { NextResponse } from 'next/server'
import Airtable from 'airtable'
import { cache, cacheKeys } from '@/lib/cache'
import { getUserFriendlyError } from '@/lib/airtable-errors'

export const dynamic = 'force-dynamic'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

// Caché de niveles - 30 minutos (los niveles casi nunca cambian)
const CACHE_KEY = cacheKeys.levels()

export async function GET() {
  try {
    // Intentar obtener del caché primero
    const cached = cache.get<any[]>(CACHE_KEY)
    if (cached) {
      console.log('[Levels API] Usando caché')
      return NextResponse.json(cached)
    }

    console.log('[Levels API] Consultando Airtable...')
    const records = await base('levels')
      .select({
        sort: [{ field: 'gradeNumber', direction: 'asc' }]
      })
      .all()

    const levels = records.map(record => ({
      id: record.fields.id as string,
      name: record.fields.name as string,
      fullName: record.fields.fullName as string,
      category: record.fields.category as string,
      ageRange: record.fields.ageRange as string,
      gradeNumber: record.fields.gradeNumber as number,
      color: record.fields.color as string || 'from-blue-500 to-cyan-600',
      neonColor: record.fields.neonColor as string || '#00d4ff',
      icon: record.fields.icon as string || '📚',
      kitPrice: record.fields.kitPrice as number || 50,
      hasHacking: record.fields.hasHacking as boolean || false,
      hasAdvancedIA: record.fields.hasAdvancedIA as boolean || false
    }))

    // Guardar en caché
    cache.set(CACHE_KEY, levels)
    
    return NextResponse.json(levels)
  } catch (error: any) {
    console.error('Error fetching levels from Airtable:', error)
    
    // Verificar si es error de límite de API
    const errorMessage = error?.message || ''
    if (errorMessage.includes('429') || errorMessage.includes('BILLING_LIMIT')) {
      return NextResponse.json(
        { error: getUserFriendlyError(429, errorMessage) },
        { status: 429 }
      )
    }
    
    // Fallback: devolver array vacío si falla
    return NextResponse.json([])
  }
}
