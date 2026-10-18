/* Geometría de la escena.
   Todo vive en un mundo de 1000 x 1400 unidades y la escena lo escala al
   lienzo. Cada forma se describe por sus bordes (densos, con brillo alto) y su
   relleno (escaso, con brillo bajo): así una silueta se lee con pocos puntos.

   Sin DOM y sin canvas a propósito: estas funciones se pueden portar tal cual
   al componente React de la landing cuando la animación se inserte. */
(function () {
  'use strict';

  var CT = (window.CT = window.CT || {});
  var azar = CT.azar.azar;
  var entre = CT.azar.entre;

  var ANCHO = 1000;
  var ALTO = 1400;
  var TIERRA = 1400;
  var FUGA = { x: 500, y: 470 };

  /* ── utilidades ───────────────────────────────────────────────────────── */

  function aclarar(puntos, factor) {
    var out = [];
    for (var i = 0; i < puntos.length; i++) {
      var p = puntos[i];
      out.push({
        x: p.x,
        y: p.y,
        brillo: Math.min(1, p.brillo * factor * entre(0.75, 1)),
      });
    }
    return out;
  }

  /* Reparte n puntos entre partes según peso, sin perder ni sobrar ninguno. */
  function dividir(n, pesos) {
    var total = 0;
    var i;
    for (i = 0; i < pesos.length; i++) total += pesos[i];
    var res = [];
    var asignado = 0;
    for (i = 0; i < pesos.length; i++) {
      var c = Math.floor((n * pesos[i]) / total);
      res.push(c);
      asignado += c;
    }
    var resto = n - asignado;
    i = 0;
    while (resto > 0) {
      res[i % res.length]++;
      resto--;
      i++;
    }
    return res;
  }

  function repartir(n, partes) {
    var pesos = partes.map(function (p) {
      return p.peso;
    });
    var cuentas = dividir(n, pesos);
    var out = [];
    for (var i = 0; i < partes.length; i++) {
      if (cuentas[i] > 0) out = out.concat(partes[i].muestra(cuentas[i]));
    }
    return out;
  }

  /* ── muestreo de líneas ───────────────────────────────────────────────── */

  function segmento(ax, ay, bx, by, n, desvio, brillo) {
    var out = [];
    if (n <= 0) return out;
    var dx = bx - ax;
    var dy = by - ay;
    var largo = Math.hypot(dx, dy) || 1;
    var nx = -dy / largo;
    var ny = dx / largo;
    for (var i = 0; i < n; i++) {
      var u = (i + azar()) / n;
      var j = entre(-desvio, desvio);
      out.push({
        x: ax + dx * u + nx * j,
        y: ay + dy * u + ny * j,
        brillo: brillo * entre(0.72, 1),
      });
    }
    return out;
  }

  /* Recorre una polilínea abierta repartiendo n puntos por longitud. */
  function polilinea(pts, n, desvio, brillo) {
    var out = [];
    if (n <= 0 || pts.length < 2) return out;
    var tramos = [];
    var total = 0;
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i];
      var b = pts[i + 1];
      var largo = Math.hypot(b.x - a.x, b.y - a.y);
      if (largo < 0.001) continue;
      tramos.push({ a: a, b: b, largo: largo, acumulado: total });
      total += largo;
    }
    if (!tramos.length) return out;
    for (var k = 0; k < n; k++) {
      var d = ((k + azar()) / n) * total;
      var t = tramos[0];
      for (var j = 0; j < tramos.length; j++) {
        if (d <= tramos[j].acumulado + tramos[j].largo) {
          t = tramos[j];
          break;
        }
      }
      var u = (d - t.acumulado) / t.largo;
      var dx = t.b.x - t.a.x;
      var dy = t.b.y - t.a.y;
      var len = Math.hypot(dx, dy) || 1;
      var jx = (-dy / len) * entre(-desvio, desvio);
      var jy = (dx / len) * entre(-desvio, desvio);
      out.push({
        x: t.a.x + dx * u + jx,
        y: t.a.y + dy * u + jy,
        brillo: brillo * entre(0.72, 1),
      });
    }
    return out;
  }

  function arco(cx, cy, r, a0, a1, n, desvio, brillo) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var u = (i + azar()) / n;
      var a = a0 + (a1 - a0) * u;
      var rr = r + entre(-desvio, desvio);
      out.push({
        x: cx + Math.cos(a) * rr,
        y: cy + Math.sin(a) * rr,
        brillo: brillo * entre(0.72, 1),
      });
    }
    return out;
  }

  function circulo(cx, cy, r, n, desvio, brillo) {
    return arco(cx, cy, r, 0, Math.PI * 2, n, desvio, brillo);
  }

  /* Relleno de un círculo con sesgo radial: 0 uniforme, 1 hacia el borde. */
  function disco(cx, cy, r, n, brillo, sesgo) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var a = azar() * Math.PI * 2;
      var u = azar();
      var rr = r * Math.sqrt(u);
      if (sesgo) rr = r * (1 - Math.pow(azar(), 1 + sesgo * 2));
      out.push({
        x: cx + Math.cos(a) * rr,
        y: cy + Math.sin(a) * rr,
        brillo: brillo * entre(0.6, 1),
      });
    }
    return out;
  }

  /* ── rectángulos redondeados ──────────────────────────────────────────── */

  function perimetroRedondeado(x, y, w, h, r, n, desvio, brillo) {
    r = Math.min(r, w / 2, h / 2);
    var pts = [];
    function push(px, py) {
      pts.push({ x: px, y: py });
    }
    function esquina(cx, cy, a0, a1) {
      var pasos = 8;
      for (var i = 0; i <= pasos; i++) {
        var a = a0 + ((a1 - a0) * i) / pasos;
        push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
    }
    push(x + r, y);
    push(x + w - r, y);
    esquina(x + w - r, y + r, -Math.PI / 2, 0);
    push(x + w, y + h - r);
    esquina(x + w - r, y + h - r, 0, Math.PI / 2);
    push(x + r, y + h);
    esquina(x + r, y + h - r, Math.PI / 2, Math.PI);
    push(x, y + r);
    esquina(x + r, y + r, Math.PI, Math.PI * 1.5);
    return polilinea(pts, n, desvio, brillo);
  }

  function dentroRedondeado(px, py, x, y, w, h, r) {
    if (px < x || px > x + w || py < y || py > y + h) return false;
    var cx = Math.min(Math.max(px, x + r), x + w - r);
    var cy = Math.min(Math.max(py, y + r), y + h - r);
    var dx = px - cx;
    var dy = py - cy;
    return dx * dx + dy * dy <= r * r;
  }

  function rellenoRedondeado(x, y, w, h, r, n, brillo, sesgo) {
    var out = [];
    var guardia = 0;
    while (out.length < n && guardia < n * 80) {
      guardia++;
      var px = entre(x, x + w);
      var py = entre(y, y + h);
      if (!dentroRedondeado(px, py, x, y, w, h, r)) continue;
      if (sesgo && azar() > 1 - sesgo * ((py - y) / h)) continue;
      out.push({ x: px, y: py, brillo: brillo * entre(0.55, 1) });
    }
    while (out.length < n) out.push({ x: x + w / 2, y: y + h / 2, brillo: brillo * 0.4 });
    return out;
  }

  /* ── polígonos ────────────────────────────────────────────────────────── */

  function dentroPoligono(poli, px, py) {
    var dentro = false;
    for (var i = 0, j = poli.length - 1; i < poli.length; j = i++) {
      var xi = poli[i].x;
      var yi = poli[i].y;
      var xj = poli[j].x;
      var yj = poli[j].y;
      var cruza = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (cruza) dentro = !dentro;
    }
    return dentro;
  }

  function limites(poli) {
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    for (var i = 0; i < poli.length; i++) {
      var p = poli[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
  }

  /* Relleno con densidad creciente hacia la base: el volumen se sugiere
     apilando más puntos abajo, no dibujando ventanas. */
  function rellenoPoligono(poli, n, brilloBase) {
    var caja = limites(poli);
    var out = [];
    var guardia = 0;
    while (out.length < n && guardia < n * 120) {
      guardia++;
      var px = entre(caja.minX, caja.maxX);
      var py = entre(caja.minY, caja.maxY);
      if (!dentroPoligono(poli, px, py)) continue;
      var t = (py - FUGA.y) / (TIERRA - FUGA.y);
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      var peso = 0.22 + Math.pow(t, 1.6);
      if (azar() > peso) continue;
      out.push({ x: px, y: py, brillo: brilloBase * (0.42 + 0.58 * t) });
    }
    while (out.length < n) {
      var q = poli[Math.floor(azar() * poli.length)];
      out.push({ x: q.x, y: q.y, brillo: brilloBase * 0.35 });
    }
    return out;
  }

  /* ── bus ──────────────────────────────────────────────────────────────── */

  var CUERPO = { x: 250, y: 456, w: 500, h: 584, r: 42 };
  var CRISTAL_IZQ = { x: 300, y: 545, w: 192, h: 180, r: 14 };
  var CRISTAL_DER = { x: 508, y: 545, w: 192, h: 180, r: 14 };
  var LETRERO = { x: 305, y: 478, w: 390, h: 40, r: 8 };
  var PARACHOQUES = { x: 272, y: 964, w: 456, h: 48, r: 14 };
  var ESPEJO_IZQ = { x: 206, y: 592, w: 34, h: 72, r: 10 };
  var ESPEJO_DER = { x: 760, y: 592, w: 34, h: 72, r: 10 };
  var FAROS = [
    { x: 335, y: 800, r: 34, clase: 'cyan' },
    { x: 665, y: 800, r: 34, clase: 'naranja' },
  ];

  function muestraRedondeado(caja, n, desvio, brilloBorde, brilloRelleno, proporcionBorde, sesgo) {
    var borde = Math.round(n * proporcionBorde);
    return perimetroRedondeado(
      caja.x,
      caja.y,
      caja.w,
      caja.h,
      caja.r,
      borde,
      desvio,
      brilloBorde
    ).concat(rellenoRedondeado(caja.x, caja.y, caja.w, caja.h, caja.r, n - borde, brilloRelleno, sesgo));
  }

  function bus(n) {
    var partes = [
      {
        peso: 30,
        muestra: function (m) {
          return muestraRedondeado(CUERPO, m, 1.4, 0.95, 0.16, 0.76, 0.2);
        },
      },
      {
        peso: 14,
        muestra: function (m) {
          var mitad = Math.round(m / 2);
          return muestraRedondeado(CRISTAL_IZQ, mitad, 1.1, 0.8, 0.2, 0.78, 0)
            .concat(muestraRedondeado(CRISTAL_DER, m - mitad, 1.1, 0.8, 0.2, 0.78, 0));
        },
      },
      {
        peso: 5,
        muestra: function (m) {
          return muestraRedondeado(LETRERO, m, 0.9, 0.55, 0.14, 0.82, 0);
        },
      },
      {
        peso: 6,
        muestra: function (m) {
          var lineas = [872, 896, 920, 944];
          var out = [];
          var porLinea = Math.round(m / lineas.length);
          for (var i = 0; i < lineas.length; i++) {
            out = out.concat(
              segmento(355, lineas[i], 645, lineas[i], i === 0 ? m - porLinea * 3 : porLinea, 0.8, 0.62)
            );
          }
          return out;
        },
      },
      {
        peso: 10,
        muestra: function (m) {
          var porFaro = Math.round(m / 2);
          var out = [];
          for (var i = 0; i < FAROS.length; i++) {
            var f = FAROS[i];
            out = out.concat(circulo(f.x, f.y, f.r, Math.round(porFaro * 0.72), 1, 0.95));
            out = out.concat(disco(f.x, f.y, f.r * 0.62, porFaro - Math.round(porFaro * 0.72), 0.34, 0.7));
          }
          return out;
        },
      },
      {
        peso: 6,
        muestra: function (m) {
          return muestraRedondeado(PARACHOQUES, m, 1, 0.7, 0.16, 0.8, 0);
        },
      },
      {
        peso: 3,
        muestra: function (m) {
          var mitad = Math.round(m / 2);
          return perimetroRedondeado(ESPEJO_IZQ.x, ESPEJO_IZQ.y, ESPEJO_IZQ.w, ESPEJO_IZQ.h, ESPEJO_IZQ.r, mitad, 0.8, 0.72)
            .concat(
              perimetroRedondeado(ESPEJO_DER.x, ESPEJO_DER.y, ESPEJO_DER.w, ESPEJO_DER.h, ESPEJO_DER.r, m - mitad, 0.8, 0.72)
            );
        },
      },
      {
        peso: 2,
        muestra: function (m) {
          return segmento(500, 545, 500, 725, m, 0.9, 0.6);
        },
      },
      {
        peso: 3,
        muestra: function (m) {
          var mitad = Math.round(m / 2);
          return arco(298, 1042, 44, Math.PI, Math.PI * 2, mitad, 0.9, 0.6).concat(
            arco(702, 1042, 44, Math.PI, Math.PI * 2, m - mitad, 0.9, 0.6)
          );
        },
      },
    ];
    return repartir(n, partes);
  }

  /* ── ciudad en perspectiva ────────────────────────────────────────────────
     Una calle de un solo punto de fuga. Cada lado es una masa continua cuyo
     tejado es una escalera que converge al punto de fuga y cuyo borde interior
     es la línea de la calle, que también converge. */
  function masaPerspectiva(lado, n) {
    var K = 9;
    var xMax = 545;
    var crudo = [];
    var i;
    for (i = 0; i <= K; i++) {
      var prog = i / K;
      var x = 500 + lado * xMax * Math.pow(1 - prog, 1.55);
      var alcance = Math.pow(1 - prog, 0.9);
      /* Alturas con tres registros: pocas torres, muchas medianas, algunas
         bajas. Un perfil uniforme se lee como almena de castillo. */
      var suerte = azar();
      var desnivel = suerte < 0.22 ? entre(-430, -280) : suerte < 0.74 ? entre(-210, 30) : entre(45, 155);
      var y = FUGA.y + desnivel * alcance;
      crudo.push({ x: x, y: y });
    }

    /* Tejado: cada tramo cae levemente hacia la fuga y termina en un salto
       vertical. El escalón es lo que hace legible el edificio. */
    var techo = [{ x: crudo[0].x, y: crudo[0].y }];
    var pasos = [{ x: crudo[0].x, y: crudo[0].y }];
    for (i = 1; i <= K; i++) {
      var yTecho = crudo[i - 1].y + (FUGA.y - crudo[i - 1].y) * 0.16;
      techo.push({ x: crudo[i].x, y: yTecho });
      pasos.push({ x: crudo[i].x, y: yTecho });
      pasos.push({ x: crudo[i].x, y: crudo[i].y });
    }

    var bordeCalle = 500 + lado * 262;

    function tejadoEn(x) {
      for (var k = 0; k < techo.length - 1; k++) {
        var a = techo[k];
        var b = techo[k + 1];
        var menor = Math.min(a.x, b.x);
        var mayor = Math.max(a.x, b.x);
        if (x >= menor && x <= mayor) {
          var u = (x - a.x) / (b.x - a.x || 1);
          return a.y + (b.y - a.y) * u;
        }
      }
      return techo[techo.length - 1].y;
    }

    function baseEn(x) {
      var t = (x - bordeCalle) / (FUGA.x - bordeCalle);
      if (t <= 0) return TIERRA;
      if (t >= 1) return FUGA.y;
      return TIERRA + (FUGA.y - TIERRA) * t;
    }

    var poligono = [{ x: crudo[0].x, y: TIERRA }]
      .concat(pasos)
      .concat([{ x: bordeCalle, y: TIERRA }]);

    var cuentas = dividir(n, [26, 8, 14, 18, 34]);
    var out = [];

    /* 1. Tejado: la silueta. */
    out = out.concat(polilinea(pasos, cuentas[0], 1.2, 0.95));

    /* 2. Borde de calle: la fachada interior de la manzana. */
    out = out.concat(segmento(500, FUGA.y, bordeCalle, TIERRA, cuentas[1], 1.1, 0.7));

    /* 3. Verticales de edificio. Sin este borde la masa se lee como polvo;
       con él cada tramo se vuelve fachada. */
    for (i = 1; i < crudo.length; i++) {
      if (i % 2 === 0 && i !== crudo.length - 1) continue;
      var vx = crudo[i].x;
      out = out.concat(
        segmento(vx, crudo[i].y, vx, baseEn(vx), Math.max(5, Math.round(cuentas[2] / 4)), 1, 0.42)
      );
    }

    /* 4. Líneas de piso. Son horizontales en 3D, así que convergen a la fuga.
       Se recortan contra el tejado: una línea no atraviesa un edificio bajo. */
    var alturas = [700, 980, 1240];
    var porPiso = Math.max(2, Math.round(cuentas[3] / alturas.length));
    for (var h = 0; h < alturas.length; h++) {
      var yCerca = alturas[h];
      var xCerca = crudo[0].x;
      var puestos = 0;
      for (var xx = xCerca; lado > 0 ? xx >= FUGA.x : xx <= FUGA.x; xx -= lado * 5) {
        if (puestos >= porPiso) break;
        var yLinea = FUGA.y + ((yCerca - FUGA.y) * (xx - FUGA.x)) / (xCerca - FUGA.x);
        if (yLinea > TIERRA - 2) continue;
        if (yLinea < tejadoEn(xx) - 4) continue;
        puestos++;
        out.push({
          x: xx + entre(-1.4, 1.4),
          y: yLinea + entre(-1.4, 1.4),
          brillo: 0.19 * entre(0.7, 1),
        });
      }
    }

    /* 5. Relleno: sugiere volumen sin dibujar ventanas. */
    out = out.concat(rellenoPoligono(poligono, cuentas[4], 1));

    /* 6. Torre de referencia: una sola, asimétrica, sin detalle. Rompe el
       perfil repetido y da un punto memorable a la composición. */
    if (lado === 1) {
      var torreX = 536;
      var torreW = 42;
      var torreY = 286;
      out = out.concat(segmento(torreX, 470, torreX, torreY, 30, 0.9, 0.9));
      out = out.concat(segmento(torreX + torreW, 470, torreX + torreW, torreY, 30, 0.9, 0.9));
      out = out.concat(segmento(torreX, torreY, torreX + torreW, torreY, 12, 0.9, 0.95));
      out = out.concat(rellenoRedondeado(torreX, torreY, torreW, 184, 4, 26, 0.16, 0.25));
    }

    return out;
  }

  /* ── ciudad en alzado (plan B) ────────────────────────────────────────────
     Sin perspectiva: una silueta frontal de edificios con la avenida como
     hueco central. Sirve para comprobar si el problema es la perspectiva. */
  function masaPlana(lado, n) {
    var K = 8;
    var xInterior = 500 + lado * 150;
    var xExterior = 500 + lado * 540;
    var crudo = [];
    var i;
    for (i = 0; i <= K; i++) {
      var u = i / K;
      var x = xExterior + (xInterior - xExterior) * Math.pow(u, 0.85);
      var y = 690 + entre(-210, 140) * (1 - 0.35 * u);
      crudo.push({ x: x, y: y });
    }

    var pasos = [{ x: crudo[0].x, y: crudo[0].y }];
    for (i = 1; i <= K; i++) {
      pasos.push({ x: crudo[i].x, y: crudo[i - 1].y });
      pasos.push({ x: crudo[i].x, y: crudo[i].y });
    }

    var poligono = [{ x: crudo[0].x, y: TIERRA }]
      .concat(pasos)
      .concat([{ x: xInterior, y: TIERRA }]);

    var cuentas = dividir(n, [32, 8, 60]);
    var out = [];
    out = out.concat(polilinea(pasos, cuentas[0], 1.2, 0.95));
    out = out.concat(segmento(xInterior, crudo[crudo.length - 1].y, xInterior, TIERRA, cuentas[1], 1, 0.7));
    out = out.concat(rellenoPoligono(poligono, cuentas[2], 1));
    return out;
  }

  function ciudad(n, modo) {
    var mitad = Math.round(n / 2);
    var masa = modo === 'plano' ? masaPlana : masaPerspectiva;
    return masa(-1, mitad).concat(masa(1, n - mitad));
  }

  /* ── ruta y nodos ─────────────────────────────────────────────────────── */

  var NODOS = [
    { y: 646, r: 2.6 },
    { y: 862, r: 3.6 },
    { y: 1092, r: 4.8 },
    { y: 1306, r: 6.4 },
  ];

  CT.geometria = {
    ANCHO: ANCHO,
    ALTO: ALTO,
    TIERRA: TIERRA,
    FUGA: FUGA,
    CENTRO_BUS: { x: 500, y: 748 },
    NODOS: NODOS,
    FAROS: FAROS,
    bus: bus,
    ciudad: ciudad,
    segmento: segmento,
    polilinea: polilinea,
  };
})();
