'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Terminal, BookOpen, ChevronRight, ChevronDown, Lightbulb,
  RefreshCw, FolderTree, GraduationCap, CheckCircle2, Circle,
  Loader2, AlertCircle, PlayCircle
} from 'lucide-react'

interface LinuxTerminalProps {
  levelId?: string
  userId?: string
}

// ============================================================
// ACADEMY API TYPES (backed by Supabase: simulator_courses/modules/lessons)
// Mismo contrato que consume PythonIDE vía /api/academy.
// ============================================================
interface ApiExample {
  title: string
  code: string
  explanation: string
}

interface ApiChallenge {
  title: string
  description: string
  starter_code: string
  expected_output: string
  hints: string[]
}

interface ApiLesson {
  id: string
  slug: string
  title: string
  description: string
  theory: string
  examples: ApiExample[]
  challenges: ApiChallenge[]
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_minutes: number
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'fácil', medium: 'medio', hard: 'difícil' }
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'bg-green-500/15 text-green-400 border border-green-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  hard: 'bg-red-500/15 text-red-400 border border-red-500/30',
}

// Mini renderizador markdown (headers, bold, código inline) — sin dependencias externas
export function renderTheory(text: string) {
  const formatInline = (s: string) => {
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
    s = s.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-700/50 text-cyan-300 rounded text-[10px] font-mono">$1</code>')
    return <span dangerouslySetInnerHTML={{ __html: s }} />
  }
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```') || line.startsWith('|')) return null
    if (line.startsWith('# ')) return <h1 key={i} className="text-gray-100 text-sm font-bold mt-3 mb-1.5">{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={i} className="text-gray-200 text-[13px] font-bold mt-3 mb-1">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="text-gray-300 text-xs font-semibold mt-2 mb-1">{line.slice(4)}</h3>
    if (line.startsWith('- ')) return <li key={i} className="text-gray-400 text-[11px] ml-3 mb-0.5 list-disc">{formatInline(line.slice(2))}</li>
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    return <p key={i} className="text-gray-400 text-[11px] leading-relaxed mb-1">{formatInline(line)}</p>
  })
}

interface Command {
  name: string
  description: string
  usage: string
  example: string
}

interface Guide {
  title: string
  commands: Command[]
}

const TERMINAL_GUIDES: Guide[] = [
  {
    title: '📂 Navegación',
    commands: [
      { name: 'pwd', description: 'Muestra la carpeta actual', usage: 'pwd', example: 'pwd' },
      { name: 'ls', description: 'Lista archivos y carpetas', usage: 'ls [carpeta]', example: 'ls proyectos' },
      { name: 'cd', description: 'Cambia de carpeta', usage: 'cd <carpeta>', example: 'cd documentos' },
    ]
  },
  {
    title: '📄 Archivos y carpetas',
    commands: [
      { name: 'cat', description: 'Muestra el contenido de un archivo', usage: 'cat <archivo>', example: 'cat tarea.txt' },
      { name: 'mkdir', description: 'Crea una carpeta nueva', usage: 'mkdir <nombre>', example: 'mkdir practicas' },
      { name: 'touch', description: 'Crea un archivo vacío', usage: 'touch <archivo>', example: 'touch notas.txt' },
      { name: 'rm', description: 'Elimina un archivo', usage: 'rm <archivo>', example: 'rm notas.txt' },
      { name: 'cp', description: 'Copia un archivo', usage: 'cp <origen> <destino>', example: 'cp tarea.txt tarea-copia.txt' },
      { name: 'mv', description: 'Mueve o renombra un archivo', usage: 'mv <origen> <destino>', example: 'mv tarea.txt entregado.txt' },
    ]
  },
  {
    title: '🔍 Búsqueda y texto',
    commands: [
      { name: 'grep', description: 'Busca texto dentro de un archivo', usage: 'grep <texto> <archivo>', example: 'grep import app.py' },
      { name: 'find', description: 'Busca archivos por nombre', usage: 'find <patrón>', example: 'find *.py' },
      { name: 'head', description: 'Muestra las primeras líneas', usage: 'head <archivo>', example: 'head sistema.log' },
      { name: 'tail', description: 'Muestra las últimas líneas', usage: 'tail <archivo>', example: 'tail sistema.log' },
      { name: 'wc', description: 'Cuenta líneas, palabras y caracteres', usage: 'wc <archivo>', example: 'wc tarea.txt' },
    ]
  },
  {
    title: '⚙️ Permisos y sistema',
    commands: [
      { name: 'chmod', description: 'Cambia los permisos de un archivo', usage: 'chmod <modo> <archivo>', example: 'chmod 755 app.py' },
      { name: 'whoami', description: 'Muestra el usuario actual', usage: 'whoami', example: 'whoami' },
      { name: 'ps', description: 'Lista procesos en ejecución', usage: 'ps', example: 'ps' },
      { name: 'df', description: 'Muestra espacio en disco', usage: 'df', example: 'df' },
      { name: 'date', description: 'Muestra la fecha y hora', usage: 'date', example: 'date' },
    ]
  },
  {
    title: '🛠️ Utilidades',
    commands: [
      { name: 'echo', description: 'Muestra un texto', usage: 'echo <texto>', example: 'echo Hola Linux' },
      { name: 'history', description: 'Muestra el historial de comandos', usage: 'history', example: 'history' },
      { name: 'man', description: 'Muestra el manual de un comando', usage: 'man <comando>', example: 'man grep' },
      { name: 'clear', description: 'Limpia la terminal', usage: 'clear', example: 'clear' },
      { name: 'help', description: 'Muestra esta ayuda', usage: 'help [comando]', example: 'help cd' },
    ]
  },
]

type FsNode =
  | { type: 'dir'; children: string[] }
  | { type: 'file'; content: string; perms?: string }

const INITIAL_FS: Record<string, FsNode> = {
  '/': { type: 'dir', children: ['home', 'etc', 'var'] },
  '/home': { type: 'dir', children: ['estudiante'] },
  '/home/estudiante': { type: 'dir', children: ['proyectos', 'documentos', 'descargas'] },
  '/home/estudiante/proyectos': { type: 'dir', children: ['app.py', 'datos.csv'] },
  '/home/estudiante/proyectos/app.py': {
    type: 'file', perms: '-rw-r--r--',
    content: 'import csv\n\ndef leer_datos(ruta):\n    with open(ruta) as f:\n        return list(csv.reader(f))\n\nprint(leer_datos("datos.csv"))'
  },
  '/home/estudiante/proyectos/datos.csv': { type: 'file', perms: '-rw-r--r--', content: 'nombre,nota\nAna,9.5\nLuis,8.2\nSofia,9.8' },
  '/home/estudiante/documentos': { type: 'dir', children: ['tarea.txt', 'notas.md'] },
  '/home/estudiante/documentos/tarea.txt': { type: 'file', perms: '-rw-r--r--', content: 'Tarea de Linux:\n1. Practicar navegación con cd y ls\n2. Crear una carpeta y un archivo\n3. Buscar texto con grep' },
  '/home/estudiante/documentos/notas.md': { type: 'file', perms: '-rw-r--r--', content: '# Notas de clase\n\n- Todo en Linux es un archivo\n- La barra "/" es la raíz del sistema\n- "cd .." sube un nivel' },
  '/home/estudiante/descargas': { type: 'dir', children: [] },
  '/etc': { type: 'dir', children: ['os-release'] },
  '/etc/os-release': { type: 'file', perms: '-rw-r--r--', content: 'NAME="ChaskiOS"\nVERSION="1.0 (Educativa)"' },
  '/var': { type: 'dir', children: ['log'] },
  '/var/log': { type: 'dir', children: ['sistema.log'] },
  '/var/log/sistema.log': {
    type: 'file', perms: '-rw-r--r--',
    content: '[INFO] Sistema iniciado\n[INFO] Sesión de estudiante iniciada\n[WARN] Espacio en disco al 62%\n[INFO] Backup completado\n[INFO] Todo funcionando correctamente'
  },
}

const HOME = '/home/estudiante'

export default function LinuxTerminal({ levelId, userId }: LinuxTerminalProps) {
  const [fs, setFs] = useState<Record<string, FsNode>>(INITIAL_FS)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '╔══════════════════════════════════════════════════════════╗',
    '║  🐧  SIMULADOR DE TERMINAL LINUX                          ║',
    '║  Escribe "help" para ver los comandos disponibles         ║',
    '╚══════════════════════════════════════════════════════════╝',
    ''
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const [currentDir, setCurrentDir] = useState(HOME)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showGuides, setShowGuides] = useState(false)
  const [activeGuide, setActiveGuide] = useState<number | null>(null)
  const [showTree, setShowTree] = useState(false)

  // Lecciones (Academy: curso hacking-etico / módulo linux-basico)
  const [showLessons, setShowLessons] = useState(true)
  const [lessons, setLessons] = useState<ApiLesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [lessonsError, setLessonsError] = useState(false)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({})

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight })
  }, [terminalOutput])

  useEffect(() => {
    let cancelled = false
    setLessonsLoading(true)
    setLessonsError(false)
    fetch('/api/academy?course=hacking-etico&module=linux-basico')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const loaded: ApiLesson[] = data.lessons || []
        setLessons(loaded)
        if (loaded[0]) setExpandedLesson(loaded[0].id)
      })
      .catch(() => { if (!cancelled) setLessonsError(true) })
      .finally(() => { if (!cancelled) setLessonsLoading(false) })

    if (userId) {
      fetch(`/api/academy/progress?userId=${userId}&courseSlug=hacking-etico`)
        .then(r => r.json())
        .then(data => {
          if (cancelled) return
          const done = (data.progress || [])
            .filter((p: any) => p.completed && p.lesson?.module?.slug === 'linux-basico')
            .map((p: any) => p.lesson.id)
          setCompletedLessonIds(new Set(done))
        })
        .catch(() => {})
    }

    return () => { cancelled = true }
  }, [userId])

  const resolvePath = (path: string): string => {
    if (!path) return currentDir
    if (path.startsWith('/')) return path.replace(/\/+$/, '') || '/'
    if (path === '..') {
      const parts = currentDir.split('/').filter(Boolean)
      parts.pop()
      return '/' + parts.join('/')
    }
    if (path === '.') return currentDir
    const joined = currentDir === '/' ? `/${path}` : `${currentDir}/${path}`
    return joined.replace(/\/+$/, '')
  }

  const basename = (path: string) => path.split('/').filter(Boolean).pop() || '/'
  const dirname = (path: string) => {
    const parts = path.split('/').filter(Boolean)
    parts.pop()
    return '/' + parts.join('/')
  }

  const processCommand = (input: string): string[] => {
    const parts = input.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return []
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)
    let out: string[] = []

    switch (command) {
      case 'help': {
        if (args[0]) {
          const cmd = TERMINAL_GUIDES.flatMap(g => g.commands).find(c => c.name === args[0])
          out = cmd
            ? [`📖 ${cmd.name}`, `   ${cmd.description}`, `   Uso: ${cmd.usage}`, `   Ejemplo: ${cmd.example}`]
            : [`No se encontró ayuda para "${args[0]}"`]
        } else {
          out = ['Comandos disponibles — escribe "help <comando>" para más detalle:', '']
          TERMINAL_GUIDES.forEach(g => {
            out.push(g.title)
            out.push('  ' + g.commands.map(c => c.name).join(', '))
          })
        }
        break
      }
      case 'man': {
        const cmd = TERMINAL_GUIDES.flatMap(g => g.commands).find(c => c.name === args[0])
        out = cmd ? [`${cmd.name.toUpperCase()}(1)`, '', `NAME`, `    ${cmd.name} — ${cmd.description}`, '', `SYNOPSIS`, `    ${cmd.usage}`, '', `EXAMPLE`, `    ${cmd.example}`]
          : [`No hay manual para "${args[0] || ''}"`]
        break
      }
      case 'pwd':
        out = [currentDir]
        break
      case 'whoami':
        out = ['estudiante']
        break
      case 'date':
        out = [new Date().toLocaleString('es-EC')]
        break
      case 'uptime':
        out = [`up ${Math.floor(Math.random() * 5) + 1} horas, 1 usuario`]
        break
      case 'clear':
        setTerminalOutput([])
        return []
      case 'history':
        out = commandHistory.map((c, i) => `  ${i + 1}  ${c}`)
        break
      case 'echo':
        out = [args.join(' ')]
        break
      case 'df':
        out = ['Sistema       Tamaño  Usado  Disp  Uso%', '/dev/chaski   50G     19G    31G   38%']
        break
      case 'ps':
        out = ['  PID TTY          TIME CMD', '  101 pts/0    00:00:00 bash', '  204 pts/0    00:00:00 python3', '  305 pts/0    00:00:00 ps']
        break

      case 'ls': {
        const target = resolvePath(args.find(a => !a.startsWith('-')) || '')
        const node = fs[target]
        if (!node) { out = [`ls: no se puede acceder a '${args[0]}': No existe el archivo o carpeta`]; break }
        if (node.type === 'file') { out = [basename(target)]; break }
        const long = args.includes('-l')
        out = node.children.length === 0 ? [] : node.children.map(name => {
          const childPath = target === '/' ? `/${name}` : `${target}/${name}`
          const child = fs[childPath]
          if (!long) return child?.type === 'dir' ? `${name}/` : name
          if (child?.type === 'dir') return `drwxr-xr-x  ${name}/`
          return `${(child as any)?.perms || '-rw-r--r--'}  ${name}`
        })
        break
      }
      case 'cd': {
        const target = resolvePath(args[0] || HOME)
        const node = fs[target]
        if (!node) out = [`cd: no existe la carpeta: ${args[0]}`]
        else if (node.type !== 'dir') out = [`cd: no es una carpeta: ${args[0]}`]
        else setCurrentDir(target)
        break
      }
      case 'cat': {
        if (!args[0]) { out = ['cat: falta el nombre del archivo']; break }
        const target = resolvePath(args[0])
        const node = fs[target]
        if (!node) out = [`cat: ${args[0]}: No existe el archivo`]
        else if (node.type === 'dir') out = [`cat: ${args[0]}: Es una carpeta`]
        else out = node.content.split('\n')
        break
      }
      case 'mkdir': {
        if (!args[0]) { out = ['mkdir: falta el nombre de la carpeta']; break }
        const target = resolvePath(args[0])
        if (fs[target]) { out = [`mkdir: '${args[0]}' ya existe`]; break }
        const parent = dirname(target)
        const parentNode = fs[parent]
        if (!parentNode || parentNode.type !== 'dir') { out = [`mkdir: no se puede crear en esa ruta`]; break }
        setFs(prev => ({
          ...prev,
          [target]: { type: 'dir', children: [] },
          [parent]: { type: 'dir', children: [...parentNode.children, basename(target)] }
        }))
        out = [`Carpeta '${basename(target)}' creada`]
        break
      }
      case 'touch': {
        if (!args[0]) { out = ['touch: falta el nombre del archivo']; break }
        const target = resolvePath(args[0])
        const parent = dirname(target)
        const parentNode = fs[parent]
        if (!parentNode || parentNode.type !== 'dir') { out = [`touch: no se puede crear en esa ruta`]; break }
        setFs(prev => ({
          ...prev,
          [target]: prev[target] || { type: 'file', content: '', perms: '-rw-r--r--' },
          [parent]: { type: 'dir', children: parentNode.children.includes(basename(target)) ? parentNode.children : [...parentNode.children, basename(target)] }
        }))
        out = [`Archivo '${basename(target)}' creado`]
        break
      }
      case 'rm': {
        if (!args[0]) { out = ['rm: falta el nombre del archivo']; break }
        const target = resolvePath(args[0])
        const node = fs[target]
        if (!node) { out = [`rm: no existe '${args[0]}'`]; break }
        if (node.type === 'dir') { out = [`rm: '${args[0]}' es una carpeta (no soportado)`]; break }
        const parent = dirname(target)
        const parentNode = fs[parent] as { type: 'dir'; children: string[] }
        setFs(prev => {
          const next = { ...prev }
          delete next[target]
          next[parent] = { type: 'dir', children: parentNode.children.filter(c => c !== basename(target)) }
          return next
        })
        out = [`'${basename(target)}' eliminado`]
        break
      }
      case 'cp':
      case 'mv': {
        if (!args[0] || !args[1]) { out = [`${command}: se requieren origen y destino`]; break }
        const src = resolvePath(args[0])
        const srcNode = fs[src]
        if (!srcNode || srcNode.type !== 'file') { out = [`${command}: '${args[0]}' no existe o no es un archivo`]; break }
        const dst = resolvePath(args[1])
        const dstParent = dirname(dst)
        const dstParentNode = fs[dstParent] as { type: 'dir'; children: string[] } | undefined
        if (!dstParentNode) { out = [`${command}: ruta de destino inválida`]; break }
        setFs(prev => {
          const next = { ...prev, [dst]: { ...srcNode } }
          next[dstParent] = { type: 'dir', children: dstParentNode.children.includes(basename(dst)) ? dstParentNode.children : [...dstParentNode.children, basename(dst)] }
          if (command === 'mv') {
            delete next[src]
            const srcParent = dirname(src)
            const srcParentNode = next[srcParent] as { type: 'dir'; children: string[] }
            next[srcParent] = { type: 'dir', children: srcParentNode.children.filter(c => c !== basename(src)) }
          }
          return next
        })
        out = [`${command === 'cp' ? 'Copiado' : 'Movido'} a '${args[1]}'`]
        break
      }
      case 'grep': {
        if (!args[0] || !args[1]) { out = ['grep: uso: grep <texto> <archivo>']; break }
        const target = resolvePath(args[1])
        const node = fs[target]
        if (!node || node.type !== 'file') { out = [`grep: ${args[1]}: No existe el archivo`]; break }
        const matches = node.content.split('\n').filter(l => l.toLowerCase().includes(args[0].toLowerCase()))
        out = matches.length > 0 ? matches : [`(sin coincidencias para "${args[0]}")`]
        break
      }
      case 'find': {
        const pattern = (args[0] || '*').replace(/\*/g, '.*')
        const re = new RegExp(`^${pattern}$`, 'i')
        out = Object.keys(fs).filter(p => fs[p].type === 'file' && re.test(basename(p)))
        out = out.length > 0 ? out : ['(sin resultados)']
        break
      }
      case 'head':
      case 'tail': {
        if (!args[0]) { out = [`${command}: falta el nombre del archivo`]; break }
        const target = resolvePath(args[0])
        const node = fs[target]
        if (!node || node.type !== 'file') { out = [`${command}: ${args[0]}: No existe el archivo`]; break }
        const lines = node.content.split('\n')
        out = command === 'head' ? lines.slice(0, 5) : lines.slice(-5)
        break
      }
      case 'wc': {
        if (!args[0]) { out = ['wc: falta el nombre del archivo']; break }
        const target = resolvePath(args[0])
        const node = fs[target]
        if (!node || node.type !== 'file') { out = [`wc: ${args[0]}: No existe el archivo`]; break }
        const lines = node.content.split('\n').length
        const words = node.content.split(/\s+/).filter(Boolean).length
        const chars = node.content.length
        out = [`  ${lines}  ${words}  ${chars}  ${args[0]}`]
        break
      }
      case 'chmod': {
        if (!args[0] || !args[1]) { out = ['chmod: uso: chmod <modo> <archivo>']; break }
        const target = resolvePath(args[1])
        const node = fs[target]
        if (!node || node.type !== 'file') { out = [`chmod: ${args[1]}: No existe el archivo`]; break }
        setFs(prev => ({ ...prev, [target]: { ...node, perms: `-rw${args[0]}`.slice(0, 10) } }))
        out = [`Permisos de '${args[1]}' cambiados a ${args[0]}`]
        break
      }
      default:
        out = [`bash: ${command}: comando no encontrado. Escribe "help" para ver los comandos disponibles.`]
    }
    return out
  }

  // Ejecuta un bloque de código de un ejemplo/reto de Academy línea por línea,
  // como si el estudiante lo hubiera tecleado, para conectar teoría con la terminal real.
  const runInTerminal = (code: string) => {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    const appended: string[] = []
    lines.forEach(line => {
      const result = processCommand(line)
      appended.push(`estudiante@chaskios:${currentDir}$ ${line}`, ...result)
    })
    setTerminalOutput(prev => [...prev, ...appended])
    setCommandHistory(prev => [...prev, ...lines])
    setHistoryIndex(-1)
  }

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessonIds(prev => new Set(prev).add(lessonId))
    if (!userId) return
    fetch('/api/academy/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, completed: true, score: 100 }),
    }).catch(() => {})
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = terminalInput
      if (!input.trim()) return
      const result = processCommand(input)
      setTerminalOutput(prev => [...prev, `estudiante@chaskios:${currentDir}$ ${input}`, ...result])
      setCommandHistory(prev => [...prev, input])
      setHistoryIndex(-1)
      setTerminalInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setTerminalInput(commandHistory[nextIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= commandHistory.length) { setHistoryIndex(-1); setTerminalInput('') }
      else { setHistoryIndex(nextIndex); setTerminalInput(commandHistory[nextIndex]) }
    }
  }

  const dirNode = fs[currentDir]
  const dirChildren = dirNode?.type === 'dir' ? dirNode.children : []

  return (
    <div className="bg-labdark-surface rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-labdark-bg via-labdark-bg2 to-labdark-bg border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-200 text-sm font-bold">Terminal Linux</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
            {currentDir}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLessons(!showLessons)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors text-xs ${showLessons ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Lecciones
          </button>
          <button
            onClick={() => setShowTree(!showTree)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors text-xs ${showTree ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}`}
          >
            <FolderTree className="w-3.5 h-3.5" /> Carpeta
          </button>
          <button
            onClick={() => setShowGuides(!showGuides)}
            className="flex items-center gap-1.5 px-3 py-1 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors text-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {showGuides ? 'Ocultar' : 'Mostrar'} guías
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Lecciones (Academy) */}
        {showLessons && (
          <div className="bg-labdark-bg rounded-xl p-4 border border-gray-700/50 max-h-[28rem] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Fundamentos de Linux — Lecciones</span>
            </div>

            {lessonsLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-xs py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando lecciones...
              </div>
            )}

            {!lessonsLoading && lessonsError && (
              <div className="flex items-center gap-2 text-red-400 text-xs py-4 justify-center">
                <AlertCircle className="w-4 h-4" /> No se pudieron cargar las lecciones.
              </div>
            )}

            {!lessonsLoading && !lessonsError && lessons.length === 0 && (
              <p className="text-gray-500 text-xs py-2">Todavía no hay lecciones para este módulo.</p>
            )}

            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isDone = completedLessonIds.has(lesson.id)
                const isOpen = expandedLesson === lesson.id
                return (
                  <div key={lesson.id} className="border border-gray-700/50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedLesson(isOpen ? null : lesson.id)}
                      className="w-full flex items-center justify-between gap-2 p-2.5 bg-labdark-surface hover:bg-cyan-500/10 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> : <Circle className="w-4 h-4 text-gray-600 shrink-0" />}
                        <span className="text-sm font-medium text-gray-200 truncate">{idx + 1}. {lesson.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${DIFFICULTY_COLOR[lesson.difficulty] || ''}`}>
                          {DIFFICULTY_LABEL[lesson.difficulty] || lesson.difficulty}
                        </span>
                      </div>
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="p-3 bg-labdark-void border-t border-gray-700/50 space-y-4">
                        <p className="text-xs text-gray-400">{lesson.description}</p>

                        {/* Teoría */}
                        <div>{renderTheory(lesson.theory || '')}</div>

                        {/* Ejemplos */}
                        {lesson.examples?.map((ex, exIdx) => (
                          <div key={exIdx} className="bg-labdark-bg rounded-lg border border-gray-700/40 overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700/40">
                              <span className="text-[11px] text-gray-300 font-medium">{ex.title}</span>
                              <button
                                onClick={() => runInTerminal(ex.code)}
                                className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300"
                              >
                                <PlayCircle className="w-3 h-3" /> Probar en terminal
                              </button>
                            </div>
                            <pre className="p-2.5 text-[11px] text-cyan-300 font-mono whitespace-pre-wrap overflow-x-auto">{ex.code}</pre>
                            <p className="px-2.5 pb-2 text-[11px] text-gray-500">{ex.explanation}</p>
                          </div>
                        ))}

                        {/* Retos */}
                        {lesson.challenges?.map((ch, chIdx) => {
                          const hintKey = `${lesson.id}-${chIdx}`
                          const revealed = revealedHints[hintKey] || 0
                          return (
                            <div key={chIdx} className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 space-y-2">
                              <p className="text-xs font-semibold text-cyan-300">🎯 Reto: {ch.title}</p>
                              <p className="text-[11px] text-gray-400 whitespace-pre-wrap">{ch.description}</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => runInTerminal(ch.starter_code)}
                                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300"
                                >
                                  <PlayCircle className="w-3 h-3" /> Empezar en terminal
                                </button>
                                {ch.hints?.length > 0 && (
                                  <button
                                    onClick={() => setRevealedHints(prev => ({ ...prev, [hintKey]: Math.min((prev[hintKey] || 0) + 1, ch.hints.length) }))}
                                    className="flex items-center gap-1 text-[10px] text-yellow-400 hover:text-yellow-300"
                                  >
                                    <Lightbulb className="w-3 h-3" /> Pista ({revealed}/{ch.hints.length})
                                  </button>
                                )}
                              </div>
                              {revealed > 0 && (
                                <ul className="text-[11px] text-yellow-400/90 space-y-0.5 pl-4 list-disc">
                                  {ch.hints.slice(0, revealed).map((h, hIdx) => <li key={hIdx}>{h}</li>)}
                                </ul>
                              )}
                            </div>
                          )
                        })}

                        <button
                          onClick={() => markLessonComplete(lesson.id)}
                          disabled={isDone}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 disabled:opacity-50 disabled:cursor-default"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isDone ? 'Lección completada' : 'Marcar como completada'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Guides */}
        {showGuides && (
          <div className="bg-labdark-bg rounded-xl p-4 border border-gray-700/50 max-h-64 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-cyan-400 font-medium">Guía de Comandos</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {TERMINAL_GUIDES.map((guide, idx) => (
                <div key={idx} className="border border-gray-700/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveGuide(activeGuide === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-2 bg-labdark-surface hover:bg-cyan-500/10 transition-colors text-sm"
                  >
                    <span className="font-medium text-gray-200">{guide.title}</span>
                    {activeGuide === idx ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronRight className="w-3 h-3 text-cyan-400" />}
                  </button>
                  {activeGuide === idx && (
                    <div className="p-2 bg-labdark-void border-t border-gray-700/50 text-xs">
                      {guide.commands.map((cmd, cmdIdx) => (
                        <div key={cmdIdx} className="py-1 border-b border-gray-800 last:border-0">
                          <code className="text-cyan-400">{cmd.name}</code>
                          <span className="text-gray-500 ml-2">{cmd.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current folder contents */}
        {showTree && (
          <div className="bg-labdark-bg rounded-xl p-3 border border-gray-700/50">
            <p className="text-[11px] text-gray-500 mb-2">Contenido de {currentDir}:</p>
            <div className="flex flex-wrap gap-1.5">
              {dirChildren.length === 0 && <span className="text-gray-600 text-xs">(carpeta vacía)</span>}
              {dirChildren.map(name => {
                const childPath = currentDir === '/' ? `/${name}` : `${currentDir}/${name}`
                const isDir = fs[childPath]?.type === 'dir'
                return (
                  <span key={name} className={`px-2 py-1 rounded text-xs font-mono ${isDir ? 'bg-cyan-500/10 text-cyan-400' : 'bg-gray-700/30 text-gray-300'}`}>
                    {name}{isDir ? '/' : ''}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Terminal */}
        <div className="bg-labdark-void rounded-xl overflow-hidden border border-cyan-900/40" onClick={() => inputRef.current?.focus()}>
          <div className="flex items-center justify-between px-4 py-2 bg-labdark-bg border-b border-cyan-900/30">
            <span className="text-xs text-gray-500 font-mono">bash — estudiante@chaskios</span>
            <button
              onClick={(e) => { e.stopPropagation(); setTerminalOutput([]) }}
              className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              title="Limpiar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div ref={terminalRef} className="h-64 p-4 overflow-y-auto font-mono text-sm">
            {terminalOutput.map((line, idx) => (
              <div key={idx} className="text-cyan-300 whitespace-pre-wrap">{line || '\u00A0'}</div>
            ))}
            <div className="flex items-center text-cyan-300">
              <span className="text-cyan-500">$</span>
              <input
                ref={inputRef}
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none ml-2"
                autoFocus
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Terminal className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-cyan-300/90">
              <strong className="text-cyan-300">Fundamentos de Linux:</strong> estos mismos comandos funcionan en cualquier terminal real
              (Ubuntu, macOS, WSL). Practica aquí sin miedo a romper nada — ¡todo es un archivo!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
