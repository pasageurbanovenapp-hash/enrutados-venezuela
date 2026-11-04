---
name: glb-animation-budget
description: Turn a heavy AI-generated GLB bus into a web-ready animation asset for the Enrutados bus→city transition: audit, normalize orientation, preserve/generate normals and UVs, simplify to a triangle budget, reduce textures, verify <3 MB, load with GLTFLoader, and choose a mobile fallback when needed. Use when a GLB is too heavy, has 4K/8K textures, lacks NORMAL/TEXCOORD_0, looks faceted/petroleum, or must fit an animation budget. Do not use to invent separate materials that the source does not have, or to convert a smooth bus to ENF1.
---

# GLB → presupuesto de animación

## Propósito

Convertir un GLB de IA en un activo que pueda vivir dentro de la transición
bus → ciudad sin arruinar la silueta:

- 20.000–50.000 triángulos;
- geometría indexada;
- `NORMAL` y `TEXCOORD_0`;
- una textura base 1024;
- menos de 3 MB;
- ejes correctos;
- carga con `GLTFLoader`.

El objetivo no es “el archivo más pequeño”. Es el activo más pequeño que
todavía se lee a 300 px y conserva la piel.

## Cuándo activarla

- El GLB pesa decenas de MB.
- Tiene texturas 4K/8K.
- No tiene `NORMAL` o `TEXCOORD_0`.
- Se ve facetado, “a petróleo” o con parches.
- Hay que decidir entre 25k, 30k o 50k.
- Se va a integrar el bus en `bus-city-v15`.

## Cuándo **no** activarla

- Para separar materiales que el GLB no tiene.
- Para convertir el bus a ENF1/ENF2 y perder textura/normales.
- Para publicar afirmaciones de rendimiento sin medir.
- Para rediseñar la narrativa o la landing.

## Cadena

1. `glb-animation-budget` — deja el GLB.
2. `bus-city-v15` — lo integra.
3. `interactive-3d-validation` — valida.

## Presupuesto

| Uso | Triángulos | Textura | Peso objetivo |
|---|---:|---:|---:|
| Bus de animación | 20k–50k | 1024 | < 3 MB |
| Respaldo móvil | 30k | 1024 | < 2 MB |
| Referencia, no runtime | cualquiera | cualquiera | no importa |

La V15 aprobada usa **50k, 1,56 MB, textura 1024 JPEG**. El 30k existe como
respaldo, pero no hay evidencia para bajarlo.

## Presupuesto móvil

- 50k / 1,56 MB es la base aprobada.
- 30k / 1,13 MB es respaldo si el equipo o la red lo exigen.
- Textura base 1024; sin normal map ni metallicRoughness.
- DPR máximo 2.
- Sin meshopt/Draco en la primera pasada.
- Sin texturas 4K/8K.
- Cargar el GLB solo cuando la sección esté cerca; no en el primer paint.
- Probar 360×800, 390×844 y 300×900; POCO físico cuando sea posible.
- No prometer FPS ni memoria sin medición.

Detalle en `references/mobile.md`.

## 1. Auditar antes de decidir

Comprueba:

- nodos, mallas, materiales, texturas;
- `POSITION`, `NORMAL`, `TEXCOORD_0`;
- triángulos y vértices;
- tamaño de texturas;
- bbox y orientación;
- rotación de nodo;
- si hay interior, piso o chasis.

Casos reales de este proyecto:

| GLB | Triángulos | Vértices | Atributos | Texturas | Peso |
|---|---:|---:|---|---|---:|
| 45 MB | 499.990 | 308.773 | POSITION, UV | 2×8192 | 45 MB |
| 87 MB | 1.499.100 | 888.981 | POSITION, NORMAL, UV | 3×4096 | 87 MB |
| 39 MB | 49.972 | 34.548 | POSITION, NORMAL, UV | 3×4096 | 39 MB |
| final | 49.972 | 34.548 | POSITION, NORMAL, UV | 1×1024 JPEG | 1,56 MB |

El de 45 MB no tenía normales. El de 87 MB sí, pero era una escultura de 1,5M.
El de 39 MB fue la mejor fuente.

## 2. Elegir fuente

- No elijas por peso: elige por atributos, silueta y orientación.
- Un GLB con normales y UV es mejor que uno más liviano sin ellas.
- No uses el de 45 MB como runtime si no tiene `NORMAL`.
- Guarda el original; no lo sobrescribas.

## 3. Orientación

- Largo en Z, frente +Z, arriba +Y.
- Suelo en el mínimo de Y.
- Si el nodo trae rotación de +90° en X, **hornea** la rotación en vértices y
  normales antes de exportar.
- No confíes en que el consumidor aplique la transformación del nodo.
- Verifica la caja después de hornear.

## 4. Normales

### Si el GLB ya trae NORMAL

- Consérvalas.
- No llames `computeVertexNormals()` después.
- No desindexes solo para “suavizar”.

### Si no trae NORMAL

Genera normales suaves con aristas duras:

- Blender 4.1+: `bpy.ops.object.shade_smooth_by_angle(angle=math.radians(30))`.
- O el operador equivalente de auto-smooth de tu versión.
- Exporta con `export_normals=True` y `export_apply=True`.
- Abre el GLB final y confirma que existe `NORMAL`.

No uses `shade_smooth()` a secas: derrite cristales y marcos.

## 5. Simplificar

Calcula el ratio:

```text
ratio = triángulos_objetivo / triángulos_fuente
```

Ejemplos:

```text
25.000 / 1.499.100 ≈ 0.0167
25.000 /   499.990 ≈ 0.050
25.000 /    49.972 ≈ 0.500
30.000 /    49.972 ≈ 0.600
```

No uses `0.15` por inercia. Puede dejar 75k.

Antes de ejecutar, revisa la ayuda de tu versión:

```bash
gltf-transform optimize --help
gltf-transform inspect input.glb
```

Intención:

```bash
gltf-transform optimize input.glb output.glb \
  --texture-size 1024 \
  --simplify <ratio> \
  --flatten \
  --prune
```

Los nombres exactos de los flags cambian entre versiones. No los des por hechos.

## 6. Texturas

- Base color a 1024.
- Quitar normal map y metallicRoughness si el shader no las usa.
- JPEG calidad 88 puede bajar el archivo de 3,3 MB a 1,56 MB.
- Mantener sRGB en la base.
- No usar 8K.
- No usar meshopt ni Draco en la primera pasada.
- Si se usa meshopt, añadir `MeshoptDecoder` a `GLTFLoader`; no lo olvides.

## 7. Verificar

Con `gltf-transform inspect` o visor:

- triángulos en rango;
- `NORMAL` y `TEXCOORD_0`;
- una textura 1024;
- un material;
- < 3 MB;
- bbox y orientación;
- sin texturas 4K ocultas;
- sin extensión que requiera decoder no configurado.

Después, en Three:

- `GLTFLoader` carga;
- geometría indexada;
- normales y UV presentes;
- textura se ve correcta;
- no hay excepciones.

## 8. Integración

- `bus-city-v15` construye el `level` con `getX/getY/getZ` para atributos
  interleaved.
- No leer `position.array` como plano.
- No llamar `computeVertexNormals()` en el bus.
- El shader usa `uMap` y `vUv`.
- Las partículas hornean color desde la textura una vez.

## Errores frecuentes

| Error | Resultado | Prevención |
|---|---|---|
| Pedir “low poly” a un generador | 1,5M de caras | Presupuesto + postproceso |
| `--simplify 0.15` sin calcular | 75k, no 25k | Ratio explícito |
| Texture 4K “porque se ve mejor” | 39 MB | 1024 + JPEG |
| Meshopt sin decoder | No carga | Primera pasada sin compresión |
| Suponer NORMAL | Sombras planas | `inspect` |
| `shade_smooth()` | Cristales derretidos | Auto Smooth/crease |
| Nodo rotado | Bus “de pie” | Hornear rotación |
| ENF1 | Sin textura ni normales | GLTFLoader |
| Textura sRGB mal muestreada | Bus oscuro/partículas claras | Probar flip y espacio de color |

## Criterios de aceptación

1. 20k–50k triángulos.
2. `NORMAL` y `TEXCOORD_0`.
3. Una textura base 1024.
4. Sin 4K/8K ocultas.
5. < 3 MB.
6. Ejes correctos y suelo en Y mínimo.
7. Un material (o los que realmente tenga).
8. Carga con `GLTFLoader` sin decoder extra.
9. Se lee a 300 px.
10. No se convirtió a ENF1/ENF2.

## Referencias

- `references/pipeline.md` — comandos, ratios y ejemplos del proyecto.
- `references/pitfalls.md` — errores observados y cómo evitarlos.
- `references/mobile.md` — presupuesto y pruebas móviles.
- `references/windows.md` — comandos PowerShell y límites del fuente.
- Skills: `bus-city-v15`, `interactive-3d-validation`.
