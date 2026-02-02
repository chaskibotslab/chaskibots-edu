'use client'

import { useRef, useState, useCallback, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'
import { 
  RotateCcw, ArrowUp, ArrowDown, Play, Pause,
  ArrowLeft, ArrowRight, Square, Map, Trophy, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, Lightbulb, Eye, Gauge, Send
} from 'lucide-react'
import Image from 'next/image'

// Tipos
interface RobotState {
  x: number
  z: number
  angle: number
  speed: number
  leftMotor: number
  rightMotor: number
  leds: { [pin: number]: boolean }
  buzzerFreq: number
  ultrasonicDistance: number
  irSensor: boolean
  servoAngle: number
  isMoving: boolean
}

interface SimulatorCommand {
  type: 'move_forward' | 'move_backward' | 'turn_left' | 'turn_right' | 'stop' | 
        'led_on' | 'led_off' | 'buzzer' | 'servo' | 'delay' | 'motor'
  params: any
  duration?: number
}

interface RobotSimulator3DProps {
  commands?: SimulatorCommand[]
  onStateChange?: (state: RobotState) => void
  onRequestCommands?: () => SimulatorCommand[]
}

// Definición de laberintos/desafíos
interface Collectible {
  id: string
  x: number
  z: number
  type: 'star' | 'gem' | 'coin' | 'key'
  collected?: boolean
}

interface PushableObject {
  id: string
  x: number
  z: number
  type: 'cup' | 'box' | 'cylinder'
  radius: number
}

interface Challenge {
  id: string
  name: string
  description: string
  category: 'laberinto' | 'coleccionables' | 'minisumo'
  obstacles: Array<{x: number, z: number, w: number, h: number}>
  start: { x: number, z: number, angle: number }
  goal: { x: number, z: number, radius: number }
  difficulty: 'easy' | 'medium' | 'hard'
  collectibles?: Collectible[]
  requireAllCollectibles?: boolean
  pushableObjects?: PushableObject[]
  dohyo?: { x: number, z: number, radius: number }
  winCondition?: 'reach_goal' | 'push_all_out'
}

type ChallengeCategory = 'laberinto' | 'coleccionables' | 'minisumo'

const CATEGORY_INFO: Record<ChallengeCategory, { name: string, icon: string, color: string }> = {
  laberinto: { name: 'Laberintos', icon: '🧩', color: 'from-blue-500/20 to-cyan-500/20' },
  coleccionables: { name: 'Coleccionables', icon: '⭐', color: 'from-purple-500/20 to-pink-500/20' },
  minisumo: { name: 'Mini Sumo', icon: '🥋', color: 'from-red-500/20 to-orange-500/20' }
}

// Área de juego: 400x400 unidades (centrado en 200,200)
// El círculo 3D tiene radio 5, que equivale a 200 unidades desde el centro
// Todos los obstáculos deben estar entre 40 y 360 para quedar dentro del círculo
const ARENA_SIZE = 400
const ARENA_CENTER = 200
const ARENA_MARGIN = 50 // Margen desde el borde

const CHALLENGES: Challenge[] = [
  // === LABERINTOS - NIVEL FÁCIL === (pasillos anchos ~100 unidades)
  {
    id: 'basic',
    name: 'Camino Recto',
    description: 'Llega a la meta en línea recta',
    category: 'laberinto',
    difficulty: 'easy',
    obstacles: [
      { x: 60, z: 100, w: 280, h: 15 },
      { x: 60, z: 285, w: 280, h: 15 },
    ],
    start: { x: 70, z: 200, angle: 0 },
    goal: { x: 330, z: 200, radius: 35 }
  },
  {
    id: 'turn-right',
    name: 'Giro Derecha',
    description: 'Avanza y gira 90° a la derecha',
    category: 'laberinto',
    difficulty: 'easy',
    obstacles: [
      { x: 60, z: 100, w: 180, h: 15 },
      { x: 225, z: 100, w: 15, h: 100 },
      { x: 60, z: 285, w: 15, h: 15 },
      { x: 225, z: 285, w: 115, h: 15 },
    ],
    start: { x: 70, z: 200, angle: 0 },
    goal: { x: 290, z: 330, radius: 35 }
  },
  {
    id: 'turn-left',
    name: 'Giro Izquierda',
    description: 'Avanza y gira 90° a la izquierda',
    category: 'laberinto',
    difficulty: 'easy',
    obstacles: [
      { x: 60, z: 115, w: 15, h: 15 },
      { x: 60, z: 285, w: 180, h: 15 },
      { x: 225, z: 115, w: 115, h: 15 },
      { x: 225, z: 200, w: 15, h: 100 },
    ],
    start: { x: 70, z: 200, angle: 0 },
    goal: { x: 290, z: 70, radius: 35 }
  },
  // === LABERINTOS - NIVEL MEDIO === (pasillos ~90 unidades)
  {
    id: 'zigzag',
    name: 'Zigzag',
    description: 'Navega en zigzag entre obstáculos',
    category: 'laberinto',
    difficulty: 'medium',
    obstacles: [
      { x: 120, z: 60, w: 20, h: 100 },
      { x: 120, z: 240, w: 20, h: 100 },
      { x: 200, z: 100, w: 20, h: 200 },
      { x: 280, z: 60, w: 20, h: 100 },
      { x: 280, z: 240, w: 20, h: 100 },
    ],
    start: { x: 60, z: 200, angle: 0 },
    goal: { x: 340, z: 200, radius: 35 }
  },
  {
    id: 'slalom',
    name: 'Slalom',
    description: 'Zigzaguea entre los postes',
    category: 'laberinto',
    difficulty: 'medium',
    obstacles: [
      { x: 130, z: 60, w: 30, h: 60 },
      { x: 130, z: 280, w: 30, h: 60 },
      { x: 200, z: 140, w: 30, h: 120 },
      { x: 270, z: 60, w: 30, h: 60 },
      { x: 270, z: 280, w: 30, h: 60 },
    ],
    start: { x: 60, z: 200, angle: 0 },
    goal: { x: 340, z: 200, radius: 35 }
  },
  {
    id: 'u-turn',
    name: 'Media Vuelta',
    description: 'Da la vuelta y llega al otro lado',
    category: 'laberinto',
    difficulty: 'medium',
    obstacles: [
      { x: 60, z: 60, w: 220, h: 15 },
      { x: 60, z: 325, w: 220, h: 15 },
      { x: 265, z: 60, w: 15, h: 280 },
      { x: 140, z: 140, w: 80, h: 15 },
      { x: 140, z: 245, w: 80, h: 15 },
    ],
    start: { x: 100, z: 120, angle: 0 },
    goal: { x: 100, z: 280, radius: 35 }
  },
  {
    id: 'corridor',
    name: 'Corredor L',
    description: 'Navega por el pasillo en L',
    category: 'laberinto',
    difficulty: 'medium',
    obstacles: [
      { x: 60, z: 60, w: 15, h: 180 },
      { x: 150, z: 150, w: 15, h: 90 },
      { x: 60, z: 225, w: 180, h: 15 },
      { x: 150, z: 315, w: 190, h: 15 },
      { x: 225, z: 150, w: 15, h: 90 },
      { x: 325, z: 150, w: 15, h: 180 },
    ],
    start: { x: 105, z: 105, angle: 90 },
    goal: { x: 275, z: 270, radius: 35 }
  },
  // === LABERINTOS - NIVEL DIFÍCIL === (pasillos ~80 unidades)
  {
    id: 'spiral',
    name: 'Espiral',
    description: 'Navega por el camino en espiral',
    category: 'laberinto',
    difficulty: 'hard',
    obstacles: [
      { x: 50, z: 50, w: 300, h: 15 },
      { x: 50, z: 50, w: 15, h: 300 },
      { x: 50, z: 335, w: 300, h: 15 },
      { x: 335, z: 130, w: 15, h: 220 },
      { x: 130, z: 130, w: 220, h: 15 },
      { x: 130, z: 130, w: 15, h: 130 },
      { x: 130, z: 245, w: 130, h: 15 },
      { x: 245, z: 200, w: 15, h: 60 },
    ],
    start: { x: 90, z: 290, angle: -90 },
    goal: { x: 200, z: 180, radius: 30 }
  },
  {
    id: 'maze',
    name: 'Laberinto',
    description: 'Encuentra el camino correcto',
    category: 'laberinto',
    difficulty: 'hard',
    obstacles: [
      { x: 120, z: 50, w: 15, h: 130 },
      { x: 120, z: 260, w: 15, h: 90 },
      { x: 200, z: 120, w: 15, h: 150 },
      { x: 200, z: 50, w: 80, h: 15 },
      { x: 280, z: 50, w: 15, h: 130 },
      { x: 280, z: 260, w: 15, h: 90 },
      { x: 200, z: 335, w: 95, h: 15 },
    ],
    start: { x: 60, z: 320, angle: -90 },
    goal: { x: 340, z: 100, radius: 35 }
  },
  {
    id: 'obstacle-course',
    name: 'Carrera Obstáculos',
    description: 'Evita todos los obstáculos',
    category: 'laberinto',
    difficulty: 'hard',
    obstacles: [
      { x: 120, z: 80, w: 35, h: 35 },
      { x: 120, z: 285, w: 35, h: 35 },
      { x: 200, z: 180, w: 35, h: 35 },
      { x: 280, z: 80, w: 35, h: 35 },
      { x: 280, z: 285, w: 35, h: 35 },
    ],
    start: { x: 60, z: 200, angle: 0 },
    goal: { x: 340, z: 200, radius: 35 }
  },
  {
    id: 'snake',
    name: 'Serpiente',
    description: 'Sigue el camino serpenteante',
    category: 'laberinto',
    difficulty: 'hard',
    obstacles: [
      { x: 50, z: 50, w: 15, h: 130 },
      { x: 50, z: 220, w: 15, h: 130 },
      { x: 130, z: 120, w: 15, h: 160 },
      { x: 210, z: 50, w: 15, h: 130 },
      { x: 210, z: 220, w: 15, h: 130 },
      { x: 290, z: 120, w: 15, h: 160 },
    ],
    start: { x: 90, z: 320, angle: -90 },
    goal: { x: 340, z: 80, radius: 35 }
  },
  // === COLECCIONABLES (Tipo Picto Blocks) ===
  {
    id: 'collect-stars',
    name: 'Recolecta Estrellas',
    description: 'Recoge las 3 estrellas y llega a la meta',
    category: 'coleccionables',
    difficulty: 'easy',
    obstacles: [],
    start: { x: 70, z: 200, angle: 0 },
    goal: { x: 340, z: 200, radius: 35 },
    collectibles: [
      { id: 's1', x: 150, z: 200, type: 'star' },
      { id: 's2', x: 230, z: 200, type: 'star' },
      { id: 's3', x: 310, z: 200, type: 'star' },
    ],
    requireAllCollectibles: true
  },
  {
    id: 'treasure-hunt',
    name: 'Caza del Tesoro',
    description: 'Recoge las gemas evitando obstáculos',
    category: 'coleccionables',
    difficulty: 'medium',
    obstacles: [
      { x: 150, z: 100, w: 20, h: 80 },
      { x: 150, z: 220, w: 20, h: 80 },
      { x: 250, z: 140, w: 20, h: 120 },
    ],
    start: { x: 70, z: 200, angle: 0 },
    goal: { x: 340, z: 200, radius: 35 },
    collectibles: [
      { id: 'g1', x: 120, z: 120, type: 'gem' },
      { id: 'g2', x: 120, z: 280, type: 'gem' },
      { id: 'g3', x: 200, z: 200, type: 'gem' },
      { id: 'g4', x: 300, z: 120, type: 'gem' },
      { id: 'g5', x: 300, z: 280, type: 'gem' },
    ],
    requireAllCollectibles: true
  },
  {
    id: 'coin-path',
    name: 'Camino de Monedas',
    description: 'Sigue el rastro de monedas',
    category: 'coleccionables',
    difficulty: 'easy',
    obstacles: [
      { x: 60, z: 100, w: 280, h: 15 },
      { x: 60, z: 285, w: 280, h: 15 },
    ],
    start: { x: 70, z: 200, angle: 0 },
    goal: { x: 330, z: 200, radius: 35 },
    collectibles: [
      { id: 'c1', x: 120, z: 200, type: 'coin' },
      { id: 'c2', x: 170, z: 200, type: 'coin' },
      { id: 'c3', x: 220, z: 200, type: 'coin' },
      { id: 'c4', x: 270, z: 200, type: 'coin' },
    ],
    requireAllCollectibles: false
  },
  {
    id: 'key-door',
    name: 'Llave y Puerta',
    description: 'Recoge la llave para abrir la meta',
    category: 'coleccionables',
    difficulty: 'medium',
    obstacles: [
      { x: 180, z: 60, w: 15, h: 130 },
      { x: 180, z: 230, w: 15, h: 130 },
    ],
    start: { x: 70, z: 200, angle: 0 },
    goal: { x: 330, z: 200, radius: 35 },
    collectibles: [
      { id: 'k1', x: 120, z: 320, type: 'key' },
    ],
    requireAllCollectibles: true
  },
  {
    id: 'star-maze',
    name: 'Laberinto Estelar',
    description: 'Navega el laberinto recogiendo estrellas',
    category: 'coleccionables',
    difficulty: 'hard',
    obstacles: [
      { x: 100, z: 60, w: 15, h: 120 },
      { x: 100, z: 230, w: 15, h: 110 },
      { x: 180, z: 120, w: 15, h: 160 },
      { x: 260, z: 60, w: 15, h: 120 },
      { x: 260, z: 230, w: 15, h: 110 },
    ],
    start: { x: 60, z: 200, angle: 0 },
    goal: { x: 340, z: 200, radius: 35 },
    collectibles: [
      { id: 'sm1', x: 140, z: 100, type: 'star' },
      { id: 'sm2', x: 140, z: 300, type: 'star' },
      { id: 'sm3', x: 220, z: 200, type: 'star' },
      { id: 'sm4', x: 300, z: 100, type: 'star' },
      { id: 'sm5', x: 300, z: 300, type: 'star' },
    ],
    requireAllCollectibles: true
  },
  {
    id: 'gem-collector',
    name: 'Colector de Gemas',
    description: 'Recoge todas las gemas en orden',
    category: 'coleccionables',
    difficulty: 'hard',
    obstacles: [
      { x: 120, z: 60, w: 25, h: 60 },
      { x: 120, z: 280, w: 25, h: 60 },
      { x: 200, z: 140, w: 25, h: 120 },
      { x: 280, z: 60, w: 25, h: 60 },
      { x: 280, z: 280, w: 25, h: 60 },
    ],
    start: { x: 60, z: 200, angle: 0 },
    goal: { x: 340, z: 200, radius: 35 },
    collectibles: [
      { id: 'gc1', x: 100, z: 100, type: 'gem' },
      { id: 'gc2', x: 100, z: 300, type: 'gem' },
      { id: 'gc3', x: 170, z: 200, type: 'gem' },
      { id: 'gc4', x: 240, z: 100, type: 'gem' },
      { id: 'gc5', x: 240, z: 300, type: 'gem' },
      { id: 'gc6', x: 310, z: 200, type: 'gem' },
    ],
    requireAllCollectibles: true
  },
  // === MINI SUMO (empujar objetos fuera del dohyo) ===
  {
    id: 'sumo-basic',
    name: 'Mini Sumo Básico',
    description: 'Empuja el vaso fuera del dohyo',
    category: 'minisumo',
    difficulty: 'easy',
    obstacles: [],
    start: { x: 200, z: 280, angle: -90 },
    goal: { x: 200, z: 200, radius: 20 },
    dohyo: { x: 200, z: 200, radius: 150 },
    pushableObjects: [
      { id: 'cup1', x: 200, z: 150, type: 'cup', radius: 20 }
    ],
    winCondition: 'push_all_out'
  },
  {
    id: 'sumo-duo',
    name: 'Sumo Doble',
    description: 'Empuja los 2 vasos fuera del ring',
    category: 'minisumo',
    difficulty: 'medium',
    obstacles: [],
    start: { x: 200, z: 300, angle: -90 },
    goal: { x: 200, z: 200, radius: 20 },
    dohyo: { x: 200, z: 200, radius: 150 },
    pushableObjects: [
      { id: 'cup1', x: 150, z: 150, type: 'cup', radius: 20 },
      { id: 'cup2', x: 250, z: 150, type: 'cup', radius: 20 }
    ],
    winCondition: 'push_all_out'
  },
  {
    id: 'sumo-trio',
    name: 'Sumo Triple',
    description: 'Saca los 3 objetos del dohyo',
    category: 'minisumo',
    difficulty: 'medium',
    obstacles: [],
    start: { x: 200, z: 310, angle: -90 },
    goal: { x: 200, z: 200, radius: 20 },
    dohyo: { x: 200, z: 200, radius: 150 },
    pushableObjects: [
      { id: 'obj1', x: 150, z: 130, type: 'cylinder', radius: 18 },
      { id: 'obj2', x: 200, z: 100, type: 'cup', radius: 20 },
      { id: 'obj3', x: 250, z: 130, type: 'cylinder', radius: 18 }
    ],
    winCondition: 'push_all_out'
  },
  {
    id: 'sumo-boxes',
    name: 'Cajas Rebeldes',
    description: 'Empuja todas las cajas fuera del área',
    category: 'minisumo',
    difficulty: 'hard',
    obstacles: [],
    start: { x: 200, z: 320, angle: -90 },
    goal: { x: 200, z: 200, radius: 20 },
    dohyo: { x: 200, z: 200, radius: 160 },
    pushableObjects: [
      { id: 'box1', x: 140, z: 140, type: 'box', radius: 22 },
      { id: 'box2', x: 260, z: 140, type: 'box', radius: 22 },
      { id: 'box3', x: 200, z: 100, type: 'box', radius: 22 },
      { id: 'box4', x: 170, z: 180, type: 'box', radius: 18 }
    ],
    winCondition: 'push_all_out'
  },
  {
    id: 'sumo-challenge',
    name: 'Desafío Sumo',
    description: 'Limpia el dohyo de todos los objetos',
    category: 'minisumo',
    difficulty: 'hard',
    obstacles: [],
    start: { x: 200, z: 330, angle: -90 },
    goal: { x: 200, z: 200, radius: 20 },
    dohyo: { x: 200, z: 200, radius: 160 },
    pushableObjects: [
      { id: 'c1', x: 130, z: 130, type: 'cup', radius: 18 },
      { id: 'c2', x: 200, z: 90, type: 'cylinder', radius: 20 },
      { id: 'c3', x: 270, z: 130, type: 'cup', radius: 18 },
      { id: 'b1', x: 150, z: 200, type: 'box', radius: 16 },
      { id: 'b2', x: 250, z: 200, type: 'box', radius: 16 }
    ],
    winCondition: 'push_all_out'
  }
]

// Componente del Robot 3D
function Robot({ state, obstacles }: { state: RobotState, obstacles: Array<{x: number, z: number, w: number, h: number}> }) {
  const robotRef = useRef<THREE.Group>(null)
  const wheelLeftFrontRef = useRef<THREE.Mesh>(null)
  const wheelLeftBackRef = useRef<THREE.Mesh>(null)
  const wheelRightFrontRef = useRef<THREE.Mesh>(null)
  const wheelRightBackRef = useRef<THREE.Mesh>(null)
  const servoArmRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (robotRef.current) {
      // Convertir coordenadas 2D a 3D (escala: 1 unidad = 0.025 en 3D)
      const scale = 0.025
      robotRef.current.position.x = (state.x - 200) * scale
      robotRef.current.position.z = (state.z - 200) * scale
      robotRef.current.rotation.y = -state.angle * (Math.PI / 180)
    }

    // Animar ruedas si el robot se mueve
    if (state.isMoving) {
      const wheelSpeed = 0.1
      if (wheelLeftFrontRef.current) wheelLeftFrontRef.current.rotation.x += wheelSpeed * (state.leftMotor / 150)
      if (wheelLeftBackRef.current) wheelLeftBackRef.current.rotation.x += wheelSpeed * (state.leftMotor / 150)
      if (wheelRightFrontRef.current) wheelRightFrontRef.current.rotation.x += wheelSpeed * (state.rightMotor / 150)
      if (wheelRightBackRef.current) wheelRightBackRef.current.rotation.x += wheelSpeed * (state.rightMotor / 150)
    }

    // Animar servo
    if (servoArmRef.current) {
      servoArmRef.current.rotation.z = (state.servoAngle - 90) * (Math.PI / 180)
    }
  })

  return (
    <group ref={robotRef} position={[0, 0.3, 0]}>
      {/* Cuerpo principal del robot */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 1]} />
        <meshStandardMaterial color="#1a1a3e" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Tapa superior */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.7, 0.05, 0.9]} />
        <meshStandardMaterial color="#2a2a5e" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Sensor ultrasónico (frente) */}
      <group position={[0, 0.25, -0.55]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.15, 0.1]} />
          <meshStandardMaterial color="#9333ea" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Ojos del sensor */}
        <mesh position={[-0.08, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color="#c084fc" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.08, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color="#c084fc" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* LEDs */}
      {[
        { pin: 13, x: -0.2, color: '#ef4444' },
        { pin: 12, x: -0.07, color: '#22c55e' },
        { pin: 11, x: 0.07, color: '#3b82f6' },
        { pin: 10, x: 0.2, color: '#eab308' }
      ].map((led) => (
        <mesh key={led.pin} position={[led.x, 0.36, -0.2]} castShadow>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial 
            color={state.leds[led.pin] ? led.color : '#3a3a5a'} 
            emissive={state.leds[led.pin] ? led.color : '#000000'}
            emissiveIntensity={state.leds[led.pin] ? 2 : 0}
          />
        </mesh>
      ))}

      {/* Ruedas izquierdas */}
      <mesh ref={wheelLeftFrontRef} position={[-0.45, 0, -0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
        <meshStandardMaterial color={state.leftMotor > 0 ? '#00f5d4' : '#3a3a5a'} />
      </mesh>
      <mesh ref={wheelLeftBackRef} position={[-0.45, 0, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
        <meshStandardMaterial color={state.leftMotor > 0 ? '#00f5d4' : '#3a3a5a'} />
      </mesh>

      {/* Ruedas derechas */}
      <mesh ref={wheelRightFrontRef} position={[0.45, 0, -0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
        <meshStandardMaterial color={state.rightMotor > 0 ? '#00f5d4' : '#3a3a5a'} />
      </mesh>
      <mesh ref={wheelRightBackRef} position={[0.45, 0, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
        <meshStandardMaterial color={state.rightMotor > 0 ? '#00f5d4' : '#3a3a5a'} />
      </mesh>

      {/* Servo y brazo */}
      <group position={[0, 0.35, 0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh ref={servoArmRef} position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.04, 0.25, 0.04]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* Flecha de dirección */}
      <mesh position={[0, 0.4, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.15, 8]} />
        <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// Componente de Obstáculo 3D
function Obstacle({ position, size }: { position: [number, number, number], size: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#4a4a6a" metalness={0.2} roughness={0.8} />
    </mesh>
  )
}

// Componente de Punto de Inicio - INICIO visible
function StartPoint({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })
  
  return (
    <group position={position}>
      {/* Texto INICIO - Cartel */}
      <group position={[0, 0.7, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 0.25, 0.05]} />
          <meshStandardMaterial 
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      
      {/* Base azul - INICIO */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.7}
          emissive="#3b82f6"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Anillo animado */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.55, 0.7, 32]} />
        <meshStandardMaterial 
          color="#60a5fa" 
          transparent 
          opacity={0.5} 
          side={THREE.DoubleSide}
          emissive="#60a5fa"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Bandera de inicio */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh position={[0.2, 0.55, 0]}>
        <boxGeometry args={[0.35, 0.25, 0.02]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.4} />
      </mesh>
      
      {/* Luz puntual */}
      <pointLight 
        position={[0, 0.8, 0]} 
        intensity={1.5} 
        color="#3b82f6" 
        distance={3}
      />
    </group>
  )
}

// Componente del modelo 3D de ChaskiBots cargando el OBJ
function ChaskiOBJModel({ reached }: { reached: boolean }) {
  const obj = useLoader(OBJLoader, '/models/tinker.obj')
  const modelRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: reached ? '#fbbf24' : '#00f5d4',
            metalness: 0.6,
            roughness: 0.3,
            emissive: reached ? '#fbbf24' : '#00f5d4',
            emissiveIntensity: reached ? 0.5 : 0.2
          })
        }
      })
    }
  }, [obj, reached])
  
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = state.clock.elapsedTime * 0.5
      modelRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })
  
  return (
    <group ref={modelRef}>
      <primitive object={obj.clone()} scale={[0.006, 0.006, 0.006]} />
    </group>
  )
}

// Componente de Meta/Goal con modelo 3D de ChaskiBots
function GoalPoint({ position, reached }: { position: [number, number, number], reached: boolean }) {
  return (
    <group position={position}>
      {/* Texto FINAL */}
      <group position={[0, 0.8, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 0.2, 0.05]} />
          <meshStandardMaterial 
            color={reached ? "#fbbf24" : "#22c55e"}
            emissive={reached ? "#fbbf24" : "#22c55e"}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      
      {/* Base con glow - META */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial 
          color={reached ? "#fbbf24" : "#22c55e"} 
          transparent 
          opacity={0.6}
          emissive={reached ? "#fbbf24" : "#22c55e"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Anillo exterior */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.75, 0.9, 32]} />
        <meshStandardMaterial 
          color={reached ? "#fcd34d" : "#4ade80"} 
          transparent 
          opacity={0.5} 
          side={THREE.DoubleSide}
          emissive={reached ? "#fcd34d" : "#4ade80"}
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Modelo 3D de ChaskiBots */}
      <Suspense fallback={null}>
        <ChaskiOBJModel reached={reached} />
      </Suspense>
      
      {/* Luz puntual para destacar */}
      <pointLight 
        position={[0, 1, 0]} 
        intensity={reached ? 4 : 2} 
        color={reached ? "#fbbf24" : "#22c55e"} 
        distance={4}
      />
    </group>
  )
}

// Componente de Coleccionable 3D
function CollectibleItem({ 
  position, 
  type, 
  collected 
}: { 
  position: [number, number, number], 
  type: 'star' | 'gem' | 'coin' | 'key',
  collected: boolean 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2
      meshRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })
  
  if (collected) return null
  
  const colors = {
    star: { main: '#fbbf24', emissive: '#f59e0b' },
    gem: { main: '#a855f7', emissive: '#9333ea' },
    coin: { main: '#fcd34d', emissive: '#eab308' },
    key: { main: '#ef4444', emissive: '#dc2626' }
  }
  
  const color = colors[type]
  
  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, 0.3, 0]}>
        {type === 'star' && (
          <>
            <octahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial 
              color={color.main}
              emissive={color.emissive}
              emissiveIntensity={0.8}
              metalness={0.8}
              roughness={0.2}
            />
          </>
        )}
        {type === 'gem' && (
          <>
            <octahedronGeometry args={[0.2, 2]} />
            <meshStandardMaterial 
              color={color.main}
              emissive={color.emissive}
              emissiveIntensity={0.6}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.9}
            />
          </>
        )}
        {type === 'coin' && (
          <>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
            <meshStandardMaterial 
              color={color.main}
              emissive={color.emissive}
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0.2}
            />
          </>
        )}
        {type === 'key' && (
          <>
            <boxGeometry args={[0.15, 0.35, 0.08]} />
            <meshStandardMaterial 
              color={color.main}
              emissive={color.emissive}
              emissiveIntensity={0.6}
              metalness={0.7}
              roughness={0.3}
            />
          </>
        )}
      </mesh>
      <pointLight 
        position={[0, 0.5, 0]} 
        intensity={1.5} 
        color={color.main} 
        distance={2}
      />
    </group>
  )
}

// Componente de Objeto Empujable 3D (para Mini Sumo)
function PushableItem({ 
  position, 
  type,
  isOut
}: { 
  position: [number, number, number], 
  type: 'cup' | 'box' | 'cylinder',
  isOut: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const colors = {
    cup: { main: '#ef4444', emissive: '#dc2626' },
    box: { main: '#3b82f6', emissive: '#2563eb' },
    cylinder: { main: '#22c55e', emissive: '#16a34a' }
  }
  
  const color = colors[type]
  
  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, type === 'cup' ? 0.25 : 0.2, 0]} castShadow>
        {type === 'cup' && (
          <>
            <cylinderGeometry args={[0.35, 0.25, 0.5, 16]} />
            <meshStandardMaterial 
              color={isOut ? '#666666' : color.main}
              emissive={isOut ? '#333333' : color.emissive}
              emissiveIntensity={isOut ? 0.1 : 0.4}
              metalness={0.3}
              roughness={0.7}
            />
          </>
        )}
        {type === 'box' && (
          <>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial 
              color={isOut ? '#666666' : color.main}
              emissive={isOut ? '#333333' : color.emissive}
              emissiveIntensity={isOut ? 0.1 : 0.4}
              metalness={0.2}
              roughness={0.8}
            />
          </>
        )}
        {type === 'cylinder' && (
          <>
            <cylinderGeometry args={[0.3, 0.3, 0.45, 20]} />
            <meshStandardMaterial 
              color={isOut ? '#666666' : color.main}
              emissive={isOut ? '#333333' : color.emissive}
              emissiveIntensity={isOut ? 0.1 : 0.4}
              metalness={0.4}
              roughness={0.6}
            />
          </>
        )}
      </mesh>
      {!isOut && (
        <pointLight 
          position={[0, 0.6, 0]} 
          intensity={1} 
          color={color.main} 
          distance={1.5}
        />
      )}
    </group>
  )
}

// Componente del Dohyo (ring de sumo)
function Dohyo({ position, radius }: { position: [number, number, number], radius: number }) {
  const scale = 0.025
  const r = radius * scale
  
  return (
    <group position={position}>
      {/* Base del dohyo - círculo negro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[r, 64]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {/* Borde blanco del dohyo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[r - 0.15, r, 64]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          roughness={0.5}
        />
      </mesh>
      {/* Líneas de inicio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, 0.025, 0]}>
        <planeGeometry args={[0.08, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.025, 0]}>
        <planeGeometry args={[0.08, 0.6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  )
}

// Componente del Grid manual
function CustomGrid() {
  const gridRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    if (gridRef.current) {
      // Crear líneas del grid manualmente
      const size = 10
      const divisions = 20
      const step = size / divisions
      
      const material = new THREE.LineBasicMaterial({ color: '#2a2a4a', transparent: true, opacity: 0.5 })
      
      for (let i = -size/2; i <= size/2; i += step) {
        // Líneas horizontales
        const pointsH = [new THREE.Vector3(-size/2, 0, i), new THREE.Vector3(size/2, 0, i)]
        const geometryH = new THREE.BufferGeometry().setFromPoints(pointsH)
        const lineH = new THREE.Line(geometryH, material)
        gridRef.current.add(lineH)
        
        // Líneas verticales
        const pointsV = [new THREE.Vector3(i, 0, -size/2), new THREE.Vector3(i, 0, size/2)]
        const geometryV = new THREE.BufferGeometry().setFromPoints(pointsV)
        const lineV = new THREE.Line(geometryV, material)
        gridRef.current.add(lineV)
      }
    }
  }, [])
  
  return <group ref={gridRef} position={[0, 0.01, 0]} />
}

// Componente del Piso con logo
function Floor() {
  const logoTexture = useRef<THREE.Texture | null>(null)
  const [textureLoaded, setTextureLoaded] = useState(false)
  
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load('/chaski.png', (texture) => {
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      logoTexture.current = texture
      setTextureLoaded(true)
    })
  }, [])
  
  return (
    <group>
      {/* Piso principal - más claro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2a2a4e" />
      </mesh>
      
      {/* Área de juego circular - más visible */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial color="#3a3a6e" />
      </mesh>
      
      {/* Logo como fondo en el piso */}
      {textureLoaded && logoTexture.current && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial 
            map={logoTexture.current} 
            transparent 
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Grid manual */}
      <CustomGrid />

      {/* Borde del área de juego - más brillante */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.85, 5, 64]} />
        <meshStandardMaterial color="#00f5d4" transparent opacity={0.6} side={THREE.DoubleSide} emissive="#00f5d4" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

// Escena 3D
function Scene({ 
  robotState, 
  obstacles, 
  challenge,
  goalReached,
  collectedItems,
  pushablePositions,
  objectsOutOfDohyo
}: { 
  robotState: RobotState, 
  obstacles: Array<{x: number, z: number, w: number, h: number}>,
  challenge: Challenge,
  goalReached: boolean,
  collectedItems: Set<string>,
  pushablePositions: {[key: string]: {x: number, z: number}},
  objectsOutOfDohyo: Set<string>
}) {
  // Convertir obstáculos 2D a posiciones 3D
  const scale = 0.025
  const obstacles3D = obstacles.map(obs => ({
    position: [(obs.x + obs.w/2 - 200) * scale, 0.25, (obs.z + obs.h/2 - 200) * scale] as [number, number, number],
    size: [obs.w * scale, 0.5, obs.h * scale] as [number, number, number]
  }))

  // Posiciones de inicio y meta
  const startPos: [number, number, number] = [
    (challenge.start.x - 200) * scale, 
    0, 
    (challenge.start.z - 200) * scale
  ]
  const goalPos: [number, number, number] = [
    (challenge.goal.x - 200) * scale, 
    0, 
    (challenge.goal.z - 200) * scale
  ]

  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 5, 6]} fov={50} />
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.1}
      />
      
      {/* Iluminación mejorada - más brillante */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight 
        position={[-5, 8, -5]} 
        intensity={0.8} 
      />
      <pointLight position={[-3, 4, -3]} intensity={1} color="#9333ea" />
      <pointLight position={[3, 4, 3]} intensity={1} color="#00f5d4" />
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#ffffff" />
      {/* Luz hemisférica para iluminación general */}
      <hemisphereLight args={['#87ceeb', '#1a1a2e', 0.6]} />

      <Floor />
      
      {/* Punto de inicio */}
      <StartPoint position={startPos} />
      
      {/* Meta - FINAL con modelo ChaskiBots */}
      <GoalPoint position={goalPos} reached={goalReached} />
      
      {/* Obstáculos */}
      {obstacles3D.map((obs, i) => (
        <Obstacle key={i} position={obs.position} size={obs.size} />
      ))}

      {/* Coleccionables */}
      {challenge.collectibles?.map((item) => (
        <CollectibleItem
          key={item.id}
          position={[(item.x - 200) * scale, 0, (item.z - 200) * scale]}
          type={item.type}
          collected={collectedItems.has(item.id)}
        />
      ))}

      {/* Dohyo para niveles Mini Sumo */}
      {challenge.dohyo && (
        <Dohyo 
          position={[(challenge.dohyo.x - 200) * scale, 0, (challenge.dohyo.z - 200) * scale]}
          radius={challenge.dohyo.radius}
        />
      )}

      {/* Objetos empujables */}
      {challenge.pushableObjects?.map((obj) => {
        const pos = pushablePositions[obj.id] || { x: obj.x, z: obj.z }
        return (
          <PushableItem
            key={obj.id}
            position={[(pos.x - 200) * scale, 0, (pos.z - 200) * scale]}
            type={obj.type}
            isOut={objectsOutOfDohyo.has(obj.id)}
          />
        )
      })}

      <Robot state={robotState} obstacles={obstacles} />
    </>
  )
}

// Componente principal
export default function RobotSimulator3D({ commands = [], onStateChange, onRequestCommands }: RobotSimulator3DProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [programCommands, setProgramCommands] = useState<SimulatorCommand[]>([])
  const runningRef = useRef(false)
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [goalReached, setGoalReached] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [collectedItems, setCollectedItems] = useState<Set<string>>(new Set())
  const [pushablePositions, setPushablePositions] = useState<{[key: string]: {x: number, z: number}}>({})
  const [objectsOutOfDohyo, setObjectsOutOfDohyo] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>('laberinto')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Filtrar desafíos por categoría
  const filteredChallenges = CHALLENGES.filter(c => c.category === selectedCategory)
  const currentChallengeInCategory = filteredChallenges.findIndex(c => c.id === CHALLENGES[currentChallengeIndex]?.id)
  const currentChallenge = CHALLENGES[currentChallengeIndex]
  
  const [robotState, setRobotState] = useState<RobotState>({
    x: currentChallenge.start.x,
    z: currentChallenge.start.z,
    angle: currentChallenge.start.angle,
    speed: 0,
    leftMotor: 0,
    rightMotor: 0,
    leds: { 13: false, 12: false, 11: false, 10: false },
    buzzerFreq: 0,
    ultrasonicDistance: 100,
    irSensor: false,
    servoAngle: 90,
    isMoving: false
  })

  // Obstáculos del desafío actual
  const obstacles = currentChallenge.obstacles
  
  // Verificar colección de items
  useEffect(() => {
    if (!currentChallenge.collectibles) return
    
    currentChallenge.collectibles.forEach(item => {
      if (collectedItems.has(item.id)) return
      
      const dx = robotState.x - item.x
      const dz = robotState.z - item.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      
      if (distance < 40) {
        setCollectedItems(prev => {
          const newSet = new Set(Array.from(prev))
          newSet.add(item.id)
          return newSet
        })
      }
    })
  }, [robotState.x, robotState.z, currentChallenge.collectibles, collectedItems])
  
  // Verificar si llegó a la meta
  useEffect(() => {
    const dx = robotState.x - currentChallenge.goal.x
    const dz = robotState.z - currentChallenge.goal.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    
    // Verificar si se requieren todos los coleccionables
    const allCollected = !currentChallenge.requireAllCollectibles || 
      !currentChallenge.collectibles ||
      currentChallenge.collectibles.every(item => collectedItems.has(item.id))
    
    if (distance < currentChallenge.goal.radius && !goalReached && allCollected) {
      setGoalReached(true)
      setIsRunning(false)
    }
  }, [robotState.x, robotState.z, currentChallenge.goal, goalReached, collectedItems, currentChallenge.requireAllCollectibles, currentChallenge.collectibles])
  
  // Contar coleccionables
  const totalCollectibles = currentChallenge.collectibles?.length || 0
  const collectedCount = currentChallenge.collectibles?.filter(item => collectedItems.has(item.id)).length || 0
  
  // Contar objetos fuera del dohyo (Mini Sumo)
  const totalPushables = currentChallenge.pushableObjects?.length || 0
  const pushedOutCount = objectsOutOfDohyo.size
  
  // Lógica de empujar objetos
  useEffect(() => {
    if (!currentChallenge.pushableObjects || !currentChallenge.dohyo) return
    
    const robotRadius = 35
    const dohyo = currentChallenge.dohyo
    
    currentChallenge.pushableObjects.forEach(obj => {
      if (objectsOutOfDohyo.has(obj.id)) return
      
      const currentPos = pushablePositions[obj.id] || { x: obj.x, z: obj.z }
      const dx = robotState.x - currentPos.x
      const dz = robotState.z - currentPos.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      
      // Si el robot está cerca del objeto, empujarlo
      if (distance < robotRadius + obj.radius) {
        const pushForce = 8
        const angle = Math.atan2(dz, dx)
        const newX = currentPos.x - Math.cos(angle) * pushForce
        const newZ = currentPos.z - Math.sin(angle) * pushForce
        
        setPushablePositions(prev => ({
          ...prev,
          [obj.id]: { x: newX, z: newZ }
        }))
        
        // Verificar si salió del dohyo
        const distFromCenter = Math.sqrt(
          Math.pow(newX - dohyo.x, 2) + Math.pow(newZ - dohyo.z, 2)
        )
        
        if (distFromCenter > dohyo.radius) {
          setObjectsOutOfDohyo(prev => {
            const newSet = new Set(Array.from(prev))
            newSet.add(obj.id)
            return newSet
          })
        }
      }
    })
  }, [robotState.x, robotState.z, currentChallenge.pushableObjects, currentChallenge.dohyo, pushablePositions, objectsOutOfDohyo])
  
  // Verificar condición de victoria para Mini Sumo
  useEffect(() => {
    if (currentChallenge.winCondition !== 'push_all_out') return
    if (!currentChallenge.pushableObjects) return
    
    const allOut = currentChallenge.pushableObjects.every(obj => objectsOutOfDohyo.has(obj.id))
    
    if (allOut && !goalReached) {
      setGoalReached(true)
      setIsRunning(false)
    }
  }, [objectsOutOfDohyo, currentChallenge.winCondition, currentChallenge.pushableObjects, goalReached])
  
  // Cambiar desafío dentro de la categoría actual
  const changeChallenge = (direction: 'prev' | 'next') => {
    const currentIndexInFiltered = filteredChallenges.findIndex(c => c.id === currentChallenge?.id)
    let newFilteredIndex: number
    
    if (currentIndexInFiltered === -1) {
      newFilteredIndex = 0
    } else {
      newFilteredIndex = direction === 'next' 
        ? (currentIndexInFiltered + 1) % filteredChallenges.length
        : (currentIndexInFiltered - 1 + filteredChallenges.length) % filteredChallenges.length
    }
    
    const newChallenge = filteredChallenges[newFilteredIndex]
    const globalIndex = CHALLENGES.findIndex(c => c.id === newChallenge.id)
    
    setCurrentChallengeIndex(globalIndex)
    setGoalReached(false)
    setCollectedItems(new Set())
    setPushablePositions({})
    setObjectsOutOfDohyo(new Set())
    setRobotState({
      x: newChallenge.start.x,
      z: newChallenge.start.z,
      angle: newChallenge.start.angle,
      speed: 0,
      leftMotor: 0,
      rightMotor: 0,
      leds: { 13: false, 12: false, 11: false, 10: false },
      buzzerFreq: 0,
      ultrasonicDistance: 100,
      irSensor: false,
      servoAngle: 90,
      isMoving: false
    })
  }
  
  // Cambiar categoría
  const changeCategory = (category: ChallengeCategory) => {
    setSelectedCategory(category)
    const firstChallengeInCategory = CHALLENGES.find(c => c.category === category)
    if (firstChallengeInCategory) {
      const globalIndex = CHALLENGES.findIndex(c => c.id === firstChallengeInCategory.id)
      setCurrentChallengeIndex(globalIndex)
      setGoalReached(false)
      setCollectedItems(new Set())
      setPushablePositions({})
      setObjectsOutOfDohyo(new Set())
      setRobotState({
        x: firstChallengeInCategory.start.x,
        z: firstChallengeInCategory.start.z,
        angle: firstChallengeInCategory.start.angle,
        speed: 0,
        leftMotor: 0,
        rightMotor: 0,
        leds: { 13: false, 12: false, 11: false, 10: false },
        buzzerFreq: 0,
        ultrasonicDistance: 100,
        irSensor: false,
        servoAngle: 90,
        isMoving: false
      })
    }
  }
  
  // Enviar reto completado
  const submitChallenge = async () => {
    if (!goalReached) return
    
    setSubmitting(true)
    try {
      // Simular envío - aquí se conectaría con el API real
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`¡Reto "${currentChallenge.name}" enviado exitosamente! 🎉`)
      setShowSubmitModal(false)
    } catch (error) {
      alert('Error al enviar el reto. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // Función para detectar colisión
  const checkCollision = useCallback((x: number, z: number, robotRadius: number = 35): boolean => {
    if (x < robotRadius || x > 400 - robotRadius || z < robotRadius || z > 400 - robotRadius) {
      return true
    }
    
    for (const obs of obstacles) {
      const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.w))
      const closestZ = Math.max(obs.z, Math.min(z, obs.z + obs.h))
      const distanceX = x - closestX
      const distanceZ = z - closestZ
      const distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ)
      
      if (distance < robotRadius) {
        return true
      }
    }
    
    return false
  }, [obstacles])

  // Calcular distancia ultrasónica
  const calculateUltrasonicDistance = useCallback((x: number, z: number, angle: number): number => {
    const radAngle = (angle * Math.PI) / 180
    const maxDistance = 150
    
    for (let dist = 0; dist < maxDistance; dist += 5) {
      const checkX = x + Math.sin(radAngle) * dist
      const checkZ = z - Math.cos(radAngle) * dist
      
      if (checkX < 0 || checkX > 400 || checkZ < 0 || checkZ > 400) {
        return dist
      }
      
      for (const obs of obstacles) {
        if (checkX >= obs.x && checkX <= obs.x + obs.w &&
            checkZ >= obs.z && checkZ <= obs.z + obs.h) {
          return dist
        }
      }
    }
    
    return maxDistance
  }, [obstacles])

  // Ejecutar comandos
  const executeCommand = useCallback((cmd: SimulatorCommand) => {
    setRobotState(prev => {
      const newState = { ...prev }
      
      switch (cmd.type) {
        case 'move_forward':
          newState.isMoving = true
          newState.leftMotor = cmd.params.speed || 150
          newState.rightMotor = cmd.params.speed || 150
          const radForward = (prev.angle * Math.PI) / 180
          const newXForward = prev.x + Math.sin(radForward) * 3
          const newZForward = prev.z - Math.cos(radForward) * 3
          
          if (!checkCollision(newXForward, newZForward)) {
            newState.x = newXForward
            newState.z = newZForward
          } else {
            newState.irSensor = true
          }
          break
          
        case 'move_backward':
          newState.isMoving = true
          newState.leftMotor = cmd.params.speed || 150
          newState.rightMotor = cmd.params.speed || 150
          const radBackward = (prev.angle * Math.PI) / 180
          const newXBackward = prev.x - Math.sin(radBackward) * 3
          const newZBackward = prev.z + Math.cos(radBackward) * 3
          
          if (!checkCollision(newXBackward, newZBackward)) {
            newState.x = newXBackward
            newState.z = newZBackward
          } else {
            newState.irSensor = true
          }
          break
          
        case 'turn_left':
          // Usar el ángulo del parámetro, dividido por los pasos de la duración
          const turnLeftAngle = cmd.params.angle || 90
          const turnLeftSteps = Math.ceil((cmd.duration || 500) / 50)
          newState.angle -= turnLeftAngle / turnLeftSteps
          newState.leftMotor = 0
          newState.rightMotor = 150
          newState.isMoving = true
          break
          
        case 'turn_right':
          // Usar el ángulo del parámetro, dividido por los pasos de la duración
          const turnRightAngle = cmd.params.angle || 90
          const turnRightSteps = Math.ceil((cmd.duration || 500) / 50)
          newState.angle += turnRightAngle / turnRightSteps
          newState.leftMotor = 150
          newState.rightMotor = 0
          newState.isMoving = true
          break
          
        case 'stop':
          newState.isMoving = false
          newState.leftMotor = 0
          newState.rightMotor = 0
          break
          
        case 'led_on':
          newState.leds[cmd.params.pin] = true
          break
          
        case 'led_off':
          newState.leds[cmd.params.pin] = false
          break
          
        case 'buzzer':
          newState.buzzerFreq = cmd.params.freq || 1000
          break
          
        case 'servo':
          newState.servoAngle = cmd.params.angle || 90
          break
          
        case 'motor':
          if (cmd.params.motor === 'A') {
            newState.leftMotor = cmd.params.speed
          } else {
            newState.rightMotor = cmd.params.speed
          }
          break
      }
      
      newState.ultrasonicDistance = calculateUltrasonicDistance(newState.x, newState.z, newState.angle)
      
      if (!checkCollision(newState.x, newState.z)) {
        newState.irSensor = false
      }
      
      return newState
    })
  }, [checkCollision, calculateUltrasonicDistance])

  // Ejecutar programa de Blockly
  const runProgram = useCallback(() => {
    if (isRunning || goalReached) return
    
    // Obtener comandos de Blockly
    const cmds = onRequestCommands ? onRequestCommands() : []
    
    if (cmds.length === 0) {
      alert('¡No hay bloques de robot para ejecutar!\n\nArrasta bloques de la categoría "🤖 Robot" al área de trabajo.')
      return
    }
    
    setProgramCommands(cmds)
    setIsRunning(true)
    runningRef.current = true
    
    let cmdIndex = 0
    let stepCount = 0
    
    const interval = setInterval(() => {
      if (!runningRef.current || cmdIndex >= cmds.length || goalReached) {
        clearInterval(interval)
        setIsRunning(false)
        runningRef.current = false
        setRobotState(prev => ({
          ...prev,
          isMoving: false,
          leftMotor: 0,
          rightMotor: 0,
          buzzerFreq: 0
        }))
        return
      }
      
      const cmd = cmds[cmdIndex]
      const duration = cmd.duration || 1000
      const stepsNeeded = Math.ceil(duration / 50)
      
      executeCommand(cmd)
      
      stepCount++
      if (stepCount >= stepsNeeded) {
        cmdIndex++
        stepCount = 0
      }
    }, 50)
  }, [isRunning, goalReached, onRequestCommands, executeCommand])
  
  // Pausar programa
  const pauseProgram = useCallback(() => {
    runningRef.current = false
    setIsRunning(false)
    setRobotState(prev => ({
      ...prev,
      isMoving: false,
      leftMotor: 0,
      rightMotor: 0
    }))
  }, [])

  const resetRobot = () => {
    setIsRunning(false)
    setGoalReached(false)
    setCollectedItems(new Set())
    setPushablePositions({})
    setObjectsOutOfDohyo(new Set())
    setRobotState({
      x: currentChallenge.start.x,
      z: currentChallenge.start.z,
      angle: currentChallenge.start.angle,
      speed: 0,
      leftMotor: 0,
      rightMotor: 0,
      leds: { 13: false, 12: false, 11: false, 10: false },
      buzzerFreq: 0,
      ultrasonicDistance: 100,
      irSensor: false,
      servoAngle: 90,
      isMoving: false
    })
  }

  const handleManualControl = (direction: string) => {
    switch (direction) {
      case 'up':
        executeCommand({ type: 'move_forward', params: { speed: 150 } })
        break
      case 'down':
        executeCommand({ type: 'move_backward', params: { speed: 150 } })
        break
      case 'left':
        executeCommand({ type: 'turn_left', params: { angle: 15 } })
        break
      case 'right':
        executeCommand({ type: 'turn_right', params: { angle: 15 } })
        break
      case 'stop':
        executeCommand({ type: 'stop', params: {} })
        break
    }
  }

  const toggleLed = (pin: number) => {
    if (robotState.leds[pin]) {
      executeCommand({ type: 'led_off', params: { pin } })
    } else {
      executeCommand({ type: 'led_on', params: { pin } })
    }
  }

  return (
    <div className={`bg-dark-800 rounded-xl border border-dark-600 overflow-hidden transition-all duration-300 ${
      isExpanded ? 'fixed inset-4 z-50 flex flex-col' : ''
    }`}>
      {/* Overlay para modo expandido */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/80 -z-10" 
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Header con logo */}
      <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-b border-dark-600 p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/chaski.png" alt="ChaskiBots" width={32} height={32} className="rounded-lg" />
            <div>
              <h3 className="text-sm font-bold text-white">Simulador 3D</h3>
              <p className="text-xs text-gray-400">ChaskiBots</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {goalReached && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-green-500/30 text-green-300 rounded-lg text-xs font-medium">
                <Trophy className="w-3 h-3" />
                ¡Meta alcanzada!
              </span>
            )}
            {/* Botón Ejecutar/Pausar Programa */}
            {onRequestCommands && (
              <button
                onClick={() => {
                  if (isRunning) {
                    pauseProgram()
                  } else {
                    runProgram()
                  }
                }}
                disabled={goalReached}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  goalReached 
                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                    : isRunning 
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isRunning ? 'Pausar' : 'Ejecutar'}
              </button>
            )}
            <button
              onClick={resetRobot}
              className="flex items-center gap-1 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-2 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs font-medium transition-colors"
              title={isExpanded ? 'Minimizar' : 'Expandir'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Selector de categoría */}
      <div className="bg-dark-900/50 border-b border-dark-600 p-2 flex-shrink-0">
        <div className="flex items-center justify-center gap-2">
          {(Object.keys(CATEGORY_INFO) as ChallengeCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => changeCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? `bg-gradient-to-r ${CATEGORY_INFO[cat].color} border border-white/20 text-white`
                  : 'bg-dark-700 hover:bg-dark-600 text-gray-400'
              }`}
            >
              <span>{CATEGORY_INFO[cat].icon}</span>
              <span>{CATEGORY_INFO[cat].name}</span>
              <span className="text-[10px] opacity-60">
                ({CHALLENGES.filter(c => c.category === cat).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selector de desafío dentro de la categoría */}
      <div className={`bg-gradient-to-r ${CATEGORY_INFO[selectedCategory].color} border-b border-dark-600 p-2 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeChallenge('prev')}
            className="p-1.5 bg-dark-700/50 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
          
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{CATEGORY_INFO[selectedCategory].icon}</span>
              <span className="text-sm font-medium text-white">{currentChallenge.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                currentChallenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                currentChallenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {currentChallenge.difficulty === 'easy' ? 'Fácil' : 
                 currentChallenge.difficulty === 'medium' ? 'Medio' : 'Difícil'}
              </span>
            </div>
            <p className="text-[10px] text-gray-300">{currentChallenge.description}</p>
          </div>
          
          <button
            onClick={() => changeChallenge('next')}
            className="p-1.5 bg-dark-700/50 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>
        
        {/* Indicadores de desafíos en la categoría */}
        <div className="flex justify-center gap-1 mt-2">
          {filteredChallenges.map((challenge, i) => (
            <div 
              key={challenge.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                challenge.id === currentChallenge.id ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Contador de coleccionables */}
      {totalCollectibles > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30 p-2 flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-gray-400">Coleccionables:</span>
            <div className="flex items-center gap-1">
              {currentChallenge.collectibles?.map((item) => (
                <div 
                  key={item.id}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                    collectedItems.has(item.id)
                      ? item.type === 'star' ? 'bg-yellow-500 text-yellow-900'
                        : item.type === 'gem' ? 'bg-purple-500 text-purple-900'
                        : item.type === 'coin' ? 'bg-amber-400 text-amber-900'
                        : 'bg-red-500 text-red-900'
                      : 'bg-dark-600 text-gray-500'
                  }`}
                >
                  {item.type === 'star' ? '★' : item.type === 'gem' ? '◆' : item.type === 'coin' ? '●' : '🔑'}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-purple-300">{collectedCount}/{totalCollectibles}</span>
            {currentChallenge.requireAllCollectibles && collectedCount < totalCollectibles && (
              <span className="text-xs text-orange-400">(Requeridos)</span>
            )}
          </div>
        </div>
      )}

      {/* Contador de objetos Mini Sumo */}
      {totalPushables > 0 && (
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 p-2 flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-gray-400">🥋 Mini Sumo:</span>
            <div className="flex items-center gap-1">
              {currentChallenge.pushableObjects?.map((obj) => (
                <div 
                  key={obj.id}
                  className={`w-5 h-5 rounded flex items-center justify-center text-xs transition-all ${
                    objectsOutOfDohyo.has(obj.id)
                      ? 'bg-green-500 text-green-900'
                      : obj.type === 'cup' ? 'bg-red-500/50 text-red-200'
                        : obj.type === 'box' ? 'bg-blue-500/50 text-blue-200'
                        : 'bg-green-500/50 text-green-200'
                  }`}
                >
                  {obj.type === 'cup' ? '🥤' : obj.type === 'box' ? '📦' : '🛢️'}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-orange-300">{pushedOutCount}/{totalPushables} fuera</span>
          </div>
        </div>
      )}

      {/* Mensaje de victoria con botón de enviar */}
      {goalReached && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 p-3 flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-300">¡Reto completado!</span>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-lg text-xs font-medium transition-colors border border-green-500/30"
            >
              <Send className="w-3 h-3" />
              Enviar Reto
            </button>
          </div>
        </div>
      )}

      {/* Modal de envío de reto */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Enviar Reto Completado
            </h3>
            <div className="bg-dark-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{CATEGORY_INFO[selectedCategory].icon}</span>
                <span className="text-white font-medium">{currentChallenge.name}</span>
              </div>
              <p className="text-sm text-gray-400">{currentChallenge.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  currentChallenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  currentChallenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {currentChallenge.difficulty === 'easy' ? 'Fácil' : 
                   currentChallenge.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                </span>
                <span className="text-xs text-gray-500">Categoría: {CATEGORY_INFO[selectedCategory].name}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              ¿Deseas enviar este reto como completado a tu docente?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={submitChallenge}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-300/30 border-t-green-300 rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex ${isExpanded ? 'flex-1 min-h-0 overflow-hidden' : ''}`}>
        {/* Canvas 3D */}
        <div className={`flex-1 bg-dark-900 relative ${isExpanded ? 'h-full' : 'h-[400px]'}`}>
          <Canvas shadows className="w-full h-full">
            <Scene 
              robotState={robotState} 
              obstacles={obstacles} 
              challenge={currentChallenge}
              goalReached={goalReached}
              collectedItems={collectedItems}
              pushablePositions={pushablePositions}
              objectsOutOfDohyo={objectsOutOfDohyo}
            />
          </Canvas>
        </div>

        {/* Panel de control */}
        <div className={`w-48 bg-dark-900 border-l border-dark-600 p-3 space-y-4 flex-shrink-0 ${isExpanded ? 'overflow-y-auto max-h-full' : ''}`}>
          {/* Controles de dirección */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">Control Manual</p>
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <button
                onMouseDown={() => handleManualControl('up')}
                onMouseUp={() => handleManualControl('stop')}
                className="p-2 bg-dark-700 hover:bg-neon-cyan/20 rounded-lg transition-colors"
              >
                <ArrowUp className="w-4 h-4 text-neon-cyan mx-auto" />
              </button>
              <div></div>
              <button
                onMouseDown={() => handleManualControl('left')}
                onMouseUp={() => handleManualControl('stop')}
                className="p-2 bg-dark-700 hover:bg-neon-cyan/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-neon-cyan mx-auto" />
              </button>
              <button
                onClick={() => handleManualControl('stop')}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                <Square className="w-4 h-4 text-red-400 mx-auto" />
              </button>
              <button
                onMouseDown={() => handleManualControl('right')}
                onMouseUp={() => handleManualControl('stop')}
                className="p-2 bg-dark-700 hover:bg-neon-cyan/20 rounded-lg transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-neon-cyan mx-auto" />
              </button>
              <div></div>
              <button
                onMouseDown={() => handleManualControl('down')}
                onMouseUp={() => handleManualControl('stop')}
                className="p-2 bg-dark-700 hover:bg-neon-cyan/20 rounded-lg transition-colors"
              >
                <ArrowDown className="w-4 h-4 text-neon-cyan mx-auto" />
              </button>
              <div></div>
            </div>
          </div>

          {/* LEDs */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> LEDs
            </p>
            <div className="flex gap-2">
              {[13, 12, 11, 10].map(pin => (
                <button
                  key={pin}
                  onClick={() => toggleLed(pin)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    robotState.leds[pin]
                      ? pin === 13 ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50'
                        : pin === 12 ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50'
                        : pin === 11 ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50'
                        : 'bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/50'
                      : 'bg-dark-700 border-dark-500'
                  }`}
                >
                  <span className="text-[8px] text-white font-bold">{pin}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Servo */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">Servo: {robotState.servoAngle}°</p>
            <input
              type="range"
              min="0"
              max="180"
              value={robotState.servoAngle}
              onChange={(e) => executeCommand({ type: 'servo', params: { angle: parseInt(e.target.value) } })}
              className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Sensores */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" /> Sensores
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-dark-700 rounded-lg px-2 py-1.5">
                <span className="text-gray-400">Ultrasónico</span>
                <span className="text-purple-400 font-mono">{Math.round(robotState.ultrasonicDistance)} cm</span>
              </div>
              <div className="flex items-center justify-between bg-dark-700 rounded-lg px-2 py-1.5">
                <span className="text-gray-400">IR</span>
                <span className={robotState.irSensor ? 'text-red-400' : 'text-green-400'}>
                  {robotState.irSensor ? 'Obstáculo' : 'Libre'}
                </span>
              </div>
            </div>
          </div>

          {/* Motores */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1">
              <Gauge className="w-3 h-3" /> Motores
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-6">Izq</span>
                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neon-cyan transition-all"
                    style={{ width: `${(robotState.leftMotor / 255) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-6">Der</span>
                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neon-cyan transition-all"
                    style={{ width: `${(robotState.rightMotor / 255) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
