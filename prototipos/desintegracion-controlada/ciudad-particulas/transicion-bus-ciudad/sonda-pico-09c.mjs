const puerto = Number(process.argv[2] || 9227);
const base = 'http://127.0.0.1:5199/prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/';
const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
const obj = lista.find((t) => t.type === 'page' && t.url.includes('transicion-bus-ciudad'));
const ws = new WebSocket(obj.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const enviar = (method, params) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async (expr) => (await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
await enviar('Page.enable'); await enviar('Network.enable');
await enviar('Network.setCacheDisabled', { cacheDisabled: true });

const vp = { ancho: 1440, alto: 757, dpr: 1, mobile: false };
await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: false });
await enviar('Page.navigate', { url: `${base}?variante=A&t=0&v=${Date.now()}` });
await esperar(1500);

const alto = `(async () => {
  const T = window.__transicion;
  const c = document.getElementById('lienzo');
  const off = document.createElement('canvas'); off.width = 96; off.height = 54;
  const octx = off.getContext('2d', { willReadFrequently: true });
  const out = {};
  for (const variante of ['A', 'B']) {
    T.fijarVariante(variante);
    let prev = null; const filas = [];
    for (let k = 0; k <= 40; k++) {
      const t = 0.5 + k * 0.0025;
      T.fijarT(t);
      await new Promise((r) => requestAnimationFrame(() => r()));
      octx.drawImage(c, 0, 0, 96, 54);
      const d = octx.getImageData(0, 0, 96, 54).data;
      const sig = new Float32Array(96 * 54);
      for (let i = 0, j = 0; i < d.length; i += 4, j++) sig[j] = (d[i] + d[i+1] + d[i+2]) / 3;
      let diff = 0;
      if (prev) { for (let i = 0; i < sig.length; i++) diff += Math.abs(sig[i] - prev[i]); diff /= sig.length; }
      prev = sig;
      const g = T.geometria();
      filas.push({ t: Number(t.toFixed(4)), diff: Number(diff.toFixed(2)), vertFuera: g.vertFuera, bboxAncho: Number((g.bbox.maxX - g.bbox.minX).toFixed(1)) });
    }
    out[variante] = filas;
  }
  return out;
})()`;
const r = await evaluar(alto);
for (const v of ['A','B']) {
  const f = r[v];
  console.log(`\n--- ${v} (0.50 -> 0.60, paso 0.0025) ---`);
  console.log(f.map((x) => `${x.t}:${x.diff}`).join(' '));
  const maxV = Math.max(...f.map((x) => x.vertFuera));
  const tMax = f.filter((x) => x.vertFuera === maxV).map((x) => x.t);
  console.log('vertices fuera max', maxV, 'en t', tMax.slice(0, 5));
}
ws.close();
