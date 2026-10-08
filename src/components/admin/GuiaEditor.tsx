'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload, Trash2, Plus, ChevronDown, ArrowUp, ArrowDown, Flag, Puzzle, Cable, Code2, FlaskConical, Award } from 'lucide-react'
import type { KitGuia, GuiaPaso } from '@/lib/kitGuia'
import { normalizePin, isPowerPin, isGroundPin } from '@/lib/boardPinouts'

// Editor completo de una guía de 6 etapas: todo el texto, fotos, video y
// preguntas. Lo usan los proyectos de kit; no depende de dónde se guarda.

export interface ConexionRef { componente: string; pinComponente: string; pinPlaca: string }

const INPUT = 'w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 outline-none transition-all'
const LABEL = 'text-xs font-semibold text-slate-500 mb-1 block'

async function subirFoto(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('bucket', 'lesson-images')
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'No se pudo subir la foto')
  return data.url as string
}

function FotoCampo({ url, onChange }: { url?: string; onChange: (url: string | undefined) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const elegir = async (file: File) => {
    setSubiendo(true)
    setError('')
    try {
      onChange(await subirFoto(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {url && <img src={url} alt="" className="h-14 w-20 object-cover rounded-lg border border-slate-200" />}
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) elegir(f); e.target.value = '' }} />
      <button type="button" onClick={() => ref.current?.click()} disabled={subiendo}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-full text-xs font-medium hover:bg-slate-50 disabled:opacity-50">
        {subiendo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {url ? 'Cambiar foto' : 'Subir foto'}
      </button>
      {url && (
        <button type="button" onClick={() => onChange(undefined)} className="inline-flex items-center gap-1 px-2 py-1.5 text-red-600 text-xs font-medium hover:bg-red-50 rounded-full">
          <Trash2 className="w-3.5 h-3.5" /> Quitar
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}

function Seccion({ icon: Icon, titulo, resumen, children }: {
  icon: React.ComponentType<{ className?: string }>; titulo: string; resumen: string; children: React.ReactNode
}) {
  const [abierta, setAbierta] = useState(false)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setAbierta(a => !a)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
        <span className="w-8 h-8 rounded-xl bg-chaski-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-chaski-primary" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-slate-900">{titulo}</span>
          <span className="block text-xs text-slate-500 truncate">{resumen}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${abierta ? 'rotate-180' : ''}`} />
      </button>
      {abierta && <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-100">{children}</div>}
    </div>
  )
}

// Tarjeta de un elemento de lista, con botones para moverlo o quitarlo.
function Item({ titulo, onUp, onDown, onRemove, children }: {
  titulo: string; onUp?: () => void; onDown?: () => void; onRemove: () => void; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-chaski-primary">{titulo}</p>
        <div className="flex items-center gap-1">
          {onUp && <button type="button" onClick={onUp} className="p-1 rounded-full text-slate-400 hover:bg-slate-200" title="Subir"><ArrowUp className="w-3.5 h-3.5" /></button>}
          {onDown && <button type="button" onClick={onDown} className="p-1 rounded-full text-slate-400 hover:bg-slate-200" title="Bajar"><ArrowDown className="w-3.5 h-3.5" /></button>}
          <button type="button" onClick={onRemove} className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50" title="Quitar"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {children}
    </div>
  )
}

function Agregar({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 text-sm font-medium text-chaski-primary hover:opacity-80">
      <Plus className="w-4 h-4" /> {children}
    </button>
  )
}

const quitar = <T,>(list: T[], i: number) => list.filter((_, j) => j !== i)
const cambiar = <T,>(list: T[], i: number, patch: Partial<T>) => list.map((x, j) => (j === i ? { ...x, ...patch } : x))
const mover = <T,>(list: T[], i: number, delta: number) => {
  const j = i + delta
  if (j < 0 || j >= list.length) return list
  const next = list.slice()
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export default function GuiaEditor({ guia, onChange, conexiones = [] }: { guia: KitGuia; onChange: (guia: KitGuia) => void; conexiones?: ConexionRef[] }) {
  const rieles = Array.from(new Set(conexiones.map(c => normalizePin(c.pinPlaca)).filter(p => isPowerPin(p) || isGroundPin(p))))
  const setPaso = (i: number, patch: Partial<GuiaPaso>) => onChange({ ...guia, pasos: cambiar(guia.pasos, i, patch) })
  const alternar = (list: number[] | undefined, v: number) => ((list || []).includes(v) ? (list || []).filter(x => x !== v) : [...(list || []), v])
  const alternarRiel = (list: string[] | undefined, v: string) => ((list || []).includes(v) ? (list || []).filter(x => x !== v) : [...(list || []), v])

  return (
    <div className="space-y-2">
      <Seccion icon={Flag} titulo="1. El reto" resumen={guia.reto.texto || 'Qué se va a construir y para qué sirve'}>
        <div>
          <label className={LABEL}>¿Qué vamos a construir?</label>
          <textarea value={guia.reto.texto} rows={3} className={`${INPUT} resize-y`}
            onChange={e => onChange({ ...guia, reto: { ...guia.reto, texto: e.target.value } })} />
        </div>
        <div>
          <label className={LABEL}>¿Para qué sirve en la vida real?</label>
          <textarea value={guia.reto.paraQue || ''} rows={3} className={`${INPUT} resize-y`}
            onChange={e => onChange({ ...guia, reto: { ...guia.reto, paraQue: e.target.value || undefined } })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Tiempo estimado</label>
            <input value={guia.reto.duracion || ''} placeholder="30 minutos" className={INPUT}
              onChange={e => onChange({ ...guia, reto: { ...guia.reto, duracion: e.target.value || undefined } })} />
          </div>
          <div>
            <label className={LABEL}>Video (enlace de YouTube o Drive)</label>
            <input value={guia.reto.videoUrl || ''} placeholder="https://www.youtube.com/watch?v=..." className={INPUT}
              onChange={e => onChange({ ...guia, reto: { ...guia.reto, videoUrl: e.target.value || undefined } })} />
          </div>
        </div>
        <div>
          <label className={LABEL}>Foto del proyecto terminado</label>
          <FotoCampo url={guia.reto.fotoUrl} onChange={url => onChange({ ...guia, reto: { ...guia.reto, fotoUrl: url } })} />
        </div>
      </Seccion>

      <Seccion icon={Puzzle} titulo="2. Piezas" resumen={`${guia.piezas.length} pieza${guia.piezas.length === 1 ? '' : 's'}`}>
        {guia.piezas.map((p, i) => (
          <Item key={i} titulo={`Pieza ${i + 1}`} onRemove={() => onChange({ ...guia, piezas: quitar(guia.piezas, i) })}>
            <input value={p.nombre} placeholder="Nombre de la pieza" className={INPUT}
              onChange={e => onChange({ ...guia, piezas: cambiar(guia.piezas, i, { nombre: e.target.value }) })} />
            <textarea value={p.paraQue} placeholder="Para qué sirve" rows={2} className={`${INPUT} resize-y`}
              onChange={e => onChange({ ...guia, piezas: cambiar(guia.piezas, i, { paraQue: e.target.value }) })} />
            <input value={p.cuidado || ''} placeholder="Cuidado o advertencia (opcional)" className={INPUT}
              onChange={e => onChange({ ...guia, piezas: cambiar(guia.piezas, i, { cuidado: e.target.value || undefined }) })} />
            <FotoCampo url={p.fotoUrl} onChange={url => onChange({ ...guia, piezas: cambiar(guia.piezas, i, { fotoUrl: url }) })} />
          </Item>
        ))}
        <Agregar onClick={() => onChange({ ...guia, piezas: [...guia.piezas, { nombre: '', paraQue: '' }] })}>Agregar pieza</Agregar>
      </Seccion>

      <Seccion icon={Cable} titulo="3. Paso a paso" resumen={`${guia.pasos.length} paso${guia.pasos.length === 1 ? '' : 's'}`}>
        {guia.pasos.map((p, i) => (
          <Item key={i} titulo={`Paso ${i + 1}`}
            onUp={i > 0 ? () => onChange({ ...guia, pasos: mover(guia.pasos, i, -1) }) : undefined}
            onDown={i < guia.pasos.length - 1 ? () => onChange({ ...guia, pasos: mover(guia.pasos, i, 1) }) : undefined}
            onRemove={() => onChange({ ...guia, pasos: quitar(guia.pasos, i) })}>
            <input value={p.titulo} placeholder="Título del paso" className={INPUT} onChange={e => setPaso(i, { titulo: e.target.value })} />
            <textarea value={p.texto} placeholder="Qué debe hacer el estudiante" rows={3} className={`${INPUT} resize-y`} onChange={e => setPaso(i, { texto: e.target.value })} />
            <input value={p.consejo || ''} placeholder="Consejo (opcional)" className={INPUT} onChange={e => setPaso(i, { consejo: e.target.value || undefined })} />
            {(conexiones.length > 0 || rieles.length > 0) && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Cables que se iluminan en el gráfico durante este paso:</p>
                <div className="flex flex-wrap gap-1.5">
                  {rieles.map(r => {
                    const on = (p.rieles || []).includes(r)
                    return (
                      <button key={r} type="button" onClick={() => setPaso(i, { rieles: alternarRiel(p.rieles, r) })}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${on ? 'bg-chaski-dark text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                        Placa → línea {r}
                      </button>
                    )
                  })}
                  {conexiones.map((c, ci) => {
                    const on = (p.conexiones || []).includes(ci)
                    return (
                      <button key={ci} type="button" onClick={() => setPaso(i, { conexiones: alternar(p.conexiones, ci) })}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${on ? 'bg-chaski-primary text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                        {c.componente} · {c.pinComponente} → {c.pinPlaca}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <FotoCampo url={p.fotoUrl} onChange={url => setPaso(i, { fotoUrl: url })} />
          </Item>
        ))}
        <Agregar onClick={() => onChange({ ...guia, pasos: [...guia.pasos, { titulo: '', texto: '' }] })}>Agregar paso</Agregar>
      </Seccion>

      <Seccion icon={Code2} titulo="4. Programa" resumen={guia.codigo.length > 0 ? `${guia.codigo.length} bloque${guia.codigo.length === 1 ? '' : 's'} explicado${guia.codigo.length === 1 ? '' : 's'}` : 'Sin programa: esta etapa no se muestra'}>
        <p className="text-xs text-slate-500">Explica el código por partes. Si la lección no tiene programación, deja esta sección vacía y no aparecerá.</p>
        {guia.codigo.map((b, i) => (
          <Item key={i} titulo={`Bloque ${i + 1}`}
            onUp={i > 0 ? () => onChange({ ...guia, codigo: mover(guia.codigo, i, -1) }) : undefined}
            onDown={i < guia.codigo.length - 1 ? () => onChange({ ...guia, codigo: mover(guia.codigo, i, 1) }) : undefined}
            onRemove={() => onChange({ ...guia, codigo: quitar(guia.codigo, i) })}>
            <input value={b.titulo} placeholder="Título (ej. Leer el sensor)" className={INPUT}
              onChange={e => onChange({ ...guia, codigo: cambiar(guia.codigo, i, { titulo: e.target.value }) })} />
            <textarea value={b.texto} placeholder="Explicación sencilla" rows={2} className={`${INPUT} resize-y`}
              onChange={e => onChange({ ...guia, codigo: cambiar(guia.codigo, i, { texto: e.target.value }) })} />
            <textarea value={b.fragmento || ''} placeholder="Líneas de código (opcional)" rows={3} spellCheck={false} className={`${INPUT} resize-y font-mono text-xs`}
              onChange={e => onChange({ ...guia, codigo: cambiar(guia.codigo, i, { fragmento: e.target.value || undefined }) })} />
          </Item>
        ))}
        <Agregar onClick={() => onChange({ ...guia, codigo: [...guia.codigo, { titulo: '', texto: '' }] })}>Agregar bloque</Agregar>
      </Seccion>

      <Seccion icon={FlaskConical} titulo="5. Prueba" resumen={`${guia.prueba.queDebePasar.length} resultado${guia.prueba.queDebePasar.length === 1 ? '' : 's'} esperado${guia.prueba.queDebePasar.length === 1 ? '' : 's'} · ${guia.prueba.siNoFunciona.length} solución${guia.prueba.siNoFunciona.length === 1 ? '' : 'es'}`}>
        <div>
          <label className={LABEL}>Si todo está bien, debe pasar esto (una idea por línea)</label>
          <textarea value={guia.prueba.queDebePasar.join('\n')} rows={4} className={`${INPUT} resize-y`}
            onChange={e => onChange({ ...guia, prueba: { ...guia.prueba, queDebePasar: e.target.value.split('\n').filter(l => l.trim() !== '') } })} />
        </div>
        <label className={LABEL}>Si no funciona, revisa</label>
        {guia.prueba.siNoFunciona.map((f, i) => (
          <Item key={i} titulo={`Problema ${i + 1}`} onRemove={() => onChange({ ...guia, prueba: { ...guia.prueba, siNoFunciona: quitar(guia.prueba.siNoFunciona, i) } })}>
            <input value={f.problema} placeholder="Qué problema ve el estudiante" className={INPUT}
              onChange={e => onChange({ ...guia, prueba: { ...guia.prueba, siNoFunciona: cambiar(guia.prueba.siNoFunciona, i, { problema: e.target.value }) } })} />
            <textarea value={f.revisa} placeholder="Qué debe revisar" rows={2} className={`${INPUT} resize-y`}
              onChange={e => onChange({ ...guia, prueba: { ...guia.prueba, siNoFunciona: cambiar(guia.prueba.siNoFunciona, i, { revisa: e.target.value }) } })} />
          </Item>
        ))}
        <Agregar onClick={() => onChange({ ...guia, prueba: { ...guia.prueba, siNoFunciona: [...guia.prueba.siNoFunciona, { problema: '', revisa: '' }] } })}>Agregar problema</Agregar>
      </Seccion>

      <Seccion icon={Award} titulo="6. Demuestra" resumen={`${guia.demuestra.preguntas.length} pregunta${guia.demuestra.preguntas.length === 1 ? '' : 's'}`}>
        <div>
          <label className={LABEL}>Reto extra</label>
          <textarea value={guia.demuestra.reto} rows={2} className={`${INPUT} resize-y`}
            onChange={e => onChange({ ...guia, demuestra: { ...guia.demuestra, reto: e.target.value } })} />
        </div>
        {guia.demuestra.preguntas.map((q, qi) => {
          const setQ = (patch: Partial<typeof q>) => onChange({ ...guia, demuestra: { ...guia.demuestra, preguntas: cambiar(guia.demuestra.preguntas, qi, patch) } })
          return (
            <Item key={qi} titulo={`Pregunta ${qi + 1}`} onRemove={() => onChange({ ...guia, demuestra: { ...guia.demuestra, preguntas: quitar(guia.demuestra.preguntas, qi) } })}>
              <input value={q.pregunta} placeholder="Pregunta" className={INPUT} onChange={e => setQ({ pregunta: e.target.value })} />
              <p className="text-xs text-slate-500">Opciones (marca la correcta):</p>
              {q.opciones.map((op, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`correcta-${qi}`} checked={q.correcta === oi} onChange={() => setQ({ correcta: oi })} className="accent-chaski-primary" />
                  <input value={op} placeholder={`Opción ${oi + 1}`} className={INPUT} onChange={e => setQ({ opciones: q.opciones.map((x, j) => (j === oi ? e.target.value : x)) })} />
                  {q.opciones.length > 2 && (
                    <button type="button" onClick={() => setQ({ opciones: quitar(q.opciones, oi), correcta: q.correcta >= oi && q.correcta > 0 ? q.correcta - 1 : q.correcta })}
                      className="p-1 rounded-full text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              ))}
              {q.opciones.length < 4 && <Agregar onClick={() => setQ({ opciones: [...q.opciones, ''] })}>Agregar opción</Agregar>}
              <textarea value={q.explicacion} placeholder="Explicación que se muestra al responder" rows={2} className={`${INPUT} resize-y`} onChange={e => setQ({ explicacion: e.target.value })} />
            </Item>
          )
        })}
        <Agregar onClick={() => onChange({ ...guia, demuestra: { ...guia.demuestra, preguntas: [...guia.demuestra.preguntas, { pregunta: '', opciones: ['', '', ''], correcta: 0, explicacion: '' }] } })}>Agregar pregunta</Agregar>
      </Seccion>
    </div>
  )
}
