// Conexiones con PCB: las mismas conexiones del robot, dibujadas como pistas y mazos.
import { describe, expect, it } from 'vitest'
import { planoPcb } from '../ui/modelos/Pcb3D'
import { planDe } from '../engine/plan'
import { PREARMADOS, construirAbyss, construirMinisumo, construirPaladin, construirSeguidorPro } from '../robots/prearmados'

describe('PCB', () => {
  it('los tres robots de competencia vienen con PCB; los demás, con cables', () => {
    for (const d of [construirAbyss(), construirSeguidorPro(), construirPaladin()]) expect(d.conexion).toBe('pcb')
    expect(construirMinisumo().conexion).toBeUndefined()
  })

  it('la PCB queda debajo de la placa y del driver, y no cambia el circuito', () => {
    const d = construirPaladin()
    const pl = planoPcb(d)!
    expect(pl.ids.size).toBe(2)
    // Nano (45 × 18) y TB6612 (20 × 20) con margen: una placa de unos 6 × 6 cm como mucho.
    expect(pl.x1 - pl.x0).toBeLessThan(0.065)
    expect(pl.z1 - pl.z0).toBeLessThan(0.065)
    expect(JSON.stringify(planDe({ ...d, conexion: 'cables' }))).toBe(JSON.stringify(planDe(d)))
  })

  it('cualquier robot con placa puede pasar a PCB', () => {
    for (const p of PREARMADOS.filter(x => (x.categoria ?? 'robot') === 'robot')) {
      const d = p.construir()
      if (d.piezas.length > 1) expect(planoPcb(d), p.id).not.toBeNull()
    }
  })
})
