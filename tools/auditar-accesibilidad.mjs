/**
 * Auditoria de accesibilidad con axe-core.
 *
 * Uso:
 *   node auditar-accesibilidad.mjs <distDir> [puerto]
 *
 * Revisa la pagina en tres anchos siguiendo las reglas WCAG 2.1 nivel AA mas las
 * buenas practicas, y agrupa los hallazgos por gravedad. Escribe ademas un JSON
 * con el detalle para poder comparar entre rondas.
 *
 * Requiere @axe-core/playwright y playwright instalados aparte (ver README).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const distDir = path.resolve(process.argv[2] ?? '.');
const puerto = Number(process.argv[3] ?? 4469);
const salidaJson = process.argv[4];

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
  { nombre: 'movil', width: 390, height: 844 },
  { nombre: 'tablet', width: 768, height: 1024 },
  { nombre: 'escritorio', width: 1440, height: 900 },
];

const ORDEN = ['critical', 'serious', 'moderate', 'minor'];

const main = async () => {
  await new Promise((r) => server.listen(puerto, '127.0.0.1', r));
  const base = `http://127.0.0.1:${puerto}${prefijoBase}`;
  const browser = await chromium.launch();
  const acumulado = {};

  for (const a of ANCHOS) {
    const contexto = await browser.newContext({
      viewport: { width: a.width, height: a.height },
      reducedMotion: 'reduce',
    });
    const page = await contexto.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });
    await page.waitForSelector('[data-hero-state="ready"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(400);

    // Estado por defecto.
    const res = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    console.log(`\n=== ${a.nombre} (${a.width}px) — ${res.violations.length} reglas incumplidas ===`);

    for (const v of res.violations) {
      const clave = `${v.id}|${v.impact}`;
      acumulado[clave] ??= { id: v.id, impacto: v.impact, ayuda: v.help, paginas: new Set(), nodos: [] };
      acumulado[clave].paginas.add(a.nombre);
      for (const n of v.nodes) {
        if (!acumulado[clave].nodos.some((x) => x.selector === n.target.join(' '))) {
          acumulado[clave].nodos.push({ selector: n.target.join(' '), resumen: (n.failureSummary ?? '').split('\n').slice(0, 3).join(' | ') });
        }
      }
    }

    const porImpacto = {};
    for (const v of res.violations) (porImpacto[v.impact ?? 'sin-clasificar'] ??= []).push(v);
    for (const imp of ORDEN) {
      if (!porImpacto[imp]) continue;
      for (const v of porImpacto[imp]) {
        console.log(`  [${imp}] ${v.id} — ${v.help} (${v.nodes.length} elemento/s)`);
        for (const n of v.nodes.slice(0, 3)) {
          console.log(`      ${n.target.join(' ')}`);
        }
        if (v.nodes.length > 3) console.log(`      ... y ${v.nodes.length - 3} mas`);
      }
    }
    if (res.violations.length === 0) console.log('  sin hallazgos');

    // Resumen de reglas que SI pasan, para saber que se esta comprobando.
    console.log(`  (reglas superadas: ${res.passes.length}, incompletas: ${res.incomplete.length})`);

    await contexto.close();
  }

  const salida = Object.values(acumulado).map((v) => ({
    id: v.id,
    impacto: v.impacto,
    ayuda: v.ayuda,
    anchos: [...v.paginas],
    nodos: v.nodos,
  }));

  const resumen = ORDEN.map((imp) => {
    const reglas = salida.filter((s) => s.impacto === imp);
    const nodos = reglas.reduce((t, r) => t + r.nodos.length, 0);
    return `  ${imp.padEnd(9)} ${String(reglas.length).padStart(2)} regla(s), ${nodos} elemento(s)`;
  });
  console.log('\n=== resumen por gravedad ===');
  resumen.forEach((l) => console.log(l));
  console.log(`  TOTAL: ${salida.length} reglas incumplidas`);

  if (salidaJson) {
    fs.writeFileSync(salidaJson, JSON.stringify(salida, null, 2), 'utf8');
    console.log(`\nDetalle escrito en ${salidaJson}`);
  }

  await browser.close();
  server.close();
};

main().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});
