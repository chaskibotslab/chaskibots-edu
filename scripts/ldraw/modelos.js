// Fuente única de los robots guiados: genera los .ldr, los empaqueta en public/ldraw/*.mpd
// y escribe src/components/lego/guias.generado.ts (pasos de cada guía, en el mismo orden).
// Uso: node modelos.js <carpeta ldraw>
//
// Todas las uniones usan agujeros que coinciden de verdad (ver agujeros.js):
//  - Motor grande 95658 (origen en el eje rojo, cuerpo hacia -z):
//      brazo: agujeros de pin en eje X a y=-60, z=-40 y z=-80 (brazo de x±20)
//      cuerpo: agujeros en eje X a y=0, z=-140 y z=-180 (atraviesan x±50)
//  - Sensores EV3: agujeros en eje X a y=0, z=±20 (cuerpo de x±30), cara del sensor en -z
//  - Ladrillo 95646c01: agujeros laterales en eje X a y=0, z=±40/±60/±80 (lados en x±90)
//  - Rueda loca 92911: agujeros en eje Y a z=40, x=±20
// Unidades LDU (1 módulo = 20). Frente del robot = +z, arriba = -y, piso en y=70.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process')
const lib = process.argv[2]
if (!lib) { console.error('Uso: node modelos.js <carpeta ldraw>'); process.exit(1) }

// Orientaciones (matriz 3×3 por filas)
const I = '1 0 0 0 1 0 0 0 1'
const VERTICAL = '0 1 0 0 0 1 1 0 0'      // viga parada, agujeros a lo ancho del robot (eje X)
const EJE_Z_A_X = '0 0 1 0 1 0 -1 0 0'    // rueda / buje: su eje pasa a lo ancho del robot
const EJE_X_A_Z = '0 0 -1 0 1 0 1 0 0'    // eje o pin apuntando al frente
const AL_FRENTE = '-1 0 0 0 1 0 0 0 -1'   // sensor mirando al frente
const AL_PISO = '-1 0 0 0 0 -1 0 -1 0'    // sensor mirando al piso
const A_LO_LARGO = '0 1 0 -1 0 0 0 0 1'   // viga acostada de atrás hacia adelante, agujeros a lo ancho
const LOCA = '0 1 0 0 0 -1 -1 0 0'        // rueda loca con la bola hacia abajo y agujeros a lo ancho

const p = (color, x, y, z, m, pieza) => `1 ${color} ${x} ${y} ${z} ${m} ${pieza}`
const lados = f => [f(-1), f(1)]
const paso = (tipo, titulo, info, lineas) => ({ tipo, titulo, info, lineas })

// ── Pasos reutilizables ──
const MOTORES = [
  paso('motor_grande', 'Motor grande izquierdo', 'Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.', [p(15, -70, 0, 0, I, '95658.dat')]),
  paso('motor_grande', 'Motor grande derecho', 'El segundo motor, paralelo al primero. Cada motor mueve una rueda.', [p(15, 70, 0, 0, I, '95658.dat')]),
]
const COLA = [
  paso('rueda_loca', 'Rueda loca', 'La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.', [p(71, 0, 40, -160, LOCA, '92911c01.dat')]),
  paso('buje_medio', 'Medios bujes separadores (4)', 'Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.',
    [-140, -180].flatMap(z => lados(s => p(14, s * 15, 0, z, EJE_Z_A_X, '32123a.dat')))),
  paso('eje_8', 'Ejes de 8 (2)', 'Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!',
    [-140, -180].map(z => p(0, 0, 0, z, I, '3707.dat'))),
]
const RUEDAS = [
  paso('eje_5', 'Ejes de las ruedas (2)', 'Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.', lados(s => p(71, s * 125, 0, 0, I, '32073.dat'))),
  paso('buje_medio', 'Medios bujes de las ruedas (2)', 'Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.', lados(s => p(14, s * 105, 0, 0, EJE_Z_A_X, '32123a.dat'))),
  paso('rueda', 'Rueda izquierda', 'Llanta y neumático se meten en el eje izquierdo.', [p(71, -145, 0, 0, EJE_Z_A_X, '56908.dat'), p(0, -145, 0, 0, EJE_Z_A_X, '41897.dat')]),
  paso('rueda', 'Rueda derecha', 'La rueda derecha. Con dos ruedas motrices el robot avanza y gira.', [p(71, 145, 0, 0, EJE_Z_A_X, '56908.dat'), p(0, 145, 0, 0, EJE_Z_A_X, '41897.dat')]),
]
const VIGAS_7 = paso('viga_7', 'Vigas verticales de 7 (2)', 'Dos vigas paradas por dentro de los brazos de los motores. Sus agujeros miran de lado, igual que los del brazo.',
  lados(s => p(71, s * 40, -40, -40, VERTICAL, '32524.dat')))
const VIGAS_3 = paso('viga_3', 'Vigas verticales de 3 (2)', 'Dos vigas cortas, más atrás, también por dentro de los brazos: son el segundo apoyo del sensor.',
  lados(s => p(71, s * 40, -60, -80, VERTICAL, '32523.dat')))
const PINES_VIGA_7 = paso('pin_negro', 'Pines negros de las vigas (2)', 'Un pin negro une cada viga vertical con el brazo de su motor. El pin negro aprieta: la viga ya no gira.',
  lados(s => p(0, s * 50, -60, -40, I, '2780.dat')))
const sensorEntreBrazos = (tipo, pieza, titulo, info) => [
  paso(tipo, titulo, info, [p(15, 0, -60, -60, AL_FRENTE, pieza)]),
  paso('pin_largo', 'Pines largos azules (4)', 'Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.',
    [-40, -80].flatMap(z => lados(s => p(1, s * 40, -60, z, I, '6558.dat')))),
]
const SENSOR_IR = sensorEntreBrazos('sensor_ir', '95654.dat', 'Sensor infrarrojo', 'Va entre los brazos de los motores, mirando al frente: mide la distancia a los obstáculos.')
const SENSOR_TACTIL = sensorEntreBrazos('sensor_tactil', '95648.dat', 'Sensor táctil', 'Va entre los brazos de los motores, con el botón rojo hacia adelante.')
const SENSOR_GIRO = sensorEntreBrazos('sensor_giro', '99380.dat', 'Giroscopio', 'Va entre los brazos de los motores. Siente cuánto ha girado el robot.')
const SENSOR_COLOR = [
  paso('sensor_color', 'Sensor de color', 'Entre las dos vigas verticales, mirando al piso: verá líneas y colores.', [p(15, 0, -20, -40, AL_PISO, '95650.dat')]),
  paso('pin_negro', 'Pines negros del sensor de color (4)', 'Dos pines por lado sujetan el sensor a las vigas verticales. Con dos pines una pieza no puede girar.',
    [-40, 0].flatMap(y => lados(s => p(0, s * 30, y, -40, I, '2780.dat')))),
]
const LADRILLO = [
  paso('viga_11', 'Vigas laterales de 11 (4)', 'Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.',
    [-40, -80].flatMap(z => lados(s => p(4, s * 100, -160, z, VERTICAL, '32525.dat')))),
  paso('pin_negro', 'Pines negros de las columnas (4)', 'Un pin negro une cada columna con el brazo del motor, por fuera.',
    [-40, -80].flatMap(z => lados(s => p(0, s * 90, -60, z, I, '2780.dat')))),
  paso('brick', 'Ladrillo inteligente EV3', 'El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.', [p(15, 0, -240, -120, I, '95646c01.dat')]),
  paso('pin_negro', 'Pines negros del ladrillo (4)', 'Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!',
    [-40, -80].flatMap(z => lados(s => p(0, s * 90, -240, z, I, '2780.dat')))),
]
const PARACHOQUES = [
  paso('eje_3', 'Eje del parachoques', 'El botón rojo del sensor táctil tiene un agujero en cruz: ahí entra un eje de 3.', [p(71, 0, -100, 30, EJE_X_A_Z, '4519.dat')]),
  paso('buje', 'Buje del parachoques', 'Un buje en la punta del eje: es lo primero que toca la pared y empuja el botón.', [p(71, 0, -100, 50, I, '3713.dat')]),
]

// ── Frente con sensores de color (seguidores de 2 y 4 sensores, sumo) ──
// Dos vigas largas salen hacia adelante por dentro de los brazos (2 pines largos cada una = no giran).
// En su punta, una viga en L baja hasta cerca del piso y ahí se sujetan los sensores, lado a lado.
const vigasAdelante = (tipo, pieza, zc, largo) => paso(tipo, `Vigas de ${largo} hacia adelante (2)`, 'Dos vigas largas acostadas por dentro de los brazos de los motores, apuntando al frente. Serán los «brazos» que sostienen los sensores de línea.',
  lados(s => p(71, s * 40, -60, zc, A_LO_LARGO, pieza)))
const FRENTE_L = [
  paso('viga_L35', 'Vigas en L 3×5 (2)', 'En la punta de cada brazo, una viga en L: su parte corta se apoya en el brazo y su parte larga baja hacia el piso.',
    lados(s => p(15, s * 20, 20, 80, LOCA, '32526.dat'))),
  paso('pin_negro', 'Pines negros de las L (4)', 'Dos pines por cada L. Con dos pines la L queda rígida: no puede balancearse.',
    [40, 80].flatMap(z => lados(s => p(0, s * 30, -60, z, I, '2780.dat')))),
]
const SENSORES_2 = [
  paso('sensor_color', 'Sensores de color izquierdo y derecho (2)', 'Dos sensores mirando al piso, uno a cada lado. La línea negra pasará entre los dos.',
    lados(s => p(15, s * 60, -20, 80, AL_PISO, '95650.dat'))),
  paso('pin_negro', 'Pines negros de los sensores (4)', 'Dos pines sujetan cada sensor a su viga en L.',
    [-40, 0].flatMap(y => lados(s => p(0, s * 30, y, 80, I, '2780.dat')))),
  paso('eje_8', 'Eje de 8 que une los sensores', 'Un eje largo atraviesa el centro en cruz de los dos sensores y las dos L: todo el frente queda como una sola pieza.',
    [p(0, 0, -20, 80, I, '3707.dat')]),
]
const SENSORES_EXTRA = [
  paso('sensor_color', 'Sensores de color exteriores (2)', 'Dos sensores más, por fuera de los primeros. Con cuatro «ojos» el robot ve curvas cerradas y cruces.',
    lados(s => p(15, s * 120, -20, 80, AL_PISO, '95650.dat'))),
  paso('pin_negro', 'Pines negros entre sensores (4)', 'Cada sensor exterior se une a su vecino con dos pines, lado con lado.',
    [-40, 0].flatMap(y => lados(s => p(0, s * 90, y, 80, I, '2780.dat')))),
]
const EMBESTIDOR = [
  paso('eje_5', 'Eje del embestidor', 'Un eje de 5 cruza la punta de los dos brazos largos: es la barra que empuja al rival.', [p(71, 0, -60, 200, I, '32073.dat')]),
  paso('buje_medio', 'Medios bujes del embestidor (2)', 'Un medio buje por dentro de cada brazo para que el eje no se salga.', lados(s => p(14, s * 25, -60, 200, EJE_Z_A_X, '32123a.dat'))),
]
const VIGAS_9_ADELANTE = vigasAdelante('viga_9', '40490.dat', 0, 9)
const VIGAS_15_ADELANTE = vigasAdelante('viga_15', '32278.dat', 60, 15)

const ultimo = pasos => pasos.map((q, i) => (i === pasos.length - 1 ? { ...q, info: '¡Último! ' + q.info } : q))

const MODELOS = [
  { id: 'carrito', archivo: 'carrito', nombre: 'Carrito de dos motores', emoji: '🚗', simulable: false, lineas: [], equipo: 'Sin ladrillo ni sensores',
    descripcion: 'Tu primer chasis: dos motores unidos por ejes y bujes, rueda loca y dos ruedas.',
    pasos: [...MOTORES, ...COLA, ...RUEDAS] },
  { id: 'explorador', archivo: 'ev3-robot', nombre: 'Robot explorador EV3', emoji: '🤖', simulable: true, lineas: [0], equipo: 'Infrarrojo al frente + 1 sensor de color',
    descripcion: 'El robot completo: ladrillo, sensor infrarrojo al frente y sensor de color al piso, todo sujeto con pines.',
    pasos: [...MOTORES, ...COLA, VIGAS_7, VIGAS_3, ...SENSOR_IR, ...SENSOR_COLOR, ...LADRILLO, ...RUEDAS] },
  { id: 'seguidor', archivo: 'seguidor', nombre: 'Seguidor de línea', emoji: '〰️', simulable: true, lineas: [0], equipo: '1 sensor de color al piso',
    descripcion: 'Ladrillo y un sensor de color mirando al piso, listo para seguir una línea negra.',
    pasos: [...MOTORES, ...COLA, VIGAS_7, PINES_VIGA_7, ...SENSOR_COLOR, ...LADRILLO, ...RUEDAS] },
  { id: 'parachoques', archivo: 'parachoques', nombre: 'Robot con parachoques', emoji: '🛡️', simulable: true, lineas: [], equipo: 'Sensor táctil con parachoques',
    descripcion: 'Un sensor táctil al frente con un eje y un buje de parachoques: el robot sabe cuándo chocó.',
    pasos: [...MOTORES, ...COLA, VIGAS_7, VIGAS_3, ...SENSOR_TACTIL, ...PARACHOQUES, ...LADRILLO, ...RUEDAS] },
  { id: 'giroscopio', archivo: 'giroscopio', nombre: 'Robot con giroscopio', emoji: '🧭', simulable: true, lineas: [0], equipo: 'Giroscopio + 1 sensor de color',
    descripcion: 'Un giroscopio entre los motores para girar ángulos exactos, y sensor de color al piso.',
    pasos: [...MOTORES, ...COLA, VIGAS_7, VIGAS_3, ...SENSOR_GIRO, ...SENSOR_COLOR, ...LADRILLO, ...RUEDAS] },
  { id: 'seguidor2', archivo: 'seguidor2', nombre: 'Seguidor de 2 sensores', emoji: '👀', simulable: true, lineas: [-3.6, 3.6], equipo: '2 sensores de color al frente + infrarrojo',
    descripcion: 'Dos sensores de color al frente, uno a cada lado de la línea: sigue pistas con curvas mucho más rápido.',
    pasos: [...MOTORES, ...COLA, VIGAS_9_ADELANTE, ...SENSOR_IR, ...FRENTE_L, ...SENSORES_2, ...LADRILLO, ...RUEDAS] },
  { id: 'seguidor4', archivo: 'seguidor4', nombre: 'Seguidor de 4 sensores', emoji: '🏁', simulable: true, lineas: [-7.2, -3.6, 3.6, 7.2], equipo: '4 sensores de color al frente + infrarrojo',
    descripcion: 'Cuatro sensores de color en fila: el robot de competencia que ve curvas cerradas y cruces.',
    pasos: [...MOTORES, ...COLA, VIGAS_9_ADELANTE, ...SENSOR_IR, ...FRENTE_L, ...SENSORES_2, ...SENSORES_EXTRA, ...LADRILLO, ...RUEDAS] },
  { id: 'sumo', archivo: 'sumo', nombre: 'Robot sumo', emoji: '🥋', simulable: true, lineas: [-3.6, 3.6], equipo: 'Infrarrojo para buscar al rival + 2 sensores de borde + embestidor',
    descripcion: 'Robot de combate: infrarrojo para encontrar al rival, dos sensores para no salirse del ring y un embestidor al frente.',
    pasos: [...MOTORES, ...COLA, VIGAS_15_ADELANTE, ...SENSOR_IR, ...FRENTE_L, ...SENSORES_2, ...EMBESTIDOR, ...LADRILLO, ...RUEDAS] },
]

const salida = []
for (const m of MODELOS) {
  const pasos = ultimo(m.pasos)
  const ldr = [`0 ${m.nombre} ChaskiBots`, `0 Name: ${m.archivo}.ldr`, '0 Author: ChaskiBots (generado por modelos.js)']
  for (const q of pasos) { ldr.push(...q.lineas, '0 STEP') }
  const fLdr = path.join(__dirname, m.archivo + '.ldr')
  fs.writeFileSync(fLdr, ldr.join('\n') + '\n', 'latin1')
  const fMpd = path.join(__dirname, '../../public/ldraw', m.archivo + '.mpd')
  console.log(m.id, pasos.length, 'pasos ·', execFileSync('node', [path.join(__dirname, 'packldraw.js'), fLdr, lib, fMpd]).toString().trim())
  const iRueda = t => pasos.findIndex(q => q.titulo === t)
  salida.push({
    id: m.id, nombre: m.nombre, emoji: m.emoji, descripcion: m.descripcion, archivo: `/ldraw/${m.archivo}.mpd`, simulable: m.simulable, lineas: m.lineas, equipo: m.equipo,
    ruedas: [iRueda('Rueda izquierda'), iRueda('¡Último! Rueda derecha') >= 0 ? iRueda('¡Último! Rueda derecha') : iRueda('Rueda derecha')],
    pasos: pasos.map(q => ({ tipo: q.tipo, titulo: q.titulo, info: q.info, piezas: q.lineas.length })),
  })
}
// .ts y no .json: el repositorio ignora *.json y el archivo no llegaría al despliegue
const fJson = path.join(__dirname, '../../src/components/lego/guias.generado.ts')
fs.writeFileSync(fJson, '// GENERADO por scripts/ldraw/modelos.js — no editar a mano.\nconst datos = ' + JSON.stringify(salida, null, 2) + '\n\nexport default datos\n', 'utf8')
console.log('→', fJson)
