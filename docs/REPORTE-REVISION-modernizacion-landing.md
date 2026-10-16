# Informe de revisión técnica: `modernizacion-landing`

**Proyecto:** Enrutados Venezuela  
**Repositorio:** `pasageurbanovenapp-hash/enrutados-venezuela`  
**Rama revisada:** `modernizacion-landing`  
**Commit revisado:** `41c675a6545b5074caef1cd30a18e618070e5032`  
**Rama base:** `main` (`09268d1bfce09daec726fa6a1ff6f59a6794122e`)  
**Fecha de revisión:** 10 de octubre de 2026  
**Propósito:** aportar evidencia técnica para que el tutor evalúe si esta rama debe ser la base de continuación del proyecto.

## 1. Resumen ejecutivo

`modernizacion-landing` contiene un commit adicional respecto de `main` que reorganiza los estilos de la landing, optimiza imágenes, aloja fuentes localmente y realiza ajustes de accesibilidad. Las verificaciones ejecutadas sobre el estado de la rama pasaron: lint, comprobación de tipos, build de producción y pruebas unitarias del repositorio.

La revisión manual del sitio compilado confirmó que la página carga y que, en cinco anchos de pantalla inspeccionados, el ancho del documento no supera el del viewport. No se detectaron errores de JavaScript ni recursos HTTP fallidos durante esa inspección. También se comprobó una reducción marcada en el tamaño de algunos archivos de imagen.

**Evaluación:** la rama muestra una mejora estructural y de rendimiento plausible, respaldada por verificaciones técnicas positivas. La evidencia disponible es suficiente para recomendarla como **candidata a base de continuación**, pero no para declarar una equivalencia visual completa ni una auditoría exhaustiva de accesibilidad y compatibilidad entre navegadores. Antes de eliminar o abandonar otros trabajos, se recomienda obtener la aprobación del tutor y conservar referencias recuperables.

## 2. Alcance y método

La revisión se centró en el único commit que adelanta `modernizacion-landing` respecto de `main`. Se examinaron los cambios de estructura CSS, componentes afectados, recursos gráficos, configuración y scripts de validación.

Se ejecutaron verificaciones sobre el checkout de `modernizacion-landing` y se inspeccionó el build resultante en navegador. Las comparaciones de tamaño de imagen se calcularon a partir del tamaño del archivo anterior guardado en Git y el nuevo archivo generado en la rama.

Esta revisión no modifica ni certifica cambios locales no confirmados. Al momento de la inspección, el árbol de trabajo también contenía modificaciones y archivos sin seguimiento ajenos al commit revisado; por tanto, los resultados aquí presentados corresponden al código versionado de `41c675a`, no a esos cambios locales.

## 3. Cambios principales

El commit `41c675a` incluye, entre otros, los siguientes cambios:

- Divide el CSS que se encontraba concentrado en `src/index.css` en módulos dentro de `src/styles/`, importados desde un punto de entrada. El commit documenta aproximadamente 2.115 líneas previas y 22 módulos de estilos.
- Introduce una escala tipográfica y documentación de diseño.
- Sustituye imágenes PNG/JPG de mayor tamaño por variantes AVIF/WebP y usa distintas resoluciones para pantallas pequeñas y grandes.
- Incluye archivos de fuentes locales para evitar depender exclusivamente de una descarga desde Google Fonts.
- Oculta del árbol de accesibilidad una ilustración del teléfono con datos ficticios.
- Añade herramientas de apoyo para inspección visual, auditoría de layout, revisión de escala tipográfica y medición de recursos.

El orden de los imports CSS es relevante para la cascada, y el propio cambio lo documenta. Reordenarlos sin volver a probar el aspecto visual puede cambiar los estilos aplicados.

## 4. Verificaciones realizadas

| Área | Resultado | Evidencia |
|---|---|---|
| Lint de la landing | **Aprobado** | `pnpm --dir artifacts\enrutados-venezuela lint` terminó sin errores. |
| Tipos de la landing | **Aprobado** | `pnpm --dir artifacts\enrutados-venezuela typecheck` terminó correctamente. |
| Tipos del repositorio | **Aprobado** | `pnpm run typecheck` completó los chequeos de librerías y paquetes incluidos en el workspace. |
| Build de producción | **Aprobado** | `pnpm --dir artifacts\enrutados-venezuela build` generó el sitio; el bundle JavaScript reportado fue 273,81 kB (86,13 kB gzip) y el CSS 66,83 kB (13,24 kB gzip). |
| Pruebas unitarias del repositorio | **Aprobado** | `pnpm test`: 3 archivos y 14 pruebas pasaron. |
| Carga en navegador | **Aprobado en inspección manual** | El build mostró título y contenido esperados; no se detectaron errores de JavaScript ni respuestas HTTP fallidas durante la carga inspeccionada. |
| Anchos de pantalla | **Sin desbordamiento horizontal detectado** | Inspección del documento a 320, 390, 768, 1440 y 1920 px; el `scrollWidth` no superó el ancho del viewport. |
| Espaciado tipográfico en CSS | **Sin excepciones detectadas en declaraciones CSS** | `node tools\revisar-escala.mjs artifacts\enrutados-venezuela\src` revisó 54 declaraciones CSS y no encontró tamaños fuera de los tokens. |
| Clases tipográficas de Tailwind | **Pendiente de criterio** | El mismo verificador señaló 40 líneas con utilidades de tamaño de texto de Tailwind en componentes; hay que confirmar si son excepciones intencionales o deuda de migración. |
| Diferencias de whitespace | **Aprobado** | `git diff --check origin/main..origin/modernizacion-landing` no reportó problemas. |

### Mediciones de imágenes

| Recurso | En `main` | En `modernizacion-landing` | Reducción aproximada |
|---|---:|---:|---:|
| Hero | PNG: 1.852.215 bytes | AVIF: 84.674 bytes | 95,4 % |
| Icono de administrador | PNG: 29.409 bytes | WebP: 4.572 bytes | 84,5 % |
| Icono de conductor | PNG: 25.335 bytes | WebP: 4.952 bytes | 80,5 % |
| Icono de pasajero | PNG: 26.186 bytes | WebP: 5.438 bytes | 79,2 % |

Estas cifras comparan archivos concretos; **no representan por sí solas el total transferido por todos los navegadores**. El build y las pruebas de red deben considerar selección de fuentes responsivas, caché, compresión HTTP y motor de navegador.

## 5. Aspectos pendientes antes de una aprobación definitiva

1. **Comparación visual contra `main`:** las capturas se revisaron en la rama candidata, pero no se generó una comparación automatizada y reproducible contra la rama base en todos los tamaños y secciones.
2. **Compatibilidad entre motores:** no se ejecutó la comparación automatizada Chromium/WebKit disponible en las herramientas del proyecto.
3. **Auditoría automatizada de accesibilidad:** no se ejecutó axe-core. Su dependencia y Playwright no estaban disponibles en el entorno; la carga sin errores no sustituye una auditoría WCAG.
4. **Escala tipográfica en JSX:** resolver si los 40 usos de clases de tamaño de Tailwind detectados son excepciones aceptadas o deben migrarse a los tokens antes de considerar completa la nueva escala.
5. **CI y Pages:** revisar el resultado de CI asociado al commit y confirmar que el despliegue de GitHub Pages funciona con la configuración actualizada de Node y las rutas base.

Estos puntos no constituyen fallos confirmados; delimitan lo que esta revisión no verificó.

## 6. Situación comparativa de las ramas

En la comparación efectuada, `modernizacion-landing` estaba al día con `origin/main` y tenía un commit exclusivo (`41c675a`). Las referencias remotas `fix-refactor-paso-3` y `refactor/arquitectura-landing` estaban, respectivamente, 18 y 25 commits detrás de `main`, sin commits exclusivos respecto de `main` en esa comparación. Esto indica que sus cambios versionados ya están contenidos en la historia de `main`; no prueba que el árbol de trabajo actual no tenga archivos sin guardar.

La información de sincronización puede cambiar con nuevos commits. Debe repetirse la comparación de referencias justo antes de decidir un merge o archivar ramas.

## 7. Recomendación

Con la evidencia disponible, se recomienda que el tutor considere `modernizacion-landing` como **candidata preferente para continuar el trabajo**, porque:

- el cambio está acotado a un commit sobre `main`;
- lint, tipos, build y pruebas existentes pasaron;
- las imágenes principales verificadas son sustancialmente más pequeñas;
- la organización de estilos es más modular que la hoja monolítica anterior.

La recomendación es **favorable con verificaciones pendientes**, no una aprobación incondicional de merge. Para cerrar la revisión, se propone:

1. ejecutar o inspeccionar CI para el commit exacto;
2. comparar capturas reproducibles de `main` y `modernizacion-landing`;
3. correr auditorías visuales en Chromium y WebKit y auditoría de accesibilidad;
4. revisar con el tutor el alcance de las 40 clases tipográficas encontradas;
5. una vez aprobada la rama, integrar o establecerla como base y solo después decidir si archivar las demás referencias.

No se recomienda borrar otras ramas ni descartar trabajo recuperable antes de la aprobación explícita del tutor y de comprobar que no existen cambios locales pendientes que deban conservarse.

## 8. Conclusión

La evidencia recopilada respalda que `modernizacion-landing` compila, pasa las comprobaciones de código y pruebas existentes, y aporta mejoras medibles en el peso de los recursos gráficos inspeccionados. También mejora la separación de responsabilidades en los estilos. Quedan verificaciones visuales, de accesibilidad y compatibilidad entre navegadores para reducir el riesgo de regresiones antes de un merge definitivo.

**Dictamen técnico:** favorable como candidata a rama de continuación; aprobación de merge sujeta a la revisión del tutor y al cierre de las verificaciones pendientes que el equipo considere obligatorias.

## 9. Addendum: cierre de la comparación visual

**Fecha:** 10 de octubre de 2026  
**Estado:** este addendum actualiza las verificaciones visuales que en las secciones anteriores figuraban como pendientes.

### 9.1 Integridad de la comparación

Se verificaron de nuevo los SHA exactos y se construyeron dos worktrees detached:

| Versión | SHA |
|---|---|
| `main` | `09268d1bfce09daec726fa6a1ff6f59a6794122e` |
| `modernizacion-landing` | `41c675a6545b5074caef1cd30a18e618070e5032` |

Ambos worktrees terminaron sin cambios versionados ni no versionados. El checkout original permaneció en `modernizacion-landing` y conservó sin alteraciones los cambios locales que ya tenía.

Entorno: Node `v24.15.0`, pnpm `10.32.1`, Playwright `1.64.0` y Chromium `156.0.8078.4` (Playwright build `1248`). Playwright y Chromium se instalaron fuera del repositorio, bajo `%TEMP%\enrutados-visual-validation\visual-tools`; no se modificaron manifiestos ni lockfiles.

Las dependencias de ambos worktrees se instalaron con `corepack pnpm@10.32.1 install --frozen-lockfile`; ambas instalaciones terminaron correctamente. Cada versión se compiló con:

```powershell
$env:BASE_PATH='/enrutados-venezuela/'
corepack pnpm@10.32.1 --filter @workspace/enrutados-venezuela run build
```

Los dos builds terminaron correctamente y generaron recursos bajo `/enrutados-venezuela/assets/`. `main` emitió una advertencia de sourcemap de `tooltip.tsx`, sin impedir el build. Los tamaños compilados fueron:

| Build | JavaScript | CSS |
|---|---:|---:|
| `main` | 371.576 bytes | 70.874 bytes |
| `modernizacion-landing` | 274.085 bytes | 67.109 bytes |

### 9.2 Capturas generadas

Se utilizó el mismo `tools/capturar.mjs` versionado en la candidata para capturar ambos directorios `dist/public`, con puertos distintos y modo `reduce`. Playwright se resolvió desde la instalación temporal mediante un hook de resolución ESM, sin editar el script ni los worktrees.

- `main`: `%TEMP%\enrutados-visual-validation\captures-main-20261010-0520\`
- `modernizacion-landing`: `%TEMP%\enrutados-visual-validation\captures-modernizacion-landing-20261010-0520\`

Cada carpeta contiene las capturas completas `completa-movil.png` (390 px), `completa-tablet.png` (768 px) y `completa-escritorio.png` (1440 px), 12 capturas individuales de sección y `informe.json`. Se capturaron las 12 secciones en ambas versiones. Los informes de captura registran cero errores de consola y cinco imágenes cargadas por versión.

El alto total medido fue:

| Ancho | `main` | Candidata | Diferencia |
|---|---:|---:|---:|
| 390 px | 12.283 px | 12.112 px | 171 px menos |
| 768 px | 11.169 px | 11.293 px | 124 px más |
| 1440 px | 10.228 px | 9.847 px | 381 px menos |

### 9.3 Diferencias visuales

| Área | Clasificación | Hallazgo |
|---|---|---|
| Hero | **Diferencia visual pendiente de aprobación** | El copy y la jerarquía se conservan, pero cambia claramente el reflujo tipográfico y la altura/composición: en la captura de sección de 1440 px `main` mide 932 px y la candidata 814 px. En móvil el titular ocupa menos líneas en la candidata. Es un cambio coherente con la nueva escala, pero debe aprobarse como decisión visual. |
| Hero e imágenes | **Mejora intencional confirmada en carga; fidelidad final no cuantificada** | La candidata carga las variantes AVIF/WebP seleccionadas y reducidas por resolución; no hubo errores en capturas. No se hizo comparación perceptual de píxeles contra los originales ni prueba en navegadores distintos de Chromium. |
| ChapterBreak | **Mejora intencional confirmada** | La captura de sección conserva sustancialmente el encuadre y la continuidad visual, mientras el código provee recursos AVIF/WebP y tamaños responsivos. |
| Audiences | **Sin regresión narrativa detectada en las capturas revisadas** | Se mantienen orden, textos y jerarquía de las tres perspectivas. La composición de escritorio es muy similar, con ajustes de tamaño y espaciado. No se hizo comparación por píxel. |
| Ecosystem | **Posible regresión en 320 px** | La auditoría de layout informa que la candidata tiene desbordamiento horizontal del `site-shell` y `main` de 55 px, y del `wrap`/`ecosystem__grid` de hasta 70 px, además de 13 elementos que terminan fuera del viewport. En `main` no se reporta desbordamiento del contenedor raíz ni elementos fuera del viewport a ese ancho. A 390 px ambos builds tienen los mismos tipos de desbordes del área de Ecosystem y el teléfono ilustrativo; por tanto, esos desbordes comunes no se atribuyen exclusivamente a la candidata. |
| Ecosystem, otras anchuras | **Sin regresión diferencial clara; clipping común observado** | En ambas ramas, la auditoría reporta el teléfono ilustrativo sobresaliendo 48 px y contenido interno cortado en algunos anchos. La candidata oculta del árbol accesible los datos ficticios del mockup, pero no se ejecutó axe-core. |
| Orden y títulos de secciones | **Sin diferencia detectada** | Ambas capturas contienen 12 secciones y las listas de encabezados `h1`/`h2` son iguales. |
| Movimiento | **No concluyente** | El modo `reduce` apaga animaciones para estabilizar la composición. No valida transiciones ni comportamiento animado normal. |

La auditoría de layout se ejecutó sobre ambos builds a 320, 390, 768, 1440 y 1920 px. A 390 px y en anchuras mayores, la herramienta también reporta clipping del teléfono ilustrativo en ambos builds; esos hallazgos preexistentes deben distinguirse del desbordamiento adicional del contenedor candidato a 320 px. No se aplicaron correcciones durante esta fase.

### 9.4 Canonical y dominio

La inspección de solo lectura encontró:

- La API actual de GitHub Pages informa `https://pasageurbanovenapp-hash.github.io/enrutados-venezuela/`, `cname: null`, `build_type: workflow` y fuente `main` raíz.
- Ninguno de los dos SHA contiene un archivo `CNAME`.
- El canonical de `main` es `https://enrutados.ve/`; el canonical de la candidata es la URL GitHub Pages indicada por la configuración actual.
- El campo `homepage` del repositorio está vacío. La resolución DNS de `enrutados.ve` no tuvo éxito durante esta revisión.

Por tanto, el canonical de la candidata coincide con la configuración actual de GitHub Pages, pero el historial contiene un canonical anterior para `enrutados.ve`. La intención futura de usar ese dominio personalizado no se puede establecer con certeza a partir de la configuración consultada y requiere confirmación del tutor.

### 9.5 Dictamen visual

**Validación todavía inconclusa.** La comparación confirma los cambios visuales previstos y una mejora apreciable en el peso del bundle. Sin embargo, queda un posible desbordamiento diferencial en 320 px, el cambio de composición del Hero requiere aprobación y la intención del dominio canónico necesita confirmación. La fase se limitó a observar y documentar: no se modificó código, copy, estilos, imágenes, configuración, ramas ni worktrees; no se autorizó ningún merge.

Antes de aprobar visualmente, se recomienda resolver el hallazgo de 320 px en una fase autorizada, obtener aprobación explícita del cambio de Hero, confirmar el dominio canónico y probar movimiento normal, accesibilidad automatizada y, de ser posible, WebKit.
