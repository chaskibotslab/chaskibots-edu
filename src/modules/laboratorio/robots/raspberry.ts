// Proyectos con Raspberry Pi 4: se programan en Python con gpiozero, como en
// la placa real. Los pines del código salen del cableado (numeración BCM).

import { autocablear, pinCodigo, pinDePlaca, type FilaPin } from '../engine/autocableado'
import { reemplazar } from '../engine/ensamblaje'
import { pieza } from '../catalogo/piezas'
import type { RobotDoc } from './doc'
import type { Prearmado } from './prearmados'
import { Banco } from './circuitos'

const ROJO = '#ef4444'
const NEGRO = '#111827'

/** Pin BCM del cable que llega a (instancia, pin), o el de la tabla del cableado automático. */
function bcm(doc: RobotDoc, tabla: FilaPin[], instancia: string, pin: string, porDefecto: string) {
  const directo = doc.cables.find(c => (c.de[0] === instancia && c.de[1] === pin && c.a[0] === 'placa') || (c.a[0] === instancia && c.a[1] === pin && c.de[0] === 'placa'))
  const placa = directo ? (directo.de[0] === 'placa' ? directo.de[1] : directo.a[1]) : pinDePlaca(tabla, instancia, pin)
  return pinCodigo(placa ?? porDefecto)
}
const instDe = (doc: RobotDoc, piezaId: string, n = 0) => doc.piezas.filter(p => p.pieza === piezaId)[n]?.id ?? ''

// ---------------------------------------------------------------------------
// Semáforo con botón (mesa de electrónica)
// ---------------------------------------------------------------------------

function codigoSemaforo(doc: RobotDoc, tabla: FilaPin[]) {
  const led = (id: string) => bcm(doc, tabla, instDe(doc, id), 'A', '17')
  return `# Semáforo con botón para el peatón, en Python con gpiozero.
# En la Raspberry Pi real: guarda este archivo y córrelo con  python3 semaforo.py
from gpiozero import LED, Button
from time import sleep

rojo = LED(${led('led-rojo')})
amarillo = LED(${led('led-amarillo')})
verde = LED(${led('led-verde')})
boton = Button(${bcm(doc, tabla, instDe(doc, 'pulsador'), '1', '26')})   # al otro lado, a GND (pull-up interno)

def esperar_verde(segundos):
    """Espera en verde, pero si un peatón presiona el botón corta antes."""
    for _ in range(int(segundos * 10)):
        if boton.is_pressed:
            print("Peatón esperando: cambio a rojo")
            return
        sleep(0.1)

while True:
    verde.on()
    esperar_verde(5)
    verde.off()

    amarillo.on()
    sleep(1.5)
    amarillo.off()

    rojo.on()
    print("Rojo: pueden cruzar")
    sleep(4)
    rojo.off()
`
}

export function construirSemaforoRpi(): RobotDoc {
  const b = new Banco('Semáforo con Raspberry Pi', 'raspberry-pi-4')
  b.ledConResistencia('led-rojo', 1, 'GPIO17', '#f97316')
  b.ledConResistencia('led-amarillo', 2, 'GPIO27', '#eab308')
  b.ledConResistencia('led-verde', 3, 'GPIO22', '#22c55e')
  const p = b.poner('pulsador', 5)
  b.cable([p, '1'], ['placa', 'GPIO26'], '#3b82f6')
  b.cable([p, '2'], ['placa', 'GND'], NEGRO)
  const d = b.terminar('')
  return { ...d, programa: { modo: 'codigo', cpp: codigoSemaforo(d, []) } }
}

// ---------------------------------------------------------------------------
// Alarma de distancia (mesa de electrónica)
// ---------------------------------------------------------------------------

function codigoDistancia(doc: RobotDoc, tabla: FilaPin[]) {
  const us = instDe(doc, 'hcsr04')
  return `# Alarma de distancia: el HC-SR04 mide y el LED avisa si algo está cerca.
# DistanceSensor da la distancia en METROS (0,25 = 25 cm).
# El sensor va alimentado con 3,3 V (versión HC-SR04P): con 5 V, su ECHO dañaría la Raspberry.
from gpiozero import DistanceSensor, LED
from time import sleep

sensor = DistanceSensor(echo=${bcm(doc, tabla, us, 'ECHO', '24')}, trigger=${bcm(doc, tabla, us, 'TRIG', '23')}, max_distance=2)
alarma = LED(${bcm(doc, tabla, instDe(doc, 'led-rojo'), 'A', '17')})

CERCA = 0.20   # metros

while True:
    cm = sensor.distance * 100
    print("Distancia:", round(cm), "cm")
    if sensor.distance < CERCA:
        alarma.blink(on_time=0.1, off_time=0.1)
    else:
        alarma.off()
    sleep(0.3)
`
}

export function construirDistanciaRpi(): RobotDoc {
  const b = new Banco('Alarma de distancia (Raspberry Pi)', 'raspberry-pi-4')
  b.ledConResistencia('led-rojo', 2, 'GPIO17', '#f97316')
  const u = b.ultrasonido('protoboard', 'sensor', 'GPIO23', 'GPIO24')
  // La Raspberry trabaja con 3,3 V: el sensor (versión HC-SR04P) se alimenta desde 3V3, así su ECHO no la daña.
  b.doc = { ...b.doc, cables: b.doc.cables.map(c => (c.de[0] === u && c.de[1] === 'VCC' ? { ...c, a: ['placa', '3V3'] as [string, string] } : c)) }
  const d = b.terminar('')
  return { ...d, programa: { modo: 'codigo', cpp: codigoDistancia(d, []) } }
}

// ---------------------------------------------------------------------------
// Seguidor de línea con Raspberry Pi (robot)
// ---------------------------------------------------------------------------

function codigoSeguidorRpi(doc: RobotDoc, tabla: FilaPin[]) {
  const drv = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'puente-h')?.id ?? ''
  const c = drv ? pieza(doc.piezas.find(p => p.id === drv)!.pieza).comportamiento : null
  const [a, b] = c?.tipo === 'puente-h' ? c.canales : []
  const p = (pin: string | undefined, def: string) => (pin ? bcm(doc, tabla, drv, pin, def) : def)
  const sensor = (montaje: string, def: string) => bcm(doc, tabla, doc.piezas.find(x => x.padre?.montaje === montaje)?.id ?? '', 'DO', def)
  return `# Seguidor de línea con Raspberry Pi, en Python con gpiozero.
# Los dos TCRT5000 dan ALTO sobre la cinta negra (line_detected = True).
# Las velocidades van de 0 a 1 (0,6 = 60 % del PWM).
from gpiozero import Motor, Robot, LineSensor
from time import sleep

izquierdo = LineSensor(${sensor('piso-izq', '17')})
derecho = LineSensor(${sensor('piso-der', '27')})

robot = Robot(
    left=Motor(forward=${p(a?.in_a, '5')}, backward=${p(a?.in_b, '6')}, enable=${p(a?.en, '12')}),
    right=Motor(forward=${p(b?.in_a, '16')}, backward=${p(b?.in_b, '20')}, enable=${p(b?.en, '13')}),
)

VELOCIDAD = 0.6
GIRO = 0.67

print("Seguidor listo")
while True:
    izq = izquierdo.line_detected
    der = derecho.line_detected
    if izq and not der:
        robot.value = (-GIRO / 2, GIRO)    # la línea se fue a la izquierda
    elif der and not izq:
        robot.value = (GIRO, -GIRO / 2)    # la línea se fue a la derecha
    else:
        robot.forward(VELOCIDAD)           # entre los sensores (o cruce): recto
    sleep(0.01)
`
}

export function construirSeguidorRpi(base: RobotDoc): RobotDoc {
  const uno = base.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'mcu')!
  const d = reemplazar({ ...base, nombre: 'Seguidor con Raspberry Pi' }, uno.id, 'raspberry-pi-4').doc
  const { cables, tabla } = autocablear(d)
  const doc = { ...d, cables }
  return { ...doc, programa: { modo: 'codigo', cpp: codigoSeguidorRpi(doc, tabla) } }
}

export const PROYECTOS_RPI = (construirSeguidor: () => RobotDoc): Prearmado[] => [
  {
    id: 'rpi-seguidor',
    nombre: 'Seguidor de línea con Raspberry Pi (Python)',
    descripcion: 'El seguidor de siempre, pero con una Raspberry Pi 4 programada en Python con gpiozero: Robot, Motor y LineSensor, como en la placa real.',
    dificultad: 'intermedio',
    logica: [
      'LineSensor lee cada TCRT5000: line_detected es True sobre la cinta negra.',
      'Robot une los dos motores; robot.value = (izquierdo, derecho) pone cada velocidad de −1 a 1.',
      'Si la línea se va a un lado, gira hacia ese lado; si no, avanza.',
      'sleep(0.01) deja que el resto del sistema respire: en Linux, un bucle sin pausa ocupa todo el procesador.',
    ],
    arena: 'ovalo',
    construir: () => construirSeguidorRpi(construirSeguidor()),
    plantillas: (doc, tabla) => [
      { id: 'seguidor', nombre: 'Seguidor de línea (Python)', descripcion: 'Robot, Motor y LineSensor de gpiozero', codigo: codigoSeguidorRpi(doc, tabla) },
    ],
  },
  {
    id: 'rpi-semaforo',
    categoria: 'electronica',
    nombre: 'Semáforo con Raspberry Pi (Python)',
    descripcion: 'El semáforo con botón para el peatón, programado en Python con gpiozero: LED y Button. El mismo programa corre en una Raspberry Pi real.',
    dificultad: 'inicial',
    logica: [
      'LED(17) y Button(26): gpiozero usa la numeración BCM de los GPIO.',
      'El verde dura 5 s, pero revisa el botón cada 0,1 s: si alguien presiona, corta antes.',
      'Amarillo 1,5 s y rojo 4 s, y vuelve a empezar.',
      'Una función propia (esperar_verde) hace el programa más fácil de leer.',
    ],
    arena: 'mesa-electronica',
    construir: construirSemaforoRpi,
    plantillas: (doc, tabla) => [{ id: 'semaforo', nombre: 'Semáforo con botón (Python)', descripcion: 'LED y Button de gpiozero', codigo: codigoSemaforo(doc, tabla) }],
  },
  {
    id: 'rpi-distancia',
    categoria: 'electronica',
    nombre: 'Alarma de distancia con Raspberry Pi (Python)',
    descripcion: 'El HC-SR04 mide con DistanceSensor de gpiozero y el LED parpadea si algo se acerca a menos de 20 cm. Acerca la mano con el control del panel.',
    dificultad: 'inicial',
    logica: [
      'DistanceSensor(echo, trigger) mide sola: sensor.distance está en metros.',
      'Se multiplica por 100 para mostrar centímetros en el Monitor Serie.',
      'Si está a menos de 0,20 m, el LED parpadea con blink(); si no, se apaga.',
      'El sensor se alimenta con 3,3 V: con 5 V su ECHO dañaría la Raspberry (el laboratorio te avisa si lo conectas mal).',
    ],
    arena: 'mesa-electronica',
    construir: construirDistanciaRpi,
    plantillas: (doc, tabla) => [{ id: 'distancia', nombre: 'Alarma de distancia (Python)', descripcion: 'DistanceSensor y LED de gpiozero', codigo: codigoDistancia(doc, tabla) }],
  },
]
