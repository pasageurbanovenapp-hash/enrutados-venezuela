# Herramientas de verificación

Scripts de apoyo para comprobar que un cambio hace lo que dice. No forman parte
del build ni se despliegan: solo se ejecutan a mano.

Todos reciben sus rutas como argumentos, así que funcionan desde cualquier
directorio.

## Requisito: Playwright

Cuatro de estos scripts usan Playwright para abrir un navegador real. **No es una
dependencia del proyecto**, porque añadirla engordaría el CI con un navegador que
no hace falta para desplegar. Se instala aparte, donde prefieras:

```bash
npm install playwright
npx playwright install chromium
```

Si lo instalas en otra carpeta, ejecuta los scripts desde ahí o apunta
`NODE_PATH` a ese `node_modules`.

Los scripts `mapa-css`, `partir-css`, `aplicar-escala` y `autoalojar-fuentes` son
Node puro y no necesitan nada más.

---

## `capturar.mjs` — capturas comparables

```bash
node capturar.mjs <dist> <salida> [puerto] [modo]
```

Sirve el build, recorre la página para activar los revelados por scroll y toma
capturas en móvil, tablet y escritorio, más una por sección.

- **`modo`**: `normal` o `reduce`. El modo `reduce` apaga las animaciones y hace
  las capturas **reproducibles**. Dos ejecuciones sobre el mismo código producen
  archivos idénticos, así que comparar huellas SHA-256 es una prueba válida de
  que un refactor no cambió nada.
- Detecta la ruta base leyendo `index.html`, así que sirve tanto para un build
  local como para el artefacto de despliegue.

**`prefers-reduced-motion` por sí solo no basta:** solo acorta las animaciones a
`.01ms`, y las que son infinitas se fotografían en un punto arbitrario del ciclo.

## `auditar-layout.mjs` — desbordes y texto cortado

```bash
node auditar-layout.mjs <dist> [puerto]
```

Revisa cinco anchos (320, 390, 768, 1440 y 1920) buscando desbordes horizontales,
texto cortado y elementos fuera del viewport.

Detecta lo que el ojo no ve: una insignia que se sale de su tarjeta a 320px es
invisible en una captura de 1440px. **Todo cambio de tamaño de fuente debería
pasar por aquí.**

## `auditar-accesibilidad.mjs` — axe-core

```bash
node auditar-accesibilidad.mjs <dist> [puerto] [salida.json]
```

Revisa la página en tres anchos con axe-core, reglas WCAG 2.1 AA más buenas
prácticas, y agrupa los resultados por gravedad. Escribe además un JSON con el
detalle, para poder comparar entre rondas.

**Requiere `@axe-core/playwright`** además de Playwright.

## `revisar-escala.mjs` — tamaños fuera del sistema

```bash
node revisar-escala.mjs <dirSrc>
```

Comprueba dos cosas: que cada `font-size` de los CSS use un token `var(--fs-*)`, y
que ningún componente use utilidades de tamaño de Tailwind (`text-sm`,
`text-[9px]`). Tailwind tiene su propia escala: mezclarla con la del proyecto es
como no tener ninguna.

No necesita nada más que Node.

## `comparar-navegadores.mjs` — Chromium frente a WebKit

```bash
node comparar-navegadores.mjs <dist> <dirSalida> [puerto]
```

Carga el sitio en los dos motores a dos anchos y compara lo que puede diferir:
altura del documento, `overflow: clip` del armazón, la máscara del fondo, los
tamaños fluidos y el ajuste de las imágenes. Deja capturas de los dos motores.

Todo lo medido con una sola herramienta de navegador es una medición a medias.

## `medir-por-peticiones.mjs` — peso en cualquier motor

```bash
node medir-por-peticiones.mjs <dist> <chromium|webkit> [puerto]
```

Registra las peticiones de red reales y suma el tamaño en disco de cada archivo
servido. Funciona en WebKit, donde el protocolo de depuración de Chromium no
existe.

**Con esto se descubrió que WebKit descarga el `src` del `img` aunque el
navegador elija una fuente del `picture`.** El respaldo debe apuntar siempre a la
variante más pequeña.

## `medir-peso.mjs` — lo que descarga el usuario

```bash
node medir-peso.mjs <dist> [puerto]
```

Intercepta la red con el protocolo de depuración de Chromium y suma los bytes
**realmente transferidos**, agrupados por tipo. Sirve en móvil y escritorio, con
recorrido completo para que se carguen las imágenes diferidas.

Sirve la respuesta **con gzip**, igual que el servidor real. Sin eso la medición
mentiría: el JavaScript aparecería con su tamaño crudo y las proporciones
engañarían.

Es la única cifra que importa. El peso de la carpeta de despliegue no lo paga
nadie.

## `optimizar-imagen.py` — AVIF y WebP en dos tamaños

```bash
python optimizar-imagen.py <entrada> <dirSalida> [--ancho-movil 900]
```

Genera cuatro archivos (AVIF y WebP, en tamaño completo y reducido) e informa del
peso, el ahorro y la fidelidad de cada uno: diferencia máxima y media por canal, y
porcentaje de píxeles que se desvían más de 3 niveles sobre 255.

Una diferencia media por debajo de 2 es imperceptible a simple vista.

**Requiere Python con Pillow** y soporte de AVIF y WebP. Es la única herramienta
de esta carpeta que no es Node.

Resultado medido con el hero: 1809 kB de PNG pasan a 83 kB en AVIF de escritorio y
30 kB en móvil, con 1.27 niveles de diferencia media una vez renderizado.

## `tarjeta-social.mjs` — PNG para redes

```bash
node tarjeta-social.mjs <entrada.svg> <salida.png>
```

Las redes sociales no admiten SVG en las etiquetas de vista previa. Este script
rasteriza la tarjeta a 1200x630 con Chromium y aplica las tipografías reales.

## `autoalojar-fuentes.mjs` — tipografías locales

```bash
node autoalojar-fuentes.mjs <dirFuentes> <cssSalida>
```

Descarga los `.woff2` que sirve Google Fonts y genera un CSS con `@font-face`
locales, para no bloquear el primer pintado con una petición externa.

Deduplica por contenido: DM Sans es una fuente variable, así que sus cuatro
grosores comparten un solo archivo.

## `mapa-css.mjs` — mapa de un CSS

```bash
node mapa-css.mjs <archivo.css>
```

Lista los bloques de nivel superior con su rango de líneas y su selector. Sirve
para decidir cortes contiguos sin alterar el orden de cascada.

## `partir-css.mjs` — dividir un CSS monolítico

```bash
node partir-css.mjs <index.css>
```

Parte un CSS en módulos por responsabilidad **en rangos contiguos**: nunca
reordena una regla, porque el orden de cascada importa. Deja el `index.css` solo
con sentencias `@import`.

## `aplicar-escala.mjs` — aplicar la escala tipográfica

```bash
node aplicar-escala.mjs <dirEstilos>
```

Sustituye los tamaños sueltos por tokens de la escala. **Si encuentra un tamaño
que no está en su mapa, lo reporta en vez de inventar un mapeo.**
