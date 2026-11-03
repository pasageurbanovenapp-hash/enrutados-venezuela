# FASE 09D — Evaluación visual comparativa A/B

**Rama:** `prototipo/ciudad-trazada` · **HEAD:** `15d7851` · **Fecha:** 2026-10-26
**Tipo:** evaluación interna de composición visual. No es una prueba de percepción
con usuarios ni una validación de fluidez en hardware real.

## 1. Condiciones exactas

| Condición | Valor |
|---|---|
| Código | El mismo de 09C (`transicion.js` con hash `c1ac95d7`) |
| Escritorio | viewport 1440 × 757, lienzo 1440 × 627, DPR 1 |
| Móvil | viewport 390 × 844, lienzo 390 × 714, DPR 2 |
| Niveles | 4.003 (escritorio) y 2.282 (móvil) |
| Progreso | 0 · 0,25 · 0,50 · 0,75 · 1, fijo, sin animación |
| Datos | Mismos destinos, colores, cámara y reglas de dibujo |
| Escala de comparación | Idéntica para A y B dentro de cada montaje |

Los 20 estados se recapturaron y **los 20 hashes coinciden exactamente con 09B**:
no hubo deriva visual. A y B dan el mismo estado final
(`0e627ad8` escritorio, `5d4ef246` móvil). Sin errores de consola.

## 2. Capturas

- `capturas/09d/{desktop,movil}-{A,B}-{0.00,0.25,0.50,0.75,1.00}.png` (20).
- `capturas/09d/09d-extra-{desktop,movil}-{A,B}-060.png` (4, en t=0,60).
- `capturas/09d/comp-{desktop,movil}-{0.00,0.25,0.50,0.60,0.75,1.00}.png` (12
  montajes A|B con etiqueta y misma escala).
- `capturas/movimiento/*-vuelta-0.50.png` de 09C.

## 3. Matriz por dispositivo

Escala 1–5. Justificación basada en las capturas citadas.

### Escritorio

| Criterio | A | B | Justificación |
|---|---|---|---|
| Presencia del autobús en t=.25–.50 | **5** | **5** | En .25 el bus ocupa el marco con silueta íntegra; en .50 se reconoce pelándose. Las capturas de A y B son idénticas en esos puntos (B no actúa hasta u>0). |
| Legibilidad del desprendimiento | **5** | **5** | El pelado empieza en .25 y es progresivo en .50; no hay pared de triángulos (defecto de la curva inicial ya corregido en 09B). |
| Continuidad autobús → ciudad | **5** | **5** | Las partículas son las del motor, con reversibilidad 0/101 medidas en 09C; no aparece una nube nueva. |
| Emergencia urbana en t=.75 | **4** | **4** | Se leen techos, aristas y la ruta, pero el conjunto aún es disperso; no es una ciudad nítida hasta t=1. |
| Composición y encuadre | **4** | **4** | A mantiene el marco del bus; B solo se separa en t≈0,55–0,65, donde su nube queda algo más compacta. Ni una ni otra distraen. |
| Legibilidad en móvil | **4** | **4** | El bus es pequeño en vertical (encuadre del motor); la ciudad final se lee. B no cambia esto de forma apreciable. |

### Móvil

| Criterio | A | B | Justificación |
|---|---|---|---|
| Presencia del autobús en t=.25–.50 | **4** | **4** | Reconocible, pero con menos presencia que en escritorio por el lienzo vertical. |
| Legibilidad del desprendimiento | **4** | **4** | Se entiende, aunque el tamaño reduce el detalle del pelado. |
| Continuidad autobús → ciudad | **5** | **5** | Igual de continua; la nube y la ciudad comparten partículas. |
| Emergencia urbana en t=.75 | **4** | **4** | Edificios y ruta visibles; el cielo vacío domina todavía. |
| Composición y encuadre | **4** | **4** | La ciudad ocupa la franja inferior; B apenas desplaza unos píxeles. |
| Legibilidad en móvil | **4** | **4** | Legible con limitaciones; no hay ventaja de B. |

## 4. Observaciones

**Qué mejora A:** conserva el encuadre exacto del autobús durante toda la primera
mitad; no introduce ninguna contracción global. Es la referencia estable.

**Qué mejora B:** en la ventana t≈0,55–0,65 su nube queda más compacta y centrada
(visible en `comp-desktop-0.60.png`), lo que reduce el recorrido posterior de los
puntos. Fuera de esa ventana, A y B son casi indistinguibles.

**Cuándo aparece la diferencia:** solo en esa ventana. En .25 y .50 la
transformación de B es nula o casi nula; en .75 el `eu` ya es 0,844 y ambos están
casi en el destino, por eso vuelven a parecerse. En t=1 son idénticos.

**¿B aporta ventaja visible?** Es visible en .60, modesta, y no se repite en los
puntos narrativos obligatorios. No se observa una mejora de presencia,
continuidad ni emergencia urbana.

**¿Alguna pierde el autobús antes de tiempo?** No. Ambas lo conservan en .25 y .50.

**¿La ciudad se lee como destino de las partículas?** Sí en ambas: los mismos
puntos forman los edificios y la ruta; no hay escena independiente.

**Diferencias escritorio/móvil:** el efecto de B es más perceptible en escritorio
(mayor lienzo y nube más extendida) que en móvil, donde el desplazamiento es de
pocos píxeles.

## 5. Decisión

**Conservar A como referencia.**

B no aporta una mejora visual clara ni repetible en los estados que definen la
narración; su única diferencia se concentra en una ventana estrecha y no mejora
la presencia del autobús, la continuidad ni la legibilidad móvil. A es más simple y
mantiene el marco aprobado. B queda documentada como alternativa disponible para
una futura revisión en movimiento, sin promoverla.

Esta decisión **no autoriza** integrar en la landing, conectar el scroll ni aprobar
cámara o rendimiento de producción.

## 6. Limitaciones

- Evaluación **interna**, de un solo evaluador y sobre capturas fijas; no es una
  prueba de percepción con usuarios.
- Las capturas no demuestran fluidez: la continuidad temporal se midió en 09C,
  pero el tiempo de presentación y el hardware real siguen sin evaluarse.
- Los montajes comparan A y B a la misma escala, pero el ojo del evaluador no es
  un instrumento calibrado.
- El lienzo móvil es 390 × 714 CSS dentro de un viewport de 390 × 844.

## 7. Archivos y alcance

Creados: `capturar-09d.mjs`, `capturas-09d.json`, `capturas/09d/` (20 estados,
4 capturas en .60 y 12 montajes) y este informe.
Modificado: `capturar-uno.mjs` (parámetros de viewport para las capturas en .60).
No se tocaron `transicion.js`, `transicion.css`, `index.html`, `motor.js`,
`app.js`, `scroll.js` ni las fases 06–08.

## 8. Comprobaciones de cierre

- `git status --short artifacts/` vacío: landing intacta.
- Hashes de fases 06/07/08 y de `motor.js`/`app.js`/`scroll.js` sin cambios.
- Sin commits.
- A y B producen el mismo estado final (hashes idénticos).
- Sin errores de consola en las 24 capturas.
