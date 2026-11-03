# Matriz de evidencia — transiciones 3D

Estados: **CE** confirmada por código/prueba · **OF** observada en dispositivo
físico · **HR** reportada por herramienta, pendiente de verificación independiente ·
**DA** decisión aprobada · **HP** hipótesis pendiente · **DE** descartada ·
**NI** no inspeccionado.

| Afirmación | Fuente | Método | Estado |
|---|---|---|---|
| El activo tiene 4.003 y 2.282 facetas | `motor.js`, `README.md`, `pruebas.js` | Lectura + prueba | CE |
| La dispersión es determinista y reversible | `motor.js`, `pruebas.js`, `validacion-10.json`, `validacion-12.json` | Hash FNV ida/vuelta | CE |
| La transición A conserva el bus a t=0,5 y lo pierde hacia 0,6 | `FASE-10-RESULTADOS.md` | Observación de capturas | CE (capturas) |
| La representación bus/ciudad no coincide | `FASE-09A-AUDITORIA.md` | Inspección + sonda | CE |
| 19,8% de centroides fuera de lienzo al final | `FASE-09A-AUDITORIA.md` | Sonda que replica fórmulas | HR (no re-ejecutada) |
| A se conserva y B se descarta como mejora visual | `FASE-09D-RESULTADOS.md` | Evaluación interna | DA (provisional) |
| La experiencia de scroll fase 10 recorre 0→1 y vuelve | `experiencia-movimiento/validacion-10.json` | CDP headless | CE |
| La fase 10 usa shim de `fetch`, global y `scrollTo(0,0)` | `experiencia-movimiento/experiencia.js` | Inspección de código | CE (código) |
| El contrato fase 12 carga, falla y se recupera | `validacion-12.json` | CDP, escenarios A–G | CE |
| Destruir durante la carga no reactiva el dibujo | `validacion-12.json` | CDP | CE |
| El adaptador fase 12 no toca scroll ni navegación | `adaptador-scroll.js` | Inspección | CE |
| La paridad visual con A es exacta en 5 `t` | `FASE-12-RESULTADOS.md` | Hashes | CE |
| Hay ejecución móvil del contrato (t=0→0,988) | `prototipos/Pruebas en movil.png` | Captura aportada por el usuario | OF (dispositivo/navegador no documentados) |
| El coste de dibujo es ~1,6–4,5 ms de mediana | `MEDICION.md` | Banco headless | HR (sin presentación) |
| El intervalo rAF de 16,7 ms no prueba 60 FPS | `MEDICION.md` | Informe | CE (advertencia del propio informe) |
| La ciudad de facetas se lee con 3 planos y reparto 26/22/52 | `ciudad-particulas/README.md` | Resultados fase 06 | CE (prototipo) |
| La ciudad procedural B2 da 3.844/2.308 facetas | `masa-procedural/README.md`, `masa.js` | Código + capturas | HP (sin commit, no aprobada) |
| El GLB de V2Fun tiene 499.714 triángulos y 8,99 MB | Inspección del GLB, `entradas/ciudad-v2fun/` | Parser + stats | CE (del archivo) |
| El GLB de V2Fun no lee a 4.003 puntos | `entradas/ciudad-v2fun/puntos-4003*.png` | Muestreo propio | HP (muestreo no óptimo) |
| Hay un informe de fase 11 con hallazgos | — | Búsqueda en repo | NI (no existe; solo el encargo) |
| La captura móvil prueba FPS o memoria | — | — | DE (no se midió) |

## Decisiones

| Decisión | Estado | Fuente |
|---|---|---|
| Mantener A como referencia; B documentada | Aprobada (provisional) | 09D |
| No integrar en la landing todavía | Aprobada | 09D, 10, 12 |
| Contrato de instancia con `assetURL` y estados | Aprobada (fase 12) | FASE-12 |
| Ciudad de masa procedural para el destino | Decisión de trabajo del usuario | Conversación + B2 |
| GLB de V2Fun como referencia, no destino directo | Decisión de trabajo | Evaluación de densidad |
| Ubicación narrativa, nivel y movimiento reducido | Pendientes | Fase 11 (encargo) |
| Textura/material de la ciudad | Pendiente | B2, V2Fun |
| Hardware real y presentación | Pendiente | MEDICION, FASE-10 |

## Regla de uso

- Una fila **HR** no se convierte en **CE** por repetirla en otro informe.
- Una fila **HP** no se cita como resultado.
- Una captura **OF** sin dispositivo documentado no prueba rendimiento.
- Si una fuente no está en el repositorio, se declara **NI**; no se reconstruye.
