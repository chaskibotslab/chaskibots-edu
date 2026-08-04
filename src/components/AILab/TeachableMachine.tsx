'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, Plus, Trash2, Play, Square, Loader2, Info, Sparkles, RotateCcw, X } from 'lucide-react'

interface ClassData {
  name: string
  count: number
}

export default function TeachableMachine() {
  const [classes, setClasses] = useState<ClassData[]>([{ name: 'Clase 1', count: 0 }, { name: 'Clase 2', count: 0 }])
  const [modelReady, setModelReady] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturingClass, setCapturingClass] = useState<number | null>(null)
  const [isPredicting, setIsPredicting] = useState(false)
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mobilenetRef = useRef<any>(null)
  const knnRef = useRef<any>(null)
  const captureIntervalRef = useRef<any>(null)
  const predictAnimRef = useRef<number>(0)

  const loadModel = async () => {
    if (mobilenetRef.current && knnRef.current) return true
    setModelLoading(true)
    setError(null)
    try {
      const tf = await import('@tensorflow/tfjs')
      await tf.ready()
      const mobilenetModule = await import('@tensorflow-models/mobilenet')
      const knnModule = await import('@tensorflow-models/knn-classifier')
      mobilenetRef.current = await mobilenetModule.load()
      knnRef.current = knnModule.create()
      setModelReady(true)
      return true
    } catch {
      setError('No se pudo cargar el modelo base (MobileNet)')
      return false
    } finally {
      setModelLoading(false)
    }
  }

  const startCamera = async () => {
    const ok = await loadModel()
    if (!ok) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraActive(true)
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
    setIsPredicting(false)
    cancelAnimationFrame(predictAnimRef.current)
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current)
  }

  const addClass = () => {
    if (classes.length >= 5) return
    setClasses(prev => [...prev, { name: `Clase ${prev.length + 1}`, count: 0 }])
  }

  const removeClass = (idx: number) => {
    if (classes.length <= 2) return
    setClasses(prev => prev.filter((_, i) => i !== idx))
  }

  const renameClass = (idx: number, name: string) => {
    setClasses(prev => prev.map((c, i) => (i === idx ? { ...c, name } : c)))
  }

  const captureOnce = useCallback((classIdx: number) => {
    if (!videoRef.current || !mobilenetRef.current || !knnRef.current) return
    const activation = mobilenetRef.current.infer(videoRef.current, true)
    knnRef.current.addExample(activation, classIdx)
    activation.dispose?.()
    setClasses(prev => prev.map((c, i) => (i === classIdx ? { ...c, count: c.count + 1 } : c)))
  }, [])

  const startCapturing = (classIdx: number) => {
    setCapturingClass(classIdx)
    captureOnce(classIdx)
    captureIntervalRef.current = setInterval(() => captureOnce(classIdx), 200)
  }

  const stopCapturing = () => {
    setCapturingClass(null)
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }
  }

  useEffect(() => stopCamera, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalSamples = classes.reduce((acc, c) => acc + c.count, 0)
  const canPredict = classes.every(c => c.count >= 3)

  const startPredicting = () => {
    setIsPredicting(true)
    const loop = async () => {
      if (videoRef.current && mobilenetRef.current && knnRef.current && knnRef.current.getNumClasses() > 0) {
        const activation = mobilenetRef.current.infer(videoRef.current, true)
        const result = await knnRef.current.predictClass(activation, 10)
        activation.dispose?.()
        const classIdx = Number(result.label)
        const confidence = result.confidences[result.label]
        setPrediction({ label: classes[classIdx]?.name || '?', confidence })
      }
      predictAnimRef.current = requestAnimationFrame(loop)
    }
    loop()
  }

  const stopPredicting = () => {
    setIsPredicting(false)
    cancelAnimationFrame(predictAnimRef.current)
    setPrediction(null)
  }

  const resetAll = () => {
    stopCamera()
    knnRef.current?.clearAllClasses()
    setClasses(prev => prev.map(c => ({ ...c, count: 0 })))
    setPrediction(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-emerald-300 text-sm font-bold">Entrena tu propia mini-IA</h3>
          <p className="text-gray-400 text-xs mt-1">
            Esto NO es una simulación: le vas a enseñar a un modelo real (MobileNet + un clasificador entrenado por ti,
            en vivo, en tu navegador) a reconocer tus propias categorías. Muéstrale ejemplos de cada clase con la cámara,
            y luego pruébalo.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs">{error}</div>
      )}

      {!cameraActive ? (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
          <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <button
            onClick={startCamera}
            disabled={modelLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            {modelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {modelLoading ? 'Cargando modelo base...' : 'Iniciar Cámara'}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Camera */}
          <div className="space-y-3">
            <div className="relative bg-black/50 rounded-xl overflow-hidden">
              <video ref={videoRef} className="w-full" playsInline muted />
              {capturingClass !== null && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full animate-pulse">
                  ● Capturando: {classes[capturingClass]?.name}
                </div>
              )}
              {isPredicting && prediction && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                  <div className="text-white text-sm font-bold">{prediction.label}</div>
                  <div className="h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${prediction.confidence * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={stopCamera} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs flex items-center gap-1.5">
                <X className="w-3 h-3" /> Cerrar cámara
              </button>
              <button onClick={resetAll} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" /> Reiniciar todo
              </button>
            </div>
          </div>

          {/* Classes + controls */}
          <div className="space-y-3">
            <div className="bg-[#181825] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-white text-xs font-bold">Tus categorías</h4>
                {classes.length < 5 && (
                  <button onClick={addClass} className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Agregar
                  </button>
                )}
              </div>
              {classes.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-700/30 rounded-lg p-2">
                  <input
                    value={c.name}
                    onChange={e => renameClass(idx, e.target.value)}
                    className="flex-1 bg-transparent text-gray-200 text-xs outline-none border-b border-transparent focus:border-emerald-500/50"
                  />
                  <span className="text-[10px] text-gray-500">{c.count} muestras</span>
                  <button
                    onMouseDown={() => startCapturing(idx)}
                    onMouseUp={stopCapturing}
                    onMouseLeave={stopCapturing}
                    onTouchStart={() => startCapturing(idx)}
                    onTouchEnd={stopCapturing}
                    disabled={isPredicting}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white rounded-md text-[10px] font-medium whitespace-nowrap"
                  >
                    Mantén para capturar
                  </button>
                  {classes.length > 2 && (
                    <button onClick={() => removeClass(idx)} className="text-gray-600 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-[10px] text-gray-500">Total: {totalSamples} muestras · mínimo 3 por categoría para predecir</p>
            </div>

            {!isPredicting ? (
              <button
                onClick={startPredicting}
                disabled={!canPredict}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> {canPredict ? 'Probar mi IA' : `Captura al menos 3 muestras por clase`}
              </button>
            ) : (
              <button onClick={stopPredicting} className="w-full px-4 py-2.5 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Square className="w-4 h-4" /> Detener predicción
              </button>
            )}

            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5">
              <p className="text-emerald-300 text-[10px] font-bold mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> ¿Cómo funciona?</p>
              <p className="text-gray-500 text-[10px] leading-relaxed">
                MobileNet convierte cada imagen en un vector de características. Tu clasificador (KNN) memoriza esos
                vectores por categoría, y al predecir busca cuáles ejemplos guardados se parecen más a lo que ve ahora.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
