/**
 * 1) Registra el programa "diseno" (falta en la tabla `programs`, junto a
 *    los ya existentes "robotica"/"ia"/"hacking").
 * 2) Limpia year_plans: los 14 niveles con contenido legado tenían cada mes
 *    duplicado (18 filas = 9 meses x2) y program_id NULL. Se deja un set
 *    limpio de 9 filas por nivel, marcado program_id='robotica'.
 * 3) Carga un plan trimestral (3 filas: Trimestre 1/2/3) para IA, Hacking y
 *    Diseño en grados representativos, referenciado contra CSTA K-12 CS
 *    Standards / AI4K12 / CyberStart / PicoCTF / Tinkercad-en-escuelas.
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

const MONTH_ORDER = ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo']

async function dedupeRobotica() {
  console.log('\n--- Limpiando duplicados de Robótica en year_plans ---')
  const { data: rows, error } = await supabase.from('year_plans').select('*').order('level_id').order('display_order')
  if (error) throw error

  const byLevel = {}
  rows.forEach(r => { (byLevel[r.level_id] = byLevel[r.level_id] || []).push(r) })

  for (const levelId of Object.keys(byLevel)) {
    const levelRows = byLevel[levelId]
    if (levelRows.length <= 9) {
      // Ya está limpio; solo asegurar program_id
      const toFix = levelRows.filter(r => !r.program_id)
      if (toFix.length) {
        await supabase.from('year_plans').update({ program_id: 'robotica' }).in('id', toFix.map(r => r.id))
      }
      continue
    }
    // Quedarnos con la primera aparición de cada mes (en orden MONTH_ORDER), borrar el resto
    const keep = []
    const seen = new Set()
    for (const month of MONTH_ORDER) {
      const match = levelRows.find(r => r.month === month && !seen.has(r.id))
      if (match) { keep.push(match); seen.add(match.id) }
    }
    const remove = levelRows.filter(r => !seen.has(r.id))
    if (remove.length) {
      const { error: delErr } = await supabase.from('year_plans').delete().in('id', remove.map(r => r.id))
      if (delErr) throw delErr
    }
    await supabase.from('year_plans').update({ program_id: 'robotica' }).in('id', keep.map(r => r.id))
    console.log(`  ${levelId}: ${levelRows.length} -> ${keep.length} filas (borradas ${remove.length}), program_id=robotica`)
  }
}

async function ensureDisenoProgram() {
  console.log('\n--- Verificando programa "diseno" ---')
  const { data: existing } = await supabase.from('programs').select('id').eq('id', 'diseno').maybeSingle()
  if (existing) { console.log('  ya existe'); return }
  const { error } = await supabase.from('programs').insert({ id: 'diseno', name: 'Diseño 3D', level_id: null })
  if (error) throw error
  console.log('  creado')
}

// Cada entrada: levelId, programId, 3 trimestres { topic, project }
const TRIMESTER_PLANS = [
  // ───────────── IA ─────────────
  { levelId: 'inicial-1', programId: 'ia', trimesters: [
    { topic: 'Las computadoras pueden ver y escuchar', project: 'Jugamos a que la tablet nos reconozca' },
    { topic: 'Máquinas que aprenden jugando', project: 'Entrenamos una app sencilla con fotos de juguetes' },
    { topic: 'Robots amigos', project: 'Presentamos nuestro robot imaginario a la clase' },
  ]},
  { levelId: 'inicial-2', programId: 'ia', trimesters: [
    { topic: 'Cómo las computadoras reconocen objetos', project: 'Clasificamos juguetes con la cámara' },
    { topic: 'Enseñarle algo nuevo a la IA', project: 'Entrenamos categorías propias en "Entrena tu IA"' },
    { topic: 'IA y las emociones', project: 'Juego de imitar posturas con el detector de movimiento' },
  ]},
  { levelId: 'segundo-egb', programId: 'ia', trimesters: [
    { topic: 'Percepción de máquinas: visión y datos', project: 'Anotador de imágenes: etiquetamos animales' },
    { topic: 'Entrenamiento supervisado, en simple', project: '"Entrena tu IA": reconoce objetos de la mochila' },
    { topic: 'IA en la vida diaria', project: 'Cartel: dónde vemos IA en casa y la escuela' },
  ]},
  { levelId: 'quinto-egb', programId: 'ia', trimesters: [
    { topic: 'Cómo ve una computadora: detección de objetos', project: 'Reto de detección con cámara en vivo' },
    { topic: 'Entrenamiento de modelos y datos de calidad', project: 'Entrena un clasificador propio y mide su precisión' },
    { topic: 'Ética básica de la IA: sesgos y errores', project: 'Debate: ¿por qué la IA se equivoca a veces?' },
  ]},
  { levelId: 'octavo-egb', programId: 'ia', trimesters: [
    { topic: 'Redes neuronales y visión por computadora (introducción)', project: 'Detección YOLO en vivo: identifica objetos reales' },
    { topic: 'Procesamiento de voz y lenguaje', project: 'Construye un asistente por voz simple con "IA de Voz"' },
    { topic: 'IA generativa y creación 3D', project: 'Genera un modelo 3D describiéndolo en texto' },
  ]},
  { levelId: 'primero-bach', programId: 'ia', trimesters: [
    { topic: 'Fundamentos de machine learning', project: 'Compara la precisión de dos modelos de clasificación' },
    { topic: 'Modelos preentrenados y APIs en la nube', project: 'Integra un modelo de IA en la nube a un mini-proyecto' },
    { topic: 'Ética, sesgo y regulación de la IA', project: 'Ensayo y presentación: impacto social de la IA' },
  ]},
  { levelId: 'universidad', programId: 'ia', trimesters: [
    { topic: 'Arquitecturas de deep learning aplicadas', project: 'Implementa y ajusta un detector de objetos' },
    { topic: 'IA generativa aplicada (texto, imagen, 3D)', project: 'Prototipo funcional usando un modelo generativo' },
    { topic: 'Despliegue y evaluación responsable de modelos', project: 'Publica un mini-servicio de IA con métricas de evaluación' },
  ]},

  // ───────────── HACKING ─────────────
  { levelId: 'octavo-egb', programId: 'hacking', trimesters: [
    { topic: 'Ciudadanía digital y contraseñas seguras', project: 'Auditoría de contraseñas propias con CrypTool' },
    { topic: 'Cómo funcionan las redes: introducción', project: 'Análisis de tráfico simulado con Wireshark (modo lectura)' },
    { topic: 'Ingeniería social y phishing', project: 'Detecta 5 señales de phishing en correos de ejemplo' },
  ]},
  { levelId: 'primero-bach', programId: 'hacking', trimesters: [
    { topic: 'Criptografía clásica y moderna', project: 'Cifra y descifra mensajes con CrypTool' },
    { topic: 'Reconocimiento y escaneo ético de redes', project: 'Escaneo controlado de una red de práctica con Nmap' },
    { topic: 'Vulnerabilidades web comunes (OWASP Top 10, introducción)', project: 'Identifica 3 vulnerabilidades en un sitio de práctica (OWASP Juice Shop)' },
  ]},
  { levelId: 'universidad', programId: 'hacking', trimesters: [
    { topic: 'Explotación básica y hardening de sistemas', project: 'Asegura una máquina virtual de práctica' },
    { topic: 'Pentesting metodológico (reconocimiento a reporte)', project: 'Reporte de pentesting sobre un entorno HackTheBox' },
    { topic: 'Respuesta a incidentes y ciberseguridad defensiva', project: 'Simulacro de respuesta a un incidente de seguridad' },
  ]},

  // ───────────── DISEÑO ─────────────
  { levelId: 'cuarto-egb', programId: 'diseno', trimesters: [
    { topic: 'Formas 3D básicas: cubos, esferas, cilindros', project: 'Explora el Visor 3D e identifica formas en objetos reales' },
    { topic: 'Medidas y proporción', project: 'Construye una figura simple en el Constructor paramétrico' },
    { topic: 'De la idea al modelo', project: 'Diseña un objeto de tu kit de robótica en 3D' },
  ]},
  { levelId: 'octavo-egb', programId: 'diseno', trimesters: [
    { topic: 'Composición de sólidos: uniones y recortes', project: 'Combina 3 formas con operaciones booleanas en el Constructor' },
    { topic: 'Diseño generativo con IA (introducción)', project: 'Genera tu primer modelo 3D describiéndolo en texto' },
    { topic: 'De boceto a impresión 3D', project: 'Diseña una pieza funcional para tu robot y prepárala para imprimir' },
  ]},
  { levelId: 'primero-bach', programId: 'diseno', trimesters: [
    { topic: 'Modelado paramétrico avanzado', project: 'Diseña un ensamble de piezas que encajen entre sí' },
    { topic: 'IA generativa aplicada a diseño de producto', project: 'Itera un modelo generado por IA hasta cumplir una especificación' },
    { topic: 'Diseño para manufactura (DFM básico)', project: 'Optimiza un modelo pensando en impresión 3D real' },
  ]},
  { levelId: 'universidad', programId: 'diseno', trimesters: [
    { topic: 'CAD paramétrico y modelado por SDF', project: 'Modela una pieza mecánica compleja combinando primitivas' },
    { topic: 'IA generativa en el flujo de diseño industrial', project: 'Diseña un producto completo asistido por IA generativa' },
    { topic: 'Prototipado rápido y validación', project: 'Prototipo final: diseño, revisión y documentación técnica' },
  ]},
]

async function seedTrimesterPlans() {
  console.log('\n--- Cargando planes trimestrales (IA / Hacking / Diseño) ---')
  for (const plan of TRIMESTER_PLANS) {
    // Idempotente: borra lo previo de esta combinación antes de insertar
    await supabase.from('year_plans').delete().eq('level_id', plan.levelId).eq('program_id', plan.programId)
    const rows = plan.trimesters.map((t, i) => ({
      level_id: plan.levelId,
      program_id: plan.programId,
      month: `Trimestre ${i + 1}`,
      topic: t.topic,
      project: t.project,
      display_order: i + 1,
    }))
    const { error } = await supabase.from('year_plans').insert(rows)
    if (error) throw error
    console.log(`  ${plan.levelId} / ${plan.programId}: 3 trimestres insertados`)
  }
}

;(async () => {
  try {
    await ensureDisenoProgram()
    await dedupeRobotica()
    await seedTrimesterPlans()
    console.log('\nOK - listo')
  } catch (err) {
    console.error('ERROR:', err)
    process.exit(1)
  }
})()
