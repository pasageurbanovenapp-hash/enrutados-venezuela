/**
 * Autoaloja las tipografias del sitio.
 *
 * Uso:
 *   node autoalojar-fuentes.mjs <dirDestinoFuentes> <archivoCssSalida>
 *
 * Descarga los .woff2 que sirve Google Fonts, los guarda en el proyecto y
 * genera un CSS con @font-face locales. El objetivo es quitar de la ruta
 * critica la peticion externa a fonts.googleapis.com, que hoy bloquea el
 * primer pintado.
 *
 * Las rutas url() son relativas al archivo CSS de salida, para que Vite las
 * procese, les ponga hash y respete la ruta base del despliegue.
 */
import fs from 'node:fs';
import path from 'node:path';

const dirFuentes = path.resolve(process.argv[2]);
const archivoCss = path.resolve(process.argv[3]);

const FAMILIAS = [
  'family=DM+Sans:wght@400;500;600;700',
  'family=Space+Mono:wght@400;700',
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const url = `https://fonts.googleapis.com/css2?${FAMILIAS.join('&')}&display=swap`;

const respuesta = await fetch(url, { headers: { 'User-Agent': UA } });
if (!respuesta.ok) throw new Error(`Google Fonts respondio ${respuesta.status}`);
const css = await respuesta.text();

const bloques = [...css.matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)];
if (bloques.length === 0) throw new Error('No se encontro ningun @font-face en la respuesta');

fs.mkdirSync(dirFuentes, { recursive: true });
await fs.promises.mkdir(path.dirname(archivoCss), { recursive: true });

const salida = [];
const descargados = [];
const porHuella = new Map();
const crypto = await import('node:crypto');

for (const [, subset, cuerpo] of bloques) {
  const familia = /font-family:\s*'([^']+)'/.exec(cuerpo)?.[1];
  const peso = /font-weight:\s*([\d]+)/.exec(cuerpo)?.[1];
  const estilo = /font-style:\s*(\w+)/.exec(cuerpo)?.[1] ?? 'normal';
  const rango = /unicode-range:\s*([^;]+);/.exec(cuerpo)?.[1];
  const urlFuente = /url\((https:[^)]+\.woff2)\)/.exec(cuerpo)?.[1];
  if (!familia || !peso || !urlFuente) continue;

  const bin = await fetch(urlFuente, { headers: { 'User-Agent': UA } });
  if (!bin.ok) throw new Error(`No se pudo descargar ${urlFuente}: ${bin.status}`);
  const buffer = Buffer.from(await bin.arrayBuffer());
  const huella = crypto.createHash('sha256').update(buffer).digest('hex');

  // Las fuentes variables sirven el mismo archivo para varios grosores. Se
  // guarda una sola copia y las demas reglas apuntan a ella.
  let nombre = porHuella.get(huella);
  if (nombre) {
    descargados.push({ nombre, kb: 0, repetido: true });
  } else {
    nombre = `${familia.toLowerCase().replace(/\s+/g, '-')}-${peso}-${subset.trim()}.woff2`;
    const destino = path.join(dirFuentes, nombre);
    fs.writeFileSync(destino, buffer);
    porHuella.set(huella, nombre);
    descargados.push({ nombre, kb: (buffer.length / 1024).toFixed(1), repetido: false });
  }

  const destino = path.join(dirFuentes, nombre);
  // Ruta relativa desde el CSS de salida hasta el archivo de fuente.
  const relativa = path
    .relative(path.dirname(archivoCss), destino)
    .replace(/\\/g, '/');

  salida.push(
    [
      `/* ${familia} ${peso} ${estilo} - ${subset.trim()} */`,
      '@font-face {',
      `  font-family: '${familia}';`,
      `  font-style: ${estilo};`,
      `  font-weight: ${peso};`,
      '  font-display: swap;',
      `  src: url('${relativa}') format('woff2');`,
      rango ? `  unicode-range: ${rango.trim()};` : null,
      '}',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

const cabecera = `/* ==========================================================================
   Tipografias autoalojadas
   Generado por tools/autoalojar-fuentes.mjs. No editar a mano.
   Se sirven desde el propio dominio para no bloquear el primer pintado con
   una peticion a fonts.googleapis.com.
   ========================================================================== */\n\n`;

fs.writeFileSync(archivoCss, cabecera + salida.join('\n\n') + '\n', 'utf8');

console.log(`Familias procesadas: ${new Set(bloques.map((b) => b[1])).size} subconjuntos`);
console.log(`Fuentes descargadas en ${dirFuentes}:`);
let total = 0;
const unicos = new Set();
for (const d of descargados) {
  if (d.repetido) {
    console.log(`  ${d.nombre.padEnd(42)} ${'(mismo archivo)'.padStart(15)}`);
    continue;
  }
  unicos.add(d.nombre);
  total += Number(d.kb);
  console.log(`  ${d.nombre.padEnd(42)} ${d.kb.padStart(10)} kB`);
}
console.log(`\nArchivos unicos: ${unicos.size} | peso total: ${total.toFixed(1)} kB`);
console.log(`CSS generado: ${archivoCss}`);
