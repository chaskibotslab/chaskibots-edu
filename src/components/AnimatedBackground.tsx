'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Colores suaves azul/gris
    const colors = {
      bg: '#1a1f2e',
      grid: 'rgba(100, 150, 200, 0.05)',
      gear: ['#5a8fbc', '#7ba3c9', '#4a7a9e', '#8bb5d6'],
      particle: ['#6a9bc3', '#8ab4d4', '#5a8ab3', '#9cc5e5'],
      robot: '#5a8fbc'
    }

    // Engranajes con colores suaves
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
        radius: 40 + Math.random() * 60,
        teeth: 8 + Math.floor(Math.random() * 8),
        rotation: 0,
        speed: (Math.random() - 0.5) * 0.008,
        color: colors.gear[Math.floor(Math.random() * colors.gear.length)]
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

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: 1 + Math.random() * 2,
        color: colors.particle[Math.floor(Math.random() * colors.particle.length)]
      })
    }

    // Robots flotantes
    const robots: Array<{
      x: number
      y: number
      size: number
      rotation: number
      rotSpeed: number
      bobOffset: number
      bobSpeed: number
      type: number
    }> = []

    for (let i = 0; i < 6; i++) {
      robots.push({
        x: 100 + Math.random() * (canvas.width - 200),
        y: 100 + Math.random() * (canvas.height - 200),
        size: 30 + Math.random() * 40,
        rotation: Math.random() * 0.2 - 0.1,
        rotSpeed: (Math.random() - 0.5) * 0.002,
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 0.02 + Math.random() * 0.02,
        type: Math.floor(Math.random() * 3)
      })
    }

    // Dibujar robot tipo 1 (cuadrado con antena)
    const drawRobot1 = (x: number, y: number, size: number, time: number) => {
      ctx.save()
      ctx.translate(x, y)
      
      // Cuerpo
      ctx.strokeStyle = colors.robot
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.15
      
      // Cabeza
      ctx.strokeRect(-size/2, -size, size, size * 0.7)
      
      // Ojos
      ctx.beginPath()
      ctx.arc(-size/4, -size * 0.6, size * 0.12, 0, Math.PI * 2)
      ctx.arc(size/4, -size * 0.6, size * 0.12, 0, Math.PI * 2)
      ctx.stroke()
      
      // Antena
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(0, -size * 1.3)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, -size * 1.35, size * 0.08, 0, Math.PI * 2)
      ctx.globalAlpha = 0.3 + Math.sin(time * 3) * 0.1
      ctx.fill()
      ctx.globalAlpha = 0.15
      
      // Cuerpo principal
      ctx.strokeRect(-size * 0.6, -size * 0.25, size * 1.2, size)
      
      // Panel en el cuerpo
      ctx.strokeRect(-size * 0.3, 0, size * 0.6, size * 0.4)
      
      // Piernas
      ctx.strokeRect(-size * 0.4, size * 0.8, size * 0.25, size * 0.5)
      ctx.strokeRect(size * 0.15, size * 0.8, size * 0.25, size * 0.5)
      
      // Brazos
      ctx.strokeRect(-size * 0.85, -size * 0.1, size * 0.2, size * 0.6)
      ctx.strokeRect(size * 0.65, -size * 0.1, size * 0.2, size * 0.6)
      
      ctx.restore()
    }

    // Dibujar robot tipo 2 (redondo)
    const drawRobot2 = (x: number, y: number, size: number, time: number) => {
      ctx.save()
      ctx.translate(x, y)
      
      ctx.strokeStyle = colors.robot
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.15
      
      // Cabeza redonda
      ctx.beginPath()
      ctx.arc(0, -size * 0.5, size * 0.5, 0, Math.PI * 2)
      ctx.stroke()
      
      // Ojos
      ctx.beginPath()
      ctx.arc(-size * 0.2, -size * 0.5, size * 0.1, 0, Math.PI * 2)
      ctx.arc(size * 0.2, -size * 0.5, size * 0.1, 0, Math.PI * 2)
      ctx.stroke()
      
      // Antenas
      ctx.beginPath()
      ctx.moveTo(-size * 0.3, -size)
      ctx.lineTo(-size * 0.4, -size * 1.3)
      ctx.moveTo(size * 0.3, -size)
      ctx.lineTo(size * 0.4, -size * 1.3)
      ctx.stroke()
      
      // Cuerpo cilíndrico
      ctx.beginPath()
      ctx.ellipse(0, size * 0.3, size * 0.4, size * 0.6, 0, 0, Math.PI * 2)
      ctx.stroke()
      
      // Ruedas/base
      ctx.beginPath()
      ctx.ellipse(0, size * 0.9, size * 0.5, size * 0.15, 0, 0, Math.PI * 2)
      ctx.stroke()
      
      ctx.restore()
    }

    // Dibujar robot tipo 3 (con llave)
    const drawRobot3 = (x: number, y: number, size: number, time: number) => {
      ctx.save()
      ctx.translate(x, y)
      
      ctx.strokeStyle = colors.robot
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.15
      
      // Cabeza cuadrada con esquinas redondeadas
      ctx.beginPath()
      ctx.roundRect(-size * 0.4, -size, size * 0.8, size * 0.6, size * 0.1)
      ctx.stroke()
      
      // Ojos (uno normal, uno con lupa)
      ctx.beginPath()
      ctx.arc(-size * 0.15, -size * 0.7, size * 0.08, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(size * 0.15, -size * 0.7, size * 0.12, 0, Math.PI * 2)
      ctx.stroke()
      
      // Boca/sonrisa
      ctx.beginPath()
      ctx.arc(0, -size * 0.5, size * 0.15, 0.2, Math.PI - 0.2)
      ctx.stroke()
      
      // Cuerpo
      ctx.strokeRect(-size * 0.5, -size * 0.35, size, size * 0.9)
      
      // Brazo con llave
      ctx.save()
      ctx.translate(size * 0.5, -size * 0.1)
      ctx.rotate(Math.sin(time * 2) * 0.3)
      ctx.strokeRect(0, -size * 0.1, size * 0.6, size * 0.2)
      // Llave
      ctx.beginPath()
      ctx.arc(size * 0.7, 0, size * 0.15, 0, Math.PI * 2)
      ctx.moveTo(size * 0.7, size * 0.15)
      ctx.lineTo(size * 0.7, size * 0.35)
      ctx.lineTo(size * 0.6, size * 0.35)
      ctx.stroke()
      ctx.restore()
      
      // Piernas
      ctx.strokeRect(-size * 0.35, size * 0.6, size * 0.2, size * 0.4)
      ctx.strokeRect(size * 0.15, size * 0.6, size * 0.2, size * 0.4)
      
      ctx.restore()
    }

    // Dibujar engranaje
    const drawGear = (gear: typeof gears[0]) => {
      ctx.save()
      ctx.translate(gear.x, gear.y)
      ctx.rotate(gear.rotation)
      
      ctx.strokeStyle = gear.color
      ctx.globalAlpha = 0.12
      ctx.lineWidth = 2

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

      ctx.beginPath()
      ctx.arc(0, 0, gear.radius * 0.4, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(0, 0, gear.radius * 0.15, 0, Math.PI * 2)
      ctx.globalAlpha = 0.2
      ctx.fillStyle = gear.color
      ctx.fill()

      ctx.restore()
    }

    let time = 0
    let animationId: number

    const animate = () => {
      time += 0.016

      // Fondo azul oscuro suave
      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid sutil
      ctx.strokeStyle = colors.grid
      ctx.lineWidth = 1
      const gridSize = 80
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

      // Dibujar robots
      robots.forEach(robot => {
        const bobY = Math.sin(time * robot.bobSpeed * 60 + robot.bobOffset) * 5
        robot.rotation += robot.rotSpeed
        
        ctx.save()
        ctx.translate(robot.x, robot.y + bobY)
        ctx.rotate(robot.rotation)
        
        if (robot.type === 0) drawRobot1(0, 0, robot.size, time)
        else if (robot.type === 1) drawRobot2(0, 0, robot.size, time)
        else drawRobot3(0, 0, robot.size, time)
        
        ctx.restore()
      })

      // Dibujar partículas
      ctx.globalAlpha = 0.4
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      // Conectar partículas cercanas
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.03)'
      ctx.lineWidth = 1
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
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Orbes de luz suaves azul */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-300/5 rounded-full blur-[180px]" />
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-sky-400/4 rounded-full blur-[150px]" />
    </div>
  )
}
