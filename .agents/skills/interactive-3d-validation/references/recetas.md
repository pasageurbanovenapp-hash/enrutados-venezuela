# Recetas de validación

Comandos del proyecto. Verifica siempre la cabecera del script antes de asumir
argumentos; los valores por defecto cambian entre fases.

## Servidor local

```bash
cd /ruta/al/repositorio
python3 -m http.server 5199 --bind 127.0.0.1
```

## Chrome headless con CDP

```bash
google-chrome --headless=new --disable-gpu --no-sandbox \
  --user-data-dir=/tmp/perfil-validacion \
  --remote-debugging-port=9229 \
  "http://127.0.0.1:5199/prototipos/desintegracion-controlada/..."
```

`--disable-gpu` es una cota conservadora (rasterizado por software); no
representa GPU real. No uses un perfil dentro del repositorio.

## Scripts de este proyecto

| Fase | Script | Puerto por defecto |
|---|---|---|
| 09B | `ciudad-particulas/transicion-bus-ciudad/validar-transicion-cdp.mjs` | 9227 |
| 10 | `experiencia-movimiento/validar-experiencia-cdp.mjs` | 9228 |
| 12 | `fase-12-ciclo-vida/validar-fase12-cdp.mjs` | pasar explícito (se usó 9229) |
| scroll nuevo | `validar-scroll-cdp.mjs` | 9223 |

```bash
node validar-fase12-cdp.mjs 9229 > validacion-12.json 2>&1
node validar-experiencia-cdp.mjs 9228
node validar-scroll-cdp.mjs 9223
```

Comprueba que el script termina con código 0 y que el JSON existe **antes** de
citar resultados. Un script sin JSON no es evidencia.

## Viewports de referencia

| Entorno | Viewport | DPR | Lienzo esperado |
|---|---|---|---|
| Escritorio | 1440×757 | 1 | 1440×627 |
| Móvil | 390×844 | 2 | 390×714 |

Emulación CDP:

```js
Emulation.setDeviceMetricsOverride({ width: 1440, height: 757, deviceScaleFactor: 1, mobile: false })
Emulation.setDeviceMetricsOverride({ width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
```

## Activos de error

| Caso | Activo / URL |
|---|---|
| 404 | `.../no-existe.bin` |
| Vacío | `fase-12-ciclo-vida/datos/vacio.bin` (0 B) |
| Corrupto | `fase-12-ciclo-vida/datos/corrupto.bin` (19 B) |
| Red | `http://127.0.0.1:5999/no-existe.bin` (host cerrado) |

## Qué debe contener el JSON

Para fase 12, al menos:

- `escenarios[viewport].ready`, `lienzo`;
- `paridad[].t`, `hash`, `ref`, `igual`;
- `remontaje`, `determinismo`;
- `errores[caso]` con `error`, `mensaje`, `eventos`, `recuperado`, `hash`;
- `duranteCarga` (loading→destroyed, sin ready);
- `resize` (hash constante);
- `scroll` (t, sin reset, `scrollRestoration`, métricas);
- `erroresConsola`.

Si un campo no existe, no lo interpretes: inspecciona el script.

## Protocolo físico

1. Sirve el prototipo en la red local (no abras `file://`).
2. Anota dispositivo, SO, navegador, DPR, viewport y tamaño CSS del canvas.
3. Captura `t=0`, 0.25, 0.5, 0.75, 1 y el reverso.
4. Registra lo observado: recortes, saltos, legibilidad, respuesta al scroll.
5. No escribas FPS/memoria si no los mediste.
6. Guarda la captura fuera del repositorio o en una carpeta ignorada.

## Hash FNV de píxeles

```js
const datos = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
let h = 2166136261;
for (let i = 0; i < datos.length; i += 97) {
  h ^= datos[i];
  h = Math.imul(h, 16777619);
}
const huella = (h >>> 0).toString(16).padStart(8, '0');
```

El hash prueba igualdad de píxeles en el mismo tamaño; no prueba fluidez.

## Búsqueda de anti-patrones

```bash
grep -rn "window.fetch\|scrollRestoration\|scrollTo(\|__transicion\|pagehide" \
  prototipos/desintegracion-controlada --include=*.js
```

Revisa cada coincidencia a mano: no todas son un defecto.
