/* Sonda de solo lectura para la auditoría 09A.
   Recalcula, con las MISMAS fórmulas del código, el centroide de cada faceta
   al final de la dispersión y el destino urbano correspondiente. No lee memoria
   interna del motor ni modifica ningún archivo. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(dir, '../../..');
const bin = fs.readFileSync(path.join(raiz, 'facetas-retexture/facetas.bin'));
const fuenteMotor = fs.readFileSync(path.join(raiz, 'desintegracion-controlada/motor.js'), 'utf8');
const modulo = await import('data:text/javascript;base64,' + Buffer.from(fuenteMotor).toString('base64'));
const { decodificarFacetas, transformarVertice, progresoFaceta } = modulo;

const niveles = decodificarFacetas(bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength));

const normalizar = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const azar = (i, sal) => {
  let v = Math.imul(i + 1, 0x45d9f3b) ^ sal;
  v = Math.imul(v ^ (v >>> 16), 0x45d9f3b);
  v = Math.imul(v ^ (v >>> 16), 0x45d9f3b);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
};

function crearVista(azimut, elevacion) {
  const az = (azimut * Math.PI) / 180;
  const el = (elevacion * Math.PI) / 180;
  const frente = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
  const derecha = normalizar([frente[2], 0, -frente[0]]);
  const arriba = [
    frente[1] * derecha[2] - frente[2] * derecha[1],
    frente[2] * derecha[0] - frente[0] * derecha[2],
    frente[0] * derecha[1] - frente[1] * derecha[0],
  ];
  return { frente, derecha, arriba };
}
const vista = crearVista(42, -12);
const proyectarUV = (p) => [
  p[0] * vista.derecha[0] + p[1] * vista.derecha[1] + p[2] * vista.derecha[2],
  p[0] * vista.arriba[0] + p[1] * vista.arriba[1] + p[2] * vista.arriba[2],
];

/* Mismas derivaciones que crearFacetas() de app.js. */
function prepararFacetas(nivel) {
  const centroBus = [
    (nivel.minimo[0] + nivel.maximo[0]) / 2,
    (nivel.minimo[1] + nivel.maximo[1]) / 2,
    (nivel.minimo[2] + nivel.maximo[2]) / 2,
  ];
  const diagonal = Math.hypot(
    nivel.maximo[0] - nivel.minimo[0],
    nivel.maximo[1] - nivel.minimo[1],
    nivel.maximo[2] - nivel.minimo[2],
  );
  const facetas = [];
  for (let i = 0; i < nivel.triangulos; i++) {
    const puntos = [];
    for (let v = 0; v < 3; v++) {
      const pos = nivel.indices[i * 3 + v] * 3;
      puntos.push([nivel.posiciones[pos], nivel.posiciones[pos + 1], nivel.posiciones[pos + 2]]);
    }
    const centro = [
      (puntos[0][0] + puntos[1][0] + puntos[2][0]) / 3,
      (puntos[0][1] + puntos[1][1] + puntos[2][1]) / 3,
      (puntos[0][2] + puntos[1][2] + puntos[2][2]) / 3,
    ];
    const radial = [
      (centro[0] - centroBus[0]) / diagonal,
      (centro[1] - centroBus[1]) / diagonal,
      (centro[2] - centroBus[2]) / diagonal,
    ];
    const a = [puntos[1][0] - puntos[0][0], puntos[1][1] - puntos[0][1], puntos[1][2] - puntos[0][2]];
    const b = [puntos[2][0] - puntos[0][0], puntos[2][1] - puntos[0][1], puntos[2][2] - puntos[0][2]];
    const normal = normalizar([
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ]);
    const fuera = normal[0] * radial[0] + normal[1] * radial[1] + normal[2] * radial[2] < 0 ? -1 : 1;
    const empuje = [normal[0] * fuera * 0.55, normal[1] * fuera * 0.55, normal[2] * fuera * 0.55];
    const desplazamiento = normalizar([
      radial[0] * 0.7 + empuje[0] + 0.04 + (azar(i, 17) - 0.5) * 0.18,
      radial[1] * 0.7 + empuje[1] + 0.14 + (azar(i, 29) - 0.5) * 0.18,
      radial[2] * 0.7 + empuje[2] + 0.08 + (azar(i, 43) - 0.5) * 0.18,
    ]);
    const eje = normalizar([azar(i, 61) * 2 - 1, azar(i, 79) * 2 - 1, azar(i, 97) * 2 - 1]);
    facetas.push({
      orden: i, puntos, centro, desplazamiento, eje,
      demora: Math.min(1, 0.62 * Math.sqrt(azar(i, 113)) + 0.38 * (centro[2] - nivel.minimo[2]) / Math.max(1e-6, nivel.maximo[2] - nivel.minimo[2])),
      distancia: diagonal * (0.10 + azar(i, 131) * 0.14),
      giro: (azar(i, 149) * 2 - 1) * 0.40,
    });
  }
  return { facetas, centroBus, diagonal };
}

function encuadreBus(facetas) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const f of facetas) for (const p of f.puntos) {
    const [u, v] = proyectarUV(p);
    minX = Math.min(minX, u); maxX = Math.max(maxX, u);
    minY = Math.min(minY, v); maxY = Math.max(maxY, v);
  }
  const mx = (maxX - minX) * 0.10;
  const my = (maxY - minY) * 0.10;
  return { minX: minX - mx, maxX: maxX + mx, minY: minY - my, maxY: maxY + my };
}

/* Centroide proyectado de cada faceta con progreso 1. */
function posicionesFinales(facetas, marco, W, H) {
  const margen = Math.min(W, H) * 0.05;
  const extX = marco.maxX - marco.minX;
  const extY = marco.maxY - marco.minY;
  const escala = Math.min((W - margen * 2) / extX, (H - margen * 2) / extY);
  const izquierda = (W - extX * escala) / 2;
  const arriba = (H - extY * escala) / 2;
  const salida = [];
  const out = new Float32Array(9);
  for (const f of facetas) {
    const cantidad = progresoFaceta(1, f.demora);
    let cx = 0, cy = 0, cz = 0;
    for (let v = 0; v < 3; v++) {
      transformarVertice(f.puntos[v], f.centro, f.desplazamiento, f.eje, cantidad, f.distancia, f.giro, out, v * 3);
      cx += out[v * 3]; cy += out[v * 3 + 1]; cz += out[v * 3 + 2];
    }
    const [u, v] = proyectarUV([cx / 3, cy / 3, cz / 3]);
    salida.push([izquierda + (u - marco.minX) * escala, H - arriba - (v - marco.minY) * escala]);
  }
  return salida;
}

/* Misma distribución que construirEdificios() de adaptacion-ruta/ciudad.js. */
const PLANOS = [
  { escala: 1.0, base: 0.0, cercano: 3, lejano: 2 },
  { escala: 0.86, base: 0.055, cercano: 4, lejano: 2 },
  { escala: 0.7, base: 0.11, cercano: 5, lejano: 3 },
];

function construirEdificios(W) {
  const movil = W < 600;
  const anchoCiudad = movil ? 0.95 : 1.9;
  const lista = [];
  PLANOS.forEach((plano, pi) => {
    const n = movil ? plano.lejano : plano.cercano;
    const pesos = Array.from({ length: n }, (_, i) => 0.6 + azar(i + pi * 17, 91) * 0.9);
    const suma = pesos.reduce((a, b) => a + b, 0);
    const hueco = 0.03;
    const util = anchoCiudad - hueco * (n - 1);
    let x = -anchoCiudad / 2;
    pesos.forEach((p, i) => {
      const w = (util * p) / suma;
      lista.push({ x0: x, x1: x + w, alto: 0.2 + azar(i + pi * 23, 37) * 0.58, plano: pi });
      x += w + hueco;
    });
  });
  return { edificios: lista, anchoCiudad };
}

function destinosCiudad(nivel, W, H) {
  const { edificios, anchoCiudad } = construirEdificios(W);
  const total = nivel.triangulos;
  const areas = edificios.map((e) => (e.x1 - e.x0) * e.alto * PLANOS[e.plano].escala ** 2);
  const suma = areas.reduce((a, b) => a + b, 0);
  const cuotas = areas.map((a) => Math.floor((total * a) / suma));
  let resto = total - cuotas.reduce((a, b) => a + b, 0);
  for (let k = 0; resto > 0; k = (k + 1) % cuotas.length, resto--) cuotas[k] += 1;

  const escala = Math.min((W * 0.94) / anchoCiudad, (H * 0.82) / 1.05);
  const centroX = W / 2;
  const sueloY = H * 0.9;
  const destinos = new Array(total);
  const origenes = new Array(total);
  let f = 0;
  edificios.forEach((e, bi) => {
    const n = cuotas[bi];
    const plano = PLANOS[e.plano];
    const w = e.x1 - e.x0;
    const top = plano.base + plano.escala * e.alto;
    const nTecho = Math.max(5, Math.round(n * 0.26));
    const nBorde = Math.max(5, Math.round(n * 0.22));
    const nRelleno = Math.max(0, n - nTecho - nBorde);
    const cols = Math.max(2, Math.round(Math.sqrt((nRelleno * w) / Math.max(0.05, e.alto))));
    const rows = Math.ceil(nRelleno / Math.max(1, cols));
    for (let k = 0; k < n && f < total; k++, f++) {
      let cx, cy;
      if (k < nTecho) {
        const u = (k + 0.5) / nTecho;
        cx = plano.escala * (e.x0 + u * w + (azar(f, 3) - 0.5) * (w / nTecho) * 0.6);
        cy = top + (azar(f, 7) - 0.5) * 0.008;
      } else if (k < nTecho + nBorde) {
        const kb = k - nTecho;
        const u = (kb + 0.5) / nBorde;
        cx = plano.escala * (kb % 2 === 0 ? e.x0 : e.x1);
        cy = plano.base + plano.escala * (u * e.alto);
      } else {
        const kr = k - nTecho - nBorde;
        const col = kr % cols;
        const row = Math.floor(kr / cols);
        const jx = (azar(f, 5) - 0.5) * 0.9;
        const jy = (azar(f, 9) - 0.5) * 0.9;
        cx = plano.escala * (e.x0 + ((col + 0.5 + jx) / cols) * w);
        cy = plano.base + plano.escala * (((row + 0.5 + jy) / rows) * e.alto);
      }
      destinos[f] = [centroX + cx * escala, sueloY - cy * escala];
      // nube de origen actual de la ciudad (derivada del centroide, no del motor)
      const ox = (nivel.posiciones[nivel.indices[f * 3] * 3] / 0.9) * 0.32 + (azar(f, 61) - 0.5) * 0.95;
      const oy = 0.4 + (nivel.posiciones[nivel.indices[f * 3] * 3 + 1] / 0.36) * 0.18 + (azar(f, 79) - 0.5) * 0.62;
      origenes[f] = [centroX + ox * escala, sueloY - oy * escala];
    }
  });
  return { destinos, origenes, cuotas, escala, anchoCiudad };
}

function resumen(valores) {
  const o = [...valores].sort((a, b) => a - b);
  const n = o.length;
  return {
    n,
    mediana: Number(o[Math.floor(n * 0.5)].toFixed(1)),
    p95: Number(o[Math.min(n - 1, Math.floor(n * 0.95))].toFixed(1)),
    maximo: Number(o[n - 1].toFixed(1)),
  };
}

const lienzos = {
  escritorio: { W: 1440, H: 627 },
  movil: { W: 390, H: 669.5 },
};

const salida = { niveles: [], comparaciones: {} };
for (let nivel = 0; nivel < niveles.length; nivel++) {
  const prep = prepararFacetas(niveles[nivel]);
  const marco = encuadreBus(prep.facetas);
  const entrada = { nivel, facetas: niveles[nivel].triangulos, lienzos: {} };
  salida.niveles.push(entrada);
  for (const [nombre, { W, H }] of Object.entries(lienzos)) {
    const bus = posicionesFinales(prep.facetas, marco, W, H);
    const { destinos, origenes } = destinosCiudad(niveles[nivel], W, H);
    entrada.lienzos[nombre] = { W, H };
    const dDestino = [];
    const dOrigen = [];
    let dentro = 0;
    let dentroDestino = 0;
    for (let f = 0; f < bus.length; f++) {
      const [bx, by] = bus[f];
      const [dx, dy] = destinos[f];
      const [ox, oy] = origenes[f];
      dDestino.push(Math.hypot(bx - dx, by - dy));
      dOrigen.push(Math.hypot(bx - ox, by - oy));
      if (bx >= 0 && bx <= W && by >= 0 && by <= H) dentro += 1;
      if (dx >= 0 && dx <= W && dy >= 0 && dy <= H) dentroDestino += 1;
    }
    salida.comparaciones[`nivel${nivel}-${nombre}`] = {
      lienzo: { W, H },
      facetas: bus.length,
      destinos: destinos.length,
      busDentroDelLienzo: Number(((dentro / bus.length) * 100).toFixed(1)),
      destinoDentroDelLienzo: Number(((dentroDestino / destinos.length) * 100).toFixed(1)),
      distanciaBusADestino: resumen(dDestino),
      distanciaBusANubeCiudad: resumen(dOrigen),
    };
  }
}

console.log(JSON.stringify(salida, null, 1));
