/* Fase 09C — validación de movimiento. Uso: node validar-movimiento-cdp.mjs <puerto> */
import fs from 'node:fs';
const puerto = Number(process.argv[2] || 9227);
const base = 'http://127.0.0.1:5199/prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/';
const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
const obj = lista.find((t) => t.type === 'page' && t.url.includes('transicion-bus-ciudad'));
const ws = new WebSocket(obj.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map(); const errores = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails?.text || 'excepción');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push('console.error');
};
const enviar = (method, params) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async (expr) => (await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
await enviar('Runtime.enable'); await enviar('Page.enable'); await enviar('Network.enable');
await enviar('Network.setCacheDisabled', { cacheDisabled: true });
await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
fs.mkdirSync('capturas/movimiento', { recursive: true });

const PASOS = 101;
const funcion = (variante, direccion) => `(async () => {
  const T = window.__transicion;
  T.fijarVariante('${variante}');
  const c = document.getElementById('lienzo');
  const W = c.width, H = c.height;
  const ctx = c.getContext('2d');
  const off = document.createElement('canvas'); off.width = 96; off.height = 54;
  const octx = off.getContext('2d', { willReadFrequently: true });
  let prev = null;
  const filas = [];
  const contar = (x0, y0, w0, h0) => {
    const dd = ctx.getImageData(x0, y0, w0, h0).data;
    let n = 0;
    for (let i = 0; i < dd.length; i += 4) if ((dd[i] + dd[i+1] + dd[i+2]) / 3 > 55) n += 1;
    return n;
  };
  for (let k = 0; k < ${PASOS}; k++) {
    const t = ${direccion === 'ida' ? 'k / (PASOS - 1)' : '1 - k / (PASOS - 1)'};
    T.fijarT(t);
    await new Promise((r) => requestAnimationFrame(() => r()));
    octx.drawImage(c, 0, 0, 96, 54);
    const d = octx.getImageData(0, 0, 96, 54).data;
    const sig = new Float32Array(96 * 54);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) sig[j] = (d[i] + d[i+1] + d[i+2]) / 3;
    let diff = 0;
    if (prev) { for (let i = 0; i < sig.length; i++) diff += Math.abs(sig[i] - prev[i]); diff /= sig.length; }
    prev = sig;
    let sh = 2166136261;
    for (let i = 0; i < sig.length; i++) { sh ^= Math.round(sig[i]); sh = Math.imul(sh, 16777619); }
    let cob = 0;
    for (let i = 0; i < sig.length; i++) if (sig[i] > 55) cob += 1;
    const bordes = {
      arriba: contar(0, 0, W, 3), abajo: contar(0, H - 3, W, 3),
      izquierda: contar(0, 0, 3, H), derecha: contar(W - 3, 0, 3, H),
    };
    filas.push({ t, diff, sigHash: (sh >>> 0).toString(16), cobertura: cob / sig.length, bordes, geo: T.geometria() });
  }
  return { W, H, filas };
})()`.replaceAll('PASOS', String(PASOS));

const pausas = `(async () => {
  const T = window.__transicion; const out = {};
  for (const t of [0.25, 0.5, 0.75]) {
    T.fijarT(t);
    await new Promise((r) => requestAnimationFrame(() => r()));
    const h1 = T.huella();
    await new Promise((r) => requestAnimationFrame(() => r()));
    await new Promise((r) => requestAnimationFrame(() => r()));
    const h2 = T.huella();
    out[t] = { h1, h2, estable: h1 === h2 };
  }
  return out;
})()`;

const coste = `(async () => new Promise((res) => {
  const T = window.__transicion;
  for (let i = 0; i < 10; i++) T.dibujar();
  const tiempos = [], ints = []; let n = 0, ant = 0;
  const med = (v) => { const o = [...v].sort((a, b) => a - b); return Number(o[Math.floor(o.length * 0.5)].toFixed(2)); };
  const p95 = (v) => { const o = [...v].sort((a, b) => a - b); return Number(o[Math.min(o.length - 1, Math.floor(o.length * 0.95))].toFixed(2)); };
  function paso(ts) {
    if (n > 0) ints.push(ts - ant); ant = ts;
    const a = performance.now(); T.dibujar(); tiempos.push(performance.now() - a);
    if (++n < 40) requestAnimationFrame(paso);
    else res({ dibujar: { mediana: med(tiempos), p95: p95(tiempos) }, intervalo: { mediana: med(ints), p95: p95(ints) } });
  }
  requestAnimationFrame(paso);
}))`;

const viewports = [
  { nombre: 'desktop', ancho: 1440, alto: 757, dpr: 1, mobile: false },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2, mobile: true },
];
const salida = { corridas: {}, pausas: {}, coste: {}, resize: {}, errores };

for (const vp of viewports) {
  await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
  await enviar('Page.navigate', { url: `${base}?variante=A&t=0&v=${Date.now()}` });
  await esperar(1600);
  salida.corridas[vp.nombre] = { lienzo: await evaluar('window.__transicion.estado().lienzo') };

  for (const variante of ['A', 'B']) {
    const ida = await evaluar(funcion(variante, 'ida'));
    const vuelta = await evaluar(funcion(variante, 'vuelta'));
    const filas = ida.filas;
    const diffs = filas.slice(1).map((f) => f.diff);
    const orden = [...diffs].sort((a, b) => a - b);
    const med = orden[Math.floor(orden.length * 0.5)];
    const p95 = orden[Math.floor(orden.length * 0.95)];
    const max = orden[orden.length - 1];
    const umbral = Math.max(6, med * 4);
    const picos = filas.slice(1).filter((f) => f.diff > umbral).map((f) => ({ t: Number(f.t.toFixed(2)), diff: Number(f.diff.toFixed(2)) }));
    let reversas = 0;
    for (let i = 0; i < ida.filas.length; i++) {
      const j = vuelta.filas.length - 1 - i;
      if (ida.filas[i].sigHash !== vuelta.filas[j].sigHash) reversas += 1;
    }
    let maxVert = 0, maxCent = 0;
    let maxSaltoBBox = 0, prev = null;
    for (const f of filas) {
      maxVert = Math.max(maxVert, f.geo.vertFuera);
      maxCent = Math.max(maxCent, f.geo.centFuera);
      const ancho = f.geo.bbox.maxX - f.geo.bbox.minX;
      if (prev !== null) maxSaltoBBox = Math.max(maxSaltoBBox, Math.abs(ancho - prev));
      prev = ancho;
    }
    const cob = filas.map((f) => f.cobertura);
    salida.corridas[vp.nombre][variante] = {
      W: ida.W, H: ida.H,
      muestras: filas.length,
      diff: { mediana: Number(med.toFixed(2)), p95: Number(p95.toFixed(2)), maximo: Number(max.toFixed(2)), picos },
      reversibilidad: { discrepancias: reversas, total: ida.filas.length },
      cobertura: { min: Number(Math.min(...cob).toFixed(3)), max: Number(Math.max(...cob).toFixed(3)) },
      fuera: { verticesMax: maxVert, verticesTotal: filas[0].geo.vertTotal, centroidesMax: maxCent, centroidesTotal: filas[0].geo.centTotal },
      bbox: { saltoMaxAncho: Number(maxSaltoBBox.toFixed(1)) },
      bordesMax: {
        arriba: Math.max(...filas.map((f) => f.bordes.arriba)),
        abajo: Math.max(...filas.map((f) => f.bordes.abajo)),
        izquierda: Math.max(...filas.map((f) => f.bordes.izquierda)),
        derecha: Math.max(...filas.map((f) => f.bordes.derecha)),
      },
    };
  }

  for (const variante of ['A', 'B']) {
    await evaluar(`window.__transicion.fijarVariante('${variante}')`);
    await evaluar(`window.__transicion.fijarT(1)`);
    salida.pausas[`${vp.nombre}-${variante}`] = await evaluar(pausas);
    for (const t of [0.5, 1]) {
      await evaluar(`window.__transicion.fijarT(${t})`);
      salida.coste[`${vp.nombre}-${variante}-${t}`] = await evaluar(coste);
    }
    await evaluar(`window.__transicion.fijarT(0.5)`);
    await esperar(100);
    const shot = await enviar('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`capturas/movimiento/${vp.nombre}-${variante}-vuelta-0.50.png`, Buffer.from(shot.result.data, 'base64'));
  }
}

// resize
await evaluar(`window.__transicion.fijarT(0.5)`);
await enviar('Emulation.setDeviceMetricsOverride', { width: 1200, height: 757, deviceScaleFactor: 1, mobile: false });
await esperar(600);
const r1 = await evaluar('window.__transicion.estado()');
const g1 = await evaluar('window.__transicion.geometria()');
await enviar('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await esperar(600);
const r2 = await evaluar('window.__transicion.estado()');
const g2 = await evaluar('window.__transicion.geometria()');
salida.resize = { mismoNivel: r1, geometria1: g1 && { finito: Number.isFinite(g1.bbox.minX), vertTotal: g1.vertTotal }, cambioNivel: r2, geometria2: g2 && { finito: Number.isFinite(g2.bbox.minX), vertTotal: g2.vertTotal } };
salida.errores = errores;
console.log(JSON.stringify(salida));
ws.close();
