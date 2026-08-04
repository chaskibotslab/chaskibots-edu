import { NextRequest, NextResponse } from 'next/server'
import { ALLOWED_CALLS } from '@/components/AILab/sdfShaderLib'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `Eres un generador de escenas 3D en GLSL para un motor de raymarching SDF (signed distance field).

Tu ÚNICA salida debe ser el CUERPO de una función GLSL, nada más. No expliques nada. No uses bloques de código markdown. No repitas la firma de la función.

Tienes disponibles EXACTAMENTE estas funciones (ya definidas, no las redefinas):
- float sdSphere(vec3 p, vec3 center, float radius)
- float sdBox(vec3 p, vec3 center, vec3 halfSize)
- float sdRoundBox(vec3 p, vec3 center, vec3 halfSize, float radius)
- float sdCylinder(vec3 p, vec3 center, float radius, float height)
- float sdCone(vec3 p, vec3 center, float radius, float height)
- float sdTorus(vec3 p, vec3 center, float majorRadius, float minorRadius)
- float sdCapsule(vec3 p, vec3 a, vec3 b, float radius)
- float opUnion(float d1, float d2)
- float opSubtract(float base, float cutter)
- float opIntersect(float d1, float d2)
- float opSmoothUnion(float d1, float d2, float k)
- float opSmoothSubtract(float base, float cutter, float k)
- vec3 rotateY(vec3 p, float angle)
- vec3 rotateX(vec3 p, float angle)
- vec3 rotateZ(vec3 p, float angle)

Reglas:
- Coordenadas dentro de un cubo de -2.5 a 2.5 en cada eje.
- Combina varias primitivas con las operaciones booleanas para representar la descripción.
- Puedes usar variables "float" y "vec3" intermedias, y bucles "for" con límite fijo pequeño (máximo 12 iteraciones) para patrones repetidos (ej. dientes de engranaje, patas de silla).
- Termina SIEMPRE con "return <expresion>;"
- No declares la firma "float sdf(vec3 p) {", solo el cuerpo interno.
- No uses ninguna función, variable uniform, textura, ni construcción que no esté en la lista de arriba.

Ejemplo de salida válida para "una esfera con una caja encima":
float d1 = sdSphere(p, vec3(0.0, -0.5, 0.0), 1.0);
float d2 = sdBox(p, vec3(0.0, 1.0, 0.0), vec3(0.6));
return opUnion(d1, d2);`

const FORBIDDEN_TOKENS = [
  'texture', 'discard', 'while', '#include', 'sampler', 'gl_', 'uniform ', 'varying ',
  'main(', 'import', 'require(', '```',
]

function validateGlsl(code: string): { ok: boolean; reason?: string } {
  if (!code || code.length > 4000) return { ok: false, reason: 'Respuesta vacía o demasiado larga' }
  const lower = code.toLowerCase()
  for (const token of FORBIDDEN_TOKENS) {
    if (lower.includes(token.toLowerCase())) return { ok: false, reason: `Contiene un token no permitido: ${token}` }
  }
  if (!/return\s+.+;/.test(code)) return { ok: false, reason: 'No contiene un return válido' }
  // every function-call-looking identifier must be either an allowed call,
  // a GLSL builtin/keyword, or a local variable — cheap allowlist check on
  // the specific "name(" call sites we care about (our own primitives).
  const callSites = [...code.matchAll(/\b([a-zA-Z_]\w*)\s*\(/g)].map(m => m[1])
  const glslBuiltins = new Set(['vec2', 'vec3', 'vec4', 'float', 'int', 'clamp', 'mix', 'min', 'max', 'abs', 'length', 'dot', 'cos', 'sin', 'sqrt', 'pow', 'normalize', 'cross'])
  for (const name of callSites) {
    if (ALLOWED_CALLS.includes(name) || glslBuiltins.has(name)) continue
    return { ok: false, reason: `Función no permitida: ${name}` }
  }
  return { ok: true }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'La IA de generación 3D no está configurada todavía.' }, { status: 503 })
  }

  try {
    const { description } = await req.json()
    if (!description || typeof description !== 'string' || description.length > 300) {
      return NextResponse.json({ error: 'Descripción inválida' }, { status: 400 })
    }

    const hfRes = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: description },
        ],
        max_tokens: 600,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!hfRes.ok) {
      const text = await hfRes.text()
      console.error('[cad-generate] HF error', hfRes.status, text.slice(0, 300))
      return NextResponse.json({ error: 'El modelo de IA no pudo generar el modelo 3D. Intenta de nuevo.' }, { status: 502 })
    }

    const data = await hfRes.json()
    let glsl = (data.choices?.[0]?.message?.content || '').trim()

    // Defensive cleanup in case the model wraps the answer in a fence anyway.
    glsl = glsl.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim()

    const validation = validateGlsl(glsl)
    if (!validation.ok) {
      console.error('[cad-generate] validation failed:', validation.reason, '\n', glsl)
      return NextResponse.json({ error: 'La IA generó algo inválido. Intenta describirlo de otra forma.' }, { status: 502 })
    }

    return NextResponse.json({ glsl })
  } catch (err: any) {
    console.error('[cad-generate] error', err)
    return NextResponse.json({ error: err.message || 'Error inesperado' }, { status: 500 })
  }
}
