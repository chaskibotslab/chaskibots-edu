'use client'

// Ayuda de navegación reutilizable para los simuladores.
// Muestra una tarjeta "¿Cómo funciona?" la PRIMERA vez (recordado en el navegador)
// y un botón flotante para reabrirla cuando quieran. Pensada para principiantes.

import { useEffect, useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

export interface SimHelpStep {
  icon: string        // un emoji
  title: string
  text: string
}

interface SimHelpProps {
  storageKey: string  // clave única por simulador, ej. 'help-hacking'
  titulo: string
  pasos: SimHelpStep[]
}

export default function SimHelp({ storageKey, titulo, pasos }: SimHelpProps) {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) setAbierto(true)
    } catch { /* modo privado: no pasa nada */ }
  }, [storageKey])

  const cerrar = () => {
    setAbierto(false)
    try { localStorage.setItem(storageKey, '1') } catch { /* ignore */ }
  }

  return (
    <>
      {/* Botón flotante para reabrir la ayuda */}
      <button
        onClick={() => setAbierto(true)}
        className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 rounded-full bg-blue-500/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-blue-500 transition-colors"
        title="¿Cómo funciona esto?"
      >
        <HelpCircle className="h-4 w-4" /> ¿Cómo funciona?
      </button>

      {/* Tarjeta explicativa */}
      {abierto && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={cerrar}>
          <div
            className="w-full max-w-md rounded-2xl border border-blue-500/30 bg-[#161B2E] p-5 shadow-2xl"
            style={{ animation: 'tnEntra .3s ease-out both' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-black text-white">
                <HelpCircle className="h-5 w-5 text-blue-400" /> {titulo}
              </h3>
              <button onClick={cerrar} className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {pasos.map((p, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xl leading-none">{p.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-blue-100">{p.title}</div>
                    <div className="text-[13px] leading-snug text-gray-300">{p.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={cerrar}
              className="mt-4 w-full rounded-xl bg-blue-500 py-2.5 text-sm font-bold text-white hover:bg-blue-400 transition-colors"
            >
              ¡Entendido, empecemos!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
