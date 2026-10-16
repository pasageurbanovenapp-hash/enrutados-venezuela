#!/usr/bin/env node
// diagnosticar-overflow-landing.mjs  (v2 - corregido)
// Comprobacion definitiva del posible desbordamiento a 320 px entre main y
// modernizacion-landing, usando las compilaciones existentes (dist/public).
//
// Uso:
//   node diagnosticar-overflow-landing.mjs <distMain> <distCandidata> [--out reporte.json] [--base /enrutados-venezuela/] [--width 320]
//
// Cambios respecto a v1:
//   - Las mediciones ahora se invocan correctamente ('(' + fn + ')()').
//   - El servidor estatico quita el prefijo BASE antes de resolver archivos.
//   - El resumen protege rutas opcionales (?. ) para no romper con paginas vacias.
//   - La simulacion de padding usa las clases reales (.ecosystem-phone-stage).
//
// No modifica archivos del proyecto ni de los worktrees.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------- args
const args = process.argv.slice(2);
const positional = [];
let OUT = null;
let BASE = '/enrutados-venezuela/';
let WIDTH = 320;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') OUT = args[++i];
  else if (a === '--base') BASE = args[i].endsWith('/') ? args[i] : args[i] + '/';
  else if (a === '--width') WIDTH = parseInt(args[++i], 10);
  else positional.push(a);
}
const [DIST_MAIN, DIST_CAND] = positional;

function fail(msg) {
  console.error('\n[ERROR] ' + msg);
  process.exit(1);
}
if (!DIST_MAIN || !DIST_CAND) {
  fail('Faltan argumentos.\nUso: node diagnosticar-overflow-landing.mjs <distMain> <distCandidata> [--out reporte.json]');
}
for (const [nombre, dir] of [['main', DIST_MAIN], ['candidata', DIST_CAND]]) {
  if (!fs.existsSync(path.join(dir, 'index.html'))) {
    fail(`No se encontro index.html en el dist de ${nombre}:\n  ${dir}\n` +
      'Si %TEMP% fue limpiado, hay que recrear los worktrees y recompilar ambos SHA.');
  }
}

// ---------------------------------------------------------------- playwright
async function loadPlaywright() {
  const guesses = [];
  if (process.env.PLAYWRIGHT_ENTRY) guesses.push(process.env.PLAYWRIGHT_ENTRY);
  const tools = path.join(os.tmpdir(), 'enrutados-visual-validation', 'visual-tools', 'node_modules', 'playwright');
  guesses.push(path.join(tools, 'index.js'), path.join(tools, 'index.mjs'));
  guesses.push('playwright');
  let lastErr = null;
  for (const g of guesses) {
    try {
      const spec = g === 'playwright' ? g : pathToFileURL(g).href;
      const mod = await import(spec);
      const pw = mod.default && mod.default.chromium ? mod.default : mod;
      if (pw.chromium) return { chromium: pw.chromium, source: g };
    } catch (e) { lastErr = e; }
  }
  fail('No se pudo cargar playwright. Instalalo temporalmente asi:\n' +
    '  npm install --prefix $tools --no-save --no-package-lock playwright\n' +
    '  ($env:PLAYWRIGHT_BROWSERS_PATH = ...; node ...\\playwright\\cli.js install chromium)\n' +
    `Ultimo error: ${lastErr && lastErr.message}`);
}

// ---------------------------------------------------------------- servidor estatico
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json'
};
function serveDir(rootDir, basePath) {
  const rootNorm = path.normalize(rootDir);
  const prefix = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath; // '/enrutados-venezuela'
  const server = http.createServer((req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (prefix && (p === prefix || p.startsWith(prefix + '/'))) {
        p = p.slice(prefix.length) || '/';
      }
      if (p.endsWith('/')) p += 'index.html';
      const file = path.normalize(path.join(rootNorm, p));
      if (!file.startsWith(rootNorm)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
      });
    } catch { res.writeHead(400); res.end(); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () =>
    resolve({ server, port: server.address().port })));
}

// ---------------------------------------------------------------- mediciones
// Sin envoltorio de funcion: se invoca como expresion con '()' al evaluar.
const MEASURE_JS = `(() => {
  const vw = window.innerWidth;
  const doc = document.documentElement;
  const pick = (el) => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 120),
      left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
      clientWidth: el.clientWidth, scrollWidth: el.scrollWidth
    };
  };
  const containers = [];
  for (const sel of ['.site-shell', '.wrap', '.ecosystem', '.ecosystem__grid',
                     '.ecosystem__tabs', '.ecosystem-phone-stage', '.ecosystem-phone']) {
    const el = document.querySelector(sel);
    containers.push({ selector: sel, found: !!el, ...(el ? pick(el) : {}) });
  }
  const grid = document.querySelector('.ecosystem__grid');
  let gridInfo = null;
  if (grid) {
    const gr = grid.getBoundingClientRect();
    const children = Array.from(grid.children).map(c => {
      const r = c.getBoundingClientRect();
      return { cls: (typeof c.className === 'string' ? c.className : '').slice(0, 120),
               width: Math.round(r.width), right: Math.round(r.right),
               minWidth: getComputedStyle(c).minWidth };
    });
    const maxChildRight = children.length ? Math.max(...children.map(c => c.right)) : Math.round(gr.right);
    gridInfo = {
      width: Math.round(gr.width), left: Math.round(gr.left), right: Math.round(gr.right),
      clientWidth: grid.clientWidth, scrollWidth: grid.scrollWidth,
      maxChildRight,
      internalOverflowPx: Math.max(0, maxChildRight - Math.round(gr.right)),
      children
    };
  }
  const overflowing = Array.from(document.querySelectorAll('body *'))
    .map(el => ({ el, r: el.getBoundingClientRect() }))
    .filter(x => x.r.width > 0 && (x.r.right > vw + 1 || x.r.left < -1))
    .slice(0, 40)
    .map(x => pick(x.el));
  return {
    viewportWidth: vw,
    documentScrollWidth: doc.scrollWidth,
    documentClientWidth: doc.clientWidth,
    horizontalScroll: doc.scrollWidth > doc.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    containers, gridInfo,
    overflowingCount: overflowing.length,
    overflowing
  };
})()`;

async function autoscroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let y = 0;
      const step = () => {
        y += Math.round(window.innerHeight * 0.8);
        window.scrollTo(0, y);
        if (y < document.documentElement.scrollHeight) setTimeout(step, 60);
        else resolve();
      };
      step();
    });
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
}

async function medirBuild(browser, nombre, distDir, base, width, sims) {
  const { server, port } = await serveDir(distDir, base);
  const url = `http://127.0.0.1:${port}${base}`;
  const context = await browser.newContext({ viewport: { width, height: 844 } });
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('CONSOLE ' + m.text().slice(0, 200)); });
  page.on('response', r => { if (r.status() >= 400) errores.push(`HTTP ${r.status()} ${r.url().slice(-80)}`); });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
    await autoscroll(page);

    const baseMeasure = await page.evaluate(MEASURE_JS);

    // Sim 1: quitar padding horizontal de la etapa del telefono (sin tocar archivos)
    let simPadding = null;
    if (sims.includes('padding')) {
      const touched = await page.evaluate(() => {
        const sels = ['.ecosystem-phone-stage', '.ecosystem-phone', '.ecosystem__stage'];
        const t = [];
        for (const sel of sels) {
          for (const el of document.querySelectorAll(sel)) {
            t.push({ sel, cls: (typeof el.className === 'string' ? el.className : '').slice(0, 120) });
            el.style.paddingLeft = '0px';
            el.style.paddingRight = '0px';
          }
        }
        return t;
      });
      await page.waitForTimeout(120);
      const measure = await page.evaluate(MEASURE_JS);
      await page.evaluate(() => {
        for (const sel of ['.ecosystem-phone-stage', '.ecosystem-phone', '.ecosystem__stage']) {
          for (const el of document.querySelectorAll(sel)) { el.style.paddingLeft = ''; el.style.paddingRight = ''; }
        }
      });
      simPadding = { selectoresAfectados: touched, medida: measure };
    }

    // Sim 2: variar min-width:0 para aislar la causa
    let simMinWidth = null;
    if (sims.includes('minwidth-auto') || sims.includes('minwidth-zero')) {
      const css = sims.includes('minwidth-auto')
        ? '.ecosystem__grid > * { min-width: auto !important; }'
        : '.ecosystem__grid > * { min-width: 0 !important; }';
      const tag = await page.addStyleTag({ content: css });
      await page.waitForTimeout(120);
      const measure = await page.evaluate(MEASURE_JS);
      await tag.evaluate(el => el.remove()).catch(() => {});
      simMinWidth = { cssAplicado: css, medida: measure };
    }

    return {
      nombre, distDir, url, viewportWidth: width,
      medicionReal: baseMeasure,
      simulaciones: {
        quitarPaddingEtapaTelefono: simPadding,
        variacionMinWidth: simMinWidth
      },
      erroresPagina: errores
    };
  } finally {
    await context.close().catch(() => {});
    server.close();
  }
}

// ---------------------------------------------------------------- main
const { chromium, source } = await loadPlaywright();
console.error(`[info] playwright cargado desde: ${source}`);
console.error('[info] lanzando chromium headless...');
const browser = await chromium.launch({ headless: true });

console.error(`[info] midiendo main (${DIST_MAIN}) a ${WIDTH}px...`);
const main = await medirBuild(browser, 'main', DIST_MAIN, BASE, WIDTH, ['padding', 'minwidth-zero']);
console.error(`[info] midiendo candidata (${DIST_CAND}) a ${WIDTH}px...`);
const cand = await medirBuild(browser, 'modernizacion-landing', DIST_CAND, BASE, WIDTH, ['padding', 'minwidth-auto']);

await browser.close();

const gridOverflow = (r) => r?.medicionReal?.gridInfo?.internalOverflowPx ?? null;
const simGridOverflow = (r) => r?.simulaciones?.variacionMinWidth?.medida?.gridInfo?.internalOverflowPx ?? null;
const comparacion = {
  documentScrollWidth: { main: main.medicionReal.documentScrollWidth, candidata: cand.medicionReal.documentScrollWidth },
  barraHorizontalReal: { main: main.medicionReal.horizontalScroll, candidata: cand.medicionReal.horizontalScroll },
  gridInternalOverflowPx: { main: gridOverflow(main), candidata: gridOverflow(cand) },
  elementosFueraDeViewport: { main: main.medicionReal.overflowingCount, candidata: cand.medicionReal.overflowingCount },
  simMinWidth: {
    mainConMinWidth0: simGridOverflow(main),
    candidataSinMinWidth0: simGridOverflow(cand)
  },
  nota: 'Si candidataSinMinWidth0 reproduce el desbordamiento de main y mainConMinWidth0 lo elimina, la causa es la regla min-width:0 de ecosystem.css: la candidata corrige un problema preexistente de main, no introduce una regresion. Resultados neutros: no se modifican archivos.'
};

const reporte = {
  herramienta: 'diagnosticar-overflow-landing.mjs (v2)',
  generadoEn: new Date().toISOString(),
  shaComparados: {
    main: '09268d1bfce09daec726fa6a1ff6f59a6794122e',
    modernizacionLanding: '41c675a6545b5074caef1cd30a18e618070e5032'
  },
  viewport: { width: WIDTH, height: 844 },
  basePath: BASE,
  comparacion,
  main,
  candidata: cand
};

const json = JSON.stringify(reporte, null, 2);
if (OUT) {
  fs.writeFileSync(OUT, json, 'utf8');
  console.error(`[ok] reporte escrito en: ${OUT}`);
}
console.log(json);
