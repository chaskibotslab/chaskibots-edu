import { NextResponse } from 'next/server'
import { cache, cacheKeys } from '@/lib/cache'
import { getUserFriendlyError } from '@/lib/airtable-errors'

export const dynamic = 'force-dynamic'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_KITS_TABLE_ID = process.env.AIRTABLE_KITS_TABLE_ID || 'kits'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_KITS_TABLE_ID}`

// Función para convertir URL de Google Drive a formato que funcione
function convertGoogleDriveUrl(url: string): string {
  if (!url) return ''
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/)
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`
    }
  }
  return url
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')

  // Caché de kits - 1 hora (los kits casi nunca cambian)
  const CACHE_KEY = cacheKeys.kits(levelId || undefined)

  try {
    // Intentar obtener del caché primero
    const cached = cache.get<any>(CACHE_KEY)
    if (cached) {
      console.log('[Kits API] Usando caché para:', levelId || 'todos')
      return NextResponse.json(cached)
    }

    console.log('[Kits API] Consultando Airtable para:', levelId || 'todos')
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_KITS_TABLE_ID}`
    
    if (levelId) {
      url += `?filterByFormula={levelId}="${levelId}"&maxRecords=1`
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      
      // Mensaje amigable para límite de API
      if (response.status === 429) {
        return NextResponse.json(
          { error: getUserFriendlyError(429, errorText) },
          { status: 429 }
        )
      }
      
      return NextResponse.json({ error: 'Error fetching from Airtable', details: errorText }, { status: 500 })
    }

    const data = await response.json()
    
    // Transformar los datos de Airtable al formato que necesitamos
    const kits = data.records.map((record: any) => {
      // Procesar imágenes desde el campo image_urls (texto con URLs separadas por coma)
      let images: string[] = []
      
      // El campo principal es image_urls (según la tabla de Airtable del usuario)
      if (record.fields.image_urls && typeof record.fields.image_urls === 'string') {
        images = record.fields.image_urls.split(',').map((url: string) => convertGoogleDriveUrl(url.trim())).filter(Boolean)
      }
      
      // También verificar campo images si existe (puede ser Attachment)
      if (record.fields.images) {
        if (Array.isArray(record.fields.images)) {
          const attachmentUrls = record.fields.images.map((img: any) => {
            const url = typeof img === 'string' ? img : img.url
            return convertGoogleDriveUrl(url)
          })
          images = [...images, ...attachmentUrls]
        } else if (typeof record.fields.images === 'string') {
          const textUrls = record.fields.images.split(',').map((url: string) => convertGoogleDriveUrl(url.trim()))
          images = [...images, ...textUrls]
        }
      }

      return {
        id: record.id,
        levelId: record.fields.levelId || '',
        name: record.fields.name || record.fields.Name || '',
        description: record.fields.description || '',
        components: record.fields.components ? record.fields.components.split(',').map((c: string) => c.trim()) : [],
        skills: record.fields.skills ? record.fields.skills.split(',').map((s: string) => s.trim()) : [],
        images,
        videoUrl: record.fields.videoUrl || '',
        tutorialUrl: record.fields.tutorialUrl || '',
        price: record.fields.price || 0,
      }
    })

    // Guardar en caché
    const result = levelId && kits.length > 0 ? kits[0] : kits
    cache.set(CACHE_KEY, result)

    if (levelId && kits.length > 0) {
      return NextResponse.json(kits[0])
    }

    return NextResponse.json(kits)
  } catch (error: any) {
    console.error('Error:', error)
    
    // Verificar si es error de límite de API
    const errorMessage = error?.message || ''
    if (errorMessage.includes('429') || errorMessage.includes('BILLING_LIMIT')) {
      return NextResponse.json(
        { error: getUserFriendlyError(429, errorMessage) },
        { status: 429 }
      )
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear nuevo kit
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            name: body.name,
            levelId: body.levelId,
            description: body.description || '',
            components: body.components || '',
            skills: body.skills || '',
            images: body.image_urls || '',
            videoUrl: body.videoUrl || '',
            tutorialUrl: body.tutorialUrl || '',
          }
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error creating kit', details: errorText }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, record: data.records[0] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Actualizar kit existente
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    console.log('PUT request body:', JSON.stringify(body, null, 2))
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required', message: 'ID is required' }, { status: 400 })
    }

    // Campos que existen en Airtable
    const fields: Record<string, any> = {}
    if (body.name) fields.name = body.name
    if (body.levelId) fields.levelId = body.levelId
    if (body.description) fields.description = body.description
    if (body.components) fields.components = body.components
    if (body.skills) fields.skills = body.skills
    if (body.image_urls !== undefined) fields.images = body.image_urls
    if (body.price !== undefined) fields.price = Number(body.price) || 0
    if (body.videoUrl !== undefined) fields.videoUrl = body.videoUrl
    if (body.tutorialUrl !== undefined) fields.tutorialUrl = body.tutorialUrl

    console.log('Sending to Airtable:', JSON.stringify({ records: [{ id: body.id, fields }] }, null, 2))

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          id: body.id,
          fields
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable PUT error status:', response.status)
      console.error('Airtable PUT error body:', errorText)
      
      // Parsear el error de Airtable para dar mejor mensaje
      let errorMessage = 'Error al actualizar en Airtable'
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message
        }
        if (errorJson.error?.type === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
          errorMessage = 'El API key no tiene permisos de escritura o algún campo no existe en Airtable. Ve a airtable.com/create/tokens y verifica que tu token tenga permisos de data.records:write'
        }
      } catch (e) {}
      
      return NextResponse.json({ error: 'Error updating kit', message: errorMessage, details: errorText }, { status: 500 })
    }

    const data = await response.json()
    console.log('PUT success:', data)
    return NextResponse.json({ success: true, record: data.records[0] })
  } catch (error: any) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message || 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar kit
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const response = await fetch(`${AIRTABLE_API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error deleting kit', details: errorText }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
