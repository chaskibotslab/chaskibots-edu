'use client'

import { useState } from 'react'
import { Bot } from 'lucide-react'

/** Foto de catálogo de una pieza o proyecto (public/lab/miniaturas); si falta, un ícono. */
export default function Miniatura({ nombre, className = '', icono: I = Bot }: { nombre: string; className?: string; icono?: typeof Bot }) {
  const [falla, setFalla] = useState(false)
  return (
    <div className={`lab-foto flex items-center justify-center overflow-hidden ${className}`}>
      {falla
        ? <I className="h-1/3 w-1/3 text-lab-tenue/60" />
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={`/lab/miniaturas/${nombre}.webp`} alt="" loading="lazy" draggable={false} onError={() => setFalla(true)} className="h-full w-full object-contain" />}
    </div>
  )
}
