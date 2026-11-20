// Lógica de competencia del torneo, por categoría. Sin dependencias: la usan el servidor y las pantallas.
//
// Cuatro formatos:
//   tiempos  cada robot tiene varios intentos; gana el menor tiempo (seguidores, carreras, trepadores)
//   puntos   igual, pero gana el mayor puntaje (creatividad, innovación)
//   llaves   eliminación directa 1 vs 1 (sumo, batalla)
//   grupos   grupos de 3 o 4 todos contra todos y luego llaves con los clasificados (soccer)

export interface Partido { id: string; a: string | null; b: string | null; ga: number | null; gb: number | null; ganador: string | null }
export interface Llaves { rondas: Partido[][]; tercero: Partido | null }
export interface Grupo { nombre: string; equipos: string[]; partidos: Partido[] }
export type Formato = 'tiempos' | 'puntos' | 'llaves' | 'grupos'
export interface Competencia {
  formato: Formato
  intentos?: number
  marcas?: Record<string, (number | null)[]>
  grupos?: Grupo[]
  llaves?: Llaves | null
}

export type Accion =
  | { tipo: 'crear'; formato: Formato; intentos?: number; tamGrupo?: number; sorteo?: boolean }
  | { tipo: 'borrar' }
  | { tipo: 'marca'; equipoId: string; intento: number; valor: number | null }
  | { tipo: 'partido'; partidoId: string; ga?: number | null; gb?: number | null; ganador?: string | null }
  | { tipo: 'fase_final'; clasifican: number }

export const FORMATO_TEXTO: Record<Formato, string> = { tiempos: 'Tiempos', puntos: 'Puntaje', llaves: 'Llaves 1 vs 1', grupos: 'Grupos y llaves' }

const partido = (id: string, a: string | null = null, b: string | null = null): Partido => ({ id, a, b, ga: null, gb: null, ganador: null })

// ------------------------------------------------------------------ llaves
// Orden de siembra clásico: 1 contra el último, y los primeros solo se cruzan al final.
function siembra(tam: number): number[] {
  let orden = [1, 2]
  while (orden.length < tam) {
    const n = orden.length * 2
    orden = orden.flatMap(s => [s, n + 1 - s])
  }
  return orden
}

export function generarLlaves(ids: string[]): Llaves {
  let tam = 2
  while (tam < ids.length) tam *= 2
  const orden = siembra(tam)
  const rondas: Partido[][] = []
  // Si faltan robots para completar la llave, los primeros pasan directo (su rival queda vacío).
  rondas.push(Array.from({ length: tam / 2 }, (_, i) => partido(`r0p${i}`, ids[orden[2 * i] - 1] ?? null, ids[orden[2 * i + 1] - 1] ?? null)))
  for (let n = tam / 4, r = 1; n >= 1; n /= 2, r++) rondas.push(Array.from({ length: n }, (_, i) => partido(`r${r}p${i}`)))
  const llaves: Llaves = { rondas, tercero: rondas.length >= 2 ? partido('tercero') : null }
  propagar(llaves)
  return llaves
}

const perdedor = (p: Partido) => (p.ganador ? (p.ganador === p.a ? p.b : p.a) : null)

function fijar(p: Partido, a: string | null, b: string | null) {
  if (p.a === a && p.b === b) return
  p.a = a; p.b = b; p.ga = null; p.gb = null; p.ganador = null
}

// Lleva a los ganadores a la ronda siguiente. Si cambia un ganador, se limpia lo que dependía de él.
export function propagar(l: Llaves) {
  for (const p of l.rondas[0]) {
    if ((p.a === null) !== (p.b === null)) { p.ganador = p.a ?? p.b; p.ga = null; p.gb = null }
    else if (p.ganador !== null && p.ganador !== p.a && p.ganador !== p.b) p.ganador = null
  }
  for (let r = 1; r < l.rondas.length; r++) {
    l.rondas[r].forEach((p, i) => fijar(p, l.rondas[r - 1][2 * i].ganador, l.rondas[r - 1][2 * i + 1].ganador))
  }
  if (l.tercero) {
    const [s1, s2] = l.rondas[l.rondas.length - 2]
    fijar(l.tercero, perdedor(s1), perdedor(s2))
    // Con 3 robots una semifinal no se juega: el único perdedor queda tercero.
    const t = l.tercero
    if (s1.ganador && s2.ganador && (t.a === null) !== (t.b === null)) t.ganador = t.a ?? t.b
  }
}

export function nombreRonda(indice: number, total: number): string {
  const faltan = total - 1 - indice
  return faltan === 0 ? 'Final' : faltan === 1 ? 'Semifinal' : faltan === 2 ? 'Cuartos de final' : faltan === 3 ? 'Octavos de final' : `Ronda ${indice + 1}`
}

// ------------------------------------------------------------------ grupos
export function generarGrupos(ids: string[], tam: number): Grupo[] {
  const n = Math.max(1, Math.ceil(ids.length / tam))
  const grupos: Grupo[] = Array.from({ length: n }, (_, i) => ({ nombre: `Grupo ${String.fromCharCode(65 + i)}`, equipos: [], partidos: [] }))
  ids.forEach((id, i) => grupos[i % n].equipos.push(id))
  grupos.forEach((g, gi) => {
    let k = 0
    for (let i = 0; i < g.equipos.length; i++) for (let j = i + 1; j < g.equipos.length; j++) g.partidos.push(partido(`g${gi}p${k++}`, g.equipos[i], g.equipos[j]))
  })
  return grupos
}

export const jugado = (p: Partido) => p.ganador !== null || (p.ga !== null && p.gb !== null)

export interface FilaTabla { id: string; pj: number; g: number; e: number; p: number; gf: number; gc: number; pts: number }

// Tabla de posiciones: 3 puntos por ganar, 1 por empatar. Desempata diferencia de goles y luego goles a favor.
export function tablaGrupo(g: Grupo): FilaTabla[] {
  const filas = new Map(g.equipos.map(id => [id, { id, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 } as FilaTabla]))
  for (const m of g.partidos) {
    const a = m.a && filas.get(m.a), b = m.b && filas.get(m.b)
    if (!a || !b || !jugado(m)) continue
    a.pj++; b.pj++
    a.gf += m.ga ?? 0; a.gc += m.gb ?? 0; b.gf += m.gb ?? 0; b.gc += m.ga ?? 0
    if (m.ganador === null) { a.e++; b.e++; a.pts++; b.pts++ }
    else if (m.ganador === m.a) { a.g++; b.p++; a.pts += 3 }
    else { b.g++; a.p++; b.pts += 3 }
  }
  return [...filas.values()].sort((x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf)
}

// Llaves con los mejores de cada grupo. El primero de un grupo se cruza con el segundo de otro.
function llavesDeGrupos(grupos: Grupo[], clasifican: number): Llaves {
  const tablas = grupos.map(tablaGrupo)
  const primeros = tablas.map(t => t[0]?.id).filter(Boolean) as string[]
  if (clasifican < 2) return generarLlaves(primeros)
  const n = grupos.length
  const segundos: (string | undefined)[] = new Array(n)
  for (let i = 0; i < n; i++) segundos[n - 1 - i] = tablas[(i + 1) % n][1]?.id
  return generarLlaves([...primeros, ...(segundos.filter(Boolean) as string[])])
}

// ------------------------------------------------------------------ tiempos y puntajes
export function mejorMarca(c: Competencia, id: string): number | null {
  const v = (c.marcas?.[id] || []).filter((x): x is number => typeof x === 'number')
  if (!v.length) return null
  return c.formato === 'puntos' ? Math.max(...v) : Math.min(...v)
}

export function clasificacion(c: Competencia, ids: string[]): { id: string; mejor: number | null }[] {
  const signo = c.formato === 'puntos' ? -1 : 1
  return ids.map(id => ({ id, mejor: mejorMarca(c, id) }))
    .sort((x, y) => (x.mejor === null ? 1 : 0) - (y.mejor === null ? 1 : 0) || signo * ((x.mejor ?? 0) - (y.mejor ?? 0)))
}

// Acepta "12.35", "12,35" o "1:05.3" (minutos:segundos). Devuelve segundos, o puntos tal cual.
export function leerMarca(texto: string): number | null | undefined {
  const t = texto.trim().replace(',', '.')
  if (!t) return null
  const m = t.match(/^(?:(\d{1,3}):)?(\d{1,4}(?:\.\d{1,3})?)$/)
  if (!m) return undefined
  const v = (m[1] ? Number(m[1]) * 60 : 0) + Number(m[2])
  return Number.isFinite(v) ? Math.round(v * 1000) / 1000 : undefined
}

export function verMarca(v: number | null | undefined, formato: Formato, unidad = true): string {
  if (v === null || v === undefined) return ''
  if (formato === 'puntos') return String(v)
  if (v < 60) return `${v.toFixed(2)}${unidad ? ' s' : ''}`
  const min = Math.floor(v / 60)
  return `${min}:${(v - min * 60).toFixed(2).padStart(5, '0')}`
}

// ------------------------------------------------------------------ podio
export function podio(c: Competencia, ids: string[]): Record<string, number> | null {
  if (c.formato === 'tiempos' || c.formato === 'puntos') {
    const top = clasificacion(c, ids).filter(x => x.mejor !== null).slice(0, 3)
    return top.length ? Object.fromEntries(top.map((x, i) => [x.id, i + 1])) : null
  }
  const l = c.llaves
  if (!l) {
    // Un solo grupo sin fase final: el podio sale de la tabla.
    if (c.grupos?.length === 1 && c.grupos[0].partidos.every(jugado)) return Object.fromEntries(tablaGrupo(c.grupos[0]).slice(0, 3).map((x, i) => [x.id, i + 1]))
    return null
  }
  const final = l.rondas[l.rondas.length - 1][0]
  if (!final.ganador) return null
  const r: Record<string, number> = { [final.ganador]: 1 }
  const segundo = perdedor(final)
  if (segundo) r[segundo] = 2
  if (l.tercero?.ganador) r[l.tercero.ganador] = 3
  return r
}

// ------------------------------------------------------------------ acciones de los jueces
function barajar<T>(v: T[]): T[] {
  const r = [...v]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}

const entero = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 999 ? v : null)

function buscarPartido(c: Competencia, id: string): { p: Partido; enLlaves: boolean } | null {
  for (const g of c.grupos || []) { const p = g.partidos.find(x => x.id === id); if (p) return { p, enLlaves: false } }
  if (c.llaves) {
    if (c.llaves.tercero?.id === id) return { p: c.llaves.tercero, enLlaves: true }
    for (const r of c.llaves.rondas) { const p = r.find(x => x.id === id); if (p) return { p, enLlaves: true } }
  }
  return null
}

// Aplica una acción y devuelve la competencia nueva (null = sin competencia). Lanza Error con un mensaje para el juez.
export function aplicar(actual: Competencia | null, accion: Accion, ids: string[]): Competencia | null {
  if (accion.tipo === 'borrar') return null
  if (accion.tipo === 'crear') {
    if (accion.formato === 'tiempos' || accion.formato === 'puntos') {
      const intentos = Math.min(6, Math.max(1, Math.round(accion.intentos || 3)))
      return { formato: accion.formato, intentos, marcas: {} }
    }
    if (ids.length < 2) throw new Error('Se necesitan al menos 2 equipos en la categoría.')
    const orden = accion.sorteo === false ? ids : barajar(ids)
    if (accion.formato === 'llaves') return { formato: 'llaves', llaves: generarLlaves(orden) }
    if (accion.formato === 'grupos') {
      if (ids.length < 3) throw new Error('Para grupos se necesitan al menos 3 equipos.')
      return { formato: 'grupos', grupos: generarGrupos(orden, accion.tamGrupo === 3 ? 3 : 4), llaves: null }
    }
    throw new Error('Formato no válido.')
  }
  if (!actual) throw new Error('Esta categoría todavía no tiene competencia.')
  const c: Competencia = JSON.parse(JSON.stringify(actual))

  if (accion.tipo === 'marca') {
    if (c.formato !== 'tiempos' && c.formato !== 'puntos') throw new Error('Esta categoría no es de tiempos.')
    const n = c.intentos || 1
    if (!ids.includes(accion.equipoId) || !Number.isInteger(accion.intento) || accion.intento < 0 || accion.intento >= n) throw new Error('Intento no válido.')
    const valor = accion.valor === null ? null : typeof accion.valor === 'number' && accion.valor >= 0 && accion.valor < 100000 ? accion.valor : undefined
    if (valor === undefined) throw new Error('Valor no válido.')
    const fila = Array.from({ length: n }, (_, i) => c.marcas?.[accion.equipoId]?.[i] ?? null)
    fila[accion.intento] = valor
    c.marcas = { ...(c.marcas || {}), [accion.equipoId]: fila }
    return c
  }

  if (accion.tipo === 'partido') {
    const hallado = buscarPartido(c, accion.partidoId)
    if (!hallado) throw new Error('Ese enfrentamiento ya no existe.')
    const { p, enLlaves } = hallado
    if (!p.a || !p.b) throw new Error('Ese enfrentamiento todavía no tiene a los dos rivales.')
    if ('ga' in accion) p.ga = entero(accion.ga)
    if ('gb' in accion) p.gb = entero(accion.gb)
    if ('ganador' in accion) {
      if (accion.ganador !== null && accion.ganador !== p.a && accion.ganador !== p.b) throw new Error('Ganador no válido.')
      p.ganador = accion.ganador ?? null
    } else if (p.ga !== null && p.gb !== null) {
      // Con marcador, gana quien anotó más. En llaves un empate conserva al ganador que eligió el juez (penales).
      if (p.ga !== p.gb) p.ganador = p.ga > p.gb ? p.a : p.b
      else if (!enLlaves) p.ganador = null
    }
    if (enLlaves && c.llaves) propagar(c.llaves)
    return c
  }

  if (accion.tipo === 'fase_final') {
    if (c.formato !== 'grupos' || !c.grupos?.length) throw new Error('Esta categoría no tiene grupos.')
    const clasifican = accion.clasifican === 1 ? 1 : 2
    const l = llavesDeGrupos(c.grupos, clasifican)
    if (l.rondas[0].length === 1 && !l.rondas[0][0].b) throw new Error('No hay suficientes clasificados para armar llaves.')
    c.llaves = l
    return c
  }
  throw new Error('Acción no válida.')
}
