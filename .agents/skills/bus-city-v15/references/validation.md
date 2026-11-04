# Validación de la transición

## Regla

“Se ve bien” no es evidencia. Usa `interactive-3d-validation` y separa:

- confirmado por código/prueba;
- observado en dispositivo físico;
- reportado por herramienta;
- hipótesis pendiente.

## Carga

- Activo real servido por HTTP.
- Sin excepción de consola.
- `ready` y estado inicial correctos.
- 404, vacío, corrupto y reintento si hay estados de error.

## Estados visuales

Captura al menos:

| Estado | Qué comprobar |
|---|---|
| `t=0.24, e=0` | bus íntegro, apoyado, textura correcta |
| `t=0.30, e=0.15` | erosión inicial, silueta |
| `t=0.30, e=0.35` | partículas del tamaño correcto |
| `t=0.30, e=1` | ciudad/nube sin bus |
| `t=0.80, e=1, r=1` | ciudad legible |
| reverso | mismo estado al subir |

## Reversibilidad

- `e=0 → 1 → 0` da el mismo estado visual.
- `r=0 → 1 → 0` da el mismo estado.
- No hay salto ni reinicio.
- El scroll no se fuerza a 0.

## Móvil

- 300 y 900 px de ancho.
- Sin recortes accidentales.
- Texto legible; bus no tapa el CTA.
- Canvas estable entre cabecera y pie.

## Movimiento reducido

- Emular `prefers-reduced-motion: reduce`.
- Confirmar que `erode`/`reform` avanzan gradualmente, no saltan.
- Si se usa `?movimiento=1` o una perilla, documentarla.
- No declarar “accesible” sin probar el cambio en vivo.

## Evidencia

Guarda un JSON/capturas por corrida con:

```text
viewport, dpr, t, erode, reform, ready, error
```

No llames FPS al intervalo de `rAF`. No llames memoria al número de dibujos.

## Criterios de salida

- [ ] Carga.
- [ ] Estados fijos.
- [ ] Reverso.
- [ ] Móvil.
- [ ] Reduce.
- [ ] Sin excepciones.
- [ ] Capturas adjuntas.
- [ ] Defectos declarados.
