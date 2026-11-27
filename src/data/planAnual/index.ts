import type { PlanAnual } from './tipos'
import { INICIAL_1, INICIAL_2 } from './inicial'
import { PRIMERO, SEGUNDO, TERCERO } from './elemental'
import { CUARTO, QUINTO } from './media45'
import { SEXTO, SEPTIMO } from './media67'

export type { PlanAnual, ClasePlan, TrimestrePlan, TipoClase } from './tipos'

/** Plan del año por kit de Academia. */
export const PLANES_ANUALES: Record<string, PlanAnual> = {
  'kit-copol-inicial-1': INICIAL_1,
  'kit-copol-inicial-2': INICIAL_2,
  'kit-copol-primero-egb': PRIMERO,
  'kit-copol-segundo-egb': SEGUNDO,
  'kit-copol-tercero-egb': TERCERO,
  'kit-copol-cuarto-egb': CUARTO,
  'kit-copol-quinto-egb': QUINTO,
  'kit-copol-sexto-egb': SEXTO,
  'kit-copol-septimo-egb': SEPTIMO,
}

/** Nombre corto de la herramienta, para el resumen «qué uso y cuándo». */
export function herramientaCorta(herramienta: string): string {
  const partes = herramienta.split(' · ')
  if (herramienta.startsWith('Kit')) return 'Kit del curso (pestaña Lecciones)'
  if (herramienta.startsWith('Simuladores')) return (partes[1] || 'Simuladores').replace(' (tipo Scratch)', '')
  if (herramienta.startsWith('Pestaña IA en Vivo')) return `IA en Vivo · ${partes[1] || ''}`
  if (herramienta.startsWith('Menú Laboratorio')) return 'Laboratorio de robótica 3D'
  return 'Sin pantalla ni kit'
}
