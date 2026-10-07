import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/requireAdmin'

export const dynamic = 'force-dynamic'

// Antes este endpoint descargaba cualquier URL que le pasaran (incluidas
// direcciones internas del servidor). Ahora solo sirve imágenes de los
// orígenes que la plataforma realmente usa.
const ALLOWED_HOSTS = [
  'drive.google.com', 'drive.usercontent.google.com', 'lh3.googleusercontent.com',
  'i.ytimg.com', 'img.youtube.com', 'chaskibots.com',
]

function isAllowedUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return false
    return ALLOWED_HOSTS.includes(u.hostname) || u.hostname.endsWith('.supabase.co') || u.hostname.endsWith('.googleusercontent.com')
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireSession(request)
  if (!auth.ok) return auth.response
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  if (!isAllowedUrl(imageUrl)) {
    return NextResponse.json({ error: 'URL no permitida' }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'El recurso no es una imagen' }, { status: 415 })
    }
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 })
  }
}
