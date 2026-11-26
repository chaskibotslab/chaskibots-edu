# Piezas LEGO reales (LDraw)

Los modelos 3D de `public/ldraw/` salen de la biblioteca libre LDraw (CC BY 4.0).

1. Descargar y descomprimir https://library.ldraw.org/library/updates/complete.zip (queda una carpeta `ldraw`).
2. Robot de «Armar»: editar `ev3-robot.ldr` y ejecutar
   `node packldraw.js ev3-robot.ldr <carpeta ldraw> ../../public/ldraw/ev3-robot.mpd`
3. Piezas del «Catálogo»: `node packpiezas.js <carpeta ldraw>`
4. Medidas de una pieza (para colocarla sin que atraviese a otra): `node bbox.js <carpeta ldraw> 95658.dat`

Cada `0 STEP` del .ldr es un paso del armado (el orden debe coincidir con `PASOS` en `ConstructorEV3Real.tsx`).
