'use client'

// Raspberry Pi 4 y Jetson Nano con las medidas de sus planos mecánicos: la
// serigrafía, las pistas y los agujeros van en una textura dibujada en un
// canvas (barato de dibujar) y encima van los componentes en 3D: el cabezal de
// 40 pines con cada pin en su lugar (los cables se enchufan en el pin que
// corresponde), los puertos con sus aberturas, los chips y los pasivos.

import { forwardRef, useMemo, type ReactNode, type Ref } from 'react'
import { Instance, Instances, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useCalidad } from '../calidad'

const m = (v: number) => v / 1000
type V = [number, number, number]
const M = (...v: V): V => [m(v[0]), m(v[1]), m(v[2])]

const METAL = '#cfd4da'
const NEGRO = '#121315'
const ORO = '#d6b25e'

// ---------------------------------------------------------------------------
// Ayudas
// ---------------------------------------------------------------------------

/** Generador pseudoaleatorio con semilla (mulberry32): la placa sale igual siempre. */
function azar(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rect = [number, number, number, number] // x0, x1, z0, z1 (mm, marco de la placa)
const dentro = (x: number, z: number, [x0, x1, z0, z1]: Rect, margen = 0) => x > x0 - margen && x < x1 + margen && z > z0 - margen && z < z1 + margen

type Lapiz = { g: CanvasRenderingContext2D; X: (x: number) => number; Z: (z: number) => number; E: number }

/**
 * Cara de arriba de una placa (`largo` en x, `ancho` en z, mm) dibujada en un
 * canvas: máscara verde con esquinas redondeadas, pistas, vías, agujeros de
 * montaje dorados y lo que dibuje `extra` (serigrafía). Fuera del contorno es
 * transparente para que respete las esquinas redondeadas.
 */
function texturaPlaca(largo: number, ancho: number, radio: number, mascara: string, pista: string, agujeros: [number, number][], prohibido: Rect[], semilla: number, extra: (l: Lapiz) => void) {
  const E = 8
  const c = document.createElement('canvas')
  c.width = largo * E; c.height = ancho * E
  const g = c.getContext('2d')!
  const X = (x: number) => (x + largo / 2) * E
  const Z = (z: number) => (z + ancho / 2) * E
  g.beginPath()
  g.roundRect(0, 0, c.width, c.height, radio * E)
  g.fillStyle = mascara
  g.fill()
  g.save()
  g.clip()
  // Pistas en ángulos de 45°, como las de un ruteo real, y sus vías.
  const r = azar(semilla)
  g.strokeStyle = pista
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (let k = 0; k < 70; k++) {
    let x = (r() - 0.5) * largo, z = (r() - 0.5) * ancho
    if (prohibido.some(p => dentro(x, z, p))) continue
    g.lineWidth = (r() < 0.2 ? 0.6 : 0.22) * E
    g.beginPath()
    g.moveTo(X(x), Z(z))
    for (let s = 0; s < 3; s++) {
      const dir = Math.floor(r() * 8) * (Math.PI / 4)
      const l = 3 + r() * 12
      x += Math.cos(dir) * l; z += Math.sin(dir) * l
      g.lineTo(X(x), Z(z))
    }
    g.stroke()
    g.fillStyle = '#c9a45a'
    g.beginPath(); g.arc(X(x), Z(z), 0.35 * E, 0, Math.PI * 2); g.fill()
  }
  // Agujeros de montaje: anillo dorado y el agujero.
  for (const [x, z] of agujeros) {
    g.fillStyle = '#d9b867'
    g.beginPath(); g.arc(X(x), Z(z), 3 * E, 0, Math.PI * 2); g.fill()
    g.fillStyle = '#1a1a1a'
    g.beginPath(); g.arc(X(x), Z(z), 1.375 * E, 0, Math.PI * 2); g.fill()
  }
  g.fillStyle = '#f4f4f0'
  g.strokeStyle = '#f4f4f0'
  extra({ g, X, Z, E })
  g.restore()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Texto de la serigrafía (alto en mm). */
function texto(l: Lapiz, s: string, x: number, z: number, alto: number, alinear: CanvasTextAlign = 'left', negrita = false) {
  l.g.font = `${negrita ? '700 ' : ''}${alto * l.E}px "Helvetica Neue", Arial, sans-serif`
  l.g.textAlign = alinear
  l.g.textBaseline = 'middle'
  l.g.fillText(s, l.X(x), l.Z(z))
}

/** Contorno de un componente en la serigrafía. */
function contorno(l: Lapiz, x: number, z: number, ax: number, az: number) {
  l.g.lineWidth = 0.18 * l.E
  l.g.strokeRect(l.X(x - ax / 2), l.Z(z - az / 2), ax * l.E, az * l.E)
}

/** Placa: el sustrato (con su canto) y la textura de la cara de arriba. */
function Sustrato({ largo, ancho, radio, color, textura }: { largo: number; ancho: number; radio: number; color: string; textura: THREE.Texture }) {
  const q = useCalidad()
  // Contorno con esquinas redondeadas, extruido 1,6 mm hacia arriba.
  const forma = useMemo(() => {
    const s = new THREE.Shape()
    const [l, a, r] = [m(largo) / 2, m(ancho) / 2, m(radio)]
    s.moveTo(-l + r, -a)
    s.lineTo(l - r, -a); s.quadraticCurveTo(l, -a, l, -a + r)
    s.lineTo(l, a - r); s.quadraticCurveTo(l, a, l - r, a)
    s.lineTo(-l + r, a); s.quadraticCurveTo(-l, a, -l, a - r)
    s.lineTo(-l, -a + r); s.quadraticCurveTo(-l, -a, -l + r, -a)
    const g = new THREE.ExtrudeGeometry(s, { depth: m(1.6), bevelEnabled: false, curveSegments: 6 })
    g.rotateX(-Math.PI / 2)
    return g
  }, [largo, ancho, radio])
  return (
    <group>
      <mesh geometry={forma} castShadow={q.sombras} receiveShadow>
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={M(0, 1.61, 0)} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[m(largo), m(ancho)]} />
        <meshStandardMaterial map={textura} roughness={0.42} metalness={0.05} alphaTest={0.5} transparent />
      </mesh>
    </group>
  )
}

/**
 * Cabezal macho de 2 × n pines (paso 2,54 mm) a lo largo de `eje`. Los pines
 * salen de `pinesCabezal`, la misma función que usan los anclajes de los cables.
 */
function Cabezal({ centro, n, eje, conPines }: { centro: V; n: number; eje: 'x' | 'z'; conPines: boolean }) {
  const q = useCalidad()
  const largo = n * 2.54
  const pos = pinesCabezal(centro, n, eje, 1)
  return (
    <group>
      <mesh position={M(centro[0], centro[1] + 1.25, centro[2])} castShadow={q.sombras}>
        <boxGeometry args={eje === 'x' ? M(largo, 2.5, 5.08) : M(5.08, 2.5, largo)} />
        <meshStandardMaterial color={NEGRO} roughness={0.7} />
      </mesh>
      {conPines && (
        <Instances limit={pos.length} frustumCulled={false}>
          <boxGeometry args={M(0.64, 8.5, 0.64)} />
          <meshStandardMaterial color={ORO} metalness={0.95} roughness={0.22} />
          {pos.map((p, i) => <Instance key={i} position={M(p[0], centro[1] + 3.25, p[2])} />)}
        </Instances>
      )}
    </group>
  )
}

/**
 * Centro (arriba) de cada pin de un cabezal de 2 × n, en el orden de su número:
 * el pin 1 está en el extremo `inicio` de la fila de adentro (impares) y los
 * pares en la fila del borde, como en la Raspberry Pi y la Jetson.
 */
function pinesCabezal(centro: V, n: number, eje: 'x' | 'z', inicio: 1 | -1, adentro: 1 | -1 = 1): V[] {
  const out: V[] = []
  for (let k = 0; k < n; k++) {
    const a = inicio * (-(n - 1) / 2 + k) * 2.54
    for (const fila of [1, -1]) {
      const b = adentro * fila * 1.27
      out.push(eje === 'x' ? [centro[0] + a, centro[1] + 7.5, centro[2] + b] : [centro[0] + b, centro[1] + 7.5, centro[2] + a])
    }
  }
  return out
}

/** Doble puerto USB-A apilado; la boca mira hacia `frente` (±x). */
function UsbDoble({ pos, frente, lengueta }: { pos: V; frente: 1 | -1; lengueta: string }) {
  const q = useCalidad()
  const [x, y, z] = pos
  return (
    <group position={M(x, y, z)}>
      <mesh castShadow={q.sombras}><boxGeometry args={M(17.5, 16, 13.2)} /><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.28} /></mesh>
      {[-3.6, 3.6].map(dy => (
        <group key={dy} position={M(frente * 8.8, dy, 0)}>
          <mesh><boxGeometry args={M(0.3, 5.6, 12)} /><meshStandardMaterial color="#202326" roughness={0.6} /></mesh>
          <mesh position={M(frente * 0.1, -0.9, 0)}><boxGeometry args={M(0.3, 1.8, 10.2)} /><meshStandardMaterial color={lengueta} roughness={0.45} /></mesh>
        </group>
      ))}
      {/* Pestañas de la carcasa en la boca */}
      <mesh position={M(frente * 8.9, 8.2, 0)}><boxGeometry args={M(0.5, 0.6, 13.6)} /><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.28} /></mesh>
    </group>
  )
}

/** Conector de red RJ45 blindado con sus dos LED; la boca mira hacia `frente` (±x). */
function Rj45({ pos, frente, largo = 21 }: { pos: V; frente: 1 | -1; largo?: number }) {
  const q = useCalidad()
  const [x, y, z] = pos
  return (
    <group position={M(x, y, z)}>
      <mesh castShadow={q.sombras}><boxGeometry args={M(largo, 13.5, 16)} /><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.3} /></mesh>
      <group position={M(frente * (largo / 2 + 0.05), 0, 0)}>
        <mesh position={M(0, -0.8, 0)}><boxGeometry args={M(0.3, 8.5, 11.8)} /><meshStandardMaterial color="#17191b" roughness={0.7} /></mesh>
        <mesh position={M(0, 4, 0)}><boxGeometry args={M(0.3, 2, 6)} /><meshStandardMaterial color="#17191b" roughness={0.7} /></mesh>
        <mesh position={M(0, 5.1, -5.6)}><boxGeometry args={M(0.4, 1.6, 2.4)} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.1} /></mesh>
        <mesh position={M(0, 5.1, 5.6)}><boxGeometry args={M(0.4, 1.6, 2.4)} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.9} /></mesh>
      </group>
    </group>
  )
}

/** Conector FPC del cable plano de la cámara (cuerpo blanco y traba oscura), largo en `eje`. */
function ConectorFpc({ pos, eje, largo = 22 }: { pos: V; eje: 'x' | 'z'; largo?: number }) {
  const [x, y, z] = pos
  const dims = (a: number, b: number, c: number): V => (eje === 'x' ? M(a, b, c) : M(c, b, a))
  return (
    <group position={M(x, y, z)}>
      <mesh position={M(0, 2.2, 0)}><boxGeometry args={dims(largo, 4.4, 3.6)} /><meshStandardMaterial color="#efece4" roughness={0.6} /></mesh>
      <mesh position={M(0, 4.8, 0)}><boxGeometry args={dims(largo - 1, 0.9, 2.6)} /><meshStandardMaterial color="#3b2f2a" roughness={0.5} /></mesh>
    </group>
  )
}

/** Chip negro (con o sin marca de pin 1). */
function Chip({ pos, l, a, alto = 1, color = '#16171a', metal = false }: { pos: [number, number]; l: number; a: number; alto?: number; color?: string; metal?: boolean }) {
  const q = useCalidad()
  return (
    <mesh position={M(pos[0], 1.6 + alto / 2, pos[1])} castShadow={q.sombras}>
      <boxGeometry args={M(l, alto, a)} />
      <meshStandardMaterial color={color} metalness={metal ? 0.9 : 0.1} roughness={metal ? 0.3 : 0.55} />
    </mesh>
  )
}

/** Resistencias y capacitores SMD repartidos donde no hay otro componente. */
function Pasivos({ semilla, n, area, prohibido }: { semilla: number; n: number; area: Rect; prohibido: Rect[] }) {
  const q = useCalidad()
  const lista = useMemo(() => {
    const r = azar(semilla)
    const out: { p: V; giro: number; tipo: number }[] = []
    for (let k = 0; out.length < n && k < n * 20; k++) {
      const x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2])
      if (prohibido.some(p => dentro(x, z, p, 1))) continue
      out.push({ p: [x, 1.8, z], giro: r() < 0.5 ? 0 : Math.PI / 2, tipo: r() < 0.6 ? 0 : 1 })
    }
    return out
  }, [semilla, n, area, prohibido])
  if (!q.sombras) return null
  return (
    <>
      {[['#a88654', 0], ['#1a1a1a', 1]].map(([color, tipo]) => (
        <Instances key={tipo} limit={n} frustumCulled={false}>
          <boxGeometry args={M(1.6, 0.5, 0.8)} />
          <meshStandardMaterial color={color as string} roughness={0.5} />
          {lista.filter(e => e.tipo === tipo).map((e, i) => <Instance key={i} position={M(...e.p)} rotation={[0, e.giro, 0]} />)}
        </Instances>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Raspberry Pi 4 Model B
// ---------------------------------------------------------------------------
// Marco de la placa: centro de la placa, x a lo largo de los 85 mm (los
// puertos USB y de red hacia +x), z a lo largo de los 56 mm (el cabezal en el
// borde −z, USB-C y micro HDMI en el borde +z). La placa está corrida 4 mm en
// +x respecto del ancla de la pieza.

const RPI_X = 4
const RPI_CABEZAL: V = [-10, 1.6, -24.5]
/** BCM de cada pin físico del cabezal J8 (1–40). */
const RPI_J8 = [
  '3V3', '5V', 'GPIO2', '5V', 'GPIO3', 'GND', 'GPIO4', 'GPIO14', 'GND', 'GPIO15',
  'GPIO17', 'GPIO18', 'GPIO27', 'GND', 'GPIO22', 'GPIO23', '3V3', 'GPIO24', 'GPIO10', 'GND',
  'GPIO9', 'GPIO25', 'GPIO11', 'GPIO8', 'GND', 'GPIO7', 'ID_SD', 'ID_SC', 'GPIO5', 'GND',
  'GPIO6', 'GPIO12', 'GPIO13', 'GND', 'GPIO19', 'GPIO16', 'GPIO26', 'GPIO20', 'GND', 'GPIO21',
]
const RPI_AGUJEROS: [number, number][] = [[-39, -24.5], [19, -24.5], [-39, 24.5], [19, 24.5]]
const RPI_SOC: [number, number] = [-13.5, -4]
const RPI_PROHIBIDO: Rect[] = [
  [-36, 16, -28, -21], [-22, -5, -12.5, 4.5], [-4, 11, -9.5, 1.5], [26, 46, -27, 26], [-38, -25, -21, -9],
  [-42, -37, -11, 11], [-9, 14, 14, 19], [-36, -25, 20, 28], [-21, 2, 22, 28], [6, 16, 15, 28], [-34, -27, 11, 19], [10, 19, 11, 20], [16, 23, -6, 2],
  ...RPI_AGUJEROS.map(([x, z]): Rect => [x - 3.4, x + 3.4, z - 3.4, z + 3.4]),
]

function texturaRpi() {
  return texturaPlaca(85, 56, 3, '#1f7040', 'rgba(120, 190, 120, 0.22)', RPI_AGUJEROS, RPI_PROHIBIDO, 4, l => {
    texto(l, 'Raspberry Pi 4 Model B', -37, 8.5, 2.6, 'left', true)
    texto(l, '© Raspberry Pi 2018', -37, 11.4, 1.5)
    // Frambuesa del logo: granos y dos hojas.
    const { g, X, Z, E } = l
    for (const [dx, dz] of [[0, 0], [-1.3, -0.9], [1.3, -0.9], [0, -1.8], [-1.3, 0.9], [1.3, 0.9], [0, 1.8]]) {
      g.beginPath(); g.arc(X(-31 + dx), Z(-2 + dz), 0.75 * E, 0, Math.PI * 2); g.lineWidth = 0.2 * E; g.stroke()
    }
    g.beginPath(); g.ellipse(X(-32.4), Z(-5), 1.6 * E, 0.7 * E, -0.5, 0, Math.PI * 2); g.stroke()
    g.beginPath(); g.ellipse(X(-29.6), Z(-5), 1.6 * E, 0.7 * E, 0.5, 0, Math.PI * 2); g.stroke()
    texto(l, 'J8', -36.5, -21, 1.6, 'left', true)
    texto(l, '1', RPI_CABEZAL[0] - 24.1, -21.4, 1.2, 'center')
    texto(l, 'GPIO', RPI_CABEZAL[0] + 27.5, -21.2, 1.3)
    contorno(l, RPI_CABEZAL[0], RPI_CABEZAL[2], 51.6, 5.6)
    texto(l, 'POWER', -31.3, 21, 1.3, 'center')
    texto(l, 'HDMI0', -16.5, 21, 1.3, 'center')
    texto(l, 'HDMI1', -3, 21, 1.3, 'center')
    texto(l, 'AUDIO', 11, 13.5, 1.3, 'center')
    texto(l, 'CAMERA', 2.5, 13.2, 1.3, 'center')
    texto(l, 'DISPLAY', -36.3, 0, 1.2, 'left')
    texto(l, 'PoE', 24, -17.6, 1.3, 'center')
    texto(l, 'PWR  ACT', -40.5, 16.2, 1.1, 'left')
    contorno(l, RPI_SOC[0], RPI_SOC[1], 18, 18)
  })
}

/**
 * Raspberry Pi 4 Model B: placa de 85 × 56 mm con el SoC BCM2711 bajo su tapa
 * metálica, la LPDDR4, el controlador USB 3, el módulo WiFi blindado, el
 * cabezal J8 de 40 pines, dos USB 3.0 (azules), dos USB 2.0, el Gigabit
 * Ethernet, USB-C, dos micro HDMI, audio, los conectores de cámara y pantalla,
 * la ranura microSD por debajo y los LED de encendido y actividad (GPIO47).
 */
export const RaspberryPi4 = forwardRef(function RaspberryPi4(_: object, refLed: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  const textura = useMemo(() => texturaRpi(), [])
  return (
    <group position={M(RPI_X, 0, 0)}>
      <Sustrato largo={85} ancho={56} radio={3} color="#195c34" textura={textura} />
      <Cabezal centro={RPI_CABEZAL} n={20} eje="x" conPines={q.sombras} />
      {/* Cabezal PoE (2 × 2) */}
      <Cabezal centro={[24, 1.6, -21.5]} n={2} eje="x" conPines={q.sombras} />
      {/* SoC: sustrato y tapa metálica; LPDDR4; VL805 (USB 3); PHY de red; PMIC */}
      <Chip pos={RPI_SOC} l={17} a={17} alto={1} color="#2b3a2f" />
      <Chip pos={RPI_SOC} l={14} a={14} alto={2.4} color="#d5d9de" metal />
      <Chip pos={[3.5, -4]} l={15} a={11} alto={1.1} />
      <Chip pos={[19.5, -2]} l={7} a={7} alto={0.9} />
      <Chip pos={[4, 16.5]} l={9} a={9} alto={0.9} />
      <Chip pos={[-30.5, 15]} l={6} a={6} alto={0.9} />
      {/* Bobinas de los reguladores y el cristal */}
      {[[-23, 13.5], [-23, 18.5]].map(([x, z]) => <Chip key={x * z} pos={[x, z]} l={4} a={4} alto={1.8} color="#4b4f55" />)}
      <Chip pos={[-3, 6.5]} l={3.2} a={2.5} alto={0.9} color={METAL} metal />
      {/* Módulo WiFi/Bluetooth con su blindaje */}
      <Chip pos={[-31.5, -15]} l={12} a={10} alto={1.6} color="#bfc4ca" metal />
      {/* Puertos del extremo: USB 3.0 (azul), USB 2.0 (negro) y Gigabit Ethernet */}
      <UsbDoble pos={[36.2, 9.6, -19]} frente={1} lengueta="#1d4ed8" />
      <UsbDoble pos={[36.2, 9.6, -1]} frente={1} lengueta="#18191b" />
      <Rj45 pos={[34.5, 8.4, 17.75]} frente={1} />
      {/* Borde de abajo: USB-C, dos micro HDMI y el audio */}
      <RoundedBox args={M(9, 3.2, 7.5)} position={M(-31.3, 3.2, 25)} radius={m(1.2)} smoothness={2}><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.28} /></RoundedBox>
      {[-16.5, -3].map(x => (
        <group key={x}>
          <mesh position={M(x, 3.4, 25)} castShadow={q.sombras}><boxGeometry args={M(7.5, 3.6, 6.5)} /><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.28} /></mesh>
          <mesh position={M(x, 3.4, 28.3)}><boxGeometry args={M(5.6, 1.6, 0.2)} /><meshStandardMaterial color="#202326" /></mesh>
        </group>
      ))}
      <mesh position={M(11, 4.6, 21.5)} castShadow={q.sombras}><boxGeometry args={M(7, 6, 13)} /><meshStandardMaterial color={NEGRO} roughness={0.6} /></mesh>
      <mesh position={M(11, 4.6, 28.5)} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[m(3), m(3), m(2), q.segmentos]} /><meshStandardMaterial color={NEGRO} roughness={0.6} /></mesh>
      <mesh position={M(11, 4.6, 29.55)} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[m(1.75), m(1.75), m(0.2), q.segmentos]} /><meshStandardMaterial color="#000" /></mesh>
      {/* Conectores de cámara (CSI) y de pantalla (DSI) */}
      <ConectorFpc pos={[2.5, 1.6, 16.5]} eje="x" />
      <ConectorFpc pos={[-39.5, 1.6, 0]} eje="z" />
      {/* Ranura microSD por debajo, en el borde −x */}
      <mesh position={M(-36.5, -0.8, 0)}><boxGeometry args={M(12, 1.5, 11.5)} /><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.3} /></mesh>
      {/* LED rojo de encendido y verde de actividad (GPIO47) */}
      <mesh position={M(-40.5, 2, 18.5)}><boxGeometry args={M(1.6, 0.6, 0.8)} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.6} /></mesh>
      <mesh position={M(-40.5, 2, 20.5)}><boxGeometry args={M(1.6, 0.6, 0.8)} /><meshStandardMaterial ref={refLed} color="#16a34a" emissive="#22c55e" emissiveIntensity={0} /></mesh>
      <Pasivos semilla={7} n={70} area={[-41, 28, -26, 26]} prohibido={RPI_PROHIBIDO} />
    </group>
  )
})

function anclaRpi(pin: string): V | null {
  const fisicos = pinesCabezal(RPI_CABEZAL, 20, 'x', 1)
  if (pin === 'CSI') return [2.5 + RPI_X, 6.5, 16.5]
  if (pin === 'ETH') return [45.1 + RPI_X, 7.6, 17.75]
  const i = RPI_J8.indexOf(pin)
  if (i < 0) return null
  const p = fisicos[i]
  return [p[0] + RPI_X, p[1] - 5, p[2]]
}

// ---------------------------------------------------------------------------
// Jetson Nano Developer Kit (B01)
// ---------------------------------------------------------------------------
// Marco: centro de la placa base, de 80 mm en x por 100 mm en z (va de
// costado). Los puertos miran hacia −x (atrás del robot), el cabezal J41
// corre por el borde +x y las dos cámaras (CAM0, CAM1) están en el borde +z.
// La placa está corrida 3 mm en +x respecto del ancla y apoyada en patas de 3 mm.

const JET_X = 3
const JET_Y = 3 // altura de la cara de abajo de la placa base
const JET_CABEZAL: V = [36.5, JET_Y + 1.6, -16]
const JET_AGUJEROS: [number, number][] = [[-36, -46.5], [-36, 46.5], [36, -46.5], [36, 46.5]]
const JET_MODULO: [number, number] = [4, 2]
const JET_PROHIBIDO: Rect[] = [
  [-43, -23, -50, 48], [-19.5, 27.5, -33, 37], [33.5, 39.5, -43, 11], [-24, 16, 42, 50], [22, 36, 40, 49],
  ...JET_AGUJEROS.map(([x, z]): Rect => [x - 3.4, x + 3.4, z - 3.4, z + 3.4]),
]

function texturaJetson() {
  return texturaPlaca(80, 100, 2.5, '#17583a', 'rgba(130, 200, 140, 0.2)', JET_AGUJEROS, JET_PROHIBIDO, 11, l => {
    const { g, X, Z, E } = l
    contorno(l, JET_CABEZAL[0], JET_CABEZAL[2], 5.6, 51.6)
    texto(l, 'J41', 36.5, 12.5, 1.6, 'center', true)
    texto(l, '1', 33, JET_CABEZAL[2] + 24.1, 1.2, 'center')
    texto(l, '40', 39.2, JET_CABEZAL[2] - 26.3, 1.2, 'center')
    texto(l, 'CAM0', 5, 41, 1.4, 'center', true)
    texto(l, 'CAM1', -14, 41, 1.4, 'center', true)
    texto(l, 'J15 FAN', 29, 39, 1.2, 'center')
    texto(l, 'J48', -28, 46.5, 1.2, 'center')
    texto(l, 'DC IN', -21, 43.5, 1.2, 'center')
    texto(l, 'POWER', -21, 34, 1.2, 'center')
    texto(l, 'HDMI', -21, 22.5, 1.2, 'center')
    texto(l, 'DP', -21, 6, 1.2, 'center')
    texto(l, 'USB 3.0', -21, -17, 1.2, 'center')
    texto(l, 'LAN', -21, -41.5, 1.2, 'center')
    // Marca y nombre del kit en la franja de abajo.
    g.save()
    g.fillStyle = '#76b900'
    g.beginPath(); g.ellipse(X(14), Z(-41), 2.4 * E, 1.5 * E, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = '#17583a'
    g.beginPath(); g.ellipse(X(14.6), Z(-41), 1 * E, 0.8 * E, 0, 0, Math.PI * 2); g.fill()
    g.restore()
    texto(l, 'NVIDIA', 17.5, -41, 2.2, 'left', true)
    texto(l, 'JETSON NANO DEVELOPER KIT', 4, -37.2, 1.5, 'left')
    texto(l, '945-13450-0000-100  B01', 4, -45, 1.1, 'left')
  })
}

/** Módulo P3448 con su disipador de aletas (como el del kit, sin ventilador). */
function ModuloJetson() {
  const q = useCalidad()
  const [x, z] = JET_MODULO
  const base = JET_Y + 1.6
  const aletas = q.sombras ? 15 : 8
  return (
    <group position={M(x, 0, z)}>
      {/* Conector SODIMM de 260 contactos y el módulo encima */}
      <mesh position={M(-21, base + 2.4, 0)}><boxGeometry args={M(5, 4.8, 70)} /><meshStandardMaterial color={NEGRO} roughness={0.7} /></mesh>
      <mesh position={M(0, base + 5.3, 0)} castShadow={q.sombras}><boxGeometry args={M(45, 1, 69.6)} /><meshStandardMaterial color="#1c2a22" roughness={0.55} /></mesh>
      {/* Disipador de aluminio anodizado negro: base y aletas a lo largo de x.
          frustumCulled: three calcula la esfera del InstancedMesh en el primer
          cuadro, cuando aún hay 0 instancias, y si no se desactiva lo descarta. */}
      <mesh position={M(0, base + 8, 0)} castShadow={q.sombras}><boxGeometry args={M(40, 4.4, 60)} /><meshStandardMaterial color="#26282c" metalness={0.6} roughness={0.45} /></mesh>
      <Instances limit={aletas} castShadow={q.sombras} frustumCulled={false}>
        <boxGeometry args={M(40, 15, q.sombras ? 1.2 : 2.6)} />
        <meshStandardMaterial color="#2c2e33" metalness={0.6} roughness={0.45} />
        {Array.from({ length: aletas }, (_, i) => <Instance key={i} position={M(0, base + 17, -28.8 + i * (57.6 / (aletas - 1)))} />)}
      </Instances>
      {/* Torres para los tornillos del ventilador (patrón de 32 mm) */}
      {[[-16, -16], [-16, 16], [16, -16], [16, 16]].map(([dx, dz]) => (
        <mesh key={`${dx}${dz}`} position={M(dx, base + 17, dz)}><cylinderGeometry args={[m(2.2), m(2.2), m(15), 10]} /><meshStandardMaterial color="#26282c" metalness={0.6} roughness={0.45} /></mesh>
      ))}
    </group>
  )
}

/**
 * Jetson Nano Developer Kit (B01): placa base de 100 × 80 mm sobre cuatro
 * patas, el módulo con el disipador negro de aletas, el cabezal J41 de 40
 * pines, los puertos de atrás (alimentación DC, micro USB, HDMI, DisplayPort,
 * cuatro USB 3.0 y Gigabit Ethernet), las dos cámaras CSI, el conector del
 * ventilador, el puente J48 y el LED verde de encendido.
 */
export const JetsonNano = forwardRef(function JetsonNano(_: object, refLed: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  const textura = useMemo(() => texturaJetson(), [])
  const y0 = JET_Y + 1.6
  const enPlaca = (hijos: ReactNode) => <group position={M(0, JET_Y, 0)}>{hijos}</group>
  return (
    <group position={M(JET_X, 0, 0)}>
      {/* Patas */}
      {JET_AGUJEROS.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={M(x, JET_Y / 2, z)}><cylinderGeometry args={[m(2.6), m(2.6), m(JET_Y), 6]} /><meshStandardMaterial color={ORO} metalness={0.8} roughness={0.3} /></mesh>
      ))}
      {enPlaca(<Sustrato largo={80} ancho={100} radio={2.5} color="#124a30" textura={textura} />)}
      <ModuloJetson />
      <Cabezal centro={JET_CABEZAL} n={20} eje="z" conPines={q.sombras} />
      {/* Cabezal de botones J40 y conector del ventilador */}
      <Cabezal centro={[29, y0, 46]} n={4} eje="x" conPines={q.sombras} />
      <mesh position={M(29, y0 + 2.5, 42.5)}><boxGeometry args={M(8, 5, 4.5)} /><meshStandardMaterial color="#f1efe8" roughness={0.6} /></mesh>
      {/* Puente J48 (alimentación por el conector DC) con su capuchón */}
      <mesh position={M(-28, y0 + 3, 44)}><boxGeometry args={M(2.6, 6, 5.1)} /><meshStandardMaterial color="#1f2937" roughness={0.6} /></mesh>
      {/* Cámaras CSI */}
      {enPlaca(<><ConectorFpc pos={[5, 1.6, 46]} eje="x" /><ConectorFpc pos={[-14, 1.6, 46]} eje="x" /></>)}
      {/* Chips de la placa base: PHY de red, hub USB y regulador con sus bobinas */}
      {enPlaca(<>
        <Chip pos={[-12, -42]} l={8} a={8} alto={0.9} />
        <Chip pos={[0, -42]} l={7} a={7} alto={0.9} />
        <Chip pos={[30, 24]} l={5} a={5} alto={0.9} />
        <Chip pos={[30, 31]} l={5} a={5} alto={2} color="#4b4f55" />
        <Chip pos={[30, -38]} l={5} a={5} alto={2} color="#4b4f55" />
      </>)}
      {/* Puertos de atrás (bocas hacia −x) */}
      {enPlaca(<>
        <Rj45 pos={[-31.5, 8.4, -41.5]} frente={-1} />
        <UsbDoble pos={[-33.25, 9.6, -25]} frente={-1} lengueta="#1d4ed8" />
        <UsbDoble pos={[-33.25, 9.6, -9.5]} frente={-1} lengueta="#1d4ed8" />
        {/* DisplayPort y HDMI */}
        <mesh position={M(-36, 4.4, 6)} castShadow={q.sombras}><boxGeometry args={M(12, 5.6, 16)} /><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.28} /></mesh>
        <mesh position={M(-42.05, 4.4, 6)}><boxGeometry args={M(0.2, 3.8, 13)} /><meshStandardMaterial color="#202326" /></mesh>
        <mesh position={M(-36, 4.6, 22.5)} castShadow={q.sombras}><boxGeometry args={M(12, 6, 15)} /><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.28} /></mesh>
        <mesh position={M(-42.05, 4.6, 22.5)}><boxGeometry args={M(0.2, 3.6, 12)} /><meshStandardMaterial color="#202326" /></mesh>
        {/* Micro USB y conector de alimentación DC */}
        <mesh position={M(-39.5, 3.2, 34)}><boxGeometry args={M(5.5, 3, 7.5)} /><meshStandardMaterial color={METAL} metalness={0.9} roughness={0.28} /></mesh>
        <mesh position={M(-35, 7.1, 43)} castShadow={q.sombras}><boxGeometry args={M(14, 11, 9)} /><meshStandardMaterial color={NEGRO} roughness={0.6} /></mesh>
        <mesh position={M(-42.1, 7.6, 43)} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[m(3.2), m(3.2), m(0.3), q.segmentos]} /><meshStandardMaterial color="#000" /></mesh>
        {/* LED verde de encendido */}
        <mesh position={M(-24, 2, 30)}><boxGeometry args={M(1.6, 0.6, 0.8)} /><meshStandardMaterial ref={refLed} color="#16a34a" emissive="#22c55e" emissiveIntensity={1.6} /></mesh>
      </>)}
      {enPlaca(<Pasivos semilla={3} n={60} area={[-23, 39, -49, 49]} prohibido={JET_PROHIBIDO} />)}
    </group>
  )
})

function anclaJetson(pin: string): V | null {
  if (pin === 'CSI') return [5 + JET_X, JET_Y + 6.6, 46]
  if (pin === 'ETH') return [-42.1 + JET_X, JET_Y + 7.6, -41.5]
  const fisicos = pinesCabezal(JET_CABEZAL, 20, 'z', -1, -1)
  const alias: Record<string, number> = { '3V3': 1, '5V': 2, GND: 6 }
  const n = alias[pin] ?? Number(/^PIN(\d+)$/.exec(pin)?.[1] ?? NaN)
  if (!(n >= 1 && n <= 40)) return null
  const p = fisicos[n - 1]
  return [p[0] + JET_X, p[1] - 5, p[2]]
}

/** Dónde se enchufa cada cable en la Raspberry Pi 4 o la Jetson Nano (marco de la pieza, mm). */
export function anclaComputadora(modelo: string, pin: string): V | null {
  if (modelo === 'proc:raspberry-pi-4') return anclaRpi(pin)
  if (modelo === 'proc:jetson-nano') return anclaJetson(pin)
  return null
}
