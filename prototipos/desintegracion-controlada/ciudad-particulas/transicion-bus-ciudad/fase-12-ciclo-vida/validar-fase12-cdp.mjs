/* Fase 12 — validación del contrato de instancia. Uso: node validar-fase12-cdp.mjs <puerto> */
import fs from 'node:fs';
const puerto = Number(process.argv[2] || 9229);
const baseRef = 'http://127.0.0.1:5199/prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/index.html';
const baseLab = 'http://127.0.0.1:5199/prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/fase-12-ciclo-vida/';
const validURL = 'http://127.0.0.1:5199/prototipos/facetas-retexture/facetas.bin';

const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
const obj = lista.find((t) => t.type === 'page');
const ws = new WebSocket(obj.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map(); let errores = [];
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

const viewports = [
  { nombre: 'desktop', ancho: 1440, alto: 757, dpr: 1, mobile: false },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2, mobile: true },
];
const puntos = [0, 0.25, 0.5, 0.75, 1];
const refs = {};
const salida = { refs: {}, escenarios: {}, errores: [] };

async function metrics(vp) {
  await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
}
async function nav(url) {
  await enviar('Page.navigate', { url: `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}` });
}
async function esperarExpr(expr, timeout = 15000) {
  const fin = Date.now() + timeout;
  while (Date.now() < fin) {
    if (await evaluar(expr)) return true;
    await esperar(120);
  }
  return false;
}
async function esperarFase(fase, timeout = 15000) {
  return esperarExpr(`window.__lab && window.__lab.estado() && window.__lab.estado().fase === '${fase}'`, timeout);
}

// 1. Referencias de la variante A en la página original
for (const vp of viewports) {
  await metrics(vp);
  refs[vp.nombre] = {};
  for (const t of puntos) {
    await nav(`${baseRef}?variante=A&t=${t}`);
    await esperarExpr('!!window.__transicion');
    await esperar(350);
    refs[vp.nombre][t] = await evaluar('({ hash: window.__transicion.huella(), lienzo: window.__transicion.estado().lienzo })');
  }
}
salida.refs = refs;

// 2. Laboratorio
await nav(baseLab);
await esperarExpr('!!window.__lab');
await esperar(300);

for (const vp of viewports) {
  await metrics(vp);
  const r = { referencias: refs[vp.nombre], lienzos: {}, hashes: {} };

  // A. crear, estados y paridad visual
  await evaluar('window.__lab.crear()');
  r.ready = await esperarFase('ready');
  const est = await evaluar('window.__lab.estado()');
  r.lienzo = est.lienzo;
  for (const t of puntos) {
    await evaluar(`window.__lab.fijarT(${t})`);
    r.hashes[t] = await evaluar('window.__lab.huella()');
  }
  r.paridad = puntos.map((t) => ({ t, igual: r.hashes[t] === refs[vp.nombre][t].hash, instancia: r.hashes[t], ref: refs[vp.nombre][t].hash }));

  // remontaje con canvas nuevo
  await evaluar("window.__lab.destruir({ quitarCanvas: true })");
  await evaluar('window.__lab.crear()');
  r.remontajeReady = await esperarFase('ready');
  await evaluar('window.__lab.fijarT(1)');
  r.remontajeHash = await evaluar('window.__lab.huella()');

  // determinismo y reversibilidad
  const ida = {};
  for (const t of puntos) { await evaluar(`window.__lab.fijarT(${t})`); ida[t] = await evaluar('window.__lab.huella()'); }
  const vuelta = {};
  for (const t of [...puntos].reverse()) { await evaluar(`window.__lab.fijarT(${t})`); vuelta[t] = await evaluar('window.__lab.huella()'); }
  r.determinismo = puntos.every((t) => ida[t] === vuelta[t]);

  // D/E. errores y reintento
  r.errores = {};
  const casos = {
    '404': `${baseLab}datos/no-existe.bin`,
    vacio: `${baseLab}datos/vacio.bin`,
    corrupto: `${baseLab}datos/corrupto.bin`,
    red: 'http://127.0.0.1:5999/no-existe.bin',
  };
  for (const [nombre, url] of Object.entries(casos)) {
    await evaluar(`window.__lab.crear({ url: ${JSON.stringify(url)} })`);
    const ok = await esperarFase('error', 12000);
    const e = await evaluar('window.__lab.estadoUltimo()');
    const evs = await evaluar('window.__lab.eventos()');
    await evaluar(`window.__lab.reintentar(${JSON.stringify(validURL)})`);
    const rec = await esperarFase('ready', 15000);
    await evaluar('window.__lab.fijarT(1)');
    const hash = await evaluar('window.__lab.huella()');
    r.errores[nombre] = { error: ok, mensaje: e && e.error, eventos: evs.map((x) => x.fase), recuperado: rec, hash };
  }

  // B. destrucción durante la carga (red lenta)
  await enviar('Network.emulateNetworkConditions', { offline: false, latency: 2000, downloadThroughput: 20000, uploadThroughput: 20000 });
  await evaluar('window.__lab.crear()');
  await esperar(150);
  await evaluar('window.__lab.destruir()');
  await esperar(2600);
  r.duranteCarga = {
    eventos: await evaluar('window.__lab.eventos()'),
    estadoUltimo: await evaluar('window.__lab.estadoUltimo()'),
  };
  await enviar('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await esperar(300);

  // C. resize después de destruir
  await evaluar('window.__lab.crear()');
  await esperarFase('ready');
  await evaluar('window.__lab.fijarT(1)');
  await evaluar('window.__lab.destruir()');
  const h0 = await evaluar('window.__lab.huella()');
  await metrics({ ancho: 1200, alto: 757, dpr: 1, mobile: false });
  await esperar(500);
  const h1 = await evaluar('window.__lab.huella()');
  await metrics(vp);
  await esperar(500);
  const h2 = await evaluar('window.__lab.huella()');
  r.resize = { h0, h1, h2, igual: h0 === h1 && h1 === h2 };

  // G. adaptador de scroll
  await evaluar('window.scrollTo(0, 400)');
  const yAntes = await evaluar('window.scrollY');
  await evaluar('window.__lab.crear()');
  await esperarFase('ready');
  const yTrasCrear = await evaluar('window.scrollY');
  await evaluar('window.__lab.crearAdaptador()');
  const recorrido = await evaluar("(() => { const s = document.getElementById('recorrido'); return s.offsetHeight - window.innerHeight; })()");
  await evaluar(`window.scrollTo(0, Math.round(${recorrido} * 0.5))`);
  await esperar(300);
  const tScroll = await evaluar('window.__lab.estado().t');
  const m1 = await evaluar('window.__lab.metricasAdaptador()');
  await evaluar('window.__lab.destruirAdaptador()');
  await evaluar('window.__lab.destruir()');
  const hDestruido = await evaluar('window.__lab.huella()');
  await evaluar('window.scrollTo(0, 800)');
  await esperar(300);
  const m2 = await evaluar('window.__lab.metricasAdaptador()');
  const hTrasScroll = await evaluar('window.__lab.huella()');
  r.scroll = {
    yAntes, yTrasCrear,
    tScroll: Number(tScroll.toFixed(3)),
    metricasAntes: m1,
    metricasDespues: m2,
    hashIgual: hDestruido === hTrasScroll,
    restauracion: (await evaluar('window.__lab.scroll()')).restauracion,
    scrollFinal: await evaluar('window.scrollY'),
  };

  r.erroresConsola = errores;
  salida.escenarios[vp.nombre] = r;
}

salida.errores = errores;
console.log(JSON.stringify(salida, null, 1));
ws.close();
