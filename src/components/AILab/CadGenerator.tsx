'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Sparkles, Loader2, AlertTriangle, Info } from 'lucide-react'
import RaymarchSDF from './RaymarchSDF'

const EXAMPLES = [
  'un robot simple: cabeza cúbica, cuerpo cilíndrico y dos brazos',
  'un engranaje mecánico con un agujero en el centro',
  'una silla con cuatro patas',
  'una taza con asa',
  'una casa simple: cubo con techo en forma de pirámide',
  'una mancuerna: dos esferas conectadas por un cilindro',
  'un muñeco de nieve con tres esferas apiladas',
]

export default function CadGenerator() {
  const [textInput, setTextInput] = useState('')
  const [glsl, setGlsl] = useState<string | null>(null)
  const [glslPrompt, setGlslPrompt] = useState<string | null>(null) // what description produced `glsl`
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!textInput.trim()) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/cad-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: textInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No se pudo generar el modelo 3D')
      } else {
        setGlsl(data.glsl)
        setGlslPrompt(textInput.trim())
      }
    } catch {
      setError('Error de conexión al generar el modelo 3D')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-rose-300 text-sm font-bold">Texto → Modelo 3D real</h3>
          <p className="text-gray-400 text-xs mt-1">
            Una IA (DeepSeek-V3) interpreta tu descripción en español y compone geometría 3D genuina —
            combina esferas, cajas, cilindros, conos, toros y cápsulas con uniones y recortes booleanos reales,
            renderizados en vivo en tu navegador (raymarching).
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        {/* 3D preview */}
        <div className="flex-1 min-w-0">
          <div className="relative bg-black/50 rounded-xl overflow-hidden" style={{ height: 340 }}>
            {glsl ? (
              <Canvas camera={{ position: [4, 3, 6], fov: 50 }}>
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 8, 5]} intensity={0.8} />
                <RaymarchSDF glsl={glsl} accentColor="#F43F5E" bgColor="#0f0f1a" />
                <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={12} />
              </Canvas>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-sm text-center px-6">
                  Describe un modelo y presiona &quot;Generar&quot; para verlo aquí
                </p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generando modelo 3D con IA...
                </div>
              </div>
            )}
          </div>
          {glsl && !loading && (
            <p className="text-gray-500 text-[10px] mt-1.5">
              Mostrando: <span className="text-gray-400">&quot;{glslPrompt}&quot;</span>
              {error && <span className="text-amber-400"> — este es el último resultado válido, tu último intento falló (ver error)</span>}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="w-64 flex-shrink-0 space-y-3">
          <div>
            <label className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-1 block">Describe tu modelo</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ej: un robot con cabeza cúbica y dos brazos..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs text-white placeholder:text-gray-500 focus:border-rose-500/50 focus:outline-none resize-none"
            />
            <button
              onClick={generate}
              disabled={!textInput.trim() || loading}
              className="mt-2 w-full px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 justify-center"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {loading ? 'Generando...' : 'Generar 3D con IA'}
            </button>
            {error && (
              <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-[10px]">{error}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">Ejemplos</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setTextInput(ex)}
                  className="w-full text-left px-2.5 py-1.5 bg-gray-700/20 hover:bg-gray-700/40 text-gray-400 hover:text-gray-300 rounded-lg text-[10px] transition-colors"
                >
                  &quot;{ex}&quot;
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
