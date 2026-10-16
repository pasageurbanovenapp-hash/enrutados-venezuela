/**
 * Captura visual de la landing de Enrutados Venezuela.
 *
 * Uso:
 *   node capturar.mjs <distDir> <outDir> [puerto] [modo]
 *
 * modo: "normal" (por defecto) o "reduce".
 *   "reduce" emula prefers-reduced-motion: reduce, lo que congela las
 *   animaciones del sitio y produce capturas deterministas. Es el modo que se
 *   usa para demostrar que un refactor no cambio nada visualmente.
 *
 * Sirve el build con un servidor estatico propio (sin dependencias) y toma
 * capturas con Playwright en tres anchos, mas una captura por seccion en
 * escritorio. Recorre la pagina antes de fotografiar para que las secciones
 * con revelado por scroll (IntersectionObserver) esten visibles.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve(process.argv[2] ?? '.');
const outDir = path.resolve(process.argv[3] ?? './capturas');
const port = Number(process.argv[4] ?? 4319);
const modo = process.argv[5] ?? 'normal';
const reducirMovimiento = modo === 'reduce';

/** Detecta la ruta base con la que se compilo el sitio, leyendo index.html.
 *  Con BASE_PATH=/enrutados-venezuela/ los assets cuelgan de ese prefijo. */
const prefijoBase = (() => {
  const html = path.join(distDir, 'index.html');
  if (!fs.existsSync(html)) return '/';
  const contenido = fs.readFileSync(html, 'utf8');
  const coincidencia = /(?:src|href)="(\/[^"]*?)(?:assets\/|favicon)/.exec(contenido);
  return coincidencia ? coincidencia[1] : '/';
})();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  // El build de produccion referencia los assets bajo la ruta base
  // (/enrutados-venezuela/). Si servimos en la raiz, hay que quitarla o la
  // pagina se captura sin CSS.
  const relativo = urlPath.startsWith(prefijoBase)
    ? urlPath.slice(prefijoBase.length - 1) || '/'
    : urlPath;
  let target = path.join(distDir, relativo);
  if (!target.startsWith(distDir)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, 'index.html');
  }
  if (!fs.existsSync(target)) {
    target = path.join(distDir, 'index.html');
  }
  const ext = path.extname(target).toLowerCase();
  res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});

const VIEWPORTS = [
  { name: 'movil', width: 390, height: 844, scale: 2, mobile: true },
  { name: 'tablet', width: 768, height: 1024, scale: 1, mobile: false },
  { name: 'escritorio', width: 1440, height: 900, scale: 1, mobile: false },
];

/** Espera a que la pagina este en un estado reproducible.
 *
 * El hero arranca en data-hero-state="entering" y pasa a "ready" por un
 * temporizador de 3 s. Sin esperar ese estado, cada captura fotografia un
 * instante distinto y la comparacion deja de ser valida.
 */
async function estabilizar(page) {
  // prefers-reduced-motion solo acorta las animaciones (.01ms), pero las que
  // son infinitas siguen girando y se fotografian en un punto arbitrario del
  // ciclo. Para comparar capturas hay que apagarlas del todo.
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
  });
  await page
    .waitForSelector('[data-hero-state="ready"]', { timeout: 20000 })
    .catch(() => console.log('aviso: el hero no alcanzo el estado "ready"'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
}

/** Espera a que todas las imagenes (incluidas las de carga diferida) terminen. */
async function esperarImagenes(page) {
  await page
    .waitForFunction(
      () => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
      { timeout: 20000 },
    )
    .catch(() => console.log('aviso: quedaron imagenes sin cargar'));
  await page.waitForTimeout(400);
}

/** Recorre la pagina para disparar los revelados por scroll. */
async function recorrerPagina(page) {
  const alto = await page.evaluate(() => document.body.scrollHeight);
  const paso = 600;
  for (let y = 0; y < alto; y += paso) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
}

const main = async () => {
  fs.mkdirSync(outDir, { recursive: true });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  // Hay que navegar respetando la ruta base: el enrutador del sitio la recibe
  // del build y, si no coincide, renderiza la pagina 404 aunque el HTML cargue.
  const base = `http://127.0.0.1:${port}${prefijoBase}`;
  console.log(`Sirviendo ${distDir} en ${base}`);

  const browser = await chromium.launch();
  const contexto = await browser.newContext({
    deviceScaleFactor: 1,
    reducedMotion: reducirMovimiento ? 'reduce' : 'no-preference',
  });
  const page = await contexto.newPage();
  console.log(`Modo: ${modo}${reducirMovimiento ? ' (animaciones congeladas)' : ''}`);

  const errores = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errores.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await estabilizar(page);
    await recorrerPagina(page);
    await esperarImagenes(page);
    await page.screenshot({
      path: path.join(outDir, `completa-${vp.name}.png`),
      fullPage: true,
    });
    console.log(`capturada: completa-${vp.name}.png`);
  }

  // Captura por seccion en escritorio, para revisar composicion con detalle.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await estabilizar(page);
  await recorrerPagina(page);
  await esperarImagenes(page);

  const secciones = await page.$$('main > section');
  for (let i = 0; i < secciones.length; i++) {
    const id = (await secciones[i].getAttribute('id')) ?? `sin-id-${i + 1}`;
    const clase = (await secciones[i].getAttribute('class')) ?? '';
    const etiqueta = `${String(i + 1).padStart(2, '0')}-${id}`.replace(/[^a-zA-Z0-9-_]/g, '');
    try {
      await secciones[i].scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await secciones[i].screenshot({
        path: path.join(outDir, `seccion-${etiqueta}.png`),
      });
      console.log(`capturada: seccion-${etiqueta}.png  (class="${clase}")`);
    } catch (e) {
      console.log(`no se pudo capturar la seccion ${i + 1}: ${e.message}`);
    }
  }

  const titulo = await page.title();
  const metricas = await page.evaluate(() => ({
    altoTotal: document.body.scrollHeight,
    secciones: document.querySelectorAll('main > section').length,
    imagenes: Array.from(document.images).map((i) => ({
      src: i.currentSrc || i.src,
      natural: `${i.naturalWidth}x${i.naturalHeight}`,
      alt: i.alt,
    })),
    h1: Array.from(document.querySelectorAll('h1')).map((h) => h.textContent.trim()),
    h2: Array.from(document.querySelectorAll('h2')).map((h) => h.textContent.trim()),
  }));

  fs.writeFileSync(
    path.join(outDir, 'informe.json'),
    JSON.stringify({ titulo, errores, metricas }, null, 2),
    'utf8',
  );

  console.log(`\nTitulo: ${titulo}`);
  console.log(`Errores de consola: ${errores.length}`);
  errores.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
  console.log(`Alto total (escritorio): ${metricas.altoTotal}px`);
  console.log(`Secciones: ${metricas.secciones}`);
  console.log(`Imagenes: ${metricas.imagenes.length}`);
  metricas.imagenes.forEach((i) => console.log(`  - ${i.natural}  alt="${i.alt}"  ${i.src}`));

  await browser.close();
  server.close();
};

main().catch(async (e) => {
  console.error(e);
  server.close();
  process.exit(1);
});
