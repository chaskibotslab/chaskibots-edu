'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Camera, CameraOff, Upload, Pencil, Trash2, Loader2, Eye, Sparkles,
  Terminal, Lock, Key, Wifi, Shield, Code, Copy, Check, ChevronRight,
  Play, RotateCcw, Cpu, Zap, Hash
} from 'lucide-react'

interface AIVisionProps {
  levelId: string
}

interface Detection {
  class: string
  score: number
  bbox: number[]
}

interface Prediction {
  className: string
  probability: number
}

const TRANSLATIONS: Record<string, string> = {
  'person': 'persona', 'bicycle': 'bicicleta', 'car': 'carro', 'motorcycle': 'motocicleta',
  'airplane': 'avion', 'bus': 'autobus', 'train': 'tren', 'truck': 'camion', 'boat': 'barco',
  'bird': 'pajaro', 'cat': 'gato', 'dog': 'perro', 'horse': 'caballo', 'sheep': 'oveja',
  'cow': 'vaca', 'elephant': 'elefante', 'bear': 'oso', 'zebra': 'cebra', 'giraffe': 'jirafa',
  'backpack': 'mochila', 'umbrella': 'paraguas', 'handbag': 'bolso', 'tie': 'corbata',
  'bottle': 'botella', 'cup': 'taza', 'fork': 'tenedor', 'knife': 'cuchillo', 'spoon': 'cuchara',
  'banana': 'banana', 'apple': 'manzana', 'sandwich': 'sandwich', 'orange': 'naranja',
  'pizza': 'pizza', 'donut': 'dona', 'cake': 'pastel', 'chair': 'silla', 'couch': 'sofa',
  'bed': 'cama', 'tv': 'television', 'laptop': 'laptop', 'mouse': 'mouse', 'keyboard': 'teclado',
  'cell phone': 'celular', 'book': 'libro', 'clock': 'reloj', 'scissors': 'tijeras',
}

const DRAWABLE_ITEMS = [
  'sol', 'luna', 'estrella', 'casa', 'arbol', 'flor', 'carro', 'gato', 'perro', 
  'pajaro', 'pez', 'manzana', 'corazon', 'nube', 'montaña', 'barco', 'avion'
]

export default function AIVision({ levelId }: AIVisionProps) {
  const [activeMode, setActiveMode] = useState<'camera' | 'draw' | 'upload' | 'hacking' | 'badusb' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Camera
  const [cameraActive, setCameraActive] = useState(false)
  const [detections, setDetections] = useState<Detection[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cocoModelRef = useRef<any>(null)
  const animationRef = useRef<number>(0)
  
  // Drawing
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [targetItem, setTargetItem] = useState('')
  const [drawScore, setDrawScore] = useState(0)
  const [drawFeedback, setDrawFeedback] = useState<string | null>(null)
  const [strokes, setStrokes] = useState<number[][][]>([])
  const [currentStroke, setCurrentStroke] = useState<number[][]>([])
  
  // Image upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imagePredictions, setImagePredictions] = useState<Prediction[]>([])
  const mobileNetRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Hacking simulators
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['$ Bienvenido al simulador de terminal'])
  const [terminalInput, setTerminalInput] = useState('')
  const [encryptText, setEncryptText] = useState('')
  const [encryptedResult, setEncryptedResult] = useState('')
  const [encryptShift, setEncryptShift] = useState(3)
  const [passwordToCheck, setPasswordToCheck] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<any>(null)
  
  // BadUSB
  const [badusbStep, setBadusbStep] = useState(0)
  const [copiedCode, setCopiedCode] = useState(false)

  const isAdvancedLevel = ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'].includes(levelId)
  const isBachillerato = ['primero-bach', 'segundo-bach', 'tercero-bach'].includes(levelId)

  // Camera functions
  const loadCocoModel = async () => {
    if (cocoModelRef.current) return cocoModelRef.current
    setIsLoading(true)
    setLoadingMessage('Cargando modelo de deteccion...')
    try {
      const tf = await import('@tensorflow/tfjs')
      await tf.ready()
      const cocoSsd = await import('@tensorflow-models/coco-ssd')
      cocoModelRef.current = await cocoSsd.load()
      setIsLoading(false)
      return cocoModelRef.current
    } catch (err) {
      setError('Error cargando modelo')
      setIsLoading(false)
      return null
    }
  }

  const loadMobileNet = async () => {
    if (mobileNetRef.current) return mobileNetRef.current
    setIsLoading(true)
    setLoadingMessage('Cargando modelo de clasificacion...')
    try {
      const tf = await import('@tensorflow/tfjs')
      await tf.ready()
      const mobilenet = await import('@tensorflow-models/mobilenet')
      mobileNetRef.current = await mobilenet.load()
      setIsLoading(false)
      return mobileNetRef.current
    } catch (err) {
      setError('Error cargando modelo')
      setIsLoading(false)
      return null
    }
  }

  const startCamera = async () => {
    setError(null)
    const model = await loadCocoModel()
    if (!model) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraActive(true)
          detectObjects()
        }
      }
    } catch (err) {
      setError('No se pudo acceder a la camara')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    cancelAnimationFrame(animationRef.current)
    setDetections([])
  }

  const detectObjects = async () => {
    if (!videoRef.current || !canvasRef.current || !cocoModelRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const detect = async () => {
      if (!video.paused && !video.ended && cocoModelRef.current) {
        try {
          const predictions = await cocoModelRef.current.detect(video)
          setDetections(predictions.map((p: any) => ({ class: p.class, score: p.score, bbox: p.bbox })))
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(video, 0, 0)
          predictions.forEach((pred: any) => {
            const [x, y, width, height] = pred.bbox
            const label = TRANSLATIONS[pred.class] || pred.class
            ctx.strokeStyle = '#00FFFF'
            ctx.lineWidth = 3
            ctx.strokeRect(x, y, width, height)
            ctx.fillStyle = '#00FFFF'
            ctx.fillRect(x, y - 25, label.length * 10 + 50, 25)
            ctx.fillStyle = '#000'
            ctx.font = 'bold 14px Arial'
            ctx.fillText(label + ' ' + Math.round(pred.score * 100) + '%', x + 5, y - 8)
          })
        } catch (err) {}
      }
      animationRef.current = requestAnimationFrame(detect)
    }
    detect()
  }

  // Drawing functions
  const startDrawGame = () => {
    const item = DRAWABLE_ITEMS[Math.floor(Math.random() * DRAWABLE_ITEMS.length)]
    setTargetItem(item)
    setDrawFeedback(null)
    setStrokes([])
    setCurrentStroke([])
    clearDrawCanvas()
  }

  const clearDrawCanvas = () => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const { x, y } = getCanvasCoords(e)
    setCurrentStroke([[x, y]])
    
    const canvas = drawCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const { x, y } = getCanvasCoords(e)
    setCurrentStroke(prev => [...prev, [x, y]])
    
    const canvas = drawCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleDrawEnd = () => {
    if (isDrawing && currentStroke.length > 0) {
      setStrokes(prev => [...prev, currentStroke])
    }
    setIsDrawing(false)
    setCurrentStroke([])
  }

  const analyzeDrawing = () => {
    const totalPoints = strokes.reduce((acc, s) => acc + s.length, 0)
    const numStrokes = strokes.length
    
    // Simple heuristic analysis
    let guess = ''
    let confidence = 0
    
    if (numStrokes === 0) {
      setDrawFeedback('Dibuja algo primero!')
      return
    }

    // Analyze based on stroke patterns
    if (numStrokes === 1 && totalPoints > 20) {
      const stroke = strokes[0]
      const firstPoint = stroke[0]
      const lastPoint = stroke[stroke.length - 1]
      const distance = Math.sqrt(Math.pow(lastPoint[0] - firstPoint[0], 2) + Math.pow(lastPoint[1] - firstPoint[1], 2))
      
      if (distance < 50) {
        guess = 'circulo o sol'
        confidence = 70
      } else {
        guess = 'linea o rayo'
        confidence = 60
      }
    } else if (numStrokes >= 2 && numStrokes <= 4) {
      guess = 'casa o estrella'
      confidence = 55
    } else if (numStrokes >= 5) {
      guess = 'sol o flor'
      confidence = 50
    } else {
      guess = 'forma abstracta'
      confidence = 40
    }

    // Check if matches target
    const targetLower = targetItem.toLowerCase()
    const guessLower = guess.toLowerCase()
    
    if (guessLower.includes(targetLower) || 
        (targetLower === 'sol' && (guessLower.includes('circulo') || guessLower.includes('sol'))) ||
        (targetLower === 'estrella' && guessLower.includes('estrella')) ||
        (targetLower === 'casa' && guessLower.includes('casa'))) {
      setDrawFeedback('Excelente! Parece un ' + targetItem + '! +10 puntos')
      setDrawScore(s => s + 10)
    } else {
      setDrawFeedback('Hmm, parece un ' + guess + '. Era un ' + targetItem + '. Intenta de nuevo!')
    }
  }

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      const imgSrc = event.target?.result as string
      setUploadedImage(imgSrc)
      const model = await loadMobileNet()
      if (!model) return
      setIsLoading(true)
      setLoadingMessage('Clasificando imagen...')
      const img = new window.Image()
      img.onload = async () => {
        try {
          const predictions = await model.classify(img)
          setImagePredictions(predictions.map((p: any) => ({
            className: p.className.split(',')[0],
            probability: p.probability
          })))
        } catch (err) {
          setError('Error clasificando imagen')
        }
        setIsLoading(false)
      }
      img.src = imgSrc
    }
    reader.readAsDataURL(file)
  }

  // Hacking simulators
  const handleTerminalCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim()
    let response = ''
    
    if (command === 'help') {
      response = 'Comandos: help, whoami, pwd, ls, cat secret.txt, ping google.com, nmap localhost, clear'
    } else if (command === 'whoami') {
      response = 'hacker_student'
    } else if (command === 'pwd') {
      response = '/home/hacker_student'
    } else if (command === 'ls') {
      response = 'Documents  Downloads  secret.txt  passwords.db  tools/'
    } else if (command === 'cat secret.txt') {
      response = 'FLAG{c0ngr4ts_y0u_f0und_th3_s3cr3t}'
    } else if (command.startsWith('ping')) {
      response = 'PING google.com: 64 bytes, time=23ms\nPING google.com: 64 bytes, time=21ms\n--- 2 packets transmitted, 2 received ---'
    } else if (command === 'nmap localhost') {
      response = 'PORT     STATE  SERVICE\n22/tcp   open   ssh\n80/tcp   open   http\n443/tcp  open   https\n3306/tcp closed mysql'
    } else if (command === 'clear') {
      setTerminalOutput(['$ Terminal limpiado'])
      setTerminalInput('')
      return
    } else if (command === '') {
      return
    } else {
      response = 'Comando no encontrado: ' + cmd + '. Escribe "help" para ver comandos.'
    }
    
    setTerminalOutput(prev => [...prev, '$ ' + cmd, response])
    setTerminalInput('')
  }

  const caesarCipher = (text: string, shift: number) => {
    return text.split('').map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0)
        const base = code >= 65 && code <= 90 ? 65 : 97
        return String.fromCharCode(((code - base + shift) % 26) + base)
      }
      return char
    }).join('')
  }

  const checkPasswordStrength = (password: string) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !['123456', 'password', 'qwerty', '12345678'].includes(password.toLowerCase())
    }
    
    Object.values(checks).forEach(v => { if (v) score++ })
    
    let strength = 'Muy debil'
    let color = 'red'
    if (score >= 5) { strength = 'Muy fuerte'; color = 'green' }
    else if (score >= 4) { strength = 'Fuerte'; color = 'lime' }
    else if (score >= 3) { strength = 'Media'; color = 'yellow' }
    else if (score >= 2) { strength = 'Debil'; color = 'orange' }
    
    setPasswordStrength({ score, checks, strength, color })
  }

  // BadUSB code
  const BADUSB_CODE = `// BadUSB - Digispark ATtiny85
// ADVERTENCIA: Solo para fines educativos

#include "DigiKeyboard.h"

void setup() {
  DigiKeyboard.delay(2000);
  
  // Abrir ejecutar (Win+R)
  DigiKeyboard.sendKeyStroke(KEY_R, MOD_GUI_LEFT);
  DigiKeyboard.delay(500);
  
  // Abrir notepad
  DigiKeyboard.print("notepad");
  DigiKeyboard.sendKeyStroke(KEY_ENTER);
  DigiKeyboard.delay(1000);
  
  // Escribir mensaje
  DigiKeyboard.print("Hola! Este es un ejemplo de BadUSB.");
  DigiKeyboard.sendKeyStroke(KEY_ENTER);
  DigiKeyboard.print("Tu sistema podria ser vulnerable.");
  DigiKeyboard.sendKeyStroke(KEY_ENTER);
  DigiKeyboard.print("Aprende ciberseguridad para protegerte!");
}

void loop() {
  // No hacer nada en loop
}`

  const BADUSB_STEPS = [
    {
      title: 'Que es BadUSB?',
      content: 'BadUSB es un ataque que convierte un dispositivo USB en un "teclado malicioso". Cuando lo conectas, el computador piensa que es un teclado y ejecuta comandos automaticamente.',
      icon: Cpu
    },
    {
      title: 'Materiales necesarios',
      content: '1. Digispark ATtiny85 (~$2-5 USD)\n2. Cable micro USB\n3. Arduino IDE instalado\n4. Drivers de Digispark',
      icon: Zap
    },
    {
      title: 'Configurar Arduino IDE',
      content: '1. Abrir Arduino IDE\n2. Ir a Archivo > Preferencias\n3. En "URLs de gestor de tarjetas" agregar:\nhttp://digistump.com/package_digistump_index.json\n4. Ir a Herramientas > Placa > Gestor de tarjetas\n5. Buscar "Digistump" e instalar',
      icon: Code
    },
    {
      title: 'Cargar el codigo',
      content: '1. Seleccionar placa: Digispark (Default - 16.5mhz)\n2. NO conectar el Digispark aun\n3. Hacer clic en "Subir"\n4. Cuando diga "Plug in device now", conectar el Digispark\n5. Esperar a que termine de cargar',
      icon: Upload
    },
    {
      title: 'Probar y protegerse',
      content: 'Para probar: Conecta el Digispark a tu PC.\n\nPara protegerte:\n- No conectes USBs desconocidos\n- Usa software de bloqueo de USB\n- Configura politicas de grupo\n- Mantén tu sistema actualizado',
      icon: Shield
    }
  ]

  const copyCode = () => {
    navigator.clipboard.writeText(BADUSB_CODE)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  useEffect(() => {
    if (activeMode === 'camera') startCamera()
    else stopCamera()
    
    if (activeMode === 'draw') {
      setTimeout(() => {
        clearDrawCanvas()
        startDrawGame()
      }, 100)
    }
  }, [activeMode])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Vision IA y Herramientas</h3>
        <p className="text-gray-400">Experimenta con IA y ciberseguridad de forma practica</p>
      </div>

      {/* Mode selector */}
      {!activeMode && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => setActiveMode('camera')}
            className="bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-neon-cyan/50 text-left">
            <Camera className="w-8 h-8 text-neon-cyan mb-3" />
            <h4 className="text-white font-bold mb-1">Detector de Objetos</h4>
            <p className="text-gray-500 text-sm">Detecta objetos con tu camara en tiempo real</p>
          </button>

          <button onClick={() => setActiveMode('draw')}
            className="bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-neon-pink/50 text-left">
            <Pencil className="w-8 h-8 text-neon-pink mb-3" />
            <h4 className="text-white font-bold mb-1">Dibuja y Adivina</h4>
            <p className="text-gray-500 text-sm">Dibuja algo y la IA intentara adivinar</p>
          </button>

          <button onClick={() => setActiveMode('upload')}
            className="bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-neon-orange/50 text-left">
            <Upload className="w-8 h-8 text-neon-orange mb-3" />
            <h4 className="text-white font-bold mb-1">Clasificar Imagen</h4>
            <p className="text-gray-500 text-sm">Sube una imagen para clasificarla</p>
          </button>

          {isAdvancedLevel && (
            <button onClick={() => setActiveMode('hacking')}
              className="bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-green-500/50 text-left">
              <Terminal className="w-8 h-8 text-green-400 mb-3" />
              <h4 className="text-white font-bold mb-1">Simuladores Hacking</h4>
              <p className="text-gray-500 text-sm">Terminal, cifrado y analisis de passwords</p>
            </button>
          )}

          {isBachillerato && (
            <button onClick={() => setActiveMode('badusb')}
              className="bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-red-500/50 text-left">
              <Cpu className="w-8 h-8 text-red-400 mb-3" />
              <h4 className="text-white font-bold mb-1">Tutorial BadUSB</h4>
              <p className="text-gray-500 text-sm">Aprende a crear un BadUSB con Digispark</p>
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mb-4" />
          <p className="text-gray-400">{loadingMessage}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-gray-400 text-sm mt-2">Cerrar</button>
        </div>
      )}

      {/* Camera Mode */}
      {activeMode === 'camera' && !isLoading && (
        <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
          <div className="bg-dark-700 px-4 py-3 flex justify-between items-center">
            <span className="text-white font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-neon-cyan" /> Detector de Objetos
            </span>
            <button onClick={() => { stopCamera(); setActiveMode(null) }} className="text-gray-400 hover:text-white text-sm">Cerrar</button>
          </div>
          <div className="p-4">
            <div className="relative bg-black rounded-lg overflow-hidden max-w-xl mx-auto">
              <video ref={videoRef} className="hidden" playsInline muted />
              <canvas ref={canvasRef} className="w-full" style={{ minHeight: '300px' }} />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={startCamera} className="btn-primary flex items-center gap-2">
                    <Camera className="w-5 h-5" /> Iniciar Camara
                  </button>
                </div>
              )}
            </div>
            {detections.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {detections.map((d, i) => (
                  <span key={i} className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-sm">
                    {TRANSLATIONS[d.class] || d.class} ({Math.round(d.score * 100)}%)
                  </span>
                ))}
              </div>
            )}
            {cameraActive && (
              <div className="mt-4 flex justify-center">
                <button onClick={stopCamera} className="btn-secondary flex items-center gap-2">
                  <CameraOff className="w-4 h-4" /> Detener
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Draw Mode */}
      {activeMode === 'draw' && (
        <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
          <div className="bg-dark-700 px-4 py-3 flex justify-between items-center">
            <span className="text-white font-semibold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-neon-pink" /> Dibuja y Adivina
            </span>
            <div className="flex items-center gap-4">
              <span className="text-neon-cyan font-bold">Puntos: {drawScore}</span>
              <button onClick={() => setActiveMode(null)} className="text-gray-400 hover:text-white text-sm">Cerrar</button>
            </div>
          </div>
          <div className="p-4">
            <div className="text-center mb-4">
              <p className="text-gray-400">Dibuja:</p>
              <p className="text-3xl font-bold text-white">{targetItem.toUpperCase()}</p>
            </div>
            <div className="flex justify-center mb-4">
              <canvas
                ref={drawCanvasRef}
                width={350}
                height={350}
                className="border-2 border-dark-600 rounded-xl cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
                onMouseDown={handleDrawStart}
                onMouseMove={handleDrawMove}
                onMouseUp={handleDrawEnd}
                onMouseLeave={handleDrawEnd}
                onTouchStart={handleDrawStart}
                onTouchMove={handleDrawMove}
                onTouchEnd={handleDrawEnd}
              />
            </div>
            {drawFeedback && (
              <div className={`text-center mb-4 p-3 rounded-lg ${drawFeedback.includes('Excelente') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                <Sparkles className="w-5 h-5 inline mr-2" />{drawFeedback}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button onClick={() => { clearDrawCanvas(); setStrokes([]); setDrawFeedback(null) }} className="btn-secondary flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Borrar
              </button>
              <button onClick={analyzeDrawing} className="btn-primary flex items-center gap-2">
                <Eye className="w-4 h-4" /> Analizar
              </button>
              <button onClick={startDrawGame} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {activeMode === 'upload' && !isLoading && (
        <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
          <div className="bg-dark-700 px-4 py-3 flex justify-between items-center">
            <span className="text-white font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5 text-neon-orange" /> Clasificar Imagen
            </span>
            <button onClick={() => { setActiveMode(null); setUploadedImage(null); setImagePredictions([]) }} className="text-gray-400 hover:text-white text-sm">Cerrar</button>
          </div>
          <div className="p-6">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {!uploadedImage ? (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-dark-500 rounded-xl p-12 text-center cursor-pointer hover:border-neon-orange/50">
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Haz clic para subir una imagen</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img src={uploadedImage} alt="Uploaded" className="max-h-64 rounded-xl" />
                </div>
                {imagePredictions.length > 0 && (
                  <div className="bg-dark-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-3">La IA cree que es:</p>
                    {imagePredictions.map((pred, i) => (
                      <div key={i} className="flex items-center gap-3 mb-2">
                        <div className="flex-1 bg-dark-600 rounded-full h-3 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-neon-orange to-neon-pink" style={{ width: (pred.probability * 100) + '%' }} />
                        </div>
                        <span className="text-white text-sm w-28 truncate">{pred.className}</span>
                        <span className="text-gray-400 text-sm w-10">{Math.round(pred.probability * 100)}%</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-center">
                  <button onClick={() => { setUploadedImage(null); setImagePredictions([]); fileInputRef.current?.click() }} className="btn-primary">
                    Subir otra
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hacking Simulators */}
      {activeMode === 'hacking' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-green-400" /> Simuladores de Hacking
            </h3>
            <button onClick={() => setActiveMode(null)} className="text-gray-400 hover:text-white text-sm">Cerrar</button>
          </div>

          {/* Terminal Simulator */}
          <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
            <div className="bg-dark-700 px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-400 text-sm ml-2">Terminal Linux</span>
            </div>
            <div className="bg-black p-4 font-mono text-sm h-48 overflow-y-auto">
              {terminalOutput.map((line, i) => (
                <div key={i} className={line.startsWith('$') ? 'text-green-400' : 'text-gray-300'}>{line}</div>
              ))}
            </div>
            <div className="bg-dark-900 p-2 flex items-center gap-2">
              <span className="text-green-400 font-mono">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTerminalCommand(terminalInput)}
                placeholder="Escribe un comando (help para ayuda)"
                className="flex-1 bg-transparent text-white font-mono outline-none"
              />
            </div>
          </div>

          {/* Caesar Cipher */}
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-400" /> Cifrado Cesar
            </h4>
            <p className="text-gray-400 text-sm mb-3">El cifrado Cesar desplaza cada letra un numero de posiciones en el alfabeto.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Texto a cifrar:</label>
                <input
                  type="text"
                  value={encryptText}
                  onChange={e => setEncryptText(e.target.value)}
                  placeholder="Escribe tu mensaje secreto"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Desplazamiento: {encryptShift}</label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={encryptShift}
                  onChange={e => setEncryptShift(parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>
            <button onClick={() => setEncryptedResult(caesarCipher(encryptText, encryptShift))} className="btn-primary mt-3">
              Cifrar
            </button>
            {encryptedResult && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-gray-400 text-sm">Resultado cifrado:</p>
                <p className="text-green-400 font-mono text-lg">{encryptedResult}</p>
              </div>
            )}
          </div>

          {/* Password Checker */}
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" /> Analizador de Contraseñas
            </h4>
            <input
              type="text"
              value={passwordToCheck}
              onChange={e => { setPasswordToCheck(e.target.value); checkPasswordStrength(e.target.value) }}
              placeholder="Escribe una contraseña para analizar"
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
            {passwordStrength && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-dark-600 rounded-full h-3">
                    <div className="h-full rounded-full transition-all" style={{ width: (passwordStrength.score / 6 * 100) + '%', backgroundColor: passwordStrength.color }} />
                  </div>
                  <span style={{ color: passwordStrength.color }} className="font-semibold">{passwordStrength.strength}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={passwordStrength.checks.length ? 'text-green-400' : 'text-red-400'}>
                    {passwordStrength.checks.length ? '✓' : '✗'} 8+ caracteres
                  </div>
                  <div className={passwordStrength.checks.uppercase ? 'text-green-400' : 'text-red-400'}>
                    {passwordStrength.checks.uppercase ? '✓' : '✗'} Mayusculas
                  </div>
                  <div className={passwordStrength.checks.lowercase ? 'text-green-400' : 'text-red-400'}>
                    {passwordStrength.checks.lowercase ? '✓' : '✗'} Minusculas
                  </div>
                  <div className={passwordStrength.checks.numbers ? 'text-green-400' : 'text-red-400'}>
                    {passwordStrength.checks.numbers ? '✓' : '✗'} Numeros
                  </div>
                  <div className={passwordStrength.checks.special ? 'text-green-400' : 'text-red-400'}>
                    {passwordStrength.checks.special ? '✓' : '✗'} Simbolos
                  </div>
                  <div className={passwordStrength.checks.noCommon ? 'text-green-400' : 'text-red-400'}>
                    {passwordStrength.checks.noCommon ? '✓' : '✗'} No comun
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BadUSB Tutorial */}
      {activeMode === 'badusb' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-red-400" /> Tutorial BadUSB con Digispark
            </h3>
            <button onClick={() => setActiveMode(null)} className="text-gray-400 hover:text-white text-sm">Cerrar</button>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" /> Advertencia
            </p>
            <p className="text-gray-300 text-sm mt-1">
              Este tutorial es solo para fines educativos. Usar estas tecnicas sin autorizacion es ilegal.
              Aprende para protegerte y proteger a otros.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {BADUSB_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} 
                  className={`bg-dark-800 rounded-xl border transition-all cursor-pointer ${badusbStep === i ? 'border-red-500/50' : 'border-dark-600'}`}
                  onClick={() => setBadusbStep(i)}
                >
                  <div className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${badusbStep === i ? 'bg-red-500/20' : 'bg-dark-700'}`}>
                      <Icon className={`w-5 h-5 ${badusbStep === i ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">Paso {i + 1}: {step.title}</h4>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${badusbStep === i ? 'rotate-90 text-red-400' : 'text-gray-500'}`} />
                  </div>
                  {badusbStep === i && (
                    <div className="px-4 pb-4">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-dark-900 rounded-lg p-3">
                        {step.content}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Code */}
          <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
            <div className="bg-dark-700 px-4 py-2 flex justify-between items-center">
              <span className="text-white font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-green-400" /> Codigo Arduino
              </span>
              <button onClick={copyCode} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="p-4 text-sm text-gray-300 overflow-x-auto font-mono bg-dark-900">
              {BADUSB_CODE}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
