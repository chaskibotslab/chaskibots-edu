'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Copy, Check, Code2 } from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => <div className="h-64 bg-[#1e1e1e] rounded-xl animate-pulse" /> })

// Visor de codigo Arduino real (Monaco, el mismo editor que usa el IDE de
// Python de la plataforma): resaltado de sintaxis, numeros de linea,
// scroll propio -- en vez de un <pre> de texto plano. Solo lectura.
export default function ArduinoCodeViewer({ code, filename = 'codigo.ino' }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false)
  const lineCount = code.split('\n').length
  const height = Math.min(Math.max(lineCount * 19 + 24, 160), 560)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Sin acceso al portapapeles: no hacemos nada mas.
    }
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-sm">
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
          <Code2 className="w-3.5 h-3.5 text-chaski-primary" />
          {filename}
        </div>
        <button
          onClick={copiar}
          className="no-print flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <MonacoEditor
        height={height}
        language="cpp"
        theme="vs-dark"
        value={code}
        options={{
          readOnly: true,
          domReadOnly: true,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          minimap: { enabled: false },
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          scrollbar: { alwaysConsumeMouseWheel: false },
          contextmenu: false,
        }}
      />
    </div>
  )
}
