# Laboratorio: 3D realista y funcional

Fecha: 2026-11-11. Sub-proyecto aprobado por el usuario («si sigue») con el orden A → B → C.

## Problema

El laboratorio simula bien (AVR emulado, Rapier, Pyodide) pero se ve «de juguete»:

- El entorno es un plano gris con cuadrícula de CAD, niebla gris y paredes blancas planas. No hay sala, texturas ni reflejos. Es lo que más pesa en la impresión visual.
- Solo 12 piezas usan modelos reales (GLB). Motor TT, chasis, baterías, sensores IR, ruedas y piezas de combate, N20 y el perro son cajas de colores planos con el mismo material mate.
- Los cables son arcos altos de seis colores por encima del robot.
- Los obstáculos son cubos de colores; el dohyo, dos cilindros; la arena de combate, un piso gris. El laberinto y la sala no se parecen a lo que nombran.
- En Probar no se ve qué «ven» los sensores, no hay cámara desde el robot, el robot se coloca con doble clic y no hay cámara lenta.

Objetivo del usuario: «el mejor simulador de robótica», profesional, aplicable, que funcione mejor.

## Decisiones

1. Tres bloques, cada uno con su commit, tests y publicación: **A** entorno y materiales, **B** piezas realistas por código, **C** 3D funcional en Probar. El bloque **D** (modelos GLB de Sketchfab: robots profesionales y de combate) espera el token en `.env.local` y queda fuera.
2. Todo lo visual se genera por código (texturas procedurales en canvas, geometría paramétrica). No se descargan mapas HDR ni texturas: el laboratorio sigue funcionando sin red y sin licencias nuevas.
3. **La física no cambia por el aspecto.** Los colisionadores del catálogo quedan iguales (el motor TT conserva su colisionador viejo; ver gotcha en memoria). Los tests de lazo cerrado (`proyectos.test.ts`, `battlebots.test.ts`, `velocidad.test.ts`, `perro.test.ts`) son la red de seguridad.
4. La calidad adaptable (`ui/calidad.ts`) decide cuánto se dibuja: oclusión ambiental y antialiasing por postprocesado solo en «alta» y «media»; texturas más chicas y sin normal map en «baja». El resultado de la simulación nunca depende de la calidad.
5. Dependencias nuevas permitidas (se agregan, no se actualizan): `@react-three/postprocessing`, `postprocessing`, `n8ao`.

## Bloque A — Entorno y materiales

### Arquitectura

Carpeta nueva `src/modules/laboratorio/ui/entorno/`:

| Archivo | Qué hace |
|---|---|
| `texturas.ts` | Texturas procedurales en canvas, con caché por clave: `melamina(color)`, `mdf()`, `madera(tono)`, `aceroEstriado()`, `goma()`, `carton()`, `tapeteCorte()`, `pisoAula()`. Cada una devuelve `{ map, roughnessMap?, normalMap? }` con `RepeatWrapping`, `SRGBColorSpace` en el color y anisotropía. Si no hay `document` (tests), devuelven `null`. |
| `Entorno.tsx` | `Sala` (piso del aula de vinilo claro con juntas, paredes lejanas pintadas con rodapié, sin niebla), `Luces` (clave cálida + relleno + hemisferio), `Estudio` (Lightformers, como hoy) y `Efectos` (N8AO + SMAA según calidad). |
| `Arena3D.tsx` | `Piso` (material por `piso.material`: melamina, mdf, metal → acero estriado; con `pista` usa la textura del mapa como hoy), `Paredes` (bajas: MDF con canto; altas: paneles de policarbonato con postes de aluminio y zócalo de acero), `Dohyo` (goma negra con brillo suave, aro de cinta blanca, shikiri), `Pozo` (como hoy + luces rojas de peligro), `Meta`, `MesaElevada` (tablero de melamina con patas de acero). |
| `Objetos3D.tsx` | `Objeto` dibuja cada `ObjetoArena` según su `aspecto`: `carton` (caja kraft con cinta), `pared-mdf`, `barrera` (roja y blanca), `sofa` (asiento + respaldo + brazos, tela), `mueble` (madera con puertas), `maceta` (terracota + planta), `pata-madera`, `pata-metal`. Sin `aspecto`, caja o cilindro con el color de siempre. |
| `Mesa3D.tsx` | Mesa de trabajo del taller y de la mesa de electrónica: tablero de madera clara con tapete de corte verde (cuadrícula de 1 cm y 5 cm, la misma función que la cuadrícula de hoy) sobre el piso del aula. |

`ObjetoArena` gana el campo opcional `aspecto` y `arenas/index.ts` lo asigna (cajas del campo libre → `carton`, paredes del laberinto → `pared-mdf`, barrera del óvalo → `barrera`, sala → `sofa`/`mueble`/`maceta`/patas).

`Escena3D.tsx` queda como orquestador: `EscenaTaller` y `EscenaArena` componen `Sala`, `Luces`, `Estudio`, `Efectos`, `Piso`/`Mesa3D`, `Paredes`, objetos, robot, rastro y cámara. Se eliminan `gridHelper`, la niebla y los materiales planos.

### Calidad

`Calidad` gana `ao: boolean` (alta, media), `aa: 'smaa' | 'msaa' | 'ninguno'` y `texturas: 512 | 1024 | 2048`. `Efectos` no se monta en «baja».

### Tests

- `entorno.test.ts`: cada arena de `listaArenas()` tiene objetos con `aspecto` válido o sin él; `aspectoDe(objeto)` elige el valor por defecto correcto; las funciones de `texturas.ts` devuelven `null` sin `document` y las claves de caché son estables.
- Se vuelven a correr `proyectos`, `battlebots`, `velocidad`, `perro`, `minisumo` (la física no se toca; deben seguir verdes).

## Bloque B — Piezas realistas por código

Reescritura de los modelos procedurales en `ui/modelos/Piezas3D.tsx`, divididos por familia para que cada archivo quepa en contexto:

| Archivo nuevo | Piezas |
|---|---|
| `modelos/Movimiento3D.tsx` | Motor TT (caja reductora amarilla con perfil real, tapa con tornillos, engranaje blanco visible, lata del motor con terminales), N20 (lata metálica + caja reductora), ruedas 65/48/34 (llanta amarilla con rayos, goma con dibujo), rueda loca real (horquilla + bola + separadores), servo SG90/MG90S y brazo (si no hay GLB). |
| `modelos/Chasis3D.tsx` | Chasis 2WD/4WD acrílico con bordes redondeados, ranuras reales y transmisión; piso de arriba; chasis minisumo con pala; chasis de combate en aluminio anodizado y UHMW con pernos a la vista. |
| `modelos/Energia3D.tsx` | 2×18650 con porta y etiquetas, 9 V con terminal, LiPo 2S con cables y conector. |
| `modelos/Sensores3D.tsx` | TCRT5000 y FC-51 con PCB, componentes, LED indicador y potenciómetro; CSI; HC-SR04 solo si falta GLB. |
| `modelos/Combate3D.tsx` | Motor de combate, rueda de combate, tambor y disco con dientes mecanizados y eje. |
| `modelos/Perro3D.tsx` | Cuerpo redondeado con paneles, articulaciones con carcasas de motor, pies de goma. |

`Piezas3D.tsx` conserva solo los materiales comunes, `anclaPin`, `salidaPin`, `ModeloGlb` y re-exporta el resto, así `Robot3D.tsx` no cambia sus imports.

Cables (`Robot3D.tsx`): salen bajos, se agrupan por destino (cinta Dupont) y el color sigue la función: rojo alimentación, negro tierra, el resto en una paleta de seis tonos sobrios. Los puntos de anclaje no cambian.

Al terminar B se regeneran las miniaturas (`public/lab/miniaturas/*.webp`) con la ruta temporal de desarrollo que ya se usó, y se borra.

Tests: `placasNuevas.test.ts` (todos los pines con ancla) y los de lazo cerrado deben seguir verdes; un test de montaje por familia comprueba que cada `modelo` del catálogo tiene componente (sin WebGL: solo que el `switch` no cae al cubo magenta).

## Bloque C — 3D funcional en Probar

- **Ver sensores** (botón «Sensores» en la barra de Probar, recordado en `localStorage`): cono del HC-SR04 hasta la distancia medida, mancha de cada IR en el piso (verde si ve blanco, gris si ve negro), pirámide de la cámara CSI con su huella en el piso. Fuente: `sim.lecturasActuales` y `sim.plan`.
- **Cámara «robot»**: nuevo `ModoCamara = 'robot'`, montada en el frente del chasis a la altura del sensor más alto, mirando adelante. En el menú Escena.
- **Arrastrar el robot**: con el programa detenido o pausado, arrastrar el robot lo mueve por el piso (raycast al plano), la rueda del mouse sobre él lo gira en pasos de 15°. Doble clic sigue funcionando. Mientras corre, un aviso corto dice que primero pause.
- **Cámara lenta**: ×1, ×0,5, ×0,25 en el menú Escena. Solo escala el `dt` que recibe `Simulacion`; el emulador recibe los ciclos correspondientes, así que sigue sincronizado.
- **Marcas de choque**: cuando la velocidad cae más de 0,4 m/s en un paso contra un objeto, se dibuja una marca que se desvanece en 3 s.

Tests con `@testing-library/react` como los de `Probar.test.tsx`: el botón Sensores conmuta y persiste; el modo robot aparece en el menú; cámara lenta llama a la simulación con el factor; arrastrar con programa corriendo muestra el aviso.

## Fuera de alcance

- Bloque D (GLB de Sketchfab, robots profesionales) hasta tener el token.
- Cambios de física, catálogo de colisionadores o reglamentos.
- Sub-proyecto 2 (biblioteca de proyectos curada).
