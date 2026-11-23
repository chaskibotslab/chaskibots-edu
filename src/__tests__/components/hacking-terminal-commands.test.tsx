// ============================================
// TEST - procesador de comandos de HackingTerminal
// Cubre lo nuevo: tuberías (|), redirección (>), man real y comandos de red.
// ============================================

import { describe, it, expect } from 'vitest'
import { processCommand, dividirPipes } from '@/components/activities/HackingTerminal'

// Ayudante: corre un comando y devuelve el texto de cada línea de salida.
function run(cmd: string, cwd = '/home/hacker') {
  const noop = () => {}
  return processCommand(cmd, cwd, noop, [], false, []).map(l => l.text)
}

describe('dividirPipes', () => {
  it('separa por | respetando comillas', () => {
    expect(dividirPipes('cat x | grep a | wc -l')).toEqual(['cat x', 'grep a', 'wc -l'])
    expect(dividirPipes('echo "a | b" | grep a')).toEqual(['echo "a | b"', 'grep a'])
  })
})

describe('tuberías y filtros', () => {
  it('cat | grep filtra líneas del archivo', () => {
    const out = run('cat /etc/passwd | grep bash')
    expect(out.some(l => l.includes('root'))).toBe(true)
    expect(out.some(l => l.includes('nologin'))).toBe(false)
  })

  it('cat | wc -l cuenta las líneas', () => {
    const total = run('cat /etc/passwd').length
    const out = run('cat /etc/passwd | wc -l')
    expect(out).toEqual([String(total)])
  })

  it('grep -v invierte y grep -c cuenta', () => {
    const sinNologin = run('cat /etc/passwd | grep -v nologin')
    expect(sinNologin.some(l => l.includes('nologin'))).toBe(false)
    const c = run('cat /etc/passwd | grep -c root')
    expect(Number(c[0])).toBeGreaterThanOrEqual(1)
  })

  it('cut -d : -f 1 extrae el primer campo', () => {
    const out = run('cat /etc/passwd | cut -d : -f 1')
    expect(out).toContain('root')
    expect(out).toContain('hacker')
  })

  it('sort | uniq -c agrupa y cuenta', () => {
    const out = run('cat /home/hacker/wordlists/subdomains.txt | sort | uniq -c')
    expect(out.length).toBeGreaterThan(0)
    expect(out[0]).toMatch(/^\s*\d+\s/)
  })

  it('head -n y tail -n respetan el número', () => {
    expect(run('cat /etc/passwd | head -n 2')).toHaveLength(2)
    expect(run('cat /etc/passwd | tail -n 1')).toHaveLength(1)
  })
})

describe('redirección simulada', () => {
  it('> archivo no rompe y avisa', () => {
    const out = run('echo "hola" > salida.txt')
    expect(out.some(l => l.includes('hola'))).toBe(true)
    expect(out.some(l => l.includes('salida.txt'))).toBe(true)
  })
})

describe('man real', () => {
  it('devuelve nombre, uso y ejemplo de un comando conocido', () => {
    const out = run('man grep').join('\n')
    expect(out).toContain('NOMBRE')
    expect(out).toContain('USO')
    expect(out).toContain('EJEMPLO')
  })
  it('avisa cuando no hay manual', () => {
    expect(run('man inventado').join(' ')).toMatch(/No hay manual/)
  })
})

describe('url-check (phishing para principiantes)', () => {
  it('detecta un dominio falso parecido al oficial', () => {
    const out = run('url-check http://targ3t-corp.com/login').join('\n')
    expect(out).toMatch(/PHISHING|trampa|imita/i)
  })
  it('aprueba el sitio oficial con https', () => {
    const out = run('url-check https://target-corp.com').join('\n')
    expect(out).toMatch(/OFICIAL|seguro/i)
  })
  it('avisa cuando no usa https', () => {
    const out = run('url-check http://target-corp.com').join('\n')
    expect(out).toMatch(/HTTPS/i)
  })
})

describe('comandos de red nuevos', () => {
  it('ping -c 2 produce 2 respuestas', () => {
    const out = run('ping -c 2 10.0.0.10')
    expect(out.filter(l => l.includes('icmp_seq'))).toHaveLength(2)
  })
  it('traceroute llega al objetivo', () => {
    expect(run('traceroute target-corp.com').join('\n')).toContain('10.0.0.10')
  })
  it('lastb muestra intentos fallidos', () => {
    expect(run('lastb').join('\n')).toMatch(/fuerza bruta|10.0.0.99/)
  })
})
