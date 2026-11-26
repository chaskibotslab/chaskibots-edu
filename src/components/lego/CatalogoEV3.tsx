'use client'

/**
 * Catálogo/mostrario de piezas LEGO EV3 reales (LDraw) para construir libremente:
 * eliges una pieza del catálogo y aparece en la mesa; luego la arrastras,
 * la giras, la volteas, la subes/bajas o la borras.
 * Render bajo demanda para no colgar máquinas modestas.
 */
import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader.js'
import { RotateCw, FlipVertical2, ArrowUp, ArrowDown, Trash2, Maximize2, Minimize2, Loader2, Hand, MousePointer2 } from 'lucide-react'
import { useExpand } from '@/hooks/useExpand'
import EnviarTarea from '@/components/simuladores/EnviarTarea'

interface ItemCat { tipo: string; nombre: string; emoji: string }
const CATALOGO: ItemCat[] = [
  { tipo: 'brick', nombre: 'Ladrillo EV3', emoji: '🧠' },
  { tipo: 'motor_grande', nombre: 'Motor grande', emoji: '⚙️' },
  { tipo: 'motor_mediano', nombre: 'Motor mediano', emoji: '⚙️' },
  { tipo: 'rueda', nombre: 'Rueda', emoji: '🛞' },
  { tipo: 'rueda_loca', nombre: 'Rueda loca', emoji: '⚪' },
  { tipo: 'sensor_color', nombre: 'Sensor de color', emoji: '🎨' },
  { tipo: 'sensor_ir', nombre: 'Sensor infrarrojo', emoji: '📡' },
  { tipo: 'sensor_tactil', nombre: 'Sensor táctil', emoji: '👆' },
  { tipo: 'sensor_giro', nombre: 'Giroscopio', emoji: '🧭' },
  { tipo: 'viga_15', nombre: 'Viga 15', emoji: '➖' },
  { tipo: 'viga_11', nombre: 'Viga 11', emoji: '➖' },
  { tipo: 'viga_7', nombre: 'Viga 7', emoji: '➖' },
  { tipo: 'viga_3', nombre: 'Viga 3', emoji: '➖' },
  { tipo: 'marco', nombre: 'Marco 5×7', emoji: '🔲' },
  { tipo: 'eje', nombre: 'Eje 6', emoji: '📏' },
  { tipo: 'pin', nombre: 'Pin / conector', emoji: '📍' },
]
const NOMBRE: Record<string, string> = Object.fromEntries(CATALOGO.map(c => [c.tipo, c.nombre]))

interface Puesta { uid: number; tipo: string; x: number; y: number; z: number; rotY: number; rotX: number }

const ESCALA = 0.22
const STUD = 20 * ESCALA                            // 1 módulo LEGO (distancia entre agujeros)
const MESA = 400
const cache = new Map<string, THREE.Group>()        // tipo -> pieza base, centrada en su origen
const clones = new Map<number, THREE.Object3D>()    // uid -> clon colocado

/** Centra la pieza en su origen y guarda su tamaño en userData.tam. */
function preparar(g: THREE.Group): THREE.Group {
  g.rotation.x = Math.PI // LDraw usa Y hacia abajo
  g.scale.setScalar(ESCALA)
  g.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(g)
  const c = box.getCenter(new THREE.Vector3())
  g.position.set(-c.x, -c.y, -c.z)
  const w = new THREE.Group()
  w.add(g)
  w.userData.tam = box.getSize(new THREE.Vector3())
  return w
}

function cargarPieza(tipo: string): Promise<THREE.Group> {
  if (cache.has(tipo)) return Promise.resolve(cache.get(tipo)!)
  return new Promise((ok, bad) => {
    const loader = new LDrawLoader()
    ;(loader as any).smoothNormals = false
    loader.load(`/ldraw/piezas/${tipo}.mpd`, (g: any) => { const w = preparar(g); cache.set(tipo, w); ok(w) }, undefined, bad)
  })
}

const tam = (tipo: string): THREE.Vector3 => cache.get(tipo)?.userData.tam ?? new THREE.Vector3(20, 20, 20)
/** Media altura de la pieza según si está acostada o volteada. */
const mediaAltura = (p: Puesta) => (p.rotX % 180 === 0 ? tam(p.tipo).y : tam(p.tipo).z) / 2
const ajustar = (v: number) => Math.round(v / STUD) * STUD

/** Primer lugar libre de la mesa para que las piezas nuevas no caigan encimadas. */
function lugarLibre(ps: Puesta[]): { x: number; z: number } {
  const paso = STUD * 14
  for (let anillo = 0; anillo < 5; anillo++) {
    // primero los lugares más cercanos a la cámara (al frente y a la derecha)
    for (let j = anillo; j >= -anillo; j--) {
      for (let i = anillo; i >= -anillo; i--) {
        if (Math.max(Math.abs(i), Math.abs(j)) !== anillo) continue
        const x = i * paso, z = j * paso
        if (!ps.some(p => Math.abs(p.x - x) < paso * 0.8 && Math.abs(p.z - z) < paso * 0.8)) return { x, z }
      }
    }
  }
  return { x: 0, z: 0 }
}

function Suelo({ onMover, onFin, onClic, onAbajo }: { onMover: (x: number, z: number) => void; onFin: () => void; onClic: (delta: number) => void; onAbajo: () => void }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}
      onPointerMove={e => onMover(e.point.x, e.point.z)}
      onPointerDown={onAbajo} onPointerUp={onFin} onPointerLeave={onFin} onClick={e => onClic(e.delta)}>
      <planeGeometry args={[MESA, MESA]} />
      <meshStandardMaterial color="#cbd5e1" />
    </mesh>
  )
}

function PiezaPuesta({ p, sel, onAgarrar }: { p: Puesta; sel: boolean; onAgarrar: () => void }) {
  let obj = clones.get(p.uid)
  if (!obj) { const base = cache.get(p.tipo); if (base) { obj = base.clone(true); clones.set(p.uid, obj) } }
  if (!obj) return null
  const t = tam(p.tipo)
  return (
    <group position={[p.x, p.y + mediaAltura(p), p.z]} rotation={[0, (p.rotY * Math.PI) / 180, 0]}
      onPointerDown={e => { e.stopPropagation(); onAgarrar() }}>
      <group rotation={[(p.rotX * Math.PI) / 180, 0, 0]}>
        <primitive object={obj} />
        {sel && (
          <mesh raycast={() => null}>
            <boxGeometry args={[t.x + 2, t.y + 2, t.z + 2]} />
            <meshBasicMaterial color="#16a34a" wireframe transparent opacity={0.7} />
          </mesh>
        )}
      </group>
    </group>
  )
}

interface EscenaProps {
  piezas: Puesta[]; sel: number | null
  seleccionar: (uid: number | null) => void; moverPieza: (uid: number, x: number, z: number) => void
}

function Escena({ piezas, sel, seleccionar, moverPieza }: EscenaProps) {
  const invalidate = useThree(s => s.invalidate)
  const orbita = useRef<any>(null)
  // El arrastre vive en refs (no en estado) para responder en el mismo instante del toque,
  // sin esperar a que React vuelva a dibujar.
  const arrastre = useRef<number | null>(null)
  const vieneDeArrastre = useRef(false) // el clic que cierra un arrastre no debe deseleccionar

  const soltar = useRef(() => {
    if (arrastre.current == null) return
    arrastre.current = null
    if (orbita.current) orbita.current.enabled = true
  }).current

  // Si se suelta el dedo/ratón fuera de la mesa, igual se termina el arrastre
  useEffect(() => {
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', soltar)
    return () => { window.removeEventListener('pointerup', soltar); window.removeEventListener('pointercancel', soltar) }
  }, [soltar])

  const agarrar = (uid: number) => {
    arrastre.current = uid
    vieneDeArrastre.current = true
    if (orbita.current) orbita.current.enabled = false // que no gire la cámara mientras se mueve la pieza
    seleccionar(uid)
    invalidate()
  }

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[80, 160, 100]} intensity={1.1} />
      <directionalLight position={[-60, 50, -80]} intensity={0.4} />
      <gridHelper args={[MESA, Math.round(MESA / (STUD * 2)), '#94a3b8', '#b8c2cf']} position={[0, 0.1, 0]} />
      <Suelo
        onMover={(x, z) => { if (arrastre.current != null) { moverPieza(arrastre.current, x, z); invalidate() } }}
        onFin={soltar}
        onAbajo={() => { vieneDeArrastre.current = false }}
        onClic={delta => {
          if (vieneDeArrastre.current) { vieneDeArrastre.current = false; return }
          if (delta > 4) return // fue girar la vista, no un toque
          seleccionar(null); invalidate()
        }}
      />
      {piezas.map(p => (
        <PiezaPuesta key={p.uid} p={p} sel={sel === p.uid} onAgarrar={() => agarrar(p.uid)} />
      ))}
      <OrbitControls ref={orbita} enablePan={false} minDistance={50} maxDistance={420} maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 12, 0]} onChange={() => invalidate()} />
    </>
  )
}

export default function CatalogoEV3() {
  const { expanded, toggle } = useExpand()
  const [piezas, setPiezas] = useState<Puesta[]>([])
  const [sel, setSel] = useState<number | null>(null)
  const [cargando, setCargando] = useState<string | null>(null)
  const uid = useRef(1)

  const agregar = async (tipo: string) => {
    try {
      if (!cache.has(tipo)) { setCargando(tipo); await cargarPieza(tipo); setCargando(null) }
      const u = uid.current++
      setPiezas(ps => [...ps, { uid: u, tipo, ...lugarLibre(ps), y: 0, rotY: 0, rotX: 0 }])
      setSel(u)
    } catch { setCargando(null) }
  }
  const cambiarSel = (f: (p: Puesta) => Puesta) => setPiezas(ps => ps.map(p => (p.uid === sel ? f(p) : p)))
  const limite = MESA / 2 - STUD
  const moverPieza = (u: number, x: number, z: number) => setPiezas(ps => ps.map(p => (p.uid === u ? {
    ...p,
    x: Math.max(-limite, Math.min(limite, ajustar(x))),
    z: Math.max(-limite, Math.min(limite, ajustar(z))),
  } : p)))
  const girarSel = () => cambiarSel(p => ({ ...p, rotY: (p.rotY + 45) % 360 }))
  const voltearSel = () => cambiarSel(p => ({ ...p, rotX: (p.rotX + 90) % 360 }))
  const subirSel = (d: number) => cambiarSel(p => ({ ...p, y: Math.max(0, Math.min(STUD * 30, p.y + d * STUD)) }))
  const borrarSel = () => { if (sel != null) { clones.delete(sel); setPiezas(ps => ps.filter(p => p.uid !== sel)); setSel(null) } }
  const limpiar = () => { clones.clear(); setPiezas([]); setSel(null) }

  const piezaSel = piezas.find(p => p.uid === sel)
  const resumen = () => {
    const n: Record<string, number> = {}
    for (const p of piezas) n[NOMBRE[p.tipo] || p.tipo] = (n[NOMBRE[p.tipo] || p.tipo] || 0) + 1
    return Object.entries(n).map(([k, v]) => `${v}× ${k}`).join(', ')
  }
  const btn = 'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold disabled:opacity-40'

  return (
    <div className={`flex flex-col overflow-hidden bg-slate-100 text-slate-900 ${expanded ? 'fixed inset-0 z-[200]' : 'relative h-full min-h-[520px]'}`}>
      <div className="flex flex-wrap items-center gap-2 bg-[#2b6fd6] px-3 py-1.5 text-white">
        <Hand className="h-4 w-4" />
        <span className="text-sm font-extrabold tracking-tight">Catálogo de piezas EV3 — construye libre</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">{piezas.length} {piezas.length === 1 ? 'pieza' : 'piezas'}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <EnviarTarea
            simulador="LEGO EV3 (construcción libre)"
            sigla="EV3C"
            botonClassName="flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-white disabled:opacity-80"
            obtenerEntrega={() => ({
              output: `LEGO EV3 — construcción libre con ${piezas.length} piezas${piezas.length ? ': ' + resumen() : ''}.`,
              files: { ev3Libre: { piezas } },
            })}
          />
          <button onClick={toggle} title={expanded ? 'Salir de pantalla completa' : 'Pantalla completa'} className="rounded-md p-1.5 hover:bg-white/20">
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Catálogo */}
        <div className="flex shrink-0 flex-row gap-1.5 overflow-x-auto border-slate-300 bg-white p-2 lg:w-[190px] lg:flex-col lg:overflow-y-auto lg:border-r">
          <p className="hidden text-[11px] font-bold uppercase tracking-wide text-slate-400 lg:block">Piezas</p>
          {CATALOGO.map(it => (
            <button key={it.tipo} onClick={() => agregar(it.tipo)} disabled={!!cargando}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:border-[#2b6fd6] hover:bg-blue-50 disabled:opacity-50">
              <span className="text-lg">{it.emoji}</span>
              <span className="whitespace-nowrap">{it.nombre}</span>
              {cargando === it.tipo && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
            </button>
          ))}
        </div>

        {/* Área 3D */}
        <div className="relative min-h-[300px] flex-1">
          <Canvas frameloop="demand" camera={{ position: [90, 90, 120], fov: 45 }} dpr={[1, 1.6]} style={{ background: 'linear-gradient(#e0f2fe,#eef2f7)', touchAction: 'none' }}>
            <Escena piezas={piezas} sel={sel} seleccionar={setSel} moverPieza={moverPieza} />
          </Canvas>

          {/* ayuda */}
          <div className="pointer-events-none absolute left-2 top-2 max-w-[calc(100%-1rem)] rounded-lg bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
            <MousePointer2 className="mr-1 inline h-3 w-3" />
            {piezas.length === 0
              ? 'Elige una pieza del catálogo para ponerla en la mesa.'
              : piezaSel
                ? `${NOMBRE[piezaSel.tipo]}: arrástrala por la mesa o usa los botones de abajo.`
                : 'Toca una pieza para moverla. Arrastra el fondo para girar la vista.'}
          </div>

          {/* herramientas de la pieza seleccionada */}
          <div className="absolute bottom-2 left-1/2 flex max-w-[calc(100%-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-xl bg-white/95 px-2.5 py-1.5 shadow-lg">
            <button onClick={girarSel} disabled={sel == null} title="Girar sobre la mesa" className={`${btn} bg-slate-800 text-white hover:bg-slate-900`}><RotateCw className="h-4 w-4" /> Girar</button>
            <button onClick={voltearSel} disabled={sel == null} title="Voltear (parar o acostar la pieza)" className={`${btn} bg-slate-800 text-white hover:bg-slate-900`}><FlipVertical2 className="h-4 w-4" /> Voltear</button>
            <button onClick={() => subirSel(1)} disabled={sel == null} title="Subir un módulo" className={`${btn} bg-[#2b6fd6] text-white hover:bg-[#245fb8]`}><ArrowUp className="h-4 w-4" /> Subir</button>
            <button onClick={() => subirSel(-1)} disabled={sel == null || !piezaSel || piezaSel.y <= 0} title="Bajar un módulo" className={`${btn} bg-[#2b6fd6] text-white hover:bg-[#245fb8]`}><ArrowDown className="h-4 w-4" /> Bajar</button>
            <button onClick={borrarSel} disabled={sel == null} className={`${btn} bg-red-600 text-white hover:bg-red-700`}><Trash2 className="h-4 w-4" /> Borrar</button>
            <button onClick={limpiar} disabled={!piezas.length} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40">Limpiar todo</button>
          </div>
        </div>
      </div>
    </div>
  )
}
