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

const viewports = [
  { nombre: 'desktop', ancho: 1440, alto: 757, dpr: 1, mobile: false },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2, mobile: true },
];
const salida = {};
for (const vp of viewports) {
  await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
  for (const variante of ['A', 'B']) {
    for (const t of [0.5, 1]) {
      await enviar('Page.navigate', { url: `${base}?variante=${variante}&t=${t}&v=${Date.now()}` });
      await esperar(1400);
      const r = await evaluar(`new Promise((res) => {
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
      })`);
      salida[`${vp.nombre}-${variante}-t${t}`] = r;
    }
  }
}
console.log(JSON.stringify(salida, null, 1));
ws.close();
