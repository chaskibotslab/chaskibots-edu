// Guía de una lección práctica: el mismo método de 6 etapas para todos
// los cursos. Se guarda como JSON en kit_proyectos.guia.
//
//   1. reto      — qué vamos a construir y para qué sirve
//   2. piezas    — cada componente, qué hace y qué cuidado tiene
//   3. pasos     — armado, un cable por paso (resalta ese cable en el diagrama)
//   4. codigo    — el programa explicado por partes
//   5. prueba    — qué debe pasar y qué revisar si no funciona
//   6. demuestra — reto extra y preguntas rápidas

export interface GuiaPaso {
  titulo: string
  texto: string
  /** Índices de la tabla de conexiones que se arman en este paso. */
  conexiones?: number[]
  /** Líneas de alimentación de la protoboard que se arman en este paso ("5V", "GND"). */
  rieles?: string[]
  consejo?: string
  fotoUrl?: string
}

export interface GuiaPregunta {
  pregunta: string
  opciones: string[]
  correcta: number
  explicacion: string
}

export interface KitGuia {
  reto: { texto: string; paraQue?: string; duracion?: string; fotoUrl?: string; videoUrl?: string }
  piezas: { nombre: string; paraQue: string; cuidado?: string; fotoUrl?: string }[]
  pasos: GuiaPaso[]
  codigo: { titulo: string; texto: string; fragmento?: string }[]
  prueba: { queDebePasar: string[]; siNoFunciona: { problema: string; revisa: string }[] }
  demuestra: { reto: string; preguntas: GuiaPregunta[] }
}

export function guiaVacia(): KitGuia {
  return {
    reto: { texto: '' },
    piezas: [],
    pasos: [],
    codigo: [],
    prueba: { queDebePasar: [], siNoFunciona: [] },
    demuestra: { reto: '', preguntas: [] },
  }
}

// Acepta solo guías con la forma mínima esperada; cualquier otra cosa se ignora
// y la lección se muestra en el formato simple.
export function parseGuia(raw: unknown): KitGuia | null {
  const g = raw as Partial<KitGuia> | null
  if (!g || typeof g !== 'object' || !g.reto || typeof g.reto.texto !== 'string' || !Array.isArray(g.pasos)) return null
  return {
    reto: g.reto,
    piezas: Array.isArray(g.piezas) ? g.piezas : [],
    pasos: g.pasos,
    codigo: Array.isArray(g.codigo) ? g.codigo : [],
    prueba: {
      queDebePasar: Array.isArray(g.prueba?.queDebePasar) ? g.prueba!.queDebePasar : [],
      siNoFunciona: Array.isArray(g.prueba?.siNoFunciona) ? g.prueba!.siNoFunciona : [],
    },
    demuestra: {
      reto: g.demuestra?.reto || '',
      preguntas: Array.isArray(g.demuestra?.preguntas) ? g.demuestra!.preguntas : [],
    },
  }
}

// Convierte un enlace de YouTube o Drive en uno que se puede incrustar.
export function embedUrl(url: string): string | null {
  const u = url.trim()
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const drive = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/)
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`
  return null
}
