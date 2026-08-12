'use client'

import { useEffect, useState } from 'react'

const MATRIX_CHARS = '01アカサタナハマヤラワ<>/{}[]#$%01アイウエオ'

interface Column {
  left: number
  delay: number
  duration: number
  chars: string[]
}

function useMatrixColumns(count: number) {
  const [columns, setColumns] = useState<Column[]>([])
  useEffect(() => {
    setColumns(
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
        chars: Array.from({ length: 12 + Math.floor(Math.random() * 8) }).map(
          () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        ),
      }))
    )
  }, [count])
  return columns
}

export default function MatrixRain({ count = 14, className = '' }: { count?: number; className?: string }) {
  const columns = useMatrixColumns(count)
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {columns.map((col, i) => (
        <div
          key={i}
          className="absolute top-0 flex flex-col items-center font-mono text-hack-green/60 text-xs leading-4 animate-matrix-fall"
          style={{ left: `${col.left}%`, animationDelay: `${col.delay}s`, animationDuration: `${col.duration}s` }}
        >
          {col.chars.map((c, j) => (
            <span key={j} style={{ opacity: 1 - j / col.chars.length }}>{c}</span>
          ))}
        </div>
      ))}
    </div>
  )
}
