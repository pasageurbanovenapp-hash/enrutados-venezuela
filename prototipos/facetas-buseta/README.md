# La buseta facetada — lectura y estilo de superficie

Prototipo aislado. No entra en el build, no añade dependencias y no toca
`artifacts/enrutados-venezuela/`.

---

## Cómo abrirlo

```bash
cd prototipos/facetas-buseta
python3 -m http.server 5199
```

### Parámetros

| Parámetro | Efecto |
|---|---|
| `?modo=matriz&tam=300` | Compara A y B en frontal y 3/4, a 300 px |
| `?modo=matriz&tam=900` | Lo mismo a 900 px |
| `?modo=solo&nivel=1&estilo=B` | Una sola vista grande |
| `?modo=escala` | Los cuatro niveles, lado a lado |
| `?modo=debug&debug=1` | Grupos de región en color plano |
| `?v=frontal` | 180°/−4°. `trescuartos` es 42°/−12°, `lado` 90°/−2° |
| `?estilo=A` | Control: wireframe |

---

## Presets

| Uso | Nivel | Facetas | Peso |
|---|---|---|---|
| Escritorio | 1 | **3.554** | 31,8 kB |
| Móvil | 0 | **2.271** | 20,3 kB |
| — | 3 | 15.417 | 138 kB · **no usar en producción** |

---

## Pasada de estilo

**A · control.** Relleno casi negro y arista cian al 34%, 0,8 px. Todo el dibujo
depende de la arista: se lee como malla técnica.

**B · superficie.** Relleno con luz y arista fina y tenue:

| Región | Relleno | Arista |
|---|---|---|
| Cuerpo | azul petróleo iluminado, con caída por altura y ruido estable por faceta | cian 11%, sube a 41% con el contorno (rim) |
| Cristal | casi negro azulado | cian 4 a 14% |
| Rueda | gris azulado muy oscuro | cian 7 a 19% |
| Faro | blanco cian | blanco 55% |
| Ámbar | ámbar atenuado | ámbar 30% |

La luz clave viene de arriba a la izquierda; hay una luz de relleno opuesta y un
término de contorno (`1 - |N·V|`)³ que enciende la arista en el borde de la
silueta. Eso es lo que da la lectura de superficie digital luminosa sin volver al
wireframe.

Las regiones no vienen de materiales: el OBJ trae **un solo material gris**. Se
infieren de la geometría y se documentan como aproximación:

- cristal: banda entre 54% y 82% de altura con normal casi vertical
- rueda: cilindro de radio 0,085 alrededor de los dos ejes detectados
- faro: esquinas bajas del frente, en el 5% delantero
- ámbar: esquinas del trasero

---

## Geometría preparada para animación

`facetas-web.bin` guarda **2.825 facetas** (los dos presets) en **40 bytes por
faceta**, no indexado:

| Bytes | Atributo | Tipo |
|---|---|---|
| 18 | posición, 3 vértices | uint16 normalizado a la caja |
| 6 | centroide | uint16 |
| 3 | normal | int8 |
| 1 | grupo de región | uint8 |
| 2 | semilla estable | uint16 |
| 3 | eje de giro | int8 |
| 2 | velocidad de giro | uint16 |
| 2 | retardo | uint16 |
| 3 | relleno | — |

`geometria.js` decodifica a atributos **por vértice** (tres por faceta), que es
lo que necesita una `BufferGeometry`:

```js
import { decodificarPreset, PRESET_ESCRITORIO } from './geometria.js';
const geo = decodificarPreset(buf, PRESET_ESCRITORIO);
// geo.position, geo.aCentroid, geo.aNormal, geo.aGroup,
// geo.aSeed, geo.aAxis, geo.aSpin, geo.aDelay
// geo.index === null  (no indexado a propósito)
```

La desintegración se calcula en el vertex shader: cada vértice se desplaza
alrededor de `aCentroid`, usando `aAxis`, `aSpin`, `aDelay` y `aSeed`. No hace
falta un draw call ni un Mesh por faceta.

**No se ha medido el coste por fotograma de la escena animada.** Este prototipo
es estático y canvas 2D. La elección de renderizador sigue abierta.

---

## Capturas

| Archivo | Qué muestra |
|---|---|
| `capturas/matriz-300-dpr1.png` | A y B, frontal y 3/4, 300 px |
| `capturas/matriz-300-dpr2.png` | Igual a DPR 2 |
| `capturas/matriz-900-dpr1.png` | A y B a 900 px |
| `capturas/matriz-900-dpr2.png` | Igual a DPR 2 |
| `capturas/debug-grupos.png` | Regiones clasificadas |
