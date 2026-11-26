# Piezas LEGO reales (LDraw)

Los modelos 3D de `public/ldraw/` salen de la biblioteca libre LDraw (CC BY 4.0).

1. Descargar y descomprimir https://library.ldraw.org/library/updates/complete.zip (queda una carpeta `ldraw`).
2. Robots guiados (Armar, guías del Catálogo y Programar): editar `modelos.js` y ejecutar
   `node modelos.js <carpeta ldraw>`. Genera los `.ldr`, los `.mpd` de `public/ldraw/` y
   `src/components/lego/guias.generado.ts` (los pasos de cada guía). No editar esos archivos a mano.
3. Piezas del «Catálogo»: `node packpiezas.js <carpeta ldraw>`
4. Medidas de una pieza: `node bbox.js <carpeta ldraw> 95658.dat`
5. Agujeros de una pieza (para unir con pines y ejes de verdad): `node agujeros.js <carpeta ldraw> 95658.dat`

Regla de las uniones: dos piezas solo se unen si tienen agujeros en la misma línea y pegados;
ahí va un pin (2780 negro de 2 módulos, 6558 azul de 3) o un eje con medios bujes de separador.
