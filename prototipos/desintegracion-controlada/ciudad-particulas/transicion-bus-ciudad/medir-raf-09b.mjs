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
await enviar('Page.enable');
await enviar('Network.enable');
await enviar('Network.setCacheDisabled', { cacheDisabled: true });

const casos = [
  { nombre: 'desktop', ancho: 1440, alto: 757, dpr: 1 },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2 },
];
const salida = {};
for (const c of casos) {
  for (const t of [0.5, 1]) {
    await enviar('Emulation.setDeviceMetricsOverride', { width: c.ancho, height: c.alto, deviceScaleFactor: c.dpr, mobile: c.dpr > 1 });
    await enviar('Page.navigate', { url: `${base}?variante=A&t=${t}&v=${Date.now()}` });
    await esperar(1500);
    const r = await evaluar(`new Promise((res) => {
      const tiempos = [], intervalos = []; let n = 0, ant = 0;
      function paso(ts) {
        if (n > 0) intervalos.push(ts - ant);
        ant = ts;
        const a = performance.now();
        window.__transicion.dibujar();
        tiempos.push(performance.now() - a);
        if (++n < 40) requestAnimationFrame(paso);
        else {
          const orden = (v) => [...v].sort((x, y) => x - y);
          const med = (v) => { const o = orden(v); return Number(o[Math.floor(o.length * 0.5)].toFixed(2)); };
          const p95 = (v) => { const o = orden(v); return Number(o[Math.min(o.length - 1, Math.floor(o.length * 0.95))].toFixed(2)); };
          res({ dibujar: { mediana: med(tiempos), p95: p95(tiempos) }, intervalo: { mediana: med(intervalos), p95: p95(intervalos) } });
        }
      }
      requestAnimationFrame(paso);
    })`);
    salida[`${c.nombre}-t${t}`] = r;
  }
}
console.log(JSON.stringify(salida, null, 1));
ws.close();
