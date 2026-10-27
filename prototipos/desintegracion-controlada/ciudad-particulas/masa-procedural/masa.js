/* Ciudad de masa: dos filas de prismas planos, calle central, sin props.
   Presupuesto de facetas exacto mediante subdivisión en rejilla. */

const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
const nota = document.getElementById('nota');
const botonesPresupuesto = [...document.querySelectorAll('[data-presupuesto]')];
const botonesVista = [...document.querySelectorAll('[data-vista]')];
const botonesModo = [...document.querySelectorAll('[data-modo]')];

const CALLE = 5.2;
const ACERA = 0.6;
const PROF = 4.2;
const HUECO = 0.8;
const ALTURAS = [5.4, 7.6, 3.8, 9.2, 4.6, 6.4, 8.2];
const ANCHOS = [4.2, 3.6, 5.0, 3.8, 4.6, 4.0, 4.4];
const SETBACK = new Set([1, 3, 6]);
const LARGO = ANCHOS.reduce((a, b) => a + b, 0) + HUECO * (ANCHOS.length - 1);

let presupuesto = 4003;
let vista = 'calle';
let modo = 'facetas';
let W = 0, H = 0, dpr = 1;
let facetas = [];
let celdas = 0;

function norm(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function azar(i, sal) { let v = Math.imul(i + 1, 0x45d9f3b) ^ sal; v = Math.imul(v ^ (v >>> 16), 0x45d9f3b); v = Math.imul(v ^ (v >>> 16), 0x45d9f3b); return ((v ^ (v >>> 16)) >>> 0) / 4294967296; }

const LUZ = norm([-0.45, 0.82, 0.36]);

function caja(x0, x1, y0, y1, z0, z1, tinte, id) {
  const caras = [
    { n: [0, 0, 1], p: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], u: [1, 0, 0], v: [0, 1, 0], w: x1 - x0, h: y1 - y0 },
    { n: [0, 0, -1], p: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], u: [-1, 0, 0], v: [0, 1, 0], w: x1 - x0, h: y1 - y0 },
    { n: [1, 0, 0], p: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], u: [0, 0, -1], v: [0, 1, 0], w: z1 - z0, h: y1 - y0 },
    { n: [-1, 0, 0], p: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], u: [0, 0, 1], v: [0, 1, 0], w: z1 - z0, h: y1 - y0 },
    { n: [0, 1, 0], p: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], u: [1, 0, 0], v: [0, 0, 1], w: x1 - x0, h: z1 - z0 },
  ];
  caras.forEach((c, k) => {
    const lum = 0.52 + 0.76 * Math.max(0, dot(c.n, LUZ));
    const base = k === 4 ? [52, 98, 108] : tinte;
    const col = base.map((v) => Math.min(255, Math.round(v * lum)));
    const celdasU = Math.max(1, Math.round(c.w / (1 / celdas)));
    const celdasV = Math.max(1, Math.round(c.h / (1 / celdas)));
    for (let iu = 0; iu < celdasU; iu++) {
      for (let iv = 0; iv < celdasV; iv++) {
        const u0 = iu / celdasU, u1 = (iu + 1) / celdasU;
        const v0 = iv / celdasV, v1 = (iv + 1) / celdasV;
        const p = (uu, vv) => [
          c.p[0][0] + c.u[0] * uu * c.w + c.v[0] * vv * c.h,
          c.p[0][1] + c.u[1] * uu * c.w + c.v[1] * vv * c.h,
          c.p[0][2] + c.u[2] * uu * c.w + c.v[2] * vv * c.h,
        ];
        const a = p(u0, v0), b = p(u1, v0), d = p(u1, v1), e = p(u0, v1);
        const jitter = 0.92 + azar(id * 131 + iu * 17 + iv, 7) * 0.16;
        facetas.push({ a, b, c: d, col: col.map((x) => Math.min(255, Math.round(x * jitter))), n: c.n });
        facetas.push({ a, b: d, c: e, col: col.map((x) => Math.min(255, Math.round(x * jitter))), n: c.n });
      }
    }
  });
}

function construir(objetivo) {
  let mejor = 0;
  let mejorFacetas = null;
  for (let c = 0.4; c <= 1.6; c += 0.005) {
    celdas = c;
    facetas = [];
    let z = -LARGO / 2;
    ANCHOS.forEach((w, i) => {
      const h = ALTURAS[i];
      const enFila = (signo) => {
        const baseX = signo > 0 ? CALLE / 2 + ACERA : -(CALLE / 2 + ACERA + PROF);
        const x0 = baseX, x1 = baseX + PROF;
        const tinte = [50 + Math.round(azar(i, 3) * 18), 126 + Math.round(azar(i, 5) * 28), 140 + Math.round(azar(i, 9) * 22)];
        if (SETBACK.has(i)) {
          const hb = h * 0.68;
          caja(x0, x1, 0, hb, z, z + w, tinte, i * 2 + (signo > 0 ? 1 : 0));
          caja(x0 + 0.7, x1 - 0.7, hb, h, z + 0.6, z + w - 0.6, tinte, i * 2 + 40 + (signo > 0 ? 1 : 0));
        } else {
          caja(x0, x1, 0, h, z, z + w, tinte, i * 2 + (signo > 0 ? 1 : 0));
        }
      };
      enFila(1); enFila(-1);
      z += w + HUECO;
    });
    const n = facetas.length;
    if (!mejorFacetas || Math.abs(n - objetivo) < Math.abs(mejorFacetas - objetivo)) {
      mejorFacetas = n; mejor = c;
    }
    if (n > objetivo * 1.35) break;
  }
  celdas = mejor;
  facetas = [];
  let z = -LARGO / 2;
  ANCHOS.forEach((w, i) => {
    const h = ALTURAS[i];
    const enFila = (signo) => {
      const baseX = signo > 0 ? CALLE / 2 + ACERA : -(CALLE / 2 + ACERA + PROF);
      const x0 = baseX, x1 = baseX + PROF;
      const tinte = [50 + Math.round(azar(i, 3) * 18), 126 + Math.round(azar(i, 5) * 28), 140 + Math.round(azar(i, 9) * 22)];
      if (SETBACK.has(i)) {
        const hb = h * 0.68;
        caja(x0, x1, 0, hb, z, z + w, tinte, i * 2 + (signo > 0 ? 1 : 0));
        caja(x0 + 0.7, x1 - 0.7, hb, h, z + 0.6, z + w - 0.6, tinte, i * 2 + 40 + (signo > 0 ? 1 : 0));
      } else {
        caja(x0, x1, 0, h, z, z + w, tinte, i * 2 + (signo > 0 ? 1 : 0));
      }
    };
    enFila(1); enFila(-1);
    z += w + HUECO;
  });
}

function camara() {
  const objetivo = [0, 2.1, 0];
  const retrato = H > W;
  if (vista === 'calle') {
    return retrato
      ? { ojo: [0, 2.6, LARGO / 2 + 25], objetivo: [0, 5.2, -6], fov: 44 }
      : { ojo: [0, 2.2, LARGO / 2 + 19], objetivo: [0, 2.6, -6], fov: 50 };
  }
  return { ojo: [18, 14, 28], objetivo, fov: 50 };
}

function medir() {
  const caja = canvas.getBoundingClientRect();
  W = caja.width; H = caja.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function pintar() {
  if (!W || !H) return;
  const { ojo, objetivo, fov } = camara();
  const f = norm(sub(objetivo, ojo));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const focal = (H / 2) / Math.tan((fov * Math.PI / 180) / 2);

  const fondo = ctx.createLinearGradient(0, 0, 0, H);
  fondo.addColorStop(0, '#050d13'); fondo.addColorStop(0.6, '#071722'); fondo.addColorStop(1, '#0a2230');
  ctx.fillStyle = fondo; ctx.fillRect(0, 0, W, H);
  const halo = ctx.createRadialGradient(W / 2, H * 0.54, 0, W / 2, H * 0.54, W * 0.42);
  halo.addColorStop(0, 'rgba(55,200,208,0.12)');
  halo.addColorStop(1, 'rgba(55,200,208,0)');
  ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

  const proy = (p) => {
    const rel = sub(p, ojo);
    const z = dot(rel, f);
    if (z < 0.1) return null;
    return [W / 2 + focal * dot(rel, r) / z, H / 2 - focal * dot(rel, u) / z, z];
  };

  // suelo y calle
  const suelo = [[-60, 0, -60], [60, 0, -60], [60, 0, 60], [-60, 0, 60]].map(proy);
  if (suelo.every(Boolean)) {
    ctx.fillStyle = '#0a1c26'; ctx.beginPath();
    ctx.moveTo(suelo[0][0], suelo[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(suelo[i][0], suelo[i][1]);
    ctx.closePath(); ctx.fill();
  }
  const calzada = [[-CALLE / 2, 0.01, -LARGO / 2 - 8], [CALLE / 2, 0.01, -LARGO / 2 - 8], [CALLE / 2, 0.01, LARGO / 2 + 8], [-CALLE / 2, 0.01, LARGO / 2 + 8]].map(proy);
  if (calzada.every(Boolean)) {
    ctx.fillStyle = '#0e2b36'; ctx.beginPath();
    ctx.moveTo(calzada[0][0], calzada[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(calzada[i][0], calzada[i][1]);
    ctx.closePath(); ctx.fill();
  }
  for (const signo of [-1, 1]) {
    const x0 = signo > 0 ? CALLE / 2 : -(CALLE / 2 + ACERA);
    const x1 = x0 + ACERA;
    const acera = [[x0, 0.06, -LARGO / 2 - 8], [x1, 0.06, -LARGO / 2 - 8], [x1, 0.06, LARGO / 2 + 8], [x0, 0.06, LARGO / 2 + 8]].map(proy);
    if (acera.every(Boolean)) {
      ctx.fillStyle = '#163a46'; ctx.beginPath();
      ctx.moveTo(acera[0][0], acera[0][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(acera[i][0], acera[i][1]);
      ctx.closePath(); ctx.fill();
    }
  }

  // facetas
  const dibujables = [];
  for (const fa of facetas) {
    const pa = proy(fa.a), pb = proy(fa.b), pc = proy(fa.c);
    if (!pa || !pb || !pc) continue;
    if (dot(fa.n, sub(fa.a, ojo)) > 0) continue;
    const area = (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0]);
    if (area >= 0) continue;
    dibujables.push({ pa, pb, pc, col: fa.col, z: (pa[2] + pb[2] + pc[2]) / 3, cx: (pa[0] + pb[0] + pc[0]) / 3, cy: (pa[1] + pb[1] + pc[1]) / 3 });
  }
  dibujables.sort((a, b) => b.z - a.z);
  if (modo === 'facetas') {
    for (const d of dibujables) {
      ctx.fillStyle = `rgb(${d.col[0]},${d.col[1]},${d.col[2]})`;
      ctx.beginPath(); ctx.moveTo(d.pa[0], d.pa[1]); ctx.lineTo(d.pb[0], d.pb[1]); ctx.lineTo(d.pc[0], d.pc[1]); ctx.closePath(); ctx.fill();
    }
  } else {
    for (const d of dibujables) {
      const b = Math.max(0.55, Math.min(1.2, 1.25 - d.z * 0.010));
      ctx.fillStyle = `rgb(${Math.round(d.col[0] * b)},${Math.round(d.col[1] * b)},${Math.round(d.col[2] * b)})`;
      ctx.fillRect(d.cx - 1.5, d.cy - 1.5, 3, 3);
    }
  }

  // red de movilidad
  const ruta = [];
  for (let i = 0; i <= 40; i++) {
    const z = -LARGO / 2 - 4 + (LARGO + 8) * i / 40;
    ruta.push(proy([Math.sin(i * 0.45) * 1.3, 1.0, z]));
  }
  ctx.strokeStyle = 'rgba(55,200,208,0.85)'; ctx.lineWidth = 1.2; ctx.beginPath();
  ruta.forEach((p, i) => { if (!p) return; if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
  ctx.stroke();
  for (let i = 0; i <= 40; i += 8) {
    const p = ruta[i]; if (!p) continue;
    ctx.fillStyle = i % 16 === 0 ? '#e89a36' : '#bff8ff';
    ctx.fillRect(p[0] - 1.6, p[1] - 1.6, 3.2, 3.2);
  }

  hud.textContent = `${facetas.length.toLocaleString('es')} facetas · ${celdas.toFixed(2)} celdas/ud · ${vista} · ${modo}`;
  nota.textContent = `objetivo ${presupuesto.toLocaleString('es')} · ${modo === 'facetas' ? 'masa' : 'partículas'}`;
}

function fijarPresupuesto(v) {
  presupuesto = v;
  construir(v);
  for (const b of botonesPresupuesto) b.setAttribute('aria-pressed', String(Number(b.dataset.presupuesto) === v));
  pintar();
}
function fijarVista(v) {
  vista = v;
  for (const b of botonesVista) b.setAttribute('aria-pressed', String(b.dataset.vista === v));
  pintar();
}
function fijarModo(m) {
  modo = m;
  for (const b of botonesModo) b.setAttribute('aria-pressed', String(b.dataset.modo === m));
  pintar();
}

for (const b of botonesPresupuesto) b.addEventListener('click', () => fijarPresupuesto(Number(b.dataset.presupuesto)));
for (const b of botonesVista) b.addEventListener('click', () => fijarVista(b.dataset.vista));
for (const b of botonesModo) b.addEventListener('click', () => fijarModo(b.dataset.modo));

medir();
construir(presupuesto);
pintar();
new ResizeObserver(() => { medir(); pintar(); }).observe(canvas);

window.__masa = { estado: () => ({ facetas: facetas.length, objetivo: presupuesto, celdas, vista, modo, lienzo: { W, H, dpr } }), fijarPresupuesto, fijarVista, fijarModo };
