'use client'

// Pestaña «Cablear» (F2: solo lectura). Muestra la tabla de pines que usa el
// programa y todos los cables que puso el cableado automático. En F3 se
// podrán cambiar a mano, con verificación en vivo.

import { useMemo } from 'react'
import { AlertTriangle, Cable as IconCable, Info } from 'lucide-react'
import { pieza } from '../../catalogo/piezas'
import { autocablear } from '../../engine/autocableado'
import { planDe } from '../../engine/plan'
import type { RobotDoc } from '../../robots/doc'

export default function Cablear({ doc }: { doc: RobotDoc }) {
  const { tabla } = useMemo(() => autocablear(doc), [doc])
  const plan = useMemo(() => planDe(doc), [doc])
  const etiqueta = (id: string) => doc.piezas.find(p => p.id === id)?.etiqueta ?? id
  const ayuda = (inst: string, pin: string) => {
    const p = doc.piezas.find(x => x.id === inst)
    return p ? pieza(p.pieza).pines.find(x => x.nombre === pin)?.ayuda : undefined
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs leading-relaxed text-sky-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Los cables se conectan solos, como lo haría tu profesor: la velocidad de los motores y los servos van a pines con PWM (~),
            las lecturas analógicas a A0–A5 y todo comparte la misma tierra (GND). Las plantillas de código usan estos mismos pines.
            Pronto vas a poder cambiar cada cable a mano.
          </p>
        </div>

        {plan.avisos.map((a, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300"><AlertTriangle className="h-4 w-4 shrink-0" /> {a}</div>
        ))}

        <section>
          <h3 className="mb-2 text-sm font-semibold text-white">Tabla de pines (para tu código)</h3>
          {tabla.length === 0 ? (
            <p className="text-xs text-slate-500">Todavía no hay piezas conectadas a la placa.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-xs">
                <thead className="bg-white/5 text-left text-slate-400">
                  <tr><th className="px-3 py-2">Pieza</th><th className="px-3 py-2">Pin</th><th className="px-3 py-2">Placa</th><th className="px-3 py-2">En el código</th><th className="px-3 py-2">Para qué</th></tr>
                </thead>
                <tbody>
                  {tabla.map((f, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="px-3 py-1.5 text-slate-200">{f.etiqueta}</td>
                      <td className="px-3 py-1.5 font-mono text-white">{f.pin}</td>
                      <td className="px-3 py-1.5 font-mono text-chaski-primary">{f.placa}</td>
                      <td className="px-3 py-1.5 font-mono text-emerald-300">{f.placa.startsWith('D') ? f.placa.slice(1) : f.placa}</td>
                      <td className="px-3 py-1.5 text-slate-400">{f.uso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><IconCable className="h-4 w-4 text-chaski-primary" /> Todos los cables ({doc.cables.length})</h3>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {doc.cables.map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-xs" title={ayuda(...c.de) ?? ayuda(...c.a)}>
                <span className="h-3 w-3 shrink-0 rounded-full border border-white/20" style={{ background: c.color }} />
                <span className="truncate text-slate-300">{etiqueta(c.de[0])}</span>
                <span className="font-mono text-white">{c.de[1]}</span>
                <span className="text-slate-500">→</span>
                <span className="truncate text-slate-300">{etiqueta(c.a[0])}</span>
                <span className="font-mono text-white">{c.a[1]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
