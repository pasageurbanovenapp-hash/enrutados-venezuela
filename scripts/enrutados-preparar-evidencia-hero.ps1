$ErrorActionPreference = 'Stop'

# Solo lee los builds temporales existentes y levanta dos servidores locales.
# No modifica el repositorio, los worktrees, los builds ni la documentacion.
$root = Join-Path $env:TEMP 'enrutados-visual-validation'
$mainWorktree = Join-Path $root 'main'
$candidateWorktree = Join-Path $root 'modernizacion-landing'
$mainDist = Join-Path $mainWorktree 'artifacts\enrutados-venezuela\dist\public'
$candidateDist = Join-Path $candidateWorktree 'artifacts\enrutados-venezuela\dist\public'
$expectedMain = '09268d1bfce09daec726fa6a1ff6f59a6794122e'
$expectedCandidate = '41c675a6545b5074caef1cd30a18e618070e5032'
$mainPort = 4310
$candidatePort = 4311

Write-Host '=== Enrutados: preparacion de evidencia del Hero ===' -ForegroundColor Cyan
Write-Host 'Este ayudante no modifica archivos del repositorio.'
Write-Host "Raiz temporal: $root"

foreach ($item in @(@{Name='main'; Worktree=$mainWorktree; Dist=$mainDist; Expected=$expectedMain}, @{Name='modernizacion-landing'; Worktree=$candidateWorktree; Dist=$candidateDist; Expected=$expectedCandidate})) {
    if (-not (Test-Path (Join-Path $item.Dist 'index.html'))) {
        throw "No encuentro el build de $($item.Name): $(Join-Path $item.Dist 'index.html'). Detengo el proceso sin modificar nada."
    }
    if (Test-Path (Join-Path $item.Worktree '.git')) {
        $actual = (& git -C $item.Worktree rev-parse HEAD 2>$null | Select-Object -First 1).Trim()
        Write-Host "`n[$($item.Name)] SHA actual: $actual"
        Write-Host "[$($item.Name)] SHA esperado: $($item.Expected)"
        if ($actual -ne $item.Expected) { throw "El SHA de $($item.Name) no coincide. No levantare los servidores para evitar comparar evidencia incorrecta." }
        $status = (& git -C $item.Worktree status --porcelain 2>$null | Out-String).Trim()
        if ($status) { throw "El worktree $($item.Name) no esta limpio. No levantare los servidores." }
        Write-Host "[$($item.Name)] Worktree limpio: SI" -ForegroundColor Green
    } else {
        Write-Warning "No pude comprobar Git en $($item.Worktree); validare solamente que exista su build."
    }
}

foreach ($port in @($mainPort, $candidatePort)) {
    $listener = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener) { throw "El puerto $port ya esta ocupado. Cierra el servidor previo o cambia los puertos en este ayudante antes de continuar." }
}

$serverScript = Join-Path $root 'servidor-evidencia-hero.mjs'
$serverCode = @'
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const [mainRootArg, candidateRootArg] = process.argv.slice(2);
if (!mainRootArg || !candidateRootArg) throw new Error('Faltan las dos rutas dist/public');
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf'
};
function start(name, rootArg, port) {
  const root = path.resolve(rootArg);
  const server = http.createServer((req, res) => {
    let urlPath;
    try { urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end('Bad request'); return; }
    if (urlPath === '/enrutados-venezuela') urlPath = '/enrutados-venezuela/';
    if (urlPath.startsWith('/enrutados-venezuela/')) urlPath = urlPath.slice('/enrutados-venezuela'.length);
    if (!urlPath.startsWith('/')) urlPath = `/${urlPath}`;
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    const file = path.resolve(root, `.${urlPath}`);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end(`Not found: ${urlPath}`); return; }
      res.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    });
  });
  server.listen(port, '127.0.0.1', () => console.log(`[${name}] http://127.0.0.1:${port}/enrutados-venezuela/`));
  server.on('error', e => { console.error(`[${name}] ${e.message}`); process.exitCode = 1; });
}
start('main', mainRootArg, 4310);
start('modernizacion-landing', candidateRootArg, 4311);
'@
[System.IO.File]::WriteAllText($serverScript, $serverCode, [System.Text.UTF8Encoding]::new($false))

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw 'Node.js no esta en PATH. No se modifico el repositorio.' }
$argumentLine = '"{0}" "{1}" "{2}"' -f $serverScript, $mainDist, $candidateDist
$proc = Start-Process -FilePath $node.Source -ArgumentList $argumentLine -PassThru -WindowStyle Normal
Start-Sleep -Seconds 2
if ($proc.HasExited) { throw "El servidor termino inesperadamente (ExitCode=$($proc.ExitCode)). Revisa la ventana que se abrio." }

Write-Host "`n=== Listo ===" -ForegroundColor Green
Write-Host "main:                   http://127.0.0.1:$mainPort/enrutados-venezuela/"
Write-Host "modernizacion-landing:   http://127.0.0.1:$candidatePort/enrutados-venezuela/"
Write-Host "PID del proceso Node: $($proc.Id)"
Write-Host 'Deja abierta la ventana del servidor mientras haces las pruebas.'
Write-Host 'Al terminar, cierra la ventana del servidor o ejecuta: Stop-Process -Id ' -NoNewline
Write-Host $proc.Id -ForegroundColor Yellow
Write-Host 'No ejecutes pruebas en paralelo: cambia una sola variable cada vez.'
