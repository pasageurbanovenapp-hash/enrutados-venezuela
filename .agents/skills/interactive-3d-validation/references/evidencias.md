# Matriz de evidencia — validación

Estados: **CE** confirmada por código/prueba · **OF** observada en dispositivo
físico · **HR** reportada por herramienta · **DA** decisión aprobada · **HP**
hipótesis · **DE** descartada · **NI** no inspeccionado.

| Área | Afirmación | Fuente | Método | Estado |
|---|---|---|---|---|
| Carga | El contrato fase 12 carga el activo real | `validacion-12.json` | CDP | CE |
| Carga | 404, vacío, corrupto y red producen `error` | `validacion-12.json` | CDP | CE |
| Carga | Reintentar recupera `ready` y hash final | `validacion-12.json` | CDP | CE |
| Ciclo | Destruir durante la carga no reactiva | `validacion-12.json` | CDP | CE |
| Ciclo | Resize tras destruir no dibuja | `validacion-12.json` | CDP | CE |
| Ciclo | Destruir es idempotente | `transicion-instancia.js` | Inspección | CE |
| Determinismo | Ida/vuelta y repetición dan mismo hash | `validacion-12.json`, `validacion-10.json` | CDP | CE |
| Scroll | `t=0,5` se alcanza y no se resetea el scroll | `validacion-12.json` | CDP | CE |
| Scroll | `scrollRestoration` permanece `auto` | `validacion-12.json` | CDP | CE |
| Scroll | Fase 10: recorrido monótono, pausa, reentrada | `validacion-10.json` | CDP | CE |
| Scroll | Fase 10 usaba shim/global/scrollTo | `experiencia.js` | Inspección | CE |
| Reduce | Fase 10: estado manual, t=0 estable | `validacion-10.json` | CDP | CE |
| Físico | Ejecución móvil del contrato t=0→0,988 | `prototipos/Pruebas en movil.png` | Captura | OF parcial (dispositivo no documentado) |
| Físico | FPS/memoria en el teléfono | — | — | NI |
| Rendimiento | Coste de dibujo ~1,6–4,5 ms mediana | `MEDICION.md` | Banco headless | HR |
| Rendimiento | Intervalo `rAF` 16,7 ms | `MEDICION.md` | Banco headless | HR |
| Rendimiento | Presentación real / 60 FPS | — | — | NI |
| Scroll nuevo | `validar-scroll-cdp.mjs` ejecutado | — | Sin JSON de salida | NI |
| Scroll nuevo | bfcache deja el adaptador muerto | `scroll.js` (`pagehide` + `once`) | Inspección | HP (defecto probable, no ejecutado) |
| Scroll nuevo | Progreso inicial pisado por `iniciar()` | `scroll.js`, `app.js:533` | Inspección | HP |
| Accesibilidad | Canvas con `aria-label` | `experiencia-movimiento/index.html` | Inspección | CE |
| Accesibilidad | Alternativa textual completa | — | — | NI / pendiente |
| Fase 11 | Existe informe con hallazgos | — | Búsqueda | NI (solo encargo) |

## Gaps que la evidencia no cierra

1. **Scroll real medido**: no hay JSON de `validar-scroll-cdp.mjs`; `MEDICION.md`
   mide el banco, no un scroll real.
2. **Dispositivo documentado**: la captura no dice modelo, SO, navegador, DPR ni
   tamaño de canvas.
3. **Presentación**: no hay vsync ni composición medidas.
4. **Memoria**: no se mide; no se puede afirmar liberación.
5. **Fase 11**: el encargo define el marco, no los hallazgos.
6. **Reduce en vivo**: fase 10 escucha `change`; el `scroll.js` nuevo no.
7. **bfcache**: el `pagehide` con `{ once: true }` del `scroll.js` nuevo no
   comprueba `persisted`.

## Decisiones

| Decisión | Estado | Fuente |
|---|---|---|
| Aceptar el contrato fase 12 para auditar integración | Aprobada (provisional) | `FASE-12-RESULTADOS.md` |
| No integrar en landing | Aprobada | 09D, 10, 12 |
| Mantener A, descartar B visual | Aprobada (provisional) | 09D |
| Política de movimiento reducido | Pendiente | Fase 11 (encargo) |
| Nivel congelado/inmediato/al iniciar | Pendiente | Fase 11 (encargo) |
| Nivel de hardware a validar | Pendiente | MEDICION, FASE-10 |
