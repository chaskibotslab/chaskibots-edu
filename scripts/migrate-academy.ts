/**
 * Run this script to create the academy tables and seed data in Supabase.
 * 
 * Usage:
 *   npx tsx scripts/migrate-academy.ts
 * 
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * 
 * Or pass them inline:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/migrate-academy.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('dummy')) {
  console.error('❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runSQL(sql: string, label: string) {
  console.log(`\n🔄 Running: ${label}...`)
  const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql })
  if (error) {
    // Try alternative: direct REST API
    console.log('  Trying direct approach...')
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey as string,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ sql_text: sql }),
    })
    if (!response.ok) {
      console.error(`  ⚠️ RPC not available. Please run the SQL manually in Supabase SQL Editor.`)
      return false
    }
  }
  console.log(`  ✅ ${label} completed`)
  return true
}

async function main() {
  console.log('🚀 Academy Migration Script')
  console.log('==========================')

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '2026_simulator_academy.sql')
  const seedPath = path.join(__dirname, '..', 'supabase', 'seeds', 'seed_simulator_academy.sql')

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  const seedSQL = fs.readFileSync(seedPath, 'utf-8')

  console.log('\n📋 Migration SQL loaded:', migrationSQL.length, 'chars')
  console.log('📋 Seed SQL loaded:', seedSQL.length, 'chars')

  const migOk = await runSQL(migrationSQL, 'Migration (create tables)')
  const seedOk = await runSQL(seedSQL, 'Seed (insert data)')

  if (!migOk || !seedOk) {
    console.log('\n⚠️  Automatic execution failed.')
    console.log('Please run these SQL files manually in your Supabase SQL Editor:')
    console.log(`  1. ${migrationPath}`)
    console.log(`  2. ${seedPath}`)
  }

  // Verify
  console.log('\n🔍 Verifying...')
  const { data: courses, error: courseErr } = await supabase
    .from('simulator_courses')
    .select('slug, title, total_modules, total_lessons')

  if (courseErr) {
    console.log('  ⚠️ Could not verify - tables may not exist yet. Run SQL manually.')
  } else {
    console.log(`  ✅ Found ${courses?.length} courses:`)
    courses?.forEach(c => console.log(`     - ${c.title} (${c.total_modules} modules, ${c.total_lessons} lessons)`))
  }

  const { data: modules } = await supabase
    .from('simulator_modules')
    .select('title, course:simulator_courses(title)')
  
  if (modules) {
    console.log(`  ✅ Found ${modules.length} modules`)
  }

  const { data: lessons } = await supabase
    .from('simulator_lessons')
    .select('title')
  
  if (lessons) {
    console.log(`  ✅ Found ${lessons.length} lessons`)
  }

  console.log('\n✅ Done!')
}

main().catch(console.error)
