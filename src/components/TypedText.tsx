'use client'

import { useEffect, useState } from 'react'

export default function TypedText({ lines, className }: { lines: string[]; className?: string }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')

  useEffect(() => {
    const current = lines[lineIndex % lines.length]
    let timeout: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 45)
      } else {
        timeout = setTimeout(() => setPhase('pausing'), 1300)
      }
    } else if (phase === 'pausing') {
      timeout = setTimeout(() => setPhase('deleting'), 900)
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), 22)
      } else {
        setPhase('typing')
        setLineIndex((i) => (i + 1) % lines.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [text, phase, lineIndex, lines])

  return (
    <span className={className}>
      {text}
      <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle animate-cursor-blink" />
    </span>
  )
}
