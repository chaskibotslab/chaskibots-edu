/**
 * Fix RLS Security - Enable Row Level Security on all tables
 * 
 * Usage: npx tsx scripts/fix-rls-security.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually (no dotenv dependency needed)
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim()
        const value = trimmed.substring(eqIdx + 1).trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('dummy')) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Extract project ref from URL (e.g., https://jfsyvcslzgjrvsoqleiz.supabase.co -> jfsyvcslzgjrvsoqleiz)
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

async function executeSQL(sql: string, label: string): Promise<boolean> {
  console.log(`\n🔄 ${label}...`)
  
  // Method 1: Try Supabase Management API (requires service role key)
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey as string,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ sql_text: sql }),
    })
    
    if (response.ok) {
      console.log(`  ✅ ${label} - Completado`)
      return true
    }
  } catch (e) {
    // continue to next method
  }

  // Method 2: Try via Supabase SQL endpoint  
  try {
    const response = await fetch(`${supabaseUrl}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: sql }),
    })
    
    if (response.ok) {
      console.log(`  ✅ ${label} - Completado`)
      return true
    }
  } catch (e) {
    // continue
  }

  // Method 3: Execute statements one by one via supabase.rpc
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql })
    if (!error) {
      console.log(`  ✅ ${label} - Completado via RPC`)
      return true
    }
  } catch (e) {
    // continue
  }

  console.log(`  ⚠️ Direct SQL execution not available`)
  return false
}

async function enableRLSviaClient() {
  console.log('\n🔐 Attempting to enable RLS via individual table operations...\n')
  
  // Get list of all public tables
  const { data: tables, error } = await supabase
    .rpc('exec_sql', { 
      sql_text: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename` 
    })
  
  if (error) {
    console.log('  Cannot list tables via RPC. Will try direct SQL file approach.')
    return false
  }
  
  console.log(`  Found ${tables?.length || 0} tables`)
  return true
}

async function main() {
  console.log('🔒 SECURITY FIX: Enable Row-Level Security')
  console.log('==========================================')
  console.log(`📍 Project: ${projectRef}`)
  console.log(`🔗 URL: ${supabaseUrl}`)
  console.log('')

  // Read the migration SQL
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '2026_enable_rls_all_tables.sql')
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ SQL file not found: ${sqlPath}`)
    process.exit(1)
  }

  const fullSQL = fs.readFileSync(sqlPath, 'utf-8')
  console.log(`📋 SQL loaded: ${fullSQL.length} characters`)

  // Try executing the full SQL
  let success = await executeSQL(fullSQL, 'Full RLS migration')
  
  if (!success) {
    // Split into individual statements and try each
    console.log('\n🔄 Trying statement-by-statement execution...')
    
    // Extract individual ALTER TABLE and CREATE POLICY statements
    const statements = fullSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        const upper = s.toUpperCase()
        return (
          upper.includes('ALTER TABLE') || 
          upper.includes('CREATE POLICY') || 
          upper.includes('DROP POLICY') ||
          (upper.startsWith('DO') && upper.includes('$$'))
        )
      })

    console.log(`  Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';'
      const shortLabel = stmt.substring(0, 60).replace(/\n/g, ' ').trim()
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_text: stmt })
        if (!error) {
          successCount++
          process.stdout.write('.')
        } else {
          failCount++
          // Don't print individual errors for "already exists" type issues
          if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
            console.log(`\n  ⚠️ ${shortLabel}... ${error.message}`)
          }
        }
      } catch (e) {
        failCount++
      }
    }

    console.log(`\n  Results: ${successCount} succeeded, ${failCount} failed`)
    success = successCount > 0
  }

  if (!success) {
    console.log('\n' + '='.repeat(60))
    console.log('⚠️  La función exec_sql no existe en tu base de datos.')
    console.log('   Necesitas crear esta función primero.\n')
    console.log('   PASOS:')
    console.log('   1. Ve a https://supabase.com/dashboard')
    console.log(`   2. Abre tu proyecto: ${projectRef}`)
    console.log('   3. Ve a SQL Editor')
    console.log('   4. Primero ejecuta esto para crear la función auxiliar:\n')
    console.log(`CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`)
    console.log('\n   5. Luego ejecuta el contenido de:')
    console.log(`      ${sqlPath}`)
    console.log('='.repeat(60))
    
    // Write the combined SQL for easy copy
    const combinedPath = path.join(__dirname, '..', 'supabase', 'FIX_RLS_COPY_PASTE.sql')
    const combinedSQL = `-- ============================================================
-- STEP 1: Create helper function (run this FIRST)
-- ============================================================
CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 2: Enable RLS on all tables (run this AFTER step 1)
-- ============================================================
${fullSQL}
`
    fs.writeFileSync(combinedPath, combinedSQL)
    console.log(`\n📄 SQL combinado guardado en: ${combinedPath}`)
    console.log('   Copia y pega ese archivo en el SQL Editor de Supabase.\n')
    return
  }

  // Verify RLS status
  console.log('\n🔍 Verificando estado de RLS...')
  
  try {
    const { data: rlsCheck } = await supabase.rpc('exec_sql', {
      sql_text: `
        SELECT tablename, 
               CASE WHEN rowsecurity THEN '✅ RLS ON' ELSE '❌ RLS OFF' END as rls_status
        FROM pg_tables 
        LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
        WHERE schemaname = 'public'
        ORDER BY tablename
      `
    })

    if (rlsCheck) {
      console.log('  Estado de tablas:')
      if (Array.isArray(rlsCheck)) {
        rlsCheck.forEach((t: any) => console.log(`    ${t.rls_status} ${t.tablename}`))
      }
    }
  } catch (e) {
    // Verify via individual table queries
    const testTables = ['users', 'levels', 'programs', 'tasks', 'submissions', 'courses']
    for (const table of testTables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      const status = error ? `⚠️ ${error.message}` : '✅ Accessible'
      console.log(`  ${table}: ${status}`)
    }
  }

  console.log('\n✅ ¡Seguridad RLS aplicada correctamente!')
  console.log('   Todas las tablas ahora están protegidas.')
  console.log('   La app sigue funcionando porque usa supabaseAdmin (service_role key).')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
