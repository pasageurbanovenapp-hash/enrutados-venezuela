/* Escena: línea de tiempo y dibujo.
   Una sola población de puntos. Primero forma el bus; después se desmaterializa
   hacia los lados y se reordena en la ciudad. El color y el brillo viajan con
   cada punto, así que la transformación no es un fundido entre dos imágenes. */
(function () {
  'use strict';

  var CT = (window.CT = window.CT || {});
  var G = CT.geometria;

  /* Tiempos en segundos. Un solo disparo, sin bucle. */
  var T = {
    aparecer: 0.35,
    rafaga: 1.5,
    finRafaga: 2.8,
    finCiudad: 5.0,
    finTrazo: 6.4,
  };

  var INICIO_DESTELLO = 5.0;
  var DURACION_DESTELLO = 1.4;

  var ctxRef = null;
  var vista = { escala: 1, ox: 0, oy: 0, ancho: 0, alto: 0 };

  var P = null;
  var faros = null;
  var grupos = [];
  (function () {
    for (var i = 0; i < 8; i++) grupos.push([]);
  })();

  var sprites = {};

  /* ── utilidades ───────────────────────────────────────────────────────── */

  function limitar(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function entradaSalida(u) {
    u = limitar(u, 0, 1);
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }

  function suave(a, b, t) {
    return entradaSalida((t - a) / (b - a));
  }

  function sprite(tono) {
    if (sprites[tono]) return sprites[tono];
    var c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    var g = c.getContext('2d');
    var rad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    var rgb = tono === 'naranja' ? '245,158,11' : tono === 'blanco' ? '235,245,255' : '34,211,238';
    rad.addColorStop(0, 'rgba(' + rgb + ',0.95)');
    rad.addColorStop(0.22, 'rgba(' + rgb + ',0.55)');
    rad.addColorStop(0.55, 'rgba(' + rgb + ',0.14)');
    rad.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = rad;
    g.fillRect(0, 0, 128, 128);
    sprites[tono] = c;
    return c;
  }

  function brillo(x, y, tono, radio, alfa) {
    if (alfa <= 0.01) return;
    ctxRef.save();
    ctxRef.globalCompositeOperation = 'lighter';
    ctxRef.globalAlpha = alfa;
    ctxRef.drawImage(sprite(tono), x - radio, y - radio, radio * 2, radio * 2);
    ctxRef.restore();
  }

  /* ── construcción ─────────────────────────────────────────────────────── */

  function construir(n, modo) {
    var puntosBus = G.bus(n);
    var puntosCiudad = G.ciudad(n, modo);

    /* Emparejar por rango horizontal: el punto más a la izquierda del bus se
       convierte en el más a la izquierda de la ciudad. El reparto se siente
       ordenado en vez de aleatorio, y el centro del bus cae en la avenida. */
    puntosBus.sort(function (a, b) {
      return a.x - b.x;
    });
    puntosCiudad.sort(function (a, b) {
      return a.x - b.x;
    });

    var total = Math.min(puntosBus.length, puntosCiudad.length);
    var X0 = new Float32Array(total);
    var Y0 = new Float32Array(total);
    var B0 = new Float32Array(total);
    var X1 = new Float32Array(total);
    var Y1 = new Float32Array(total);
    var B1 = new Float32Array(total);
    var BX = new Float32Array(total);
    var BY = new Float32Array(total);
    var O = new Float32Array(total);

    for (var i = 0; i < total; i++) {
      var b = puntosBus[i];
      var c = puntosCiudad[i];
      X0[i] = b.x;
      Y0[i] = b.y;
      B0[i] = b.brillo;
      X1[i] = c.x;
      Y1[i] = c.y;
      B1[i] = c.brillo;

      var distancia = Math.abs(b.x - 500) / 250;
      var orden = distancia > 1 ? 1 : distancia;
      O[i] = orden;

      var lado = b.x < 500 ? -1 : 1;
      BX[i] = limitar(500 + (b.x - 500) * 2.2 + lado * CT.azar.entre(30, 165), -140, 1140);
      BY[i] = 748 + (b.y - 748) * 0.78 + CT.azar.entre(-105, 105);
    }

    P = { n: total, X0: X0, Y0: Y0, B0: B0, X1: X1, Y1: Y1, B1: B1, BX: BX, BY: BY, O: O };

    faros = [
      { inicio: { x: 335, y: 800 }, medio: { x: 236, y: 636 }, fin: { x: 500, y: 470 }, tono: 'cyan' },
      { inicio: { x: 665, y: 800 }, medio: { x: 764, y: 636 }, fin: { x: 500, y: 1364 }, tono: 'naranja' },
    ];
  }

  function fijarLienzo(ancho, alto) {
    vista.ancho = ancho;
    vista.alto = alto;
    vista.escala = Math.min(ancho / G.ANCHO, alto / G.ALTO);
    vista.ox = (ancho - G.ANCHO * vista.escala) / 2;
    vista.oy = (alto - G.ALTO * vista.escala) / 2;
  }

  function usarContexto(ctx) {
    ctxRef = ctx;
  }

  /* ── dibujo ───────────────────────────────────────────────────────────── */

  function dibujar(t) {
    var ctx = ctxRef;
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, vista.ancho, vista.alto);
    ctx.setTransform(vista.escala, 0, 0, vista.escala, vista.ox, vista.oy);

    var fondo = ctx.createRadialGradient(500, 800, 60, 500, 800, 940);
    fondo.addColorStop(0, '#0d2438');
    fondo.addColorStop(1, '#08111f');
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, G.ANCHO, G.ALTO);

    if (!P) return;

    var N = P.n;
    var X0 = P.X0;
    var Y0 = P.Y0;
    var B0 = P.B0;
    var X1 = P.X1;
    var Y1 = P.Y1;
    var B1 = P.B1;
    var BX = P.BX;
    var BY = P.BY;
    var O = P.O;

    var b;
    for (b = 0; b < 8; b++) grupos[b].length = 0;

    var mezcla = suave(2.9, 5.1, t);
    var cr = Math.round(226 + (176 - 226) * mezcla);
    var cg = Math.round(235 + (198 - 235) * mezcla);
    var cb = Math.round(244 + (216 - 244) * mezcla);

    for (var i = 0; i < N; i++) {
      var o = O[i];
      var t0 = T.rafaga + (1 - o) * 0.25;
      var t1 = T.finRafaga + (1 - o) * 0.18;
      var t2 = t1 + 0.04;
      var t3 = T.finCiudad + (1 - o) * 0.25;
      var x;
      var y;
      var br;

      if (t <= t0) {
        x = X0[i];
        y = Y0[i];
        br = B0[i];
      } else if (t < t1) {
        var u = (t - t0) / (t1 - t0);
        u = 1 - Math.pow(1 - u, 3);
        x = X0[i] + (BX[i] - X0[i]) * u;
        y = Y0[i] + (BY[i] - Y0[i]) * u;
        br = B0[i];
      } else if (t < t3) {
        var v = (t - t2) / (t3 - t2);
        if (v < 0) v = 0;
        v = v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
        x = BX[i] + (X1[i] - BX[i]) * v;
        y = BY[i] + (Y1[i] - BY[i]) * v;
        br = B0[i] + (B1[i] - B0[i]) * v;
      } else {
        x = X1[i];
        y = Y1[i];
        br = B1[i];
      }

      var aparecer = (t - o * 0.12) / 0.28;
      if (aparecer < 1) {
        if (aparecer <= 0) continue;
        br *= aparecer;
      }
      if (br <= 0.02) continue;

      var k = (br * 8) | 0;
      if (k > 7) k = 7;
      grupos[k].push(x, y);
    }

    var tam = 2.5;
    for (b = 0; b < 8; b++) {
      var arr = grupos[b];
      var cuenta = arr.length;
      if (!cuenta) continue;
      ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + ((b + 1) / 8) * 0.92 + ')';
      for (var j = 0; j < cuenta; j += 2) {
        ctx.fillRect(arr[j] - tam / 2, arr[j + 1] - tam / 2, tam, tam);
      }
    }

    dibujarRuta(ctx, t);
    dibujarFaros(ctx, t);
  }

  function dibujarRuta(ctx, t) {
    var alfa = limitar((t - 4.4) / 0.6, 0, 1);
    if (alfa <= 0) return;

    var yFrente = G.FUGA.y;
    var recorrido = 0;
    if (t > INICIO_DESTELLO) {
      recorrido = limitar((t - INICIO_DESTELLO) / DURACION_DESTELLO, 0, 1);
      yFrente = G.FUGA.y + (G.TIERRA - G.FUGA.y) * entradaSalida(recorrido);
    }

    /* Trazo apagado: la ruta ya existe, todavía no está recorrida. */
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(34,211,238,' + 0.13 * alfa + ')';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(500, G.FUGA.y);
    ctx.lineTo(500, G.TIERRA);
    ctx.stroke();

    if (t > INICIO_DESTELLO) {
      ctx.strokeStyle = 'rgba(34,211,238,' + 0.5 * alfa + ')';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(500, G.FUGA.y);
      ctx.lineTo(500, yFrente);
      ctx.stroke();

      /* Halo del tramo recorrido. */
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(34,211,238,0.1)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(500, G.FUGA.y);
      ctx.lineTo(500, yFrente);
      ctx.stroke();
    }
    ctx.restore();

    /* Nodos: puntos de conexión puros, sin etiquetas ni iconografía. */
    for (var i = 0; i < G.NODOS.length; i++) {
      var n = G.NODOS[i];
      var encendido = t > INICIO_DESTELLO && yFrente >= n.y - 1;
      if (encendido) {
        var pulso = limitar((yFrente - n.y) / 40, 0, 1);
        brillo(500, n.y, 'cyan', n.r * 7 * (0.7 + 0.3 * pulso), 0.75 * alfa);
        ctx.fillStyle = 'rgba(190,247,255,' + 0.95 * alfa + ')';
        ctx.beginPath();
        ctx.arc(500, n.y, n.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(34,211,238,' + 0.2 * alfa + ')';
        ctx.beginPath();
        ctx.arc(500, n.y, n.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* El destello: la trazabilidad llega desde el horizonte. */
    if (t > INICIO_DESTELLO && recorrido < 1) {
      var largo = 170;
      var grad = ctx.createLinearGradient(0, yFrente - largo, 0, yFrente);
      grad.addColorStop(0, 'rgba(34,211,238,0)');
      grad.addColorStop(0.7, 'rgba(34,211,238,0.32)');
      grad.addColorStop(1, 'rgba(190,247,255,0.85)');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(500, Math.max(G.FUGA.y, yFrente - largo));
      ctx.lineTo(500, yFrente);
      ctx.stroke();
      ctx.restore();

      brillo(500, yFrente, 'blanco', 46, 0.55);
      brillo(500, yFrente - 14, 'cyan', 92, 0.4);
      brillo(500, yFrente + 22, 'naranja', 58, 0.32);
    }
  }

  function dibujarFaros(ctx, t) {
    if (!faros) return;
    for (var i = 0; i < faros.length; i++) {
      var f = faros[i];
      var o = 0.55;
      var t0 = T.rafaga + (1 - o) * 0.25;
      var t1 = T.finRafaga + (1 - o) * 0.18;
      var t2 = t1 + 0.04;
      var t3 = T.finCiudad + (1 - o) * 0.25;
      var x;
      var y;
      var alfa = 0.85;

      if (t <= t0) {
        x = f.inicio.x;
        y = f.inicio.y;
        alfa = 0.9;
      } else if (t < t1) {
        var u = (t - t0) / (t1 - t0);
        u = 1 - Math.pow(1 - u, 3);
        x = f.inicio.x + (f.medio.x - f.inicio.x) * u;
        y = f.inicio.y + (f.medio.y - f.inicio.y) * u;
      } else {
        var v = limitar((t - t2) / (t3 - t2), 0, 1);
        v = entradaSalida(v);
        x = f.medio.x + (f.fin.x - f.medio.x) * v;
        y = f.medio.y + (f.fin.y - f.medio.y) * v;
      }

      var aparece = limitar(t / 0.3, 0, 1);
      brillo(x, y, f.tono, 64, 0.55 * alfa * aparece);
      brillo(x, y, 'blanco', 16, 0.5 * alfa * aparece);
      ctx.fillStyle = f.tono === 'naranja' ? 'rgba(255,240,214,0.95)' : 'rgba(220,250,255,0.95)';
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  CT.escena = {
    T: T,
    total: T.finTrazo,
    construir: construir,
    dibujar: dibujar,
    fijarLienzo: fijarLienzo,
    usarContexto: usarContexto,
    fase: function (t) {
      if (t < T.rafaga) return 'Bus';
      if (t < T.finRafaga) return 'Ráfaga';
      if (t < T.finCiudad) return 'Ciudad';
      if (t < T.finTrazo) return 'Trazo';
      return 'Final';
    },
  };
})();
