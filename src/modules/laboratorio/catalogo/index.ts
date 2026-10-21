// Catálogo de componentes del laboratorio.
//
// Cada componente es un JSON con { id, modelo3D, pines, comportamiento }.
// Para agregar uno nuevo: crear su JSON en esta carpeta y sumarlo a la lista
// de abajo. El motor de simulación decide qué hacer según
// `comportamiento.tipo` (ver engine/netlist.ts y engine/simulation.ts); no hay
// que tocar el motor salvo que el tipo de comportamiento sea totalmente nuevo.

import arduinoUno from './arduino-uno.json'
import l298n from './l298n.json'
import motorTT from './motor-tt.json'
import rueda65 from './rueda-65.json'
import ruedaLoca from './rueda-loca.json'
import tcrt5000 from './tcrt5000.json'
import bateria from './bateria-2x18650.json'
import chasis from './chasis-2wd.json'

export type TipoPin = 'digital' | 'analogico' | 'pwm' | 'i2c' | 'alim' | 'potencia'

export interface PinDef {
  nombre: string
  tipo: TipoPin | string
}

export interface ComponenteDef {
  id: string
  nombre: string
  categoria: string
  /** "proc:<nombre>" = modelo 3D generado por código; en F3 también URLs .glb/.stl/.obj */
  modelo3D: string
  masa_g: number
  dimensiones_mm: number[]
  pines: PinDef[]
  comportamiento: { tipo: string; [k: string]: unknown }
}

export const CATALOGO: Record<string, ComponenteDef> = Object.fromEntries(
  [arduinoUno, l298n, motorTT, rueda65, ruedaLoca, tcrt5000, bateria, chasis].map(c => [c.id, c as ComponenteDef]),
)

export function componente(id: string): ComponenteDef {
  const c = CATALOGO[id]
  if (!c) throw new Error(`Componente desconocido en el catálogo: ${id}`)
  return c
}
