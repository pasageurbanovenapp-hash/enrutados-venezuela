# Pipeline GLB → bus de animación

## 0. Comandos de auditoría

```bash
gltf-transform inspect entrada.glb
```

Si no está instalado:

```bash
npx @gltf-transform/cli inspect entrada.glb
```

Revisa en la salida:

- `vertices`, `indices`, `glPrimitives`;
- `attributes`: `NORMAL`, `TEXCOORD_0`;
- `textures`: resolución y mime;
- `materials`;
- bbox/orientación.

También sirve un script Python que lea el JSON del GLB y los PNG; no dependas de
un visor externo para el conteo.

## 1. Normalizar orientación

Si el nodo trae rotación:

- hornearla en posiciones y normales;
- volver a medir bbox;
- confirmar largo en Z, frente +Z, suelo en Y mínimo.

No dejes la rotación solo en el nodo si el consumidor leerá geometría cruda.

## 2. Generar normales con aristas duras

Blender 4.1+:

```python
import bpy
import math

bpy.ops.import_scene.gltf(filepath="entrada.glb")
obj = bpy.context.active_object
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(30))
bpy.ops.export_scene.gltf(
    filepath="salida-normales.glb",
    export_apply=True,
    export_normals=True,
)
```

Verifica que el operador exista en tu versión. Si no, usa el auto-smooth
equivalente. No uses `shade_smooth()` solo.

## 3. Ratio de simplificación

```text
ratio = objetivo / fuente
```

| Fuente | Objetivo 25k | Objetivo 30k | Objetivo 50k |
|---|---:|---:|---:|
| 1.499.100 | 0.0167 | 0.0200 | 0.0334 |
| 499.990 | 0.0500 | 0.0600 | 0.1000 |
| 49.972 | 0.5000 | 0.6000 | 1.0000 |

No uses un ratio “porque suena agresivo”. Usa el cociente.

## 4. Optimizar

Comprueba primero:

```bash
gltf-transform optimize --help
```

Intención:

```bash
gltf-transform optimize entrada-normales.glb salida.glb \
  --texture-size 1024 \
  --simplify 0.5 \
  --flatten \
  --prune
```

Ajusta el ratio al objetivo. Los flags pueden variar.

## 5. Texturas

- Base color 1024.
- JPEG calidad 88 si el PNG deja el archivo > 3 MB.
- Quitar normal map y metallicRoughness si el shader no las usa.
- Mantener sRGB en la base.
- No usar 4K/8K.
- No usar meshopt/Draco en la primera pasada.

## 6. Verificar

```bash
gltf-transform inspect salida.glb
```

Criterios:

```text
20.000 ≤ triángulos ≤ 50.000
NORMAL: sí
TEXCOORD_0: sí
textura base: 1024
peso: < 3 MB
extensionsRequired: ninguna que no tengas configurada
```

Después, en Three:

- `GLTFLoader` carga sin decoder extra;
- `NORMAL` y `uv` presentes;
- textura correcta;
- sin excepciones.

## 7. Caso real del proyecto

- Fuente de 39 MB / 50k / NORMAL + UV.
- Sin normal map ni metallic.
- Base 1024 JPEG.
- Salida 1,56 MB.
- 30k alternativo 1,13 MB.
- Se eligió 50k porque el 30k no aportaba mejora visible.

No conviertas esto a ENF1: el ENF1 no tiene normales, UV ni textura y vuelve al
bus facetado.

## 8. Cuándo pedir otro modelo

Pide otra generación solo si:

- la silueta está mal;
- las ruedas/ejes son incorrectos;
- el color es imposible de corregir;
- el modelo no tiene la forma de bus.

No pidas otra generación solo por el peso: el peso se resuelve con este pipeline.
