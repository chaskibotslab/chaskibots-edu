'use client'

import {
  Cpu, School, DollarSign, Zap, ShieldAlert, Package, Target, Cable, Code2, Trophy, Wrench, Sparkles,
} from 'lucide-react'
import ArduinoCodeViewer from './ArduinoCodeViewer'

export interface KitFichaMaterial {
  id: string
  nombre: string
  categoria: string | null
  especificacion: string | null
  cantidad: number | null
  nota: string | null
  incluido: boolean
}

export interface KitFichaConexion {
  componente: string
  pinComponente: string
  pinPlaca: string
  nota: string | null
}

export interface KitFichaProyecto {
  id: string
  titulo: string
  slug: string
  tipo: 'principal' | 'adicional' | 'practica'
  descripcion: string | null
  objetivos: string[]
  orden: number
  conexiones: KitFichaConexion[]
  esquema: { tipo: string; contenido: string; url?: string | null } | null
  codigo: { lenguaje: string; contenido: string } | null
}

export interface KitFichaDetalle {
  id: string
  levelId: string
  schoolId: string | null
  schoolName: string | null
  name: string
  description: string | null
  price: number | null
  proyectoPrincipal: string | null
  alimentacion: string | null
  advertenciaSeguridad: string | null
  notas: string | null
  activo: boolean
  placa: { nombre: string; voltajeLogico: string | null; conectorUsb: string | null; notasTecnicas: string | null } | null
  materiales: KitFichaMaterial[]
  proyectos: KitFichaProyecto[]
}

export function Badge({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    coral: 'bg-chaski-primary/10 text-chaski-primary ring-1 ring-chaski-primary/20',
    gold: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  }
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${colors[color]}`}>{children}</span>
}

// Tarjeta de estadistica del encabezado (placa / precio / alimentacion):
// icono en circulo de color + etiqueta + valor.
function StatCard({ icon: Icon, iconBg, iconColor, label, value, hint }: {
  icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string
  label: string; value: React.ReactNode; hint?: string
}) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-900 leading-snug">{value}</p>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}

const CATEGORY_DOT: Record<string, string> = {
  placa: 'bg-chaski-primary',
  sensor: 'bg-chaski-primary',
  actuador: 'bg-amber-500',
  componente: 'bg-slate-400',
  cable: 'bg-chaski-primary',
  herramienta: 'bg-rose-500',
  alimentacion: 'bg-red-500',
}

// Encabezado del kit (placa, precio, alimentacion, notas) + tabla de
// materiales. Se usa solo en el tab "Mi Kit" de /academia/[...] y dentro
// de la ficha completa combinada (KitFichaContent, mas abajo).
export function KitHeaderMateriales({ kit }: { kit: KitFichaDetalle }) {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-chaski-dark via-chaski-dark to-slate-800 p-6 sm:p-8 mb-8 shadow-lg">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-chaski-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-white/10 text-white/80 ring-1 ring-white/15">{kit.levelId}</span>
            {kit.schoolName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-chaski-gold/20 text-chaski-gold ring-1 ring-chaski-gold/30">
                <School className="w-3 h-3" /> {kit.schoolName}
              </span>
            )}
            {!kit.activo && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 ring-1 ring-red-400/30">Inactivo</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">{kit.name}</h1>
          {kit.description && <p className="text-white/70 max-w-2xl leading-relaxed">{kit.description}</p>}
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-5 -mt-16 relative z-10 px-1">
        {kit.placa && (
          <StatCard
            icon={Cpu} iconBg="bg-chaski-primary/10" iconColor="text-chaski-primary"
            label="Placa" value={kit.placa.nombre}
            hint={kit.placa.voltajeLogico ? `${kit.placa.voltajeLogico} • ${kit.placa.conectorUsb}` : undefined}
          />
        )}
        {kit.price != null && (
          <StatCard icon={DollarSign} iconBg="bg-emerald-100" iconColor="text-emerald-600" label="Precio del kit" value={`$${kit.price}`} />
        )}
        {kit.alimentacion && (
          <StatCard icon={Zap} iconBg="bg-amber-100" iconColor="text-amber-600" label="Alimentación" value={kit.alimentacion} />
        )}
      </div>

      {kit.placa?.notasTecnicas && (
        <div className="flex items-start gap-2.5 text-sm text-chaski-primary bg-chaski-primary/5 border border-chaski-primary/30 rounded-2xl p-4 mb-3">
          <Cpu className="w-4 h-4 shrink-0 mt-0.5 text-chaski-primary" />
          <p><strong className="font-semibold">Notas técnicas de la placa:</strong> {kit.placa.notasTecnicas}</p>
        </div>
      )}
      {kit.advertenciaSeguridad && (
        <div className="flex items-start gap-2.5 text-sm text-red-900 bg-red-50 border border-red-200 rounded-2xl p-4 mb-3">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p><strong className="font-semibold">Seguridad:</strong> {kit.advertenciaSeguridad}</p>
        </div>
      )}

      <section className="mt-8">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 mb-4">
          <span className="w-8 h-8 rounded-lg bg-chaski-primary/10 flex items-center justify-center">
            <Package className="w-4 h-4 text-chaski-primary" />
          </span>
          Materiales del kit
          <span className="text-sm font-medium text-slate-400">({kit.materiales.length})</span>
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Material</th>
                <th className="text-left px-4 py-3 font-semibold">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold">Cantidad</th>
                <th className="text-left px-4 py-3 font-semibold">Incluido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kit.materiales.map((m, i) => (
                <tr key={m.id} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
                  <td className="px-4 py-3 text-slate-800 font-medium">
                    {m.nombre}
                    {m.nota && <span className="block text-xs text-slate-400 font-normal mt-0.5">{m.nota}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {m.categoria && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[m.categoria] || 'bg-slate-300'}`} />
                        {m.categoria}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{m.cantidad ?? <span className="italic text-slate-400">variable</span>}</td>
                  <td className="px-4 py-3">
                    {m.incluido ? (
                      <span className="text-emerald-600 text-xs font-semibold">Sí</span>
                    ) : (
                      <span className="text-slate-400 text-xs font-semibold">No incluido</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// Un proyecto (principal o adicional): objetivos, conexiones, esquema y
// codigo. Se usa como "leccion" en el tab Lecciones de /academia/[...]
// y dentro de la ficha completa combinada.
const PROYECTO_TIPO_CONFIG = {
  principal: { icon: Trophy, iconBg: 'bg-chaski-primary/10', iconColor: 'text-chaski-primary', badge: 'coral', label: 'Proyecto principal', topBar: 'bg-gradient-to-r from-chaski-primary to-chaski-gold', border: 'border-chaski-primary/25' },
  adicional: { icon: Wrench, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', badge: 'gold', label: 'Proyecto adicional', topBar: 'bg-slate-200', border: 'border-slate-200' },
  practica: { icon: Sparkles, iconBg: 'bg-chaski-primary/5', iconColor: 'text-chaski-primary', badge: 'slate', label: 'Práctica', topBar: 'bg-chaski-primary/20', border: 'border-chaski-primary/30' },
}

export function ProyectoCard({ proyecto: p, principal }: { proyecto: KitFichaProyecto; principal: KitFichaProyecto | null }) {
  // Las practicas y los adicionales que comparten armado con el
  // principal no tienen esquema propio: se muestra el del principal.
  const esquemaMostrado = p.esquema || (p.tipo !== 'principal' ? principal?.esquema : null)
  const esquemaEsDelPrincipal = !p.esquema && !!esquemaMostrado
  const cfg = PROYECTO_TIPO_CONFIG[p.tipo]
  const Icon = cfg.icon

  return (
    <section className={`proyecto-imprimible mb-8 rounded-3xl border bg-white shadow-sm overflow-hidden ${cfg.border}`}>
      <div className={`h-1.5 ${cfg.topBar}`} />
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
            <Icon className={`w-4.5 h-4.5 ${cfg.iconColor}`} />
          </span>
          <Badge color={cfg.badge}>{cfg.label}</Badge>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{p.titulo}</h2>
        {p.descripcion && <p className="text-slate-600 mb-5 leading-relaxed">{p.descripcion}</p>}

        {p.objetivos.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
              <Target className="w-4 h-4 text-chaski-primary" /> Objetivos de aprendizaje
            </h3>
            <ul className="space-y-1.5">
              {p.objetivos.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-chaski-primary/50 mt-[7px] flex-shrink-0" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {p.conexiones.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
              <Cable className="w-4 h-4 text-chaski-primary" /> Tabla de conexiones
            </h3>
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
                <tbody className="divide-y divide-slate-100">
                  {p.conexiones.map((c, i) => (
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

        {esquemaMostrado && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-2.5">Esquema de conexión</h3>
            {esquemaEsDelPrincipal && (
              <p className="text-xs text-slate-400 italic mb-2">
                Usa el mismo armado físico del proyecto principal ({principal?.titulo}); solo cambia el programa.
              </p>
            )}
            <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 overflow-x-auto">
              {esquemaMostrado.tipo === 'imagen' && esquemaMostrado.url?.toLowerCase().endsWith('.pdf') ? (
                <a href={esquemaMostrado.url} target="_blank" rel="noopener noreferrer" className="text-chaski-primary font-medium underline">Ver esquema (PDF)</a>
              ) : esquemaMostrado.tipo === 'imagen' && esquemaMostrado.url ? (
                <img src={esquemaMostrado.url} alt="Esquema de conexión" className="w-full h-auto rounded-xl" />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: esquemaMostrado.contenido }} />
              )}
            </div>
          </div>
        )}

        {p.codigo && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
              <Code2 className="w-4 h-4 text-chaski-primary" /> Código Arduino
            </h3>
            <ArduinoCodeViewer code={p.codigo.contenido} filename={`${p.slug}.ino`} />
          </div>
        )}
      </div>
    </section>
  )
}

// Ficha completa de un kit (header + materiales + todos los proyectos
// seguidos), para imprimir/PDF. La usa /admin/kits/[id]/ficha.
export default function KitFichaContent({ kit, printableId }: { kit: KitFichaDetalle; printableId?: string }) {
  const principal = kit.proyectos.find(p => p.tipo === 'principal') || null

  return (
    <div id={printableId} className="max-w-4xl mx-auto">
      <KitHeaderMateriales kit={kit} />
      <div className="mt-10 space-y-6">
        {kit.proyectos.map(p => (
          <ProyectoCard key={p.id} proyecto={p} principal={principal} />
        ))}
      </div>
    </div>
  )
}
