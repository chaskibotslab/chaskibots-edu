'use client'

/**
 * Simulador LEGO EV3 con dos modos:
 *  - Armar: construir el robot pieza por pieza (ConstructorEV3).
 *  - Programar: programar el robot por bloques y verlo en misiones (EV3Lab).
 */
import { useState } from 'react'
import { Hammer, Play } from 'lucide-react'
import ConstructorEV3 from './ConstructorEV3'
import EV3Lab from './EV3Lab'

export default function LegoEV3() {
  const [tab, setTab] = useState<'armar' | 'programar'>('armar')
  const btn = (activo: boolean) =>
    `flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-bold transition-colors ${activo ? 'bg-slate-100 text-slate-900' : 'bg-slate-300/60 text-slate-600 hover:bg-slate-300'}`
  return (
    <div className="flex h-full min-h-[560px] flex-col">
      <div className="flex gap-1 bg-slate-200 px-2 pt-2">
        <button onClick={() => setTab('armar')} className={btn(tab === 'armar')}><Hammer className="h-4 w-4" /> Armar</button>
        <button onClick={() => setTab('programar')} className={btn(tab === 'programar')}><Play className="h-4 w-4" /> Programar</button>
      </div>
      <div className="min-h-0 flex-1">
        {tab === 'armar' ? <ConstructorEV3 /> : <EV3Lab />}
      </div>
    </div>
  )
}
