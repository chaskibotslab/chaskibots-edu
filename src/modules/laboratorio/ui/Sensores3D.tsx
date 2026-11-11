'use client'

// Lo que «ven» los sensores, dibujado en la arena: la mancha que lee cada
// sensor de línea (verde si ve blanco, gris si ve negro), el cono del
// ultrasonido hasta el eco medido, el rayo de cada sensor de obstáculo y la
// pirámide de la cámara con su huella en el piso. Solo visual; lee las mismas
// lecturas que la simulación ya calculó.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { aRobot, poses, type Pose } from '../engine/ensamblaje'
import type { Simulacion } from '../engine/simulation'

const ALCANCE_CAMARA = 1.5
const VERDE = new THREE.Color('#22c55e'), GRIS = new THREE.Color('#334155')
const NARANJA = new THREE.Color('#f97316'), ROJO = new THREE.Color('#ef4444')

export default function Sensores3D({ sim }: { sim: Simulacion }) {
  const { plan, doc, fisica } = sim
  const discos = useRef<(THREE.Mesh | null)[]>([])
  const conos = useRef<(THREE.Mesh | null)[]>([])
  const rayos = useRef<(THREE.Line | null)[]>([])
  const camaras = useRef<(THREE.LineSegments | null)[]>([])
  const posesRef = useRef<{ clave: string; ps: Map<string, Pose> } | null>(null)

  // Geometrías compartidas: cono con la punta en el origen apuntando a −y (se escala y gira por sensor).
  const cono = useMemo(() => { const g = new THREE.ConeGeometry(1, 1, 24, 1, true); g.translate(0, -0.5, 0); return g }, [])
  const rayo = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)]), [])
  const objetos = useMemo(() => ({
    rayos: plan.obstaculos.map(() => new THREE.Line(rayo, new THREE.LineBasicMaterial({ color: '#f97316', transparent: true, opacity: 0.9 }))),
    camaras: plan.camaras.map(() => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(16 * 3), 3))
      return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#a855f7', transparent: true, opacity: 0.85 }))
    }),
  }), [plan, rayo])

  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), d: new THREE.Vector3(), q: new THREE.Quaternion(), abajo: new THREE.Vector3(0, -1, 0) }), [])

  useFrame(() => {
    const angulos = fisica.angulosServo()
    const clave = JSON.stringify(angulos)
    if (posesRef.current?.clave !== clave) posesRef.current = { clave, ps: poses(doc, angulos) }
    const ps = posesRef.current.ps
    const mundo = (inst: string, local: [number, number, number]) => {
      const pose = ps.get(inst)
      if (!pose) return null
      const p = aRobot(pose, local)
      return fisica.puntoMundo({ x: p.x, y: p.y, z: p.z })
    }
    const direccion = (inst: string, local: THREE.Vector3) => {
      const pose = ps.get(inst)
      const l = local.clone().applyQuaternion(pose?.rot ?? new THREE.Quaternion())
      const w = fisica.direccionMundo({ x: l.x, y: l.y, z: l.z })
      return v.d.set(w.x, w.y, w.z).normalize()
    }
    const lecturas = sim.lecturasActuales

    plan.lineas.forEach((s, i) => {
      const m = discos.current[i]
      const o = mundo(s.instancia, [0, 0, 0])
      if (!m || !o) return
      m.position.set(o.x, 0.0016, o.z)
      const l = lecturas.find(x => x.tipo === 'linea' && x.instancia === s.instancia)
      const blanco = l?.tipo === 'linea' && l.reflectancia >= s.umbral
      ;(m.material as THREE.MeshBasicMaterial).color.copy(blanco ? VERDE : GRIS)
    })

    plan.ultrasonidos.forEach((s, i) => {
      const m = conos.current[i]
      const o = mundo(s.instancia, s.origen)
      if (!m || !o) return
      const l = lecturas.find(x => x.tipo === 'ultrasonido' && x.instancia === s.instancia)
      // Sin eco, el cono se dibuja hasta 1 m (el alcance real de 4 m taparía toda la arena).
      const cm = l?.tipo === 'ultrasonido' && l.cm !== null ? l.cm : Math.min(s.alcanceCm, 100)
      const L = Math.max(0.02, Math.min(s.alcanceCm, cm) / 100)
      const d = direccion(s.instancia, v.a.set(1, 0, 0))
      m.position.set(o.x, o.y, o.z)
      m.quaternion.setFromUnitVectors(v.abajo, d)
      const r = L * Math.tan((s.aperturaGrados * Math.PI) / 360)
      m.scale.set(r, L, r)
    })

    plan.obstaculos.forEach((s, i) => {
      const m = rayos.current[i]
      const o = mundo(s.instancia, s.origen)
      if (!m || !o) return
      const l = lecturas.find(x => x.tipo === 'obstaculo' && x.instancia === s.instancia)
      const d = direccion(s.instancia, v.a.set(1, 0, 0))
      m.position.set(o.x, o.y, o.z)
      m.quaternion.setFromUnitVectors(v.b.set(1, 0, 0), d)
      m.scale.setScalar(s.alcanceMm / 1000)
      ;(m.material as THREE.LineBasicMaterial).color.copy(l?.tipo === 'obstaculo' && l.detecta ? ROJO : NARANJA)
    })

    plan.camaras.forEach((c, i) => {
      const m = camaras.current[i]
      const o = mundo(c.instancia, c.origen)
      if (!m || !o) return
      const t = (c.inclinacion * Math.PI) / 180
      const tx = Math.tan((c.fovH * Math.PI) / 360), ty = Math.tan((c.fovV * Math.PI) / 360)
      const attr = m.geometry.getAttribute('position') as THREE.BufferAttribute
      // Cuatro esquinas de la imagen, en el orden de un rectángulo.
      const esquinas = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => {
        const local = v.a.set(Math.cos(t) + sy * ty * Math.sin(t), -Math.sin(t) + sy * ty * Math.cos(t), sx * tx)
        const d = direccion(c.instancia, local)
        const L = d.y < -1e-3 ? Math.min(ALCANCE_CAMARA, -o.y / d.y) : ALCANCE_CAMARA
        return new THREE.Vector3(o.x + d.x * L, o.y + d.y * L + 0.001, o.z + d.z * L)
      })
      let k = 0
      const pon = (p: { x: number; y: number; z: number }) => { attr.setXYZ(k++, p.x, p.y, p.z) }
      for (let e = 0; e < 4; e++) { pon(o); pon(esquinas[e]) }
      for (let e = 0; e < 4; e++) { pon(esquinas[e]); pon(esquinas[(e + 1) % 4]) }
      attr.needsUpdate = true
      m.geometry.computeBoundingSphere()
    })
  })

  return (
    <group>
      {plan.lineas.map((s, i) => (
        <mesh key={s.instancia} ref={el => { discos.current[i] = el }} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
          <circleGeometry args={[Math.max(0.006, s.radioMm / 1000), 20]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.75} depthWrite={false} />
        </mesh>
      ))}
      {plan.ultrasonidos.map((s, i) => (
        <mesh key={s.instancia} ref={el => { conos.current[i] = el }} geometry={cono} renderOrder={4}>
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {plan.obstaculos.map((s, i) => (
        <primitive key={s.instancia} object={objetos.rayos[i]} ref={(el: THREE.Line | null) => { rayos.current[i] = el }} />
      ))}
      {plan.camaras.map((c, i) => (
        <primitive key={c.instancia} object={objetos.camaras[i]} ref={(el: THREE.LineSegments | null) => { camaras.current[i] = el }} />
      ))}
    </group>
  )
}
