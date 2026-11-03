/* FASE 09B — transición bus → ciudad con un único progreso t.
   Reproduce la dispersión real del motor (mismas fórmulas) y los destinos de la
   fase 08, con identidad por índice. No modifica ningún archivo existente. */

import { decodificarFacetas, progresoFaceta, transformarVertice } from '../../motor.js';

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const hud = document.getElementById('hud');
const rango = document.getElementById('t');
const botonesT = [...document.querySelectorAll('[data-t]')];
const botonesV = [...document.querySelectorAll('[data-variante]')];
const params = new URLSearchParams(location.search);

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// Curva ajustada tras registrar el defecto de la hipótesis inicial (p=t/0.55):
// a t=0.5 el autobús ya estaba al 91% de dispersión y no se reconocía.
const CURVA = { finBus: 0.8, inicioCiudad: 0.45, finCiudad: 0.85 };
const suavizar = (v) => v * v * (3 - 2 * v);
const azar = (i, sal) => {
  let v = Math.imul(i + 1, 0x45d9f3b) ^ sal;
  v = Math.imul(v ^ (v >>> 16), 0x45d9f3b);
  v = Math.imul(v ^ (v >>> 16), 0x45d9f3b);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
};
const normalizar = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };

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
const proyUV = (p) => [
  p[0] * vista.derecha[0] + p[1] * vista.derecha[1] + p[2] * vista.derecha[2],
  p[0] * vista.arriba[0] + p[1] * vista.arriba[1] + p[2] * vista.arriba[2],
];

const PALETA_CIUDAD = ['#4ad6de', '#17323f', '#0a161c', '#dffbff', '#e89a36', '#1d7482'];
function crearTonos(base) {
  return Array.from({ length: 9 }, (_, i) => {
    const il = 0.42 + (0.68 * i) / 8;
    return base.map((c) => Math.min(255, Math.round(c * il)));
  });
}
// Misma paleta que app.js: color base por grupo y 9 niveles de luz.
const PALETA_BUS = [
  crearTonos([27, 143, 151]),
  crearTonos([22, 48, 62]),
  crearTonos([7, 18, 28]),
  crearTonos([210, 235, 229]),
  crearTonos([229, 151, 51]),
];
const LUZ = normalizar([-0.38, 0.86, 0.34]);
const PLANOS = [
  { escala: 1.0, alfa: 1.0, base: 0.0, cercano: 3, lejano: 2 },
  { escala: 0.86, alfa: 0.72, base: 0.055, cercano: 4, lejano: 2 },
  { escala: 0.7, alfa: 0.46, base: 0.11, cercano: 5, lejano: 3 },
];
const RGB_CIUDAD = PALETA_CIUDAD.map((hex) => [
  parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16),
]);

let niveles = [];
let nivelActual = -1;
let nivel = null;
let facetas = [];
let destinos = [];
let planos = [];
let tonos = [];
let anchoCiudad = 1.9;
let ruta = [];
let marco = null;
let W = 0;
let H = 0;
let dpr = 1;
let escBus = 1;
let izq = 0;
let arr = 0;
let escCiudad = 1;
let bboxBus = null;
let bboxCiudad = null;
let sAlign = 1;
let cxB = 0;
let cyB = 0;
let cxC = 0;
let cyC = 0;
let variante = params.get('variante') === 'B' ? 'B' : 'A';
let t = clamp(Number(params.get('t')) || 0);
let stats = { fuera: 0, facetas: 0 };
const cacheColor = new Map();
const out = new Float32Array(9);

/* --- faceta: identidad i, puntos, parámetros y color real del binario --- */
function crearFacetas(niv) {
  const centroBus = [
    (niv.minimo[0] + niv.maximo[0]) / 2,
    (niv.minimo[1] + niv.maximo[1]) / 2,
    (niv.minimo[2] + niv.maximo[2]) / 2,
  ];
  const diagonal = Math.hypot(
    niv.maximo[0] - niv.minimo[0],
    niv.maximo[1] - niv.minimo[1],
    niv.maximo[2] - niv.minimo[2],
  );
  const lista = [];
  for (let i = 0; i < niv.triangulos; i++) {
    const puntos = [];
    for (let v = 0; v < 3; v++) {
      const p = niv.indices[i * 3 + v] * 3;
      puntos.push([niv.posiciones[p], niv.posiciones[p + 1], niv.posiciones[p + 2]]);
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
    lista.push({
      i,
      puntos,
      centro,
      desplazamiento,
      eje: normalizar([azar(i, 61) * 2 - 1, azar(i, 79) * 2 - 1, azar(i, 97) * 2 - 1]),
      demora: Math.min(1, 0.62 * Math.sqrt(azar(i, 113)) + 0.38 * (centro[2] - niv.minimo[2]) / Math.max(1e-6, niv.maximo[2] - niv.minimo[2])),
      distancia: diagonal * (0.10 + azar(i, 131) * 0.14),
      giro: (azar(i, 149) * 2 - 1) * 0.40,
      grupo: niv.grupos[i],
      rgb: [niv.colores[i * 3], niv.colores[i * 3 + 1], niv.colores[i * 3 + 2]],
      px: [0, 0, 0, 0, 0, 0],
      pcx: 0,
      pcy: 0,
      alfa: 1,
      color: '#000',
      prof: 0,
      clave: 0,
    });
  }
  return lista;
}

function encuadreBus(lista) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const f of lista) for (const p of f.puntos) {
    const [u, v] = proyUV(p);
    minX = Math.min(minX, u); maxX = Math.max(maxX, u);
    minY = Math.min(minY, v); maxY = Math.max(maxY, v);
  }
  const mx = (maxX - minX) * 0.10;
  const my = (maxY - minY) * 0.10;
  return { minX: minX - mx, maxX: maxX + mx, minY: minY - my, maxY: maxY + my };
}

/* --- destinos urbanos: misma distribución que adaptacion-ruta --- */
function construirCiudad(niv) {
  const movil = W < 600;
  anchoCiudad = movil ? 0.95 : 1.9;
  const edificios = [];
  PLANOS.forEach((plano, pi) => {
    const n = movil ? plano.lejano : plano.cercano;
    const pesos = Array.from({ length: n }, (_, i) => 0.6 + azar(i + pi * 17, 91) * 0.9);
    const suma = pesos.reduce((a, b) => a + b, 0);
    const hueco = 0.03;
    const util = anchoCiudad - hueco * (n - 1);
    let x = -anchoCiudad / 2;
    pesos.forEach((p, i) => {
      const w = (util * p) / suma;
      edificios.push({ x0: x, x1: x + w, alto: 0.2 + azar(i + pi * 23, 37) * 0.58, plano: pi });
      x += w + hueco;
    });
  });

  const total = niv.triangulos;
  const areas = edificios.map((e) => (e.x1 - e.x0) * e.alto * PLANOS[e.plano].escala ** 2);
  const suma = areas.reduce((a, b) => a + b, 0);
  const cuotas = areas.map((a) => Math.floor((total * a) / suma));
  let resto = total - cuotas.reduce((a, b) => a + b, 0);
  for (let k = 0; resto > 0; k = (k + 1) % cuotas.length, resto--) cuotas[k] += 1;

  destinos = new Array(total);
  planos = new Uint8Array(total);
  tonos = new Uint8Array(total);
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
      destinos[f] = { cx, cy };
      planos[f] = e.plano;
      const grupo = niv.grupos[f];
      tonos[f] = grupo === 1 ? 1 : grupo === 2 ? 2 : grupo === 3 ? 3 : grupo === 4 ? 4 : (cy > 0.42 ? 0 : 5);
    }
  });

  const medio = anchoCiudad * 0.42;
  ruta = Array.from({ length: 25 }, (_, i) => ({
    x: -medio + (2 * medio * i) / 24,
    y: 0.15 + Math.sin(i * 0.55) * 0.012,
  }));

  if (facetas.length !== total) {
    throw new Error(`Identidad rota: ${facetas.length} facetas frente a ${total} destinos`);
  }
}

function medirLienzo() {
  const caja = lienzo.getBoundingClientRect();
  if (!caja.width || !caja.height) return false;
  W = caja.width;
  H = caja.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const anchoReal = Math.round(W * dpr);
  const altoReal = Math.round(H * dpr);
  if (lienzo.width !== anchoReal || lienzo.height !== altoReal) {
    lienzo.width = anchoReal;
    lienzo.height = altoReal;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return true;
}

function destinoPantalla(f) {
  return [W / 2 + destinos[f].cx * escCiudad, H * 0.9 - destinos[f].cy * escCiudad];
}

function actualizarProyecciones() {
  if (!marco || !facetas.length) return;
  const margen = Math.min(W, H) * 0.05;
  const extX = marco.maxX - marco.minX;
  const extY = marco.maxY - marco.minY;
  escBus = Math.min((W - margen * 2) / extX, (H - margen * 2) / extY);
  izq = (W - extX * escBus) / 2;
  arr = (H - extY * escBus) / 2;
  escCiudad = Math.min((W * 0.94) / anchoCiudad, (H * 0.82) / 1.05);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const centro = new Float32Array(3);
  for (const f of facetas) {
    const cant = progresoFaceta(1, f.demora);
    let cx = 0, cy = 0, cz = 0;
    for (let v = 0; v < 3; v++) {
      transformarVertice(f.puntos[v], f.centro, f.desplazamiento, f.eje, cant, f.distancia, f.giro, out, v * 3);
      cx += out[v * 3]; cy += out[v * 3 + 1]; cz += out[v * 3 + 2];
    }
    centro[0] = cx / 3; centro[1] = cy / 3; centro[2] = cz / 3;
    const [u, v] = proyUV(centro);
    const x = izq + (u - marco.minX) * escBus;
    const y = H - arr - (v - marco.minY) * escBus;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  bboxBus = { minX, maxX, minY, maxY };

  let cMinX = Infinity, cMaxX = -Infinity, cMinY = Infinity, cMaxY = -Infinity;
  for (let f = 0; f < facetas.length; f++) {
    const [x, y] = destinoPantalla(f);
    cMinX = Math.min(cMinX, x); cMaxX = Math.max(cMaxX, x);
    cMinY = Math.min(cMinY, y); cMaxY = Math.max(cMaxY, y);
  }
  bboxCiudad = { minX: cMinX, maxX: cMaxX, minY: cMinY, maxY: cMaxY };

  const anchoBus = Math.max(1, bboxBus.maxX - bboxBus.minX);
  const altoBus = Math.max(1, bboxBus.maxY - bboxBus.minY);
  const anchoDestino = Math.max(1, bboxCiudad.maxX - bboxCiudad.minX);
  const altoDestino = Math.max(1, bboxCiudad.maxY - bboxCiudad.minY);
  sAlign = clamp(Math.min(anchoDestino / anchoBus, altoDestino / altoBus), 0.1, 10);
  cxB = (bboxBus.minX + bboxBus.maxX) / 2;
  cyB = (bboxBus.minY + bboxBus.maxY) / 2;
  cxC = (bboxCiudad.minX + bboxCiudad.maxX) / 2;
  cyC = (bboxCiudad.minY + bboxCiudad.maxY) / 2;
}

/* Transformación de encuadre de la variante B: escala y traslación globales. */
function aplicarEncuadre(x, y, e) {
  if (variante !== 'B') return [x, y];
  const s = 1 + (sAlign - 1) * e;
  return [
    (x - cxB) * s + cxB + (cxC - cxB) * e,
    (y - cyB) * s + cyB + (cyC - cyB) * e,
  ];
}

function colorMezcla(grupo, luzIdx, tono, e) {
  const paso = Math.round(e * 20);
  const clave = ((grupo * 9 + luzIdx) * 6 + tono) * 21 + paso;
  const guardado = cacheColor.get(clave);
  if (guardado) return guardado;
  const base = PALETA_BUS[grupo][luzIdx];
  const c = RGB_CIUDAD[tono];
  const k = paso / 20;
  const color = `rgb(${Math.round(base[0] + (c[0] - base[0]) * k)},${Math.round(base[1] + (c[1] - base[1]) * k)},${Math.round(base[2] + (c[2] - base[2]) * k)})`;
  cacheColor.set(clave, color);
  return color;
}

function dibujar() {
  if (!facetas.length || !W || !H) return;
  const p = clamp(t / CURVA.finBus);
  const u = clamp((t - CURVA.inicioCiudad) / (CURVA.finCiudad - CURVA.inicioCiudad));
  const eu = suavizar(u);
  // La forma se colapsa antes que la posición: así la ciudad empieza a leerse
  // como puntos mientras las partículas aún están convergiendo.
  const ec = suavizar(clamp(u * 1.7));

  const fondo = ctx.createLinearGradient(0, 0, 0, H);
  fondo.addColorStop(0, '#050f16');
  fondo.addColorStop(0.62, '#081b26');
  fondo.addColorStop(1, '#0b2431');
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, W, H);

  const [hx, hy] = [W / 2, H * 0.9 - 0.05 * escCiudad];
  const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, W * 0.5);
  halo.addColorStop(0, 'rgba(55,200,208,0.16)');
  halo.addColorStop(1, 'rgba(55,200,208,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  let minProf = Infinity;
  let maxProf = -Infinity;
  let fuera = 0;

  for (const f of facetas) {
    const cant = progresoFaceta(p, f.demora);
    let cx3 = 0, cy3 = 0, cz3 = 0;
    for (let v = 0; v < 3; v++) {
      transformarVertice(f.puntos[v], f.centro, f.desplazamiento, f.eje, cant, f.distancia, f.giro, out, v * 3);
      cx3 += out[v * 3]; cy3 += out[v * 3 + 1]; cz3 += out[v * 3 + 2];
      const [pu, pv] = proyUV([out[v * 3], out[v * 3 + 1], out[v * 3 + 2]]);
      f.px[v * 2] = izq + (pu - marco.minX) * escBus;
      f.px[v * 2 + 1] = H - arr - (pv - marco.minY) * escBus;
    }
    const [cu, cv] = proyUV([cx3 / 3, cy3 / 3, cz3 / 3]);
    const centroX = izq + (cu - marco.minX) * escBus;
    const centroY = H - arr - (cv - marco.minY) * escBus;

    const [tx, ty] = aplicarEncuadre(centroX, centroY, eu);
    const [dx, dy] = destinoPantalla(f.i);
    const px = tx + (dx - tx) * eu;
    const py = ty + (dy - ty) * eu;
    f.pcx = px;
    f.pcy = py;

    for (let v = 0; v < 3; v++) {
      const [vx, vy] = aplicarEncuadre(f.px[v * 2], f.px[v * 2 + 1], eu);
      f.px[v * 2] = vx + (px - vx) * ec;
      f.px[v * 2 + 1] = vy + (py - vy) * ec;
    }

    const ax = out[3] - out[0];
    const ay = out[4] - out[1];
    const az = out[5] - out[2];
    const bx = out[6] - out[0];
    const by = out[7] - out[1];
    const bz = out[8] - out[2];
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    const largo = Math.hypot(nx, ny, nz) || 1;
    const luzIdx = Math.min(8, Math.max(0, Math.round(
      (0.30 + Math.abs((nx / largo) * LUZ[0] + (ny / largo) * LUZ[1] + (nz / largo) * LUZ[2]) * 0.70) * 8,
    )));
    const viaje = Math.max(0, (cant - 0.55) / 0.45);
    const alfaBus = 1 - 0.7 * viaje;
    const alfaCiudad = PLANOS[planos[f.i]].alfa;
    f.alfa = alfaBus + (alfaCiudad - alfaBus) * eu;
    f.color = colorMezcla(f.grupo, luzIdx, tonos[f.i], eu);
    const d = (cx3 * vista.frente[0] + cy3 * vista.frente[1] + cz3 * vista.frente[2]) / 3;
    f.prof = d;
    minProf = Math.min(minProf, d);
    maxProf = Math.max(maxProf, d);
    if (px < 0 || px > W || py < 0 || py > H) fuera += 1;
  }

  const rangoProf = Math.max(1e-6, maxProf - minProf);
  for (const f of facetas) {
    const norm = (f.prof - minProf) / rangoProf;
    f.clave = (1 - eu) * norm + eu * ((2 - planos[f.i]) * 0.5);
  }
  facetas.sort((a, b) => a.clave - b.clave || a.i - b.i);

  const tam = W < 600 ? 1.3 : 1.6;
  for (const f of facetas) {
    ctx.globalAlpha = f.alfa;
    if (ec > 0.999) {
      ctx.fillStyle = PALETA_CIUDAD[tonos[f.i]];
      ctx.fillRect(f.pcx, f.pcy, tam, tam);
      continue;
    }
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.moveTo(f.px[0], f.px[1]);
    ctx.lineTo(f.px[2], f.px[3]);
    ctx.lineTo(f.px[4], f.px[5]);
    ctx.closePath();
    ctx.fill();
    if (ec > 0.85) {
      ctx.globalAlpha = f.alfa * ((ec - 0.85) / 0.15);
      ctx.fillStyle = PALETA_CIUDAD[tonos[f.i]];
      ctx.fillRect(f.pcx, f.pcy, tam, tam);
    }
  }
  ctx.globalAlpha = 1;

  const alfaRuta = Math.max(0, Math.min(1, (eu - 0.35) / 0.65));
  if (alfaRuta > 0.01) {
    ctx.globalAlpha = 0.55 * alfaRuta;
    ctx.strokeStyle = '#37c8d0';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ruta.forEach((p2, i) => {
      const x = W / 2 + p2.x * escCiudad;
      const y = H * 0.9 - p2.y * escCiudad;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = '#bff8ff';
    for (let i = 0; i < ruta.length; i += 6) {
      const x = W / 2 + ruta[i].x * escCiudad;
      const y = H * 0.9 - ruta[i].y * escCiudad;
      ctx.globalAlpha = 0.9 * alfaRuta;
      ctx.fillRect(x - 1.4, y - 1.4, 2.8, 2.8);
    }
    ctx.globalAlpha = 1;
  }

  stats = { fuera, facetas: facetas.length };
  actualizarHud();
}

function actualizarHud() {
  const nombre = variante === 'A' ? 'A · marco bus' : 'B · reencuadre';
  hud.textContent = `${facetas.length.toLocaleString('es')} facetas · ${nombre} · t=${t.toFixed(2)}`;
}

function cargarNivel(indice) {
  nivelActual = indice;
  nivel = niveles[indice];
  facetas = crearFacetas(nivel);
  marco = encuadreBus(facetas);
  construirCiudad(nivel);
  actualizarProyecciones();
}

function fijarT(valor) {
  t = clamp(Number(valor) || 0);
  rango.value = String(Math.round(t * 1000));
  for (const b of botonesT) b.setAttribute('aria-pressed', String(Math.abs(Number(b.dataset.t) - t) < 0.001));
  dibujar();
}

function fijarVariante(v) {
  variante = v === 'B' ? 'B' : 'A';
  for (const b of botonesV) b.setAttribute('aria-pressed', String(b.dataset.variante === variante));
  cacheColor.clear();
  dibujar();
}

function alRedimensionar() {
  if (!medirLienzo()) return;
  const movil = W < 600;
  const indice = movil ? niveles.length - 1 : 0;
  if (indice !== nivelActual) {
    cargarNivel(indice);
  } else {
    actualizarProyecciones();
  }
  dibujar();
}

function geometria() {
  if (!facetas.length) return null;
  let vertFuera = 0;
  let centFuera = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const f of facetas) {
    for (let v = 0; v < 3; v++) {
      const x = f.px[v * 2];
      const y = f.px[v * 2 + 1];
      if (x < 0 || x > W || y < 0 || y > H) vertFuera += 1;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    if (f.pcx < 0 || f.pcx > W || f.pcy < 0 || f.pcy > H) centFuera += 1;
    if (f.pcx < minX) minX = f.pcx; if (f.pcx > maxX) maxX = f.pcx;
    if (f.pcy < minY) minY = f.pcy; if (f.pcy > maxY) maxY = f.pcy;
  }
  return {
    W, H,
    vertTotal: facetas.length * 3,
    vertFuera,
    centTotal: facetas.length,
    centFuera,
    bbox: { minX, maxX, minY, maxY },
  };
}

function huella() {
  const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
  let h = 2166136261;
  for (let i = 0; i < datos.length; i += 97) {
    h ^= datos[i];
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function resumen(valores) {
  const o = [...valores].sort((a, b) => a - b);
  const n = o.length;
  return { n, mediana: Number(o[Math.floor(n * 0.5)].toFixed(3)), p95: Number(o[Math.min(n - 1, Math.floor(n * 0.95))].toFixed(3)) };
}

function medirDibujo(muestras = 60) {
  const tiempos = [];
  for (let i = 0; i < muestras; i++) {
    const a = performance.now();
    dibujar();
    tiempos.push(performance.now() - a);
  }
  return resumen(tiempos);
}

async function iniciar() {
  const respuesta = await fetch('../../../facetas-retexture/facetas.bin');
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  niveles = decodificarFacetas(await respuesta.arrayBuffer());

  if (!medirLienzo()) throw new Error('El lienzo no tiene tamaño');
  cargarNivel(W < 600 ? niveles.length - 1 : 0);
  fijarT(t);
  fijarVariante(variante);

  rango.addEventListener('input', () => fijarT(Number(rango.value) / 1000));
  for (const b of botonesT) b.addEventListener('click', () => fijarT(Number(b.dataset.t)));
  for (const b of botonesV) b.addEventListener('click', () => fijarVariante(b.dataset.variante));
  new ResizeObserver(alRedimensionar).observe(lienzo);

  window.__transicion = {
    fijarT,
    fijarVariante,
    dibujar,
    geometria,
    huella,
    medirDibujo,
    estado: () => ({
      t,
      variante,
      nivel: nivelActual,
      facetas: facetas.length,
      destinos: destinos.length,
      lienzo: { W, H, dpr },
      fuera: stats.fuera,
      porcentajeFuera: Number(((stats.fuera / Math.max(1, facetas.length)) * 100).toFixed(1)),
      sAlign: Number(sAlign.toFixed(3)),
    }),
  };
}

iniciar().catch((error) => {
  hud.textContent = `Error: ${error.message}`;
  console.error(error);
});
