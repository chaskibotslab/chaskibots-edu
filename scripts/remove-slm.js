/**
 * Retira de la plataforma lo de la U.E. Santa Luisa de Marillac (SLM), a pedido
 * del dueño de la plataforma: sus niveles propios, sus grupos, sus lecciones y el colegio.
 * Por defecto solo simula; con --apply ejecuta.
 *
 *  - Guarda antes una copia de todo lo afectado en backups/ (carpeta local, fuera de git).
 *  - Las cuentas de usuario NO se borran: se desactivan y se desvinculan del colegio.
 *  - No toca niveles compartidos con otros colegios (ej. primero-bach, decimo-egb).
 *  - Si encuentra tareas, entregas, notas o kits enlazados, se detiene sin cambiar nada.
 */
const fs = require('fs')
const path = require('path')

const APPLY = process.argv.includes('--apply')
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)
const base = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' }
const get = async (t, q = 'select=*') => { const r = await fetch(`${base}${t}?${q}&limit=5000`, { headers }); const j = await r.json(); if (!Array.isArray(j)) throw new Error(`${t}: ${JSON.stringify(j).slice(0, 200)}`); return j }
const inList = ids => `in.(${ids.map(i => `"${i}"`).join(',')})`
const run = async (method, t, q, body) => {
  const r = await fetch(`${base}${t}?${q}`, { method, headers: { ...headers, Prefer: 'return=minimal' }, body: body ? JSON.stringify(body) : undefined })
  if (!r.ok) throw new Error(`${method} ${t}: ${r.status} ${(await r.text()).slice(0, 300)}`)
}

;(async () => {
  const school = (await get('schools')).find(s => /marillac/i.test(s.name))
  const levels = (await get('levels')).filter(l => /slm/i.test(l.id))
  const levelIds = levels.map(l => l.id)
  const groups = (await get('courses_catalog')).filter(g => (school && g.school_id === school.id) || levelIds.includes(g.level_id))
  const groupIds = groups.map(g => g.id)
  const mine = r => levelIds.includes(r.level_id) || (school && r.school_id === school.id) || groupIds.includes(r.course_id)

  const afectado = { school, levels, groups }
  for (const t of ['lessons', 'students', 'users', 'tasks', 'submissions', 'grades', 'year_plans', 'kits', 'teacher_courses', 'modules', 'simulator_challenges']) {
    afectado[t] = (await get(t)).filter(mine)
  }
  console.log('colegio:', school ? school.name : '(ya no existe)')
  for (const [k, v] of Object.entries(afectado)) if (Array.isArray(v) && v.length) console.log(' ', k.padEnd(20), v.length)

  const delicado = ['tasks', 'submissions', 'grades', 'kits'].filter(t => afectado[t].length > 0)
  if (delicado.length) { console.log('\nSE DETIENE: hay datos de trabajo enlazados a SLM en:', delicado.join(', ')); return }

  if (!APPLY) { console.log('\nSIMULACIÓN: no se cambió nada. Ejecuta con --apply.'); return }

  const dir = path.join(__dirname, '..', 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `slm-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(file, JSON.stringify(afectado))
  console.log('\nrespaldo:', file)

  for (const u of afectado.users) {
    const patch = { is_active: false }
    if (school && u.school_id === school.id) { patch.school_id = null; patch.school_name = null }
    if (levelIds.includes(u.level_id)) patch.level_id = null
    if (groupIds.includes(u.course_id)) { patch.course_id = null; patch.course_name = null }
    await run('PATCH', 'users', `id=eq.${u.id}`, patch)
  }
  const borrar = async (t, rows) => { if (rows.length) await run('DELETE', t, `id=${inList(rows.map(x => x.id))}`) }
  await borrar('teacher_courses', afectado.teacher_courses)
  await borrar('students', afectado.students)
  await borrar('lessons', afectado.lessons)
  await borrar('year_plans', afectado.year_plans)
  await borrar('modules', afectado.modules)
  await borrar('simulator_challenges', afectado.simulator_challenges)
  await borrar('courses_catalog', groups)
  await borrar('levels', levels)
  if (school) await run('DELETE', 'schools', `id=eq.${encodeURIComponent(school.id)}`)
  console.log('listo: SLM retirado')
})().catch(e => { console.error(e.message); process.exit(1) })
