/* ==========================================================================
   Prueba de lectura de la buseta en puntos.
   Sin dependencias. Canvas 2D. Un solo fotograma, sin bucle.

   Dos preguntas:
   - cuantos puntos hacen falta para que la buseta se lea (modo escala)
   - si el glifo aporta legibilidad o solo aporta cobertura (modo glifos)
   ========================================================================== */

const params = new URLSearchParams(location.search);
const MODO = ['solo', 'glifos', 'equivalencia'].includes(params.get('modo')) ? params.get('modo') : 'escala';
const VISTA = ['iso', 'lado', 'frente'].includes(params.get('v')) ? params.get('v') : 'iso';
const CULL = params.get('cull') !== '0';
const N_SOLO = Math.min(40000, Math.max(100, Number(params.get('n')) || 1600));
const ESCALONES = [200, 400, 800, 1600, 3200, 6400];
const GLIFOS = ['punto1', 'cuadro2', 'tri3', 'guion4', 'tri5o'];
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const VISTAS = { iso: [38, 22], lado: [90, 2], frente: [0, 2] };
const AZ = params.has('az') ? Number(params.get('az')) : NaN;
const EL = params.has('el') ? Number(params.get('el')) : NaN;
const ANGULO = Number.isFinite(AZ) && Number.isFinite(EL) ? [AZ, EL] : VISTAS[VISTA];
const TAM = Math.max(0.6, Math.min(4, Number(params.get('s')) || 1));
let GLIFO = GLIFOS.includes(params.get('g')) ? params.get('g') : 'punto1';

const escena = document.getElementById('escena');
const meta = document.getElementById('meta');
const pieDer = document.getElementById('pie-der');

/* ── glifos ──────────────────────────────────────────────────────────────
   Tinta por glifo, en px cuadrados a DPR 1:
     punto1   1.0     cuadro2  4.0
     tri3     4.5     guion4   4.0
     tri5o    ~11 (contorno, el caso de la referencia)
   Los cuatro primeros comparan forma con cobertura parecida.
   ---------------------------------------------------------------------- */
const CACHE = new Map();

function construirGlifo(tipo) {
  if (tipo === 'punto1') return null;
  const defs = {
    cuadro2: { w: 2, h: 2, f: (c) => c.fillRect(0, 0, 2, 2) },
    tri3: { w: 3, h: 3, f: (c) => { c.beginPath(); c.moveTo(0, 3); c.lineTo(3, 3); c.lineTo(1.5, 0); c.closePath(); c.fill(); } },
    guion4: { w: 4, h: 1, f: (c) => c.fillRect(0, 0, 4, 1) },
    tri5o: { w: 6, h: 6, f: (c) => { c.strokeStyle = '#22d3ee'; c.lineWidth = 1; c.beginPath(); c.moveTo(0.5, 5.5); c.lineTo(5.5, 5.5); c.lineTo(3, 0.5); c.closePath(); c.stroke(); } },
  };
  const d = defs[tipo];
  if (!d) return null;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(d.w * DPR);
  cv.height = Math.ceil(d.h * DPR);
  const c = cv.getContext('2d');
  c.scale(DPR, DPR);
  c.fillStyle = '#22d3ee';
  d.f(c);
  return { cv, w: d.w, h: d.h };
}

function glifoDe(tipo) {
  if (!CACHE.has(tipo)) CACHE.set(tipo, construirGlifo(tipo));
  return CACHE.get(tipo);
}

/* ── lectura de la nube ──────────────────────────────────────────────── */
function decodificar(buf) {
  const dv = new DataView(buf);
  const magic = String.fromCharCode(...new Uint8Array(buf, 0, 4));
  if (magic !== 'ENP1') throw new Error('cabecera desconocida: ' + magic);
  const n = dv.getUint32(4, true);
  const mn = [0, 1, 2].map((a) => dv.getFloat32(8 + a * 4, true));
  const mx = [0, 1, 2].map((a) => dv.getFloat32(20 + a * 4, true));
  const P = new Float32Array(n * 3);
  const N = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const o = 32 + i * 9;
    for (let a = 0; a < 3; a++) {
      const q = dv.getUint16(o + a * 2, true) / 65535;
      P[i * 3 + a] = mn[a] + q * (mx[a] - mn[a]);
      N[i * 3 + a] = dv.getInt8(o + 6 + a) / 127;
    }
  }
  return { n, P, N };
}

/* ── cámara y proyección ─────────────────────────────────────────────── */
function camara(az, el) {
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  const f = [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)];
  let r = [f[2], 0, -f[0]];
  const lr = Math.hypot(...r);
  r = lr < 1e-6 ? [1, 0, 0] : r.map((v) => v / lr);
  const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];
  return { f, r, u };
}

function proyectar(nube) {
  const { P, N, n } = nube;
  const { f, r, u } = camara(...ANGULO);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
    if (z < z0) z0 = z; if (z > z1) z1 = z;
  }
  const c = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
  const U = new Float32Array(n), V = new Float32Array(n), D = new Float32Array(n), visible = new Uint8Array(n);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = P[i * 3] - c[0], y = P[i * 3 + 1] - c[1], z = P[i * 3 + 2] - c[2];
    const uu = x * r[0] + y * r[1] + z * r[2];
    const vv = x * u[0] + y * u[1] + z * u[2];
    const dd = x * f[0] + y * f[1] + z * f[2];
    U[i] = uu; V[i] = vv; D[i] = dd;
    if (uu < u0) u0 = uu; if (uu > u1) u1 = uu;
    if (vv < v0) v0 = vv; if (vv > v1) v1 = vv;
    const nx = N[i * 3], ny = N[i * 3 + 1], nz = N[i * 3 + 2];
    visible[i] = CULL ? (nx * f[0] + ny * f[1] + nz * f[2] < -0.02 ? 1 : 0) : 1;
  }
  return { U, V, D, visible, u0, u1, v0, v1 };
}

/* ── pintado ─────────────────────────────────────────────────────────── */
function pintar(cv, proy, cuenta, caja, tipo) {
  const { U, V, D, visible, u0, u1, v0, v1 } = proy;
  const w = cv.clientWidth || 300;
  const h = cv.clientHeight || 200;
  cv.width = Math.round(w * DPR);
  cv.height = Math.round(h * DPR);
  const ctx = cv.getContext('2d');
  ctx.scale(DPR, DPR);
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, w, h);

  const pad = caja.pad;
  const s = Math.min((w - 2 * pad) / (u1 - u0), (h - 2 * pad) / (v1 - v0));
  const ox = (w - (u1 - u0) * s) / 2;
  const oy = (h - (v1 - v0) * s) / 2;

  const idx = [];
  for (let i = 0; i < cuenta; i++) if (visible[i]) idx.push(i);
  idx.sort((a, b) => D[a] - D[b]);

  const g = glifoDe(tipo);
  ctx.fillStyle = '#22d3ee';

  const tramos = 5;
  let desde = 0;
  for (let k = 0; k < tramos; k++) {
    const hasta = Math.floor((idx.length * (k + 1)) / tramos);
    if (hasta <= desde) continue;
    const alfa = 0.30 + 0.65 * ((k + 0.5) / tramos);
    ctx.globalAlpha = alfa;
    if (g) {
      const hw = g.w / 2, hh = g.h / 2;
      for (let j = desde; j < hasta; j++) {
        const i = idx[j];
        const x = (U[i] - u0) * s + ox;
        const y = h - ((V[i] - v0) * s + oy);
        ctx.drawImage(g.cv, x - hw, y - hh, g.w, g.h);
      }
    } else {
      for (let j = desde; j < hasta; j++) {
        const i = idx[j];
        const x = (U[i] - u0) * s + ox;
        const y = h - ((V[i] - v0) * s + oy);
        ctx.fillRect(x, y, TAM, TAM);
      }
    }
    desde = hasta;
  }
  ctx.globalAlpha = 1;
  return { visibles: idx.length, total: cuenta };
}

const cajaComun = (w, h, padFrac = 0.08) => ({ pad: Math.min(w, h) * padFrac });

function celda(tipo, n, proy, etiqueta) {
  const fig = document.createElement('figure');
  fig.className = 'celda';
  const cv = document.createElement('canvas');
  fig.appendChild(cv);
  const cap = document.createElement('figcaption');
  fig.appendChild(cap);
  escena.appendChild(fig);
  const r = pintar(cv, proy, n, cajaComun(300, 200), tipo);
  cap.innerHTML = `<b>${etiqueta}</b><span>${r.visibles.toLocaleString('es')} visibles</span>`;
}

/* ── arranque ────────────────────────────────────────────────────────── */
async function iniciar() {
  let nube;
  try {
    const r = await fetch('./nube.bin');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    nube = decodificar(await r.arrayBuffer());
  } catch (e) {
    escena.innerHTML = `<p style="color:#f59e0b;font:13px var(--mono);max-width:560px">
      No se pudo cargar <code>nube.bin</code> (${e.message}).<br>
      Abre esta página desde un servidor local:
      <code>python3 -m http.server</code>.</p>`;
    meta.textContent = 'error de carga';
    return;
  }

  const proy = proyectar(nube);
  meta.textContent = `vista ${ANGULO[0]}°/${ANGULO[1]}° · culling ${CULL ? 'sí' : 'no'} · ${nube.n.toLocaleString('es')} puntos horneados · DPR ${DPR}`;

  if (MODO === 'solo') {
    const fig = document.createElement('figure');
    fig.className = 'solo';
    const cv = document.createElement('canvas');
    cv.style.aspectRatio = '900 / 560';
    fig.appendChild(cv);
    escena.appendChild(fig);
    const r = pintar(cv, proy, N_SOLO, cajaComun(900, 560), GLIFO);
    pieDer.textContent = `${r.visibles.toLocaleString('es')} visibles de ${r.total.toLocaleString('es')} · glifo ${GLIFO}`;
    return;
  }

  if (MODO === 'equivalencia') {
    // Misma tinta total aproximada, repartida en distinta cantidad de marcas.
    // punto 1 px = 1 px2 · cuadro 2 px = 4 px2 · tetraedro contorno ~15 px2
    const pares = [
      [6400, 'punto1', '6.400 puntos · 1 px'],
      [1600, 'cuadro2', '1.600 cuadros · 2 px'],
      [800, 'guion4', '800 guiones · 4×1'],
      [400, 'tri5o', '400 tetraedros · contorno'],
    ];
    for (const [n, t, label] of pares) celda(t, n, proy, label);
    pieDer.textContent = 'misma tinta aproximada · distinta cantidad de marcas';
    return;
  }

  if (MODO === 'glifos') {
    const n = N_SOLO;
    for (const t of GLIFOS) {
      const nombre = { punto1: 'punto 1 px', cuadro2: 'cuadro 2 px', tri3: 'triángulo 3 px', guion4: 'guion 4×1', tri5o: 'triángulo contorno' }[t];
      celda(t, n, proy, nombre);
    }
    pieDer.textContent = `${n.toLocaleString('es')} puntos · misma cobertura, distinta forma`;
    return;
  }

  for (const n of ESCALONES) {
    celda(GLIFO, n, proy, n.toLocaleString('es') + ' puntos');
  }
  pieDer.textContent = `escalones 200 → 6400 · glifo ${GLIFO}`;
}

iniciar();
