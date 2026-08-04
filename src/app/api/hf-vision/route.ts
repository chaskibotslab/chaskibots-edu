import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Hugging Face Inference API — real cloud AI models, no client-side download needed.
// task: 'detect' (transformer object detection, DETR), 'classify' (image classification)
// NOTE: yolos-tiny, BLIP/GIT captioning, and CLIP zero-shot are currently NOT available
// on HF's free "hf-inference" serverless provider (verified directly) — only these two
// models responded successfully as of this integration.
const MODELS = {
  detect: 'facebook/detr-resnet-50',
  classify: 'google/vit-base-patch16-224',
}

const TRANSLATIONS: Record<string, string> = {
  person: 'persona', bicycle: 'bicicleta', car: 'carro', motorcycle: 'motocicleta',
  airplane: 'avión', bus: 'autobús', train: 'tren', truck: 'camión', boat: 'barco',
  bird: 'pájaro', cat: 'gato', dog: 'perro', horse: 'caballo', sheep: 'oveja',
  cow: 'vaca', elephant: 'elefante', bear: 'oso', zebra: 'cebra', giraffe: 'jirafa',
  backpack: 'mochila', umbrella: 'paraguas', handbag: 'bolso', bottle: 'botella',
  cup: 'taza', chair: 'silla', couch: 'sofá', bed: 'cama', tv: 'televisión',
  laptop: 'laptop', 'cell phone': 'celular', book: 'libro', clock: 'reloj',
}

function translate(label: string) {
  const key = label.toLowerCase().trim()
  return TRANSLATIONS[key] || label
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'HUGGINGFACE_API_KEY no está configurada todavía en el servidor.' },
      { status: 503 }
    )
  }

  try {
    const { image, task } = await req.json()
    const model = MODELS[task as keyof typeof MODELS]
    if (!image || !model) {
      return NextResponse.json({ error: 'Parámetros inválidos (image, task requeridos)' }, { status: 400 })
    }

    // image is a data URL: data:image/jpeg;base64,xxxx
    const base64 = String(image).split(',')[1] || image
    const bytes = Buffer.from(base64, 'base64')

    const hfRes = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'image/jpeg',
      },
      body: bytes,
      signal: AbortSignal.timeout(30000),
    })

    if (!hfRes.ok) {
      const text = await hfRes.text()
      const isLoading = hfRes.status === 503
      return NextResponse.json(
        {
          error: isLoading
            ? 'El modelo se está iniciando en Hugging Face (primera llamada tarda ~20s). Intenta de nuevo en unos segundos.'
            : `Error de Hugging Face: ${text.slice(0, 200)}`,
        },
        { status: isLoading ? 503 : 502 }
      )
    }

    const data = await hfRes.json()

    if (task === 'detect') {
      const detections = (Array.isArray(data) ? data : [])
        .filter((d: any) => d.score > 0.5)
        .map((d: any) => ({
          label: translate(d.label),
          score: d.score,
          box: d.box, // { xmin, ymin, xmax, ymax }
        }))
      return NextResponse.json({ task, detections })
    }

    if (task === 'classify') {
      const predictions = (Array.isArray(data) ? data : [])
        .slice(0, 5)
        .map((p: any) => ({ label: translate(p.label.split(',')[0]), score: p.score }))
      return NextResponse.json({ task, predictions })
    }

    return NextResponse.json({ task, raw: data })
  } catch (err: any) {
    const detail = err?.cause?.message || err?.cause?.code || err?.message || 'Error inesperado'
    console.error('[hf-vision]', err)
    return NextResponse.json({ error: detail }, { status: 500 })
  }
}
