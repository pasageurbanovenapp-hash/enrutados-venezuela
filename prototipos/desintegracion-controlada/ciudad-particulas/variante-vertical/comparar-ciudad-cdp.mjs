/* Compara fase 06 (original) y variante vertical: ocupacion, capturas y coste.
   Uso: node comparar-ciudad-cdp.mjs <puerto> */
import fs from 'node:fs';
const puerto = Number(process.argv[2] || 9225);
const base = 'http://127.0.0.1:5199/prototipos/desintegracion-controlada/';

const paginas = [
  { nombre: 'original', ruta: 'ciudad-particulas/' },
  { nombre: 'variante', ruta: 'ciudad-particulas/variante-vertical/' },
];
const viewports = [
  { nombre: 'escritorio', ancho: null },
  { nombre: 'movil', ancho: 390, alto: 844, dpr: 2 },
];

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
await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });

const medirOcupacion = () => evaluar(`(() => {
  const c = document.getElementById('ciudad');
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  const d = ctx.getImageData(0, 0, w, h).data;
  let minx = w, maxx = -1, miny = h, maxy = -1, n = 0;
  const borde = { arriba: 0, abajo: 0, izquierda: 0, derecha: 0 };
  const paso = 2;
  // El fondo es oscuro (verde < 70); los puntos de la ciudad superan 85.
  for (let y = 0; y < h; y += paso) {
    for (let x = 0; x < w; x += paso) {
      const i = (y * w + x) * 4;
      if (d[i + 1] > 85 && d[i + 2] > 95) {
        n += 1;
        if (x < minx) minx = x; if (x > maxx) maxx = x;
        if (y < miny) miny = y; if (y > maxy) maxy = y;
        if (y <= paso) borde.arriba += 1;
        if (y >= h - paso - 1) borde.abajo += 1;
        if (x <= paso) borde.izquierda += 1;
        if (x >= w - paso - 1) borde.derecha += 1;
      }
    }
  }
  if (maxx < 0) return { lienzo: { ancho: w, alto: h }, caja: null };
  return {
    lienzo: { ancho: w, alto: h, cssAncho: c.getBoundingClientRect().width, cssAlto: c.getBoundingClientRect().height },
    caja: {
      anchoRel: (maxx - minx) / w, altoRel: (maxy - miny) / h,
      topRel: miny / h, fondoRel: maxy / h,
      centroX: (minx + maxx) / 2 / w, centroY: (miny + maxy) / 2 / h,
      cobertura: (n * paso * paso) / (w * h),
    },
    borde,
  };
})()`);

const salida = { ocupacion: {}, medicion: {}, errores: [] };
fs.mkdirSync('capturas', { recursive: true });

for (const vp of viewports) {
  if (vp.ancho) await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: true });
  else await enviar('Emulation.clearDeviceMetricsOverride');
  await esperar(300);

  for (const pg of paginas) {
    for (const nivel of [0, 1]) {
      for (const t of [1, 0.5]) {
        if (t === 0.5 && nivel === 1) continue;
        await enviar('Page.navigate', { url: `${base}${pg.ruta}?nivel=${nivel}&t=${t}&v=${Date.now()}` });
        await esperar(1600);
        const clave = `${pg.nombre}-${vp.nombre}-${nivel}-t${t}`;
        salida.ocupacion[clave] = await medirOcupacion();
        const shot = await enviar('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`capturas/${clave}.png`, Buffer.from(shot.result.data, 'base64'));
      }
    }

    await enviar('Page.navigate', { url: `${base}${pg.ruta}?medir=1&v=${Date.now()}` });
    let med = null;
    for (let i = 0; i < 100; i++) {
      med = await evaluar('window.__ciudad && window.__ciudad.medicion ? window.__ciudad.medicion : null');
      if (med) break;
      await esperar(400);
    }
    salida.medicion[`${pg.nombre}-${vp.nombre}`] = med;
  }
}

console.log(JSON.stringify(salida));
ws.close();
