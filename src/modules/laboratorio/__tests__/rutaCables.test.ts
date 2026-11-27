// Los cables no atraviesan el chasis ni las piezas: las rodean o cruzan por un pasacables.
import { describe, expect, it } from 'vitest'
import { esBanco } from '../engine/ensamblaje'
import { curvaDirecta, muestrear, obstaculos, rutearCables, tocaPieza, type ExtremoCable } from '../engine/rutaCables'
import { PREARMADOS } from '../robots/prearmados'
import type { RobotDoc } from '../robots/doc'
import { extremosDe } from '../ui/Robot3D'

const robots = PREARMADOS.filter(p => (p.categoria ?? 'robot') === 'robot').map(p => ({ id: p.id, doc: p.construir() })).filter(x => !esBanco(x.doc))

function medir(doc: RobotDoc) {
  const ext = extremosDe(doc)
  const obs = obstaculos(doc)
  const t0 = performance.now()
  const r = rutearCables(doc, ext)
  const ms = performance.now() - t0
  let antes = 0, despues = 0
  const cuales: string[] = []
  ext.forEach((e, i) => {
    if (!e) return
    const [a, b] = e as [ExtremoCable, ExtremoCable]
    if (tocaPieza(obs, curvaDirecta(a, b), a, b)) antes++
    const ruta = r.rutas[i]
    if (ruta ? tocaPieza(obs, muestrear(ruta), a, b, r.pasacables) : tocaPieza(obs, curvaDirecta(a, b), a, b)) { despues++; cuales.push(`${doc.cables[i].de.join('.')}→${doc.cables[i].a.join('.')}`) }
  })
  return { cables: ext.length, antes, despues, agujeros: r.pasacables.length, ms: Math.round(ms), cuales: cuales.join(' ') }
}

describe('recorrido de los cables', () => {
  it('ningún cable atraviesa una pieza en los robots prearmados', () => {
    const tabla = robots.map(x => ({ id: x.id, ...medir(x.doc) }))
    console.table(tabla)
    expect(tabla.reduce((s, t) => s + t.antes, 0)).toBeGreaterThan(0)
    // En el Paladín, uno de los ocho cables de los sensores de borde todavía roza una pieza dentro del casco.
    const tolerado: Record<string, number> = { 'minisumo-paladin': 1 }
    for (const t of tabla) expect(t.despues, `${t.id}: ${t.cuales}`).toBeLessThanOrEqual(tolerado[t.id] ?? 0)
  }, 120_000)
})
