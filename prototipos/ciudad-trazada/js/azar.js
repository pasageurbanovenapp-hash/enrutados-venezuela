/* Aleatoriedad determinista.
   Todas las capturas del prototipo deben ser reproducibles: misma semilla,
   misma escena. Sin esto, comparar dos frames no prueba nada. */
(function () {
  'use strict';

  var CT = (window.CT = window.CT || {});

  var estado = 0x2f6e2b1;

  function sembrar(semilla) {
    estado = semilla >>> 0;
  }

  /* mulberry32: rápido, de período largo y suficientemente uniforme
     para dispersar puntos. No se usa para criptografía. */
  function azar() {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    var t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function entre(a, b) {
    return a + (b - a) * azar();
  }

  function entero(a, b) {
    return Math.floor(entre(a, b + 1));
  }

  CT.azar = { sembrar: sembrar, azar: azar, entre: entre, entero: entero };
})();
