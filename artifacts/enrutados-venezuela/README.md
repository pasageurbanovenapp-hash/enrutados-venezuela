# Enrutados Venezuela — Landing pública

Sitio de presentación de **Enrutados Venezuela**, un ecosistema de transporte
público digitalizado en fase piloto: pasajeros, conductores/colectores y
asociaciones de transporte.

> **Antes de modificar el diseño, lee [`../../docs/DESIGN-CONSTITUTION.md`](../../docs/DESIGN-CONSTITUTION.md).**
> Es la fuente de verdad del proyecto: criterios, tokens, prohibiciones y
> definición de terminado. Tiene prioridad sobre cualquier preferencia estética.

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 24 LTS |
| pnpm | 10 o superior |

Este proyecto vive dentro de un monorepo pnpm.

---

## Comandos

```bash
# Instalar dependencias (desde la raíz del monorepo, instala todo el workspace)
pnpm install

# Trabajar en la landing
cd artifacts/enrutados-venezuela

pnpm dev          # servidor de desarrollo
pnpm build        # build de producción
pnpm serve        # previsualizar el build
pnpm lint         # revisar el código
pnpm lint:fix     # revisar y corregir
pnpm typecheck    # revisar los tipos
```

### Build para GitHub Pages

El sitio se publica en un subdirectorio, así que la ruta base importa:

```bash
BASE_PATH=/enrutados-venezuela/ pnpm build
```

El resultado queda en `dist/public`.

---

## Despliegue

Se despliega automáticamente en **GitHub Pages** con GitHub Actions.

1. Los commits se suben a la rama `main`.
2. El workflow `.github/workflows/deploy-pages.yml` instala y compila.
3. GitHub Pages publica el artefacto en:

`https://pasageurbanovenapp-hash.github.io/enrutados-venezuela/`

En **Settings → Pages → Source** debe estar seleccionado **GitHub Actions**.
Si queda en "Deploy from a branch", el sitio muestra 404 aunque el despliegue
haya funcionado.

### Para desplegar manualmente

1. Asegúrate de estar en `main`.
2. `git push origin main`.
3. Verifica el workflow **Deploy GitHub Pages** en la pestaña Actions.

---

## Estructura

```
artifacts/enrutados-venezuela/
├── public/                  assets que se sirven tal cual
├── index.html               metadatos, tarjeta social y datos estructurados
└── src/
    ├── index.css            punto de entrada: solo importaciones
    ├── styles/              un modulo de estilo por responsabilidad
    ├── assets/fonts/        tipografias autoalojadas
    ├── components/
    │   ├── layout/          barra superior, pie, marca
    │   ├── sections/        una seccion de la landing por archivo
    │   └── ui/              componentes reutilizables
    ├── data/                todo el texto editable
    ├── features/landing/    composicion de la pagina
    ├── hooks/
    └── pages/
```

### Orden de las secciones

Hero, ProofBand, Problem, ChapterBreak, Audiences, Ecosystem, Journey,
HowItWorks, Operations, Honesty, FaqSection, Contact.

Se define en `src/features/landing/landing-page.tsx`.

### Los estilos están partidos en módulos

`src/index.css` solo contiene sentencias `@import`. Cada módulo vive en
`src/styles/` y tiene una responsabilidad.

**El orden de las importaciones es parte del funcionamiento.** Hay ajustes
posteriores (`refinements.css`, `how-it-works.css`) que dependen del orden de
cascada. No reordenes los `@import` sin volver a verificar visualmente.

### El texto no vive en el JSX

El contenido editable está en `src/data/` y en los archivos de
`src/components/sections/`. Los datos de contacto se centralizan en
`src/data/contact.ts`: no los dupliques.

### Rutas de assets

Los assets públicos se referencian con `import.meta.env.BASE_URL`, nunca con
rutas absolutas como `/hero.png`: el sitio se sirve desde un subdirectorio.

---

## Verificación visual

Antes de dar por buena cualquier modificación:

```bash
pnpm typecheck && pnpm lint && pnpm build
node ../../tools/capturar.mjs dist/public <salida> 4319 reduce
node ../../tools/auditar-layout.mjs dist/public
```

Ese script levanta el build, recorre la página para activar los revelados por
scroll y toma capturas en móvil, tablet y escritorio, más una por sección.
Detecta solo la ruta base leyendo `index.html`, así que sirve tanto para un build
local como para el artefacto de despliegue. **No lo sirvas en la raíz si lo
compilaste con `BASE_PATH`**: el enrutador no encontraría la ruta y fotografiarías
la página 404.

El modo `reduce` desactiva las animaciones y hace que las capturas sean
**reproducibles**: dos ejecuciones sobre el mismo código producen archivos
idénticos. Comparar las huellas SHA-256 de las capturas es, por tanto, una prueba
válida de que un refactor no cambió nada.

**Si el cambio era un refactor sin intención visual, las capturas deben ser
idénticas. Una diferencia visible es un error, no una mejora.**
