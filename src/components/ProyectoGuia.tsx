'use client'

import { useEffect, useState } from 'react'
import {
  Flag, Puzzle, Cable, Code2, FlaskConical, Award, ChevronLeft, ChevronRight, ChevronDown, Check, Lightbulb, AlertTriangle, CircleHelp,
  RotateCcw, Star, Hand, PartyPopper, X,
} from 'lucide-react'
import ArduinoCodeViewer from './ArduinoCodeViewer'
import WiringDiagram, { WiringConnection } from './WiringDiagram'
import { KitGuia, embedUrl } from '@/lib/kitGuia'

// Lección guiada en 6 etapas (ver src/lib/kitGuia.ts). `expandido` muestra
// todas las etapas seguidas, para la ficha imprimible.

const ETAPAS = [
  { id: 'reto', label: 'El reto', icon: Flag },
  { id: 'piezas', label: 'Piezas', icon: Puzzle },
  { id: 'arma', label: 'Arma', icon: Cable },
  { id: 'programa', label: 'Programa', icon: Code2 },
  { id: 'prueba', label: 'Prueba', icon: FlaskConical },
  { id: 'demuestra', label: 'Demuestra', icon: Award },
] as const
type EtapaId = typeof ETAPAS[number]['id']

interface Props {
  proyectoId: string
  slug: string
  guia: KitGuia
  conexiones: WiringConnection[]
  boardName?: string | null
  codigo?: string | null
  fotoArmadoUrl?: string | null
  expandido?: boolean
}

function Media({ fotoUrl, videoUrl, alt }: { fotoUrl?: string; videoUrl?: string; alt: string }) {
  const embed = videoUrl ? embedUrl(videoUrl) : null
  if (!fotoUrl && !videoUrl) return null
  return (
    <div className="space-y-3">
      {embed && (
        <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900">
          <iframe src={embed} title={alt} className="w-full h-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
        </div>
      )}
      {videoUrl && !embed && (
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-chaski-primary underline">Ver video</a>
      )}
      {fotoUrl && <img src={fotoUrl} alt={alt} className="w-full h-auto rounded-2xl border border-border-soft" />}
    </div>
  )
}

// Parte un párrafo en frases para mostrarlo en trozos cortos en vez de un bloque de texto.
function frases(t: string): string[] {
  const out: string[] = []
  let start = 0
  const re = /[.!?]\s+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(t))) {
    const next = t[m.index + m[0].length] || ''
    if (/[A-ZÁÉÍÓÚÑ¿¡"“]/.test(next)) {
      out.push(t.slice(start, m.index + 1).trim())
      start = m.index + m[0].length
    }
  }
  const rest = t.slice(start).trim()
  if (rest) out.push(rest)
  return out
}

function Trozos({ texto, className = '' }: { texto: string; className?: string }) {
  const partes = frases(texto)
  if (partes.length < 3) return <p className={`text-slate-700 leading-relaxed ${className}`}>{texto}</p>
  return (
    <ul className={`space-y-2 ${className}`}>
      {partes.map((p, i) => (
        <li key={i} className="flex items-start gap-2.5 text-slate-700 leading-relaxed">
          <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-chaski-primary flex-shrink-0" /> {p}
        </li>
      ))}
    </ul>
  )
}

function Titulo({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-base font-bold text-chaski-dark mb-3">
      <span className="w-8 h-8 rounded-xl bg-chaski-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-chaski-primary" />
      </span>
      {children}
    </h4>
  )
}

export default function ProyectoGuia({ proyectoId, slug, guia, conexiones, boardName, codigo, fotoArmadoUrl, expandido = false }: Props) {
  const [etapa, setEtapa] = useState<EtapaId>('reto')
  const [paso, setPaso] = useState(0)
  const [hechos, setHechos] = useState<number[]>([])
  const [verTodo, setVerTodo] = useState(false)
  const [visitadas, setVisitadas] = useState<EtapaId[]>(['reto'])
  const [vistas, setVistas] = useState<number[]>([])
  const [checks, setChecks] = useState<number[]>([])
  const [ayuda, setAyuda] = useState<number | null>(null)
  // Preguntas: una a la vez; si fallas puedes volver a intentar, y al final reiniciar todo.
  const [pregunta, setPregunta] = useState(0)
  const [fallos, setFallos] = useState<Record<number, number[]>>({})
  const [acertadas, setAcertadas] = useState<number[]>([])
  const reiniciarPreguntas = () => { setPregunta(0); setFallos({}); setAcertadas([]) }
  const ir = (id: EtapaId) => { setEtapa(id); setVisitadas(v => (v.includes(id) ? v : [...v, id])) }
  const alternar = (lista: number[], i: number) => (lista.includes(i) ? lista.filter(x => x !== i) : [...lista, i])

  // El avance del armado se recuerda en este dispositivo.
  const storageKey = `chaski_guia_${proyectoId}`
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
      if (saved && Array.isArray(saved.hechos)) setHechos(saved.hechos)
    } catch { /* sin avance guardado */ }
  }, [storageKey])
  const marcar = (i: number) => {
    const next = hechos.includes(i) ? hechos.filter(x => x !== i) : [...hechos, i]
    setHechos(next)
    try { localStorage.setItem(storageKey, JSON.stringify({ hechos: next })) } catch { /* almacenamiento no disponible */ }
  }

  const pasoActual = guia.pasos[paso]
  // Una lección sin cableado o sin programa (por ejemplo, de niveles iniciales)
  // muestra solo las etapas que tienen contenido.
  const hayDiagrama = conexiones.length > 0
  const visibles = ETAPAS.filter(e =>
    e.id === 'reto' ||
    (e.id === 'piezas' && guia.piezas.length > 0) ||
    (e.id === 'arma' && guia.pasos.length > 0) ||
    (e.id === 'programa' && (guia.codigo.length > 0 || !!codigo)) ||
    (e.id === 'prueba' && (guia.prueba.queDebePasar.length > 0 || guia.prueba.siNoFunciona.length > 0)) ||
    (e.id === 'demuestra' && (!!guia.demuestra.reto || guia.demuestra.preguntas.length > 0))
  ).map(e => (e.id === 'arma' && !hayDiagrama ? { ...e, label: 'Paso a paso' } : e.id === 'piezas' && !hayDiagrama ? { ...e, label: 'Materiales' } : e))
  const idx = Math.max(0, visibles.findIndex(e => e.id === etapa))
  const mostrar = (id: EtapaId) => expandido || etapa === id

  const reto = (
    <section>
      <Titulo icon={Flag}>El reto</Titulo>
      <Trozos texto={guia.reto.texto} className="text-[15px]" />
      {guia.reto.paraQue && (
        <div className="mt-4 rounded-2xl bg-chaski-light px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">¿Para qué sirve en la vida real?</p>
          <p className="text-sm text-slate-700 leading-relaxed">{guia.reto.paraQue}</p>
        </div>
      )}
      {guia.reto.duracion && <p className="mt-3 text-xs text-slate-500">Tiempo estimado: {guia.reto.duracion}</p>}
      <div className="mt-4"><Media fotoUrl={guia.reto.fotoUrl} videoUrl={guia.reto.videoUrl} alt="Proyecto terminado" /></div>
    </section>
  )

  const piezas = (
    <section>
      <Titulo icon={Puzzle}>{hayDiagrama ? 'Conoce las piezas' : 'Materiales'}</Titulo>
      {!expandido && guia.piezas.length > 1 && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-3">
          <Hand className="w-3.5 h-3.5 text-chaski-primary" />
          Toca cada tarjeta para descubrir qué hace · {vistas.length} de {guia.piezas.length}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3 items-start">
        {guia.piezas.map((p, i) => {
          const abierta = expandido || guia.piezas.length === 1 || vistas.includes(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => setVistas(v => alternar(v, i))}
              className={`text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98] ${
                abierta ? 'bg-white border-chaski-primary/30 shadow-sm' : 'bg-slate-50 border-border-soft hover:border-chaski-primary/30'
              }`}
            >
              {p.fotoUrl && <img src={p.fotoUrl} alt={p.nombre} className="w-full h-32 object-contain mb-3 rounded-xl bg-slate-50" />}
              <span className="flex items-center justify-between gap-2 font-semibold text-chaski-dark">
                {p.nombre}
                {!expandido && guia.piezas.length > 1 && (
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${abierta ? 'rotate-180' : ''}`} />
                )}
              </span>
              {abierta ? (
                <span className="block animate-fade-in">
                  <span className="block text-sm text-slate-600 mt-1 leading-relaxed">{p.paraQue}</span>
                  {p.cuidado && (
                    <span className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {p.cuidado}
                    </span>
                  )}
                </span>
              ) : (
                <span className="block text-xs text-slate-400 mt-1">¿Para qué sirve?</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )

  const arma = (
    <section>
      <Titulo icon={Cable}>{hayDiagrama ? 'Arma paso a paso' : 'Paso a paso'}</Titulo>
      {expandido ? (
        <>
          {hayDiagrama && (
            <div className="rounded-2xl border border-border-soft overflow-hidden mb-4">
              <WiringDiagram boardName={boardName} conexiones={conexiones} />
            </div>
          )}
          <ol className="space-y-3">
            {guia.pasos.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-chaski-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div>
                  <p className="font-semibold text-chaski-dark text-sm">{p.titulo}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.texto}</p>
                  {p.consejo && <p className="text-xs text-slate-500 mt-1">Consejo: {p.consejo}</p>}
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          {pasoActual && (
            <div className="rounded-2xl border border-border-soft bg-white p-5 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-chaski-primary mb-1">Paso {paso + 1} de {guia.pasos.length}</p>
              <p className="text-lg font-bold text-chaski-dark">{pasoActual.titulo}</p>
              <Trozos texto={pasoActual.texto} className="mt-2" />
              {pasoActual.consejo && (
                <p className="mt-3 flex items-start gap-2 text-sm text-slate-600 bg-chaski-light rounded-xl px-3 py-2">
                  <Lightbulb className="w-4 h-4 text-chaski-gold flex-shrink-0 mt-0.5" /> {pasoActual.consejo}
                </p>
              )}
              {pasoActual.fotoUrl && <img src={pasoActual.fotoUrl} alt={pasoActual.titulo} className="mt-4 w-full h-auto rounded-xl border border-border-soft" />}
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => setPaso(p => Math.max(0, p - 1))}
                  disabled={paso === 0}
                  className="p-2.5 rounded-full bg-slate-100 text-slate-600 disabled:opacity-30 active:scale-95 transition-all"
                  aria-label="Paso anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => marcar(paso)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold active:scale-[0.98] transition-all ${
                    hechos.includes(paso) ? 'bg-emerald-50 text-emerald-700' : 'bg-chaski-primary text-white'
                  }`}
                >
                  <Check className="w-4 h-4" /> {hechos.includes(paso) ? 'Hecho' : hayDiagrama ? 'Listo, ya lo conecté' : 'Listo, ya lo hice'}
                </button>
                <button
                  onClick={() => setPaso(p => Math.min(guia.pasos.length - 1, p + 1))}
                  disabled={paso === guia.pasos.length - 1}
                  className="p-2.5 rounded-full bg-slate-100 text-slate-600 disabled:opacity-30 active:scale-95 transition-all"
                  aria-label="Paso siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          {hayDiagrama && (
            <div className="rounded-2xl border border-border-soft overflow-hidden bg-white">
              <WiringDiagram
                boardName={boardName}
                conexiones={conexiones}
                resaltar={verTodo ? [] : pasoActual?.conexiones || []}
                rieles={verTodo ? [] : pasoActual?.rieles || []}
              />
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1.5">
              {guia.pasos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPaso(i); setVerTodo(false) }}
                  aria-label={`Paso ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === paso && !verTodo ? 'w-6 bg-chaski-primary' : hechos.includes(i) ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-300'}`}
                />
              ))}
            </div>
            {hayDiagrama && (
              <button onClick={() => setVerTodo(v => !v)} className="text-xs font-medium text-chaski-primary">
                {verTodo ? 'Volver al paso' : 'Ver todo el circuito'}
              </button>
            )}
          </div>

        </>
      )}
      {fotoArmadoUrl && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Foto del armado real</p>
          <img src={fotoArmadoUrl} alt="Armado real" className="w-full h-auto rounded-2xl border border-border-soft" />
        </div>
      )}
    </section>
  )

  const programa = (
    <section>
      <Titulo icon={Code2}>Programa</Titulo>
      <div className="space-y-3 mb-5">
        {guia.codigo.map((b, i) => (
          <div key={i} className="rounded-2xl border border-border-soft bg-white p-4">
            <p className="font-semibold text-chaski-dark text-sm">{i + 1}. {b.titulo}</p>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">{b.texto}</p>
            {b.fragmento && (
              <pre className="mt-3 text-xs leading-relaxed bg-slate-900 text-slate-100 rounded-xl p-3 overflow-x-auto"><code>{b.fragmento}</code></pre>
            )}
          </div>
        ))}
      </div>
      {codigo && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Código completo para copiar</p>
          <ArduinoCodeViewer code={codigo} filename={`${slug}.ino`} />
        </>
      )}
    </section>
  )

  const prueba = (
    <section>
      <Titulo icon={FlaskConical}>Prueba</Titulo>
      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">
          {expandido ? 'Si todo está bien, debe pasar esto' : 'Marca lo que ya funciona'}
        </p>
        <ul className="space-y-1.5">
          {guia.prueba.queDebePasar.map((t, i) => {
            const ok = expandido || checks.includes(i)
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setChecks(c => alternar(c, i))}
                  className="w-full flex items-start gap-2.5 text-left text-sm text-slate-700 py-1 active:scale-[0.99] transition-transform"
                >
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${ok ? 'bg-emerald-600' : 'bg-white ring-1 ring-emerald-300'}`}>
                    {ok && <Check className="w-3.5 h-3.5 text-white" />}
                  </span>
                  {t}
                </button>
              </li>
            )
          })}
        </ul>
        {!expandido && guia.prueba.queDebePasar.length > 0 && checks.length === guia.prueba.queDebePasar.length && (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 animate-fade-in">
            <PartyPopper className="w-4 h-4" /> ¡Todo funciona! Pasa a la última etapa.
          </p>
        )}
      </div>
      {guia.prueba.siNoFunciona.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{expandido ? 'Si no funciona, revisa' : '¿Algo no funciona? Toca tu problema'}</p>
          <div className="rounded-2xl border border-border-soft bg-white divide-y divide-border-soft overflow-hidden">
            {guia.prueba.siNoFunciona.map((f, i) => {
              const abierto = expandido || ayuda === i
              return (
                <div key={i}>
                  <button
                    type="button"
                    onClick={() => setAyuda(ayuda === i ? null : i)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-chaski-dark">{f.problema}</span>
                    {!expandido && <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />}
                  </button>
                  {abierto && <p className="px-4 pb-3 text-sm text-slate-600 leading-relaxed animate-fade-in">{f.revisa}</p>}
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )

  const demuestra = (
    <section>
      <Titulo icon={Award}>Demuestra lo que aprendiste</Titulo>
      {guia.demuestra.reto && (
        <div className="rounded-2xl bg-chaski-light px-4 py-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Reto extra</p>
          <p className="text-sm text-slate-700 leading-relaxed">{guia.demuestra.reto}</p>
        </div>
      )}
      {expandido ? (
        <div className="space-y-4">
          {guia.demuestra.preguntas.map((q, qi) => (
            <div key={qi} className="rounded-2xl border border-border-soft bg-white p-4">
              <p className="font-semibold text-chaski-dark text-sm">{qi + 1}. {q.pregunta}</p>
              <ul className="mt-2 space-y-1">
                {q.opciones.map((op, oi) => <li key={oi} className="text-sm text-slate-700">○ {op}</li>)}
              </ul>
            </div>
          ))}
        </div>
      ) : guia.demuestra.preguntas.length > 0 && (
        <div className="rounded-2xl border border-border-soft bg-white p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              {guia.demuestra.preguntas.map((_, i) => (
                <span key={i} className={`h-2 rounded-full transition-all ${
                  i === pregunta ? 'w-6 bg-chaski-primary' : acertadas.includes(i) ? ((fallos[i] || []).length ? 'w-2 bg-amber-400' : 'w-2 bg-emerald-500') : 'w-2 bg-slate-200'
                }`} />
              ))}
            </div>
            <button type="button" onClick={reiniciarPreguntas} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-chaski-primary transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
            </button>
          </div>

          {pregunta >= guia.demuestra.preguntas.length ? (() => {
            const aLaPrimera = guia.demuestra.preguntas.filter((_, i) => !(fallos[i] || []).length).length
            const todas = aLaPrimera === guia.demuestra.preguntas.length
            return (
              <div className="text-center py-4 animate-fade-in">
                <div className="flex justify-center gap-1 mb-3">
                  {guia.demuestra.preguntas.map((_, i) => (
                    <Star key={i} className={`w-7 h-7 ${i < aLaPrimera ? 'text-chaski-gold fill-current' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-lg font-bold text-chaski-dark">{todas ? '¡Perfecto!' : '¡Lección completada!'}</p>
                <p className="text-sm text-slate-600 mt-1">Acertaste {aLaPrimera} de {guia.demuestra.preguntas.length} a la primera.</p>
                <button
                  type="button"
                  onClick={reiniciarPreguntas}
                  className={`mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold active:scale-[0.98] transition-all ${todas ? 'bg-slate-100 text-slate-600' : 'bg-chaski-primary text-white'}`}
                >
                  <RotateCcw className="w-4 h-4" /> {todas ? 'Repetir las preguntas' : 'Intentar de nuevo'}
                </button>
              </div>
            )
          })() : (() => {
            const q = guia.demuestra.preguntas[pregunta]
            const malas = fallos[pregunta] || []
            const acertada = acertadas.includes(pregunta)
            return (
              <div key={pregunta} className="animate-fade-in">
                <p className="text-xs font-semibold uppercase tracking-wide text-chaski-primary mb-1">Pregunta {pregunta + 1} de {guia.demuestra.preguntas.length}</p>
                <p className="flex items-start gap-2 font-semibold text-chaski-dark">
                  <CircleHelp className="w-4 h-4 text-chaski-primary flex-shrink-0 mt-1" /> {q.pregunta}
                </p>
                <div className="mt-3 space-y-2">
                  {q.opciones.map((op, oi) => {
                    const mala = malas.includes(oi)
                    const buena = acertada && oi === q.correcta
                    const estado = buena
                      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                      : mala
                        ? 'bg-red-50 text-red-400 ring-1 ring-red-100 line-through'
                        : acertada
                          ? 'bg-slate-50 text-slate-400'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-[0.99]'
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={acertada || mala}
                        onClick={() => {
                          if (oi === q.correcta) setAcertadas(a => [...a, pregunta])
                          else setFallos(fl => ({ ...fl, [pregunta]: [...(fl[pregunta] || []), oi] }))
                        }}
                        className={`w-full flex items-center justify-between gap-2 text-left text-sm px-3.5 py-3 rounded-xl transition-all ${estado}`}
                      >
                        {op}
                        {buena && <Check className="w-4 h-4 flex-shrink-0" />}
                        {mala && <X className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                {acertada ? (
                  <div className="mt-4 animate-fade-in">
                    <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-emerald-700">¡Correcto! </span>{q.explicacion}</p>
                    <button
                      type="button"
                      onClick={() => setPregunta(pregunta + 1)}
                      className="mt-3 inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-chaski-primary text-white text-sm font-semibold active:scale-[0.98] transition-all"
                    >
                      {pregunta === guia.demuestra.preguntas.length - 1 ? 'Ver mi resultado' : 'Siguiente pregunta'} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : malas.length > 0 && (
                  <p className="mt-3 text-sm font-medium text-amber-700 animate-fade-in">Casi. Piénsalo otra vez y prueba con otra opción.</p>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </section>
  )

  const contenido: Record<EtapaId, React.ReactNode> = { reto, piezas, arma, programa, prueba, demuestra }

  if (expandido) {
    return <div className="space-y-8">{visibles.map(e => <div key={e.id}>{contenido[e.id]}</div>)}</div>
  }

  return (
    <div>
      {/* Selector de etapas */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto mb-6">
        {visibles.map((e, i) => {
          const Icon = e.icon
          const active = e.id === etapa
          return (
            <button
              key={e.id}
              onClick={() => ir(e.id)}
              className={`flex-1 min-w-[84px] flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active ? 'bg-white text-chaski-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {!active && visitadas.includes(e.id) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Icon className="w-3.5 h-3.5" />}
              <span>{i + 1}. {e.label}</span>
            </button>
          )
        })}
      </div>

      {visibles.map(e => (mostrar(e.id) ? <div key={e.id} className="animate-fade-in">{contenido[e.id]}</div> : null))}

      <div className="flex items-center justify-between mt-8 pt-5 border-t border-border-soft">
        <button
          onClick={() => ir(visibles[Math.max(0, idx - 1)].id)}
          disabled={idx === 0}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 disabled:opacity-0"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        {idx < visibles.length - 1 && (
          <button
            onClick={() => ir(visibles[idx + 1].id)}
            className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-chaski-primary text-white text-sm font-semibold active:scale-[0.98] transition-all"
          >
            Siguiente: {visibles[idx + 1].label} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
