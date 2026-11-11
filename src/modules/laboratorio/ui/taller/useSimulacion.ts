'use client'

// La simulación del taller vive aquí, una sola vez, por encima de las pestañas
// «Programar» y «Probar»: así la física y Pyodide siguen vivos al cambiar de
// paso. Se rearma cuando cambia la estructura del robot (piezas o cables); el
// programa queda descargado y el código escrito se conserva.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Simulacion, type Telemetria } from '../../engine/simulation'
import type { Gravedad } from '../../engine/fisica/mundo'
import { arenaDePista, listaArenas } from '../../arenas'
import type { ArenaDef } from '../../arenas/tipos'
import type { Pista } from '../../engine/tracks'
import type { RobotDoc } from '../../robots/doc'
import type { ErrorCompilacion } from '../EditorCodigo'
import type { ModoCamara } from '../Escena3D'
import { explicarError } from '../erroresCompilador'
import { verificar } from '../../engine/verificacion'
import { infoPlaca, mcuDe } from '../../engine/placa'
import { esBanco } from '../../engine/ensamblaje'
import { SonidoBuzzers } from '../sonido'

const MAX_SERIAL = 20000

export type EstadoTaller = 'preparando' | Telemetria['estado']
export interface Aviso { tipo: 'ok' | 'error' | 'info'; texto: string }

export interface SimulacionTaller {
  sim: Simulacion | null
  tele: Telemetria | null
  estado: EstadoTaller
  /** El robot cambió después de ejecutar: el programa se descargó. */
  robotCambio: boolean
  /** Se editó el código después de ejecutarlo: hay que volver a ejecutar. */
  codigoModificado: boolean
  serial: string
  errores: ErrorCompilacion[]
  compilando: boolean
  aviso: Aviso | null
  arena: ArenaDef
  arenas: ArenaDef[]
  imagenPropia: { nombre: string; img: HTMLImageElement } | null
  gravedad: Gravedad
  camara: ModoCamara
  silencio: boolean
  encendido: boolean
  versionArena: number
  banco: boolean
  python: boolean
  sinPlaca: boolean
  /** Compila (C++) o carga (Python) el código actual. Devuelve true si quedó corriendo. */
  ejecutar: () => Promise<boolean>
  pausar: () => void
  reanudar: () => void
  detener: () => void
  reiniciar: () => void
  cambiarArena: (id: string) => void
  subirPista: (f: File) => void
  enviarSerial: (texto: string) => void
  limpiarSerial: () => void
  girarRobot: (delta: number) => void
  setGravedad: (g: Gravedad) => void
  setCamara: (c: ModoCamara) => void
  setSilencio: (s: boolean) => void
  activarSonido: () => void
  /** Circuitos sin placa: conectar o desconectar la pila. */
  encender: (si: boolean) => void
  setErrores: (e: ErrorCompilacion[]) => void
  cerrarAviso: () => void
}

/** Clave de la estructura del robot (sin el programa): si cambia, hay que rearmar la simulación. */
export const estructura = (d: RobotDoc) => JSON.stringify([d.piezas, d.cables])

/**
 * @param doc robot actual (null mientras carga el borrador)
 * @param arenaInicial arena del proyecto; al cambiar de proyecto se vuelve a ella
 * @param activo solo se arma la física cuando el alumno llega a Programar o Probar; después sigue viva
 */
export function useSimulacion(doc: RobotDoc | null, arenaInicial: string, activo: boolean): SimulacionTaller {
  const [sim, setSim] = useState<Simulacion | null>(null)
  const [tele, setTele] = useState<Telemetria | null>(null)
  const [serial, setSerial] = useState('')
  const [errores, setErrores] = useState<ErrorCompilacion[]>([])
  const [compilando, setCompilando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [robotCambio, setRobotCambio] = useState(false)
  const [codigoEjecutado, setCodigoEjecutado] = useState<string | null>(null)
  const [versionArena, setVersionArena] = useState(0)
  const [gravedad, setGravedadEstado] = useState<Gravedad>('tierra')
  const [camara, setCamara] = useState<ModoCamara>('libre')
  const [silencio, setSilencio] = useState(false)
  const [encendido, setEncendido] = useState(false)
  const [imagenPropia, setImagenPropia] = useState<{ nombre: string; img: HTMLImageElement } | null>(null)

  const banco = doc ? esBanco(doc) : false
  const python = doc ? infoPlaca(doc).lenguaje === 'python' : false
  const sinPlaca = !!doc && banco && !mcuDe(doc)
  const codigo = doc?.programa.cpp ?? ''

  const arenas = useMemo(() => listaArenas().filter(a => !!a.banco === banco), [banco])
  const [arena, setArena] = useState<ArenaDef>(() => arenas.find(a => a.id === arenaInicial) ?? arenas[0])
  // Refs para que el rearmado use la escena actual sin volver a crearse por cada cambio.
  const arenaRef = useRef(arena)
  const gravedadRef = useRef(gravedad)
  const imagenRef = useRef(imagenPropia)
  arenaRef.current = arena; gravedadRef.current = gravedad; imagenRef.current = imagenPropia

  // Al abrir otro proyecto, volver a su arena.
  useEffect(() => {
    const a = arenas.find(x => x.id === arenaInicial)
    if (!a) return
    arenaRef.current = a
    imagenRef.current = null
    setArena(a)
    setImagenPropia(null)
    setCamara('libre')
  }, [arenaInicial, arenas])

  const sonido = useRef<SonidoBuzzers | null>(null)
  const activarSonido = useCallback(() => { (sonido.current ??= new SonidoBuzzers()).activar() }, [])
  useEffect(() => () => { sonido.current?.cerrar(); sonido.current = null }, [])
  useEffect(() => { if (sonido.current) sonido.current.silencio = silencio }, [silencio])

  // ---------- armar y rearmar ----------
  const montada = useRef<{ clave: string; sim: Simulacion; vivo: boolean } | null>(null)
  const clave = doc ? estructura(doc) : ''

  const liberar = useCallback(() => {
    const m = montada.current
    if (!m) return
    m.vivo = false
    m.sim.liberar()
    montada.current = null
    setSim(null)
    setTele(null)
  }, [])

  useEffect(() => {
    if (!doc || !activo || montada.current?.clave === clave) return
    const habiaPrograma = !!montada.current && (montada.current.sim.tieneProgramaCorriendo || codigoEjecutado !== null)
    liberar()
    const s = new Simulacion(doc)
    const m = { clave, sim: s, vivo: true }
    montada.current = m
    s.onTelemetria = t => { if (m.vivo) setTele(t) }
    s.onSerial = t => { if (m.vivo) setSerial(prev => (prev + t).slice(-MAX_SERIAL)) }
    s.onArenaCambiada = () => { if (m.vivo) setVersionArena(v => v + 1) }
    s.onSonidos = l => sonido.current?.actualizar(l)
    setEncendido(false)
    setErrores([])
    setAviso(null)
    if (habiaPrograma) { setRobotCambio(true); setCodigoEjecutado(null) }
    s.iniciar(arenaRef.current, gravedadRef.current, imagenRef.current?.img ?? undefined).then(() => {
      if (m.vivo) { setSim(s); setVersionArena(v => v + 1) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, activo])

  useEffect(() => liberar, [liberar])

  // ---------- programa ----------
  const docRef = useRef(doc)
  docRef.current = doc
  const ejecutar = useCallback(async (): Promise<boolean> => {
    const d = docRef.current
    const s = montada.current?.sim
    if (!d || !s || !montada.current?.vivo || compilando) return false
    const fuente = d.programa.cpp
    const errorElectrico = verificar(d).find(p => p.nivel === 'error')
    if (errorElectrico) {
      setAviso({ tipo: 'error', texto: `No se puede encender el robot: ${errorElectrico.texto} Corrígelo en «Cablear».` })
      return false
    }
    const placa = infoPlaca(d)
    const leeLetras = /SerialBT|Serial\.read\(\)|handleClient\(\)/.test(fuente)
    const soltarFoco = () => { if (leeLetras && document.activeElement instanceof HTMLElement) document.activeElement.blur() }
    setCompilando(true)
    activarSonido()
    try {
      if (placa.lenguaje === 'python') {
        setAviso({ tipo: 'info', texto: 'Cargando Python en el navegador… (la primera vez tarda unos segundos)' })
        setSerial('')
        setErrores([])
        await s.cargarPrograma(fuente)
        soltarFoco()
        setAviso({ tipo: 'ok', texto: `Programa en Python corriendo en la ${placa.nombre}` })
      } else {
        setAviso({ tipo: 'info', texto: 'Compilando con avr-gcc… (la primera vez puede tardar unos segundos)' })
        const res = await fetch('/api/lab/compile', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ board: placa.compilador, code: fuente }),
        })
        const data = await res.json()
        if (!res.ok && !data.errors) throw new Error(data.error || `Error ${res.status}`)
        const errs: ErrorCompilacion[] = (data.errors ?? []).map((e: ErrorCompilacion) => ({ ...e, message: explicarError(e.message) }))
        setErrores(errs)
        if (!data.ok) {
          const reales = errs.filter(e => e.severity === 'error')
          const primero = reales[0]
          setAviso({
            tipo: 'error',
            texto: primero
              ? `Tu código tiene ${reales.length} error${reales.length > 1 ? 'es' : ''}. Línea ${primero.line}: ${primero.message}`
              : data.error || 'No se pudo compilar',
          })
          return false
        }
        setSerial('')
        await s.cargarPrograma(data.hex)
        soltarFoco()
        const capacidad = placa.chip === 'atmega328p' ? ' de 32 256' : ''
        setAviso({ tipo: 'ok', texto: `Programa cargado · ${data.size ?? '?'} bytes${capacidad}${data.cached ? ' · (caché)' : ''}` })
      }
      setCodigoEjecutado(fuente)
      setRobotCambio(false)
      return true
    } catch (err) {
      const texto = err instanceof Error ? err.message : 'Error en el programa'
      const linea = /Línea (\d+)/.exec(texto)
      if (linea) setErrores([{ line: Number(linea[1]), col: 1, severity: 'error', message: texto }])
      setAviso({ tipo: 'error', texto })
      return false
    } finally {
      setCompilando(false)
    }
  }, [compilando, activarSonido])

  const pausar = useCallback(() => sim?.pausar(), [sim])
  const reanudar = useCallback(() => sim?.continuar(), [sim])
  const detener = useCallback(() => { sim?.detenerPrograma(); setAviso(null); setCodigoEjecutado(null) }, [sim])
  const reiniciar = useCallback(() => { sim?.reiniciar(); setAviso(null) }, [sim])

  // ---------- escena ----------
  const cambiarArena = useCallback((id: string) => {
    if (id === 'propia' && imagenRef.current) return
    const a = arenas.find(x => x.id === id)
    if (!a) return
    setArena(a)
    setImagenPropia(null)
    sim?.cambiarArena(a)
  }, [arenas, sim])

  const subirPista = useCallback((file: File) => {
    if (!sim) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // La imagen se estira a 3 × 2 m; el robot arranca en el centro.
      const propia: Pista = { id: 'propia', nombre: file.name, anchoM: 3, altoM: 2, inicio: { x: 0, z: 0, yaw: 0 } }
      const a = arenaDePista(propia)
      sim.cambiarArena(a, img)
      setArena(a)
      setImagenPropia({ nombre: file.name, img })
      URL.revokeObjectURL(url)
      setAviso({ tipo: 'info', texto: 'Pista cargada. Haz doble clic sobre la línea para colocar el robot.' })
    }
    img.src = url
  }, [sim])

  const girarRobot = useCallback((delta: number) => {
    if (!sim) return
    const p = sim.fisica.pose()
    sim.colocarRobot({ x: p.pos.x, z: p.pos.z, yaw: p.yaw + delta })
  }, [sim])

  const setGravedad = useCallback((g: Gravedad) => { setGravedadEstado(g); sim?.cambiarGravedad(g) }, [sim])
  const enviarSerial = useCallback((texto: string) => { if (texto) sim?.enviarSerial(texto + '\n') }, [sim])
  const limpiarSerial = useCallback(() => setSerial(''), [])
  const encender = useCallback((si: boolean) => {
    if (!sim) return
    activarSonido()
    sim.conectarPila(si)
    setEncendido(si)
  }, [sim, activarSonido])
  const cerrarAviso = useCallback(() => setAviso(null), [])

  const estado: EstadoTaller = !sim ? 'preparando' : tele?.estado ?? 'sin-programa'
  const codigoModificado = codigoEjecutado !== null && (estado === 'corriendo' || estado === 'pausado') && codigo !== codigoEjecutado

  return {
    sim, tele, estado, robotCambio, codigoModificado, serial, errores, compilando, aviso,
    arena, arenas, imagenPropia, gravedad, camara, silencio, encendido, versionArena, banco, python, sinPlaca,
    ejecutar, pausar, reanudar, detener, reiniciar, cambiarArena, subirPista, enviarSerial, limpiarSerial, girarRobot,
    setGravedad, setCamara, setSilencio, activarSonido, encender, setErrores, cerrarAviso,
  }
}
