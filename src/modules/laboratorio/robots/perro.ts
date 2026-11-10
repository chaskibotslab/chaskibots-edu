// Proyectos con el perro robot cuadrúpedo (como el Unitree Go2): una Jetson
// Nano en el lomo le da órdenes de ALTO NIVEL en Python. Idea pedagógica:
// en un robot con ruedas el programa decide el voltaje de cada motor; en un
// robot con patas eso sería imposible a mano (12 motores coordinados cientos
// de veces por segundo), así que se programa en capas: el controlador de
// marcha mueve las patas y el programa decide hacia dónde ir.

import { autocablear } from '../engine/autocableado'
import { encastrar, robotVacio } from '../engine/ensamblaje'
import type { RobotDoc } from './doc'
import type { PlantillaCodigo, Prearmado } from './prearmados'

/** Parámetros de los programas (los mismos que usan los tests de lazo cerrado). */
export const PERRO = {
  explorador: { CERCA: 45, LIBRE: 90, VELOCIDAD: 0.3, LENTO: 0.15, GIRO: 70, MIRAR: 70 },
  camara: { UMBRAL: 100, FILA: 25, VELOCIDAD: 0.3, KP: 4, GIRO: 40 },
}

const CODIGO_PRIMEROS_PASOS = `# Mi primer perro robot: órdenes de ALTO NIVEL.
# El perro tiene 12 motores (3 por pata), pero no los movemos uno por uno:
# su controlador de marcha coordina las patas y nosotros le decimos qué hacer.
#   perro.mover(vx, vy, giro): vx adelante (m/s), vy a la izquierda (m/s),
#                              giro a la izquierda (grados por segundo)
from perro import Perro
from time import sleep

perro = Perro()
print("Levantándose...")
perro.pararse()
sleep(1.5)              # pararse tarda un poco

LADO = 0.6              # metros de cada lado del cuadrado
VELOCIDAD = 0.3         # metros por segundo

for lado in range(4):
    print("Lado", lado + 1)
    perro.mover(VELOCIDAD)
    sleep(LADO / VELOCIDAD)          # tiempo = distancia ÷ velocidad
    perro.detener()
    sleep(0.3)
    # Girar 90° a la izquierda usando el giroscopio (orientacion, en grados).
    inicio = perro.orientacion()
    perro.mover(0, 0, 60)
    while perro.orientacion() - inicio < 85:   # 85: frena unos 5° más
        sleep(0.02)
    perro.detener()
    sleep(0.3)

print("Ahora de costado, como un cangrejo")
perro.mover(0, 0.2)     # 0,2 m/s hacia la izquierda
sleep(1.5)
perro.mover(0, -0.2)    # y hacia la derecha
sleep(1.5)
perro.detener()

perro.sentarse()
sleep(1.5)
perro.saludar()
print("¡Hola!")
sleep(3)
perro.echarse()
print("A descansar")
`

function codigoExplorador() {
  const v = PERRO.explorador
  return `# Perro explorador: camina por el campo y esquiva las cajas con su
# sensor de distancia (en la cabeza, como el LiDAR del Unitree Go2).
# Cuando algo se le cruza, mira a los dos lados y se va por el más libre.
from perro import Perro
from time import sleep

perro = Perro()
perro.pararse()
while not perro.listo:      # esperar a que termine de pararse
    sleep(0.1)

CERCA = ${v.CERCA}           # cm: más cerca que esto, hay que esquivar
LIBRE = ${v.LIBRE}           # cm: sigue girando hasta ver este espacio libre
VELOCIDAD = ${v.VELOCIDAD}     # m/s con el camino libre
LENTO = ${v.LENTO}        # m/s cuando algo se acerca
GIRO = ${v.GIRO}            # grados por segundo
MIRAR = ${v.MIRAR}           # grados que gira para mirar a cada lado

def girar(grados):
    """Gira en el lugar (+ = izquierda) usando el giroscopio y devuelve la distancia que ve."""
    inicio = perro.orientacion()
    perro.mover(0, 0, GIRO if grados > 0 else -GIRO)
    while abs(perro.orientacion() - inicio) < abs(grados):
        sleep(0.02)
    perro.detener()
    sleep(0.3)               # quieto un momento para medir bien
    return perro.distancia()

print("Explorando...")
while True:
    d = perro.distancia()
    if d < CERCA:
        perro.detener()
        izquierda = girar(MIRAR)          # mira a la izquierda
        derecha = girar(-2 * MIRAR)       # y a la derecha
        print("Obstáculo a", round(d), "cm. Izquierda:", round(izquierda), "cm, derecha:", round(derecha), "cm")
        if izquierda > derecha:
            girar(2 * MIRAR)              # vuelve a mirar a la izquierda
            lado = 1
        else:
            lado = -1
        # Si todavía hay algo cerca, sigue girando para ese lado.
        perro.mover(0, 0, GIRO * lado)
        while perro.distancia() < LIBRE:
            sleep(0.05)
    elif d < 2 * CERCA:
        perro.mover(LENTO)
    else:
        perro.mover(VELOCIDAD)
    sleep(0.05)
`
}

function codigoSeguidorCamara() {
  const v = PERRO.camara
  return `# Perro guía: sigue la línea con la CÁMARA de la cabeza.
# Igual que el seguidor con cámara de la Jetson, pero aquí no hay motores
# izquierdo y derecho: le decimos al perro cuánto girar (grados por segundo).
from perro import Perro
from camara import Camara
from time import sleep

perro = Perro()
cam = Camara()
perro.pararse()
while not perro.listo:
    sleep(0.1)

UMBRAL = ${v.UMBRAL}       # más oscuro que esto = cinta negra
FILA = ${v.FILA}          # fila de la imagen que miramos (29 = la más cercana)
VELOCIDAD = ${v.VELOCIDAD}   # m/s hacia adelante
KP = ${v.KP}             # grados por segundo de giro por cada columna de error
GIRO = ${v.GIRO}          # giro para buscar la línea si se pierde

def centro_de_la_linea(fila):
    oscuros = [x for x, brillo in enumerate(fila) if brillo < UMBRAL]
    if not oscuros:
        return None
    return sum(oscuros) / len(oscuros)

ultimo_error = 0
while True:
    centro = centro_de_la_linea(cam.leer()[FILA])
    if centro is None:
        # Perdió la línea: girar en el lugar hacia donde la vio por última vez.
        perro.mover(0, 0, -GIRO if ultimo_error > 0 else GIRO)
    else:
        error = centro - (cam.ancho - 1) / 2    # positivo = la línea está a la derecha
        perro.mover(VELOCIDAD, 0, -KP * error)  # giro + = izquierda, por eso el signo
        ultimo_error = error
    sleep(1 / 30)
`
}

const CODIGO_SENSORES = `# ¿Qué siente el perro? Muestra su postura, la distancia al frente y la
# orientación. Mueve el perro con el control (sin programa) o con este código.
from perro import Perro
from time import sleep

perro = Perro()
perro.pararse()
sleep(1.5)
perro.mover(0, 0, 30)       # gira despacio en el lugar
for i in range(20):
    print("postura:", perro.postura, "| distancia:", round(perro.distancia()), "cm | orientación:", round(perro.orientacion()), "°")
    sleep(0.5)
perro.detener()
`

function plantillasPerro(camara: boolean): PlantillaCodigo[] {
  const out: PlantillaCodigo[] = [
    { id: 'primeros-pasos', nombre: 'Primeros pasos', descripcion: 'Pararse, un cuadrado, de costado y saludar', codigo: CODIGO_PRIMEROS_PASOS },
    { id: 'explorador', nombre: 'Explorador', descripcion: 'Esquiva obstáculos con el sensor de distancia', codigo: codigoExplorador() },
    { id: 'sensores', nombre: '¿Qué siente el perro?', descripcion: 'Postura, distancia y orientación en el Monitor Serie', codigo: CODIGO_SENSORES },
  ]
  if (camara) out.push({ id: 'guia-camara', nombre: 'Perro guía con cámara', descripcion: 'Sigue la línea mirando una fila de la imagen', codigo: codigoSeguidorCamara() })
  return out
}

/** Plantillas para un perro armado desde cero (en Python). */
export function plantillasCuadrupedo(doc: RobotDoc): PlantillaCodigo[] {
  return plantillasPerro(doc.piezas.some(p => p.pieza === 'camara-csi'))
}

/** Perro con la Jetson Nano en el lomo y (si se pide) la cámara en la cabeza. */
export function construirPerro(nombre: string, codigo: string, conCamara = false): RobotDoc {
  let doc = robotVacio('perro-robot', undefined, nombre)
  doc = encastrar(doc, 'jetson-nano', 'chasis', 'placa').doc
  if (conCamara) doc = encastrar(doc, 'camara-csi', 'chasis', 'cabeza').doc
  const { cables } = autocablear(doc)
  return { ...doc, cables, programa: { modo: 'codigo', cpp: codigo } }
}

export const PROYECTOS_PERRO: Prearmado[] = [
  {
    id: 'perro-primeros-pasos',
    nombre: 'Perro robot: primeros pasos',
    descripcion: 'Un perro de cuatro patas como el Unitree Go2. No se programan sus 12 motores: se le dan órdenes de alto nivel (pararse, caminar, girar, ir de costado, sentarse) y su controlador de marcha mueve las patas.',
    dificultad: 'intermedio',
    logica: [
      'perro.pararse() lo levanta; tarda un poco, por eso el sleep.',
      'perro.mover(vx, vy, giro) le da una velocidad: adelante (m/s), a la izquierda (m/s) y de giro (grados por segundo).',
      'Para recorrer una distancia: tiempo = distancia ÷ velocidad.',
      'Para girar justo 90° se usa el giroscopio: perro.orientacion() dice cuántos grados giró.',
      'La última orden vale hasta que llega otra: perro.detener() lo frena.',
    ],
    arena: 'patio',
    construir: () => construirPerro('Perro robot (Jetson)', CODIGO_PRIMEROS_PASOS),
    plantillas: () => plantillasPerro(false),
  },
  {
    id: 'perro-explorador',
    nombre: 'Perro explorador (esquiva obstáculos)',
    descripcion: 'El perro camina por el campo y esquiva las cajas con el sensor de distancia de su cabeza. Frena cuando algo se acerca, mira a los dos lados girando con el giroscopio y se va por el lado más libre.',
    dificultad: 'avanzado',
    logica: [
      'perro.distancia() da los centímetros hasta lo que tiene adelante (ignora el piso).',
      'Lejos de todo camina rápido; si algo está a menos del doble de CERCA, va más lento.',
      'Más cerca que CERCA: se detiene, gira MIRAR grados a la izquierda y mide, después a la derecha y mide.',
      'Para girar justo esos grados usa perro.orientacion(), el giroscopio.',
      'Se va por el lado que vio más libre y sigue girando hasta ver más de LIBRE cm.',
    ],
    arena: 'campo-libre',
    construir: () => construirPerro('Perro explorador (Jetson)', codigoExplorador()),
    plantillas: () => plantillasPerro(false),
  },
  {
    id: 'perro-guia-camara',
    nombre: 'Perro guía con cámara',
    descripcion: 'La cámara de la cabeza mira la pista y el perro sigue la línea: el error de la imagen se convierte en una velocidad de giro. Visión artificial más marcha de alto nivel.',
    dificultad: 'avanzado',
    logica: [
      'La cámara da una imagen de 40 × 30: se mira una fila y se busca la columna de la cinta negra.',
      'El error es cuánto se aleja la línea del centro de la imagen (positivo = a la derecha).',
      'El giro es proporcional al error: perro.mover(VELOCIDAD, 0, −KP × error). El signo menos es porque el giro positivo es a la izquierda.',
      'Si la línea desaparece, gira en el lugar hacia donde la vio por última vez.',
    ],
    arena: 'ovalo',
    construir: () => construirPerro('Perro guía (Jetson)', codigoSeguidorCamara(), true),
    plantillas: () => plantillasPerro(true),
  },
]
