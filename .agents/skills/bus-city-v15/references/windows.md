# Reproducir en Windows

## Requisitos

- Git.
- Node.js 20+ y Corepack/pnpm.
- Python 3 (para el servidor de V15).
- Chrome/Edge.
- Opcional para reoptimizar: Blender 4.1+ y `gltf-transform`.

La rama que contiene la landing narrativa y estas skills:

```
narrativa-propuesta
```

## 1. Clonar y entrar

PowerShell:

```powershell
git clone https://github.com/pasageurbanovenapp-hash/enrutados-venezuela.git
Set-Location ".\enrutados-venezuela"
git switch narrativa-propuesta
```

Si el repositorio ya existe:

```powershell
Set-Location "C:\ruta\a\enrutados-venezuela"
git fetch origin
git switch narrativa-propuesta
git pull --ff-only
```

Usa comillas si la ruta tiene espacios o acentos.

## 2. Instalar dependencias de la landing

```powershell
corepack enable
pnpm install
pnpm --filter @workspace/enrutados-venezuela dev
```

Vite abre normalmente en:

```
http://localhost:4173/
```

Si el puerto cambia, usa la URL que imprime la consola.

## 3. Ver la V15 aislada

En otra terminal:

```powershell
Set-Location ".\prototipos\desintegracion-controlada\ciudad-particulas\transicion-bus-ciudad\v15-doble-reloj"
python -m http.server 8012 --bind 0.0.0.0
```

Abre:

```
http://localhost:8012/
```

Si `python` no existe:

```powershell
py -3 -m http.server 8012 --bind 0.0.0.0
```

No uses `python3` en Windows salvo que sepas que está en el PATH.

## 4. Probar desde el teléfono

```powershell
ipconfig
```

Busca la IPv4 de la interfaz Wi-Fi (por ejemplo `192.168.1.23`). Desde el
teléfono, en la misma red:

```
http://192.168.1.23:8012/
```

Si Windows Firewall pregunta, permite Python en redes privadas. No abras el
puerto a redes públicas.

## 5. Verificar el bus final

El activo final está commiteado:

```
prototipos\desintegracion-controlada\ciudad-particulas\transicion-bus-ciudad\v15-doble-reloj\assets\bus_1024.glb
```

Comprueba que sea un archivo real, no un symlink:

```powershell
Get-Item .\prototipos\desintegracion-controlada\ciudad-particulas\transicion-bus-ciudad\v15-doble-reloj\assets\bus_1024.glb |
  Select-Object Length, LinkType
```

Debe pesar aproximadamente 1,56 MB y no tener `LinkType`.

## 6. Reoptimizar un GLB (opcional)

Requiere un GLB fuente. El GLB fuente de 39 MB que se usó para llegar a 50k
**no está en el repositorio**; solo está el resultado final. Si otro equipo tiene
el fuente, pásalo a:

```
prototipos\entradas\bus-fuente.glb
```

Inspeccionar:

```powershell
npx @gltf-transform/cli inspect .\prototipos\entradas\bus-fuente.glb
```

Optimizar (verifica `--help` de tu versión):

```powershell
npx @gltf-transform/cli optimize .\prototipos\entradas\bus-fuente.glb `
  .\bus-optimizado.glb --texture-size 1024 --simplify 0.5 --flatten --prune
```

Blender 4.1+:

```powershell
& "C:\Program Files\Blender Foundation\Blender 4.1\blender.exe" `
  --background --python .\ruta\script_normales.py
```

No uses `shade_smooth()` solo; usa auto-smooth/crease por ángulo y verifica que
el GLB final tenga `NORMAL`.

## 7. Problemas típicos

- **PowerShell no encuentra `python`**: usa `py -3`.
- **`pnpm` no existe**: `corepack enable`, luego `pnpm install`.
- **El puerto está ocupado**: cambia `8012`/`4173`.
- **El teléfono no carga**: firewall, misma red, IP correcta.
- **Se ve una versión vieja**: recarga forzada y usa `?v=N` cuando aplique.
- **Blender no está**: no es necesario para ver la landing; solo para reoptimizar.
- **GLB fuente ausente**: usa el `bus_1024.glb` final o consigue el fuente; no
  inventes una conversión que no se puede reproducir.

## 8. Qué se puede reproducir sin el fuente

- Landing narrativa.
- V15 con el bus final.
- Transición, partículas, ciudad.
- Pruebas móviles.
- Validación con el GLB final.

No se puede reproducir **desde cero** la optimización de 39 MB sin el GLB fuente.
La skill debe decirlo, no ocultarlo.
