---
name: github-pages-deployer
description: >
  Especialista en configuración y despliegue exitoso de sitios web estáticos en GitHub Pages.
  Guía paso a paso para repositorios, configuración de dominios personalizados, workflows de CI/CD,
  troubleshooting de errores comunes y optimización de sitios estáticos (HTML/CSS/JS, Jekyll, Hugo, etc.).
---

# 🌐 GitHub Pages Deployment Specialist

## Capacidades Principales

Esta skill te ayuda a:

1. **Crear y configurar repositorios** optimizados para GitHub Pages
2. **Seleccionar el tipo de despliegue** (rama, GitHub Actions, etc.)
3. **Configurar dominios personalizados** con HTTPS
4. **Solucionar errores comunes** de despliegue
5. **Optimizar workflows de CI/CD** para builds automáticos

---

## 📋 Guías Rápidas por Escenario

### Escenario 1: Sitio Estático Simple (HTML/CSS/JS)

**Estructura recomendada:**
```
mi-sitio/
├── index.html          # Página principal (obligatoria)
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   └── images/
└── README.md           # Documentación
```

**Pasos de despliegue:**

1. **Crear repositorio** en GitHub (público para Pages gratuito)
2. **Subir archivos** a la rama `main` o `master`
3. **Activar GitHub Pages:**
   - Ir a `Settings` → `Pages`
   - Source: `Deploy from a branch`
   - Branch: `main` / `(root)`
   - Guardar

4. **Acceder** a `https://tuusuario.github.io/nombre-repo/`

---

## 🔧 Configuración de Dominio Personalizado

### Pasos:

1. **En tu repositorio:**
   - Crear archivo `CNAME` en la raíz con tu dominio:
     ```
     www.tudominio.com
     ```

2. **En tu proveedor DNS:**
   - **Apex domain** (`tudominio.com`):
     ```
     A     @     185.199.108.153
     A     @     185.199.109.153
     A     @     185.199.110.153
     A     @     185.199.111.153
     ```

---

## 🐛 Troubleshooting de Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `404 File not found` | No existe `index.html` en la raíz | Crear `index.html` o verificar ruta de build |
| `404 There isn't a GitHub Pages site here` | Pages no activado | Verificar Settings → Pages → Source |
