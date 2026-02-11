'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Engranajes grandes y visibles
    const gears: Array<{
      x: number
      y: number
      radius: number
      teeth: number
      rotation: number
      speed: number
      color: string
    }> = [
      { x: 100, y: 150, radius: 80, teeth: 12, rotation: 0, speed: 0.005, color: '#00f5ff' },
      { x: 250, y: 100, radius: 50, teeth: 8, rotation: 0, speed: -0.008, color: '#bf00ff' },
      { x: canvas.width - 150, y: 200, radius: 100, teeth: 16, rotation: 0, speed: 0.004, color: '#00ff88' },
      { x: canvas.width - 80, y: 350, radius: 60, teeth: 10, rotation: 0, speed: -0.006, color: '#00f5ff' },
      { x: 150, y: canvas.height - 200, radius: 90, teeth: 14, rotation: 0, speed: 0.003, color: '#ff00aa' },
      { x: 300, y: canvas.height - 100, radius: 55, teeth: 9, rotation: 0, speed: -0.007, color: '#bf00ff' },
      { x: canvas.width - 200, y: canvas.height - 150, radius: 70, teeth: 11, rotation: 0, speed: 0.005, color: '#00f5ff' },
      { x: canvas.width / 2, y: 80, radius: 45, teeth: 8, rotation: 0, speed: -0.009, color: '#00ff88' },
      { x: canvas.width / 2 - 100, y: canvas.height - 80, radius: 65, teeth: 10, rotation: 0, speed: 0.006, color: '#ff00aa' },
      { x: 50, y: canvas.height / 2, radius: 75, teeth: 12, rotation: 0, speed: -0.004, color: '#bf00ff' },
      { x: canvas.width - 60, y: canvas.height / 2, radius: 55, teeth: 9, rotation: 0, speed: 0.007, color: '#00f5ff' },
    ]

    // Circuitos/líneas conectoras
    const circuits: Array<{
      x1: number
      y1: number
      x2: number
      y2: number
      progress: number
      speed: number
      color: string
    }> = []

    for (let i = 0; i < 20; i++) {
      const isHorizontal = Math.random() > 0.5
      const x1 = Math.random() * canvas.width
      const y1 = Math.random() * canvas.height
      circuits.push({
        x1,
        y1,
        x2: isHorizontal ? x1 + 100 + Math.random() * 200 : x1,
        y2: isHorizontal ? y1 : y1 + 100 + Math.random() * 200,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.01,
        color: ['#00f5ff', '#bf00ff', '#00ff88'][Math.floor(Math.random() * 3)]
      })
    }

    // Partículas flotantes
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 3,
        color: ['#00f5ff', '#bf00ff', '#00ff88', '#ff00aa'][Math.floor(Math.random() * 4)]
      })
    }

    // Dibujar engranaje
    const drawGear = (gear: typeof gears[0]) => {
      ctx.save()
      ctx.translate(gear.x, gear.y)
      ctx.rotate(gear.rotation)
      
      // Brillo exterior
      ctx.shadowColor = gear.color
      ctx.shadowBlur = 20
      ctx.strokeStyle = gear.color
      ctx.globalAlpha = 0.15
      ctx.lineWidth = 3

      // Dientes del engranaje
      ctx.beginPath()
      for (let i = 0; i < gear.teeth * 2; i++) {
        const angle = (i * Math.PI) / gear.teeth
        const r = i % 2 === 0 ? gear.radius : gear.radius * 0.75
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()

      // Círculo interior
      ctx.beginPath()
      ctx.arc(0, 0, gear.radius * 0.4, 0, Math.PI * 2)
      ctx.stroke()

      // Centro
      ctx.beginPath()
      ctx.arc(0, 0, gear.radius * 0.15, 0, Math.PI * 2)
      ctx.globalAlpha = 0.3
      ctx.fill()

      ctx.restore()
    }

    // Animación principal
    let animationId: number
    const animate = () => {
      // Limpiar canvas con fondo oscuro
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid de fondo
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 60
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Dibujar circuitos animados
      circuits.forEach(circuit => {
        circuit.progress += circuit.speed
        if (circuit.progress > 1) circuit.progress = 0

        const currentX = circuit.x1 + (circuit.x2 - circuit.x1) * circuit.progress
        const currentY = circuit.y1 + (circuit.y2 - circuit.y1) * circuit.progress

        // Línea base
        ctx.beginPath()
        ctx.strokeStyle = circuit.color
        ctx.globalAlpha = 0.1
        ctx.lineWidth = 2
        ctx.moveTo(circuit.x1, circuit.y1)
        ctx.lineTo(circuit.x2, circuit.y2)
        ctx.stroke()

        // Punto brillante que viaja
        ctx.beginPath()
        ctx.fillStyle = circuit.color
        ctx.shadowColor = circuit.color
        ctx.shadowBlur = 15
        ctx.globalAlpha = 0.8
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      })

      // Dibujar engranajes
      gears.forEach(gear => {
        gear.rotation += gear.speed
        drawGear(gear)
      })

      // Dibujar partículas
      ctx.globalAlpha = 0.6
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      // Conectar partículas cercanas
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.05)'
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Orbes de luz de fondo */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neon-cyan/8 rounded-full blur-[200px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-purple/8 rounded-full blur-[180px]" />
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-neon-pink/6 rounded-full blur-[150px]" />
    </div>
  )
}
