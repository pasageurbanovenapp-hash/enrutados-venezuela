# Constitución de diseño: Enrutados Venezuela

> Fuente de verdad del proyecto. Si una decisión de diseño, una propuesta de un
> asistente o una línea de código contradice este documento, gana este documento.
>
> **Estado:** vigente. **Alcance:** `artifacts/enrutados-venezuela`.
> **Última revisión:** Fase 1 del plan de modernización.
> **Actualización documental propuesta — 2026-10-15. Pendiente de aprobación.**
> Recoge decisiones ya confirmadas por el responsable del proyecto y las registra
> por escrito. **No constituye una versión aprobada ni publicada de esta
> constitución:** hasta su aprobación formal, el documento sigue rigiéndose por su
> estado vigente anterior.

---

## Registro de decisiones

| # | Decisión o propuesta | Estado | Fecha de aprobación | Evidencia de registro documental | Dónde se aplica |
|---|---|---|---|---|---|
| D1 | Reducción parcial por fusiones; primera fusión acordada `journey` + `how-it-works` | **Antecedente histórico, no vigente** | No registrada | Primera aparición en un objeto Git: checkpoint `e7364d8` (2026-10-08 00:03). Primera constancia en un commit de rama: `41c675a` (2026-10-08 00:09) | §8 (antecedente) |
| D2 | `journey` y `how-it-works` permanecen separados | **Vigente** | No registrada | Confirmación documental en esta reconciliación: 2026-10-15 | §8, §13 |
| D3 | `audiences` y `ecosystem` permanecen separados | **Vigente** | No registrada | Confirmación documental en esta reconciliación: 2026-10-15 | §8, §13 |
| D4 | `proof-band` se conserva: conecta la promesa con la realidad humana del transporte | **Vigente** | No registrada | Confirmación documental en esta reconciliación: 2026-10-15 | §13 |
| D5 | `chapter-break` es una transición narrativa, no una sección de contenido | **Vigente** | No registrada | Confirmación documental en esta reconciliación: 2026-10-15; el texto ya constaba sin fecha en §8 | §8, §13 |
| D6 | Estructura de nueve secciones: fusionar `audiences` con `ecosystem`, fusionar `journey` con `how-it-works` y retirar `proof-band` | **Propuesta histórica descartada; no aprobada** | No aplica: no hay aprobación | Registro del archivo de propuesta: 2026-10-15 | `docs/propuestas/PROPUESTA-estructura-nueve-secciones.md` |
| D7 | Actualización documental de esta constitución (encabezado, §8, §13 y este registro) | **Pendiente de aprobación** | Pendiente | Registro: 2026-10-15 | Encabezado, §8, §13 |

Cada columna acredita una cosa distinta. **«Fecha de aprobación»** es la fecha del
acuerdo; figura como «No registrada» o «Pendiente» cuando el repositorio no la
acredita, y no se inventa. **«Evidencia de registro documental»** acredita
únicamente cuándo consta por escrito cada elemento, no cuándo se acordó.

Que un texto aparezca en un objeto de Git no equivale a una aprobación: solo fija
desde cuándo consta por escrito.

D2 a D5 están confirmadas por el responsable del proyecto en el contexto de este
trabajo. Su confirmación se registra aquí con fecha de constancia documental
(2026-10-15); el momento original del acuerdo no está registrado.

## 0. Para qué existe este documento

El código de esta landing creció sin criterios escritos. El resultado es una
interfaz correcta en lo técnico pero inconsistente en lo visual, con secciones
que se contradicen entre sí y con el discurso del proyecto.

Este documento fija los criterios una sola vez para no volver a discutirlos en
cada sección. Se lee completo antes de proponer o aplicar cualquier cambio.

---

## 1. Lectura de diseño

> Landing de producto para asociaciones de transporte, conductores y pasajeros en
> Venezuela, con un lenguaje de tecnología oscura y serena, apoyada en el sistema
> de tokens existente y en fotografía real.

**Audiencia y restricción que manda sobre el gusto.** El usuario típico abre esto
en un teléfono de gama media o baja, con datos móviles caros y a plena luz del
día. Esa realidad pesa más que cualquier preferencia estética:

- El contraste y el peso de página son requisitos, no detalles.
- Un efecto que se vea bien solo en pantalla grande y con buena conexión está mal.
- Si hay que elegir entre llamativo y legible, gana legible. Siempre.

---

## 2. Modo de intervención

**Preservar la identidad. Rehacer la capa de presentación.**

### Se congela (no se cambia sin aprobación explícita)

- La línea narrativa y la voz del copy.
- La arquitectura de información: orden de secciones, anclas (`#piloto`,
  `#como-funciona`, `#inicio`, etc.).
- Los `data-testid` existentes (hay analítica y pruebas que dependen de ellos).
- Los colores de marca: cyan, naranja y el azul petróleo de fondo.
- Las dos tipografías: DM Sans y Space Mono.
- El principio editorial de honestidad.

### Se puede rehacer

- La composición visual de cada sección.
- La arquitectura del CSS (hoy un archivo de 2115 líneas).
- Las imágenes y su dirección de arte.
- El movimiento y las transiciones.
- El copy, solo para editarlo y hacerlo más claro, nunca para inflarlo.

---

## 3. Diales

| Dial | Valor | Significado |
|---|---|---|
| Variación (`DESIGN_VARIANCE`) | **5** | Asimetría moderada. Las secciones se distinguen entre sí, sin caos |
| Movimiento (`MOTION_INTENSITY`) | **3** | Movimiento sobrio y funcional. Nada compite con el contenido |
| Densidad (`VISUAL_DENSITY`) | **3** | Aire. Una idea por pantalla |

### Qué se deriva de estos diales

- **Variación 5:** prohibido repetir la misma familia de composición en secciones
  consecutivas. Cada sección debe ser reconocible por su estructura, no solo por
  su color.
- **Movimiento 3:** todo movimiento tiene que poder justificarse en una frase
  (jerarquía, secuencia narrativa, respuesta a una acción o cambio de estado). Si
  no se puede justificar, se retira. Prohibido el bucle infinito decorativo.
- **Densidad 3:** una idea por sección. Si una sección defiende dos ideas, se
  parte o se recorta.

---

## 4. Tokens

Los tokens viven en `src/index.css` y son el único origen de color y medida.
**Ninguna sección inventa un color propio.**

| Token | Valor | Rol | Regla de uso |
|---|---|---|---|
| `--bg` | `#0a1628` | Fondo principal | Base de toda la página |
| `--bg-soft` | `#0d2438` | Fondo alterno | Solo para diferenciar bloques |
| `--panel` | `rgba(13,26,38,.84)` | Superficies | Paneles sobre fondo |
| `--ink` | `#ffffff` | Texto principal | Títulos y texto de lectura |
| `--ink-soft` | `#8fa3b3` | Texto secundario | Cuerpo y apoyos. Nunca para títulos |
| `--cyan` | `#22d3ee` | **Acento de interacción** | Enlaces, foco, acción, énfasis de marca |
| `--orange` | `#f59e0b` | **Señal de calle y acción** | Uso escaso. Foco visible y el actor conductor |
| `--violet` | `#8b5cf6` | Tecnología | **Uso reducido.** No compite con el cyan |
| `--line` | `rgba(143,163,179,.2)` | Bordes y separadores | Un solo grosor en todo el sitio |
| `--success` `--warning` `--error` | | Estados | Solo con significado real, jamás decorativos |

### Reglas de color

1. **Un solo acento de interacción.** El cyan marca lo que se puede accionar. Si
   todo brilla, nada destaca.
2. **El cyan actual está saturado.** Al reconstruir la tipografía se evalúa
   rebajarlo ligeramente para que descanse mejor sobre el azul petróleo.
3. **Nada de negro puro (`#000000`)** ni de blanco puro en bloques grandes.
4. **Nada de brillos exteriores** (`box-shadow` de color difuso) como decoración.
   Los bordes internos y las sombras tintadas son el recurso correcto.
5. **Un solo radio por familia de elemento.** Hoy conviven varios sin criterio.

### El sistema Línea de Ruta

Es el recurso visual propio del proyecto: una línea que representa el recorrido
del viaje y se traza a medida que el usuario avanza. Vive en
`src/styles/route-line.css` y `src/components/ui/route-line.tsx`.

Principios:

1. **La línea es un actor, no un detalle.** Tiene presencia cuando importa y
   desaparece cuando no.
2. **Siempre comunica progreso.** El cyan es el origen; el naranja es la calle y
   la acción.
3. **Se dibuja al hacer scroll.** Nunca aparece completa.
4. **Los nodos marcan momentos reales**, no adornos.
5. **El texto nunca compite con la línea.** Las etiquetas van al lado, no encima.
6. **Una sola línea por sección.** Entra, se queda y sale con la sección.
7. **En móvil rota 90 grados.** Nunca desaparece.

Estados de nodo: `idle` (aún no alcanzado, opacidad baja), `active` (en foco,
glow suave) y `done` (ya recorrido).

**Secciones con línea:** Problem, HowItWorks, Operations y Journey.
**Secciones sin línea:** Audiences, Honesty, FAQ y Contact. Ahí hay conversación,
no proceso.

---

## 5. Tipografía

Se conservan **DM Sans** (interfaz) y **Space Mono** (datos y etiquetas).

### Reglas

1. **Autoalojadas.** Se sirven desde el propio dominio. Una petición externa a
   `fonts.googleapis.com` en la ruta crítica bloquea el primer pintado. La
   tipografía se descarga una vez, se versiona en el repositorio y se sirve con
   `font-display: swap`.
2. **Escala cerrada de ocho pasos.** No se inventa un tamaño por sección. Los
   tokens viven en `styles/tokens.css` con el prefijo `--fs-` para no chocar con
   el espacio `--text-*` de Tailwind:

   | Token | Valor | Uso |
   |---|---|---|
   | `--fs-label` | 11px | Etiquetas mono, metadatos, insignias |
   | `--fs-sm` | 14px | Texto auxiliar |
   | `--fs-base` | 16px | Cuerpo |
   | `--fs-md` | 18px | Entradilla y cuerpo destacado |
   | `--fs-lg` | 22px | Títulos de bloque |
   | `--fs-xl` | 26px | Títulos de tarjeta |
   | `--fs-title` | fluido | Títulos de sección |
   | `--fs-hero` | fluido | Titular del hero |

   Los dos pasos fluidos usan **una sola fórmula** cada uno, para que todo el
   sitio escale con la misma pendiente. Antes había cinco fórmulas distintas con
   tres pendientes diferentes.
3. **El ritmo vertical es un valor por punto de quiebre.** `--section-y` (128px)
   en escritorio y `--section-y-sm` (80px) en móvil. El hero es la excepción:
   conserva su propio relleno superior por la barra de navegación fija.
4. **Máximo dos grosores por familia** en uso real.
5. **Nada de serif decorativa.** Ni para "dar un toque editorial".
6. **El énfasis se hace con itálica o negrita de la misma familia.** Nunca
   metiendo una tipografía distinta dentro de un titular.
7. **La mono no se usa para párrafos.** Es para etiquetas, cifras y datos.
8. **Las alturas de línea aún no están tokenizadas.** Quedan 12 valores sueltos.
   Normalizarlas cambia la forma de los bloques de texto, así que se hace
   componente por componente en la fase de recomposición, no en bloque.

---

## 6. Prohibiciones

### 6.1 Prohibiciones heredadas (aplican siempre)

- **Tres tarjetas idénticas en fila.** Es el recurso más reconocible de la
  interfaz generada automáticamente.
- **Numeración de secciones** y etiquetas tipo `01 / 03`. Si el usuario puede
  contar, no necesita el número.
- **Rayas largas (—) en cualquier texto visible.** En titulares, cuerpo,
  viñetas, botones y atribuciones. Se usa guion normal.
- **Maquetas de interfaz hechas con rectángulos.** Prohibido simular una
  pantalla con `div`. Se usa una captura real o no se muestra nada.
- **Cifras con precisión inventada** sin datos reales que las respalden.
- **Números y avatares genéricos.** Nada de "Juan Pérez" ni de siluetas.
- **Franjas de texto decorativo** al pie del hero.
- **Avisos de desplazamiento** ("desliza", "scroll", flechas animadas).
- **Puntos de color decorativos** antes de elementos de lista.
- **Encabezado partido**: titular grande a la izquierda con un párrafo pequeño
  suelto en la esquina superior derecha. Si hace falta contexto, va debajo del
  titular.
- **Píldoras o etiquetas superpuestas sobre imágenes.**
- **Viñetas con `—`.** Se usa un guion, un punto o nada.
- **Barras de progreso con fondo relleno** como recurso comparativo.
- **Texto en vertical rotado.**
- **Títulos excesivamente grandes solo para impresionar.** La jerarquía se
  construye con peso y color, no solo con tamaño.

### 6.2 Prohibiciones propias de este proyecto

Estas nacen del principio de honestidad y son más importantes que las anteriores:

1. **Nada que simule operación real.** Ninguna pantalla, cifra o estado puede
   parecer un registro en vivo de una asociación. La interfaz muestra *qué
   perspectiva existe*, no *qué está pasando ahora*.
2. **Prohibidas las cifras inventadas dentro de maquetas.** Ni recaudación, ni
   viajes del día, ni números de unidad, ni códigos de ruta. Si un dato es
   ilustrativo, se etiqueta como ejemplo de forma visible.
3. **Prohibidos los testimonios y las citas de usuarios.** No hay adopción
   comprobada, así que no se representa.
4. **Prohibido insinuar resultados.** Nada de satisfacción, ahorro o eficiencia
   medida. El sistema ofrece orden y trazabilidad; no promete resultados.
5. **Prohibido el render que se delata.** Una imagen generada con deformaciones
   visibles (vehículos, manos, rostros) destruye la credibilidad que sostiene
   todo el discurso. Si no hay imagen creíble, se usa un espacio honesto.
6. **Prohibida la emoción publicitaria.** Sin sonrisas amplias, sin pulgares
   arriba, sin miradas a cámara, sin poses de catálogo.
7. **Prohibido estereotipar el rol por el vestuario.** Un uniforme, una cabina o
   un escritorio no identifican a un actor. Lo identifica la interfaz.
8. **Prohibido culpar al conductor.** Su beneficio es orden y respaldo, no ser
   corregido por la tecnología.

---

## 7. Imágenes y assets

### Reparto de trabajo

Las imágenes **no las genero yo**: no tengo herramienta de generación en mi
entorno. Yo redacto el brief técnico y el prompt; el cliente las produce con
modelos externos y las entrega.

### Presupuesto de peso (obligatorio)

| Uso | Formato | Peso máximo |
|---|---|---|
| Imagen del hero | AVIF o WebP | **250 kB** |
| Imagen de sección | AVIF o WebP | 180 kB |
| Icono de actor | SVG preferente, si no WebP | 20 kB |
| Captura de app | WebP | 120 kB |

- **Ninguna fotografía se sirve en PNG.** El PNG del hero pesaba 1.81 MB. Ya está
  convertido: AVIF de 83 kB en escritorio y 30 kB en móvil, con una diferencia
  media de 1.27 niveles sobre 255 una vez renderizado.
- **El original no se despliega.** Los archivos maestros viven en `fuentes/`,
  fuera de `public/`. Se conservan para poder regenerar las versiones optimizadas,
  pero no viajan al artefacto de despliegue.
- **Dos tamaños por imagen.** Un archivo para escritorio y otro para pantallas
  estrechas, servidos con `srcset` y `sizes`. En móvil no tiene sentido descargar
  una imagen de 1672 px para una pantalla de 390.
- **La herramienta es `tools/optimizar-imagen.py`.** Genera AVIF y WebP en ambos
  tamaños e informa del peso y de la fidelidad de cada uno.
- Toda imagen declara `width` y `height` para evitar saltos de composición.
- Toda imagen lleva texto alternativo con significado. Si es puramente
  decorativa, `alt=""` es correcto y deliberado.
- Las imágenes del hero y de la primera pantalla se cargan con prioridad alta;
  el resto, con carga diferida.

### Capturas de las apps

Existen capturas reales de las tres aplicaciones. **Se usan ellas.** Sustituyen
por completo a la maqueta de rectángulos de la sección Ecosistema. Una captura
real es más honesta, más creíble y más barata que cualquier simulación.

### Dirección de arte para las personas

Cuando la sección requiera personas:

- Gente cotidiana, diversa y creíble, con ropa normal.
- Luz natural o de apariencia natural, expresiones tranquilas, gestos no posados.
- Contexto venezolano cercano, sin folclor ni escenas de caos para fabricar
  contraste.
- La identidad del rol la da el dispositivo y su pantalla, nunca el vestuario.
- La satisfacción se sugiere con contención: postura relajada y sensación de
  control. Nunca con sonrisas o gestos de recomendación.
- Composición conjunta con jerarquía, no tres recuadros idénticos.

---

## 8. Contenido y copy

- **Una idea por sección.** Si hay dos, se parte.
- **Titular de 8 palabras o menos.** Párrafo de apoyo de 25 palabras o menos.
- **Un solo registro de voz por página.** No se mezcla prosa editorial con
  consignas de marketing y datos técnicos en la misma composición.
- **Sin verbos de relleno** ("potenciar", "revolucionar", "sinergia",
  "siguiente generación").
- **Auditoría de copy obligatoria:** antes de dar por buena una sección se
  relee cada texto visible (titulares, etiquetas, botones, viñetas, textos
  alternativos) y se reescribe cualquiera que sea repetitivo, vago, con
  referencias confusas o que suene a relleno.
- **Composición vigente.** La página monta doce bloques; `chapter-break` es una
  transición narrativa, no una sección de contenido. El cometido de cada bloque
  está en la sección 13.
- **Antecedente histórico, no vigente.** Una decisión anterior propuso reducir la
  página por fusiones —la primera, `journey` con `how-it-works`— y una propuesta
  posterior planteó una estructura de nueve secciones. **Ninguna de las dos es una
  decisión vigente:** la arquitectura actual mantiene `journey` y `how-it-works`
  separados, `audiences` y `ecosystem` separados y `proof-band` conservado. Su
  constancia documental está en el registro de decisiones.
- **Vigente.** No se fusiona, suprime ni reordena ningún bloque. Toda fusión o
  supresión nueva requiere aprobación explícita.

---

## 9. Herramientas de criterio y precedencia

| Rol | Herramienta | Qué gobierna |
|---|---|---|
| **Ley** | `design-taste-frontend` | Diales, prohibiciones, control previo |
| Protocolo | `redesign-existing-projects` | Cómo migrar sin romper la marca |
| Tokens | `brandkit` | Contrato de marca |
| Arte | `high-end-visual-design` | Dirección de la sección de actores |
| Entrega | `full-output-enforcement` | Disciplina de salida |
| Despliegue | `github-pages-deployer` | Publicación |

**Congeladas, no se promedian:** `design-taste-frontend-v1`, `gpt-taste`,
`taste-skill`, `minimalist-ui`, `stitch-design-taste`, `industrial-brutalist-ui`.

Si dos criterios chocan, gana `design-taste-frontend` y la excepción se anota en
este documento.

---

## 10. Definición de terminado

Una sección está terminada cuando **todo** esto es cierto:

- [ ] Compila, tipa y pasa el linter sin errores.
- [ ] No hay ni una raya larga en el texto visible.
- [ ] Ningún color fuera de los tokens.
- [ ] Ninguna cifra, estado o pantalla que simule operación real.
- [ ] Ninguna maqueta de interfaz construida con rectángulos.
- [ ] No hay tres tarjetas idénticas en fila.
- [ ] No hay numeración de sección.
- [ ] Contraste de texto y botones apto para lectura a plena luz del día.
- [ ] Foco visible con teclado.
- [ ] Funciona a 390 px de ancho sin desbordes horizontales.
- [ ] El movimiento respeta `prefers-reduced-motion`.
- [ ] Toda imagen tiene texto alternativo decidido y pesa lo que dice la tabla.
- [ ] Se revisó el copy con la auditoría de la sección 8.
- [ ] Existe captura de antes y después.

---

## 11. Cómo trabajamos

1. **Una fase, una rama, un antes y un después.** Cada fase o sección se cierra
   con capturas comparables y un resumen en lenguaje llano.
2. **Aprobación visual antes de avanzar.** Nada pasa a `main` sin que el cliente
   lo haya visto.
3. **Punto de retorno.** Cada entrega deja un estado al que se puede volver.
4. **Sin cambios silenciosos** en: anclas, `data-testid`, etiquetas de navegación,
   logo, textos legales, nombres de campos de formulario.
5. **Ninguna dependencia nueva** se añade sin avisar antes: qué es, cuánto pesa y
   para qué sirve.
6. **El refactor no cambia lo que se ve.** En la fase de reestructuración del CSS
   el criterio de éxito es que las capturas sean idénticas. Si cambian, hubo un
   error.

---

## 12. Notas de entorno para asistentes

- El proyecto se instala con pnpm. El CI usa pnpm 10.32.1 y Node 24, alineado con
  la versión de desarrollo declarada en `.agents/AGENTS.md`.
- En entornos con sandbox restrictivo, pnpm puede fallar al resolver sus enlaces.
  La solución local es `--config.node-linker=hoisted`. Esto no altera el
  repositorio ni el CI.
- Compilar requiere permisos elevados en entornos confinados: esbuild y los
  navegadores de prueba abren procesos hijos.
- **Comando de captura:** `node tools/capturar.mjs <dist> <salida> [puerto]`.
  Recorre la página antes de fotografiar para que los revelados por scroll estén
  visibles.

---

## 13. Cometido de cada bloque narrativo

`src/features/landing/landing-page.tsx` monta **doce bloques**. De ellos,
`chapter-break` es una **transición narrativa**, no una sección de contenido. Esa
distinción sirve para leer la composición; **no autoriza** fusionar, eliminar ni
reordenar bloques.

| # | Bloque | Cometido |
|---:|---|---|
| 1 | `hero` | Presenta la propuesta de valor. |
| 2 | `proof-band` | Conecta la promesa con la realidad humana del transporte. |
| 3 | `problem` | Expone la brecha y cierra con «Los datos existen. Pero no se conectan». |
| 4 | `chapter-break` | Transición cinematográfica entre `problem` y `audiences`. **No es una sección de contenido independiente.** |
| 5 | `audiences` | Argumenta el valor para pasajeros, conductores/colectores y asociaciones. |
| 6 | `ecosystem` | Demuestra visualmente las experiencias del producto, diferenciando capacidades reales, ilustrativas, futuras y pendientes de validación. |
| 7 | `journey` | Presenta la experiencia y el recorrido del usuario. |
| 8 | `how-it-works` | Explica el mecanismo de funcionamiento del sistema. |
| 9 | `operations` | Presenta la visibilidad y las capacidades operativas disponibles. |
| 10 | `honesty` | Comunica el estado real del producto, sus límites y lo que todavía no está validado. |
| 11 | `faq-section` | Responde objeciones y preguntas. |
| 12 | `contact` | Propone la siguiente acción. |

### Separaciones y permanencias

- **`audiences` ≠ `ecosystem`.** Uno argumenta el valor; el otro demuestra el
  producto. No se fusionan.
- **`journey` ≠ `how-it-works`.** Uno cuenta la experiencia; el otro, el mecanismo
  que la hace posible. No se fusionan.
- **`proof-band` se conserva.** Es el puente entre la promesa del `hero` y la
  realidad humana del transporte; no se retira.
- **`chapter-break` no es contenido.** Es la transición entre `problem` y
  `audiences`.

### Propuestas históricas no vigentes

Ni la reducción por fusiones ni la estructura de nueve secciones son decisiones
vigentes. Ambas quedan como antecedente documental. La segunda está archivada en
`docs/propuestas/PROPUESTA-estructura-nueve-secciones.md` y **no tiene autoridad
para ordenar cambios de código ni para sustituir la arquitectura vigente**. Ver
«Registro de decisiones».

### Alcance

Esta sección documenta cometidos. **No fija el número de secciones ni autoriza
fusiones o supresiones**: cualquier cambio de arquitectura requiere aprobación
explícita y sigue sujeto a la sección 2.

---

## Anexo: deuda conocida

### Resuelto en la Fase 2

| Hallazgo | Acción |
|---|---|
| CSS monolítico de 2115 líneas | **Partido en 22 módulos** en `src/styles/`, en rangos contiguos. El CSS empaquetado salió con el mismo hash y el mismo tamaño |
| Carga de Google Fonts por `@import` | **Autoalojadas** en `src/assets/fonts/`. Ya no hay petición externa en la ruta crítica |
| `particles.tsx` (123 líneas) sin un solo uso | **Eliminado** |
| Isla muerta `toast` / `toaster` / `use-toast`, montada en `App.tsx` sin que nada la use | **Eliminada**, junto con su proveedor |
| `tooltip.tsx` montado como proveedor y nunca usado | **Eliminado** |
| `@tanstack/react-query` montado sin una sola consulta | **Eliminado**, con su dependencia |
| `frame-1.jpg` (198 kB) sin usar | **Eliminado** |
| Alias `@assets` apuntando a una carpeta inexistente | **Eliminado** |
| Sin archivo README en la landing | **Escrito**, fusionado con el de despliegue que ya existía |
| Dependencias huérfanas en `package.json` | **Retiradas** y lockfile podado |
| **`DESIGN.md` documentaba otra marca** (Inter + JetBrains Mono, degradado cian→verde), en conflicto con el sitio real | **Retirado.** La dirección cian→verde queda descartada. Sus principios del sistema Línea de Ruta se rescataron en la sección 4 de este documento |

Resultado medido: JavaScript de **371.4 kB a 273.3 kB** (26% menos), sin cambiar
un solo píxel.

### Resuelto en la Fase 3

| Hallazgo | Acción |
|---|---|
| 55 declaraciones de tamaño con unos 35 valores distintos, incluidos casi duplicados (`.83rem` junto a `.84rem`) | **Escala cerrada de 8 pasos.** Las 54 declaraciones de los CSS la usan. **Corrección posterior:** el CSS sí quedó limpio, pero 40 utilidades de Tailwind en componentes se saltan la escala, 34 de ellas dentro de la maqueta del teléfono. Ver "Abierto" |
| 5 fórmulas fluidas distintas con 3 pendientes diferentes | **Una sola fórmula** para títulos de sección y otra para el hero |
| 5 rellenos de sección distintos para el mismo trabajo (82, 120, 125, 130, 170 px) | **Un valor por punto de quiebre:** 128px en escritorio, 80px en móvil |
| El titular del hero ocupaba 4 líneas en móvil y se comía la primera pantalla | **2 líneas.** Ahora caben titular, descripción, los dos botones y los tres actores |
| A 320px el contenido de Ecosistema se **recortaba** en lugar de desplazarse, así que las insignias APP quedaban invisibles. El armazón usa `overflow: clip`, así que no había ni barra de desplazamiento | **Corregido.** Los elementos de rejilla no pueden forzar el ancho del contenedor (`min-width: 0`). Comprobado que no afecta a ningún otro ancho |

Resultado medido sin cambiar de identidad: la página pasa de 10.228 a **9.847 px**
en escritorio y de 12.283 a **12.112 px** en móvil. Se acorta en ambos.

### Resuelto: peso de la página

| Hallazgo | Acción |
|---|---|
| Imagen del hero: 1809 kB en PNG | **Optimizada.** AVIF de 83 kB y WebP de 138 kB en escritorio; 30 y 48 kB en móvil |
| Banda nocturna: 174 kB en WebP ya comprimido | **AVIF de 135 kB** (−22%) y variante móvil de 77 kB (−56%). El WebP original se **conserva sin recodificar**: al ser ya WebP, recodificarlo lo engordaba |
| Iconos de los tres actores: 79 kB en PNG de 256×256, mostrados a 52 px | **Reducidos a 160 px y pasados a WebP: 15 kB en total** (−81%) |
| El artefacto de despliegue incluía el PNG maestro del hero | Movido a `fuentes/`, fuera de lo que se publica |

**Peso real medido interceptando la red**, no sumando archivos:

| Ancho | Antes | Ahora | Reducción |
|---|---|---|---|
| Móvil (390px) | ~2.267 kB | **290 kB** | 7,8 veces menos |
| Escritorio (1440px) | ~2.267 kB | **401 kB** | 5,7 veces menos |

El reparto actual en móvil: imágenes 123 kB, JavaScript 84, tipografías 69,
CSS 13.

### Dos acusaciones mías que resultaron falsas

Queda constancia porque el método funcionó: las detecté al ir a arreglarlas.

1. **"Los iconos de los actores tienen texto alternativo vacío."** Falso. Están
   dentro de un contenedor `aria-hidden="true"` y el botón que los contiene ya
   tiene el nombre y la descripción como texto. `alt=""` es lo correcto ahí.
2. **"Las pestañas del ecosistema tienen ARIA incompleto."** Falso. Tienen
   `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` y el panel
   tiene `role="tabpanel"` con `aria-labelledby`.

### Resuelto: la descarga duplicada del hero

Medido en WebKit, no deducido: **WebKit descarga el `src` del `img` aunque el
navegador elija una fuente del `picture`.** Chromium no lo hace, así que la
primera medición, hecha solo en Chromium, no lo vio.

Consecuencia: en móvil se descargaban `hero.webp` (138 kB) **y**
`hero-movil.webp` (48 kB), cuando solo se usa el segundo.

Corregido apuntando el respaldo del `img` a la variante pequeña. El respaldo solo
existe para navegadores que no entienden `picture`, y esos no pueden ejecutar
esta aplicación de todas formas.

| Motor y ancho | Antes | Ahora |
|---|---|---|
| WebKit móvil | 479 kB | **340 kB** |
| WebKit escritorio | 492 kB | 540 kB |
| Chromium, ambos | 288 / 398 kB | igual |

En escritorio el respaldo antiguo coincidía con el archivo elegido y no había
descarga extra, así que el arreglo cuesta 48 kB ahí. Compensa: **el móvil es la
audiencia prioritaria.**

**Regla que queda:** el `src` de un `img` dentro de un `picture` apunta siempre a
la variante más pequeña.

### Resuelto: accesibilidad

Primera medición objetiva, con axe-core sobre las reglas WCAG 2.1 AA más las de
buenas prácticas:

| Ancho | Reglas superadas | Incumplidas |
|---|---|---|
| 390, 768 y 1440 px | 43 | 1 |

El único incumplimiento es de contraste, en tres elementos, **todos dentro de la
maqueta del teléfono**, que se sustituye en la Fase 4.

El hallazgo que importa no lo da la herramienta, lo da mirar el árbol de
accesibilidad: **el texto inventado de la maqueta se anunciaba a los lectores de
pantalla**. Un usuario ciego oía "34 viajes hoy, Bs. 5.040, Unidad GCB-74X" como
si fueran datos reales de una asociación. Para un proyecto cuyo principio es la
honestidad, esa era la mentira más grave de todas: no se ve, se afirma.

Corregido marcando el contenido de la pantalla como `aria-hidden`. Verificado
contra el árbol real: las cinco cadenas inventadas desaparecieron y las tres
honestas ("Validación en segundos", "Offline-first", "Consulta, paga y viaja")
siguen leyéndose.

**La lección de método:** dos de mis propias afirmaciones sobre accesibilidad
resultaron falsas y una de mis herramientas tenía un fallo que subestimaba el
problema. Nada de esto se sostiene sin medirlo.

### Abierto

| Hallazgo | Ubicación | Acción |
|---|---|---|
| La tarjeta social usa una paleta antigua (crema, menta y morado) | `public/social-card.svg` | Rediseñar en la fase de marca |
| Imagen del hero: 1809 kB en PNG | **Optimizada.** AVIF de 83 kB y WebP de 138 kB en escritorio; 30 y 48 kB en móvil. El artefacto de despliegue pasa de 2.81 a 1.04 MB |
| Las tipografías pesan 68.5 kB por visita (subconjunto latino) | `src/assets/fonts/` | Los grosores 500 y 600 se usan 3 y 2 veces. Mapearlos a 400 y 700 ahorraría peso en la fase de tipografía |
| La página 404 es un resto en inglés y en tema claro, con clases Tailwind de otro sistema | `src/pages/not-found.tsx` | Restilizar o retirar el enrutador. Casi inalcanzable en producción |
| 40 utilidades de tamaño de Tailwind se saltan la escala: **34 dentro de la maqueta del teléfono** (con cuatro tamaños fijos: 9, 10, 11 y 13 px) y 6 en restos del andamiaje inicial (`error-boundary`, `card`, `not-found`) | `ecosystem.tsx`, `error-boundary.tsx`, `not-found.tsx` | Fase 4 para la maqueta; los restos se limpian o se retiran |
| El contenido inventado de la maqueta se anunciaba a los lectores de pantalla como si fueran datos reales | `ecosystem.tsx` | **Corregido.** Ver "Resuelto: accesibilidad" |
| El carrusel de pestañas del ecosistema avanza solo y **solo se detiene al pasar el ratón por encima**: quien navega con teclado o toca la pantalla no puede pausarlo. Además ignora `prefers-reduced-motion`, que el CSS sí respeta en siete lugares | `ecosystem.tsx` | Fase 5 o 6. Es una incoherencia del código consigo mismo |
| Sección Ecosistema muestra cifras inventadas y maqueta de `div` | `ecosystem.tsx` | Fase 4, con capturas reales |
| **El sitio se contradice a sí mismo.** La sección Operación dice "No mostramos cifras que no existen" y usa guiones como marcadores, mientras Ecosistema, justo encima, muestra "34 viajes hoy" y "Bs. 5.040" | `operations.tsx` frente a `ecosystem.tsx` | Fase 4. Es el argumento más fuerte para sustituir la maqueta por capturas reales |
| Alturas de línea: 12 valores sueltos | `src/styles/` | Fase 4, componente por componente |
| El contenido de la maqueta de teléfono se corta dentro de su recuadro (36px en escritorio, más en pantallas estrechas) | `ecosystem.css` | Se resuelve solo en la Fase 4, cuando la maqueta se sustituya por capturas reales |
| Queda un desborde decorativo de 16px a 320px, del resplandor difuminado del teléfono | `ecosystem.css` | Cosmético. No genera barra de desplazamiento |
| Separaciones y márgenes: más de 14 valores de `gap` y 13 de `margin-top` | `src/styles/` | Fase 4. La escala `--sp-*` ya está definida y esperando |
| `.gitignore` declara `public/hero-bus.webp` sin la ruta completa, así que no ignora nada | `.gitignore` raíz | Corregir la ruta |
| Restos de Replit: `components.json` y `.replit-artifact/artifact.toml` | landing | Evaluar si se retiran |
| `wouter` con una sola ruta y una 404 inalcanzable | `src/router.tsx` | Evaluar en la fase de cierre |

### Método de verificación

Las capturas con movimiento reducido **y animaciones apagadas** son
reproducibles: dos ejecuciones sobre el mismo código producen archivos idénticos.
Eso permite demostrar que un refactor no cambió nada comparando huellas SHA-256,
en lugar de confiar en una impresión visual.

`prefers-reduced-motion` por sí solo **no basta**: solo acorta las animaciones a
`.01ms`, y las que son infinitas se fotografían en un punto arbitrario del ciclo.
Hay que inyectar `animation: none !important` para congelarlas.

### Peso real de la página

```bash
node tools/medir-peso.mjs <dist> [puerto]
```

Intercepta la red con el protocolo de depuración de Chromium y suma los bytes
realmente transferidos, con gzip activado como en el servidor real. Es la única
cifra que importa: **el peso de la carpeta de despliegue no lo paga nadie.**

Todo cambio que afecte a imágenes, tipografías o dependencias debería pasar por
aquí, no por una estimación.

### Accesibilidad

```bash
node tools/auditar-accesibilidad.mjs <dist> [puerto] [salida.json]
```

Revisa la página en tres anchos con axe-core, reglas WCAG 2.1 AA más buenas
prácticas, y agrupa los hallazgos por gravedad.

### Tamaños de fuente fuera de la escala

```bash
node tools/revisar-escala.mjs <dirSrc>
```

Comprueba los CSS **y los componentes**. Tailwind tiene su propia escala de
tamaños: mezclarla con la del proyecto es como no tener ninguna. Esta revisión
existe porque la primera verificación solo miraba los CSS y se le escaparon 40
utilidades dentro de los componentes.

### Auditoría de composición

```bash
node tools/auditar-layout.mjs <dist> [puerto]
```

Recorre la página en cinco anchos (320, 390, 768, 1440 y 1920) y busca desbordes
horizontales, texto cortado y elementos fuera del viewport. Los elementos que
sangran a propósito (la escena del bus, el resplandor del teléfono, el adorno de
la marca) están excluidos.

Sirve para lo que el ojo no ve: una insignia que se sale de su tarjeta a 320px es
invisible en una captura de 1440px. **Todo cambio de tamaño de fuente debería
pasar por aquí.**
