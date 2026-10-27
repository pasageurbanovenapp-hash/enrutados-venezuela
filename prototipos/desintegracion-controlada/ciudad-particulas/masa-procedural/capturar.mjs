import fs from 'node:fs';
const puerto = Number(process.argv[2] || 9230);
const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
const obj = lista.find((t) => t.type === 'page' && t.url.includes('masa-procedural'));
const ws = new WebSocket(obj.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const enviar = (method, params) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => (await enviar('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
await enviar('Page.enable'); await enviar('Network.enable');
await enviar('Network.setCacheDisabled', { cacheDisabled: true });
fs.mkdirSync('capturas', { recursive: true });
const casos = [
  { nombre: 'escritorio-calle-facetas', ancho: 1440, alto: 757, dpr: 1, vista: 'calle', modo: 'facetas', presupuesto: 4003 },
  { nombre: 'escritorio-calle-puntos', ancho: 1440, alto: 757, dpr: 1, vista: 'calle', modo: 'puntos', presupuesto: 4003 },
  { nombre: 'escritorio-trescuartos', ancho: 1440, alto: 757, dpr: 1, vista: 'trescuartos', modo: 'facetas', presupuesto: 4003 },
  { nombre: 'movil-calle-facetas', ancho: 390, alto: 844, dpr: 2, vista: 'calle', modo: 'facetas', presupuesto: 2282 },
  { nombre: 'movil-calle-puntos', ancho: 390, alto: 844, dpr: 2, vista: 'calle', modo: 'puntos', presupuesto: 2282 },
];
for (const c of casos) {
  await enviar('Emulation.setDeviceMetricsOverride', { width: c.ancho, height: c.alto, deviceScaleFactor: c.dpr, mobile: c.dpr > 1 });
  await enviar('Page.navigate', { url: `http://127.0.0.1:5199/prototipos/desintegracion-controlada/ciudad-particulas/masa-procedural/?v=${Date.now()}` });
  await esperar(1200);
  await ev(`window.__masa.fijarPresupuesto(${c.presupuesto}); window.__masa.fijarVista('${c.vista}'); window.__masa.fijarModo('${c.modo}')`);
  await esperar(250);
  const shot = await enviar('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`capturas/${c.nombre}.png`, Buffer.from(shot.result.data, 'base64'));
  console.log(c.nombre, JSON.stringify(await ev('window.__masa.estado()')));
}
ws.close();
