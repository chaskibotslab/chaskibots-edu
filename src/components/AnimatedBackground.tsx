'use client'

import { useEffect, useState } from 'react'

interface FloatingElement {
  id: number
  type: 'gear' | 'robot' | 'circuit' | 'chip' | 'bolt' | 'led'
  x: number
  y: number
  size: number
  rotation: number
  speed: number
  opacity: number
  direction: number
}

export default function AnimatedBackground() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    // Crear elementos flotantes
    const newElements: FloatingElement[] = []
    const types: FloatingElement['type'][] = ['gear', 'robot', 'circuit', 'chip', 'bolt', 'led']
    
    for (let i = 0; i < 25; i++) {
      newElements.push({
        id: i,
        type: types[Math.floor(Math.random() * types.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 40,
        rotation: Math.random() * 360,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.03 + Math.random() * 0.08,
        direction: Math.random() > 0.5 ? 1 : -1
      })
    }
    setElements(newElements)
  }, [])

  const getElementSVG = (type: FloatingElement['type'], size: number) => {
    switch (type) {
      case 'gear':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
          </svg>
        )
      case 'robot':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5Z"/>
          </svg>
        )
      case 'circuit':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M7 2v2h1v14h-1v2h5v-2h-1v-4h2v-2h-2V6h1V4h2v2h1v4h-1v2h4v-2h-1V6h1V4h2v2h1v14h-1v2h5v-2h-1V4h1V2H7Z"/>
          </svg>
        )
      case 'chip':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M6 4h12v2h2v12h-2v2H6v-2H4V6h2V4m0 4v8h12V8H6m2 2h8v4H8v-4Z"/>
          </svg>
        )
      case 'bolt':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M11 15H6l7-14v8h5l-7 14v-8Z"/>
          </svg>
        )
      case 'led':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7M9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9v1Z"/>
          </svg>
        )
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Floating elements */}
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute text-neon-cyan animate-float"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            opacity: el.opacity,
            animation: `float ${10 / el.speed}s ease-in-out infinite, spin ${20 / el.speed}s linear infinite ${el.direction === -1 ? 'reverse' : ''}`,
            animationDelay: `${el.id * 0.3}s`
          }}
        >
          {getElementSVG(el.type, el.size)}
        </div>
      ))}
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  )
}
