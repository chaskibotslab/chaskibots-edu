/**
 * Registra Python IDE, Terminal de Hacking Ético, Terminal Linux y el
 * Editor Roblox como simuladores "internos" en la tabla `simulators`, con
 * niveles/programas asignados explícitamente en vez de estar disponibles
 * por defecto en todos los cursos. url='' marca a SimulatorTabsDynamic que
 * debe renderizar el componente React real (no un iframe).
 */
const fs = require('fs')
const { createClient } = require('C:/Users/CHASKI/CascadeProjects/chaskibots-edu/node_modules/@supabase/supabase-js')

const env = fs.readFileSync('C:/Users/CHASKI/CascadeProjects/chaskibots-edu/.env.local', 'utf-8')
let url = '', key = ''
env.split('\n').forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim()
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = l.split('=').slice(1).join('=').trim()
})
const supabase = createClient(url, key)

const GRADE_3_UP = ['tercero-egb', 'cuarto-egb', 'quinto-egb', 'sexto-egb', 'sexto-slm', 'septimo-egb', 'septimo-slm', 'septimo-egb-slm', 'octavo-egb', 'octavo-slm', 'noveno-egb', 'noveno-slm', 'decimo-egb', 'decimo-slm', 'primero-bach', 'segundo-bach', 'segundo-slm-bgu', 'tercero-bach', 'tercero-slm-bgu', 'universidad', 'curso-libre']
const GRADE_5_UP = ['quinto-egb', 'sexto-egb', 'sexto-slm', 'septimo-egb', 'septimo-slm', 'septimo-egb-slm', 'octavo-egb', 'octavo-slm', 'noveno-egb', 'noveno-slm', 'decimo-egb', 'decimo-slm', 'primero-bach', 'segundo-bach', 'segundo-slm-bgu', 'tercero-bach', 'tercero-slm-bgu', 'universidad', 'curso-libre']
const GRADE_7_UP = ['septimo-egb', 'septimo-slm', 'septimo-egb-slm', 'octavo-egb', 'octavo-slm', 'noveno-egb', 'noveno-slm', 'decimo-egb', 'decimo-slm', 'primero-bach', 'segundo-bach', 'segundo-slm-bgu', 'tercero-bach', 'tercero-slm-bgu', 'universidad', 'curso-libre']
const GRADE_8_UP = ['octavo-egb', 'octavo-slm', 'noveno-egb', 'noveno-slm', 'decimo-egb', 'decimo-slm', 'primero-bach', 'segundo-bach', 'segundo-slm-bgu', 'tercero-bach', 'tercero-slm-bgu', 'universidad', 'curso-libre']

const TOOLS = [
  {
    id: 'python-ide', name: 'Python IDE Professional', icon: 'code',
    description: 'Editor Python real (Monaco + Pyodide) con currículo, terminal y ejecución en el navegador.',
    url: '', levels: GRADE_5_UP, programs: [],
  },
  {
    id: 'hacking-terminal', name: 'Terminal Hacking Ético', icon: 'shield',
    description: 'Terminal simulada con sistema de archivos, criptografía y verificador de contraseñas.',
    url: '', levels: GRADE_8_UP, programs: ['hacking'],
  },
  {
    id: 'linux-terminal', name: 'Terminal Linux', icon: 'terminal',
    description: 'Fundamentos de línea de comandos: navegación, archivos, permisos y búsqueda de texto.',
    url: '', levels: GRADE_7_UP, programs: ['hacking', 'robotica'],
  },
  {
    id: 'roblox-editor', name: 'Editor Roblox Lua', icon: 'gamepad',
    description: 'Crea scripts Lua para Roblox Studio: partes, eventos y jugadores.',
    url: '', levels: GRADE_3_UP, programs: [],
  },
]

;(async () => {
  for (const tool of TOOLS) {
    const { data: existing } = await supabase.from('simulators').select('id').eq('id', tool.id).maybeSingle()
    if (existing) {
      const { error } = await supabase.from('simulators').update({
        name: tool.name, description: tool.description, icon: tool.icon, url: tool.url,
        levels: tool.levels, programs: tool.programs, enabled: true,
      }).eq('id', tool.id)
      if (error) throw error
      console.log(`  actualizado: ${tool.id} (${tool.levels.length} niveles, programas: ${tool.programs.join(',') || 'todos'})`)
    } else {
      const { error } = await supabase.from('simulators').insert({
        id: tool.id, name: tool.name, description: tool.description, icon: tool.icon, url: tool.url,
        levels: tool.levels, programs: tool.programs, enabled: true,
      })
      if (error) throw error
      console.log(`  creado: ${tool.id} (${tool.levels.length} niveles, programas: ${tool.programs.join(',') || 'todos'})`)
    }
  }
  console.log('\nOK - listo')
})().catch(err => { console.error('ERROR:', err); process.exit(1) })
