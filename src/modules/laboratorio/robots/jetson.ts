// Proyectos con Jetson Nano: robots que VEN. Se programan en Python con
// Jetson.GPIO (pines por su número físico, GPIO.BOARD) y la cámara CSI, que
// entrega cada imagen como una tabla de números (0 = negro, 255 = blanco).
// Idea pedagógica: los TCRT5000 dicen «línea sí / línea no» en dos puntos;
// la cámara ve una franja entera de la pista y dice DÓNDE está la línea.

import { autocablear, pinCodigo, pinDePlaca, type FilaPin } from '../engine/autocableado'
import { encastrar, robotVacio } from '../engine/ensamblaje'
import { pieza } from '../catalogo/piezas'
import type { RobotDoc } from './doc'
import type { PlantillaCodigo, Prearmado } from './prearmados'

/** Pines del L298N en el código (lado izquierdo = canal A), según el cableado. */
function pinesDriver(doc: RobotDoc, tabla: FilaPin[]) {
  const drv = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'puente-h')
  const c = drv ? pieza(drv.pieza).comportamiento : null
  const [a, b] = c?.tipo === 'puente-h' ? c.canales : []
  const pin = (p: string | undefined, def: string) => {
    if (!drv || !p) return def
    const directo = doc.cables.find(x => (x.de[0] === drv.id && x.de[1] === p && x.a[0] !== drv.id) || (x.a[0] === drv.id && x.a[1] === p && x.de[0] !== drv.id))
    const otro = directo ? (directo.de[0] === drv.id ? directo.a : directo.de) : null
    const placa = otro && pieza(doc.piezas.find(x => x.id === otro[0])!.pieza).comportamiento.tipo === 'mcu' ? otro[1] : pinDePlaca(tabla, drv.id, p)
    return pinCodigo(placa ?? def)
  }
  return {
    ENA: pin(a?.en, '32'), IN1: pin(a?.in_a, '29'), IN2: pin(a?.in_b, '31'),
    ENB: pin(b?.en, '33'), IN3: pin(b?.in_a, '36'), IN4: pin(b?.in_b, '38'),
  }
}

/** Cabecera común: Jetson.GPIO con los pines del driver y la función motores(izq, der). */
function bloqueMotoresJetson(doc: RobotDoc, tabla: FilaPin[]) {
  const p = pinesDriver(doc, tabla)
  return `import Jetson.GPIO as GPIO
from time import sleep

# Pines del L298N, con la numeración física del conector (GPIO.BOARD).
# En la Jetson Nano solo los pines 32 y 33 tienen PWM: ahí van ENA y ENB.
ENA, IN1, IN2 = ${p.ENA}, ${p.IN1}, ${p.IN2}   # motor izquierdo
ENB, IN3, IN4 = ${p.ENB}, ${p.IN3}, ${p.IN4}   # motor derecho

GPIO.setmode(GPIO.BOARD)
GPIO.setup([ENA, IN1, IN2, ENB, IN3, IN4], GPIO.OUT, initial=GPIO.LOW)
velocidad_izq = GPIO.PWM(ENA, 1000)   # 1000 Hz
velocidad_der = GPIO.PWM(ENB, 1000)
velocidad_izq.start(0)
velocidad_der.start(0)

def motores(izq, der):
    """Velocidad de cada lado, de -100 a 100 (negativo = reversa)."""
    izq = max(-100, min(100, izq))
    der = max(-100, min(100, der))
    GPIO.output(IN1, izq > 0)
    GPIO.output(IN2, izq < 0)
    GPIO.output(IN3, der > 0)
    GPIO.output(IN4, der < 0)
    velocidad_izq.ChangeDutyCycle(abs(izq))
    velocidad_der.ChangeDutyCycle(abs(der))`
}

/** Parámetros del seguidor con cámara (los mismos que usa el test de lazo cerrado). */
export const VISION = {
  ovalo: { UMBRAL: 100, FILA: 18, BASE: 55, KP: 2.2, GIRO: 45 },
  carrera: { UMBRAL: 100, FILA: 12, BASE: 50, RAPIDO: 85, KP: 1.6, GIRO: 50 },
}

function codigoSeguidorCamara(doc: RobotDoc, tabla: FilaPin[]) {
  const v = VISION.ovalo
  return `# Seguidor de línea con CÁMARA en la Jetson Nano.
# La cámara entrega una imagen de 40 × 30 números (0 = negro, 255 = blanco).
# En vez de dos sensores que dicen «línea sí / no», miramos UNA FILA de la
# imagen y calculamos en qué columna está la línea: eso es visión artificial.
${bloqueMotoresJetson(doc, tabla)}

from camara import Camara

cam = Camara()

UMBRAL = ${v.UMBRAL}   # más oscuro que esto = cinta negra
FILA = ${v.FILA}       # fila de la imagen que miramos (0 = arriba, lejos; 29 = abajo, cerca)
BASE = ${v.BASE}       # velocidad hacia adelante (0 a 100)
KP = ${v.KP}        # cuánto corrige por cada columna de error (control proporcional)
GIRO = ${v.GIRO}       # velocidad para buscar la línea si se pierde

def centro_de_la_linea(fila):
    """Columna promedio de los píxeles oscuros, o None si no hay ninguno."""
    oscuros = [x for x, brillo in enumerate(fila) if brillo < UMBRAL]
    if not oscuros:
        return None
    return sum(oscuros) / len(oscuros)

ultimo_error = 0
cuadros = 0
print("Jetson lista: buscando la línea con la cámara")
while True:
    imagen = cam.leer()
    centro = centro_de_la_linea(imagen[FILA])
    if centro is None:
        # Perdimos la línea: girar hacia el lado donde la vimos por última vez.
        if ultimo_error > 0:
            motores(GIRO, -GIRO)
        else:
            motores(-GIRO, GIRO)
    else:
        error = centro - (cam.ancho - 1) / 2   # positivo = la línea está a la derecha
        motores(BASE + KP * error, BASE - KP * error)
        ultimo_error = error
    cuadros += 1
    if cuadros % 30 == 0:
        print("Línea en la columna", None if centro is None else round(centro, 1))
    sleep(1 / 30)   # la cámara da 30 imágenes por segundo
`
}

function codigoCarreraCamara(doc: RobotDoc, tabla: FilaPin[]) {
  const v = VISION.carrera
  return `# Carrera con cámara: la Jetson mira LEJOS para anticipar las curvas.
# Si la línea está centrada, viene una recta: acelera hasta RAPIDO.
# Si la línea se corre a un lado, viene una curva: frena hacia BASE.
# Un seguidor con dos TCRT5000 no puede hacer esto: se entera de la curva
# cuando ya está encima. La cámara la ve venir.
${bloqueMotoresJetson(doc, tabla)}

from camara import Camara

cam = Camara()

UMBRAL = ${v.UMBRAL}
FILA = ${v.FILA}       # más arriba en la imagen = más lejos en la pista
BASE = ${v.BASE}       # velocidad en las curvas
RAPIDO = ${v.RAPIDO}     # velocidad en las rectas
KP = ${v.KP}
GIRO = ${v.GIRO}

def centro_de_la_linea(fila):
    oscuros = [x for x, brillo in enumerate(fila) if brillo < UMBRAL]
    if not oscuros:
        return None
    return sum(oscuros) / len(oscuros)

ultimo_error = 0
mitad = (cam.ancho - 1) / 2
while True:
    imagen = cam.leer()
    centro = centro_de_la_linea(imagen[FILA])
    if centro is None:
        if ultimo_error > 0:
            motores(GIRO, -GIRO)
        else:
            motores(-GIRO, GIRO)
    else:
        error = centro - mitad
        # Velocidad adaptativa: cuanto más lejos del centro, más despacio.
        rectitud = 1 - min(1, abs(error) / mitad)
        velocidad = BASE + (RAPIDO - BASE) * rectitud
        motores(velocidad + KP * error, velocidad - KP * error)
        ultimo_error = error
    sleep(1 / 30)
`
}

/** Mira la imagen en el Monitor Serie: un carácter por píxel (# = oscuro). */
const CODIGO_VER_CAMARA = `# ¿Qué ve la cámara? La imagen es una tabla de números de 0 (negro) a 255
# (blanco). Este programa la dibuja en el Monitor Serie con caracteres:
# '#' muy oscuro, '+' oscuro, '.' claro y ' ' blanco. Mueve el robot con
# el control y vuelve a ejecutar para ver cómo cambia.
from camara import Camara
from time import sleep

cam = Camara()
sleep(0.1)   # esperar la primera imagen
imagen = cam.leer()
print("Imagen de", cam.ancho, "×", cam.alto, "píxeles")
for fila in imagen:
    print("".join("#" if b < 60 else "+" if b < 120 else "." if b < 200 else " " for b in fila))
print("Píxel del centro:", imagen[cam.alto // 2][cam.ancho // 2])
`

function codigoPruebaMotoresJetson(doc: RobotDoc, tabla: FilaPin[]) {
  return `# Prueba de motores con Jetson.GPIO: adelante, giro, reversa y alto.
${bloqueMotoresJetson(doc, tabla)}

while True:
    print("Adelante")
    motores(70, 70)
    sleep(1.5)
    print("Girar a la derecha")
    motores(60, -60)
    sleep(0.6)
    print("Reversa")
    motores(-50, -50)
    sleep(1)
    print("Alto")
    motores(0, 0)
    sleep(1)
`
}

/** Plantillas para una Jetson armada desde cero (en Python, no en C++). */
export function plantillasJetson(doc: RobotDoc, tabla: FilaPin[]): PlantillaCodigo[] {
  const out: PlantillaCodigo[] = []
  const driver = doc.piezas.some(p => pieza(p.pieza).comportamiento.tipo === 'puente-h')
  const camara = doc.piezas.some(p => pieza(p.pieza).comportamiento.tipo === 'camara')
  if (driver) out.push({ id: 'motores', nombre: 'Prueba de motores (Python)', descripcion: 'Jetson.GPIO: adelante, giro, reversa', codigo: codigoPruebaMotoresJetson(doc, tabla) })
  if (camara) out.push({ id: 'ver-camara', nombre: '¿Qué ve la cámara?', descripcion: 'Dibuja la imagen en el Monitor Serie', codigo: CODIGO_VER_CAMARA })
  if (driver && camara) out.push({ id: 'seguidor-camara', nombre: 'Seguidor con cámara', descripcion: 'Una fila de la imagen y control proporcional', codigo: codigoSeguidorCamara(doc, tabla) })
  return out
}

/** Robot con Jetson Nano y cámara: chasis 2WD, L298N y la cámara en el mástil del frente (sin sensores de piso). */
export function construirRobotJetson(nombre: string, codigo: (doc: RobotDoc, tabla: FilaPin[]) => string): RobotDoc {
  let doc = robotVacio('chasis-2wd', 'acrilico', nombre)
  const poner = (p: string, en: string, m: string) => { const r = encastrar(doc, p, en, m); doc = r.doc; return r.id }
  poner('jetson-nano', 'chasis', 'placa')
  poner('l298n', 'chasis', 'driver')
  poner('bateria-2x18650', 'chasis', 'bateria')
  const mi = poner('motor-tt', 'chasis', 'motor-izq')
  const md = poner('motor-tt', 'chasis', 'motor-der')
  poner('rueda-65', mi, 'eje')
  poner('rueda-65', md, 'eje')
  poner('rueda-loca', 'chasis', 'loca')
  poner('camara-csi', 'chasis', 'frente')
  const { cables, tabla } = autocablear(doc)
  doc = { ...doc, cables }
  return { ...doc, programa: { modo: 'codigo', cpp: codigo(doc, tabla) } }
}

export const PROYECTOS_JETSON: Prearmado[] = [
  {
    id: 'jetson-seguidor-camara',
    nombre: 'Seguidor de línea con cámara (Jetson Nano)',
    descripcion: 'Una Jetson Nano con cámara CSI sigue la línea SIN sensores de piso: mira una fila de la imagen, encuentra la columna de la cinta negra y corrige en proporción al error. La base de la visión artificial.',
    dificultad: 'avanzado',
    logica: [
      'La cámara da una imagen de 40 × 30 números: 0 es negro y 255 es blanco.',
      'Se mira una sola fila (FILA): los píxeles más oscuros que UMBRAL son la cinta.',
      'El promedio de sus columnas es el centro de la línea; el error es cuánto se aleja del centro de la imagen.',
      'Control proporcional: cada motor va a BASE ± KP × error. Error grande, giro fuerte; error chico, casi recto.',
      'Si la línea desaparece, gira hacia el lado donde la vio por última vez.',
    ],
    arena: 'ovalo',
    construir: () => construirRobotJetson('Seguidor con cámara (Jetson)', codigoSeguidorCamara),
    plantillas: (doc, tabla) => [
      { id: 'seguidor-camara', nombre: 'Seguidor con cámara', descripcion: 'Una fila de la imagen y control proporcional', codigo: codigoSeguidorCamara(doc, tabla) },
      { id: 'ver-camara', nombre: '¿Qué ve la cámara?', descripcion: 'Dibuja la imagen en el Monitor Serie', codigo: CODIGO_VER_CAMARA },
      { id: 'motores', nombre: 'Prueba de motores (Python)', descripcion: 'Jetson.GPIO: adelante, giro, reversa', codigo: codigoPruebaMotoresJetson(doc, tabla) },
    ],
  },
  {
    id: 'jetson-carrera-camara',
    nombre: 'Carrera con cámara (Jetson Nano)',
    descripcion: 'La competencia de velocidad, ahora con visión: la cámara mira lejos, ve venir las curvas y frena antes; en las rectas acelera. Compara tu tiempo con el del seguidor de dos sensores.',
    dificultad: 'avanzado',
    logica: [
      'La fila que se mira está más arriba en la imagen: más lejos en la pista.',
      'Si la línea está centrada viene una recta: la velocidad sube hacia RAPIDO.',
      'Si la línea se corre a un lado viene una curva: la velocidad baja hacia BASE antes de llegar.',
      'Así se anticipa, algo que dos TCRT5000 no pueden hacer: ellos ven la curva cuando ya están encima.',
    ],
    arena: 'circuito-velocidad',
    construir: () => construirRobotJetson('Carrera con cámara (Jetson)', codigoCarreraCamara),
    plantillas: (doc, tabla) => [
      { id: 'carrera-camara', nombre: 'Carrera con cámara', descripcion: 'Mira lejos y adapta la velocidad', codigo: codigoCarreraCamara(doc, tabla) },
      { id: 'seguidor-camara', nombre: 'Seguidor con cámara', descripcion: 'Una fila de la imagen y control proporcional', codigo: codigoSeguidorCamara(doc, tabla) },
      { id: 'ver-camara', nombre: '¿Qué ve la cámara?', descripcion: 'Dibuja la imagen en el Monitor Serie', codigo: CODIGO_VER_CAMARA },
    ],
  },
]
