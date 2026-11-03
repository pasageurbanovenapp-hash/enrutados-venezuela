/* Validación fase 09B. Uso: node validar-transicion-cdp.mjs <puerto> */
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
const evaluar = async (expr) => {
  const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
};
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

await enviar('Runtime.enable');
await enviar('Page.enable');
await enviar('Network.enable');
await enviar('Network.setCacheDisabled', { cacheDisabled: true });
await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
fs.mkdirSync('capturas', { recursive: true });

const viewports = [
  { nombre: 'desktop', ancho: 1440, alto: 757, dpr: 1, mobile: false },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2, mobile: true },
];
const variantes = ['A', 'B'];
const puntos = [0, 0.25, 0.5, 0.75, 1];
const salida = { estados: {}, hashes: {}, determinismo: {}, reversibilidad: {}, overflow: {}, reducido: {}, resize: {}, coste: {}, errores };

async function cargar(vp, variante, t, version = Date.now()) {
  if (vp) await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
  await enviar('Page.navigate', { url: `${base}?variante=${variante}&t=${t}&v=${version}` });
  await esperar(1500);
}

for (const vp of viewports) {
  for (const variante of variantes) {
    for (const t of puntos) {
      await cargar(vp, variante, t);
      const clave = `${vp.nombre}-${variante}-${t.toFixed(2)}`;
      const estado = await evaluar('window.__transicion.estado()');
      const huella = await evaluar('window.__transicion.huella()');
      const overflow = await evaluar('document.documentElement.scrollWidth <= window.innerWidth + 1');
      const shot = await enviar('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`capturas/${clave}.png`, Buffer.from(shot.result.data, 'base64'));
      salida.estados[clave] = estado;
      salida.hashes[clave] = huella;
      salida.overflow[clave] = overflow;
    }
  }
}

// Determinismo y reversibilidad (desktop, variante A)
const ida = {};
for (const t of puntos) { await cargar(viewports[0], 'A', t); ida[t] = await evaluar('window.__transicion.huella()'); }
const vuelta = {};
for (const t of [...puntos].reverse()) { await cargar(viewports[0], 'A', t); vuelta[t] = await evaluar('window.__transicion.huella()'); }
salida.reversibilidad = {
  ida,
  vuelta,
  coincide: puntos.every((t) => ida[t] === vuelta[t]),
};
await cargar(viewports[0], 'A', 0.5);
const h1 = await evaluar('window.__transicion.huella()');
await cargar(viewports[0], 'A', 0.5);
const h2 = await evaluar('window.__transicion.huella()');
salida.determinismo = { h1, h2, coincide: h1 === h2 };

// Coste de dibujo (mediana/p95, 40 muestras) en ciudad y a mitad
for (const vp of viewports) {
  for (const variante of variantes) {
    for (const t of [0.5, 1]) {
      await cargar(vp, variante, t);
      const r = await evaluar('window.__transicion.medirDibujo(40)');
      salida.coste[`${vp.nombre}-${variante}-${t}`] = r;
    }
  }
}

// Movimiento reducido: sin reproducción automática ni bucle
await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await cargar(viewports[0], 'A', 0.5);
const hA = await evaluar('window.__transicion.huella()');
const tA = await evaluar('window.__transicion.estado().t');
await esperar(900);
const hB = await evaluar('window.__transicion.huella()');
const tB = await evaluar('window.__transicion.estado().t');
salida.reducido = { tA, tB, hA, hB, estable: hA === hB && tA === tB };
await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });

// Redimensionado: mismo nivel y cambio de nivel
await cargar(viewports[0], 'A', 0.5);
await enviar('Emulation.setDeviceMetricsOverride', { width: 1200, height: 757, deviceScaleFactor: 1, mobile: false });
await esperar(700);
const r1 = await evaluar('window.__transicion.estado()');
await enviar('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await esperar(700);
const r2 = await evaluar('window.__transicion.estado()');
salida.resize = {
  mismoNivel: r1,
  cambioNivel: r2,
  finito: Number.isFinite(r2.lienzo.W) && Number.isFinite(r2.lienzo.H) && r2.facetas === r2.destinos,
};

salida.errores = errores;
console.log(JSON.stringify(salida));
ws.close();
