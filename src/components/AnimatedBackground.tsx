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

    // Caracteres para el efecto Matrix
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン<>{}[]/*-+=%$#@!?ROBOT'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    
    // Posición Y de cada columna
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    // Colores para las columnas
    const colors = ['#00f5ff', '#bf00ff', '#00ff88', '#ff00aa']
    const columnColors: string[] = []
    for (let i = 0; i < columns; i++) {
      columnColors[i] = colors[Math.floor(Math.random() * colors.length)]
    }

    // Engranajes flotantes
    const gears: Array<{
      x: number
      y: number
      radius: number
      teeth: number
      rotation: number
      speed: number
      opacity: number
    }> = []

    for (let i = 0; i < 6; i++) {
      gears.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 40 + Math.random() * 60,
        teeth: 8 + Math.floor(Math.random() * 8),
        rotation: 0,
        speed: (Math.random() - 0.5) * 0.015,
        opacity: 0.08 + Math.random() * 0.12
      })
    }

    // Dibujar engranaje
    const drawGear = (gear: typeof gears[0]) => {
      ctx.save()
      ctx.translate(gear.x, gear.y)
      ctx.rotate(gear.rotation)
      ctx.strokeStyle = `rgba(0, 245, 255, ${gear.opacity})`
      ctx.lineWidth = 2

      ctx.beginPath()
      for (let i = 0; i < gear.teeth * 2; i++) {
        const angle = (i * Math.PI) / gear.teeth
        const r = i % 2 === 0 ? gear.radius : gear.radius * 0.8
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(0, 0, gear.radius * 0.3, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    }

    // Animación
    let animationId: number
    const animate = () => {
      // Fondo semi-transparente para efecto trail
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dibujar engranajes
      gears.forEach(gear => {
        gear.rotation += gear.speed
        drawGear(gear)
      })

      // Dibujar caracteres cayendo (Matrix)
      ctx.font = `${fontSize}px monospace`
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Color con brillo variable
        const brightness = Math.random()
        if (brightness > 0.98) {
          // Caracter brillante (cabeza)
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = columnColors[i]
          ctx.shadowBlur = 15
        } else {
          ctx.fillStyle = columnColors[i]
          ctx.shadowBlur = 0
          ctx.globalAlpha = 0.3 + Math.random() * 0.5
        }

        ctx.fillText(char, x, y)
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0

        // Reiniciar columna cuando sale de pantalla
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
          // Cambiar color ocasionalmente
          if (Math.random() > 0.7) {
            columnColors[i] = colors[Math.floor(Math.random() * colors.length)]
          }
        }
        drops[i] += 0.5 + Math.random() * 0.5
      }

      // Grid sutil
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.02)'
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
        style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)' }}
      />
      
      {/* Orbes de luz más intensos */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-cyan/15 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-purple/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-neon-pink/12 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/3 left-1/3 w-[350px] h-[350px] bg-neon-green/12 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: '1.5s' }} />
    </div>
  )
}
