---
name: bus-city-v15
description: Design, integrate and validate the Enrutados Venezuela bus→particles→city scroll transition (V15/V16): automatic erosion, reversible city assembly, textured 50k GLB bus, particle color baking, mobile implementation (svh, DPR, sticky canvas, touch scroll, low-end fallback), reduced-motion behavior and evidence. Use when working on the bus-city transition, its shader, clocks, particle size, scroll control or landing placement. Do not use for generic 3D scenes, decorative motion without state, or product-copy decisions.
---

# Bus → partículas → ciudad

## Propósito

Convertir el bus de Enrutados en una transición reversible y comprobable:
el bus llega, frena, se erosiona solo, sus partículas derivan y la ciudad se
ensambla; al subir el scroll, todo se revierte.

La fuente de verdad es el prototipo V15:

```
prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/v15-doble-reloj/
```

No es una animación decorativa. Tiene estados, relojes, reversibilidad y
consecuencias para partículas y ciudad.

## Cuándo activarla

- Hay que integrar, corregir o validar la transición bus → ciudad.
- Se toca `spike.js`, el shader del bus, el tamaño de partícula o los relojes.
- Se va a pasar el prototipo a la landing.
- El bus se ve facetado, “a petróleo”, flotando, diminuto o con partículas
  gigantes.
- Hay que decidir si un cambio visual es aprobable con evidencia.

## Cuándo **no** activarla

- Para inventar una escena 3D nueva sin estados ni reversibilidad.
- Para cambiar la narrativa de la landing; eso es una decisión editorial.
- Para afirmar FPS, memoria o rendimiento sin medición.
- Para regenerar el activo; eso pertenece a `glb-animation-budget`.
- Para sustituir una prueba física con una captura de escritorio.

## Cadena de skills

1. `glb-animation-budget` — deja el GLB correcto.
2. `bus-city-v15` — integra el bus en la transición.
3. `interactive-3d-validation` — produce la matriz de evidencia.
4. `scroll-driven-3d-transitions` — principios generales de scroll y capas.

No dupliques sus reglas; cárgalas cuando haga falta.

## Contrato actual de la V15

### Relojes

| Constante | Valor | Función |
|---|---:|---|
| `ERODE_SECS` | 5.0 | Duración de la erosión |
| `REFORM_SECS` | 4.0 | Duración del ensamble de ciudad |
| `BUS_ENTRY_END` | 0.17 | El scroll dispara la entrada |
| `E_COMPUERTA` | 0.75 | La ciudad no avanza antes de esta erosión |
| `REFORM_START` | 0.38 | Scroll donde empieza la sección 2 |
| Reversa | 2.5× | Erosión y reforma retroceden más rápido |
| `dt` máximo | 0.25 s | Evita cámara lenta bajo FPS bajo |

El scroll **no** calcula la erosión; solo la dispara. La erosión y la reforma
son relojes de tiempo. La reforma es reversible y no depende de volver a mover
el scroll una vez iniciada.

### Movimiento reducido

El prototipo aprobado **no salta** al estado final con
`prefers-reduced-motion: reduce`. La versión anterior tenía un atajo que hacía
`erode = destino` y `reform = destino`; producía un salto abrupto en POCO.

Si se reintroduce una política de movimiento reducido:

- no hacer `erode = 1` ni `reform = 1` de golpe;
- probar con `matchMedia('(prefers-reduced-motion: reduce)')` emulado;
- documentar la decisión de producto;
- no confundir “reducir movimiento” con “quitar la animación narrativa”.

### Bus

- GLB de 50.000 triángulos, ~1,56 MB.
- `POSITION`, `NORMAL`, `TEXCOORD_0`.
- Textura base 1024 JPEG; un material; sin metallicRoughness.
- Carga con `GLTFLoader` local.
- Sin `ENF1` y sin `computeVertexNormals()` en el bus.
- Geometría indexada; se conservan las normales del GLB.

### Partículas

- `TETRA_REL = 0.0079`.
- Tamaño = `TETRA_REL × (maxZ − minZ) × BUS_SCALE`.
- No usar `0.06 × BUS_SCALE / 4.2`: crece con el bus y produce confeti.
- `DISPERSION = 1.65` es la apertura aprobada; no cambiarla sin comparar.
- El color por triángulo se hornea desde la textura **una sola vez**.

### Horneado de color

Para cada triángulo:

1. calcular el centroide de sus UV;
2. dibujar la textura base en un canvas;
3. leer el píxel;
4. guardar RGB en `level.colores` (sRGB, como el ENF1);
5. no hacerlo por frame.

Cuidados:

- `GLTFLoader` devuelve `flipY = false`; no hardcodear `1 − v` sin comprobarlo;
- `ImageBitmap` no siempre tiene `.decode()`; usar la función si existe;
- no promediar UV de islas distintas;
- el shader del bus usa la textura real; las partículas usan el color horneado.

## Flujo de trabajo

### 1. Auditar el estado

- Rama y commit actuales.
- ¿La V15 carga GLB o ENF1?
- ¿El bus tiene NORMAL y TEXCOORD_0?
- ¿Cuántos triángulos, textura y peso?
- ¿El encuadre usa el bus completo?

No asumas que el bus está bien porque el archivo exista.

### 2. Validar el activo antes de tocar `spike.js`

- Abrir el GLB en visor o con `GLTFLoader`.
- Confirmar orientación: largo en Z, frente +Z, suelo en Y mínimo.
- Confirmar que no está “de pie” por una rotación de nodo no aplicada.
- Confirmar que el nivel del bus usa la **geometría real**, no la caja vieja.

### 3. Adaptar el nivel sin romper los relojes

Construir `level` con:

- `posiciones` reales;
- `indices`;
- `colores` horneados;
- `minimo` y `maximo` reales.

Si los atributos son interleaved, **no** leer `position.array[i*3]`. Usar:

```js
pos.getX(i), pos.getY(i), pos.getZ(i)
uv.getX(i), uv.getY(i)
```

El fallo típico es un bus diminuto, flotando o fuera de cuadro por una caja
envolvente falsa.

### 4. Mantener el shader del bus

- `uMap` y `vUv` para la textura.
- `vNormal` desde la normal del GLB.
- `uThreshold`, `uMinZ`, `uMaxZ` y el ruido de borde intactos.
- `discard` de erosión intacto.
- No desindexar.
- No recalcular normales.

### 5. Integrar en la landing solo cuando toque

El prototipo V15 usa scroll global. En la landing debe ser una sección:

- progreso relativo a la sección, no `scrollY / documentHeight`;
- canvas `sticky` dentro de la sección;
- 250–300vh, no 520vh;
- carga diferida del GLB;
- pausa de rAF fuera de la sección;
- fallback estático;
- sin texto visible dentro de la animación.

Ubicación editorial acordada: entre **“Una experiencia más ordenada”** y
**“Cada viaje deja registro”**. La animación es un respiro, no una explicación.
No la muevas al Hero ni la conviertas en catálogo.

### 6. Probar estados

Como mínimo:

- `t=0.24`, `e=0`;
- `t=0.30`, `e=0.15`;
- `t=0.30`, `e=0.35`;
- `t=0.30`, `e=1`;
- `t=0.80`, `e=1`;
- reverso completo.

Comprobar:

- bus íntegro y apoyado;
- partículas que nacen del bus, no de una nube separada;
- ciudad legible;
- mismo estado al volver;
- sin excepciones.

### 7. Implementación móvil

No basta con probar el escritorio en un viewport pequeño. En móvil:

- usa `100svh`, no solo `100vh`;
- el canvas va dentro de un `sticky`, no `fixed` sobre toda la página;
- mide con `getBoundingClientRect()` del canvas, no con `innerHeight`;
- limita `devicePixelRatio` a 2;
- no bloquees el scroll táctil (`touch-action: pan-y`, sin `preventDefault`);
- pausa el rAF al salir de la sección;
- carga el GLB con `IntersectionObserver`, no en el primer paint;
- prueba 360×800, 390×844 y 300×900;
- prueba landscape y DPR 2/3;
- si el equipo es limitado, ten un GLB de 30k como respaldo; no lo decidas por `deviceMemory` sin medir;
- no afirmes FPS: mide intervalo de rAF y documenta emulación vs POCO.

Detalle y snippets en `references/mobile.md`.

### 8. Probar móvil y movimiento reducido

- 300 y 900 px de ancho.
- POCO o dispositivo físico cuando sea posible.
- Emular `prefers-reduced-motion: reduce`; no confundir emulación con hardware.
- Confirmar que el texto no queda tapado y que el bus no se recorta.
- Confirmar que el scroll táctil no se secuestra.

### 9. Entregar evidencia

Usa `interactive-3d-validation` para separar:

- confirmado por código/prueba;
- observado en dispositivo físico;
- reportado por herramienta;
- hipótesis pendiente.

## Errores frecuentes

| Error | Síntoma | Prevención |
|---|---|---|
| Convertir el bus a ENF1 | Facetas, color plano, “petróleo” | GLTFLoader + textura |
| Desindexar y `computeVertexNormals` | Normales planas | Geometría indexada |
| Leer ejes interleaved como array plano | Bus diminuto/flotando | `getX/getY/getZ` |
| `0.06 × BUS_SCALE / 4.2` | Partículas gigantes | `TETRA_REL × largo × BUS_SCALE` |
| `erode = destino` con reduce | Salto abrupto | Reloj gradual |
| `dt` muy bajo | Animación estirada | Clamp 0.25 |
| Cache del móvil | Cambio no visible | `?v=N` + recarga |
| Mover la animación al Hero | LCP y narrativa | Mantener el interludio |
| Texto dentro del interludio | Explica lo visual | Sin copy visible |
| Aprobar solo con captura | Falsa confianza | Matriz de validación |

## Criterios de aceptación

1. El bus se ve texturizado, con normales suaves y sin facetas de ENF1.
2. Está apoyado en el suelo y encuadrado.
3. La erosión dura lo esperado y nace desde atrás.
4. Las partículas heredan el color de la textura.
5. La ciudad se ensambla de forma causal.
6. Al subir, bus y ciudad se revierten.
7. Móvil y reduce no producen saltos.
8. Sin excepciones de consola.
9. No se tocó la ciudad, el doble reloj ni el texto sin aprobación.
10. La ubicación editorial sigue siendo un interludio, no una explicación.

## Referencias

- `references/v15-contract.md` — rutas, constantes y adaptador.
- `references/validation.md` — matriz de pruebas y estados.
- `references/landing-placement.md` — cómo pasarlo a sección de landing.
- `references/mobile.md` — implementación móvil y presupuesto.
- `references/windows.md` — reproducción en PowerShell, servidor LAN y límites del fuente.
- Skills: `glb-animation-budget`, `interactive-3d-validation`,
  `scroll-driven-3d-transitions`.
