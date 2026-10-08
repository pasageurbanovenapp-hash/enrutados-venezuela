/**
 * Compara el sitio entre motores de navegador.
 *
 * Uso: node comparar-navegadores.mjs <distDir> <dirSalida> [puerto]
 *
 * Todo lo medido hasta ahora era en Chromium. Esto comprueba Safari (WebKit),
 * que es donde fallan las propiedades modernas: overflow:clip, mask-image,
 * object-fit y las funciones de escalado fluido.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit } from 'playwright';

const distDir = path.resolve(process.argv[2] ?? '.');
const dirSalida = path.resolve(process.argv[3] ?? './comparacion');
const puerto = Number(process.argv[4] ?? 4520);

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
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
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

const MEDIR = () => {
  const cs = (sel, pseudo) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el, pseudo ?? null) : null;
  };
  const antes = cs('body', '::before');
  const shell = cs('.site-shell');
  const titulo = cs('.section-title');
  const hero = cs('.hero h1');
  const bus = cs('.bus-image');

  return {
    altoDocumento: document.body.scrollHeight,
    altoViewport: window.innerHeight,
    secciones: document.querySelectorAll('main > section').length,
    imagenes: document.images.length,
    imagenesCargadas: Array.from(document.images).filter((i) => i.complete && i.naturalWidth > 0).length,
    // Propiedades de riesgo en Safari
    overflowShell: shell ? shell.overflow : null,
    mascaraBodyAntes: antes ? antes.maskImage || antes.webkitMaskImage : null,
    tamanoTitulo: titulo ? titulo.fontSize : null,
    tamanoHero: hero ? hero.fontSize : null,
    objectFitBus: bus ? bus.objectFit : null,
    // Señales de que el CSS moderno se aplicó
    soportaClamp: CSS.supports('font-size', 'clamp(1rem, 2vw, 2rem)'),
    soportaOverflowClip: CSS.supports('overflow', 'clip'),
    soportaMaskImage: CSS.supports('mask-image', 'radial-gradient(#000, transparent)'),
    soportaWebkitMask: CSS.supports('-webkit-mask-image', 'radial-gradient(#000, transparent)'),
    soportaBackdrop: CSS.supports('backdrop-filter', 'blur(4px)'),
    soportaAspectRatio: CSS.supports('aspect-ratio', '16 / 9'),
  };
};

const MOTORES = [
  { nombre: 'chromium', motor: chromium },
  { nombre: 'webkit', motor: webkit },
];

const ANCHOS = [
  { nombre: 'movil', width: 390, height: 844 },
  { nombre: 'escritorio', width: 1440, height: 900 },
];

const main = async () => {
  fs.mkdirSync(dirSalida, { recursive: true });
  await new Promise((r) => server.listen(puerto, '127.0.0.1', r));
  const base = `http://127.0.0.1:${puerto}${prefijoBase}`;
  const resultados = {};

  for (const { nombre, motor } of MOTORES) {
    let navegador;
    try {
      navegador = await motor.launch();
    } catch (e) {
      console.log(`\n### ${nombre}: no se pudo lanzar — ${e.message.split('\n')[0]}`);
      continue;
    }
    resultados[nombre] = {};
    console.log(`\n### ${nombre}`);

    for (const a of ANCHOS) {
      const contexto = await navegador.newContext({
        viewport: { width: a.width, height: a.height },
        reducedMotion: 'reduce',
      });
      const page = await contexto.newPage();
      const errores = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errores.push(m.text());
      });
      page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));

      await page.goto(base, { waitUntil: 'networkidle' });
      await page.addStyleTag({
        content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
      });
      await page.waitForSelector('[data-hero-state="ready"]', { timeout: 15000 }).catch(() => {});

      const alto = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < alto; y += 600) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await page.waitForTimeout(70);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      const datos = await page.evaluate(MEDIR);
      resultados[nombre][a.nombre] = { ...datos, errores };

      await page.screenshot({ path: path.join(dirSalida, `${nombre}-${a.nombre}.png`), fullPage: true });

      console.log(`  ${a.nombre}: alto ${datos.altoDocumento}px · ${datos.secciones} secciones · ` +
        `${datos.imagenesCargadas}/${datos.imagenes} imagenes · ${errores.length} error(es) de consola`);
      await contexto.close();
    }
    await navegador.close();
  }

  console.log('\n=== comparacion ===');
  const props = [
    ['altoDocumento', 'alto del documento'],
    ['overflowShell', 'overflow del armazon'],
    ['mascaraBodyAntes', 'mascara del fondo'],
    ['tamanoTitulo', 'titulo de seccion'],
    ['tamanoHero', 'titular del hero'],
    ['objectFitBus', 'ajuste de la imagen'],
  ];
  for (const [clave, etiqueta] of props) {
    const c = resultados.chromium?.['escritorio']?.[clave];
    const w = resultados.webkit?.['escritorio']?.[clave];
    const igual = String(c) === String(w);
    console.log(`  ${igual ? 'IGUAL    ' : 'DISTINTO '} ${etiqueta.padEnd(22)} chromium=${String(c).slice(0, 42)}  webkit=${String(w).slice(0, 42)}`);
  }

  const soporte = resultados.webkit?.['movil'] ?? {};
  console.log('\n=== soporte declarado por WebKit ===');
  for (const k of Object.keys(soporte).filter((k) => k.startsWith('soporta'))) {
    console.log(`  ${soporte[k] ? 'si' : 'NO'}  ${k.replace('soporta', '')}`);
  }

  fs.writeFileSync(path.join(dirSalida, 'resultado.json'), JSON.stringify(resultados, null, 2), 'utf8');
  console.log(`\nDetalle en ${path.join(dirSalida, 'resultado.json')}`);

  server.close();
};

main().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});
