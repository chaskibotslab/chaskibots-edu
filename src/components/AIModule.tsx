'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, Upload, Mic, MicOff, Volume2, Play, Square, Cpu, Sparkles, Palette, Music, Gamepad2, Shield, Terminal, Lock, Key, Brain } from 'lucide-react'

interface Detection {
  class: string
  score: number
  bbox: [number, number, number, number]
}

interface AIModuleProps {
  levelId?: string
}

// Configuración de IA por nivel educativo
const AI_CONFIG_BY_LEVEL: Record<string, {
  title: string
  description: string
  tabs: string[]
  features: string[]
}> = {
  'inicial-1': {
    title: 'IA para Pequeños Exploradores',
    description: 'Juegos y actividades con inteligencia artificial para niños de 3-4 años',
    tabs: ['voice', 'camera'],
    features: ['Reconocimiento de colores', 'Identificar animales', 'Escuchar y repetir']
  },
  'inicial-2': {
    title: 'IA Divertida',
    description: 'Experimenta con IA de forma segura y divertida',
    tabs: ['voice', 'camera'],
    features: ['Detectar objetos', 'Juegos de voz', 'Colores y formas']
  },
  'primero-egb': {
    title: 'Mis Primeros Pasos en IA',
    description: 'Aprende qué es la inteligencia artificial con ejemplos simples',
    tabs: ['camera', 'voice', 'upload'],
    features: ['Detectar objetos', 'Reconocimiento de voz', 'Clasificar imágenes']
  },
  'segundo-egb': {
    title: 'Explorando la IA',
    description: 'Descubre cómo las computadoras pueden ver y escuchar',
    tabs: ['camera', 'voice', 'upload'],
    features: ['Visión por computadora', 'Comandos de voz', 'Clasificación']
  },
  'tercero-egb': {
    title: 'IA en Acción',
    description: 'Usa modelos de IA para detectar y clasificar',
    tabs: ['camera', 'upload', 'voice'],
    features: ['COCO-SSD', 'MobileNet', 'Speech Recognition']
  },
  'default': {
    title: 'Inteligencia Artificial en Vivo',
    description: 'Experimenta con modelos de IA en tu navegador',
    tabs: ['camera', 'upload', 'voice'],
    features: ['Detección de objetos', 'Clasificación de imágenes', 'Reconocimiento de voz']
  }
}

interface AIActivity {
  id: string
  levelId: string
  activityName: string
  activityType: 'camera' | 'upload' | 'voice' | 'hacking'
  description: string
  difficulty: string
  icon: string
  enabled: boolean
}

export default function AIModule({ levelId }: AIModuleProps) {
  // Obtener configuración según el nivel (fallback)
  const config = AI_CONFIG_BY_LEVEL[levelId || ''] || AI_CONFIG_BY_LEVEL['default']
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'voice' | 'hacking'>('camera')
  
  // API activities state
  const [apiActivities, setApiActivities] = useState<AIActivity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStatus, setCameraStatus] = useState('Listo para iniciar.')
  const [cameraPerf, setCameraPerf] = useState('')
  const [lowCpu, setLowCpu] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const modelRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)

  // Upload state
  const [uploadResult, setUploadResult] = useState('Sin imagen aún.')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mobileNetRef = useRef<any>(null)

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [autoRead, setAutoRead] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState(0)
  const recognitionRef = useRef<any>(null)

  // Load activities from API
  useEffect(() => {
    async function loadActivities() {
      if (!levelId) {
        setActivitiesLoading(false)
        return
      }
      try {
        const response = await fetch(`/api/ai-activities?levelId=${levelId}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setApiActivities(data.filter((a: AIActivity) => a.enabled))
          }
        }
      } catch (error) {
        console.log('Using default AI config')
      }
      setActivitiesLoading(false)
    }
    loadActivities()
  }, [levelId])

  // Get available tabs from API activities or fallback
  const availableTabs = apiActivities.length > 0 
    ? Array.from(new Set(apiActivities.map(a => a.activityType)))
    : config.tabs

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
    }
    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = 'es-EC'
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let finalText = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalText += transcript + ' '
          }
        }
        if (finalText) {
          setVoiceText(prev => prev + finalText.trim() + '\n')
          if (autoRead) {
            speak(finalText.trim())
          }
        }
      }
    }
  }, [autoRead])

  const speak = (text: string) => {
    if (!text || typeof window === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(text)
    if (voices[selectedVoice]) {
      utterance.voice = voices[selectedVoice]
    }
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraStatus('Iniciando cámara...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360 },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
      setCameraStatus('Cargando modelo COCO-SSD...')
      
      // Load COCO-SSD model
      const cocoSsd = await import('@tensorflow-models/coco-ssd')
      modelRef.current = await cocoSsd.load()
      setCameraStatus('Modelo cargado. Detectando...')
      runDetection()
    } catch (error) {
      setCameraStatus('Error: no se pudo acceder a la cámara.')
      console.error(error)
    }
  }

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    setCameraActive(false)
    setCameraStatus('Cámara detenida.')
    setCameraPerf('')
  }

  const runDetection = useCallback(async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    let lastTime = performance.now()

    const detect = async () => {
      if (!modelRef.current || !videoRef.current?.srcObject) return

      const t0 = performance.now()
      const predictions: Detection[] = await modelRef.current.detect(videoRef.current)
      const t1 = performance.now()

      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      ctx.font = '13px system-ui, Arial'

      predictions.forEach((pred) => {
        const [x, y, w, h] = pred.bbox
        ctx.strokeStyle = '#00C853'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, w, h)

        const label = `${pred.class} ${(pred.score * 100).toFixed(1)}%`
        const textWidth = ctx.measureText(label).width + 10
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(x, Math.max(0, y - 20), textWidth, 20)
        ctx.fillStyle = '#fff'
        ctx.fillText(label, x + 5, Math.max(12, y - 6))
      })

      const infMs = (t1 - t0).toFixed(1)
      const fps = (1000 / (t1 - lastTime)).toFixed(1)
      lastTime = t1
      setCameraPerf(`Inferencia: ${infMs} ms | ~${fps} FPS`)

      const delay = lowCpu ? 300 : 0
      if (delay) {
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(detect)
        }, delay)
      } else {
        animationRef.current = requestAnimationFrame(detect)
      }
    }

    animationRef.current = requestAnimationFrame(detect)
  }, [lowCpu])

  // Upload functions
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadResult('Cargando modelo MobileNet...')
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    try {
      if (!mobileNetRef.current) {
        const mobilenet = await import('@tensorflow-models/mobilenet')
        mobileNetRef.current = await mobilenet.load()
      }

      const img = new Image()
      img.src = url
      img.onload = async () => {
        try {
          const predictions = await mobileNetRef.current.classify(img)
          if (predictions && predictions.length) {
            const best = predictions[0]
            setUploadResult(`${best.className} (${(best.probability * 100).toFixed(2)}%)`)
          } else {
            setUploadResult('No se pudo clasificar la imagen.')
          }
        } catch {
          setUploadResult('Error en clasificación.')
        }
      }
    } catch {
      setUploadResult('Error cargando el modelo.')
    }
  }

  // Voice functions
  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Reconocimiento de voz no soportado. Usa Chrome o Edge.')
      return
    }
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {}
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // Get activities for current tab
  const currentTabActivities = apiActivities.filter(a => a.activityType === activeTab)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header personalizado por nivel */}
      {levelId && (
        <div className="mb-6 p-4 bg-gradient-to-r from-neon-pink/10 to-neon-purple/10 border border-neon-pink/30 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-neon-pink" />
            <h3 className="text-lg font-bold text-white">{config.title}</h3>
          </div>
          <p className="text-gray-400 text-sm mb-3">{config.description}</p>
          {/* Mostrar actividades de API si existen */}
          {apiActivities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {apiActivities.map((activity) => (
                <span key={activity.id} className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-full">
                  {activity.activityName}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {config.features.map((feature, idx) => (
                <span key={idx} className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs - usar API si hay actividades, sino usar config */}
      <div className="flex gap-3 justify-center mb-6 flex-wrap">
        {availableTabs.includes('camera') && (
          <button
            onClick={() => setActiveTab('camera')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'camera' ? 'active' : ''}`}
          >
            <Camera className="w-4 h-4" />
            Cámara
          </button>
        )}
        {availableTabs.includes('upload') && (
          <button
            onClick={() => setActiveTab('upload')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'upload' ? 'active' : ''}`}
          >
            <Upload className="w-4 h-4" />
            Imagen
          </button>
        )}
        {availableTabs.includes('voice') && (
          <button
            onClick={() => setActiveTab('voice')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'voice' ? 'active' : ''}`}
          >
            <Mic className="w-4 h-4" />
            Voz
          </button>
        )}
        {availableTabs.includes('hacking') && (
          <button
            onClick={() => setActiveTab('hacking')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'hacking' ? 'active' : ''}`}
          >
            <Shield className="w-4 h-4" />
            Hacking Ético
          </button>
        )}
      </div>

      {/* Camera Panel */}
      {activeTab === 'camera' && (
        <div className="card animate-fadeIn">
          <h3 className="text-xl font-bold text-chaski-dark mb-4">
            Detección en vivo con la cámara (COCO-SSD)
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Instrucciones:</strong> Inicia la cámara, muestra un objeto y observa las cajas y etiquetas. 
              Activa "Bajo CPU" si notas lentitud.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="relative inline-block rounded-xl overflow-hidden bg-gray-900">
                <video
                  ref={videoRef}
                  width={480}
                  height={360}
                  autoPlay
                  playsInline
                  muted
                  className="rounded-xl border border-gray-300"
                />
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={360}
                  className="absolute left-0 top-0 pointer-events-none"
                />
              </div>
              <p className="font-bold text-chaski-dark mt-3">{cameraStatus}</p>
              <p className="text-sm text-gray-500">{cameraPerf}</p>
              
              <div className="flex flex-wrap gap-3 mt-4 items-center">
                <button onClick={startCamera} className="btn-primary flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Iniciar cámara
                </button>
                <button onClick={stopCamera} className="btn-secondary flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Detener
                </button>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={lowCpu}
                    onChange={(e) => setLowCpu(e.target.checked)}
                    className="rounded"
                  />
                  <Cpu className="w-4 h-4" />
                  Bajo CPU
                </label>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 mb-2">💡 Consejos</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Usa buena iluminación</li>
                <li>• Centra el objeto a 30-60 cm</li>
                <li>• Evita fondos muy brillantes</li>
                <li>• Mueve el objeto lentamente</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Upload Panel */}
      {activeTab === 'upload' && (
        <div className="card animate-fadeIn">
          <h3 className="text-xl font-bold text-chaski-dark mb-4">
            Clasificación de imagen (MobileNet)
          </h3>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700">
              Sube una imagen y verás la categoría con su nivel de confianza.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                         file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                         file:bg-chaski-blue file:text-white hover:file:bg-blue-700
                         cursor-pointer"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-4 max-w-full rounded-xl border border-gray-200"
                />
              )}
              <p className="font-bold text-chaski-dark mt-4">{uploadResult}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">📷 Tips para mejores resultados</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Evita fondos brillantes</li>
                <li>• Centra el objeto principal</li>
                <li>• Usa imágenes claras y nítidas</li>
                <li>• Un solo objeto por imagen funciona mejor</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Voice Panel */}
      {activeTab === 'voice' && (
        <div className="card animate-fadeIn">
          <h3 className="text-xl font-bold text-chaski-dark mb-4">
            Reconocimiento de voz y lectura
          </h3>
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700">
              Pulsa "Escuchar", habla claro; el texto aparecerá abajo. Con "Leer texto" el sistema lo pronuncia.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <button
              onClick={startListening}
              className={`btn-primary flex items-center gap-2 ${isListening ? 'animate-pulse-glow' : ''}`}
            >
              <Mic className="w-4 h-4" />
              Escuchar
            </button>
            <button onClick={stopListening} className="btn-secondary flex items-center gap-2">
              <MicOff className="w-4 h-4" />
              Detener
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRead}
                onChange={(e) => setAutoRead(e.target.checked)}
                className="rounded"
              />
              Leer en voz alta
            </label>
          </div>
          
          <textarea
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            rows={5}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chaski-accent focus:border-transparent"
            placeholder="Aquí aparecerá lo que dices..."
          />
          
          <div className="flex flex-wrap gap-3 mt-4 items-center">
            <button
              onClick={() => speak(voiceText)}
              className="btn-primary flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Leer texto
            </button>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg min-w-[260px]"
            >
              {voices.map((voice, i) => (
                <option key={i} value={i}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Recomendado: Chrome o Edge en escritorio o Android.
          </p>
        </div>
      )}

      {/* Hacking Ético Panel */}
      {activeTab === 'hacking' && (
        <div className="card animate-fadeIn">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-neon-orange" />
            Hacking Ético
          </h3>
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300">
              <strong>⚠️ Importante:</strong> El hacking ético se usa para mejorar la seguridad, 
              nunca para dañar sistemas ajenos. Siempre pide permiso antes de probar.
            </p>
          </div>
          
          {/* Actividades de Hacking desde API */}
          {currentTabActivities.length > 0 ? (
            <div className="space-y-4">
              {currentTabActivities.map((activity) => (
                <div key={activity.id} className="bg-dark-700/50 rounded-xl p-4 border border-dark-600 hover:border-neon-orange/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-neon-orange/20 rounded-lg flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-neon-orange" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{activity.activityName}</h4>
                      <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                        activity.difficulty === 'experto' ? 'bg-red-500/20 text-red-400' :
                        activity.difficulty === 'avanzado' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {activity.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-neon-orange" />
                  <h4 className="text-white font-semibold">Seguridad de Contraseñas</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Aprende a crear contraseñas seguras y entiende cómo funcionan los ataques de fuerza bruta.
                </p>
              </div>
              
              <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
                <div className="flex items-center gap-3 mb-3">
                  <Terminal className="w-5 h-5 text-neon-orange" />
                  <h4 className="text-white font-semibold">Línea de Comandos</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Domina la terminal y los comandos básicos de seguridad en sistemas.
                </p>
              </div>
              
              <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
                <div className="flex items-center gap-3 mb-3">
                  <Key className="w-5 h-5 text-neon-orange" />
                  <h4 className="text-white font-semibold">Criptografía Básica</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Entiende cómo funcionan los cifrados y la encriptación de datos.
                </p>
              </div>
              
              <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-neon-orange" />
                  <h4 className="text-white font-semibold">Pentesting Intro</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Introducción a las pruebas de penetración y auditoría de seguridad.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-dark-700/30 rounded-xl border border-dark-600">
            <h4 className="text-white font-semibold mb-2">🎯 Recursos Recomendados</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• <a href="https://tryhackme.com" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">TryHackMe</a> - Plataforma de aprendizaje interactivo</li>
              <li>• <a href="https://overthewire.org" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">OverTheWire</a> - Wargames para practicar</li>
              <li>• <a href="https://picoctf.org" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">PicoCTF</a> - CTF para principiantes</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
            <h4 className="text-white font-semibold mb-2">🔧 Proyecto: BadUSB con Digispark</h4>
            <p className="text-sm text-gray-400 mb-2">
              Crea tu propio dispositivo BadUSB usando un Digispark ATtiny85. Aprende sobre ataques de inyeccion de teclado.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-full">Digispark ATtiny85</span>
              <span className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-full">Arduino IDE</span>
              <span className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-full">Ducky Script</span>
            </div>
          </div>
        </div>
      )}

      {/* Seccion de Modelos de IA - Solo para niveles avanzados */}
      {levelId && ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'].includes(levelId) && (
        <div className="mt-8 card">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-neon-purple" />
            Aprende sobre Modelos de IA
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
                <h4 className="text-white font-semibold">YOLO (You Only Look Once)</h4>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Modelo de deteccion de objetos en tiempo real. Usado en vehiculos autonomos, vigilancia y robotica.
              </p>
              <a href="https://github.com/ultralytics/yolov5" target="_blank" rel="noopener noreferrer" 
                 className="text-neon-cyan text-sm hover:underline">Ver YOLOv5 en GitHub</a>
            </div>
            
            <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🧠</span>
                </div>
                <h4 className="text-white font-semibold">TensorFlow / TensorFlow Lite</h4>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Framework de Google para ML. TF Lite permite ejecutar modelos en dispositivos moviles y microcontroladores.
              </p>
              <a href="https://www.tensorflow.org/lite" target="_blank" rel="noopener noreferrer" 
                 className="text-neon-cyan text-sm hover:underline">Ver TensorFlow Lite</a>
            </div>
            
            <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📦</span>
                </div>
                <h4 className="text-white font-semibold">Edge Impulse</h4>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Plataforma para crear modelos de ML para dispositivos edge como ESP32, Arduino y Raspberry Pi.
              </p>
              <a href="https://edgeimpulse.com" target="_blank" rel="noopener noreferrer" 
                 className="text-neon-cyan text-sm hover:underline">Ir a Edge Impulse</a>
            </div>
            
            <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👁️</span>
                </div>
                <h4 className="text-white font-semibold">MediaPipe</h4>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Framework de Google para vision por computadora: deteccion de manos, poses, rostros en tiempo real.
              </p>
              <a href="https://google.github.io/mediapipe/" target="_blank" rel="noopener noreferrer" 
                 className="text-neon-cyan text-sm hover:underline">Ver MediaPipe</a>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 rounded-xl p-4 border border-neon-purple/30">
            <h4 className="text-white font-semibold mb-3">🚀 Hardware para Proyectos de IA</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-white font-medium text-sm">NVIDIA Jetson Nano</p>
                <p className="text-gray-500 text-xs">GPU para IA embebida, ideal para YOLO y vision</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-white font-medium text-sm">Raspberry Pi 4</p>
                <p className="text-gray-500 text-xs">Versatil, soporta TensorFlow Lite y OpenCV</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-white font-medium text-sm">ESP32-CAM</p>
                <p className="text-gray-500 text-xs">Economico, WiFi integrado, Edge Impulse</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
