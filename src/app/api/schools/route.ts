import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_SCHOOLS_TABLE = 'schools'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_SCHOOLS_TABLE}`

export interface School {
  id: string
  name: string
  code: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  logo?: string
  isActive: boolean
  createdAt: string
  maxStudents?: number
  maxTeachers?: number
}

// GET - Obtener colegios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('id')

    let url = AIRTABLE_API_URL + '?sort[0][field]=name&sort[0][direction]=asc'
    
    if (schoolId) {
      url += `&filterByFormula=${encodeURIComponent(`{id}="${schoolId}"`)}`
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
      console.error('Airtable schools error:', errorText)
      if (errorText.includes('NOT_FOUND') || errorText.includes('TABLE_NOT_FOUND')) {
        return NextResponse.json({ success: true, schools: [], message: 'Tabla schools no existe en Airtable. Créala primero.' })
      }
      return NextResponse.json({ error: 'Error fetching schools' }, { status: 500 })
    }

    const data = await response.json()
    
    const schools = data.records.map((record: any) => ({
      id: record.fields.id || record.id,
      recordId: record.id, // ID interno de Airtable para DELETE
      name: record.fields.name || '',
      code: record.fields.code || '',
      address: record.fields.address || '',
      city: record.fields.city || '',
      country: record.fields.country || '',
      phone: record.fields.phone || '',
      email: record.fields.email || '',
      logo: record.fields.logo || '',
      isActive: record.fields.isActive !== false,
      createdAt: record.fields.createdAt || '',
      maxStudents: record.fields.maxStudents || 100,
      maxTeachers: record.fields.maxTeachers || 10,
    }))

    return NextResponse.json({ success: true, schools })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear colegio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, address, city, country, phone, email, maxStudents, maxTeachers } = body

    if (!name || !code) {
      return NextResponse.json({ error: 'Nombre y código son requeridos' }, { status: 400 })
    }

    // Verificar que las variables de entorno estén configuradas
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable credentials')
      return NextResponse.json({ 
        error: 'Configuración de Airtable incompleta. Verifica AIRTABLE_API_KEY y AIRTABLE_BASE_ID' 
      }, { status: 500 })
    }

    // Generar ID único para el colegio
    const schoolId = `school-${code.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`

    console.log('Creating school:', { schoolId, name, code })
    console.log('Airtable URL:', AIRTABLE_API_URL)

    // Solo enviar campos básicos que seguro existen en la tabla
    const fields: Record<string, unknown> = {
      id: schoolId,
      name,
      code,
    }
    
    // Agregar campos opcionales solo si tienen valor
    if (address) fields.address = address
    if (city) fields.city = city
    if (country) fields.country = country
    // NO enviar phone si causa problemas - el usuario debe cambiar el tipo de campo en Airtable a "Single line text"
    // if (phone) fields.phone = phone
    if (email) fields.email = email
    if (maxStudents) fields.maxStudents = Number(maxStudents)
    if (maxTeachers) fields.maxTeachers = Number(maxTeachers)

    console.log('Fields to send:', fields)

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable create school error:', errorText)
      
      // Dar mensaje más específico según el error
      if (errorText.includes('NOT_FOUND') || errorText.includes('TABLE_NOT_FOUND')) {
        return NextResponse.json({ 
          error: 'La tabla "schools" no existe en Airtable. Debes crearla primero.' 
        }, { status: 400 })
      }
      if (errorText.includes('UNKNOWN_FIELD_NAME')) {
        // Extraer el nombre del campo que falta
        const match = errorText.match(/UNKNOWN_FIELD_NAME.*?"([^"]+)"/)
        const fieldName = match ? match[1] : 'desconocido'
        return NextResponse.json({ 
          error: `El campo "${fieldName}" no existe en la tabla schools de Airtable. Agrégalo primero.` 
        }, { status: 400 })
      }
      if (errorText.includes('INVALID_PERMISSIONS')) {
        return NextResponse.json({ 
          error: 'No tienes permisos para crear registros. Verifica tu API Key de Airtable.' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: `Error de Airtable: ${errorText}` }, { status: 500 })
    }

    const record = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      school: {
        id: schoolId,
        name,
        code,
        recordId: record.id
      }
    })
  } catch (error) {
    console.error('Error creating school:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Error interno: ${errorMsg}` }, { status: 500 })
  }
}

// DELETE - Eliminar colegio
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('recordId')
    const schoolId = searchParams.get('id')

    let airtableRecordId = recordId

    // Si no tenemos recordId pero tenemos schoolId, buscar el registro primero
    if (!airtableRecordId && schoolId) {
      const searchUrl = `${AIRTABLE_API_URL}?filterByFormula=${encodeURIComponent(`{id}="${schoolId}"`)}`
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      })
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.records && searchData.records.length > 0) {
          airtableRecordId = searchData.records[0].id
        }
      }
    }

    // Si el recordId parece ser un ID de school (empieza con "school-"), buscar el registro
    if (airtableRecordId && airtableRecordId.startsWith('school-')) {
      const searchUrl = `${AIRTABLE_API_URL}?filterByFormula=${encodeURIComponent(`{id}="${airtableRecordId}"`)}`
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      })
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.records && searchData.records.length > 0) {
          airtableRecordId = searchData.records[0].id
        } else {
          return NextResponse.json({ error: 'Colegio no encontrado' }, { status: 404 })
        }
      }
    }

    if (!airtableRecordId) {
      return NextResponse.json({ error: 'ID de colegio es requerido' }, { status: 400 })
    }

    console.log('Deleting school with Airtable record ID:', airtableRecordId)

    const response = await fetch(`${AIRTABLE_API_URL}/${airtableRecordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable delete error:', errorText)
      return NextResponse.json({ error: 'Error al eliminar colegio' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
