'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import './tema.css'

// Three.js, Rapier (WASM) y el Web Worker solo existen en el navegador.
const Taller = dynamic(() => import('./taller/Taller'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100dvh-4rem)] lab-tema items-center justify-center gap-2 text-sm text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" /> Cargando laboratorio…
    </div>
  ),
})

export default function LaboratorioCliente() {
  return (
    <div className="lab-tema min-h-screen">
      <Header />
      <Taller />
    </div>
  )
}
