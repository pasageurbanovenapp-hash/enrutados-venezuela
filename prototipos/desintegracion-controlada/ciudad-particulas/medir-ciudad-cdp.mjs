/* Mide el experimento de ciudad con el protocolo de depuración.
   Uso: node medir-ciudad-cdp.mjs <puerto> [ancho alto dpr] */
const puerto = Number(process.argv[2] || 9224);
const ancho = process.argv[3] ? Number(process.argv[3]) : null;
const alto = process.argv[4] ? Number(process.argv[4]) : null;
const dpr = process.argv[5] ? Number(process.argv[5]) : null;

const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
const obj = lista.find((t) => t.type === 'page' && t.url.includes('ciudad-particulas'));
const ws = new WebSocket(obj.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const enviar = (method, params) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async (expresion) => {
  const r = await enviar('Runtime.evaluate', { expression: expresion, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
};
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

await enviar('Page.enable');
await enviar('Network.enable');
await enviar('Network.setCacheDisabled', { cacheDisabled: true });
if (ancho) await enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: dpr || 1, mobile: (dpr || 1) > 1 });
else await enviar('Emulation.clearDeviceMetricsOverride');
await enviar('Page.navigate', { url: `http://127.0.0.1:5199/prototipos/desintegracion-controlada/ciudad-particulas/?medir=1&v=${Date.now()}` });

for (let i = 0; i < 120; i++) {
  const m = await evaluar('window.__ciudad && window.__ciudad.medicion ? window.__ciudad.medicion : null');
  if (m) { console.log(JSON.stringify(m)); ws.close(); process.exit(0); }
  await esperar(500);
}
console.error('sin medicion');
process.exit(1);
