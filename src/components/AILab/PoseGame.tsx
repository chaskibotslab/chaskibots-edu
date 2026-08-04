'use client'

import { useState, useRef, useEffect } from 'react'
import { Video, VideoOff, Loader2, Info, Trophy, AlertTriangle } from 'lucide-react'

const CONNECTIONS: [string, string][] = [
  ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'], ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'], ['left_hip', 'right_hip'], ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'], ['right_hip', 'right_knee'], ['right_knee', 'right_ankle'],
]

export default function PoseGame() {
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [challengeActive, setChallengeActive] = useState(false)
  const [challengeSuccess, setChallengeSuccess] = useState(false)
  const [score, setScore] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectorRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const successRef = useRef(false)

  const loadDetector = async () => {
    if (detectorRef.current) return detectorRef.current
    setLoading(true)
    setError(null)
    try {
      const tf = await import('@tensorflow/tfjs')
      await import('@tensorflow/tfjs-backend-webgl')
      await tf.ready()
      const poseDetection = await import('@tensorflow-models/pose-detection')
      detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      })
      return detectorRef.current
    } catch {
      setError('No se pudo cargar el modelo de detección de postura')
      return null
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    const detector = await loadDetector()
    if (!detector) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraActive(true)
          runLoop()
        }
      }
    } catch {
      setError('No se pudo acceder a la cámara')
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
    setChallengeActive(false)
    cancelAnimationFrame(animRef.current)
  }

  useEffect(() => stopCamera, []) // eslint-disable-line react-hooks/exhaustive-deps

  const runLoop = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !detectorRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const tick = async () => {
      if (!video.paused && !video.ended && detectorRef.current) {
        try {
          const poses = await detectorRef.current.estimatePoses(video)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(video, 0, 0)

          if (poses[0]) {
            const kp: Record<string, any> = {}
            poses[0].keypoints.forEach((p: any) => { kp[p.name] = p })

            // Draw skeleton
            ctx.strokeStyle = '#A78BFA'
            ctx.lineWidth = 3
            CONNECTIONS.forEach(([a, b]) => {
              const pa = kp[a], pb = kp[b]
              if (pa?.score > 0.4 && pb?.score > 0.4) {
                ctx.beginPath()
                ctx.moveTo(pa.x, pa.y)
                ctx.lineTo(pb.x, pb.y)
                ctx.stroke()
              }
            })
            poses[0].keypoints.forEach((p: any) => {
              if (p.score > 0.4) {
                ctx.fillStyle = '#22D3EE'
                ctx.beginPath()
                ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
                ctx.fill()
              }
            })

            // Challenge: raise both wrists above shoulders
            if (challengeActive) {
              const lw = kp['left_wrist'], rw = kp['right_wrist'], ls = kp['left_shoulder'], rs = kp['right_shoulder']
              const ok = lw?.score > 0.4 && rw?.score > 0.4 && ls?.score > 0.4 && rs?.score > 0.4 &&
                lw.y < ls.y && rw.y < rs.y
              if (ok && !successRef.current) {
                successRef.current = true
                setChallengeSuccess(true)
                setScore(s => s + 1)
                setTimeout(() => { successRef.current = false; setChallengeSuccess(false) }, 1500)
              }
            }
          }
        } catch {}
      }
      animRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  return (
    <div className="space-y-4">
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-violet-300 text-sm font-bold">Detección de postura corporal en tiempo real</h3>
          <p className="text-gray-400 text-xs mt-1">
            Un modelo real (MoveNet, de Google) encuentra 17 puntos clave de tu cuerpo — hombros, codos, muñecas,
            caderas, rodillas — analizando cada cuadro de video. Así funcionan los juegos de movimiento y los
            entrenadores de ejercicio con IA.
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
            <button onClick={startCamera} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium flex items-center gap-2">
              <Video className="w-4 h-4" /> Iniciar Cámara
            </button>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-gray-300 text-xs">Cargando modelo de postura...</p>
          </div>
        )}
        {challengeSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
            <span className="text-white text-2xl font-black">¡Bien! 🎉</span>
          </div>
        )}
      </div>

      {cameraActive && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={stopCamera} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium flex items-center gap-2">
            <VideoOff className="w-3.5 h-3.5" /> Detener
          </button>
          {!challengeActive ? (
            <button onClick={() => setChallengeActive(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" /> Reto: levanta ambas manos
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/15 text-violet-300 rounded-lg text-xs font-medium">
              <Trophy className="w-3.5 h-3.5" /> Puntos: {score}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
