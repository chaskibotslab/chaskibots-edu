/**
 * Prueba automática de las clases del EV3: ejecuta la solución de cada actividad a toda
 * velocidad (sin dibujar nada) y dice si se logra. Solo para desarrollo: no la usa la app.
 *
 * Uso: desde una página temporal, `await probarSoluciones()` en el navegador (necesita canvas).
 * `pasosPorCuadro` imita una máquina lenta o la simulación acelerada (×2, ×4): el programa
 * solo «despierta» cada tantos pasos de física. Una solución buena pasa con 1, 2 y 4.
 */
import { LegoMotor } from './engine'
import { crearApiEV3 } from './apiEV3'
import { definirBloquesEV3, crearGeneradorEV3 } from './bloquesEV3'
import { MISIONES_EV3 } from './misionesEV3'
import { GUIAS } from './guiasEV3'
import { crearTapete } from './tapete'

const AsyncFunction = Object.getPrototypeOf(async function () { /* molde */ }).constructor

export interface ResultadoPrueba { id: string; logrado: boolean; segundos: number; nota: string }

export async function probarSoluciones(pasosPorCuadro = 1, soloId?: string, maxSeg = 150): Promise<ResultadoPrueba[]> {
  const Blockly: any = await import('blockly')
  const jsMod: any = await import('blockly/javascript')
  definirBloquesEV3(Blockly)
  const gen = crearGeneradorEV3(jsMod)
  // ceder el control sin esperar al reloj (un setTimeout tarda 4 ms; esto, casi nada)
  const canal = new MessageChannel()
  let seguir: (() => void) | null = null
  canal.port1.onmessage = () => { const f = seguir; seguir = null; f?.() }
  const ceder = () => new Promise<void>(ok => { seguir = ok; canal.port2.postMessage(0) })

  const resultados: ResultadoPrueba[] = []
  for (const m of MISIONES_EV3) {
    if (soloId ? m.id !== soloId : m.id === 'libre') continue
    let nota = ''
    let logrado = false
    const motor = new LegoMotor()
    try {
      const ws = new Blockly.Workspace()
      Blockly.serialization.workspaces.load(m.solucion, ws)
      const codigo: string = gen.workspaceToCode(ws)
      ws.dispose()
      motor.lineas = GUIAS.find(g => g.id === m.robot)?.lineas || [0]
      motor.alError = t => { nota = t }
      const t = crearTapete(m.tapete)
      motor.leerColorEn = t.color; motor.leerLuzEn = t.luz
      motor.cargar(m.tapete)
      const token = motor.nuevaEjecucion()
      motor.alPaso = () => {
        if (m.logro(motor)) { logrado = true; motor.detener() }
        else if (motor.caido) { nota = 'se salió del ring'; motor.detener() }
      }
      let terminado = false
      new AsyncFunction('api', codigo)(crearApiEV3(motor, token))
        .catch((e: any) => { if (e?.name !== 'Detenido') nota = String(e?.message || e) })
        .finally(() => { terminado = true })
      const traza: string[] | undefined = (globalThis as any).__traza
      let prox = 0
      while (motor.activo && !terminado && motor.tiempo < maxSeg) {
        if (traza && motor.tiempo >= prox) { prox += 0.5; traza.push(`${motor.tiempo.toFixed(1)} R ${motor.x.toFixed(0)},${motor.z.toFixed(0)} a${Math.round(motor.ang * 57.3)} v${motor.vL.toFixed(0)},${motor.vR.toFixed(0)} d${motor.distancia()} ` + motor.moviles.map(o => `${o.x.toFixed(0)},${o.z.toFixed(0)}${o.fuera ? 'F' : ''}`).join(' ')) }
        for (let i = 0; i < pasosPorCuadro && motor.activo; i++) motor.tick()
        await ceder()
      }
      if (motor.activo) {
        motor.vL = motor.vR = 0
        if (m.logro(motor)) logrado = true
        else if (!nota) nota = terminado ? 'el programa terminó sin lograrlo' : 'se acabó el tiempo'
        motor.detener()
      }
    } catch (e: any) { nota = 'error: ' + (e?.message || e) }
    resultados.push({ id: m.id, logrado, segundos: Math.round(motor.tiempo * 10) / 10, nota: nota + ` (x=${motor.x.toFixed(0)} z=${motor.z.toFixed(0)} puntos=${motor.puntosHechos} golpes=${motor.golpes})` })
  }
  canal.port1.close()
  return resultados
}
