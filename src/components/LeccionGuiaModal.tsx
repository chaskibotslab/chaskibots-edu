'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import ProyectoGuia from './ProyectoGuia'
import type { KitGuia } from '@/lib/kitGuia'

// Lección normal (por nivel y programa) que tiene guía por etapas: usa el
// mismo visor que los cursos con kit.
export default function LeccionGuiaModal({ lesson, onClose, onNext, onPrev }: {
  lesson: { id: string; title: string; moduleName?: string; duration?: string; guia: KitGuia }
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 p-5 flex items-center gap-3 z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">{lesson.title}</h3>
            <p className="text-sm text-slate-500 truncate">
              {[lesson.moduleName, lesson.guia.reto.duracion || lesson.duration].filter(Boolean).join(' · ')}
            </p>
          </div>
          {onPrev && (
            <button onClick={onPrev} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500" title="Lección anterior"><ChevronLeft className="w-5 h-5" /></button>
          )}
          {onNext && (
            <button onClick={onNext} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500" title="Lección siguiente"><ChevronRight className="w-5 h-5" /></button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900" title="Cerrar"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <ProyectoGuia key={lesson.id} proyectoId={lesson.id} slug="leccion" guia={lesson.guia} conexiones={[]} />
        </div>
      </div>
    </div>
  )
}
