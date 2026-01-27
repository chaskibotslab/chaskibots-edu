import { NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_LESSONS_TABLE = 'lessons'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_LESSONS_TABLE}`

function getVideoEmbedUrl(url: string): string {
  if (!url) return ''
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/)
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`
    }
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
  }
  return url
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')

  try {
    let url = AIRTABLE_API_URL
    
    if (levelId) {
      url += `?filterByFormula={levelId}="${levelId}"&sort[0][field]=order&sort[0][direction]=asc`
    } else {
      url += `?sort[0][field]=order&sort[0][direction]=asc`
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
      console.error('Airtable lessons error:', errorText)
      return NextResponse.json({ error: 'Error fetching lessons' }, { status: 500 })
    }

    const data = await response.json()
    
    const lessons = data.records.map((record: any) => {
      const moduleName = record.fields.moduleName || ''
      const moduleId = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sin-modulo'
      
      // Obtener videoUrl original para edición
      const videoUrlRaw = record.fields.videoUrl || ''
      
      // Parsear múltiples URLs (separadas por | o salto de línea) para visualización
      const allUrls = videoUrlRaw.split(/[|\n]/).map((url: string) => url.trim()).filter((url: string) => url)
      
      // Separar videos de imágenes para mostrar al estudiante
      const videos: string[] = []
      const images: string[] = []
      
      allUrls.forEach((url: string) => {
        // Detectar si es video (YouTube, Drive con /preview, Vimeo) o imagen
        if (url.includes('youtube.com') || url.includes('youtu.be') || 
            url.includes('/preview') || url.includes('vimeo.com')) {
          videos.push(url)
        } else if (url.includes('drive.google.com/file/d/')) {
          // Google Drive file - convertir a formato de imagen directa
          const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
          if (match && match[1]) {
            images.push(`https://drive.google.com/uc?id=${match[1]}`)
          }
        } else if (url.includes('drive.google.com/uc?id=')) {
          images.push(url)
        } else {
          // Asumir que es imagen si no es video conocido
          images.push(url)
        }
      })
      
      // El primer video es el principal para embed
      const mainVideoUrl = videos[0] || ''
      
      return {
        id: record.id,
        levelId: record.fields.levelId || '',
        moduleId,
        moduleName,
        title: record.fields.title || '',
        type: record.fields.type || 'video',
        duration: record.fields.duration || '5 min',
        order: record.fields.order || 0,
        videoUrl: videoUrlRaw,
        videoEmbedUrl: getVideoEmbedUrl(mainVideoUrl),
        videos,
        images,
        content: record.fields.content || '',
        locked: record.fields.locked || false,
      }
    })

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Campos básicos requeridos - NO incluir 'type' si Airtable tiene opciones restringidas
    const fields: Record<string, any> = {
      levelId: body.levelId || '',
      moduleName: body.moduleName || '',
      title: body.title || '',
      duration: body.duration || '5 min',
      order: body.order || 0,
    }
    
    // Solo agregar campos opcionales si tienen valor
    if (body.videoUrl) fields.videoUrl = body.videoUrl
    if (body.content) fields.content = body.content
    if (body.locked !== undefined) fields.locked = body.locked
    
    // Intentar primero sin el campo 'type' que puede causar problemas
    let response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields }]
      })
    })

    // Si falla, intentar con el campo type
    if (!response.ok) {
      const errorText = await response.text()
      
      // Si el error NO es por type, reintentar con type
      if (!errorText.includes('INVALID_MULTIPLE_CHOICE') && body.type) {
        fields.type = body.type
        response = await fetch(AIRTABLE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [{ fields }]
          })
        })
      }
      
      if (!response.ok) {
        console.error('Airtable error:', errorText)
        return NextResponse.json({ error: 'Error creating lesson', message: errorText }, { status: 500 })
      }
    }

    const data = await response.json()
    return NextResponse.json({ success: true, record: data.records[0] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const fields: Record<string, any> = {}
    if (body.levelId) fields.levelId = body.levelId
    if (body.moduleName) fields.moduleName = body.moduleName
    if (body.title) fields.title = body.title
    if (body.type) fields.type = body.type
    if (body.duration) fields.duration = body.duration
    if (body.order !== undefined) fields.order = body.order
    if (body.videoUrl !== undefined) fields.videoUrl = body.videoUrl
    if (body.content !== undefined) fields.content = body.content
    if (body.locked !== undefined) fields.locked = body.locked

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
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error updating lesson', message: errorText }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, record: data.records[0] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      return NextResponse.json({ error: 'Error deleting lesson' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
