# GLB en Windows

## Requisitos

- Node.js 20+.
- `npx` o `gltf-transform` global.
- Blender 4.1+ si hay que generar normales.
- El GLB fuente, si se va a reoptimizar.

## Inspeccionar

```powershell
npx @gltf-transform/cli inspect .\bus-fuente.glb
```

No confíes en el nombre del archivo: revisa `NORMAL`, `TEXCOORD_0`, texturas y
triángulos.

## Generar normales en Blender

Guarda el script y ejecútalo con la ruta de Blender entre comillas:

```powershell
& "C:\Program Files\Blender Foundation\Blender 4.1\blender.exe" `
  --background --python .\normales.py
```

El script debe:

- importar el GLB;
- activar el objeto;
- `shade_smooth_by_angle(angle=radians(30))` o auto-smooth equivalente;
- exportar con `export_normals=True` y `export_apply=True`.

Después, inspecciona otra vez y confirma `NORMAL`.

## Optimizar

```powershell
npx @gltf-transform/cli optimize .\entrada-normales.glb `
  .\salida.glb --texture-size 1024 --simplify 0.5 --flatten --prune
```

Verifica los flags con:

```powershell
npx @gltf-transform/cli optimize --help
```

El ratio se calcula, no se adivina:

```
objetivo / fuente
```

## Verificar

```powershell
npx @gltf-transform/cli inspect .\salida.glb
```

Busca:

- 20k–50k triángulos;
- `NORMAL`;
- `TEXCOORD_0`;
- textura 1024;
- < 3 MB;
- una material.

## Copiar al proyecto

```powershell
Copy-Item .\salida.glb `
  .\prototipos\desintegracion-controlada\ciudad-particulas\transicion-bus-ciudad\v15-doble-reloj\assets\bus_1024.glb
```

Comprueba que no quedó un symlink y que el tamaño es el esperado.

## Fuente no versionado

El GLB de 39 MB que sirvió de fuente no está en el repositorio. Solo está el
resultado `bus_1024.glb`. Para reproducir la conversión completa hay que aportar
ese fuente; para ver la animación basta el resultado.
