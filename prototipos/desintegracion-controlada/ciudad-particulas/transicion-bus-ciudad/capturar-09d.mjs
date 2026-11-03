/* Capturas 09D y verificación de que el estado visual no derivó respecto a 09B. */
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

const viewports = [
  { nombre: 'desktop', ancho: 1440, alto: 757, dpr: 1, mobile: false },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2, mobile: true },
];
const puntos = [0, 0.25, 0.5, 0.75, 1];
const salida = { estados: {}, errores };
fs.mkdirSync('capturas/09d', { recursive: true });

for (const vp of viewports) {
  await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
  for (const variante of ['A', 'B']) {
    for (const t of puntos) {
      await enviar('Page.navigate', { url: `${base}?variante=${variante}&t=${t}&v=${Date.now()}` });
      await esperar(1500);
      const estado = await evaluar('window.__transicion.estado()');
      const hash = await evaluar('window.__transicion.huella()');
      const shot = await enviar('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`capturas/09d/${vp.nombre}-${variante}-${t.toFixed(2)}.png`, Buffer.from(shot.result.data, 'base64'));
      salida.estados[`${vp.nombre}-${variante}-${t.toFixed(2)}`] = { hash, lienzo: estado.lienzo, facetas: estado.facetas, porcentajeFuera: estado.porcentajeFuera };
    }
  }
}
console.log(JSON.stringify(salida, null, 1));
ws.close();
