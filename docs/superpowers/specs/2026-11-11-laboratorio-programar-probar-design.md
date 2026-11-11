# Laboratorio: pantallas Programar y Probar separadas

Fecha: 2026-11-11. Estado: aprobado por el usuario en conversación (enfoque B).

## Problema

`ProgramarProbar.tsx` (817 líneas) dibuja los pasos 3 y 4 del taller con el mismo
componente: editor, 3D, barra con doce controles, HUD, serial, pines y control
remoto juntos. En un portátil de 1366×768 queda amontonado y el alumno no sabe
qué es de programar y qué es de probar. El usuario quiere una interfaz
profesional, clara y funcional para aulas con laptops o PC.

## Decisiones

- Dos pantallas distintas: **Programar** (sin 3D) y **Probar** (3D a pantalla completa).
- La simulación vive en un hook compartido para no perder física ni Pyodide al cambiar de paso.
- Objetivo de pantalla: ≥ 1366×768. No se diseña para teléfonos.
- Se reutilizan sin cambios: `EditorCodigo`, `EditorBloques`, `ControlRemoto`,
  `PanelCircuito`, `EscenaArena`, `PanelPines`, motor y workers.

## Arquitectura

```
Taller
 ├─ useSimulacion(doc, arenaInicial)   ← una sola instancia, vive en Taller
 ├─ pestaña programar → <Programar sim doc .../>
 └─ pestaña probar    → <Probar sim doc .../>
```

### `ui/taller/useSimulacion.ts`

Estado: `sim`, `estado` ('sin-programa' | 'corriendo' | 'pausado' | 'detenido' |
'error' | 'desactualizado'), `tele`, `serial`, `errores`, `compilando`, `aviso`,
`arena`, `arenas`, `imagenPropia`, `gravedad`, `sonido`, `programaCargado`,
`codigoModificado`.

Acciones: `ejecutar(codigo, lenguaje)` → devuelve `{ ok, errores }`;
`pausar`, `reanudar`, `detener`, `reiniciar`, `cambiarArena`, `subirPista`,
`enviarSerial`, `girarRobot`, `setGravedad`, `setSonido`, `encender/apagar`
(circuitos sin placa).

Reglas:
- Se rearma cuando cambia `estructura(doc)` (JSON de piezas + cables). Al
  rearmar, el programa queda descargado y `estado = 'sin-programa'` con motivo
  «el robot cambió».
- Cambiar de arena rearma la física y recarga el programa solo si estaba corriendo.
- `reiniciar` recarga el programa desde el inicio.
- `dispose` del sim y del worker al desmontar `Taller`.
- Compilación C++ por `/api/lab/compile`; Python por `sim.cargarPrograma`.

### `ui/taller/Programar.tsx`

Dos columnas, sin 3D.

- Izquierda (~65 %): franja fina con selector Bloques/Código (solo Python en
  RPi y Jetson), nombre del archivo y atajo Ctrl+Enter; debajo el editor. En
  bloques, el visor del C++ generado como hoy.
- Derecha (~35 %), tres secciones apiladas:
  1. **Plantillas**: tarjetas con nombre, `descripcion` y botón «Usar»; confirma
     antes de reemplazar código escrito.
  2. **Pines de tu robot**: tabla pieza / pin / pin de la placa a partir del
     cableado actual (misma fuente que Cablear).
  3. **Problemas**: errores del compilador con línea y mensaje; clic salta a la
     línea; avisos de cableado con enlace «Ir a Cablear». Vacía: «Sin problemas».
- Barra del paso: **Ejecutar** grande («Compilar y ejecutar» en C++) a la
  izquierda; **Descargar .ino/.py** a la derecha. Nada más.
- Al ejecutar: barra muestra «Compilando…» / «Cargando Python…»; con errores se
  queda en Programar y resalta Problemas; sin errores llama `onEjecutado()` y
  `Taller` cambia a Probar.
- Circuitos sin placa: en lugar de editor, una explicación del circuito y el
  botón «Ir a Probar».

### `ui/taller/Probar.tsx`

3D a toda la pantalla del paso.

- Barra superior: estado con punto de color («Corriendo · Arduino UNO»,
  «Pausado», «Detenido», «Sin programa», «Código modificado · Ejecutar de
  nuevo»); centro Ejecutar/Pausa, Detener, Reiniciar; derecha Control remoto,
  Ver código, Escena ▾, Pantalla completa.
- Menú **Escena**: arena (con miniatura), Subir mi pista, terreno/gravedad,
  cámara (seguir/libre/cenital), zoom, sonido, Girar robot.
- Sin programa: tarjeta centrada «Todavía no hay programa» + «Ir a Programar».
  El 3D sigue visible.
- Indicadores de arena (vueltas, combate, distancia) arriba a la derecha, en
  `Indicadores.tsx` (HUD, Carrera, Combate movidos sin cambiar lógica).
- Cajón inferior plegable, cerrado por defecto: **Monitor serie**, **Pines y
  sensores** (`PanelPines`), **Problemas** (errores de ejecución). Se abre solo
  la primera vez que el programa imprime; después recuerda su estado.
- Control remoto: panel flotante abajo a la izquierda, sin tapar barra ni cajón.
- Ver código: panel lateral derecho de solo lectura con `EditorCodigo` y botón
  «Editar en Programar».
- Circuitos sin placa: Encender/Apagar y pulsador en lugar de Ejecutar.
- Pantalla completa: oculta la barra del taller; Esc vuelve; cajón y control
  siguen disponibles.

## Flujo y estados

| Transición | Efecto |
|---|---|
| Armar/Cablear → cualquiera, con cambios | rearma; `sin-programa` «el robot cambió»; código se conserva |
| Programar → Ejecutar sin errores | salta a Probar con el programa corriendo |
| Programar → Probar sin ejecutar | Probar muestra el estado que haya |
| Probar → Programar y editar | `codigoModificado = true`; Probar avisa hasta volver a ejecutar |
| Error de compilación | se queda en Programar, sección Problemas |
| Error de ejecución | pestaña Problemas del cajón; estado «error» |
| Cableado inválido | Problemas en Programar con «Ir a Cablear»; Ejecutar deshabilitado con motivo |

Borrador (`chaskibots-lab:robot-v2`): además de piezas, cables y código guarda
arena, cámara y si el cajón estaba abierto. La pista propia no se guarda.

Arreglo incluido: el título del bloque en Cablear usa `infoPlaca(doc).nombre`
en lugar de `mcu.etiqueta` (la RPi se llamaba «Arduino UNO R3»).

Al terminar se borra `ProgramarProbar.tsx`.

## Pruebas

- `useSimulacion.test.ts` (renderHook): rearma al cambiar estructura; conserva
  al cambiar solo código; descarga programa cuando cambia el robot; reiniciar
  recarga; dispose al desmontar.
- `Programar.test.tsx`: Ejecutar llama `onEjecutado` solo sin errores; errores
  en Problemas y clic salta a línea; plantilla confirma si hay código.
- `Probar.test.tsx`: sin programa muestra tarjeta; cajón se abre al primer
  serial; sinPlaca muestra Encender; Esc sale de pantalla completa.
- Pruebas de motor existentes sin cambios; correr con `--pool=threads --maxWorkers=1`.
- Revisión en navegador vía `debug-lab` a 1366×768: semáforo, seguidor Jetson y
  un warbot en ambos pasos.

## Fuera de alcance

Biblioteca de proyectos curada (sub-proyecto 2) y robots de batalla propios /
robots profesionales (sub-proyecto 3). Cada uno tendrá su propio spec.
