const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const lessons = [
  {
    levelId: "inicial-2",
    programId: "ia",
    moduleName: "Recordando la IA",
    title: "Bienvenidos al Año 2 de IA",
    type: "video",
    duration: "8 min",
    order: 1,
    content: "🧠 SEGUNDO AÑO DE INTELIGENCIA ARTIFICIAL\n\n¡Hola de nuevo! Este año aprenderemos cosas más avanzadas sobre IA.\n\n📚 REPASO:\n• La IA son máquinas que aprenden\n• Pueden reconocer caras y voces\n• Aprenden clasificando cosas\n\n🆕 ESTE AÑO APRENDERÁS:\n• Cómo la IA toma decisiones\n• Patrones y secuencias\n• Crear tu propia IA simple",
    videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0",
    locked: false
  },
  {
    levelId: "inicial-2",
    programId: "ia",
    moduleName: "Recordando la IA",
    title: "Repaso de Clasificación",
    type: "activity",
    duration: "10 min",
    order: 2,
    content: "📦 REPASO: CLASIFICAR\n\nLa IA aprende clasificando. ¡Tú también puedes!\n\n🎯 ACTIVIDAD DE REPASO:\n\nClasifica estos animales:\n🐕🐈🐘🐟🦅🐢\n\n• TIENEN PELO: ___\n• VIVEN EN AGUA: ___\n• TIENEN ALAS: ___",
    videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0",
    locked: false
  },
  {
    levelId: "inicial-2",
    programId: "ia",
    moduleName: "Decisiones",
    title: "Si Entonces",
    type: "tutorial",
    duration: "15 min",
    order: 3,
    content: "🤔 TOMANDO DECISIONES\n\nLa IA toma decisiones usando reglas SI... ENTONCES...\n\n📚 EJEMPLOS:\n• SI llueve → ENTONCES uso paraguas\n• SI tengo hambre → ENTONCES como\n• SI el semáforo está rojo → ENTONCES me detengo\n\n🎯 COMPLETA LAS REGLAS:\n• SI hace frío → ENTONCES ___\n• SI es de noche → ENTONCES ___",
    videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0",
    locked: false
  },
  {
    levelId: "inicial-2",
    programId: "ia",
    moduleName: "Decisiones",
    title: "El Robot que Decide",
    type: "activity",
    duration: "20 min",
    order: 4,
    content: "🤖 JUEGO: EL ROBOT DECISOR\n\nVamos a jugar a ser robots que toman decisiones.\n\n📋 INSTRUCCIONES:\n1. Un niño es el robot\n2. El profesor da situaciones\n3. El robot decide qué hacer\n\n🎮 SITUACIONES:\n1. Robot, hay una pared adelante → ¿Qué haces?\n2. Robot, el piso está mojado → ¿Qué haces?\n3. Robot, hay un amigo que necesita ayuda → ¿Qué haces?",
    videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0",
    locked: false
  },
  {
    levelId: "inicial-2",
    programId: "ia",
    moduleName: "Patrones",
    title: "Proyecto Encontrar Patrones",
    type: "project",
    duration: "25 min",
    order: 5,
    content: "🔍 PROYECTO: DETECTIVE DE PATRONES\n\nLa IA es muy buena encontrando patrones. ¡Tú también puedes serlo!\n\n📚 ¿QUÉ ES UN PATRÓN?\nUn patrón es algo que se repite.\n\n🎯 ENCUENTRA EL PATRÓN:\n1. 🔴🔵🔴🔵🔴___ (Respuesta: 🔵)\n2. 🌙⭐🌙⭐🌙___ (Respuesta: ⭐)\n3. 1, 2, 1, 2, 1, ___ (Respuesta: 2)\n\n📋 ACTIVIDAD:\nCrea tu propio patrón con colores y pide a un compañero que lo complete.",
    videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0",
    locked: false
  }
];

async function main() {
  console.log('📚 Creando lecciones de IA para inicial-2...\n');
  
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`;
  
  const records = lessons.map(l => ({ fields: l }));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records }),
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log(`✅ ${data.records.length} lecciones de IA creadas para inicial-2`);
  } else {
    const error = await response.text();
    console.error('Error:', error);
  }
}

main().catch(console.error);
