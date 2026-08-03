/**
 * Fix RLS Security - Quick script using Supabase REST API
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load env
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
let supabaseUrl = '', supabaseKey = ''
envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim()
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=').slice(1).join('=').trim()
})

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// All the RLS SQL statements to execute one by one
const statements = [
  // Enable RLS on all tables
  `ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS levels ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS programs ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS schools ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS submissions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS lessons ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS grades ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS kits ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS courses_catalog ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS school_courses ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS teacher_courses ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS blockly_projects ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS ai_activities ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS experiencias ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS virtual_files ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS simulators ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS simulator_challenges ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS simulator_courses ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS simulator_modules ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS simulator_lessons ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS simulator_progress ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS year_plans ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY`,

  // Policies for levels
  `CREATE POLICY IF NOT EXISTS "anon_read_levels" ON levels FOR SELECT USING (true)`,
  // Policies for programs
  `CREATE POLICY IF NOT EXISTS "anon_read_programs" ON programs FOR SELECT USING (true)`,
  // Policies for schools
  `CREATE POLICY IF NOT EXISTS "anon_read_schools" ON schools FOR SELECT USING (true)`,
  // Policies for tasks
  `CREATE POLICY IF NOT EXISTS "anon_read_tasks" ON tasks FOR SELECT USING (true)`,
  // Policies for submissions
  `CREATE POLICY IF NOT EXISTS "anon_read_submissions" ON submissions FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_insert_submissions" ON submissions FOR INSERT WITH CHECK (true)`,
  // Policies for lessons
  `CREATE POLICY IF NOT EXISTS "anon_read_lessons" ON lessons FOR SELECT USING (true)`,
  // Policies for grades
  `CREATE POLICY IF NOT EXISTS "anon_read_grades" ON grades FOR SELECT USING (true)`,
  // Policies for documents
  `CREATE POLICY IF NOT EXISTS "anon_read_documents" ON documents FOR SELECT USING (true)`,
  // Policies for kits
  `CREATE POLICY IF NOT EXISTS "anon_read_kits" ON kits FOR SELECT USING (true)`,
  // Policies for courses
  `CREATE POLICY IF NOT EXISTS "anon_read_courses" ON courses FOR SELECT USING (true)`,
  // Policies for courses_catalog
  `CREATE POLICY IF NOT EXISTS "anon_read_courses_catalog" ON courses_catalog FOR SELECT USING (true)`,
  // Policies for school_courses
  `CREATE POLICY IF NOT EXISTS "anon_read_school_courses" ON school_courses FOR SELECT USING (true)`,
  // Policies for teacher_courses
  `CREATE POLICY IF NOT EXISTS "anon_read_teacher_courses" ON teacher_courses FOR SELECT USING (true)`,
  // Policies for projects
  `CREATE POLICY IF NOT EXISTS "anon_read_projects" ON projects FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_insert_projects" ON projects FOR INSERT WITH CHECK (true)`,
  // Policies for blockly_projects
  `CREATE POLICY IF NOT EXISTS "anon_read_blockly_projects" ON blockly_projects FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_insert_blockly_projects" ON blockly_projects FOR INSERT WITH CHECK (true)`,
  // Policies for ai_activities
  `CREATE POLICY IF NOT EXISTS "anon_read_ai_activities" ON ai_activities FOR SELECT USING (true)`,
  // Policies for experiencias
  `CREATE POLICY IF NOT EXISTS "anon_read_experiencias" ON experiencias FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_insert_experiencias" ON experiencias FOR INSERT WITH CHECK (true)`,
  // Policies for virtual_files
  `CREATE POLICY IF NOT EXISTS "anon_read_virtual_files" ON virtual_files FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_insert_virtual_files" ON virtual_files FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_update_virtual_files" ON virtual_files FOR UPDATE USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_delete_virtual_files" ON virtual_files FOR DELETE USING (true)`,
  // Policies for simulators
  `CREATE POLICY IF NOT EXISTS "anon_read_simulators" ON simulators FOR SELECT USING (true)`,
  // Policies for simulator_challenges
  `CREATE POLICY IF NOT EXISTS "anon_read_simulator_challenges" ON simulator_challenges FOR SELECT USING (true)`,
  // Policies for simulator_courses
  `CREATE POLICY IF NOT EXISTS "anon_read_sim_courses" ON simulator_courses FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_read_sim_modules" ON simulator_modules FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_read_sim_lessons" ON simulator_lessons FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_rw_sim_progress" ON simulator_progress FOR SELECT USING (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_insert_sim_progress" ON simulator_progress FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_update_sim_progress" ON simulator_progress FOR UPDATE USING (true)`,
  // Policies for year_plans
  `CREATE POLICY IF NOT EXISTS "anon_read_year_plans" ON year_plans FOR SELECT USING (true)`,
  // Policies for students
  `CREATE POLICY IF NOT EXISTS "anon_read_students" ON students FOR SELECT USING (true)`,
]

async function main() {
  console.log('🔒 SECURITY FIX: Enable RLS on all tables')
  console.log('==========================================\n')

  let ok = 0, skip = 0, fail = 0

  for (const sql of statements) {
    const short = sql.substring(0, 70)
    try {
      const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ sql_text: sql }),
        signal: AbortSignal.timeout(8000),
      })

      if (resp.ok) {
        ok++
        console.log(`  ✅ ${short}`)
      } else {
        const body = await resp.text()
        if (body.includes('already exists') || body.includes('duplicate')) {
          skip++
          console.log(`  ⏭️  ${short} (ya existe)`)
        } else if (body.includes('does not exist') || body.includes('relation') ) {
          skip++
          console.log(`  ⏭️  ${short} (tabla no existe, skip)`)
        } else {
          fail++
          console.log(`  ❌ ${short}`)
          console.log(`     ${body.substring(0, 120)}`)
        }
      }
    } catch (err) {
      fail++
      console.log(`  ❌ ${short} - ${err.message}`)
    }
  }

  console.log(`\n==========================================`)
  console.log(`✅ Exitosos: ${ok}`)
  console.log(`⏭️  Omitidos: ${skip}`)
  console.log(`❌ Fallidos: ${fail}`)

  if (fail > 0 && ok === 0) {
    console.log(`\n⚠️  La función exec_sql no existe en tu DB.`)
    console.log(`   Necesitas ejecutar el SQL manualmente en Supabase SQL Editor.`)
    console.log(`   Archivo: supabase/migrations/2026_enable_rls_all_tables.sql\n`)
    console.log(`   O primero crea la función con este SQL en el editor:\n`)
    console.log(`CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)`)
    console.log(`RETURNS VOID AS $$ BEGIN EXECUTE sql_text; END; $$ LANGUAGE plpgsql SECURITY DEFINER;`)
  }

  // Quick verification
  console.log('\n🔍 Verificando acceso...')
  const tables = ['levels', 'programs', 'tasks']
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(1)
    console.log(`  ${t}: ${error ? '❌ ' + error.message : '✅ OK (' + (data?.length || 0) + ' rows)'}`)
  }

  console.log('\n✅ Script completado.')
  process.exit(0)
}

main().catch(err => {
  console.error('❌', err.message)
  process.exit(1)
})
