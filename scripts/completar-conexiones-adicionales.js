/**
 * Completa las tablas de conexiones de los proyectos adicionales de los kits.
 * Muchos traían solo el cable de señal ("mismo que el principal") y el diagrama
 * salía con piezas sin alimentación ni tierra. Aquí se añaden las patas que faltan:
 *  - si la pieza existe en el proyecto principal del kit, se copian sus otras patas;
 *  - si no, se aplican reglas por tipo de pieza (LED, pulsador, potenciómetro, sensor).
 * Por defecto solo simula; con --apply escribe. Guarda respaldo en backups/.
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
const get = async (t, q) => { const r = await fetch(`${base}${t}?${q}&limit=5000`, { headers }); const j = await r.json(); if (!Array.isArray(j)) throw new Error(JSON.stringify(j).slice(0, 200)); return j }

// Voltaje de alimentación de las piezas sueltas según la placa del kit.
const VOLT = { 'kit-lv-primero-bach': '3V3', 'kit-lv-segundo-bach': '3V3', 'kit-lv-tercero-bach': '3V3' }
const key = s => s.toLowerCase().replace(/\s*via\s+r\s?\d+\s?k?/i, '').replace(/\(.*?\)/g, '').replace(/[^a-z0-9áéíóúñ+-]/g, '')

;(async () => {
  const proyectos = await get('kit_proyectos', 'select=id,kit_id,slug,tipo')
  const conexiones = await get('kit_conexiones', 'select=*')
  const de = id => conexiones.filter(c => c.proyecto_id === id).sort((a, b) => (a.orden || 0) - (b.orden || 0))
  const nuevas = []
  const cambios = []

  for (const p of proyectos.filter(x => x.tipo === 'adicional')) {
    const principal = proyectos.find(x => x.kit_id === p.kit_id && x.tipo === 'principal')
    const ref = principal ? de(principal.id) : []
    const filas = de(p.id)
    const v = VOLT[p.kit_id] || '5V'
    let orden = Math.max(0, ...filas.map(f => f.orden || 0))
    const add = (componente, pin_componente, pin_placa) => {
      nuevas.push({ proyecto_id: p.id, componente, pin_componente, pin_placa, nota: null, orden: ++orden })
      console.log(`  + ${p.slug}: ${componente} | ${pin_componente} -> ${pin_placa}`)
    }

    for (const comp of Array.from(new Set(filas.map(f => f.componente)))) {
      const mias = filas.filter(f => f.componente === comp)
      const tengo = new Set(mias.map(f => key(f.pin_componente)))
      const iguales = ref.filter(r => r.componente === comp)
      if (iguales.length > 0) {
        for (const r of iguales) if (!tengo.has(key(r.pin_componente))) add(comp, r.pin_componente, r.pin_placa)
        continue
      }
      const texto = mias.map(f => f.pin_componente).join(' ')
      if (/^LED/i.test(comp) && mias.length === 1) {
        if (!/R\s?\d+/i.test(texto)) cambios.push({ id: mias[0].id, pin_componente: `${mias[0].pin_componente} via R330` })
        add(comp, 'Cátodo (-)', 'GND')
      } else if (/^BUZZER/i.test(comp) && mias.length === 1) {
        add(comp, '-', 'GND')
      } else if (/^PULSADOR/i.test(comp) && mias.length === 1 && !/GND|5V|3V3/i.test(texto)) {
        add(comp, 'Pin 2', 'GND')
      } else if (/^POTENCI/i.test(comp) && mias.length === 1) {
        add(comp, 'Terminal A', v); add(comp, 'Terminal B', 'GND')
      } else if (/^SENSOR/i.test(comp) && !/VCC/i.test(texto)) {
        add(comp, 'VCC', v); add(comp, 'GND', 'GND')
      }
    }
  }
  for (const c of cambios) console.log('  ~ resistencia en', c.pin_componente)
  console.log(`\n${nuevas.length} conexiones nuevas, ${cambios.length} LEDs con su resistencia.`)
  if (!APPLY) { console.log('SIMULACIÓN: no se cambió nada. Ejecuta con --apply.'); return }

  const dir = path.join(__dirname, '..', 'backups')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `kit_conexiones-${new Date().toISOString().replace(/[:.]/g, '-')}.json`), JSON.stringify(conexiones))
  if (nuevas.length) {
    const r = await fetch(`${base}kit_conexiones`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(nuevas) })
    if (!r.ok) throw new Error(`insert: ${r.status} ${(await r.text()).slice(0, 300)}`)
  }
  for (const c of cambios) {
    const r = await fetch(`${base}kit_conexiones?id=eq.${c.id}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ pin_componente: c.pin_componente }) })
    if (!r.ok) throw new Error(`patch: ${r.status}`)
  }
  console.log('listo')
})().catch(e => { console.error(e.message); process.exit(1) })
