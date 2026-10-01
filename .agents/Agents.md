# AGENTS.md — Guía para asistentes locales

> Documento de contexto y reglas para asistentes de código (Kilo, Copilot, Claude,
> Cursor, etc.) que trabajen en este repositorio. Léelo completo antes de proponer
> o aplicar cambios.

---

## 📖 Contexto del proyecto

**Enrutados Venezuela** es un ecosistema de transporte público digitalizado en fase
piloto. Nació como proyecto de feria estudiantil y evolucionó hacia un prototipo
funcional con tres apps móviles (pasajero, conductor/colector, admin), backend
Node/Express, y base de datos Supabase/PostGIS.

La **landing pública** (este repo) es la carta de presentación del proyecto ante
tres actores:
- **Pasajeros** — consultan, pagan y viajan
- **Conductores / Colectores** — validan pasajes, no administran caja
- **Asociaciones de transporte** — gestionan con información

**Principio editorial:** honestidad. Sin datos falsos, sin promesas infladas,
sin marketing genérico. La landing dice lo que el sistema hace y lo que aún no.

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node 24 LTS |
| Package manager | pnpm (workspace monorepo) |
| Framework | Vite 7 + React 19 |
| Lenguaje | TypeScript 5.9 (strict) |
| Estilos | Tailwind 4 + CSS custom properties |
| Tipografía | DM Sans (UI), Space Mono (datos/mono) |
| Iconos | lucide-react |
| Animaciones | CSS + IntersectionObserver (sin framer-motion en la landing) |
| Router | wouter |
| Lint | ESLint 9 (flat config) |

---

## 📁 Estructura de la landing
