# Informe de validación — paquete v4

**Proyecto:** Enrutados Venezuela — landing pública
**Paquete:** `C:\Users\elvis\Documents\deepseek-harness\default-workspace\paquete-reconciliacion-enrutados\v4\`
**Repositorio:** `C:\Users\elvis\Documents\deepseek-harness\default-workspace\repo-enrutados`
**Rama:** `modernizacion-landing` · **HEAD:** `ad056ad5a75c3d035df8571768680d47d8de632e`
**Fecha:** 2026-10-15

> **Los parches de v4 no están aplicados.** No se modificó, creó ni eliminó ningún archivo del repositorio; no hubo `git add`, `commit`, `push`, `checkout`, `reset` ni `clean`. La única operación ejecutada contra el árbol de trabajo fue `git apply --check --verbose`, que no escribe.

---

## 1. Estado inicial y rutas reales de los archivos

### Rutas confirmadas por inspección

| Rol | Ruta real | Comprobación |
|---|---|---|
| Archivo de instrucciones del repositorio | **`.agents/Agents.md`** (13.935 B) | Es el único presente. No existe `AGENTS.md` en la raíz, ni `CLAUDE.md`, `CONTRIBUTING.md` ni `.cursorrules`. `Test-Path 'AGENTS.md'` → `False`; `Test-Path '.agents/AGENTS.md'` → `True` solo por insensibilidad a mayúsculas del sistema de archivos (mismo archivo) |
| Constitución de diseño | **`docs/DESIGN-CONSTITUTION.md`** (29.944 B en disco / 29.366 B en Git) | Versionado, sin cambios locales |
| Copia ignorada | `UX-UI del Ecosistema/DESIGN-CONSTITUTION.md` (36.146 B) | Ignorada por `.gitignore`; **no se tocó** |
| Documento histórico | `paquete-reconciliacion-enrutados\03-docs-propuestas\PROPUESTA-estructura-nueve-secciones.md` | Externo; **no se tocó** |

### Estado del repositorio (inicio y cierre, idénticos)

| Comprobación | Valor |
|---|---|
| Rama | `modernizacion-landing` |
| HEAD | `ad056ad5a75c3d035df8571768680d47d8de632e` |
| `git status --short` | 14 entradas (1 modificada + 13 sin seguimiento) |
| Staging / stash | vacío / 0 |
| `docs/DESIGN-CONSTITUTION.md` | `fb98bbdb719ea215b48dd072a829c8e6fe977ea4` |
| `.agents/Agents.md` | `6534a7c2313afa4942c6b323c250f4de56ec8d71` |
| Copia ignorada | `f6765d3603746ad9c43a8ff7ae66cec18cc9ec8e` |
| `docs/propuestas/` | no existe |

### Cambios locales preexistentes, respetados

`.agents/Agents.md` figura como ` M`: su árbol de trabajo contiene una modificación local deliberada (`+19 / −4`) respecto de HEAD. **v4 trabaja contra esa versión del árbol de trabajo, no contra HEAD**, y conserva íntegro todo lo que queda fuera del bloque corregido. Ningún otro cambio local se sobrescribió.

---

## 2. Contradicciones encontradas

| ID | Contradicción | Evidencia | Resolución en v4 |
|---|---|---|---|
| **C1** | `.agents/Agents.md` presenta la estructura de nueve secciones como objetivo y prescribe fusionar Audiences+Ecosystem, fusionar Journey+HowItWorks y retirar la banda de prueba | Líneas 100–117 del archivo de trabajo | **Corregida**: el bloque pasa a describir los doce bloques vigentes y declara la propuesta descartada |
| **C2** | `docs/DESIGN-CONSTITUTION.md` §8 registra «La primera fusión acordada es `journey` con `how-it-works`» | Líneas 301–307 | **Corregida**: §8 declara la arquitectura vigente y mueve las dos propuestas al antecedente histórico |
| **C3** | La constitución no distinguía decisiones vigentes de propuestas históricas ni indicaba el estado de una actualización documental | Encabezado y ausencia de registro | **Corregida**: encabezado con estado pendiente + «Registro de decisiones» D1–D7 |

### Contradicciones registradas y **no** resueltas (fuera de alcance, requieren autorización)

| ID | Situación | Por qué no se aborda |
|---|---|---|
| **U1** | El §13 y el registro de v4 referencian `docs/propuestas/PROPUESTA-estructura-nueve-secciones.md`, que **no existe en el repositorio** | Incorporar el documento archivado es un paso separado del paquete y no está autorizado. Queda como referencia pendiente |
| **U2** | Las seis capturas de `public/images/apps/` siguen sin seguimiento y sin uso, mientras §7 pide que las capturas reales sustituyan la maqueta de `div` de `ecosystem` | Implica trabajo sobre componentes y recursos: prohibido por §4 |
| **U3** | Deudas ya documentadas en el anexo «Abierto» (cifras inventadas en la maqueta de `ecosystem`, carrusel sin `prefers-reduced-motion`, afirmación no verificada en `operations.tsx`, alturas de línea y espaciados sin tokenizar) | Preexistentes y ajenas a la contradicción documental identificada |

**No se detectó ninguna otra contradicción** dentro del alcance.

---

## 3. Archivos que el paquete modificaría, y por qué

v4 no modifica archivos: los **modificaría al aplicarse**. Dos archivos, ambos documentales.

| Archivo | Motivo | Trazabilidad |
|---|---|---|
| `.agents/Agents.md` | Sustituir la orientación operativa de nueve secciones por la arquitectura de doce bloques | Instrucción §3.A · C1 |
| `docs/DESIGN-CONSTITUTION.md` | Documentar el cometido de cada bloque, las separaciones vigentes y el estado de la actualización | Instrucción §3.B · C2, C3 |

**Artefactos creados en el paquete externo:** `v4\` con dos parches por archivo, un parche combinado, el registro de cambios, este informe y los intermedios `before`/`after`.

---

## 4. Resumen del diff y hashes antes/después

### Hunks (recuentos verificados por conteo directo de líneas)

| Parche | Hunk | Encabezado | Viejo | Nuevo | Contexto | `+` / `−` | Recuento |
|---|---|---|---:|---:|---:|---|---|
| `01` | A1 | `@@ -5,9 +5,38 @@` | 9 | 38 | 9 | +29 / −0 | OK |
| `01` | A2 | `@@ -298,13 +327,17 @@` | 13 | 17 | 6 | +11 / −7 | OK |
| `01` | A3 | `@@ -380,6 +413,55 @@` | 6 | 55 | 6 | +49 / −0 | OK |
| `02` | B | `@@ -92,29 +92,31 @@` | 29 | 31 | 10 | +21 / −19 | OK |

Totales: `docs/DESIGN-CONSTITUTION.md` **578 → 660** líneas (+82); `.agents/Agents.md` **319 → 321** (+2). Coinciden con los archivos `after` medidos.

**Nota sobre A2:** al sustituir la viñeta de §8 se retira la mención «12 secciones y 14 pantallas de alto en móvil», que formaba parte del marco de reducción superado. Las mediciones de altura **no se pierden**: siguen en el anexo («Resuelto en la Fase 3» y «Peso real de la página»).

### Hashes antes/después

| Archivo | Antes (línea base) | Después (previsto) |
|---|---|---|
| `docs/DESIGN-CONSTITUTION.md` | 29.366 B · `ba3b8d90600b2011cf6ceb20713e05d20f79534e234fc0913c11625d8db876fd` *(hash Git `fb98bbd…`)* | 34.940 B · `2f08ba40b3a4db015e47e59a902134660a974ea1f4c79f095203b3ccca37c1c7` |
| `.agents/Agents.md` | 13.935 B · `5cf81dc90599ae9ef28e408618eb0552b1ef8fac1bde18867ef4087f390a1841` *(hash Git `6534a7c…`)* | 14.235 B · `09f13c691d91a81a7c8c0d1cb8a7c7222f0461885d82015640add755e474a062` |

Los intermedios `before` son idénticos a los de v3: la línea base no cambió.

### Artefactos de v4

| Ruta relativa a `v4\` | Bytes | SHA-256 |
|---|---:|---|
| `01-docs-DESIGN-CONSTITUTION.patch` | 7.536 | `cb3999764dc43f97bcb89c7e0a60f30d2dc7f008403543c011d73377ffbb22b0` |
| `02-agents-Agents.patch` | 2.564 | `8f680b486005a93b22897a1a895b72046c92fcbb3ca96d9363a870fd52ff7f68` |
| `03-DIFF-completo.patch` | 10.100 | `40ea1f52bce7bcdf30137c3b9013bc41e416e675ae8ba17a6a290dcc1f68c0c6` |
| `04-REGISTRO-de-cambios.md` | — | — |
| `05-INFORME-validacion-v4.md` | — | *(por construcción, un archivo no puede contener su propio SHA-256; se publica en la entrega)* |
| `patch\after\docs\DESIGN-CONSTITUTION.md` | 34.940 | `2f08ba40b3a4db015e47e59a902134660a974ea1f4c79f095203b3ccca37c1c7` |
| `patch\after\.agents\Agents.md` | 14.235 | `09f13c691d91a81a7c8c0d1cb8a7c7222f0461885d82015640add755e474a062` |

---

## 5. Comprobaciones ejecutadas y resultados

### 5.1 Validación de parches — **ejecutada**

```
git -C <repo> apply --check --verbose <v4>\01-docs-DESIGN-CONSTITUTION.patch
git -C <repo> apply --check --verbose <v4>\02-agents-Agents.patch
git -C <repo> apply --check --verbose <v4>\03-DIFF-completo.patch
```

| Parche | Exit | Salida |
|---|---|---|
| `01-docs-DESIGN-CONSTITUTION.patch` | **0** | `Checking patch docs/DESIGN-CONSTITUTION.md...` |
| `02-agents-Agents.patch` | **0** | `Checking patch .agents/Agents.md...` |
| `03-DIFF-completo.patch` | **0** | `Checking patch docs/DESIGN-CONSTITUTION.md... \| Checking patch .agents/Agents.md...` |

Un `git apply --check` exitoso **no** es autorización para aplicar.

### 5.2 Integridad del paquete v3 — **ejecutada**

| Artefacto v3 | ¿Cambió? |
|---|---|
| `01-docs-DESIGN-CONSTITUTION.patch` | No (`3ea8c242…`) |
| `02-agents-Agents.patch` | No (`669e3b7c…`) |
| `03-docs-propuestas\PROPUESTA-estructura-nueve-secciones.md` | No (`b5d115ec…`) |
| `04-INFORME-validacion.md` | No (`b6aa370b…`) |
| `patch\after\docs\DESIGN-CONSTITUTION.md` | No (`9d10cf9c…`) |
| `patch\after\.agents\Agents.md` | No (`3eb8064a…`) |

**La validación de v3 no se invalida.** Se registra únicamente que sus parches quedan **superados para aplicación futura**.

### 5.3 Integridad histórica — **ejecutada**

Verificación por delimitadores sobre el documento archivado, recalculando cada SHA-256:

| Fragmento | Líneas | Resultado |
|---|---|---|
| §8 histórico | 47–52 | **OK** |
| §13 histórico | 65–159 | **OK** |
| Anexo A | 172–190 | **OK** |
| Anexo B | 212–237 | **OK** |
| Anexo C | 249–266 | **OK** |

**5/5 intactos.** El documento archivado no se regeneró, reescribió ni reformateó, y su hash de archivo no cambió.

### 5.4 Alcance del diff — **ejecutada**

| Comprobación | Resultado |
|---|---|
| Archivos en el diff | **2**: `docs/DESIGN-CONSTITUTION.md` y `.agents/Agents.md` |
| Archivos de código o recursos (`.tsx`, `.ts`, `.css`, `.json`, `.html`, `.js`, `.mjs`, `.svg`, `.png`, `.webp`, `.avif`) | **0** |
| Aislamiento del bloque en `.agents/Agents.md` | Cabecera (líneas 1–94) y cola (líneas 120–321 del resultado) **idénticas** a la línea base |

### 5.5 Criterios de aceptación (§6) — **ejecutada**

| Criterio | Resultado | Evidencia |
|---|---|---|
| Ninguna instrucción operativa presenta la propuesta de nueve secciones como estructura vigente | **Cumplido** | `Estructura objetivo: nueve` → 0 apariciones en el resultado; la única mención de «nueve» es la nota «Propuesta descartada, no vigente» (línea 116) |
| Audiences y Ecosystem continúan separados | **Cumplido** | Declarado en §8, §13 y en el archivo de agentes |
| Journey y HowItWorks continúan separados | **Cumplido** | Declarado en §8, §13 y en el archivo de agentes |
| ProofBand permanece reconocido | **Cumplido** | §13 «`proof-band` se conserva» (2 apariciones) y en el archivo de agentes |
| ChapterBreak identificado como transición narrativa | **Cumplido** | 3 apariciones en la constitución; explícito en el archivo de agentes |
| La constitución distingue decisiones vigentes de propuestas pendientes | **Cumplido** | Registro D1–D7: vigentes (D2–D5), histórico no vigente (D1), propuesta descartada (D6), pendiente de aprobación (D7) |
| El documento histórico y sus evidencias se conservan íntegros | **Cumplido** | 5/5 fragmentos y hash de archivo sin cambios |
| El diff no contiene cambios visuales, de código ni de arquitectura fuera del alcance | **Cumplido** | Solo 2 archivos `.md`; 0 archivos de código |
| Cada cambio puede rastrearse hasta una decisión o contradicción concreta | **Cumplido** | Tabla del apartado 3 y del registro de cambios §3 |
| Se entrega evidencia verificable | **Cumplido** | Este informe |

### 5.6 Coherencia adicional verificada

- **Hechos comprobados antes de documentarlos:** la frase de cierre de `problem` («Los datos existen. / Pero no se conectan.») existe en `problem.tsx` líneas 138 y 140; el orden de los doce bloques coincide exactamente con `landing-page.tsx` líneas 26–37. **No se documentó ninguna afirmación sin comprobar.**
- **Coherencia con el documento archivado:** su «Nota de numeración» ya distingue el §13 propuesto (nueve secciones) del §13 de la constitución con los cometidos de los doce bloques, que describe como parte de la actualización propuesta. v4 materializa exactamente esa situación, sin contradicción.
- **Coherencia con el README del artefacto:** `artifacts/enrutados-venezuela/README.md` lista el mismo orden de bloques. No requiere cambios.

### 5.7 Comprobaciones **no** ejecutadas

| Comprobación | Estado |
|---|---|
| Aplicar los parches | **No ejecutada** — no autorizado |
| Crear `docs/propuestas/` y copiar el documento archivado | **No ejecutada** — no autorizado |
| `git add`, `commit`, `push` o despliegue | **No ejecutados** — no autorizados |
| Compilación, pruebas o instalación de dependencias | **No ejecutadas** — ajenas a una tarea documental |
| Cualquier cambio en componentes, CSS, recursos o arquitectura de la landing | **No ejecutado** — prohibido por §4 |
| Renderizado del documento resultante en un visor Markdown | **No ejecutada** — no verificada |

---

## 6. Aspectos pendientes de aprobación

1. **Aprobar la actualización documental** de `docs/DESIGN-CONSTITUTION.md` y de `.agents/Agents.md` (registro D7: pendiente de aprobación).
2. **Autorizar la aplicación** de los parches de v4. La validación no es autorización.
3. **Decidir sobre la incorporación del documento archivado** (`docs/propuestas/PROPUESTA-estructura-nueve-secciones.md`), hoy inexistente: sin él, las referencias de §13 y del registro apuntan a un archivo que no está en el repositorio (**U1**).
4. **Decidir el destino de v3**: conservarlo como histórico (situación actual) o retirarlo cuando v4 se aplique.
5. **Pronunciarse sobre U2 y U3** (capturas sin versionar y deudas del anexo) si se quiere ampliar el alcance; hoy quedan fuera.
6. **Confirmar la firma y la fecha** de la aprobación: la única fecha registrada en v4 es la de constancia documental (2026-10-15); **no hay fecha de aprobación registrada y no se ha inventado ninguna**.

---

## 7. Confirmación expresa de no modificación

**No se modificó el código de la landing ni su presentación visual.**

- El diff de v4 toca **exclusivamente** `docs/DESIGN-CONSTITUTION.md` y `.agents/Agents.md`.
- **Cero** archivos de `src/` en el diff: ni componentes React, ni CSS, ni `responsive`, ni animaciones, ni datos, ni hooks.
- **Cero** imágenes, recursos o configuración en el diff.
- **Ningún** componente se fusionó, eliminó, renombró ni reordenó.
- El repositorio está en el mismo estado que al iniciar: rama, HEAD, 14 entradas de `status`, staging vacío y stash vacío, con los tres hashes de control sin cambios.

**Los parches no están aplicados. La aprobación formal y la autorización para aplicarlos siguen pendientes y no se solicitan en esta entrega.**

---

## Anexo — Reproducción

```powershell
$repo = 'C:\Users\elvis\Documents\deepseek-harness\default-workspace\repo-enrutados'
$v4   = 'C:\Users\elvis\Documents\deepseek-harness\default-workspace\paquete-reconciliacion-enrutados\v4'

# Línea base
git -C $repo rev-parse --abbrev-ref HEAD
git -C $repo rev-parse HEAD
git -C $repo status --short --untracked-files=all
git -C $repo hash-object --path="docs/DESIGN-CONSTITUTION.md" "$repo\docs\DESIGN-CONSTITUTION.md"
git -C $repo hash-object --path=".agents/Agents.md" "$repo\.agents\Agents.md"
git -C $repo hash-object --path="docs/DESIGN-CONSTITUTION.md" "$repo\UX-UI del Ecosistema\DESIGN-CONSTITUTION.md"

# Validación, SIN aplicar
git -C $repo apply --check --verbose "$v4\01-docs-DESIGN-CONSTITUTION.patch"
git -C $repo apply --check --verbose "$v4\02-agents-Agents.patch"
git -C $repo apply --check --verbose "$v4\03-DIFF-completo.patch"

# Integridad de los cinco fragmentos históricos: leer el documento archivado,
# localizar cada línea <!-- HISTORICO-INICIO sha256=<64 hex> lineas=<n> -->,
# tomar las n líneas siguientes a la línea ```text, unirlas con LF más un LF
# final, codificar en UTF-8 sin BOM y comparar el SHA-256.

# Aplicación (requiere autorización explícita; NO ejecutada)
# git -C $repo apply "$v4\03-DIFF-completo.patch"
# delta esperado: docs 578 -> 660 lineas | .agents/Agents.md 319 -> 321 lineas
```
