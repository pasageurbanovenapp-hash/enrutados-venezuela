# Informe de validación — Paquete de reconciliación documental

**Proyecto:** Enrutados Venezuela — landing pública
**Repositorio objetivo:** `C:\Users\elvis\Documents\deepseek-harness\default-workspace\repo-enrutados`
**Rama:** `modernizacion-landing` · **HEAD:** `ad056ad5a75c3d035df8571768680d47d8de632e`
**Fecha del paquete:** 2026-10-15
**Modo:** preparación sin aplicación. **Ningún archivo del repositorio fue modificado, creado ni eliminado.**

---

## A. Dictamen

### `PAQUETE LISTO PARA REVISIÓN`

El dictamen se refiere **únicamente a la revisión del paquete**. **No autoriza su aplicación.**

Sustento:

1. Las precondiciones se verificaron al inicio y se confirmaron al cierre: rama, HEAD, hashes de los tres documentos protegidos, 14 entradas de `status`, `docs/propuestas/` inexistente.
2. El blob `f6765d36` es de tipo `blob`, mide 36.146 bytes y su contenido se recuperó **byte a byte** (reconstrucción en memoria verificada con el hash de objeto Git; **sin tuberías de PowerShell**).
3. Los cinco fragmentos históricos se extrajeron por límites inequívocos y sus huellas SHA-256 coinciden con las del preflight.
4. Los dos parches tienen sintaxis unificada válida y **`git apply --check` devuelve `exit=0`** en ambos, contra el árbol de trabajo real.
5. Los recuentos de los cinco hunks se validaron por conteo directo de líneas del parche.

---

## B. Inventario de artefactos

Raíz del paquete: `C:\Users\elvis\Documents\deepseek-harness\default-workspace\paquete-reconciliacion-enrutados\`

| Ruta relativa | Bytes | SHA-256 | Propósito |
|---|---:|---|---|
| `01-docs-DESIGN-CONSTITUTION.patch` | 7.495 | `50efdd4f5a0c4b5ecf157fd39db338403d58a5e50aff29c1aa7e838fec38c9f1` | Parche para `docs/DESIGN-CONSTITUTION.md` (hunks A1–A4) |
| `02-agents-Agents.patch` | 2.611 | `00ae6a119d06cc19628f2c569db487cf7d9975cdb14c86795dfa71cc90c3f236` | Parche para `.agents/Agents.md` (hunk B) |
| `03-docs-propuestas\PROPUESTA-estructura-nueve-secciones.md` | 15.013 | `4b1715c0a9dadc1d8da6ad93159789f87da34051be810361b83ffca9bf73b2b6` | Documento archivado propuesto. **Aún no incorporado al repositorio** |
| `patch\before\docs\DESIGN-CONSTITUTION.md` | 29.366 | `ba3b8d90600b2011cf6ceb20713e05d20f79534e234fc0913c11625d8db876fd` | Intermedio reproducible: estado actual normalizado a LF |
| `patch\after\docs\DESIGN-CONSTITUTION.md` | 34.462 | `98fe5a296b0184173cf5986c324e915acf2dca77867d2b4b7d76ce07a9ad8c2c` | Intermedio reproducible: resultado previsto |
| `patch\before\.agents\Agents.md` | 13.935 | `5cf81dc90599ae9ef28e408618eb0552b1ef8fac1bde18867ef4087f390a1841` | Intermedio: copia byte a byte del archivo de trabajo |
| `patch\after\.agents\Agents.md` | 14.283 | `0fa3e9cdbd269a8a28e0c6cc288893858c221234a10c8f2f29c8b36898e21dd3` | Intermedio reproducible: resultado previsto |

**Cadena de identidad verificada:** `patch\before\docs\...` tiene `git hash-object --path=docs/DESIGN-CONSTITUTION.md` = `fb98bbdb719ea215b48dd072a829c8e6fe977ea4`, idéntico a `HEAD:docs/DESIGN-CONSTITUTION.md`. Los parches se generaron con `git diff --no-index` entre `before` y `after`, con `core.autocrlf=false` para no normalizar nada.

---

## C. Matriz de integridad — fragmentos históricos

Fuente: blob `f6765d3603746ad9c43a8ff7ae66cec18cc9ec8e` (36.146 bytes, LF puro, sin BOM).
Normalización de huella: líneas unidas con LF + LF final, codificadas en UTF-8 sin BOM.

| # | Fragmento | Líneas del blob | Líneas | Bytes | SHA-256 esperado | SHA-256 obtenido | Resultado |
|---:|---|---|---:|---:|---|---|---|
| 1 | §8 propuesto | 317–322 | 6 | 463 | `f0c6b161…771d17` | `f0c6b161…771d17` | **OK** |
| 2 | §13 propuesto íntegro | 398–492 | 95 | 4.851 | `5c686d2a…3c0d56` | `5c686d2a…3c0d56` | **OK** |
| 3 | Anexo A — capturas | 270–288 | 19 | 1.146 | `f8184ab0…cb0514` | `f8184ab0…cb0514` | **OK** |
| 4 | Anexo B — contexto del producto | 612–637 | 26 | 1.655 | `8009fada…c4f62b` | `8009fada…c4f62b` | **OK** |
| 5 | Anexo C — modificaciones del Anexo | 639–656 | 18 | 2.457 | `2d8383db…9089b3` | `2d8383db…9089b3` | **OK** |

Las cinco huellas se recalcularon **desde el blob** y se volvieron a calcular **desde el archivo archivado ya escrito**, en las líneas 43–48, 61–155, 167–185, 199–224 y 236–253 respectivamente. Coinciden en ambos sentidos.

**Límite del fragmento 4.** El bloque cierra en su última viñeta (línea 637). La frase `No se importan sus secciones.` aparece **dos veces** en el blob (líneas 491 y 637), por lo que **no se usó como límite**; el cierre se fijó por el encabezado siguiente, `### Abierto` (línea 639).

**Método de recuperación.** Se descartó la tubería de PowerShell: está demostrado que convierte LF en CRLF (36.146 → 36.860 bytes). La recuperación se hizo en memoria —`git cat-file -p` decodificado, líneas unidas con LF más LF final— y se validó porque el hash del objeto Git resultante coincide exactamente con `f6765d36`. No se escribió ningún objeto Git nuevo.

---

## D. Matriz de parches

### `01-docs-DESIGN-CONSTITUTION.patch` → `docs/DESIGN-CONSTITUTION.md`

| Hunk | Encabezado | Viejo | Nuevo | Contexto | `+` | `−` | Recuento | `git apply --check` |
|---|---|---:|---:|---:|---:|---:|---|---|
| A1 | `@@ -5,9 +5,30 @@` | 9 | 30 | 9 | 21 | 0 | OK | `exit=0` |
| A2 | `@@ -44,6 +65,7 @@` | 6 | 7 | 6 | 1 | 0 | OK | `exit=0` |
| A3 | `@@ -298,13 +320,20 @@` | 13 | 20 | 6 | 14 | 7 | OK | `exit=0` |
| A4 | `@@ -380,6 +409,58 @@` | 6 | 58 | 6 | 52 | 0 | OK | `exit=0` |

Delta total: 578 → 659 líneas (+81 = +21 +1 +7 +52).

### `02-agents-Agents.patch` → `.agents/Agents.md`

| Hunk | Encabezado | Viejo | Nuevo | Contexto | `+` | `−` | Recuento | `git apply --check` |
|---|---|---:|---:|---:|---:|---:|---|---|
| B | `@@ -92,29 +92,30 @@` | 29 | 30 | 10 | 20 | 19 | OK | `exit=0` |

Delta total: 319 → 320 líneas (+1). El bloque «Orden de las secciones» pasa de 23 a 24 líneas; cuatro líneas del bloque original (el listado de bloques y sus separadores) se conservan como contexto.

**Riesgos pendientes de los parches**

| # | Riesgo | Estado |
|---|---|---|
| 1 | `docs/DESIGN-CONSTITUTION.md` está en **CRLF** en disco y el parche en LF | Mitigado: `git apply --check` devuelve `exit=0` sobre el árbol real (`core.autocrlf=true`). Debe repetirse la comprobación justo antes de aplicar |
| 2 | `.agents/Agents.md` está en **LF puro**, con `core.autocrlf=true` y **sin `.gitattributes`** | Mitigado por la misma comprobación |
| 3 | El parche B sustituye la modificación local deliberada del archivo | Verificado que **todo el resto del archivo queda intacto**: líneas 1–94 y 118–319 idénticas tras la aplicación |
| 4 | Un `git add` posterior normalizaría finales de línea | Fuera del alcance; corresponde al responsable |

---

## E. Cambios previstos si se aprobara

**Se modificarían (2 archivos):**

| Archivo | Cambio |
|---|---|
| `docs/DESIGN-CONSTITUTION.md` | Versión 2.0 en el encabezado; sección «Registro de decisiones»; viñeta nueva en §2; §8 reconciliado (antecedente superado + reglas vigentes); §13 nuevo con el cometido de los doce bloques |
| `.agents/Agents.md` | Solo el bloque «Orden de las secciones» |

**Se crearía (1 archivo):** `docs/propuestas/PROPUESTA-estructura-nueve-secciones.md` (y la carpeta `docs/propuestas/`).

**Se preservan expresamente:**

- La copia alternativa `UX-UI del Ecosistema/DESIGN-CONSTITUTION.md` — **no se mueve ni se borra**.
- `docs/Propuestapara audiences-ecosystem.md` y los seis archivos de `public/images/apps/`.
- `docs/Auditoria _hero.md`, `docs/REPORTE-ESTADO-codigo-landing.md`, `docs/REPORTE-REVISION-modernizacion-landing.md` y los scripts de evidencia.
- Todo `src/`, los estilos, las imágenes, `README.md`, `index.html`, `.gitignore` y la configuración.
- El Anexo de deuda conocida de la constitución: ningún hunk lo toca.

**El documento archivado no incorpora como norma:** las adiciones sobre capturas, el bloque «Contexto del producto, verificado» ni la política editorial del §13 propuesto. Se preservan como anexos históricos, con su adopción marcada como decisión independiente.

---

## F. Invariancia

| Magnitud | Al iniciar | Al cerrar | Diferencia |
|---|---|---|---|
| HEAD | `ad056ad5…632e` | `ad056ad5…632e` | ninguna |
| Rama | `modernizacion-landing` | `modernizacion-landing` | ninguna |
| `status --short` | 14 entradas | 14 entradas | ninguna |
| Staging | vacío | vacío | ninguna |
| Stash | 0 | 0 | ninguna |
| `docs/DESIGN-CONSTITUTION.md` | `fb98bbd…` | `fb98bbd…` | ninguna |
| `.agents/Agents.md` | `6534a7c…` | `6534a7c…` | ninguna |
| Copia alternativa | `f6765d36…` | `f6765d36…` | ninguna |
| `docs/propuestas/` | no existe | **no existe** | ninguna |
| Blob `f6765d36` | `blob`, 36.146 B | `blob`, 36.146 B | ninguna |

Ningún artefacto se escribió dentro del repositorio. `git apply --check` no modifica archivos. No se crearon objetos Git.

---

## G. Decisiones reservadas al responsable

1. **Firma y fecha de la versión 2.0** de la constitución. Las fechas marcadas como «confirmación 2026-10-15» son las de esta sesión de trabajo, no una aprobación registrada.
2. **Aplicar o no el paquete.** La aprobación del paquete no equivale a autorizar su aplicación.
3. **Adopción de los anexos A, B y C** del documento archivado (capturas, contexto verificado, limpieza del Anexo). No están incluidos en la versión 2.0.
4. **Destino de `.hero-proof`**, cuestión que la protección de `ProofBand` no resuelve.
5. **Qué hacer con la copia ignorada** una vez archivada la propuesta: conservarla, retirarla o dejar de ignorar su ruta.
6. **Versionado de los materiales sin seguimiento**: las seis capturas y `docs/Propuestapara audiences-ecosystem.md` siguen con copia única.

---

## Procedimiento de aplicación (no ejecutado)

```powershell
# 1. Control previo: hashes de los cuatro protegidos + status
# 2. Validar de nuevo, sin aplicar
git -C repo-enrutados apply --check --verbose <ruta>\01-docs-DESIGN-CONSTITUTION.patch
git -C repo-enrutados apply --check --verbose <ruta>\02-agents-Agents.patch
# 3. Aplicar (solo con autorización explícita)
git -C repo-enrutados apply <ruta>\01-docs-DESIGN-CONSTITUTION.patch
git -C repo-enrutados apply <ruta>\02-agents-Agents.patch
# 4. Crear el archivo archivado copiando el artefacto 03 al destino
# 5. Control posterior: repetir los hashes y comprobar el delta esperado
#    docs 578 -> 659 lineas | Agents 319 -> 320 lineas
```
