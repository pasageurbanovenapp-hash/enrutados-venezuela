# Ciudad en partículas — experimento aislado (fase 06)

Página de prueba que organiza las facetas reales del autobús en una ciudad
esquemática. No usa scroll, no toca el motor de desintegración y no se enlaza
desde la landing.

## Cómo abrirla

Servir la raíz del repositorio y abrir
`/prototipos/desintegracion-controlada/ciudad-particulas/`.

Parámetros: `?nivel=0|1&t=0..1&medir=1`.

## Qué se reutiliza

- Una **faceta = un elemento**. No se generan partículas nuevas.
- Presupuestos reales: **4.003** (nivel 0) y **2.282** (nivel 1) del binario ENF1.
- De cada faceta se usa el **centroide** (media de sus tres vértices), el **grupo**
  y el **RGB**. El color de la ciudad se asigna por grupo, no por RGB, para
  mantener la paleta: cuerpo cian/turquesa, cristal azul oscuro, rueda casi negra,
  faros blancos y ámbar escaso. El RGB queda disponible pero sin usar.
- `motor.js` se importa solo para `decodificarFacetas`; no se modifica.
- El binario se lee de `../../facetas-retexture/facetas.bin` sin alterarlo.

## Composición

- Tres planos de profundidad: escala 1 / 0,86 / 0,7 y opacidad 1 / 0,72 / 0,46.
- Edificios en cada plano: 3 / 4 / 5 en escritorio y 2 / 3 / 4 en móvil.
- Cada edificio reparte sus puntos en **techo (26%)**, **aristas verticales (22%)**
  y **relleno (52%)**. Sin techo y aristas, el relleno parece ruido: es la decisión
  que hizo legible la silueta.
- En móvil la ciudad se estrecha (1,35 unidades frente a 1,9) para ganar altura
  sin recortar edificios.
- Línea de ruta luminosa y balizas verticales sobre edificios del plano cercano.

## Transición

Cada partícula tiene un origen derivado de su centroide (nube dispersa) y un
destino urbano. El control `t` interpola con suavizado; no hay animación
automática ni bucle propio. `t=0` es la nube, `t=1` la ciudad.

## Medición

Método: 12 dibujos de calentamiento, **60 llamadas seguidas** para mediana y p95,
y **40 fotogramas con `requestAnimationFrame`** por estado. Todo en Chrome
headless con rasterizado por software y DPR máximo 2.

| Entorno | Elementos | `dibujar` en rAF (mediana) | p95 | Intervalo rAF |
|---|---|---|---|---|
| Escritorio 1440×627 | 4.003 | **0,9 ms** | 1,1 ms | 16,7 ms |
| Escritorio 1440×627 | 2.282 | **0,6 ms** | 0,7 ms | 16,7 ms |
| Móvil 390×669,5 CSS (780×1339 reales) | 4.003 | **0,9 ms** | 1,1 ms | 16,7 ms |
| Móvil 390×669,5 CSS (780×1339 reales) | 2.282 | **0,6 ms** | 1,0 ms | 16,7 ms |

Las llamadas seguidas dan p95 de 25–45 ms: es la descarga periódica de rasterizado
al no ceder el hilo, no el coste por fotograma. La cifra válida es la de `rAF`.

**No se mide tiempo de presentación.** El intervalo de 16,7 ms solo indica que el
hilo principal sostuvo la cadencia; no prueba 60 FPS en pantalla.

## Evaluación

| Criterio | Resultado |
|---|---|
| Legibilidad | Ciudad reconocible a primera vista en escritorio; en móvil clara pero con mucho cielo vacío |
| Composición | Edificios distintos, alturas variadas y calles entre ellos |
| Profundidad | Tres planos con escala y opacidad distintas |
| Densidad | 4.003 sólida; 2.282 legible pero con techos discontinuos (punteados) |
| Continuidad | La nube se ordena sin aparición: cada punto tiene origen y destino |
| Rendimiento | 0,6–0,9 ms por fotograma en el entorno medido |

## Límites

- Emulación de navegador, sin dispositivos físicos ni GPU real.
- Sin medición de presentación.
- En móvil la ciudad ocupa la franja inferior: es ancha y el lienzo vertical.
- La composición móvil (ciudad estrecha, menos edificios) difiere de la de
  escritorio; las capturas no son comparables edificio a edificio, solo en lectura.

## Veredicto

**Viable con restricciones.** Con 4.003 elementos la ciudad funciona en escritorio
y móvil. Con 2.282 sigue siendo legible, pero los techos pierden continuidad y la
lectura de edificios se debilita, sobre todo en móvil: es el mínimo aceptable, no
la referencia. La siguiente fase debería decidir entre mantener 4.003 o reforzar
la silueta con líneas de techo antes de bajar a 2.282.

## Evidencia

| Archivo | Contenido |
|---|---|
| `capturas/escritorio-4003-t1.png` | Ciudad, 4.003, 1440×627 CSS, DPR 1 |
| `capturas/escritorio-2282-t1.png` | Ciudad, 2.282, mismas condiciones |
| `capturas/escritorio-4003-t05.png` | Tránsito nube → ciudad, 4.003 |
| `capturas/movil-4003-t1.png` | Ciudad, 4.003, 390×669,5 CSS, DPR 2 (780×1339 reales) |
| `capturas/movil-2282-t1.png` | Ciudad, 2.282, mismas condiciones |

Instrumentos en esta misma carpeta: `capturar-ciudad-cdp.mjs`,
`medir-ciudad-cdp.mjs` y `ver-ciudad-cdp.mjs`, todos por el protocolo de
depuración de Chrome.
