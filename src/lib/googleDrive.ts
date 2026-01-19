import { google } from 'googleapis'
import { Readable } from 'stream'

// Configuración de Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file']

// ID de la carpeta principal de ChaskiBots en Drive
const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1rxUZrF96yBW7BTl4CMLM7FXF03JYaqpp'

// Función para formatear la clave privada correctamente
function formatPrivateKey(key: string): string {
  if (!key) return ''
  
  // Primero reemplazar \n literales por saltos de línea reales
  let formattedKey = key.replace(/\\n/g, '\n')
  
  // Si ya tiene los headers PEM, retornar
  if (formattedKey.includes('-----BEGIN')) {
    return formattedKey
  }
  
  // Si es base64 sin headers, agregar headers PEM
  // Limpiar espacios y saltos de línea extras
  const cleanKey = formattedKey.replace(/\s/g, '')
  
  // Dividir en líneas de 64 caracteres (formato PEM estándar)
  const lines = cleanKey.match(/.{1,64}/g) || [cleanKey]
  
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`
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
  return !!(process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL)
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
  try {
    const drive = getDriveClient()

    // Crear estructura de carpetas: Entregas > Nivel > Tarea > Estudiante
    const entregasFolderId = await getOrCreateFolder(drive, 'Entregas-Estudiantes', MAIN_FOLDER_ID)
    const levelFolderId = await getOrCreateFolder(drive, levelId, entregasFolderId)
    const taskFolderId = await getOrCreateFolder(drive, taskId, levelFolderId)
    const studentFolderId = await getOrCreateFolder(drive, studentName.replace(/[^a-zA-Z0-9]/g, '_'), taskFolderId)

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

    const file = await drive.files.create({
      requestBody: {
        name: finalFileName,
        parents: [studentFolderId],
      },
      media,
      fields: 'id, webViewLink, webContentLink',
    })

    const fileId = file.data.id as string

    // Hacer el archivo accesible para cualquiera con el enlace
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    return {
      fileId: fileId,
      webViewLink: file.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
      webContentLink: file.data.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`,
    }
  } catch (error) {
    console.error('Error uploading to Drive:', error)
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
