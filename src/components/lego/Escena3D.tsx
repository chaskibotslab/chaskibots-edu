'use client'

/**
 * Escena 3D del simulador LEGO (react-three-fiber).
 * - Dibuja el tapete en un canvas (en cm) que sirve de textura del piso y de
 *   fuente para el sensor de color (motor.leerColorEn).
 * - Integra la física en cada cuadro (motor.tick) y mueve el robot.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { LegoMotor, PASO, Tapete } from './engine'
import { crearTapete } from './tapete'
import { aligerar, cargarLDraw, piezasPorPaso } from './ldraw'
import { GUIA_ROBOT, type Guia } from './guiasEV3'

function usarTapete(motor: LegoMotor, tapete: Tapete) {
  return useMemo(() => {
    const t = crearTapete(tapete)
    motor.leerColorEn = t.color
    motor.leerLuzEn = t.luz
    const tex = new THREE.CanvasTexture(t.canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [motor, tapete])
}

// El robot real (el mismo que se arma en «Armar»), a escala del campo.
// 1 LDU = 0,04 cm; se dibuja un poco más grande (×1,5) para que se vea bien en el tapete.
const CM_POR_LDU = 0.04 * 1.5

function usarRobotReal(guia: Guia) {
  const [robot, setRobot] = useState<{ raiz: THREE.Group; ruedasL: THREE.Object3D[]; ruedasR: THREE.Object3D[] } | null>(null)
  useEffect(() => {
    let vivo = true
    setRobot(null)
    cargarLDraw(guia.archivo).then(g => {
      if (!vivo) return
      aligerar(g)
      g.rotation.x = Math.PI            // LDraw usa Y hacia abajo
      g.scale.setScalar(CM_POR_LDU)
      const raiz = new THREE.Group()
      raiz.rotation.y = -Math.PI / 2    // el frente del modelo (+z LDraw) pasa a +x, el frente del simulador
      raiz.position.y = 70 * CM_POR_LDU // el eje de las ruedas queda a la altura de su radio
      raiz.add(g)
      const piezas = piezasPorPaso(g)
      setRobot({
        raiz,
        ruedasL: piezas.filter(p => p.paso === guia.ruedas[0]).map(p => p.obj),
        ruedasR: piezas.filter(p => p.paso === guia.ruedas[1]).map(p => p.obj),
      })
    }).catch(() => { /* se queda el robot sencillo */ })
    return () => { vivo = false }
  }, [guia])
  return robot
}

function Robot({ motor, guia, velocidad }: { motor: LegoMotor; guia: Guia; velocidad: number }) {
  const ref = useRef<THREE.Group>(null)
  const real = usarRobotReal(guia)
  useEffect(() => { giro.current = { l: 0, r: 0 } }, [real])
  const giro = useRef({ l: 0, r: 0 })
  const pendiente = useRef(0)
  useFrame((_, delta) => {
    // pasos fijos de física: el resultado no depende de la velocidad de la máquina
    pendiente.current += Math.min(delta, 0.1) * velocidad
    let n = 0
    while (pendiente.current >= PASO && n < 16) { motor.tick(PASO); pendiente.current -= PASO; n++ }
    if (n === 16) pendiente.current = 0
    const g = ref.current
    if (g) { g.position.x = motor.x; g.position.z = motor.z; g.rotation.y = -motor.ang }
    if (real) {
      // las ruedas giran según los grados que lleva cada motor
      // (÷1,5 porque la rueda dibujada es 1,5 veces más grande; signo negativo = rueda hacia adelante)
      const l = THREE.MathUtils.degToRad(motor.gradosL) / 1.5, r = THREE.MathUtils.degToRad(motor.gradosR) / 1.5
      for (const o of real.ruedasL) o.rotateZ(-(l - giro.current.l))
      for (const o of real.ruedasR) o.rotateZ(-(r - giro.current.r))
      giro.current = { l, r }
    }
  })
  return (
    <group ref={ref} position={[motor.x, 0, motor.z]} rotation={[0, -motor.ang, 0]}>
      {real ? <primitive object={real.raiz} /> : <RobotSencillo />}
    </group>
  )
}

/** Robot de bloques que se muestra mientras cargan las piezas reales. */
function RobotSencillo() {
  return (
    <>
      {/* chasis (forward = +x local) */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[16, 6, 12]} />
        <meshStandardMaterial color="#d6232e" />
      </mesh>
      {/* torre/ladrillo */}
      <mesh position={[-2, 10, 0]} castShadow>
        <boxGeometry args={[8, 4, 9]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
      {/* sensor frontal */}
      <mesh position={[9, 4, 0]} castShadow>
        <boxGeometry args={[3, 3, 6]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      {/* ruedas */}
      {[[-5, 7], [-5, -7], [5, 7], [5, -7]].map(([x, z], i) => (
        <mesh key={i} position={[x, 3, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[3, 3, 2.4, 20]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </>
  )
}

/** Objetos que el robot empuja (latas, cajas, rival) y puntos de control: se actualizan en cada cuadro. */
function Dinamicos({ motor, tapete }: { motor: LegoMotor; tapete: Tapete }) {
  const moviles = useRef<(THREE.Group | null)[]>([])
  const puntos = useRef<(THREE.Mesh | null)[]>([])
  useFrame(() => {
    motor.moviles.forEach((m, i) => {
      const g = moviles.current[i]
      if (!g) return
      g.position.set(m.x, m.fuera ? -1 : 0, m.z)
      g.rotation.set(m.fuera ? 0.5 : 0, -m.ang, 0)
    })
    puntos.current.forEach((p, i) => { if (p) p.visible = i >= motor.puntosHechos })
  })
  return (
    <>
      {(tapete.moviles || []).map((m, i) => (
        <group key={i} ref={g => { moviles.current[i] = g }} position={[m.x, 0, m.z]}>
          {m.tipo === 'rival' ? (
            <>
              <mesh position={[0, 5, 0]} castShadow><boxGeometry args={[m.r * 1.7, 8, m.r * 1.5]} /><meshStandardMaterial color={m.color || '#7c3aed'} /></mesh>
              <mesh position={[-1, 11, 0]} castShadow><boxGeometry args={[m.r, 4, m.r * 1.1]} /><meshStandardMaterial color="#1f2937" /></mesh>
              <mesh position={[m.r * 0.9, 3, 0]} castShadow><boxGeometry args={[1.5, 5, m.r * 1.9]} /><meshStandardMaterial color="#111827" /></mesh>
              {[1, -1].map(l => <mesh key={l} position={[0, 3.5, l * m.r * 0.85]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[3.5, 3.5, 2.4, 18]} /><meshStandardMaterial color="#111" /></mesh>)}
            </>
          ) : (
            <mesh position={[0, 6, 0]} castShadow><cylinderGeometry args={[m.r, m.r, 12, 24]} /><meshStandardMaterial color={m.color || '#f59e0b'} /></mesh>
          )}
        </group>
      ))}
      {(tapete.puntos || []).map((p, i) => (
        <mesh key={i} ref={m => { puntos.current[i] = m }} position={[p.x, 0.35, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[p.r - 4.5, p.r - 3, 32]} />
          <meshBasicMaterial color="#2563eb" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  )
}

function Mundo({ motor, tapete, guia, velocidad }: { motor: LegoMotor; tapete: Tapete; guia: Guia; velocidad: number }) {
  const tex = usarTapete(motor, tapete)
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[60, 120, 40]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      {/* piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[tapete.ancho, tapete.alto]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      {/* paredes del campo (si las tiene) */}
      {tapete.paredes !== false && [[0, -1], [0, 1], [-1, 0], [1, 0]].map(([dx, dz], i) => (
        <mesh key={i} position={[dx * (tapete.ancho / 2 + 1), 2, dz * (tapete.alto / 2 + 1)]}>
          <boxGeometry args={[dx ? 2 : tapete.ancho + 4, 4, dz ? 2 : tapete.alto + 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}
      {/* muros */}
      {(tapete.muros || []).map((w, i) => (
        <mesh key={i} position={[w.x, (w.alto || 14) / 2, w.z]} castShadow receiveShadow>
          <boxGeometry args={[w.w, w.alto || 14, w.h]} />
          <meshStandardMaterial color={w.color || '#64748b'} />
        </mesh>
      ))}
      <Dinamicos motor={motor} tapete={tapete} />
      {/* obstáculos */}
      {tapete.obstaculos.map((o, i) => (
        <mesh key={i} position={[o.x, (o.alto || 24) / 2, o.z]} castShadow>
          <cylinderGeometry args={[o.r, o.r, o.alto || 24, 24]} />
          <meshStandardMaterial color={o.color || '#64748b'} />
        </mesh>
      ))}
      {/* zona meta */}
      {tapete.meta && (
        <mesh position={[tapete.meta.x, 0.3, tapete.meta.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[tapete.meta.r - 2, tapete.meta.r, 32]} />
          <meshBasicMaterial color="#22c55e" side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
      )}
      <Robot motor={motor} guia={guia} velocidad={velocidad} />
      <OrbitControls enablePan={false} minDistance={45} maxDistance={360} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export default function Escena3D({ motor, tapete, version, robot = GUIA_ROBOT, velocidad = 1 }: { motor: LegoMotor; tapete: Tapete; version: number; robot?: Guia; velocidad?: number }) {
  // version fuerza remmontar el mundo al cambiar de misión (reconstruye textura/sensor)
  useEffect(() => { motor.cargar(tapete) }, [motor, tapete])
  return (
    <Canvas shadows camera={{ position: [30, 150, 160], fov: 42 }} dpr={[1, 1.8]} style={{ background: 'linear-gradient(#dbeafe,#eef2f7)' }}>
      <Mundo key={version} motor={motor} tapete={tapete} guia={robot} velocidad={velocidad} />
    </Canvas>
  )
}
