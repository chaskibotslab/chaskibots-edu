'use client'

import { Server, AlertTriangle, FolderOpen, FileWarning, ShieldAlert } from 'lucide-react'
import type { NetworkReveal } from './HackingTerminal'

interface Mission {
  id: string
  title: string
  steps: { reveal?: NetworkReveal | NetworkReveal[] }[]
}

interface NetworkMapPanelProps {
  mission: Mission | null
  currentStep: number
}

interface AccumulatedState {
  owner: string | null
  ip: string | null
  routes: string[]
  files: string[]
  ports: { port: number; service: string; version?: string; vulnLabel?: string }[]
  breach: string | null
}

function accumulate(mission: Mission, currentStep: number): AccumulatedState {
  const state: AccumulatedState = { owner: null, ip: null, routes: [], files: [], ports: [], breach: null }
  const completed = mission.steps.slice(0, currentStep)

  for (const step of completed) {
    if (!step.reveal) continue
    const reveals = Array.isArray(step.reveal) ? step.reveal : [step.reveal]
    for (const r of reveals) {
      if (r.kind === 'owner') state.owner = r.value
      else if (r.kind === 'ip') state.ip = r.value
      else if (r.kind === 'route') state.routes.push(...r.values)
      else if (r.kind === 'file') state.files.push(r.value)
      else if (r.kind === 'port') state.ports.push({ port: r.port, service: r.service, version: r.version })
      else if (r.kind === 'vuln') {
        const existing = state.ports.find(p => p.port === r.onPort)
        if (existing) existing.vulnLabel = r.label
        else state.ports.push({ port: r.onPort, service: '?', vulnLabel: r.label })
      } else if (r.kind === 'breach') state.breach = r.label
    }
  }
  return state
}

/** Panel de mapeo de red: visualiza en vivo lo que el alumno va descubriendo del objetivo al
 * correr comandos (whois, nmap, sqli...) en la terminal. Puramente derivado del progreso de la
 * misión — no tiene estado propio ni afecta la lógica de validación/XP. */
export default function NetworkMapPanel({ mission, currentStep }: NetworkMapPanelProps) {
  if (!mission) return null
  const hasRevealData = mission.steps.some(s => !!s.reveal)
  if (!hasRevealData) return null

  const state = accumulate(mission, currentStep)
  const discovered = !!state.ip

  return (
    <div className="p-3 bg-gray-900/60 border border-orange-500/20 rounded-lg">
      <div className="text-[10px] text-orange-300 font-bold mb-2 flex items-center gap-1.5">
        <Server className="w-3 h-3" /> Mapa de red — target-corp.com
      </div>

      {/* Nodo central */}
      <div className="flex flex-col items-center gap-1 py-2">
        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
          state.breach ? 'border-red-500 bg-red-500/10' : discovered ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-800/50'
        }`}>
          <Server className={`w-6 h-6 ${state.breach ? 'text-red-400' : discovered ? 'text-green-400' : 'text-gray-500'}`} />
        </div>
        <div className="text-[10px] text-gray-300 font-mono">{state.ip || '???.???.???.???'}</div>
        {state.owner && <div className="text-[9px] text-gray-500">{state.owner}</div>}
      </div>

      {/* Puertos descubiertos */}
      {state.ports.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center mt-1">
          {state.ports.map(p => (
            <div
              key={p.port}
              title={p.vulnLabel || p.version || p.service}
              className={`px-2 py-1 rounded text-[9px] font-mono flex items-center gap-1 ${
                p.vulnLabel ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-gray-700/50 text-gray-300 border border-gray-600/40'
              }`}
            >
              {p.vulnLabel && <AlertTriangle className="w-2.5 h-2.5" />}
              {p.port} {p.service}
            </div>
          ))}
        </div>
      )}

      {/* Rutas y archivos descubiertos */}
      {(state.routes.length > 0 || state.files.length > 0) && (
        <div className="mt-2 space-y-1">
          {state.routes.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <FolderOpen className="w-3 h-3 text-yellow-500 flex-shrink-0" />
              {state.routes.map(r => (
                <span key={r} className="text-[9px] font-mono text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">{r}</span>
              ))}
            </div>
          )}
          {state.files.map(f => (
            <div key={f} className="flex items-center gap-1">
              <FileWarning className="w-3 h-3 text-orange-500 flex-shrink-0" />
              <span className="text-[9px] font-mono text-orange-400">{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* Breach */}
      {state.breach && (
        <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 bg-red-500/20 border border-red-500/40 rounded text-[9px] text-red-300 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> {state.breach}
        </div>
      )}
    </div>
  )
}
