/* Captura la ciudad en un viewport y presupuesto dados.
   Uso: node capturar-ciudad-cdp.mjs <puerto> <nombre> <query> [ancho] [alto] [dpr] */
import fs from 'node:fs';
const puerto = Number(process.argv[2]);
const nombre = process.argv[3];
const query = process.argv[4] || '';
const ancho = process.argv[5] ? Number(process.argv[5]) : null;
const alto = process.argv[6] ? Number(process.argv[6]) : null;
const dpr = process.argv[7] ? Number(process.argv[7]) : null;

const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
const obj = lista.find((t) => t.type === 'page' && t.url.includes('ciudad-particulas'));
const ws = new WebSocket(obj.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const enviar = (method, params) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
await enviar('Page.enable');
await enviar('Network.enable');
await enviar('Network.setCacheDisabled', { cacheDisabled: true });
if (ancho) await enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: dpr || 1, mobile: (dpr || 1) > 1 });
else await enviar('Emulation.clearDeviceMetricsOverride');
await enviar('Page.navigate', { url: `http://127.0.0.1:5199/prototipos/desintegracion-controlada/ciudad-particulas/?${query}` });
await esperar(1800);
const shot = await enviar('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync('capturas', { recursive: true });
fs.writeFileSync(`capturas/${nombre}.png`, Buffer.from(shot.result.data, 'base64'));
const estado = await enviar('Runtime.evaluate', { expression: 'window.__ciudad ? window.__ciudad.estado() : null', returnByValue: true });
console.log(nombre, JSON.stringify(estado.result?.result?.value));
ws.close();
