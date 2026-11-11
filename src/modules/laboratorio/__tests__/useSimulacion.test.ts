// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { RobotDoc } from '../robots/doc'

// La Simulacion real necesita Rapier y workers; aquí basta con registrar qué se le pide.
const falso = vi.hoisted(() => ({ instancias: [] as FalsaSimulacion[] }))
interface FalsaSimulacion {
  doc: RobotDoc
  onTelemetria: (t: unknown) => void
  onSerial: (t: string) => void
  programa: boolean
  iniciar: Mock; liberar: Mock; cargarPrograma: Mock; reiniciar: Mock; detenerPrograma: Mock; pausar: Mock; continuar: Mock
  cambiarArena: Mock; cambiarGravedad: Mock; conectarPila: Mock
  readonly tieneProgramaCorriendo: boolean
}
vi.mock('../engine/simulation', () => {
  class Simulacion {
    doc: RobotDoc
    onTelemetria: (t: unknown) => void = () => {}
    onSerial: (t: string) => void = () => {}
    onArenaCambiada = () => {}
    onSonidos = () => {}
    programa = false
    iniciar = vi.fn(async () => {})
    liberar = vi.fn()
    cargarPrograma = vi.fn(async () => { this.programa = true })
    reiniciar = vi.fn()
    detenerPrograma = vi.fn(() => { this.programa = false })
    pausar = vi.fn()
    continuar = vi.fn()
    cambiarArena = vi.fn()
    cambiarGravedad = vi.fn()
    conectarPila = vi.fn()
    get tieneProgramaCorriendo() { return this.programa }
    constructor(doc: RobotDoc) { this.doc = doc; falso.instancias.push(this as unknown as FalsaSimulacion) }
  }
  return { Simulacion }
})

import { useSimulacion } from '../ui/taller/useSimulacion'
import { construirSeguidor } from '../robots/prearmados'

const tele = (estado: 'sin-programa' | 'corriendo' | 'pausado') => ({ estado, tiempoSim: 0, velocidadPct: 100, mhz: 16, pines: {}, sensores: [], motores: [], servos: [], velocidadRobot: 0, avisos: [] })
const esperar = () => act(async () => { await Promise.resolve(); await Promise.resolve() })

describe('useSimulacion: una simulación viva por encima de Programar y Probar', () => {
  beforeEach(() => { falso.instancias.length = 0 })

  it('no arma nada hasta llegar a Programar o Probar; después queda armada', async () => {
    const doc = construirSeguidor()
    const { result, rerender } = renderHook(({ activo }) => useSimulacion(doc, 'ovalo', activo), { initialProps: { activo: false } })
    expect(falso.instancias).toHaveLength(0)
    expect(result.current.estado).toBe('preparando')
    rerender({ activo: true })
    await esperar()
    expect(falso.instancias).toHaveLength(1)
    expect(result.current.sim).not.toBeNull()
    expect(result.current.estado).toBe('sin-programa')
    // Volver a Armar no la destruye.
    rerender({ activo: false })
    expect(falso.instancias[0].liberar).not.toHaveBeenCalled()
  })

  it('conserva la simulación si solo cambia el código y la rearma si cambian las piezas o los cables', async () => {
    const doc = construirSeguidor()
    const { result, rerender } = renderHook(({ d }) => useSimulacion(d, 'ovalo', true), { initialProps: { d: doc } })
    await esperar()
    rerender({ d: { ...doc, programa: { modo: 'codigo', cpp: '// otro' } } })
    await esperar()
    expect(falso.instancias).toHaveLength(1)
    rerender({ d: { ...doc, cables: [] } })
    await esperar()
    expect(falso.instancias).toHaveLength(2)
    expect(falso.instancias[0].liberar).toHaveBeenCalledTimes(1)
    expect(result.current.sim).toBe(falso.instancias[1])
  })

  it('compila por la API, carga el .hex y marca el código como modificado cuando se edita después', async () => {
    const doc = construirSeguidor()
    ;(fetch as unknown as Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true, hex: ':00HEX', size: 1234 }) })
    const { result, rerender } = renderHook(({ d }) => useSimulacion(d, 'ovalo', true), { initialProps: { d: doc } })
    await esperar()
    let ok = false
    await act(async () => { ok = await result.current.ejecutar() })
    expect(ok).toBe(true)
    const sim = falso.instancias[0]
    expect(fetch).toHaveBeenCalledWith('/api/lab/compile', expect.objectContaining({ method: 'POST' }))
    expect(sim.cargarPrograma).toHaveBeenCalledWith(':00HEX')
    expect(result.current.aviso?.tipo).toBe('ok')
    act(() => sim.onTelemetria(tele('corriendo')))
    expect(result.current.estado).toBe('corriendo')
    expect(result.current.codigoModificado).toBe(false)
    rerender({ d: { ...doc, programa: { modo: 'codigo', cpp: doc.programa.cpp + '\n// cambio' } } })
    expect(result.current.codigoModificado).toBe(true)
  })

  it('con errores de compilación no carga nada, devuelve false y deja los errores explicados', async () => {
    const doc = construirSeguidor()
    ;(fetch as unknown as Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: false, errors: [{ line: 3, col: 1, severity: 'error', message: "expected ';' before 'x'" }] }) })
    const { result } = renderHook(() => useSimulacion(doc, 'ovalo', true))
    await esperar()
    let ok = true
    await act(async () => { ok = await result.current.ejecutar() })
    expect(ok).toBe(false)
    expect(falso.instancias[0].cargarPrograma).not.toHaveBeenCalled()
    expect(result.current.errores).toHaveLength(1)
    expect(result.current.errores[0].line).toBe(3)
    expect(result.current.aviso?.tipo).toBe('error')
  })

  it('si el robot cambia después de ejecutar, el programa se descarga y se avisa que el robot cambió', async () => {
    const doc = construirSeguidor()
    ;(fetch as unknown as Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true, hex: ':00', size: 1 }) })
    const { result, rerender } = renderHook(({ d }) => useSimulacion(d, 'ovalo', true), { initialProps: { d: doc } })
    await esperar()
    await act(async () => { await result.current.ejecutar() })
    act(() => falso.instancias[0].onTelemetria(tele('corriendo')))
    expect(result.current.robotCambio).toBe(false)
    rerender({ d: { ...doc, cables: doc.cables.slice(1) } })
    await esperar()
    expect(result.current.robotCambio).toBe(true)
    expect(result.current.estado).toBe('sin-programa')
    expect(result.current.codigoModificado).toBe(false)
    // Al ejecutar de nuevo, el aviso se va.
    await act(async () => { await result.current.ejecutar() })
    expect(result.current.robotCambio).toBe(false)
  })

  it('reiniciar y detener llegan a la simulación; al desmontar se libera', async () => {
    const doc = construirSeguidor()
    const { result, unmount } = renderHook(() => useSimulacion(doc, 'ovalo', true))
    await esperar()
    act(() => result.current.reiniciar())
    act(() => result.current.detener())
    const sim = falso.instancias[0]
    expect(sim.reiniciar).toHaveBeenCalledTimes(1)
    expect(sim.detenerPrograma).toHaveBeenCalledTimes(1)
    unmount()
    expect(sim.liberar).toHaveBeenCalledTimes(1)
  })

  it('el monitor serie acumula lo que imprime el programa y se puede limpiar', async () => {
    const doc = construirSeguidor()
    const { result } = renderHook(() => useSimulacion(doc, 'ovalo', true))
    await esperar()
    act(() => { falso.instancias[0].onSerial('hola '); falso.instancias[0].onSerial('mundo') })
    expect(result.current.serial).toBe('hola mundo')
    act(() => result.current.limpiarSerial())
    expect(result.current.serial).toBe('')
  })

  it('cambiar de arena se lo pide a la simulación y vuelve a la del proyecto al abrir otro', async () => {
    const doc = construirSeguidor()
    const { result, rerender } = renderHook(({ a }) => useSimulacion(doc, a, true), { initialProps: { a: 'ovalo' } })
    await esperar()
    act(() => result.current.cambiarArena('laberinto'))
    expect(result.current.arena.id).toBe('laberinto')
    expect(falso.instancias[0].cambiarArena).toHaveBeenCalledWith(expect.objectContaining({ id: 'laberinto' }))
    rerender({ a: 'campo-libre' })
    expect(result.current.arena.id).toBe('campo-libre')
  })
})
