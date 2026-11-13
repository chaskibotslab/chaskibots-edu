'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './tema.css'

// Letras del laboratorio: Inter (limpia, como la de un teléfono) y JetBrains Mono (datos y pines).
const display = Inter({ subsets: ['latin'], variable: '--lab-display', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--lab-mono', display: 'swap' })

// Three.js, Rapier (WASM) y el Web Worker solo existen en el navegador.
const Taller = dynamic(() => import('./taller/Taller'), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh lab-tema items-center justify-center gap-2 text-sm text-lab-suave">
      <Loader2 className="h-5 w-5 animate-spin" /> Cargando laboratorio…
    </div>
  ),
})

export default function LaboratorioCliente() {
  return (
    <div className={`lab-tema min-h-screen ${display.variable} ${mono.variable}`}>
      <Taller />
    </div>
  )
}
