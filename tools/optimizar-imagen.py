#!/usr/bin/env python3
"""Optimiza una imagen para la web: genera AVIF y WebP, en tamano completo y movil.

Uso:
    python optimizar-imagen.py <entrada> <dirSalida> [--ancho-movil 900]

Genera, junto a la imagen de entrada, cuatro archivos:

    <nombre>.avif           formato principal, el mas ligero
    <nombre>.webp           respaldo para navegadores sin AVIF
    <nombre>-movil.avif     version reducida para pantallas estrechas
    <nombre>-movil.webp

E informa del peso y de la fidelidad de cada uno (diferencia maxima y media por
canal, y porcentaje de pixeles que se desvian mas de 3 niveles sobre 255). Una
diferencia media por debajo de 2 es imperceptible a simple vista.

Requiere Pillow con soporte de AVIF y WebP.
"""

import argparse
import io
import os
import sys

from PIL import Image, ImageChops, features

CALIDAD_AVIF = 64
CALIDAD_WEBP = 86
CALIDAD_AVIF_MOVIL = 62
CALIDAD_WEBP_MOVIL = 84


def fidelidad(original, recomprimida):
    """Devuelve (delta_maximo, delta_medio, porcentaje_sobre_3)."""
    d = ImageChops.difference(original, recomprimida)
    hist = d.convert("L").histogram()
    total = original.size[0] * original.size[1]
    maximo = max(i for i, c in enumerate(hist) if c)
    medio = sum(i * c for i, c in enumerate(hist)) / total
    sobre3 = 100 * sum(hist[4:]) / total
    return maximo, medio, sobre3


def _tiene_alfa(ruta):
    """Conserva la transparencia: los iconos la necesitan."""
    with Image.open(ruta) as im:
        return im.mode in ("RGBA", "LA", "P")


def comprimir(imagen, formato, calidad):
    buf = io.BytesIO()
    if formato == "AVIF":
        imagen.save(buf, format="AVIF", quality=calidad, speed=4)
    else:
        imagen.save(buf, format="WEBP", quality=calidad, method=6)
    return buf.getvalue()


def main():
    p = argparse.ArgumentParser(description="Genera AVIF y WebP a partir de una imagen.")
    p.add_argument("entrada")
    p.add_argument("dir_salida")
    p.add_argument(
        "--ancho-movil",
        type=int,
        default=900,
        help="Ancho de la variante reducida (por defecto 900).",
    )
    p.add_argument(
        "--ancho-principal",
        type=int,
        default=0,
        help="Recorta la variante principal a este ancho. 0 = conservar el original.",
    )
    p.add_argument(
        "--sin-movil",
        action="store_true",
        help="No generar la variante reducida (util para iconos).",
    )
    p.add_argument("--calidad-avif", type=int, default=CALIDAD_AVIF)
    p.add_argument("--calidad-webp", type=int, default=CALIDAD_WEBP)
    args = p.parse_args()

    if not features.check("webp"):
        sys.exit("Pillow no tiene soporte de WebP.")
    if not features.check("avif"):
        sys.exit("Pillow no tiene soporte de AVIF.")

    original = Image.open(args.entrada).convert("RGBA" if _tiene_alfa(args.entrada) else "RGB")
    peso_original = os.path.getsize(args.entrada)
    base = os.path.splitext(os.path.basename(args.entrada))[0]
    os.makedirs(args.dir_salida, exist_ok=True)

    principal = original
    if args.ancho_principal and original.size[0] > args.ancho_principal:
        alto = round(original.size[1] * args.ancho_principal / original.size[0])
        principal = original.resize((args.ancho_principal, alto), Image.LANCZOS)

    print(f"Entrada: {args.entrada}")
    print(
        f"  origen {original.size[0]}x{original.size[1]}  {peso_original / 1024:.0f} kB"
        f"  ->  principal {principal.size[0]}x{principal.size[1]}\n"
    )

    variantes = [("", principal, args.calidad_avif, args.calidad_webp)]
    if not args.sin_movil and principal.size[0] > args.ancho_movil:
        alto = round(principal.size[1] * args.ancho_movil / principal.size[0])
        movil = principal.resize((args.ancho_movil, alto), Image.LANCZOS)
        variantes.append(("-movil", movil, CALIDAD_AVIF_MOVIL, CALIDAD_WEBP_MOVIL))

    print(f"{'archivo':34} {'peso':>12} {'ahorro':>7} {'dmax':>6} {'dmedio':>8} {'>3':>7}")

    for sufijo, imagen, q_avif, q_webp in variantes:
        for formato, calidad in (("AVIF", q_avif), ("WEBP", q_webp)):
            datos = comprimir(imagen, formato, calidad)
            destino = os.path.join(args.dir_salida, f"{base}{sufijo}.{formato.lower()}")

            # Si la entrada YA esta en ese formato y no se ha reescalado, y el
            # resultado saldria igual o mas pesado, se conserva el original: no
            # tiene sentido sumar perdida de compresion para no ganar nada.
            mismo_formato = os.path.splitext(args.entrada)[1].lower() == f".{formato.lower()}"
            sin_reescalar = principal.size == original.size and sufijo == ""
            conservado = mismo_formato and sin_reescalar and len(datos) >= peso_original
            if conservado:
                datos = open(args.entrada, "rb").read()
                destino = os.path.join(args.dir_salida, f"{base}.{formato.lower()}")

            with open(destino, "wb") as f:
                f.write(datos)
            recomprimida = Image.open(io.BytesIO(datos))
            if recomprimida.mode != imagen.mode:
                recomprimida = recomprimida.convert(imagen.mode)
            # Se compara contra la referencia del mismo tamano, para medir solo
            # el efecto de la compresion y no el del reescalado.
            dmax, dmedio, sobre3 = fidelidad(imagen, recomprimida)
            ahorro = 100 * (1 - len(datos) / peso_original)
            etiqueta = "conservado" if conservado else f"{len(datos) / 1024:7.0f} kB"
            print(
                f"{os.path.basename(destino):34} {etiqueta:>12} {ahorro:7.0f}% "
                f"{dmax:6} {dmedio:8.2f} {sobre3:6.1f}%"
            )

    print("\nLa fidelidad mide solo la compresion, no el reescalado: las variantes")
    print("moviles se comparan contra su propia referencia al mismo tamano.")
    print("Si el formato de entrada coincide y el resultado no mejora, se conserva")
    print("el original y se indica con 'conservado'.")


if __name__ == "__main__":
    main()
