/**
 * COPOL — tareas a partir del Plan del Año (src/data/planAnual): una tarea por clase,
 * solo para school-copol y el grado de cada curso.
 *
 *   - Título «Clase 05 · <título de la clase>», descripción con objetivo, con qué se trabaja y qué se revisa.
 *   - Quedan activas las 12 del Trimestre 1; las de los trimestres 2 y 3 se crean desactivadas
 *     para que el docente las active al avanzar (Gestionar Tareas → ver inactivas).
 *   - Se puede ejecutar más de una vez: no repite las que ya existen (mismo colegio, grado y título).
 *
 * Uso:  node scripts/copol-tareas.mjs          (solo muestra lo que haría)
 *       node scripts/copol-tareas.mjs crear    (las crea)
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/')
const { createClient } = require('@supabase/supabase-js')
const esbuild = require('esbuild')

const SCHOOL = 'school-copol'
const tmp = path.join(os.tmpdir(), `plan-copol-${process.pid}.cjs`)
esbuild.buildSync({ entryPoints: ['src/data/planAnual/index.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: tmp, logLevel: 'silent' })
const { PLANES_ANUALES } = require(tmp)
fs.unlinkSync(tmp)

const PEQUENOS = ['inicial-1', 'inicial-2', 'primero-egb', 'segundo-egb']
const BASICO = [...PEQUENOS, 'tercero-egb']

function categoria(c) {
  const h = c.herramienta
  if (/IA en Vivo|Teachable/.test(h)) return 'ia'
  if (/LEGO|Laboratorio \(robótica/.test(h)) return 'robotica'
  if (/ChaskiBlocks|Scratch|MakeCode|Python|Wokwi/.test(h)) return 'programacion'
  if (c.tipo === 'kit' || /^Kit/.test(h)) return 'electronica'
  return 'general'
}

const base = Date.now()
const filas = []
for (const [kitId, plan] of Object.entries(PLANES_ANUALES)) {
  const levelId = kitId.replace('kit-copol-', '')
  plan.trimestres.forEach((tri, ti) => {
    for (const c of tri.clases) {
      const preguntas = [{ text: 'Sube una foto o una captura de pantalla de tu trabajo.', type: 'upload', options: [] }]
      if (!PEQUENOS.includes(levelId)) preguntas.push({ text: 'Cuenta con tus palabras qué hiciste y qué resultado obtuviste.', type: 'text', options: [] })
      const descripcion = [
        c.objetivo,
        `Con qué se trabaja: ${c.herramienta}`,
        `Qué se revisa: ${c.evidencia}`,
        ...(levelId.startsWith('inicial') ? ['La foto puede subirla el docente o un familiar.'] : []),
      ].join('\n\n')
      filas.push({
        school_id: SCHOOL,
        level_id: levelId,
        title: `Clase ${String(c.n).padStart(2, '0')} · ${c.titulo}`,
        description: descripcion,
        type: c.tipo === 'evaluacion' ? 'quiz' : c.tipo === 'sin-pantalla' ? 'concept' : 'project',
        category: categoria(c),
        difficulty: BASICO.includes(levelId) ? 'basico' : 'intermedio',
        points: c.tipo === 'proyecto' || c.tipo === 'evaluacion' ? 20 : 10,
        is_active: ti === 0,
        questions: preguntas.map(q => JSON.stringify(q)),
        // La lista sale de la más nueva a la más antigua: la clase 1 queda arriba.
        created_at: new Date(base - c.n * 60000).toISOString(),
      })
    }
  })
}

const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]))
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const { data: ya, error } = await db.from('tasks').select('level_id,title').eq('school_id', SCHOOL)
if (error) throw new Error(error.message)
const existe = new Set(ya.map(t => t.level_id + '|' + t.title))
const nuevas = filas.filter(f => !existe.has(f.level_id + '|' + f.title))

const porGrado = {}
for (const f of filas) { const g = (porGrado[f.level_id] ||= { total: 0, activas: 0, nuevas: 0 }); g.total++; if (f.is_active) g.activas++; if (!existe.has(f.level_id + '|' + f.title)) g.nuevas++ }
console.table(porGrado)
console.log('Ejemplo:', JSON.stringify(filas.find(f => f.level_id === 'cuarto-egb' && f.title.startsWith('Clase 16')), null, 1))

if (process.argv[2] === 'crear') {
  for (let i = 0; i < nuevas.length; i += 100) {
    const { error: e } = await db.from('tasks').insert(nuevas.slice(i, i + 100))
    if (e) throw new Error(e.message)
  }
  console.log(`Creadas ${nuevas.length} tareas.`)
} else {
  console.log(`Se crearían ${nuevas.length} tareas. Ejecuta con «crear» para crearlas.`)
}
