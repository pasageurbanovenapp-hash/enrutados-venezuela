# La buseta en puntos — prueba de lectura

Prototipo aislado. No entra en el build, no añade dependencias y no toca
`artifacts/enrutados-venezuela/`.

**La pregunta que responde:** cuántos puntos hacen falta para que la buseta se
lea como buseta. Es la compuerta de la TAREA 01 bis: si no se lee, nada de lo
que venga después importa.

---

## Cómo abrirlo

```bash
cd prototipos/nube-buseta
python3 -m http.server 5199
```

Y abrir <http://127.0.0.1:5199/>. Hace falta el servidor: la página descarga
`nube.bin` con `fetch`, y `file://` lo bloquea.

### Parámetros

| Parámetro | Efecto |
|---|---|
| `?modo=escala` | Escalera de 200 a 6400 puntos (por defecto) |
| `?modo=solo&n=24000` | Una sola buseta con esa cantidad |
| `?az=72&el=10` | Ángulo de cámara en grados |
| `?v=lado` | Atajo: 90°/2°. También `iso` (38°/22°) y `frente` (0°/2°) |
| `?cull=0` | Dibuja también la cara posterior |
| `?s=2` | Tamaño del punto en píxeles CSS |

---

## De dónde sale la nube

`hornear.py` lee el OBJ de la buseta (`5462bc21-…obj`), descarta las islas
diminutas, comprueba la orientación por volumen firmado y muestrea 40.000
puntos con densidad proporcional al área, con semilla fija.

Formato de `nube.bin`:

```
b'ENP1' | uint32 n | float32 min[3] | float32 max[3]
luego n registros de 9 bytes: uint16 x,y,z + int8 nx,ny,nz
```

9 bytes por punto. 40.000 puntos = 351,6 kB crudos, 299,5 kB en gzip.

---

## Lo medido

Tamaño de la buseta en pantalla y puntos **visibles** necesarios (con culling,
que deja ver alrededor del 47% de la nube):

Medido sobre la silueta, no inferido. Entre paréntesis, los puntos horneados
que hacen falta para producir esos visibles.

| Ancho del bus | Mínimo legible | Cómodo |
|---|---|---|
| ~300 px | 1.494 visibles (3.200 horneados) | 2.975 visibles (6.400) |
| ~900 px | 5.504 visibles (12.000) | 11.042 visibles (24.000) |

Con 2.913 visibles a 900 px (6.400 horneados) la silueta todavía se deshace.

Capturas en `capturas/`:

| Archivo | Qué muestra |
|---|---|
| `escala-perfil-1440.png` | La escalera completa a 72°/10° |
| `escala-perfil-390.png` | La misma escalera en móvil |
| `perfil-72-24000.png` | Buseta a 900 px con 24.000 puntos |
| `solo-lado-24000.png` | La lectura más limpia: 90°/2° |
| `solo-lado-6400.png` | El mismo ángulo con 6.400 puntos |
| `solo-iso-24000-sincull.png` | Por qué el tres cuartos alto falla |
| `movil-390.png`, `movil-320.png` | Móvil real, 16.000 puntos |

---

## Conclusiones

1. **La buseta se lee.** El activo sirve y el horneado es limpio.
2. **Pero no con cientos de puntos.** El presupuesto de 700 que propuse al
   principio se queda corto por un factor de 10 a 30. Con 700 puntos se ve una
   mancha, no un vehículo.
3. **El ángulo manda más que la densidad.** A 38°/22° ni con 24.000 puntos se
   lee bien. A 72°/10° se lee con 3.200. La escena tiene que ser casi de perfil.
4. **El peso sigue siendo aceptable.** 24.000 puntos son 211 kB crudos, unos
   184 kB en gzip. Cabe en el presupuesto de una imagen de hero.
5. **A 300 px el umbral está en unos 3.200 puntos horneados** (1.500 visibles).
   Por debajo de 1.600 la silueta se deshace. A 900 px hacen falta 12.000.

## Lo que falta decidir

- **Cómo se dibuja en movimiento.** Con canvas 2D, 24.000 `fillRect` por
  fotograma no aguantan 60 fps. Para animar hay dos salidas: escribir píxeles
  directos sobre `ImageData` (rápido y sin dependencias) o pasar a WebGL. Esta
  prueba es estática y no responde esa pregunta.
- **Cuántos puntos para la escena real**, según el tamaño que ocupe la buseta en
  cada sección y en cada ancho.
- **Si el culling se queda.** Duplica la densidad aparente por punto, pero
  convierte la nube en una cáscara: sin él, el volumen se lee como masa.

---

## Equivalencia de tinta (medición de cierre)

Se compararon cuatro repartos de **tinta total parecida** a 300 px de ancho, misma
cámara (72°/10°), 6.400 puntos horneados como techo:

| Reparto | Visibles | Tinta aprox. | Lectura |
|---|---|---|---|
| 6.400 puntos de 1 px | 2.975 | 2.975 px² | **se lee** |
| 1.600 cuadros de 2 px | 744 | 2.976 px² | se lee, pero se rompe en trozos |
| 800 guiones de 4×1 | 365 | 1.460 px² | no se lee |
| 400 tetraedros de contorno | 189 | ~2.800 px² | no se lee |

**La hipótesis de la tinta era falsa.** Igualar el área pintada no iguala la
lectura: 6.400 marcas pequeñas leen mejor que 1.600 marcas cuatro veces mayores.
Cuando la separación entre marcas supera cierto umbral, la superficie se
descompone en objetos sueltos y el ojo deja de fusionarlos.

**Conclusión:** la legibilidad la fija la **densidad de marcas** (el espaciado),
no la cantidad de tinta. La forma del glifo es libre; la cantidad no.

De ahí que Dala funcione: no es economía de tinta, es **saturación**. Usa miles
de tetraedros, no unos pocos grandes.

### Presupuesto cerrado

| Ancho del bus | Mínimo | Cómodo |
|---|---|---|
| ~300 px | 3.200 puntos | 6.400 puntos |
| ~900 px | 12.000 puntos | 24.000 puntos |

Glifo recomendado: cuadrado o triángulo de **2 px** (4 px² de tinta). Es el punto
donde cada marca cubre sin romper el espaciado. El guion de 4×1 solo tiene sentido
con densidad alta y si se busca dirección.
