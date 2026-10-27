'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import Header from '@/components/Header'

// Three.js, Rapier (WASM) y el Web Worker solo existen en el navegador.
const Taller = dynamic(() => import('./taller/Taller'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100dvh-4rem)] items-center justify-center gap-2 bg-labdark-void text-sm text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" /> Cargando laboratorio…
    </div>
  ),
})

export default function LaboratorioCliente() {
  return (
    <div className="min-h-screen bg-labdark-void">
      <Header />
      <Taller />
    </div>
  )
}
