import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const DEFAULT_BUCKET = 'submissions'

async function ensureBucket(bucket: string) {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    if (listError) throw listError
    if (buckets?.some(b => b.id === bucket)) return true
    const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, { public: false })
    if (createError) throw createError
    console.log(`🪣 Bucket '${bucket}' creado`)
    return true
  } catch (err: any) {
    console.error(`❌ Error verificando/creando bucket '${bucket}':`, err.message)
    return false
  }
}

async function isPublicBucket(bucket: string): Promise<boolean> {
  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
    if (error) throw error
    const b = buckets?.find(x => x.id === bucket)
    return b?.public ?? false
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || DEFAULT_BUCKET

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
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
      return NextResponse.json({ error: 'Archivo muy grande. Máximo 10MB.' }, { status: 400 })
    }

    const bucketReady = await ensureBucket(bucket)
    if (!bucketReady) {
      return NextResponse.json({ error: 'Bucket de almacenamiento no disponible' }, { status: 500 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, { contentType: file.type, upsert: true })

    if (uploadError) throw uploadError

    let url: string
    if (await isPublicBucket(bucket)) {
      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)
      url = data.publicUrl
    } else {
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365)
      if (signedError) throw signedError
      url = signedData.signedUrl
    }

    return NextResponse.json({
      success: true,
      fileId: filePath,
      fileName,
      url,
      thumbnailUrl: url,
    })
  } catch (error: any) {
    console.error('Upload error:', error)

    return NextResponse.json({
      error: error.message || 'Error al subir archivo',
      details: error.message,
      code: error.code,
    }, { status: 500 })
  }
}
