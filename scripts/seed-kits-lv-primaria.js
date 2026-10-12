/**
 * Crea (o actualiza) los 9 kits del Programa de Electrónica Educativa de la
 * Academia Lizardo Villamarín, de Inicial 1 a 7mo EGB: curso, asignación al
 * colegio, kit, lista de materiales, 3 prácticas + proyecto final con su guía
 * de 6 etapas, y el dibujo del circuito (public/kits/circuitos/kit-N.webp).
 * Las guías están en scripts/guias/electronica-primaria.js.
 * Por defecto solo simula; con --apply escribe. Idempotente.
 */
const fs = require('fs')
const path = require('path')
const GUIAS = require('./guias/electronica-primaria')

const APPLY = process.argv.includes('--apply')
const SCHOOL = 'school-amclav-mkr7awl9'
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)
const base = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' }
const get = async (t, q) => { const r = await fetch(`${base}${t}?${q}&limit=5000`, { headers }); const j = await r.json(); if (!Array.isArray(j)) throw new Error(`${t}: ${JSON.stringify(j).slice(0, 200)}`); return j }
const send = async (method, t, q, body) => {
  const r = await fetch(`${base}${t}${q ? `?${q}` : ''}`, { method, headers: { ...headers, Prefer: 'return=minimal,resolution=merge-duplicates' }, body: body ? JSON.stringify(body) : undefined })
  if (!r.ok) throw new Error(`${method} ${t}: ${r.status} ${(await r.text()).slice(0, 300)}`)
}

// Materiales que no existían en el catálogo
const MATERIALES = [
  ['cinta-cobre', 'Cinta de cobre adhesiva', 'componente'],
  ['pila-cr2032', 'Pila de botón CR2032 (3 V)', 'alimentacion'],
  ['pinza-papel', 'Pinza de papel (sujeta la pila)', 'componente'],
  ['cartulina', 'Cartulina', 'componente'],
  ['boton-cartulina', 'Botón de cartulina con cobre', 'componente'],
  ['caja-carton', 'Caja de cartón (maqueta)', 'componente'],
  ['botella-transparente', 'Botella transparente', 'componente'],
  ['protoboard', 'Protoboard', 'componente'],
  ['portabateria-9v-broche', 'Portabatería de 9 V', 'alimentacion'],
  ['transistor-2n3904', 'Transistor 2N3904', 'componente'],
  ['resistencia-470', 'Resistencia 470 Ω', 'componente'],
  ['resistencia-4k7', 'Resistencia 4,7 kΩ', 'componente'],
  ['resistencia-22k', 'Resistencia 22 kΩ', 'componente'],
  ['resistencia-led-kit7', 'Resistencia para LED (1 kΩ, 220 Ω o 330 Ω)', 'componente'],
  ['potenciometro-5k', 'Potenciómetro 5 kΩ', 'componente'],
  ['condensador-470uf', 'Condensador electrolítico 470 μF', 'componente'],
  ['condensador-100uf', 'Condensador electrolítico 100 μF', 'componente'],
  ['display-7seg', 'Display de 7 segmentos', 'componente'],
  ['dip-switch', 'DIP switch', 'componente'],
]

const SEG_PILA = 'Las pilas de botón CR2032 las cuenta, entrega y recoge el docente en cada clase: tragadas son peligrosas.'
const SEG_9V = 'Solo batería de 9 V; nunca la red eléctrica. Revisar la polaridad de LEDs y condensadores antes de conectar. Si algo se calienta, desconectar de inmediato.'
const B9V = [['bateria-9v', 1], ['portabateria-9v-broche', 1]]
const PROTO = ['protoboard', 1, 'Según la lista general del programa']

// materiales: [id, cantidad, nota]   proyectos: [slug, título, objetivos]
const KITS = [
  {
    n: 1, level: 'inicial-1', grado: 'Inicial 1', icon: '✨', color: '#f59e0b', nombre: 'La luciérnaga mágica', robot: 'Molino de viento',
    resumen: 'Circuito de papel: la cola de la luciérnaga se enciende al doblar y presionar la esquina de la hoja.',
    alim: 'Pila de botón CR2032 (3 V) y cinta de cobre', seguridad: SEG_PILA,
    materiales: [['cinta-cobre', null, '40 cm'], ['led-generico', 1, 'Verde o amarillo'], ['pila-cr2032', 1], ['pinza-papel', 1], ['cartulina', 1, 'Con la luciérnaga']],
    proyectos: [
      ['luciernaga-led-y-pila', 'Enciende el LED con la pila', ['Reconocer la pata larga del LED y el lado + de la pila.', 'Descubrir que la luz se enciende solo cuando las dos patas tocan la pila.']],
      ['luciernaga-pistas-de-cobre', 'Pega los caminos de cobre', ['Seguir un trazo con cinta de cobre.', 'Entender que la energía viaja por un camino.']],
      ['luciernaga-interruptor-de-papel', 'El interruptor de papel', ['Abrir y cerrar un circuito doblando la hoja.']],
      ['la-luciernaga-magica', 'La luciérnaga mágica', ['Armar un circuito de papel completo con pila, camino e interruptor.', 'Cuidar las pilas de botón y devolverlas al docente.']],
    ],
  },
  {
    n: 2, level: 'inicial-2', grado: 'Inicial 2', icon: '👀', color: '#8b5cf6', nombre: 'El monstruo de ojos brillantes', robot: 'Carro solar',
    resumen: 'Circuito de papel con dos ojos LED que se encienden juntos con una sola pila.',
    alim: 'Pila de botón CR2032 (3 V) y cinta de cobre', seguridad: SEG_PILA,
    materiales: [['cinta-cobre', null, '60 cm'], ['led-rojo', 2], ['pila-cr2032', 1], ['pinza-papel', 1], ['cartulina', 1]],
    proyectos: [
      ['monstruo-primer-ojo', 'Arma el primer ojo', ['Armar un circuito de papel con un LED.', 'Distinguir el camino + del camino –.']],
      ['monstruo-dos-pistas', 'Un camino arriba y otro abajo', ['Prolongar dos pistas de cobre sin que se toquen.']],
      ['monstruo-segundo-ojo', 'Conecta el segundo ojo', ['Conectar dos LED a las mismas pistas (en paralelo).']],
      ['el-monstruo-de-ojos-brillantes', 'El monstruo de ojos brillantes', ['Encender dos luces con una sola pila.', 'Crear y presentar un personaje propio.']],
    ],
  },
  {
    n: 3, level: 'primero-egb', grado: '1ro EGB', icon: '🚦', color: '#10b981', nombre: 'El semáforo de papel', robot: 'Robot pintador',
    resumen: 'Tres luces de papel, cada una con su propio botón de cartulina.',
    alim: 'Pila de botón CR2032 (3 V) y cinta de cobre', seguridad: SEG_PILA,
    materiales: [['cinta-cobre', null, '1 m'], ['led-rojo', 1], ['led-amarillo', 1], ['led-verde', 1], ['boton-cartulina', 3], ['pila-cr2032', 1], ['pinza-papel', 1]],
    proyectos: [
      ['semaforo-papel-luz-con-boton', 'Una luz con su botón', ['Construir un pulsador con cartulina y cobre.', 'Entender que una pista cortada no deja pasar la energía.']],
      ['semaforo-papel-pila-con-pinza', 'Sujeta la pila con la pinza', ['Fijar la pila para que el contacto sea firme.']],
      ['semaforo-papel-tres-luces', 'Agrega las otras dos luces', ['Conectar tres luces a la misma pila, cada una con su botón.']],
      ['el-semaforo-de-papel', 'El semáforo de papel', ['Controlar tres luces por separado.', 'Reconocer el significado de cada color del semáforo.']],
    ],
  },
  {
    n: 4, level: 'segundo-egb', grado: '2do EGB', icon: '👆', color: '#f97316', nombre: 'Interruptor táctil mágico', robot: 'Robot perro (Robot Dog)',
    resumen: 'El LED se enciende al tocar dos placas de cobre con el dedo, gracias a dos transistores en par Darlington.',
    alim: 'Batería de 9 V', seguridad: SEG_9V,
    materiales: [...B9V, ['transistor-2n3904', 2], ['resistencia-1k', 1], ['resistencia-470', 1], ['led-amarillo', 1], ['cinta-cobre', null, '10 cm'], PROTO],
    proyectos: [
      ['tactil-enciende-led', 'Enciende el LED con 470 Ω', ['Encender un LED con su resistencia en serie.', 'Reconocer la polaridad del LED.']],
      ['tactil-un-transistor', 'Un transistor como interruptor', ['Identificar emisor, base y colector de un transistor.', 'Encender un LED desde el colector.']],
      ['tactil-par-darlington', 'Dos transistores: el par Darlington', ['Conectar dos transistores en par Darlington.', 'Comprobar que juntos amplifican mucho más.']],
      ['interruptor-tactil-magico', 'Interruptor táctil mágico', ['Usar la conductividad de la piel como señal de entrada.', 'Explicar por qué hace falta amplificar una corriente muy pequeña.']],
    ],
  },
  {
    n: 5, level: 'tercero-egb', grado: '3ro EGB', icon: '🏠', color: '#ef4444', nombre: 'Casa iluminada', robot: 'Robot carretilla',
    resumen: 'Una maqueta con una luz por cuarto y una sala con dímmer.',
    alim: 'Batería de 9 V', seguridad: SEG_9V,
    materiales: [...B9V, ['led-generico', 4], ['resistencia-470', 4], ['potenciometro-5k', 1], ['cinta-cobre', null, '1 m'], ['caja-carton', 1], PROTO],
    proyectos: [
      ['casa-enciende-led', 'Enciende un LED con 470 Ω', ['Encender un LED con su resistencia en serie.']],
      ['casa-serie-y-paralelo', 'LEDs en serie y en paralelo', ['Comparar una conexión en serie con una en paralelo.', 'Explicar por qué en paralelo cada luz funciona sola.']],
      ['casa-cuatro-luces', 'Cuatro luces en paralelo', ['Conectar cuatro LED en paralelo, cada uno con su resistencia.']],
      ['casa-iluminada', 'Casa iluminada', ['Cablear una maqueta con dos líneas de alimentación.', 'Regular el brillo de una luz con un potenciómetro.']],
    ],
  },
  {
    n: 6, level: 'cuarto-egb', grado: '4to EGB', icon: '🌙', color: '#3b82f6', nombre: 'Farola inteligente', robot: 'Rueda moscovita',
    resumen: 'Una farola que se enciende sola al oscurecer, con un sensor de luz y un transistor.',
    alim: 'Batería de 9 V', seguridad: SEG_9V,
    materiales: [...B9V, ['transistor-2n3904', 1], ['ldr-2-patas', 1], ['potenciometro-5k', 1], ['resistencia-4k7', 1], ['resistencia-1k', 1], ['resistencia-470', 1], ['led-blanco', 1], PROTO],
    proyectos: [
      ['farola-enciende-led', 'Enciende el LED con 470 Ω', ['Encender un LED con su resistencia en serie.']],
      ['farola-un-transistor', 'Un transistor como interruptor', ['Identificar emisor, base y colector de un transistor.', 'Encender un LED desde el colector.']],
      ['farola-divisor-con-ldr', 'El divisor con la LDR', ['Armar un divisor de voltaje con una LDR.', 'Usar el divisor para activar un transistor.']],
      ['farola-inteligente', 'Farola inteligente', ['Construir un circuito que reacciona solo a la luz del ambiente.', 'Ajustar la sensibilidad con un potenciómetro.']],
    ],
  },
  {
    n: 7, level: 'quinto-egb', grado: '5to EGB', icon: '💧', color: '#06b6d4', nombre: 'Tanque de agua inteligente', robot: 'Robot mono (Robot Monkey)',
    resumen: 'Cuatro LED muestran el nivel del agua de un tanque: bajo, medio, alto y lleno.',
    alim: 'Batería de 9 V', seguridad: SEG_9V,
    materiales: [...B9V, ['transistor-2n3904', 4], ['led-verde', 1], ['led-azul', 1], ['led-amarillo', 1], ['led-rojo', 1], ['resistencia-led-kit7', 4], ['resistencia-470', 1, 'Sonda común'], ['pulsador', 1], ['jumper-mm', 10], ['jumper-mh', 5], ['jumper-hh', 5], ['cinta-cobre', null, '1 m'], ['botella-transparente', 1], PROTO],
    proyectos: [
      ['tanque-enciende-led', 'Enciende un LED con su resistencia', ['Encender un LED con su resistencia en serie.']],
      ['tanque-un-transistor', 'Un transistor como interruptor', ['Identificar emisor, base y colector de un transistor.', 'Encender un LED desde el colector.']],
      ['tanque-sondas-en-agua', 'Dos puntas en agua con sal', ['Comprobar que el agua con sal conduce la electricidad.', 'Usar esa corriente para activar un transistor.']],
      ['tanque-de-agua-inteligente', 'Tanque de agua inteligente', ['Repetir un mismo circuito cuatro veces para medir cuatro niveles.', 'Interpretar un indicador de nivel con luces.']],
    ],
  },
  {
    n: 8, level: 'sexto-egb', grado: '6to EGB', icon: '🚥', color: '#22c55e', nombre: 'Semáforo automático', robot: 'Carro radio controlado',
    resumen: 'Rojo, amarillo y verde se encienden en secuencia, cada uno con su tiempo, sin programación.',
    alim: 'Batería de 9 V', seguridad: SEG_9V,
    materiales: [...B9V, ['transistor-2n3904', 3], ['condensador-470uf', 2], ['condensador-100uf', 1], ['resistencia-22k', 3], ['resistencia-1k', 3], ['led-rojo', 1], ['led-amarillo', 1], ['led-verde', 1], ['jumper-mm', 10], PROTO],
    proyectos: [
      ['semaforo-auto-condensador', 'El condensador guarda energía', ['Cargar un condensador y observar cómo entrega su energía.', 'Respetar la polaridad de un condensador electrolítico.']],
      ['semaforo-auto-tres-etapas', 'Arma las tres etapas', ['Armar una etapa con transistor, dos resistencias y un LED, y repetirla.']],
      ['semaforo-auto-condensadores', 'Une las etapas con condensadores', ['Encadenar tres etapas en anillo con condensadores.', 'Relacionar la capacidad con el tiempo de cada luz.']],
      ['semaforo-automatico', 'Semáforo automático', ['Construir un circuito que genera una secuencia de tiempos sin programación.', 'Montar el circuito en una maqueta.']],
    ],
  },
  {
    n: 9, level: 'septimo-egb', grado: '7mo EGB', icon: '🔢', color: '#ec4899', nombre: 'Números secretos', robot: 'Robot traga monedas (alcancía)',
    resumen: 'Formar números y letras en un display de 7 segmentos con interruptores.',
    alim: 'Batería de 9 V', seguridad: SEG_9V,
    materiales: [...B9V, ['display-7seg', 1], ['dip-switch', 1], ['resistencia-1k', 8], PROTO],
    proyectos: [
      ['display-enciende-segmento', 'Enciende un segmento', ['Encender un segmento del display con su resistencia.', 'Reconocer la pata común.']],
      ['display-mapa-de-pines', 'El mapa de los segmentos', ['Identificar por prueba qué pata enciende cada segmento.', 'Registrar los resultados en una tabla.']],
      ['display-un-interruptor-por-segmento', 'Un interruptor por segmento', ['Controlar cada segmento con un interruptor del DIP switch.']],
      ['numeros-secretos', 'Números secretos', ['Formar los números del 0 al 9 combinando segmentos.', 'Codificar y decodificar mensajes con combinaciones de interruptores.']],
    ],
  },
]

const primeraFrase = t => t.split(/(?<=[.!?])\s/)[0]

;(async () => {
  for (const k of KITS) {
    const kitId = `kit-lv-${k.level}`
    const guias = GUIAS[kitId] || {}
    const faltan = k.proyectos.filter(([slug]) => !guias[slug]).map(p => p[0])
    if (faltan.length) throw new Error(`${kitId}: sin guía ${faltan.join(', ')}`)
    if (!fs.existsSync(path.join(__dirname, '..', 'public', 'kits', 'circuitos', `kit-${k.n}.webp`))) throw new Error(`falta public/kits/circuitos/kit-${k.n}.webp`)
    console.log(`${kitId}: ${k.grado} · ${k.nombre} · ${k.materiales.length} materiales · ${k.proyectos.length} lecciones`)
  }
  if (!APPLY) { console.log('\nSIMULACIÓN: no se cambió nada. Ejecuta con --apply.'); return }

  await send('POST', 'materiales', 'on_conflict=id', MATERIALES.map(([id, nombre, categoria]) => ({ id, nombre, categoria })))
  const asignados = await get('school_courses', `select=course_id&school_id=eq.${SCHOOL}`)

  for (const k of KITS) {
    const kitId = `kit-lv-${k.level}`
    const cursoId = `curso-lv-${k.level}`
    const imagen = `/kits/circuitos/kit-${k.n}.webp`

    await send('POST', 'courses', 'on_conflict=id', {
      id: cursoId, name: `${k.grado} Academia`, description: `${k.nombre} — Academia Militar Lizardo Alfonzo Villamarín`,
      level_id: k.level, program_id: 'robotica', modality: 'presencial', icon: k.icon, color: k.color, is_active: true,
    })
    if (!asignados.some(a => a.course_id === cursoId)) {
      await send('POST', 'school_courses', '', { school_id: SCHOOL, course_id: cursoId, classroom: '', academic_year: '2026', is_active: true })
    }
    await send('POST', 'kits', 'on_conflict=id', {
      id: kitId, level_id: k.level, school_id: SCHOOL, curso_id: cursoId, name: k.nombre,
      description: `Kit ${k.grado} — Academia Lizardo Villamarín. ${k.resumen}`,
      proyecto_principal: k.nombre, alimentacion: k.alim, advertencia_seguridad: k.seguridad,
      notas: `Electrónica sin programación, en 4 pasos. Kit robot del grado: ${k.robot}.`, activo: true, visible: true,
    })

    await send('DELETE', 'kit_materiales', `kit_id=eq.${kitId}`)
    await send('POST', 'kit_materiales', '', k.materiales.map(([material_id, cantidad, nota]) => ({ kit_id: kitId, material_id, cantidad, nota: nota || null, incluido: true })))

    const existentes = await get('kit_proyectos', `select=id,slug&kit_id=eq.${kitId}`)
    for (const [i, [slug, titulo, objetivos]] of k.proyectos.entries()) {
      const principal = i === k.proyectos.length - 1
      const guia = GUIAS[kitId][slug]
      const fila = { kit_id: kitId, slug, titulo, tipo: principal ? 'principal' : 'practica', descripcion: principal ? k.resumen : primeraFrase(guia.reto.texto), objetivos, orden: principal ? 1 : i - 3, guia }
      const ya = existentes.find(e => e.slug === slug)
      if (ya) await send('PATCH', 'kit_proyectos', `id=eq.${ya.id}`, fila)
      else await send('POST', 'kit_proyectos', '', fila)
    }

    const principal = (await get('kit_proyectos', `select=id&kit_id=eq.${kitId}&tipo=eq.principal`))[0]
    await send('DELETE', 'kit_esquemas', `proyecto_id=eq.${principal.id}`)
    await send('POST', 'kit_esquemas', '', { proyecto_id: principal.id, tipo: 'imagen', url: imagen, contenido: null })
    console.log('listo', kitId)
  }
})().catch(e => { console.error(e.message); process.exit(1) })
