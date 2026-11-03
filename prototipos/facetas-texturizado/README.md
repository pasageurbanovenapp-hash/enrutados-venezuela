# Bus texturizado → facetas

Horneado del GLB de 39 MB a los presets acordados, y comparación de lectura
contra la buseta. Prototipo aislado: no entra en el build, no añade
dependencias, no toca `artifacts/enrutados-venezuela/`.

---

## Cómo abrirlo

```bash
cd prototipos/facetas-texturizado
python3 -m http.server 5199
```

| Parámetro | Efecto |
|---|---|
| `?modo=matriz&tam=300` | Control A, superficie B y color del atlas |
| `?modo=matriz&tam=900` | Lo mismo a 900 px |
| `?modo=solo&estilo=C&nivel=0&v=trescuartos` | Color directo del atlas |
| `?modo=escala` | Los dos niveles |

---

## Qué se horneó

| | Valor |
|---|---|
| Fuente | 499.877 caras, 307.977 vértices, 39,04 MB |
| Atlas | 8192 × 8192 baseColor + 8192 × 8192 metallicRoughness |
| Preset escritorio | **3.539 facetas** (objetivo 3.554) |
| Preset móvil | **2.021 facetas** (objetivo 2.271) |
| Peso de la geometría | 67 kB con grupos y color; 217 kB los dos presets WebGL |

---

## Cómo se clasificó

El atlas resultó **no servir para clasificar**: es un albedo oscuro con luz
horneada, y cristal y carrocería comparten valor y saturación. Los grupos se
infieren de la geometría, con los ejes de rueda detectados en z = −0,478 y
z = +0,589:

- cristal: banda entre 55% y 85% de altura con normal casi vertical
- rueda: cilindro de radio 0,115 alrededor de cada eje
- faro: esquinas bajas del frente
- ámbar: esquinas del trasero

El atlas se usa como **paleta**: el color medio por grupo sale de muestrear la
textura con las UV reales de cada faceta.

---

## Lo que se vio

El muestreo UV es correcto: pintando cada faceta con su color del atlas el bus
se lee con carrocería azul, molduras cian, cristales negros y piloto ámbar.

Pero a 3.500 facetas **el color por faceta sale ruidoso**. La decimación mezcla
vértices de islas distintas del atlas y cada faceta acaba leyendo una zona
diferente. Sirve para validar el material, no para pintar: el acabado B
(superficie con luz propia) es el que se sostiene.

---

## Geometría preparada

`facetas-web.bin` conserva el formato de 40 B por faceta, no indexado, con
posición, centroide, normal, grupo, semilla, eje, giro y retardo. Se decodifica
con `geometria.js` (copiado del prototipo anterior) a atributos por vértice.
Los presets son: **0 = 3.539 (escritorio), 1 = 2.021 (móvil)**.
