'use client'

// Pestaña «Programar»: el editor a la izquierda y, a la derecha, lo que hace
// falta para escribir el programa sin cambiar de paso: plantillas, la tabla
// de pines del cableado y los problemas del compilador. No hay 3D: probar es
// el paso siguiente. «Ejecutar» compila y, si no hay errores, pasa a Probar.

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle, ArrowRight, CheckCircle2, Download, FileCode2, Loader2, Play, Puzzle, XCircle } from 'lucide-react'
import { pieza } from '../../catalogo/piezas'
import type { RobotDoc } from '../../robots/doc'
import type { PlantillaCodigo } from '../../robots/prearmados'
import EditorCodigo from '../EditorCodigo'
import { partesDe } from '../../bloques/generador'
import { PROGRAMA_VACIO, SEGUIDOR_EN_BLOQUES } from '../../bloques/definiciones'
import { autocablear } from '../../engine/autocableado'
import { verificar } from '../../engine/verificacion'
import { infoPlaca } from '../../engine/placa'
import type { SimulacionTaller } from './useSimulacion'

const EditorBloques = dynamic(() => import('../../bloques/EditorBloques'), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-lab-fondo2" /> })

interface Props {
  doc: RobotDoc
  s: SimulacionTaller
  plantillas: PlantillaCodigo[]
  onPrograma: (p: RobotDoc['programa']) => void
  /** Cambiar de paso: a Cablear para arreglar un cable, a Probar cuando el programa ya corre. */
  onIrA: (paso: 'cablear' | 'probar') => void
}

export default function Programar({ doc, s, plantillas, onPrograma, onIrA }: Props) {
  const codigo = doc.programa.cpp
  const python = s.python
  const extension = python ? 'py' : 'ino'
  const partes = useMemo(() => partesDe(doc), [doc])
  const [versionBloques, setVersionBloques] = useState(0)
  const [irALinea, setIrALinea] = useState<{ linea: number; v: number } | undefined>()
  const { tabla } = useMemo(() => autocablear(doc, { conservar: true }), [doc])
  const electricos = useMemo(() => verificar(doc), [doc])
  const errorElectrico = electricos.find(p => p.nivel === 'error')

  // Plantillas en bloques solo en modo bloques, y las de código en modo código.
  const plantillasVisibles = useMemo(() => {
    const deBloques: PlantillaCodigo[] = [
      { id: 'bloques-vacio', nombre: 'Empezar en blanco', descripcion: 'Un programa vacío para armar con bloques', codigo: '', bloques: PROGRAMA_VACIO },
      ...(partes.motores && partes.lineaIzq && partes.lineaDer ? [{ id: 'bloques-seguidor', nombre: 'Seguidor de línea', descripcion: 'Sigue la línea negra con los dos sensores', codigo: '', bloques: SEGUIDOR_EN_BLOQUES }] : []),
    ]
    return doc.programa.modo === 'bloques' ? deBloques : plantillas
  }, [doc.programa.modo, partes, plantillas])

  const cambiarModo = (modo: 'bloques' | 'codigo') => {
    if (modo === doc.programa.modo) return
    if (modo === 'codigo') {
      if (window.confirm('Vas a seguir en código C++. Los bloques no se pueden recuperar desde el código. ¿Seguir?')) onPrograma({ modo: 'codigo', cpp: codigo })
      return
    }
    if (codigo.trim() && !window.confirm('Vas a empezar un programa nuevo con bloques (tu código actual se reemplaza). ¿Seguir?')) return
    onPrograma({ modo: 'bloques', bloques: PROGRAMA_VACIO, cpp: '' })
    setVersionBloques(v => v + 1)
  }

  const usarPlantilla = (p: PlantillaCodigo) => {
    if (codigo.trim() !== '' && !window.confirm(`¿Reemplazar tu programa por la plantilla «${p.nombre}»?`)) return
    if (p.bloques) { onPrograma({ modo: 'bloques', bloques: p.bloques, cpp: '' }); setVersionBloques(v => v + 1) }
    else onPrograma({ modo: 'codigo', cpp: p.codigo })
    s.setErrores([])
  }

  const ejecutar = async () => {
    const ok = await s.ejecutar()
    if (ok) onIrA('probar')
  }

  const descargar = () => {
    const blob = new Blob([codigo], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${doc.nombre.normalize('NFD').replace(/[^\w]+/g, '_') || 'robot'}.${extension}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const erroresCompilador = s.errores.filter(e => e.severity === 'error')
  const problemas = electricos.length + s.errores.length
  const motivoBloqueo = !s.sim ? 'Preparando la simulación…' : errorElectrico ? `Primero corrige el cableado: ${errorElectrico.texto}` : undefined

  if (s.sinPlaca) return <SinPlaca doc={doc} onIrA={onIrA} />

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ---------- Barra del paso ---------- */}
      <div className="lab-panel flex h-12 shrink-0 items-center gap-3 border-b border-lab-borde/20 px-3">
        <button
          onClick={ejecutar}
          disabled={!!motivoBloqueo || s.compilando}
          className="lab-primario flex h-9 items-center gap-2 rounded-md px-5 text-sm font-semibold disabled:opacity-50"
          title={motivoBloqueo ?? (python ? 'Ejecutar el programa en Python (Ctrl+Enter)' : 'Compilar y ejecutar (Ctrl+Enter)')}
        >
          {s.compilando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {python ? 'Ejecutar' : 'Compilar y ejecutar'}
        </button>
        <Estado s={s} motivoBloqueo={motivoBloqueo} />
        <button onClick={descargar} className="lab-secundario ml-auto flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium" title={python ? `Descargar el programa (.py) para correrlo en la ${infoPlaca(doc).nombre}` : 'Descargar el programa (.ino) para abrirlo en el Arduino IDE'}>
          <Download className="h-4 w-4" /> Descargar .{extension}
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ---------- Editor ---------- */}
        <div className="flex min-h-0 min-w-0 flex-[13] flex-col border-r border-lab-borde/20">
          <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-lab-borde/20 bg-lab-fondo2 px-3 text-xs text-lab-suave">
            <div className="flex rounded-md p-0.5 ring-1 ring-lab-borde/20">
              {([['bloques', 'Bloques', Puzzle], ['codigo', python ? 'Python' : 'Código', FileCode2]] as const).filter(([modo]) => !python || modo === 'codigo').map(([modo, txt, Icon]) => (
                <button key={modo} onClick={() => cambiarModo(modo)} className={`flex items-center gap-1 rounded px-2.5 py-0.5 ${doc.programa.modo === modo ? 'bg-lab-superficie font-medium text-lab-tinta shadow-sm' : 'hover:text-lab-tinta'}`}>
                  <Icon className="h-3.5 w-3.5" /> {txt}
                </button>
              ))}
            </div>
            <span className="truncate font-mono">{doc.nombre}.{extension}</span>
            <span className="shrink-0">Ctrl+Enter ejecuta</span>
          </div>
          {doc.programa.modo === 'bloques' ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-[260px] flex-[3]">
                <EditorBloques
                  key={versionBloques}
                  programa={doc.programa.bloques}
                  partes={partes}
                  onCambio={bloques => onPrograma({ modo: 'bloques', bloques, cpp: codigo })}
                />
              </div>
              <div className="flex min-h-[120px] flex-[2] flex-col border-t border-lab-borde/20 bg-lab-fondo">
                <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-lab-suave">
                  <span>Código Arduino que generan tus bloques</span>
                  <button onClick={() => cambiarModo('codigo')} className="rounded-md border border-lab-borde/20 px-2 py-0.5 text-lab-tinta hover:bg-lab-tinta/[0.04]">Pasar a código →</button>
                </div>
                <pre className="min-h-0 flex-1 overflow-auto px-3 pb-2 font-mono text-[11px] leading-relaxed text-emerald-700/90">{codigo}</pre>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <EditorCodigo codigo={codigo} lenguaje={python ? 'python' : 'cpp'} onChange={cpp => onPrograma({ modo: 'codigo', cpp })} errores={s.errores} onEjecutar={ejecutar} irALinea={irALinea} />
            </div>
          )}
        </div>

        {/* ---------- Panel derecho ---------- */}
        <aside className="flex min-h-0 w-[34%] min-w-[20rem] max-w-md flex-col overflow-y-auto bg-lab-fondo text-xs">
          <Seccion titulo="Plantillas" nota={plantillasVisibles.length ? 'Usan los pines de tu robot' : undefined}>
            {plantillasVisibles.length === 0 ? <p className="text-lab-tenue">No hay plantillas para este robot.</p> : (
              <ul className="space-y-1.5">
                {plantillasVisibles.map(p => (
                  <li key={p.id} className="lab-tarjeta flex items-center gap-3 px-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-lab-tinta">{p.bloques && doc.programa.modo !== 'bloques' ? '🧩 ' : ''}{p.nombre}</span>
                      {p.descripcion && <span className="block truncate text-lab-tenue">{p.descripcion}</span>}
                    </span>
                    <button onClick={() => usarPlantilla(p)} className="lab-secundario h-7 shrink-0 rounded-md px-2.5 font-medium">Usar</button>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>

          <Seccion titulo="Pines de tu robot" nota="Según el cableado">
            {tabla.length === 0 ? <p className="text-lab-tenue">Todavía no hay piezas conectadas a la placa.</p> : (
              <table className="w-full">
                <tbody>
                  {tabla.map((f, i) => (
                    <tr key={i} className="border-t border-lab-borde/10 first:border-0">
                      <td className="py-1 pr-2 text-lab-tinta2">{f.etiqueta}</td>
                      <td className="py-1 pr-2 font-mono text-lab-suave">{f.pin}</td>
                      <td className="py-1 text-right font-mono font-semibold text-lab-acento">{f.placa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Seccion>

          <Seccion titulo={`Problemas${problemas ? ` · ${problemas}` : ''}`} resaltada={erroresCompilador.length > 0 || !!errorElectrico}>
            {problemas === 0 ? (
              <p className="flex items-center gap-1.5 text-lab-tenue"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Sin problemas. Los errores del compilador aparecen aquí y subrayados en el editor.</p>
            ) : (
              <ul className="space-y-1.5">
                {electricos.map((p, i) => (
                  <li key={`e${i}`} className={`rounded-md border px-2.5 py-2 leading-snug ${p.nivel === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                    <span className="flex gap-2">{p.nivel === 'error' ? <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}<span>{p.texto}</span></span>
                    <button onClick={() => onIrA('cablear')} className="mt-1 flex items-center gap-1 font-medium underline-offset-2 hover:underline">Ir a Cablear <ArrowRight className="h-3 w-3" /></button>
                  </li>
                ))}
                {s.errores.map((e, i) => (
                  <li key={`c${i}`}>
                    <button onClick={() => setIrALinea(v => ({ linea: e.line, v: (v?.v ?? 0) + 1 }))} className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left hover:bg-lab-fondo2" title="Ir a esa línea del editor">
                      <span className={`shrink-0 font-semibold ${e.severity === 'error' ? 'text-red-600' : 'text-amber-600'}`}>{e.severity === 'error' ? 'Error' : 'Aviso'}</span>
                      <span className="shrink-0 font-mono text-lab-suave">línea {e.line}</span>
                      <span className="text-lab-tinta">{e.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>
        </aside>
      </div>
    </div>
  )
}

/** Qué está pasando con el programa, al lado del botón Ejecutar. */
function Estado({ s, motivoBloqueo }: { s: SimulacionTaller; motivoBloqueo?: string }) {
  if (s.compilando && s.aviso?.tipo === 'info') return <span className="truncate text-xs text-lab-suave">{s.aviso.texto}</span>
  if (s.aviso?.tipo === 'error') return <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-red-700"><span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />{s.aviso.texto}</span>
  if (motivoBloqueo && s.sim) return <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-amber-700"><span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />{motivoBloqueo}</span>
  if (s.codigoModificado) return <span className="flex items-center gap-1.5 text-xs text-lab-suave"><span className="h-2 w-2 rounded-full bg-amber-400" />Código modificado · ejecuta de nuevo para probarlo</span>
  if (s.estado === 'corriendo' || s.estado === 'pausado') return <span className="flex items-center gap-1.5 text-xs text-lab-suave"><span className="h-2 w-2 rounded-full bg-emerald-500" />El programa está corriendo en Probar</span>
  return null
}

function Seccion({ titulo, nota, resaltada = false, children }: { titulo: string; nota?: string; resaltada?: boolean; children: React.ReactNode }) {
  return (
    <section className={`border-b border-lab-borde/15 p-4 ${resaltada ? 'bg-red-50/40' : ''}`}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="lab-seccion">{titulo}</h3>
        {nota && <span className="text-[11px] text-lab-tenue">{nota}</span>}
      </div>
      {children}
    </section>
  )
}

/** Circuito con pila o fuente y sin placa: no hay nada que programar. */
function SinPlaca({ doc, onIrA }: { doc: RobotDoc; onIrA: (paso: 'cablear' | 'probar') => void }) {
  const conPulsador = doc.piezas.some(p => ['pulsador', 'joystick'].includes(pieza(p.pieza).comportamiento.tipo))
  return (
    <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto bg-lab-fondo p-8">
      <div className="lab-tarjeta w-full max-w-xl space-y-4 p-6 text-sm text-lab-tinta2">
        <h3 className="text-lg font-semibold text-lab-tinta">Este circuito no tiene placa</h3>
        <p>La pila (o la fuente) le da la corriente directo: no hay Arduino que programar. En <b className="text-lab-tinta">Probar</b>, el botón <b className="text-lab-tinta">Encender</b> conecta la pila, como enchufar el clip o mover el interruptor de la fuente.</p>
        <div className="rounded-md bg-lab-fondo2 p-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-lab-tenue">Cómo va la corriente</div>
          <ol className="list-decimal space-y-1 pl-4 text-[13px]">
            <li>Sale del <b className="text-red-700">+</b> de la pila al <b className="text-red-700">riel + (línea roja)</b> de la protoboard.</li>
            <li>Del riel pasa por los componentes: resistencia, LED{conPulsador ? ', pulsador' : ''}…</li>
            <li>Vuelve por el <b className="text-sky-700">riel − (línea azul)</b> al <b className="text-sky-700">−</b> de la pila.</li>
          </ol>
        </div>
        <div className="rounded-md bg-lab-fondo2 p-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-lab-tenue">Para experimentar</div>
          <ul className="list-disc space-y-1 pl-4 text-[13px]">
            {conPulsador && <li>En Probar, presiona el pulsador (en la escena o en el panel).</li>}
            <li>En «Armar», cambia la resistencia por otra: con menos ohmios el LED brilla más; sin resistencia se quema.</li>
            <li>En «Cablear», quita el cable del riel −: el circuito se abre y el LED se apaga.</li>
            <li>Si quieres programarlo, agrega una placa (Arduino, ESP32, Pico…) desde «Armar».</li>
          </ul>
        </div>
        <button onClick={() => onIrA('probar')} className="lab-primario flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold">Ir a Probar <ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
