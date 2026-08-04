// Fixed, hand-authored SDF primitive/boolean library (standard Inigo Quilez
// distance functions). The AI-generated code only composes calls to these —
// it never writes raymarching, lighting, or primitive math itself.
export const SDF_PRIMITIVES_GLSL = `
float sdSphere(vec3 p, vec3 center, float radius) {
  return length(p - center) - radius;
}

float sdBox(vec3 p, vec3 center, vec3 halfSize) {
  vec3 q = abs(p - center) - halfSize;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox(vec3 p, vec3 center, vec3 halfSize, float radius) {
  vec3 q = abs(p - center) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - radius;
}

float sdCylinder(vec3 p, vec3 center, float radius, float height) {
  vec3 q = p - center;
  vec2 d = abs(vec2(length(q.xz), q.y)) - vec2(radius, height * 0.5);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdCone(vec3 p, vec3 center, float radius, float height) {
  vec3 q3 = p - center;
  float h = height * 0.5;
  vec2 q = vec2(length(q3.xz), q3.y);
  vec2 k1 = vec2(0.0, h);
  vec2 k2 = vec2(-radius, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? radius : 0.0), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}

float sdTorus(vec3 p, vec3 center, float majorRadius, float minorRadius) {
  vec3 q = p - center;
  vec2 t = vec2(length(q.xz) - majorRadius, q.y);
  return length(t) - minorRadius;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float radius) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - radius;
}

float opUnion(float d1, float d2) { return min(d1, d2); }
float opSubtract(float base, float cutter) { return max(base, -cutter); }
float opIntersect(float d1, float d2) { return max(d1, d2); }

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opSmoothSubtract(float base, float cutter, float k) {
  float h = clamp(0.5 - 0.5 * (base + cutter) / k, 0.0, 1.0);
  return mix(base, -cutter, h) + k * h * (1.0 - h);
}

vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 rotateX(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

vec3 rotateZ(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
}
`

export const RAYMARCH_VERTEX_SHADER = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

export function buildFragmentShader(sdfBody: string, accentColor: string) {
  return `
${SDF_PRIMITIVES_GLSL}

float sdf(vec3 p) {
${sdfBody}
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    sdf(p + e.xyy) - sdf(p - e.xyy),
    sdf(p + e.yxy) - sdf(p - e.yxy),
    sdf(p + e.yyx) - sdf(p - e.yyx)
  ));
}

varying vec3 vWorldPosition;
uniform vec3 uAccentColor;
uniform vec3 uBgColor;

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorldPosition - cameraPosition);

  float t = 0.0;
  vec3 col = uBgColor;
  bool hit = false;

  for (int i = 0; i < 96; i++) {
    vec3 p = ro + rd * t;
    float d = sdf(p);
    if (d < 0.002) { hit = true; break; }
    t += d;
    if (t > 12.0) break;
  }

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 lightDir = normalize(vec3(0.5, 0.9, 0.4));
    float diff = max(dot(n, lightDir), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
    col = uAccentColor * (0.35 + 0.65 * diff) + vec3(0.15, 0.2, 0.3) * rim;
    float ao = clamp(1.0 - float(96) * 0.0, 0.0, 1.0);
    col *= 0.85 + 0.15 * ao;
  }

  gl_FragColor = vec4(col, hit ? 1.0 : 0.0);
}
`
}

// Names the generated body is allowed to call — used for a lightweight
// server-side safety check before this text is ever compiled as a shader.
export const ALLOWED_CALLS = [
  'sdSphere', 'sdBox', 'sdRoundBox', 'sdCylinder', 'sdCone', 'sdTorus', 'sdCapsule',
  'opUnion', 'opSubtract', 'opIntersect', 'opSmoothUnion', 'opSmoothSubtract',
  'rotateX', 'rotateY', 'rotateZ',
]
