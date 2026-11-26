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
import { LegoMotor, Tapete } from './engine'
import { colorMasCercano } from './colores'
import { aligerar, cargarLDraw, piezasPorPaso } from './ldraw'
import { GUIA_ROBOT, type Guia } from './guiasEV3'

const SCALE = 6 // px por cm en el canvas del tapete

function usarTapete(motor: LegoMotor, tapete: Tapete) {
  return useMemo(() => {
    const W = Math.round(tapete.ancho * SCALE)
    const H = Math.round(tapete.alto * SCALE)
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.fillStyle = tapete.colorPiso || '#eef2f7'
    ctx.fillRect(0, 0, W, H)
    // Pintar en cm: origen al centro, +x derecha, +z abajo
    ctx.save()
    ctx.translate(W / 2, H / 2)
    ctx.scale(SCALE, SCALE)
    tapete.pintar?.(ctx)
    ctx.restore()

    // Sensor de color: muestrea el pixel bajo (x,z) en cm
    motor.leerColorEn = (x: number, z: number) => {
      const cx = Math.round((x + tapete.ancho / 2) * SCALE)
      const cz = Math.round((z + tapete.alto / 2) * SCALE)
      if (cx < 0 || cz < 0 || cx >= W || cz >= H) return 'blanco'
      try { const d = ctx.getImageData(cx, cz, 1, 1).data; return colorMasCercano(d[0], d[1], d[2]) } catch { return 'blanco' }
    }

    const tex = new THREE.CanvasTexture(canvas)
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

function Robot({ motor, guia }: { motor: LegoMotor; guia: Guia }) {
  const ref = useRef<THREE.Group>(null)
  const real = usarRobotReal(guia)
  useEffect(() => { giro.current = { l: 0, r: 0 } }, [real])
  const giro = useRef({ l: 0, r: 0 })
  useFrame((_, delta) => {
    motor.tick(Math.min(delta, 0.05))
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

function Mundo({ motor, tapete, guia }: { motor: LegoMotor; tapete: Tapete; guia: Guia }) {
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
      {/* borde del campo */}
      <lineSegments position={[0, 0.2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(tapete.ancho, 0.1, tapete.alto)]} />
        <lineBasicMaterial color="#94a3b8" />
      </lineSegments>
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
      <Robot motor={motor} guia={guia} />
      <OrbitControls enablePan={false} minDistance={45} maxDistance={360} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export default function Escena3D({ motor, tapete, version, robot = GUIA_ROBOT }: { motor: LegoMotor; tapete: Tapete; version: number; robot?: Guia }) {
  // version fuerza remmontar el mundo al cambiar de misión (reconstruye textura/sensor)
  useEffect(() => { motor.cargar(tapete) }, [motor, tapete])
  return (
    <Canvas shadows camera={{ position: [30, 150, 160], fov: 42 }} dpr={[1, 1.8]} style={{ background: 'linear-gradient(#dbeafe,#eef2f7)' }}>
      <Mundo key={version} motor={motor} tapete={tapete} guia={robot} />
    </Canvas>
  )
}
