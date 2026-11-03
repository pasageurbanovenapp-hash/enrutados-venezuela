# Buseta retexturizada → facetas

Tercer intento de la cadena V2Fun, y el primero que pasa la compuerta.
Prototipo aislado: no entra en el build, no añade dependencias, no toca
`artifacts/enrutados-venezuela/`.

## Cómo abrirlo

```bash
cd prototipos/facetas-retexture
python3 -m http.server 5199
```

| Parámetro | Efecto |
|---|---|
| `?modo=matriz&tam=300` | A (wireframe), B (superficie) y C (color del atlas) |
| `?modo=matriz&tam=900` | Lo mismo a 900 px |
| `?modo=solo&estilo=C&nivel=0&v=frontal` | Color del atlas de frente |

## Qué se horneó

Fuente: `prototipos/entradas/retexture-buseta.glb` (7,3 MB, 35.099 triángulos,
textura 3072²). Salida:

| Preset | Facetas | Peso |
|---|---|---|
| Escritorio | **4.003** | 79 kB con grupos y color |
| Móvil | **2.282** | 245 kB los dos presets WebGL |

La geometría del retexture es **la misma que la de entrada**: 35.099 triángulos,
misma silueta, mismos retrovisores. Solo añade UV y textura. Por eso pasa donde
el remesh falló.

Ejes de rueda detectados automáticamente en z = −0,428 y +0,524.

## Lo que se ve

Con el color del atlas la buseta se lee con cuerpo azul, banda de ventanas gris,
ruedas oscuras y pilotos ámbar. Es la primera vez que el color por faceta es
coherente: el atlas del modelo de 8K era ruidoso, este no.

Queda algo de variación entre facetas vecinas por las costuras de UV, pero se lee
como un modelo facetado pintado, no como un mosaico roto.

## Coste

| Tarea | Créditos | Resultado |
|---|---|---|
| Remesh 3.600 | 5 | rechazado: perdió retrovisores y techo |
| Retexture | 20 | **aceptado** |
| Saldo restante | 75 | |
