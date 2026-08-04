'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Camera, Upload, Tag, Palette, Target, Trophy, Loader2,
  Plus, Trash2, Download, RotateCcw, Eye, EyeOff, Play,
  CheckCircle2, X, Sparkles, Brain, Cpu, ChevronRight,
  Square, MousePointer2, Layers, Crosshair, ImageIcon,
  Timer, Star, Zap, Award, Info, Video, VideoOff, Cloud,
  ScanSearch, AlertTriangle, GraduationCap, PersonStanding, Mic, Crosshair as YoloIcon, Box
} from 'lucide-react'
import dynamic from 'next/dynamic'

const TeachableMachine = dynamic(() => import('./TeachableMachine'), { ssr: false })
const PoseGame = dynamic(() => import('./PoseGame'), { ssr: false })
const VoiceLab = dynamic(() => import('./VoiceLab'), { ssr: false })
const YoloLive = dynamic(() => import('./YoloLive'), { ssr: false })
const CadGenerator = dynamic(() => import('./CadGenerator'), { ssr: false })

// ============================================================
// TYPES
// ============================================================
interface Annotation {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  color: string
}

interface SegmentResult {
  mask: ImageData | null
  color: [number, number, number]
  pixelCount: number
  percentage: number
}

type LabMode = 'annotator' | 'segmentation' | 'challenge' | 'live' | 'cloud' | 'teach' | 'pose' | 'voice' | 'yolo' | 'cad'

const TRANSLATIONS: Record<string, string> = {
  person: 'persona', bicycle: 'bicicleta', car: 'carro', motorcycle: 'motocicleta',
  airplane: 'avión', bus: 'autobús', train: 'tren', truck: 'camión', boat: 'barco',
  bird: 'pájaro', cat: 'gato', dog: 'perro', horse: 'caballo', sheep: 'oveja',
  cow: 'vaca', elephant: 'elefante', bear: 'oso', zebra: 'cebra', giraffe: 'jirafa',
  backpack: 'mochila', umbrella: 'paraguas', handbag: 'bolso', bottle: 'botella',
  cup: 'taza', chair: 'silla', couch: 'sofá', bed: 'cama', tv: 'televisión',
  laptop: 'laptop', 'cell phone': 'celular', book: 'libro', clock: 'reloj',
  keyboard: 'teclado', mouse: 'mouse', 'remote': 'control remoto',
}
function translateLabel(label: string) {
  const key = label.toLowerCase().trim()
  return TRANSLATIONS[key] || label
}

type CloudTask = 'detect' | 'classify'
interface CloudDetection { label: string; score: number; box: { xmin: number; ymin: number; xmax: number; ymax: number } }

// ============================================================
// CONSTANTS
// ============================================================
const ANNOTATION_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F97316', '#06B6D4', '#84CC16', '#6366F1'
]

const LABEL_SUGGESTIONS = [
  'persona', 'carro', 'perro', 'gato', 'silla', 'mesa',
  'computadora', 'telefono', 'libro', 'mochila', 'botella',
  'planta', 'reloj', 'pelota', 'zapato', 'lampara'
]

const CHALLENGE_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=640', expectedObjects: ['gato'], hint: 'Animal doméstico peludo' },
  { url: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=640', expectedObjects: ['gato'], hint: 'Felino con bigotes' },
  { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=640', expectedObjects: ['perro'], hint: 'El mejor amigo del hombre' },
  { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640', expectedObjects: ['carro'], hint: 'Vehículo de 4 ruedas' },
]

// ============================================================
// MAIN COMPONENT
// ============================================================
interface AILabProps {
  initialMode?: LabMode
  hideTabs?: boolean
}

export default function AILab({ initialMode = 'annotator', hideTabs = false }: AILabProps = {}) {
  const [mode, setMode] = useState<LabMode>(initialMode)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── ANNOTATOR STATE ────────────────────────────────────
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isDrawingBox, setIsDrawingBox] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [currentBox, setCurrentBox] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [showLabels, setShowLabels] = useState(true)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const annotatorCanvasRef = useRef<HTMLCanvasElement>(null)
  const annotatorImgRef = useRef<HTMLImageElement | null>(null)

  // ─── SEGMENTATION STATE ─────────────────────────────────
  const [segments, setSegments] = useState<SegmentResult[]>([])
  const [tolerance, setTolerance] = useState(30)
  const [showMask, setShowMask] = useState(true)
  const segCanvasRef = useRef<HTMLCanvasElement>(null)
  const segMaskCanvasRef = useRef<HTMLCanvasElement>(null)
  const segImgRef = useRef<HTMLImageElement | null>(null)

  // ─── CHALLENGE STATE ────────────────────────────────────
  const [challengeStep, setChallengeStep] = useState<'ready' | 'looking' | 'guessing' | 'result'>('ready')
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [guesses, setGuesses] = useState<string[]>([])
  const [guessInput, setGuessInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(5)
  const [score, setScore] = useState(0)
  const [totalPlayed, setTotalPlayed] = useState(0)
  const challengeImgRef = useRef<HTMLImageElement | null>(null)

  // ─── LIVE VISION STATE (real COCO-SSD via webcam) ───────
  const [cameraActive, setCameraActive] = useState(false)
  const [cocoLoading, setCocoLoading] = useState(false)
  const [cocoError, setCocoError] = useState<string | null>(null)
  const [liveDetections, setLiveDetections] = useState<{ class: string; score: number; bbox: number[] }[]>([])
  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const liveCanvasRef = useRef<HTMLCanvasElement>(null)
  const cocoModelRef = useRef<any>(null)
  const liveAnimRef = useRef<number>(0)

  const loadCocoModel = async () => {
    if (cocoModelRef.current) return cocoModelRef.current
    setCocoLoading(true)
    setCocoError(null)
    try {
      const tf = await import('@tensorflow/tfjs')
      await tf.ready()
      const cocoSsd = await import('@tensorflow-models/coco-ssd')
      cocoModelRef.current = await cocoSsd.load()
      return cocoModelRef.current
    } catch {
      setCocoError('No se pudo cargar el modelo de detección')
      return null
    } finally {
      setCocoLoading(false)
    }
  }

  const startLiveCamera = async () => {
    setCocoError(null)
    const model = await loadCocoModel()
    if (!model) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640, height: 480 } })
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream
        liveVideoRef.current.onloadedmetadata = () => {
          liveVideoRef.current?.play()
          setCameraActive(true)
          runLiveDetectionLoop()
        }
      }
    } catch {
      setCocoError('No se pudo acceder a la cámara (verifica permisos del navegador)')
    }
  }

  const stopLiveCamera = () => {
    const stream = liveVideoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach(t => t.stop())
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null
    setCameraActive(false)
    cancelAnimationFrame(liveAnimRef.current)
    setLiveDetections([])
  }

  const runLiveDetectionLoop = () => {
    const video = liveVideoRef.current
    const canvas = liveCanvasRef.current
    if (!video || !canvas || !cocoModelRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const tick = async () => {
      if (!video.paused && !video.ended && cocoModelRef.current) {
        try {
          const predictions = await cocoModelRef.current.detect(video)
          setLiveDetections(predictions.map((p: any) => ({ class: p.class, score: p.score, bbox: p.bbox })))
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(video, 0, 0)
          predictions.forEach((pred: any) => {
            const [x, y, w, h] = pred.bbox
            const label = translateLabel(pred.class)
            ctx.strokeStyle = '#22D3EE'
            ctx.lineWidth = 3
            ctx.strokeRect(x, y, w, h)
            const text = `${label} ${Math.round(pred.score * 100)}%`
            ctx.font = 'bold 14px sans-serif'
            const tw = ctx.measureText(text).width + 12
            ctx.fillStyle = '#22D3EE'
            ctx.fillRect(x, y - 22, tw, 22)
            ctx.fillStyle = '#0a0a0f'
            ctx.fillText(text, x + 6, y - 6)
          })
        } catch {}
      }
      liveAnimRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  useEffect(() => stopLiveCamera, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── CLOUD AI STATE (Hugging Face Inference API) ────────
  const [cloudImage, setCloudImage] = useState<string | null>(null)
  const [cloudTask, setCloudTask] = useState<CloudTask>('detect')
  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudError, setCloudError] = useState<string | null>(null)
  const [cloudDetections, setCloudDetections] = useState<CloudDetection[]>([])
  const [cloudPredictions, setCloudPredictions] = useState<{ label: string; score: number }[]>([])
  const cloudFileInputRef = useRef<HTMLInputElement>(null)
  const cloudImgRef = useRef<HTMLImageElement | null>(null)
  const cloudCanvasRef = useRef<HTMLCanvasElement>(null)

  const runCloudTask = async (imageDataUrl: string, task: CloudTask) => {
    setCloudLoading(true)
    setCloudError(null)
    setCloudDetections([])
    setCloudPredictions([])
    try {
      const res = await fetch('/api/hf-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, task }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCloudError(data.error || 'Error consultando el modelo de IA')
        return
      }
      if (task === 'detect') setCloudDetections(data.detections || [])
      if (task === 'classify') setCloudPredictions(data.predictions || [])
    } catch {
      setCloudError('Error de conexión con el servidor')
    }
    setCloudLoading(false)
  }

  const handleCloudUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setCloudImage(dataUrl)
      runCloudTask(dataUrl, cloudTask)
    }
    reader.readAsDataURL(file)
  }

  // Draw detection boxes on the cloud-uploaded image
  useEffect(() => {
    if (mode !== 'cloud' || !cloudImage || cloudTask !== 'detect') return
    const canvas = cloudCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new window.Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      cloudDetections.forEach(d => {
        const { xmin, ymin, xmax, ymax } = d.box
        ctx.strokeStyle = '#F97316'
        ctx.lineWidth = 3
        ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin)
        const text = `${d.label} ${Math.round(d.score * 100)}%`
        ctx.font = 'bold 14px sans-serif'
        const tw = ctx.measureText(text).width + 12
        ctx.fillStyle = '#F97316'
        ctx.fillRect(xmin, ymin - 22, tw, 22)
        ctx.fillStyle = '#0a0a0f'
        ctx.fillText(text, xmin + 6, ymin - 6)
      })
    }
    img.src = cloudImage
  }, [cloudImage, cloudDetections, cloudTask, mode])

  // ─── IMAGE UPLOAD ───────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string)
      setAnnotations([])
      setSegments([])
    }
    reader.readAsDataURL(file)
  }

  // ─── ANNOTATOR: DRAW BOUNDING BOXES ─────────────────────
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = annotatorCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const handleAnnotatorMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e)
    setIsDrawingBox(true)
    setDrawStart(coords)
    setCurrentBox({ x: coords.x, y: coords.y, w: 0, h: 0 })
  }

  const handleAnnotatorMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingBox) return
    const coords = getCanvasCoords(e)
    setCurrentBox({
      x: Math.min(drawStart.x, coords.x),
      y: Math.min(drawStart.y, coords.y),
      w: Math.abs(coords.x - drawStart.x),
      h: Math.abs(coords.y - drawStart.y),
    })
  }

  const handleAnnotatorMouseUp = () => {
    if (!isDrawingBox) return
    setIsDrawingBox(false)
    if (currentBox.w > 10 && currentBox.h > 10) {
      const label = prompt('Nombre del objeto:') || 'objeto'
      const color = ANNOTATION_COLORS[annotations.length % ANNOTATION_COLORS.length]
      setAnnotations(prev => [...prev, {
        id: `ann-${Date.now()}`,
        ...currentBox,
        label,
        color,
      }])
    }
  }

  // Draw annotations on canvas
  useEffect(() => {
    if (mode !== 'annotator' || !uploadedImage) return
    const canvas = annotatorCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      annotatorImgRef.current = img

      // Draw existing annotations
      annotations.forEach(ann => {
        ctx.strokeStyle = ann.color
        ctx.lineWidth = 3
        ctx.strokeRect(ann.x, ann.y, ann.w, ann.h)

        if (showLabels) {
          ctx.fillStyle = ann.color
          const fontSize = Math.max(14, canvas.width / 40)
          ctx.font = `bold ${fontSize}px sans-serif`
          const textW = ctx.measureText(ann.label).width + 10
          ctx.fillRect(ann.x, ann.y - fontSize - 6, textW, fontSize + 6)
          ctx.fillStyle = '#fff'
          ctx.fillText(ann.label, ann.x + 5, ann.y - 5)
        }

        if (selectedAnnotation === ann.id) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 1
          ctx.setLineDash([5, 5])
          ctx.strokeRect(ann.x - 2, ann.y - 2, ann.w + 4, ann.h + 4)
          ctx.setLineDash([])
        }
      })

      // Draw current box being drawn
      if (isDrawingBox && currentBox.w > 0) {
        ctx.strokeStyle = ANNOTATION_COLORS[annotations.length % ANNOTATION_COLORS.length]
        ctx.lineWidth = 2
        ctx.setLineDash([8, 4])
        ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h)
        ctx.setLineDash([])
      }
    }
    img.src = uploadedImage
  }, [uploadedImage, annotations, showLabels, selectedAnnotation, isDrawingBox, currentBox, mode])

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
    if (selectedAnnotation === id) setSelectedAnnotation(null)
  }

  const exportAnnotations = () => {
    const data = {
      image: 'uploaded_image',
      width: annotatorCanvasRef.current?.width || 0,
      height: annotatorCanvasRef.current?.height || 0,
      annotations: annotations.map(a => ({
        label: a.label,
        bbox: [a.x, a.y, a.w, a.h],
        bbox_normalized: [
          a.x / (annotatorCanvasRef.current?.width || 1),
          a.y / (annotatorCanvasRef.current?.height || 1),
          a.w / (annotatorCanvasRef.current?.width || 1),
          a.h / (annotatorCanvasRef.current?.height || 1),
        ]
      }))
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'annotations.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── SEGMENTATION: COLOR-BASED ──────────────────────────
  const handleSegmentationClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = segCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const idx = (y * canvas.width + x) * 4
    const targetColor: [number, number, number] = [
      imageData.data[idx],
      imageData.data[idx + 1],
      imageData.data[idx + 2],
    ]

    // Create mask
    const maskCanvas = segMaskCanvasRef.current
    if (!maskCanvas) return
    maskCanvas.width = canvas.width
    maskCanvas.height = canvas.height
    const maskCtx = maskCanvas.getContext('2d')
    if (!maskCtx) return

    const maskData = maskCtx.createImageData(canvas.width, canvas.height)
    let matchCount = 0
    const totalPixels = canvas.width * canvas.height

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]
      const diff = Math.sqrt(
        (r - targetColor[0]) ** 2 +
        (g - targetColor[1]) ** 2 +
        (b - targetColor[2]) ** 2
      )
      if (diff <= tolerance) {
        maskData.data[i] = targetColor[0]
        maskData.data[i + 1] = targetColor[1]
        maskData.data[i + 2] = targetColor[2]
        maskData.data[i + 3] = 180
        matchCount++
      } else {
        maskData.data[i + 3] = 0
      }
    }

    maskCtx.putImageData(maskData, 0, 0)

    setSegments(prev => [...prev, {
      mask: maskData,
      color: targetColor,
      pixelCount: matchCount,
      percentage: (matchCount / totalPixels) * 100,
    }])
  }

  // Load image for segmentation
  useEffect(() => {
    if (mode !== 'segmentation' || !uploadedImage) return
    const canvas = segCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      segImgRef.current = img
    }
    img.src = uploadedImage
  }, [uploadedImage, mode])

  // ─── CHALLENGE: OBJECT GUESSING ─────────────────────────
  const startChallenge = () => {
    setChallengeStep('looking')
    setGuesses([])
    setGuessInput('')
    setTimeLeft(5)
    setChallengeIndex(Math.floor(Math.random() * CHALLENGE_IMAGES.length))
  }

  useEffect(() => {
    if (challengeStep !== 'looking') return
    if (timeLeft <= 0) {
      setChallengeStep('guessing')
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [challengeStep, timeLeft])

  const addGuess = () => {
    if (!guessInput.trim()) return
    setGuesses(prev => [...prev, guessInput.trim().toLowerCase()])
    setGuessInput('')
  }

  const submitGuesses = () => {
    const expected = CHALLENGE_IMAGES[challengeIndex].expectedObjects
    const correctGuesses = guesses.filter(g => 
      expected.some(e => g.includes(e) || e.includes(g))
    )
    const points = correctGuesses.length > 0 ? 10 * correctGuesses.length : 0
    setScore(prev => prev + points)
    setTotalPlayed(prev => prev + 1)
    setChallengeStep('result')
  }

  // Stop the webcam whenever the user leaves the "live" tab
  useEffect(() => {
    if (mode !== 'live') stopLiveCamera()
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── RENDER ─────────────────────────────────────────────
  const tabs = [
    { id: 'annotator' as LabMode, label: 'Anotador', icon: Tag, color: 'text-blue-400', desc: 'Etiqueta objetos en imágenes' },
    { id: 'segmentation' as LabMode, label: 'Segmentación', icon: Layers, color: 'text-purple-400', desc: 'Segmentación por color' },
    { id: 'challenge' as LabMode, label: 'Desafío IA', icon: Trophy, color: 'text-yellow-400', desc: 'Compite contra la IA' },
    { id: 'live' as LabMode, label: 'Visión en Vivo', icon: Video, color: 'text-cyan-400', desc: 'Detección real con tu cámara' },
    { id: 'cloud' as LabMode, label: 'IA en la Nube', icon: Cloud, color: 'text-orange-400', desc: 'Modelos de IA reales en la nube' },
    { id: 'yolo' as LabMode, label: 'YOLO en Vivo', icon: YoloIcon, color: 'text-rose-400', desc: 'Detección YOLO real en tu navegador' },
    { id: 'teach' as LabMode, label: 'Entrena tu IA', icon: GraduationCap, color: 'text-emerald-400', desc: 'Enseña tus propias categorías' },
    { id: 'pose' as LabMode, label: 'Postura Corporal', icon: PersonStanding, color: 'text-violet-400', desc: 'Detección de movimiento en vivo' },
    { id: 'voice' as LabMode, label: 'IA de Voz', icon: Mic, color: 'text-pink-400', desc: 'Transcripción y palabras clave' },
    { id: 'cad' as LabMode, label: 'Texto → 3D', icon: Box, color: 'text-rose-400', desc: 'Genera modelos 3D reales con IA' },
  ]

  return (
    <div className="bg-[#1e1e2e] rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#181825] via-[#1a1a2e] to-[#181825] border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <Image src="/chaski.png" alt="ChaskiBots" width={28} height={28} className="rounded-lg" />
          <div>
            <h2 className="text-white text-sm font-bold flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              Laboratorio de IA Visual
            </h2>
            <p className="text-[10px] text-gray-500">ChaskiBots Lab — Aprende Inteligencia Artificial</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> 10 Actividades
          </span>
        </div>
      </div>

      {/* ═══ TAB BAR ═══ */}
      {!hideTabs && <div className="flex bg-[#181825] border-b border-gray-700/50 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-medium transition-all border-b-2 whitespace-nowrap ${
                mode === tab.id
                  ? `${tab.color} border-current bg-white/5`
                  : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-[9px] opacity-60">{tab.desc}</div>
              </div>
            </button>
          )
        })}
      </div>}

      {/* ═══ CONTENT ═══ */}
      <div className="p-5">

        {/* ─── ANNOTATOR MODE ─── */}
        {mode === 'annotator' && (
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-300 text-sm font-bold">¿Qué es el etiquetado de imágenes?</h3>
                <p className="text-gray-400 text-xs mt-1">
                  El etiquetado es cómo los humanos enseñan a la IA a reconocer objetos. 
                  Dibuja cajas alrededor de los objetos y ponles nombre. 
                  Así es como se entrenan modelos como YOLO y COCO-SSD.
                </p>
              </div>
            </div>

            {!uploadedImage ? (
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
                <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Sube una imagen para empezar a anotar</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-4 h-4" /> Subir Imagen
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Canvas */}
                <div className="flex-1 min-w-0">
                  <div className="relative bg-black/50 rounded-xl overflow-hidden">
                    <canvas
                      ref={annotatorCanvasRef}
                      className="w-full h-auto cursor-crosshair"
                      onMouseDown={handleAnnotatorMouseDown}
                      onMouseMove={handleAnnotatorMouseMove}
                      onMouseUp={handleAnnotatorMouseUp}
                      onMouseLeave={() => setIsDrawingBox(false)}
                    />
                  </div>
                  {/* Toolbar */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-colors flex items-center gap-1.5">
                        <Upload className="w-3 h-3" /> Nueva Imagen
                      </button>
                      <button onClick={() => setShowLabels(!showLabels)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${showLabels ? 'bg-blue-600/30 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                        {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Etiquetas
                      </button>
                      <button onClick={() => setAnnotations([])} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg text-xs transition-colors flex items-center gap-1.5">
                        <RotateCcw className="w-3 h-3" /> Limpiar
                      </button>
                    </div>
                    {annotations.length > 0 && (
                      <button onClick={exportAnnotations} className="px-3 py-1.5 bg-green-600/80 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                        <Download className="w-3 h-3" /> Exportar ({annotations.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Annotations Panel */}
                <div className="w-64 bg-[#181825] rounded-xl p-3 space-y-3 flex-shrink-0">
                  <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    Anotaciones ({annotations.length})
                  </h4>
                  
                  {annotations.length === 0 ? (
                    <p className="text-gray-500 text-[11px] text-center py-4">
                      Dibuja cajas en la imagen para anotar objetos
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {annotations.map(ann => (
                        <div
                          key={ann.id}
                          onClick={() => setSelectedAnnotation(selectedAnnotation === ann.id ? null : ann.id)}
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                            selectedAnnotation === ann.id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-700/30 hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: ann.color }} />
                          <span className="text-gray-300 text-[11px] flex-1 truncate">{ann.label}</span>
                          <span className="text-[9px] text-gray-500">{Math.round(ann.w)}x{Math.round(ann.h)}</span>
                          <button onClick={(e) => { e.stopPropagation(); deleteAnnotation(ann.id) }} className="text-gray-600 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Labels */}
                  <div>
                    <h5 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Sugerencias</h5>
                    <div className="flex flex-wrap gap-1">
                      {LABEL_SUGGESTIONS.slice(0, 8).map(label => (
                        <span key={label} className="text-[9px] px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-gray-700/20 rounded-lg p-2.5">
                    <h5 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Estadísticas</h5>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div><span className="text-gray-500">Objetos:</span> <span className="text-white">{annotations.length}</span></div>
                      <div><span className="text-gray-500">Clases:</span> <span className="text-white">{new Set(annotations.map(a => a.label)).size}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── SEGMENTATION MODE ─── */}
        {mode === 'segmentation' && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-purple-300 text-sm font-bold">¿Qué es la segmentación?</h3>
                <p className="text-gray-400 text-xs mt-1">
                  La segmentación divide una imagen en regiones de píxeles similares. 
                  Haz clic en un color para ver qué área de la imagen comparte ese color. 
                  Los modelos como SAM y U-Net hacen esto automáticamente con redes neuronales.
                </p>
              </div>
            </div>

            {!uploadedImage ? (
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
                <Layers className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Sube una imagen para segmentar por color</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-4 h-4" /> Subir Imagen
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Canvases */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="relative bg-black/50 rounded-xl overflow-hidden">
                    <canvas
                      ref={segCanvasRef}
                      className="w-full h-auto cursor-crosshair"
                      onClick={handleSegmentationClick}
                    />
                    {showMask && (
                      <canvas
                        ref={segMaskCanvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-colors flex items-center gap-1.5">
                      <Upload className="w-3 h-3" /> Nueva
                    </button>
                    <button onClick={() => setShowMask(!showMask)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${showMask ? 'bg-purple-600/30 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                      {showMask ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Máscara
                    </button>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[10px] text-gray-500">Tolerancia:</span>
                      <input
                        type="range"
                        min={5}
                        max={80}
                        value={tolerance}
                        onChange={(e) => setTolerance(Number(e.target.value))}
                        className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none accent-purple-500"
                      />
                      <span className="text-[10px] text-purple-400 w-8">{tolerance}</span>
                    </div>
                    <button onClick={() => { setSegments([]); const mc = segMaskCanvasRef.current; if (mc) { const ctx = mc.getContext('2d'); ctx?.clearRect(0, 0, mc.width, mc.height) } }} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg text-xs transition-colors flex items-center gap-1.5">
                      <RotateCcw className="w-3 h-3" /> Limpiar
                    </button>
                  </div>
                </div>

                {/* Segments Panel */}
                <div className="w-64 bg-[#181825] rounded-xl p-3 space-y-3 flex-shrink-0">
                  <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    Segmentos ({segments.length})
                  </h4>

                  <p className="text-gray-500 text-[10px]">
                    Haz clic en la imagen para seleccionar un color y ver su segmento
                  </p>

                  {segments.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {segments.map((seg, idx) => (
                        <div key={idx} className="bg-gray-700/30 rounded-lg p-2.5 flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg border-2 border-gray-600 flex-shrink-0"
                            style={{ backgroundColor: `rgb(${seg.color[0]},${seg.color[1]},${seg.color[2]})` }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-gray-300 font-mono">
                              rgb({seg.color[0]}, {seg.color[1]}, {seg.color[2]})
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {seg.pixelCount.toLocaleString()} px ({seg.percentage.toFixed(1)}%)
                            </div>
                            <div className="h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(seg.percentage, 100)}%`,
                                  backgroundColor: `rgb(${seg.color[0]},${seg.color[1]},${seg.color[2]})`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Learning Info */}
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-2.5">
                    <h5 className="text-purple-300 text-[10px] font-bold mb-1">¿Sabías que?</h5>
                    <p className="text-gray-500 text-[10px] leading-relaxed">
                      Los modelos como SAM (Segment Anything) de Meta pueden segmentar cualquier objeto con un solo clic, usando redes neuronales entrenadas con millones de máscaras.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── CHALLENGE MODE ─── */}
        {mode === 'challenge' && (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-300 text-sm font-bold">Desafío: ¿Puedes ganarle a la IA?</h3>
                <p className="text-gray-400 text-xs mt-1">
                  Observa la imagen durante 5 segundos, luego adivina qué objetos viste. 
                  ¡Compite contra el detector de objetos de IA!
                </p>
              </div>
            </div>

            {/* Score Board */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-400">{score}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Puntos</div>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-black text-gray-300">{totalPlayed}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Rondas</div>
              </div>
            </div>

            {/* Challenge Area */}
            <div className="bg-[#181825] rounded-xl p-6 min-h-[350px] flex flex-col items-center justify-center">
              {challengeStep === 'ready' && (
                <div className="text-center space-y-4">
                  <Target className="w-16 h-16 text-yellow-500/50 mx-auto" />
                  <h3 className="text-white text-lg font-bold">¿Listo para el desafío?</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    Verás una imagen durante 5 segundos. Memoriza los objetos que ves y luego adivina.
                  </p>
                  <button
                    onClick={startChallenge}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Play className="w-4 h-4" /> Comenzar Ronda
                  </button>
                </div>
              )}

              {challengeStep === 'looking' && (
                <div className="text-center space-y-3 w-full">
                  <div className="flex items-center justify-center gap-2">
                    <Timer className="w-5 h-5 text-yellow-400" />
                    <span className="text-3xl font-black text-yellow-400">{timeLeft}</span>
                    <span className="text-gray-400 text-sm">segundos</span>
                  </div>
                  <p className="text-gray-400 text-xs">¡Memoriza los objetos!</p>
                  <div className="max-w-md mx-auto rounded-xl overflow-hidden bg-black/50">
                    <img
                      src={CHALLENGE_IMAGES[challengeIndex].url}
                      alt="Challenge"
                      className="w-full h-64 object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              )}

              {challengeStep === 'guessing' && (
                <div className="text-center space-y-4 w-full max-w-md">
                  <EyeOff className="w-10 h-10 text-gray-500 mx-auto" />
                  <h3 className="text-white text-lg font-bold">¿Qué objetos viste?</h3>
                  <p className="text-gray-400 text-xs">Pista: {CHALLENGE_IMAGES[challengeIndex].hint}</p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={guessInput}
                      onChange={(e) => setGuessInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addGuess()}
                      placeholder="Escribe un objeto..."
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:outline-none"
                    />
                    <button onClick={addGuess} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {guesses.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {guesses.map((g, i) => (
                        <span key={i} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs flex items-center gap-1">
                          {g}
                          <button onClick={() => setGuesses(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={submitGuesses}
                    disabled={guesses.length === 0}
                    className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 mx-auto"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verificar Respuestas
                  </button>
                </div>
              )}

              {challengeStep === 'result' && (
                <div className="text-center space-y-4 w-full max-w-md">
                  <div className="max-w-sm mx-auto rounded-xl overflow-hidden bg-black/50">
                    <img
                      src={CHALLENGE_IMAGES[challengeIndex].url}
                      alt="Result"
                      className="w-full h-48 object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-xl p-3">
                      <h4 className="text-yellow-400 text-xs font-bold mb-2 flex items-center gap-1 justify-center">
                        <MousePointer2 className="w-3 h-3" /> Tus respuestas
                      </h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {guesses.map((g, i) => {
                          const isCorrect = CHALLENGE_IMAGES[challengeIndex].expectedObjects.some(
                            e => g.includes(e) || e.includes(g)
                          )
                          return (
                            <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {isCorrect ? '✓' : '✗'} {g}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-3">
                      <h4 className="text-blue-400 text-xs font-bold mb-2 flex items-center gap-1 justify-center">
                        <Cpu className="w-3 h-3" /> La IA detectó
                      </h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {CHALLENGE_IMAGES[challengeIndex].expectedObjects.map((obj, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px]">
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setChallengeStep('ready') }}
                    className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-4 h-4" /> Otra Ronda
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ─── LIVE VISION MODE (real COCO-SSD via webcam) ─── */}
        {mode === 'live' && (
          <div className="space-y-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-cyan-300 text-sm font-bold">Detección de objetos en tiempo real</h3>
                <p className="text-gray-400 text-xs mt-1">
                  Este es un modelo de IA real corriendo en tu navegador (COCO-SSD, TensorFlow.js), no una simulación.
                  Apunta la cámara a objetos cotidianos y observa cómo la IA los reconoce al instante, cuadro por cuadro.
                </p>
              </div>
            </div>

            {cocoError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {cocoError}
              </div>
            )}

            <div className="relative bg-black/50 rounded-xl overflow-hidden max-w-2xl mx-auto">
              <video ref={liveVideoRef} className="hidden" playsInline muted />
              <canvas ref={liveCanvasRef} className="w-full" style={{ minHeight: 320 }} />
              {!cameraActive && !cocoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={startLiveCamera} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                    <Video className="w-4 h-4" /> Iniciar Cámara
                  </button>
                </div>
              )}
              {cocoLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-gray-300 text-xs">Cargando modelo de detección (~6MB, solo la primera vez)...</p>
                </div>
              )}
            </div>

            {cameraActive && (
              <div className="flex justify-center">
                <button onClick={stopLiveCamera} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2">
                  <VideoOff className="w-3.5 h-3.5" /> Detener cámara
                </button>
              </div>
            )}

            {liveDetections.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {liveDetections.map((d, i) => (
                  <span key={i} className="px-3 py-1 bg-cyan-500/15 text-cyan-300 rounded-full text-xs">
                    {translateLabel(d.class)} ({Math.round(d.score * 100)}%)
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── CLOUD AI MODE (Hugging Face Inference API) ─── */}
        {mode === 'cloud' && (
          <div className="space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-orange-300 text-sm font-bold">IA en la Nube — ChaskiBots</h3>
                <p className="text-gray-400 text-xs mt-1">
                  Sube una foto y elige qué quieres que la IA haga: detectar objetos con un modelo transformer real (DETR)
                  o clasificarla entre miles de categorías (ViT). Estos modelos corren en servidores especializados, no en tu navegador.
                </p>
              </div>
            </div>

            {/* Task selector */}
            <div className="flex gap-2 justify-center">
              {[
                { id: 'detect' as CloudTask, label: 'Detectar Objetos', icon: ScanSearch },
                { id: 'classify' as CloudTask, label: 'Clasificar', icon: Tag },
              ].map(t => {
                const Icon = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => { setCloudTask(t.id); if (cloudImage) runCloudTask(cloudImage, t.id) }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      cloudTask === t.id ? 'bg-orange-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                )
              })}
            </div>

            {!cloudImage ? (
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
                <Cloud className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Sube una imagen para analizarla con IA real</p>
                <button
                  onClick={() => cloudFileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-4 h-4" /> Subir Imagen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative bg-black/50 rounded-xl overflow-hidden max-w-xl mx-auto">
                  {cloudTask === 'detect' ? (
                    <canvas ref={cloudCanvasRef} className="w-full" />
                  ) : (
                    <img src={cloudImage} alt="Subida" className="w-full" />
                  )}
                  {cloudLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                      <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                      <p className="text-gray-300 text-xs">Consultando modelo de IA en la nube...</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button onClick={() => cloudFileInputRef.current?.click()} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-colors flex items-center gap-1.5">
                    <Upload className="w-3 h-3" /> Nueva Imagen
                  </button>
                </div>

                {cloudError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs flex items-center gap-2 max-w-xl mx-auto">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {cloudError}
                  </div>
                )}

                {!cloudLoading && cloudTask === 'detect' && cloudDetections.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {cloudDetections.map((d, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-500/15 text-orange-300 rounded-full text-xs">
                        {d.label} ({Math.round(d.score * 100)}%)
                      </span>
                    ))}
                  </div>
                )}

                {!cloudLoading && cloudTask === 'classify' && cloudPredictions.length > 0 && (
                  <div className="max-w-md mx-auto space-y-2">
                    {cloudPredictions.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400" style={{ width: `${p.score * 100}%` }} />
                        </div>
                        <span className="text-gray-300 text-xs w-28 truncate">{p.label}</span>
                        <span className="text-gray-500 text-xs w-10">{Math.round(p.score * 100)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <input ref={cloudFileInputRef} type="file" accept="image/*" onChange={handleCloudUpload} className="hidden" />
          </div>
        )}

        {/* ─── YOLO LIVE MODE ─── */}
        {mode === 'yolo' && <YoloLive />}

        {/* ─── TEACHABLE MACHINE MODE ─── */}
        {mode === 'teach' && <TeachableMachine />}

        {/* ─── POSE GAME MODE ─── */}
        {mode === 'pose' && <PoseGame />}

        {/* ─── VOICE LAB MODE ─── */}
        {mode === 'voice' && <VoiceLab />}

        {/* ─── CAD GENERATOR MODE ─── */}
        {mode === 'cad' && <CadGenerator />}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}
