'use client'

import { useState } from 'react'
import { Trophy, Wrench, Clock, ChevronRight, X, Target, Cable } from 'lucide-react'
import { KitFichaProyecto } from './KitFichaContent'
import ArduinoCodeViewer from './ArduinoCodeViewer'

const typeConfig = {
  principal: {
    icon: Trophy,
    color: 'text-chaski-primary',
    bg: 'bg-chaski-primary/10',
    border: 'border-chaski-primary/30',
    label: 'Proyecto principal',
  },
  adicional: {
    icon: Wrench,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    label: 'Proyecto adicional',
  },
}

// Duracion estimada solo para mostrar algo util en la fila (no hay dato
// real todavia): 25 min base + 6 por cada conexion + 15 si trae codigo.
function duracionEstimada(p: KitFichaProyecto): string {
  const base = 25 + p.conexiones.length * 6 + (p.codigo ? 15 : 0)
  return `~${base} min`
}

function ProyectoRow({ proyecto, index, onSelect }: { proyecto: KitFichaProyecto; index: number; onSelect: () => void }) {
  const config = typeConfig[proyecto.tipo]
  const Icon = config.icon
  return (
    <button
      onClick={onSelect}
      className="group w-full text-left bg-white rounded-xl p-4 border border-border-soft shadow-sm transition-all duration-200 hover:shadow-md hover:border-chaski-primary/30"
    >
      <div className="flex items-start gap-4">
        <div className={`relative w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className="absolute -top-2 -left-2 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {index}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-chaski-dark truncate">{proyecto.titulo}</h4>
          {proyecto.descripcion && <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{proyecto.descripcion}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" /> {duracionEstimada(proyecto)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-chaski-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-3" />
      </div>
    </button>
  )
}

export default function LeccionesProyectos({ proyectos }: { proyectos: KitFichaProyecto[] }) {
  const [selected, setSelected] = useState<KitFichaProyecto | null>(null)
  const principal = proyectos.find(p => p.tipo === 'principal') || null
  const adicionales = proyectos.filter(p => p.tipo === 'adicional')
  const esquemaDelSeleccionado = selected ? (selected.esquema || (selected.tipo === 'adicional' ? principal?.esquema : null)) : null
  const esquemaEsDelPrincipal = !!selected && !selected.esquema && !!esquemaDelSeleccionado

  return (
    <>
      <div className="space-y-6">
        {principal && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Proyecto principal</p>
            <ProyectoRow proyecto={principal} index={1} onSelect={() => setSelected(principal)} />
          </div>
        )}
        {adicionales.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Proyectos adicionales</p>
            <div className="space-y-2">
              {adicionales.map((p, i) => (
                <ProyectoRow key={p.id} proyecto={p} index={i + 2} onSelect={() => setSelected(p)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal del proyecto seleccionado */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-slate-50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 ${typeConfig[selected.tipo].bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {(() => { const Icon = typeConfig[selected.tipo].icon; return <Icon className={`w-5 h-5 ${typeConfig[selected.tipo].color}`} /> })()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{selected.titulo}</h3>
                  <p className="text-sm text-slate-600">{duracionEstimada(selected)} • {typeConfig[selected.tipo].label}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors active:scale-[0.98] flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {selected.descripcion && <p className="text-slate-600">{selected.descripcion}</p>}

              {esquemaDelSeleccionado && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">Esquema de conexion</h4>
                  {esquemaEsDelPrincipal && (
                    <p className="text-xs text-slate-400 italic mb-2">
                      Usa el mismo armado fisico del proyecto principal ({principal?.titulo}); solo cambia el programa.
                    </p>
                  )}
                  <div className="border border-slate-200 rounded-xl p-2 bg-white overflow-x-auto">
                    <div dangerouslySetInnerHTML={{ __html: esquemaDelSeleccionado.contenido }} />
                  </div>
                </div>
              )}

              {selected.objetivos.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <Target className="w-4 h-4 text-chaski-primary" /> Objetivos de aprendizaje
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {selected.objetivos.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
              )}

              {selected.conexiones.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <Cable className="w-4 h-4 text-chaski-primary" /> Tabla de conexiones
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-slate-500 text-xs uppercase">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold">Componente</th>
                          <th className="text-left px-3 py-2 font-semibold">Pin del componente</th>
                          <th className="text-left px-3 py-2 font-semibold">Pin de la placa</th>
                          <th className="text-left px-3 py-2 font-semibold">Nota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selected.conexiones.map((c, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-slate-800 font-medium">{c.componente}</td>
                            <td className="px-3 py-2 text-slate-600">{c.pinComponente}</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">{c.pinPlaca}</td>
                            <td className="px-3 py-2 text-slate-400 text-xs">{c.nota || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selected.codigo && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Codigo Arduino</h4>
                  <ArduinoCodeViewer code={selected.codigo.contenido} filename={`${selected.slug}.ino`} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
