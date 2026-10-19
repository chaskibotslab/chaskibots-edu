// Grupos de la Academia Lizardo Villamarín para Inicial 1 → 7mo EGB (sus kits
// existían pero sin grupo, así que no se podía inscribir ni asignar a nadie) y
// reubica a las personas de la Academia que estaban en un grupo de otro colegio
// o en uno que ya no existe.
//
//   node --env-file=.env.local scripts/estructura-lv-grupos.js           (solo muestra)
//   node --env-file=.env.local scripts/estructura-lv-grupos.js --apply   (guarda, con copia en backups/)

const fs = require('fs')
const path = require('path')

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APPLY = process.argv.includes('--apply')
const SCHOOL_ID = 'school-amclav-mkr7awl9'
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const NUEVOS = [
  ['inicial-1', 'Inicial 1 Academia'],
  ['inicial-2', 'Inicial 2 Academia'],
  ['primero-egb', '1ro EGB Academia'],
  ['segundo-egb', '2do EGB Academia'],
  ['tercero-egb', '3ro EGB Academia'],
  ['cuarto-egb', '4to EGB Academia'],
  ['quinto-egb', '5to EGB Academia'],
  ['sexto-egb', '6to EGB Academia'],
  ['septimo-egb', '7mo EGB Academia'],
]

async function rest(method, pathname, body) {
  const res = await fetch(`${URL}/rest/v1/${pathname}`, {
    method,
    headers: { ...headers, Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${pathname}: ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}

async function main() {
  const [school] = await rest('GET', `schools?select=id,name&id=eq.${SCHOOL_ID}`)
  if (!school) throw new Error('No existe el colegio de la Academia')
  const groups = await rest('GET', 'courses_catalog?select=*')
  const users = await rest('GET', `users?select=id,name,role,course_id,course_name,level_id,school_id,school_name&school_id=eq.${SCHOOL_ID}`)
  const assignments = await rest('GET', 'teacher_courses?select=*')

  const groupById = new Map(groups.map(g => [g.id, g]))
  const lvGroupFor = level => groups.find(g => g.school_id === SCHOOL_ID && g.level_id === level)?.id || `grupo-lv-${level}`

  const toCreate = NUEVOS
    .filter(([level]) => !groups.some(g => g.school_id === SCHOOL_ID && g.level_id === level))
    .map(([level, name]) => ({
      id: `grupo-lv-${level}`,
      name,
      level_id: level,
      school_id: SCHOOL_ID,
      school_name: school.name,
      max_students: 30,
      current_students: 0,
      is_active: true,
      program_ids: ['robotica'],
    }))

  // Persona de la Academia cuyo grupo no existe o es de otro colegio.
  const misplaced = users.filter(u => {
    if (u.role !== 'student' && u.role !== 'teacher') return false
    const g = groupById.get(u.course_id)
    return !g || g.school_id !== SCHOOL_ID
  })
  const userMoves = misplaced.map(u => {
    const target = lvGroupFor(u.level_id)
    const name = groupById.get(target)?.name || NUEVOS.find(([l]) => l === u.level_id)?.[1]
    return { user: u, target, name }
  }).filter(m => m.name)

  const lvTeacherIds = new Set(users.filter(u => u.role === 'teacher').map(u => u.id))
  const assignMoves = assignments
    .filter(a => lvTeacherIds.has(a.teacher_id) && groupById.get(a.course_id)?.school_id !== SCHOOL_ID)
    .map(a => ({ a, target: lvGroupFor(a.level_id) }))
    .filter(m => !assignments.some(x => x.teacher_id === m.a.teacher_id && x.course_id === m.target))

  console.log(`Grupos nuevos (${toCreate.length}):`)
  toCreate.forEach(g => console.log(`  + ${g.id}  ${g.name}`))
  console.log(`Personas reubicadas (${userMoves.length}):`)
  userMoves.forEach(m => console.log(`  ${m.user.name.trim()} (${m.user.role}): ${m.user.course_id} → ${m.target}`))
  console.log(`Asignaciones de docente reubicadas (${assignMoves.length}):`)
  assignMoves.forEach(m => console.log(`  ${m.a.teacher_name}: ${m.a.course_id} → ${m.target}`))

  if (!APPLY) return console.log('\nSolo vista previa. Usa --apply para guardar.')

  const dir = path.join(__dirname, '..', 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `estructura-lv-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(file, JSON.stringify({ users: misplaced, assignments: assignMoves.map(m => m.a) }, null, 2))
  console.log(`\nCopia: ${file}`)

  if (toCreate.length) await rest('POST', 'courses_catalog', toCreate)
  for (const m of userMoves) {
    await rest('PATCH', `users?id=eq.${m.user.id}`, {
      course_id: m.target,
      course_name: m.name,
      school_name: school.name,
    })
  }
  for (const m of assignMoves) {
    const g = groupById.get(m.target) || toCreate.find(x => x.id === m.target)
    await rest('PATCH', `teacher_courses?id=eq.${m.a.id}`, {
      course_id: m.target,
      course_name: g.name,
      school_id: SCHOOL_ID,
      school_name: school.name,
    })
  }
  console.log('Listo.')
}

main().catch(err => { console.error(err.message); process.exit(1) })
