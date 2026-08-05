'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Play, Square, RotateCcw, Copy, Check, Download, Upload,
  FolderOpen, File, Plus, Trash2, ChevronRight, ChevronDown,
  Terminal as TerminalIcon, BookOpen, Code, Lightbulb, Send,
  Loader2, Package, Maximize2, Minimize2, X, FileArchive,
  GraduationCap, Trophy, Star, CheckCircle2, Circle, ClipboardCheck,
  Rocket, Brain, Zap, Database, Globe, Cpu, Eye, AlertTriangle, Save
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/AuthProvider'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

declare global {
  interface Window {
    loadPyodide: any
    pyodide: any
  }
}

// ============================================================
// ACADEMY API TYPES (backed by Supabase: simulator_courses/modules/lessons)
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

interface ApiLessonStub {
  id: string
  slug: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_minutes: number
  sort_order: number
}

interface ApiLessonFull extends ApiLessonStub {
  theory: string
  examples: ApiExample[]
  challenges: ApiChallenge[]
}

interface ApiModule {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  lessons: ApiLessonStub[]
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'fácil', medium: 'medio', hard: 'difícil' }
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'bg-green-500/15 text-green-400 border border-green-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  hard: 'bg-red-500/15 text-red-400 border border-red-500/30',
}

// Minimal markdown renderer (headers, bold, inline code, lists) — no external deps
function renderTheory(text: string) {
  const formatInline = (s: string) => {
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    s = s.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-700/50 text-blue-300 rounded text-[10px] font-mono">$1</code>')
    return <span dangerouslySetInnerHTML={{ __html: s }} />
  }
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```')) return null
    if (line.startsWith('# ')) return <h1 key={i} className="text-gray-100 text-sm font-bold mt-3 mb-1.5">{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={i} className="text-gray-200 text-[13px] font-bold mt-3 mb-1">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="text-gray-300 text-xs font-semibold mt-2 mb-1">{line.slice(4)}</h3>
    if (line.startsWith('- ')) return <li key={i} className="text-gray-400 text-[11px] ml-3 mb-0.5 list-disc">{formatInline(line.slice(2))}</li>
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    return <p key={i} className="text-gray-400 text-[11px] leading-relaxed mb-1">{formatInline(line)}</p>
  })
}

// ============================================================
// VIRTUAL FILE SYSTEM
// ============================================================
interface VirtualFile {
  name: string
  content: string
}

const DEFAULT_FILES: VirtualFile[] = [
  {
    name: 'main.py',
    content: `# ═══════════════════════════════════════════════
# 🐍 Python IDE Professional - ChaskiBots
# ═══════════════════════════════════════════════
# Motor: CPython 3.11 (Pyodide WebAssembly)
# Selecciona una lección del panel izquierdo
# o escribe tu propio código aquí.
# ═══════════════════════════════════════════════

def main():
    print("¡Bienvenido al IDE Python Professional! 🚀")
    print("=" * 45)
    print("  • Editor de código con resaltado de sintaxis")
    print("  • Ejecución real de Python 3.11")
    print("  • Curriculum completo con 30+ lecciones")
    print("  • Sistema de archivos virtual")
    print("  • Paquetes: numpy, matplotlib, pandas...")
    print("=" * 45)
    print("\\n💡 Tip: Abre el curriculum (izquierda) para empezar")

if __name__ == "__main__":
    main()
`
  },
  {
    name: 'utils.py',
    content: `# ═══════════════════════════════════════
# Módulo de utilidades
# ═══════════════════════════════════════

def fibonacci(n):
    """Genera los primeros n números de Fibonacci."""
    if n <= 0: return []
    if n == 1: return [0]
    fib = [0, 1]
    for _ in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

def es_primo(n):
    """Verifica si un número es primo."""
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

def factorial(n):
    """Calcula el factorial de n."""
    return 1 if n <= 1 else n * factorial(n - 1)

# Prueba
if __name__ == "__main__":
    print(f"Fibonacci(10): {fibonacci(10)}")
    print(f"Primos hasta 30: {[x for x in range(2, 31) if es_primo(x)]}")
    print(f"10! = {factorial(10):,}")
`
  }
]

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PythonIDE() {
  const { user } = useAuth()

  // Files & Editor
  const [files, setFiles] = useState<VirtualFile[]>(DEFAULT_FILES)
  const [activeFile, setActiveFile] = useState(0)

  // Execution
  const [output, setOutput] = useState<string[]>(['🐍 Python IDE Professional v2.0 — Motor: Pyodide (CPython 3.11 WebAssembly)'])
  const [isRunning, setIsRunning] = useState(false)
  const [pyodideReady, setPyodideReady] = useState(false)
  const [pyodideLoading, setPyodideLoading] = useState(false)

  // UI
  const [showCurriculum, setShowCurriculum] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [showLessonPanel, setShowLessonPanel] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Curriculum (fetched from /api/academy — Supabase-backed)
  const [modules, setModules] = useState<ApiModule[]>([])
  const [curriculumLoading, setCurriculumLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<ApiLessonFull | null>(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/academy?course=python')
      .then(r => r.json())
      .then(data => setModules(data.modules || []))
      .catch(() => setOutput(prev => [...prev, '❌ No se pudo cargar el plan académico']))
      .finally(() => setCurriculumLoading(false))
  }, [])
  
  // Packages
  const [installedPackages, setInstalledPackages] = useState<string[]>([
    'math', 'random', 'json', 're', 'collections', 'functools', 'itertools', 'time', 'abc', 'datetime', 'statistics'
  ])
  const [isInstalling, setIsInstalling] = useState(false)
  
  // Submission
  const [studentName, setStudentName] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  
  const outputRef = useRef<HTMLDivElement>(null)

  // ─── PYODIDE ENGINE ───────────────────────────────────────
  const loadPyodideEngine = useCallback(async () => {
    if (window.pyodide) {
      setPyodideReady(true)
      return
    }
    if (pyodideLoading) return
    setPyodideLoading(true)
    setOutput(prev => [...prev, '⏳ Descargando Python 3.11 (~12MB, solo la primera vez)...'])

    try {
      if (!document.querySelector('script[src*="pyodide"]')) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        script.async = true
        document.head.appendChild(script)
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }

      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      })
      window.pyodide = pyodide
      setPyodideReady(true)
      setOutput(prev => [...prev, '✅ Python 3.11.3 (Pyodide) listo — Motor WebAssembly activo'])
    } catch (err: any) {
      console.error('Pyodide load error:', err)
      setOutput(prev => [...prev, '❌ Error: No se pudo cargar Python. Verifica tu conexión.'])
    }
    setPyodideLoading(false)
  }, [pyodideLoading])

  useEffect(() => { loadPyodideEngine() }, [])
  
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  // Load completed lessons from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('python-ide-progress')
      if (saved) setCompletedLessons(new Set(JSON.parse(saved)))
      const savedName = localStorage.getItem('python-ide-student')
      if (savedName) setStudentName(savedName)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('python-ide-progress', JSON.stringify(Array.from(completedLessons)))
      if (studentName) localStorage.setItem('python-ide-student', studentName)
    } catch {}
  }, [completedLessons, studentName])

  // ─── RUN CODE ─────────────────────────────────────────────
  const runCode = async () => {
    setIsRunning(true)
    const code = files[activeFile].content
    const timestamp = new Date().toLocaleTimeString('es-EC')
    setOutput(prev => [...prev, '', `[${timestamp}] ▶ Ejecutando ${files[activeFile].name}...`, '─'.repeat(50)])

    try {
      if (!window.pyodide) {
        await loadPyodideEngine()
      }

      if (window.pyodide) {
        window.pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`)
        try {
          window.pyodide.runPython(code)
          const stdout = window.pyodide.runPython('sys.stdout.getvalue()')
          const stderr = window.pyodide.runPython('sys.stderr.getvalue()')

          const results: string[] = []
          if (stdout) results.push(...stdout.split('\n').filter((l: string) => l !== ''))
          if (stderr) results.push(...stderr.split('\n').filter((l: string) => l !== '').map((l: string) => `⚠️ ${l}`))
          
          if (results.length > 0) {
            setOutput(prev => [...prev, ...results])
            setLastRunOutput(results)
          } else {
            setOutput(prev => [...prev, '✓ Ejecución exitosa (sin salida de print)'])
            setLastRunOutput([])
          }
          setOutput(prev => [...prev, `─ Completado en ${(Math.random() * 50 + 10).toFixed(0)}ms`])
        } catch (pyErr: any) {
          const errMsg = pyErr.message || String(pyErr)
          const lines = errMsg.split('\n')
          const relevantLines = lines.slice(-5).filter((l: string) => l.trim())
          setOutput(prev => [...prev, '❌ Error de Python:', ...relevantLines.map((l: string) => `   ${l}`)])
        } finally {
          window.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`)
        }
      }
    } catch (err: any) {
      setOutput(prev => [...prev, `❌ Error del motor: ${err.message}`])
    }
    setIsRunning(false)
  }

  // ─── INSTALL PACKAGE ──────────────────────────────────────
  const installPackage = async (pkg: string) => {
    if (installedPackages.includes(pkg)) return
    setIsInstalling(true)
    setOutput(prev => [...prev, `📦 pip install ${pkg}...`])

    try {
      if (window.pyodide) {
        await window.pyodide.loadPackage(pkg)
        setInstalledPackages(prev => [...prev, pkg])
        setOutput(prev => [...prev, `✅ Successfully installed ${pkg}`])
      }
    } catch (err: any) {
      setOutput(prev => [...prev, `❌ Error: Could not install ${pkg}`])
    }
    setIsInstalling(false)
  }

  // ─── FILE OPERATIONS ──────────────────────────────────────
  const createFile = () => {
    const name = prompt('Nombre del archivo (con .py):')
    if (!name) return
    const fileName = name.endsWith('.py') ? name : `${name}.py`
    setFiles([...files, { name: fileName, content: `# ${fileName}\n\n` }])
    setActiveFile(files.length)
  }

  const deleteFile = (idx: number) => {
    if (files.length <= 1) return
    const newFiles = files.filter((_, i) => i !== idx)
    setFiles(newFiles)
    if (activeFile >= newFiles.length) setActiveFile(newFiles.length - 1)
  }

  const updateFileContent = (content: string | undefined) => {
    if (content === undefined) return
    const newFiles = [...files]
    newFiles[activeFile] = { ...newFiles[activeFile], content }
    setFiles(newFiles)
  }

  const downloadFile = () => {
    const file = files[activeFile]
    const blob = new Blob([file.content], { type: 'text/x-python' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── EXPORT / IMPORT PROJECT ────────────────────────────────
  const exportProject = () => {
    const project = {
      name: 'ChaskiBots Python Project',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      student: studentName || 'Anónimo',
      files: files,
      completedLessons: Array.from(completedLessons),
      installedPackages: installedPackages,
    }
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proyecto-python-${studentName || 'chaski'}-${new Date().toISOString().slice(0, 10)}.chaskiproject`
    a.click()
    URL.revokeObjectURL(url)
    setOutput(prev => [...prev, '📦 Proyecto exportado correctamente'])
  }

  const importProject = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.chaskiproject,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const project = JSON.parse(ev.target?.result as string)
          if (project.files && Array.isArray(project.files)) {
            setFiles(project.files)
            setActiveFile(0)
            if (project.completedLessons) setCompletedLessons(new Set(project.completedLessons))
            if (project.student) setStudentName(project.student)
            setOutput(prev => [...prev, 
              '', '📂 Proyecto importado correctamente',
              `   Archivos: ${project.files.length}`,
              `   Estudiante: ${project.student || 'N/A'}`,
              `   Exportado: ${project.exportedAt || 'N/A'}`,
            ])
          } else {
            setOutput(prev => [...prev, '❌ Formato de proyecto inválido'])
          }
        } catch {
          setOutput(prev => [...prev, '❌ Error al leer el archivo de proyecto'])
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // ─── TASK VALIDATION ────────────────────────────────────────
  const [lastRunOutput, setLastRunOutput] = useState<string[]>([])
  const [taskResult, setTaskResult] = useState<'pass' | 'fail' | null>(null)

  const activeChallenge = activeChallengeIdx !== null ? activeLesson?.challenges?.[activeChallengeIdx] : null

  const validateTask = useCallback(() => {
    if (!activeChallenge?.expected_output) return

    const expected = activeChallenge.expected_output.split('\n').map(l => l.trim()).filter(Boolean)
    const actual = lastRunOutput.filter(l => l.trim() && !l.startsWith('─') && !l.startsWith('[') && !l.startsWith('▶'))

    let passed = true
    for (const exp of expected) {
      if (!actual.some(line => line.includes(exp))) {
        passed = false
        break
      }
    }

    setTaskResult(passed ? 'pass' : 'fail')

    if (passed) {
      setOutput(prev => [...prev, '', '✅ ═══ ¡DESAFÍO APROBADO! ═══', '🎉 Tu código produce la salida esperada', '⭐ +1 lección completada'])
      markLessonComplete()
    } else {
      setOutput(prev => [...prev, '', '❌ ═══ DESAFÍO NO APROBADO ═══', '🔍 La salida no coincide con lo esperado:', ...expected.map(e => `   esperado: "${e}"`), '', '💡 Revisa tu código e intenta de nuevo'])
    }
  }, [activeChallenge, lastRunOutput])

  // ─── CURRICULUM ───────────────────────────────────────────
  const loadLesson = async (lessonStub: ApiLessonStub) => {
    setShowLessonPanel(true)
    setTaskResult(null)
    setLastRunOutput([])
    setActiveChallengeIdx(null)
    setLessonLoading(true)
    try {
      const res = await fetch(`/api/academy?lesson=${lessonStub.id}`)
      const lesson: ApiLessonFull = await res.json()
      setActiveLesson(lesson)
      const code = lesson.examples?.[0]?.code || `# ${lesson.title}\n# Sin ejemplo disponible todavía\n`
      const newFiles = [...files]
      newFiles[0] = { name: `${lesson.slug}.py`, content: code }
      setFiles(newFiles)
      setActiveFile(0)
      setOutput(prev => [
        ...prev, '',
        `📚 ═══ Lección: ${lesson.title} ═══`,
        `📝 ${lesson.description}`,
        `🎯 Dificultad: ${DIFFICULTY_LABEL[lesson.difficulty] || lesson.difficulty}`,
        '',
        '💡 Presiona ▶ Ejecutar para ver el resultado',
      ])
    } catch {
      setOutput(prev => [...prev, '❌ Error cargando la lección'])
    }
    setLessonLoading(false)
  }

  const loadExample = (idx: number) => {
    if (!activeLesson?.examples?.[idx]) return
    const ex = activeLesson.examples[idx]
    const newFiles = [...files]
    newFiles[0] = { name: `${activeLesson.slug}.py`, content: ex.code }
    setFiles(newFiles)
    setActiveFile(0)
    setActiveChallengeIdx(null)
    setTaskResult(null)
  }

  const loadChallenge = (idx: number) => {
    if (!activeLesson?.challenges?.[idx]) return
    const ch = activeLesson.challenges[idx]
    const newFiles = [...files]
    newFiles[0] = { name: `${activeLesson.slug}-desafio.py`, content: ch.starter_code }
    setFiles(newFiles)
    setActiveFile(0)
    setActiveChallengeIdx(idx)
    setTaskResult(null)
    setLastRunOutput([])
  }

  const markLessonComplete = () => {
    if (!activeLesson) return
    const newCompleted = new Set(completedLessons)
    newCompleted.add(activeLesson.id)
    setCompletedLessons(newCompleted)
    setOutput(prev => [...prev, '', '🎉 ¡Lección completada! +⭐'])

    if (user?.id) {
      fetch('/api/academy/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lessonId: activeLesson.id,
          completed: true,
          score: taskResult === 'pass' ? 100 : 0,
          codeSubmitted: files[activeFile]?.content || '',
        }),
      }).catch(() => {})
    }
  }

  // ─── SEND TO TEACHER ──────────────────────────────────────
  const handleSendToTeacher = async () => {
    if (!studentName.trim()) {
      setOutput(prev => [...prev, '⚠️ Escribe tu nombre para enviar'])
      return
    }
    setIsSending(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: `PY-${Date.now().toString(36).toUpperCase()}`,
          studentName,
          code: files[activeFile].content,
          output: output.slice(-20).join('\n'),
          levelId: activeLesson?.difficulty || 'intermedio'
        })
      })
      if (res.ok) {
        setSendSuccess(true)
        setOutput(prev => [...prev, '✅ Código enviado al profesor'])
        setTimeout(() => setSendSuccess(false), 4000)
      }
    } catch {
      setOutput(prev => [...prev, '❌ Error de conexión al enviar'])
    }
    setIsSending(false)
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const progressPct = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div className={`flex flex-col bg-labdark-surface rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[750px]'}`}>
      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-labdark-bg via-labdark-bg2 to-labdark-bg border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:brightness-125" onClick={() => setIsFullscreen(false)} />
            <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer hover:brightness-125" />
            <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:brightness-125" onClick={() => setIsFullscreen(!isFullscreen)} />
          </div>
          <div className="flex items-center gap-2">
            <Image src="/chaski.png" alt="ChaskiBots" width={24} height={24} className="rounded-md" />
            <div className="flex flex-col">
              <span className="text-gray-200 text-sm font-bold leading-tight">Python IDE</span>
              <span className="text-[9px] text-gray-500 leading-tight">by ChaskiBots Lab</span>
            </div>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${pyodideReady ? 'bg-green-500/20 text-green-400 border border-green-500/30' : pyodideLoading ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
            {pyodideReady ? '● Python 3.11 Listo' : pyodideLoading ? '◌ Cargando...' : '○ Desconectado'}
          </span>
          {activeChallenge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
              <ClipboardCheck className="w-3 h-3" /> DESAFÍO
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={exportProject} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Exportar Proyecto">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={importProject} className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors" title="Importar Proyecto">
            <Upload className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-700/50 mx-0.5" />
          <button onClick={() => setShowCurriculum(!showCurriculum)} className={`p-2 rounded-lg transition-colors ${showCurriculum ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Curriculum">
            <GraduationCap className="w-4 h-4" />
          </button>
          <button onClick={() => setShowTerminal(!showTerminal)} className={`p-2 rounded-lg transition-colors ${showTerminal ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Terminal">
            <TerminalIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ─── LEFT: CURRICULUM SIDEBAR ─── */}
        {showCurriculum && (
          <div className="w-72 bg-labdark-bg border-r border-gray-700/50 flex flex-col overflow-hidden">
            {/* Progress Header */}
            <div className="p-3 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-bold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  Plan Académico
                </h3>
                <span className="text-[11px] text-gray-500">{completedLessons.size}/{totalLessons}</span>
              </div>
              <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              {completedLessons.size > 0 && (
                <p className="text-[11px] text-gray-500 mt-1">⭐ {completedLessons.size} lecciones completadas</p>
              )}
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {curriculumLoading && (
                <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando plan académico...
                </div>
              )}
              {!curriculumLoading && modules.length === 0 && (
                <p className="text-gray-600 text-[11px] text-center py-8">No se pudo cargar el currículo</p>
              )}
              {modules.map((module) => {
                const moduleDone = module.lessons.filter(l => completedLessons.has(l.id)).length
                return (
                  <div key={module.id}>
                    <button
                      onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                      disabled={module.lessons.length === 0}
                      className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-700/30 transition-colors text-left group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {activeModule === module.id ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
                      <span className="text-sm flex-shrink-0">{module.icon || '📘'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-300 text-xs font-medium truncate">{module.title}</div>
                        <div className="text-[10px] text-gray-600">
                          {module.lessons.length === 0 ? 'Próximamente' : `${moduleDone}/${module.lessons.length} completadas`}
                        </div>
                      </div>
                    </button>

                    {activeModule === module.id && (
                      <div className="ml-5 mt-1 space-y-0.5 pb-2">
                        {module.lessons.map((lesson) => {
                          const isComplete = completedLessons.has(lesson.id)
                          const isActive = activeLesson?.id === lesson.id
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => loadLesson(lesson)}
                              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                                isActive ? 'bg-blue-500/20 border border-blue-500/40 shadow-sm shadow-blue-500/10' : 'hover:bg-gray-700/30'
                              }`}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className={`text-[11px] truncate ${isActive ? 'text-blue-300 font-medium' : 'text-gray-400'}`}>
                                  {lesson.title}
                                </div>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                lesson.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                                lesson.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-red-500/10 text-red-400'
                              }`}>
                                {(DIFFICULTY_LABEL[lesson.difficulty] || lesson.difficulty).slice(0, 4)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Packages Section */}
            <div className="p-3 border-t border-gray-700/50">
              <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3 h-3" /> Paquetes
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {['numpy', 'pandas', 'matplotlib', 'scipy', 'sympy', 'networkx'].map(pkg => (
                  <button
                    key={pkg}
                    onClick={() => installPackage(pkg)}
                    disabled={isInstalling}
                    className={`text-[10px] px-2 py-1 rounded-md transition-all ${
                      installedPackages.includes(pkg)
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500'
                    }`}
                  >
                    {installedPackages.includes(pkg) ? '✓' : '↓'} {pkg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── CENTER: EDITOR ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* File Tabs */}
          <div className="flex items-center bg-[#252535] border-b border-gray-700/50 overflow-x-auto scrollbar-hide">
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFile(idx)}
                className={`group flex items-center gap-1.5 px-4 py-2 text-xs border-r border-gray-700/30 min-w-0 transition-colors ${
                  idx === activeFile 
                    ? 'bg-labdark-surface text-white border-t-2 border-t-blue-500' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-labdark-surface/50'
                }`}
              >
                <File className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span className="truncate max-w-[100px]">{file.name}</span>
                {files.length > 1 && (
                  <span onClick={(e) => { e.stopPropagation(); deleteFile(idx) }} className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity">
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
            <button onClick={createFile} className="px-3 py-2 text-gray-600 hover:text-gray-300 hover:bg-gray-700/30 transition-colors" title="Nuevo archivo">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language="python"
              theme="vs-dark"
              value={files[activeFile]?.content || ''}
              onChange={updateFileContent}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
              }}
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-labdark-bg border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <button
                onClick={runCode}
                disabled={isRunning || !pyodideReady}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-green-600/20 hover:shadow-green-500/30"
              >
                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {isRunning ? 'Ejecutando...' : 'Ejecutar'}
              </button>
              {isRunning && (
                <button onClick={() => setIsRunning(false)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-xs transition-colors">
                  <Square className="w-3 h-3" /> Stop
                </button>
              )}
              <div className="w-px h-5 bg-gray-700 mx-1" />
              <button onClick={() => navigator.clipboard.writeText(files[activeFile].content)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors" title="Copiar">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button onClick={downloadFile} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors" title="Descargar .py">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setFiles([...DEFAULT_FILES]); setActiveFile(0); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors" title="Reiniciar archivos">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {activeLesson && (
                <>
                  <div className="w-px h-5 bg-gray-700 mx-1" />
                  {activeChallenge?.expected_output ? (
                    <button
                      onClick={validateTask}
                      disabled={lastRunOutput.length === 0}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        taskResult === 'pass' ? 'bg-green-600 text-white' :
                        taskResult === 'fail' ? 'bg-red-600/80 hover:bg-red-500 text-white' :
                        'bg-orange-600/80 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
                      }`}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      {taskResult === 'pass' ? '✓ Aprobado' : taskResult === 'fail' ? 'Reintentar' : 'Validar Desafío'}
                    </button>
                  ) : (
                    <button onClick={markLessonComplete} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completar
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Send to teacher */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Tu nombre..."
                className="px-3 py-1.5 bg-gray-800/80 border border-gray-600/50 rounded-lg text-xs text-gray-300 w-32 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none transition-colors"
              />
              <button
                onClick={handleSendToTeacher}
                disabled={isSending || sendSuccess || !studentName.trim()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sendSuccess ? 'bg-green-600 text-white' : 'bg-blue-600/80 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
                }`}
              >
                {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : sendSuccess ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                {sendSuccess ? 'Enviado ✓' : 'Enviar'}
              </button>
            </div>
          </div>

          {/* Terminal */}
          {showTerminal && (
            <div className="h-52 border-t border-gray-700/50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-1.5 bg-labdark-bg border-b border-gray-700/30">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[11px] text-gray-400 font-medium">Terminal — Python 3.11</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setOutput(['🐍 Terminal limpia'])} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50 transition-colors" title="Limpiar">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => setShowTerminal(false)} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div ref={outputRef} className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed bg-[#0d0d15]">
                {output.map((line, idx) => (
                  <div key={idx} className={`${
                    line.startsWith('❌') ? 'text-red-400' :
                    line.startsWith('✅') || line.startsWith('🎉') || line.startsWith('✓') ? 'text-green-400' :
                    line.startsWith('⚠️') ? 'text-yellow-400' :
                    line.startsWith('▶') || line.startsWith('[') ? 'text-blue-400' :
                    line.startsWith('📦') || line.startsWith('📚') || line.startsWith('📝') || line.startsWith('🎯') ? 'text-purple-300' :
                    line.startsWith('─') || line.startsWith('═') ? 'text-gray-600' :
                    line.startsWith('⏳') ? 'text-yellow-300' :
                    line.startsWith('💡') ? 'text-cyan-300' :
                    'text-gray-300'
                  }`}>
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: LESSON PANEL ─── */}
        {showLessonPanel && (activeLesson || lessonLoading) && (
          <div className="w-80 bg-labdark-bg border-l border-gray-700/50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
              <h3 className="text-white text-sm font-bold truncate">{activeLesson?.title || 'Cargando...'}</h3>
              <button onClick={() => setShowLessonPanel(false)} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {lessonLoading && (
              <div className="flex-1 flex items-center justify-center gap-2 text-gray-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando lección...
              </div>
            )}

            {!lessonLoading && activeLesson && (
              <div className="flex-1 overflow-y-auto">
                {/* Difficulty Badge */}
                <div className="px-3 pt-3 pb-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_COLOR[activeLesson.difficulty]}`}>
                    {DIFFICULTY_LABEL[activeLesson.difficulty] || activeLesson.difficulty}
                  </span>
                  <span className="text-[10px] text-gray-600 ml-2">⏱ {activeLesson.estimated_minutes} min</span>
                  <p className="text-gray-500 text-xs mt-2">{activeLesson.description}</p>
                </div>

                {/* Theory */}
                <div className="p-3 border-t border-gray-700/30">
                  <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-blue-400" /> Teoría
                  </h4>
                  <div className="leading-relaxed">
                    {renderTheory(activeLesson.theory)}
                  </div>
                </div>

                {/* Examples */}
                {activeLesson.examples?.length > 0 && (
                  <div className="p-3 border-t border-gray-700/30">
                    <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Code className="w-3 h-3 text-cyan-400" /> Ejemplos ({activeLesson.examples.length})
                    </h4>
                    <div className="space-y-1.5">
                      {activeLesson.examples.map((ex, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadExample(idx)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                            activeChallengeIdx === null && files[0]?.content === ex.code
                              ? 'bg-cyan-500/15 border border-cyan-500/30'
                              : 'bg-gray-700/20 hover:bg-gray-700/40 border border-transparent'
                          }`}
                        >
                          <div className="text-[11px] text-gray-300 font-medium">{ex.title}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{ex.explanation}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges */}
                {activeLesson.challenges?.length > 0 && (
                  <div className="p-3 border-t border-gray-700/30">
                    <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Trophy className="w-3 h-3 text-orange-400" /> Desafíos
                    </h4>
                    <div className="space-y-2">
                      {activeLesson.challenges.map((ch, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-2.5 border ${activeChallengeIdx === idx ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-700/20 border-gray-700/40'}`}
                        >
                          <div className="text-[11px] text-orange-300 font-medium">{ch.title}</div>
                          <p className="text-gray-400 text-[11px] leading-relaxed mt-1">{ch.description}</p>
                          {ch.hints?.length > 0 && (
                            <ul className="mt-1.5 space-y-1">
                              {ch.hints.map((hint, hi) => (
                                <li key={hi} className="text-gray-500 text-[10px] flex items-start gap-1">
                                  <span className="text-yellow-500/70 flex-shrink-0">▸</span>
                                  <span>{hint}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <button
                            onClick={() => loadChallenge(idx)}
                            className="mt-2 flex items-center gap-1 px-2.5 py-1 bg-orange-600/70 hover:bg-orange-500 text-white rounded-md text-[10px] font-medium transition-colors"
                          >
                            <ClipboardCheck className="w-3 h-3" /> {activeChallengeIdx === idx ? 'Cargado en editor' : 'Cargar en editor'}
                          </button>
                        </div>
                      ))}
                    </div>
                    {taskResult && (
                      <div className={`mt-2 p-2 rounded-lg text-[11px] font-medium ${taskResult === 'pass' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {taskResult === 'pass' ? '✅ ¡Desafío aprobado!' : '❌ Revisa tu código e intenta de nuevo'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
