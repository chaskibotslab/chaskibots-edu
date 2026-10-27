// Traduce los mensajes más comunes de avr-gcc a explicaciones para el alumno.
// Si no hay traducción, deja el mensaje original (en inglés).

const REGLAS: [RegExp, (m: RegExpExecArray) => string][] = [
  [/expected ';' before/, () => 'Falta un punto y coma (;) al final de la línea anterior'],
  [/expected ';'/, () => 'Falta un punto y coma (;)'],
  [/'(.+?)' was not declared in this scope/, m => `«${m[1]}» no existe: revisa cómo lo escribiste (mayúsculas incluidas) o declárala antes de usarla`],
  [/expected '\}' at end of input/, () => 'Falta cerrar una llave } (cada { necesita su })'],
  [/expected declaration before '\}' token/, () => 'Sobra una llave } o falta una {'],
  [/expected '\)' before/, () => 'Falta cerrar un paréntesis )'],
  [/expected primary-expression before '(.+?)'/, m => `Algo falta antes de «${m[1]}»`],
  [/'(.+?)' does not name a type/, m => `«${m[1]}» no es un tipo conocido: ¿falta un #include o está mal escrito?`],
  [/redefinition of '(.+?)'/, m => `«${m[1]}» está definido dos veces`],
  [/too few arguments to function '(.+?)'/, m => `A la función «${m[1]}» le faltan datos entre los paréntesis`],
  [/too many arguments to function '(.+?)'/, m => `A la función «${m[1]}» le sobran datos entre los paréntesis`],
  [/(\S+\.h): No such file or directory/, m => `La librería ${m[1]} no está disponible en el laboratorio`],
  [/stray '\\(\d+)' in program/, () => 'Hay un carácter raro (comillas tipográficas o un símbolo copiado de otra parte): escríbelo de nuevo'],
  [/missing terminating " character/, () => 'Falta cerrar unas comillas "'],
  [/lvalue required as left operand of assignment/, () => 'Para comparar usa == (con un solo = estás asignando)'],
  [/undefined reference to `(setup|loop)'/, m => `Falta la función ${m[1]}(): todo programa de Arduino necesita setup() y loop()`],
]

export function explicarError(mensaje: string): string {
  for (const [re, f] of REGLAS) {
    const m = re.exec(mensaje)
    if (m) return f(m)
  }
  return mensaje
}
