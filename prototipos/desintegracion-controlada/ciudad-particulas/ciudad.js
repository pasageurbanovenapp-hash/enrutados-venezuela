/* Ciudad esquemática construida con las facetas reales del autobús.
   Una faceta = un elemento. No se generan partículas nuevas.
   Aislado: no usa scroll, no toca el motor, no cambia la cámara del prototipo. */

import { decodificarFacetas } from '../motor.js';

const canvas = document.getElementById('ciudad');
const ctx = canvas.getContext('2d');
const meta = document.getElementById('meta');
const presupuestoEl = document.getElementById('presupuesto');
const valorT = document.getElementById('valor-t');
const rango = document.getElementById('t');
const botonesT = [...document.querySelectorAll('[data-t]')];
const botonesNivel = [...document.querySelectorAll('[data-nivel]')];

const params = new URLSearchParams(location.search);

/* Tres planos de profundidad. El cercano es más grande y opaco. */
const PLANOS = [
  { escala: 1.0, alfa: 1.0, base: 0.0, cercano: 3, lejano: 2 },
  { escala: 0.86, alfa: 0.72, base: 0.055, cercano: 4, lejano: 3 },
  { escala: 0.7, alfa: 0.46, base: 0.11, cercano: 5, lejano: 4 },
];

const PALETA = [
  '#4ad6de', // 0 cuerpo alto
  '#17323f', // 1 cristal
  '#0a161c', // 2 rueda
  '#dffbff', // 3 faro
  '#e89a36', // 4 ámbar
  '#1d7482', // 5 cuerpo bajo
];

let niveles = [];
let nivelActual = params.has('nivel') ? Number(params.get('nivel')) : 0;
let t = params.has('t') ? Math.max(0, Math.min(1, Number(params.get('t')))) : 1;
let particulas = [];
let buckets = [];
let edificios = [];
let ruta = [];
let anchoCiudad = 1.9;
let ancho = 0;
let alto = 0;
let dpr = 1;

function azar(indice, sal) {
  let v = Math.imul(indice + 1, 0x45d9f3b) ^ sal;
  v = Math.imul(v ^ (v >>> 16), 0x45d9f3b);
  v = Math.imul(v ^ (v >>> 16), 0x45d9f3b);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
}

const suavizar = (v) => v * v * (3 - 2 * v);

function construirEdificios() {
  const movil = ancho > 0 && ancho < 600;
  // En vertical la ciudad se estrecha: asi los edificios ganan altura sin recortar.
  anchoCiudad = movil ? 1.35 : 1.9;
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
      const altoEdificio = 0.2 + azar(i + pi * 23, 37) * 0.58;
      lista.push({ x0: x, x1: x + w, alto: altoEdificio, plano: pi });
      x += w + hueco;
    });
  });
  return lista;
}

function construirParticulas(nivel) {
  const total = nivel.triangulos;
  const centros = new Float32Array(total * 3);
  for (let f = 0; f < total; f++) {
    let x = 0, y = 0, z = 0;
    for (let v = 0; v < 3; v++) {
      const p = nivel.indices[f * 3 + v] * 3;
      x += nivel.posiciones[p];
      y += nivel.posiciones[p + 1];
      z += nivel.posiciones[p + 2];
    }
    centros[f * 3] = x / 3;
    centros[f * 3 + 1] = y / 3;
    centros[f * 3 + 2] = z / 3;
  }

  const areas = edificios.map((e) => (e.x1 - e.x0) * e.alto * PLANOS[e.plano].escala ** 2);
  const suma = areas.reduce((a, b) => a + b, 0);
  const cuotas = areas.map((a) => Math.floor((total * a) / suma));
  let resto = total - cuotas.reduce((a, b) => a + b, 0);
  for (let k = 0; resto > 0; k = (k + 1) % cuotas.length, resto--) cuotas[k] += 1;

  const lista = [];
  let f = 0;

  function agregar(cx, cy, tono, estructura, planoIdx) {
    const ox = (centros[f * 3] / 0.9) * 0.32 + (azar(f, 61) - 0.5) * 0.95;
    const oy = 0.4 + (centros[f * 3 + 1] / 0.36) * 0.18 + (azar(f, 79) - 0.5) * 0.62;
    lista.push({ ox, oy, cx, cy, plano: planoIdx, tono, est: estructura });
  }

  edificios.forEach((e, bi) => {
    const n = cuotas[bi];
    const plano = PLANOS[e.plano];
    const w = e.x1 - e.x0;
    const top = plano.base + plano.escala * e.alto;
    // La silueta se paga con techo y bordes: sin ellos el relleno parece ruido.
    const nTecho = Math.max(5, Math.round(n * 0.26));
    const nBorde = Math.max(5, Math.round(n * 0.22));
    const nRelleno = Math.max(0, n - nTecho - nBorde);

    for (let k = 0; k < nTecho && f < total; k++, f++) {
      const u = (k + 0.5) / nTecho;
      const cx = plano.escala * (e.x0 + u * w + (azar(f, 3) - 0.5) * (w / nTecho) * 0.6);
      const cy = top + (azar(f, 7) - 0.5) * 0.008;
      agregar(cx, cy, 0, 1, e.plano);
    }
    for (let k = 0; k < nBorde && f < total; k++, f++) {
      const u = (k + 0.5) / nBorde;
      const cx = plano.escala * (k % 2 === 0 ? e.x0 : e.x1);
      const cy = plano.base + plano.escala * (u * e.alto);
      agregar(cx, cy, 0, 1, e.plano);
    }
    const cols = Math.max(2, Math.round(Math.sqrt((nRelleno * w) / Math.max(0.05, e.alto))));
    const rows = Math.ceil(nRelleno / Math.max(1, cols));
    for (let k = 0; k < nRelleno && f < total; k++, f++) {
      const col = k % cols;
      const row = Math.floor(k / cols);
      const jx = (azar(f, 5) - 0.5) * 0.9;
      const jy = (azar(f, 9) - 0.5) * 0.9;
      const cx = plano.escala * (e.x0 + ((col + 0.5 + jx) / cols) * w);
      const cy = plano.base + plano.escala * (((row + 0.5 + jy) / rows) * e.alto);
      const grupo = nivel.grupos[f];
      let tono = 0;
      if (grupo === 1) tono = 1;
      else if (grupo === 2) tono = 2;
      else if (grupo === 3) tono = 3;
      else if (grupo === 4) tono = 4;
      else tono = cy > 0.42 ? 0 : 5;
      agregar(cx, cy, tono, 0, e.plano);
    }
  });

  const b = Array.from({ length: PLANOS.length }, () =>
    Array.from({ length: 2 }, () => Array.from({ length: PALETA.length }, () => [])));
  for (const p of lista) b[p.plano][p.est][p.tono].push(p);
  buckets = b;
  particulas = lista;
}

function prepararLienzo() {
  const caja = canvas.getBoundingClientRect();
  if (!caja.width || !caja.height) return;
  ancho = caja.width;
  alto = caja.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(ancho * dpr);
  canvas.height = Math.round(alto * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  edificios = construirEdificios();
  if (niveles.length) {
    construirParticulas(niveles[nivelActual]);
    presupuestoEl.textContent = `${niveles[nivelActual].triangulos.toLocaleString('es')} elementos`;
  }
  ruta = Array.from({ length: 25 }, (_, i) => {
    const x = -0.9 + (1.8 * i) / 24;
    return { x, y: 0.15 + Math.sin(i * 0.55) * 0.012 };
  });
  dibujar();
}

const proy = { centroX: 0, sueloY: 0, escala: 1 };

function actualizarProyeccion() {
  proy.centroX = ancho / 2;
  proy.sueloY = alto * 0.9;
  proy.escala = Math.min((ancho * 0.94) / anchoCiudad, (alto * 0.82) / 1.05);
}

function proyectar(x, y) {
  return [proy.centroX + x * proy.escala, proy.sueloY - y * proy.escala];
}

function dibujar() {
  if (!ancho || !alto || !particulas.length) return;
  actualizarProyeccion();
  const fondo = ctx.createLinearGradient(0, 0, 0, alto);
  fondo.addColorStop(0, '#050f16');
  fondo.addColorStop(0.62, '#081b26');
  fondo.addColorStop(1, '#0b2431');
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ancho, alto);

  const [cxHalo, cyHalo] = proyectar(0, 0.05);
  const halo = ctx.createRadialGradient(cxHalo, cyHalo, 0, cxHalo, cyHalo, ancho * 0.5);
  halo.addColorStop(0, 'rgba(55,200,208,0.16)');
  halo.addColorStop(1, 'rgba(55,200,208,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, ancho, alto);

  const e = suavizar(t);
  const tam = ancho > 700 ? 1.6 : 1.3;

  for (const pi of [2, 1, 0]) {
    ctx.globalAlpha = PLANOS[pi].alfa;
    for (let tono = 0; tono < PALETA.length; tono++) {
      for (const est of [0, 1]) {
        const lista = buckets[pi][est][tono];
        if (!lista.length) continue;
        ctx.fillStyle = PALETA[tono];
        for (let k = 0; k < lista.length; k++) {
          const p = lista[k];
          const x = p.ox + (p.cx - p.ox) * e;
          const y = p.oy + (p.cy - p.oy) * e;
          const [px, py] = proyectar(x, y);
          ctx.fillRect(px, py, tam, tam);
        }
      }
    }
  }
  ctx.globalAlpha = 1;

  const alfaRed = Math.max(0, Math.min(1, (t - 0.35) / 0.45));
  if (alfaRed > 0.01) {
    ctx.globalAlpha = 0.55 * alfaRed;
    ctx.strokeStyle = '#37c8d0';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ruta.forEach((p, i) => {
      const [px, py] = proyectar(p.x, p.y);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.fillStyle = '#bff8ff';
    for (let i = 0; i < ruta.length; i += 6) {
      const [px, py] = proyectar(ruta[i].x, ruta[i].y);
      ctx.globalAlpha = 0.9 * alfaRed;
      ctx.fillRect(px - 1.4, py - 1.4, 2.8, 2.8);
    }

    ctx.strokeStyle = 'rgba(55,200,208,0.5)';
    ctx.globalAlpha = 0.35 * alfaRed;
    edificios.forEach((ed, i) => {
      if (ed.plano !== 0 || i % 2 !== 0) return;
      const plano = PLANOS[0];
      const x = plano.escala * (ed.x0 + (ed.x1 - ed.x0) / 2);
      const y = plano.base + plano.escala * ed.alto;
      const [px, py] = proyectar(x, y);
      const [, pyFin] = proyectar(x, y + 0.07);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, pyFin);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
}

function fijarT(valor) {
  t = Math.max(0, Math.min(1, valor));
  rango.value = String(Math.round(t * 1000));
  valorT.textContent = `t = ${t.toFixed(2)}`;
  for (const b of botonesT) b.setAttribute('aria-pressed', String(Math.abs(Number(b.dataset.t) - t) < 0.01));
  dibujar();
}

function seleccionarNivel(indice) {
  nivelActual = Math.max(0, Math.min(niveles.length - 1, indice));
  construirParticulas(niveles[nivelActual]);
  presupuestoEl.textContent = `${niveles[nivelActual].triangulos.toLocaleString('es')} elementos`;
  for (const b of botonesNivel) b.setAttribute('aria-pressed', String(Number(b.dataset.nivel) === nivelActual));
  dibujar();
}

function resumen(valores) {
  const orden = [...valores].sort((a, b) => a - b);
  const n = orden.length;
  return {
    n,
    mediana: Number(orden[Math.floor(n * 0.5)].toFixed(3)),
    p95: Number(orden[Math.min(n - 1, Math.floor(n * 0.95))].toFixed(3)),
    minimo: Number(orden[0].toFixed(3)),
    maximo: Number(orden[n - 1].toFixed(3)),
  };
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

function medirFotogramas(cuadros = 40) {
  return new Promise((resolver) => {
    const tiempos = [];
    const intervalos = [];
    let anterior = 0;
    let n = 0;
    function paso(marca) {
      if (n > 0) intervalos.push(marca - anterior);
      anterior = marca;
      const a = performance.now();
      dibujar();
      tiempos.push(performance.now() - a);
      n += 1;
      if (n < cuadros) requestAnimationFrame(paso);
      else resolver({ dibujar: resumen(tiempos), intervalo: resumen(intervalos) });
    }
    requestAnimationFrame(paso);
  });
}

async function medirTodo() {
  const salida = {};
  for (const indice of [0, 1]) {
    seleccionarNivel(indice);
    for (let i = 0; i < 12; i++) dibujar();
    const estados = {};
    for (const valor of [0, 0.5, 1]) {
      t = valor;
      estados[valor] = medirDibujo(60);
    }
    t = 1;
    const raf = await medirFotogramas(40);
    salida[indice] = { elementos: particulas.length, estados, raf };
  }
  window.__ciudad.medicion = salida;
  meta.textContent = 'Medición lista';
  return salida;
}

async function iniciar() {
  const respuesta = await fetch('../../facetas-retexture/facetas.bin');
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  niveles = decodificarFacetas(await respuesta.arrayBuffer());
  meta.textContent = `${niveles.length} niveles · facetas ENF1`;
  prepararLienzo();
  seleccionarNivel(nivelActual);
  fijarT(t);

  rango.addEventListener('input', () => fijarT(Number(rango.value) / 1000));
  for (const b of botonesT) b.addEventListener('click', () => fijarT(Number(b.dataset.t)));
  for (const b of botonesNivel) b.addEventListener('click', () => seleccionarNivel(Number(b.dataset.nivel)));

  new ResizeObserver(() => prepararLienzo()).observe(canvas);

  window.__ciudad = {
    medirTodo,
    fijarT,
    seleccionarNivel,
    estado: () => ({ t, nivel: nivelActual, elementos: particulas.length, lienzo: { ancho, alto, dpr } }),
  };

  if (params.get('medir') === '1') await medirTodo();
}

iniciar().catch((error) => {
  meta.textContent = `Error: ${error.message}`;
  console.error(error);
});
