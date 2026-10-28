'use client'

// Editor Monaco con resaltado C++, autocompletado de la API de Arduino y
// marcas de error en la línea exacta que devuelve el compilador.

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { Monaco, OnMount } from '@monaco-editor/react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-labdark-bg" />,
})

export interface ErrorCompilacion { line: number; col: number; severity: 'error' | 'warning'; message: string }

const FUNCIONES: [string, string, string][] = [
  ['pinMode', 'pinMode(${1:pin}, ${2|OUTPUT,INPUT,INPUT_PULLUP|});', 'Configura un pin como entrada o salida'],
  ['digitalWrite', 'digitalWrite(${1:pin}, ${2|HIGH,LOW|});', 'Pone un pin en ALTO (5 V) o BAJO (0 V)'],
  ['digitalRead', 'digitalRead(${1:pin})', 'Lee un pin digital: HIGH o LOW'],
  ['analogWrite', 'analogWrite(${1:pin}, ${2:0-255});', 'PWM: 0 = apagado, 255 = máximo (pines 3, 5, 6, 9, 10, 11)'],
  ['analogRead', 'analogRead(${1:A0})', 'Lee un voltaje 0–5 V como número 0–1023'],
  ['delay', 'delay(${1:ms});', 'Espera en milisegundos'],
  ['delayMicroseconds', 'delayMicroseconds(${1:us});', 'Espera en microsegundos'],
  ['millis', 'millis()', 'Milisegundos desde que arrancó la placa'],
  ['micros', 'micros()', 'Microsegundos desde que arrancó la placa'],
  ['pulseIn', 'pulseIn(${1:pin}, ${2|HIGH,LOW|})', 'Mide la duración de un pulso en µs'],
  ['map', 'map(${1:valor}, ${2:deMin}, ${3:deMax}, ${4:aMin}, ${5:aMax})', 'Cambia un número de un rango a otro'],
  ['constrain', 'constrain(${1:valor}, ${2:min}, ${3:max})', 'Limita un valor entre min y max'],
  ['abs', 'abs(${1:x})', 'Valor absoluto'],
  ['tone', 'tone(${1:pin}, ${2:frecuencia});', 'Genera un tono en un buzzer'],
  ['noTone', 'noTone(${1:pin});', 'Apaga el tono'],
  ['Serial.begin', 'Serial.begin(${1:9600});', 'Inicia el Monitor Serial'],
  ['Serial.println', 'Serial.println(${1:"texto"});', 'Imprime y salta de línea'],
  ['Serial.print', 'Serial.print(${1:"texto"});', 'Imprime sin saltar de línea'],
  ['Serial.available', 'Serial.available()', 'Cuántos bytes llegaron por Serial'],
  ['Serial.read', 'Serial.read()', 'Lee un byte recibido'],
  ['Serial.parseInt', 'Serial.parseInt()', 'Lee un número entero recibido'],
  ['servo.attach', 'attach(${1:pin});', 'Conecta el servo a un pin'],
  ['servo.write', 'write(${1:90});', 'Mueve el servo a un ángulo de 0 a 180°'],
  ['ledcAttach', 'ledcAttach(${1:pin}, ${2:5000}, ${3:8});', 'ESP32: prepara un pin para PWM (frecuencia y bits)'],
  ['ledcWrite', 'ledcWrite(${1:pin}, ${2:128});', 'ESP32: ciclo de trabajo del PWM (0–255 con 8 bits)'],
  ['SerialBT.begin', 'SerialBT.begin("${1:MiRobot}");', 'ESP32: activa el Bluetooth con ese nombre'],
  ['SerialBT.available', 'SerialBT.available()', 'ESP32: cuántos datos llegaron por Bluetooth'],
  ['SerialBT.read', 'SerialBT.read()', 'ESP32: lee un dato recibido por Bluetooth'],
]
const CONSTANTES = ['HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'true', 'false']

let autocompletadoRegistrado = false
function registrarArduino(monaco: Monaco) {
  if (autocompletadoRegistrado) return
  autocompletadoRegistrado = true
  monaco.languages.registerCompletionItemProvider('cpp', {
    triggerCharacters: ['.'],
    provideCompletionItems: (
      model: { getWordUntilPosition(p: unknown): { startColumn: number; endColumn: number }; getLineContent(n: number): string },
      position: { lineNumber: number; column: number },
    ) => {
      const palabra = model.getWordUntilPosition(position)
      const linea = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
      const trasSerial = /Serial\.\w*$/.test(linea)
      const range = {
        startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
        startColumn: palabra.startColumn, endColumn: palabra.endColumn,
      }
      const K = monaco.languages.CompletionItemKind
      const funciones = FUNCIONES
        .filter(([n]) => (trasSerial ? n.startsWith('Serial.') : true))
        .map(([nombre, snippet, doc]) => ({
          label: nombre,
          kind: K.Function,
          insertText: trasSerial ? snippet.replace(/^Serial\./, '') : snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: doc,
          range,
        }))
      const constantes = trasSerial ? [] : CONSTANTES.map(c => ({ label: c, kind: K.Constant, insertText: c, range }))
      return { suggestions: [...funciones, ...constantes] }
    },
  })
}

export default function EditorCodigo({
  codigo, onChange, errores, onEjecutar,
}: {
  codigo: string
  onChange: (c: string) => void
  errores: ErrorCompilacion[]
  onEjecutar: () => void
}) {
  const monacoRef = useRef<Monaco | null>(null)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const ejecutarRef = useRef(onEjecutar)
  ejecutarRef.current = onEjecutar

  // Marcar errores del compilador en el editor (subrayado rojo + mensaje).
  useEffect(() => {
    const monaco = monacoRef.current
    const model = editorRef.current?.getModel()
    if (!monaco || !model) return
    monaco.editor.setModelMarkers(model, 'arduino', errores.map(e => ({
      startLineNumber: e.line, endLineNumber: e.line,
      startColumn: Math.max(1, e.col), endColumn: model.getLineMaxColumn(Math.min(e.line, model.getLineCount())),
      message: e.message,
      severity: e.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
    })))
    if (errores[0]) editorRef.current?.revealLineInCenter(errores[0].line)
  }, [errores])

  return (
    <MonacoEditor
      height="100%"
      language="cpp"
      theme="vs-dark"
      value={codigo}
      onChange={v => onChange(v ?? '')}
      beforeMount={registrarArduino}
      onMount={(editor, monaco) => {
        editorRef.current = editor
        monacoRef.current = monaco
        // Ctrl+Enter = compilar y ejecutar
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => ejecutarRef.current())
      }}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 2,
        automaticLayout: true,
        fontLigatures: true,
        padding: { top: 12 },
        renderLineHighlight: 'all',
        smoothScrolling: true,
      }}
    />
  )
}
