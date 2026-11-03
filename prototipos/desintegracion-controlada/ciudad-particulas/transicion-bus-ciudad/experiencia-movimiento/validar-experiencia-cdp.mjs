/* Fase 10 — validación de la experiencia de scroll. Uso: node validar-experiencia-cdp.mjs <puerto> */
import fs from 'node:fs';
const puerto = Number(process.argv[2] || 9228);
const base = 'http://127.0.0.1:5199/prototipos/desintegracion-controlada/ciudad-particulas/transicion-bus-ciudad/experiencia-movimiento/';
const referencia = { desktop: '0e627ad8', movil: '5d4ef246' };

const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
const obj = lista.find((t) => t.type === 'page' && t.url.includes('experiencia-movimiento'));
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
fs.mkdirSync('capturas', { recursive: true });

const viewports = [
  { nombre: 'desktop', ancho: 1440, alto: 757, dpr: 1, mobile: false },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2, mobile: true },
];
const puntos = [0, 0.25, 0.5, 0.75, 1];
const salida = { corridas: {}, errores: [] };

const leer = () => evaluar(`({
  ...window.__experiencia.estado(),
  hash: window.__transicion.huella(),
  geo: (() => { const g = window.__transicion.geometria(); return { vertFuera: g.vertFuera, centFuera: g.centFuera }; })(),
})`);

async function recargar() {
  await enviar('Page.navigate', { url: `${base}?v=${Date.now()}` });
  for (let i = 0; i < 80; i++) {
    const ok = await evaluar('!!(window.__experiencia && window.__transicion)');
    if (ok) { await esperar(500); return; }
    await esperar(150);
  }
  throw new Error('no inicializa');
}

async function irA(t) {
  await evaluar(`(() => {
    const s = document.getElementById('recorrido');
    const rec = Math.max(1, s.offsetHeight - window.innerHeight);
    window.scrollTo(0, Math.round(${t} * rec));
  })()`);
  await esperar(180);
}

for (const vp of viewports) {
  await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
  await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  errores = [];
  await recargar();
  const r = { lienzo: await evaluar('window.__experiencia.estado().lienzo') };

  // lento 0 -> 1
  const lento = [];
  for (let i = 0; i <= 24; i++) {
    await irA(i / 24);
    lento.push(Number((await evaluar('window.__experiencia.estado().t')).toFixed(3)));
  }
  r.lento = { inicio: lento[0], fin: lento[lento.length - 1], monotono: lento.every((v, i) => i === 0 || v >= lento[i - 1] - 0.002) };

  // rapido
  await evaluar(`window.scrollTo(0, document.getElementById('recorrido').offsetHeight - window.innerHeight)`);
  await esperar(250);
  r.rapido = { t: Number((await evaluar('window.__experiencia.estado().t')).toFixed(3)) };

  // puntos de control, ida
  r.control = {};
  for (const t of puntos) {
    await irA(t);
    const e = await leer();
    r.control[t] = { t: e.t, tSeccion: e.tSeccion, hash: e.hash, vertFuera: e.geo.vertFuera };
  }

  r.hashFinal = r.control[1].hash;
  r.referencia = referencia[vp.nombre];
  r.coincideReferencia = r.hashFinal === referencia[vp.nombre];

  async function medirCosto(t) {
    await irA(t);
    await esperar(150);
    return evaluar(`new Promise((res) => {
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
  }
  // capturas de estados en el viewport correcto
  for (const t of [0, 0.5, 0.75, 1]) {
    await irA(t);
    await esperar(120);
    const shot = await enviar('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`capturas/${vp.nombre}-scroll-${t.toFixed(2)}.png`, Buffer.from(shot.result.data, 'base64'));
  }

  r.coste = { t1: await medirCosto(1), t05: await medirCosto(0.5) };

  // vuelta
  const vuelta = [];
  for (let i = 24; i >= 0; i--) {
    await irA(i / 24);
    vuelta.push(Number((await evaluar('window.__experiencia.estado().t')).toFixed(3)));
  }
  r.vuelta = { inicio: vuelta[0], fin: vuelta[vuelta.length - 1], monotono: vuelta.every((v, i) => i === 0 || v <= vuelta[i - 1] + 0.002) };

  // alternancia 0.5 <-> 0.6
  for (let i = 0; i < 6; i++) await irA(i % 2 ? 0.5 : 0.6);
  await irA(0.5);
  r.alternancia = { t: Number((await evaluar('window.__experiencia.estado().t')).toFixed(3)) };

  // rafaga sin desplazamiento
  await irA(0.5);
  const antes = await leer();
  await evaluar("for (let i=0;i<500;i++) window.dispatchEvent(new Event('scroll'))");
  await esperar(200);
  const despues = await leer();
  r.rafaga = { solicitudes: despues.solicitudes - antes.solicitudes, dibujos: despues.dibujos - antes.dibujos };

  // pausa 700 ms
  const p1 = await leer();
  await esperar(700);
  const p2 = await leer();
  r.pausa = { igual: p1.dibujos === p2.dibujos && p1.solicitudes === p2.solicitudes };

  // salida de la seccion
  await evaluar('window.scrollTo(0, document.body.scrollHeight)');
  await esperar(300);
  const fuera = await leer();
  const antesFuera = fuera;
  await evaluar("for (let i=0;i<200;i++) window.dispatchEvent(new Event('scroll'))");
  await esperar(250);
  const despuesFuera = await leer();
  r.salida = { visible: fuera.visible, t: fuera.t, solicitudes: despuesFuera.solicitudes - antesFuera.solicitudes, dibujos: despuesFuera.dibujos - antesFuera.dibujos };

  // reentrada
  await irA(0.5);
  r.reentrada = { visible: (await leer()).visible, t: Number((await evaluar('window.__experiencia.estado().t')).toFixed(3)) };

  // resize
  await enviar('Emulation.setDeviceMetricsOverride', { width: 1200, height: 757, deviceScaleFactor: 1, mobile: false });
  await esperar(600);
  const r1 = await leer();
  await enviar('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await esperar(700);
  const r2 = await leer();
  r.resize = { mismoNivel: { facetas: r1.facetas, lienzo: r1.lienzo }, cambioNivel: { facetas: r2.facetas, lienzo: r2.lienzo }, finito: Number.isFinite(r2.t) && r2.facetas === 2282 };

  // restaurar el viewport antes de reducido/destruir
  await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
  await esperar(300);

  // reducido
  await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await recargar();
  const red1 = await leer();
  await esperar(900);
  const red2 = await leer();
  const manualVisible = await evaluar("!document.getElementById('manual-caja').hidden");
  await evaluar("(() => { const m = document.getElementById('manual'); m.value = '500'; m.dispatchEvent(new Event('input')); })()");
  await esperar(150);
  const redManual = await leer();
  r.reducido = {
    modo: red1.modo, tInicial: red1.t, tTras900: red2.t, estable: red1.hash === red2.hash,
    pendiente: red2.pendiente, manualVisible, tManual: Number(redManual.t.toFixed(2)), dibujos: red2.dibujos,
  };

  // destruir
  await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await recargar();
  await evaluar('window.__experiencia.destruir()');
  const d1 = await leer();
  await irA(0.8);
  await evaluar("for (let i=0;i<200;i++) window.dispatchEvent(new Event('scroll'))");
  await esperar(250);
  const d2 = await leer();
  r.destruir = { modo: d1.modo, solicitudes: d2.solicitudes - d1.solicitudes, dibujos: d2.dibujos - d1.dibujos, pendiente: d2.pendiente };

  r.errores = errores;
  salida.corridas[vp.nombre] = r;
}

salida.errores = errores;
console.log(JSON.stringify(salida, null, 1));
ws.close();
