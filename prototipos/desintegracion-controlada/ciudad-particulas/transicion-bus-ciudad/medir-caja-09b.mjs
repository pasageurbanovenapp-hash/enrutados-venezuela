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

const medir = `(() => {
  const c = document.getElementById('lienzo'); const ctx = c.getContext('2d');
  const w = c.width, h = c.height; const d = ctx.getImageData(0, 0, w, h).data;
  let minx = w, maxx = -1, miny = h, maxy = -1, n = 0;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const i = (y * w + x) * 4;
    if (d[i + 1] > 70 && d[i + 2] > 80) { n++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
  }
  if (maxx < 0) return null;
  return { w, h, anchoRel: (maxx - minx) / w, altoRel: (maxy - miny) / h, topRel: miny / h, centroX: (minx + maxx) / 2 / w, centroY: (miny + maxy) / 2 / h, cobertura: n * 4 / (w * h) };
})()`;

const casos = [
  { nombre: 'desktop', ancho: 1440, alto: 757, dpr: 1, mobile: false },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2, mobile: true },
];
const salida = {};
for (const c of casos) {
  for (const variante of ['A', 'B']) {
    for (const t of [0.75, 1]) {
      await enviar('Emulation.setDeviceMetricsOverride', { width: c.ancho, height: c.alto, deviceScaleFactor: c.dpr, mobile: c.mobile });
      await enviar('Page.navigate', { url: `${base}?variante=${variante}&t=${t}&v=${Date.now()}` });
      await esperar(1500);
      salida[`${c.nombre}-${variante}-t${t}`] = await evaluar(medir);
    }
  }
}
console.log(JSON.stringify(salida, null, 1));
ws.close();
