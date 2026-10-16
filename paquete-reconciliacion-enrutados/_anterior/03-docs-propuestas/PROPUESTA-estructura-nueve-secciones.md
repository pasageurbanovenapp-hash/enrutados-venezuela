# PROPUESTA — Estructura de nueve secciones

> **Estado:** propuesta **no aprobada**. Pendiente de decisión del responsable del
> proyecto.
> **Carácter:** **no normativo**. No forma parte de `docs/DESIGN-CONSTITUTION.md`,
> no la modifica y no la sustituye.
> **Relación con la constitución vigente:** propone sustituir el reparto de bloques
> descrito en su sección 8 y añadir un cometido por sección equivalente a su
> sección 13. Mientras no se apruebe, la fuente normativa es la constitución
> vigente (`docs/DESIGN-CONSTITUTION.md`, versión 2.0).
> **Fecha de registro de este archivo:** 2026-10-15.
> **Fecha de creación del texto propuesto:** no verificable. No hay aprobación
> registrada.
> **Procedencia:** `UX-UI del Ecosistema/DESIGN-CONSTITUTION.md`, blob
> `f6765d3603746ad9c43a8ff7ae66cec18cc9ec8e` (36.146 bytes). El mismo blob estuvo
> en `docs/DESIGN-CONSTITUTION.md` en los checkpoints de sesión `dddce91`
> (2026-10-08 08:02) y `13fe103` (2026-10-10 04:51); ninguno de los dos está
> contenido en una rama, por lo que no constituyen una aprobación.
> **Alcance:** este documento **no autoriza** cambios de arquitectura, de
> composición ni de código. Toda fusión o supresión requiere aprobación explícita.
> **Antecedente conservado:** la copia original **no se ha movido ni borrado**.

---

## Aviso sobre el material histórico

Los bloques marcados como «material histórico» se reproducen **byte a byte** desde
el blob citado, entre delimitadores `HISTORICO-INICIO` / `HISTORICO-FIN`. Conservan
su redacción original, que puede afirmar aprobaciones que **no** están vigentes.
Cada bloque lleva su propia advertencia; ninguna de esas afirmaciones debe leerse
como norma.

---

## 1. §8 propuesto (material histórico)

> **Advertencia.** El bloque siguiente afirma literalmente «Estructura aprobada:
> nueve secciones». Se reproduce como **material histórico y no normativo**: esa
> afirmación **no** representa una aprobación vigente y no consta en ningún commit
> de rama.
<!-- HISTORICO-INICIO sha256=f0c6b161db487adb77758a9116eba53d40c4c932d98fd543930964102b771d17 lineas=6 -->
```text
- **Estructura aprobada: nueve secciones.** La página llegó a tener doce, con los
  tres actores repetidos en cuatro sitios y dos secciones diciendo lo mismo. La
  decisión no es acortar por acortar: es **dejar de gastar longitud en repetición
  para que el contenido tenga dónde ir**. La secuencia que gobierna el orden es
  **problema → propuesta → funcionamiento → estado real del producto**. El cometido
  de cada sección está en la sección 13.
```
<!-- HISTORICO-FIN -->

---

## 2. §13 propuesto (material histórico)

> **Nota de numeración.** Este «§13» es el **propuesto**. No es el §13 de la
> constitución normativa, que documenta los cometidos vigentes de los doce bloques
> montados. Son documentos distintos y no deben confundirse.
<!-- HISTORICO-INICIO sha256=5c686d2a5854250c98060b4a543d7a371fad11b63faaf3448bd75aea533c0d56 lineas=95 -->
```text
## 13. Cometido de cada sección

La página cuenta **una sola historia**, y cada sección es un momento de ella. El
orden no es una lista de bloques: es la secuencia **problema → propuesta →
funcionamiento → estado real del producto**.

### La columna vertebral

El sistema Línea de Ruta no aparece igual en todas partes. **Avanza.** Cada sección
es un momento distinto de la misma línea, y eso es lo que hace que la página se
lea como un recorrido y no como una pila de bloques.

| Sección | Qué le pasa a la línea |
|---|---|
| Hero | **Nace** detrás del autobús y baja hacia la página |
| El desafío | **Se rompe.** Es la misma línea, interrumpida |
| Pausa visual | **Cruza la ciudad.** Aparece el trazado sobre la noche |
| Perspectivas | **Se abre en tres.** Una rama por actor |
| El recorrido | **Se dibuja entera.** Es la protagonista |
| Operación | **Llega.** El final del trazo, donde se leerán los datos |
| Hablemos claro, Preguntas, Contacto | **Descansa.** Aquí hay conversación, no proceso |

### Las nueve secciones

**1. Hero — la promesa.** Una sola idea: que moverse sea más claro. Titular de dos
líneas, no de cuatro. **Se retira la franja del pie** con los tres actores: la
sustituye el primer tramo de la línea, que nace aquí.

**2. El desafío — el problema.** Nombrar el hueco antes de ofrecer nada. La línea
se rompe. *Pendiente:* quitar las tres rayas largas de las viñetas y sacar a su
módulo las 47 líneas de CSS que el componente lleva dentro.

**3. Pausa visual — el aliento.** No es una sección de contenido, es una
transición. Su cometido es que la ruta cruce la ciudad: el momento en que el
recorrido existe como mapa.

**4. Perspectivas — la propuesta.** Fusión de "Para quién" y "Ecosistema", que
decían lo mismo. Aquí entran las capturas reales de las tres apps.
- Los nombres de la asociación y de la unidad **se tapan**: es obligación legal,
  no precaución.
- **Una línea sobre el dinero**, dirigida al actor que decide: *"El dinero de las
  recargas llega a la asociación. Enrutados no lo custodia: cobra una comisión y
  deja registro."* Va aquí porque la duda nace aquí, al leer el reparto.
- **Se retira la numeración** (01/02/03 y "APP 01/02/03"). Si el visitante puede
  contar, no necesita el número.

**5. El recorrido — el funcionamiento.** Fusión de "Recorrido" y "Cómo funciona",
que describían el mismo trayecto dos veces. La línea se dibuja entera y es la
protagonista. *Pendiente:* quitar las etiquetas genéricas de paso ("01 SUBE / 02
VALIDA / 03 ENTIENDE") y las horas y matrículas que hoy se muestran sin
etiquetarlas como ilustrativas.

**6. Operación — el estado real.** La sección más honesta del proyecto y la que
sostiene a todas las demás. **No se toca su criterio:** datos en blanco y "en
preparación" es exactamente lo correcto. *Pendiente:* decidir si los marcadores de
dato inexistentes siguen siendo una raya o pasan a decir "Sin datos".

**7. Hablemos claro — la transparencia.** Carga con tres cosas:
1. Lo que el sistema hace y lo que todavía no.
2. **La transparencia del dinero** como política, no como característica.
3. **El origen, como cierre.** Tres o cuatro líneas, no una sección: *de una idea a
   un sistema*. Se cuenta en pasado y en crecimiento, nunca como disculpa.

**8. Preguntas.** Se conserva. *Pendiente:* decidir si el número de cada pregunta
se queda, porque en un acordeón puede ayudar a referirse a una concreta.

**9. Contacto — el cierre.** Hoy habla a un solo público. Los tres actores llegan
hasta aquí con motivaciones distintas, y el cierre puede reconocerlo.

### Política editorial del proyecto

> **La historia explica el origen.**
> **El producto demuestra la evolución.**
> **El piloto demostrará la realidad.**

El origen aporta identidad y autenticidad; **no es evidencia de que el producto
funcione**. No se usa para pedir credibilidad prestada, y nunca aparece antes de
que el visitante sepa qué es esto, qué problema resuelve y por qué debería
importarle.

### Registro de voz

**La página evita los tecnicismos de forma deliberada.** Está escrita para tres
actores con perfiles distintos y ninguno de los tres compra arquitectura:

- El pasajero pregunta *"¿me sirve y es fácil?"*
- El conductor pregunta *"¿esto me quita trabajo o me lo agrega?"*
- La asociación pregunta *"¿es confiable y sigo controlando mi dinero?"*

Ninguna de esas preguntas se responde con "JWT RS256" ni con "74 tests". El detalle
técnico existe y es sólido, pero **se explica en privado a la asociación**, no en
la landing. Hubo una versión anterior —`Enruta2-Web-2026`— que sí lo hacía: tenía
más contenido y más profundidad técnica, y también treinta y tres pantallas de
alto en móvil. **Se abandonó a propósito.** No se importan sus secciones.

```
<!-- HISTORICO-FIN -->

---

## 3. Anexo A — adiciones sobre capturas (material histórico)

> **Advertencia.** Material histórico. Su adopción es una decisión **independiente**
> de esta propuesta y **no** está incluida en la versión 2.0 de la constitución.
<!-- HISTORICO-INICIO sha256=f8184ab0f29890f60627e39515dc09936e33911254ca03fcd560d2ecc3cb0514 lineas=19 -->
```text
Existen capturas reales de las tres aplicaciones, tomadas durante las
demostraciones de la feria. **Se usan ellas.** Sustituyen por completo a la
maqueta de rectángulos. Una captura real es más honesta, más creíble y más barata
que cualquier simulación.

**Los identificadores se tapan.** El permiso que se obtuvo de la asociación
presente en la feria no autoriza a usar su nombre comercial ni a publicar la
identificación de una unidad. **No es una precaución: es una obligación.** Se
tapan con un desenfoque suave, que se lee como "esto está oculto a propósito" y
no como un borrado.

**Cómo se presentan.** La secuencia es **persona → dispositivo → perspectiva →
mismo ecosistema**: el rol se reconoce por la interfaz que se ve en la pantalla,
nunca por el vestuario ni por el escenario. La pantalla elegida para el tercer
actor es la de Finanzas, que dice "Departamento Contable" y evita tanto la
palabra "Admin" como el nombre de persona que aparecía en la de Panel de Control.

**Las barras de estado se recortan**, para que las tres se lean como capturas del
mismo teléfono y no como tres momentos distintos del día.
```
<!-- HISTORICO-FIN -->

---

## 4. Anexo B — contexto del producto (material histórico)

> **Advertencia.** Material histórico. Su adopción es una decisión **independiente**.
> El bloque termina en su última viñeta: la frase «No se importan sus secciones.»
> aparece también dentro del §13 propuesto (delimitador de la sección 2) y **no** se
> usa como límite de este fragmento.
<!-- HISTORICO-INICIO sha256=8009fada38d4c47770ee7a69a4fdc6e40e528e6d73597d5ada1f0ca1afc4f62b lineas=26 -->
```text
### Contexto del producto, verificado

Hechos que se comprobaron y que ningún asistente futuro debería tener que volver a
preguntar:

- **Qué es.** Proyecto de feria estudiantil impulsado por un docente de
  matemáticas, con más de un año de construcción. Tres apps móviles —pasajero,
  conductor/colector y administrador— más un backend.
- **El offline existe, y funciona por precarga.** El pasajero descarga hasta
  **5 tokens** mientras tiene conexión; cada uno vive unas **24 horas** y se
  consume al presentarlo, no al mostrarlo. No es "validar sin internet y
  sincronizar después": es **llevar los boletos comprados de antemano**.
- **La guía `guia-informativa-mvp` está desactualizada en ese punto.** Afirma que
  sin conexión no se puede validar, lo cual era cierto en un estado anterior.
  **No usarla como fuente de verdad.**
- **El reparto del dinero es 85 / 10 / 5:** asociación, conductor y plataforma.
- **Enrutados no custodia el dinero.** Las recargas llegan a la asociación; la
  comisión se liquida aparte. Las dos mitades de esa frase son necesarias: sin la
  segunda, se leería como que Enrutados no cobra, y sí cobra.
- **Las demostraciones de la feria las ejecutaron estudiantes** haciendo de
  pasajeros, conductores y asociación. La asociación presente aceptó servir como
  ejemplo de simulación, pero **el permiso no cubre el uso de su nombre
  comercial**. De ahí la obligación de taparlo.
- **`Enruta2-Web-2026` es una versión anterior y abandonada a propósito.** Tenía
  más contenido y más profundidad técnica, y treinta y tres pantallas de alto en
  móvil. No se importan sus secciones.
```
<!-- HISTORICO-FIN -->

---

## 5. Anexo C — modificaciones del Anexo de la constitución (material histórico)

> **Advertencia.** Material histórico. Recoge las filas retiradas y añadidas en la
> sección «Abierto» del anexo. No se adopta aquí.
<!-- HISTORICO-INICIO sha256=2d8383dbf5d8cd7bee49456b789c99faae7a5d5a14af30dfa5d4a980819089b3 lineas=18 -->
```text
### Abierto

| Hallazgo | Ubicación | Acción |
|---|---|---|
| La tarjeta social usa una paleta antigua (crema, menta y morado) | `public/social-card.svg` | Rediseñar en la fase de marca |
| Las tipografías pesan 68.5 kB por visita | `src/assets/fonts/` | Los grosores 500 y 600 se usan 3 y 2 veces. Mapearlos a 400 y 700 ahorraría peso |
| La página 404 es un resto en inglés y en tema claro, con clases de otro sistema | `src/pages/not-found.tsx` | Restilizar o retirar el enrutador. Casi inalcanzable en producción |
| 40 utilidades de tamaño de Tailwind se saltan la escala: **34 dentro de la maqueta del teléfono** (con cuatro tamaños fijos: 9, 10, 11 y 13 px) y 6 en restos del andamiaje (`error-boundary`, `card`, `not-found`) | `ecosystem.tsx`, `error-boundary.tsx`, `not-found.tsx` | Fase 4 para la maqueta; los restos se limpian o se retiran |
| El carrusel de pestañas avanza solo y **solo se detiene al pasar el ratón por encima**: con teclado o con el dedo no se puede pausar. Además ignora `prefers-reduced-motion`, que el CSS sí respeta en siete lugares | `ecosystem.tsx` | Fase 5 o 6. Es una incoherencia del código consigo mismo |
| **El sitio se contradice a sí mismo.** Operación dice "No mostramos cifras que no existen" y usa guiones como marcadores, mientras Ecosistema, justo encima, muestra "34 viajes hoy" y "Bs. 5.040" | `operations.tsx` frente a `ecosystem.tsx` | Fase 4, con las capturas reales |
| Operación afirma que "los viajes se registran localmente y se sincronizan al recuperar señal". Es una capacidad distinta de los tokens precargados y **no se pudo verificar** | `operations.tsx` | Comprobar en la app del conductor antes de dejarla escrita |
| Alturas de línea: 12 valores sueltos | `src/styles/` | Fase 4, componente por componente |
| Separaciones y márgenes: más de 14 valores de `gap` y 13 de `margin-top` | `src/styles/` | Fase 4. La escala `--sp-*` ya está definida y esperando |
| El contenido de la maqueta de teléfono se corta dentro de su recuadro | `ecosystem.css` | Se resuelve solo al sustituirla por capturas reales |
| Queda un desborde decorativo de 16px a 320px, del resplandor del teléfono | `ecosystem.css` | Cosmético. No genera barra de desplazamiento |
| Restos de Replit: `components.json` y `.replit-artifact/artifact.toml` | landing | Evaluar si se retiran |
| `wouter` con una sola ruta y una 404 inalcanzable | `src/router.tsx` | Evaluar en la fase de cierre |

```
<!-- HISTORICO-FIN -->

---

## 6. Qué no autoriza este documento

- No autoriza cambios de arquitectura, de composición ni de código.
- No fusiona `Audiences` con `Ecosystem` ni `Journey` con `HowItWorks`.
- No retira `ProofBand` ni decide sobre `.hero-proof`, que es una cuestión aparte.
- No incorpora a la constitución vigente las adiciones de capturas (anexo A), el
  contexto del producto (anexo B) ni la política editorial del §13 propuesto.
- No sustituye la constitución vigente: mientras no se apruebe, la referencia
  normativa es `docs/DESIGN-CONSTITUTION.md`, versión 2.0.
