/* Arranque, controles y bucle.
   El prototipo se puede congelar por URL para comparar instantes con capturas:
   ?t=3.2 deja la escena quieta en ese segundo. */
(function () {
  'use strict';

  var CT = window.CT;
  var escena = CT.escena;

  var params = new URLSearchParams(location.search);

  var lienzo = document.getElementById('lienzo');
  var ctx = lienzo.getContext('2d');
  var faseEl = document.getElementById('fase');
  var tiempoEl = document.getElementById('tiempo');
  var avisoEl = document.getElementById('aviso-reducido');
  var btnPausa = document.getElementById('btn-pausa');
  var btnReiniciar = document.getElementById('btn-reiniciar');
  var rangoVelocidad = document.getElementById('rango-velocidad');
  var salidaVelocidad = document.getElementById('salida-velocidad');
  var rangoDensidad = document.getElementById('rango-densidad');
  var salidaDensidad = document.getElementById('salida-densidad');

  function numero(valor, porDefecto, minimo, maximo) {
    var n = parseFloat(valor);
    if (!isFinite(n)) return porDefecto;
    if (n < minimo) return minimo;
    if (n > maximo) return maximo;
    return n;
  }

  var menosMovimiento =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var estado = {
    t: 0,
    reproduciendo: true,
    velocidad: numero(params.get('vel'), 1, 0.25, 2),
    densidad: Math.round(numero(params.get('d'), 6000, 2000, 12000)),
    modo: params.get('modo') === 'plano' ? 'plano' : 'perspectiva',
    congelado: params.has('t') ? numero(params.get('t'), 0, 0, 60) : null,
    reducido: Boolean(menosMovimiento || params.has('reduce')),
  };

  /* ── lienzo ───────────────────────────────────────────────────────────── */

  function ajustar() {
    var r = lienzo.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var ancho = Math.max(1, Math.round(r.width * dpr));
    var alto = Math.max(1, Math.round(r.height * dpr));
    if (lienzo.width !== ancho || lienzo.height !== alto) {
      lienzo.width = ancho;
      lienzo.height = alto;
    }
    escena.usarContexto(ctx);
    escena.fijarLienzo(ancho, alto);
  }

  function reconstruir() {
    /* Misma semilla siempre: dos ejecuciones dan la misma escena. */
    CT.azar.sembrar(0x2f6e2b1);
    escena.construir(estado.densidad, estado.modo);
  }

  /* ── dibujo ───────────────────────────────────────────────────────────── */

  function dibujarYMedir() {
    var t = estado.congelado !== null ? estado.congelado : estado.t;
    escena.dibujar(t);
    faseEl.textContent = escena.fase(t);
    tiempoEl.textContent = t.toFixed(2) + ' s';
  }

  /* ── bucle ────────────────────────────────────────────────────────────── */

  var ultimo = null;
  var acumuladoFps = 0;
  var marcos = 0;
  var fpsEl = document.getElementById('fps');

  function bucle(ahora) {
    if (ultimo === null) ultimo = ahora;
    var dt = Math.min((ahora - ultimo) / 1000, 0.08);
    ultimo = ahora;

    marcos++;
    acumuladoFps += dt;
    if (acumuladoFps >= 0.5) {
      fpsEl.textContent = Math.round(marcos / acumuladoFps) + ' fps';
      marcos = 0;
      acumuladoFps = 0;
    }

    if (estado.reproduciendo && estado.congelado === null && !estado.reducido) {
      estado.t += dt * estado.velocidad;
      if (estado.t > escena.total) estado.t = escena.total;
    }

    dibujarYMedir();
    requestAnimationFrame(bucle);
  }

  /* ── controles ────────────────────────────────────────────────────────── */

  function actualizarBotonPausa() {
    btnPausa.textContent = estado.reproduciendo ? 'Pausa' : 'Seguir';
    btnPausa.setAttribute('aria-pressed', String(!estado.reproduciendo));
  }

  btnPausa.addEventListener('click', function () {
    estado.reproduciendo = !estado.reproduciendo;
    actualizarBotonPausa();
  });

  btnReiniciar.addEventListener('click', function () {
    estado.t = 0;
    estado.congelado = null;
    estado.reproduciendo = true;
    actualizarBotonPausa();
  });

  rangoVelocidad.addEventListener('input', function () {
    estado.velocidad = parseFloat(rangoVelocidad.value);
    salidaVelocidad.textContent = estado.velocidad.toFixed(2) + '×';
  });

  rangoDensidad.addEventListener('input', function () {
    estado.densidad = parseInt(rangoDensidad.value, 10);
    salidaDensidad.textContent = String(estado.densidad);
    reconstruir();
  });

  var radiosModo = document.querySelectorAll('input[name="modo"]');
  for (var i = 0; i < radiosModo.length; i++) {
    radiosModo[i].addEventListener('change', function (e) {
      if (!e.target.checked) return;
      estado.modo = e.target.value;
      reconstruir();
    });
  }

  window.addEventListener('resize', function () {
    ajustar();
    dibujarYMedir();
  });

  /* ── arranque ─────────────────────────────────────────────────────────── */

  estado.t = estado.reducido ? escena.total : 0;
  if (estado.reducido) {
    estado.reproduciendo = false;
    avisoEl.hidden = false;
  }
  if (estado.congelado !== null) {
    estado.reproduciendo = false;
  }

  rangoVelocidad.value = String(estado.velocidad);
  salidaVelocidad.textContent = estado.velocidad.toFixed(2) + '×';
  rangoDensidad.value = String(estado.densidad);
  salidaDensidad.textContent = String(estado.densidad);
  for (var j = 0; j < radiosModo.length; j++) {
    radiosModo[j].checked = radiosModo[j].value === estado.modo;
  }

  if (params.has('solo')) document.body.classList.add('solo');

  reconstruir();
  ajustar();
  actualizarBotonPausa();
  dibujarYMedir();

  requestAnimationFrame(bucle);
})();
