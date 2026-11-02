---
name: scroll-driven-3d-transitions
description: Design and validate scroll-driven 3D transitions where an existing asset disintegrates into facets or particles and reassembles into a destination scene. Use for bus-to-city-style prototypes, faceted/point morphs, and cinematic scroll sequences. Do not use for decorative landing animations without state, general WebGL scene editing, or production integration without an isolated test.
---

# Transiciones 3D guiadas por scroll

## Propósito

Convertir una intención artística («el autobús se desintegra y se convierte en
ciudad») en una transición **reproducible y verificable**, separando el activo, la
geometría, las partículas, el material y el control del movimiento. El resultado de
esta skill es un prototipo aislado con estados y criterios medibles, no una
integración en producción.

## Cuándo activarla

- Hay un objeto 3D existente que debe desintegrarse y recomponerse en una escena
  de destino (ciudad, paisaje, red).
- Se necesita mapear scroll real a un progreso normalizado `t ∈ [0,1]`.
- Se deben definir estados narrativos, curva de dispersión, encuadre móvil y
  presupuesto de facetas/partículas.
- Se va a evaluar un activo generado (GLB, malla, ciudad procedural) antes de
  decidir si sirve como destino.

## Cuándo **no** activarla

- Animación decorativa sin estados ni reversibilidad.
- Editor 3D, cámara libre o escena WebGL interactiva (no es una transición).
- Integración directa en la landing sin prototipo aislado ni validación.
- Regenerar el activo original o modificar módulos compartidos para «hacer que
  encaje».
- Cuando el encargo prohíbe tocar el motor, el scroll o los activos: esta skill
  produce un prototipo nuevo, no un parche del existente.

## Prerrequisitos

1. Activo con formato y conteo conocidos; no se regenera ni se sobrescribe.
   En este proyecto: `facetas.bin` ENF1, 4.003 / 2.282 triángulos.
2. Decodificador y transformación deterministas verificados.
3. Documento de intención (qué se ve, qué no, paleta, móvil, límites).
4. Un lugar aislado para la prueba; la landing no se toca.
5. Una skill de validación (ver `interactive-3d-validation`) para no confundir
   «se ve bien» con «está probado».

## Modelo mental: cinco capas

| Capa | Qué decide | Qué no debe hacer |
|---|---|---|
| Activo | Formato, conteo, UV, materiales, escala, orientación | Cambiar el original para acomodar la animación |
| Geometría / facetas | Vértices, centroides, grupos, índices | Depender del reloj o de aleatoriedad nueva |
| Partículas | Qué se dibuja como punto; densidad; tamaño | Inventar una nube distinta a la del destino |
| Material / color | Paleta por grupo, alfa, profundidad | Depender del atlas si el acabado es procedural |
| Control | `t`, scroll, estados, teardown | Tocar `scrollRestoration`, `scrollTo` o globales |

**Regla:** si dos capas se mezclan, la transición deja de ser reversible y deja de
ser medible.

## Estados narrativos y puntos críticos

No todos los `t` valen lo mismo. Define y captura al menos:

| `t` | Estado | Qué debe leerse |
|---|---|---|
| 0 | Objeto íntegro | Silueta y detalle original |
| 0,25 | Separación inicial | El objeto sigue reconocible |
| 0,50 | Desprendimiento | Todavía se reconoce el objeto; ya hay partículas |
| 0,60 | Pérdida de silueta | La nube domina; el objeto deja de leerse |
| 0,75 | Formación del destino | Techos, aristas o masas del destino |
| 1 | Destino | Escena legible sin el objeto |

En la evidencia de este proyecto, `t=0,5` conserva el autobús y `t≈0,6` lo pierde
(`experiencia-movimiento/FASE-10-RESULTADOS.md`). Es una observación del caso, no
una ley universal: mide tu propio umbral.

## Procedimiento

### 1. Intención → requisitos

Traduce el brief a una tabla comprobable:

- sujeto y destino;
- qué debe reconocerse en cada estado;
- paleta y contraste;
- móvil (vertical, 300/900 px);
- qué es intocable (activo, motor, landing);
- qué queda fuera de alcance.

Si el brief pide «una ciudad» pero no dice si es masa, textura o puntos, esa es la
primera decisión pendiente, no un detalle de implementación.

### 2. Auditar el activo antes de animarlo

- Cuenta vértices, triángulos, materiales y texturas.
- Comprueba escala, orientación, suelo y caja.
- Mide la relación con el presupuesto: un GLB de 499.714 triángulos no entra en
  4.003 facetas sin una decisión explícita.
- Decide: ¿es fuente, referencia o destino? No es lo mismo.
- **No** lo regeneres ni lo decimes «para que quepa» sin aprobación.

### 3. Separar generación de animación

- La generación/preparación del activo (remesh, textura, ciudad procedural) ocurre
  **antes** y por su propio carril.
- La animación consume un contrato estable: posiciones, centroides, grupos,
  conteo.
- Si el activo cambia, la animación no debería reescribirse; solo su adaptador.

### 4. Elegir representación

| Representación | Cuándo | Coste |
|---|---|---|
| Facetas 3D | Masa, sombreado plano, silueta | Más geometría; profundidad por orden |
| Puntos | Nube, transición, densidad | Barato; pierde detalle y silueta |
| Ambas | El mismo listado: facetas al inicio, puntos al converger | Una sola fuente de verdad |

En este proyecto, una faceta = un elemento; no se generan partículas nuevas. La
ciudad y la nube comparten listado.

### 5. Definir la curva

- `t` es la entrada; `p` es el progreso de dispersión.
- La curva del proyecto usa dos fases: disolver el objeto (`p = clamp(t/0.8)`) y
  converger al destino (`u = clamp((t-0.45)/0.4)`), con suavizado.
- La posición se calcula desde la original, el centroide, el progreso local, el
  giro y el desplazamiento; **no se acumulan transformaciones**.
- La aleatoriedad se deriva del índice con un hash fijo; nunca de `Math.random()`
  en el render.

### 6. Preservar la silueta

- Mantén el objeto reconocible durante una parte significativa del recorrido
  (en el caso validado, hasta ~0,5).
- No disperses todas las facetas a la vez: usa demora por índice.
- Comprueba en capturas fijas, no solo «en movimiento».

### 7. Resolver el destino sin falsa continuidad

La auditoría 09A demostró que la representación no coincide: el motor guarda tres
vértices 3D por faceta; la ciudad guarda un punto 2D por faceta. No asumas que los
vértices se corresponden.

Patrón que sí funciona:

1. Congela el centroide final del objeto en `p=1`.
2. Proyecta ese centroide al mismo espacio de pantalla que el destino.
3. Interpola centroide → destino por índice.
4. Ajusta el encuadre: en 09A, el 19,8% de los centroides quedaba fuera del lienzo
   de escritorio. Esa decisión (marco del bus vs reencuadre conjunto) es de
   producto, no del código.

Si necesitas identidad 1:1, iguala conteos o muestrea el destino al conteo del
objeto; declara cuál de las dos hiciste.

### 8. Definir el control por scroll

- `t = clamp((scrollY - inicio) / (altoSección - altoViewport))`.
- Un solo `requestAnimationFrame` pendiente; no un bucle permanente.
- Dibuja solo si `|Δt| ≥ ε` (0,001 en el prototipo).
- `IntersectionObserver` para dejar de trabajar fuera de la sección.
- `resize`/`orientationchange` recalculan; el resize del canvas no debe disparar
  un bucle.
- **No** toques `history.scrollRestoration` ni fuerces `scrollTo(0,0)`.
- **No** parchees `window.fetch`; pasa la URL del activo como parámetro.
- El teardown elimina listeners, observadores y rAF; una carga que termina después
  de destruir no debe reactivar el dibujo.

### 9. Encuadre y móvil

- Lienzo estable entre cabecera y pie; en el proyecto: 1440×627 y 390×714.
- Márgenes de encuadre 10/5 (10% horizontal, 5% vertical) tras la iteración.
- El nivel compacto (2.282) se elige en viewports ≤600 px; decide **cuándo** se
  cambia (ver skill de validación).
- La ciudad móvil se estrecha (1,35 vs 1,9 unidades) para ganar altura sin recortar.
- Comprueba a 300 y 900 px, en vertical y horizontal.

### 10. Paleta y material

- Paleta del proyecto: petróleo/azul marino, cian/turquesa, ámbar moderado,
  neutros de control.
- En la ciudad de facetas, el color por grupo manda sobre el RGB del atlas para
  conservar la identidad.
- En la ciudad procedural B2, las bandas de piso dan escala sin añadir geometría.
- Evita que la escena quede en «contornos brillantes sobre fondo oscuro»: la masa
  y las sombras deben leerse.

### 11. Prueba aislada

- Página nueva, sin enlaces desde la landing.
- Parámetros `?t=` o un control manual para capturar estados.
- Capturas de los seis estados, escritorio y móvil.
- Sin errores de consola.
- Hash FNV del canvas para comparar ida/vuelta y paridad.
- Medición de coste y de intervalo `rAF` **sin llamarlo FPS**.

### 12. Decidir

- ¿La silueta se conserva lo suficiente?
- ¿El destino se lee sin el objeto?
- ¿El móvil no queda diminuto ni con cielo dominante?
- ¿La reversibilidad es exacta?
- ¿El activo es fuente, referencia o destino?
- ¿Qué queda pendiente para producto (ubicación narrativa, nivel, movimiento
  reducido, textura, hardware)?

## Criterios de aceptación

1. `t=0` reproduce el activo original sin cambios.
2. `t=0,5` sigue siendo reconocible.
3. `t=1` muestra el destino legible, no una nube abstracta.
4. Ida y vuelta producen el mismo hash en los puntos de control.
5. Sin reloj, sin `Math.random()` en render, sin acumulación de transformaciones.
6. Un solo rAF pendiente; pausa y salida de sección no dibujan.
7. Teardown idempotente; cargas tardías no reactivan.
8. Sin errores HTTP/vacío/corrupto sin estado de error y reintento.
9. Móvil: sin recortes accidentales; lectura a 300 y 900 px.
10. Sin cambios en landing, motor, `transicion.js`, `app.js` ni `scroll.js`.

## Errores frecuentes

| Error | Por qué duele | Prevención |
|---|---|---|
| Parchear `window.fetch` para redirigir el binario | Acopla la página al motor y rompe el contrato | Pasar `assetURL` como parámetro |
| Esperar un global `window.__transicion` | Orden de carga frágil; falla en silencio | Fábrica con promesa/estado explícito |
| `scrollRestoration = 'manual'` + `scrollTo(0,0)` | Borra la posición del usuario | No tocar navegación; calcular `t` desde el scroll actual |
| Cambiar 4.003↔2.282 en caliente | Salto visual y estado inconsistente | Congelar nivel o reconstruir con transición declarada |
| Asumir vértices compartidos bus↔ciudad | La continuidad no existe | Identidad por índice + centroide en pantalla |
| Generar el destino con `Math.random()` | No reversible | Hash por índice con semilla fija |
| Medir después de redimensionar | Se lee otro canvas | Medir antes del resize y con el mismo tamaño |
| Confundir intervalo `rAF` con FPS | Afirmación falsa | Decir «intervalo de rAF», no presentación |

## Límites conocidos y pendientes

- **Sin dispositivo físico** en la evidencia de escritorio; la captura móvil
  aportada por el usuario muestra estados, no FPS ni memoria.
- **Sin tiempo de presentación**: el intervalo `rAF` no prueba fluidez.
- **Ubicación narrativa** en la landing: decisión de producto, no resuelta.
- **Política de nivel** (inmediato, congelado, al iniciar): decisión pendiente.
- **Movimiento reducido**: hay tres políticas posibles; no hay aprobación.
- **Textura/material**: la ciudad procedural B2 es propuesta, no producto.
- **Memoria**: no se mide; eliminar referencias no equivale a liberar GPU.

## Checklist de salida

- [ ] Activo auditado (conteo, escala, orientación, materiales).
- [ ] Brief convertido a requisitos y estados.
- [ ] Capas separadas (activo, geometría, partículas, material, control).
- [ ] Curva determinista y reversible.
- [ ] Silueta conservada hasta el umbral medido.
- [ ] Destino sin falsa continuidad (identidad por índice o muestreo).
- [ ] Control por scroll con un rAF, épsilon, IO y teardown.
- [ ] Móvil y escritorio capturados.
- [ ] Errores y reintento cubiertos por la skill de validación.
- [ ] Sin cambios fuera del prototipo aislado.

## Referencias

- `references/procedimiento.md`: detalle del caso, fórmulas, fases 09–12 y ciudad.
- `references/evidencias.md`: matriz fuente → afirmación → estado.
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/FASE-09A-AUDITORIA.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/FASE-09B-RESULTADOS.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/FASE-09C-RESULTADOS.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/FASE-09D-RESULTADOS.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/experiencia-movimiento/FASE-10-RESULTADOS.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/fase-12-ciclo-vida/FASE-12-RESULTADOS.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/README.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/masa-procedural/README.md`
