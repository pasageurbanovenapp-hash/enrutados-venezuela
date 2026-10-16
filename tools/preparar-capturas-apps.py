#!/usr/bin/env python3
"""
Prepara las capturas reales de las tres apps para la seccion Perspectivas.

Hace tres cosas, en este orden:
  1. Recorta la barra de estado (hora, bateria, senal) para que las tres se
     lean como capturas del mismo telefono.
  2. Cubre de forma opaca los identificadores que no se pueden publicar.
  3. Exporta en AVIF y WebP al tamano de uso.

POR QUE LOS ORIGINALES NO ESTAN EN EL REPOSITORIO
-------------------------------------------------
Las capturas originales muestran el nombre comercial de una asociacion real y
la identificacion de una unidad. El permiso que se obtuvo en la feria no cubre
su publicacion, asi que **los originales nunca se versionan**. Solo entra al
repositorio el resultado ya tapado, que es lo que se publica.

Uso:
  python tools/preparar-capturas-apps.py <dirOriginales> <dirSalida>

Los originales viven fuera del repositorio o en una carpeta ignorada.
"""

import os
import sys

from PIL import Image, ImageDraw

# Alto de la barra de estado que se recorta, en pixeles del original.
RECORTE_SUPERIOR = 56

# Ancho de salida. La seccion muestra los telefonos a unos 280 px; a 560 px
# se ven nitidos en pantallas de doble densidad sin disparar el peso.
ANCHO_SALIDA = 560

# Regiones a tapar, en coordenadas DEL ORIGINAL, como (x1, y1, x2, y2).
# Estan medidas sobre las capturas de 485 x 1080 con una rejilla de 50 px.
TAPADOS = {
    'app-pasajero.png': [
        (125, 500, 365, 556),   # "Union Bucaral", bajo el rotulo de saldo
        (140, 555, 350, 580),   # Nombre del pasajero en la tarjeta
        (90, 615, 395, 925),    # QR del pasaje
    ],
    'app-conductor.png': [
        (18, 90, 212, 136),     # "Union Bucaral", saludo de cabecera
        (18, 140, 272, 186),    # "Unidad: MGS-123"
    ],
    # La captura de Finanzas no muestra nombre de asociacion ni de persona:
    # su cabecera dice "Departamento Contable". Solo se le recorta la barra.
    'app-admin-finanzas.png': [],
}

COLORES_TAPADO = {
    'app-pasajero.png': (248, 250, 252),
    'app-conductor.png': (5, 9, 20),
    'app-admin-finanzas.png': (5, 9, 20),
}


def tapar(imagen, regiones, color):
    """Cubre los identificadores con bloques opacos que no puedan recuperarse."""
    dibujo = ImageDraw.Draw(imagen)
    for x1, y1, x2, y2 in regiones:
        # El recorte de la barra de estado ya movio todo hacia arriba.
        caja = (x1, max(0, y1 - RECORTE_SUPERIOR), x2, y2 - RECORTE_SUPERIOR)
        dibujo.rectangle(caja, fill=color)
    return imagen


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1

    origen = sys.argv[1]
    salida = sys.argv[2]
    os.makedirs(salida, exist_ok=True)

    for nombre, regiones in TAPADOS.items():
        ruta = os.path.join(origen, nombre)
        if not os.path.exists(ruta):
            print(f'  FALTA: {nombre}')
            continue

        im = Image.open(ruta).convert('RGB')
        alto_original = im.size[1]

        im = im.crop((0, RECORTE_SUPERIOR, im.size[0], alto_original))
        im = tapar(im, regiones, COLORES_TAPADO[nombre])

        alto = round(im.size[1] * ANCHO_SALIDA / im.size[0])
        im = im.resize((ANCHO_SALIDA, alto), Image.LANCZOS)

        base = os.path.splitext(nombre)[0].replace('app-', '')
        destino_avif = os.path.join(salida, f'{base}.avif')
        destino_webp = os.path.join(salida, f'{base}.webp')

        im.save(destino_avif, format='AVIF', quality=52)
        im.save(destino_webp, format='WEBP', quality=80, method=6)

        peso_avif = os.path.getsize(destino_avif) / 1024
        peso_webp = os.path.getsize(destino_webp) / 1024
        print(f'  {base:16} {im.size[0]}x{im.size[1]}   avif {peso_avif:5.1f} kB   webp {peso_webp:5.1f} kB')

    return 0


if __name__ == '__main__':
    sys.exit(main())
