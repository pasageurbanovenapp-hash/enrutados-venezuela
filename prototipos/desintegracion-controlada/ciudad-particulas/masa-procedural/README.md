# Ciudad de masa — prueba aislada (fase 13)

Ciudad esquemática de **volúmenes planos**, sin props, pensada como destino de la
transición de facetas. Nace de la lectura del 2026-10-26: menos aristas, más masa;
sin farolas, árboles, balcones ni cornisas; calle central y dos filas de edificios.

## Geometría

- Dos filas de 7 edificios, 4,2 de fondo, anchos 3,6–5,0, alturas 3,8–9,2.
- Retranqueos en 3 de los 14 edificios (escalón al 68% de la altura).
- Calle de 5,2, aceras de 0,6, huecos de 0,8.
- Sin ventanas, puertas, cornisas, farolas ni vegetación: caras planas y azotea plana.

## Presupuesto de facetas

Cada cara se subdivide en una rejilla; cada celda son 2 triángulos. El programa
busca el tamaño de celda que más se acerca al objetivo.

| Objetivo | Facetas reales | Celdas/ud |
|---|---|---|
| 4.003 | **3.780** (94%) | 1,065 |
| 2.282 | **2.088** (92%) | 0,810 |

El conteo es cuantizado: un cambio pequeño de rejilla cruza muchas caras a la vez
y salta de 3.780 a ~4.100. Se conserva el más cercano. Para el objetivo de masa,
la diferencia es irrelevante; si se necesita exacto, se ajusta el número de
edificios o el ancho de uno.

## Vistas y modos

- **Calle:** cámara a nivel de calle con fuga; en retrato se retrasa y se eleva.
- **3/4:** vista de bloque para leer la masa y los retranqueos.
- **Facetas:** triángulos planos sombreados; es la vista de masa.
- **Puntos:** un punto por faceta; sirve para ver el límite del presupuesto, no
  como acabado (a 3.780 puntos la ciudad se lee peor que en facetas).

Red de movilidad: polilínea cian con nodos ámbar, superpuesta (no consume facetas).

## Archivos

`index.html`, `masa.css`, `masa.js`, `capturar.mjs`, `capturas/` y este README.
No modifica fases anteriores ni la landing. Sin dependencias.

## Límite

No está conectada a la transición. El siguiente paso sería sustituir los destinos
de la ciudad de la Fase 12 por esta lista de facetas (posición, normal, color), en
una fase aparte.
