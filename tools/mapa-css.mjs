/**
 * Mapa de bloques de nivel superior de un archivo CSS.
 *
 * Uso:
 *   node mapa-css.mjs <archivo.css>
 *
 * Imprime, en orden, cada bloque de nivel superior con su rango de lineas y su
 * selector. Sirve para decidir cortes contiguos sin alterar el orden de cascada.
 */
import fs from 'node:fs';

const archivo = process.argv[2];
const texto = fs.readFileSync(archivo, 'utf8');
const lineas = texto.split(/\r?\n/);

let profundidad = 0;
let inicio = null;
let buffer = '';
const bloques = [];

const limpiar = (s) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);

for (let i = 0; i < lineas.length; i++) {
  const linea = lineas[i];
  const sinComentario = linea.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const abre = (sinComentario.match(/\{/g) ?? []).length;
  const cierra = (sinComentario.match(/\}/g) ?? []).length;

  if (profundidad === 0 && abre > 0 && inicio === null) {
    inicio = i + 1;
    buffer = '';
  }
  if (inicio !== null) buffer += linea + ' ';

  profundidad += abre - cierra;

  if (profundidad <= 0 && inicio !== null) {
    bloques.push({ desde: inicio, hasta: i + 1, selector: limpiar(buffer) });
    profundidad = 0;
    inicio = null;
    buffer = '';
  }
}

console.log(`Archivo: ${archivo}`);
console.log(`Lineas totales: ${lineas.length}`);
console.log(`Bloques de nivel superior: ${bloques.length}\n`);
console.log('  #  lineas        selector');
for (let i = 0; i < bloques.length; i++) {
  const b = bloques[i];
  const rango = `${b.desde}-${b.hasta}`.padEnd(13);
  console.log(`${String(i + 1).padStart(3)}  ${rango} ${b.selector}`);
}
