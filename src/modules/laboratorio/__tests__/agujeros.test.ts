import { describe, expect, it } from 'vitest'
import { pieza } from '../catalogo/piezas'
import { PATAS_CIRCUITO, PASO_PROTOBOARD, PROTOBOARD, PIEZAS_CIRCUITO, Z_CABLE_PROTOBOARD } from '../catalogo/piezas/circuito'
import { PREARMADOS } from '../robots/prearmados'

/** Columna (0–62) y fila (0–4, desde la canaleta) del agujero en (x, z); null si no cae en uno. */
function agujero(x: number, z: number) {
  const col = (x + 78.7) / PASO_PROTOBOARD
  const fila = (Math.abs(z) - 3.81) / PASO_PROTOBOARD
  const k = Math.round(col), i = Math.round(fila)
  if (Math.abs(col - k) > 0.01 || Math.abs(fila - i) > 0.01 || k < 0 || k > 62 || i < 0 || i > 4) return null
  return { tira: `${k}${z < 0 ? 'arriba' : 'abajo'}`, fila: i }
}

/** Punto del marco de un hueco al marco de la protoboard (solo giro en y). */
function aProtoboard(montaje: string, giro: number, x: number, z: number) {
  const m = PROTOBOARD.montajes.find(mm => mm.id === montaje)!
  const a = ((m.rotacion?.[1] ?? 0) + giro) * Math.PI / 180
  return [m.posicion[0] + x * Math.cos(a) + z * Math.sin(a), m.posicion[2] - x * Math.sin(a) + z * Math.cos(a)]
}

describe('componentes en los agujeros de la protoboard', () => {
  it('cada componente tiene patas para todos sus pines', () => {
    for (const def of PIEZAS_CIRCUITO) {
      const patas = PATAS_CIRCUITO[def.modelo]
      if (!patas) continue
      expect(new Set(patas.map(p => p.pin)), def.id).toEqual(new Set(def.pines.map(p => p.nombre)))
    }
  })

  it('las patas y los cables caen en agujeros, cada pin en su propia tira, y el cable en la tira de su pata', () => {
    let revisados = 0
    for (const p of PREARMADOS) {
      const doc = p.construir()
      if (doc.piezas[0]?.pieza !== 'protoboard-830') continue
      const duenoTira = new Map<string, string>()
      for (const pz of doc.piezas) {
        if (!pz.padre?.montaje.startsWith('hueco-')) continue
        const def = pieza(pz.pieza)!
        const patas = PATAS_CIRCUITO[def.modelo]
        expect(patas, `${p.id}: ${def.id}`).toBeTruthy()
        const tirasDePin = new Map<string, Set<string>>()
        for (const pata of patas) {
          const [x, z] = aProtoboard(pz.padre.montaje, pz.padre.giro ?? 0, pata.x, pata.z)
          const h = agujero(x, z)
          expect(h, `${p.id}: pata ${pata.pin} de ${pz.etiqueta} en (${x.toFixed(2)}, ${z.toFixed(2)})`).not.toBeNull()
          const dueno = `${pz.id}.${pata.pin}`
          expect(duenoTira.get(h!.tira) ?? dueno, `${p.id}: ${dueno} comparte la tira ${h!.tira}`).toBe(dueno)
          duenoTira.set(h!.tira, dueno)
          tirasDePin.set(pata.pin, (tirasDePin.get(pata.pin) ?? new Set()).add(h!.tira))
          revisados++
        }
        // El cable de cada pin conectado entra en la tira de una de sus patas, en otro agujero.
        for (const c of doc.cables) for (const [inst, pin] of [c.de, c.a]) {
          if (inst !== pz.id) continue
          const pata = patas.find(pp => pp.pin === pin)!
          const [x, z] = aProtoboard(pz.padre.montaje, pz.padre.giro ?? 0, pata.x, Z_CABLE_PROTOBOARD)
          const h = agujero(x, z)
          expect(h, `${p.id}: cable de ${pin} de ${pz.etiqueta}`).not.toBeNull()
          expect(tirasDePin.get(pin)!.has(h!.tira), `${p.id}: cable de ${pin} fuera de su tira`).toBe(true)
          expect(h!.fila, `${p.id}: cable de ${pin} encima de la pata`).toBe(3)
        }
      }
    }
    expect(revisados).toBeGreaterThan(50)
  })

  it('el HC-SR04 de la mesa está sobre la mesa, fuera de la protoboard', () => {
    const m = PROTOBOARD.montajes.find(mm => mm.id === 'sensor')!
    expect(m.posicion[1]).toBe(0)
    expect(m.posicion[0] - 15).toBeGreaterThan(165 / 2)
  })
})
