/**
 * Aplica la escala tipografica y el ritmo vertical a los modulos de estilo.
 *
 * Uso:
 *   node aplicar-escala.mjs <dirEstilos>
 *
 * Reemplaza los valores sueltos por tokens de la escala. Si encuentra un
 * font-size que no esta en el mapa, lo reporta en vez de inventar un mapeo:
 * nada debe quedar fuera de control.
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2]);
const EXCLUIR = new Set(['tokens.css', 'fonts.css']);

const FS = {
  '0.7rem': 'var(--fs-label)',
  '0.72rem': 'var(--fs-label)',
  '0.75rem': 'var(--fs-label)',
  '0.76rem': 'var(--fs-label)',
  '0.78rem': 'var(--fs-label)',
  '0.82rem': 'var(--fs-sm)',
  '0.83rem': 'var(--fs-sm)',
  '0.84rem': 'var(--fs-sm)',
  '0.86rem': 'var(--fs-sm)',
  '0.88rem': 'var(--fs-sm)',
  '0.9rem': 'var(--fs-sm)',
  '0.92rem': 'var(--fs-sm)',
  '0.95rem': 'var(--fs-base)',
  '0.98rem': 'var(--fs-base)',
  '1rem': 'var(--fs-base)',
  '1.02rem': 'var(--fs-base)',
  '1.05rem': 'var(--fs-md)',
  '1.1rem': 'var(--fs-md)',
  '1.14rem': 'var(--fs-md)',
  '1.15rem': 'var(--fs-md)',
  '1.3rem': 'var(--fs-lg)',
  '1.35rem': 'var(--fs-lg)',
  '1.55rem': 'var(--fs-xl)',
  '1.6rem': 'var(--fs-xl)',
  '1.65rem': 'var(--fs-xl)',
  '9px': 'var(--fs-label)',
  '10px': 'var(--fs-label)',
  '11px': 'var(--fs-label)',
  '12px': 'var(--fs-label)',
  '13px': 'var(--fs-label)',
  '15px': 'var(--fs-sm)',
};

const CLAMP = {
  'clamp(2.35rem, 5vw, 4.7rem)': 'var(--fs-title)',
  'clamp(1.75rem, 4vw, 3.4rem)': 'var(--fs-title)',
  'clamp(2rem, 5vw, 3.8rem)': 'var(--fs-title)',
  'clamp(3.5rem, 7vw, 7.3rem)': 'var(--fs-hero)',
  'clamp(3.35rem, 17vw, 5.2rem)': 'var(--fs-hero)',
};

// Reemplazos literales, en orden. Se aplican antes del mapeo general.
const LITERALES = [
  // El hero-lede comparte el paso md del cuerpo y respira mas.
  ['font-size: 1.14rem; line-height: 1.6;', 'font-size: var(--fs-md); line-height: var(--lh-relaxed);'],
  // Ritmo vertical de seccion: un valor por punto de quiebre.
  ['padding: 130px 0;', 'padding: var(--section-y) 0;'],
  ['padding: 120px 0 70px;', 'padding: var(--section-y) 0 var(--sp-9);'],
  ['padding: 82px 0;', 'padding: var(--section-y-sm) 0;'],
  ['padding: 82px 0 50px;', 'padding: var(--section-y-sm) 0 var(--sp-8);'],
  // El cuerpo de seccion tambien respira mas.
  ['line-height: 1.65;', 'line-height: var(--lh-relaxed);'],
];

const normalizar = (v) => (v.startsWith('.') ? `0${v}` : v).trim();

let totalFS = 0;
let totalLiteral = 0;
const sinMapear = [];

for (const archivo of fs.readdirSync(dir).filter((f) => f.endsWith('.css') && !EXCLUIR.has(f))) {
  const ruta = path.join(dir, archivo);
  let texto = fs.readFileSync(ruta, 'utf8');
  const original = texto;
  let cambios = 0;

  for (const [de, a] of LITERALES) {
    if (texto.includes(de)) {
      texto = texto.split(de).join(a);
      cambios++;
      totalLiteral++;
    }
  }

  // font-size: valor;
  texto = texto.replace(/font-size:\s*([^;]+);/g, (todo, valor) => {
    const v = valor.trim();
    // Ya esta tokenizado por un reemplazo literal previo.
    if (v.startsWith('var(--fs')) return todo;
    const destino = CLAMP[v] ?? FS[normalizar(valor)];
    if (!destino) {
      sinMapear.push(`${archivo}: font-size: ${v}`);
      return todo;
    }
    totalFS++;
    return `font-size: ${destino};`;
  });

  // font: <peso> <tamano> '<familia>';
  texto = texto.replace(
    /font:\s*(\d{3})\s+([\d.]+(?:px|rem))\s*(\/\s*[\d.]+)?\s*('Space Mono'[^;]*);/g,
    (todo, peso, tamano, altura, familia) => {
      const destino = FS[normalizar(tamano)];
      if (!destino) {
        sinMapear.push(`${archivo}: font: ${peso} ${tamano}`);
        return todo;
      }
      totalFS++;
      return `font: ${peso} ${destino}${altura ?? ''} ${familia};`;
    },
  );

  if (texto !== original) {
    fs.writeFileSync(ruta, texto, 'utf8');
    console.log(`  ${archivo.padEnd(22)} ${cambios} bloque(s) literal(es)`);
  }
}

console.log(`\nDeclaraciones tipograficas normalizadas: ${totalFS}`);
console.log(`Reemplazos de ritmo aplicados: ${totalLiteral}`);

if (sinMapear.length) {
  console.log(`\nSIN MAPEAR (revisar antes de continuar): ${sinMapear.length}`);
  for (const s of sinMapear) console.log(`  - ${s}`);
} else {
  console.log('\nTodos los tamanos quedaron dentro de la escala.');
}
