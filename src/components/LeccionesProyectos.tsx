'use client'

import { useState } from 'react'
import { Trophy, Wrench, Sparkles, Clock, ChevronRight, X, Target, Cable } from 'lucide-react'
import { KitFichaProyecto } from './KitFichaContent'
import ArduinoCodeViewer from './ArduinoCodeViewer'

const typeConfig = {
  principal: {
    icon: Trophy,
    color: 'text-chaski-primary',
    bg: 'bg-chaski-primary/10',
    ring: 'ring-chaski-primary/20',
    label: 'Proyecto principal',
  },
  adicional: {
    icon: Wrench,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    ring: 'ring-amber-200',
    label: 'Proyecto adicional',
  },
  practica: {
    icon: Sparkles,
    color: 'text-chaski-primary',
    bg: 'bg-chaski-primary/10',
    ring: 'ring-chaski-primary/30',
    label: 'Práctica',
  },
}

// Duracion estimada solo para mostrar algo util en la fila (no hay dato
// real todavia): las practicas son mas cortas (una sola pieza) que un
// proyecto completo.
function duracionEstimada(p: KitFichaProyecto): string {
  const base = (p.tipo === 'practica' ? 12 : 25) + p.conexiones.length * 6 + (p.codigo ? 15 : 0)
  return `~${base} min`
}

function ProyectoRow({ proyecto, index, onSelect }: { proyecto: KitFichaProyecto; index: number; onSelect: () => void }) {
  const config = typeConfig[proyecto.tipo]
  const Icon = config.icon
  return (
    <button
      onClick={onSelect}
      className="group w-full text-left bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md hover:border-chaski-primary/30 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <div className={`relative w-12 h-12 ${config.bg} rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ${config.ring}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className="absolute -top-2 -left-2 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white">
            {index}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-chaski-dark truncate group-hover:text-chaski-primary transition-colors">{proyecto.titulo}</h4>
          {proyecto.descripcion && <p className="text-sm text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{proyecto.descripcion}</p>}
          <div className="flex items-center gap-2.5 mt-2.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock className="w-3 h-3" /> {duracionEstimada(proyecto)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${config.bg} ${config.color}`}>
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
  const practicas = proyectos.filter(p => p.tipo === 'practica')
  const principal = proyectos.find(p => p.tipo === 'principal') || null
  const adicionales = proyectos.filter(p => p.tipo === 'adicional')
  // Las practicas y los adicionales que comparten armado con el
  // principal no tienen esquema propio: se muestra el del principal.
  const esquemaDelSeleccionado = selected ? (selected.esquema || (selected.tipo !== 'principal' ? principal?.esquema : null)) : null
  const esquemaEsDelPrincipal = !!selected && !selected.esquema && !!esquemaDelSeleccionado

  return (
    <>
      <div className="space-y-7">
        {practicas.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-chaski-primary/80 mb-2.5">Práctica previa</p>
            <p className="text-xs text-slate-400 mb-2.5 -mt-1.5">Antes del proyecto principal, practica con cada pieza por separado.</p>
            <div className="space-y-2.5">
              {practicas.map((p, i) => (
                <ProyectoRow key={p.id} proyecto={p} index={i + 1} onSelect={() => setSelected(p)} />
              ))}
            </div>
          </div>
        )}
        {principal && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-chaski-primary/70 mb-2.5">Proyecto principal</p>
            <ProyectoRow proyecto={principal} index={practicas.length + 1} onSelect={() => setSelected(principal)} />
          </div>
        )}
        {adicionales.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Proyectos adicionales</p>
            <div className="space-y-2.5">
              {adicionales.map((p, i) => (
                <ProyectoRow key={p.id} proyecto={p} index={practicas.length + i + 2} onSelect={() => setSelected(p)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal del proyecto seleccionado */}
      {selected && (() => {
        const config = typeConfig[selected.tipo]
        const Icon = config.icon
        return (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 p-5 flex items-center justify-between z-10`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 ${config.bg} rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ${config.ring}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{selected.titulo}</h3>
                  <p className="text-sm text-slate-500">{duracionEstimada(selected)} · {config.label}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors active:scale-[0.98] flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-7">
              {selected.descripcion && <p className="text-slate-600 leading-relaxed">{selected.descripcion}</p>}

              {esquemaDelSeleccionado && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2.5">Esquema de conexión</h4>
                  {esquemaEsDelPrincipal && (
                    <p className="text-xs text-slate-400 italic mb-2">
                      Usa el mismo armado físico del proyecto principal ({principal?.titulo}); solo cambia el programa.
                    </p>
                  )}
                  <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 overflow-x-auto">
                    {esquemaDelSeleccionado.tipo === 'imagen' && esquemaDelSeleccionado.url?.toLowerCase().endsWith('.pdf') ? (
                      <a href={esquemaDelSeleccionado.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-chaski-primary font-medium underline">
                        Ver esquema (PDF)
                      </a>
                    ) : esquemaDelSeleccionado.tipo === 'imagen' && esquemaDelSeleccionado.url ? (
                      <img src={esquemaDelSeleccionado.url} alt="Esquema de conexión" className="w-full h-auto rounded-xl" />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: esquemaDelSeleccionado.contenido }} />
                    )}
                  </div>
                </div>
              )}

              {selected.objetivos.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                    <Target className="w-4 h-4 text-chaski-primary" /> Objetivos de aprendizaje
                  </h4>
                  <ul className="space-y-1.5">
                    {selected.objetivos.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-chaski-primary/50 mt-[7px] flex-shrink-0" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.conexiones.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                    <Cable className="w-4 h-4 text-chaski-primary" /> Tabla de conexiones
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
                        <tr>
                          <th className="text-left px-4 py-2.5 font-semibold">Componente</th>
                          <th className="text-left px-4 py-2.5 font-semibold">Pin del componente</th>
                          <th className="text-left px-4 py-2.5 font-semibold">Pin de la placa</th>
                          <th className="text-left px-4 py-2.5 font-semibold">Nota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selected.conexiones.map((c, i) => (
                          <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
                            <td className="px-4 py-2.5 text-slate-800 font-medium">{c.componente}</td>
                            <td className="px-4 py-2.5 text-slate-600">{c.pinComponente}</td>
                            <td className="px-4 py-2.5 text-chaski-primary font-mono text-xs font-semibold">{c.pinPlaca}</td>
                            <td className="px-4 py-2.5 text-slate-400 text-xs">{c.nota || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selected.codigo && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2.5">Código Arduino</h4>
                  <ArduinoCodeViewer code={selected.codigo.contenido} filename={`${selected.slug}.ino`} />
                </div>
              )}
            </div>
          </div>
        </div>
        )
      })()}
    </>
  )
}
