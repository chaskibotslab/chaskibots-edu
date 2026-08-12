/**
 * Backfill de la tabla `grades` a partir de las entregas (`submissions`)
 * que ya fueron calificadas por un profesor/admin, pero que nunca se
 * sincronizaron a `grades` porque las columnas lesson_id/task_id eran
 * UUID y la app guarda ids tipo "PY-XXXX" / "sim-XXXX" (ver migración
 * 2026_fix_grades_id_types.sql).
 *
 * Ejecutar DESPUÉS de aplicar esa migración:
 *   node scripts/backfill-grades-from-submissions.js
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const env = {}
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split(/\r?\n/).forEach(line => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  })

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', 'graded')
    .not('grade', 'is', null)

  if (error) {
    console.error('Error leyendo submissions:', error.message)
    process.exit(1)
  }

  console.log(`Encontradas ${submissions.length} entregas calificadas.`)

  let inserted = 0
  let skipped = 0
  for (const s of submissions) {
    // Evitar duplicados si se corre este script más de una vez
    const { data: existing } = await supabase
      .from('grades')
      .select('id')
      .eq('task_id', s.task_id)
      .eq('student_name', s.student_name)
      .limit(1)

    if (existing && existing.length > 0) {
      skipped++
      continue
    }

    const { error: insertError } = await supabase.from('grades').insert({
      student_name: s.student_name,
      student_id: null,
      lesson_id: s.lesson_id || s.task_id,
      level_id: s.level_id,
      course_id: s.course_id,
      school_id: s.school_id,
      task_id: s.task_id,
      score: s.grade,
      feedback: s.feedback,
      graded_by: s.graded_by,
      submitted_at: s.submitted_at,
      graded_at: s.graded_at || s.submitted_at,
    })

    if (insertError) {
      console.error(`  ERROR insertando grade para ${s.student_name} / ${s.task_id}:`, insertError.message)
    } else {
      inserted++
      console.log(`  OK: ${s.student_name} - ${s.task_id} - nota ${s.grade}`)
    }
  }

  console.log(`\nListo. Insertadas: ${inserted}, ya existían: ${skipped}`)
}

main().catch(e => { console.error(e); process.exit(1) })
