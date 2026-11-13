// Misiones guiadas: de cada proyecto sale una misión que se puede completar paso a paso.
import { describe, expect, it } from 'vitest'
import { encastrar } from '../engine/ensamblaje'
import { avanceNuevo, crearMision, etapaActual, etapasMision, pasosArmado, progreso, pruebaCumplida } from '../engine/mision'
import { PREARMADOS } from '../robots/prearmados'
import type { RobotDoc } from '../robots/doc'

/** Arma el robot como lo haría el alumno: una pieza por paso, desde la base vacía. */
function armarComoAlumno(id: string) {
  const m = crearMision(PREARMADOS.find(p => p.id === id)!)
  let doc: RobotDoc = m.inicio
  const ids = new Map<string, string>([[m.meta.piezas[0].id, doc.piezas[0].id]])
  for (const p of m.meta.piezas.filter(x => x.padre)) {
    const r = encastrar(doc, p.pieza, ids.get(p.padre!.instancia)!, p.padre!.montaje, p.variante)
    doc = r.doc
    ids.set(p.id, r.id)
    if (p.padre!.giro) doc = { ...doc, piezas: doc.piezas.map(x => (x.id === r.id ? { ...x, padre: { ...x.padre!, giro: p.padre!.giro } } : x)) }
  }
  return { m, doc, ids }
}

describe('misiones guiadas', () => {
  it('todas las misiones empiezan con la base sola y sin cables ni programa', () => {
    for (const p of PREARMADOS) {
      const m = crearMision(p)
      expect(m.inicio.piezas, p.id).toHaveLength(1)
      expect(m.inicio.cables, p.id).toHaveLength(0)
      expect(m.inicio.programa.cpp, p.id).toBe('')
      expect(m.materiales.length, p.id).toBeGreaterThan(0)
      expect(m.preguntas.length, p.id).toBeGreaterThan(0)
      const e = etapasMision(m, m.inicio, avanceNuevo())
      expect(e.map(x => x.id)).toEqual(['reto', 'piezas', 'arma', 'conecta', 'programa', 'prueba', 'demuestra'])
      expect(etapaActual(e), p.id).toBe(0)
      expect(progreso(e), p.id).toBe(0)
    }
  })

  it('armando pieza por pieza se cumplen todos los pasos de «Arma»', () => {
    for (const p of PREARMADOS) {
      const { m, doc } = armarComoAlumno(p.id)
      const pasos = pasosArmado(m, doc)
      expect(pasos.filter(x => !x.hecho).map(x => x.titulo), p.id).toEqual([])
      // Y a medio armar, faltan justo las que no se pusieron.
      if (pasos.length > 1) expect(pasosArmado(m, { ...doc, piezas: doc.piezas.slice(0, 2) }).filter(x => x.hecho).length, p.id).toBeLessThan(pasos.length)
    }
  })

  it('con los cables y el programa del proyecto, la misión se puede terminar', () => {
    const fallas: string[] = []
    for (const p of PREARMADOS) {
      const { m, doc, ids } = armarComoAlumno(p.id)
      const id = (x: string) => ids.get(x) ?? x
      const listo: RobotDoc = { ...doc, cables: m.meta.cables.map(c => ({ ...c, de: [id(c.de[0]), c.de[1]], a: [id(c.a[0]), c.a[1]] })), programa: m.meta.programa }
      const av = { ...avanceNuevo(), corrio: true, probado: true }
      const e = etapasMision(m, listo, av)
      const conecta = e.find(x => x.id === 'conecta')!
      if (!conecta.completa) fallas.push(`${p.id}: ${conecta.pasos.filter(x => !x.hecho).map(x => `${x.titulo} (${x.detalle})`).join(' | ')}`)
      av.confirmados = e.flatMap(x => x.pasos.filter(s => !s.auto).map(s => s.id))
      const fin = etapasMision(m, listo, av)
      if (conecta.completa) { expect(fin.every(x => x.completa), p.id).toBe(true); expect(progreso(fin)).toBe(1) }
    }
    expect(fallas).toEqual([])
  })

  it('la prueba pide tiempo y, si el robot tiene motores, que se mueva', () => {
    const robot = crearMision(PREARMADOS.find(p => p.id === 'seguidor')!)
    expect(pruebaCumplida(robot, 20, 0)).toBe(false)
    expect(pruebaCumplida(robot, 3, 1)).toBe(false)
    expect(pruebaCumplida(robot, 9, 0.3)).toBe(true)
    const circuito = crearMision(PREARMADOS.find(p => (p.categoria ?? 'robot') === 'electronica')!)
    expect(pruebaCumplida(circuito, 9, 0)).toBe(true)
  })
})
