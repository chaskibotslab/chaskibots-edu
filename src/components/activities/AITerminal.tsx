'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  Brain, Terminal, Copy, Download, Trash2, Send, Check,
  Loader2, BookOpen, GraduationCap, ChevronDown, ChevronRight,
  CheckCircle2, Circle, Maximize2, Minimize2, Zap, Trophy,
  X, Code, Package, Sparkles
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

// ============================================================
// TYPES
// ============================================================
interface OutputLine {
  text: string
  type: 'normal' | 'error' | 'success' | 'info' | 'warning' | 'system' | 'input'
}

interface ApiLessonStub { id: string; title: string; order_index: number; difficulty: string }
interface ApiModule { id: string; title: string; icon: string; order_index: number; lessons: ApiLessonStub[] }
interface ApiLessonFull extends ApiLessonStub {
  description: string; theory: string; estimated_minutes: number
  examples: { code: string; explanation: string }[]
  challenges: { title: string; description: string; hints: string[]; starter_code?: string }[]
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: '🟢 Fácil', medium: '🟡 Medio', hard: '🔴 Difícil' }
const DIFFICULTY_COLOR: Record<string, string> = { easy: 'bg-green-500/10 text-green-400', medium: 'bg-yellow-500/10 text-yellow-400', hard: 'bg-red-500/10 text-red-400' }

// ============================================================
// PACKAGES
// ============================================================
const AVAILABLE_PACKAGES: Record<string, { name: string; version: string; desc: string }> = {
  numpy: { name: 'numpy', version: '1.26.4', desc: 'Computación numérica con arrays' },
  pandas: { name: 'pandas', version: '2.2.1', desc: 'Análisis de datos tabulares' },
  tensorflow: { name: 'tensorflow', version: '2.16.1', desc: 'Deep learning (Google)' },
  keras: { name: 'keras', version: '3.3.3', desc: 'API alto nivel para redes neuronales' },
  torch: { name: 'torch', version: '2.3.0', desc: 'PyTorch (Meta)' },
  'scikit-learn': { name: 'scikit-learn', version: '1.4.2', desc: 'ML clásico' },
  sklearn: { name: 'scikit-learn', version: '1.4.2', desc: 'ML clásico (alias)' },
  matplotlib: { name: 'matplotlib', version: '3.8.4', desc: 'Visualización de datos' },
  'opencv-python': { name: 'opencv-python', version: '4.9.0', desc: 'Visión por computadora' },
  cv2: { name: 'opencv-python', version: '4.9.0', desc: 'OpenCV (alias)' },
  transformers: { name: 'transformers', version: '4.40.1', desc: 'Modelos de lenguaje (GPT, BERT)' },
  nltk: { name: 'nltk', version: '3.8.1', desc: 'Procesamiento de lenguaje natural' },
  seaborn: { name: 'seaborn', version: '0.13.2', desc: 'Visualización estadística' },
  gradio: { name: 'gradio', version: '4.31.0', desc: 'Interfaces web para ML' },
  openai: { name: 'openai', version: '1.30.1', desc: 'API de OpenAI' },
  'stable-diffusion': { name: 'diffusers', version: '0.28.0', desc: 'Generación de imágenes' },
  langchain: { name: 'langchain', version: '0.2.1', desc: 'Apps con LLMs' },
  fastapi: { name: 'FastAPI', version: '0.111.0', desc: 'Framework web para APIs' },
}

// ============================================================
// VIRTUAL FILE SYSTEM
// ============================================================
const FS: Record<string, any> = {
  '/home/ai-lab': { type: 'dir', children: ['proyectos', 'datasets', 'modelos', 'notebooks', 'README.md'] },
  '/home/ai-lab/README.md': { type: 'file', content: '# AI Lab - ChaskiBots\n\nComandos: help, pip install, python, model, dataset, train, predict, cv2, nlp, gpt, mission' },
  '/home/ai-lab/proyectos': { type: 'dir', children: ['clasificador', 'chatbot', 'detector'] },
  '/home/ai-lab/proyectos/clasificador': { type: 'dir', children: ['train.py', 'model.py'] },
  '/home/ai-lab/proyectos/clasificador/train.py': { type: 'file', content: 'import tensorflow as tf\nfrom tensorflow.keras import layers, models\n\n(x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()\nx_train = x_train / 255.0\n\nmodel = models.Sequential([\n    layers.Conv2D(32, (3,3), activation="relu", input_shape=(32,32,3)),\n    layers.MaxPooling2D((2,2)),\n    layers.Conv2D(64, (3,3), activation="relu"),\n    layers.Flatten(),\n    layers.Dense(64, activation="relu"),\n    layers.Dense(10, activation="softmax")\n])\n\nmodel.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])\nmodel.fit(x_train, y_train, epochs=10)\nprint("Entrenamiento completado")' },
  '/home/ai-lab/proyectos/clasificador/model.py': { type: 'file', content: 'from keras.models import Sequential\nfrom keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout\n\ndef create_cnn(input_shape=(32,32,3), num_classes=10):\n    model = Sequential([\n        Conv2D(32, (3,3), activation="relu", input_shape=input_shape),\n        MaxPooling2D((2,2)),\n        Conv2D(64, (3,3), activation="relu"),\n        Flatten(),\n        Dense(128, activation="relu"),\n        Dropout(0.5),\n        Dense(num_classes, activation="softmax")\n    ])\n    return model' },
  '/home/ai-lab/proyectos/chatbot': { type: 'dir', children: ['chatbot.py', 'intents.json'] },
  '/home/ai-lab/proyectos/chatbot/chatbot.py': { type: 'file', content: 'from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\nimport numpy as np\n\nintents = {"saludo": ["hola","hey"], "despedida": ["adiós","bye"], "ayuda": ["help","ayuda"]}\nresponses = {"saludo": "¡Hola!", "despedida": "¡Adiós!", "ayuda": "¿En qué ayudo?"}\n\nvectorizer = TfidfVectorizer()\nall_texts = [t for texts in intents.values() for t in texts]\nlabels = [k for k, texts in intents.items() for _ in texts]\nX = vectorizer.fit_transform(all_texts)\n\ndef predict(msg):\n    vec = vectorizer.transform([msg])\n    sim = cosine_similarity(vec, X)\n    return responses[labels[np.argmax(sim)]]\n\nprint(predict("hola"))' },
  '/home/ai-lab/proyectos/chatbot/intents.json': { type: 'file', content: '{"intents":[{"tag":"saludo","patterns":["hola","hey"],"responses":["¡Hola!"]},{"tag":"despedida","patterns":["adiós","bye"],"responses":["¡Hasta luego!"]}]}' },
  '/home/ai-lab/proyectos/detector': { type: 'dir', children: ['detect.py'] },
  '/home/ai-lab/proyectos/detector/detect.py': { type: 'file', content: 'import cv2\nimport numpy as np\n\ncap = cv2.VideoCapture(0)\nwhile True:\n    ret, frame = cap.read()\n    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n    edges = cv2.Canny(gray, 100, 200)\n    cv2.imshow("Detección", edges)\n    if cv2.waitKey(1) & 0xFF == ord("q"): break\ncap.release()\ncv2.destroyAllWindows()' },
  '/home/ai-lab/datasets': { type: 'dir', children: ['iris.csv', 'titanic.csv', 'spam.csv'] },
  '/home/ai-lab/datasets/iris.csv': { type: 'file', content: 'sepal_length,sepal_width,petal_length,petal_width,species\n5.1,3.5,1.4,0.2,setosa\n7.0,3.2,4.7,1.4,versicolor\n6.3,3.3,6.0,2.5,virginica' },
  '/home/ai-lab/datasets/titanic.csv': { type: 'file', content: 'PassengerId,Survived,Pclass,Name,Sex,Age\n1,0,3,"Braund Mr.",male,22\n2,1,1,"Cumings Mrs.",female,38\n3,1,3,"Heikkinen Miss.",female,26' },
  '/home/ai-lab/datasets/spam.csv': { type: 'file', content: 'text,label\n"Ganaste un premio!",spam\n"Hola, nos vemos mañana",ham\n"URGENTE: cuenta bloqueada",spam' },
  '/home/ai-lab/modelos': { type: 'dir', children: ['clasificador.h5', 'chatbot.pkl'] },
  '/home/ai-lab/modelos/clasificador.h5': { type: 'file', content: '[Modelo Keras - 15.2MB] CNN, CIFAR-10, acc=0.87' },
  '/home/ai-lab/modelos/chatbot.pkl': { type: 'file', content: '[Modelo SKLearn - 2.1MB] TF-IDF, 4 intents, acc=0.92' },
  '/home/ai-lab/notebooks': { type: 'dir', children: ['intro_ml.ipynb', 'neural_nets.ipynb', 'cv_basics.ipynb'] },
  '/home/ai-lab/notebooks/intro_ml.ipynb': { type: 'file', content: '# Intro ML\n\n## Tipos:\n1. Supervisado (clasificación, regresión)\n2. No supervisado (clustering)\n3. Refuerzo (recompensas)\n\n## Flujo: Datos → Preprocesar → Modelo → Entrenar → Evaluar → Deploy' },
  '/home/ai-lab/notebooks/neural_nets.ipynb': { type: 'file', content: '# Redes Neuronales\n\nNeurona: inputs × weights + bias → activation\nCapas: Input → Hidden → Output\n\nActivaciones: ReLU, Sigmoid, Softmax\nOptimizer: Adam, SGD\nLoss: CrossEntropy, MSE' },
  '/home/ai-lab/notebooks/cv_basics.ipynb': { type: 'file', content: '# Computer Vision\n\ncv2.imread() - Leer imagen\ncv2.cvtColor() - Convertir color\ncv2.Canny() - Detectar bordes\ncv2.CascadeClassifier() - Detectar rostros\ncv2.VideoCapture(0) - Abrir cámara' },
}

// ============================================================
// MISSIONS
// ============================================================
interface MissionStep {
  id: string; title: string; description: string; hint: string
  validator: (cmd: string, history: string[]) => boolean
  successMessage: string; xp: number
}
interface Mission {
  id: string; title: string; briefing: string; difficulty: 'easy' | 'medium' | 'hard'
  xpTotal: number; steps: MissionStep[]; completionFlag: string; debriefing: string
}

const MISSIONS: Mission[] = [
  {
    id: 'first-nn', title: '🧠 Misión 1: Tu Primera Red Neuronal',
    briefing: 'Crea y entrena una red neuronal para clasificar dígitos MNIST.',
    difficulty: 'easy', xpTotal: 150,
    steps: [
      { id: 's1', title: 'Instalar TensorFlow', description: 'Instala la librería de deep learning', hint: 'pip install tensorflow', validator: (cmd) => cmd.includes('pip install') && (cmd.includes('tensorflow') || cmd.includes('keras')), successMessage: '✅ TensorFlow instalado', xp: 20 },
      { id: 's2', title: 'Cargar Dataset MNIST', description: 'Carga el dataset de dígitos', hint: 'dataset load mnist', validator: (cmd) => cmd.includes('dataset') && cmd.includes('mnist'), successMessage: '✅ MNIST cargado (60k imágenes)', xp: 25 },
      { id: 's3', title: 'Crear Modelo', description: 'Crea una red neuronal Sequential', hint: 'model create sequential', validator: (cmd) => cmd.includes('model') && cmd.includes('create'), successMessage: '✅ Modelo Sequential creado', xp: 35 },
      { id: 's4', title: 'Entrenar', description: 'Entrena la red neuronal', hint: 'train mnist_model', validator: (cmd) => cmd.includes('train'), successMessage: '✅ Accuracy: 0.97', xp: 40 },
      { id: 's5', title: 'Predecir', description: 'Clasifica un dígito', hint: 'predict digit_7.png', validator: (cmd) => cmd.includes('predict'), successMessage: '✅ Predicción: "7" (98.5%)', xp: 30 },
    ],
    completionFlag: 'FLAG{n3ur4l_n3tw0rk_m4st3r}',
    debriefing: '📋 REPORTE:\n  ✓ Red neuronal con capas Dense\n  ✓ Entrenada con MNIST (97% acc)\n  ✓ Conceptos: layers, activations, backprop',
  },
  {
    id: 'cv-mission', title: '📷 Misión 2: Visión por Computadora',
    briefing: 'Construye un detector de objetos con OpenCV.',
    difficulty: 'medium', xpTotal: 200,
    steps: [
      { id: 's1', title: 'Instalar OpenCV', description: 'Instala la librería de visión', hint: 'pip install opencv-python', validator: (cmd) => cmd.includes('pip install') && (cmd.includes('opencv') || cmd.includes('cv2')), successMessage: '✅ OpenCV instalado', xp: 20 },
      { id: 's2', title: 'Abrir Cámara', description: 'Inicializa captura de video', hint: 'cv2 open_camera', validator: (cmd) => (cmd.includes('cv2') && cmd.includes('camera')) || cmd.includes('VideoCapture'), successMessage: '✅ Cámara: 640x480 @ 30fps', xp: 30 },
      { id: 's3', title: 'Detectar Bordes', description: 'Aplica Canny edge detection', hint: 'cv2 canny', validator: (cmd) => cmd.includes('canny') || cmd.includes('edge') || cmd.includes('borde'), successMessage: '✅ 847 bordes detectados', xp: 40 },
      { id: 's4', title: 'Detectar Rostros', description: 'Usa Haar Cascades', hint: 'cv2 detect_faces', validator: (cmd) => cmd.includes('face') || cmd.includes('rostro') || cmd.includes('haar'), successMessage: '✅ 2 rostros detectados', xp: 50 },
      { id: 's5', title: 'Guardar Resultado', description: 'Guarda la imagen procesada', hint: 'cv2 save resultado.png', validator: (cmd) => cmd.includes('save') || cmd.includes('guardar') || cmd.includes('imwrite'), successMessage: '✅ resultado.png guardado', xp: 60 },
    ],
    completionFlag: 'FLAG{c0mput3r_v1s10n_pr0}',
    debriefing: '📋 REPORTE:\n  ✓ OpenCV para captura de video\n  ✓ Canny edge detection\n  ✓ Haar Cascade face detection\n  ✓ Conceptos: frames, kernels, cascadas',
  },
  {
    id: 'data-science', title: '📊 Misión 3: Data Science',
    briefing: 'Analiza el Titanic para predecir supervivientes.',
    difficulty: 'easy', xpTotal: 180,
    steps: [
      { id: 's1', title: 'Instalar Pandas', description: 'Instala herramientas de análisis', hint: 'pip install pandas scikit-learn', validator: (cmd) => cmd.includes('pip install') && (cmd.includes('pandas') || cmd.includes('scikit')), successMessage: '✅ Pandas + Sklearn instalados', xp: 15 },
      { id: 's2', title: 'Cargar Titanic', description: 'Carga el dataset', hint: 'dataset load titanic', validator: (cmd) => cmd.includes('dataset') && cmd.includes('titanic'), successMessage: '✅ 891 pasajeros cargados', xp: 25 },
      { id: 's3', title: 'Analizar', description: 'Explora estadísticas', hint: 'analyze o describe', validator: (cmd) => cmd.includes('describe') || cmd.includes('analyz') || cmd.includes('info') || cmd.includes('head'), successMessage: '✅ 38% sobrevivieron, edad media=29.7', xp: 35 },
      { id: 's4', title: 'Preprocesar', description: 'Limpia datos faltantes', hint: 'preprocess titanic', validator: (cmd) => cmd.includes('preprocess') || cmd.includes('clean') || cmd.includes('fillna'), successMessage: '✅ Datos limpiados y codificados', xp: 40 },
      { id: 's5', title: 'Entrenar Clasificador', description: 'Random Forest', hint: 'train titanic_model', validator: (cmd) => cmd.includes('train'), successMessage: '✅ Random Forest: acc=0.82', xp: 45 },
      { id: 's6', title: 'Predecir', description: 'Predice supervivencia', hint: 'predict female 25 1st-class', validator: (cmd) => cmd.includes('predict'), successMessage: '✅ Sobrevive (91.3%)', xp: 20 },
    ],
    completionFlag: 'FLAG{d4t4_sc13nt1st}',
    debriefing: '📋 REPORTE:\n  ✓ EDA del Titanic\n  ✓ Preprocessing completo\n  ✓ Random Forest (82% acc)\n  ✓ Conceptos: EDA, features, clasificación',
  },
  {
    id: 'nlp-chatbot', title: '💬 Misión 4: Chatbot con NLP',
    briefing: 'Crea un chatbot que entiende intenciones del usuario.',
    difficulty: 'medium', xpTotal: 220,
    steps: [
      { id: 's1', title: 'Instalar NLP', description: 'Instala NLTK/Transformers', hint: 'pip install nltk transformers', validator: (cmd) => cmd.includes('pip install') && (cmd.includes('nltk') || cmd.includes('transformers')), successMessage: '✅ NLTK + Transformers instalados', xp: 20 },
      { id: 's2', title: 'Tokenizar', description: 'Divide texto en tokens', hint: 'nlp tokenize "Hola mundo"', validator: (cmd) => cmd.includes('tokeniz'), successMessage: '✅ 5 tokens generados', xp: 30 },
      { id: 's3', title: 'Crear Intenciones', description: 'Define el mapa de intents', hint: 'nlp create_intents', validator: (cmd) => cmd.includes('intent'), successMessage: '✅ 4 intenciones, 12 patrones', xp: 40 },
      { id: 's4', title: 'Entrenar Chatbot', description: 'Entrena clasificador de intents', hint: 'train chatbot', validator: (cmd) => cmd.includes('train') || (cmd.includes('python') && cmd.includes('chatbot')), successMessage: '✅ Chatbot: TF-IDF, acc=0.95', xp: 50 },
      { id: 's5', title: 'Probar', description: 'Envía un mensaje al bot', hint: 'chat "hola, cómo estás?"', validator: (cmd) => cmd.includes('chat') && (cmd.includes('"') || cmd.includes("'")), successMessage: '✅ Bot respondió correctamente', xp: 40 },
      { id: 's6', title: 'Desplegar API', description: 'Crea REST API', hint: 'deploy chatbot', validator: (cmd) => cmd.includes('deploy') || cmd.includes('flask') || cmd.includes('serve'), successMessage: '✅ API en localhost:5000', xp: 40 },
    ],
    completionFlag: 'FLAG{nlp_ch4tb0t_m4st3r}',
    debriefing: '📋 REPORTE:\n  ✓ Tokenización implementada\n  ✓ Chatbot con TF-IDF (95% acc)\n  ✓ API REST desplegada\n  ✓ Conceptos: NLP, intents, vectorización',
  },
  {
    id: 'gen-ai', title: '🎨 Misión 5: IA Generativa',
    briefing: 'Genera imágenes y texto con modelos generativos.',
    difficulty: 'hard', xpTotal: 300,
    steps: [
      { id: 's1', title: 'Instalar', description: 'Instala diffusers/openai', hint: 'pip install stable-diffusion openai', validator: (cmd) => cmd.includes('pip install') && (cmd.includes('stable') || cmd.includes('diffus') || cmd.includes('openai')), successMessage: '✅ Diffusers + OpenAI instalados', xp: 25 },
      { id: 's2', title: 'Cargar SD', description: 'Carga Stable Diffusion', hint: 'model load stable-diffusion', validator: (cmd) => cmd.includes('model') && (cmd.includes('load') || cmd.includes('stable')), successMessage: '✅ SD v2.1 cargado (4.2GB)', xp: 40 },
      { id: 's3', title: 'Generar Imagen', description: 'Text-to-image', hint: 'generate "un robot futurista"', validator: (cmd) => cmd.includes('generate') && (cmd.includes('"') || cmd.includes("'")), successMessage: '✅ Imagen generada (512x512)', xp: 60 },
      { id: 's4', title: 'Prompt Engineering', description: 'Mejora prompts', hint: 'generate "prompt" --steps 75', validator: (cmd) => cmd.includes('generate') && cmd.includes('--'), successMessage: '✅ Imagen mejorada con params', xp: 50 },
      { id: 's5', title: 'Generar Texto', description: 'Usa un LLM', hint: 'gpt "explica redes neuronales"', validator: (cmd) => cmd.includes('gpt') || cmd.includes('llm'), successMessage: '✅ GPT generó respuesta', xp: 55 },
      { id: 's6', title: 'Fine-Tuning', description: 'Adapta modelo', hint: 'finetune gpt --epochs 3', validator: (cmd) => cmd.includes('finetune') || cmd.includes('fine-tune'), successMessage: '✅ Fine-tuning: -40% perplexity', xp: 70 },
    ],
    completionFlag: 'FLAG{g3n3r4t1v3_41_m4st3r}',
    debriefing: '📋 REPORTE:\n  ✓ Stable Diffusion text-to-image\n  ✓ Prompt engineering avanzado\n  ✓ GPT/LLM text generation\n  ✓ Fine-tuning conceptual\n  ✓ Conceptos: diffusion, transformers, attention',
  },
]

// ============================================================
// COMMAND PROCESSOR
// ============================================================
function processCommand(
  input: string, cwd: string, setCwd: (p: string) => void,
  history: string[], installed: Set<string>,
  setInstalled: (fn: (prev: Set<string>) => Set<string>) => void,
): OutputLine[] {
  const parts = input.trim().split(/\s+/)
  const cmd = parts[0]?.toLowerCase()
  const args = parts.slice(1)

  const resolvePath = (p: string): string => {
    if (!p) return cwd
    if (p === '~') return '/home/ai-lab'
    if (p.startsWith('~/')) return '/home/ai-lab/' + p.slice(2)
    if (p.startsWith('/')) return p
    if (p === '..') { const s = cwd.split('/').filter(Boolean); s.pop(); return '/' + s.join('/') }
    if (p === '.') return cwd
    return cwd === '/' ? `/${p}` : `${cwd}/${p}`
  }

  switch (cmd) {
    case 'ls': {
      const t = resolvePath(args[0] || '')
      const n = FS[t]
      if (!n) return [{ text: `ls: '${args[0] || t}': No existe`, type: 'error' }]
      if (n.type !== 'dir') return [{ text: t.split('/').pop() || '', type: 'normal' }]
      return [{ text: (n.children || []).map((c: string) => { const cn = FS[t === '/' ? `/${c}` : `${t}/${c}`]; return cn?.type === 'dir' ? `${c}/` : c }).join('  '), type: 'normal' }]
    }
    case 'cd': {
      const t = resolvePath(args[0] || '~')
      const n = FS[t]
      if (!n) return [{ text: `cd: ${args[0]}: No existe`, type: 'error' }]
      if (n.type !== 'dir') return [{ text: `cd: ${args[0]}: No es directorio`, type: 'error' }]
      setCwd(t); return []
    }
    case 'pwd': return [{ text: cwd, type: 'normal' }]
    case 'cat': {
      if (!args[0]) return [{ text: 'cat: falta archivo', type: 'error' }]
      const t = resolvePath(args[0]); const n = FS[t]
      if (!n) return [{ text: `cat: ${args[0]}: No existe`, type: 'error' }]
      if (n.type === 'dir') return [{ text: `cat: Es directorio`, type: 'error' }]
      return n.content.split('\n').map((l: string) => ({ text: l, type: 'normal' as const }))
    }
    case 'pip': {
      const sub = args[0]
      if (sub === 'install') {
        const pkg = AVAILABLE_PACKAGES[args[1]?.toLowerCase()]
        if (!args[1]) return [{ text: 'uso: pip install <paquete>', type: 'error' }]
        if (!pkg) return [{ text: `ERROR: '${args[1]}' no encontrado. Usa: pip search`, type: 'error' }, { text: `Disponibles: ${Object.keys(AVAILABLE_PACKAGES).filter(k => !['sklearn','cv2'].includes(k)).join(', ')}`, type: 'info' }]
        if (installed.has(pkg.name)) return [{ text: `Already satisfied: ${pkg.name}==${pkg.version}`, type: 'warning' }]
        setInstalled(prev => new Set([...prev, pkg.name]))
        return [
          { text: `Collecting ${pkg.name}`, type: 'normal' },
          { text: `  Downloading ${pkg.name}-${pkg.version}.whl (${(Math.random()*50+5).toFixed(1)} MB)`, type: 'normal' },
          { text: `Successfully installed ${pkg.name}-${pkg.version}`, type: 'success' },
          { text: `📦 ${pkg.desc}`, type: 'info' },
        ]
      }
      if (sub === 'list') {
        if (installed.size <= 2) return [{ text: 'Sin paquetes extra. Usa: pip install <paquete>', type: 'warning' }]
        return [{ text: 'Package              Version', type: 'info' }, { text: '─'.repeat(35), type: 'system' },
          ...Array.from(installed).filter(n => n !== 'pip' && n !== 'setuptools').map(name => {
            const p = Object.values(AVAILABLE_PACKAGES).find(pp => pp.name === name)
            return { text: `${(p?.name||name).padEnd(20)} ${p?.version||'?'}`, type: 'normal' as const }
          })]
      }
      if (sub === 'search') {
        const q = args[1]?.toLowerCase() || ''
        const res = Object.entries(AVAILABLE_PACKAGES).filter(([k,v]) => (k.includes(q)||v.desc.toLowerCase().includes(q)) && !['sklearn','cv2'].includes(k))
        return res.length ? [{ text: `Resultados:`, type: 'info' }, ...res.map(([,p]) => ({ text: `  ${p.name} (${p.version}) — ${p.desc}`, type: 'normal' as const }))] : [{ text: 'Sin resultados', type: 'warning' }]
      }
      return [{ text: 'uso: pip install|list|search', type: 'error' }]
    }
    case 'python': case 'python3': {
      if (!args[0]) return [{ text: 'Python 3.12.3 (ChaskiBots AI Lab)', type: 'info' }, { text: 'Usa: python <archivo.py>', type: 'normal' }]
      const fp = resolvePath(args[0]); const n = FS[fp]
      if (!n || n.type === 'dir') return [{ text: `can't open '${args[0]}'`, type: 'error' }]
      const lines = n.content.split('\n')
      return [{ text: `▶ Ejecutando ${args[0]}...`, type: 'info' }, { text: '─'.repeat(40), type: 'system' }, ...lines.slice(-4).map((l: string) => ({ text: `  ${l}`, type: 'normal' as const })), { text: '─'.repeat(40), type: 'system' }, { text: `✅ Completado (${(Math.random()*3+0.5).toFixed(2)}s)`, type: 'success' }]
    }
    case 'model': {
      const sub = args[0]
      if (sub === 'create') {
        const t = args[1] || 'sequential'
        const archs: Record<string, string[]> = {
          sequential: ['Input(784)', 'Dense(128, relu)', 'Dense(64, relu)', 'Dense(10, softmax)'],
          cnn: ['Conv2D(32, 3x3, relu)', 'MaxPool2D(2x2)', 'Conv2D(64, 3x3, relu)', 'Flatten', 'Dense(10, softmax)'],
          rnn: ['Embedding(10000, 128)', 'LSTM(64)', 'Dense(1, sigmoid)'],
          transformer: ['MultiHeadAttention(8)', 'LayerNorm', 'FFN(512)', 'Dense(vocab, softmax)'],
          gan: ['Generator: Dense(256)→Dense(784,tanh)', 'Discriminator: Dense(512)→Dense(1,sigmoid)'],
        }
        const layers = archs[t.toLowerCase()] || archs.sequential
        return [{ text: `🧠 Modelo "${t}" creado:`, type: 'success' }, ...layers.map((l,i) => ({ text: `  Layer ${i}: ${l}`, type: 'info' as const })), { text: `  Params: ${(Math.random()*900000+100000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, type: 'normal' }]
      }
      if (sub === 'load') return [{ text: `✅ Modelo "${args[1]||'model'}" cargado`, type: 'success' }]
      if (sub === 'list') return [{ text: 'Modelos: clasificador.h5, chatbot.pkl, resnet50, yolov8n, bert-base, gpt2, stable-diffusion', type: 'info' }]
      if (sub === 'summary') return [{ text: 'Model: Sequential | Params: 109,386 | Layers: 4', type: 'info' }]
      return [{ text: 'uso: model create|load|list|summary', type: 'error' }]
    }
    case 'dataset': {
      const sub = args[0]
      if (sub === 'load') {
        const n = args[1]?.toLowerCase() || ''
        const ds: Record<string, string> = { mnist: '60k imgs 28x28, 10 clases', cifar10: '60k imgs 32x32 RGB, 10 clases', iris: '150 muestras, 3 clases', titanic: '891 pasajeros, 12 cols', spam: '5.5k msgs, 2 clases', imdb: '50k reviews, 2 clases' }
        if (ds[n]) return [{ text: `✅ Dataset ${n} cargado: ${ds[n]}`, type: 'success' }]
        return [{ text: `Disponibles: ${Object.keys(ds).join(', ')}`, type: 'error' }]
      }
      if (sub === 'list') return [{ text: 'Datasets: mnist, cifar10, iris, titanic, spam, imdb', type: 'info' }]
      return [{ text: 'uso: dataset load|list', type: 'error' }]
    }
    case 'train': {
      const m = args[0] || 'modelo'
      const lines: OutputLine[] = [{ text: `🏋️ Entrenando "${m}"...`, type: 'info' }]
      for (let i = 1; i <= 5; i++) lines.push({ text: `  Epoch ${i}/5 ━━━━━━━━━━━━━━━━ loss: ${(2.3-i*0.4+Math.random()*0.1).toFixed(4)} acc: ${(0.3+i*0.13).toFixed(4)}`, type: 'normal' })
      lines.push({ text: `✅ Completado. Accuracy: ${(0.85+Math.random()*0.12).toFixed(4)}`, type: 'success' })
      return lines
    }
    case 'predict': {
      if (!args[0]) return [{ text: 'uso: predict <datos>', type: 'error' }]
      const preds = ['gato','7','spam','positivo','sobrevive','setosa']
      return [{ text: `🔮 Resultado: "${preds[Math.floor(Math.random()*preds.length)]}" (${(85+Math.random()*14).toFixed(1)}%)`, type: 'success' }]
    }
    case 'cv2': case 'opencv': {
      const sub = args[0]
      if (sub === 'open_camera' || sub === 'camera') return [{ text: '📷 Cámara activa: 640x480 @ 30fps', type: 'success' }]
      if (sub === 'canny' || sub === 'edges') return [{ text: `✅ Canny: ${Math.floor(Math.random()*1500+500)} bordes`, type: 'success' }]
      if (sub === 'detect_faces' || sub === 'faces') return [{ text: `✅ ${Math.floor(Math.random()*3+1)} rostro(s) detectado(s)`, type: 'success' }]
      if (sub === 'save' || sub === 'imwrite') return [{ text: `✅ Imagen guardada: ${args[1]||'output.png'}`, type: 'success' }]
      return [{ text: 'uso: cv2 open_camera|canny|detect_faces|save', type: 'error' }]
    }
    case 'nlp': {
      const sub = args[0]
      if (sub === 'tokenize') { const t = args.slice(1).join(' ').replace(/["']/g,''); return [{ text: `Tokens: [${t.split(/\s+/).map(w=>`"${w}"`).join(', ')}]`, type: 'success' }] }
      if (sub === 'sentiment') return [{ text: `Sentimiento: ${Math.random()>0.5?'POSITIVO':'NEGATIVO'} (${(Math.random()*0.4+0.6).toFixed(3)})`, type: 'success' }]
      if (sub === 'create_intents' || sub === 'intents') return [{ text: '✅ 4 intenciones definidas (12 patrones)', type: 'success' }]
      return [{ text: 'uso: nlp tokenize|sentiment|create_intents', type: 'error' }]
    }
    case 'chat': case 'chatbot': {
      const msg = args.join(' ').replace(/["']/g,'')
      if (!msg) return [{ text: 'uso: chat "mensaje"', type: 'error' }]
      const r = msg.includes('hola') ? '¡Hola! ¿En qué ayudo?' : msg.includes('ayuda') ? 'Puedo responder sobre IA y ML.' : `Interesante: "${msg}". Los modelos de IA procesan patrones en datos.`
      return [{ text: `👤 ${msg}`, type: 'normal' }, { text: `🤖 ${r}`, type: 'success' }]
    }
    case 'generate': {
      const p = args.join(' ').replace(/["']/g,'')
      if (!p) return [{ text: 'uso: generate "prompt"', type: 'error' }]
      return [{ text: `🎨 Generando: "${p}"`, type: 'info' }, { text: `   SD v2.1 | 512x512 | 50 steps`, type: 'normal' }, { text: `✅ generated_${Date.now().toString(36)}.png`, type: 'success' }]
    }
    case 'gpt': case 'llm': {
      const p = args.join(' ').replace(/["']/g,'')
      if (!p) return [{ text: 'uso: gpt "pregunta"', type: 'error' }]
      return [{ text: `🤖 GPT: Los modelos de IA como yo usamos la arquitectura Transformer para procesar "${p}".`, type: 'success' }]
    }
    case 'finetune': case 'fine-tune': case 'fine_tune':
      return [{ text: `🔧 Fine-tuning...`, type: 'info' }, { text: `   3 epochs, loss: 2.41→1.12`, type: 'normal' }, { text: `✅ Perplexity -40%`, type: 'success' }]
    case 'deploy': case 'flask': case 'serve':
      return [{ text: `🚀 API en http://localhost:${args.find(a=>a.includes('port'))?.split('=')[1]||'5000'}`, type: 'success' }, { text: `   POST /predict | GET /health`, type: 'info' }]
    case 'preprocess': case 'clean':
      return [{ text: '🧹 Preprocesando...', type: 'info' }, { text: '✅ NaN eliminados, features codificadas, normalizado', type: 'success' }]
    case 'analyze': case 'describe': case 'info':
      return [{ text: `📊 Filas: ${Math.floor(Math.random()*5000+500)} | Cols: ${Math.floor(Math.random()*12+4)} | NaN: ${Math.floor(Math.random()*200)}`, type: 'info' }]
    case 'nvidia-smi': case 'gpu':
      return [{ text: `GPU: NVIDIA RTX 4090 | Mem: ${Math.floor(Math.random()*12000+4000)}/24564 MiB | ${Math.floor(Math.random()*60+20)}% util`, type: 'info' }]
    case 'clear': return [{ text: '__CLEAR__', type: 'system' }]
    case 'history': return history.slice(-10).map((h,i) => ({ text: `  ${i+1}  ${h}`, type: 'normal' as const }))
    case 'whoami': return [{ text: 'ai-researcher@chaskibots', type: 'normal' }]
    case 'echo': return [{ text: args.join(' '), type: 'normal' }]
    case 'help': return [
      { text: '╔══════════════════════════════════════════════════════════╗', type: 'info' },
      { text: '║        🧠 AI Terminal — ChaskiBots Lab                   ║', type: 'info' },
      { text: '╠══════════════════════════════════════════════════════════╣', type: 'info' },
      { text: '║ PAQUETES:  pip install|list|search                       ║', type: 'normal' },
      { text: '║ PYTHON:    python <file.py>                              ║', type: 'normal' },
      { text: '║ MODELOS:   model create|summary|load|list                ║', type: 'normal' },
      { text: '║ DATASETS:  dataset load|list                             ║', type: 'normal' },
      { text: '║ TRAINING:  train <modelo> | predict <datos>              ║', type: 'normal' },
      { text: '║ VISIÓN:    cv2 open_camera|canny|detect_faces|save       ║', type: 'normal' },
      { text: '║ NLP:       nlp tokenize|sentiment|create_intents         ║', type: 'normal' },
      { text: '║ CHAT:      chat "msg" | gpt "pregunta"                   ║', type: 'normal' },
      { text: '║ GENERATIVO:generate "prompt" | finetune <model>          ║', type: 'normal' },
      { text: '║ DATOS:     preprocess | analyze | describe               ║', type: 'normal' },
      { text: '║ DEPLOY:    deploy <app> | serve                          ║', type: 'normal' },
      { text: '║ ARCHIVOS:  ls | cd | cat | pwd                           ║', type: 'normal' },
      { text: '║ MISIONES:  mission list|start <n>|status|abort           ║', type: 'normal' },
      { text: '║ SISTEMA:   gpu | clear | history | help                  ║', type: 'normal' },
      { text: '╚══════════════════════════════════════════════════════════╝', type: 'info' },
      { text: '💡 Empieza: "pip install tensorflow" + "mission start 1"', type: 'success' },
    ]
    case '': return []
    default: return [{ text: `'${cmd}' no encontrado. Escribe 'help'`, type: 'error' }]
  }
}

// ============================================================
// RENDER THEORY
// ============================================================
function renderTheory(theory: string) {
  if (!theory) return null
  return theory.split('\n').map((line, idx) => {
    if (line.startsWith('# ')) return <h3 key={idx} className="text-white font-bold text-sm mt-3 mb-1">{line.slice(2)}</h3>
    if (line.startsWith('## ')) return <h4 key={idx} className="text-gray-300 font-semibold text-xs mt-2 mb-1">{line.slice(3)}</h4>
    if (line.startsWith('- ')) return <li key={idx} className="text-gray-400 text-[11px] ml-3">{line.slice(2)}</li>
    if (line.startsWith('```')) return null
    if (line.trim() === '') return <div key={idx} className="h-2" />
    return <p key={idx} className="text-gray-400 text-[11px] leading-relaxed">{line}</p>
  })
}

// ============================================================
// COMPONENT
// ============================================================
interface AITerminalProps { levelId?: string; userId?: string; userName?: string }

export default function AITerminal({ levelId, userId, userName }: AITerminalProps) {
  const { user } = useAuth()
  const [output, setOutput] = useState<OutputLine[]>([
    { text: '╔══════════════════════════════════════════════════════════╗', type: 'system' },
    { text: '║   🧠  AI Terminal Professional — ChaskiBots Lab          ║', type: 'system' },
    { text: '║   Python 3.12 | CUDA 12.2 | GPU: RTX 4090 (sim)         ║', type: 'system' },
    { text: '╚══════════════════════════════════════════════════════════╝', type: 'system' },
    { text: '', type: 'normal' },
    { text: "'help' → comandos | 'missions' → misiones guiadas de IA", type: 'info' },
    { text: '', type: 'normal' },
    { text: '🧠 MISIONES: Aprende IA paso a paso con proyectos reales', type: 'warning' },
    { text: '   mission start 1 → Tu primera red neuronal', type: 'normal' },
    { text: '   pip install tensorflow → Instalar librerías', type: 'normal' },
    { text: '', type: 'normal' },
  ])
  const [inputValue, setInputValue] = useState('')
  const [cwd, setCwd] = useState('/home/ai-lab')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [installedPackages, setInstalledPackages] = useState<Set<string>>(new Set(['pip','setuptools']))
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCurriculum, setShowCurriculum] = useState(true)
  const [showLessonPanel, setShowLessonPanel] = useState(false)
  const [modules, setModules] = useState<ApiModule[]>([])
  const [curriculumLoading, setCurriculumLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<ApiLessonFull | null>(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [studentName, setStudentName] = useState(userName || '')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [activeMission, setActiveMission] = useState<Mission | null>(null)
  const [missionStep, setMissionStep] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set())
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetch('/api/academy?course=ia').then(r=>r.json()).then(d=>setModules(d.modules||[])).catch(()=>{}).finally(()=>setCurriculumLoading(false)) }, [])
  useEffect(() => { try { const s=localStorage.getItem('ai-terminal-progress'); if(s) setCompletedLessons(new Set(JSON.parse(s))); const n=localStorage.getItem('ai-terminal-student'); if(n) setStudentName(n); else if(user?.name) setStudentName(user.name); const x=localStorage.getItem('ai-terminal-xp'); if(x) setTotalXP(parseInt(x)); const m=localStorage.getItem('ai-terminal-missions'); if(m) setCompletedMissions(new Set(JSON.parse(m))); const p=localStorage.getItem('ai-terminal-pkgs'); if(p) setInstalledPackages(new Set(JSON.parse(p))) } catch{} }, [user?.name])
  useEffect(() => { try { localStorage.setItem('ai-terminal-progress',JSON.stringify(Array.from(completedLessons))); if(studentName) localStorage.setItem('ai-terminal-student',studentName); localStorage.setItem('ai-terminal-xp',String(totalXP)); localStorage.setItem('ai-terminal-missions',JSON.stringify(Array.from(completedMissions))); localStorage.setItem('ai-terminal-pkgs',JSON.stringify(Array.from(installedPackages))) } catch{} }, [completedLessons,studentName,totalXP,completedMissions,installedPackages])
  useEffect(() => { if(terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight }, [output])
  const focusInput = () => inputRef.current?.focus()

  const executeCommand = (input: string) => {
    const trimmed = input.trim(); if (!trimmed) return
    setCommandHistory(prev => [...prev, trimmed]); setHistoryIndex(-1); setInputValue('')
    const promptLine: OutputLine = { text: `ai-lab@chaskibots:${cwd==='/home/ai-lab'?'~':cwd}$ ${trimmed}`, type: 'input' }
    const parts = trimmed.split(/\s+/); const cmdName = parts[0]?.toLowerCase()

    if (cmdName === 'missions' || cmdName === 'mission') {
      const sub = parts[1]
      if (sub === 'list' || !sub) {
        setOutput(prev => [...prev, promptLine, { text: '', type: 'normal' },
          { text: '╔══════════════════════════════════════════════════════════╗', type: 'info' },
          { text: '║      🧠  MISIONES IA DISPONIBLES                         ║', type: 'info' },
          { text: '╠══════════════════════════════════════════════════════════╣', type: 'info' },
          ...MISSIONS.map((m,i) => ({ text: `║ ${completedMissions.has(m.id)?'✅':'  '} ${i+1}. ${m.title.padEnd(45)}║`, type: (completedMissions.has(m.id)?'success':'normal') as OutputLine['type'] })),
          { text: '╚══════════════════════════════════════════════════════════╝', type: 'info' },
          { text: `XP: ${totalXP} | Completadas: ${completedMissions.size}/${MISSIONS.length}`, type: 'warning' },
          { text: 'Usa: mission start <número>', type: 'info' },
        ]); return
      }
      if (sub === 'start' && parts[2]) {
        const idx = parseInt(parts[2])-1
        if (idx >= 0 && idx < MISSIONS.length) {
          const m = MISSIONS[idx]; setActiveMission(m); setMissionStep(0)
          setOutput(prev => [...prev, promptLine, { text: '', type: 'normal' }, { text: '═'.repeat(56), type: 'warning' }, { text: `  ${m.title}`, type: 'info' }, { text: `  ${DIFFICULTY_LABEL[m.difficulty]} | XP: ${m.xpTotal}`, type: 'normal' }, { text: '═'.repeat(56), type: 'warning' }, { text: '', type: 'normal' }, { text: `📋 ${m.briefing}`, type: 'normal' }, { text: '', type: 'normal' }, { text: `▶ ${m.steps[0].title}`, type: 'info' }, { text: `  ${m.steps[0].description}`, type: 'normal' }, { text: `  💡 ${m.steps[0].hint}`, type: 'warning' }, { text: '', type: 'normal' }]); return
        }
        setOutput(prev => [...prev, promptLine, { text: '❌ Número inválido', type: 'error' }]); return
      }
      if (sub === 'status') {
        if (!activeMission) { setOutput(prev => [...prev, promptLine, { text: '⚠️ Sin misión activa', type: 'warning' }]); return }
        const step = activeMission.steps[missionStep]
        setOutput(prev => [...prev, promptLine, { text: `🎯 ${activeMission.title} (${missionStep}/${activeMission.steps.length})`, type: 'info' }, { text: `   ${step?.title}: ${step?.description}`, type: 'normal' }, { text: `   💡 ${step?.hint}`, type: 'warning' }]); return
      }
      if (sub === 'abort') { setActiveMission(null); setMissionStep(0); setOutput(prev => [...prev, promptLine, { text: '⛔ Abortada', type: 'warning' }]); return }
      setOutput(prev => [...prev, promptLine, { text: 'Uso: mission list|start|status|abort', type: 'error' }]); return
    }

    const result = processCommand(trimmed, cwd, setCwd, [...commandHistory, trimmed], installedPackages, setInstalledPackages)
    if (result.length === 1 && result[0].text === '__CLEAR__') { setOutput([]) } else { setOutput(prev => [...prev, promptLine, ...result]) }

    // Mission validation
    if (activeMission && missionStep < activeMission.steps.length) {
      const cs = activeMission.steps[missionStep]
      if (cs.validator(trimmed, commandHistory)) {
        const newXP = totalXP + cs.xp; setTotalXP(newXP)
        const next = missionStep + 1; const done = next >= activeMission.steps.length
        if (done) {
          const nc = new Set(completedMissions); nc.add(activeMission.id); setCompletedMissions(nc)
          setOutput(prev => [...prev, { text: '', type: 'normal' }, { text: '═'.repeat(56), type: 'success' }, { text: cs.successMessage, type: 'success' }, { text: `🧠 ¡MISIÓN COMPLETADA! +${cs.xp} XP`, type: 'success' }, { text: `   Flag: ${activeMission.completionFlag}`, type: 'warning' }, { text: `   XP: ${newXP}`, type: 'info' }, { text: '═'.repeat(56), type: 'success' }, { text: '', type: 'normal' }, ...activeMission.debriefing.split('\n').map(l => ({ text: l, type: 'info' as const })), { text: '', type: 'normal' }])
          setActiveMission(null); setMissionStep(0)
        } else {
          setMissionStep(next); const ns = activeMission.steps[next]
          setOutput(prev => [...prev, { text: '', type: 'normal' }, { text: `${cs.successMessage}  (+${cs.xp} XP)`, type: 'success' }, { text: `▶ ${ns.title}`, type: 'info' }, { text: `  ${ns.description}`, type: 'normal' }, { text: `  💡 ${ns.hint}`, type: 'warning' }, { text: '', type: 'normal' }])
        }
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { executeCommand(inputValue) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (commandHistory.length > 0) { const i = historyIndex===-1 ? commandHistory.length-1 : Math.max(0, historyIndex-1); setHistoryIndex(i); setInputValue(commandHistory[i]) } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (historyIndex>=0) { const i=historyIndex+1; if(i>=commandHistory.length){setHistoryIndex(-1);setInputValue('')}else{setHistoryIndex(i);setInputValue(commandHistory[i])} } }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setOutput([]) }
  }

  const loadLesson = async (lesson: ApiLessonStub) => {
    setLessonLoading(true); setShowLessonPanel(true)
    try { const res = await fetch(`/api/academy?lesson=${lesson.id}`); const data = await res.json(); if(data){if(typeof data.examples==='string')data.examples=JSON.parse(data.examples);if(typeof data.challenges==='string')data.challenges=JSON.parse(data.challenges);setActiveLesson(data);setOutput(prev=>[...prev,{text:'',type:'normal'},{text:`📚 ${data.title}`,type:'info'},{text:data.description,type:'normal'},{text:'💡 Usa los ejemplos del panel derecho',type:'success'}])} } catch{setOutput(prev=>[...prev,{text:'❌ Error',type:'error'}])}
    setLessonLoading(false)
  }
  const markLessonComplete = () => { if(!activeLesson) return; const n=new Set(completedLessons);n.add(activeLesson.id);setCompletedLessons(n);setOutput(prev=>[...prev,{text:'🎉 ¡Lección completada! +⭐',type:'success'}]) }
  const handleSendToTeacher = async () => {
    if(!studentName.trim()){setOutput(prev=>[...prev,{text:'⚠️ Escribe tu nombre',type:'warning'}]);return}
    setIsSending(true)
    try{const res=await fetch('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({taskId:`AI-${Date.now().toString(36).toUpperCase()}`,studentName,studentEmail:user?.email,code:`# Comandos:\n${commandHistory.slice(-20).join('\n')}`,output:output.slice(-30).map(o=>o.text).join('\n'),levelId:user?.levelId||levelId,lessonId:activeLesson?.id})});if(res.ok){setSendSuccess(true);setOutput(prev=>[...prev,{text:'✅ Enviado al profesor',type:'success'}]);setTimeout(()=>setSendSuccess(false),4000)}}catch{setOutput(prev=>[...prev,{text:'❌ Error de conexión',type:'error'}])}
    setIsSending(false)
  }

  const totalLessons = modules.reduce((a,m)=>a+m.lessons.length,0)
  const progressPct = totalLessons > 0 ? (completedLessons.size/totalLessons)*100 : 0

  return (
    <div className={`flex flex-col bg-[#0d1117] rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl ${isFullscreen?'fixed inset-0 z-50 rounded-none':'h-[750px]'}`}>
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-[#0d1117] via-[#0d0d1a] to-[#0d1117] border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:brightness-125" onClick={()=>setIsFullscreen(false)} />
            <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer hover:brightness-125" />
            <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:brightness-125" onClick={()=>setIsFullscreen(!isFullscreen)} />
          </div>
          <div className="flex items-center gap-2">
            <Image src="/chaski.png" alt="ChaskiBots" width={24} height={24} className="rounded-md" />
            <div className="flex flex-col">
              <span className="text-gray-200 text-sm font-bold leading-tight">AI Terminal</span>
              <span className="text-[9px] text-gray-500 leading-tight">by ChaskiBots Lab</span>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <Brain className="w-3 h-3" /> Python AI
          </span>
          {totalXP > 0 && <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">⚡ {totalXP} XP</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={()=>navigator.clipboard.writeText(output.map(o=>o.text).join('\n'))} className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Copiar"><Copy className="w-4 h-4" /></button>
          <button onClick={()=>{const b=new Blob([output.map(o=>o.text).join('\n')],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='ai-session.log';a.click()}} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Descargar"><Download className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-gray-700/50 mx-0.5" />
          <button onClick={()=>setShowCurriculum(!showCurriculum)} className={`p-2 rounded-lg transition-colors ${showCurriculum?'bg-purple-500/20 text-purple-400':'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Curriculum"><GraduationCap className="w-4 h-4" /></button>
          <button onClick={()=>setShowLessonPanel(!showLessonPanel)} className={`p-2 rounded-lg transition-colors ${showLessonPanel?'bg-blue-500/20 text-blue-400':'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Lección"><BookOpen className="w-4 h-4" /></button>
          <button onClick={()=>setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">{isFullscreen?<Minimize2 className="w-4 h-4"/>:<Maximize2 className="w-4 h-4"/>}</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        {showCurriculum && (
          <div className="w-72 bg-[#0d1117] border-r border-gray-700/50 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-bold flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400" /> Plan IA</h3>
                <span className="text-[11px] text-gray-500">{completedLessons.size}/{totalLessons}</span>
              </div>
              <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full transition-all" style={{width:`${progressPct}%`}} /></div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {curriculumLoading && <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>}
              {!curriculumLoading && modules.length === 0 && <div className="text-center py-8"><Brain className="w-8 h-8 text-gray-600 mx-auto mb-2" /><p className="text-gray-500 text-[11px]">Practica con los comandos</p></div>}
              {modules.map(module => {
                const done = module.lessons.filter(l=>completedLessons.has(l.id)).length
                return (<div key={module.id}>
                  <button onClick={()=>setActiveModule(activeModule===module.id?null:module.id)} disabled={module.lessons.length===0} className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-700/30 transition-colors text-left disabled:opacity-40">
                    {activeModule===module.id?<ChevronDown className="w-3.5 h-3.5 text-gray-500"/>:<ChevronRight className="w-3.5 h-3.5 text-gray-500"/>}
                    <span className="text-sm">{module.icon||'🧠'}</span>
                    <div className="flex-1 min-w-0"><div className="text-gray-300 text-xs font-medium truncate">{module.title}</div><div className="text-[10px] text-gray-600">{module.lessons.length===0?'Próximamente':`${done}/${module.lessons.length}`}</div></div>
                  </button>
                  {activeModule===module.id && <div className="ml-5 mt-1 space-y-0.5 pb-2">{module.lessons.map(lesson => {
                    const isC = completedLessons.has(lesson.id); const isA = activeLesson?.id===lesson.id
                    return <button key={lesson.id} onClick={()=>loadLesson(lesson)} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${isA?'bg-purple-500/20 border border-purple-500/40':'hover:bg-gray-700/30'}`}>
                      {isC?<CheckCircle2 className="w-3.5 h-3.5 text-green-400"/>:<Circle className="w-3.5 h-3.5 text-gray-600"/>}
                      <div className="flex-1 min-w-0"><div className={`text-[11px] truncate ${isA?'text-purple-300 font-medium':'text-gray-400'}`}>{lesson.title}</div></div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLOR[lesson.difficulty]||''}`}>{(DIFFICULTY_LABEL[lesson.difficulty]||'').slice(0,4)}</span>
                    </button>
                  })}</div>}
                </div>)
              })}
            </div>
            {/* MISSIONS */}
            <div className="p-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"><Trophy className="w-3 h-3 text-orange-400" /> Misiones IA</h4>
                <span className="text-[10px] text-orange-400 font-bold">{totalXP} XP</span>
              </div>
              {activeMission && <div className="mb-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/30"><div className="text-[10px] text-purple-300 font-medium truncate">{activeMission.title}</div><div className="flex items-center gap-1.5 mt-1"><div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden"><div className="h-full bg-purple-400 rounded-full transition-all" style={{width:`${(missionStep/activeMission.steps.length)*100}%`}}/></div><span className="text-[9px] text-gray-400">{missionStep}/{activeMission.steps.length}</span></div></div>}
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {MISSIONS.map((m,i)=>(<button key={m.id} onClick={()=>executeCommand(`mission start ${i+1}`)} className={`w-full text-left px-2 py-1.5 rounded-md text-[10px] flex items-center gap-1.5 transition-all ${completedMissions.has(m.id)?'bg-green-500/10 text-green-400 border border-green-500/20':activeMission?.id===m.id?'bg-purple-500/10 text-purple-300 border border-purple-500/30':'bg-gray-700/30 text-gray-400 hover:bg-purple-500/10 border border-transparent'}`}>{completedMissions.has(m.id)?<CheckCircle2 className="w-3 h-3"/>:<Circle className="w-3 h-3"/>}<span className="flex-1 truncate">{m.title.replace(/[🧠📷📊💬🎨]\s*/,'')}</span><span className={`text-[8px] px-1 py-0.5 rounded ${DIFFICULTY_COLOR[m.difficulty]}`}>{m.xpTotal}xp</span></button>))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-700/30 flex flex-wrap gap-1">
                {['help','missions','pip list','gpu'].map(c=>(<button key={c} onClick={()=>executeCommand(c)} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all">$ {c}</button>))}
              </div>
            </div>
          </div>
        )}

        {/* CENTER: TERMINAL */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={terminalRef} onClick={focusInput} className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed bg-[#0d1117] cursor-text">
            {output.map((line,idx)=>(<div key={idx} className={`whitespace-pre-wrap ${line.type==='error'?'text-red-400':line.type==='success'?'text-green-400':line.type==='info'?'text-cyan-400':line.type==='warning'?'text-yellow-400':line.type==='system'?'text-purple-500/70':line.type==='input'?'text-gray-300':'text-gray-400'}`}>{line.text||' '}</div>))}
            <div className="flex items-center text-gray-300 mt-1">
              <span className="text-purple-400 font-bold mr-1">ai-lab</span><span className="text-gray-500">@</span><span className="text-cyan-400">chaskibots</span><span className="text-gray-500">:</span><span className="text-blue-400">{cwd==='/home/ai-lab'?'~':cwd}</span><span className="text-gray-300 mr-2">$</span>
              <input ref={inputRef} type="text" value={inputValue} onChange={e=>setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent outline-none text-gray-200 caret-purple-400" autoFocus spellCheck={false} autoComplete="off" />
            </div>
          </div>
          {/* ACTION BAR */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <button onClick={()=>setOutput([])} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all"><Trash2 className="w-3.5 h-3.5" /> Limpiar</button>
              {activeLesson && <><div className="w-px h-5 bg-gray-700 mx-1"/><button onClick={markLessonComplete} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/80 hover:bg-green-500 text-white rounded-lg text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Completar</button></>}
              <div className="w-px h-5 bg-gray-700 mx-1"/>
              <span className="text-[10px] text-gray-500 flex items-center gap-1"><Package className="w-3 h-3" /> {installedPackages.size-2} pkgs</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="Tu nombre..." className="px-3 py-1.5 bg-gray-800/80 border border-gray-600/50 rounded-lg text-xs text-gray-300 w-32 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" />
              <button onClick={handleSendToTeacher} disabled={isSending||sendSuccess||!studentName.trim()} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sendSuccess?'bg-green-600 text-white':'bg-purple-600/80 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'}`}>
                {isSending?<Loader2 className="w-3 h-3 animate-spin"/>:sendSuccess?<Check className="w-3 h-3"/>:<Send className="w-3 h-3"/>}{sendSuccess?'Enviado ✓':'Enviar'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: LESSON PANEL */}
        {showLessonPanel && (activeLesson||lessonLoading) && (
          <div className="w-80 bg-[#0d1117] border-l border-gray-700/50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
              <h3 className="text-white text-sm font-bold truncate">{activeLesson?.title||'Cargando...'}</h3>
              <button onClick={()=>setShowLessonPanel(false)} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50"><X className="w-3.5 h-3.5"/></button>
            </div>
            {lessonLoading && <div className="flex-1 flex items-center justify-center gap-2 text-gray-500 text-xs"><Loader2 className="w-4 h-4 animate-spin"/> Cargando...</div>}
            {!lessonLoading && activeLesson && (
              <div className="flex-1 overflow-y-auto">
                <div className="px-3 pt-3 pb-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_COLOR[activeLesson.difficulty]}`}>{DIFFICULTY_LABEL[activeLesson.difficulty]}</span>
                  <span className="text-[10px] text-gray-600 ml-2">⏱ {activeLesson.estimated_minutes} min</span>
                  <p className="text-gray-500 text-xs mt-2">{activeLesson.description}</p>
                </div>
                <div className="p-3 border-t border-gray-700/30"><h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-purple-400" /> Teoría</h4><div className="leading-relaxed">{renderTheory(activeLesson.theory)}</div></div>
                {activeLesson.examples?.length > 0 && <div className="p-3 border-t border-gray-700/30"><h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Code className="w-3 h-3 text-cyan-400" /> Ejemplos</h4><div className="space-y-1.5">{activeLesson.examples.map((ex,i)=>(<button key={i} onClick={()=>executeCommand(ex.code)} className="w-full text-left px-2.5 py-2 rounded-lg bg-gray-700/20 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-colors"><div className="text-[11px] text-purple-300 font-mono break-all">$ {ex.code}</div><div className="text-[10px] text-gray-500 mt-0.5">{ex.explanation}</div></button>))}</div></div>}
                {activeLesson.challenges?.length > 0 && <div className="p-3 border-t border-gray-700/30"><h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Trophy className="w-3 h-3 text-orange-400" /> Desafíos</h4><div className="space-y-2">{activeLesson.challenges.map((ch,i)=>(<div key={i} className="rounded-lg p-2.5 border bg-gray-700/20 border-gray-700/40"><div className="text-[11px] text-orange-300 font-medium">{ch.title}</div><p className="text-gray-400 text-[11px] mt-1">{ch.description}</p>{ch.starter_code && <button onClick={()=>executeCommand(ch.starter_code!)} className="mt-2 flex items-center gap-1 px-2.5 py-1 bg-purple-600/70 hover:bg-purple-500 text-white rounded-md text-[10px] font-medium"><Terminal className="w-3 h-3" /> Ejecutar</button>}</div>))}</div></div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
