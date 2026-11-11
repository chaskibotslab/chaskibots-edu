'use client'

// Placas chicas y módulos con PCB real: sustrato con canto, serigrafía y
// pistas dibujadas en un canvas (ver Computadoras3D) y los componentes en 3D.
// Arduino Nano, Raspberry Pi Pico, módulo TCRT5000 y el portapilas 18650.

import { forwardRef, useMemo, type Ref } from 'react'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'
import { useCalidad } from '../calidad'
import { Chip, Pasivos, Sustrato, contorno, texto, texturaPlaca } from './Computadoras3D'

const m = (v: number) => v / 1000
type V = [number, number, number]
const M = (...v: V): V => [m(v[0]), m(v[1]), m(v[2])]
const METAL = '#c9ced6'
const ORO = '#d4af37'
const NEGRO = '#111214'

/** Pines del Nano por lado (USB hacia −x), según su serigrafía. */
export const NANO_ATRAS = ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'RST', 'GND', 'VIN']
export const NANO_ADELANTE = ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND', 'RST', 'D0', 'D1']
/** Pines 1–20 (lado −z) y 40–21 (lado +z) de la Pico, según su serigrafía. */
export const PICO_1_20 = ['GP0', 'GP1', 'GND', 'GP2', 'GP3', 'GP4', 'GP5', 'GND', 'GP6', 'GP7', 'GP8', 'GP9', 'GND', 'GP10', 'GP11', 'GP12', 'GP13', 'GND', 'GP14', 'GP15']
export const PICO_40_21 = ['VBUS', 'VSYS', 'GND', '3V3_EN', '3V3', 'ADC_VREF', 'GP28', 'AGND', 'GP27', 'GP26', 'RUN', 'GP22', 'GND', 'GP21', 'GP20', 'GP19', 'GP18', 'GND', 'GP17', 'GP16']

/** Textura (canvas) memorizada una sola vez por módulo; null sin canvas. */
function useTexturaPlaca(hacer: () => THREE.Texture): THREE.Texture | null {
  return useMemo(() => {
    try { return typeof document === 'undefined' ? null : hacer() } catch { return null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Tira de pines macho (paso 2,54) con su base negra, a lo largo de `eje`. */
function FilaPines({ n, pos, eje = 'x', alto = 6 }: { n: number; pos: V; eje?: 'x' | 'z'; alto?: number }) {
  const largo = n * 2.54
  return (
    <group position={M(...pos)}>
      <mesh position={M(0, 1.25, 0)}>
        <boxGeometry args={eje === 'x' ? M(largo, 2.5, 2.5) : M(2.5, 2.5, largo)} />
        <meshStandardMaterial color={NEGRO} roughness={0.65} />
      </mesh>
      <Instances limit={n} frustumCulled={false}>
        <boxGeometry args={M(0.64, alto, 0.64)} />
        <meshStandardMaterial color={ORO} metalness={0.95} roughness={0.22} />
        {Array.from({ length: n }, (_, i) => {
          const o = -largo / 2 + 1.27 + i * 2.54
          return <Instance key={i} position={M(eje === 'x' ? o : 0, alto / 2 - 2, eje === 'z' ? o : 0)} />
        })}
      </Instances>
    </group>
  )
}

function Led({ pos, color, emissive, refMat, intensidad = 0 }: { pos: V; color: string; emissive: string; refMat?: Ref<THREE.MeshStandardMaterial>; intensidad?: number }) {
  return (
    <mesh position={M(...pos)}>
      <boxGeometry args={M(1.6, 0.8, 1)} />
      <meshStandardMaterial ref={refMat} color={color} emissive={emissive} emissiveIntensity={intensidad} />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Arduino Nano (45 × 18 mm, mini USB hacia −x, filas de pines en z = ±7,6)
// ---------------------------------------------------------------------------

const NANO_AGUJEROS: [number, number][] = [[-20.9, -7.1], [-20.9, 7.1], [20.9, -7.1], [20.9, 7.1]]

function texturaNano() {
  return texturaPlaca(45, 18, 1.2, '#1b4a9f', 'rgba(150, 180, 235, 0.25)', NANO_AGUJEROS, [[-19, 17, -8.9, -6.3], [-19, 17, 6.3, 8.9], [-1, 9, -5, 5]], 11, l => {
    texto(l, 'ARDUINO', -5, -1.2, 1.9, 'center', true)
    texto(l, 'NANO', -5, 1.2, 1.9, 'center', true)
    l.g.font = `${0.9 * l.E}px Arial, sans-serif`
    NANO_ATRAS.forEach((p, i) => texto(l, p.replace('RST', 'RST').slice(0, 3), -17.8 + i * 2.54, -5.3, 0.85, 'center'))
    NANO_ADELANTE.forEach((p, i) => texto(l, p.slice(0, 3), -17.8 + i * 2.54, 5.3, 0.85, 'center'))
    contorno(l, 4, 0, 7.4, 7.4)
    contorno(l, -9, -2, 5.2, 3.2)
  })
}

export const ArduinoNano = forwardRef(function ArduinoNano(_: object, refLed13: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  const tex = useTexturaPlaca(texturaNano)
  return (
    <group>
      {tex
        ? <Sustrato largo={45} ancho={18} radio={1.2} color="#163d85" textura={tex} />
        : <mesh position={M(0, 0.8, 0)} castShadow={q.sombras}><boxGeometry args={M(45, 1.6, 18)} /><meshStandardMaterial color="#1d4fb8" roughness={0.45} /></mesh>}
      {/* Mini USB */}
      <mesh position={M(-20.5, 3.6, 0)} castShadow={q.sombras}>
        <boxGeometry args={M(9, 4, 7.6)} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={M(-25.1, 3.6, 0)}>
        <boxGeometry args={M(0.3, 2.2, 5.6)} />
        <meshStandardMaterial color="#202326" roughness={0.6} />
      </mesh>
      {/* ATmega328P (TQFP-32) girado 45°, CH340 y cristal */}
      <group rotation={[0, Math.PI / 4, 0]} position={M(4, 0, 0)}><Chip pos={[0, 0]} l={7} a={7} alto={1} /></group>
      <Chip pos={[-9, -2]} l={5} a={3.2} alto={1.4} />
      <Chip pos={[13, 3]} l={5} a={2} alto={1.4} color="#d4d4d8" metal />
      {/* Regulador y botón de reset */}
      <Chip pos={[-13, 3.5]} l={3.2} a={3.2} alto={1.6} />
      <mesh position={M(-2, 2.6, -4.5)}>
        <boxGeometry args={M(3.5, 2, 3.5)} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      <mesh position={M(-2, 3.9, -4.5)}>
        <cylinderGeometry args={[m(0.9), m(0.9), m(0.8), 10]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.5} />
      </mesh>
      <Pasivos semilla={12} n={26} area={[-18, 18, -5, 5]} prohibido={[[-1, 9, -5, 5], [-12, -6, -4, 0], [10, 16, 1.5, 4.5], [-15, -11, 2, 5], [-4, 0, -6.5, -2.5]]} />
      {/* LED «L» (13), TX/RX y encendido */}
      <Led pos={[-14, 1.9, 4]} color="#78350f" emissive="#fb923c" refMat={refLed13} />
      <Led pos={[-14, 1.9, 6]} color="#14532d" emissive="#22c55e" intensidad={1.5} />
      <Led pos={[-16.5, 1.9, 4]} color="#7f1d1d" emissive="#ef4444" />
      <Led pos={[-16.5, 1.9, 6]} color="#7f1d1d" emissive="#ef4444" />
      <FilaPines n={15} pos={[0, 1.6, -7.6]} />
      <FilaPines n={15} pos={[0, 1.6, 7.6]} />
    </group>
  )
})

// ---------------------------------------------------------------------------
// Raspberry Pi Pico (51 × 21 mm, micro USB hacia −x, pads almenados en z = ±8,89)
// ---------------------------------------------------------------------------

const PICO_AGUJEROS: [number, number][] = [[-23.5, -5.7], [-23.5, 5.7], [23.5, -5.7], [23.5, 5.7]]

function texturaPico() {
  return texturaPlaca(51, 21, 1.5, '#1e6e3c', 'rgba(140, 200, 150, 0.22)', PICO_AGUJEROS, [[-25.5, 25.5, -10.5, -7.3], [-25.5, 25.5, 7.3, 10.5], [-2, 6, -4, 4], [-26, -19, -4.5, 4.5]], 21, l => {
    // Pads almenados dorados en los bordes largos (20 por lado) y sus etiquetas.
    for (let i = 0; i < 20; i++) {
      const x = -24.13 + i * 2.54
      for (const z of [-10.5, 10.5]) {
        l.g.fillStyle = '#d9b867'
        l.g.beginPath(); l.g.arc(l.X(x), l.Z(z), 1.05 * l.E, 0, Math.PI * 2); l.g.fill()
        l.g.fillStyle = '#1a1a1a'
        l.g.beginPath(); l.g.arc(l.X(x), l.Z(z), 0.5 * l.E, 0, Math.PI * 2); l.g.fill()
      }
      l.g.fillStyle = '#f4f4f0'
      texto(l, PICO_1_20[i].replace('GP', ''), x, -6.6, 0.85, 'center')
      texto(l, PICO_40_21[i].replace('GP', '').slice(0, 4), x, 6.6, 0.85, 'center')
    }
    texto(l, 'Raspberry Pi Pico', 8, -3.2, 1.6, 'center', true)
    texto(l, '© 2020', 18, 3.4, 1.1, 'center')
    contorno(l, 2, 0, 7, 7)
  })
}

export const Pico = forwardRef(function Pico(_: object, refLed: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  const tex = useTexturaPlaca(texturaPico)
  return (
    <group>
      {tex
        ? <Sustrato largo={51} ancho={21} radio={1.5} color="#185a31" textura={tex} />
        : <mesh position={M(0, 0.8, 0)} castShadow={q.sombras}><boxGeometry args={M(51, 1.6, 21)} /><meshStandardMaterial color="#1f7a3f" roughness={0.5} /></mesh>}
      {/* Micro USB, RP2040, memoria flash, botón BOOTSEL y regulador */}
      <mesh position={M(-23, 3, 0)} castShadow={q.sombras}>
        <boxGeometry args={M(5.6, 2.8, 8)} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={M(-25.9, 3, 0)}>
        <boxGeometry args={M(0.3, 1.6, 6)} />
        <meshStandardMaterial color="#202326" roughness={0.6} />
      </mesh>
      <Chip pos={[2, 0]} l={7} a={7} alto={0.9} />
      <Chip pos={[13, 0]} l={5} a={6} alto={1.1} color="#1f1f1f" />
      <Chip pos={[-9, -3]} l={3} a={3} alto={1.2} />
      <mesh position={M(-12, 2.8, 3)}>
        <boxGeometry args={M(4, 2.4, 3.2)} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.5} />
      </mesh>
      <Pasivos semilla={22} n={22} area={[-18, 22, -5, 5]} prohibido={[[-2, 6, -4, 4], [10, 16, -3.5, 3.5], [-14.5, -9.5, 1, 5], [-11, -7, -5, -1]]} />
      <Led pos={[-19, 1.9, -5]} color="#14532d" emissive="#4ade80" refMat={refLed} />
    </group>
  )
})

// ---------------------------------------------------------------------------
// Módulo TCRT5000 (placa de 32 × 13 mm a 7 mm sobre el sensor, mirando al piso)
// ---------------------------------------------------------------------------

function texturaTcrt() {
  return texturaPlaca(32, 13, 1, '#1e4bb8', 'rgba(150, 180, 235, 0.25)', [[-14, -5], [-14, 5]], [[-16, -12, -6, 6], [-8, -2, -2.5, 2.5], [-16, -10, -3, 3]], 31, l => {
    texto(l, 'TCRT5000', 6, -4.6, 1.4, 'center', true)
    texto(l, 'VCC GND DO AO', -11.5, 6.0, 0.8, 'center')
    contorno(l, -6, 1, 5.2, 4)
  })
}

export const TCRT5000 = forwardRef(function TCRT5000({ alturaSoporte }: { alturaSoporte: number }, refLed: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  const tex = useTexturaPlaca(texturaTcrt)
  return (
    <group>
      {/* Componente TCRT5000 mirando al piso: carcasa negra con el emisor azulado y el receptor oscuro */}
      <mesh position={M(0, 3.5, 0)} castShadow={q.sombras}>
        <boxGeometry args={M(6, 7, 10)} />
        <meshStandardMaterial color={NEGRO} roughness={0.4} />
      </mesh>
      <mesh position={M(0, 0.4, -2.5)}>
        <cylinderGeometry args={[m(1.8), m(1.8), m(0.8), 12]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={M(0, 0.4, 2.5)}>
        <cylinderGeometry args={[m(1.8), m(1.8), m(0.8), 12]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
      </mesh>
      {/* Placa del módulo (su cara de arriba a 8,6 mm) */}
      <group position={M(-12, 7, 0)}>
        {tex
          ? <Sustrato largo={32} ancho={13} radio={1} color="#163a8f" textura={tex} />
          : <mesh position={M(0, 0.8, 0)}><boxGeometry args={M(32, 1.6, 13)} /><meshStandardMaterial color="#1d4ed8" roughness={0.55} /></mesh>}
        {/* Potenciómetro de ajuste, comparador LM393 y pasivos */}
        <mesh position={M(-2, 3.6, 0)}>
          <boxGeometry args={M(6, 4, 6)} />
          <meshStandardMaterial color="#2563eb" roughness={0.4} />
        </mesh>
        <mesh position={M(-2, 5.7, 0)}>
          <cylinderGeometry args={[m(1.4), m(1.4), m(0.4), 12]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.4} />
        </mesh>
        <Chip pos={[6, 1]} l={4.9} a={3.9} alto={1.4} />
        <Pasivos semilla={32} n={8} area={[2, 14, -5, 5]} prohibido={[[3, 9, -1.5, 3.5]]} />
        <Led pos={[6, 1.9, 4.5]} color="#7f1d1d" emissive="#ef4444" refMat={refLed} />
        <Led pos={[9, 1.9, 4.5]} color="#14532d" emissive="#22c55e" intensidad={1.3} />
        <FilaPines n={4} pos={[-14, 1.6, 0]} eje="z" alto={11} />
      </group>
      {/* Soporte acrílico hasta el chasis */}
      <mesh position={M(-20, 8.6 + alturaSoporte / 2, 0)}>
        <boxGeometry args={M(3, alturaSoporte, 12)} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      {/* Zona del piso que lee el sensor */}
      <mesh position={M(0, -12.5, 0)} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[m(3.5), 20]} />
        <meshBasicMaterial color="#ff2d2d" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
})

// ---------------------------------------------------------------------------
// Portapilas 2 × 18650 con las celdas etiquetadas
// ---------------------------------------------------------------------------

function texturaCelda() {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#1d4ed8'; g.fillRect(0, 0, 512, 128)
  g.fillStyle = '#0f2a6b'; g.fillRect(0, 0, 512, 10); g.fillRect(0, 118, 512, 10)
  g.fillStyle = '#f8fafc'
  g.font = '700 34px Arial, sans-serif'; g.textBaseline = 'middle'
  g.fillText('ICR18650', 30, 46)
  g.font = '22px Arial, sans-serif'
  g.fillText('3.7 V  2600 mAh  Li-ion', 30, 84)
  g.font = '700 26px Arial, sans-serif'
  g.fillText('⚠ No cortocircuitar', 300, 46)
  g.fillStyle = '#facc15'; g.fillRect(300, 70, 180, 6)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function Bateria18650() {
  const q = useCalidad()
  const tex = useTexturaPlaca(texturaCelda)
  return (
    <group>
      <mesh position={M(0, 4, 0)} castShadow={q.sombras}>
        <boxGeometry args={M(77, 8, 41)} />
        <meshStandardMaterial color={NEGRO} roughness={0.7} />
      </mesh>
      {[-9.5, 9.5].map(z => (
        <group key={z} position={M(0, 11, z)}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow={q.sombras}>
            <cylinderGeometry args={[m(9), m(9), m(65), q.segmentos]} />
            {tex
              ? <meshPhysicalMaterial map={tex} roughness={0.3} clearcoat={0.8} />
              : <meshPhysicalMaterial color="#2563eb" roughness={0.3} clearcoat={0.8} />}
          </mesh>
          {/* Borne positivo y tapa negativa */}
          <mesh position={M(33, 0, 0)} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[m(4), m(4), m(1.5), 16]} />
            <meshStandardMaterial color={METAL} metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={M(-32.8, 0, 0)} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[m(8.6), m(8.6), m(0.6), 24]} />
            <meshStandardMaterial color={METAL} metalness={0.95} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* Contactos de resorte y de lámina en los extremos del porta */}
      {[-36, 36].map(x => (
        <group key={x}>
          <mesh position={M(x, 11, 0)}>
            <boxGeometry args={M(5, 14, 41)} />
            <meshStandardMaterial color={NEGRO} roughness={0.7} />
          </mesh>
          {[-9.5, 9.5].map(z => (
            <mesh key={z} position={M(x + (x < 0 ? 3 : -3), 11, z)} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[m(3.5), m(3.5), m(1.2), 12]} />
              <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
