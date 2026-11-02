---
name: interactive-3d-validation
description: Validate scroll-driven 3D experiences (facets, particles, canvas, lifecycle) with reproducible evidence. Use when auditing load errors, retries, destruction, determinism, reverse scroll, mobile/emulated behavior, or before claiming a prototype is ready. Do not use to assert FPS, memory, or hardware performance without measurement.
---

# Validación de experiencias 3D interactivas

## Propósito

Producir evidencia reproducible de que una experiencia 3D controlada por scroll
carga, falla, se recupera, se destruye y se comporta igual al avanzar y al
retroceder. La salida es una matriz de evidencia con estados explícitos, no una
frase de «funciona».

## Cuándo activarla

- Hay que validar una transición 3D, un canvas interactivo o un adaptador de scroll.
- Se añadieron estados de carga/error/reintento.
- Se cambió el ciclo de vida (montaje, destrucción, remontaje).
- Se va a decidir si un prototipo pasa a la siguiente fase.
- Se recibió una captura o un informe y hay que separar lo demostrado de lo
  supuesto.

## Cuándo **no** activarla

- Para afirmar FPS, memoria o consumo sin medirlos.
- Para aprobar una integración en producción: esta skill valida prototipos.
- Para sustituir una prueba de percepción con usuarios.
- Para justificar una decisión de producto (ubicación narrativa, movimiento
  reducido) que requiere aprobación.

## Prerrequisitos

1. Código y pruebas accesibles; ruta del activo y conteos conocidos.
2. Un entorno de ejecución reproducible (servidor local, Chrome/CDP o equivalente).
3. Activos de error: 404, vacío, corrupto, red inalcanzable.
4. Capacidad de leer el canvas o su hash; idealmente FNV sobre píxeles.
5. Claridad sobre qué es emulación y qué es dispositivo físico.

## Grados de evidencia

Usa exactamente uno por afirmación:

| Grado | Significado |
|---|---|
| **Confirmada por código/prueba** | Se leyó el código o se ejecutó una prueba reproducible |
| **Observada en dispositivo físico** | Captura o medición en un teléfono; documentar dispositivo/SO/navegador |
| **Reportada por herramienta** | Dato de un banco o script, pendiente de verificación independiente |
| **Decisión aprobada** | Producto/arquitectura la autorizó explícitamente |
| **Hipótesis pendiente** | Razonable, sin prueba |
| **Descartada** | Se probó y no sirve, o se decidió no usarla |
| **No inspeccionado** | Falta evidencia; no emitir juicio |

Una captura sin dispositivo documentado es **OF parcial**: prueba que se vio, no
que rinda.

## Matriz mínima de pruebas

### Carga y recuperación

| Prueba | Cómo | Esperado |
|---|---|---|
| Carga correcta | Servir el activo real | `ready`, conteo y canvas correctos |
| HTTP 404 | URL inexistente | `error` con `HTTP 404`; sin dibujo |
| Activo vacío | Archivo de 0 B | `error` «vacío»; sin excepción no capturada |
| Activo corrupto | Bytes inválidos | `error` de formato; sin dibujo |
| Red inalcanzable | Host/puerto cerrado | `error` de red; reintento posible |
| Reintento | Tras cada error, URL válida | `ready`, hash final correcto |
| Carga lenta | Latencia/throughput emulados | `loading` visible; sin `ready` prematuro |

### Ciclo de vida

| Prueba | Cómo | Esperado |
|---|---|---|
| Crear/destruir/crear | Canvas nuevos | Instancias independientes; sin listeners duplicados |
| Destruir durante la carga | Destruir a los ~150 ms con red lenta | `loading → destroyed`; sin `ready` posterior |
| Resize tras destruir | Redimensionar y volver | Hash constante; 0 dibujos nuevos |
| Destruir dos veces | Llamar `destruir()` de nuevo | Idempotente; sin excepción |
| Carga tardía | Promesa que resuelve tras destruir | No reactiva el dibujo ni callbacks |
| `pagehide`/bfcache | Navegar atrás/adelante | El adaptador sigue vivo o se re-inicializa |

### Determinismo y scroll

| Prueba | Cómo | Esperado |
|---|---|---|
| Ida/vuelta | `t` 0→1→0 | Mismo hash en los mismos `t` |
| Repetición | Mismo `t` dos veces | Mismo hash |
| Recorrido inverso | Scroll de abajo a arriba | Monótono, sin saltos |
| Pausa | Detener scroll | 0 dibujos nuevos |
| Salida de sección | Scroll fuera | `visible=false`, 0 rAF, 0 dibujos |
| Reentrada | Volver a la sección | Recalcula `t` actual |
| Sin reseteo | `scrollY` antes/después de crear | Igual |
| `scrollRestoration` | Leer `history.scrollRestoration` | No se fuerza `manual` |
| Ráfaga | 500 eventos sin mover | 1 rAF, 0 dibujos |

### Accesibilidad y movimiento reducido

| Prueba | Esperado |
|---|---|
| Canvas con nombre accesible | `aria-label` que describa la transformación |
| Alternativa textual | Explica qué ocurre sin depender del canvas |
| Foco/orden | No se roba el foco; controles alcanzables |
| `prefers-reduced-motion` al cargar | Estado estático o control manual explícito |
| Cambio en vivo | Reacciona al `change`, sin quedar muerto |
| Scroll normal | No se intercepta ni se secuestra |

### Rendimiento y hardware

| Prueba | Qué mide | Qué **no** prueba |
|---|---|---|
| Coste de `dibujar()` | ms de CPU en el entorno | Presentación |
| Intervalo `rAF` | Cadencia del hilo principal | FPS en pantalla |
| 40 frames por estado | Consistencia | GPU real |
| Dispositivo físico | Captura + notas | FPS/memoria si no se midieron |

**Nunca** llames FPS al intervalo `rAF`. **Nunca** llames memoria al número de
referencias o de dibujos.

## Procedimiento

### 1. Inspección estática

- Identifica el contrato público y el diagnóstico (`window.__lab`, `__scroll`,
  `__transicion`): el diagnóstico no es API.
- Localiza `fetch`, `AbortController`, estados, `destruir`, listeners, observers,
  rAF, `scrollRestoration`, `scrollTo`.
- Marca anti-patrones: shim de `fetch`, espera de global, reseteo de scroll,
  listeners sin `destroy`, `pagehide` con `{ once: true }` sin bfcache.
- Registra defectos **por inspección** como tales; no los llames «probados».

### 2. Pruebas unitarias / de motor

- Decodificación, progreso monótono, límites, determinismo de la transformación.
- En este proyecto: `pruebas.js` (9 invariantes) y `pruebas.html`.
- No sustituyen la prueba visual.

### 3. Pruebas CDP

- Servir local, abrir Chrome con puerto de depuración.
- Emular viewport/DPR; no confundir emulación con hardware.
- Capturar `Page.captureScreenshot`, evaluar estado y hash.
- Escenarios de este proyecto: `validar-fase12-cdp.mjs` (A–G),
  `validar-experiencia-cdp.mjs` (fase 10), `validar-transicion-cdp.mjs` (09B),
  `validar-scroll-cdp.mjs` (scroll nuevo, sin JSON de resultado todavía).
- Guarda un JSON por corrida; sin JSON, no hay evidencia.

### 4. Prueba física

- Documenta: dispositivo, SO, navegador, DPR, viewport, tamaño del canvas.
- Captura los estados `t=0, 0.25, 0.5, 0.75, 1` y el reverso.
- Anota lo observado (recortes, saltos, legibilidad); no inventes FPS.
- Si no hay medición de presentación, decláralo.

### 5. Informe

- Matriz con afirmación, fuente, método y grado.
- Separa defectos, riesgos e hipótesis.
- Cierra con qué se puede validar sin hardware y qué no.
- Si no se ejecutó una prueba, escribe «pendiente», no «aprobado».

## Semántica de indicadores

Antes de citar un número, verifica qué cuenta:

| Indicador | Qué suele ser | Qué no es |
|---|---|---|
| `t` / `p` | Progreso normalizado | Tiempo ni FPS |
| `dibujos` | Llamadas a `fijarT`/`dibujar` que dibujaron | Memoria ni fotogramas presentados |
| `raf` / `pendiente` | `requestAnimationFrame` pendiente | Fotogramas por segundo |
| `hash` | FNV de píxeles del canvas | Prueba de fluidez |
| `intervalo` | Tiempo entre callbacks `rAF` | Presentación en pantalla |
| `__bench` | Estructura de medición | API de producto |
| `facetas` | Conteo del nivel activo | Calidad visual |

## Criterios de aceptación

1. Carga correcta, error y reintento probados con evidencia.
2. Destruir durante la carga no reactiva.
3. Ida/vuelta y repetición dan el mismo hash.
4. Pausa, salida y teardown no dibujan ni dejan rAF.
5. Scroll no se resetea; `scrollRestoration` no se fuerza.
6. Sin errores de consola.
7. Movimiento reducido tiene comportamiento definido y probado.
8. Cada afirmación tiene grado; las pendientes están marcadas.
9. La evidencia física se distingue de la emulación.
10. No se afirma FPS/memoria sin medición.

## Errores frecuentes

| Error | Consecuencia | Prevención |
|---|---|---|
| Medir tras redimensionar | Se lee el canvas equivocado | Medir antes del resize, con el tamaño anotado |
| Leer `estado().lienzo` de un objeto anulado | `undefined` | Guardar la última instantánea antes de destruir |
| Confundir `dibujos` con FPS | Afirmación falsa | Etiquetar como «llamadas que dibujaron» |
| `pagehide` + `{ once: true }` | bfcache deja el adaptador muerto | Comprobar `event.persisted`; re-init en `pageshow` |
| Progreso inicial pisado | El bus aparece en 0 tras recargar a mitad | Reaplicar `calcular()` al estar listo |
| Control oculto sin uso | Accesibilidad falsa | Eliminarlo o conectarlo |
| Probar solo con el activo válido | Los errores quedan sin cubrir | 404/vacío/corrupto/red |
| Declarar «validado» porque el archivo existe | Falsa confianza | Exigir JSON/captura y repetición |

## Límites conocidos

- Emulación de viewport/DPR no es hardware.
- Headless con `--disable-gpu` no representa GPU integrada/móvil.
- El intervalo `rAF` no mide presentación.
- La memoria/GPU no se mide; eliminar referencias no prueba liberación.
- La percepción visual no se valida con hashes; requiere criterio y, si se puede,
  usuarios.
- La fase 11 no tiene informe en el repositorio; su encargo no es evidencia.

## Checklist de salida

- [ ] Contrato y diagnóstico identificados.
- [ ] Activos de error y reintento probados.
- [ ] Destroy durante carga y resize posterior probados.
- [ ] Determinismo ida/vuelta/repetición con hash.
- [ ] Scroll: pausa, salida, reentrada, sin reseteo.
- [ ] Reduce probado al cargar y en vivo.
- [ ] Sin errores de consola.
- [ ] Indicadores definidos antes de citarlos.
- [ ] Evidencia física separada de emulación.
- [ ] JSON/capturas adjuntos; pendientes declarados.

## Referencias

- `references/evidencias.md`: matriz de evidencia del proyecto.
- `references/recetas.md`: comandos, escenarios y activos de error.
- `references/prueba-utilidad.md`: recorrido de los dos escenarios del encargo.
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/fase-12-ciclo-vida/FASE-12-RESULTADOS.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/experiencia-movimiento/FASE-10-RESULTADOS.md`
- `prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/FASE-09A-AUDITORIA.md`
- `prototipos/desintegracion-controlada/MEDICION.md`
