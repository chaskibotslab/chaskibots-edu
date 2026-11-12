// Explicaciones para el alumno: qué es cada pin, qué hace cada cable, qué
// falta conectar (guía paso a paso) y qué se aprende con cada proyecto.
// Todo sale del catálogo y del cableado: no hay textos por proyecto que
// mantener. Son funciones puras (las usan Cablear, la galería y los tests).

import { pieza } from '../catalogo/piezas'
import type { PinDef, PiezaDef } from '../catalogo/tipos'
import type { Cable, PiezaEnRobot, RobotDoc } from '../robots/doc'
import { autocablear } from './autocableado'
import { nets } from './plan'
import { datosPlaca, infoPlaca, mcuDe, pinCodigo } from './placa'

const clave = (inst: string, pin: string) => `${inst}.${pin}`

type Extremo = { inst: PiezaEnRobot; def: PiezaDef; pin: PinDef }

function extremo(doc: RobotDoc, [inst, pin]: [string, string]): Extremo | null {
  const i = doc.piezas.find(p => p.id === inst)
  if (!i) return null
  const def = pieza(i.pieza)
  const p = def.pines.find(x => x.nombre === pin)
  return p ? { inst: i, def, pin: p } : null
}

const esPlaca = (e: Extremo) => e.def.comportamiento.tipo === 'mcu'
const esRiel = (e: Extremo) => e.def.comportamiento.tipo === 'protoboard'
const rielMas = (e: Extremo) => esRiel(e) && e.pin.nombre.startsWith('+')
const rielMenos = (e: Extremo) => esRiel(e) && e.pin.nombre.startsWith('-')
/** Nombre del pin para leerlo en una frase: «TRIG de Sensor de distancia», «riel + de arriba». */
function nombrePin(e: Extremo): string {
  if (esRiel(e)) return `riel ${e.pin.nombre.startsWith('+') ? '+' : '−'} de ${e.pin.nombre.endsWith('arriba') ? 'arriba' : 'abajo'}`
  return `${e.pin.nombre} de ${esPlaca(e) ? e.def.nombre : e.inst.etiqueta}`
}

/** Voltaje que entrega un pin de alimentación (null si no es una fuente conocida). */
function voltajeFuente(e: Extremo): number | null {
  const c = e.def.comportamiento
  if (c.tipo === 'mcu') return datosPlaca(c.placa).fuentes[e.pin.nombre] ?? null
  if (c.tipo === 'bateria' && e.pin.nombre === '+') return c.voltaje
  if (c.tipo === 'puente-h' && e.pin.nombre === c.alim.salida5v) return 5
  return null
}

const voltios = (v: number) => `${String(v).replace('.', ',')} V`

const NOMBRE_TIPO: Record<PinDef['tipo'], string> = {
  digital: 'Digital', pwm: 'Digital con PWM (~)', analogico: 'Analógico', i2c: 'I2C', alim: 'Alimentación',
  gnd: 'Tierra (GND)', potencia: 'Potencia', csi: 'Cámara (CSI)', eth: 'Red (Ethernet)',
}

// ---------------------------------------------------------------------------
// Pines
// ---------------------------------------------------------------------------

export interface ExplicacionPin {
  /** «D9 · Arduino UNO». */
  titulo: string
  /** Tipo de pin en palabras («Digital con PWM (~)»). */
  tipo: string
  /** Qué hace, en una o dos frases. */
  que: string
  /** Cómo se usa en el programa (solo pines de la placa y señales que llegan a ella). */
  codigo?: string
  /** A qué está unido ahora (nombres legibles). Vacío = suelto. */
  unidoA: string[]
  /** Cuidado a tener en la vida real. */
  cuidado?: string
}

/** Qué hace un pin según su tipo, cuando la ficha no trae un texto propio. */
function queHace(e: Extremo, vLogica: number): string {
  const c = e.def.comportamiento
  const t = e.pin.tipo
  if (rielMas(e)) return 'Riel positivo de la protoboard: todos sus agujeros están unidos por dentro. Sirve para repartir la energía (5 V o 3,3 V) a muchos componentes con un solo cable desde la placa.'
  if (rielMenos(e)) return 'Riel negativo de la protoboard: todos sus agujeros están unidos por dentro. Sirve para repartir la tierra (GND) a muchos componentes con un solo cable desde la placa.'
  if (c.tipo === 'mcu') {
    if (t === 'gnd') return 'Tierra de la placa: el «regreso» de la corriente. Todas las piezas del circuito tienen que compartirla para que las señales se entiendan.'
    if (t === 'alim') {
      const v = voltajeFuente(e)
      if (e.pin.nombre === 'VIN') return 'Entrada de energía de la placa: aquí llega el positivo de la batería y la placa lo baja al voltaje que necesita.'
      return v ? `Salida de ${voltios(v)} de la placa para alimentar sensores y módulos. Da poca corriente: no alcanza para motores.` : 'Pin de alimentación de la placa.'
    }
    if (t === 'pwm') return `Pin digital con PWM: además de HIGH (${voltios(vLogica)}) y LOW (0 V), puede dar valores intermedios prendiendo y apagando muy rápido. Sirve para la velocidad de un motor o el brillo de un LED.`
    if (t === 'analogico') return `Entrada analógica: mide un voltaje entre 0 y ${voltios(vLogica)} y lo entrega como un número. También sirve como pin digital.`
    if (t === 'digital') return `Pin digital: como salida da HIGH (${voltios(vLogica)}) o LOW (0 V); como entrada lee si le llega HIGH o LOW.`
    if (t === 'i2c') return 'Bus I2C: dos cables (SDA y SCL) que comparten pantallas y sensores, cada uno con su dirección.'
    if (t === 'csi') return 'Conector de cámara: el cable plano de la cámara entra aquí.'
    if (t === 'eth') return 'Conector de red: por este cable la placa manda órdenes.'
  }
  if (c.tipo === 'bateria') return e.pin.nombre === '+' ? `Positivo de la batería (${voltios(c.voltaje)}): de aquí sale la energía de todo el circuito.` : 'Negativo de la batería: es la tierra de todo el circuito. Por aquí vuelve la corriente.'
  if (t === 'gnd') return `Tierra de ${e.inst.etiqueta}: va unida a la tierra (GND) de la placa. Sin tierra común la pieza no funciona.`
  if (c.tipo === 'puente-h') {
    if (e.pin.nombre === c.alim.salida5v) return 'Salida de 5 V del driver: su regulador los saca de la batería. Sirve para encender la placa sin cable USB.'
    if (e.pin.nombre === c.alim.vcc) return 'Energía para la parte «inteligente» del driver (la lógica): le llega desde la placa. La fuerza de los motores entra por otro pin.'
    const canal = c.canales.find(k => [k.en, k.in_a, k.in_b, k.out_a, k.out_b].includes(e.pin.nombre))
    const lado = canal === c.canales[0] ? 'A' : 'B'
    if (canal && e.pin.nombre === canal.en) return `Velocidad del motor ${lado}: con analogWrite de 0 a 255 el motor va de quieto a toda velocidad. Va a un pin con PWM (~).`
    if (canal && (e.pin.nombre === canal.in_a || e.pin.nombre === canal.in_b)) return `Dirección del motor ${lado}: con uno en HIGH y el otro en LOW gira hacia un lado; al revés, hacia el otro; los dos iguales, frena.`
    if (canal) return `Salida de potencia al motor ${lado}: por aquí va la corriente fuerte de la batería que hace girar el motor.`
    if (e.pin.nombre === c.alim.motor) return 'Entrada de la batería de los motores: de aquí toma el driver la corriente fuerte.'
    if (e.pin.nombre === c.alim.standby) return 'Standby: tiene que estar en HIGH para que el driver funcione. En LOW, el driver duerme y los motores no giran.'
  }
  if (t === 'alim') {
    const rango = e.pin.ayuda && /V\)?$/.test(e.pin.ayuda) && e.pin.ayuda.length <= 12 ? ` Funciona con ${e.pin.ayuda}.` : ''
    return `Entrada de energía de ${e.inst.etiqueta}: sin ella la pieza está apagada.${rango}`
  }
  if (c.tipo === 'motor-dc') return 'Terminal del motor: va a una salida del driver. Si cruzas los dos cables del motor, gira para el otro lado.'
  if (c.tipo === 'led') return e.pin.nombre === 'A' ? 'Ánodo (pata larga, el +): por aquí entra la corriente. Va al pin de la placa que lo enciende.' : 'Cátodo (pata corta, el −): por aquí sale la corriente, hacia tierra pasando por una resistencia.'
  if (c.tipo === 'led-rgb') return e.pin.nombre === 'K' ? 'Cátodo común (la pata más larga): va a tierra. Lo comparten los tres colores.' : `Pata del color ${{ R: 'rojo', G: 'verde', B: 'azul' }[e.pin.nombre] ?? e.pin.nombre}: con analogWrite se elige cuánto brilla; mezclando los tres sale cualquier color.`
  if (c.tipo === 'resistencia') return `Pata de la resistencia (${c.ohm >= 1000 ? `${c.ohm / 1000} kΩ` : `${c.ohm} Ω`}). No tiene polaridad: las dos patas son iguales. La resistencia limita la corriente para que nada se queme.`
  if (c.tipo === 'pulsador') return 'Pata del pulsador: al presionarlo, sus dos lados quedan unidos y pasa la corriente. Un lado va a un pin de la placa y el otro a tierra.'
  if (c.tipo === 'buzzer') return e.pin.nombre === '+' ? 'Positivo del buzzer: va al pin de la placa que lo hace sonar.' : 'Negativo del buzzer: va a tierra.'
  if (c.tipo === 'potenciometro') return e.pin.nombre === 'W' ? 'Pata del medio (cursor): su voltaje cambia al girar la perilla. Va a una entrada analógica.' : 'Pata de un extremo: una va a 5 V y la otra a tierra (si las cruzas, la perilla funciona al revés).'
  if (c.tipo === 'ldr') return 'Pata de la fotorresistencia: su resistencia baja cuando le da luz. No tiene polaridad.'
  if (t === 'potencia') return 'Pin de potencia: lleva corriente fuerte (motores), no señales.'
  if (t === 'analogico') return 'Salida analógica: entrega un voltaje que cambia con lo que mide. Va a una entrada analógica de la placa.'
  return `Señal de ${e.inst.etiqueta}: va a un pin de la placa.`
}

/** Cómo se usa en el programa un pin de la placa, según lo que tiene conectado. */
function usoEnCodigo(doc: RobotDoc, pinPlaca: PinDef, otro: Extremo | null): string | undefined {
  if (pinPlaca.tipo === 'alim' || pinPlaca.tipo === 'gnd' || pinPlaca.tipo === 'csi' || pinPlaca.tipo === 'eth') return undefined
  if (infoPlaca(doc).lenguaje !== 'cpp') return undefined
  const n = pinCodigo(pinPlaca.nombre)
  if (!otro) return `En el programa es el pin ${n}.`
  const c = otro.def.comportamiento
  const p = otro.pin.nombre
  if (c.tipo === 'puente-h') return c.canales.some(k => k.en === p) ? `analogWrite(${n}, 0…255) cambia la velocidad.` : `digitalWrite(${n}, HIGH o LOW) elige la dirección.`
  if (c.tipo === 'ultrasonido') return p === 'TRIG' ? `digitalWrite(${n}, HIGH) por 10 µs dispara el sonido.` : `pulseIn(${n}, HIGH) mide cuánto tardó el eco.`
  if (c.tipo === 'servo') return `miServo.attach(${n}) y luego miServo.write(ángulo).`
  if (c.tipo === 'ir-reflectivo') return p === 'AO' ? `analogRead(${n}) da un número: más alto, más oscuro.` : `digitalRead(${n}) da HIGH sobre la línea negra.`
  if (c.tipo === 'ir-obstaculo') return `digitalRead(${n}) da LOW cuando hay un obstáculo.`
  if (c.tipo === 'led') return `digitalWrite(${n}, HIGH) lo enciende; LOW lo apaga.`
  if (c.tipo === 'led-rgb') return `analogWrite(${n}, 0…255) cambia el brillo de ese color.`
  if (c.tipo === 'pulsador') return `pinMode(${n}, INPUT_PULLUP); digitalRead(${n}) da LOW al presionar.`
  if (c.tipo === 'buzzer') return c.activo ? `digitalWrite(${n}, HIGH) lo hace sonar.` : `tone(${n}, 440) toca una nota; noTone(${n}) la calla.`
  if (c.tipo === 'potenciometro' || c.tipo === 'ldr' || c.tipo === 'joystick') return `analogRead(${n}) da un número según la posición o la luz.`
  if (c.tipo === 'arma-giratoria') return `analogWrite(${n}, 0…255): 0 = quieta, 255 = a fondo.`
  return `En el programa es el pin ${n}.`
}

export function explicarPin(doc: RobotDoc, inst: string, pin: string): ExplicacionPin | null {
  const e = extremo(doc, [inst, pin])
  if (!e) return null
  const info = infoPlaca(doc)
  const n = nets(doc)
  const raizNet = n.get(clave(inst, pin))
  const vecinos = raizNet
    ? Array.from(n.entries()).filter(([k, r]) => r === raizNet && k !== clave(inst, pin)).map(([k]) => {
        const i = k.indexOf('.')
        return extremo(doc, [k.slice(0, i), k.slice(i + 1)])
      }).filter((x): x is Extremo => !!x)
    : []
  const propia = e.pin.ayuda && e.pin.ayuda.length > 12 ? e.pin.ayuda : null
  const general = queHace(e, info.vLogica)
  // El texto de la ficha es lo específico («HIGH sobre negro»): va adelante cuando el
  // general es de relleno («Señal de…»); en una placa, se suma lo propio del pin (D13: LED).
  const relleno = /^(Señal de |Salida analógica: |Pin de potencia: |Pin de alimentación)/.test(general)
  const que = propia && relleno ? `${propia.replace(/\.$/, '')}. ${general}`
    : propia && esPlaca(e) && e.pin.tipo !== 'alim' && e.pin.tipo !== 'gnd' && !/^(PWM|Entrada analógica|Digital|Pin digital)/.test(propia) ?`${general} ${propia.replace(/\.$/, '')}.` : general

  let codigo: string | undefined
  if (esPlaca(e)) codigo = usoEnCodigo(doc, e.pin, vecinos.find(v => !esPlaca(v) && !esRiel(v) && v.pin.tipo !== 'gnd' && v.pin.tipo !== 'alim') ?? null)
  else {
    const enPlaca = vecinos.find(v => esPlaca(v) && v.pin.tipo !== 'gnd' && v.pin.tipo !== 'alim')
    if (enPlaca) codigo = usoEnCodigo(doc, enPlaca.pin, e)
  }

  let cuidado: string | undefined
  const c = e.def.comportamiento
  if (c.tipo === 'mcu' && e.pin.tipo !== 'alim' && e.pin.tipo !== 'gnd') cuidado = `Aguanta como máximo ${voltios(info.vLogica)} y unos 20 mA: nunca le conectes un motor ni la batería directo.`
  else if (c.tipo === 'led' || c.tipo === 'led-rgb') cuidado = 'Sin una resistencia en serie (220 Ω o 330 Ω) el LED se quema.'
  else if (c.tipo === 'bateria') cuidado = 'Nunca unas el + con el −: es un cortocircuito y la batería se calienta mucho.'
  else if (c.tipo === 'servo' && e.pin.nombre === 'V+') cuidado = 'El servo pide bastante corriente: aliméntalo con 5 V, no con 3,3 V.'
  else if (c.tipo === 'mcu' && e.pin.tipo === 'alim' && voltajeFuente(e)) cuidado = 'No lo unas a GND (cortocircuito) ni lo uses para motores.'

  return {
    titulo: esRiel(e) ? nombrePin(e).replace(/^r/, 'R') : `${e.pin.nombre}${e.pin.tipo === 'pwm' ? ' ~' : ''} · ${esPlaca(e) ? e.def.nombre : e.inst.etiqueta}`,
    // Las patas de un LED o una resistencia no son «digitales»: son patas del componente.
    tipo: esRiel(e) ? 'Riel de la protoboard' : e.def.familia === 'circuito' && e.pin.tipo === 'digital' ? 'Pata del componente' : NOMBRE_TIPO[e.pin.tipo],
    que,
    codigo,
    unidoA: vecinos.map(nombrePin),
    cuidado,
  }
}

// ---------------------------------------------------------------------------
// Cables
// ---------------------------------------------------------------------------

export interface ExplicacionCable {
  /** «TRIG → D12». */
  titulo: string
  /** Para qué sirve ese cable. */
  texto: string
  /** Cómo se usa en el programa, si lleva una señal a la placa. */
  codigo?: string
}

export function explicarCable(doc: RobotDoc, cable: Pick<Cable, 'de' | 'a'>): ExplicacionCable | null {
  let a = extremo(doc, cable.de), b = extremo(doc, cable.a)
  if (!a || !b) return null
  // b = la placa (o el riel) si alguno lo es: la frase se arma desde la pieza.
  if ((esPlaca(a) && !esPlaca(b)) || (esRiel(a) && !esRiel(b) && !esPlaca(b))) [a, b] = [b, a]
  const titulo = `${a.pin.nombre} → ${b.pin.nombre}`
  const va = voltajeFuente(a), vb = voltajeFuente(b)
  const tierra = (e: Extremo) => e.pin.tipo === 'gnd' || rielMenos(e)
  const ca = a.def.comportamiento, cb = b.def.comportamiento

  // Cortocircuito: se explica aunque la verificación ya lo marque.
  if ((va !== null && tierra(b)) || (vb !== null && tierra(a))) {
    return { titulo, texto: `Une directamente la energía con la tierra: es un cortocircuito. En la vida real el cable se calienta y la placa o la batería se dañan. Quítalo.` }
  }
  if (tierra(a) && tierra(b)) {
    return { titulo, texto: `Tierra común: une la tierra de ${esRiel(a) ? 'el riel −' : a.inst.etiqueta} con la de ${esPlaca(b) ? 'la placa' : esRiel(b) ? 'el riel −' : b.inst.etiqueta}. La corriente sale por el positivo, pasa por la pieza y vuelve por la tierra: sin este cable el circuito queda abierto y nada funciona.` }
  }
  if (tierra(a) || tierra(b)) {
    const [t, o] = tierra(a) ? [a, b] : [b, a]
    if (o.def.comportamiento.tipo === 'resistencia') return { titulo, texto: `Lleva a tierra la resistencia: así se cierra el camino de la corriente (pin → componente → resistencia → tierra).` }
    return { titulo, texto: `Lleva ${nombrePin(o)} a tierra (${esRiel(t) ? 'por el riel −' : `GND de ${esPlaca(t) ? 'la placa' : t.inst.etiqueta}`}): por ahí vuelve la corriente.` }
  }
  // Alimentación.
  if (ca.tipo === 'bateria' && cb.tipo === 'puente-h') return { titulo, texto: `Lleva la energía de la batería al driver. El driver usa esa corriente fuerte para mover los motores: la placa sola no podría.` }
  if (ca.tipo === 'bateria' && esPlaca(b)) return { titulo, texto: `La batería alimenta la placa por ${b.pin.nombre}: la placa baja ese voltaje a 5 V para funcionar sin el cable USB.` }
  if (ca.tipo === 'puente-h' && esPlaca(b) && va !== null) return { titulo, texto: `El driver tiene un regulador que saca 5 V de la batería: con este cable esos 5 V encienden la placa. Así una sola batería alimenta todo el robot.` }
  if (va !== null || vb !== null || rielMas(a) || rielMas(b)) {
    const [f, o] = va !== null || rielMas(a) ? [a, b] : [b, a]
    const v = voltajeFuente(f)
    if (esRiel(o)) return { titulo, texto: `Lleva ${v ? voltios(v) : 'la energía'} al riel +: ahora todos los agujeros de ese riel tienen energía para repartir.` }
    if (esRiel(f)) return { titulo, texto: `Toma energía del riel + para ${nombrePin(o)}.` }
    const co = o.def.comportamiento
    if (co.tipo === 'puente-h' && o.pin.nombre === co.alim.standby) return { titulo, texto: `Deja ${o.pin.nombre} siempre en HIGH (${v ? voltios(v) : 'encendido'}): así el driver queda despierto. Si este cable falta, los motores no giran aunque el programa esté bien.` }
    if (co.tipo === 'puente-h' && o.pin.nombre === co.alim.vcc) return { titulo, texto: `Lleva ${v ? voltios(v) : 'energía'} de la placa a la lógica del driver: sin esto el driver no entiende las órdenes.` }
    return { titulo, texto: `Lleva ${v ? voltios(v) : 'energía'} desde ${nombrePin(f)} hasta ${nombrePin(o)}: es lo que enciende esa pieza.` }
  }
  // Potencia: driver ↔ motor.
  if ((ca.tipo === 'motor-dc' && cb.tipo === 'puente-h') || (ca.tipo === 'puente-h' && cb.tipo === 'motor-dc')) {
    return { titulo, texto: `Lleva la corriente del driver al motor. Cada motor usa dos cables: si los cruzas, el motor gira hacia el otro lado (sirve para corregir un robot que va para atrás).` }
  }
  if (ca.tipo === 'motor-dc' && esPlaca(b)) return { titulo, texto: `Un motor directo a un pin de la placa no funciona: el pin da unos 20 mA y el motor pide más de 200 mA. En la vida real el pin se daña. Usa un driver.` }
  // Señal entre una pieza y la placa.
  if (esPlaca(b) && !esPlaca(a)) {
    const propia = a.pin.ayuda && !/pata|placa/i.test(a.pin.ayuda) ? ` ${a.pin.ayuda.replace(/\.$/, '')}.` : ''
    const sentido = ['led', 'led-rgb', 'buzzer', 'servo', 'puente-h', 'arma-giratoria'].includes(ca.tipo) || (ca.tipo === 'ultrasonido' && a.pin.nombre === 'TRIG')
      ? `La placa manda la señal por ${b.pin.nombre} y ${a.inst.etiqueta} obedece.`
      : `${a.inst.etiqueta} avisa lo que detecta y la placa lo lee en ${b.pin.nombre}.`
    return { titulo, texto: `${sentido}${propia}`, codigo: usoEnCodigo(doc, b.pin, a) }
  }
  // Componente con componente (LED + resistencia, divisor de voltaje…).
  if (ca.tipo === 'resistencia' || cb.tipo === 'resistencia') {
    const [, o] = ca.tipo === 'resistencia' ? [a, b] : [b, a]
    if (o.def.comportamiento.tipo === 'led' || o.def.comportamiento.tipo === 'led-rgb') return { titulo, texto: `Pone la resistencia en serie con el LED: toda la corriente del LED pasa también por la resistencia, que la limita para que el LED no se queme.` }
    if (o.def.comportamiento.tipo === 'ldr') return { titulo, texto: `La fotorresistencia y la resistencia forman un divisor de voltaje: el punto donde se unen cambia de voltaje con la luz, y eso es lo que mide la placa.` }
    return { titulo, texto: `Pone la resistencia en serie con ${o.inst.etiqueta}: la corriente pasa por las dos.` }
  }
  if (esRiel(a) || esRiel(b)) return { titulo, texto: `Conecta ${nombrePin(esRiel(a) ? b : a)} al ${nombrePin(esRiel(a) ? a : b)}: queda unido con todo lo que esté en ese riel.` }
  return { titulo, texto: `Une ${nombrePin(a)} con ${nombrePin(b)}: quedan en el mismo punto del circuito.` }
}

// ---------------------------------------------------------------------------
// Guía paso a paso: qué falta conectar
// ---------------------------------------------------------------------------

export interface PasoGuia {
  cable: Cable
  /** «Conecta VCC de Sensor de distancia con 5V de Arduino UNO». */
  titulo: string
  /** Por qué hace falta ese cable. */
  porque: string
  codigo?: string
}

/**
 * Cables que faltan para que todo funcione, en el orden en que los pondría un
 * profesor (energía, motores, sensores…). Sale del cableado de referencia
 * (el automático): un cable falta si su pin de la pieza todavía está suelto.
 * Si el alumno ya ocupó el pin de la placa que tocaba, se propone otro libre
 * del mismo tipo.
 */
export function pasosPendientes(doc: RobotDoc): PasoGuia[] {
  const mcu = mcuDe(doc)
  const referencia = autocablear({ ...doc, cables: [] }).cables
  const n = nets(doc)
  const unido = (p: [string, string]) => n.has(clave(...p))
  const mismaNet = (c: Cable) => unido(c.de) && n.get(clave(...c.de)) === n.get(clave(...c.a))
  const tomados = new Set<string>(infoPlaca(doc).reservados)
  const tipoDe = (inst: string) => { const p = doc.piezas.find(x => x.id === inst); return p ? pieza(p.pieza).comportamiento.tipo : '' }
  /** El alumno ya unió `a` con otra pieza del mismo tipo que la de `b` (el LED a otra resistencia): también vale. */
  const conOtraIgual = (a: [string, string], b: [string, string]) => {
    const r = n.get(clave(...a))
    return Array.from(n.entries()).some(([k, raizNet]) => raizNet === r && k !== clave(...a) && tipoDe(k.slice(0, k.indexOf('.'))) === tipoDe(b[0]))
  }
  /** Batería, driver o protoboard: ahí es normal que lleguen varios cables al mismo pin. */
  const esBase = (inst: string) => ['bateria', 'puente-h', 'protoboard', 'mcu'].includes(tipoDe(inst))
  const out: PasoGuia[] = []
  for (const c of referencia) {
    if (mismaNet(c)) continue
    // Extremo «pieza»: el que no es la placa. Si ya tiene un cable, el alumno lo resolvió a su manera.
    const [pz, pl] = c.de[0] === mcu?.id ? [c.a, c.de] : [c.de, c.a]
    const aPlaca = pl[0] === mcu?.id
    if (aPlaca ? unido(pz) : unido(pz) && (unido(pl) || conOtraIgual(pz, pl))) continue
    let cable = c
    // La pieza que tocaba (esa resistencia) ya la usó para otra cosa: se propone otra igual que esté libre.
    if (!aPlaca && !unido(pz) && unido(pl) && !esBase(pl[0])) {
      const otra = doc.piezas.find(p => p.id !== pl[0] && p.pieza === doc.piezas.find(x => x.id === pl[0])?.pieza
        && pieza(p.pieza).pines.every(pin => !unido([p.id, pin.nombre])) && !out.some(o => o.cable.de[0] === p.id || o.cable.a[0] === p.id))
      if (otra) cable = c.de[0] === pl[0] ? { ...c, de: [otra.id, pl[1]] } : { ...c, a: [otra.id, pl[1]] }
    }
    if (aPlaca && mcu) {
      const def = pieza(mcu.pieza).pines
      const pin = def.find(p => p.nombre === pl[1])
      const senal = pin && pin.tipo !== 'alim' && pin.tipo !== 'gnd' && pin.tipo !== 'csi' && pin.tipo !== 'eth'
      if (pin && senal && (unido(pl) || tomados.has(pl[1]))) {
        const libre = def.find(p => p.tipo === pin.tipo && !n.has(clave(mcu.id, p.nombre)) && !tomados.has(p.nombre))
        if (!libre) continue
        cable = c.de[0] === mcu.id ? { ...c, de: [mcu.id, libre.nombre] } : { ...c, a: [mcu.id, libre.nombre] }
      }
      if (senal) tomados.add(cable.de[0] === mcu.id ? cable.de[1] : cable.a[1])
    }
    const a = extremo(doc, cable.de[0] === mcu?.id ? cable.a : cable.de), b = extremo(doc, cable.de[0] === mcu?.id ? cable.de : cable.a)
    const ex = explicarCable(doc, cable)
    if (!a || !b || !ex) continue
    out.push({ cable, titulo: `Conecta ${nombrePin(a)} con ${nombrePin(b)}`, porque: ex.texto, codigo: ex.codigo })
  }
  return out
}

// ---------------------------------------------------------------------------
// Qué se aprende con un proyecto
// ---------------------------------------------------------------------------

/** Lo que el alumno practica con este robot o circuito, según sus piezas. */
export function aprendizajes(doc: RobotDoc): string[] {
  const tipos = new Set(doc.piezas.map(p => pieza(p.pieza).comportamiento.tipo))
  const tiene = (...t: string[]) => t.some(x => tipos.has(x as never))
  const info = infoPlaca(doc)
  const out: string[] = []
  if (tiene('puente-h')) out.push('Mover motores con un driver (puente H): velocidad con PWM y dirección con dos pines')
  if (tiene('ir-reflectivo')) out.push('Leer sensores infrarrojos de línea y decidir hacia dónde girar')
  if (tiene('ultrasonido')) out.push('Medir distancias con ultrasonido (el tiempo que tarda el eco)')
  if (tiene('ir-obstaculo')) out.push('Detectar obstáculos con un sensor infrarrojo digital')
  if (tiene('servo')) out.push('Mover un servo a un ángulo exacto')
  if (tiene('camara')) out.push('Usar una cámara: la imagen es una tabla de números')
  if (tiene('cuadrupedo')) out.push('Dar órdenes de alto nivel a un robot con patas')
  if (tiene('arma-giratoria')) out.push('Controlar un arma con un variador (ESC) y cuidar la energía')
  if (tiene('led', 'led-rgb')) out.push('Encender LEDs con su resistencia y calcular por qué hace falta')
  if (tiene('led-rgb')) out.push('Mezclar colores con PWM')
  if (tiene('pulsador')) out.push('Leer un pulsador con INPUT_PULLUP')
  if (tiene('buzzer')) out.push('Hacer sonidos y melodías con un buzzer')
  if (tiene('potenciometro', 'ldr', 'joystick')) out.push('Leer valores analógicos (analogRead) y usarlos para controlar algo')
  if (tiene('protoboard')) out.push('Armar circuitos en la protoboard: tiras, rieles + y −')
  if (mcuDe(doc)) {
    if (info.lenguaje === 'python') out.push(`Programar la ${info.nombre} en Python`)
    else if (info.vLogica === 3.3) out.push(`Trabajar con una placa de 3,3 V (${info.nombre})`)
  } else if (tiene('protoboard')) out.push('Entender un circuito sin programa: fuente, interruptor y carga')
  if (!tiene('protoboard') && doc.piezas.length > 3) out.push('Probar el robot con física real: peso, fricción e inercia')
  return out.slice(0, 5)
}
