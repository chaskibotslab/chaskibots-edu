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
import { GUIAS, GUIA_ROBOT, type Guia } from './guiasEV3'
import { MISIONES_EV3 } from './misionesEV3'
import { miniatura } from './miniaturas'
import { ChevronLeft, ChevronRight, RotateCcw, Maximize2, Minimize2, Check, Trophy, Hammer, Loader2, Play, Hand, LayoutGrid } from 'lucide-react'
import { useExpand } from '@/hooks/useExpand'
import EnviarTarea from '@/components/simuladores/EnviarTarea'

function Modelo({ guia, paso, onReady }: { guia: Guia; paso: number; onReady: () => void }) {
  const [root, setRoot] = useState<THREE.Group | null>(null)
  const invalidate = useThree(s => s.invalidate)

  useEffect(() => {
    let vivo = true
    setRoot(null)
    cargarLDraw(guia.archivo).then(g => {
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
      onReady()
    }).catch(() => onReady())
    return () => { vivo = false }
  }, [guia, onReady])

  // Mostrar solo las piezas hasta el paso actual
  useEffect(() => {
    if (!root) return
    mostrarHasta(root, paso)
    invalidate()
  }, [paso, root, invalidate])

  if (!root) return null
  return <primitive object={root} />
}

/** Tarjeta de un robot en la galería: foto, qué sensores lleva y qué se puede hacer con él. */
function TarjetaRobot({ guia, onVer, onConstruir, onProgramar }: { guia: Guia; onVer: () => void; onConstruir?: () => void; onProgramar?: () => void }) {
  const [foto, setFoto] = useState('')
  useEffect(() => {
    let vivo = true
    miniatura(guia.archivo).then(u => { if (vivo) setFoto(u) }).catch(() => { /* se queda el emoji */ })
    return () => { vivo = false }
  }, [guia])
  const clases = MISIONES_EV3.filter(m => m.robot === guia.id && m.id !== 'libre').length
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button onClick={onVer} title="Ver cómo se arma" className="relative grid aspect-[4/3] w-full place-items-center bg-gradient-to-b from-sky-100 to-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {foto ? <img src={foto} alt={guia.nombre} className="h-full w-full object-contain" /> : <span className="text-5xl">{guia.emoji}</span>}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm">{guia.pasos.length} pasos</span>
        {clases > 0 && <span className="absolute right-2 top-2 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">{clases} {clases === 1 ? 'clase' : 'clases'}</span>}
      </button>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="text-sm font-extrabold text-slate-900">{guia.emoji} {guia.nombre}</h3>
        <p className="text-xs text-slate-600">{guia.descripcion}</p>
        <p className="text-[11px] font-semibold text-slate-500">{guia.equipo}.</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1.5">
          <button onClick={onVer} className="flex items-center gap-1 rounded-lg bg-[#c0392b] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#a5312a]"><Hammer className="h-3.5 w-3.5" /> Ver paso a paso</button>
          {onConstruir && <button onClick={onConstruir} className="flex items-center gap-1 rounded-lg bg-[#2f6fd6] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#275fb8]"><Hand className="h-3.5 w-3.5" /> Armarlo yo</button>}
          {guia.simulable && onProgramar && <button onClick={onProgramar} className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-green-700"><Play className="h-3.5 w-3.5" /> Programar</button>}
        </div>
      </div>
    </div>
  )
}

export default function ConstructorEV3Real({ inicial, onProgramar, onConstruir }: { inicial?: string; onProgramar?: (robotId: string) => void; onConstruir?: (robotId: string) => void }) {
  const { expanded, toggle } = useExpand()
  // '' = galería con todos los robots
  const [guiaId, setGuiaId] = useState(inicial && GUIAS.some(g => g.id === inicial) ? inicial : '')
  const guia = GUIAS.find(g => g.id === guiaId) || GUIA_ROBOT
  const PASOS = guia.pasos
  const total = PASOS.length
  const [paso, setPaso] = useState(0)
  const [cargando, setCargando] = useState(true)

  const listo = paso >= total
  const actual = !listo ? PASOS[Math.min(paso, PASOS.length - 1)] : null
  const colocar = () => setPaso(p => Math.min(total, p + 1))
  const atras = () => setPaso(p => Math.max(0, p - 1))
  const reiniciar = () => setPaso(0)
  const alCargar = useCallback(() => setCargando(false), [])
  const elegir = (id: string) => { setGuiaId(id); setPaso(0); setCargando(true) }

  if (!guiaId) {
    return (
      <div className="flex h-full min-h-[520px] flex-col overflow-hidden bg-slate-100 text-slate-900">
        <div className="flex flex-wrap items-center gap-2 bg-[#c0392b] px-3 py-2 text-white">
          <Hammer className="h-4 w-4" />
          <span className="text-sm font-extrabold tracking-tight">Robots para armar</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">{GUIAS.length} robots</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="mb-3 max-w-3xl text-sm text-slate-700">
            Elige un robot. <b>Ver paso a paso</b> te muestra cómo se arma, pieza por pieza. <b>Armarlo yo</b> te da las piezas para que lo construyas con tus manos. <b>Programar</b> lo pone en la pista con sus clases.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GUIAS.map(g => (
              <TarjetaRobot key={g.id} guia={g} onVer={() => elegir(g.id)}
                onConstruir={onConstruir ? () => onConstruir(g.id) : undefined}
                onProgramar={onProgramar ? () => onProgramar(g.id) : undefined} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col overflow-hidden bg-slate-100 text-slate-900 ${expanded ? 'fixed inset-0 z-[200]' : 'relative h-full min-h-[520px]'}`}>
      <div className="flex flex-wrap items-center gap-2 bg-[#c0392b] px-3 py-1.5 text-white">
        <button onClick={() => setGuiaId('')} title="Volver a la lista de robots" className="flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-xs font-bold hover:bg-white/25"><LayoutGrid className="h-3.5 w-3.5" /> Todos los robots</button>
        <span className="hidden text-sm font-extrabold tracking-tight sm:inline">Armar</span>
        <select value={guiaId} onChange={e => elegir(e.target.value)} title="Elige qué robot armar"
          className="max-w-[55vw] rounded-md border border-white/40 bg-white/15 px-2 py-1 text-xs font-bold text-white outline-none [&>option]:text-slate-900">
          {GUIAS.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.nombre}</option>)}
        </select>
        {guia.simulable && onProgramar && (
          <button onClick={() => onProgramar(guia.id)} title="Ir a programar y probar este robot" className="hidden items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-green-700 hover:bg-white sm:flex"><Play className="h-3.5 w-3.5" /> Programarlo</button>
        )}
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">{Math.min(paso, total)}/{total} pasos</span>
        <div className="ml-auto flex items-center gap-1.5">
          <EnviarTarea
            simulador={`LEGO EV3 (armado: ${guia.nombre})`}
            sigla="EV3A"
            botonClassName="flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-white disabled:opacity-80"
            obtenerEntrega={() => ({
              output: `LEGO EV3 — armado de «${guia.nombre}»: ${Math.min(paso, total)}/${total} pasos. ${listo ? '✅ ¡Robot terminado!' : '⏳ En progreso'}`,
              files: { ev3Armado: { robot: guia.id, pasos: Math.min(paso, total), total, terminado: listo } },
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
            <Modelo guia={guia} paso={paso} onReady={alCargar} />
            <OrbitControls enablePan={false} minDistance={120} maxDistance={600} />
          </Canvas>
          {cargando && <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm text-slate-600"><span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Cargando piezas reales…</span></div>}
          {listo && (
            <div className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-max rounded-full bg-green-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg flex items-center gap-2 animate-bounce"><Trophy className="h-5 w-5" /> ¡{guia.nombre} terminado!</div>
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
              <p className="text-sm text-slate-700">Construiste «{guia.nombre}» con piezas reales. Gíralo para verlo{guia.simulable ? '. Ahora prográmalo y ponlo a prueba en sus clases' : ''}.</p>
              {guia.simulable && onProgramar && (
                <button onClick={() => onProgramar(guia.id)} className="mt-1 flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-extrabold text-white shadow hover:bg-green-700"><Play className="h-4 w-4" /> Programar este robot</button>
              )}
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
