import { pieza } from '../catalogo/piezas'
import { reemplazar } from '../engine/ensamblaje'
import type { RobotDoc } from '../robots/doc'

/** El mismo robot con otra placa. */
export function conPlacaDe(doc: RobotDoc, placa: string): RobotDoc {
  const mcu = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'mcu')!
  return mcu.pieza === placa ? doc : reemplazar(doc, mcu.id, placa).doc
}
