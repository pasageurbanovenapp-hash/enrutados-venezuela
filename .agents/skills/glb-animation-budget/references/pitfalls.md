# Errores observados

## “Parece pintado con petróleo”

Causa:

- color transferido desde una textura 8K con luz horneada;
- color promedio por triángulo;
- normales planas por desindexado;
- paleta por grupos que no coincide.

No se arregla solo bajando triángulos. Se arregla con textura real, UV,
normales suaves y un shader que muestree la base.

## “Se ve facetado”

Causa:

- ENF1 por triángulo;
- geometría no indexada;
- `computeVertexNormals()` sobre triángulo suelto;
- textura sin UV.

Solución:

- GLTFLoader;
- geometría indexada;
- NORMAL del GLB;
- no desindexar.

## “El bus flota o es diminuto”

Causa:

- `level` construido con `position.array` interleaved;
- bbox falsa;
- rotación de nodo no aplicada.

Solución:

- `getX/getY/getZ`;
- hornear rotación;
- medir la caja después.

## “No carga en el navegador”

Causas:

- meshopt sin `MeshoptDecoder`;
- Draco sin `DRACOLoader`;
- GLTFLoader con import relativo roto;
- textura con ruta mal resuelta.

Solución:

- primera pasada sin compresión;
- loader y `BufferGeometryUtils` locales;
- revisar consola y red.

## “La textura se ve invertida”

Causa:

- `flipY` mal asumido al hornear partículas;
- UV de glTF y canvas no comparten origen.

Solución:

- usar `texture.flipY`;
- probar cristal oscuro vs carrocería azul;
- no hardcodear `1-v`.

## “El archivo final pesa 3,3 MB”

Causa:

- PNG 1024 en vez de JPEG;
- conservar normal/metallic;
- textura extra.

Solución:

- base 1024 JPEG;
- quitar mapas no usados;
- volver a medir.

## “No se puede separar cristal y ruedas”

Causa:

- el GLB tiene una sola malla y un solo material.

Solución:

- no prometer materiales separados;
- usar textura/UV;
- si se necesitan piezas, pedir otro activo o modelar.

## “El movimiento reducido salta”

Causa:

- `erode = destino` y `reform = destino` cuando
  `prefers-reduced-motion: reduce`.

Solución:

- no saltar;
- usar una transición corta o la política aprobada;
- probar con emulación y dispositivo.

## “El móvil usa una versión vieja”

Causa:

- caché de `spike.js`.

Solución:

- cache-bust `?v=N`;
- nueva pestaña;
- no asumir que el archivo nuevo se cargó.
