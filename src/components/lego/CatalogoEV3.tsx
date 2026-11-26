'use client'

/**
 * Catálogo de piezas LEGO EV3 reales (LDraw) con dos formas de construir:
 *  - Libre: eliges piezas y las acomodas como quieras (arrastrar, girar, voltear, subir/bajar).
 *  - Con guía: un tutorial paso a paso; eliges la pieza correcta y la arrastras a la silueta
 *    verde, donde encaja sola en su lugar exacto.
 * Render bajo demanda para no colgar máquinas modestas.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCw, FlipVertical2, ArrowUp, ArrowDown, Trash2, Maximize2, Minimize2, Loader2, Hand, MousePointer2, Trophy, Wand2, ChevronLeft, RotateCcw } from 'lucide-react'
import { useExpand } from '@/hooks/useExpand'
import EnviarTarea from '@/components/simuladores/EnviarTarea'
import { cargarLDraw, mostrarHasta, piezasPorPaso } from './ldraw'
import { GUIAS } from './guiasEV3'

interface ItemCat { tipo: string; nombre: string; emoji: string }
const GRUPOS: { grupo: string; items: ItemCat[] }[] = [
  { grupo: 'Electrónica', items: [
    { tipo: 'brick', nombre: 'Ladrillo EV3', emoji: '🧠' },
    { tipo: 'motor_grande', nombre: 'Motor grande', emoji: '⚙️' },
    { tipo: 'motor_mediano', nombre: 'Motor mediano', emoji: '⚙️' },
    { tipo: 'sensor_color', nombre: 'Sensor de color', emoji: '🎨' },
    { tipo: 'sensor_ir', nombre: 'Sensor infrarrojo', emoji: '📡' },
    { tipo: 'sensor_tactil', nombre: 'Sensor táctil', emoji: '👆' },
    { tipo: 'sensor_giro', nombre: 'Giroscopio', emoji: '🧭' },
  ] },
  { grupo: 'Ruedas', items: [
    { tipo: 'rueda', nombre: 'Rueda', emoji: '🛞' },
    { tipo: 'rueda_loca', nombre: 'Rueda loca', emoji: '⚪' },
  ] },
  { grupo: 'Vigas', items: [
    { tipo: 'viga_15', nombre: 'Viga 15', emoji: '➖' },
    { tipo: 'viga_11', nombre: 'Viga 11', emoji: '➖' },
    { tipo: 'viga_9', nombre: 'Viga 9', emoji: '➖' },
    { tipo: 'viga_7', nombre: 'Viga 7', emoji: '➖' },
    { tipo: 'viga_5', nombre: 'Viga 5', emoji: '➖' },
    { tipo: 'viga_3', nombre: 'Viga 3', emoji: '➖' },
    { tipo: 'viga_L', nombre: 'Viga en L 2×4', emoji: '📐' },
    { tipo: 'viga_L35', nombre: 'Viga en L 3×5', emoji: '📐' },
    { tipo: 'viga_T', nombre: 'Viga en T', emoji: '✝️' },
    { tipo: 'marco', nombre: 'Marco 5×7', emoji: '🔲' },
    { tipo: 'marco_11', nombre: 'Marco 5×11', emoji: '🔲' },
  ] },
  { grupo: 'Uniones', items: [
    { tipo: 'pin_negro', nombre: 'Pin negro', emoji: '📍' },
    { tipo: 'pin_largo', nombre: 'Pin largo azul', emoji: '📍' },
    { tipo: 'pin', nombre: 'Pin con tope', emoji: '📍' },
    { tipo: 'pin_eje', nombre: 'Pin-eje', emoji: '📍' },
    { tipo: 'buje', nombre: 'Buje', emoji: '⭕' },
    { tipo: 'eje_3', nombre: 'Eje 3', emoji: '📏' },
    { tipo: 'eje_5', nombre: 'Eje 5', emoji: '📏' },
    { tipo: 'eje', nombre: 'Eje 6', emoji: '📏' },
    { tipo: 'eje_8', nombre: 'Eje 8', emoji: '📏' },
    { tipo: 'union_ejes', nombre: 'Unión de ejes', emoji: '🔗' },
    { tipo: 'conector_recto', nombre: 'Conector recto', emoji: '🔗' },
    { tipo: 'conector_90', nombre: 'Conector 90°', emoji: '🔗' },
    { tipo: 'bloque_cruz', nombre: 'Bloque cruz 1×2', emoji: '➕' },
    { tipo: 'bloque_cruz3', nombre: 'Bloque cruz 1×3', emoji: '➕' },
    { tipo: 'conector_perp', nombre: 'Conector 3×3 con pines', emoji: '🔩' },
  ] },
  { grupo: 'Engranajes', items: [
    { tipo: 'engranaje_8', nombre: 'Engranaje 8', emoji: '⚙️' },
    { tipo: 'engranaje_12', nombre: 'Engranaje 12', emoji: '⚙️' },
    { tipo: 'engranaje_24', nombre: 'Engranaje 24', emoji: '⚙️' },
    { tipo: 'engranaje_40', nombre: 'Engranaje 40', emoji: '⚙️' },
  ] },
]
const NOMBRE: Record<string, string> = Object.fromEntries(GRUPOS.flatMap(g => g.items).map(c => [c.tipo, c.nombre]))

interface Puesta { uid: number; tipo: string; x: number; y: number; z: number; rotY: number; rotX: number }

const ESCALA = 0.22
const STUD = 20 * ESCALA                            // 1 módulo LEGO (distancia entre agujeros)
const MESA = 400
const CERCA = STUD * 5                              // distancia a la silueta para que la pieza encaje sola
const cache = new Map<string, THREE.Group>()        // tipo -> pieza base, centrada en su origen
const clones = new Map<number, THREE.Object3D>()    // uid -> clon colocado

const MAT_FANTASMA = new THREE.MeshBasicMaterial({ color: '#22c55e', transparent: true, opacity: 0.4, depthWrite: false })

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

async function cargarPieza(tipo: string): Promise<THREE.Group> {
  if (cache.has(tipo)) return cache.get(tipo)!
  const w = preparar(await cargarLDraw(`/ldraw/piezas/${tipo}.mpd`))
  cache.set(tipo, w)
  return w
}

/** Modelo de una guía, apoyado en la mesa y centrado. */
async function cargarModeloGuia(archivo: string): Promise<THREE.Group> {
  const g = await cargarLDraw(archivo)
  g.rotation.x = Math.PI
  g.scale.setScalar(ESCALA)
  g.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(g)
  const c = box.getCenter(new THREE.Vector3())
  g.position.set(-c.x, -box.min.y, -c.z)
  return g
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

/**
 * Modelo de la guía: muestra las piezas ya colocadas y la silueta verde del paso actual.
 * Avisa al padre dónde está la silueta (centro en la mesa) para saber cuándo encaja la pieza.
 */
function ModeloGuia({ modelo, paso, onObjetivo }: { modelo: THREE.Group; paso: number; onObjetivo: (o: { x: number; z: number } | null) => void }) {
  const invalidate = useThree(s => s.invalidate)
  const [anillo, setAnillo] = useState<{ x: number; z: number; r: number } | null>(null)

  useEffect(() => {
    mostrarHasta(modelo, paso)
    const fantasmas: THREE.Object3D[] = []
    for (const { obj, paso: n } of piezasPorPaso(modelo)) {
      if (n !== paso) continue
      const f = obj.clone(true)
      f.visible = true
      f.userData = { fantasma: true } // sin buildingStep: mostrarHasta no lo toca
      f.traverse((o: any) => {
        o.raycast = () => {} // la silueta no estorba al tocar la mesa
        if (o.isMesh) o.material = MAT_FANTASMA
        else if (o.isLine) o.visible = false
      })
      modelo.add(f)
      fantasmas.push(f)
    }
    if (fantasmas.length) {
      modelo.updateMatrixWorld(true)
      const box = new THREE.Box3()
      for (const f of fantasmas) box.expandByObject(f)
      const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3())
      onObjetivo({ x: c.x, z: c.z })
      setAnillo({ x: c.x, z: c.z, r: Math.max(s.x, s.z) / 2 + 3 })
    } else {
      onObjetivo(null)
      setAnillo(null)
    }
    invalidate()
    return () => { for (const f of fantasmas) modelo.remove(f) }
  }, [modelo, paso, onObjetivo, invalidate])

  return (
    <>
      <primitive object={modelo} />
      {anillo && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[anillo.x, 0.3, anillo.z]} raycast={() => null}>
          <ringGeometry args={[anillo.r, anillo.r + 2.5, 48]} />
          <meshBasicMaterial color="#16a34a" transparent opacity={0.8} />
        </mesh>
      )}
    </>
  )
}

interface EscenaProps {
  piezas: Puesta[]; sel: number | null
  seleccionar: (uid: number | null) => void; moverPieza: (uid: number, x: number, z: number) => void
  children?: React.ReactNode
}

function Escena({ piezas, sel, seleccionar, moverPieza, children }: EscenaProps) {
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
      {children}
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
  const piezasRef = useRef<Puesta[]>([])
  piezasRef.current = piezas

  // ── Modo con guía ──
  const [guiaId, setGuiaId] = useState<string>('') // '' = construcción libre
  const guia = useMemo(() => GUIAS.find(g => g.id === guiaId) || null, [guiaId])
  const [modelo, setModelo] = useState<THREE.Group | null>(null)
  const [pasoGuia, setPasoGuia] = useState(0)
  const [aviso, setAviso] = useState<string | null>(null)
  const objetivo = useRef<{ x: number; z: number } | null>(null)
  const fijarObjetivo = useRef((o: { x: number; z: number } | null) => { objetivo.current = o }).current
  const pasoActual = guia && pasoGuia < guia.pasos.length ? guia.pasos[pasoGuia] : null
  const guiaLista = !!guia && pasoGuia >= guia.pasos.length
  const botonPieza = useRef<HTMLButtonElement | null>(null)

  const limpiar = () => { clones.clear(); setPiezas([]); setSel(null) }

  useEffect(() => {
    limpiar(); setPasoGuia(0); setModelo(null); setAviso(null)
    if (!guia) return
    let vivo = true
    cargarModeloGuia(guia.archivo).then(g => { if (vivo) setModelo(g) }).catch(() => { if (vivo) setAviso('No se pudo cargar la guía. Revisa tu conexión.') })
    return () => { vivo = false }
  }, [guia])

  useEffect(() => { if (!aviso) return; const t = setTimeout(() => setAviso(null), 3200); return () => clearTimeout(t) }, [aviso])
  // Llevar a la vista el botón de la pieza que toca
  useEffect(() => { botonPieza.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }) }, [pasoGuia, guiaId, modelo])

  const avanzarGuia = () => { limpiar(); setPasoGuia(p => p + 1) }

  const agregar = async (tipo: string) => {
    if (guia) {
      if (!pasoActual) return
      if (tipo !== pasoActual.tipo) { setAviso(`Esa no es la pieza de este paso. Busca: ${NOMBRE[pasoActual.tipo]}.`); return }
      const ya = piezasRef.current.find(p => p.tipo === tipo)
      if (ya) { setSel(ya.uid); setAviso('Ya está en la mesa: arrástrala a la silueta verde.'); return }
    }
    try {
      if (!cache.has(tipo)) { setCargando(tipo); await cargarPieza(tipo); setCargando(null) }
      const u = uid.current++
      const lugar = guia ? { x: ajustar(70), z: ajustar(-50) } : lugarLibre(piezasRef.current)
      setPiezas(ps => [...ps, { uid: u, tipo, ...lugar, y: 0, rotY: 0, rotX: 0 }])
      setSel(u)
    } catch { setCargando(null); setAviso('No se pudo cargar esa pieza.') }
  }

  const cambiarSel = (f: (p: Puesta) => Puesta) => setPiezas(ps => ps.map(p => (p.uid === sel ? f(p) : p)))
  const limite = MESA / 2 - STUD
  const moverPieza = (u: number, x: number, z: number) => {
    // Con guía: si la pieza correcta llega cerca de la silueta, encaja sola en su lugar
    const o = objetivo.current
    if (guia && pasoActual && o && Math.hypot(x - o.x, z - o.z) < CERCA) {
      const p = piezasRef.current.find(q => q.uid === u)
      if (p && p.tipo === pasoActual.tipo) { avanzarGuia(); return }
    }
    setPiezas(ps => ps.map(p => (p.uid === u ? {
      ...p,
      x: Math.max(-limite, Math.min(limite, ajustar(x))),
      z: Math.max(-limite, Math.min(limite, ajustar(z))),
    } : p)))
  }
  const girarSel = () => cambiarSel(p => ({ ...p, rotY: (p.rotY + 45) % 360 }))
  const voltearSel = () => cambiarSel(p => ({ ...p, rotX: (p.rotX + 90) % 360 }))
  const subirSel = (d: number) => cambiarSel(p => ({ ...p, y: Math.max(0, Math.min(STUD * 30, p.y + d * STUD)) }))
  const borrarSel = () => { if (sel != null) { clones.delete(sel); setPiezas(ps => ps.filter(p => p.uid !== sel)); setSel(null) } }

  const piezaSel = piezas.find(p => p.uid === sel)
  const resumen = () => {
    const n: Record<string, number> = {}
    for (const p of piezas) n[NOMBRE[p.tipo] || p.tipo] = (n[NOMBRE[p.tipo] || p.tipo] || 0) + 1
    return Object.entries(n).map(([k, v]) => `${v}× ${k}`).join(', ')
  }
  const btn = 'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold disabled:opacity-40'
  const hechos = guia ? Math.min(pasoGuia, guia.pasos.length) : 0

  return (
    <div className={`flex flex-col overflow-hidden bg-slate-100 text-slate-900 ${expanded ? 'fixed inset-0 z-[200]' : 'relative h-full min-h-[520px]'}`}>
      <div className="flex flex-wrap items-center gap-2 bg-[#2b6fd6] px-3 py-1.5 text-white">
        <Hand className="h-4 w-4" />
        <span className="text-sm font-extrabold tracking-tight">Catálogo EV3</span>
        <select value={guiaId} onChange={e => setGuiaId(e.target.value)} title="Elige cómo construir"
          className="max-w-[60vw] rounded-md border border-white/40 bg-white/15 px-2 py-1 text-xs font-bold text-white outline-none [&>option]:text-slate-900">
          <option value="">🧩 Construir libre</option>
          {GUIAS.map(g => <option key={g.id} value={g.id}>{g.emoji} Guía: {g.nombre}</option>)}
        </select>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
          {guia ? `${hechos}/${guia.pasos.length} pasos` : `${piezas.length} ${piezas.length === 1 ? 'pieza' : 'piezas'}`}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <EnviarTarea
            simulador={guia ? `LEGO EV3 (guía: ${guia.nombre})` : 'LEGO EV3 (construcción libre)'}
            sigla="EV3C"
            botonClassName="flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-white disabled:opacity-80"
            obtenerEntrega={() => guia
              ? {
                  output: `LEGO EV3 — guía «${guia.nombre}»: ${hechos}/${guia.pasos.length} pasos. ${guiaLista ? '✅ ¡Terminada!' : '⏳ En progreso'}`,
                  files: { ev3Guia: { guia: guia.id, pasos: hechos, total: guia.pasos.length, terminado: guiaLista } },
                }
              : {
                  output: `LEGO EV3 — construcción libre con ${piezas.length} piezas${piezas.length ? ': ' + resumen() : ''}.`,
                  files: { ev3Libre: { piezas } },
                }}
          />
          <button onClick={toggle} title={expanded ? 'Salir de pantalla completa' : 'Pantalla completa'} className="rounded-md p-1.5 hover:bg-white/20">
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {guia && <div className="h-1.5 w-full bg-slate-200"><div className="h-full bg-green-500 transition-all" style={{ width: `${(hechos / guia.pasos.length) * 100}%` }} /></div>}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Catálogo */}
        <div className="flex shrink-0 flex-row gap-1.5 overflow-x-auto border-slate-300 bg-white p-2 lg:w-[200px] lg:flex-col lg:overflow-y-auto lg:border-r">
          {GRUPOS.map(g => (
            <div key={g.grupo} className="contents">
              <p className="hidden pt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400 lg:block">{g.grupo}</p>
              {g.items.map(it => {
                const toca = pasoActual?.tipo === it.tipo
                return (
                  <button key={it.tipo} ref={toca ? botonPieza : undefined} onClick={() => agregar(it.tipo)} disabled={!!cargando}
                    className={`flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold disabled:opacity-50 ${
                      toca ? 'border-green-500 bg-green-50 text-green-800 ring-2 ring-green-400'
                        : `border-slate-200 bg-slate-50 text-slate-700 hover:border-[#2b6fd6] hover:bg-blue-50 ${guia ? 'opacity-60' : ''}`}`}>
                    <span className="text-base">{it.emoji}</span>
                    <span className="whitespace-nowrap">{it.nombre}</span>
                    {cargando === it.tipo && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Área 3D */}
        <div className="relative min-h-[300px] flex-1">
          <Canvas frameloop="demand" camera={{ position: [90, 90, 120], fov: 45 }} dpr={[1, 1.6]} style={{ background: 'linear-gradient(#e0f2fe,#eef2f7)', touchAction: 'none' }}>
            <Escena piezas={piezas} sel={sel} seleccionar={setSel} moverPieza={moverPieza}>
              {guia && modelo && <ModeloGuia modelo={modelo} paso={pasoGuia} onObjetivo={fijarObjetivo} />}
            </Escena>
          </Canvas>

          {guia && !modelo && <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm text-slate-600"><span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Cargando la guía…</span></div>}

          {/* tarjeta de la guía o ayuda del modo libre */}
          {guia ? (
            <div className="absolute left-2 top-2 w-[min(300px,calc(100%-1rem))] rounded-xl bg-white/95 p-2.5 shadow-lg">
              {pasoActual ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Paso {pasoGuia + 1} de {guia.pasos.length}</p>
                  <h3 className="text-sm font-extrabold text-slate-900">{pasoActual.titulo}</h3>
                  <p className="mt-0.5 text-xs text-slate-700">{pasoActual.info}</p>
                  <p className="mt-1.5 rounded-md bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-800">
                    {piezas.length ? 'Arrastra la pieza hasta la silueta verde.' : <>Elige <b>{NOMBRE[pasoActual.tipo]}</b> en el catálogo.</>}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <button onClick={() => { limpiar(); setPasoGuia(p => Math.max(0, p - 1)) }} disabled={pasoGuia === 0} className="flex items-center gap-0.5 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-700 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /> Atrás</button>
                    <button onClick={avanzarGuia} title="Coloca esta pieza automáticamente" className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-900"><Wand2 className="h-3.5 w-3.5" /> Colocar por mí</button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 py-1 text-center">
                  <Trophy className="h-8 w-8 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-900">¡Terminaste: {guia.nombre}!</h3>
                  <p className="text-xs text-slate-700">Gira la vista para ver tu robot. En «Programar» puedes darle vida.</p>
                  <button onClick={() => { limpiar(); setPasoGuia(0) }} className="mt-1 flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-700"><RotateCcw className="h-3.5 w-3.5" /> Armar otra vez</button>
                </div>
              )}
            </div>
          ) : (
            <div className="pointer-events-none absolute left-2 top-2 max-w-[calc(100%-1rem)] rounded-lg bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
              <MousePointer2 className="mr-1 inline h-3 w-3" />
              {piezas.length === 0
                ? 'Elige una pieza del catálogo para ponerla en la mesa. ¿Primera vez? Prueba una guía arriba.'
                : piezaSel
                  ? `${NOMBRE[piezaSel.tipo]}: arrástrala por la mesa o usa los botones de abajo.`
                  : 'Toca una pieza para moverla. Arrastra el fondo para girar la vista.'}
            </div>
          )}

          {aviso && <div className="pointer-events-none absolute left-1/2 top-14 max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-lg bg-amber-500 px-3 py-1.5 text-center text-xs font-bold text-white shadow-lg">{aviso}</div>}

          {/* herramientas de la pieza seleccionada (solo en construcción libre) */}
          {!guia && (
            <div className="absolute bottom-2 left-1/2 flex max-w-[calc(100%-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-xl bg-white/95 px-2.5 py-1.5 shadow-lg">
              <button onClick={girarSel} disabled={sel == null} title="Girar sobre la mesa" className={`${btn} bg-slate-800 text-white hover:bg-slate-900`}><RotateCw className="h-4 w-4" /> Girar</button>
              <button onClick={voltearSel} disabled={sel == null} title="Voltear (parar o acostar la pieza)" className={`${btn} bg-slate-800 text-white hover:bg-slate-900`}><FlipVertical2 className="h-4 w-4" /> Voltear</button>
              <button onClick={() => subirSel(1)} disabled={sel == null} title="Subir un módulo" className={`${btn} bg-[#2b6fd6] text-white hover:bg-[#245fb8]`}><ArrowUp className="h-4 w-4" /> Subir</button>
              <button onClick={() => subirSel(-1)} disabled={sel == null || !piezaSel || piezaSel.y <= 0} title="Bajar un módulo" className={`${btn} bg-[#2b6fd6] text-white hover:bg-[#245fb8]`}><ArrowDown className="h-4 w-4" /> Bajar</button>
              <button onClick={borrarSel} disabled={sel == null} className={`${btn} bg-red-600 text-white hover:bg-red-700`}><Trash2 className="h-4 w-4" /> Borrar</button>
              <button onClick={limpiar} disabled={!piezas.length} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40">Limpiar todo</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
