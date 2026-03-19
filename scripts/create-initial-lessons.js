/**
 * Script para crear lecciones diferenciadas para niveles iniciales
 * Contenido tipo "libro de texto tecnológico" para niños de 3-6 años
 * 
 * Uso: node scripts/create-initial-lessons.js
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
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

// ============================================
// CONTENIDO DIFERENCIADO POR PROGRAMA
// Tipo "Libro de Texto Tecnológico" para niños
// ============================================

const LESSONS_INICIAL_1 = {
  robotica: [
    {
      moduleName: "Descubriendo los Robots",
      title: "¡Hola, soy un Robot!",
      type: "video",
      duration: "8 min",
      order: 1,
      content: "🤖 ¿QUÉ ES UN ROBOT?\n\nUn robot es una máquina especial que puede moverse y hacer cosas por sí sola.\n\n📚 APRENDERÁS:\n• Qué es un robot\n• Partes de un robot: ojos (sensores), cerebro (computadora), manos (motores)\n• Robots que nos ayudan en casa\n\n🎯 ACTIVIDAD:\nDibuja tu robot favorito y ponle un nombre.",
      videoUrl: "https://www.youtube.com/watch?v=R9OHn5ZF4Uo"
    },
    {
      moduleName: "Descubriendo los Robots",
      title: "Robots en mi Casa",
      type: "activity",
      duration: "15 min",
      order: 2,
      content: "🏠 ROBOTS QUE NOS AYUDAN\n\nEn tu casa hay muchas máquinas que trabajan como robots:\n\n• 🧹 Aspiradora robot - limpia el piso sola\n• 🌡️ Termostato - controla la temperatura\n• 📺 Control remoto - envía señales\n\n🎯 ACTIVIDAD:\nBusca en tu casa 3 aparatos que funcionen solos y dibújalos.\n\n✏️ MATERIALES:\n• Hoja de papel\n• Colores o crayones\n• Tu imaginación",
      videoUrl: "https://www.youtube.com/watch?v=R9OHn5ZF4Uo"
    },
    {
      moduleName: "Descubriendo los Robots",
      title: "Mi Primer Circuito",
      type: "tutorial",
      duration: "20 min",
      order: 3,
      content: "💡 ¿CÓMO SE ENCIENDE UNA LUZ?\n\nPara que una luz LED se encienda necesitamos:\n\n1️⃣ PILA - Da la energía (como la comida para nosotros)\n2️⃣ CABLES - Llevan la energía (como las carreteras)\n3️⃣ LED - Se enciende con la energía (como una lamparita)\n\n🔧 CONSTRUYE TU CIRCUITO:\n• Conecta el cable rojo al + de la pila\n• Conecta el LED\n• Conecta el cable negro al - de la pila\n• ¡Tu LED debe encenderse!\n\n⚠️ IMPORTANTE: Pide ayuda a un adulto",
      videoUrl: "https://www.youtube.com/watch?v=PbgEpbMkIaE"
    },
    {
      moduleName: "Colores y Luces",
      title: "LEDs de Colores",
      type: "activity",
      duration: "15 min",
      order: 4,
      content: "🌈 LUCES DE COLORES\n\nLos LEDs pueden ser de muchos colores:\n• 🔴 Rojo\n• 🟢 Verde\n• 🔵 Azul\n• 🟡 Amarillo\n\n📚 DATO CURIOSO:\nMezclando rojo + verde + azul podemos hacer ¡cualquier color!\n\n🎯 ACTIVIDAD:\nUsa tu kit para encender LEDs de diferentes colores.\n\n✅ COMPLETA:\n□ Encendí un LED rojo\n□ Encendí un LED verde\n□ Encendí un LED azul",
      videoUrl: "https://www.youtube.com/watch?v=PbgEpbMkIaE"
    },
    {
      moduleName: "Colores y Luces",
      title: "Proyecto: Semáforo",
      type: "project",
      duration: "25 min",
      order: 5,
      content: "🚦 CONSTRUYE UN SEMÁFORO\n\n¿Sabías que el semáforo es un robot muy simple?\n\n📋 MATERIALES:\n• 3 LEDs (rojo, amarillo, verde)\n• Pila CR2032\n• Cables\n• Cartón para la base\n\n🔧 PASOS:\n1. Dibuja un semáforo en el cartón\n2. Haz 3 agujeros para los LEDs\n3. Coloca los LEDs en orden: rojo arriba, amarillo medio, verde abajo\n4. Conecta los cables a la pila\n5. ¡Enciende cada luz por turnos!\n\n🎯 RETO: ¿Puedes hacer que las luces cambien como un semáforo real?",
      videoUrl: "https://www.youtube.com/watch?v=PbgEpbMkIaE"
    }
  ],
  
  ia: [
    {
      moduleName: "Máquinas que Piensan",
      title: "¿Qué es la Inteligencia Artificial?",
      type: "video",
      duration: "8 min",
      order: 1,
      content: "🧠 MÁQUINAS QUE APRENDEN\n\nLa Inteligencia Artificial (IA) son computadoras que pueden aprender, ¡como tú!\n\n📚 APRENDERÁS:\n• Qué significa 'inteligente'\n• Cómo las máquinas pueden aprender\n• Ejemplos de IA: Alexa, Siri, Google\n\n🎯 ACTIVIDAD:\n¿Has hablado con Alexa o Siri? Cuéntale a tu profesor qué le preguntaste.",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    },
    {
      moduleName: "Máquinas que Piensan",
      title: "Robots que Reconocen Caras",
      type: "activity",
      duration: "15 min",
      order: 2,
      content: "👤 RECONOCIMIENTO FACIAL\n\n¿Sabías que tu tablet puede reconocer tu cara?\n\n🔍 CÓMO FUNCIONA:\n1. La cámara toma una foto de tu cara\n2. La IA busca tus ojos, nariz y boca\n3. Compara con las fotos guardadas\n4. ¡Te reconoce!\n\n🎯 ACTIVIDAD:\nJuego de reconocimiento:\n• Muestra fotos de tu familia\n• ¿Puedes reconocer quién es quién?\n• ¡Tú también tienes inteligencia para reconocer caras!\n\n✏️ DIBUJA: Tu cara con ojos, nariz y boca bien marcados",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    },
    {
      moduleName: "Máquinas que Piensan",
      title: "Clasificar Objetos",
      type: "activity",
      duration: "20 min",
      order: 3,
      content: "📦 APRENDIENDO A CLASIFICAR\n\nLa IA aprende clasificando cosas, ¡igual que tú!\n\n🎯 ACTIVIDAD DE CLASIFICACIÓN:\n\nSepara estos objetos en grupos:\n• 🍎🍌🍊 → FRUTAS\n• 🚗🚌🚲 → VEHÍCULOS\n• 🐕🐈🐰 → ANIMALES\n\n📚 ASÍ APRENDE LA IA:\n1. Ve muchos ejemplos\n2. Encuentra qué tienen en común\n3. Aprende a clasificar nuevos objetos\n\n✅ RETO:\nClasifica los juguetes de tu salón en grupos. ¿Cuántos grupos hiciste?",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    },
    {
      moduleName: "Robots que Escuchan",
      title: "Comandos de Voz",
      type: "activity",
      duration: "15 min",
      order: 4,
      content: "🎤 HABLAR CON MÁQUINAS\n\nPuedes dar órdenes a las máquinas con tu voz:\n• 'Oye Siri, ¿qué hora es?'\n• 'Alexa, pon música'\n• 'Ok Google, cuéntame un chiste'\n\n🎯 JUEGO: SIMÓN DICE ROBOT\n\nUn niño es el 'robot' y debe obedecer comandos:\n• 'Robot, camina 3 pasos'\n• 'Robot, salta 2 veces'\n• 'Robot, gira a la derecha'\n\n📚 APRENDIZAJE:\nLos robots solo entienden comandos claros y específicos.\n\n✏️ ESCRIBE: 3 comandos que le darías a un robot",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    },
    {
      moduleName: "Robots que Escuchan",
      title: "Proyecto: Mi Asistente",
      type: "project",
      duration: "25 min",
      order: 5,
      content: "🤖 CREA TU ASISTENTE VIRTUAL\n\nVamos a crear un asistente de papel que 'responde' preguntas.\n\n📋 MATERIALES:\n• Cartulina\n• Marcadores\n• Tijeras\n• Pegamento\n\n🔧 PASOS:\n1. Dibuja un robot amigable en la cartulina\n2. Hazle una boca que se pueda abrir\n3. Escribe respuestas en papelitos\n4. Cuando alguien pregunte, saca una respuesta\n\n💡 IDEAS DE RESPUESTAS:\n• '¡Hola! ¿En qué te ayudo?'\n• 'Hoy es un día soleado'\n• '2 + 2 = 4'\n\n🎯 PRESENTA tu asistente a la clase",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    }
  ],
  
  hacking: [
    {
      moduleName: "Seguridad Digital",
      title: "¿Qué es la Seguridad en Internet?",
      type: "video",
      duration: "8 min",
      order: 1,
      content: "🔒 ESTAR SEGUROS EN INTERNET\n\nInternet es como una ciudad muy grande. Hay lugares divertidos, pero también debemos tener cuidado.\n\n📚 APRENDERÁS:\n• Qué es internet\n• Por qué debemos cuidarnos\n• Reglas básicas de seguridad\n\n⚠️ REGLA DE ORO:\nNunca compartas tu nombre completo, dirección o teléfono con desconocidos.\n\n🎯 ACTIVIDAD:\nDibuja un candado y escribe: 'Mi información es privada'",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    },
    {
      moduleName: "Seguridad Digital",
      title: "Información Privada",
      type: "activity",
      duration: "15 min",
      order: 2,
      content: "🔐 ¿QUÉ ES PRIVADO?\n\nAlgunas cosas son privadas y no debemos compartirlas:\n\n❌ NO COMPARTIR:\n• Tu nombre completo\n• Tu dirección\n• Tu teléfono\n• Fotos de tu casa\n• Contraseñas\n\n✅ SÍ PUEDES COMPARTIR:\n• Tu color favorito\n• Tu comida favorita\n• Dibujos que haces\n\n🎯 JUEGO: PRIVADO O NO\nEl profesor dice algo y tú respondes si es privado o no:\n• 'Mi perro se llama Max' → ✅\n• 'Vivo en la calle...' → ❌\n• 'Me gusta el helado' → ✅",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    },
    {
      moduleName: "Seguridad Digital",
      title: "Contraseñas Secretas",
      type: "tutorial",
      duration: "20 min",
      order: 3,
      content: "🔑 CONTRASEÑAS SEGURAS\n\nUna contraseña es como la llave de tu casa. ¡Debe ser secreta!\n\n📚 REGLAS PARA CONTRASEÑAS:\n1. No uses tu nombre\n2. No uses '1234' o 'password'\n3. Mezcla letras y números\n4. ¡Nunca la compartas!\n\n💡 EJEMPLO DE CONTRASEÑA BUENA:\n'MiGato3Salta' - Fácil de recordar, difícil de adivinar\n\n🎯 ACTIVIDAD:\nCrea una contraseña secreta usando:\n• Tu animal favorito\n• Un número\n• Una acción\n\nEjemplo: 'Perro5Corre'",
      videoUrl: "https://www.youtube.com/watch?v=t7uuP4FJKdM"
    },
    {
      moduleName: "Amigos en Internet",
      title: "Personas Desconocidas",
      type: "activity",
      duration: "15 min",
      order: 4,
      content: "👥 EXTRAÑOS EN INTERNET\n\nEn internet hay personas que no conocemos. Debemos tener cuidado.\n\n⚠️ SEÑALES DE PELIGRO:\n• Alguien que pide tu foto\n• Alguien que quiere saber dónde vives\n• Alguien que te pide secretos\n• Alguien que te hace sentir incómodo\n\n✅ QUÉ HACER:\n1. No respondas\n2. Cuéntale a un adulto de confianza\n3. Nunca te encuentres con desconocidos\n\n🎯 ACTIVIDAD:\nDibuja a las personas de confianza en tu vida (mamá, papá, profesor, etc.)",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    },
    {
      moduleName: "Amigos en Internet",
      title: "Proyecto: Mi Escudo Digital",
      type: "project",
      duration: "25 min",
      order: 5,
      content: "🛡️ CREA TU ESCUDO DIGITAL\n\nVamos a crear un escudo que te protege en internet.\n\n📋 MATERIALES:\n• Cartulina\n• Colores\n• Tijeras\n• Stickers (opcional)\n\n🔧 PASOS:\n1. Dibuja un escudo grande\n2. Divídelo en 4 partes\n3. En cada parte escribe una regla:\n   • 'No comparto mi dirección'\n   • 'Mis contraseñas son secretas'\n   • 'Cuento a mis papás si algo me asusta'\n   • 'Solo hablo con personas que conozco'\n\n🎯 PRESENTA tu escudo a la clase y explica cada regla",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    }
  ]
};

const LESSONS_INICIAL_2 = {
  robotica: [
    {
      moduleName: "Recordando lo Aprendido",
      title: "¡Bienvenidos de Vuelta!",
      type: "video",
      duration: "8 min",
      order: 1,
      content: "🎉 NUEVO AÑO DE ROBÓTICA\n\n¡Bienvenidos al segundo año! Este año aprenderemos cosas más emocionantes.\n\n📚 REPASO RÁPIDO:\n• Los robots tienen sensores (ojos)\n• Los robots tienen motores (músculos)\n• Los robots tienen computadora (cerebro)\n\n🆕 ESTE AÑO APRENDERÁS:\n• Hacer robots que se mueven\n• Usar energía del viento\n• Construir circuitos más grandes\n\n🎯 ACTIVIDAD:\nCuéntale a tu compañero qué aprendiste el año pasado sobre robots.",
      videoUrl: "https://www.youtube.com/watch?v=R9OHn5ZF4Uo"
    },
    {
      moduleName: "Recordando lo Aprendido",
      title: "Repaso: ¿Qué es un Circuito?",
      type: "activity",
      duration: "10 min",
      order: 2,
      content: "⚡ REPASO DE CIRCUITOS\n\nUn circuito es un camino cerrado por donde viaja la electricidad.\n\n🔄 PARTES DEL CIRCUITO:\n1. FUENTE DE ENERGÍA (pila) → Da la energía\n2. CABLES → Llevan la energía\n3. COMPONENTE (LED, motor) → Usa la energía\n\n📚 REGLA IMPORTANTE:\nEl circuito debe estar CERRADO para funcionar. Si hay un hueco, no funciona.\n\n🎯 ACTIVIDAD:\nDibuja un circuito con:\n• Una pila\n• Dos cables\n• Un LED\n\n¿Está cerrado tu circuito?",
      videoUrl: "https://www.youtube.com/watch?v=PbgEpbMkIaE"
    },
    {
      moduleName: "Recordando lo Aprendido",
      title: "Mis Logros del Año Pasado",
      type: "activity",
      duration: "15 min",
      order: 3,
      content: "🏆 MIS LOGROS EN ROBÓTICA\n\nEl año pasado aprendiste muchas cosas. ¡Celebremos!\n\n✅ MARCA LO QUE APRENDISTE:\n□ Encendí un LED\n□ Hice un circuito\n□ Aprendí los colores de los LEDs\n□ Construí un semáforo\n□ Trabajé en equipo\n\n🎯 ACTIVIDAD:\nDibuja tu proyecto favorito del año pasado.\n\n💬 COMPARTE:\nCuéntale a la clase qué fue lo que más te gustó.",
      videoUrl: "https://www.youtube.com/watch?v=R9OHn5ZF4Uo"
    },
    {
      moduleName: "Energía del Viento",
      title: "¿Qué es la Energía Eólica?",
      type: "video",
      duration: "10 min",
      order: 4,
      content: "💨 ENERGÍA DEL VIENTO\n\nEl viento puede mover cosas y generar electricidad.\n\n📚 APRENDERÁS:\n• Qué es la energía eólica\n• Cómo funcionan los molinos de viento\n• Por qué es energía limpia\n\n🌍 DATO ECOLÓGICO:\nLa energía del viento no contamina. ¡Es amiga del planeta!\n\n🎯 EXPERIMENTO:\nSopla sobre un molinete de papel.\n¿Qué pasa? El viento lo hace girar.\n\n✏️ DIBUJA: Un molino de viento con aspas girando",
      videoUrl: "https://www.youtube.com/watch?v=R9OHn5ZF4Uo"
    },
    {
      moduleName: "Energía del Viento",
      title: "Proyecto: Generador Eólico",
      type: "project",
      duration: "30 min",
      order: 5,
      content: "🌬️ CONSTRUYE UN GENERADOR EÓLICO\n\nVamos a construir un generador que produce electricidad con el viento.\n\n📋 MATERIALES (de tu kit):\n• Generador eólico\n• LED\n• Cables\n• Base de cartón\n\n🔧 PASOS:\n1. Arma las aspas del generador\n2. Conecta los cables al generador\n3. Conecta el LED a los cables\n4. Sopla fuerte sobre las aspas\n5. ¡El LED debe encenderse!\n\n💡 ¿QUÉ PASÓ?\nEl viento gira las aspas → El generador produce electricidad → El LED se enciende\n\n🎯 RETO: ¿Puedes encender 2 LEDs?",
      videoUrl: "https://www.youtube.com/watch?v=R9OHn5ZF4Uo"
    }
  ],
  
  ia: [
    {
      moduleName: "Recordando la IA",
      title: "¡Bienvenidos al Año 2 de IA!",
      type: "video",
      duration: "8 min",
      order: 1,
      content: "🧠 SEGUNDO AÑO DE INTELIGENCIA ARTIFICIAL\n\n¡Hola de nuevo! Este año aprenderemos cosas más avanzadas sobre IA.\n\n📚 REPASO:\n• La IA son máquinas que aprenden\n• Pueden reconocer caras y voces\n• Aprenden clasificando cosas\n\n🆕 ESTE AÑO APRENDERÁS:\n• Cómo la IA toma decisiones\n• Patrones y secuencias\n• Crear tu propia IA simple\n\n🎯 ACTIVIDAD:\n¿Recuerdas qué es la IA? Explícaselo a un compañero con tus palabras.",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    },
    {
      moduleName: "Recordando la IA",
      title: "Repaso: Clasificación",
      type: "activity",
      duration: "12 min",
      order: 2,
      content: "📦 REPASO: CLASIFICAR\n\nLa IA aprende clasificando. ¡Tú también puedes!\n\n🎯 ACTIVIDAD DE REPASO:\n\nClasifica estos animales:\n🐕🐈🐘🐟🦅🐢\n\n• TIENEN PELO: ___\n• VIVEN EN AGUA: ___\n• TIENEN ALAS: ___\n• TIENEN CAPARAZÓN: ___\n\n📚 ASÍ PIENSA LA IA:\n'Este animal tiene pelo y 4 patas → Es un mamífero'\n\n✅ COMPLETA:\nUn animal con plumas y alas es un ___",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    },
    {
      moduleName: "Decisiones",
      title: "Si... Entonces...",
      type: "tutorial",
      duration: "15 min",
      order: 3,
      content: "🤔 TOMANDO DECISIONES\n\nLa IA toma decisiones usando reglas 'SI... ENTONCES...'\n\n📚 EJEMPLOS:\n• SI llueve → ENTONCES uso paraguas\n• SI tengo hambre → ENTONCES como\n• SI el semáforo está rojo → ENTONCES me detengo\n\n🎯 COMPLETA LAS REGLAS:\n\n• SI hace frío → ENTONCES ___\n• SI es de noche → ENTONCES ___\n• SI estoy cansado → ENTONCES ___\n\n🤖 ASÍ DECIDE UN ROBOT:\n'SI hay obstáculo adelante → ENTONCES girar'\n\n✏️ CREA: Tu propia regla SI... ENTONCES...",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    },
    {
      moduleName: "Decisiones",
      title: "El Robot que Decide",
      type: "activity",
      duration: "20 min",
      order: 4,
      content: "🤖 JUEGO: EL ROBOT DECISOR\n\nVamos a jugar a ser robots que toman decisiones.\n\n📋 INSTRUCCIONES:\n1. Un niño es el 'robot'\n2. El profesor da situaciones\n3. El robot decide qué hacer\n\n🎮 SITUACIONES:\n\n1. 'Robot, hay una pared adelante'\n   → ¿Qué haces? (Girar, detenerse...)\n\n2. 'Robot, el piso está mojado'\n   → ¿Qué haces? (Ir despacio, buscar otro camino...)\n\n3. 'Robot, hay un amigo que necesita ayuda'\n   → ¿Qué haces? (Ayudar, llamar a alguien...)\n\n🎯 CREA: Inventa una situación para el robot",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    },
    {
      moduleName: "Patrones",
      title: "Proyecto: Encontrar Patrones",
      type: "project",
      duration: "25 min",
      order: 5,
      content: "🔍 PROYECTO: DETECTIVE DE PATRONES\n\nLa IA es muy buena encontrando patrones. ¡Tú también puedes serlo!\n\n📚 ¿QUÉ ES UN PATRÓN?\nUn patrón es algo que se repite.\n\n🎯 ENCUENTRA EL PATRÓN:\n\n1. 🔴🔵🔴🔵🔴___ (Respuesta: 🔵)\n2. 🌙⭐🌙⭐🌙___ (Respuesta: ⭐)\n3. 1, 2, 1, 2, 1, ___ (Respuesta: 2)\n\n📋 ACTIVIDAD:\n1. Crea tu propio patrón con colores\n2. Pide a un compañero que lo complete\n3. ¡Intercambien roles!\n\n🏆 RETO AVANZADO:\nCrea un patrón con 3 elementos:\n🔴🔵🟢🔴🔵🟢🔴___",
      videoUrl: "https://www.youtube.com/watch?v=WoYCpLPCCV0"
    }
  ],
  
  hacking: [
    {
      moduleName: "Seguridad Año 2",
      title: "¡Bienvenidos Guardianes Digitales!",
      type: "video",
      duration: "8 min",
      order: 1,
      content: "🛡️ SEGUNDO AÑO DE CIBERSEGURIDAD\n\n¡Hola, Guardianes Digitales! Este año seremos expertos en seguridad.\n\n📚 REPASO:\n• La información privada no se comparte\n• Las contraseñas son secretas\n• Debemos tener cuidado con extraños\n\n🆕 ESTE AÑO APRENDERÁS:\n• Detectar mentiras en internet\n• Proteger tus dispositivos\n• Ser un buen ciudadano digital\n\n🎯 ACTIVIDAD:\n¿Recuerdas las 3 reglas de seguridad? Escríbelas.",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    },
    {
      moduleName: "Seguridad Año 2",
      title: "Repaso: Información Privada",
      type: "activity",
      duration: "10 min",
      order: 2,
      content: "🔐 REPASO: ¿QUÉ ES PRIVADO?\n\n🎯 JUEGO RÁPIDO:\nMarca con ❌ lo que NO debes compartir:\n\n□ Tu nombre completo\n□ Tu color favorito\n□ Tu dirección\n□ Tu comida favorita\n□ Tu contraseña\n□ El nombre de tu mascota\n□ Tu número de teléfono\n□ Tu película favorita\n\n✅ RESPUESTAS CORRECTAS:\n❌ Nombre completo, dirección, contraseña, teléfono\n\n📚 RECUERDA:\nSi no estás seguro, ¡pregunta a un adulto!",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    },
    {
      moduleName: "Detectando Mentiras",
      title: "Noticias Falsas",
      type: "tutorial",
      duration: "15 min",
      order: 3,
      content: "🔍 DETECTANDO MENTIRAS EN INTERNET\n\nNo todo lo que ves en internet es verdad. Algunas cosas son mentiras.\n\n⚠️ SEÑALES DE MENTIRA:\n• Títulos muy exagerados: '¡INCREÍBLE!'\n• Fotos que parecen falsas\n• No dice quién lo escribió\n• Pide que compartas rápido\n\n✅ CÓMO VERIFICAR:\n1. Pregunta a un adulto\n2. Busca en otros lugares\n3. Si suena muy loco, probablemente es falso\n\n🎯 ACTIVIDAD:\n¿Cuál es falsa?\nA) 'Los perros tienen 4 patas'\nB) 'Los gatos pueden volar'\n\nRespuesta: B es falsa",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    },
    {
      moduleName: "Detectando Mentiras",
      title: "Verdadero o Falso",
      type: "activity",
      duration: "20 min",
      order: 4,
      content: "🎮 JUEGO: DETECTIVE DE MENTIRAS\n\nVamos a practicar detectando información falsa.\n\n🔍 ¿VERDADERO O FALSO?\n\n1. 'El sol sale por el este' → ___\n2. 'Los peces pueden caminar' → ___\n3. 'Necesitamos agua para vivir' → ___\n4. 'Las piedras pueden hablar' → ___\n5. 'Los árboles nos dan oxígeno' → ___\n\n📚 CONSEJO:\nSi algo suena imposible, probablemente es falso.\n\n🎯 ACTIVIDAD EN GRUPO:\nCada equipo inventa 2 afirmaciones:\n• 1 verdadera\n• 1 falsa\n\nLos otros equipos deben adivinar cuál es cuál.",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    },
    {
      moduleName: "Ciudadano Digital",
      title: "Proyecto: Diploma de Guardián Digital",
      type: "project",
      duration: "25 min",
      order: 5,
      content: "🏆 PROYECTO: TU DIPLOMA DE GUARDIÁN DIGITAL\n\nHas aprendido mucho sobre seguridad. ¡Es hora de celebrar!\n\n📋 CREA TU DIPLOMA:\n\n1. Usa una cartulina bonita\n2. Escribe: 'DIPLOMA DE GUARDIÁN DIGITAL'\n3. Tu nombre\n4. Fecha\n5. Dibuja un escudo\n\n📝 PROMESA DEL GUARDIÁN:\n'Yo prometo:\n✓ Proteger mi información privada\n✓ Usar contraseñas seguras\n✓ No hablar con extraños en internet\n✓ Verificar antes de creer\n✓ Pedir ayuda a adultos'\n\n🎯 FIRMA tu diploma y preséntalo a la clase",
      videoUrl: "https://www.youtube.com/watch?v=yrln8nyVBLU"
    }
  ]
};

async function createRecords(records, levelId) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`;
  
  // Preparar registros con levelId
  const lessonsWithLevel = records.map(r => ({
    ...r,
    levelId: levelId
  }));
  
  // Airtable permite máximo 10 registros por request
  const batches = [];
  for (let i = 0; i < lessonsWithLevel.length; i += 10) {
    batches.push(lessonsWithLevel.slice(i, i + 10));
  }
  
  let created = 0;
  
  for (const batch of batches) {
    const airtableRecords = batch.map(record => ({
      fields: {
        levelId: record.levelId,
        programId: record.programId,
        moduleName: record.moduleName,
        title: record.title,
        type: record.type,
        duration: record.duration,
        order: record.order,
        content: record.content,
        videoUrl: record.videoUrl,
        locked: false,
      }
    }));
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: airtableRecords }),
      });
      
      if (response.ok) {
        const data = await response.json();
        created += data.records.length;
      } else {
        const error = await response.text();
        console.error(`Error: ${error}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
  
  return created;
}

async function main() {
  console.log('📚 Creando lecciones diferenciadas para niveles iniciales...\n');
  console.log('📖 Contenido tipo "Libro de Texto Tecnológico"\n');
  
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('❌ Error: Faltan variables de entorno');
    process.exit(1);
  }
  
  let totalCreated = 0;
  
  // Crear lecciones para inicial-1
  console.log('📗 INICIAL 1 (3-4 años):');
  for (const [programId, lessons] of Object.entries(LESSONS_INICIAL_1)) {
    const lessonsWithProgram = lessons.map(l => ({ ...l, programId }));
    const created = await createRecords(lessonsWithProgram, 'inicial-1');
    console.log(`   ✅ ${programId}: ${created} lecciones creadas`);
    totalCreated += created;
  }
  
  // Crear lecciones para inicial-2
  console.log('\n📘 INICIAL 2 (4-5 años):');
  for (const [programId, lessons] of Object.entries(LESSONS_INICIAL_2)) {
    const lessonsWithProgram = lessons.map(l => ({ ...l, programId }));
    const created = await createRecords(lessonsWithProgram, 'inicial-2');
    console.log(`   ✅ ${programId}: ${created} lecciones creadas`);
    totalCreated += created;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 TOTAL: ${totalCreated} lecciones creadas`);
  console.log('='.repeat(50));
}

main().catch(console.error);
