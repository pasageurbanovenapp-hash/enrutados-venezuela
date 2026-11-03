# Detalle del caso: autobús facetado → ciudad

Este documento conserva el conocimiento específico del proyecto que la skill no
debe repetir en su cuerpo operativo. Las cifras son del repositorio y de los
informes citados; no son universales.

## 1. Activo

- `prototipos/facetas-retexture/facetas.bin`: firma `ENF1`, 81.470 bytes.
- Dos niveles: **4.003** triángulos (amplio) y **2.282** (compacto).
- Por faceta: 3 vértices, grupo y RGB. Posiciones cuantizadas.
- `motor.js` decodifica y transforma; comprueba firma, límites, índices y bytes
  sobrantes.
- El nivel compacto se elige en viewports ≤600 px (`app.js`, `transicion.js`).
- El RGB del atlas se decodifica pero no se usa como color final en el prototipo:
  manda la paleta por grupo (petróleo/cian/ámbar).

## 2. Fases y lo que demostró cada una

### 09A — Auditoría de viabilidad (solo lectura)

- Veredicto: **viable con adaptador**.
- Motivo: ambos sistemas usan las mismas 4.003/2.282 facetas en el mismo orden,
  pero la representación no coincide (3 vértices 3D por faceta vs 1 punto 2D).
- Dato clave: al final de la dispersión, **19,8% de los centroides** queda fuera
  del lienzo de escritorio con el marco 10/5 y 1440×627.
- Decisión de encuadre (marco del bus vs reencuadre conjunto): **pendiente**.

### 09B — Prototipo de transición

- Correspondencia por índice; dos variantes de encuadre (A/B); curva de dos fases.
- Determinismo y reversibilidad por hash; coste de dibujo medido.
- Observación: a `t=0,5` el autobús todavía se reconoce; hacia `t≈0,6` deja de
  leerse como vehículo.

### 09C — Validación de movimiento

- Continuidad fina, recorte real (píxeles y geometría), coste.
- Hallazgos visuales separados de las mediciones.
- La ventana de alta diferencia se investigó a resolución fina: rampa suave, no
  discontinuidad.

### 09D — Evaluación A/B

- **A se conserva** como referencia; B no aporta mejora repetible y queda como
  alternativa documentada.
- Evaluación interna, un evaluador, capturas fijas; no es prueba de percepción.
- No autoriza landing ni integración.

### 10 — Experiencia de scroll

- Página aislada, sección de 400vh, lienzo 1440×627 / 390×714.
- `t = clamp(scrollY / (altoSección − altoViewport))`.
- Un rAF, épsilon 0,001, IO, resize, orientationchange, reduce, destroy.
- Resultados: recorrido monótono, reversibilidad exacta, pausa sin dibujos,
  salida sin RAF, reentrada, cambio de nivel, movimiento reducido manual.
- **Anti-patrones de esta fase** (corregidos después en fase 12):
  - *shim* de `window.fetch` para resolver la ruta del binario;
  - espera de un global `window.__transicion`;
  - `history.scrollRestoration = 'manual'` y `window.scrollTo(0,0)`;
  - sin estados de carga/error/reintento propios.
- Hashes de control (escritorio): `6b48fb94`, `bbc51aec`, `e3f90c7d`, `ab74c151`,
  `0e627ad8`; móvil final `5d4ef246`.

### 12 — Contrato de instancia

- `crearTransicion({ canvas, assetURL, onEstado })` → `destruir`, `estado`,
  `fijarT`, `reintentar`.
- Estados `loading | ready | error | destroyed`; una sola carga; generación;
  `AbortController`; errores HTTP/vacío/corrupto/red; reintento.
- `destruir()` idempotente: aborta, desconecta `ResizeObserver`, limpia canvas y
  suelta referencias.
- Adaptador `crearAdaptadorScroll({ seccion, instancia, epsilon, onMetrica })`:
  un rAF, IO, resize, destroy; sin `scrollRestoration` ni `scrollTo`.
- Validación: paridad exacta con A en 5 `t` y 2 viewports; escenarios A–G;
  `validacion-12.json`; sin errores de consola.
- Decisión provisional: nivel fijado al crear la instancia (no cambia al
  redimensionar). No es política de producto.

## 3. Ciudad

### Ciudad de facetas (fase 06)

- Una faceta = un elemento; no se generan partículas nuevas.
- 3 planos de profundidad: escala 1 / 0,86 / 0,7; opacidad 1 / 0,72 / 0,46.
- Edificios: 3/4/5 escritorio y 2/3/4 móvil.
- Reparto por edificio: techo 26%, aristas verticales 22%, relleno 52%; sin techo
  y aristas el relleno parece ruido.
- Móvil: ciudad más estrecha (1,35 vs 1,9) para ganar altura.
- Paleta por grupo; ruta luminosa y balizas.

### Ciudad procedural B2 (propuesta, sin commit)

- 9 edificios por fila, calle 4,6, retranqueos 1/3/5/7, bandas de piso.
- Fondo lejano de 3 bloques y red con conectores a bases.
- Facetas: 3.844 (objetivo 4.003, 96%) y 2.308 (objetivo 2.282, 101%).
- Estado: **propuesta de trabajo**, no aprobada; A está commiteada.

### Ciudad V2Fun (referencia, no integrada)

- GLB de 249.585 vértices y 499.714 triángulos, 8,99 MB, sin materiales.
- Geometría urbana buena (calle, fachadas, balcones, farolas), pero ~125× el
  presupuesto de 4.003 facetas.
- Muestreo a 4.003 puntos: la ciudad no lee con claridad; sirve como referencia,
  no como destino directo sin una estrategia de muestreo.
- Decisión de trabajo: la masa procedural manda para el destino; el GLB queda como
  referencia.

## 4. Fórmulas del caso

En `transicion.js`:

- `p = clamp(t / 0.8)`;
- `u = clamp((t - 0.45) / 0.4)`;
- `eu = smoothstep(u)`, `ec = smoothstep(clamp(u * 1.7))`;
- posición = función de posición original, centroide, progreso local, giro y
  desplazamiento;
- sin reloj ni acumulación; hash por índice.

No copies estos números a otro proyecto sin medir el umbral de silueta y la curva.

## 5. Fase 11 (encargo, no resultados)

El encargo de fase 11 define el marco de auditoría: carga, ciclo de vida,
viewport/nivel, accesibilidad, integración narrativa, rendimiento, hardware real;
estados de evidencia; prioridades P0/P1/P2.

**No hay informe de fase 11 en el repositorio.** El encargo no es evidencia de
hallazgos. Sus preguntas se usan como checklist en `interactive-3d-validation`.

## 6. Evidencia física

`prototipos/Pruebas en movil.png` (1830×1733): montaje de 8 capturas del
laboratorio de fase 12, con `scroll t=0.000` a `0.988` y `dib` creciente. Muestra
el autobús, la dispersión, la nube y la ciudad con ruta. Es evidencia visual de
ejecución móvil; **no** documenta dispositivo, SO, navegador, FPS ni memoria.
