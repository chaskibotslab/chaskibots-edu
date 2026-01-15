// ============================================
// SERVICIO DE AIRTABLE - ChaskiBots EDU
// ============================================

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_KITS_TABLE_ID = process.env.AIRTABLE_KITS_TABLE_ID || ''

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`

interface AirtableRecord<T> {
  id: string
  fields: T
  createdTime: string
}

interface AirtableResponse<T> {
  records: AirtableRecord<T>[]
  offset?: string
}

// ============================================
// TIPOS DE DATOS DE AIRTABLE
// ============================================

export interface KitFields {
  Name: string
  levelId: string
  description?: string
  price?: number
  components?: string
  skills?: string
  images?: { url: string }[]  // Airtable attachments
  videoUrl?: string
  tutorialUrl?: string
}

export interface LessonFields {
  Name: string
  levelId: string
  moduleId: string
  type: string
  duration: string
  order: number
  locked: boolean
  completed: boolean
  videoUrl?: string
  thumbnailUrl?: string
  content?: string
}

export interface ModuleFields {
  Name: string
  levelId: string
  description: string
  order: number
}

// ============================================
// FUNCIONES DE API
// ============================================

async function fetchFromAirtable<T>(tableId: string, params?: Record<string, string>): Promise<AirtableRecord<T>[]> {
  const url = new URL(`${AIRTABLE_API_URL}/${tableId}`)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Para desarrollo, no cachear
  })

  if (!response.ok) {
    console.error('Airtable error:', await response.text())
    throw new Error(`Airtable API error: ${response.status}`)
  }

  const data: AirtableResponse<T> = await response.json()
  return data.records
}

// ============================================
// KITS
// ============================================

export interface KitData {
  id: string
  levelId: string
  name: string
  description: string
  components: string[]
  skills: string[]
  images: string[]
  videoUrl?: string
  tutorialUrl?: string
  price?: number
}

export async function getKitsFromAirtable(): Promise<KitData[]> {
  try {
    const records = await fetchFromAirtable<KitFields>(AIRTABLE_KITS_TABLE_ID)
    
    return records.map(record => ({
      id: record.id,
      levelId: record.fields.levelId || '',
      name: record.fields.Name || '',
      description: record.fields.description || '',
      components: record.fields.components ? record.fields.components.split(',').map(c => c.trim()) : [],
      skills: record.fields.skills ? record.fields.skills.split(',').map(s => s.trim()) : [],
      images: record.fields.images ? record.fields.images.map(img => img.url) : [],
      videoUrl: record.fields.videoUrl,
      tutorialUrl: record.fields.tutorialUrl,
      price: record.fields.price,
    }))
  } catch (error) {
    console.error('Error fetching kits from Airtable:', error)
    return []
  }
}

export async function getKitByLevelIdFromAirtable(levelId: string): Promise<KitData | null> {
  try {
    const records = await fetchFromAirtable<KitFields>(AIRTABLE_KITS_TABLE_ID, {
      filterByFormula: `{levelId} = "${levelId}"`,
      maxRecords: '1',
    })
    
    if (records.length === 0) return null
    
    const record = records[0]
    return {
      id: record.id,
      levelId: record.fields.levelId || '',
      name: record.fields.Name || '',
      description: record.fields.description || '',
      components: record.fields.components ? record.fields.components.split(',').map(c => c.trim()) : [],
      skills: record.fields.skills ? record.fields.skills.split(',').map(s => s.trim()) : [],
      images: record.fields.images ? record.fields.images.map(img => img.url) : [],
      videoUrl: record.fields.videoUrl,
      tutorialUrl: record.fields.tutorialUrl,
      price: record.fields.price,
    }
  } catch (error) {
    console.error('Error fetching kit from Airtable:', error)
    return null
  }
}
