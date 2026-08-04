/**
 * Seed cad_presets with the 4 models that used to be hardcoded in
 * CADLab/index.tsx (PRESET_MODELS), so they're admin-editable via Supabase
 * without needing a redeploy.
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
let supabaseUrl = '', supabaseKey = ''
envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim()
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=').slice(1).join('=').trim()
})

const supabase = createClient(supabaseUrl, supabaseKey)

const PRESETS = [
  {
    slug: 'brazo-robotico',
    name: 'Brazo Robótico',
    emoji: '🦾',
    description: 'Brazo articulado con 3 segmentos',
    sort_order: 1,
    shapes: [
      { id: 'base', type: 'cylinder', color: '#6366F1', metalness: 0.8, roughness: 0.2, position: [0, -1.2, 0], rotation: [0, 0, 0], scale: [1, 1, 1], radius: 1.2, height: 0.4, radialSegments: 32 },
      { id: 'joint1', type: 'sphere', color: '#8B5CF6', metalness: 0.7, roughness: 0.3, position: [0, -0.8, 0], rotation: [0, 0, 0], scale: [0.5, 0.5, 0.5], radius: 1 },
      { id: 'arm1', type: 'box', color: '#A78BFA', metalness: 0.6, roughness: 0.3, position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.4, 1.6, 0.4], width: 1, height: 1, depth: 1 },
      { id: 'joint2', type: 'sphere', color: '#8B5CF6', metalness: 0.7, roughness: 0.3, position: [0, 0.9, 0], rotation: [0, 0, 0], scale: [0.4, 0.4, 0.4], radius: 1 },
      { id: 'arm2', type: 'box', color: '#C4B5FD', metalness: 0.5, roughness: 0.3, position: [0.7, 1.2, 0], rotation: [0, 0, -0.8], scale: [0.3, 1.2, 0.3], width: 1, height: 1, depth: 1 },
      { id: 'gripper', type: 'cone', color: '#EF4444', metalness: 0.6, roughness: 0.2, position: [1.3, 1.8, 0], rotation: [0, 0, -1.2], scale: [0.3, 0.6, 0.3], radius: 1, height: 1 },
    ],
  },
  {
    slug: 'engranaje',
    name: 'Engranaje',
    emoji: '⚙️',
    description: 'Engranaje mecánico con dientes',
    sort_order: 2,
    shapes: [
      { id: 'gear-body', type: 'cylinder', color: '#F59E0B', metalness: 0.9, roughness: 0.1, position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1], radius: 1.5, height: 0.3, radialSegments: 24, animate: true },
      { id: 'gear-hole', type: 'cylinder', color: '#1e1e2e', metalness: 0, roughness: 1, position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1], radius: 0.4, height: 0.35, radialSegments: 6 },
      { id: 'tooth1', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [1.7, 0, 0], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth2', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [-1.7, 0, 0], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth3', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [0, 0, 1.7], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth4', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [0, 0, -1.7], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth5', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [1.2, 0, 1.2], rotation: [0, Math.PI / 4, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth6', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [-1.2, 0, -1.2], rotation: [0, Math.PI / 4, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth7', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [-1.2, 0, 1.2], rotation: [0, -Math.PI / 4, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth8', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [1.2, 0, -1.2], rotation: [0, -Math.PI / 4, 0], scale: [0.3, 0.3, 0.3] },
    ],
  },
  {
    slug: 'robot-simple',
    name: 'Robot Simple',
    emoji: '🤖',
    description: 'Robot educativo con cabeza y cuerpo',
    sort_order: 3,
    shapes: [
      { id: 'body', type: 'box', color: '#3B82F6', metalness: 0.6, roughness: 0.3, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1.2, 1.6, 0.8] },
      { id: 'head', type: 'box', color: '#60A5FA', metalness: 0.5, roughness: 0.4, position: [0, 1.3, 0], rotation: [0, 0, 0], scale: [0.9, 0.9, 0.9] },
      { id: 'eye-l', type: 'sphere', color: '#EF4444', metalness: 0.3, roughness: 0.5, position: [-0.25, 1.4, 0.45], rotation: [0, 0, 0], scale: [0.15, 0.15, 0.15], radius: 1 },
      { id: 'eye-r', type: 'sphere', color: '#EF4444', metalness: 0.3, roughness: 0.5, position: [0.25, 1.4, 0.45], rotation: [0, 0, 0], scale: [0.15, 0.15, 0.15], radius: 1 },
      { id: 'antenna', type: 'cylinder', color: '#F59E0B', metalness: 0.7, roughness: 0.2, position: [0, 2.0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], radius: 0.05, height: 0.6, radialSegments: 8 },
      { id: 'ant-tip', type: 'sphere', color: '#F59E0B', metalness: 0.8, roughness: 0.1, position: [0, 2.35, 0], rotation: [0, 0, 0], scale: [0.12, 0.12, 0.12], radius: 1 },
      { id: 'arm-l', type: 'box', color: '#2563EB', metalness: 0.5, roughness: 0.3, position: [-0.9, 0.1, 0], rotation: [0, 0, 0.2], scale: [0.25, 1.2, 0.25] },
      { id: 'arm-r', type: 'box', color: '#2563EB', metalness: 0.5, roughness: 0.3, position: [0.9, 0.1, 0], rotation: [0, 0, -0.2], scale: [0.25, 1.2, 0.25] },
      { id: 'leg-l', type: 'box', color: '#1D4ED8', metalness: 0.5, roughness: 0.3, position: [-0.35, -1.3, 0], rotation: [0, 0, 0], scale: [0.3, 1, 0.35] },
      { id: 'leg-r', type: 'box', color: '#1D4ED8', metalness: 0.5, roughness: 0.3, position: [0.35, -1.3, 0], rotation: [0, 0, 0], scale: [0.3, 1, 0.35] },
    ],
  },
  {
    slug: 'rueda-con-eje',
    name: 'Rueda con Eje',
    emoji: '🛞',
    description: 'Componente mecánico básico',
    sort_order: 4,
    shapes: [
      { id: 'wheel', type: 'torus', color: '#1e293b', metalness: 0.3, roughness: 0.8, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], radius: 1.2, tubeRadius: 0.35, radialSegments: 24, animate: true },
      { id: 'hub', type: 'cylinder', color: '#94A3B8', metalness: 0.8, roughness: 0.2, position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1], radius: 0.5, height: 0.4, radialSegments: 16 },
      { id: 'axle', type: 'cylinder', color: '#CBD5E1', metalness: 0.9, roughness: 0.1, position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1], radius: 0.1, height: 2.5, radialSegments: 12, animate: true },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding cad_presets\n')
  let ok = 0, skip = 0, fail = 0

  for (const preset of PRESETS) {
    const { data: existing } = await supabase.from('cad_presets').select('id').eq('slug', preset.slug).maybeSingle()
    if (existing) {
      console.log(`  ⏭️  ${preset.slug} ya existe`)
      skip++
      continue
    }
    const { error } = await supabase.from('cad_presets').insert({
      slug: preset.slug,
      name: preset.name,
      emoji: preset.emoji,
      description: preset.description,
      shapes: preset.shapes,
      sort_order: preset.sort_order,
    })
    if (error) {
      console.log(`  ❌ ${preset.slug}: ${error.message}`)
      fail++
    } else {
      console.log(`  ✅ ${preset.slug}`)
      ok++
    }
  }

  console.log(`\n${ok} creados, ${skip} omitidos, ${fail} fallidos`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
