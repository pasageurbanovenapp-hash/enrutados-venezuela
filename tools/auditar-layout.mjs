/**
 * Auditoria de composicion: busca desbordes, texto cortado y solapamientos.
 *
 * Uso:
 *   node auditar-layout.mjs <distDir> [puerto]
 *
 * Cambiar tamanos de fuente puede romper cosas que no se ven a simple vista:
 * una insignia que se sale de su tarjeta, un texto que se corta, una barra
 * horizontal en movil. Esto lo detecta de forma sistematica en los tres anchos.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve(process.argv[2] ?? '.');
const puerto = Number(process.argv[3] ?? 4419);

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
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};

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
  res.writeHead(200, { 'content-type': MIME[path.extname(target).toLowerCase()] ?? 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});

const ANCHOS = [
  { nombre: 'movil-320', width: 320, height: 720 },
  { nombre: 'movil-390', width: 390, height: 844 },
  { nombre: 'tablet-768', width: 768, height: 1024 },
  { nombre: 'escritorio-1440', width: 1440, height: 900 },
  { nombre: 'ancho-1920', width: 1920, height: 1080 },
];

const AUDITORIA = (anchoViewport) => {
  const problemas = [];
  const describir = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const clase = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '';
    const texto = (el.textContent ?? '').trim().slice(0, 45);
    return `${el.tagName.toLowerCase()}${id}${clase} "${texto}"`;
  };

  for (const el of document.querySelectorAll('body *')) {
    const est = getComputedStyle(el);
    if (est.display === 'none' || est.visibility === 'hidden' || Number(est.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    // Desborde horizontal del propio elemento.
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
      const desborde = el.scrollWidth - el.clientWidth;
      if (desborde > 3) problemas.push({ tipo: 'desborde-horizontal', detalle: `${describir(el)} se sale ${desborde}px` });
    }

    // Texto cortado verticalmente.
    if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) {
      const est2 = getComputedStyle(el);
      if (est2.overflow === 'hidden' || est2.overflowY === 'hidden') {
        const corte = el.scrollHeight - el.clientHeight;
        if (corte > 3) problemas.push({ tipo: 'texto-cortado', detalle: `${describir(el)} corta ${corte}px` });
      }
    }

    // Elemento que se sale del viewport por la derecha.
    if (r.right > anchoViewport + 1 && r.width < anchoViewport * 2) {
      problemas.push({ tipo: 'fuera-del-viewport', detalle: `${describir(el)} termina en ${Math.round(r.right)}px` });
    }

    // Elemento que se sale por la izquierda.
    if (r.left < -1 && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
      problemas.push({ tipo: 'fuera-por-la-izquierda', detalle: `${describir(el)} empieza en ${Math.round(r.left)}px` });
    }
  }

  // Barra horizontal en el documento.
  const doc = document.documentElement;
  const barra = doc.scrollWidth - doc.clientWidth;

  return { problemas, barraHorizontal: barra > 1 ? barra : 0 };
};

const main = async () => {
  await new Promise((r) => server.listen(puerto, '127.0.0.1', r));
  const base = `http://127.0.0.1:${puerto}${prefijoBase}`;
  const browser = await chromium.launch();
  const contexto = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await contexto.newPage();
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
  }).catch(() => {});

  let total = 0;
  for (const a of ANCHOS) {
    await page.setViewportSize({ width: a.width, height: a.height });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });
    await page.waitForSelector('[data-hero-state="ready"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(400);

    const { problemas, barraHorizontal } = await page.evaluate(AUDITORIA, a.width);

    // Se ignoran los elementos que sangran a proposito: el hero visual, la
    // escena del bus, el resplandor difuminado del telefono y el adorno de la
    // marca. Todos se salen de su caja de forma deliberada.
    const relevantes = problemas.filter(
      (p) =>
        !/#inicio|hero-visual|bus-scene|chapter-break__media|particles/i.test(p.detalle) &&
        !/phone__glow|brand-mark/i.test(p.detalle),
    );

    console.log(`\n=== ${a.nombre} (${a.width}px) ===`);
    if (barraHorizontal) {
      console.log(`  BARRA HORIZONTAL: el documento mide ${barraHorizontal}px de mas`);
      total++;
    }
    if (relevantes.length === 0) {
      console.log('  sin problemas');
    } else {
      const porTipo = {};
      for (const p of relevantes) (porTipo[p.tipo] ??= []).push(p.detalle);
      for (const [tipo, lista] of Object.entries(porTipo)) {
        console.log(`  ${tipo}: ${lista.length}`);
        for (const d of lista.slice(0, 6)) console.log(`    - ${d}`);
        if (lista.length > 6) console.log(`    ... y ${lista.length - 6} mas`);
      }
      total += relevantes.length;
    }
  }

  console.log(`\nTOTAL de hallazgos: ${total}`);
  await browser.close();
  server.close();
};

main().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});
