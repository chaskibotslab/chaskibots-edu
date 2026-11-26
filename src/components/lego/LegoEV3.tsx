'use client'

/**
 * Simulador LEGO EV3 con tres modos:
 *  - Armar: construir un robot EV3 real paso a paso (ConstructorEV3Real).
 *  - Catálogo: elegir piezas reales y construir libremente (CatalogoEV3).
 *  - Programar: programar el robot por bloques y verlo en misiones (EV3Lab).
 */
import { useState } from 'react'
import { Hammer, Play, Hand } from 'lucide-react'
import ConstructorEV3Real from './ConstructorEV3Real'
import CatalogoEV3 from './CatalogoEV3'
import EV3Lab from './EV3Lab'

type Tab = 'armar' | 'catalogo' | 'programar'

export default function LegoEV3() {
  const [tab, setTab] = useState<Tab>('armar')
  // robot con el que se pasa de una pestaña a otra («Programar este robot» / «Armarlo»)
  const [robot, setRobot] = useState<string | undefined>()
  const programar = (id: string) => { setRobot(id); setTab('programar') }
  const armar = (id: string) => { setRobot(id); setTab('armar') }
  const btn = (activo: boolean) =>
    `flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-bold transition-colors ${activo ? 'bg-slate-100 text-slate-900' : 'bg-slate-300/60 text-slate-600 hover:bg-slate-300'}`
  return (
    <div className="flex h-full min-h-[560px] flex-col">
      <div className="flex gap-1 bg-slate-200 px-2 pt-2">
        <button onClick={() => setTab('armar')} className={btn(tab === 'armar')}><Hammer className="h-4 w-4" /> Armar</button>
        <button onClick={() => setTab('catalogo')} className={btn(tab === 'catalogo')}><Hand className="h-4 w-4" /> Catálogo</button>
        <button onClick={() => setTab('programar')} className={btn(tab === 'programar')}><Play className="h-4 w-4" /> Programar</button>
      </div>
      <div className="min-h-0 flex-1">
        {tab === 'armar' ? <ConstructorEV3Real inicial={robot} onProgramar={programar} />
          : tab === 'catalogo' ? <CatalogoEV3 onProgramar={programar} />
            : <EV3Lab robotInicial={robot} onArmar={armar} />}
      </div>
    </div>
  )
}
