# Despliegue

Este sitio se despliega automáticamente en **GitHub Pages** usando GitHub Actions.

## Flujo actual

1. Los commits se suben a la rama `main`.
2. El workflow genera la build de Vite en `dist/public`.
3. GitHub Pages publica ese artefacto en:

`https://pasageurbanovenapp-hash.github.io/enrutados-venezuela/`

## Comandos útiles

```bash
npm run dev
npm run build
npm run serve
```

## Notas importantes

- Los assets públicos van en `public/`.
- Para que las rutas funcionen bajo `/enrutados-venezuela/`, usar `import.meta.env.BASE_URL` en vez de rutas absolutas como `/hero.png`.
- El sitio se sirve como SPA. Los enlaces internos deben ser relativos o usar `hash` cuando corresponda.

## Si necesitas desplegar manualmente

1. Asegurate de estar en `main`.
2. Hace `git push origin main`.
3. Verificá el workflow **Deploy GitHub Pages** en la pestaña Actions del repo.
