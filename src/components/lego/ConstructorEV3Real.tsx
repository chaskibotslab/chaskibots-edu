'use client'

/**
 * Constructor del robot EV3 con PIEZAS REALES (biblioteca LDraw) y armado por pasos.
 * Carga un modelo .mpd autocontenido con LDrawLoader y revela las piezas paso a paso.
 */
import { useCallback, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { cargarLDraw, mostrarHasta } from './ldraw'
import { GUIA_ROBOT } from './guiasEV3'
import { ChevronLeft, ChevronRight, RotateCcw, Maximize2, Minimize2, Check, Trophy, Hammer, Loader2 } from 'lucide-react'
import { useExpand } from '@/hooks/useExpand'
import EnviarTarea from '@/components/simuladores/EnviarTarea'

const PASOS = GUIA_ROBOT.pasos

function Modelo({ paso, onReady }: { paso: number; onReady: (n: number) => void }) {
  const [root, setRoot] = useState<THREE.Group | null>(null)
  const invalidate = useThree(s => s.invalidate)

  useEffect(() => {
    let vivo = true
    cargarLDraw(GUIA_ROBOT.archivo).then(g => {
      if (!vivo) return
      g.rotation.x = Math.PI // LDraw usa Y hacia abajo
      g.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(g)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const s = 150 / Math.max(size.x, size.y, size.z || 1)
      g.scale.setScalar(s)
      g.position.set(-center.x * s, -center.y * s, -center.z * s)
      setRoot(g)
      onReady(PASOS.length)
    }).catch(() => onReady(PASOS.length))
    return () => { vivo = false }
  }, [onReady])

  // Mostrar solo las piezas hasta el paso actual
  useEffect(() => {
    if (!root) return
    mostrarHasta(root, paso)
    invalidate()
  }, [paso, root, invalidate])

  if (!root) return null
  return <primitive object={root} />
}

export default function ConstructorEV3Real() {
  const { expanded, toggle } = useExpand()
  const [paso, setPaso] = useState(0)
  const [total, setTotal] = useState(PASOS.length)
  const [cargando, setCargando] = useState(true)

  const listo = paso >= total
  const actual = !listo ? PASOS[Math.min(paso, PASOS.length - 1)] : null
  const colocar = () => setPaso(p => Math.min(total, p + 1))
  const atras = () => setPaso(p => Math.max(0, p - 1))
  const reiniciar = () => setPaso(0)
  const alCargar = useCallback((n: number) => { setTotal(n); setCargando(false) }, [])

  return (
    <div className={`flex flex-col overflow-hidden bg-slate-100 text-slate-900 ${expanded ? 'fixed inset-0 z-[200]' : 'relative h-full min-h-[520px]'}`}>
      <div className="flex flex-wrap items-center gap-2 bg-[#c0392b] px-3 py-1.5 text-white">
        <Hammer className="h-4 w-4" />
        <span className="text-sm font-extrabold tracking-tight">Armar: Robot explorador EV3</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">{Math.min(paso, total)}/{total} piezas</span>
        <div className="ml-auto flex items-center gap-1.5">
          <EnviarTarea
            simulador="LEGO EV3 (armado)"
            sigla="EV3A"
            botonClassName="flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-white disabled:opacity-80"
            obtenerEntrega={() => ({
              output: `LEGO EV3 — armado con piezas reales: ${Math.min(paso, total)}/${total} piezas. ${listo ? '✅ ¡Robot terminado!' : '⏳ En progreso'}`,
              files: { ev3Armado: { pasos: Math.min(paso, total), total, terminado: listo } },
            })}
          />
          <button onClick={toggle} title={expanded ? 'Salir de pantalla completa' : 'Pantalla completa'} className="rounded-md p-1.5 hover:bg-white/20">
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full bg-slate-200"><div className="h-full bg-[#c0392b] transition-all" style={{ width: `${(Math.min(paso, total) / total) * 100}%` }} /></div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[300px] flex-1">
          <Canvas frameloop="demand" camera={{ position: [-180, 140, -230], fov: 40 }} dpr={[1, 1.6]} style={{ background: 'linear-gradient(#e0f2fe,#eef2f7)' }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[120, 180, 90]} intensity={1.2} />
            <directionalLight position={[-80, 60, -100]} intensity={0.4} />
            <Modelo paso={paso} onReady={alCargar} />
            <OrbitControls enablePan={false} minDistance={120} maxDistance={600} />
          </Canvas>
          {cargando && <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm text-slate-600"><span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Cargando piezas reales…</span></div>}
          {listo && (
            <div className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-max rounded-full bg-green-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg flex items-center gap-2 animate-bounce"><Trophy className="h-5 w-5" /> ¡Robot EV3 terminado!</div>
          )}
        </div>

        <div className={`flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-slate-300 bg-white p-3 lg:border-l ${expanded ? 'lg:w-[400px]' : 'lg:w-[340px]'}`}>
          {!listo && actual ? (
            <>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Paso {paso + 1} de {total}</p>
                <h3 className="text-lg font-extrabold text-slate-900">{actual.titulo}</h3>
                <p className="mt-1 text-sm text-slate-700">{actual.info}</p>
              </div>
              <button onClick={colocar} className="flex items-center justify-center gap-2 rounded-xl bg-[#c0392b] px-4 py-3 text-sm font-extrabold text-white shadow hover:bg-[#a5312a]"><Check className="h-5 w-5" /> Colocar pieza</button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Trophy className="h-10 w-10 text-amber-500" />
              <h3 className="text-lg font-extrabold text-slate-900">¡Lo armaste!</h3>
              <p className="text-sm text-slate-700">Construiste el robot EV3 con piezas reales. Gíralo para verlo, o ve a «Programar» para darle vida.</p>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2">
            <button onClick={atras} disabled={paso === 0} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Atrás</button>
            {!listo && <button onClick={colocar} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900">Siguiente <ChevronRight className="h-4 w-4" /></button>}
            <button onClick={reiniciar} title="Empezar de nuevo" className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"><RotateCcw className="h-3.5 w-3.5" /></button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Piezas</p>
            <ol className="space-y-0.5 text-[12px]">
              {PASOS.map((p, i) => (
                <li key={i} className={`flex items-center gap-1.5 ${i < paso ? 'text-green-600' : i === paso ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                  {i < paso ? <Check className="h-3.5 w-3.5" /> : <span className="inline-block h-3.5 w-3.5 text-center">{i + 1}</span>}
                  {p.titulo}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
