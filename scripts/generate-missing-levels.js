const fs = require('fs');

// Niveles faltantes que necesitamos crear
const missingLevels = [
  { id: 'inicial-2', name: 'Inicial 2 (4-5 años)' },
  { id: 'segundo-egb', name: '2° EGB (6-7 años)' },
  { id: 'tercero-egb', name: '3° EGB (7-8 años)' }
];

// Plantillas de lecciones por programa
const templates = {
  robotica: [
    { module: 'Introducción a la Tecnología', lessons: [
      { title: '¡Bienvenidos al mundo tech!', type: 'video', duration: '8 min', content: 'Descubriremos juntos el fascinante mundo de la tecnología y los robots.' },
      { title: '¿Qué es un robot?', type: 'video', duration: '10 min', content: 'Los robots son máquinas que pueden moverse y realizar tareas. Aprenderemos sobre sus partes principales.' },
      { title: 'Robots a nuestro alrededor', type: 'activity', duration: '15 min', content: 'Identificaremos robots en nuestra vida diaria: en casa, en la escuela y en la ciudad.' },
      { title: 'Mi robot favorito', type: 'project', duration: '20 min', content: 'Dibujaremos y describiremos nuestro robot favorito, real o imaginario.' }
    ]},
    { module: 'Pensamiento Lógico', lessons: [
      { title: 'Secuencias y patrones', type: 'video', duration: '10 min', content: 'Aprenderemos a identificar y crear patrones: colores, formas y números.' },
      { title: 'Instrucciones paso a paso', type: 'tutorial', duration: '15 min', content: 'Daremos instrucciones claras para completar tareas simples.' },
      { title: 'El juego del robot', type: 'activity', duration: '20 min', content: 'Jugaremos a ser robots siguiendo instrucciones de nuestros compañeros.' },
      { title: 'Laberintos divertidos', type: 'activity', duration: '15 min', content: 'Resolveremos laberintos usando direcciones: arriba, abajo, izquierda, derecha.' }
    ]},
    { module: 'Programación Visual', lessons: [
      { title: '¿Qué es programar?', type: 'video', duration: '8 min', content: 'Programar es dar instrucciones a una computadora para que haga lo que queremos.' },
      { title: 'Conociendo Scratch Jr', type: 'tutorial', duration: '15 min', content: 'Exploraremos la interfaz de Scratch Jr y sus bloques de colores.' },
      { title: 'Mi primer programa', type: 'tutorial', duration: '20 min', content: 'Crearemos nuestro primer programa: hacer que un personaje se mueva.' },
      { title: 'Proyecto: Historia animada', type: 'project', duration: '25 min', content: 'Crearemos una historia corta con personajes que se mueven y hablan.' }
    ]},
    { module: 'Construcción Creativa', lessons: [
      { title: 'Formas y estructuras', type: 'video', duration: '10 min', content: 'Las formas geométricas son la base de todas las construcciones.' },
      { title: 'Construyendo con bloques', type: 'activity', duration: '20 min', content: 'Usaremos bloques para crear torres, puentes y robots.' },
      { title: 'Circuitos simples', type: 'tutorial', duration: '15 min', content: 'Aprenderemos qué es un circuito y cómo fluye la electricidad.' },
      { title: 'Proyecto final: Mi robot', type: 'project', duration: '30 min', content: 'Construiremos un robot simple con materiales reciclados.', locked: true }
    ]}
  ],
  ia: [
    { module: 'Pensamiento Inteligente', lessons: [
      { title: '¿Qué es la inteligencia?', type: 'video', duration: '8 min', content: 'La inteligencia es la capacidad de aprender, resolver problemas y adaptarse.' },
      { title: 'Humanos y máquinas', type: 'video', duration: '10 min', content: 'Comparamos cómo piensan los humanos y cómo "piensan" las máquinas.' },
      { title: '¿Robot o humano?', type: 'activity', duration: '15 min', content: 'Juego para identificar si una acción la hace un robot o un humano.' },
      { title: 'Robots que aprenden', type: 'video', duration: '12 min', content: 'Algunos robots pueden aprender de sus errores, igual que nosotros.' }
    ]},
    { module: 'Clasificación y Patrones', lessons: [
      { title: '¿Qué es clasificar?', type: 'video', duration: '8 min', content: 'Clasificar es organizar cosas en grupos según sus características.' },
      { title: 'Clasificando objetos', type: 'activity', duration: '15 min', content: 'Clasificaremos objetos por color, forma, tamaño y uso.' },
      { title: 'Patrones en la naturaleza', type: 'video', duration: '10 min', content: 'La naturaleza está llena de patrones: flores, conchas, copos de nieve.' },
      { title: 'Proyecto: Mi clasificador', type: 'project', duration: '20 min', content: 'Crearemos nuestro propio sistema de clasificación para juguetes.' }
    ]},
    { module: 'Reconocimiento Visual', lessons: [
      { title: '¿Cómo ven los robots?', type: 'video', duration: '10 min', content: 'Los robots usan cámaras y sensores para "ver" el mundo.' },
      { title: 'Encontrando diferencias', type: 'activity', duration: '15 min', content: 'Buscaremos diferencias entre imágenes, como lo hace una IA.' },
      { title: 'Reconociendo caras', type: 'tutorial', duration: '15 min', content: 'Aprenderemos cómo las computadoras reconocen rostros.' },
      { title: 'Proyecto: Detective visual', type: 'project', duration: '20 min', content: 'Crearemos un juego de encontrar objetos escondidos.' }
    ]},
    { module: 'IA en Nuestra Vida', lessons: [
      { title: 'Asistentes virtuales', type: 'video', duration: '10 min', content: 'Alexa, Siri y Google Assistant son ejemplos de IA que nos ayudan.' },
      { title: 'IA en los juegos', type: 'video', duration: '12 min', content: 'Los videojuegos usan IA para crear enemigos inteligentes.' },
      { title: 'Robots ayudantes', type: 'activity', duration: '15 min', content: 'Diseñaremos un robot ayudante para nuestra casa o escuela.' },
      { title: 'Proyecto final: Mi asistente', type: 'project', duration: '25 min', content: 'Imaginaremos y dibujaremos nuestro propio asistente virtual.', locked: true }
    ]}
  ],
  hacking: [
    { module: 'Seguridad Digital Básica', lessons: [
      { title: '¿Qué es internet?', type: 'video', duration: '8 min', content: 'Internet es una red gigante que conecta computadoras de todo el mundo.' },
      { title: 'Navegando seguros', type: 'video', duration: '10 min', content: 'Aprenderemos reglas básicas para navegar de forma segura.' },
      { title: 'Personas de confianza', type: 'activity', duration: '15 min', content: 'Identificaremos a las personas de confianza con quienes podemos hablar en línea.' },
      { title: 'El semáforo de internet', type: 'activity', duration: '12 min', content: 'Verde: seguro, Amarillo: preguntar a un adulto, Rojo: peligro.' }
    ]},
    { module: 'Contraseñas y Privacidad', lessons: [
      { title: '¿Qué es una contraseña?', type: 'video', duration: '8 min', content: 'Una contraseña es como una llave secreta que protege nuestras cosas.' },
      { title: 'Creando contraseñas fuertes', type: 'tutorial', duration: '15 min', content: 'Aprenderemos a crear contraseñas que sean difíciles de adivinar.' },
      { title: 'Información privada', type: 'video', duration: '10 min', content: 'Hay información que debemos mantener privada: dirección, teléfono, escuela.' },
      { title: 'Proyecto: Mi caja fuerte', type: 'project', duration: '20 min', content: 'Crearemos una lista de información que debemos proteger.' }
    ]},
    { module: 'Comportamiento en Línea', lessons: [
      { title: 'Ser amable en internet', type: 'video', duration: '10 min', content: 'En internet también debemos ser respetuosos y amables con todos.' },
      { title: '¿Qué es el ciberbullying?', type: 'video', duration: '12 min', content: 'El ciberbullying es molestar a otros por internet. Aprenderemos a evitarlo.' },
      { title: 'Pedir ayuda', type: 'activity', duration: '15 min', content: 'Si algo nos hace sentir mal en internet, debemos contarle a un adulto.' },
      { title: 'Proyecto: Reglas digitales', type: 'project', duration: '20 min', content: 'Crearemos un póster con reglas para usar internet de forma segura.' }
    ]},
    { module: 'Detectives Digitales', lessons: [
      { title: '¿Es real o falso?', type: 'video', duration: '10 min', content: 'No todo lo que vemos en internet es verdad. Aprenderemos a identificar lo falso.' },
      { title: 'Verificando información', type: 'tutorial', duration: '15 min', content: 'Técnicas simples para verificar si algo es verdadero.' },
      { title: 'Juego: Verdadero o falso', type: 'activity', duration: '15 min', content: 'Jugaremos a identificar noticias y fotos verdaderas y falsas.' },
      { title: 'Proyecto final: Guardián digital', type: 'project', duration: '25 min', content: 'Nos convertiremos en guardianes digitales de nuestra familia.', locked: true }
    ]}
  ]
};

// Generar CSV
let csv = '';

missingLevels.forEach(level => {
  Object.entries(templates).forEach(([programId, modules]) => {
    let order = 1;
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        const locked = lesson.locked ? 'true' : 'false';
        const videoUrl = lesson.videoUrl || '';
        const content = lesson.content.replace(/"/g, '""');
        csv += `${level.id},${module.module},${lesson.title},${lesson.type},${lesson.duration},${order},${videoUrl},"${content}",${locked},${programId}\n`;
        order++;
      });
    });
  });
});

// Leer CSV existente y agregar nuevos datos
const existingCsv = fs.readFileSync('airtable/lessons_all_levels.csv', 'utf8');
const newCsv = existingCsv.trim() + '\n' + csv;

fs.writeFileSync('airtable/lessons_all_levels.csv', newCsv);

console.log('✅ Agregadas lecciones para niveles faltantes:');
missingLevels.forEach(l => console.log(`   - ${l.id}: ${l.name}`));
console.log(`\nTotal de líneas nuevas: ${csv.split('\n').filter(l => l.trim()).length}`);
