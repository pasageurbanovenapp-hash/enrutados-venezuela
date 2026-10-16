# [A11Y] Hero: las demoras de entrada persisten con movimiento reducido

**Clasificación:** incidencia compartida de accesibilidad.  
**Prioridad propuesta:** atender antes de la aprobación global de accesibilidad; no bloquea por sí sola la evaluación visual de `modernizacion-landing`.  
**Estado:** reproducida en ambas versiones mediante Playwright Chromium.

## Entorno de reproducción

- Referencia `main`: `09268d1bfce09daec726fa6a1ff6f59a6794122e`
- Candidata `modernizacion-landing`: `41c675a6545b5074caef1cd30a18e618070e5032`
- Viewports: 390 × 844 y 768 × 1024.
- Preferencia de movimiento: normal y `prefers-reduced-motion: reduce`.

## Comportamiento observado

Al activar `prefers-reduced-motion: reduce`, las duraciones de las animaciones se reducen a `0.00001s`, pero permanecen las demoras escalonadas del titular, el párrafo, las acciones y el bloque de actores. El temporizador de `Hero` conserva el cambio de estado a `ready` a los tres segundos.

También permanecen declaradas animaciones ambientales con iteración infinita, aunque con duración reducida.

## Comportamiento esperado

Con movimiento reducido activado, el contenido esencial del Hero —titular, descripción, acciones y bloque de actores— debe estar disponible inmediatamente, sin esperar la secuencia cinematográfica. Los efectos no esenciales deben desactivarse o convertirse en un estado estático adecuado.

Con movimiento normal, la secuencia cinematográfica aprobada debe conservar su comportamiento actual.

## Alcance técnico de investigación

- `src/components/sections/hero.tsx`: estado inicial y temporizador de transición.
- `src/styles/hero.css`: demoras escalonadas y animaciones de entrada y efectos ambientales.
- `src/styles/responsive.css`: regla global de `prefers-reduced-motion`.

El diagnóstico no autoriza todavía cambios de implementación. Debe definirse y aprobarse una corrección mínima, compartida y verificable.

## Criterios de aceptación

1. Con `reduce`, todo el contenido esencial del Hero aparece sin demoras escalonadas.
2. No permanecen efectos decorativos infinitos innecesarios en esa condición.
3. El comportamiento normal conserva la composición y la secuencia aprobadas.
4. Las ocho combinaciones de referencia y candidata se vuelven a probar después de la corrección.
5. Se comprueba que los dos CTA navegan correctamente y que ningún elemento queda oculto.
6. Se conservan las evidencias antes y después, los SHA, los resultados automatizados y el diff de la corrección.

## Evidencia asociada

`evidencia-hero-motion-main-vs-modernizacion-20261010.zip`

El paquete contiene grabaciones WebM, capturas temporales, mediciones de estilos calculados y resultados de ocho casos de prueba.

**Nota de calidad de evidencia:** las capturas etiquetadas alrededor de 1900 ms no coinciden exactamente con todas las mediciones de opacidad del JSON para el viewport móvil de 390 px. La incidencia queda respaldada por las mediciones de los primeros 100–1200 ms, los estados posteriores y las grabaciones; no debe afirmarse una transición exacta a los 1900 ms sin reconciliar esa diferencia.