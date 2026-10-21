'use client'

// Modelo 3D del seguidor de línea, generado por código (sin archivos externos).
// Las medidas salen de robots/seguidorLinea.ts y del catálogo (en metros).
// Marco del robot: +x adelante, +y arriba, +z derecha.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Simulacion } from '../engine/simulation'
import type { RobotDef } from '../robots/seguidorLinea'

const mm = (v: number) => v / 1000

// Puntos aproximados de cada pin en el modelo (mm, marco del robot) para dibujar cables.
function anclaPin(inst: string, pin: string): [number, number, number] | null {
  const d = /^D(\d+)$/.exec(pin)
  const a = /^A(\d)$/.exec(pin)
  if (inst === 'uno') {
    if (d) return [40 - Number(d[1]) * 4.2, 32, 24]
    if (a) return [-6 + Number(a[1]) * 4.2, 32, -24]
    if (pin === '5V') return [-14, 32, -24]
    if (pin === 'GND') return [-19, 32, -24]
  }
  if (inst === 'driver') {
    const orden = ['ENA', 'IN1', 'IN2', 'IN3', 'IN4', 'ENB']
    const i = orden.indexOf(pin)
    if (i >= 0) return [-34, 33, -10 + i * 4]
    if (pin === 'OUT1') return [-55, 34, -21]
    if (pin === 'OUT2') return [-48, 34, -21]
    if (pin === 'OUT3') return [-55, 34, 21]
    if (pin === 'OUT4') return [-48, 34, 21]
    if (pin === '12V') return [-76, 34, -6]
    if (pin === 'GND') return [-76, 34, 0]
    if (pin === '5V') return [-76, 34, 6]
  }
  if (inst === 'ir_izq' || inst === 'ir_der') {
    const z = inst === 'ir_izq' ? -14 : 14
    const off = { VCC: -3, GND: -1, DO: 1, AO: 3 }[pin]
    if (off !== undefined) return [82, -15, z + off]
  }
  if (inst === 'motor_izq' || inst === 'motor_der') {
    const z = inst === 'motor_izq' ? -46 : 46
    return [-38, pin === 'M+' ? 4 : -4, z]
  }
  if (inst === 'bateria') return [-66, 4, pin === '+' ? -6 : 6]
  return null
}

function Cable({ desde, hasta, color }: { desde: [number, number, number]; hasta: [number, number, number]; color: string }) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...desde.map(mm) as [number, number, number])
    const b = new THREE.Vector3(...hasta.map(mm) as [number, number, number])
    const medio = a.clone().lerp(b, 0.5)
    medio.y = Math.max(a.y, b.y) + 0.012 + a.distanceTo(b) * 0.15
    const curva = new THREE.CatmullRomCurve3([a, a.clone().lerp(medio, 0.5).setY(medio.y * 0.95), medio, b.clone().lerp(medio, 0.5).setY(medio.y * 0.95), b])
    return new THREE.TubeGeometry(curva, 24, 0.0007, 5, false)
  }, [desde, hasta])
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  )
}

function Rueda({ z, refGiro }: { z: number; refGiro: React.RefObject<THREE.Group> }) {
  return (
    <group position={[0, 0, z]}>
      <group ref={refGiro}>
        {/* Llanta */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.033, 0.033, 0.026, 40]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        {/* Rin amarillo con rayos (para que se vea el giro) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.0275, 24]} />
          <meshStandardMaterial color="#facc15" roughness={0.5} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} position={[0, 0, z < 0 ? -0.014 : 0.014]}>
            <boxGeometry args={[0.04, 0.004, 0.002]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function SensorIR({ pos, refLed }: { pos: [number, number, number]; refLed: React.RefObject<THREE.MeshStandardMaterial> }) {
  const [x, y, z] = pos.map(mm)
  return (
    <group position={[x - 0.012, y + 0.003, z]}>
      {/* PCB azul */}
      <mesh castShadow>
        <boxGeometry args={[0.032, 0.0016, 0.013]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
      </mesh>
      {/* TCRT5000 (emisor + receptor) mirando al piso */}
      <mesh position={[0.012, -0.004, 0]}>
        <boxGeometry args={[0.006, 0.007, 0.01]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0.012, -0.0078, -0.0025]}>
        <cylinderGeometry args={[0.0018, 0.0018, 0.001, 12]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.012, -0.0078, 0.0025]}>
        <cylinderGeometry args={[0.0018, 0.0018, 0.001, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Potenciómetro de sensibilidad */}
      <mesh position={[-0.004, 0.003, 0]}>
        <boxGeometry args={[0.006, 0.004, 0.006]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      {/* LED indicador: se enciende cuando ve superficie blanca (DO en LOW) */}
      <mesh position={[0.004, 0.0015, 0.004]}>
        <boxGeometry args={[0.002, 0.0012, 0.0016]} />
        <meshStandardMaterial ref={refLed} color="#7f1d1d" emissive="#ef4444" emissiveIntensity={0} />
      </mesh>
      {/* Zona del piso que lee el sensor (~3 mm de radio) */}
      <mesh position={[0.012, -0.0159, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0035, 20]} />
        <meshBasicMaterial color="#ff2d2d" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* Soporte acrílico hasta el chasis */}
      <mesh position={[-0.012, 0.016, 0]}>
        <boxGeometry args={[0.003, 0.032, 0.012]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function ArduinoUno({ refLed13 }: { refLed13: React.RefObject<THREE.MeshStandardMaterial> }) {
  return (
    <group position={[0.01, 0.028, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.0686, 0.0016, 0.0534]} />
        <meshStandardMaterial color="#00878f" roughness={0.55} />
      </mesh>
      {/* USB-B y jack de alimentación (atrás) */}
      <mesh position={[-0.03, 0.0065, 0.012]}>
        <boxGeometry args={[0.016, 0.011, 0.012]} />
        <meshStandardMaterial color="#c0c4cc" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-0.03, 0.0055, -0.017]}>
        <boxGeometry args={[0.014, 0.011, 0.009]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* ATmega328P */}
      <mesh position={[0.012, 0.0028, -0.006]}>
        <boxGeometry args={[0.035, 0.004, 0.0075]} />
        <meshStandardMaterial color="#141414" roughness={0.4} />
      </mesh>
      {/* Cristal de 16 MHz */}
      <mesh position={[-0.006, 0.0022, -0.001]}>
        <boxGeometry args={[0.011, 0.003, 0.0045]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Tiras de pines */}
      <mesh position={[0.008, 0.0048, 0.0235]}>
        <boxGeometry args={[0.05, 0.0085, 0.0025]} />
        <meshStandardMaterial color="#0b0b0b" />
      </mesh>
      <mesh position={[0.004, 0.0048, -0.0235]}>
        <boxGeometry args={[0.044, 0.0085, 0.0025]} />
        <meshStandardMaterial color="#0b0b0b" />
      </mesh>
      {/* LED 13 */}
      <mesh position={[0.008, 0.0014, 0.014]}>
        <boxGeometry args={[0.003, 0.0012, 0.0016]} />
        <meshStandardMaterial ref={refLed13} color="#78350f" emissive="#fb923c" emissiveIntensity={0} />
      </mesh>
      {/* LED ON */}
      <mesh position={[0.026, 0.0014, 0.017]}>
        <boxGeometry args={[0.003, 0.0012, 0.0016]} />
        <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={1.5} />
      </mesh>
      {/* Separadores */}
      {[[-0.03, -0.022], [-0.03, 0.022], [0.03, -0.022], [0.03, 0.022]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.006, z]}>
          <cylinderGeometry args={[0.0018, 0.0018, 0.011, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function L298N() {
  return (
    <group position={[-0.055, 0.028, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.043, 0.0016, 0.043]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} />
      </mesh>
      {/* Disipador con aletas */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-0.004, 0.012, -0.012 + i * 0.004]} castShadow>
          <boxGeometry args={[0.022, 0.023, 0.0012]} />
          <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Borneras azules */}
      {[[-0.0035, -0.018], [-0.0035, 0.018], [-0.0185, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x - 0.0, 0.005, z]}>
          <boxGeometry args={i === 2 ? [0.007, 0.009, 0.016] : [0.016, 0.009, 0.007]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>
      ))}
      {/* Pines de control */}
      <mesh position={[0.019, 0.0045, 0]}>
        <boxGeometry args={[0.0025, 0.0085, 0.025]} />
        <meshStandardMaterial color="#0b0b0b" />
      </mesh>
    </group>
  )
}

function MotorTT({ z }: { z: number }) {
  return (
    <group position={[-0.008, 0, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.046, 0.022, 0.019]} />
        <meshStandardMaterial color="#facc15" roughness={0.5} />
      </mesh>
      {/* Motor metálico detrás de la caja reductora */}
      <mesh position={[-0.031, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.0095, 0.0095, 0.02, 20]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Eje */}
      <mesh position={[0.008, 0, z < 0 ? -0.014 : 0.014]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0027, 0.0027, 0.012, 10]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>
    </group>
  )
}

export default function Robot3D({ sim, robot }: { sim: Simulacion; robot: RobotDef }) {
  const grupo = useRef<THREE.Group>(null)
  const ruedaIzq = useRef<THREE.Group>(null)
  const ruedaDer = useRef<THREE.Group>(null)
  const led13 = useRef<THREE.MeshStandardMaterial>(null)
  const ledIr = [useRef<THREE.MeshStandardMaterial>(null), useRef<THREE.MeshStandardMaterial>(null)]
  const g = robot.geometria
  const ch = g.chasis_mm

  const cables = useMemo(
    () => robot.conexiones
      .map(c => ({ c, a: anclaPin(c.de[0], c.de[1]), b: anclaPin(c.a[0], c.a[1]) }))
      .filter(x => x.a && x.b) as { c: (typeof robot.conexiones)[number]; a: [number, number, number]; b: [number, number, number] }[],
    [robot],
  )

  useFrame(() => {
    const f = sim.fisica
    if (!f || !grupo.current) return
    const p = f.body.translation()
    const q = f.body.rotation()
    grupo.current.position.set(p.x, p.y, p.z)
    grupo.current.quaternion.set(q.x, q.y, q.z, q.w)
    // Rodar hacia adelante = giro negativo alrededor de +z.
    if (ruedaIzq.current) ruedaIzq.current.rotation.z = -f.ruedas.izq.angulo
    if (ruedaDer.current) ruedaDer.current.rotation.z = -f.ruedas.der.angulo
    const d13 = sim.pinesActuales.D13
    if (led13.current) led13.current.emissiveIntensity = d13?.mode === 'output' && d13.duty > 0.05 ? 3 * d13.duty + 0.5 : 0
    sim.lecturasActuales.forEach((s, i) => {
      const m = ledIr[i]?.current
      // El LED del módulo se prende cuando DO está en LOW (ve blanco).
      if (m) m.emissiveIntensity = s.reflectancia >= 0.5 ? 2.5 : 0
    })
  })

  const irs = robot.instancias.filter(i => i.tipo === 'tcrt5000')

  return (
    <group ref={grupo}>
      {/* Chasis de acrílico */}
      <mesh position={[mm(ch.centro_x), mm(ch.altura), 0]} castShadow receiveShadow>
        <boxGeometry args={[mm(ch.largo), mm(ch.espesor), mm(ch.ancho)]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.45} roughness={0.15} transmission={0.2} thickness={0.003} />
      </mesh>
      <ArduinoUno refLed13={led13} />
      <L298N />
      {/* Batería 2×18650 bajo el chasis */}
      <group position={[-0.028, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.077, 0.021, 0.041]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        {[-0.0095, 0.0095].map(z => (
          <mesh key={z} position={[0, 0.004, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.009, 0.009, 0.065, 20]} />
            <meshStandardMaterial color="#2563eb" roughness={0.35} />
          </mesh>
        ))}
      </group>
      <MotorTT z={-0.046} />
      <MotorTT z={0.046} />
      <Rueda z={-mm(g.vias_mm) / 2} refGiro={ruedaIzq} />
      <Rueda z={mm(g.vias_mm) / 2} refGiro={ruedaDer} />
      {/* Rueda loca */}
      <group position={g.rueda_loca_mm.map(mm) as [number, number, number]}>
        <mesh castShadow>
          <sphereGeometry args={[0.008, 20, 16]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.009, 0.01, 0.026, 16]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.35} />
        </mesh>
      </group>
      {irs.map((s, i) => <SensorIR key={s.id} pos={s.posicion} refLed={ledIr[i]} />)}
      {cables.map(({ c, a, b }, i) => <Cable key={i} desde={a} hasta={b} color={c.color} />)}
    </group>
  )
}
