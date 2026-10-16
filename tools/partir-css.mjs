/**
 * Parte src/index.css en modulos por responsabilidad, preservando el orden.
 *
 * Uso:
 *   node partir-css.mjs <ruta index.css>
 *
 * Regla de oro: los cortes son RANGOS CONTIGUOS del archivo original. Nunca se
 * reordena una regla, porque el archivo tiene overrides tardios que dependen del
 * orden de cascada (ver refinements.css y how-it-works.css).
 *
 * El nuevo index.css queda solo con las sentencias @import, que es lo unico que
 * CSS permite antes de las reglas.
 */
import fs from 'node:fs';
import path from 'node:path';

const entrada = path.resolve(process.argv[2]);
const dirSrc = path.dirname(entrada);
const dirEstilos = path.join(dirSrc, 'styles');

const original = fs.readFileSync(entrada, 'utf8').split(/\r?\n/);

// Rango de lineas 1-indexado e inclusivo.
const RANGOS = [
  ['tokens', 5, 48, 'Tokens de diseno: escala tipografica de Tailwind y variables CSS del sistema.'],
  ['base', 50, 112, 'Reinicio, fondo del documento, foco visible y utilidades base (.wrap, .eyebrow, .section-title).'],
  ['layout', 113, 173, 'Barra superior, marca, navegacion y boton de menu.'],
  ['hero', 174, 562, 'Hero y escena cinematografica del autobus, con sus animaciones.'],
  ['proof-band', 563, 568, 'Banda de datos bajo el hero.'],
  ['problem', 569, 573, 'Seccion del problema.'],
  ['sections', 574, 575, 'Andamiaje generico de seccion (.section, .section-intro).'],
  ['audiences', 576, 604, 'Tarjetas de los tres actores.'],
  ['contact', 605, 615, 'Seccion de contacto y formulario.'],
  ['footer', 616, 620, 'Pie de pagina.'],
  ['motion', 621, 624, 'Revelado por scroll y ajuste de apilamiento del hero.'],
  ['responsive', 626, 685, 'Consultas de medios globales: movimiento reducido y puntos de quiebre de 900 y 680 px.'],
  ['route-line', 693, 948, 'Sistema visual Linea de Ruta: variables, linea, nodos y momentos.'],
  ['ecosystem', 956, 1252, 'Seccion Ecosistema: pestanas por actor y maqueta de telefono.'],
  ['refinements', 1255, 1304, 'Ajustes posteriores sobre Audiences y Ecosystems. Depende del orden: debe ir despues de ecosystem.css.'],
  ['journey', 1311, 1513, 'Seccion Journey: tres momentos sobre la Linea de Ruta.'],
  ['chapter-break', 1519, 1602, 'Banda visual de transicion entre Problem y Audiences.'],
  ['how-it-works', 1605, 1642, 'Titulo por momento y nota final de How it works. Depende del orden: va despues de journey.css.'],
  ['operations', 1649, 1850, 'Cabina de operacion: metricas y capacidades.'],
  ['contact-channels', 1853, 1897, 'Canal de contacto alterno (WhatsApp).'],
  ['honesty', 1903, 2022, 'Seccion de honestidad.'],
  ['faq', 2028, 2115, 'Preguntas frecuentes.'],
];

fs.mkdirSync(dirEstilos, { recursive: true });

const cabecera = (titulo) =>
  `/* ==========================================================================\n   ${titulo}\n   ========================================================================== */\n`;

const escritos = [];
for (const [nombre, desde, hasta, titulo] of RANGOS) {
  const cuerpo = original.slice(desde - 1, hasta).join('\n').replace(/\s+$/, '');
  const destino = path.join(dirEstilos, `${nombre}.css`);
  fs.writeFileSync(destino, `${cabecera(titulo)}\n${cuerpo}\n`, 'utf8');
  escritos.push({ nombre, desde, hasta, lineas: hasta - desde + 1 });
}

const importaciones = original.slice(0, 3).join('\n');
const nuevas = RANGOS.map(([nombre]) => `@import './styles/${nombre}.css';`).join('\n');

fs.writeFileSync(
  entrada,
  `${importaciones}\n\n/* Modulos de estilo, en el mismo orden que el archivo original.\n   El orden importa: hay ajustes posteriores que dependen del orden de cascada. */\n${nuevas}\n`,
  'utf8',
);

console.log(`Modulos escritos en ${dirEstilos}\n`);
let suma = 0;
for (const e of escritos) {
  suma += e.lineas;
  console.log(`  ${e.nombre.padEnd(18)} lineas ${String(e.desde).padStart(4)}-${String(e.hasta).padEnd(4)} (${e.lineas})`);
}
console.log(`\nLineas repartidas: ${suma} de ${original.length} del original.`);
console.log(`index.css nuevo contiene solo las 3 sentencias @import originales y las ${RANGOS.length} locales.`);
