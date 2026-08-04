'use client'

import { useState, useRef, useEffect } from 'react'
import { Video, VideoOff, Loader2, Info, AlertTriangle } from 'lucide-react'

const MODEL_SIZE = 640

const COCO_LABELS = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
  'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
  'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
  'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
  'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
  'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
  'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book',
  'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush',
]

const TRANSLATIONS: Record<string, string> = {
  person: 'persona', bicycle: 'bicicleta', car: 'carro', motorcycle: 'motocicleta', airplane: 'avión',
  bus: 'autobús', train: 'tren', truck: 'camión', boat: 'barco', bird: 'pájaro', cat: 'gato', dog: 'perro',
  horse: 'caballo', sheep: 'oveja', cow: 'vaca', elephant: 'elefante', bear: 'oso', zebra: 'cebra',
  giraffe: 'jirafa', backpack: 'mochila', umbrella: 'paraguas', handbag: 'bolso', bottle: 'botella',
  cup: 'taza', chair: 'silla', couch: 'sofá', bed: 'cama', tv: 'televisión', laptop: 'laptop',
  'cell phone': 'celular', book: 'libro', clock: 'reloj', 'sports ball': 'pelota', pizza: 'pizza',
  banana: 'banana', apple: 'manzana', keyboard: 'teclado', mouse: 'mouse', scissors: 'tijeras',
}
const translate = (l: string) => TRANSLATIONS[l] || l

interface Detection { label: string; score: number; x: number; y: number; w: number; h: number }

declare global {
  interface Window {
    ort: any
  }
}

const ORT_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/'

function loadOrtScript(): Promise<any> {
  if (window.ort) return Promise.resolve(window.ort)
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-ort]')) {
      const check = setInterval(() => {
        if (window.ort) { clearInterval(check); resolve(window.ort) }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.src = ORT_CDN + 'ort.min.js'
    script.dataset.ort = 'true'
    script.onload = () => resolve(window.ort)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function YoloLive() {
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [detections, setDetections] = useState<Detection[]>([])
  const [inferMs, setInferMs] = useState<number | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const netSessionRef = useRef<any>(null)
  const nmsSessionRef = useRef<any>(null)
  const ortRef = useRef<any>(null)
  const runningRef = useRef(false)

  const loadModel = async () => {
    if (netSessionRef.current && nmsSessionRef.current) return true
    setLoading(true)
    setError(null)
    try {
      setLoadingMsg('Cargando motor de inferencia...')
      const ort = await loadOrtScript()
      ortRef.current = ort
      ort.env.wasm.wasmPaths = ORT_CDN
      ort.env.wasm.numThreads = 1

      setLoadingMsg('Descargando modelo YOLO (~13MB, solo la primera vez)...')
      netSessionRef.current = await ort.InferenceSession.create('/models/yolov8n.onnx')
      setLoadingMsg('Cargando módulo de post-procesamiento...')
      nmsSessionRef.current = await ort.InferenceSession.create('/models/nms-yolov8.onnx')
      return true
    } catch (err) {
      console.error('[YoloLive] load error', err)
      setError('No se pudo cargar el modelo YOLO. Verifica tu conexión e intenta de nuevo.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    const ok = await loadModel()
    if (!ok) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 480, height: 480 } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraActive(true)
          runningRef.current = true
          detectLoop()
        }
      }
    } catch {
      setError('No se pudo acceder a la cámara')
    }
  }

  const stopCamera = () => {
    runningRef.current = false
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
    setDetections([])
  }

  // Letterbox preprocessing: pad video frame to a square, scale to MODEL_SIZE.
  // scale = MODEL_SIZE / max(origW, origH). Boxes are decoded back with origCoord = modelCoord / scale.
  const preprocess = (video: HTMLVideoElement) => {
    const origW = video.videoWidth
    const origH = video.videoHeight
    const maxSize = Math.max(origW, origH)
    const scale = MODEL_SIZE / maxSize

    const squareCanvas = document.createElement('canvas')
    squareCanvas.width = MODEL_SIZE
    squareCanvas.height = MODEL_SIZE
    const ctx = squareCanvas.getContext('2d')!
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, MODEL_SIZE, MODEL_SIZE)
    ctx.drawImage(video, 0, 0, origW, origH, 0, 0, origW * scale, origH * scale)

    const { data } = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE)
    const size = MODEL_SIZE * MODEL_SIZE
    const float32 = new Float32Array(3 * size)
    for (let i = 0; i < size; i++) {
      float32[i] = data[i * 4] / 255
      float32[size + i] = data[i * 4 + 1] / 255
      float32[2 * size + i] = data[i * 4 + 2] / 255
    }
    return { float32, scale }
  }

  const detectOnce = async () => {
    const video = videoRef.current
    const ort = ortRef.current
    if (!video || !ort || !netSessionRef.current || !nmsSessionRef.current) return

    const t0 = performance.now()
    const { float32, scale } = preprocess(video)
    const inputTensor = new ort.Tensor('float32', float32, [1, 3, MODEL_SIZE, MODEL_SIZE])

    const netOutput = await netSessionRef.current.run({ images: inputTensor })
    const output0 = netOutput[Object.keys(netOutput)[0]]

    const configTensor = new ort.Tensor('float32', new Float32Array([100, 0.45, 0.35]))
    const nmsOutput = await nmsSessionRef.current.run({ detection: output0, config: configTensor })
    const selected = nmsOutput[Object.keys(nmsOutput)[0]]

    const results: Detection[] = []
    const numBoxes = selected.dims[1]
    const rowLen = selected.dims[2]
    for (let i = 0; i < numBoxes; i++) {
      const row = selected.data.slice(i * rowLen, (i + 1) * rowLen)
      const [cx, cy, w, h] = [row[0], row[1], row[2], row[3]]
      const classScores = row.slice(4)
      let bestScore = 0, bestIdx = 0
      for (let c = 0; c < classScores.length; c++) {
        if (classScores[c] > bestScore) { bestScore = classScores[c]; bestIdx = c }
      }
      if (bestScore < 0.3) continue
      results.push({
        label: translate(COCO_LABELS[bestIdx] || `clase_${bestIdx}`),
        score: bestScore,
        x: (cx - w / 2) / scale,
        y: (cy - h / 2) / scale,
        w: w / scale,
        h: h / scale,
      })
    }
    setInferMs(Math.round(performance.now() - t0))
    setDetections(results)

    // Draw
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)
      results.forEach(d => {
        ctx.strokeStyle = '#F43F5E'
        ctx.lineWidth = 3
        ctx.strokeRect(d.x, d.y, d.w, d.h)
        const text = `${d.label} ${Math.round(d.score * 100)}%`
        ctx.font = 'bold 14px sans-serif'
        const tw = ctx.measureText(text).width + 12
        ctx.fillStyle = '#F43F5E'
        ctx.fillRect(d.x, d.y - 22, tw, 22)
        ctx.fillStyle = '#fff'
        ctx.fillText(text, d.x + 6, d.y - 6)
      })
    }
  }

  useEffect(() => stopCamera, []) // eslint-disable-line react-hooks/exhaustive-deps

  const detectLoop = async () => {
    while (runningRef.current && videoRef.current && !videoRef.current.paused) {
      try {
        await detectOnce()
      } catch (err) {
        console.error('[YoloLive] detect error', err)
      }
      // Throttle: WASM inference is heavier than WebGL TF.js models, avoid pegging the CPU.
      await new Promise(r => setTimeout(r, 250))
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-rose-300 text-sm font-bold">YOLO real, corriendo en tu navegador</h3>
          <p className="text-gray-400 text-xs mt-1">
            YOLOv8 es una de las arquitecturas de detección de objetos más usadas en la industria (autos autónomos,
            drones, robótica). Corre 100% en tu dispositivo — nada se envía a un servidor.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="relative bg-black/50 rounded-xl overflow-hidden max-w-xl mx-auto">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full" style={{ minHeight: 320 }} />
        {!cameraActive && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={startCamera} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium flex items-center gap-2">
              <Video className="w-4 h-4" /> Iniciar YOLO
            </button>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 px-4 text-center">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            <p className="text-gray-300 text-xs">{loadingMsg}</p>
          </div>
        )}
      </div>

      {cameraActive && (
        <div className="flex flex-col items-center gap-2">
          <button onClick={stopCamera} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium flex items-center gap-2">
            <VideoOff className="w-3.5 h-3.5" /> Detener
          </button>
          {inferMs !== null && <p className="text-gray-500 text-[10px]">Inferencia: {inferMs}ms por cuadro</p>}
          {detections.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {detections.map((d, i) => (
                <span key={i} className="px-3 py-1 bg-rose-500/15 text-rose-300 rounded-full text-xs">
                  {d.label} ({Math.round(d.score * 100)}%)
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
