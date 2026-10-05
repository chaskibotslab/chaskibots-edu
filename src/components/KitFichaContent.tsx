'use client'

import { useState } from 'react'
import {
  Cpu, School, DollarSign, Zap, ShieldAlert, Package, Target, Cable, Code2, Copy, Check,
} from 'lucide-react'

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
  tipo: 'principal' | 'adicional'
  descripcion: string | null
  objetivos: string[]
  orden: number
  conexiones: KitFichaConexion[]
  esquema: { tipo: string; contenido: string } | null
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

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Sin acceso al portapapeles (ej. http sin permiso): no hacemos nada mas.
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={copiar}
        className="no-print absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
      <pre className="bg-slate-900 text-slate-100 text-xs leading-relaxed rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function Badge({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    coral: 'bg-chaski-primary/10 text-chaski-primary',
    gold: 'bg-amber-100 text-amber-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
  }
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>
}

// Encabezado del kit (placa, precio, alimentacion, notas) + tabla de
// materiales. Se usa solo en el tab "Mi Kit" de /academia/[...] y dentro
// de la ficha completa combinada (KitFichaContent, mas abajo).
export function KitHeaderMateriales({ kit }: { kit: KitFichaDetalle }) {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge color="coral">{kit.levelId}</Badge>
          {kit.schoolName && <Badge color="gold"><School className="w-3 h-3" /> {kit.schoolName}</Badge>}
          {!kit.activo && <Badge color="red">Inactivo</Badge>}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{kit.name}</h1>
        {kit.description && <p className="text-slate-600 mb-4">{kit.description}</p>}

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {kit.placa && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1"><Cpu className="w-3.5 h-3.5" /> Placa</div>
              <p className="text-sm font-semibold text-slate-900">{kit.placa.nombre}</p>
              {kit.placa.voltajeLogico && <p className="text-xs text-slate-500">Logica: {kit.placa.voltajeLogico} - USB: {kit.placa.conectorUsb}</p>}
            </div>
          )}
          {kit.price != null && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1"><DollarSign className="w-3.5 h-3.5" /> Precio</div>
              <p className="text-sm font-semibold text-slate-900">${kit.price}</p>
            </div>
          )}
          {kit.alimentacion && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1"><Zap className="w-3.5 h-3.5" /> Alimentacion</div>
              <p className="text-xs text-slate-700">{kit.alimentacion}</p>
            </div>
          )}
        </div>

        {kit.placa?.notasTecnicas && (
          <p className="text-xs text-slate-500 bg-sky-50 border border-sky-100 rounded-lg p-3 mb-3">
            <strong>Notas tecnicas de la placa:</strong> {kit.placa.notasTecnicas}
          </p>
        )}
        {kit.advertenciaSeguridad && (
          <div className="flex items-start gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p><strong>Seguridad:</strong> {kit.advertenciaSeguridad}</p>
          </div>
        )}
      </header>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-3">
          <Package className="w-5 h-5 text-chaski-primary" /> Materiales del kit
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Material</th>
                <th className="text-left px-3 py-2 font-semibold">Categoria</th>
                <th className="text-left px-3 py-2 font-semibold">Cantidad</th>
                <th className="text-left px-3 py-2 font-semibold">Incluido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kit.materiales.map(m => (
                <tr key={m.id}>
                  <td className="px-3 py-2 text-slate-800 font-medium">
                    {m.nombre}
                    {m.nota && <span className="block text-xs text-slate-400">{m.nota}</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{m.categoria || '-'}</td>
                  <td className="px-3 py-2 text-slate-500">{m.cantidad ?? 'variable'}</td>
                  <td className="px-3 py-2">
                    {m.incluido ? (
                      <span className="text-emerald-600 text-xs font-semibold">Si</span>
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
export function ProyectoCard({ proyecto: p, principal }: { proyecto: KitFichaProyecto; principal: KitFichaProyecto | null }) {
  const esquemaMostrado = p.esquema || (p.tipo === 'adicional' ? principal?.esquema : null)
  const esquemaEsDelPrincipal = !p.esquema && !!esquemaMostrado

  return (
    <section className="proyecto-imprimible mb-12 pt-8 border-t border-slate-200 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2 mb-2">
        <Badge color={p.tipo === 'principal' ? 'coral' : 'slate'}>
          {p.tipo === 'principal' ? 'Proyecto principal' : 'Proyecto adicional'}
        </Badge>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{p.titulo}</h2>
      {p.descripcion && <p className="text-slate-600 mb-4">{p.descripcion}</p>}

      {p.objetivos.length > 0 && (
        <div className="mb-5">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
            <Target className="w-4 h-4 text-chaski-primary" /> Objetivos de aprendizaje
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {p.objetivos.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}

      {p.conexiones.length > 0 && (
        <div className="mb-5">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
            <Cable className="w-4 h-4 text-chaski-primary" /> Tabla de conexiones
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Componente</th>
                  <th className="text-left px-3 py-2 font-semibold">Pin del componente</th>
                  <th className="text-left px-3 py-2 font-semibold">Pin de la placa</th>
                  <th className="text-left px-3 py-2 font-semibold">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {p.conexiones.map((c, i) => (
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

      {esquemaMostrado && (
        <div className="mb-5">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Esquema de conexion</h3>
          {esquemaEsDelPrincipal && (
            <p className="text-xs text-slate-400 italic mb-2">
              Usa el mismo armado fisico del proyecto principal ({principal?.titulo}); solo cambia el programa.
            </p>
          )}
          <div
            className="border border-slate-200 rounded-xl p-2 bg-white overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: esquemaMostrado.contenido }}
          />
        </div>
      )}

      {p.codigo && (
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
            <Code2 className="w-4 h-4 text-chaski-primary" /> Codigo Arduino
          </h3>
          <CodeBlock code={p.codigo.contenido} />
        </div>
      )}
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
      <div className="mt-10">
        {kit.proyectos.map(p => (
          <ProyectoCard key={p.id} proyecto={p} principal={principal} />
        ))}
      </div>
    </div>
  )
}
