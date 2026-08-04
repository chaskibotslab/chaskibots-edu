'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Info, Loader2, AlertTriangle, Volume2 } from 'lucide-react'

type VoiceMode = 'transcribe' | 'keywords'

const KEYWORD_TRANSLATIONS: Record<string, string> = {
  yes: 'sí', no: 'no', up: 'arriba', down: 'abajo', left: 'izquierda', right: 'derecha',
  go: 'adelante', stop: 'alto', on: 'encender', off: 'apagar',
  one: 'uno', two: 'dos', three: 'tres', four: 'cuatro', five: 'cinco',
  zero: 'cero', six: 'seis', seven: 'siete', eight: 'ocho', nine: 'nueve',
  _background_noise_: '(silencio)', _unknown_: '(no reconocido)',
}

export default function VoiceLab() {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('transcribe')

  // ─── TRANSCRIBE (Web Speech API — native, real Spanish support) ───
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const shouldKeepListeningRef = useRef(false)
  const localeAttemptRef = useRef(0)

  const ERROR_MESSAGES: Record<string, string> = {
    'not-allowed': 'Permiso de micrófono denegado. Revisa los permisos del sitio en tu navegador.',
    'no-speech': 'No se detectó voz. Intenta hablar más cerca del micrófono.',
    'audio-capture': 'No se encontró un micrófono disponible.',
    'network': 'Error de red durante el reconocimiento de voz.',
    'language-not-supported': 'Este navegador no soporta el idioma configurado.',
    'aborted': '',
  }

  // Chrome's speech engine doesn't reliably support every regional locale (es-EC
  // specifically is inconsistent) — try a couple of fallbacks before giving up.
  const LOCALES = ['es-419', 'es-ES', 'es-US']

  const startRecognition = (localeIdx: number) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setTranscribeError('Tu navegador no soporta reconocimiento de voz. Prueba con Google Chrome.')
      return
    }
    setTranscribeError(null)
    const recognition = new SpeechRecognition()
    recognition.lang = LOCALES[localeIdx] || 'es-ES'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) finalText += text
        else interimText += text
      }
      if (finalText) setTranscript(prev => prev + finalText + ' ')
      setInterim(interimText)
    }

    recognition.onerror = (event: any) => {
      console.error('[VoiceLab] recognition error', event.error)
      if (event.error === 'language-not-supported' && localeIdx < LOCALES.length - 1) {
        localeAttemptRef.current = localeIdx + 1
        return // onend will fire next and retry with the next locale
      }
      if (event.error !== 'aborted') {
        setTranscribeError(ERROR_MESSAGES[event.error] || `Error de reconocimiento de voz (${event.error}).`)
      }
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        shouldKeepListeningRef.current = false
      }
    }

    // continuous mode still auto-stops after a silence gap in most browsers —
    // restart automatically unless the user explicitly pressed stop.
    recognition.onend = () => {
      if (shouldKeepListeningRef.current) {
        try {
          startRecognition(localeAttemptRef.current)
        } catch {
          setListening(false)
        }
      } else {
        setListening(false)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch (err) {
      console.error('[VoiceLab] start() failed', err)
      setTranscribeError('No se pudo iniciar el micrófono. Intenta de nuevo.')
    }
  }

  const startTranscribe = () => {
    localeAttemptRef.current = 0
    shouldKeepListeningRef.current = true
    startRecognition(0)
  }

  const stopTranscribe = () => {
    shouldKeepListeningRef.current = false
    recognitionRef.current?.stop()
    setListening(false)
    setInterim('')
  }

  // ─── KEYWORD SPOTTING (TF.js speech-commands — English words only) ───
  const [kwLoading, setKwLoading] = useState(false)
  const [kwListening, setKwListening] = useState(false)
  const [kwError, setKwError] = useState<string | null>(null)
  const [detectedWord, setDetectedWord] = useState<{ word: string; score: number } | null>(null)
  const recognizerRef = useRef<any>(null)

  const startKeywordSpotting = async () => {
    setKwError(null)
    if (!recognizerRef.current) {
      setKwLoading(true)
      try {
        const tf = await import('@tensorflow/tfjs')
        await tf.ready()
        const speechCommands = await import('@tensorflow-models/speech-commands')
        const recognizer = speechCommands.create('BROWSER_FFT')
        await recognizer.ensureModelLoaded()
        recognizerRef.current = recognizer
      } catch (err) {
        console.error('[VoiceLab] keyword model load failed', err)
        setKwError('No se pudo cargar el modelo de palabras clave. Revisa tu conexión e intenta de nuevo.')
        setKwLoading(false)
        return
      }
      setKwLoading(false)
    }

    try {
      await recognizerRef.current.listen(
        (result: any) => {
          const scores = result.scores
          const labels = recognizerRef.current.wordLabels()
          let maxIdx = 0
          for (let i = 1; i < scores.length; i++) if (scores[i] > scores[maxIdx]) maxIdx = i
          const word = labels[maxIdx]
          if (word !== '_background_noise_' && scores[maxIdx] > 0.75) {
            setDetectedWord({ word: KEYWORD_TRANSLATIONS[word] || word, score: scores[maxIdx] })
          }
        },
        { includeSpectrogram: false, probabilityThreshold: 0.75, invokeCallbackOnNoiseAndUnknown: false, overlapFactor: 0.5 }
      )
      setKwListening(true)
    } catch (err) {
      console.error('[VoiceLab] listen() failed', err)
      setKwError('No se pudo acceder al micrófono. Revisa los permisos del sitio.')
    }
  }

  const stopKeywordSpotting = () => {
    recognizerRef.current?.stopListening()
    setKwListening(false)
    setDetectedWord(null)
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      recognizerRef.current?.stopListening?.()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-pink-300 text-sm font-bold">IA de voz</h3>
          <p className="text-gray-400 text-xs mt-1">
            Dos formas reales en que una IA entiende el habla: transcribir lo que dices (en español) o reconocer
            palabras clave específicas entrenadas de antemano.
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => { stopKeywordSpotting(); setVoiceMode('transcribe') }}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${voiceMode === 'transcribe' ? 'bg-pink-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
        >
          Transcribir mi voz
        </button>
        <button
          onClick={() => { stopTranscribe(); setVoiceMode('keywords') }}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${voiceMode === 'keywords' ? 'bg-pink-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
        >
          Palabras clave (inglés)
        </button>
      </div>

      {voiceMode === 'transcribe' && (
        <div className="space-y-3">
          {transcribeError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {transcribeError}
            </div>
          )}
          <div className="bg-[#181825] rounded-xl p-5 min-h-[160px]">
            <p className="text-gray-200 text-sm leading-relaxed">
              {transcript || <span className="text-gray-600">Presiona el micrófono y habla en español...</span>}
              <span className="text-gray-500 italic">{interim}</span>
            </p>
          </div>
          <div className="flex justify-center gap-2">
            {!listening ? (
              <button onClick={startTranscribe} className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                <Mic className="w-4 h-4" /> Empezar a hablar
              </button>
            ) : (
              <button onClick={stopTranscribe} className="px-5 py-2.5 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
                <MicOff className="w-4 h-4" /> Escuchando... (click para detener)
              </button>
            )}
            {transcript && (
              <button onClick={() => setTranscript('')} className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs">
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {voiceMode === 'keywords' && (
        <div className="space-y-3">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-300 text-xs">
            Este modelo específico solo reconoce palabras en <strong>inglés</strong>: yes, no, up, down, left, right,
            go, stop, on, off, y números del 0 al 9. Es una limitación real del modelo, no un error.
          </div>
          {kwError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {kwError}
            </div>
          )}
          <div className="bg-[#181825] rounded-xl p-8 min-h-[160px] flex flex-col items-center justify-center gap-3">
            {detectedWord ? (
              <>
                <Volume2 className="w-10 h-10 text-pink-400" />
                <span className="text-white text-3xl font-black">{detectedWord.word}</span>
                <span className="text-gray-500 text-xs">{Math.round(detectedWord.score * 100)}% de confianza</span>
              </>
            ) : (
              <p className="text-gray-600 text-sm text-center">
                {kwListening ? 'Escuchando... di una palabra en inglés' : 'Presiona el botón y di: yes, no, stop, go...'}
              </p>
            )}
          </div>
          <div className="flex justify-center">
            {!kwListening ? (
              <button onClick={startKeywordSpotting} disabled={kwLoading} className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                {kwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                {kwLoading ? 'Cargando modelo...' : 'Empezar a escuchar'}
              </button>
            ) : (
              <button onClick={stopKeywordSpotting} className="px-5 py-2.5 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
                <MicOff className="w-4 h-4" /> Detener
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
