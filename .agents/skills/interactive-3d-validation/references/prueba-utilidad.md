# Prueba de utilidad de las skills

No es una validación de las skills: es un recorrido en papel para comprobar si
sus instrucciones bastan para dos escenarios. La validación real exigiría ejecutar
el trabajo con un caso nuevo y revisar el resultado.

## Escenario A — Nueva transición objeto → ciudad, sin tocar el original ni producción

**Entrada:** un objeto 3D existente con conteo conocido y una ciudad de destino;
prohibido modificar el objeto, el motor y la landing.

**Instrucciones que se usarían (skill `scroll-driven-3d-transitions`):**

1. Convertir el brief en requisitos y estados (paso 1).
2. Auditar el activo: formato, conteo, escala, materiales; decidir si es fuente,
   referencia o destino (paso 2).
3. Separar la preparación del activo de la animación (paso 3).
4. Elegir facetas, puntos o ambas; una sola fuente de verdad (paso 4).
5. Definir la curva y el umbral de silueta; hash por índice (pasos 5–6).
6. Resolver el destino por centroide/identidad, sin asumir vértices compartidos
   (paso 7).
7. Montar el control por scroll con un rAF, épsilon, IO y teardown (paso 8).
8. Encuadrar escritorio/móvil y fijar el presupuesto (paso 9).
9. Paleta y material sin depender del atlas si el acabado es procedural (paso 10).
10. Página aislada y capturas de los seis estados (paso 11).
11. Validar con `interactive-3d-validation` antes de decidir (paso 12).

**Evidencia necesaria:** conteo y hashes del activo; capturas de los estados;
hash de ida/vuelta; errores de carga; viewports 1440×627 y 390×714; informe con
grados de evidencia.

**Decisiones que seguirían pendientes:** ubicación narrativa, política de nivel
(4.003/2.282), movimiento reducido, textura/material, hardware real.

**Qué errores debería evitar la skill:** el *shim* de `fetch`, el global
`__transicion`, `scrollRestoration`/`scrollTo(0,0)`, el cambio de nivel en caliente,
la falsa continuidad de vértices y el activo sobredimensionado (499.714 triángulos)
tomado como destino directo.

**Resultado del recorrido:** las instrucciones cubren el ciclo completo y obligan a
declarar lo pendiente. No demuestran que el nuevo caso funcione; eso exige
ejecutarlo.

## Escenario B — Auditar una transición con errores, desmontaje y reintentos

**Entrada:** una transición controlada por scroll que debe soportar 404, vacío,
corrupto, red, reintento, destrucción y remontaje.

**Instrucciones que se usarían (skill `interactive-3d-validation`):**

1. Inspección estática del contrato, el `fetch`, el `AbortController`, los
   estados, `destruir` y el adaptador (paso 1).
2. Pruebas de motor: decodificación, monotonía, límites (paso 2).
3. Matriz de carga/errores/reintento (paso 3).
4. Ciclo de vida: destruir durante carga, resize posterior, doble destroy (paso 3).
5. Determinismo y scroll: ida/vuelta, pausa, salida, reentrada, sin reseteo (paso 3).
6. Reduce al cargar y en vivo (paso 3).
7. Informe con grados de evidencia y pendientes (pasos 4–5).

**Evidencia existente que se usaría:** `validacion-12.json` (escenarios A–G),
`FASE-12-RESULTADOS.md`, `validacion-10.json`, `MEDICION.md` y la captura móvil.

**Decisiones que seguirían pendientes:** medición de scroll real, dispositivo
físico documentado, presentación, memoria, política de reduce y de nivel.

**Qué defectos debería detectar:** la carga que reactiva tras destruir, el
`pagehide` que mata el adaptador en bfcache, el progreso inicial pisado, el control
oculto sin uso y la confusión entre `dibujos` y FPS.

**Resultado del recorrido:** la matriz obliga a separar lo probado de lo supuesto
y a no cerrar el caso con una captura. No sustituye la ejecución de la matriz.

## Conclusión

Las skills son **útiles como procedimiento** si el trabajo se ejecuta y se
documenta; no están validadas por existir. Para validarlas haría falta aplicarlas a
un caso nuevo y comprobar que el informe resultante resiste una revisión
independiente.
