'use client'

import { useRef, useState, useEffect } from 'react'
import { Eraser, Pencil, Trash2, Download, Undo, Palette } from 'lucide-react'

interface DrawingCanvasProps {
  onSave: (imageData: string) => void
  width?: number
  height?: number
}

const COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'
]

export default function DrawingCanvas({ onSave, width = 400, height = 300 }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(3)
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil')
  const [history, setHistory] = useState<ImageData[]>([])
  const [showColors, setShowColors] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Usar willReadFrequently para optimizar getImageData
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Guardar estado inicial
    saveToHistory()
  }, [])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory(prev => [...prev.slice(-10), imageData]) // Máximo 10 estados
  }

  const undo = () => {
    if (history.length <= 1) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    
    const newHistory = [...history]
    newHistory.pop() // Quitar el actual
    const previousState = newHistory[newHistory.length - 1]
    
    if (previousState) {
      ctx.putImageData(previousState, 0, 0)
      setHistory(newHistory)
      triggerSave()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
    triggerSave()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    setIsDrawing(true)
    
    const rect = canvas.getBoundingClientRect()
    let x, y
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x, y
    
    if ('touches' in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
      triggerSave()
    }
  }

  const triggerSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const imageData = canvas.toDataURL('image/png')
    onSave(imageData)
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'dibujo-tarea.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-dark-700 rounded-lg">
        <button
          onClick={() => setTool('pencil')}
          className={`p-2 rounded-lg transition-colors ${
            tool === 'pencil' ? 'bg-neon-cyan text-dark-900' : 'text-gray-400 hover:bg-dark-600'
          }`}
          title="Lápiz"
        >
          <Pencil className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-lg transition-colors ${
            tool === 'eraser' ? 'bg-neon-cyan text-dark-900' : 'text-gray-400 hover:bg-dark-600'
          }`}
          title="Borrador"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-dark-500" />

        <div className="relative">
          <button
            onClick={() => setShowColors(!showColors)}
            className="p-2 rounded-lg text-gray-400 hover:bg-dark-600 flex items-center gap-1"
            title="Color"
          >
            <div className="w-4 h-4 rounded-full border border-gray-500" style={{ backgroundColor: color }} />
            <Palette className="w-3 h-3" />
          </button>
          
          {showColors && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-dark-800 border border-dark-600 rounded-lg grid grid-cols-5 gap-1 z-10">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setShowColors(false); }}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-neon-cyan' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Tamaño:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-16 h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-4">{brushSize}</span>
        </div>

        <div className="w-px h-6 bg-dark-500" />

        <button
          onClick={undo}
          className="p-2 rounded-lg text-gray-400 hover:bg-dark-600 disabled:opacity-50"
          disabled={history.length <= 1}
          title="Deshacer"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={clearCanvas}
          className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"
          title="Limpiar todo"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={downloadImage}
          className="p-2 rounded-lg text-neon-green hover:bg-neon-green/20"
          title="Descargar"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div className="border border-dark-600 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none"
          style={{ width: '100%', height: 'auto', maxWidth: width }}
        />
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Dibuja tu respuesta aquí. Se guardará automáticamente.
      </p>
    </div>
  )
}
