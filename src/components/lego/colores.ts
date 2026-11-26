/** Paleta de colores del tapete (nombre → RGB) para el sensor de color. */
export const PALETA: Record<string, [number, number, number]> = {
  negro: [17, 17, 17],
  blanco: [245, 245, 245],
  rojo: [226, 59, 59],
  azul: [59, 111, 226],
  verde: [47, 170, 74],
  amarillo: [245, 208, 32],
}

export const CSS: Record<string, string> = {
  negro: '#111111', blanco: '#f5f5f5', rojo: '#e23b3b',
  azul: '#3b6fe2', verde: '#2faa4a', amarillo: '#f5d020',
}

/** Devuelve el nombre de color de la paleta más cercano a un RGB muestreado. */
export function colorMasCercano(r: number, g: number, b: number): string {
  let mejor = 'blanco'
  let dMin = Infinity
  for (const [nombre, [pr, pg, pb]] of Object.entries(PALETA)) {
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    if (d < dMin) { dMin = d; mejor = nombre }
  }
  return mejor
}
