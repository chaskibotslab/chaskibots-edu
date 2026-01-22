'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { 
  Play, Pause, RotateCcw, Lightbulb, Eye, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Square, Gauge, Box
} from 'lucide-react'

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
}

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
  return (
    <group>
      {/* Piso principal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Grid manual */}
      <CustomGrid />

      {/* Borde del área de juego */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.9, 5, 64]} />
        <meshStandardMaterial color="#00f5d4" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// Escena 3D
function Scene({ robotState, obstacles }: { robotState: RobotState, obstacles: Array<{x: number, z: number, w: number, h: number}> }) {
  // Convertir obstáculos 2D a posiciones 3D
  const scale = 0.025
  const obstacles3D = obstacles.map(obs => ({
    position: [(obs.x + obs.w/2 - 200) * scale, 0.25, (obs.z + obs.h/2 - 200) * scale] as [number, number, number],
    size: [obs.w * scale, 0.5, obs.h * scale] as [number, number, number]
  }))

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
      
      {/* Iluminación */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#9333ea" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#00f5d4" />

      <Floor />
      
      {/* Obstáculos */}
      {obstacles3D.map((obs, i) => (
        <Obstacle key={i} position={obs.position} size={obs.size} />
      ))}

      <Robot state={robotState} obstacles={obstacles} />
    </>
  )
}

// Componente principal
export default function RobotSimulator3D({ commands = [], onStateChange }: RobotSimulator3DProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [robotState, setRobotState] = useState<RobotState>({
    x: 200,
    z: 200,
    angle: 0,
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

  // Obstáculos del escenario
  const obstacles = useRef([
    { x: 50, z: 50, w: 60, h: 60 },
    { x: 300, z: 100, w: 80, h: 40 },
    { x: 100, z: 280, w: 50, h: 80 },
    { x: 320, z: 280, w: 70, h: 70 }
  ]).current

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
          newState.angle -= 3
          newState.leftMotor = 0
          newState.rightMotor = 150
          break
          
        case 'turn_right':
          newState.angle += 3
          newState.leftMotor = 150
          newState.rightMotor = 0
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

  // Demo de movimiento
  const runDemo = () => {
    if (isRunning) return
    setIsRunning(true)
    
    const sequence = [
      { action: 'led_on', pin: 13, repeat: 1 },
      { action: 'move_forward', repeat: 30 },
      { action: 'led_on', pin: 12, repeat: 1 },
      { action: 'turn_right', repeat: 30 },
      { action: 'led_on', pin: 11, repeat: 1 },
      { action: 'move_forward', repeat: 25 },
      { action: 'led_on', pin: 10, repeat: 1 },
      { action: 'turn_left', repeat: 30 },
      { action: 'servo', angle: 45, repeat: 1 },
      { action: 'move_forward', repeat: 20 },
      { action: 'servo', angle: 135, repeat: 1 },
      { action: 'stop', repeat: 1 },
    ]
    
    let seqIndex = 0
    let repeatCount = 0
    
    const interval = setInterval(() => {
      if (seqIndex >= sequence.length) {
        clearInterval(interval)
        setIsRunning(false)
        setRobotState(prev => ({
          ...prev,
          isMoving: false,
          leftMotor: 0,
          rightMotor: 0,
          buzzerFreq: 0,
          leds: { 13: false, 12: false, 11: false, 10: false }
        }))
        return
      }
      
      const current = sequence[seqIndex]
      
      switch (current.action) {
        case 'led_on':
          executeCommand({ type: 'led_on', params: { pin: current.pin } })
          break
        case 'move_forward':
          executeCommand({ type: 'move_forward', params: { speed: 150 } })
          break
        case 'turn_left':
          executeCommand({ type: 'turn_left', params: { angle: 15 } })
          break
        case 'turn_right':
          executeCommand({ type: 'turn_right', params: { angle: 15 } })
          break
        case 'servo':
          executeCommand({ type: 'servo', params: { angle: current.angle } })
          break
        case 'stop':
          executeCommand({ type: 'stop', params: {} })
          break
      }
      
      repeatCount++
      if (repeatCount >= current.repeat) {
        seqIndex++
        repeatCount = 0
      }
    }, 50)
  }

  const resetRobot = () => {
    setIsRunning(false)
    setRobotState({
      x: 200,
      z: 200,
      angle: 0,
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
    <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-b border-dark-600 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulador 3D</h3>
              <p className="text-xs text-gray-400">Vista interactiva</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runDemo}
              disabled={isRunning}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isRunning 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isRunning ? 'Ejecutando...' : 'Demo'}
            </button>
            <button
              onClick={resetRobot}
              className="flex items-center gap-1 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Canvas 3D */}
        <div className="flex-1 h-[400px] bg-dark-900">
          <Canvas shadows>
            <Scene robotState={robotState} obstacles={obstacles} />
          </Canvas>
        </div>

        {/* Panel de control */}
        <div className="w-48 bg-dark-900 border-l border-dark-600 p-3 space-y-4">
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
