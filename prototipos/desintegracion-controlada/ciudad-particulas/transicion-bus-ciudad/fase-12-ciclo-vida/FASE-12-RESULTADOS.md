# FASE 12 — Contrato de montaje/desmontaje y carga configurable

**Rama:** `prototipo/ciudad-trazada` · **HEAD:** `15d7851` · **Fecha:** 2026-10-26
**Ámbito:** `ciudad-particulas/transicion-bus-ciudad/fase-12-ciclo-vida/`.

## 1. Qué se creó

| Archivo | Función |
|---|---|
| `transicion-instancia.js` | Fábrica `crearTransicion({ canvas, assetURL, onEstado })`; variante A; sin DOM global ni `fetch` parcheado |
| `adaptador-scroll.js` | Adaptador mínimo `crearAdaptadorScroll({ seccion, instancia })`; un solo rAF, épsilon, IO, destroy |
| `index.html`, `estilos.css` | Laboratorio aislado, sin inicialización automática |
| `laboratorio.js` | Arnés de pruebas (`window.__lab`), **no** forma parte del contrato |
| `datos/vacio.bin`, `datos/corrupto.bin` | Activos de error (0 B y 19 B) |
| `validar-fase12-cdp.mjs` | Validación por CDP |
| `validacion-12.json` | Resultado crudo |
| `FASE-12-RESULTADOS.md` | Este informe |

Procedencia: fórmulas y dibujo de `../transicion.js` (09B), variante A, sin modificarlo.
La única diferencia funcional es que se quitó la variante B, el HUD y los controles DOM.

## 2. Contrato

```
crearTransicion({ canvas, assetURL, onEstado })
  → { destruir(), estado(), fijarT(t), reintentar(urlOpcional) }
```

- `estado()`: `{ fase, t, facetas, destinos, lienzo, error }`, con `fase ∈ loading|ready|error|destroyed`.
- `fijarT(t)`: devuelve `false` si no está lista o está destruida; guarda `t` pendiente y lo aplica al quedar lista.
- `reintentar(url)`: `false` si está cargando o destruida; reutiliza la URL o adopta una nueva; una sola carga simultánea.
- `destruir()`: idempotente; aborta la carga, desconecta el `ResizeObserver`, limpia el canvas y suelta referencias.
- No usa ids de DOM, ni `window.fetch`, ni `scrollTo`, ni `history.scrollRestoration`, ni globales.
- El canvas lo aporta el llamador; tras destruir queda limpio y **no debe reutilizarse** (nueva instancia, nuevo canvas).

## 3. Pruebas (escritorio 1440 × 627 y móvil 390 × 714, DPR 2)

| Escenario | Escritorio | Móvil |
|---|---|---|
| A. Crear → ready | ✅ 4.003 facetas | ✅ 2.282 |
| A. Remontaje con canvas nuevo | ✅ hash `0e627ad8` | ✅ `5d4ef246` |
| B. Destruir durante la carga (red lenta 2 s) | ✅ `loading→destroyed`, sin `ready` posterior | ✅ igual |
| C. Resize tras destruir (1200 y vuelta) | ✅ hash constante `f1dfd15f` | ✅ `af693a35` |
| D. HTTP 404 | ✅ `HTTP 404` | ✅ |
| D. Binario vacío | ✅ `El binario está vacío` | ✅ |
| D. Binario corrupto | ✅ `Formato de facetas no compatible: NOES` | ✅ |
| D. Error de red | ✅ `Failed to fetch` | ✅ |
| E. Reintento tras cada error | ✅ ready y hash final `0e627ad8` | ✅ `5d4ef246` |
| F. Determinismo ida/vuelta | ✅ | ✅ |
| G. Scroll a t=0,5 | ✅ t=0,5 | ✅ |
| G. Sin reseteo de scroll | ✅ 400→400 | ✅ |
| G. `scrollRestoration` intacto | ✅ `auto` | ✅ |
| G. Destruir adaptador+instancia y volver a desplazar | ✅ 0 RAF y 0 dibujos nuevos | ✅ |
| Errores de consola | ✅ ninguno | ✅ ninguno |

## 4. Paridad visual con la variante A

Se comparó la instancia con la página original (`../index.html?variante=A`) en las mismas
condiciones. **Los 5 hashes coinciden exactamente en ambos tamaños**:

| t | Escritorio | Móvil |
|---|---|---|
| 0 | `6b48fb94` | `a68c9ec5` |
| 0,25 | `f06086dd` | `8b5afcb9` |
| 0,50 | `7f69b717` | `5afc15a5` |
| 0,75 | `7102b18d` | `2cdb8789` |
| 1 | `0e627ad8` | `5d4ef246` |

No hubo que ajustar ninguna fórmula.

## 5. Defectos encontrados y corregidos

1. **Instancia:** arrancaba en `fase='loading'` y `cargar()` se auto-bloqueaba con esa
   comprobación; nunca descargaba. Se separó la bandera `cargando`.
2. **Arnés:** `destruir()` no llamaba al `destruir()` de la instancia, así que los
   escenarios B y C probaban una instancia viva. Corregido; ambos pasan.
3. **Arnés:** las métricas del adaptador se leían después de anularlo; ahora se
   conserva la última instantánea.

Los tres eran defectos de la prueba, no del contrato, y quedaron registrados.

## 6. Limitaciones

- Emulación de navegador, sin GPU ni teléfono físico; sin tiempo de presentación.
- La liberación de memoria no se mide: se sueltan referencias, pero el GC y la GPU
  no son observables desde aquí.
- El nivel de facetas se fija al crear la instancia y no cambia al redimensionar.
  Es una decisión **provisional** del prototipo, no la política de producto (Fase 11
  sigue pendiente).
- El adaptador es de laboratorio; no implementa la experiencia narrativa ni la
  política de movimiento reducido.
- El canvas destruido se limpia y no debe reutilizarse; una integración debe crear
  uno nuevo por instancia.
- El arnés `window.__lab` es solo de pruebas y no forma parte del contrato.

## 7. Riesgos que permanecen

- Rendimiento y presentación en hardware real.
- Ubicación narrativa y ancla en la landing (decisión de producto).
- Política de nivel de facetas y de movimiento reducido (decisiones de producto).
- Hospedaje y caché del binario en la landing.
- UX de error/reintento (el contrato lo permite; la interfaz no está diseñada).

## 8. Veredicto

**Apto para auditoría de integración.** El contrato se crea con dependencias
explícitas, carga desde una URL configurable, falla y se recupera por estados
manejados, se destruye durante la carga sin reactivarse, sobrevive a un resize
posterior sin dibujar, se remonta con una instancia nueva y conserva exactamente
los estados visuales de la variante A.

No autoriza integrar en la landing: las decisiones de producto de la Fase 11
siguen abiertas y no hay validación física.

## 9. Estado final

- Rama `prototipo/ciudad-trazada`, HEAD `15d7851`. **Sin commit.**
- `git status --short artifacts/` vacío.
- `transicion.js` `c1ac95d7`, `motor.js` `a88b80a6`, `app.js` `a63ba7e7`,
  `scroll.js` `c51ce162`, fases 06/07/08 `6df400ca`/`371c673f`/`fa3dbfc6`,
  sin cambios.
- Nuevas entradas esperadas en `git status`: solo `fase-12-ciclo-vida/`.
