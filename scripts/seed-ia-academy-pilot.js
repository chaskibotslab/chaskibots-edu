/**
 * Seed the "ia" Academy course with 5 pilot grade-level modules, each mapped
 * to a real `levels.id` so the app can auto-assign content by student grade.
 * Each lesson embeds a real AILab activity (activity_type) instead of code.
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

const MODULES = [
  {
    levelId: 'inicial-2',
    slug: 'exploradores-ia',
    title: 'Mis Primeros Amigos Robot',
    description: 'Descubre que las computadoras pueden aprender a ver, jugando',
    icon: '🧸',
    sortOrder: 1,
    lessons: [
      {
        slug: 'adivina-con-la-ia',
        title: 'Juguemos a Adivinar',
        description: 'Mira una foto y compite contra la computadora',
        theory: `# ¿Qué es una computadora inteligente?

Hay computadoras que aprendieron a **reconocer cosas**, ¡igual que tú aprendiste a reconocer a tu perro o tu juguete favorito!

## ¿Cómo aprenden?
Les mostramos MUCHAS fotos de gatos, perros y carros. Poco a poco, la computadora aprende a distinguirlos.

## ¡A jugar!
Vamos a ver quién adivina más rápido: ¿tú o la computadora?`,
        activityType: 'challenge',
        difficulty: 'easy',
        minutes: 8,
        challenge: {
          title: 'Reto: Gana a la IA',
          description: 'Observa la imagen, memoriza qué ves, y adivina antes que la computadora.',
          hints: ['Mira con atención los colores y las formas', 'No hay respuestas malas, ¡solo diviértete!'],
        },
      },
      {
        slug: 'toca-los-colores',
        title: 'Toca los Colores Mágicos',
        description: 'Descubre cómo la IA distingue colores en una imagen',
        theory: `# Las computadoras y los colores

Las computadoras ven las fotos como si fueran hechas de **muchitos puntitos de colores**.

## Actividad
Toca un color en la imagen y observa cómo la computadora encuentra todas las partes de ese mismo color.`,
        activityType: 'segmentation',
        difficulty: 'easy',
        minutes: 8,
        challenge: {
          title: 'Reto: Encuentra 3 colores',
          description: 'Toca 3 colores distintos en la imagen y observa qué partes encuentra la computadora cada vez.',
          hints: ['Prueba tocar el cielo, después un objeto, después el fondo'],
        },
      },
    ],
  },
  {
    levelId: 'cuarto-egb',
    slug: 'detectives-de-objetos',
    title: 'Detectives de Objetos',
    description: 'Aprende cómo una computadora detecta objetos en tiempo real',
    icon: '🔍',
    sortOrder: 1,
    lessons: [
      {
        slug: 'como-ve-una-computadora',
        title: '¿Cómo Ve una Computadora?',
        description: 'Usa tu cámara para ver la detección de objetos en vivo',
        theory: `# ¿Cómo ve una computadora?

Una cámara normal solo **captura** una imagen. Una cámara con IA además **entiende** qué hay en la imagen.

## El truco: los píxeles
Cada foto es una cuadrícula gigante de números (píxeles). La IA analiza patrones en esos números para reconocer formas conocidas: una cara, una silla, un perro.

## Entrenamiento
El modelo que vas a usar (COCO-SSD) fue entrenado con más de 200,000 fotos etiquetadas por humanos, mostrándole "esto es un carro", "esto es un gato", miles de veces.`,
        activityType: 'live',
        difficulty: 'easy',
        minutes: 12,
        challenge: {
          title: 'Reto: Encuentra 5 objetos',
          description: 'Usa la cámara para que la IA detecte al menos 5 objetos diferentes de tu salón o casa. Anota qué porcentaje de confianza tuvo cada uno.',
          hints: ['Buena luz ayuda a que la IA detecte mejor', 'Prueba acercar y alejar el objeto de la cámara'],
        },
      },
      {
        slug: 'etiqueta-como-cientifico',
        title: 'Etiqueta como un Científico de Datos',
        description: 'Dibuja cajas alrededor de objetos, como entrenan a la IA',
        theory: `# Etiquetado de datos

Antes de que una IA pueda reconocer algo, un humano tiene que **enseñarle** dibujando cajas alrededor de los objetos y poniéndoles nombre. A esto se le llama **etiquetado**.

## Tu trabajo hoy
Vas a hacer exactamente lo que hacen los científicos de datos: subir una imagen y etiquetar los objetos que ves, como si estuvieras entrenando a tu propia IA.`,
        activityType: 'annotator',
        difficulty: 'medium',
        minutes: 15,
        challenge: {
          title: 'Reto: Etiqueta 5 objetos',
          description: 'Sube una foto y dibuja cajas alrededor de al menos 5 objetos distintos, poniéndoles el nombre correcto.',
          hints: ['Dibuja la caja lo más ajustada posible al objeto', 'Usa nombres simples y en español'],
        },
      },
    ],
  },
  {
    levelId: 'octavo-egb',
    slug: 'construyendo-modelos',
    title: 'Construyendo Modelos de IA',
    description: 'Entiende qué significa la confianza de un modelo y cómo se equivoca',
    icon: '⚙️',
    sortOrder: 1,
    lessons: [
      {
        slug: 'precision-y-confianza',
        title: 'Precisión y Confianza en IA',
        description: 'Analiza qué significa el porcentaje que muestra la IA',
        theory: `# Precisión y confianza

Cuando la IA detecta un objeto, muestra un porcentaje (ej. "gato 87%"). Ese número es la **confianza** del modelo: qué tan seguro está de su predicción, no una garantía de que esté en lo correcto.

## Falsos positivos y negativos
- **Falso positivo**: la IA "ve" algo que no está ahí
- **Falso negativo**: la IA no detecta algo que sí está ahí

## ¿Por qué falla?
Iluminación, ángulos raros, objetos parcialmente tapados, o simplemente objetos que el modelo nunca vio durante su entrenamiento.`,
        activityType: 'live',
        difficulty: 'medium',
        minutes: 15,
        challenge: {
          title: 'Reto: Caza baja confianza',
          description: 'Encuentra un objeto o ángulo donde la IA detecte algo con menos del 70% de confianza. Explica por qué crees que dudó tanto.',
          hints: ['Prueba con poca luz o ángulos extraños', 'Objetos parcialmente escondidos suelen dar baja confianza'],
        },
      },
      {
        slug: 'segmentacion-de-imagenes',
        title: 'Segmentación: Dividir una Imagen en Partes',
        description: 'Compara la detección de objetos con la segmentación por región',
        theory: `# Segmentación vs. Detección

- **Detección de objetos**: dibuja una caja alrededor de un objeto
- **Segmentación**: identifica EXACTAMENTE qué píxeles pertenecen a cada región

La segmentación es más precisa pero más costosa de calcular — se usa en autos autónomos (saber exactamente dónde termina la carretera) y edición de fotos profesional.`,
        activityType: 'segmentation',
        difficulty: 'medium',
        minutes: 15,
        challenge: {
          title: 'Reto: Bordes difusos',
          description: 'Segmenta 3 colores en una imagen con bordes difusos (como una foto de un atardecer) y ajusta la tolerancia hasta lograr el mejor resultado.',
          hints: ['Sube una foto con degradados de color', 'Ajusta el slider de tolerancia poco a poco'],
        },
      },
    ],
  },
  {
    levelId: 'primero-bach',
    slug: 'ia-en-la-nube',
    title: 'IA en la Nube: Modelos Reales',
    description: 'Compara modelos que corren en tu navegador contra modelos en servidores',
    icon: '🚀',
    sortOrder: 1,
    lessons: [
      {
        slug: 'nube-vs-navegador',
        title: 'Modelos en la Nube vs. en tu Navegador',
        description: 'Compara latencia y precisión entre dos arquitecturas distintas',
        theory: `# Edge computing vs. Cloud computing

## En tu navegador (edge)
El modelo (COCO-SSD) se descarga una vez y corre en tu propio dispositivo. Es rápido, funciona sin conexión después de cargar, pero está limitado por la potencia de tu dispositivo.

## En la nube (cloud)
Envías la imagen a un servidor con GPUs potentes, que corre un modelo más grande (DETR, un transformer) y te devuelve el resultado. Más preciso, pero depende de tu conexión a internet y tiene más latencia (retraso).

## La decisión real
Empresas como Tesla o Apple deciden constantemente: ¿este modelo corre en el dispositivo o en el servidor? Depende de velocidad necesaria, privacidad de los datos, y costo.`,
        activityType: 'cloud',
        difficulty: 'medium',
        minutes: 18,
        challenge: {
          title: 'Reto: Compara arquitecturas',
          description: 'Detecta el mismo objeto primero con la cámara en vivo (pestaña Visión en Vivo) y luego subiendo una foto a IA en la Nube. Compara: ¿cuál tardó más? ¿cuál tuvo mayor confianza?',
          hints: ['Usa el mismo objeto en ambas pruebas para comparar de forma justa', 'Fíjate en el tiempo que tarda en responder cada uno'],
        },
      },
      {
        slug: 'clasificacion-miles-categorias',
        title: 'Clasificación entre Miles de Categorías',
        description: 'Explora cómo un modelo elige entre 1000+ posibles respuestas',
        theory: `# Clasificación de imágenes

A diferencia de la detección (que encuentra VARIOS objetos con posición), la **clasificación** responde una sola pregunta: "de estas 1000 categorías posibles, ¿cuál es la más probable?"

## ImageNet
El modelo que vas a usar (ViT) fue entrenado con ImageNet, un dataset de más de 14 millones de imágenes clasificadas en miles de categorías — desde "labrador retriever" hasta "control remoto".

## Ambigüedad
A veces la IA da varias respuestas con probabilidades parecidas porque el objeto se parece a varias categorías a la vez.`,
        activityType: 'cloud',
        difficulty: 'hard',
        minutes: 18,
        challenge: {
          title: 'Reto: Encuentra la ambigüedad',
          description: 'Sube una foto de un objeto poco común y observa las 5 predicciones. ¿Están muy separadas en porcentaje o muy parecidas entre sí? ¿Por qué crees que pasa eso?',
          hints: ['Objetos genéricos (ej. una taza sin diseño) suelen ser más ambiguos', 'Compara con un objeto muy reconocible, como un teléfono'],
        },
      },
    ],
  },
  {
    levelId: 'universidad',
    slug: 'etica-y-sesgo-ia',
    title: 'Ética y Sesgo en Modelos de IA',
    description: 'Analiza críticamente las limitaciones y sesgos de los modelos que usaste',
    icon: '🧠',
    sortOrder: 1,
    lessons: [
      {
        slug: 'sesgo-en-datos-entrenamiento',
        title: 'Sesgo en los Datos de Entrenamiento',
        description: 'Investiga en qué casos falla el modelo y por qué',
        theory: `# El sesgo no es un bug, es una consecuencia de los datos

Un modelo de IA es tan bueno (y tan sesgado) como los datos con los que fue entrenado. Si un dataset tiene mayoría de fotos tomadas en cierto contexto cultural, iluminación o ángulo, el modelo funcionará peor fuera de ese contexto.

## Casos reales documentados
- Sistemas de reconocimiento facial con peor precisión en tonos de piel oscuros (datasets desbalanceados)
- Clasificadores de "profesiones" que asocian género con ciertos trabajos por sesgo en las imágenes de entrenamiento
- Modelos de detección entrenados mayormente en países desarrollados, que fallan con objetos/vehículos de otros contextos

## Tu rol como futuro profesional
Evaluar críticamente un modelo antes de ponerlo en producción no es opcional — es responsabilidad técnica y ética.`,
        activityType: 'cloud',
        difficulty: 'hard',
        minutes: 20,
        challenge: {
          title: 'Reto: Encuentra el límite del modelo',
          description: 'Prueba el clasificador con objetos poco comunes, mala iluminación, o ángulos inusuales. Documenta al menos 2 casos donde falle o dude mucho, e hipotetiza por qué.',
          hints: ['Los datasets públicos rara vez incluyen objetos "raros" o regionales', 'La iluminación extrema (muy oscuro/muy brillante) es un punto débil común'],
        },
      },
      {
        slug: 'de-teoria-a-producto',
        title: 'De la Teoría a la Práctica',
        description: 'Diseña un caso de uso real aplicando lo que aprendiste',
        theory: `# El pipeline completo de un producto de IA

1. **Datos** → recolectar y etiquetar (como hiciste en el Anotador)
2. **Entrenamiento** → el modelo aprende patrones de esos datos
3. **Evaluación** → medir precisión, recall, sesgo (como en el reto anterior)
4. **Despliegue** → poner el modelo en un servidor (cloud) o en el dispositivo (edge)
5. **Monitoreo** → seguir midiendo qué tan bien funciona con datos reales

## Siguiente paso
Si quieres ir más profundo en construir modelos reales (no solo consumirlos), la Python Academy tiene contenido de Machine Learning aplicado.`,
        activityType: 'live',
        difficulty: 'hard',
        minutes: 20,
        challenge: {
          title: 'Reto: Diseña un producto',
          description: 'Diseña (en papel o texto) un caso de uso real donde usarías detección de objetos: qué problema resuelve, qué datos necesitarías, y qué riesgos éticos deberías considerar.',
          hints: ['Piensa en accesibilidad, agricultura, seguridad, salud, o retail', 'No olvides mencionar un riesgo o limitación del enfoque que elegiste'],
        },
      },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding IA Academy pilot (5 grade levels)\n')

  // 1. Ensure the 'ia' course exists
  let { data: course } = await supabase.from('simulator_courses').select('id').eq('slug', 'ia').maybeSingle()
  if (!course) {
    const { data: newCourse, error } = await supabase
      .from('simulator_courses')
      .insert({
        slug: 'ia',
        title: 'Inteligencia Artificial',
        description: 'Explora IA real con retos por grado: visión por computadora, detección de objetos y modelos en la nube.',
        icon: '🤖',
        color: '#8B5CF6',
        difficulty: 'beginner',
        total_modules: 5,
        total_lessons: 10,
        sort_order: 3,
      })
      .select('id')
      .single()
    if (error) { console.error('❌ No se pudo crear el curso ia:', error.message); process.exit(1) }
    course = newCourse
    console.log('✅ Curso "ia" creado')
  } else {
    console.log('⏭️  Curso "ia" ya existía')
  }

  let modOk = 0, modSkip = 0, lesOk = 0, lesSkip = 0, fail = 0

  for (const mod of MODULES) {
    let { data: moduleRow } = await supabase
      .from('simulator_modules')
      .select('id')
      .eq('course_id', course.id)
      .eq('slug', mod.slug)
      .maybeSingle()

    if (!moduleRow) {
      const { data: newModule, error } = await supabase
        .from('simulator_modules')
        .insert({
          course_id: course.id,
          slug: mod.slug,
          title: mod.title,
          description: mod.description,
          icon: mod.icon,
          sort_order: mod.sortOrder,
          level_id: mod.levelId,
        })
        .select('id')
        .single()
      if (error) { console.log(`  ❌ módulo ${mod.slug}: ${error.message}`); fail++; continue }
      moduleRow = newModule
      modOk++
      console.log(`  ✅ módulo ${mod.slug} (${mod.levelId})`)
    } else {
      modSkip++
      console.log(`  ⏭️  módulo ${mod.slug} ya existía`)
    }

    for (const lesson of mod.lessons) {
      const { data: existing } = await supabase
        .from('simulator_lessons')
        .select('id')
        .eq('module_id', moduleRow.id)
        .eq('slug', lesson.slug)
        .maybeSingle()

      if (existing) {
        console.log(`    ⏭️  lección ${lesson.slug} ya existía`)
        lesSkip++
        continue
      }

      const { error } = await supabase.from('simulator_lessons').insert({
        module_id: moduleRow.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        theory: lesson.theory,
        examples: [],
        challenges: [{
          title: lesson.challenge.title,
          description: lesson.challenge.description,
          starter_code: '',
          expected_output: '',
          hints: lesson.challenge.hints,
        }],
        activity_type: lesson.activityType,
        sort_order: mod.lessons.indexOf(lesson) + 1,
        difficulty: lesson.difficulty,
        estimated_minutes: lesson.minutes,
      })

      if (error) {
        console.log(`    ❌ lección ${lesson.slug}: ${error.message}`)
        fail++
      } else {
        console.log(`    ✅ lección ${lesson.slug}`)
        lesOk++
      }
    }
  }

  console.log(`\n==========================================`)
  console.log(`Módulos: ${modOk} creados, ${modSkip} omitidos`)
  console.log(`Lecciones: ${lesOk} creadas, ${lesSkip} omitidas`)
  console.log(`Fallos: ${fail}`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('❌', err.message)
  process.exit(1)
})
