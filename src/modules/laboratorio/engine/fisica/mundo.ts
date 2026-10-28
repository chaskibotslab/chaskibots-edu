// Mundo físico (Rapier): el piso de la arena, sus paredes y objetos. Los
// robots se agregan aparte (robotFisico.ts) para que en el futuro (sumo,
// soccer) haya varios en el mismo mundo.

import RAPIER from '@dimforge/rapier3d-compat'
import type { ArenaDef } from '../../arenas/tipos'

export const GRAVEDADES = {
  tierra: { nombre: 'Tierra', g: 9.81 },
  luna: { nombre: 'Luna', g: 1.62 },
  marte: { nombre: 'Marte', g: 3.71 },
  cero: { nombre: 'Gravedad cero', g: 0 },
} as const
export type Gravedad = keyof typeof GRAVEDADES

let rapierListo: Promise<void> | null = null
export function iniciarRapier(): Promise<void> {
  if (!rapierListo) rapierListo = RAPIER.init()
  return rapierListo
}

/** Paso fijo de la física: 240 por segundo. */
export const SUBPASO = 1 / 240

export interface ObjetoVivo { id: string; body: RAPIER.RigidBody }

export class Mundo {
  readonly world: RAPIER.World
  readonly arena: ArenaDef
  g: number
  readonly objetos: ObjetoVivo[] = []

  constructor(arena: ArenaDef, gravedad: Gravedad) {
    this.arena = arena
    this.g = GRAVEDADES[gravedad].g
    this.world = new RAPIER.World({ x: 0, y: -this.g, z: 0 })
    this.world.timestep = SUBPASO

    if (arena.dohyo) {
      // Dohyo: cilindro con la cara de arriba en y = 0; el piso del aula, más abajo.
      const { radio, altura } = arena.dohyo
      this.world.createCollider(RAPIER.ColliderDesc.cylinder(altura / 2, radio).setTranslation(0, -altura / 2, 0).setFriction(0.8))
      this.world.createCollider(RAPIER.ColliderDesc.cuboid(20, 0.05, 20).setTranslation(0, -altura - 0.05, 0).setFriction(0.8))
    } else if (arena.mesa) {
      // Mesa: tablero del tamaño de la arena con la cara de arriba en y = 0;
      // el piso del aula queda mucho más abajo.
      this.world.createCollider(RAPIER.ColliderDesc.cuboid(arena.ancho / 2, 0.02, arena.largo / 2).setTranslation(0, -0.02, 0).setFriction(0.8))
      this.world.createCollider(RAPIER.ColliderDesc.cuboid(20, 0.05, 20).setTranslation(0, -arena.mesa.altura - 0.05, 0).setFriction(0.8))
    } else {
      // Piso: más grande que la arena, la cara de arriba en y = 0.
      this.world.createCollider(RAPIER.ColliderDesc.cuboid(20, 0.05, 20).setTranslation(0, -0.05, 0).setFriction(0.8))
    }

    if (arena.paredes) {
      const h = 0.15, e = 0.02
      const W = arena.ancho / 2, L = arena.largo / 2
      for (const [x, z, hx, hz] of [[0, -L - e, W + e, e], [0, L + e, W + e, e], [-W - e, 0, e, L + e], [W + e, 0, e, L + e]] as const) {
        this.world.createCollider(RAPIER.ColliderDesc.cuboid(hx, h / 2, hz).setTranslation(x, h / 2, z).setFriction(0.5))
      }
    }

    for (const o of arena.objetos) {
      const [a, b, c] = o.medidas
      const desc = o.forma === 'caja'
        ? RAPIER.ColliderDesc.cuboid(a / 2, b / 2, c / 2)
        : RAPIER.ColliderDesc.cylinder(b / 2, a)
      desc.setFriction(0.5)
      const yaw = o.yaw ?? 0
      const rot = { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }
      const bodyDesc = o.masaKg ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed()
      bodyDesc.setTranslation(o.x, b / 2, o.z).setRotation(rot)
      const body = this.world.createRigidBody(bodyDesc)
      if (o.masaKg) desc.setMass(o.masaKg)
      this.world.createCollider(desc, body)
      this.objetos.push({ id: o.id, body })
    }
  }

  setGravedad(gravedad: Gravedad) {
    this.g = GRAVEDADES[gravedad].g
    this.world.gravity = { x: 0, y: -this.g, z: 0 }
  }

  liberar() { this.world.free() }
}
