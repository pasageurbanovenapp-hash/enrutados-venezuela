# 🚀 Enrutados Venezuela — Landing Page 2026

> Plataforma digital de gestión y cobro del transporte urbano. Pasajeros, conductores y asociaciones conectados en un solo sistema.

**🌐 Sitio en Vivo:** https://erikayakelin26092000-rgb.github.io/Enruta2-Web-2026/  
**📅 Última actualización:** 1 de Septiembre de 2026

---

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Desarrollo Local](#desarrollo-local)
- [Build y Deployment](#build-y-deployment)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Configuración Crítica](#configuración-crítica)
- [Automatización](#automatización)
- [Documentación Técnica](#documentación-técnica)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Stack Tecnológico

| Componente | Versión | Propósito |
|---|---|---|
| **React** | 19.2.6 | Framework UI |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 8.2.2 | Build tool (optimizado) |
| **Tailwind CSS** | 4.1.17 | Utilidades de estilos |
| **ESLint** | 10.9.1 | Linting |
| **Node.js** | 22 LTS | Runtime (CI/CD) |

**Otras librerías:**
- `clsx` — Composición de clases CSS
- `lucide-react` — Iconografía
- `tailwind-merge` — Merge de clases Tailwind

---

## 📦 Instalación

### Requisitos Previos

- **Node.js 22+** (recomendado LTS)
- **npm 10+** o compatible
- Git

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/erikayakelin26092000-rgb/Enruta2-Web-2026.git
cd Enruta2-Web-2026

# 2. Instalar dependencias (limpio)
rm -rf node_modules package-lock.json
npm install

# 3. Verificar instalación
npm run lint
npm run typecheck
```

---

## 💻 Desarrollo Local

### Iniciar servidor de desarrollo

```bash
npm run dev
```

Acceder a: `http://localhost:5173/Enruta2-Web-2026/`

**Características:**
- ✅ Hot Module Replacement (HMR)
- ✅ TypeScript con diagnostics en tiempo real
- ✅ Tailwind CSS con IntelliSense
- ✅ React Fast Refresh

### Validación de código

```bash
# TypeScript - Verificar tipos
npm run typecheck

# ESLint - Verificar código
npm run lint

# ESLint - Autoarreglar
npm run lint:fix
```

---

## 🚀 Build y Deployment

### Build de Producción

```bash
npm run build
```

**Salida esperada:**
```
dist/index.html                   1.58 kB │ gzip:  0.82 kB
dist/assets/index-*.css           75 kB   │ gzip: 11.44 kB
dist/assets/index-*.js           316 kB   │ gzip: 93.82 kB
```

### Preview Local del Build

```bash
npm run preview
```

Acceder a: `http://localhost:4173/Enruta2-Web-2026/`

### Deployment Automático

**Proceso:**
1. `git push origin main` → Dispara workflow
2. GitHub Actions ejecuta `.github/workflows/deploy-web.yml`
   - Checkout código
   - Install deps con `npm ci`
   - Build con `npm run build`
   - Upload a GitHub Pages
3. Sitio se actualiza en ~2-3 minutos

**Monitoreo:**
- GitHub → Repository → Actions → deploy-web.yml

---

## 📁 Estructura del Proyecto

```
Enruta2-Web-2026/
├── src/
│   ├── components/              # Componentes React
│   │   ├── Navbar.tsx          # Navegación
│   │   ├── Hero.tsx            # Sección principal
│   │   ├── Benefits.tsx         # Beneficios
│   │   ├── FAQ.tsx             # Preguntas frecuentes
│   │   ├── Footer.tsx          # Pie de página
│   │   ├── Particles.tsx       # Efectos visuales
│   │   ├── Reveal.tsx          # Animaciones scroll
│   │   └── ...                 # +13 componentes más
│   ├── lib/
│   │   └── hooks.ts            # useScrollProgress
│   ├── utils/
│   │   └── cn.ts               # Utilidad clsx
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Estilos globales
├── public/
│   └── legal/                  # Páginas legales
│       ├── terminos.html
│       ├── privacidad.html
│       └── menores.html
├── .github/
│   └── workflows/
│       ├── deploy-web.yml      # Build & deploy
│       ├── dependabot-auto-merge.yml
│       └── dependabot.yml
├── .agents/
│   └── skills/                 # Skills locales
├── index.html                  # Plantilla HTML
├── vite.config.ts              # Config de Vite
├── tsconfig.json               # Config de TypeScript
├── eslint.config.js            # Config ESLint
├── tailwind.config.js          # Config Tailwind
├── package.json
├── INCIDENT_REPORT.md          # Reporte de incidentes
├── DEPLOYMENT_GUIDE.md         # Guía técnica
├── AGENTS.md                   # Convenciones del proyecto
└── README.md                   # Este archivo
```

---

## 🔧 Scripts Disponibles

| Script | Comando | Descripción |
|---|---|---|
| **dev** | `npm run dev` | Servidor Vite en desarrollo (puerto 5173) |
| **build** | `npm run build` | Compilar para producción |
| **preview** | `npm run preview` | Vista previa del build (puerto 4173) |
| **lint** | `npm run lint` | Ejecutar ESLint |
| **lint:fix** | `npm run lint:fix` | Autoarreglar ESLint |
| **typecheck** | `npm run typecheck` | Validar tipos TypeScript |

---

## ⚙️ Configuración Crítica

### `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/Enruta2-Web-2026/",  // ⚠️ CRÍTICO: debe coincidir con repo name
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

**⚠️ Nota:** El valor de `base` debe coincidir exactamente con el nombre del repositorio en GitHub.

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitOverride": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### `eslint.config.js`

```javascript
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.recommended,
  reactRefresh.configs.recommended,
];
```

---

## 🤖 Automatización

### Dependabot

**Archivo:** `.github/dependabot.yml`

- ✅ Monitoreo semanal de dependencias npm
- ✅ Monitoreo semanal de GitHub Actions
- ✅ Auto-generación de PRs para actualizaciones
- ✅ Agrupación automática de security updates

**Próximo ciclo:** Lunes 3 AM

### Auto-Merge de PRs

**Archivo:** `.github/workflows/dependabot-auto-merge.yml`

**Lógica:**
- ✅ **Dev dependencies**: Auto-merge (patch + minor)
- ✅ **Security updates**: Auto-merge prioritario
- ⏸️ **Major bumps**: Solo aprobación (espera manual)

---

## 📚 Documentación Técnica

### Documentos en el Repositorio

1. **INCIDENT_REPORT.md** — Reporte completo del incidente del 1/9/2026
   - Problemas identificados
   - Soluciones aplicadas
   - Root cause analysis
   - Lecciones aprendidas

2. **DEPLOYMENT_GUIDE.md** — Guía técnica de despliegue
   - Arquitectura completa
   - Troubleshooting
   - Checklist pre-deploy
   - Debugging en producción

3. **AGENTS.md** — Convenciones del proyecto
   - Stack específico
   - Scripts disponibles
   - Configuración lint/TypeScript
   - Procedimiento de instalación

---

## 🔍 Troubleshooting

### Problema: `npm install` falla con ERESOLVE

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: Página en blanco en producción

**Verificar:**
1. ¿Existe `dist/index.html`?
2. ¿Tiene referencias correctas a assets?
   ```bash
   grep 'src=' dist/index.html
   # Debe contener: /Enruta2-Web-2026/assets/
   ```
3. ¿GitHub Actions completó exitosamente?

**Solución:**
```bash
npm run build
npm run preview
# Verifica que funciona localmente
```

### Problema: Estilos Tailwind no cargan

**Causa:** Archivos no incluidos en `globals.css`

**Solución:**
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Problema: TypeScript falla con imports

**Solución:**
```bash
npm run typecheck
# Si hay errores de path:
# Verificar tsconfig.json baseUrl y paths
```

---

## 🔐 Seguridad

- ✅ Dependencias monitoreadas por Dependabot
- ✅ Security updates se procesan automáticamente
- ✅ GitHub Actions usa Node 22 LTS
- ✅ Strict TypeScript mode activado
- ✅ ESLint con reglas de seguridad

---

## 🤝 Contribuir

1. Crear rama: `git checkout -b feature/nombre`
2. Realizar cambios
3. Validar: `npm run lint && npm run typecheck && npm run build`
4. Commit: `git commit -m "feat: descripción"`
5. Push: `git push origin feature/nombre`
6. Crear Pull Request

---

## 📖 Referencias

- [Vite Docs](https://vitejs.dev/)
- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub Pages](https://pages.github.com/)
- [GitHub Actions](https://github.com/features/actions)

---

## 📝 Licencia

Proyecto interno — Enrutados Venezuela 2026

---

## 📞 Soporte

- 🐛 Reportar bugs en GitHub Issues
- 📋 Ver documentación técnica: `DEPLOYMENT_GUIDE.md`
- 📊 Ver histórico de incidentes: `INCIDENT_REPORT.md`

---

**Última revisión:** 1 de Septiembre de 2026  
**Generado por:** GitHub Copilot  
**Estado:** ✅ Producción
