'use client'

/**
 * Constructor paso a paso del robot LEGO EV3: el alumno arma el robot pieza por
 * pieza. Cada paso muestra la pieza en "fantasma" (dónde va); al colocarla se
 * fija y avanza. Estilo manual de instrucciones LEGO, en 3D.
 */
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ChevronLeft, ChevronRight, RotateCcw, Maximize2, Minimize2, Check, Trophy, Hammer } from 'lucide-react'
import { useExpand } from '@/hooks/useExpand'
import EnviarTarea from '@/components/simuladores/EnviarTarea'
import { PiezaLego } from './PiezasLego'
import { MODELO_EV3 } from './modeloEV3'

function Escena({ paso, onColocar }: { paso: number; onColocar: () => void }) {
  const pasos = MODELO_EV3.pasos
  const colocadas = pasos.slice(0, paso)
  const actual = paso < pasos.length ? pasos[paso] : null
  return (
    <Canvas shadows camera={{ position: [120, 120, 160], fov: 42 }} dpr={[1, 1.8]} style={{ background: 'linear-gradient(#e0f2fe,#eef2f7)' }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[80, 140, 60]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      {/* placa de construcción */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[360, 300]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <gridHelper args={[360, 45, '#94a3b8', '#b8c2cf']} position={[0, -0.9, 0]} />

      {colocadas.map((p, si) => p.piezas.map(pz => <PiezaLego key={pz.id} p={pz} nuevo={si === paso - 1} />))}

      {actual && (
        <group
          onClick={e => { e.stopPropagation(); onColocar() }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'default')}
        >
          {actual.piezas.map(pz => <PiezaLego key={pz.id} p={pz} ghost />)}
        </group>
      )}

      <OrbitControls enablePan={false} minDistance={110} maxDistance={400} maxPolarAngle={Math.PI / 2.05} target={[0, 24, 0]} />
    </Canvas>
  )
}

export default function ConstructorEV3() {
  const { expanded, toggle } = useExpand()
  const pasos = MODELO_EV3.pasos
  const [paso, setPaso] = useState(0) // piezas ya colocadas (0..pasos.length)
  const listo = paso >= pasos.length
  const actual = !listo ? pasos[paso] : null

  const colocar = () => setPaso(p => Math.min(pasos.length, p + 1))
  const atras = () => setPaso(p => Math.max(0, p - 1))
  const reiniciar = () => setPaso(0)

  return (
    <div className={`flex flex-col overflow-hidden bg-slate-100 text-slate-900 ${expanded ? 'fixed inset-0 z-[200]' : 'relative h-full min-h-[520px]'}`}>
      {/* cabecera */}
      <div className="flex flex-wrap items-center gap-2 bg-[#c0392b] px-3 py-1.5 text-white">
        <Hammer className="h-4 w-4" />
        <span className="text-sm font-extrabold tracking-tight">Armar: {MODELO_EV3.nombre}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">{Math.min(paso, pasos.length)}/{pasos.length} piezas</span>
        <div className="ml-auto flex items-center gap-1.5">
          <EnviarTarea
            simulador="LEGO EV3 (armado)"
            sigla="EV3A"
            botonClassName="flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-white disabled:opacity-80"
            obtenerEntrega={() => ({
              output: `LEGO EV3 — armado de «${MODELO_EV3.nombre}»: ${Math.min(paso, pasos.length)}/${pasos.length} piezas. ${listo ? '✅ ¡Robot terminado!' : '⏳ En progreso'}`,
              files: { ev3Armado: { pasos: Math.min(paso, pasos.length), total: pasos.length, terminado: listo } },
            })}
          />
          <button onClick={toggle} title={expanded ? 'Salir de pantalla completa' : 'Pantalla completa'} className="rounded-md p-1.5 hover:bg-white/20">
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* barra de progreso */}
      <div className="h-1.5 w-full bg-slate-200">
        <div className="h-full bg-[#c0392b] transition-all" style={{ width: `${(Math.min(paso, pasos.length) / pasos.length) * 100}%` }} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* escena 3D */}
        <div className="relative min-h-[300px] flex-1">
          <Escena paso={paso} onColocar={colocar} />
          {listo && (
            <div className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-max rounded-full bg-green-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg flex items-center gap-2 animate-bounce">
              <Trophy className="h-5 w-5" /> ¡Robot EV3 terminado!
            </div>
          )}
        </div>

        {/* panel de pasos */}
        <div className={`flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-slate-300 bg-white p-3 lg:border-l ${expanded ? 'lg:w-[400px]' : 'lg:w-[340px]'}`}>
          {!listo && actual ? (
            <>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Paso {paso + 1} de {pasos.length}</p>
                <h3 className="text-lg font-extrabold text-slate-900">{actual.titulo}</h3>
                <p className="mt-1 text-sm text-slate-700">{actual.instruccion}</p>
              </div>
              <div className="rounded-xl border border-dashed border-[#c0392b]/40 bg-[#c0392b]/5 p-3 text-center text-xs text-slate-600">
                👻 La pieza en transparente te muestra <b>dónde va</b>.<br />Haz clic en ella (o en «Colocar pieza») para armarla.
              </div>
              <button onClick={colocar} className="flex items-center justify-center gap-2 rounded-xl bg-[#c0392b] px-4 py-3 text-sm font-extrabold text-white shadow hover:bg-[#a5312a]">
                <Check className="h-5 w-5" /> Colocar pieza
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Trophy className="h-10 w-10 text-amber-500" />
              <h3 className="text-lg font-extrabold text-slate-900">¡Lo armaste!</h3>
              <p className="text-sm text-slate-700">Construiste la {MODELO_EV3.nombre} con sus {pasos.length} piezas. Gíralo y obsérvalo, o ve a la pestaña «Programar» para darle vida.</p>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2">
            <button onClick={atras} disabled={paso === 0} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Atrás</button>
            {!listo && <button onClick={colocar} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900">Siguiente <ChevronRight className="h-4 w-4" /></button>}
            <button onClick={reiniciar} title="Empezar de nuevo" className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"><RotateCcw className="h-3.5 w-3.5" /></button>
          </div>

          {/* mini-lista de piezas */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Piezas</p>
            <ol className="space-y-0.5 text-[12px]">
              {pasos.map((p, i) => (
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
