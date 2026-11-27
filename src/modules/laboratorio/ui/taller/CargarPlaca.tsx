'use client'

// Botón «Cargar a mi placa»: compila el programa para la placa de verdad y lo
// envía por el cable USB (Web Serial: Chrome o Edge en computadora).
// Funciona con Arduino UNO, Nano y Mega.

import { useRef, useState } from 'react'
import { CheckCircle2, Loader2, Usb, X, XCircle } from 'lucide-react'
import type { RobotDoc } from '../../robots/doc'
import { infoPlaca } from '../../engine/placa'
import { ErrorCarga, type PlacaReal } from '../../carga/protocolos'
import { cargarEnPlaca, elegirPuerto, puedeCargar, type PuertoUsb } from '../../carga/puertoSerie'
import type { ErrorCompilacion } from '../EditorCodigo'
import { explicarError } from '../erroresCompilador'

const REALES: PlacaReal[] = ['uno', 'nano', 'mega']
// El puerto elegido se recuerda mientras la página siga abierta.
let puertoRecordado: PuertoUsb | null = null

type Estado =
  | { fase: 'inicio' }
  | { fase: 'compilando' }
  | { fase: 'cargando'; etapa: 'conectando' | 'escribiendo' | 'verificando'; avance: number }
  | { fase: 'listo'; bytes: number }
  | { fase: 'error'; titulo: string; ayuda: string[] }

function explicar(e: unknown, placa: string): { titulo: string; ayuda: string[] } {
  if (e instanceof ErrorCarga) {
    if (e.motivo === 'sin-respuesta') return { titulo: 'La placa no contestó', ayuda: [
      'Revisa que el cable USB sea de datos (algunos solo cargan batería).',
      `Confirma que la placa conectada es un ${placa}: en el laboratorio debe estar elegida la misma placa.`,
      'Cierra el Arduino IDE o cualquier monitor serie: solo un programa puede usar el puerto.',
      'Si hay un módulo Bluetooth en los pines 0 y 1 (RX/TX), desconéctalo mientras cargas.',
    ] }
    if (e.motivo === 'placa-distinta') return { titulo: 'La placa conectada no es la elegida', ayuda: [`El programa se preparó para un ${placa}, pero la placa del cable es de otro tipo. Cambia la placa en «Armar» o conecta la correcta.`] }
    if (e.motivo === 'verificacion') return { titulo: 'El programa no quedó bien grabado', ayuda: ['Vuelve a intentarlo. Si se repite, prueba con otro cable o con otro puerto USB.'] }
    if (e.motivo === 'tamano') return { titulo: 'El programa no cabe en esta placa', ayuda: ['Quita librerías o textos largos del programa, o usa una placa con más memoria (Mega).'] }
    return { titulo: 'La placa contestó algo inesperado', ayuda: ['Desconecta y vuelve a conectar el cable, y elige el puerto otra vez.'] }
  }
  if (e instanceof DOMException) return { titulo: 'No se pudo abrir el puerto USB', ayuda: [
    'Otro programa lo está usando: cierra el Arduino IDE o el monitor serie y vuelve a intentar.',
    'Si desconectaste la placa, conéctala de nuevo y elige el puerto otra vez.',
  ] }
  return { titulo: 'No se pudo cargar', ayuda: [e instanceof Error ? e.message : 'Error desconocido'] }
}

export default function CargarPlaca({ doc, onErrores }: { doc: RobotDoc; onErrores: (e: ErrorCompilacion[]) => void }) {
  const [abierto, setAbierto] = useState(false)
  const [estado, setEstado] = useState<Estado>({ fase: 'inicio' })
  const ocupado = useRef(false)
  const info = infoPlaca(doc)
  if (info.lenguaje !== 'cpp') return null
  const real = REALES.includes(info.placa as PlacaReal) ? (info.placa as PlacaReal) : null
  const trabajando = estado.fase === 'compilando' || estado.fase === 'cargando'

  const cargar = async (otroPuerto = false) => {
    if (!real || ocupado.current) return
    ocupado.current = true
    try {
      // 1) El puerto primero: el navegador solo deja pedirlo justo después del clic.
      if (otroPuerto) puertoRecordado = null
      const usb = puertoRecordado ?? await elegirPuerto()
      if (!usb) return
      puertoRecordado = usb
      // 2) Compilar para la placa de verdad (sin las ayudas del simulador).
      setEstado({ fase: 'compilando' })
      const res = await fetch('/api/lab/compile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ board: real, code: doc.programa.cpp, real: true }),
      })
      const data = await res.json()
      if (!data.ok) {
        const errs: ErrorCompilacion[] = (data.errors ?? []).map((x: ErrorCompilacion) => ({ ...x, message: explicarError(x.message) }))
        onErrores(errs)
        const primero = errs.find(x => x.severity === 'error')
        setEstado({ fase: 'error', titulo: primero ? 'Tu código tiene errores' : 'No se pudo compilar', ayuda: [primero ? `Línea ${primero.line}: ${primero.message}` : (data.error || `Error ${res.status}`)] })
        return
      }
      // 3) Enviar por el cable.
      setEstado({ fase: 'cargando', etapa: 'conectando', avance: 0 })
      const r = await cargarEnPlaca(usb, real, data.hex, (etapa, hecho, total) => setEstado({ fase: 'cargando', etapa, avance: hecho / total }))
      setEstado({ fase: 'listo', bytes: r.bytes })
    } catch (e) {
      puertoRecordado = null // que pueda elegir otro puerto al reintentar
      setEstado({ fase: 'error', ...explicar(e, info.nombre) })
    } finally {
      ocupado.current = false
    }
  }

  const cerrar = () => { if (!trabajando) { setAbierto(false); setEstado({ fase: 'inicio' }) } }

  return (
    <>
      <button onClick={() => setAbierto(true)} className="lab-secundario flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium" title="Enviar este programa a tu placa de verdad por el cable USB">
        <Usb className="h-4 w-4" /> Cargar a mi placa
      </button>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 p-4 backdrop-blur-sm" onClick={cerrar}>
          <div role="dialog" aria-label="Cargar a mi placa" className="lab-vidrio w-full max-w-md p-5 text-sm text-lab-tinta" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-base font-semibold"><Usb className="h-5 w-5 text-lab-acento" /> Cargar a mi {info.nombre}</span>
              <button onClick={cerrar} disabled={trabajando} className="rounded p-1 text-lab-suave hover:bg-lab-tinta/[0.07] disabled:opacity-40" aria-label="Cerrar"><X className="h-4 w-4" /></button>
            </div>

            {!real ? (
              <p className="leading-relaxed text-lab-suave">Por ahora se puede cargar directo a <b className="text-lab-tinta">Arduino UNO, Nano y Mega</b>. Para el {info.nombre} usa «Descargar .ino» y cárgalo con el Arduino IDE.</p>
            ) : !puedeCargar() ? (
              <p className="leading-relaxed text-lab-suave">Cargar por USB funciona en <b className="text-lab-tinta">Chrome o Edge, en una computadora</b>. En este navegador usa «Descargar .ino» y cárgalo con el Arduino IDE.</p>
            ) : estado.fase === 'inicio' ? (
              <>
                <ol className="list-decimal space-y-1.5 pl-5 leading-snug text-lab-suave">
                  <li>Conecta tu <b className="text-lab-tinta">{info.nombre}</b> a la computadora con el cable USB.</li>
                  <li>Si el robot tiene motores, <b className="text-lab-tinta">levántalo de la mesa</b>: arrancará apenas termine la carga.</li>
                  <li>Presiona el botón y elige el puerto de tu placa en la ventanita (suele decir «USB Serial», «CH340» o «Arduino»).</li>
                </ol>
                <p className="mt-2 text-xs leading-snug text-lab-tenue">¿No aparece ningún puerto? En placas con chip CH340 hay que instalar su driver una vez. Cierra también el Arduino IDE si está abierto.</p>
                <button onClick={() => cargar()} className="lab-primario lab-b-verde mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold">
                  <Usb className="h-4 w-4" /> {puertoRecordado ? 'Cargar el programa' : 'Elegir puerto y cargar'}
                </button>
                {puertoRecordado && <button onClick={() => cargar(true)} className="mt-2 w-full text-center text-xs text-lab-acento hover:underline">Usar otro puerto</button>}
              </>
            ) : trabajando ? (
              <div>
                <p className="flex items-center gap-2 font-medium"><Loader2 className="h-4 w-4 animate-spin text-lab-acento" />
                  {estado.fase === 'compilando' ? 'Compilando tu programa…' : estado.etapa === 'conectando' ? 'Buscando la placa…' : estado.etapa === 'escribiendo' ? 'Escribiendo en la placa…' : 'Comprobando que quedó igual…'}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-lab-tinta/10">
                  <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-150" style={{ width: `${estado.fase === 'cargando' ? Math.round((estado.etapa === 'verificando' ? 0.5 + estado.avance / 2 : estado.etapa === 'escribiendo' ? estado.avance / 2 : 0) * 100) : 0}%` }} />
                </div>
                <p className="mt-2 text-xs text-lab-tenue">No desconectes el cable.</p>
              </div>
            ) : estado.fase === 'listo' ? (
              <div>
                <p className="flex items-center gap-2 font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" /> ¡Listo! Tu placa ya tiene el programa.</p>
                <p className="mt-1 text-xs text-lab-suave">{estado.bytes.toLocaleString('es')} bytes grabados y comprobados. El programa ya está corriendo.</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => cargar()} className="lab-secundario h-9 flex-1 rounded-md text-sm font-medium">Cargar otra vez</button>
                  <button onClick={cerrar} className="lab-primario lab-b-verde h-9 flex-1 rounded-md text-sm font-semibold">Cerrar</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="flex items-center gap-2 font-semibold text-red-700"><XCircle className="h-5 w-5" /> {estado.titulo}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-snug text-lab-suave">{estado.ayuda.map(a => <li key={a}>{a}</li>)}</ul>
                <button onClick={() => cargar()} className="lab-primario lab-b-verde mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold"><Usb className="h-4 w-4" /> Intentar de nuevo</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
