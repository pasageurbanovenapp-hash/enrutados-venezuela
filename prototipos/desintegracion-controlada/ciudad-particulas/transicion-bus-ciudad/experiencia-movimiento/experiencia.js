/* Fase 10 — experiencia de scroll aislada sobre la transición A.
   Reutiliza transicion.js sin modificarlo: ajusta solo la ruta del binario
   respecto a esta subcarpeta y conduce fijarT() desde el scroll. */

const binURL = new URL('../../../../facetas-retexture/facetas.bin', import.meta.url);
const fetchOriginal = window.fetch.bind(window);
window.fetch = (entrada, init) => {
  const url = typeof entrada === 'string' ? entrada : (entrada && entrada.url) || '';
  if (url.includes('facetas.bin')) return fetchOriginal(binURL, init);
  return fetchOriginal(entrada, init);
};

await import('../transicion.js');

const seccion = document.getElementById('recorrido');
const diag = document.getElementById('diag');
const manual = document.getElementById('manual');
const manualCaja = document.getElementById('manual-caja');
const pieTexto = document.getElementById('pie-texto');
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');

const EPS = 0.001;
const metricas = { eventos: 0, calculos: 0, solicitudes: 0, dibujos: 0, filtrados: 0, manuales: 0, ms: 0, max: 0 };
let T = null;
let visible = true;
let pendiente = false;
let marco = 0;
let ultimo = Number.NaN;
let modo = 'scroll';

history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

for (let i = 0; i < 200 && !window.__transicion; i += 1) {
  await new Promise((r) => setTimeout(r, 50));
}
T = window.__transicion;
if (!T) {
  diag.textContent = 'Error: la transición no se inicializó';
  throw new Error('transición no disponible');
}

function limites() {
  const caja = seccion.getBoundingClientRect();
  const inicio = window.scrollY + caja.top;
  const recorrido = Math.max(1, seccion.offsetHeight - window.innerHeight);
  return { inicio, recorrido };
}

function calcular() {
  const { inicio, recorrido } = limites();
  return Math.min(1, Math.max(0, (window.scrollY - inicio) / recorrido));
}

function actualizarDiag() {
  diag.textContent = `t ${T.estado().t.toFixed(2)} · raf ${pendiente ? 1 : 0} · ev ${metricas.eventos} · dib ${metricas.dibujos}`;
}

function aplicar() {
  marco = 0;
  pendiente = false;
  if (!visible || modo !== 'scroll') return;
  const p = calcular();
  metricas.calculos += 1;
  if (Number.isFinite(ultimo) && Math.abs(p - ultimo) < EPS) {
    metricas.filtrados += 1;
    actualizarDiag();
    return;
  }
  ultimo = p;
  metricas.dibujos += 1;
  const t0 = performance.now();
  T.fijarT(p);
  const ms = performance.now() - t0;
  metricas.ms += ms;
  metricas.max = Math.max(metricas.max, ms);
  actualizarDiag();
}

function programar() {
  if (pendiente || modo !== 'scroll' || reducir.matches) return;
  pendiente = true;
  metricas.solicitudes += 1;
  marco = requestAnimationFrame(aplicar);
}

function alDesplazar() {
  metricas.eventos += 1;
  if (!visible) return;
  programar();
}

function alRedimensionar() {
  ultimo = Number.NaN;
  programar();
}

const observador = new IntersectionObserver(([entrada]) => {
  visible = entrada.isIntersecting;
  if (!visible) {
    if (marco) cancelAnimationFrame(marco);
    marco = 0;
    pendiente = false;
  } else {
    programar();
  }
  actualizarDiag();
}, { rootMargin: '0px' });

function alManual() {
  if (!reducir.matches) return;
  const p = Number(manual.value) / 1000;
  metricas.manuales += 1;
  T.fijarT(p);
  actualizarDiag();
}

function aplicarModo() {
  if (reducir.matches) {
    modo = 'manual';
    if (marco) cancelAnimationFrame(marco);
    marco = 0;
    pendiente = false;
    manualCaja.hidden = false;
    manual.value = '0';
    T.fijarT(0);
    pieTexto.textContent = 'Movimiento reducido · control manual explícito';
  } else {
    modo = 'scroll';
    manualCaja.hidden = true;
    pieTexto.textContent = 'Desplazamiento vertical · variante A';
    ultimo = Number.NaN;
    programar();
  }
  actualizarDiag();
}

window.addEventListener('scroll', alDesplazar, { passive: true });
window.addEventListener('resize', alRedimensionar);
window.addEventListener('orientationchange', alRedimensionar);
manual.addEventListener('input', alManual);
reducir.addEventListener('change', aplicarModo);
observador.observe(seccion);

function destruir() {
  window.removeEventListener('scroll', alDesplazar);
  window.removeEventListener('resize', alRedimensionar);
  window.removeEventListener('orientationchange', alRedimensionar);
  manual.removeEventListener('input', alManual);
  reducir.removeEventListener('change', aplicarModo);
  observador.disconnect();
  if (marco) cancelAnimationFrame(marco);
  marco = 0;
  pendiente = false;
  modo = 'detenido';
  actualizarDiag();
}

window.__experiencia = {
  metricas,
  calcular,
  destruir,
  estado: () => ({
    t: T.estado().t,
    tSeccion: Number(calcular().toFixed(4)),
    variante: T.estado().variante,
    facetas: T.estado().facetas,
    lienzo: T.estado().lienzo,
    visible,
    pendiente,
    marco,
    modo,
    reducir: reducir.matches,
    scrollY: window.scrollY,
    ...metricas,
  }),
};

aplicarModo();
