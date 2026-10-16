# Reporte de estado — código actual de la landing

**Proyecto:** Enrutados Venezuela — landing pública
**Ruta revisada:** `artifacts/enrutados-venezuela/`
**Rama:** `modernizacion-landing`
**Commit de HEAD:** `ad056ad` — *fix(landing): honor reduced motion in hero* (10-oct-2026)
**Fecha del reporte:** 15-oct-2026
**Naturaleza:** inspección de solo lectura sobre el árbol de trabajo + verificaciones ejecutadas. No se modificó código, estilos, contenido ni configuración; el único archivo añadido es este reporte.

---

## 1. Resumen ejecutivo

La landing está en un estado **técnicamente sano**: compila, pasa lint y pasa el chequeo de tipos sin errores, y su arquitectura ya está separada en componentes de sección, módulos de estilo y datos.

Los números de hoy:

| Verificación | Resultado |
|---|---|
| `pnpm typecheck` | ✅ Sin errores |
| `pnpm lint` | ✅ Sin errores |
| `pnpm build` (BASE_PATH de Pages) | ✅ 1714 módulos, 16,17 s |
| Bundle JS | 274,44 kB (86,25 kB gzip) |
| Bundle CSS | 67,67 kB (13,32 kB gzip) |
| `tools/revisar-escala.mjs` | ⚠️ 40 utilidades de tamaño de Tailwind fuera de la escala |

Hay **tres cosas que sí requieren atención**, y ninguna es un fallo de compilación:

1. **Divergencia documento ↔ código:** la guía del repo (`Agents.md`) declara una estructura objetivo de **nueve secciones**, pero el código sigue componiendo **doce**. El refactor no ha empezado.
2. **La fuente de verdad de diseño citada por la guía no está en el lugar que la guía dice.** `Agents.md` manda leer `docs/DESIGN-CONSTITUTION.md`, sección 13; esa sección **no existe** en la copia de `docs/`. Solo existe en la copia de `UX-UI del Ecosistema/`, que está **ignorada por git**. Son dos archivos distintos (huellas distintas).
3. **Los datos de contacto no están centralizados**, contra una regla explícita de archivos protegidos: el pie de página usa `pilotos@enrutados.ve` a mano, mientras `src/data/contact.ts` define otro correo.

Además, el informe previo que existe en el repo (`REPORTE-REVISION-modernizacion-landing.md`) **quedó desactualizado**: revisa hasta `41c675a`, y desde entonces hay un commit más (`ad056ad`) que precisamente corrige el hallazgo de accesibilidad del hero que ese informe dejaba abierto.

---

## 2. Estado del repositorio

### 2.1 Control de versiones

```
rama:   modernizacion-landing
HEAD:   ad056ad  fix(landing): honor reduced motion in hero        (10-oct-2026)
        41c675a  refactor: partir CSS en módulos, escala…          (revisado en el informe previo)
        09268d1  style(chapter-break): use even atmospheric overlay
```

`ad056ad` es el único commit nuevo respecto de lo ya revisado. Toca dos archivos, +50 / −8 líneas:

| Archivo | Qué cambia |
|---|---|
| `src/components/sections/hero.tsx` | El hero ahora lee `prefers-reduced-motion` con `matchMedia`, arranca en estado `ready` si hay movimiento reducido, y escucha cambios de preferencia en vivo. |
| `src/styles/responsive.css` | Reglas explícitas con `!important` para el hero en movimiento reducido: apaga animaciones del bus, del overlay y de la entrada del titular; fuerza opacidad 1. |

Esto **cierra el hallazgo documentado en `Auditoria _hero.md`** (el contenido esencial del hero esperaba la secuencia cinematográfica aun con movimiento reducido). Ese documento sigue en el árbol sin actualizar su estado.

### 2.2 Cambios locales sin confirmar

| Estado | Ruta | Nota |
|---|---|---|
| Modificado | `.agents/Agents.md` | +19 / −4: introduce la estructura objetivo de nueve secciones |
| Sin seguimiento | `artifacts/enrutados-venezuela/public/images/apps/` (6 archivos) | Capturas AVIF/WebP de las tres apps, 183 kB. **No las referencia ningún componente todavía** |
| Sin seguimiento | `docs/Auditoria _hero.md` | Diagnóstico del hero con movimiento reducido |
| Sin seguimiento | `docs/Propuestapara audiences-ecosystem.md` | Propuesta narrativa de copy para Audiences |
| Sin seguimiento | `docs/REPORTE-REVISION-modernizacion-landing.md` | Informe previo (revisa hasta `41c675a`) |
| Sin seguimiento | `scripts/diagnosticar-overflow-landing.mjs`, `scripts/enrutados-preparar-evidencia-hero.ps1`, `tools/preparar-capturas-apps.py` | Herramientas de evidencia |

El resto del árbol versionado está limpio. `dist/` está correctamente ignorado.

> **Riesgo:** ahí fuera hay material de decisión (dos propuestas de diseño y seis imágenes de app ya optimizadas) que vive solo en el disco de esta máquina. Si esa carpeta se pierde, se pierde el trabajo.

---

## 3. Arquitectura del código

### 3.1 Entrada y enrutado

| Archivo | Líneas | Función |
|---|---:|---|
| `src/main.tsx` | 17 | Monta React sobre `#root` |
| `src/App.tsx` | 12 | Envuelve todo en `wouter` con `base` tomado de `BASE_URL` |
| `src/router.tsx` | 21 | `Switch` con una sola ruta real (`/` → `Home`) y `NotFound`; el error boundary se rearma por `location` |
| `src/pages/home.tsx` | 5 | Renderiza `LandingPage` |
| `src/features/landing/landing-page.tsx` | 42 | **Composición de la página**: título del documento, hook de revelado y el orden de las doce secciones |

El enrutador existe pero sostiene una sola página. `not-found.tsx` es un resto en inglés y en tema claro con utilidades de Tailwind de otro sistema.

### 3.2 Volumen del código

| Área | Archivos | Líneas |
|---|---:|---:|
| `src/components/sections/` | 12 | 1.804 |
| `src/styles/` (incluye `fonts.css`) | 23 | 2.366 |
| `src/styles/` (módulos, sin `fonts.css`) | 22 | 2.220 |
| Total `src/` (`*.ts`, `*.tsx`, `*.css`) | 55 | 4.970 |

Los dos archivos más pesados son `problem.tsx` (441 líneas) y `ecosystem.tsx` (417 líneas). Entre los dos concentran **casi la mitad (48 %)** del código de secciones.

### 3.3 Comportamiento interactivo

| Mecanismo | Dónde | Cómo funciona |
|---|---|---|
| Revelado por scroll | `hooks/use-reveal-on-scroll.ts` (35 líneas) | Un `IntersectionObserver` añade `is-visible` a cada `.reveal` y deja de observarlo. Sin `scroll` listeners |
| Título del documento | `hooks/use-document-title.ts` | Efecto simple sobre `document.title` |
| Máquina de estados del hero | `hero.tsx` | `initial → entering → ready → transitioning`, con respeto a `prefers-reduced-motion` desde `ad056ad` |
| Carrusel del ecosistema | `ecosystem.tsx` | `setInterval` de 6 s que rota las tres apps; se detiene al pasar el ratón y al primer clic; expone `role="tablist"`/`role="tab"`/`role="tabpanel"` |
| Escena del problema | `problem.tsx` | Animación con `<style>` **incrustado dentro del componente**, con su propio `@media (prefers-reduced-motion)` |

**Incoherencia detectada:** el hero ya respeta `prefers-reduced-motion` (`ad056ad`), pero el carrusel del ecosistema **no lo consulta en ningún momento**: su `setInterval` no distingue la preferencia y solo se pausa con el ratón. Quien navega con teclado o toca la pantalla no puede detenerlo. Es deuda ya conocida en la constitución, pero ahora el código se contradice consigo mismo de forma más visible.

**Escape de estilo:** el `<style>` embebido en `problem.tsx` es el único lugar donde hay CSS fuera de `src/styles/`, lo que rompe la convención de módulos.

---

## 4. Composición actual de la página

`landing-page.tsx` monta, en este orden, doce secciones:

| # | Componente | Líneas | Ancla / `aria-labelledby` | `data-testid` | Contenido desde |
|---:|---|---:|---|---|---|
| 1 | `hero.tsx` | 113 | `#inicio` / `hero-title` | `button-hero-pilot`, `link-hero-explanation` | JSX |
| 2 | `proof-band.tsx` | 21 | — | — | JSX |
| 3 | `problem.tsx` | 441 | `problem-title` | — | JSX + `<style>` |
| 4 | `chapter-break.tsx` | 36 | — | — | JSX |
| 5 | `audiences.tsx` | 59 | `#para-quien` / `audience-title` | — | `data/audience-cards.ts` |
| 6 | `ecosystem.tsx` | 417 | `#ecosistema` / `ecosystem-title` | — | `data/ecosystem-actors.ts` |
| 7 | `journey.tsx` | 159 | `#journey` / `journey-title` | — | JSX |
| 8 | `how-it-works.tsx` | 165 | `#como-funciona` / `how-title` | — | JSX |
| 9 | `operations.tsx` | 141 | `#operacion` / `operations-title` | — | JSX |
| 10 | `honesty.tsx` | 75 | `honesty-title` | — | JSX |
| 11 | `faq-section.tsx` | 68 | `#preguntas` / `faq-title` | — | `data/faqs.ts` |
| 12 | `contact.tsx` | 109 | `#piloto` / `contact-title` | 5 en total | `data/contact.ts` |

### 4.1 Anclas y navegación

- **Barra superior** → `#como-funciona`, `#para-quien`, `#preguntas`, `#piloto`
- **Pie** → `#inicio`, `#preguntas`, `mailto:pilotos@enrutados.ve`
- **Hero** → `#piloto`, `#como-funciona`

Las anclas de navegación y los `data-testid` están declarados **archivos protegidos** en `Agents.md`: hay enlaces externos y pruebas que dependen de ellos. Cualquier fusión de secciones debe conservarlos.

### 4.2 Cumplimiento de la convención "contenido en `src/data/`"

`Agents.md` dice: *"Contenido en `src/data/`, nunca incrustado en el JSX"*. En la práctica solo **cuatro** secciones cumplen (Audiences, Ecosystem, FAQ, Contact). Las otras ocho llevan el copy dentro del componente, y `problem.tsx` incluso lleva estilos. La convención está escrita pero no se aplica de forma general.

---

## 5. Sistema de estilos

`src/index.css` tiene 32 líneas y **solo sentencias `@import`**. El orden es funcional y está documentado en el propio archivo: primero `fonts.css`, luego Tailwind, y después los 22 módulos.

| Módulo | Líneas | Módulo | Líneas |
|---|---:|---|---:|
| `hero.css` | 393 | `honesty.css` | 124 |
| `ecosystem.css` | 309 | `faq.css` | 92 |
| `route-line.css` | 260 | `tokens.css` | 89 |
| `journey.css` | 207 | `chapter-break.css` | 88 |
| `operations.css` | 206 | `responsive.css` | 85 |
| `fonts.css` *(no es módulo de sección)* | 146 | `base.css` | 67 |
| `layout.css` | 65 | `refinements.css` | 54 |
| `contact-channels.css` | 49 | `how-it-works.css` | 42 |
| `audiences.css` | 33 | `contact.css` | 15 |
| `proof-band.css` | 10 | `problem.css` | 9 |
| `footer.css` | 9 | `motion.css` | 8 |
| `sections.css` | 6 | | |

### 5.1 Tokens (`tokens.css`)

- **Colores de marca:** `--bg #0a1628`, `--cyan #22d3ee`, `--orange #f59e0b`, `--violet #8b5cf6`, más superficies, texto y estados (`--success`, `--warning`, `--error`).
- **Escala tipográfica cerrada de 8 pasos:** `--fs-label` 11px · `--fs-sm` 14px · `--fs-base` 16px · `--fs-md` 18px · `--fs-lg` 22px · `--fs-xl` 26px · `--fs-title` y `--fs-hero` con `clamp()` fluido. Prefijo `--fs-` a propósito, para no chocar con el espacio `--text-*` de Tailwind.
- **Espaciado:** `--sp-1` … `--sp-10` (base 4 px).
- **Ritmo vertical:** `--section-y` 128px, `--section-y-sm` 80px.

El propio archivo documenta lo que queda pendiente: las alturas de línea siguen con 12 valores sueltos, y solo el cuerpo está tokenizado.

### 5.2 Tipografía y movimiento

- **DM Sans** (UI) y **Space Mono** (datos) **autoalojadas** en `src/assets/fonts/`: 8 archivos, 131,5 kB en total. Ya no hay petición a Google Fonts en la ruta crítica.
- Movimiento por CSS + `IntersectionObserver`. Sin `framer-motion`.
- Reglas de `prefers-reduced-motion` repartidas en **siete** lugares: `responsive.css`, `ecosystem.css`, `chapter-break.css`, `journey.css`, `operations.css`, `route-line.css` y el `<style>` de `problem.tsx`.

---

## 6. Recursos

| Grupo | Archivos | Peso |
|---|---:|---:|
| Imágenes en `public/` (AVIF, WebP, PNG, SVG) | 20 | 1.041 kB |
| Tipografías en `src/assets/fonts/` | 8 | 131,5 kB |
| Salida de build (`dist/public`) | 32 | 1.509 kB en disco |

La carpeta `fuentes/` conserva los originales maestros (incluido el hero de 1,81 MB en PNG) **fuera del despliegue**, que es exactamente lo que debe pasar.

Peso real ya medido en fases anteriores (interceptando la red, con gzip): **290 kB en móvil** y **401 kB en escritorio**, frente a ~2.267 kB del estado inicial.

---

## 7. Verificaciones ejecutadas en esta revisión

| Comprobación | Comando | Resultado |
|---|---|---|
| Tipos de la landing | `pnpm --dir artifacts/enrutados-venezuela typecheck` | ✅ exit 0 |
| Lint de la landing | `pnpm --dir artifacts/enrutados-venezuela lint` | ✅ exit 0 |
| Build de producción | `BASE_PATH=/enrutados-venezuela/ pnpm --dir … build` | ✅ exit 0 · 1714 módulos · 16,17 s |
| Escala tipográfica | `node tools/revisar-escala.mjs artifacts/enrutados-venezuela/src` | ⚠️ 40 escapes |

### 7.1 Comparación con el informe previo

| Métrica | `41c675a` (informe previo) | `ad056ad` (hoy) | Variación |
|---|---:|---:|---:|
| JavaScript | 274,085 kB | 274,44 kB | +0,36 kB |
| CSS | 67,109 kB | 67,67 kB | +0,56 kB |

El coste del arreglo de movimiento reducido es inferior a 1 kB. Es un intercambio razonable.

### 7.2 Nota de entorno

`pnpm build` **no puede ejecutarse bajo el sandbox confinado** de este entorno: Vite invoca esbuild, y esbuild abre su servicio por stdio con pipe, lo que el sandbox bloquea con `spawn EPERM`. No es un problema del proyecto; el build completo pasó al reintentarlo con permiso ampliado. Quien reproduzca esto debe saber que un `EPERM` aquí es el sandbox, no el código.

---

## 8. Hallazgos

| # | Hallazgo | Evidencia | Gravedad |
|---:|---|---|---|
| 1 | El código tiene 12 secciones; la guía declara 9 como objetivo | `landing-page.tsx` vs `.agents/Agents.md` | **Alta** (divergencia doc↔código) |
| 2 | `Agents.md` cita `docs/DESIGN-CONSTITUTION.md` §13; esa sección no existe en `docs/`. Solo está en `UX-UI del Ecosistema/`, que git ignora. Las dos copias difieren | Huellas `633533D4…` (docs) vs `D0DC578B…` (UX-UI); 15 vs 16 encabezados | **Alta** (gobernanza de diseño) |
| 3 | Datos de contacto duplicados: el pie usa `pilotos@enrutados.ve`, `data/contact.ts` usa otro correo. `Agents.md` marca el contacto como dato centralizado y protegido | `layout/footer.tsx:16` vs `data/contact.ts:10` | **Alta** (regla protegida + dominio sin resolver) |
| 4 | 40 utilidades de tamaño de Tailwind fuera de la escala: 34 en la maqueta del teléfono de `ecosystem.tsx`, y 6 en restos (`error-boundary`, `card`, `not-found`) | `revisar-escala.mjs`: 40 escapes | Media |
| 5 | Seis capturas de app nuevas en `public/images/apps/` (183 kB) que **se despliegan pero ningún componente usa** | Sin referencias en `src/` | Media |
| 6 | El carrusel del ecosistema ignora `prefers-reduced-motion`, mientras el hero ya lo respeta | `ecosystem.tsx:37-45` sin `matchMedia` | Media (a11y) |
| 7 | El informe previo en el repo quedó desactualizado (revisa hasta `41c675a`) y no está versionado | `docs/REPORTE-REVISION-…md` sin seguimiento | Media |
| 8 | Copy fuera de `src/data/` en 8 de 12 secciones, contra la convención escrita | `Agents.md` vs componentes | Baja |
| 9 | CSS incrustado en `problem.tsx`, único caso fuera de `src/styles/` | `problem.tsx:327,372` | Baja |
| 10 | `not-found.tsx` es un resto en inglés y tema claro, con utilidades de otro sistema; `wouter` sostiene una sola ruta | `pages/not-found.tsx`, `router.tsx` | Baja |
| 11 | Canonical apunta a la URL de GitHub Pages, aunque el historial tuvo `enrutados.ve`; el pie enlaza a ese dominio | `index.html:10` vs `footer.tsx:16` | Baja (decisión pendiente) |

---

## 9. Brecha con la estructura objetivo

`Agents.md` (cambio sin confirmar) define una secuencia narrativa **problema → propuesta → funcionamiento → estado real del producto** con nueve secciones. Comparada con el código actual:

| Objetivo (9) | Estado en el código | Trabajo implícito |
|---|---|---|
| 1. Hero | Existe, con franja de tres actores | Retirar `.hero-proof` |
| 2. El desafío | `problem.tsx` | Renombrar/ajustar |
| 3. Pausa visual | `chapter-break.tsx` | Ninguno |
| 4. Perspectivas | `audiences.tsx` + `ecosystem.tsx` | **Fusionar** e insertar las capturas reales |
| 5. El recorrido | `journey.tsx` + `how-it-works.tsx` | **Fusionar** |
| 6. Operación | `operations.tsx` | Ninguno |
| 7. Hablemos claro | `honesty.tsx` | Sumar transparencia de dinero y origen |
| 8. Preguntas | `faq-section.tsx` | Ninguno |
| 9. Contacto | `contact.tsx` | Ninguno |
| — | `proof-band.tsx` | **Retirar** (repite a los tres actores) |

Las capturas nuevas de `public/images/apps/` son **tres apps en dos formatos cada una** y corresponden justamente a lo que pide la sección 4 (capturas reales en lugar de maqueta), así que **el material ya está preparado pero sin conectar**. La propuesta de copy para Audiences también está escrita y sin aplicar.

Ninguna fusión debe tocar las anclas (`#para-quien`, `#como-funciona`, `#preguntas`, `#piloto`) ni los `data-testid`: son archivos y valores protegidos.

---

## 10. Recomendaciones

**Antes de seguir construyendo:**

1. **Resolver la fuente de verdad de diseño.** Unificar `docs/DESIGN-CONSTITUTION.md` y `UX-UI del Ecosistema/DESIGN-CONSTITUTION.md` en una sola copia versionada dentro de `docs/`, para que la sección 13 citada por `Agents.md` exista donde dice.
2. **Versionar o descartar lo que está sin confirmar**, en especial las seis capturas de app y las dos propuestas de diseño: hoy solo viven en este disco.
3. **Centralizar el contacto.** El pie debe leer de `data/contact.ts`; y hay que decidir de una vez si el dominio público es `enrutados.ve` (ninguno de los dos correos resuelve hoy de forma comprobada).
4. **Actualizar el informe previo** o marcarlo como histórico: revisa hasta `41c675a` y ya hay un commit posterior.

**Al ejecutar el refactor de nueve secciones:**

5. Conservar anclas, `data-testid` y etiquetas de la barra sin excepción.
6. Cerrar los 40 escapes tipográficos de Tailwind antes o durante la fase 4, ya que 34 viven en la maqueta que se va a sustituir por capturas reales.
7. Dar al carrusel del ecosistema el mismo trato que al hero: respetar `prefers-reduced-motion` y permitir pausa por teclado.
8. Mover el `<style>` de `problem.tsx` a `src/styles/` cuando se toque esa sección.

**Verificación mínima para cada cambio:** `typecheck` → `lint` → `build` → capturas reproducibles en modo `reduce` → `auditar-layout.mjs` (cinco anchos) → `auditar-accesibilidad.mjs`.

---

## Anexo A — Comandos usados

```powershell
# Verificaciones
corepack pnpm --dir artifacts/enrutados-venezuela typecheck
corepack pnpm --dir artifacts/enrutados-venezuela lint
$env:BASE_PATH='/enrutados-venezuela/'; corepack pnpm --dir artifacts/enrutados-venezuela build
node tools\revisar-escala.mjs artifacts\enrutados-venezuela\src

# Contexto
git -C repo-enrutados log --oneline -8
git -C repo-enrutados status --short
git -C repo-enrutados diff 41c675a..HEAD
```

Herramientas disponibles en `tools/` y aún no ejecutadas en esta revisión: `auditar-layout.mjs`, `auditar-accesibilidad.mjs`, `medir-peso.mjs`, `capturar.mjs`, `comparar-navegadores.mjs`, `mapa-css.mjs`, `optimizar-imagen.py`.

## Anexo B — Inventario de `src/`

```
src/
├── main.tsx · App.tsx · router.tsx · index.css
├── assets/fonts/          8 archivos woff2 (131,5 kB)
├── components/
│   ├── layout/            brand, footer, topbar           (80 líneas)
│   ├── sections/          12 secciones                  (1.804 líneas)
│   ├── ui/                card, route-line                (237 líneas)
│   └── error-boundary.tsx                                 (106 líneas)
├── data/                  audience-cards, contact, ecosystem-actors, faqs  (176 líneas)
├── features/landing/      landing-page.tsx                 (42 líneas)
├── hooks/                 use-document-title, use-reveal-on-scroll  (42 líneas)
├── lib/utils.ts                                             (7 líneas)
├── pages/                 home, not-found
└── styles/                23 módulos CSS                  (2.366 líneas)
```

---

**Dictamen:** la landing está **lista para continuar** sobre esta rama: compila, pasa lint y tipos, tiene arquitectura modular y recursos ya optimizados. Lo que falta no es deuda técnica de compilación, sino **alinear los documentos con el código** (secciones objetivo, fuente de verdad de diseño, contacto centralizado) y **conectar el material que ya está preparado pero sin usar** (capturas de app y propuesta de copy).
