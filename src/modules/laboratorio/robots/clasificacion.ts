// Cómo se ordena la galería: a cada proyecto le toca un grupo de su sección.

const POR_GRUPO: Record<string, string[]> = {
  // Robots
  'Motores y chasis': ['primeros-motores'],
  'Minisumo autónomo': ['minisumo', 'minisumo-esp32'],
  'Radiocontrol (RC)': ['minisumo-rc', 'rc-esp32', 'robo-wifi'],
  'Battlebots (combate)': ['battlebot-rc', 'battlebot-auto'],
  'Seguidores de línea': ['seguidor', 'seguidor-freno', 'seguidor-esp32'],
  'Obstáculos y exploración': ['evita-ir', 'evita-obstaculos', 'anticaida', 'aspirador', 'explorador', 'laberinto'],
  // Electrónica
  Luces: ['led-pila', 'dos-pilas', 'primer-led', 'tres-brillos', 'tres-leds', 'fade', 'super-maquina', 'rgb', 'led-tapa', 'pico-parpadeo', 'mega-barra'],
  Semáforos: ['semaforo-carros', 'semaforo-cruce', 'semaforo-peatones', 'semaforo'],
  'Entradas y sonido': ['boton-sin-arduino', 'pulsador-led', 'buzzer', 'pot-brillo', 'pico-perilla', 'luz-nocturna', 'joystick-leds', 'reflejos'],
  'Distancia y servos': ['mide-distancia', 'estacionamiento', 'alarma-proximidad', 'contador-personas', 'mueve-servo', 'puerta-automatica', 'dispensador', 'basurero'],
}

export const GRUPOS = Object.keys(POR_GRUPO)

export function grupoDe(id: string): string | null {
  return GRUPOS.find(g => POR_GRUPO[g].includes(id)) ?? null
}

/** Dentro de un grupo, del más fácil al más difícil (el orden de la lista). */
export function ordenEnGrupo(id: string): number {
  const g = grupoDe(id)
  return g ? POR_GRUPO[g].indexOf(id) : 999
}
