// ============================================
// TEST - renderTheory de LinuxTerminal (panel de Lecciones / Academy)
// ============================================

import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderTheory } from '@/components/activities/LinuxTerminal'

describe('LinuxTerminal renderTheory', () => {
  it('renders headers, bold and inline code from the lesson theory markdown', () => {
    const theory = [
      '# La Terminal de Linux',
      '## El Shell (Bash)',
      'Usa **control total** del sistema con `pwd` y `ls`.',
      '- Primer punto',
      '- Segundo punto',
    ].join('\n')

    const html = renderToStaticMarkup(<>{renderTheory(theory)}</>)

    expect(html).toContain('<h1')
    expect(html).toContain('La Terminal de Linux')
    expect(html).toContain('<h2')
    expect(html).toContain('El Shell (Bash)')
    expect(html).toContain('<strong')
    expect(html).toContain('control total')
    expect(html).toContain('<code')
    expect(html).toContain('>pwd<')
    expect((html.match(/<li/g) || [])).toHaveLength(2)
  })

  it('skips markdown table rows and fenced code delimiters', () => {
    const theory = ['```bash', '```', '| Comando | Función |', '| --- | --- |'].join('\n')
    const html = renderToStaticMarkup(<>{renderTheory(theory)}</>)
    expect(html.replace(/<[^>]+>/g, '').trim()).toBe('')
  })
})
