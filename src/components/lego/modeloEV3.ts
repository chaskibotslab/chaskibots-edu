/** Secuencia de armado paso a paso de un robot LEGO EV3 (base educadora). */
import type { Pieza } from './PiezasLego'

export interface PasoArmado {
  titulo: string
  instruccion: string
  piezas: Pieza[]
}

const ROJO = '#c0392b'

export const MODELO_EV3: { nombre: string; pasos: PasoArmado[] } = {
  nombre: 'Base Educadora EV3',
  pasos: [
    {
      titulo: 'Viga lateral izquierda',
      instruccion: 'Coloca la primera viga technic. Será el lado izquierdo del chasis.',
      piezas: [{ id: 'vigaI', tipo: 'viga', color: ROJO, pos: [0, 8, -24], args: [104, 8, 8] }],
    },
    {
      titulo: 'Viga lateral derecha',
      instruccion: 'Coloca la viga del lado derecho, paralela a la primera.',
      piezas: [{ id: 'vigaD', tipo: 'viga', color: ROJO, pos: [0, 8, 24], args: [104, 8, 8] }],
    },
    {
      titulo: 'Travesaños',
      instruccion: 'Une las dos vigas con dos travesaños: así el chasis queda firme.',
      piezas: [
        { id: 'traveA', tipo: 'viga', color: ROJO, pos: [-40, 8, 0], args: [8, 8, 56] },
        { id: 'traveB', tipo: 'viga', color: ROJO, pos: [36, 8, 0], args: [8, 8, 56] },
      ],
    },
    {
      titulo: 'Motor grande izquierdo',
      instruccion: 'Monta el motor grande izquierdo. Moverá la rueda de ese lado.',
      piezas: [{ id: 'motorI', tipo: 'motor', pos: [-22, 22, -24] }],
    },
    {
      titulo: 'Motor grande derecho',
      instruccion: 'Monta el motor grande derecho, igual que el otro lado.',
      piezas: [{ id: 'motorD', tipo: 'motor', pos: [-22, 22, 24] }],
    },
    {
      titulo: 'Ladrillo inteligente EV3',
      instruccion: 'Pon el ladrillo EV3 encima: es el cerebro del robot.',
      piezas: [{ id: 'brick', tipo: 'brick', pos: [-6, 46, 0] }],
    },
    {
      titulo: 'Rueda izquierda',
      instruccion: 'Coloca la rueda izquierda en el eje del motor.',
      piezas: [{ id: 'ruedaI', tipo: 'rueda', pos: [-22, 18, -40] }],
    },
    {
      titulo: 'Rueda derecha',
      instruccion: 'Coloca la rueda derecha en el eje del otro motor.',
      piezas: [{ id: 'ruedaD', tipo: 'rueda', pos: [-22, 18, 40] }],
    },
    {
      titulo: 'Rueda loca delantera',
      instruccion: 'Agrega la rueda loca al frente: deja girar al robot con libertad.',
      piezas: [{ id: 'caster', tipo: 'ruedaLoca', pos: [46, 8, 0] }],
    },
    {
      titulo: 'Sensor de color',
      instruccion: 'Monta el sensor de color mirando al piso, al frente y abajo.',
      piezas: [{ id: 'sColor', tipo: 'sensorColor', pos: [42, 12, 0] }],
    },
    {
      titulo: 'Sensor ultrasónico',
      instruccion: '¡Último paso! Pon el sensor ultrasónico al frente para medir distancias.',
      piezas: [{ id: 'sUltra', tipo: 'sensorUltra', pos: [54, 24, 0] }],
    },
  ],
}
