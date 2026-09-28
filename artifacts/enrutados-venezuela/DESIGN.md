# Enrutados Ven — Style Reference
> Centro de control nocturno para transporte urbano — canvas casi negro, líneas neón cian-verde trazando rutas de datos sobre metal oscuro.

**Theme:** dark

Enrutados Ven se presenta como un centro de operaciones tecnológico después del atardecer: canvas casi negro, tipografía blanca precisa, y un acento neón en degradado cian→verde que traza "rutas de datos" sobre el vehículo y la interfaz, igual que las líneas de luz sobre el bus de la campaña. El ritmo visual es editorial — secciones amplias, bloques de texto alineados a la izquierda, visuales de producto (unidades, rutas, mapas) a la derecha, con halos de resplandor suaves. Los componentes se sienten construidos, no decorados: bordes finos tipo hairline, superficies de vidrio esmerilado (glassmorphism) para tarjetas de features, y elevación casi nula fuera de esos paneles de vidrio. El acento neón brilla, pero nunca compite con el texto ni con los botones de acción.

<https://enrutadosven.com>

## Tokens — Colores

| Nombre | Valor | Token | Rol |
|--------|-------|-------|-----|
| Obsidiana | `#0a1628` | `--color-bg` | Canvas principal, fondo de página — el "piso" de todo |
| Carbono | `#0d2438` | `--color-surface` | Tarjetas y superficies elevadas — un paso arriba del canvas |
| Grafito | `#1c3549` | `--color-border` | Bordes, divisores, superficies inset, fondo de nav |
| Vidrio | `rgba(255,255,255,0.06)` | `--color-glass` | Fondo de tarjetas glassmorphism sobre imagen/gradiente |
| Niebla | `#8fa3b3` | `--color-fog` | Texto secundario, subtítulos, metadatos |
| Bruma | `#5c7284` | `--color-mist` | Texto terciario, íconos, estado deshabilitado |
| Papel | `#ffffff` | `--color-paper` | Texto primario, íconos, alto contraste |
| Cian Neón | `#22d3ee` | `--color-neon-cyan` | Extremo frío del degradado de marca — glow de producto, íconos, bordes activos |
| Verde Menta | `#34d399` | `--color-neon-green` | Extremo cálido del degradado de marca — CTAs, badges de estado ("Pago exitoso", "En servicio") |
| Degradado Marca | `linear-gradient(90deg, #22d3ee 0%, #34d399 100%)` | `--gradient-brand` | Logo, líneas de ruta, CTA primario, bordes de tarjeta destacada |
| Alerta | `#f59e0b` | `--color-amber` | Advertencias, acentos editoriales puntuales (no usar como color de marca) |

*Nota: si más adelante integras secciones para Enrutados Admin o Conductor dentro de la misma landing, usa Morado `#a855f7` o Verde Conductor `#00c896` únicamente como acento puntual de esa sub-sección, nunca como color base.*

## Tipografía

**Familia primaria:** Inter (o system-ui, -apple-system como fallback)
**Familia secundaria (datos/badges):** un monoespaciado tipo JetBrains Mono o ui-monospace — para badges de estado ("Unidad 032", "Ruta activa")

| Rol | Tamaño | Peso | Line-height | Tracking |
|-----|--------|------|-------------|----------|
| display | 64px | 600 | 0.95 | -0.04em |
| heading-lg | 40px | 600 | 1.1 | -0.02em |
| heading | 28px | 600 | 1.2 | -0.01em |
| heading-sm | 22px | 500 | 1.3 | — |
| subheading | 18px | 400 | 1.5 | — |
| body | 16px | 400 | 1.6 | — |
| body-sm | 14px | 400 | 1.5 | — |
| caption/badge | 12px | 500 | 1.4 | 0.02em |

## Espaciado y Forma

**Unidad base:** 4px · **Densidad:** cómoda · **Ancho máximo:** 1200px

| Propósito | Valor |
|-----------|-------|
| Gap entre secciones | 80px |
| Padding de tarjeta | 24px |
| Gap entre elementos | 12–16px |

### Radios

| Elemento | Valor |
|----------|-------|
| badges/etiquetas | 999px (pill) |
| botones | 10px |
| tarjetas | 16px |
| paneles grandes / hero | 24px |

### Elevación

- **Tarjetas glass:** `background: rgba(255,255,255,0.06); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12);`
- **Borde activo con glow:** `box-shadow: 0 0 0 1px rgba(34,211,238,0.4), 0 0 24px rgba(52,211,153,0.25);`
- **Sombra suave general:** `rgba(0,0,0,0.3) 0px 8px 24px`

## Guías — Hacer

- Usa Inter en peso 600 para titulares y CTAs; el peso semi-negrita da presencia sin perder legibilidad sobre el fondo oscuro.
- Aplica el degradado de marca (cian→verde) *solo* en: logo, línea de acento del CTA principal, bordes activos de tarjeta destacada y trazos decorativos tipo "ruta" — nunca como fondo de texto largo.
- Usa glassmorphism con moderación: 3–5 tarjetas clave por sección (pagos, trazabilidad, conexión, control), no en toda la página.
- Los badges de estado ("Pago exitoso", "En servicio", "Ruta activa") van en tipografía monoespaciada sobre fondo vidrio, como en las pantallas de referencia.
- Mantén 80px de separación entre secciones principales para el ritmo editorial.
- Reserva el verde puro (#34d399) para estados de éxito/confirmación; el cian puro (#22d3ee) para estados informativos/activos.

## Guías — Evitar

- No uses sombras pesadas tipo Material; la elevación viene del blur + borde translúcido, no de drop-shadows grandes.
- No mezcles el morado (Admin) ni el verde puro de Conductor como color base de la landing pública — son acentos de producto interno.
- No apliques el degradado de marca sobre bloques grandes de texto: pierde legibilidad.
- No uses más de un acento saturado por componente — el sistema es deliberadamente de baja saturación con un solo highlight neón por elemento.
- No redondees todo por igual: badges en pill, botones en 10px, tarjetas en 16px, paneles hero en 24px — la variación es intencional.

## Componentes clave para la landing

### Hero
Fondo Obsidiana con imagen/video del bus a la derecha (como la Imagen 1), texto ancla a la izquierda (40–45% del ancho). Titular display 64px, subtítulo Niebla 18px. CTA primario con relleno en degradado de marca, radio 10px. Glow radial cian-verde detrás del vehículo.

### Tarjeta de feature (glass)
Fondo vidrio (`--color-glass`) con blur 16px, borde 1px translúcido, radio 16px, padding 24px. Ícono circular con aro de degradado de marca (como los íconos de la Imagen 1: pagos, trazabilidad, conexión, control). Título heading-sm + descripción body-sm en Niebla.

### Badge de estado
Pill (radio 999px), fondo vidrio oscuro, texto monoespaciado 12px en Papel o Verde Menta según sea informativo o de éxito. Ej: "● En servicio", "✓ Pago exitoso".

### CTA primario
Relleno en degradado de marca (cian→verde), texto Papel u Obsidiana según contraste, radio 10px, padding 16px×12px, sin sombra pesada — solo el glow sutil de borde.

### Nav superior
Fondo Grafito semitransparente con blur, logo + wordmark a la izquierda, links centrados en Niebla (hover Papel), CTA a la derecha con el degradado de marca.

## Quick Start — CSS Custom Properties

```css
:root {
  /* Colores */
  --color-bg: #0a1628;
  --color-surface: #0d2438;
  --color-border: #1c3549;
  --color-glass: rgba(255,255,255,0.06);
  --color-fog: #8fa3b3;
  --color-mist: #5c7284;
  --color-paper: #ffffff;
  --color-neon-cyan: #22d3ee;
  --color-neon-green: #34d399;
  --gradient-brand: linear-gradient(90deg, #22d3ee 0%, #34d399 100%);
  --color-amber: #f59e0b;

  /* Tipografía */
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Radios */
  --radius-pill: 999px;
  --radius-button: 10px;
  --radius-card: 16px;
  --radius-hero: 24px;

  /* Espaciado */
  --section-gap: 80px;
  --card-padding: 24px;
  --element-gap: 16px;

  /* Elevación */
  --shadow-card: rgba(0,0,0,0.3) 0px 8px 24px;
  --border-active-glow: 0 0 0 1px rgba(34,211,238,0.4), 0 0 24px rgba(52,211,153,0.25);
}
```
---

## Línea de Ruta — Sistema Visual

> Extensión del sistema para representar el recorrido del viaje (y del usuario) a través de la landing. Paleta: **cyan (origen) → orange (calle/acción)**, alineada con la identidad real de V5.

### Principios

1. **La línea es un actor, no un detalle.** Tiene presencia cuando importa (2px + glow), desaparece cuando no (hairline, sin glow).
2. **Siempre comunica progreso.** Cyan = inicio/pasajero. Orange = calle/asociación/acción.
3. **Se dibuja al scroll.** Nunca aparece completa. Se traza mientras el usuario avanza.
4. **Los nodos son momentos, no adornos.** Cada nodo marca un evento real (sube, valida, entiende).
5. **El texto nunca compite con la línea.** Los labels van al lado, no encima.
6. **Una sola línea por sección.** Entra, se queda, sale cuando la sección termina.
7. **En mobile rota 90°.** Nunca desaparece.

### Tokens

```css
:root {
  /* ═══════════════════════════════════════════════════════════════════
     LÍNEA DE RUTA — Sistema visual
     Paleta: cyan (origen) → orange (calle/acción)
     ═══════════════════════════════════════════════════════════════════ */

  /* Gradientes */
  --route-gradient-brand: linear-gradient(180deg, var(--cyan) 0%, var(--orange) 100%);
  --route-gradient-brand-h: linear-gradient(90deg, var(--cyan) 0%, var(--orange) 100%);
  --route-gradient-data: linear-gradient(180deg, var(--cyan) 0%, var(--cyan-strong) 100%);
  --route-gradient-success: linear-gradient(180deg, var(--cyan) 0%, var(--success) 100%);

  /* Grosor */
  --route-width-hairline: 1px;
  --route-width-base: 1.5px;
  --route-width-strong: 2px;

  /* Opacidades */
  --route-opacity-idle: 0.35;
  --route-opacity-active: 1;
  --route-opacity-done: 0.6;
  --route-opacity-residual: 0.25;

  /* Nodos */
  --route-node-size: 10px;
  --route-node-size-active: 14px;
  --route-node-bg: var(--bg);
  --route-node-ring: 2px;

  /* Glow */
  --route-glow-soft: 0 0 10px rgba(34, 211, 238, 0.28);
  --route-glow-strong: 0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(245, 158, 11, 0.25);
  --route-glow-success: 0 0 16px rgba(52, 211, 153, 0.6);

  /* Velocidades */
  --route-speed-draw: 900ms;
  --route-speed-node: 320ms;
  --route-speed-pulse: 2400ms;
  --route-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --route-ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  /* Espaciado */
  --route-node-gap: 22px;
  --route-label-gap: 8px;
}

Estados de nodo
Estado	Uso	Apariencia
idle	Aún no alcanzado	Opacidad .35, sin glow
active	En foco (viewport)	Opacidad 1, glow suave, escala 1.15
done	Ya recorrido	Opacidad .6, glow verde, check ✓
Secciones CON y SIN línea
Sección	Línea	Por qué
Problem	✅ Dashed, opacidad baja	"La operación actual no deja huella"
HowItWorks	✅ Sólida, se dibuja	"La ruta se traza"
Operations	✅ Lateral, eje temporal	"El recorrido de los datos"
Un viaje deja un registro	✅ Protagonista	"El viaje deja huella"
Audiences	❌	El mockup de app es el protagonista
Honesty / FAQ / Contact	❌	Respiran. Aquí hay conversación, no proceso.