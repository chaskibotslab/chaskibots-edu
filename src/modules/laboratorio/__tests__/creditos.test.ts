import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { LISTA_PIEZAS } from '../catalogo/piezas'
import { CREDITOS_MODELOS } from '../catalogo/creditosModelos'

// Solo usamos diseños gratis con licencia libre (CC0, CC BY, CC BY-SA), y CC BY
// pide mostrar el crédito: cada modelo real necesita autor, licencia y fuente.
describe('créditos de los modelos 3D', () => {
  const publicos = fs.readdirSync(path.resolve('public', 'lab', 'modelos')).filter(f => f.endsWith('.glb'))

  it('cada modelo publicado y cada modelo del catálogo tiene su crédito', () => {
    const usados = LISTA_PIEZAS.filter(p => p.glb).map(p => path.basename(p.glb!))
    for (const f of [...publicos, ...usados]) expect(CREDITOS_MODELOS[f], f).toBeTruthy()
  })

  it('todas las licencias son libres (sin NC ni ND) y la fuente es pública', () => {
    for (const [f, c] of Object.entries(CREDITOS_MODELOS)) {
      expect(c.licencia, f).toMatch(/^(CC-BY-4\.0|CC-BY-SA-4\.0|CC0)/)
      expect(c.autor && c.fuente.startsWith('https://sketchfab.com/'), f).toBe(true)
    }
  })
})
