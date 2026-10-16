/**
 * Mide el peso sumando los archivos que el navegador pide de verdad.
 *
 * Uso: node medir-por-peticiones.mjs <distDir> <motor> [puerto]
 *
 * A diferencia de medir-peso.mjs, que usa el protocolo de depuracion de Chromium
 * (no disponible en WebKit), este registra las peticiones de red reales y suma
 * el tamano en disco de cada archivo servido. Sirve para comparar el camino AVIF
 * con el camino de respaldo WebP.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium, webkit } from 'playwright';

const distDir = path.resolve(process.argv[2] ?? '.');
const motorNombre = (process.argv[3] ?? 'chromium').toLowerCase();
const puerto = Number(process.argv[4] ?? 4550);
const motor = motorNombre === 'webkit' ? webkit : chromium;

const prefijoBase = (() => {
  const html = path.join(distDir, 'index.html');
  const c = fs.readFileSync(html, 'utf8');
  const m = /(?:src|href)="(\/[^"]*?)(?:assets\/|favicon)/.exec(c);
  return m ? m[1] : '/';
})();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const COMPRIMIBLES = new Set(['.html', '.js', '.css', '.svg', '.txt']);

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relativo = urlPath.startsWith(prefijoBase)
    ? urlPath.slice(prefijoBase.length - 1) || '/'
    : urlPath;
  let target = path.join(distDir, relativo);
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) target = path.join(distDir, 'index.html');
  const ext = path.extname(target).toLowerCase();
  const cabeceras = { 'content-type': MIME[ext] ?? 'application/octet-stream' };
  if (COMPRIMIBLES.has(ext) && String(req.headers['accept-encoding'] ?? '').includes('gzip')) {
    cabeceras['content-encoding'] = 'gzip';
  }
  res.writeHead(200, cabeceras);
  const flujo = fs.createReadStream(target);
  if (cabeceras['content-encoding'] === 'gzip') flujo.pipe(zlib.createGzip({ level: 6 })).pipe(res);
  else flujo.pipe(res);
});

/** Tamano en disco, comprimido si el servidor lo comprime. */
const tamanoServido = (ruta) => {
  const ext = path.extname(ruta).toLowerCase();
  const bruto = fs.readFileSync(ruta);
  if (COMPRIMIBLES.has(ext)) return zlib.gzipSync(bruto, { level: 6 }).length;
  return bruto.length;
};

const ANCHOS = [
  { nombre: 'movil', width: 390, height: 844 },
  { nombre: 'escritorio', width: 1440, height: 900 },
];

const main = async () => {
  await new Promise((r) => server.listen(puerto, '127.0.0.1', r));
  const base = `http://127.0.0.1:${puerto}${prefijoBase}`;
  const browser = await motor.launch();

  for (const a of ANCHOS) {
    const contexto = await browser.newContext({
      viewport: { width: a.width, height: a.height },
      reducedMotion: 'reduce',
    });
    const page = await contexto.newPage();
    const pedidos = new Map();

    page.on('response', (res) => {
      const url = new URL(res.url());
      if (url.hostname !== '127.0.0.1') return;
      const rel = decodeURIComponent(url.pathname).replace(prefijoBase, '');
      const enDisco = path.join(distDir, rel);
      if (fs.existsSync(enDisco) && fs.statSync(enDisco).isFile()) {
        pedidos.set(rel, tamanoServido(enDisco));
      }
    });

    await page.goto(base, { waitUntil: 'networkidle' });
    const alto = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < alto; y += 600) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(900);

    const porTipo = {};
    let total = 0;
    for (const [rel, bytes] of pedidos) {
      const ext = path.extname(rel).toLowerCase();
      const tipo =
        ext === '.js' ? 'script' :
        ext === '.css' ? 'stylesheet' :
        ext === '.woff2' ? 'fuentes' :
        ext === '.html' ? 'html' : 'imagen';
      porTipo[tipo] = (porTipo[tipo] ?? 0) + bytes;
      total += bytes;
    }

    console.log(`\n=== ${a.nombre} (${a.width}px) [${motorNombre}] ===`);
    for (const [tipo, b] of Object.entries(porTipo).sort((x, y) => y[1] - x[1])) {
      console.log(`  ${tipo.padEnd(12)} ${(b / 1024).toFixed(0).padStart(6)} kB`);
    }
    console.log(`  ${'TOTAL'.padEnd(12)} ${(total / 1024).toFixed(0).padStart(6)} kB   (${pedidos.size} archivos)`);

    const imagenes = [...pedidos.keys()].filter((r) => /\.(avif|webp|png)$/.test(r));
    console.log(`  imagenes: ${imagenes.join(' ')}`);

    await contexto.close();
  }

  await browser.close();
  server.close();
};

main().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});
