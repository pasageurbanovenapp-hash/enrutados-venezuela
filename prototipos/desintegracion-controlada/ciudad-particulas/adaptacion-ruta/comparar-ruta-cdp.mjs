/* Compara ruta original (fases 06/07) con la ruta adaptada (fase 08).
   Uso: node comparar-ruta-cdp.mjs <puerto> */
import fs from 'node:fs';
const puerto = Number(process.argv[2] || 9226);
const base = 'http://127.0.0.1:5199/prototipos/desintegracion-controlada/';

const paginas = [
  { nombre: 'original', ruta: 'ciudad-particulas/', anchoCiudad: { movil: 1.35, escritorio: 1.9 }, rutaFija: 0.9 },
  { nombre: 'variante', ruta: 'ciudad-particulas/variante-vertical/', anchoCiudad: { movil: 0.95, escritorio: 1.9 }, rutaFija: 0.9 },
  { nombre: 'adaptacion', ruta: 'ciudad-particulas/adaptacion-ruta/', anchoCiudad: { movil: 0.95, escritorio: 1.9 }, rutaFija: null },
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

const medirCaja = () => evaluar(`(() => {
  const c = document.getElementById('ciudad');
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  const d = ctx.getImageData(0, 0, w, h).data;
  let minx = w, maxx = -1, miny = h, maxy = -1, n = 0;
  const borde = { arriba: 0, abajo: 0, izquierda: 0, derecha: 0 };
  const paso = 2;
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
  const r = c.getBoundingClientRect();
  return {
    lienzo: { ancho: w, alto: h, cssAncho: r.width, cssAlto: r.height },
    caja: maxx < 0 ? null : {
      anchoRel: (maxx - minx) / w, altoRel: (maxy - miny) / h,
      topRel: miny / h, centroY: (miny + maxy) / 2 / h,
    },
    borde,
    ruta: window.__ciudad && window.__ciudad.rutaMargenes ? window.__ciudad.rutaMargenes() : null,
  };
})()`);

const salida = { cajas: {}, margenes: {}, medicion: {} };
fs.mkdirSync('capturas', { recursive: true });

for (const vp of viewports) {
  if (vp.ancho) await enviar('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.dpr, mobile: true });
  else await enviar('Emulation.clearDeviceMetricsOverride');
  await esperar(300);

  for (const pg of paginas) {
    for (const nivel of [0, 1]) {
      for (const t of [1, 0.5, 0]) {
        if ((nivel === 1 && t !== 1) || (t !== 1 && pg.nombre !== 'adaptacion')) continue;
        await enviar('Page.navigate', { url: `${base}${pg.ruta}?nivel=${nivel}&t=${t}&v=${Date.now()}` });
        await esperar(1500);
        const clave = `${pg.nombre}-${vp.nombre}-${nivel}-t${t}`;
        const medida = await medirCaja();
        salida.cajas[clave] = medida;
        const shot = await enviar('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`capturas/${clave}.png`, Buffer.from(shot.result.data, 'base64'));

        // margen analitico para las paginas sin helper
        if (!medida.ruta) {
          const anchoCiudad = pg.anchoCiudad[vp.nombre];
          const W = medida.lienzo.cssAncho;
          const H = medida.lienzo.cssAlto;
          const escala = Math.min((W * 0.94) / anchoCiudad, (H * 0.82) / 1.05);
          const medio = pg.rutaFija * escala;
          salida.margenes[`${pg.nombre}-${vp.nombre}`] = {
            izquierda: Number((W / 2 - medio).toFixed(1)),
            derecha: Number((W / 2 - medio).toFixed(1)),
            anchoRuta: Number((2 * medio).toFixed(1)),
            lienzo: Number(W.toFixed(1)),
          };
        } else {
          salida.margenes[`${pg.nombre}-${vp.nombre}`] = medida.ruta;
        }
      }
    }

    if (pg.nombre === 'adaptacion') {
      await enviar('Page.navigate', { url: `${base}${pg.ruta}?medir=1&v=${Date.now()}` });
      let med = null;
      for (let i = 0; i < 100; i++) {
        med = await evaluar('window.__ciudad && window.__ciudad.medicion ? window.__ciudad.medicion : null');
        if (med) break;
        await esperar(400);
      }
      salida.medicion[vp.nombre] = med;
    }
  }
}

console.log(JSON.stringify(salida));
ws.close();
