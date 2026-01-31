import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'
import path from 'path'
import fs from 'fs'

const KITS_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || ''

// Cargar credenciales desde el archivo JSON
function getAuthClient() {
  try {
    const credentialsPath = path.join(process.cwd(), 'chaskibots-edu-081b942e4eaa.json')
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
    
    console.log('Using credentials from JSON file:', credentials.client_email)
    
    return new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })
  } catch (error) {
    console.error('Error loading credentials:', error)
    throw new Error('Could not load Google credentials')
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tipo de archivo - permitir imágenes, PDFs, documentos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ]
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usa imágenes, PDF, Word o Excel.' }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 })
    }

    console.log('Uploading to folder:', KITS_FOLDER_ID)
    
    const auth = getAuthClient()
    const drive = google.drive({ version: 'v3', auth })

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Crear stream desde buffer
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)

    // Generar nombre único
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`

    // Subir archivo a Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [KITS_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, name, webViewLink',
    })

    const fileId = response.data.id

    // Hacer el archivo público
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    // Generar URL de la imagen
    const imageUrl = `https://drive.google.com/file/d/${fileId}/view`
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`

    return NextResponse.json({
      success: true,
      fileId,
      fileName: response.data.name,
      url: imageUrl,
      thumbnailUrl,
    })
  } catch (error: any) {
    console.error('Upload error full:', JSON.stringify(error, null, 2))
    console.error('Error message:', error.message)
    console.error('Error response:', error.response?.data)
    
    // Mensaje de error más descriptivo
    let errorMessage = 'Error uploading file'
    if (error.code === 403) {
      errorMessage = 'Permiso denegado. Verifica que la carpeta de Google Drive esté compartida con la cuenta de servicio como Editor.'
    } else if (error.code === 404) {
      errorMessage = 'Carpeta no encontrada. Verifica el ID de la carpeta en .env.local'
    }
    
    return NextResponse.json({ 
      error: errorMessage, 
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
}
