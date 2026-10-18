# Ciudad trazada — prototipo aislado

Animación de la transición **bus → ráfaga → ciudad trazada**, construida fuera de
la landing. No modifica `artifacts/enrutados-venezuela/`, no entra en el build y no
añade dependencias.

> **Por qué está fuera del repo de la landing.** `chapter-break` ya tiene una foto
> nocturna con overlay y un CSS que depende de la cascada de 22 módulos. Insertar
> la animación antes de saber si la ciudad se lee sería construir sobre terreno
> ocupado. Este prototipo existe para decidir eso con los ojos, no con una
> descripción.

---

## Cómo abrirlo

Con el servidor local:

```bash
cd prototipos/ciudad-trazada
python3 -m http.server 5181
```

Y abrir <http://127.0.0.1:5181/>.

También funciona abriendo `index.html` directamente: no usa módulos ES ni red.

---

## Controles

| Control | Qué hace |
|---|---|
| **Repetir** | Reinicia la secuencia desde cero |
| **Pausa / Seguir** | Detiene o reanuda el reloj |
| **Velocidad** | 0,25× a 2× |
| **Densidad** | 2.000 a 12.000 puntos; reconstruye ambas formas |
| **Forma de la ciudad** | Perspectiva de un punto / alzado plano (plan B del documento) |
| **FPS** | Medición en vivo, para saber si el ritmo es sostenible |

Parámetros de URL:

| Parámetro | Efecto |
|---|---|
| `?t=3.2` | Congela la escena en ese segundo y no anima |
| `?d=9000` | Densidad inicial |
| `?modo=plano` | Arranca en el plan B |
| `?reduce=1` | Fuerza el estado final estático (equivalente a `prefers-reduced-motion`) |
| `?solo=1` | Oculta el panel; deja solo la escena (modo captura) |
| `?vel=0.5` | Velocidad inicial |

---

## Qué cuenta

Un solo disparo, sin bucle, ~6,4 s:

1. **Bus (0 – 1,5 s).** Aparece ya formado, sin ensamblaje. Vista frontal en
   puntos, con los dos faros como únicos elementos encendidos: cyan y naranja, los
   dos tokens de origen del sistema.
2. **Ráfaga (1,5 – 2,8 s).** El cuerpo se desmaterializa de los bordes hacia el
   centro. Los faros no se apagan: se desprenden y lideran la dispersión. La ráfaga
   es lateral, no una explosión.
3. **Ciudad (2,8 – 5,0 s).** Los puntos convergen en dos masas de edificios que
   flanquean una avenida en perspectiva de un solo punto de fuga.
4. **Trazo (5,0 – 6,4 s).** El destello recorre la avenida desde el horizonte hacia
   el espectador, encendiendo cuatro nodos a su paso.
5. **Estado final estable.** Ciudad punteada + ruta trazada + nodos encendidos. Se
   queda quieto.

Sin texto, sin cifras y sin etiquetas dentro de la escena. Todo color sale de los
tokens de la landing (`--cyan`, `--orange`, `--ink`, `--bg`).

---

## Cómo se construyó

- **Una sola población de puntos.** Los mismos puntos forman el bus y después la
  ciudad. No es un fundido entre dos dibujos: cada punto viaja de su posición en el
  bus a su posición en la ciudad, con su propio brillo.
- **El bus se dibuja por bordes.** Contorno, parabrisas partido, letrero, parrilla,
  faros, parachoques, espejos y arcos de rueda. El relleno es escaso y tenue: la
  silueta se lee por el borde, no por la masa.
- **La ciudad se dibuja por estructura.** Tejado escalonado, borde de calle,
  verticales de edificio y tres líneas de piso que convergen a la fuga (son
  horizontales en 3D). Sin esas verticales, la masa se lee como polvo.
- **La avenida es la Línea de Ruta.** Un solo trazo vertical; cyan en el origen
  (horizonte), naranja en la calle (extremo cercano).
- **Aleatoriedad con semilla.** `mulberry32` con semilla fija: dos ejecuciones dan
  la misma escena, así que comparar capturas es una prueba válida.

### Verificación

Las capturas se hicieron con Firefox headless, con el tiempo congelado por URL:

```bash
firefox --headless --window-size=1000,1400 \
  --screenshot captura.png \
  "file://$PWD/index.html?t=6.4&solo=1"
```

---

## Criterios de aceptación

| # | Criterio | Estado |
|---|---|---|
| 1 | El bus se lee como bus frontal | ✅ a 6.000 y a 2.000 puntos |
| 2 | La ciudad se lee como ciudad, no como nube | ✅ con verticales y líneas de piso |
| 3 | Estado final estable y autocontenido | ✅ |
| 4 | `prefers-reduced-motion` sirve el estado final | ✅ |
| 5 | Sin texto, cifras ni etiquetas en la escena | ✅ |
| 6 | Cero dependencias nuevas | ✅ canvas 2D y scripts clásicos |
| 7 | 60 fps en escritorio | ⏳ falta medir en el equipo objetivo |
| 8 | El ritmo de 6,4 s se siente bien | ⏳ pendiente de tu ojo |

---

## Lo que este prototipo todavía no resuelve

1. **La permanencia del estado final.** El documento pide que la ruta trazada se
   quede encendida mientras se lee `audiences`, pero la constitución (§4) declara
   `Audiences` como sección **sin línea**: *"Ahí hay conversación, no proceso"*. O el
   destello termina apagándose, o `ChapterBreak` se documenta como excepción.
2. **`chapter-break` ya tiene dueño.** Hoy es una foto nocturna con overlay. La
   animación la reemplaza o convive con ella, pero no se suma sin decidir qué pasa
   con la imagen y su presupuesto de peso (§7).
3. **El ancho de escritorio.** El prototipo evalúa una escena vertical 1000×1400.
   En la landing, en escritorio, esa escena sería una banda central con aire a los
   lados. Falta verla en ese ancho real.
4. **La orientación de la Línea de Ruta.** §4 dice que en móvil rota 90°. Si la
   escena ya nace vertical, hay que decidir si la animación también rota o si la
   avenida vertical es la excepción justificada.
