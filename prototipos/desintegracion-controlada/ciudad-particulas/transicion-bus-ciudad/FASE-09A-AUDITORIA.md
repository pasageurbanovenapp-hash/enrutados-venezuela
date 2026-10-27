# FASE 09A — Auditoría de viabilidad: continuidad autobús → ciudad

**Ámbito:** `prototipos/desintegracion-controlada/`. **Modalidad:** solo lectura.
**Fecha:** 2026-10-26. **Rama:** `prototipo/ciudad-trazada`, HEAD `15d7851`.

## 1. Veredicto

**Viable con adaptador.**

La correspondencia existe y es determinista: ambos sistemas usan las mismas
4.003 / 2.282 facetas, en el mismo orden de índice, y ambos calculan sus
posiciones como función pura del progreso. Pero la representación no coincide:
el motor guarda tres vértices 3D por faceta y los reproyecta en cada dibujo; la
ciudad guarda un punto 2D por faceta con su propia proyección y escala. Además,
al final de la dispersión el **19,8% de los centroides queda fuera del lienzo de
escritorio**. Sin adaptador no hay continuidad; con un adaptador de centroide y
espacio de pantalla compartido, sí.

## 2. Archivos y funciones inspeccionadas

| Archivo | Función / bloque | Líneas | Papel |
|---|---|---|---|
| `motor.js` | `decodificarFacetas` | 9–83 | Lee ENF1: posiciones cuantizadas, índices, grupos, RGB |
| `motor.js` | `progresoFaceta` | 85–95 | Curva por faceta: inicio 0,14 + demora·0,78, smoothstep |
| `motor.js` | `transformarVertice` | 97–… | Rotación alrededor del centroide + traslación + gravedad |
| `app.js` | `crearFacetas` | 78–161 | Identidad `orden`, normal, desplazamiento, eje, demora, distancia, giro |
| `app.js` | `calcularEncuadre` | 163–187 | Marco fijo del bus **íntegro**, margen 10% |
| `app.js` | `dibujar` (bucle) | 231–294 | Recalcula cada faceta en cada dibujo; ordena por profundidad |
| `app.js` | `facetas.sort` | 294 | Orden de pintado por profundidad y `orden` |
| `ciudad.js` (adaptación) | `construirEdificios` | 56–77 | 3 planos, 3/4/5 edificios (2/2/3 en móvil) |
| `ciudad.js` (adaptación) | `construirParticulas` | 79–160 | Reparte facetas por área; techo 26%, aristas 22%, relleno 52% |
| `ciudad.js` (adaptación) | `proyectar` | 192–194 | Proyección propia de ciudad |

Sonda reproducible: `sondear-transicion.mjs` → `sonda-transicion.json`.

## 3. Flujo de datos

```
ENF1 (facetas.bin)
  └─ decodificarFacetas → nivel { posiciones, indices, grupos, colores, triangulos }
       ├─ MOTOR: crearFacetas(nivel)[i]
       │    { orden:i, puntos[3], centro, normal, desplazamiento, eje, demora, distancia, giro }
       │    dibujar(p): cantidad = progresoFaceta(p, demora)
       │                transformarVertice(punto, ...) × 3
       │                proyectar con cámara (az 42, el −12) y marco del bus íntegro
       │                ordenar por profundidad y pintar triángulos
       └─ CIUDAD: construirParticulas(nivel)[i]
            centros[i] = centroide de los mismos 3 vértices
            destino[i] = rejilla del edificio asignado (plano, techo/arista/relleno)
            origen[i]  = (centro.x/0.9, centro.y/0.36) + dispersión hash(61,79)
            proyectar con escala propia de ciudad
```

**El motor no conserva el estado final.** `dibujar()` recalcula `transformados`
en cada llamada (app.js 246–294); el estado disperso es una función pura de
`p` y del índice. No hay caché de posiciones finales que reutilizar.

**La ciudad sí conserva un destino por faceta**, pero su "nube" de origen no es
la dispersión del motor: usa solo `centro.x` y `centro.y`, ignora `z`, la normal
y la demora, y aplica sales de hash distintas (61/79 frente a 17/29/43/113/131/149).

## 4. Tabla de correspondencias

| Dato | Autobús | Ciudad | ¿Compatible? | Evidencia |
|---|---|---|---|---|
| Identidad | índice `orden` 0…N−1 | índice `f` 0…N−1 | **Sí** | `crearFacetas` 89; `construirParticulas` 79–160 (f crece monótono) |
| Cantidad | 4.003 / 2.282 | 4.003 / 2.282 | **Sí** | sonda: facetas = destinos en los 4 casos |
| Centroide | media de 3 vértices | media de los mismos 3 vértices | **Sí** | app.js 96; ciudad.js 85–95 |
| Posición final | 3 vértices transformados, 3D | 1 punto 2D (destino) | **Parcial** | motor `transformarVertice`; ciudad `destino[f]` |
| Proyección | cámara 42/−12, marco del bus íntegro | escala de ciudad, suelo 0,9·alto | **No** | app.js 163–187; ciudad.js 192 |
| Escala | ajusta el bus íntegro (margen 10% + 5%) | ajusta la ciudad | **No** | app.js 238–245; ciudad.js 188–193 |
| Color | grupo + 9 tonos desde RGB | 6 tonos fijos + alfa por plano | **Parcial** | `crearTonos`; `PALETA` |
| Profundidad | z ordenada por `profundidad` | 3 planos con alfa, sin z | **No** | app.js 294; ciudad.js 190 |
| Alfa | desvanecido por `progresoLocal` | alfa por plano | **No** | app.js 323–324 |
| Origen de la nube | dispersión real (normal + radial + hash) | derivada del centroide x/y | **No** | app.js 110–120; ciudad.js 105–106 |
| Determinismo | función pura de `p` | función pura de `f` | **Sí** | sin estado entre dibujos |

## 5. Incompatibilidades y consecuencias

1. **Tres vértices frente a un punto.** Un triángulo desprendido no se puede
   convertir en un punto de ciudad sin colapsarlo a su centroide. Durante la
   transición el triángulo debe encogerse o fundirse; el adaptador mínimo usa el
   centroide y pierde la forma triangular.
2. **Escalas incompatibles.** El marco del bus se fija con el bus íntegro; la
   ciudad se ajusta a su propio ancho. Una escena conjunta necesita una de dos:
   reencuadrar (cambia la composición aprobada del bus) o interpolar en píxeles
   de pantalla entre dos proyecciones distintas.
3. **El 19,8% de los centroides sale del lienzo de escritorio al final de la
   dispersión.** Una transición que empiece en `p=1` arranca con una quinta parte
   de los puntos fuera; o entran desde los bordes (salto visible) o hay que
   reencuadrar. Es una decisión de composición, no un problema de datos.
4. **Profundidad y alfa no son equivalentes.** El bus ordena por z y desvanece
   por progreso; la ciudad ordena por planos y desvanece por plano. Un híbrido
   debe definir un orden y un alfa comunes.
5. **La nube actual de la ciudad no sirve como estado del bus.** Está a 328 px
   de mediana del estado real de dispersión en escritorio: son dos nubes
   distintas. El adaptador debe tomar las posiciones reales del motor, no el
   origen de la ciudad.

## 6. Determinismo y reversibilidad

Ambos sistemas son funciones puras: el motor recalcula desde `p` en cada dibujo
y la ciudad desde `t`. No hay acumulación ni aleatoriedad en tiempo de dibujo
(los hashes dependen solo del índice). Por tanto un `t ∈ [0,1]` determinista y
reversible es compatible con el enfoque existente, sin tocar el motor.

## 7. Evidencia numérica (sonda)

Recalculado con las mismas fórmulas del código; **no leído de memoria del motor**
(el motor no expone su estado). Lienzos: 1440 × 627 y 390 × 669,5 CSS.

| Nivel / lienzo | Facetas = destinos | Bus final dentro | Destino dentro | Distancia bus→destino (mediana / p95) |
|---|---|---|---|---|
| 4.003 / escritorio | 4.003 = 4.003 | **80,2%** | 100% | 415,9 / 802,5 px |
| 2.282 / escritorio | 2.282 = 2.282 | **79,8%** | 100% | 423,3 / 824,4 px |
| 4.003 / móvil | 4.003 = 4.003 | 97,5% | 100% | 190,2 / 360,6 px |
| 2.282 / móvil | 2.282 = 2.282 | 97,5% | 100% | 190,3 / 364,1 px |

La distancia mediana de 416 px en escritorio confirma que no es un ajuste
fino: es una migración de media pantalla. Narrativamente puede funcionar, pero
exige una decisión de encuadre y de ritmo.

## 8. Propuesta mínima para una futura prueba visual

Sin tocar el motor, en una escena nueva:

1. Cargar ENF1 una vez y derivar, por faceta `i`: puntos íntegros, parámetros de
   dispersión (mismas fórmulas) y **centroide final** en `p=1` proyectado a
   pantalla.
2. Calcular el destino urbano de la misma faceta `i` con la distribución de
   `adaptacion-ruta` y proyectarlo a pantalla.
3. Un solo `t` determinista en dos fases: `t∈[0,0,55]` disuelve el bus (`p` de 0
   a 1); `t∈[0,45,1]` interpola el centroide congelado hacia el destino, con
   suavizado.
4. Interpolar color (grupo → tono urbano) y alfa; ordenar por profundidad
   interpolada.
5. Decidir el encuadre: mantener el marco del bus (19,8% de puntos entran desde
   fuera) o reencuadrar la escena conjunta (encoge el bus). **Esta decisión no se
   toma en esta auditoría.**

## 9. Límites de la auditoría

- La sonda **replica** las fórmulas; no extrae estado interno del motor porque no
  está expuesto y no se podía modificar `app.js`.
- Los lienzos usados son los medidos en fases anteriores; una escena conjunta
  tendría su propio tamaño.
- La cifra del 19,8% depende del marco 10/5 y de 1440 × 627.
- No hay prototipo visual: la propuesta no está probada ni medida en presentación.
- No se ha medido el coste de una escena con triángulos + puntos a la vez.

## 10. Pruebas pendientes

- Prototipo visual con el `t` de dos fases y captura de los estados intermedios.
- Medir cuántos puntos entran desde fuera con el marco actual y con un reencuadre.
- Verificar el mapeo de color/alfa y el orden de pintado.
- Medir coste de dibujo y cadencia; el tiempo de presentación sigue sin medirse.

## 11. Estado

- Rama `prototipo/ciudad-trazada`, HEAD `15d7851`.
- `git status --short artifacts/` vacío: landing intacta.
- Solo lectura: no se modificó `motor.js`, `app.js`, `scroll.js`, las fases 06–08
  ni los activos. Archivos nuevos: este informe, `sondear-transicion.mjs` y
  `sonda-transicion.json`.
