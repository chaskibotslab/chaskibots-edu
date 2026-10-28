'use client'

// Editor de bloques (Blockly) con el tema oscuro del laboratorio. Guarda el
// programa como JSON en el robot; el código C++ lo genera bloques/generador.ts.

import { useEffect, useRef } from 'react'
import type { WorkspaceSvg } from 'blockly/core'
import { cajaDeBloques, DEFINICIONES } from './definiciones'
import type { PartesRobot, ProgramaBloques } from './generador'

interface Props {
  programa: ProgramaBloques
  partes: PartesRobot
  onCambio: (p: ProgramaBloques) => void
}

let preparado: Promise<typeof import('blockly/core')> | null = null

/** Carga Blockly una sola vez: bloques estándar, idioma español, bloques propios y tema. */
function cargarBlockly() {
  if (!preparado) {
    preparado = (async () => {
      const Blockly = await import('blockly/core')
      await import('blockly/blocks')
      const es = await import('blockly/msg/es')
      Blockly.setLocale(es as unknown as Record<string, string>)
      if (!Blockly.Blocks.cb_iniciar) Blockly.common.defineBlocksWithJsonArray(DEFINICIONES)
      return Blockly
    })()
  }
  return preparado
}

export default function EditorBloques({ programa, partes, onCambio }: Props) {
  const div = useRef<HTMLDivElement>(null)
  const ws = useRef<WorkspaceSvg | null>(null)
  const onCambioRef = useRef(onCambio)
  onCambioRef.current = onCambio
  const clavePartes = JSON.stringify(partes)

  useEffect(() => {
    let vivo = true
    let observador: ResizeObserver | null = null
    cargarBlockly().then(Blockly => {
      if (!vivo || !div.current) return
      const tema = Blockly.Theme.defineTheme('chaskibots', {
        name: 'chaskibots',
        base: Blockly.Themes.Classic,
        componentStyles: {
          workspaceBackgroundColour: '#121624',
          toolboxBackgroundColour: '#1a1f30',
          toolboxForegroundColour: '#e2e8f0',
          flyoutBackgroundColour: '#1f2538',
          flyoutForegroundColour: '#e2e8f0',
          flyoutOpacity: 0.97,
          scrollbarColour: '#475569',
          insertionMarkerColour: '#ffffff',
          insertionMarkerOpacity: 0.3,
          cursorColour: '#E57361',
        },
        fontStyle: { family: 'Inter, system-ui, sans-serif', size: 12 },
      })
      const w = Blockly.inject(div.current, {
        toolbox: cajaDeBloques(partes) as never,
        renderer: 'zelos',
        theme: tema,
        trashcan: true,
        grid: { spacing: 24, length: 2, colour: '#232a3d', snap: true },
        zoom: { controls: true, wheel: true, startScale: 0.85, maxScale: 2, minScale: 0.4 },
        move: { scrollbars: true, drag: true, wheel: false },
      })
      ws.current = w
      try { Blockly.serialization.workspaces.load(programa as object, w) } catch { /* programa dañado: se empieza vacío */ }
      w.addChangeListener(e => {
        if (e.isUiEvent || w.isDragging()) return
        onCambioRef.current(Blockly.serialization.workspaces.save(w) as ProgramaBloques)
      })
      observador = new ResizeObserver(() => Blockly.svgResize(w))
      observador.observe(div.current)
    })
    return () => {
      vivo = false
      observador?.disconnect()
      ws.current?.dispose()
      ws.current = null
    }
    // El programa se carga una sola vez al montar; después lo maneja Blockly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Si cambian las piezas del robot, cambia la caja de bloques.
  useEffect(() => {
    ws.current?.updateToolbox(cajaDeBloques(partes) as never)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clavePartes])

  return <div ref={div} className="h-full w-full" />
}
