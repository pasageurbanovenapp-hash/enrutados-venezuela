/* FASE 12 — adaptador mínimo de scroll. Recibe sección e instancia; no toca
   navegación ni estado global. */

export function crearAdaptadorScroll({ seccion, instancia, epsilon = 0.001, onMetrica } = {}) {
  if (!seccion) throw new Error('crearAdaptadorScroll requiere sección');
  if (!instancia) throw new Error('crearAdaptadorScroll requiere instancia');

  let pendiente = false;
  let marco = 0;
  let visible = true;
  let ultimo = Number.NaN;
  let destruido = false;
  const metricas = { eventos: 0, calculos: 0, solicitudes: 0, dibujos: 0, filtrados: 0 };

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

  function aplicar() {
    marco = 0;
    pendiente = false;
    if (destruido || !visible) return;
    const t = calcular();
    metricas.calculos += 1;
    if (Number.isFinite(ultimo) && Math.abs(t - ultimo) < epsilon) {
      metricas.filtrados += 1;
      return;
    }
    ultimo = t;
    if (instancia.fijarT(t)) metricas.dibujos += 1;
    if (typeof onMetrica === 'function') {
      try { onMetrica({ ...metricas, t }); } catch (e) { /* noop */ }
    }
  }

  function programar() {
    if (destruido || pendiente) return;
    pendiente = true;
    metricas.solicitudes += 1;
    marco = requestAnimationFrame(aplicar);
  }

  function alDesplazar() {
    metricas.eventos += 1;
    if (visible) programar();
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
  }, { rootMargin: '0px' });

  const tamano = new ResizeObserver(alRedimensionar);

  window.addEventListener('scroll', alDesplazar, { passive: true });
  window.addEventListener('resize', alRedimensionar);
  observador.observe(seccion);
  tamano.observe(seccion);

  function destruir() {
    if (destruido) return;
    destruido = true;
    window.removeEventListener('scroll', alDesplazar);
    window.removeEventListener('resize', alRedimensionar);
    observador.disconnect();
    tamano.disconnect();
    if (marco) cancelAnimationFrame(marco);
    marco = 0;
    pendiente = false;
  }

  programar();

  return { destruir, calcular, metricas, estaDestruido: () => destruido, hayPendiente: () => pendiente };
}
