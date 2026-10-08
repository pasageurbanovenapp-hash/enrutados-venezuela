/**
 * Mide lo que un usuario descarga de verdad al abrir la landing.
 *
 * Uso:
 *   node medir-peso.mjs <distDir> [puerto]
 *
 * Usa el protocolo de depuracion de Chromium para sumar los bytes realmente
 * transferidos (ya comprimidos), agrupados por tipo de recurso. Es la unica
 * cifra que importa: el peso de la carpeta de despliegue no lo paga nadie.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from 'playwright';

const distDir = path.resolve(process.argv[2] ?? '.');
const puerto = Number(process.argv[3] ?? 4449);

const prefijoBase = (() => {
  const html = path.join(distDir, 'index.html');
  if (!fs.existsSync(html)) return '/';
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
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

/** Tipos que el servidor real comprime. Sin esto la medicion mentiria: el
 *  JavaScript apareceria con su tamano crudo y las proporciones enganarian. */
const COMPRIMIBLES = new Set(['.html', '.js', '.mjs', '.css', '.svg', '.json', '.txt']);

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relativo = urlPath.startsWith(prefijoBase)
    ? urlPath.slice(prefijoBase.length - 1) || '/'
    : urlPath;
  let target = path.join(distDir, relativo);
  if (!target.startsWith(distDir)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) target = path.join(distDir, 'index.html');

  const ext = path.extname(target).toLowerCase();
  const cabeceras = { 'content-type': MIME[ext] ?? 'application/octet-stream' };
  const aceptaGzip = String(req.headers['accept-encoding'] ?? '').includes('gzip');

  if (COMPRIMIBLES.has(ext) && aceptaGzip) {
    cabeceras['content-encoding'] = 'gzip';
    res.writeHead(200, cabeceras);
    fs.createReadStream(target).pipe(zlib.createGzip({ level: 6 })).pipe(res);
    return;
  }

  res.writeHead(200, cabeceras);
  fs.createReadStream(target).pipe(res);
});

const ANCHOS = [
  { nombre: 'movil', width: 390, height: 844, mobile: true },
  { nombre: 'escritorio', width: 1440, height: 900, mobile: false },
];

const main = async () => {
  await new Promise((r) => server.listen(puerto, '127.0.0.1', r));
  const base = `http://127.0.0.1:${puerto}${prefijoBase}`;
  const browser = await chromium.launch();

  for (const a of ANCHOS) {
    const contexto = await browser.newContext({
      viewport: { width: a.width, height: a.height },
      reducedMotion: 'reduce',
    });
    const page = await contexto.newPage();
    const cdp = await contexto.newCDPSession(page);
    await cdp.send('Network.enable');

    const urls = new Map();
    const totales = {};
    let total = 0;

    cdp.on('Network.responseReceived', (e) => {
      urls.set(e.requestId, { url: e.response.url, tipo: e.type });
    });
    cdp.on('Network.loadingFinished', (e) => {
      const info = urls.get(e.requestId);
      if (!info) return;
      const kb = e.encodedDataLength / 1024;
      const tipo = info.tipo === 'Document' ? 'html' : info.tipo === 'Font' ? 'fuentes' : info.tipo.toLowerCase();
      totales[tipo] = (totales[tipo] ?? 0) + kb;
      total += kb;
    });

    await page.goto(base, { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });
    await page.waitForSelector('[data-hero-state="ready"]', { timeout: 15000 }).catch(() => {});

    // Recorrido completo para que se carguen las imagenes diferidas.
    const alto = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < alto; y += 500) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(1200);

    console.log(`\n=== ${a.nombre} (${a.width}px) ===`);
    const orden = Object.entries(totales).sort((x, y) => y[1] - x[1]);
    for (const [tipo, kb] of orden) {
      console.log(`  ${tipo.padEnd(12)} ${kb.toFixed(0).padStart(6)} kB   ${((100 * kb) / total).toFixed(0)}%`);
    }
    console.log(`  ${'TOTAL'.padEnd(12)} ${total.toFixed(0).padStart(6)} kB`);

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
