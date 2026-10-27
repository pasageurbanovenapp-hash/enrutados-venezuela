# Variante vertical — fase 07

Copia aislada de la fase 06. **Única diferencia**: la distribución de destinos en
móvil. En escritorio se mantienen los parámetros originales, así que la composición
de escritorio es idéntica por construcción.

| Parámetro | Fase 06 (original) | Variante |
|---|---|---|
| Ancho de ciudad en móvil | 1,35 unidades | **0,95** |
| Edificios en móvil (cercano/medio/lejano) | 2 / 3 / 4 = 9 | **2 / 2 / 3 = 7** |
| Escritorio | 1,9 y 3 / 4 / 5 | sin cambios |

Mismas partículas (4.003 / 2.282), misma paleta, mismas reglas de dibujo, mismo
control `t`. El binario ENF1 se lee de `../../../facetas-retexture/facetas.bin` y
`motor.js` se importa de `../../motor.js`, sin modificarlos.

## Comparación medida

Metodología: capturas y medición de ocupación sobre píxeles del canvas con
`comparar-ciudad-cdp.mjs`, en las mismas condiciones para ambas páginas.
Escritorio 1440 × 627 CSS, DPR 1. Móvil 390 × 669,5 CSS, DPR 2 (780 × 1339 reales).

### Móvil, 4.003 elementos

| Métrica | Original | Variante |
|---|---|---|
| Alto de la caja | 31,7% | **45,0%** |
| Borde superior | 58,4% | **45,1%** |
| Centro vertical | 74,2% | **67,6%** |
| Ancho de la caja | 99,7% | 99,7% |

### Móvil, 2.282 elementos

| Métrica | Original | Variante |
|---|---|---|
| Alto de la caja | 31,7% | **44,8%** |
| Borde superior | 58,4% | **45,1%** |

### Escritorio

Idéntico en ambas: 64,6% × 60,6% de caja, centro 59,6%, sin recortes.

## Coste de dibujo

Medido con la misma metodología de la fase 06: 60 llamadas seguidas para mediana y
p95, y 40 fotogramas con `requestAnimationFrame`.

| Entorno | Original 4.003 / 2.282 | Variante 4.003 / 2.282 |
|---|---|---|
| Escritorio (rAF) | 0,8 / 0,6 ms | 1,0 / 0,6 ms |
| Móvil (rAF) | 0,7 / 0,5 ms | 0,8 / 0,6 ms |

Diferencias dentro del ruido. **No se mide tiempo de presentación**; el intervalo
de `requestAnimationFrame` fue 16,7 ms en todos los casos, lo que no prueba 60 FPS
en pantalla.

## Evaluación

| Criterio | Resultado |
|---|---|
| 1. Ocupación vertical | Mejora: +13,3 puntos en móvil |
| 2. Legibilidad | Mejora: edificios más anchos y altos |
| 3. Techos y relleno | Mejora, sobre todo a 2.282: menos edificios con los mismos puntos |
| 4. Separación y calles | Se mantiene: huecos visibles entre edificios |
| 5. Profundidad | Se mantiene: tres planos |
| 6. Recortes accidentales | Ningún edificio recortado; la línea de ruta toca los bordes en ambas |
| 7. Interpolación | Continua: mismo `t`, mismo origen, destino más estrecho |
| 8. Coste | Sin cambio apreciable |

## Límites

- La línea de ruta se define de −0,9 a 0,9 en coordenadas de ciudad y no se adapta
  al ancho: en móvil sobresale y toca los bordes en las dos versiones. Por eso el
  ancho medido (99,7%) es la ruta, no los edificios; los edificios ocupan ~94%.
- El cielo vacío baja del 58% al 45%, pero sigue siendo casi la mitad del lienzo.
- La ciudad móvil pasa de 9 a 7 edificios: gana presencia y pierde variedad urbana.
- Emulación de navegador, sin dispositivos físicos ni GPU real.

## Veredicto

**Mejora aceptada para móvil.** La ocupación vertical sube de 31,7% a 45,0%, los
edificios se leen mejor y los techos aguantan a 2.282; escritorio no cambia y el
coste es el mismo. El precio es una ciudad móvil con menos edificios y aún con
mucha altura libre. No se propone integrar nada todavía.

## Evidencia

`capturas/` contiene, para ambas páginas y ambos viewports: ciudad final con 4.003,
ciudad final con 2.282 y tránsito `t=0.5` con 4.003.
