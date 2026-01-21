'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Play, Pause, RotateCcw, Zap, Gauge, Thermometer, 
  Radio, Volume2, Lightbulb, Eye, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Square, Activity
} from 'lucide-react'

interface RobotState {
  x: number
  y: number
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

interface RobotSimulatorProps {
  commands?: SimulatorCommand[]
  onStateChange?: (state: RobotState) => void
}

export default function RobotSimulator({ commands = [], onStateChange }: RobotSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isRunning, setIsRunning] = useState(false)
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [robotState, setRobotState] = useState<RobotState>({
    x: 200,
    y: 200,
    angle: -90, // Apuntando hacia arriba
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

  // Dibujar el robot y el escenario
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpiar canvas
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Dibujar grid
    ctx.strokeStyle = '#2a2a4a'
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Dibujar obstáculos
    ctx.fillStyle = '#4a4a6a'
    ctx.fillRect(50, 50, 60, 60)
    ctx.fillRect(300, 100, 80, 40)
    ctx.fillRect(100, 280, 50, 80)
    ctx.fillRect(320, 280, 70, 70)

    // Calcular distancia al obstáculo más cercano (simulación simple)
    const obstacles = [
      { x: 80, y: 80, w: 60, h: 60 },
      { x: 340, y: 120, w: 80, h: 40 },
      { x: 125, y: 320, w: 50, h: 80 },
      { x: 355, y: 315, w: 70, h: 70 }
    ]

    // Dibujar robot
    ctx.save()
    ctx.translate(robotState.x, robotState.y)
    ctx.rotate((robotState.angle * Math.PI) / 180)

    // Cuerpo del robot (rectángulo redondeado)
    ctx.fillStyle = '#16213e'
    ctx.strokeStyle = '#00f5d4'
    ctx.lineWidth = 3
    roundRect(ctx, -30, -25, 60, 50, 8)
    ctx.fill()
    ctx.stroke()

    // Ruedas
    ctx.fillStyle = robotState.leftMotor > 0 ? '#00f5d4' : '#3a3a5a'
    ctx.fillRect(-35, -20, 8, 15)
    ctx.fillRect(-35, 5, 8, 15)
    
    ctx.fillStyle = robotState.rightMotor > 0 ? '#00f5d4' : '#3a3a5a'
    ctx.fillRect(27, -20, 8, 15)
    ctx.fillRect(27, 5, 8, 15)

    // Sensor ultrasónico (frente)
    ctx.fillStyle = '#9333ea'
    ctx.beginPath()
    ctx.arc(0, -25, 8, 0, Math.PI * 2)
    ctx.fill()
    
    // Ojos del sensor
    ctx.fillStyle = '#c084fc'
    ctx.beginPath()
    ctx.arc(-3, -25, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(3, -25, 3, 0, Math.PI * 2)
    ctx.fill()

    // LEDs en el robot
    const ledPositions = [
      { pin: 13, x: -15, y: -10 },
      { pin: 12, x: -5, y: -10 },
      { pin: 11, x: 5, y: -10 },
      { pin: 10, x: 15, y: -10 }
    ]
    
    ledPositions.forEach(led => {
      ctx.beginPath()
      ctx.arc(led.x, led.y, 4, 0, Math.PI * 2)
      if (robotState.leds[led.pin]) {
        ctx.fillStyle = led.pin === 13 ? '#ef4444' : 
                        led.pin === 12 ? '#22c55e' : 
                        led.pin === 11 ? '#3b82f6' : '#eab308'
        ctx.shadowColor = ctx.fillStyle
        ctx.shadowBlur = 10
      } else {
        ctx.fillStyle = '#3a3a5a'
        ctx.shadowBlur = 0
      }
      ctx.fill()
      ctx.shadowBlur = 0
    })

    // Servo (brazo)
    ctx.save()
    ctx.translate(0, 10)
    ctx.rotate(((robotState.servoAngle - 90) * Math.PI) / 180)
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(-3, 0, 6, 20)
    ctx.beginPath()
    ctx.arc(0, 20, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Dirección (flecha)
    ctx.fillStyle = '#00f5d4'
    ctx.beginPath()
    ctx.moveTo(0, -35)
    ctx.lineTo(-8, -25)
    ctx.lineTo(8, -25)
    ctx.closePath()
    ctx.fill()

    ctx.restore()

    // Dibujar rayo del sensor ultrasónico
    if (robotState.ultrasonicDistance < 150) {
      ctx.save()
      ctx.translate(robotState.x, robotState.y)
      ctx.rotate((robotState.angle * Math.PI) / 180)
      
      const gradient = ctx.createLinearGradient(0, -30, 0, -30 - robotState.ultrasonicDistance)
      gradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)')
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0)')
      
      ctx.strokeStyle = gradient
      ctx.lineWidth = 20
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, -30)
      ctx.lineTo(0, -30 - Math.min(robotState.ultrasonicDistance, 100))
      ctx.stroke()
      
      ctx.restore()
    }

    // Logo ChaskiBots
    ctx.fillStyle = '#00f5d4'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('ChaskiBots', canvas.width - 10, canvas.height - 10)

  }, [robotState])

  // Función para dibujar rectángulo redondeado
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  // Animación
  useEffect(() => {
    draw()
  }, [draw])

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
          newState.x += Math.sin(radForward) * 2
          newState.y -= Math.cos(radForward) * 2
          // Limitar al canvas
          newState.x = Math.max(40, Math.min(360, newState.x))
          newState.y = Math.max(40, Math.min(360, newState.y))
          break
          
        case 'move_backward':
          newState.isMoving = true
          newState.leftMotor = cmd.params.speed || 150
          newState.rightMotor = cmd.params.speed || 150
          const radBackward = (prev.angle * Math.PI) / 180
          newState.x -= Math.sin(radBackward) * 2
          newState.y += Math.cos(radBackward) * 2
          newState.x = Math.max(40, Math.min(360, newState.x))
          newState.y = Math.max(40, Math.min(360, newState.y))
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
      
      // Calcular distancia ultrasónica (simplificado)
      newState.ultrasonicDistance = 50 + Math.random() * 100
      
      return newState
    })
  }, [])

  // Demo de movimiento
  const runDemo = () => {
    setIsRunning(true)
    let step = 0
    const demoCommands: SimulatorCommand[] = [
      { type: 'led_on', params: { pin: 13 } },
      { type: 'move_forward', params: { speed: 150 }, duration: 1000 },
      { type: 'led_on', params: { pin: 12 } },
      { type: 'turn_right', params: { angle: 90 }, duration: 500 },
      { type: 'led_on', params: { pin: 11 } },
      { type: 'move_forward', params: { speed: 150 }, duration: 800 },
      { type: 'led_on', params: { pin: 10 } },
      { type: 'turn_left', params: { angle: 90 }, duration: 500 },
      { type: 'servo', params: { angle: 45 } },
      { type: 'move_forward', params: { speed: 150 }, duration: 600 },
      { type: 'servo', params: { angle: 135 } },
      { type: 'buzzer', params: { freq: 1000 } },
      { type: 'stop', params: {} },
    ]

    const interval = setInterval(() => {
      if (step < demoCommands.length) {
        executeCommand(demoCommands[step])
        step++
      } else {
        clearInterval(interval)
        setIsRunning(false)
        // Apagar todo
        setRobotState(prev => ({
          ...prev,
          isMoving: false,
          leftMotor: 0,
          rightMotor: 0,
          buzzerFreq: 0
        }))
      }
    }, 100)

    return () => clearInterval(interval)
  }

  const resetRobot = () => {
    setIsRunning(false)
    setRobotState({
      x: 200,
      y: 200,
      angle: -90,
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

  // Controles manuales
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
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-dark-600 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulador de Robot</h3>
              <p className="text-xs text-gray-400">Vista en tiempo real</p>
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
        {/* Canvas */}
        <div className="flex-1 p-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="rounded-lg border border-dark-600 w-full"
            style={{ maxWidth: '400px' }}
          />
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
