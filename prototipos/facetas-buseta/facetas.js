/* ==========================================================================
   La buseta facetada: dos acabados comparables.

   A = control: relleno casi negro y arista cian dominante (wireframe).
   B = superficie: relleno con luz, arista fina y tenue, regiones tratadas.

   Sin dependencias. Canvas 2D. Un solo fotograma.
   ========================================================================== */

const params = new URLSearchParams(location.search);
const MODO = ['solo', 'matriz', 'debug'].includes(params.get('modo')) ? params.get('modo') : 'escala';
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const ESTILO = params.get('estilo') === 'B' ? 'B' : 'A';
const DEBUG = params.get('debug') === '1';
const TAM = params.get('tam') === '900' ? [900, 560] : [300, 200];
const VISTAS = {
  frontal: [180, -4],
  trescuartos: [42, -12],
  lado: [90, -2],
};
const VISTA = Object.keys(VISTAS).includes(params.get('v')) ? params.get('v') : 'trescuartos';
const AZ = params.has('az') ? Number(params.get('az')) : NaN;
const EL = params.has('el') ? Number(params.get('el')) : NaN;
const ANGULO = [...(Number.isFinite(AZ) && Number.isFinite(EL) ? [AZ, EL] : VISTAS[VISTA])];
const NIVEL = Math.min(3, Math.max(0, params.has('nivel') ? Number(params.get('nivel')) : 1));

const escena = document.getElementById('escena');
const meta = document.getElementById('meta');
const pieDer = document.getElementById('pie-der');

const LUZ = (() => { const v = [-0.38, 0.86, 0.34]; const n = Math.hypot(...v); return v.map((x) => x / n); })();
const LUZ2 = (() => { const v = [0.62, 0.18, -0.46]; const n = Math.hypot(...v); return v.map((x) => x / n); })();

/* ── datos ───────────────────────────────────────────────────────────── */
function decodificar(buf) {
  const dv = new DataView(buf);
  if (String.fromCharCode(...new Uint8Array(buf, 0, 4)) !== 'ENF1') throw new Error('cabecera desconocida');
  const nNiveles = dv.getUint32(4, true);
  let o = 8;
  const niveles = [];
  for (let k = 0; k < nNiveles; k++) {
    const h = dv.getFloat32(o, true); o += 4;
    const nv = dv.getUint32(o, true); o += 4;
    const nt = dv.getUint32(o, true); o += 4;
    const mn = [0, 1, 2].map((a) => dv.getFloat32(o + a * 4, true)); o += 12;
    const mx = [0, 1, 2].map((a) => dv.getFloat32(o + a * 4, true)); o += 12;
    const V = new Float32Array(nv * 3);
    for (let i = 0; i < nv * 3; i++) {
      const q = dv.getUint16(o + i * 2, true) / 65535;
      V[i] = mn[i % 3] + q * (mx[i % 3] - mn[i % 3]);
    }
    o += nv * 6;
    const T = new Uint32Array(nt * 3);
    for (let i = 0; i < nt * 3; i++) T[i] = dv.getUint16(o + i * 2, true);
    o += nt * 6;
    const G = new Uint8Array(nt);
    for (let i = 0; i < nt; i++) G[i] = dv.getUint8(o + i);
    o += nt;
    niveles.push({ h, V, T, G, nt, mn, mx });
  }
  return niveles;
}

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

/* ── color por estilo y grupo ────────────────────────────────────────── */
const GRUPO = ['cuerpo', 'cristal', 'rueda', 'faro', 'ambar'];
const COLOR_DEBUG = ['rgb(40,90,130)', 'rgb(220,60,60)', 'rgb(60,200,120)', 'rgb(240,240,200)', 'rgb(245,158,11)'];

function colorA(grupo, t) {
  // control: relleno casi negro, todo depende de la arista
  const base = grupo === 1 ? [2, 6, 10] : grupo === 3 ? [180, 240, 255] : grupo === 4 ? [120, 70, 10] : [4, 8, 14];
  return `rgb(${base[0]},${base[1]},${base[2]})`;
}

function ruido(i) {
  let x = (i * 2654435761) >>> 0;
  x ^= x >>> 13; x = (x * 1274126177) >>> 0; x ^= x >>> 16;
  return (x >>> 0) / 4294967295;
}

function colorB(grupo, key, fill, cy, jit = 0) {
  if (grupo === 1) {
    const t = 0.04 + 0.42 * key;
    return [4 + 10 * t, 11 + 24 * t, 20 + 36 * t];
  }
  if (grupo === 2) {
    const t = 0.16 + 0.42 * key;
    return [6 + 16 * t, 9 + 22 * t, 13 + 30 * t];
  }
  if (grupo === 3) {
    const t = 0.55 + 0.45 * key;
    return [200 * t + 30, 245 * t + 10, 255 * t];
  }
  if (grupo === 4) {
    const t = 0.50 + 0.50 * key;
    return [245 * t, 158 * t, 11 * t];
  }
  const ao = (0.72 + 0.28 * cy) * (0.94 + 0.12 * jit);
  const t = (0.10 + 0.60 * key + 0.16 * fill) * ao;
  return [9 + 34 * t, 22 + 76 * t, 38 + 94 * t];
}

function arista(grupo, rim = 0) {
  const r = Math.min(1, rim);
  if (grupo === 1) return [`rgba(34,211,238,${(0.04 + 0.10 * r).toFixed(3)})`, 0.4];
  if (grupo === 2) return [`rgba(34,211,238,${(0.07 + 0.12 * r).toFixed(3)})`, 0.4];
  if (grupo === 3) return ['rgba(225,250,255,0.55)', 0.5];
  if (grupo === 4) return ['rgba(245,158,11,0.30)', 0.5];
  return [`rgba(34,211,238,${(0.11 + 0.30 * r).toFixed(3)})`, 0.45];
}

/* ── pintado ─────────────────────────────────────────────────────────── */
function pintar(cv, nivel, caja, estilo, ancho, alto) {
  const { V, T, G, nt } = nivel;
  const w = ancho, h = alto;
  cv.width = Math.round(w * DPR);
  cv.height = Math.round(h * DPR);
  const ctx = cv.getContext('2d');
  ctx.scale(DPR, DPR);
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, w, h);

  const { f, r, u } = camara(...ANGULO);
  const nv = V.length / 3;
  const U = new Float32Array(nv), Vv = new Float32Array(nv), D = new Float32Array(nv);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (let i = 0; i < nv; i++) {
    const x = V[i * 3], y = V[i * 3 + 1], z = V[i * 3 + 2];
    const uu = x * r[0] + y * r[1] + z * r[2];
    const vv = x * u[0] + y * u[1] + z * u[2];
    U[i] = uu; Vv[i] = vv; D[i] = x * f[0] + y * f[1] + z * f[2];
    if (uu < u0) u0 = uu; if (uu > u1) u1 = uu;
    if (vv < v0) v0 = vv; if (vv > v1) v1 = vv;
  }
  const pad = caja.pad;
  const s = Math.min((w - 2 * pad) / (u1 - u0), (h - 2 * pad) / (v1 - v0));
  const ox = (w - (u1 - u0) * s) / 2;
  const oy = (h - (v1 - v0) * s) / 2;

  const ymin = -0.38, ymax = 0.38;
  const caras = [];
  for (let t = 0; t < nt; t++) {
    const a = T[t * 3], b = T[t * 3 + 1], c = T[t * 3 + 2];
    const ax = V[a * 3], ay = V[a * 3 + 1], az = V[a * 3 + 2];
    const bx = V[b * 3], by = V[b * 3 + 1], bz = V[b * 3 + 2];
    const cx2 = V[c * 3], cy2 = V[c * 3 + 1], cz2 = V[c * 3 + 2];
    const e1 = [bx - ax, by - ay, bz - az];
    const e2 = [cx2 - ax, cy2 - ay, cz2 - az];
    let nx = e1[1] * e2[2] - e1[2] * e2[1];
    let ny = e1[2] * e2[0] - e1[0] * e2[2];
    let nz = e1[0] * e2[1] - e1[1] * e2[0];
    const ln = Math.hypot(nx, ny, nz);
    if (ln < 1e-12) continue;
    nx /= ln; ny /= ln; nz /= ln;
    if (nx * f[0] + ny * f[1] + nz * f[2] >= 0) continue;
    const key = Math.max(0, nx * LUZ[0] + ny * LUZ[1] + nz * LUZ[2]);
    const fill = Math.max(0, nx * LUZ2[0] + ny * LUZ2[1] + nz * LUZ2[2]);
    const ndv = -Math.max(0, -(nx * f[0] + ny * f[1] + nz * f[2]));
    const rim = Math.pow(1 - Math.abs(ndv), 3);
    const cy = ((ay + by + cy2) / 3 - ymin) / (ymax - ymin);
    caras.push([(D[a] + D[b] + D[c]) / 3, a, b, c, nx, ny, nz, key, fill, cy, G[t], rim, t]);
  }
  caras.sort((p, q) => q[0] - p[0]);

  const px = (i) => (U[i] - u0) * s + ox;
  const py = (i) => h - ((Vv[i] - v0) * s + oy);

  for (const [, a, b, c, nx, ny, nz, key, fill, cy, grupo, rim, idx] of caras) {
    ctx.beginPath();
    ctx.moveTo(px(a), py(a));
    ctx.lineTo(px(b), py(b));
    ctx.lineTo(px(c), py(c));
    ctx.closePath();

    if (DEBUG) {
      ctx.fillStyle = COLOR_DEBUG[grupo];
      ctx.fill();
      continue;
    }
    if (estilo === 'A') {
      ctx.fillStyle = colorA(grupo, key);
      ctx.fill();
      const [col, lw] = grupo === 1 ? ['rgba(34,211,238,0.10)', 0.6] : grupo === 3 ? ['rgba(225,250,255,0.7)', 0.8] : ['rgba(34,211,238,0.34)', 0.8];
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.stroke();
    } else {
      const [R, Gc, B] = colorB(grupo, Math.min(1, key + rim * 0.25), fill, cy, ruido(idx));
      ctx.fillStyle = `rgb(${Math.round(R)},${Math.round(Gc)},${Math.round(B)})`;
      ctx.fill();
      const [col, lw] = grupo === 3 ? ['rgba(225,250,255,0.55)', 0.5] : arista(grupo, rim);
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  }
  return caras.length;
}

const cajaComun = (w, h, padFrac = 0.08) => ({ pad: Math.min(w, h) * padFrac });

function celda(nivel, estilo, vista, etiqueta, w, h) {
  const fig = document.createElement('figure');
  fig.className = 'celda';
  fig.style.width = w + 'px';
  const cv = document.createElement('canvas');
  cv.style.width = w + 'px';
  cv.style.height = h + 'px';
  fig.appendChild(cv);
  const cap = document.createElement('figcaption');
  fig.appendChild(cap);
  escena.appendChild(fig);
  ANGULO[0] = VISTAS[vista][0];
  ANGULO[1] = VISTAS[vista][1];
  const vis = pintar(cv, nivel, cajaComun(w, h), estilo, w, h);
  cap.innerHTML = `<b>${etiqueta}</b><span>${vis.toLocaleString('es')} caras</span>`;
}

/* ── arranque ────────────────────────────────────────────────────────── */
async function iniciar() {
  let niveles;
  try {
    const r = await fetch('./facetas.bin');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    niveles = decodificar(await r.arrayBuffer());
  } catch (e) {
    escena.innerHTML = `<p style="color:#f59e0b;font:13px var(--mono);max-width:560px">
      No se pudo cargar <code>facetas.bin</code> (${e.message}).<br>
      Abre esta página desde un servidor local: <code>python3 -m http.server</code>.</p>`;
    meta.textContent = 'error de carga';
    return;
  }

  meta.textContent = `${niveles.length} niveles · DPR ${DPR} · ${DEBUG ? 'debug de grupos' : 'estilo ' + ESTILO}`;

  if (MODO === 'debug') {
    for (let i = 0; i < niveles.length; i++) {
      celda(niveles[i], 'B', 'trescuartos', `nivel ${i} · ${niveles[i].nt} facetas`, 300, 200);
    }
    pieDer.textContent = 'cuerpo azul · cristal rojo · rueda verde · faro blanco · ámbar naranja';
    return;
  }

  if (MODO === 'matriz') {
    const [w, h] = TAM;
    celda(niveles[1], 'A', 'frontal', `A · frontal · ${w} px`, w, h);
    celda(niveles[1], 'B', 'frontal', `B · frontal · ${w} px`, w, h);
    celda(niveles[1], 'A', 'trescuartos', `A · 3/4 · ${w} px`, w, h);
    celda(niveles[1], 'B', 'trescuartos', `B · 3/4 · ${w} px`, w, h);
    pieDer.textContent = 'nivel 1 · 3.554 facetas · control A contra superficie B';
    return;
  }

  if (MODO === 'solo') {
    const fig = document.createElement('figure');
    fig.className = 'solo';
    const cv = document.createElement('canvas');
    cv.style.aspectRatio = '900 / 560';
    fig.appendChild(cv);
    escena.appendChild(fig);
    const vis = pintar(cv, niveles[NIVEL], cajaComun(900, 560), ESTILO, 900, 560);
    pieDer.textContent = `nivel ${NIVEL} · ${niveles[NIVEL].nt.toLocaleString('es')} facetas · ${vis.toLocaleString('es')} caras · estilo ${ESTILO}`;
    return;
  }

  for (let i = 0; i < niveles.length; i++) celda(niveles[i], ESTILO, 'trescuartos', `${niveles[i].nt.toLocaleString('es')} facetas`, 300, 200);
  pieDer.textContent = `niveles ${niveles.map((n) => n.nt).join(' → ')} · estilo ${ESTILO}`;
}

iniciar();
