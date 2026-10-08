/**
 * Revisa que ningun tamano de fuente escape del sistema.
 *
 * Uso:
 *   node revisar-escala.mjs <dirSrc>
 *
 * Comprueba dos cosas:
 *   1. En los CSS: que cada font-size use un token var(--fs-*).
 *   2. En el TSX: que no se usen utilidades de tamano de Tailwind, ni con
 *      valores arbitrarios (text-[9px]) ni con su propia escala (text-sm,
 *      text-2xl). Tailwind tiene su escala y el proyecto tiene la suya: mezclar
 *      las dos es como no tener ninguna.
 *
 * Existe porque la primera version de la verificacion solo miraba los CSS y se
 * le escaparon unas 30 utilidades dentro de un componente.
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(process.argv[2] ?? './src');

// El limite final va con lookahead y no con \b: despues de un corchete de cierre
// no hay frontera de palabra, asi que \b dejaba fuera valores como text-[9px].
const UTILIDADES_TAILWIND =
  /\btext-(?:\[[^\]]+\]|xs|sm|base|lg|xl|[2-9]xl)(?![-\w])/g;

const recorrer = (dir) => {
  const salida = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) salida.push(...recorrer(p));
    else if (/\.(css|tsx|ts)$/.test(e.name)) salida.push(p);
  }
  return salida;
};

const cssFuera = [];
const twFuera = [];
let totalCss = 0;

for (const archivo of recorrer(raiz)) {
  const rel = path.relative(raiz, archivo).replace(/\\/g, '/');
  const texto = fs.readFileSync(archivo, 'utf8');
  const lineas = texto.split(/\r?\n/);

  // Los propios tokens definen la escala: no se revisan.
  if (rel === 'styles/tokens.css') continue;

  lineas.forEach((linea, i) => {
    if (archivo.endsWith('.css')) {
      const m = /font-size:\s*([^;]+);/.exec(linea);
      if (m) {
        totalCss++;
        if (!m[1].trim().startsWith('var(--fs')) {
          cssFuera.push(`${rel}:${i + 1}  font-size: ${m[1].trim()}`);
        }
      }
      const f = /\bfont:\s*\d{3}\s+([^;\s]+)/.exec(linea);
      if (f && !f[1].startsWith('var(--fs')) {
        cssFuera.push(`${rel}:${i + 1}  font: ... ${f[1]}`);
      }
    } else {
      const encontrados = linea.match(UTILIDADES_TAILWIND);
      if (encontrados) {
        twFuera.push(`${rel}:${i + 1}  ${[...new Set(encontrados)].join(', ')}`);
      }
    }
  });
}

console.log('=== tamanos fuera de la escala en CSS ===');
if (cssFuera.length === 0) console.log(`  ninguno (${totalCss} declaraciones revisadas)`);
else cssFuera.forEach((l) => console.log(`  ${l}`));

console.log('\n=== utilidades de tamano de Tailwind en componentes ===');
if (twFuera.length === 0) console.log('  ninguna');
else {
  console.log(`  ${twFuera.length} linea(s) afectadas:`);
  twFuera.forEach((l) => console.log(`  ${l}`));
}

console.log(`\nTOTAL de escapes: ${cssFuera.length + twFuera.length}`);
