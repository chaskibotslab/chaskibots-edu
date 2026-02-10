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

    // Partículas
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      type: 'dot' | 'gear' | 'circuit'
    }> = []

    // Crear partículas
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: ['#00f5ff', '#bf00ff', '#00ff88'][Math.floor(Math.random() * 3)],
        type: ['dot', 'gear', 'circuit'][Math.floor(Math.random() * 3)] as 'dot' | 'gear' | 'circuit'
      })
    }

    // Líneas de circuito
    const circuits: Array<{
      x: number
      y: number
      length: number
      angle: number
      speed: number
      progress: number
    }> = []

    for (let i = 0; i < 15; i++) {
      circuits.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 100 + Math.random() * 200,
        angle: [0, 90, 180, 270][Math.floor(Math.random() * 4)] * Math.PI / 180,
        speed: 0.5 + Math.random() * 1,
        progress: Math.random()
      })
    }

    // Engranajes
    const gears: Array<{
      x: number
      y: number
      radius: number
      teeth: number
      rotation: number
      speed: number
      color: string
    }> = []

    for (let i = 0; i < 8; i++) {
      gears.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 30 + Math.random() * 50,
        teeth: 8 + Math.floor(Math.random() * 8),
        rotation: 0,
        speed: (Math.random() - 0.5) * 0.02,
        color: `rgba(0, 245, 255, ${0.05 + Math.random() * 0.1})`
      })
    }

    // Dibujar engranaje
    const drawGear = (gear: typeof gears[0]) => {
      ctx.save()
      ctx.translate(gear.x, gear.y)
      ctx.rotate(gear.rotation)
      ctx.strokeStyle = gear.color
      ctx.lineWidth = 2

      // Círculo exterior con dientes
      ctx.beginPath()
      for (let i = 0; i < gear.teeth * 2; i++) {
        const angle = (i * Math.PI) / gear.teeth
        const r = i % 2 === 0 ? gear.radius : gear.radius * 0.85
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()

      // Círculo interior
      ctx.beginPath()
      ctx.arc(0, 0, gear.radius * 0.3, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    }

    // Animación
    let animationId: number
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)'
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

      // Dibujar engranajes
      gears.forEach(gear => {
        gear.rotation += gear.speed
        drawGear(gear)
      })

      // Dibujar circuitos animados
      circuits.forEach(circuit => {
        circuit.progress += circuit.speed * 0.01
        if (circuit.progress > 1) {
          circuit.progress = 0
          circuit.x = Math.random() * canvas.width
          circuit.y = Math.random() * canvas.height
          circuit.angle = [0, 90, 180, 270][Math.floor(Math.random() * 4)] * Math.PI / 180
        }

        const endX = circuit.x + Math.cos(circuit.angle) * circuit.length * circuit.progress
        const endY = circuit.y + Math.sin(circuit.angle) * circuit.length * circuit.progress

        // Línea principal
        ctx.beginPath()
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.3 * (1 - circuit.progress)})`
        ctx.lineWidth = 2
        ctx.moveTo(circuit.x, circuit.y)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        // Punto brillante al final
        ctx.beginPath()
        ctx.fillStyle = '#00f5ff'
        ctx.shadowColor = '#00f5ff'
        ctx.shadowBlur = 10
        ctx.arc(endX, endY, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Dibujar y mover partículas
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        // Rebote en bordes
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 5
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Conectar partículas cercanas
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
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
      {/* Canvas animado */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)' }}
      />
      
      {/* Orbes de luz */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-pink/8 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-neon-green/8 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '1.5s' }} />
    </div>
  )
}
