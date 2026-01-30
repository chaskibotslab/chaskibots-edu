import { google } from 'googleapis'
import { Readable } from 'stream'

// Configuración de Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file']

// ID de la carpeta principal de ChaskiBots en Drive (ChaskiBots-EDU compartida)
const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1kX397yuC2Nbvys9tYCHpvpI04iJ3OxO8'

// Carpeta específica para archivos del docente
const TEACHER_FOLDER_ID = process.env.GOOGLE_DRIVE_TEACHER_FOLDER_ID || '1HLKy4aNlrzKMccj0X81ViS0Kfa8h2Z1N'

// Carpeta específica para archivos de estudiantes
const STUDENT_FOLDER_ID = process.env.GOOGLE_DRIVE_STUDENT_FOLDER_ID || '1PbkQEuf4cPR74nmQ8vFhm2u_Tsu9Aysc'

// Función para formatear la clave privada correctamente
function formatPrivateKey(key: string): string {
  if (!key) return ''
  
  // Reemplazar \n literales por saltos de línea reales
  let formattedKey = key.replace(/\\n/g, '\n')
  
  // Si ya tiene los headers PEM completos, retornar
  if (formattedKey.includes('-----BEGIN PRIVATE KEY-----') && formattedKey.includes('-----END PRIVATE KEY-----')) {
    return formattedKey
  }
  
  // Limpiar cualquier header parcial o caracteres extraños
  let cleanKey = formattedKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/[\s\n\r]/g, '') // Quitar espacios y saltos de línea
  
  // Reconstruir con headers PEM correctos
  return `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----\n`
}

// Credenciales de la cuenta de servicio
const credentials = {
  type: 'service_account',
  project_id: process.env.GOOGLE_PROJECT_ID || 'chaskibots-edu',
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
  private_key: formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY || ''),
  client_email: process.env.GOOGLE_CLIENT_EMAIL || 'chaskibots-drive@chaskibots-edu.iam.gserviceaccount.com',
  client_id: process.env.GOOGLE_CLIENT_ID || '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
}

// Verificar si Drive está configurado correctamente
export function isDriveConfigured(): boolean {
  const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY
  const hasClientEmail = !!process.env.GOOGLE_CLIENT_EMAIL
  console.log(`[Drive] Config check - Private Key: ${hasPrivateKey}, Client Email: ${hasClientEmail}`)
  if (hasClientEmail) {
    console.log(`[Drive] Client Email: ${process.env.GOOGLE_CLIENT_EMAIL}`)
  }
  return hasPrivateKey && hasClientEmail
}

// Crear cliente de autenticación
function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })
  return auth
}

// Obtener cliente de Drive
function getDriveClient() {
  const auth = getAuthClient()
  return google.drive({ version: 'v3', auth })
}

// Crear carpeta si no existe
async function getOrCreateFolder(drive: any, folderName: string, parentId: string): Promise<string> {
  // Buscar si la carpeta ya existe
  const response = await drive.files.list({
    q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  })

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id
  }

  // Crear la carpeta
  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId],
  }

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  })

  return folder.data.id
}

// Subir archivo a Drive
export async function uploadFileToDrive(
  fileContent: string | Buffer,
  fileName: string,
  mimeType: string,
  levelId: string,
  studentName: string,
  taskId: string
): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
  console.log(`[Drive] uploadFileToDrive called with:`)
  console.log(`[Drive]   fileName: ${fileName}`)
  console.log(`[Drive]   mimeType: ${mimeType}`)
  console.log(`[Drive]   levelId: ${levelId}`)
  console.log(`[Drive]   studentName: ${studentName}`)
  console.log(`[Drive]   taskId: ${taskId}`)
  console.log(`[Drive]   fileContent length: ${typeof fileContent === 'string' ? fileContent.length : 'buffer'}`)
  
  try {
    const drive = getDriveClient()
    console.log(`[Drive] Drive client created successfully`)

    let targetFolderId: string

    // Si es archivo del docente, usar carpeta del docente directamente
    if (studentName === 'docente') {
      // Subir directamente a la carpeta del docente (sin subcarpetas)
      console.log(`[Drive] Uploading teacher file to folder: ${TEACHER_FOLDER_ID}`)
      targetFolderId = TEACHER_FOLDER_ID
    } else {
      // Subir directamente a la carpeta de estudiantes (sin subcarpetas)
      console.log(`[Drive] Uploading student file to folder: ${STUDENT_FOLDER_ID}`)
      targetFolderId = STUDENT_FOLDER_ID
    }

    // Preparar el contenido del archivo
    let media: { mimeType: string; body: Readable }
    
    if (typeof fileContent === 'string') {
      // Si es base64, convertir a buffer
      if (fileContent.includes('base64,')) {
        const base64Data = fileContent.split('base64,')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        media = {
          mimeType,
          body: Readable.from(buffer),
        }
      } else {
        // Es texto plano (código)
        media = {
          mimeType: 'text/plain',
          body: Readable.from(fileContent),
        }
      }
    } else {
      media = {
        mimeType,
        body: Readable.from(fileContent),
      }
    }

    // Subir archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const finalFileName = `${timestamp}_${fileName}`

    console.log(`[Drive] Creating file: ${finalFileName} in folder: ${targetFolderId}`)
    
    const file = await drive.files.create({
      requestBody: {
        name: finalFileName,
        parents: [targetFolderId],
      },
      media,
      fields: 'id, webViewLink, webContentLink',
    })

    console.log(`[Drive] File created with ID: ${file.data.id}`)

    const fileId = file.data.id as string

    // Hacer el archivo accesible para cualquiera con el enlace
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    console.log(`[Drive] Permissions set. WebViewLink: ${file.data.webViewLink}`)

    return {
      fileId: fileId,
      webViewLink: file.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
      webContentLink: file.data.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`,
    }
  } catch (error: any) {
    console.error('[Drive] Error uploading to Drive:', error?.message || error)
    console.error('[Drive] Error details:', JSON.stringify(error?.response?.data || error, null, 2))
    throw error
  }
}

// Subir código como archivo de texto
export async function uploadCodeToDrive(
  code: string,
  output: string,
  levelId: string,
  studentName: string,
  taskId: string
): Promise<{ fileId: string; webViewLink: string }> {
  const content = `# Entrega de ${studentName}
# Tarea: ${taskId}
# Nivel: ${levelId}
# Fecha: ${new Date().toLocaleString('es-ES')}

# ==================== CÓDIGO ====================
${code}

# ==================== SALIDA ====================
${output}
`

  const result = await uploadFileToDrive(
    content,
    `codigo_${studentName.replace(/\s+/g, '_')}.py`,
    'text/plain',
    levelId,
    studentName,
    taskId
  )

  return {
    fileId: result.fileId,
    webViewLink: result.webViewLink,
  }
}

// Subir imagen (dibujo) a Drive
export async function uploadImageToDrive(
  base64Image: string,
  levelId: string,
  studentName: string,
  taskId: string
): Promise<{ fileId: string; webViewLink: string }> {
  const result = await uploadFileToDrive(
    base64Image,
    `dibujo_${studentName.replace(/\s+/g, '_')}.png`,
    'image/png',
    levelId,
    studentName,
    taskId
  )

  return {
    fileId: result.fileId,
    webViewLink: result.webViewLink,
  }
}

// Listar archivos de una carpeta
export async function listFilesInFolder(folderId: string): Promise<any[]> {
  try {
    const drive = getDriveClient()
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime, size)',
      orderBy: 'createdTime desc',
    })

    return response.data.files || []
  } catch (error) {
    console.error('Error listing files:', error)
    return []
  }
}

// Obtener enlace de descarga de un archivo
export function getDownloadLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

// Obtener enlace de vista de un archivo
export function getViewLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}
