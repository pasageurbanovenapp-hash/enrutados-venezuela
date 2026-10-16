# Registro de cambios — paquete v4

**Proyecto:** Enrutados Venezuela — landing pública
**Paquete:** `paquete-reconciliacion-enrutados\v4\`
**Fecha:** 2026-10-15
**Repositorio de referencia:** `repo-enrutados` · rama `modernizacion-landing` · HEAD `ad056ad5a75c3d035df8571768680d47d8de632e`

> **Los parches de este paquete no están aplicados.** El repositorio no se modificó: los cambios existen solo como parches dentro del paquete externo, a la espera de autorización.

---

## 1. Qué es v4 y cómo se relaciona con v3

| Versión | Contenido | Estado |
|---|---|---|
| **v1** | Paquete original (parches, documento archivado, informe) | Conservado en `_anterior\` |
| **v2** | Corrección semántica: estado de la actualización, Registro con fechas separadas, advertencia de contexto histórico | Conservado en la raíz del paquete |
| **v3** | Corrección final: atribución temporal del hunk A3 y refuerzo del comando de comparación | Conservado en la raíz del paquete |
| **v4** | **Alineación con la arquitectura narrativa vigente de doce bloques** | Esta carpeta |

**La validación de v3 no se invalida ni se declara falsa.** v3 fue verificado correctamente para su alcance. Lo único que se registra es que **sus parches quedan superados para aplicación futura**: aplicar `v3\01-…patch` instalaría un §13 y un registro heredados del marco de nueve secciones, en contradicción con las decisiones vigentes. Los parches de v3 siguen siendo técnicamente aplicables —la línea base del repositorio no cambió—, pero **no deben aplicarse**.

Ningún artefacto de v3 se modificó: se conservan sus dos parches, el documento archivado, el informe de validación y sus intermedios, con los SHA-256 registrados en el informe de v3.

---

## 2. Decisiones aplicadas en v4

Arquitectura narrativa vigente: doce bloques montados en `landing-page.tsx`, de los cuales `chapter-break` es una transición narrativa, no una sección de contenido.

| # | Bloque | Cometido documentado |
|---|---|---|
| 1 | `hero` | Presenta la propuesta de valor. |
| 2 | `proof-band` | Conecta la promesa con la realidad humana del transporte. |
| 3 | `problem` | Expone la brecha y cierra con «Los datos existen. Pero no se conectan». |
| 4 | `chapter-break` | Transición cinematográfica entre `problem` y `audiences`. No es sección de contenido. |
| 5 | `audiences` | Argumenta el valor para pasajeros, conductores/colectores y asociaciones. |
| 6 | `ecosystem` | Demuestra visualmente las experiencias del producto, diferenciando capacidades reales, ilustrativas, futuras y pendientes de validación. |
| 7 | `journey` | Presenta la experiencia y el recorrido del usuario. |
| 8 | `how-it-works` | Explica el mecanismo de funcionamiento del sistema. |
| 9 | `operations` | Presenta la visibilidad y las capacidades operativas disponibles. |
| 10 | `honesty` | Comunica el estado real del producto, sus límites y lo no validado. |
| 11 | `faq-section` | Responde objeciones y preguntas. |
| 12 | `contact` | Propone la siguiente acción. |

**Descartadas expresamente como decisiones vigentes:** fusionar Audiences con Ecosystem; fusionar Journey con HowItWorks; retirar ProofBand; presentar la estructura de nueve secciones como objetivo aprobado.

---

## 3. Cambios por archivo y región, con trazabilidad

### 3.1 `.agents/Agents.md` — bloque «Orden de las secciones» (líneas 95–117 de la línea base)

| | |
|---|---|
| **Situación en la línea base** | `**Estructura objetivo: nueve secciones.**` con una tabla de nueve secciones que prescribe «**Fusión** de Audiences + Ecosystem», «**Fusión** de Journey + HowItWorks» y el retiro de la banda de prueba. |
| **Cambio en v4** | El bloque pasa a describir los **doce bloques montados** en su orden real, con `chapter-break` identificado como transición; las separaciones vigentes; `proof-band` conservado; y una nota que declara la estructura de nueve secciones **descartada y no vigente**, sin autoridad para reintroducirse bajo otra denominación. |
| **Trazabilidad** | Instrucción §3.A · Decisiones §2 (12 bloques + 4 descartes) · Contradicción **C1** |
| **Alcance** | Solo ese bloque: se conservan las 94 líneas anteriores y las 202 posteriores, verificadas idénticas por comparación. |

### 3.2 `docs/DESIGN-CONSTITUTION.md` — encabezado (líneas 1–11)

| | |
|---|---|
| **Situación en la línea base** | `**Estado:** vigente` · `**Última revisión:** Fase 1 del plan de modernización.` Sin mención del estado de una actualización. |
| **Cambio en v4** | Se añade `**Actualización documental propuesta — 2026-10-15. Pendiente de aprobación.**` con la aclaración de que **no constituye una versión aprobada ni publicada** y de que, hasta su aprobación formal, el documento sigue rigiéndose por su estado vigente anterior. |
| **Trazabilidad** | Instrucción §3.B («No declarar formalmente aprobada una modificación constitucional si esa aprobación todavía no se ha registrado») · Contradicción **C3** |

### 3.3 `docs/DESIGN-CONSTITUTION.md` — sección nueva «Registro de decisiones»

| | |
|---|---|
| **Situación en la línea base** | No existía. |
| **Cambio en v4** | Siete entradas (D1–D7) con columnas separadas `Fecha de aprobación` y `Evidencia de registro documental`, más notas que explican qué acredita cada columna. |
| **Contenido** | **D1** reducción parcial por fusiones → *antecedente histórico, no vigente*. **D2** `journey` ≠ `how-it-works` → *vigente*. **D3** `audiences` ≠ `ecosystem` → *vigente*. **D4** `proof-band` se conserva → *vigente*. **D5** `chapter-break` es transición → *vigente*. **D6** estructura de nueve secciones → *propuesta histórica descartada; no aprobada*. **D7** esta actualización documental → *pendiente de aprobación*. |
| **Trazabilidad** | Instrucción §3.B («Diferenciar explícitamente decisiones vigentes, propuestas históricas y modificaciones documentales pendientes de aprobación») |

### 3.4 `docs/DESIGN-CONSTITUTION.md` — §8, viñeta de presupuesto de secciones (líneas 301–307)

| | |
|---|---|
| **Situación en la línea base** | «**Decisión aprobada: reducción parcial, sección por sección.** … La primera fusión acordada es `journey` con `how-it-works`…» |
| **Cambio en v4** | Se sustituye por tres viñetas: **composición vigente** (doce bloques, `chapter-break` como transición); **antecedente histórico, no vigente** (las dos propuestas de reducción, declaradas no vigentes, con la arquitectura actual explicitada); y **vigente** (no se fusiona, suprime ni reordena nada sin aprobación explícita). |
| **Trazabilidad** | Decisión «Journey y HowItWorks permanecen separados» · Contradicción **C2** |
| **Nota de alcance** | Esta viñeta **no podía dejarse intacta**: contenía una fusión presentada como acordada, en contradicción directa con las decisiones vigentes. El cambio se limita al párrafo, sin tocar las demás viñetas de §8. |

### 3.5 `docs/DESIGN-CONSTITUTION.md` — §13 nueva «Cometido de cada bloque narrativo»

| | |
|---|---|
| **Situación en la línea base** | No existía. |
| **Cambio en v4** | Se añade §13 con la tabla de los doce bloques y su cometido, las separaciones y permanencias, las propuestas históricas no vigentes y una cláusula de alcance que le prohíbe fijar el número de secciones o autorizar fusiones. |
| **Trazabilidad** | Instrucción §2 (cometidos 1–12) y §3.B |

### 3.6 Cambios que v3 introducía y **v4 no conserva**

| Cambio de v3 | Decisión en v4 | Motivo |
|---|---|---|
| Añadir a §2 «Se congela» la viñeta «El cometido de cada bloque narrativo, conforme a la sección 13» | **No se incorpora** | §2 ya congela «la arquitectura de información: orden de secciones, anclas», y el encabezado de la constitución ya da fuerza normativa al documento entero. La instrucción pide limitar la modificación a §13 «y a las referencias estrictamente necesarias»: esta viñeta no lo era. |
| §13 y Registro heredados del marco de nueve secciones | **Reemplazados** por los de doce bloques | Alineación con las decisiones vigentes |

---

## 4. Lo que v4 no cambia

- **Ningún archivo de código:** ni componentes React, ni CSS, ni `responsive`, ni animaciones, ni recursos visuales, ni configuración.
- **Ningún componente se fusiona, elimina, renombra ni reordena.**
- **El documento archivado** `PROPUESTA-estructura-nueve-secciones.md` y sus cinco fragmentos históricos: intactos, sin cambios de hash.
- **La copia ignorada** `UX-UI del Ecosistema/DESIGN-CONSTITUTION.md`: intacta.
- **El resto de `docs/DESIGN-CONSTITUTION.md`** (secciones 0–7, 9–12 y el anexo): intacto.
- **El resto de `.agents/Agents.md`:** intacto, incluidas las modificaciones locales preexistentes.

---

## 5. Artefactos de v4

| Ruta relativa a `v4\` | Bytes | SHA-256 | Propósito |
|---|---:|---|---|
| `01-docs-DESIGN-CONSTITUTION.patch` | 7.536 | `cb3999764dc43f97bcb89c7e0a60f30d2dc7f008403543c011d73377ffbb22b0` | Parche de la constitución (3 hunks) |
| `02-agents-Agents.patch` | 2.564 | `8f680b486005a93b22897a1a895b72046c92fcbb3ca96d9363a870fd52ff7f68` | Parche del archivo de agentes (1 hunk) |
| `03-DIFF-completo.patch` | 10.100 | `40ea1f52bce7bcdf30137c3b9013bc41e416e675ae8ba17a6a290dcc1f68c0c6` | Ambos archivos en un solo parche aplicable |
| `04-REGISTRO-de-cambios.md` | — | — | Este documento |
| `05-INFORME-validacion-v4.md` | — | — | Informe de validación con evidencias |
| `patch\before\docs\DESIGN-CONSTITUTION.md` | 29.366 | `ba3b8d90600b2011cf6ceb20713e05d20f79534e234fc0913c11625d8db876fd` | Intermedio reproducible (hash Git `fb98bbd…`) |
| `patch\after\docs\DESIGN-CONSTITUTION.md` | 34.940 | `2f08ba40b3a4db015e47e59a902134660a974ea1f4c79f095203b3ccca37c1c7` | Resultado previsto |
| `patch\before\.agents\Agents.md` | 13.935 | `5cf81dc90599ae9ef28e408618eb0552b1ef8fac1bde18867ef4087f390a1841` | Copia byte a byte del árbol de trabajo |
| `patch\after\.agents\Agents.md` | 14.235 | `09f13c691d91a81a7c8c0d1cb8a7c7222f0461885d82015640add755e474a062` | Resultado previsto |

Los archivos `before` son idénticos a los de v3: **la línea base del repositorio no cambió.**
