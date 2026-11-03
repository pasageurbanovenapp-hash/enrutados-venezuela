# Desintegración controlada de la buseta

Prototipo aislado para demostrar una separación reversible de facetas reales del
modelo. No se integra con la landing y no modifica ni regenera los activos de
entrada.

## Ejecución

Desde la raíz del repositorio:

```bash
python3 -m http.server 5199
```

Abre `http://127.0.0.1:5199/prototipos/desintegracion-controlada/`. El parámetro
opcional `?p=0.5` inicia en un progreso concreto; el rango y los botones permiten
recorrerlo en ambos sentidos.

Pruebas automáticas de navegador: abre
`http://127.0.0.1:5199/prototipos/desintegracion-controlada/pruebas.html`. El
resultado debe terminar con `data-estado="aprobado"` y nueve comprobaciones OK.

## Activo y procedencia

- Entrada efectivamente cargada: `../facetas-retexture/facetas.bin`, 81.470
  bytes.
- El README de `facetas-retexture` atribuye ese horneado al modelo
  `../entradas/retexture-buseta.glb` (7.477.624 bytes, 35.099 triángulos), que
  describe como geometría conservada respecto a la entrada preparada con UV y
  textura. La ruta exacta de la tarea que produjo ese GLB no queda demostrada
  por los binarios; esta atribución depende de la documentación del prototipo.
- `facetas.bin` usa firma `ENF1`: dos niveles indexados, con posiciones
  cuantizadas, índices, grupos y RGB por faceta. El decodificador comprueba
  firma, límites, índices y ausencia de bytes sobrantes antes de dibujar.
- El nivel amplio contiene 4.003 triángulos; el compacto, 2.282. El prototipo
  elige el compacto en viewports de hasta 600 px. Nunca solicita el GLB ni la
  textura original durante la ejecución.
- La página usa los grupos para aplicar una paleta procedural petróleo/cian con
  acentos ámbar. El RGB muestreado del atlas se decodifica pero no se usa como
  color final, para evitar que el atlas determine el acabado experimental.
- No se consume `facetas-retexture/facetas-web.bin` ni el binario WebGL con
  formato `ENW1`; tampoco se usan los buffers de `facetas-buseta`.

## Implementación de `p`

`motor.js` exporta `progresoFaceta`, `transformarVertice` y
`decodificarFacetas`. Para cada faceta se derivan una demora, un eje y un vector
de dispersión a partir de su índice y una función hash fija. Esos valores no
dependen del reloj ni de aleatoriedad nueva durante el render.

La posición de cada vértice se calcula desde la posición original, el centroide,
el progreso local de la faceta, el giro y el desplazamiento. No se acumulan
transformaciones. `app.js` vuelve a pintar solo cuando cambia `p`, el tamaño del
canvas o la preferencia de movimiento. No mantiene `requestAnimationFrame`.

El render es Canvas 2D con proyección y ordenamiento de profundidad en CPU; no es
una simulación WebGL ni un modelo 3D interactivo con cámara. El dibujo aprovecha
las facetas triangulares horneadas para que la separación se origine en la
superficie del bus.

## Movimiento reducido

Cuando `prefers-reduced-motion: reduce` está activo, el prototipo presenta
`p=0`, desactiva el rango y los botones, y no ejecuta un ciclo de fotogramas.
Cambiar el tamaño de viewport cruza entre los niveles compacto y amplio; cambiar
la preferencia mientras la página está abierta devuelve el estado al bus íntegro.

## Evidencia y límites

Verificado en navegador local: `p=0`, `0.25`, `0.50`, `0.75`, `1`; retorno
`1 → 0.50 → 0`; mismo resultado de Canvas en `p=0.50` al avanzar y retroceder;
estado `p=0` restablecido; viewports de escritorio y 390 px; movimiento reducido
emulado durante la carga. La página de pruebas comprueba nueve invariantes del
motor y decodifica el binario real.

En el navegador local, la transferencia/lectura del binario se observó entre 3 y
35 ms en cargas puntuales; no es una medición de red real ni un benchmark. El
tiempo no es estable ni representa hardware móvil. No se dispone de mediciones
en teléfonos físicos, FPS, memoria de GPU, temperatura o consumo energético.

La dispersión es determinista y reversible, pero la escena es una proyección 2D
de triángulos: no hay profundidad de pantalla real, transparencia física,
iluminación PBR ni validación de rendimiento móvil. El cambio de vista/cámara
no está expuesto como control. No se conecta al scroll y no propone una escena
posterior.


---

## Iteración 02 — refinamiento visual

Se conserva una copia de la versión anterior en `.respaldo-desintegracion-02/`
(raíz del repositorio, fuera de git). Capturas comparables en `capturas/antes/`
y `capturas/despues/`, a 1440 × 900 y a 390 px.

### Cambios

| # | Cambio | Por qué |
|---|---|---|
| 1 | El encuadre se calcula solo con el autobús íntegro, con 22% de margen | Antes incluía el estado disperso y el bus ocupaba un tercio del lienzo |
| 2 | Demora con onda espacial: `0.62·√azar + 0.38·posición longitudinal` | El desprendimiento arranca en un extremo y avanza, en vez de explotar por igual |
| 3 | Ventana de inicio `0.14 + 0.78·demora` | Reparte la dispersión: antes el 42% ya se movía en `p=0.5` y a `p=0.75` estaba todo en marcha |
| 4 | Desplazamiento con componente normal a la cara | Se lee como pelado de la superficie; el radial solo inflaba |
| 5 | Distancia reducida de `0.20–0.42` a `0.10–0.24` de la diagonal | Los fragmentos viajaban demasiado y rompían la silueta |
| 6 | Giro reducido de ±0,55 a ±0,40 rad | Menos ruido en la fase media |
| 7 | La cara trasera de una faceta aparece a partir de `p` local 0,45 | Antes aparecía a 0,16 y duplicaba el ruido |
| 8 | Desvanecido de los fragmentos que ya viajaron (hasta 30% de opacidad final) | Limpia el estado final sin ocultar fragmentos |

### Validación

- **Reversibilidad:** secuencia `0 → .25 → .5 → .75 → 1 → .5 → 0` con comparación
  exacta de las imágenes PNG serializadas desde Canvas. `p=0.5` y `p=0` coinciden
  byte por byte al repetirlos tras la dispersión. Captura en
  `capturas/validacion/reversibilidad.png`.
- **Pruebas existentes:** nueve comprobaciones OK, sin cambios en `pruebas.js`.
  Captura en `capturas/validacion/pruebas.png`.
- **Móvil:** 390 × 844; en `p=0.5` el bus sigue leyéndose y en `p=1` la nube queda
  dentro del lienzo. `capturas/movil/`.
- **Movimiento reducido:** con la preferencia activa se fuerza `p=0`, se
  deshabilitan rango y botones y no hay bucle. `capturas/validacion/reducido.png`.

### Límites que quedan

- En `p=0.25` el desprendimiento es visible pero discreto: arranca en el extremo
  trasero con pocos fragmentos. Si se quiere más presencia ahí, hay que aceptar
  más movimiento antes de `p=0.5`, que es justo lo que se quería proteger.
- En escritorio, la nube de `p=1` todavía se corta en los bordes del canvas. El
  desvanecido lo disimula, no lo elimina.
- No hay medición de FPS ni de memoria: sigue siendo Canvas 2D sin bucle.
- El estado `p=0.75` es denso; la composición es coherente pero no «limpia» en el
  sentido de una escena final de reposo.
