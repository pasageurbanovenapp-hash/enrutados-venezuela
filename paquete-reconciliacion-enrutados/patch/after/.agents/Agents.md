# AGENTS.md — Guía para asistentes locales

> Documento de contexto y reglas para asistentes de código (Kilo, Copilot, Claude,
> Cursor, etc.) que trabajen en este repositorio. Léelo completo antes de proponer
> o aplicar cambios.
>
> **Antes de tocar la landing, lee también `docs/DESIGN-CONSTITUTION.md`.** Es la
> fuente de verdad de diseño y tiene prioridad sobre cualquier preferencia
> estética del asistente.

---

## 📖 Contexto del proyecto

**Enrutados Venezuela** es un ecosistema de transporte público digitalizado en fase
piloto. Nació como proyecto de feria estudiantil y evolucionó hacia un prototipo
funcional con tres apps móviles (pasajero, conductor/colector, admin), backend
Node/Express, y base de datos Supabase/PostGIS.

La **landing pública** (este repo) es la carta de presentación del proyecto ante
tres actores:
- **Pasajeros** — consultan, pagan y viajan
- **Conductores / Colectores** — validan pasajes, no administran caja
- **Asociaciones de transporte** — gestionan con información

**Principio editorial:** honestidad. Sin datos falsos, sin promesas infladas,
sin marketing genérico. La landing dice lo que el sistema hace y lo que aún no.

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node 24 LTS (el CI está alineado a 24) |
| Package manager | pnpm (workspace monorepo) |
| Framework | Vite 7 + React 19 |
| Lenguaje | TypeScript 5.9 (strict) |
| Estilos | Tailwind 4 + CSS custom properties |
| Tipografía | DM Sans (UI), Space Mono (datos/mono) |
| Iconos | lucide-react |
| Animaciones | CSS + IntersectionObserver (sin framer-motion en la landing) |
| Router | wouter |
| Lint | ESLint 9 (flat config) |

---

## 📁 Estructura de la landing

```
artifacts/enrutados-venezuela/
├── public/                      # assets servidos tal cual
│   ├── hero.avif                # 83 kB (escritorio)
│   ├── hero.webp                # 138 kB (respaldo)
│   ├── hero-movil.avif          # 30 kB (pantallas estrechas)
│   ├── hero-movil.webp          # 48 kB
│   ├── images/                  # city-night en AVIF y WebP, en dos tamanos
│   ├── icons/                   # pasajero, conductor, admin (WebP de 160px)
│   ├── favicon.svg
│   ├── social-card.svg          # fuente editable de la tarjeta social
│   ├── social-card.png          # 1200x630, la que usan las redes
│   └── robots.txt
├── fuentes/                     # originales maestros, NO se despliegan
│   ├── hero.png                 # 1.81 MB
│   ├── city-night.webp          # 174 kB
│   └── pasajero.png, conductor.png, admin.png   # 256x256
├── index.html
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── src/
    ├── main.tsx                 # punto de entrada
    ├── App.tsx
    ├── router.tsx               # wouter, una sola ruta
    ├── index.css                # solo sentencias @import
    ├── styles/                  # 22 modulos de estilo, en orden de cascada
    ├── assets/fonts/            # tipografias autoalojadas (DM Sans, Space Mono)
    ├── components/
    │   ├── layout/              # topbar, footer, brand
    │   ├── sections/            # una sección de la landing por archivo
    │   └── ui/                  # card, route-line
    ├── data/                    # contenido tipado (contacto, faqs, actores)
    ├── features/landing/        # composición de la página
    ├── hooks/
    ├── lib/
    └── pages/                   # home, not-found
```

**El orden de los `@import` en `src/index.css` es funcional.** Hay ajustes
posteriores (`styles/refinements.css`, `styles/how-it-works.css`) que dependen
del orden de cascada. No los reordenes sin volver a verificar visualmente.

### Orden de las secciones

Definido en `src/features/landing/landing-page.tsx`:

Hero, ProofBand, Problem, ChapterBreak, Audiences, Ecosystem, Journey,
HowItWorks, Operations, Honesty, FaqSection, Contact.

Cada bloque conserva su cometido. El detalle está en `docs/DESIGN-CONSTITUTION.md`,
en la sección 13 de la actualización documental propuesta, y el registro de
decisiones en el encabezado de ese documento.

- `Audiences` y `Ecosystem` se mantienen **separados**: uno argumenta el valor que
  Enrutados aporta a cada actor; el otro demuestra visualmente las experiencias del
  producto.
- `Journey` y `HowItWorks` se mantienen **separados**, con cometidos distintos: el
  recorrido del usuario frente al mecanismo del sistema. La confirmación documental
  supera el antecedente que registraba su fusión.
- `ProofBand` **se conserva**: es el puente entre la propuesta del Hero y la
  realidad humana del transporte. No se retira por repetir a los tres actores, y no
  es lo mismo que la franja decorativa interna del Hero.
- `ChapterBreak` es una **transición** entre el problema y las perspectivas: no es
  una sección de contenido ni propone valor propio.

> **Propuesta no aprobada.** La reestructuración a nueve secciones queda archivada
> como antecedente en `docs/propuestas/PROPUESTA-estructura-nueve-secciones.md`.
> **No es normativa y no autoriza cambios de arquitectura.** Mientras no se
> apruebe, la referencia vigente es `docs/DESIGN-CONSTITUTION.md`.

---

## ✅ Convenciones

- **Un componente por archivo**, con nombre en `kebab-case`.
- **Componentes en PascalCase**, hooks con prefijo `use`.
- **Contenido en `src/data/`**, nunca incrustado en el JSX. El texto editable no
  vive dentro de los componentes.
- **Alias `@/`** para importar desde `src/`. Es el único alias: el antiguo
  `@assets` apuntaba a una carpeta inexistente y ya fue retirado.
- **Rutas de assets públicos** con `import.meta.env.BASE_URL`, nunca con `/`
  absoluto. El sitio se publica en un subdirectorio.
- **TypeScript estricto.** Sin `any` ni `@ts-ignore` sin justificar.
- **Sin `useState` para valores continuos** de scroll o puntero: usar
  `IntersectionObserver` o `useScroll`.
- **Nada de `window.addEventListener('scroll')`** para animar.
- **Ni un tamaño de fuente suelto.** Todos salen de la escala de
  `styles/tokens.css` (`--fs-label`, `--fs-sm`, `--fs-base`, `--fs-md`,
  `--fs-lg`, `--fs-xl`, `--fs-title`, `--fs-hero`). El ritmo vertical de sección
  sale de `--section-y` y `--section-y-sm`. El prefijo `--fs-` es deliberado:
  `--text-*` pertenece a Tailwind.
- **Comentarios en el idioma del archivo**, no mezclados.

---

## 🔒 Archivos y valores protegidos

No se modifican sin aprobación explícita del cliente:

| Elemento | Dónde | Por qué |
|---|---|---|
| Anclas de navegación | `#inicio`, `#piloto`, `#como-funciona`, etc. | Hay enlaces externos apuntando ahí |
| `data-testid` | componentes de sección | Pruebas y analítica dependen de ellos |
| Etiquetas de la barra de navegación | `layout/topbar.tsx` | Memoria del usuario y posicionamiento |
| Logo y marca | `layout/brand.tsx` | Identidad |
| Datos de contacto | `data/contact.ts` | El correo y el WhatsApp están centralizados: no duplicar |
| Colores de marca | `index.css` | Definidos en la constitución |
| Textos legales | `layout/footer.tsx` | Cumplimiento |

---

## 🚦 Comandos

```bash
# Desde la raíz del monorepo
pnpm install                                  # instala todo el workspace

# Desde artifacts/enrutados-venezuela
pnpm dev            # servidor de desarrollo
pnpm build          # build de producción
pnpm lint           # ESLint
pnpm lint:fix       # ESLint con corrección automática
pnpm typecheck      # tsc sin emitir
```

Build para GitHub Pages:

```bash
BASE_PATH=/enrutados-venezuela/ pnpm build
```

### Verificación visual

```bash
node ../tools/capturar.mjs <dist> <salida> [puerto] [modo]
```

Sirve el build, recorre la página para activar los revelados por scroll y toma
capturas en móvil, tablet y escritorio, más una por sección.

El modo `reduce` apaga las animaciones y hace las capturas **reproducibles**: dos
ejecuciones sobre el mismo código dan archivos idénticos. Comparar huellas
SHA-256 es entonces una prueba válida de que un refactor no cambió nada.

`prefers-reduced-motion` por sí solo **no basta**: solo acorta las animaciones a
`.01ms`, y las infinitas se fotografían en un punto arbitrario del ciclo.

### Peso real de la página

```bash
node ../tools/medir-peso.mjs <dist> [puerto]
```

Intercepta la red con el protocolo de depuración de Chromium y suma los bytes
realmente transferidos, con gzip activado como en el servidor real. Es la única
cifra que importa: el peso de la carpeta de despliegue no lo paga nadie.

### Comparación entre motores

```bash
node ../tools/comparar-navegadores.mjs <dist> <dirSalida> [puerto]
node ../tools/medir-por-peticiones.mjs <dist> <chromium|webkit> [puerto]
```

Carga el sitio en Chromium y en WebKit y compara lo que puede diferir. La segunda
mide el peso por peticiones reales, y funciona en WebKit, donde el protocolo de
depuración de Chromium no existe.

**Todo lo medido con una sola herramienta es una medición a medias.**

### Accesibilidad

```bash
node ../tools/auditar-accesibilidad.mjs <dist> [puerto]
```

Revisa tres anchos con axe-core (WCAG 2.1 AA más buenas prácticas) y agrupa los
hallazgos por gravedad.

### Tamaños de fuente fuera de la escala

```bash
node ../tools/revisar-escala.mjs src
```

Comprueba los CSS **y los componentes**. Tailwind tiene su propia escala: usar
`text-sm` o `text-[9px]` en un componente se salta el sistema del proyecto igual
que un `font-size` suelto.

### Auditoría de composición

```bash
node ../tools/auditar-layout.mjs <dist> [puerto]
```

Revisa cinco anchos (320, 390, 768, 1440, 1920) buscando desbordes horizontales,
texto cortado y elementos fuera del viewport. Los elementos que sangran a
propósito están excluidos.

Una insignia que se sale de su tarjeta a 320px es invisible en una captura de
1440px: esto detecta lo que el ojo no ve. Pasa por aquí todo cambio de tamaño de
fuente.

---

## 🧪 Verificación antes de dar algo por terminado

1. `pnpm typecheck` sin errores.
2. `pnpm lint` sin errores.
3. `pnpm build` correcto.
4. Capturas nuevas y comparación con las anteriores.
5. Revisar la lista de la sección 10 de la constitución.

Si el cambio era un refactor sin intención visual, **las capturas deben ser
idénticas**. Una diferencia visible es un error, no una mejora.

---

## ⚠️ Errores que ya cometimos

- **Instalar con `--filter`** en lugar del workspace completo. El árbol de
  dependencias queda inconsistente y el build falla con
  `Cannot find package '@rolldown/pluginutils'`. Usar la instalación completa.
- **Confiar en `realpath` en entornos con sandbox.** Los enlaces de pnpm pueden
  no resolverse. Solución local: `--config.node-linker=hoisted`.
- **Servir fotografías en PNG.** El hero llegó a pesar 1.81 MB en PNG. Ahora se
  sirve en AVIF (83 kB) y WebP (138 kB), con variante móvil, y el maestro vive en
  `fuentes/` fuera del despliegue. Para imágenes nuevas: `tools/optimizar-imagen.py`.
- **Construir maquetas de interfaz con `div`.** Está prohibido: usar capturas
  reales de las apps.
- **Deduplicar archivos de fuente por nombre en lugar de por contenido.** Al
  autoalojar tipografías, DM Sans es una fuente variable: los cuatro grosores
  comparten archivo, pero Space Mono 400 y 700 son distintos. Si el nombre no
  incluye el grosor, uno sobrescribe al otro y el texto cambia de peso.
- **Confiar en `prefers-reduced-motion` para congelar animaciones.** Solo las
  acorta. Las infinitas siguen girando y las capturas dejan de ser comparables.
- **Dar por buena la documentación de diseño sin cruzarla con el código.**
  `DESIGN.md` describe otra marca distinta de la implementada.
- **Olvidar que los elementos de rejilla tienen `min-width: auto`.** Pueden forzar
  el contenedor a ser más ancho que su espacio. Si el armazón usa
  `overflow: clip`, el resultado no es una barra de desplazamiento sino contenido
  recortado e invisible. Se resuelve con `min-width: 0` en los hijos.
- **Confiar en una sola captura de escritorio.** Los desbordes aparecen en los
  anchos extremos. Para eso está la auditoría de composición.
- **Recodificar una imagen que ya estaba comprimida.** La banda nocturna era un
  WebP de 174 kB ya optimizado; recodificarlo con más calidad produjo 232 kB, un
  34% más. `tools/optimizar-imagen.py` ahora conserva el original cuando el
  resultado no mejora, e indica "conservado".
- **Declarar una opción de línea de comandos y no conectarla.** El parámetro
  `--calidad-avif` se aceptaba pero se ignoraba en silencio. Si añades una opción,
  comprueba que el resultado cambia.
- **Medir el peso sin compresión.** Un servidor local sin gzip hace que el
  JavaScript parezca tres veces más pesado y falsea el reparto por tipo.
- **Verificar solo los archivos CSS.** La escala tipográfica quedó limpia en los
  CSS mientras 40 utilidades de Tailwind en componentes se la saltaban. Por eso
  existe `tools/revisar-escala.mjs`.
- **Escribir una expresión regular con `\b` después de un corchete.** No hay
  frontera de palabra tras un `]`, así que la comprobación ignoraba en silencio
  valores como `text-[9px]` y daba un recuento muy por debajo del real.
- **Presentar contenido inventado a los lectores de pantalla.** La maqueta del
  teléfono anunciaba "34 viajes hoy, Bs. 5.040" como datos reales. Lo que no se
  ve también se afirma: el contenido ilustrativo inventado va con `aria-hidden`.
- **Poner la imagen grande en el `src` de un `img` dentro de un `picture`.**
  WebKit descarga ese `src` aunque el navegador elija una fuente del `picture`.
  Medido: en móvil se bajaban 186 kB en lugar de 48. El respaldo apunta siempre a
  la variante más pequeña; solo existe para navegadores sin soporte de `picture`.
- **Medir el rendimiento en un solo motor.** La descarga duplicada llevaba dos
  rondas ahí y no aparecía porque todas mis mediciones eran en Chromium.
- **Confundir una hipótesis con un diagnóstico.** Sospeché tres causas distintas
  de la descarga duplicada y las tres eran falsas. Solo se confirmó al parchear
  el código compilado en una copia y volver a medir.
