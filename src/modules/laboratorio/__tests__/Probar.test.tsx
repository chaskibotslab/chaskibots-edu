// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('../ui/Escena3D', () => ({ EscenaArena: () => <div data-testid="escena" /> }))
vi.mock('../ui/EditorCodigo', () => ({ default: ({ codigo, soloLectura }: { codigo: string; soloLectura?: boolean }) => <textarea data-testid="editor" readOnly={soloLectura} value={codigo} onChange={() => {}} /> }))
vi.mock('../ui/taller/ControlRemoto', () => ({ default: () => <div data-testid="control" /> }))
vi.mock('../ui/taller/PanelCircuito', () => ({ default: () => <div data-testid="circuito" /> }))

import Probar from '../ui/taller/Probar'
import { construirSeguidor } from '../robots/prearmados'
import { listaArenas } from '../arenas'
import type { SimulacionTaller } from '../ui/taller/useSimulacion'

function simFalsa(extra: Partial<SimulacionTaller> = {}): SimulacionTaller {
  const nada = () => {}
  return {
    sim: {} as SimulacionTaller['sim'], tele: null, estado: 'sin-programa', robotCambio: false, codigoModificado: false,
    serial: '', errores: [], compilando: false, aviso: null,
    arena: listaArenas().find(a => a.id === 'ovalo')!, arenas: listaArenas().filter(a => !a.banco), imagenPropia: null, gravedad: 'tierra', camara: 'libre', silencio: false, encendido: false,
    versionArena: 0, banco: false, python: false, sinPlaca: false,
    ejecutar: vi.fn(async () => true), pausar: vi.fn(), reanudar: vi.fn(), detener: vi.fn(), reiniciar: vi.fn(), cambiarArena: vi.fn(), subirPista: nada,
    enviarSerial: vi.fn(), limpiarSerial: nada, girarRobot: nada, setGravedad: nada, setCamara: vi.fn(), setSilencio: nada, activarSonido: nada,
    encender: vi.fn(), setErrores: nada, cerrarAviso: nada,
    ...extra,
  }
}
const doc = construirSeguidor()
const tele = (estado: 'sin-programa' | 'corriendo' | 'pausado') => ({ estado, tiempoSim: 1.5, velocidadPct: 100, mhz: 16, pines: {}, sensores: [], motores: [], servos: [], velocidadRobot: 0, avisos: [] })

describe('Probar: la escena a pantalla completa con una barra corta y un cajón', () => {
  it('sin programa muestra la tarjeta con Ejecutar; si el robot cambió, lo dice', async () => {
    const s = simFalsa()
    const { rerender } = render(<Probar doc={doc} s={s} nivel="baja" onNivel={() => {}} onIrA={() => {}} />)
    // La escena 3D se carga aparte (next/dynamic).
    expect(await screen.findByTestId('escena')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay programa corriendo')).toBeInTheDocument()
    rerender(<Probar doc={doc} s={simFalsa({ robotCambio: true })} nivel="baja" onNivel={() => {}} onIrA={() => {}} />)
    expect(screen.getByText(/El robot cambió/)).toBeInTheDocument()
    expect(screen.getByText('Sin programa · el robot cambió')).toBeInTheDocument()
  })

  it('con el programa corriendo muestra Pausa, Detener y Reiniciar, y el estado con la placa', () => {
    const s = simFalsa({ estado: 'corriendo', tele: tele('corriendo') })
    render(<Probar doc={doc} s={s} nivel="baja" onNivel={() => {}} onIrA={() => {}} />)
    expect(screen.getByText(/Corriendo · Arduino/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pausa' }))
    expect(s.pausar).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Detener' }))
    expect(s.detener).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
    expect(s.reiniciar).toHaveBeenCalled()
    expect(screen.queryByText('Todavía no hay programa corriendo')).toBeNull()
  })

  it('el cajón empieza cerrado y se abre solo la primera vez que el programa imprime algo', () => {
    const { rerender } = render(<Probar doc={doc} s={simFalsa()} nivel="baja" onNivel={() => {}} onIrA={() => {}} />)
    expect(screen.queryByPlaceholderText('Enviar texto a la placa…')).toBeNull()
    rerender(<Probar doc={doc} s={simFalsa({ serial: 'Sensor: 512' })} nivel="baja" onNivel={() => {}} onIrA={() => {}} />)
    expect(screen.getByText('Sensor: 512')).toBeInTheDocument()
    // Tocar la pestaña abierta lo cierra.
    fireEvent.click(screen.getByRole('button', { name: /Monitor serie/ }))
    expect(screen.queryByText('Sensor: 512')).toBeNull()
  })

  it('si Ejecutar falla vuelve a Programar para ver los errores', async () => {
    const irA = vi.fn()
    const s = simFalsa({ ejecutar: vi.fn(async () => false) })
    render(<Probar doc={doc} s={s} nivel="baja" onNivel={() => {}} onIrA={irA} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Ejecutar' })[0])
    await vi.waitFor(() => expect(irA).toHaveBeenCalledWith('programar'))
  })

  it('un circuito sin placa tiene Encender en lugar de Ejecutar y no tiene cajón', () => {
    const s = simFalsa({ sinPlaca: true, banco: true })
    render(<Probar doc={doc} s={s} nivel="baja" onNivel={() => {}} onIrA={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Encender/ }))
    expect(s.encender).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('button', { name: /Monitor serie/ })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ejecutar' })).toBeNull()
  })

  it('pantalla completa ocupa toda la ventana y Esc la cierra', () => {
    const { container } = render(<Probar doc={doc} s={simFalsa()} nivel="baja" onNivel={() => {}} onIrA={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }))
    expect(container.firstElementChild?.className).toContain('fixed')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(container.firstElementChild?.className).not.toContain('fixed')
  })

  it('el menú Escena cambia la arena y la cámara', () => {
    const s = simFalsa()
    render(<Probar doc={doc} s={s} nivel="baja" onNivel={() => {}} onIrA={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Escena/ }))
    fireEvent.click(screen.getByText('Laberinto'))
    expect(s.cambiarArena).toHaveBeenCalledWith('laberinto')
    fireEvent.click(screen.getByRole('button', { name: /Seguir/ }))
    expect(s.setCamara).toHaveBeenCalledWith('seguir')
  })

  it('Ver código abre el programa de solo lectura con un atajo a Programar', () => {
    const irA = vi.fn()
    render(<Probar doc={doc} s={simFalsa()} nivel="baja" onNivel={() => {}} onIrA={irA} />)
    fireEvent.click(screen.getByRole('button', { name: /Ver código/ }))
    expect(screen.getByTestId('editor')).toHaveAttribute('readonly')
    fireEvent.click(screen.getByRole('button', { name: /Editar en Programar/ }))
    expect(irA).toHaveBeenCalledWith('programar')
  })
})
