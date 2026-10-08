/**
 * Convierte la tarjeta social (SVG) en PNG de 1200x630.
 *
 * Uso:
 *   node tarjeta-social.mjs <entrada.svg> <salida.png>
 *
 * Las redes sociales no admiten SVG en las etiquetas de vista previa, asi que
 * el SVG se rasteriza con Chromium. Se aplican las tipografias reales del sitio
 * (DM Sans y Space Mono) en lugar de las familias genericas del SVG original.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';

const svgPath = path.resolve(process.argv[2]);
const outPath = path.resolve(process.argv[3]);
const ancho = 1200;
const alto = 630;

let svg = fs.readFileSync(svgPath, 'utf8');
svg = svg.replace(/<\?xml[^>]*\?>/g, '').trim();
svg = svg.replace(/font-family="sans-serif"/g, 'font-family="DM Sans, sans-serif"');
svg = svg.replace(/font-family="monospace"/g, 'font-family="Space Mono, monospace"');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@700&display=swap" rel="stylesheet" />
<style>
  html, body { margin: 0; padding: 0; width: ${ancho}px; height: ${alto}px; overflow: hidden; }
  svg { display: block; }
</style>
</head>
<body>${svg}</body>
</html>`;

const tmpHtml = path.join(os.tmpdir(), `tarjeta-social-${Date.now()}.html`);
fs.writeFileSync(tmpHtml, html, 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: ancho, height: alto },
  deviceScaleFactor: 1,
});

await page.goto(`file:///${tmpHtml.replace(/\\/g, '/')}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: ancho, height: alto } });
await browser.close();
fs.rmSync(tmpHtml, { force: true });

const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`Tarjeta generada: ${outPath} (${ancho}x${alto}, ${kb} kB)`);
