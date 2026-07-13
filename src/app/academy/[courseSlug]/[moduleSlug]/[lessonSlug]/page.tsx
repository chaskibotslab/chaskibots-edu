'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  BookOpen, Code, Play, ChevronRight, ChevronLeft, Copy, Check, 
  Lightbulb, Terminal, ArrowLeft, Loader2, RotateCcw, Zap, 
  CheckCircle2, ChevronDown, Eye, EyeOff
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface Example {
  title: string
  code: string
  explanation: string
}

interface Challenge {
  title: string
  description: string
  starter_code: string
  expected_output: string
  hints: string[]
}

interface Lesson {
  id: string
  slug: string
  title: string
  description: string
  theory: string
  examples: Example[]
  challenges: Challenge[]
  difficulty: string
  estimated_minutes: number
}

interface Module {
  id: string
  slug: string
  title: string
}

interface Course {
  id: string
  slug: string
  title: string
}

export default function LessonPage() {
  const params = useParams()
  const { courseSlug, moduleSlug, lessonSlug } = params as { courseSlug: string; moduleSlug: string; lessonSlug: string }
  const { user } = useAuth()
  
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'theory' | 'examples' | 'challenges'>('theory')
  
  // Code editor state
  const [code, setCode] = useState('')
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [activeChallenge, setActiveChallenge] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [challengeCode, setChallengeCode] = useState('')
  const [challengeOutput, setChallengeOutput] = useState<string[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch(`/api/academy?course=${courseSlug}&module=${moduleSlug}`)
      .then(r => r.json())
      .then(data => {
        setCourse(data.course)
        setModule(data.module)
        const foundLesson = data.lessons?.find((l: any) => l.slug === lessonSlug)
        if (foundLesson) {
          // Parse JSON fields if they're strings
          if (typeof foundLesson.examples === 'string') foundLesson.examples = JSON.parse(foundLesson.examples)
          if (typeof foundLesson.challenges === 'string') foundLesson.challenges = JSON.parse(foundLesson.challenges)
          setLesson(foundLesson)
          if (foundLesson.examples?.[0]) {
            setCode(foundLesson.examples[0].code)
          }
          if (foundLesson.challenges?.[0]) {
            setChallengeCode(foundLesson.challenges[0].starter_code)
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [courseSlug, moduleSlug, lessonSlug])

  // Simple Python simulator
  const runPython = (sourceCode: string): string[] => {
    const results: string[] = []
    const variables: Record<string, any> = {}
    const lines = sourceCode.split('\n')

    const evaluateExpr = (expr: string): any => {
      expr = expr.trim()
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.slice(1, -1)
      }
      if (expr.startsWith('f"') || expr.startsWith("f'")) {
        let str = expr.slice(2, -1)
        str = str.replace(/\{([^}]+)\}/g, (_, varExpr) => {
          const fmt = varExpr.split(':')
          const val = evaluateExpr(fmt[0].trim())
          return String(val)
        })
        return str
      }
      if (!isNaN(Number(expr))) return Number(expr)
      if (expr === 'True') return true
      if (expr === 'False') return false
      if (expr === 'None') return null
      if (variables[expr] !== undefined) return variables[expr]
      
      // Basic arithmetic
      if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/') || expr.includes('%') || expr.includes('**')) {
        try {
          let evalExpr = expr
          Object.keys(variables).forEach(v => {
            evalExpr = evalExpr.replace(new RegExp(`\\b${v}\\b`, 'g'), JSON.stringify(variables[v]))
          })
          return eval(evalExpr)
        } catch { return expr }
      }
      return expr
    }

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || line.startsWith('#')) continue

        if (line.startsWith('print(')) {
          const content = line.slice(6, -1)
          const parts = content.split(',').map(p => String(evaluateExpr(p.trim())))
          results.push(parts.join(' '))
        } else if (line.includes('=') && !line.includes('==') && !line.startsWith('if') && !line.startsWith('for') && !line.startsWith('while')) {
          const eqIdx = line.indexOf('=')
          const varName = line.slice(0, eqIdx).trim()
          const value = line.slice(eqIdx + 1).trim()
          if (!varName.includes(' ') && !varName.includes('(')) {
            variables[varName] = evaluateExpr(value)
          }
        } else if (line.startsWith('for ') && line.endsWith(':')) {
          const match = line.match(/for\s+(\w+)\s+in\s+range\((.+)\):/)
          if (match) {
            const [, varName, rangeArgs] = match
            const args = rangeArgs.split(',').map(a => Number(evaluateExpr(a.trim())))
            const start = args.length >= 2 ? args[0] : 0
            const end = args.length >= 2 ? args[1] : args[0]
            const bodyLines: string[] = []
            i++
            while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].trim() === '')) {
              if (lines[i].trim()) bodyLines.push(lines[i].trim())
              i++
            }
            i--
            for (let n = start; n < end; n++) {
              variables[varName] = n
              for (const bl of bodyLines) {
                if (bl.startsWith('print(')) {
                  const content = bl.slice(6, -1)
                  const parts = content.split(',').map(p => String(evaluateExpr(p.trim())))
                  results.push(parts.join(' '))
                } else if (bl.includes('=') && !bl.includes('==')) {
                  const eq = bl.indexOf('=')
                  const vn = bl.slice(0, eq).trim()
                  const vv = bl.slice(eq + 1).trim()
                  variables[vn] = evaluateExpr(vv)
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      results.push(`Error: ${err.message}`)
    }

    return results.length > 0 ? results : ['(Programa ejecutado sin salida)']
  }

  const handleRun = () => {
    setIsRunning(true)
    setTimeout(() => {
      setOutput(runPython(code))
      setIsRunning(false)
    }, 300)
  }

  const handleRunChallenge = () => {
    setIsRunning(true)
    setTimeout(() => {
      setChallengeOutput(runPython(challengeCode))
      setIsRunning(false)
    }, 300)
  }

  const loadExample = (idx: number) => {
    if (lesson?.examples?.[idx]) {
      setCode(lesson.examples[idx].code)
      setOutput([])
    }
  }

  const copyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-slate-500">Lección no encontrada</p>
          <Link href={`/academy/${courseSlug}`} className="text-blue-600 hover:underline text-sm">
            ← Volver al curso
          </Link>
        </div>
      </div>
    )
  }

  // Render markdown-like theory (simple)
  const renderTheory = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-slate-900 mt-6 mb-3">{line.slice(2)}</h1>
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mt-5 mb-2">{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-slate-700 mt-4 mb-2">{line.slice(4)}</h3>
      if (line.startsWith('- ')) return <li key={i} className="text-slate-600 ml-4 mb-1 list-disc">{formatInline(line.slice(2))}</li>
      if (line.startsWith('```')) return null
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim())
        if (cells.every(c => c.trim().match(/^-+$/))) return null
        return (
          <div key={i} className="flex gap-0 text-sm">
            {cells.map((cell, ci) => (
              <div key={ci} className="flex-1 px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-700">
                {formatInline(cell.trim())}
              </div>
            ))}
          </div>
        )
      }
      if (line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-slate-600 leading-relaxed mb-2">{formatInline(line)}</p>
    })
  }

  const formatInline = (text: string) => {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 text-indigo-700 rounded text-sm font-mono">$1</code>')
    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }

  const courseGradient = courseSlug === 'python' ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <main className="flex-1 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 flex-wrap">
            <Link href="/academy" className="hover:text-slate-700">Academy</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/academy/${courseSlug}`} className="hover:text-slate-700">{course?.title}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-400">{module?.title}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">{lesson.title}</span>
          </div>

          {/* Lesson header */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{lesson.title}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  ⏱ {lesson.estimated_minutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
            {[
              { key: 'theory', label: 'Teoría', icon: <BookOpen className="w-4 h-4" /> },
              { key: 'examples', label: 'Ejemplos', icon: <Code className="w-4 h-4" /> },
              { key: 'challenges', label: 'Desafíos', icon: <Zap className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r ' + courseGradient + ' text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.key === 'challenges' && lesson.challenges?.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'challenges' ? 'bg-white/20' : 'bg-slate-200'}`}>
                    {lesson.challenges.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Theory tab */}
          {activeTab === 'theory' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm prose-slate max-w-none">
              {renderTheory(lesson.theory)}
            </div>
          )}

          {/* Examples tab */}
          {activeTab === 'examples' && (
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Left: Examples list */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm px-1">Ejemplos ({lesson.examples?.length})</h3>
                {lesson.examples?.map((ex, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                      code === ex.code ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200'
                    }`}
                    onClick={() => loadExample(idx)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900 text-sm">{ex.title}</h4>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyCode(ex.code, idx) }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg"
                      >
                        {copied === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">{ex.explanation}</p>
                  </div>
                ))}
              </div>

              {/* Right: Code Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-slate-900 text-sm">Editor</h3>
                  <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isRunning ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-r ' + courseGradient + ' text-white hover:shadow-md'
                    }`}
                  >
                    {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    Ejecutar
                  </button>
                </div>
                <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-[#181825] border-b border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <span className="text-slate-500 text-xs ml-2 font-mono">main.py</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-transparent text-[#cdd6f4] font-mono text-sm p-4 outline-none resize-none leading-6"
                    rows={Math.max(8, code.split('\n').length + 1)}
                    spellCheck={false}
                  />
                </div>

                {/* Output */}
                {output.length > 0 && (
                  <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-slate-700">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#181825] border-b border-slate-700">
                      <Terminal className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-slate-400 font-mono">Salida</span>
                    </div>
                    <div className="p-4 font-mono text-sm max-h-48 overflow-y-auto">
                      {output.map((line, i) => (
                        <div key={i} className="text-green-300">{line}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Challenges tab */}
          {activeTab === 'challenges' && lesson.challenges && lesson.challenges.length > 0 && (
            <div className="space-y-4">
              {/* Challenge selector */}
              {lesson.challenges.length > 1 && (
                <div className="flex gap-2">
                  {lesson.challenges.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveChallenge(idx)
                        setChallengeCode(lesson.challenges[idx].starter_code)
                        setChallengeOutput([])
                        setShowHints(false)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeChallenge === idx 
                          ? 'bg-gradient-to-r ' + courseGradient + ' text-white' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Desafío {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-4">
                {/* Challenge description */}
                <div className="space-y-3">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <h3 className="font-bold text-slate-900">{lesson.challenges[activeChallenge].title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {lesson.challenges[activeChallenge].description}
                    </p>
                    
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-1">Salida esperada:</p>
                      <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap">
                        {lesson.challenges[activeChallenge].expected_output}
                      </pre>
                    </div>
                  </div>

                  {/* Hints */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHints ? 'Ocultar pistas' : 'Ver pistas'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showHints ? 'rotate-180' : ''}`} />
                    </button>
                    {showHints && (
                      <ul className="mt-3 space-y-2">
                        {lesson.challenges[activeChallenge].hints.map((hint, hi) => (
                          <li key={hi} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-amber-500 font-bold mt-0.5">💡</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Challenge editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-slate-900 text-sm">Tu solución</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setChallengeCode(lesson.challenges[activeChallenge].starter_code); setChallengeOutput([]) }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                      <button
                        onClick={handleRunChallenge}
                        disabled={isRunning}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isRunning ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-r ' + courseGradient + ' text-white hover:shadow-md'
                        }`}
                      >
                        {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Ejecutar
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-[#181825] border-b border-slate-700">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <span className="text-slate-500 text-xs ml-2 font-mono">challenge.py</span>
                    </div>
                    <textarea
                      value={challengeCode}
                      onChange={(e) => setChallengeCode(e.target.value)}
                      className="w-full bg-transparent text-[#cdd6f4] font-mono text-sm p-4 outline-none resize-none leading-6"
                      rows={Math.max(8, challengeCode.split('\n').length + 1)}
                      spellCheck={false}
                    />
                  </div>

                  {challengeOutput.length > 0 && (
                    <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-slate-700">
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#181825] border-b border-slate-700">
                        <Terminal className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-xs text-slate-400 font-mono">Resultado</span>
                      </div>
                      <div className="p-4 font-mono text-sm max-h-48 overflow-y-auto">
                        {challengeOutput.map((line, i) => (
                          <div key={i} className="text-green-300">{line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
            <Link
              href={`/academy/${courseSlug}`}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al curso
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
