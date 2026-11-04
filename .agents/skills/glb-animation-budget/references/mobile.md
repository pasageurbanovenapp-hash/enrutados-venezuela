# Presupuesto y pruebas móviles

## Presupuesto

| Versión | Triángulos | Peso | Uso |
|---|---:|---:|---|
| Base | 50.000 | 1,56 MB | POCO/laptop con red normal |
| Respaldo | 30.000 | 1,13 MB | equipo o red limitados |
| Textura | 1024 | JPEG | siempre |
| Normal/metallic | fuera | — | el shader no las usa |

No bajes a 25k por reflejo. El 30k ya es el respaldo; el 50k se lee mejor.

## Carga

- `GLTFLoader` local; sin meshopt/Draco en la primera pasada.
- Carga diferida cuando la sección esté a una pantalla.
- Póster estático mientras carga.
- No cargues el GLB en el Hero.
- Si la red es lenta, el póster no debe bloquear el scroll.

## Verificación

- `gltf-transform inspect`: 20k–50k, `NORMAL`, `TEXCOORD_0`, 1024, < 3 MB.
- Three: `GLTFLoader` carga sin decoder extra.
- 360×800, 390×844, 300×900.
- POCO físico si es posible.
- Sin excepciones.
- Sin 4K/8K ocultas.
- Sin texturas metallic/normal si el shader no las usa.

## Qué no prometer

- FPS.
- Memoria de GPU.
- Que un GLB de 50k “corre igual” en todos los Android.
- Que la emulación CDP equivale a POCO.

## Cuándo usar 30k

- Si el 50k no entra en el presupuesto de red.
- Si el dispositivo se queda sin memoria.
- Si la diferencia visual a 300 px es imperceptible.
- No lo uses por miedo; úsalo con una medición o una decisión de producto.

## Referencias

- `../bus-city-v15/references/mobile.md`
- `interactive-3d-validation` — matriz de evidencia.
