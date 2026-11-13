'use client'

// Misión guiada: una pastilla flotante con el avance y el paso que toca
// ahora. Al tocarla se abre la guía de la etapa (el reto, la lista de piezas,
// los pasos con su porqué, las preguntas). Lo que el laboratorio
// puede revisar se marca solo; lo demás lo marca el alumno.

import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronUp, CircleCheck, Clock, Flag, Printer, Search, X } from 'lucide-react'
import { etapaActual, progreso, type Avance, type EtapaMision, type Mision, type PasoMision, type PestanaTaller } from '../../engine/mision'

interface Props {
  mision: Mision
  etapas: EtapaMision[]
  avance: Avance
  pestana: PestanaTaller
  onIrA: (p: PestanaTaller) => void
  onConfirmar: (id: string, si: boolean) => void
  onBuscarPieza: (nombre: string) => void
  onSalir: () => void
}

const NOMBRE_PESTANA: Record<PestanaTaller, string> = { armar: 'Armar', cablear: 'Cablear', programar: 'Programar', probar: 'Probar' }
const NIVEL = { inicial: 'Inicial', intermedio: 'Intermedio', avanzado: 'Avanzado' } as const

const minutosDe = (av: Avance) => Math.max(1, Math.round(((av.fin ?? Date.now()) - av.inicio) / 60000))

export default function PanelMision({ mision, etapas, avance, pestana, onIrA, onConfirmar, onBuscarPieza, onSalir }: Props) {
  const actual = etapaActual(etapas)
  const terminada = etapas.every(e => e.completa)
  const [abierta, setAbierta] = useState(true)
  const [vista, setVista] = useState(actual)
  // Al pasar de etapa, la guía muestra la nueva; en las de leer (reto, piezas, demuestra) se abre sola.
  useEffect(() => {
    setVista(actual)
    if (!etapas[actual].pestana) setAbierta(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual, mision.id])

  const etapa = etapas[actual]
  // Fuera de Armar la guía tapa parte del trabajo: si la etapa se hace en otro paso, se recoge sola.
  useEffect(() => {
    if (pestana !== 'armar' && etapa.pestana && etapa.pestana !== pestana) setAbierta(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pestana])
  const paso = etapa.pasos.find(p => !p.hecho) ?? null
  const pct = Math.round(progreso(etapas) * 100)
  const enOtraPestana = etapa.pestana && etapa.pestana !== pestana
  // En Armar va a la izquierda, bajo las herramientas (al pie está la repisa de piezas); en los demás pasos, al pie.
  const lado = pestana === 'armar'

  return (
    <div className={`pointer-events-none absolute z-20 flex gap-2 ${lado
      ? 'left-3 top-[calc(var(--lab-arriba)+3.5rem)] w-[23rem] max-w-[calc(100vw-1.5rem)] flex-col'
      : 'inset-x-3 bottom-3 flex-col-reverse items-center'}`}>
      {/* Pastilla: avance, paso actual y la acción que toca. */}
      <div className={`lab-vidrio lab-mision-pastilla pointer-events-auto flex h-14 items-center gap-3 !rounded-full pl-2 pr-2.5 ${lado ? '' : 'w-full max-w-[44rem]'}`}>
        <button onClick={() => setAbierta(a => !a)} className="flex min-w-0 flex-1 items-center gap-3 text-left" title={abierta ? 'Ocultar la guía' : 'Ver la guía de la misión'} aria-expanded={abierta}>
          <span className="lab-anillo h-10 w-10 shrink-0" style={{ '--p': pct } as React.CSSProperties}>
            {terminada ? <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} /> : <span className="text-[10px] font-bold tabular-nums text-lab-tinta">{pct}%</span>}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-lab-acento">
              {terminada ? 'Misión cumplida' : `${etapa.titulo} · paso ${Math.min(etapa.hechos + 1, etapa.total)} de ${etapa.total}`}
            </span>
            <span key={paso?.id} className="lab-entra block truncate text-[13px] font-semibold text-lab-tinta">{terminada ? mision.nombre : paso?.titulo}</span>
          </span>
        </button>
        {!terminada && enOtraPestana && (
          <button onClick={() => onIrA(etapa.pestana!)} className="lab-primario flex h-9 shrink-0 items-center gap-1.5 px-3.5 text-xs font-semibold">
            Ir a {NOMBRE_PESTANA[etapa.pestana!]} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
        {!terminada && !enOtraPestana && paso && !paso.auto && (
          <button onClick={() => onConfirmar(paso.id, true)} className="lab-primario lab-b-verde flex h-9 shrink-0 items-center gap-1.5 px-3.5 text-xs font-semibold">
            <Check className="h-3.5 w-3.5" /> Hecho
          </button>
        )}
        <button onClick={() => setAbierta(a => !a)} aria-label={abierta ? 'Ocultar la guía' : 'Ver la guía'} className="lab-boton-icono flex h-9 w-9 shrink-0 items-center justify-center">
          {abierta === lado ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {abierta && (
        <Guia
          mision={mision} etapas={etapas} avance={avance} vista={vista} actual={actual} terminada={terminada} lado={lado}
          onVista={setVista} onCerrar={() => setAbierta(false)} onConfirmar={onConfirmar} onBuscarPieza={onBuscarPieza} onIrA={onIrA} onSalir={onSalir} pestana={pestana}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function Guia(p: {
  mision: Mision; etapas: EtapaMision[]; avance: Avance; vista: number; actual: number; terminada: boolean; pestana: PestanaTaller; lado: boolean
  onVista: (i: number) => void; onCerrar: () => void; onConfirmar: (id: string, si: boolean) => void; onBuscarPieza: (n: string) => void; onIrA: (x: PestanaTaller) => void; onSalir: () => void
}) {
  const { mision, etapas, vista, actual, terminada } = p
  const e = etapas[vista]
  const primero = e.pasos.findIndex(x => !x.hecho)
  return (
    <section aria-label="Guía de la misión" className={`lab-vidrio pointer-events-auto flex flex-col overflow-hidden ${p.lado ? 'max-h-[calc(100dvh-var(--lab-arriba)-21rem)] min-h-[9rem]' : e.pestana ? 'max-h-[min(40vh,16rem)] w-full self-start sm:w-[26rem]' : 'max-h-[min(60vh,30rem)] w-full self-start sm:w-[26rem]'}`}>
      <header className="px-4 pb-2.5 pt-3">
        {/* Etapas: un segmento por cada una; toca para repasarla. */}
        <ol className="mb-2.5 flex items-center gap-1" aria-label="Etapas de la misión">
          {etapas.map((x, i) => (
            <li key={x.id} className="flex flex-1">
              <button onClick={() => p.onVista(i)} data-estado={x.completa ? 'hecha' : i === actual ? 'actual' : 'pendiente'} data-vista={i === vista} aria-current={i === actual ? 'step' : undefined} title={`${i + 1}. ${x.titulo}: ${x.hechos} de ${x.total}`} aria-label={`${x.titulo}: ${x.hechos} de ${x.total}`} className="lab-etapa" />
            </li>
          ))}
        </ol>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-lab-tenue">Etapa {vista + 1} de {etapas.length}{vista !== actual && !terminada ? ' · repaso' : ''}</p>
            <h3 className="text-[15px] font-semibold text-lab-tinta">{e.titulo} <span className="font-normal text-lab-suave">· {e.resumen}</span></h3>
          </div>
          <button onClick={p.onCerrar} className="lab-boton-icono p-1.5" aria-label="Ocultar la guía"><X className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed text-lab-tinta2">
        {e.id === 'reto' && (<>
          <p className="text-lab-tinta">{mision.objetivo}</p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-lab-suave">
            <div className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /> Nivel {NIVEL[mision.dificultad].toLowerCase()}</div>
            <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Unos {mision.minutos} minutos</div>
            {mision.kit && <div><span className="lab-etiqueta">{mision.kit}</span></div>}
          </dl>
          {mision.logica.length > 0 && (<>
            <h4 className="mt-4 text-xs font-semibold uppercase tracking-[0.06em] text-lab-tinta">Cómo piensa</h4>
            <ol className="mt-1.5 space-y-1.5">
              {mision.logica.map((l, i) => <li key={i} className="flex gap-2"><span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-lab-suave ring-1 ring-lab-borde/40">{i + 1}</span><span>{l}</span></li>)}
            </ol>
          </>)}
          {mision.aprende.length > 0 && (<>
            <h4 className="mt-4 text-xs font-semibold uppercase tracking-[0.06em] text-lab-tinta">Al terminar sabrás</h4>
            <ul className="mt-1.5 space-y-1">
              {mision.aprende.map(a => <li key={a} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lab-acento" /><span>{a}</span></li>)}
            </ul>
          </>)}
        </>)}

        {e.id === 'piezas' && (
          <table className="w-full text-xs">
            <thead className="text-left text-[10px] uppercase tracking-[0.06em] text-lab-tenue"><tr><th className="pb-1.5 pr-2 font-semibold">Cant.</th><th className="pb-1.5 pr-2 font-semibold">Pieza</th><th className="pb-1.5 font-semibold">Para qué sirve</th></tr></thead>
            <tbody>
              {mision.materiales.map(m => (
                <tr key={m.nombre} className="border-t border-lab-borde/15 align-top">
                  <td className="py-1.5 pr-2 font-mono text-lab-tinta">{m.cantidad}×</td>
                  <td className="py-1.5 pr-2 font-medium text-lab-tinta">{m.nombre}</td>
                  <td className="py-1.5 text-lab-suave">{m.paraQue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {e.id === 'conecta' && e.hechos > 0 && !e.completa && (
          <p className="mb-2 flex items-center gap-1.5 text-xs text-emerald-700"><CircleCheck className="h-3.5 w-3.5" /> {e.hechos} de {e.total} conexiones listas</p>
        )}

        {e.id !== 'reto' && e.id !== 'piezas' && !(e.id === 'demuestra' && terminada) && (
          <ol className="space-y-1">
            {e.pasos.map((s, i) => <Paso key={s.id} s={s} foco={i === primero && vista === actual} onConfirmar={p.onConfirmar} onBuscarPieza={e.id === 'arma' ? p.onBuscarPieza : undefined} />)}
          </ol>
        )}

        {e.id === 'demuestra' && terminada && <Cumplida mision={mision} etapas={etapas} avance={p.avance} onSalir={p.onSalir} />}
      </div>

      {/* Pie: la acción que toca en esta etapa. */}
      {!(e.id === 'demuestra' && terminada) && (
        <footer className="flex items-center gap-2 border-t border-lab-borde/15 px-4 py-2.5">
          <span className="min-w-0 flex-1 truncate text-xs text-lab-tenue">{e.completa ? 'Etapa completa' : e.pasos.some(s => s.auto && !s.hecho) ? 'El laboratorio revisa solo cada paso' : `${e.hechos} de ${e.total}`}</span>
          {(e.id === 'reto' || e.id === 'piezas') && !e.completa && (
            <button onClick={() => p.onConfirmar(e.pasos[0].id, true)} className="lab-primario flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold">
              {e.id === 'reto' ? 'Empezar la misión' : 'Ya las conozco'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {e.pestana && e.pestana !== p.pestana && !e.completa && vista === actual && (
            <button onClick={() => p.onIrA(e.pestana!)} className="lab-primario flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold">Ir a {NOMBRE_PESTANA[e.pestana]} <ArrowRight className="h-3.5 w-3.5" /></button>
          )}
          {e.completa && vista < etapas.length - 1 && (
            <button onClick={() => p.onVista(Math.max(actual, vista + 1))} className="lab-secundario flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium">Siguiente etapa <ArrowRight className="h-3.5 w-3.5" /></button>
          )}
        </footer>
      )}
    </section>
  )
}

function Paso({ s, foco, onConfirmar, onBuscarPieza }: { s: PasoMision; foco: boolean; onConfirmar: (id: string, si: boolean) => void; onBuscarPieza?: (n: string) => void }) {
  const nombrePieza = s.pieza ? /«([^»]+)»/.exec(s.titulo)?.[1] : null
  const marca = (
    <span className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${s.hecho ? 'lab-paso-hecho bg-emerald-500 text-white' : foco ? 'ring-2 ring-lab-acento' : 'ring-1 ring-lab-borde/50'}`}>
      {s.hecho && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  )
  return (
    <li className={`rounded-2xl px-2.5 py-2 transition-colors ${foco ? 'bg-lab-acento/[0.09]' : ''}`}>
      <div className="flex gap-2.5">
        {s.auto ? marca : (
          <button onClick={() => onConfirmar(s.id, !s.hecho)} aria-pressed={s.hecho} aria-label={s.hecho ? 'Desmarcar' : 'Marcar como hecho'} className="self-start">{marca}</button>
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-[13px] leading-snug ${s.hecho ? 'text-lab-tenue' : 'font-medium text-lab-tinta'}`}>{s.titulo}</p>
          {(foco || (!s.auto && !s.hecho)) && s.detalle && <p className="mt-0.5 text-xs leading-relaxed text-lab-suave">{s.detalle}</p>}
          {foco && s.codigo && <pre className="mt-1 overflow-x-auto rounded bg-lab-fondo2 px-2 py-1 font-mono text-[11px] text-lab-tinta">{s.codigo}</pre>}
          {foco && onBuscarPieza && nombrePieza && (
            <button onClick={() => onBuscarPieza(nombrePieza)} className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-lab-acento hover:underline"><Search className="h-3 w-3" /> Buscarla en el cajón</button>
          )}
          {!s.auto && !s.hecho && foco && (
            <button onClick={() => onConfirmar(s.id, true)} className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-lab-acento hover:underline"><Check className="h-3 w-3" /> Marcar como hecho</button>
          )}
        </div>
      </div>
    </li>
  )
}

function Cumplida({ mision, etapas, avance, onSalir }: { mision: Mision; etapas: EtapaMision[]; avance: Avance; onSalir: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-3 py-3 text-emerald-900 ring-1 ring-emerald-200">
        <CircleCheck className="h-7 w-7 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold">Misión cumplida</p>
          <p className="text-xs text-emerald-800">Armaste, conectaste, programaste y probaste «{mision.nombre}» en {minutosDe(avance)} min.</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-lab-fondo2 py-2"><dt className="text-lab-tenue">Piezas</dt><dd className="text-base font-semibold text-lab-tinta">{mision.meta.piezas.length}</dd></div>
        <div className="rounded-md bg-lab-fondo2 py-2"><dt className="text-lab-tenue">Conexiones</dt><dd className="text-base font-semibold text-lab-tinta">{mision.cablesMeta}</dd></div>
        <div className="rounded-md bg-lab-fondo2 py-2"><dt className="text-lab-tenue">Cableado</dt><dd className="text-base font-semibold text-lab-tinta">{avance.ayudaCables ? 'Con ayuda' : 'A mano'}</dd></div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => imprimirFicha(mision, etapas, avance)} className="lab-primario flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold"><Printer className="h-3.5 w-3.5" /> Ficha de evaluación</button>
        <button onClick={onSalir} className="lab-secundario flex h-8 items-center rounded-md px-3 text-xs font-medium">Seguir en modo libre</button>
      </div>
      <p className="mt-2 text-xs text-lab-tenue">La ficha trae el resumen, las preguntas con espacio para responder y la rúbrica para tu docente.</p>
    </div>
  )
}

const esc = (t: string) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

/** Ficha para imprimir o guardar como PDF: resumen, preguntas y rúbrica. */
export function imprimirFicha(mision: Mision, etapas: EtapaMision[], avance: Avance) {
  const criterios: [string, string, string, string][] = [
    ['Armado', 'Todas las piezas en su lugar y bien orientadas, sin ayuda', 'Completo con alguna corrección del docente', 'Incompleto o con piezas mal ubicadas'],
    ['Conexiones', 'Conecta a mano y explica para qué sirve cada cable', 'Conecta con ayuda o no explica algunos cables', 'Usa el cableado automático sin entenderlo'],
    ['Programa', 'Explica el programa y lo modifica para el reto extra', 'Lo ejecuta y explica lo principal', 'Lo ejecuta sin poder explicarlo'],
    ['Prueba y explicación', 'Responde las preguntas con sus palabras y con ejemplos', 'Responde de forma parcial', 'No logra responder'],
  ]
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ficha de evaluación · ${esc(mision.nombre)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font: 11pt/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; }
  h1 { font-size: 17pt; margin: 0 0 2pt; }
  h2 { font-size: 10pt; letter-spacing: .08em; text-transform: uppercase; color: #0f6e78; margin: 16pt 0 5pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 3pt; }
  .sub { color: #475569; font-size: 9.5pt; }
  .datos { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10pt; margin-top: 10pt; }
  .campo { border-bottom: 1px solid #64748b; padding-bottom: 2pt; font-size: 9pt; color: #475569; height: 26pt; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  th, td { border: 1px solid #cbd5e1; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-size: 8.5pt; text-transform: uppercase; letter-spacing: .05em; }
  .ok { color: #047857; font-weight: 600; }
  .lineas { border-bottom: 1px solid #94a3b8; height: 18pt; }
  ol { margin: 0; padding-left: 16pt; } li { margin-bottom: 6pt; }
  .pie { margin-top: 14pt; font-size: 8.5pt; color: #64748b; }
</style></head><body>
<h1>${esc(mision.nombre)}</h1>
<div class="sub">Laboratorio de Robótica ChaskiBots · Misión guiada · Nivel ${NIVEL[mision.dificultad].toLowerCase()}${mision.kit ? ` · ${esc(mision.kit)}` : ''}</div>
<div class="datos"><div class="campo">Estudiante</div><div class="campo">Curso</div><div class="campo">Fecha: ${new Date().toLocaleDateString('es')}</div></div>
<h2>El reto</h2><p>${esc(mision.objetivo)}</p>
<h2>Lo que hizo en el laboratorio</h2>
<table><tr><th>Etapa</th><th>Qué se hace</th><th>Resultado</th></tr>
${etapas.map(e => `<tr><td>${esc(e.titulo)}</td><td>${esc(e.resumen)}</td><td class="${e.completa ? 'ok' : ''}">${e.completa ? 'Completa' : `${e.hechos} de ${e.total}`}</td></tr>`).join('')}
</table>
<p class="sub">Tiempo: ${minutosDe(avance)} min · ${mision.meta.piezas.length} piezas · ${mision.cablesMeta} conexiones · Cableado: ${avance.ayudaCables ? 'con ayuda del automático' : 'a mano'}</p>
<h2>Preguntas</h2>
<ol>${mision.preguntas.map(q => `<li>${esc(q)}<div class="lineas"></div><div class="lineas"></div></li>`).join('')}</ol>
<h2>Reto extra</h2><p>${esc(mision.retoExtra)}</p><div class="lineas"></div>
<h2>Rúbrica (docente)</h2>
<table><tr><th>Criterio</th><th>Logrado (3)</th><th>En proceso (2)</th><th>Inicio (1)</th><th>Puntos</th></tr>
${criterios.map(c => `<tr><td><b>${c[0]}</b></td><td>${c[1]}</td><td>${c[2]}</td><td>${c[3]}</td><td style="width:42pt"></td></tr>`).join('')}
<tr><td colspan="4" style="text-align:right"><b>Total / 12</b></td><td></td></tr></table>
<div class="pie">Generado en edu.chaskibots.com/laboratorio</div>
<script>window.onload = () => window.print()</script>
</body></html>`
  const v = window.open('', '_blank')
  if (!v) return
  v.document.write(html)
  v.document.close()
}
