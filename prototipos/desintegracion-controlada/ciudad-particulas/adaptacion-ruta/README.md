# Ruta adaptada — fase 08

Copia aislada de la variante vertical (fase 07). **Única diferencia**: la ruta se
ata al ancho de la ciudad en vez de usar ±0,9 fijos en coordenadas de ciudad.

```
antes:  x = -0.9 + 1.8 * i / 24          (independiente del ancho)
ahora:  x = -medio + 2 * medio * i / 24  con medio = anchoCiudad * 0.42
```

Destinos de edificios, escala, cámara, paleta, reglas de dibujo, presupuesto de
partículas y control `t` no cambian. Fases 06 y 07 intactas.

## Márgenes laterales de la ruta (CSS px)

Medidos con `comparar-ruta-cdp.mjs`. En la adaptación los reporta la propia página
(`__ciudad.rutaMargenes()`); en las referencias se calculan con sus parámetros
conocidos y el lienzo medido.

| Página | Escritorio (izq/der) | Móvil (izq/der) |
|---|---|---|
| Fase 06 original | 279,3 / 279,3 | **−49,4 / −49,4** (recortada) |
| Fase 07 variante | 279,3 / 279,3 | **−152,3 / −152,3** (recortada) |
| **Fase 08 adaptada** | **329,3 / 329,3** | **41,0 / 41,0** |

Un margen negativo significa que la ruta salía del lienzo. En móvil la fase 07
había empeorado el recorte al estrechar la ciudad sin tocar la ruta.

## Cajas y bordes (t = 1)

| Caso | Alto | Borde superior | Ancho | Bordes izq/der |
|---|---|---|---|---|
| Original móvil | 31,7% | 58,4% | 99,7% | 2 / 1 |
| Variante móvil | 45,0% | 45,1% | 99,7% | 2 / 1 |
| **Adaptada móvil** | **45,0%** | **45,1%** | **94,1%** | **0 / 0** |
| Original escritorio | 60,6% | 29,3% | 64,6% | 0 / 0 |
| **Adaptada escritorio** | **60,6%** | **29,3%** | **64,6%** | **0 / 0** |

El ancho medido baja de 99,7% a 94,1% en móvil porque la caja ya no la define la
ruta, sino los edificios. Alto y borde superior coinciden: los edificios no se
movieron. Sin toques de borde en `t=1`.

En `t=0` la caja es la nube (la ruta no se dibuja) y toca los bordes; es el estado
disperso, no un recorte de la ciudad.

## Coste de dibujo

| Entorno | 4.003 | 2.282 | Intervalo rAF |
|---|---|---|---|
| Escritorio | 0,9 ms | 0,6 ms | 16,7 ms |
| Móvil | 0,9 ms | 0,6 ms | 16,7 ms |

Comparable con fases 06 y 07 (0,6–1,0 ms). **No se mide tiempo de presentación**;
16,7 ms de intervalo no prueba 60 FPS en pantalla.

## Evaluación

| Criterio | Resultado |
|---|---|
| Contención de la ruta | **Cumple**: +41 px en móvil y +329 px en escritorio |
| Legibilidad de la ruta | Se mantiene: mismo trazado, solo más corto |
| Integridad de edificios | **Cumple**: alto, borde superior y separación idénticos |
| Recortes accidentales | **Cumple**: 0 toques de borde en `t=1` |
| Continuidad de la transición | Se mantiene; `t=0.5` y `t=0` capturados |
| Coste | Sin cambio apreciable |

## Límites

- Emulación de navegador, sin dispositivos físicos ni GPU real.
- Sin medición de presentación.
- El margen de 41 px equivale al 10,5% del ancho móvil; el criterio visual lo fija
  el diseño, no esta prueba.

## Veredicto

**Mejora aceptada.** La ruta deja de salir del lienzo en móvil (de −152 px a +41 px),
los edificios conservan exactamente su composición y el coste no cambia.

## Evidencia

`capturas/` contiene las tres páginas en escritorio y móvil con 4.003 y 2.282, más
los estados `t=0.5` y `t=0` de la adaptación.
