// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ErrorCompilacion } from '../ui/EditorCodigo'

// Monaco no corre en jsdom: un editor de mentira que muestra lo que recibe.
vi.mock('../ui/EditorCodigo', () => ({
  default: ({ codigo, irALinea, soloLectura }: { codigo: string; irALinea?: { linea: number }; soloLectura?: boolean }) => (
    <textarea data-testid="editor" data-linea={irALinea?.linea} readOnly={soloLectura} value={codigo} onChange={() => {}} />
  ),
}))

import Programar from '../ui/taller/Programar'
import { construirSeguidor, plantillasDe } from '../robots/prearmados'
import { listaArenas } from '../arenas'
import type { SimulacionTaller } from '../ui/taller/useSimulacion'

function simFalsa(extra: Partial<SimulacionTaller> = {}): SimulacionTaller {
  const nada = () => {}
  return {
    sim: {} as SimulacionTaller['sim'], tele: null, estado: 'sin-programa', robotCambio: false, codigoModificado: false,
    serial: '', errores: [], compilando: false, aviso: null,
    arena: listaArenas()[0], arenas: listaArenas(), imagenPropia: null, gravedad: 'tierra', camara: 'libre', silencio: false, encendido: false,
    versionArena: 0, banco: false, python: false, sinPlaca: false,
    ejecutar: vi.fn(async () => true), pausar: nada, reanudar: nada, detener: nada, reiniciar: nada, cambiarArena: nada, subirPista: nada,
    enviarSerial: nada, limpiarSerial: nada, girarRobot: nada, setGravedad: nada, setCamara: nada, velocidadSim: 1, setVelocidadSim: nada, setSilencio: nada, activarSonido: nada,
    encender: nada, setErrores: vi.fn(), cerrarAviso: nada,
    ...extra,
  }
}

describe('Programar: editor + plantillas, pines y problemas', () => {
  const doc = construirSeguidor()
  const plantillas = plantillasDe(doc, 'seguidor')
  beforeEach(() => { vi.spyOn(window, 'confirm').mockReturnValue(false) })

  it('muestra las plantillas como tarjetas y la tabla de pines del cableado', () => {
    render(<Programar doc={doc} s={simFalsa()} plantillas={plantillas} onPrograma={() => {}} onIrA={() => {}} />)
    expect(screen.getByText('Plantillas')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Usar' }).length).toBe(plantillas.length)
    expect(screen.getByText('Pines de tu robot')).toBeInTheDocument()
    // El seguidor tiene sensores de línea conectados a pines de la placa.
    expect(screen.getAllByRole('row').length).toBeGreaterThan(2)
    expect(screen.getByText(/Sin problemas/)).toBeInTheDocument()
  })

  it('Ejecutar compila y pasa a Probar solo si salió bien', async () => {
    const irA = vi.fn()
    const s = simFalsa()
    const { rerender } = render(<Programar doc={doc} s={s} plantillas={plantillas} onPrograma={() => {}} onIrA={irA} />)
    fireEvent.click(screen.getByRole('button', { name: /Compilar y ejecutar/ }))
    await waitFor(() => expect(irA).toHaveBeenCalledWith('probar'))

    const conError = simFalsa({ ejecutar: vi.fn(async () => false) })
    irA.mockClear()
    rerender(<Programar doc={doc} s={conError} plantillas={plantillas} onPrograma={() => {}} onIrA={irA} />)
    fireEvent.click(screen.getByRole('button', { name: /Compilar y ejecutar/ }))
    await waitFor(() => expect(conError.ejecutar).toHaveBeenCalled())
    expect(irA).not.toHaveBeenCalled()
  })

  it('lista los errores del compilador y al tocar uno salta a esa línea del editor', () => {
    const errores: ErrorCompilacion[] = [{ line: 7, col: 3, severity: 'error', message: 'falta un punto y coma' }]
    render(<Programar doc={doc} s={simFalsa({ errores })} plantillas={plantillas} onPrograma={() => {}} onIrA={() => {}} />)
    expect(screen.getByText('Problemas · 1')).toBeInTheDocument()
    fireEvent.click(screen.getByText('falta un punto y coma'))
    expect(screen.getByTestId('editor')).toHaveAttribute('data-linea', '7')
  })

  it('una plantilla pide confirmación si ya hay código y no reemplaza si se cancela', () => {
    const onPrograma = vi.fn()
    render(<Programar doc={doc} s={simFalsa()} plantillas={plantillas} onPrograma={onPrograma} onIrA={() => {}} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Usar' })[0])
    expect(window.confirm).toHaveBeenCalled()
    expect(onPrograma).not.toHaveBeenCalled()
    ;(window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true)
    fireEvent.click(screen.getAllByRole('button', { name: 'Usar' })[0])
    expect(onPrograma).toHaveBeenCalledWith({ modo: 'codigo', cpp: plantillas[0].codigo })
  })

  it('con un error de cableado, Ejecutar queda deshabilitado y Problemas lleva a Cablear', () => {
    const irA = vi.fn()
    // Un cable de 5V a GND de la placa: cortocircuito.
    const mcu = doc.piezas.find(p => p.pieza === 'arduino-uno')!
    const corto = { de: [mcu.id, '5V'] as [string, string], a: [mcu.id, 'GND'] as [string, string], color: '#f00' }
    render(<Programar doc={{ ...doc, cables: [...doc.cables, corto] }} s={simFalsa()} plantillas={plantillas} onPrograma={() => {}} onIrA={irA} />)
    expect(screen.getByRole('button', { name: /Compilar y ejecutar/ })).toBeDisabled()
    fireEvent.click(screen.getAllByText('Ir a Cablear')[0])
    expect(irA).toHaveBeenCalledWith('cablear')
  })

  it('un circuito sin placa explica que no se programa y manda a Probar', () => {
    const irA = vi.fn()
    render(<Programar doc={doc} s={simFalsa({ sinPlaca: true, banco: true })} plantillas={[]} onPrograma={() => {}} onIrA={irA} />)
    expect(screen.getByText('Este circuito no tiene placa')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Ir a Probar/ }))
    expect(irA).toHaveBeenCalledWith('probar')
  })
})
