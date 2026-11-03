/* FASE 12 — arnés de pruebas. NO forma parte del contrato de la instancia.
   Expone window.__lab solo para poder conducir escenarios por CDP. */

import { crearTransicion } from './transicion-instancia.js';
import { crearAdaptadorScroll } from './adaptador-scroll.js';

const escena = document.getElementById('escena');
const estadoEl = document.getElementById('estado');
const diagEl = document.getElementById('diag');
const assetURL = new URL('../../../../facetas-retexture/facetas.bin', import.meta.url).href;

let instancia = null;
let ultima = null;
let lienzo = null;
let adaptador = null;
let eventos = [];
let ultimasMetricas = null;

function huellaCanvas(canvas) {
  if (!canvas) return null;
  const c = canvas.getContext('2d');
  const d = c.getImageData(0, 0, canvas.width, canvas.height).data;
  let h = 2166136261;
  for (let i = 0; i < d.length; i += 97) {
    h ^= d[i];
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function crear({ url = assetURL, canvasNuevo = true } = {}) {
  if (instancia) {
    instancia.destruir();
    instancia = null;
  }
  if (adaptador) {
    adaptador.destruir();
    adaptador = null;
  }
  if (canvasNuevo) {
    if (lienzo && lienzo.parentNode) lienzo.remove();
    lienzo = document.createElement('canvas');
    lienzo.className = 'lienzo';
    lienzo.setAttribute('aria-label', 'Transición de prueba del autobús a la ciudad');
    escena.appendChild(lienzo);
  }
  eventos = [];
  ultima = null;
  instancia = crearTransicion({
    canvas: lienzo,
    assetURL: url,
    onEstado: (e) => {
      eventos.push({ ...e, ts: Date.now() });
      estadoEl.textContent = `${e.fase}${e.error ? ` · ${e.error}` : ''} · t=${e.t}`;
      diagEl.textContent = `${eventos.length} eventos · ${e.fase}`;
    },
  });
  ultima = instancia;
  return true;
}

function destruir({ quitarCanvas = false } = {}) {
  if (adaptador) {
    ultimasMetricas = { ...adaptador.metricas };
    adaptador.destruir();
    adaptador = null;
  }
  if (instancia) {
    instancia.destruir();
    ultima = instancia;
    instancia = null;
  }
  if (lienzo) {
    // La instancia se destruye aunque el canvas se conserve para la prueba de resize.
    if (quitarCanvas) { lienzo.remove(); lienzo = null; }
  }
  return true;
}

function crearAdaptador() {
  if (!instancia) return false;
  if (adaptador) return true;
  adaptador = crearAdaptadorScroll({
    seccion: document.getElementById('recorrido'),
    instancia,
    onMetrica: (m) => { diagEl.textContent = `scroll t=${m.t.toFixed(3)} · dib ${m.dibujos}`; },
  });
  return true;
}

function destruirAdaptador() {
  if (adaptador) {
    ultimasMetricas = { ...adaptador.metricas };
    adaptador.destruir();
    adaptador = null;
  }
  return true;
}

window.__lab = {
  crear,
  destruir,
  crearAdaptador,
  destruirAdaptador,
  fijarT: (t) => (instancia ? instancia.fijarT(t) : false),
  reintentar: (url) => (instancia ? instancia.reintentar(url) : false),
  estado: () => (instancia ? instancia.estado() : null),
  estadoUltimo: () => (ultima ? ultima.estado() : null),
  eventos: () => eventos.map((e) => ({ fase: e.fase, t: e.t, error: e.error })),
  huella: () => huellaCanvas(lienzo),
  lienzo: () => (lienzo ? { W: lienzo.width, H: lienzo.height, css: lienzo.getBoundingClientRect().width } : null),
  metricasAdaptador: () => (adaptador ? { ...adaptador.metricas } : ultimasMetricas),
  adaptadorPendiente: () => (adaptador ? adaptador.hayPendiente() : null),
  scroll: () => ({ y: window.scrollY, restauracion: history.scrollRestoration }),
  assetURL,
};
