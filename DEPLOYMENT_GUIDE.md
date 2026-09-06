# Deploy — GitHub Pages

## Source of truth

- Workflow: `.github/workflows/deploy-pages.yml`
- Build output: `artifacts/enrutados-venezuela/dist/public`
- Vite base path: `/enrutados-venezuela/`

## Requisito en GitHub

En **Settings → Pages → Source** seleccionar **GitHub Actions**.

Si queda en "Deploy from a branch" o "Deploy from a folder", el sitio muestra 404 aunque el workflow tenga éxito.

## Flujo

1. Push a `main` → dispara `Deploy GitHub Pages`.
2. Checkout + pnpm install + build con `BASE_PATH=/enrutados-venezuela/`.
3. Upload artifact `artifacts/enrutados-venezuela/dist/public`.
4. `actions/deploy-pages@v4` publica.

## URL

`https://<user>.github.io/enrutados-venezuela/`

## Troubleshooting

- 404 tras deploy → revisar que Pages tenga source = GitHub Actions.
- Assets rotos → confirmar que el workflow use `BASE_PATH: /enrutados-venezuela/`.
- No se dispara el workflow → verificar que `on.push.branches` sea `["main"]`.
