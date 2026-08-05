import { NextRequest, NextResponse } from 'next/server'
import { ALLOWED_CALLS, GLSL_KEYWORDS } from '@/components/AILab/sdfShaderLib'

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
- float sdEllipsoid(vec3 p, vec3 center, vec3 radii)
- float sdOctahedron(vec3 p, vec3 center, float size)
- float sdHexPrism(vec3 p, vec3 center, float radius, float height)
- float opUnion(float d1, float d2)
- float opSubtract(float base, float cutter)
- float opIntersect(float d1, float d2)
- float opSmoothUnion(float d1, float d2, float k)
- float opSmoothSubtract(float base, float cutter, float k)
- float opRound(float d, float r)  — redondea los bordes de cualquier forma
- float opOnion(float d, float thickness) — convierte una forma sólida en una cáscara hueca
- vec3 rotateY(vec3 p, float angle)
- vec3 rotateX(vec3 p, float angle)
- vec3 rotateZ(vec3 p, float angle)

Reglas:
- Coordenadas dentro de un cubo de -2.5 a 2.5 en cada eje.
- Combina varias primitivas con las operaciones booleanas para representar la descripción.
- Puedes usar variables "float" y "vec3" intermedias, y bucles "for" con límite fijo pequeño (máximo 12 iteraciones) para patrones repetidos (ej. dientes de engranaje, patas de silla).
- Termina SIEMPRE con "return <expresion>;"
- No declares la firma "float sdf(vec3 p) {", solo el cuerpo interno.
- No uses NINGUNA función que no esté en la lista de arriba (ni siquiera si existe en GLSL estándar, como sdPlane, sdCross, opRepeat, etc. — si no está en la lista, no existe para ti). Si la descripción necesita algo que no puedes representar exactamente, aproxímalo combinando las formas disponibles.
- No existen variables de tiempo/animación. NUNCA uses iTime, time, u_time, iResolution, iMouse, ni ninguna variable que no hayas declarado tú mismo con "float" o "vec3" en el propio cuerpo. Todo debe ser estático (sin animación).

Ejemplo de salida válida para "una esfera con una caja encima":
float d1 = sdSphere(p, vec3(0.0, -0.5, 0.0), 1.0);
float d2 = sdBox(p, vec3(0.0, 1.0, 0.0), vec3(0.6));
return opUnion(d1, d2);`

const FORBIDDEN_TOKENS = [
  'texture', 'discard', 'while', '#include', 'sampler', 'gl_', 'uniform ', 'varying ',
  'main(', 'import', 'require(', '```',
  // Common Shadertoy-style globals the model sometimes hallucinates —
  // none of these are declared in our shader, so referencing them is a
  // compile error the regex-based call-site check below can't catch
  // (they're bare identifiers, not function calls).
  'itime', 'iresolution', 'imouse', 'iframe', 'ichannel', 'u_time', 'u_resolution',
]

const GLSL_BUILTINS = new Set([
  'vec2', 'vec3', 'vec4', 'float', 'int', 'clamp', 'mix', 'min', 'max', 'abs',
  'length', 'dot', 'cos', 'sin', 'sqrt', 'pow', 'normalize', 'cross', 'sign', 'floor', 'mod',
])

function validateGlsl(code: string): { ok: boolean; reason?: string } {
  if (!code || code.length > 4000) return { ok: false, reason: 'Respuesta vacía o demasiado larga' }
  const lower = code.toLowerCase()
  for (const token of FORBIDDEN_TOKENS) {
    if (lower.includes(token.toLowerCase())) return { ok: false, reason: `Contiene un token no permitido: ${token}` }
  }
  if (!/return\s+.+;/.test(code)) return { ok: false, reason: 'No contiene un return válido' }
  // Every "identifier(" call site must be an allowed primitive/operator, a
  // GLSL builtin, or a control-flow keyword (for/if/while all look like
  // calls to this regex) — anything else is a hallucinated function name.
  const callSites = [...code.matchAll(/\b([a-zA-Z_]\w*)\s*\(/g)].map(m => m[1])
  for (const name of callSites) {
    if (ALLOWED_CALLS.includes(name) || GLSL_BUILTINS.has(name) || (GLSL_KEYWORDS as readonly string[]).includes(name)) continue
    return { ok: false, reason: `Función no permitida: ${name}` }
  }
  return { ok: true }
}

async function callModel(apiKey: string, messages: { role: string; content: string }[]) {
  const hfRes = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3',
      messages,
      max_tokens: 600,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!hfRes.ok) {
    const text = await hfRes.text()
    console.error('[cad-generate] HF error', hfRes.status, text.slice(0, 300))
    return null
  }

  const data = await hfRes.json()
  let glsl = (data.choices?.[0]?.message?.content || '').trim()
  // Defensive cleanup in case the model wraps the answer in a fence anyway.
  glsl = glsl.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim()
  return glsl
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

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: description },
    ]

    let glsl = await callModel(apiKey, messages)
    if (glsl === null) {
      return NextResponse.json({ error: 'El modelo de IA no pudo generar el modelo 3D. Intenta de nuevo.' }, { status: 502 })
    }

    let validation = validateGlsl(glsl)

    // One automatic retry with corrective feedback — most failures are a
    // single hallucinated function name, which the model fixes reliably
    // when told exactly what's wrong.
    if (!validation.ok) {
      console.error('[cad-generate] validation failed (attempt 1):', validation.reason)
      messages.push({ role: 'assistant', content: glsl })
      messages.push({
        role: 'user',
        content: `Error: ${validation.reason}. Recuerda que SOLO puedes usar las funciones listadas en las instrucciones. Corrige tu respuesta y devuelve de nuevo SOLO el cuerpo de la función GLSL.`,
      })
      glsl = await callModel(apiKey, messages)
      if (glsl === null) {
        return NextResponse.json({ error: 'El modelo de IA no pudo generar el modelo 3D. Intenta de nuevo.' }, { status: 502 })
      }
      validation = validateGlsl(glsl)
    }

    if (!validation.ok) {
      console.error('[cad-generate] validation failed (attempt 2):', validation.reason, '\n', glsl)
      return NextResponse.json({ error: 'La IA generó algo inválido incluso tras reintentar. Intenta describirlo de otra forma.' }, { status: 502 })
    }

    return NextResponse.json({ glsl })
  } catch (err: any) {
    console.error('[cad-generate] error', err)
    return NextResponse.json({ error: err.message || 'Error inesperado' }, { status: 500 })
  }
}
