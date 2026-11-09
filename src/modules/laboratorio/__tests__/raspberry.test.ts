// Raspberry Pi con Python: armado y cableado de sus proyectos y, si la máquina
// tiene CPython 3.11+ (el mismo Python que Pyodide), el motor de gpiozero.
import { describe, expect, it } from 'vitest'
import { spawnSync } from 'child_process'
import { encimadas } from '../engine/ensamblaje'
import { verificar } from '../engine/verificacion'
import { planDe } from '../engine/plan'
import { infoPlaca } from '../engine/placa'
import { RUNTIME_PY } from '../engine/python/runtime'
import { PREARMADOS } from '../robots/prearmados'

const proyecto = (id: string) => PREARMADOS.find(p => p.id === id)!.construir()
const codigo = (id: string) => { const d = proyecto(id); return d.programa.modo === 'codigo' ? d.programa.cpp : '' }

/** Corre `prueba` (Python) con el motor cargado; null si no hay Python en la máquina. */
function python(prueba: string): { ok: boolean; salida: string } | null {
  const script = `import json, sys\n${RUNTIME_PY}\n${prueba}\n`
  // En Windows, «python3» puede ser el atajo de la tienda (se queda esperando): va último y con tiempo máximo.
  for (const exe of ['python', 'py', 'python3']) {
    const r = spawnSync(exe, ['-I', '-c', 'import sys; exec(sys.stdin.read())'], { input: script, encoding: 'utf8', timeout: 20_000 })
    if (r.error || /no se encontr|not found|Microsoft Store/i.test(r.stderr ?? '')) continue
    return { ok: r.status === 0, salida: `${r.stdout}${r.stderr}` }
  }
  return null
}
const hayPython = python('print(sys.version_info >= (3, 11))')?.salida.trim() === 'True'

describe('Raspberry Pi: armado', () => {
  it('los tres proyectos se arman sin choques ni errores de cableado y programan en Python', () => {
    for (const id of ['rpi-seguidor', 'rpi-semaforo', 'rpi-distancia']) {
      const d = proyecto(id)
      expect(infoPlaca(d).lenguaje, id).toBe('python')
      expect(encimadas(d), id).toEqual([])
      expect(verificar(d).filter(p => p.nivel !== 'ok'), id).toEqual([])
      expect(planDe(d).avisos, id).toEqual([])
    }
  })

  it('el seguidor usa los pines BCM del cableado en su código', () => {
    const p = planDe(proyecto('rpi-seguidor'))
    expect(p.lineas.map(l => l.pinDigital)).toEqual(['GPIO17', 'GPIO27'])
    const c = codigo('rpi-seguidor')
    for (const m of p.motores) for (const pin of [m.en, m.inA, m.inB]) expect(c).toContain(`=${pin!.replace('GPIO', '')}`)
  })
})

describe.skipIf(!hayPython)('Raspberry Pi: motor de Python (gpiozero)', () => {
  it('sleep() va al ritmo de la simulación y es exacto', () => {
    const r = python(`
assert _cargar(${JSON.stringify(codigo('rpi-semaforo'))}) is None
luces = []
for i in range(60 * 12):
    p = _avanzar(1/60, {}, {'GPIO26': [True, True]})['pines']
    luz = 'V' if p['GPIO22']['level'] else 'A' if p['GPIO27']['level'] else 'R' if p['GPIO17']['level'] else '-'
    if not luces or luces[-1][0] != luz: luces.append((luz, round(i / 60, 2)))
print(json.dumps(luces))
`)!
    expect(r.ok, r.salida).toBe(true)
    const luces = JSON.parse(r.salida.trim().split('\n').pop()!) as [string, number][]
    expect(luces.map(l => l[0])).toEqual(['V', 'A', 'R', 'V'])
    // Verde 5 s, amarillo 1,5 s, rojo 4 s (± un cuadro de la simulación).
    luces.forEach(([, t], i) => expect(Math.abs(t - [0, 5, 6.5, 10.5][i])).toBeLessThan(1 / 60 + 0.006))
  })

  it('el seguidor obedece a sus sensores y un bucle sin sleep() se detecta', () => {
    const r = python(`
assert _cargar(${JSON.stringify(codigo('rpi-seguidor'))}) is None
p = _avanzar(1/60, {'GPIO17': False, 'GPIO27': False})['pines']
assert abs(p['GPIO12']['duty'] - 0.6) < 1e-9 and p['GPIO5']['level'] == 1, p
p = _avanzar(1/60, {'GPIO17': True, 'GPIO27': False})['pines']
assert p['GPIO6']['level'] == 1 and p['GPIO16']['level'] == 1, p
assert _cargar("x = 0\\nwhile True:\\n    x += 1\\n") is None
r = _avanzar(1/60)
assert 'sleep' in r['error'] and r['terminado'], r
assert 'Línea 1' in _cargar("while True\\n  pass")
print('ok')
`)!
    expect(r.ok, r.salida).toBe(true)
  })
})
