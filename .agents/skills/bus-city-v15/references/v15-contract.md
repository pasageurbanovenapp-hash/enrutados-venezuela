# Contrato V15

## Rutas

```
prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/v15-doble-reloj/
  index.html
  spike.js
  assets/bus_1024.glb
  vendor/GLTFLoader.js
  vendor/BufferGeometryUtils.js
  vendor/three.module.js
  assets/facetas.bin        # fallback histórico; no se usa con el bus GLB
  assets/motor.js           # decodificador ENF1; no se usa con el bus GLB
```

Landing:

```
artifacts/enrutados-venezuela/
  src/components/sections/
  src/data/
  src/features/landing/landing-page.tsx
```

La rama de trabajo narrativa puede ser `narrativa-propuesta`. No uses `main`
para experimentos.

## Modelo de estado

```
phase   = scroll normalizado (0..1)
erode   = reloj A, 0..1, tiempo
reform  = reloj B, 0..1, tiempo reversible
```

Flujo:

1. `phase` sube por scroll.
2. Al pasar `BUS_ENTRY_END` (0.17), `erode` avanza solo.
3. Cuando `erode >= E_COMPUERTA` (0.75) y `phase >= REFORM_START` (0.38),
   `reform` avanza solo.
4. Al bajar `phase` o `erode`, `reform` retrocede.
5. Al bajar por debajo de `BUS_ENTRY_END`, `erode` retrocede.

No reinicies `erode` al volver a la sección 2. La reforma es reversible, no
“one-shot”.

## Constantes de referencia

```js
const ERODE_SECS = 5.0;
const REFORM_SECS = 4.0;
const E_INI = 0.15;
const E_FRENTE = 0.45;
const E_DRIFT = 0.40;
const E_COMPUERTA = 0.75;
const REFORM_START = 0.38;
const TETRA_REL = 0.0079;
const DISPERSION = 1.65;
```

`E_INI + E_FRENTE + E_DRIFT = 1.0`.

Reversa:

```js
const paso = (dt / duracion) * (destino ? 1 : 2.5);
erode += Math.max(-paso, Math.min(paso, destino - erode));
```

No uses `erode = destino` para “acortar” la animación.

## Carga del bus

```js
import { GLTFLoader } from './vendor/GLTFLoader.js';
const loader = new GLTFLoader();
const gltf = await loader.loadAsync('./assets/bus_1024.glb');
```

- `GLTFLoader.js` importa `./BufferGeometryUtils.js`; ambos deben existir.
- No usar meshopt ni Draco en la primera integración.
- `bus_1024.glb` es un archivo real, no symlink.

## Adaptador de geometría

El GLB puede usar atributos interleaved. Extrae siempre con métodos:

```js
const pos = mesh.geometry.getAttribute('position');
const uv = mesh.geometry.getAttribute('uv');
const P = new Float32Array(pos.count * 3);
const U = new Float32Array(uv.count * 2);
for (let i = 0; i < pos.count; i++) {
  P[i*3] = pos.getX(i);
  P[i*3+1] = pos.getY(i);
  P[i*3+2] = pos.getZ(i);
}
for (let i = 0; i < uv.count; i++) {
  U[i*2] = uv.getX(i);
  U[i*2+1] = uv.getY(i);
}
```

Nunca uses `pos.array[i*3]` si el atributo puede ser interleaved.

## Shader del bus

Conserva:

- `uThreshold`, `uMinZ`, `uMaxZ`;
- ruido de borde;
- `discard`;
- `vNormal` desde la normal del GLB;
- `vLocalZ` para el frente de erosión.

Añade:

- `uniform sampler2D uMap`;
- `varying vec2 vUv`;
- `texture2D(uMap, vUv).rgb` como color base.

No añadas `color` por vértice si ya usas textura. No llames
`computeVertexNormals()` sobre geometría desindexada.

## Horneado de partículas

```js
const img = texture.image;
if (typeof img.decode === 'function') await img.decode();
const cv = document.createElement('canvas');
cv.width = img.width; cv.height = img.height;
const cx = cv.getContext('2d', { willReadFrequently: true });
cx.drawImage(img, 0, 0);
const data = cx.getImageData(0, 0, cv.width, cv.height).data;

for (let t = 0; t < triCount; t++) {
  const a = idx[t*3], b = idx[t*3+1], c = idx[t*3+2];
  const u = (U[a*2] + U[b*2] + U[c*2]) / 3;
  const v = (U[a*2+1] + U[b*2+1] + U[c*2+1]) / 3;
  const x = Math.max(0, Math.min(cv.width - 1, Math.floor(u * cv.width)));
  const y = Math.max(0, Math.min(cv.height - 1,
    Math.floor((texture.flipY ? 1 - v : v) * cv.height)));
  const p = (y * cv.width + x) * 4;
  level.colores[t*3] = data[p];
  level.colores[t*3+1] = data[p+1];
  level.colores[t*3+2] = data[p+2];
}
```

- GLTFLoader suele usar `flipY = false`.
- No hardcodees `1 − v` sin probar el color del cristal y la carrocería.
- No promedies UV de islas distintas.
- Guarda sRGB; no conviertas dos veces.

## Encuadre

`ajustarEncuadre()` debe usar `level.minimo` y `level.maximo` reales.

Comprueba:

- bus apoyado (`BUS_Y` cerca del suelo);
- ancho NDC coherente;
- alto NDC no recortado;
- entrada desde fuera de cuadro;
- cámara final y dolly intactos.

Un bus flotando o diminuto casi siempre significa que la caja envolvente se
calculó con posiciones mal leídas.

## Qué no tocar

Sin aprobación explícita:

- `advanceErosion`, `advanceReform`, `updatePhase`;
- ciudad `CITY_*`;
- `sampleBus`;
- textos;
- orden de secciones;
- `main` o la rama de despliegue.
