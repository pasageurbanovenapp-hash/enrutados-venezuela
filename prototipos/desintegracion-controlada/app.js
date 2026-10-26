import {
  decodificarFacetas,
  progresoFaceta,
  transformarVertice,
} from './motor.js';

const canvas = document.getElementById('bus');
const contexto = canvas.getContext('2d');
const control = document.getElementById('progreso');
const lectura = document.getElementById('valor-progreso');
const fase = document.getElementById('fase');
const estadoCarga = document.getElementById('estado-carga');
const detalleActivo = document.getElementById('detalle-activo');
const ayuda = document.getElementById('ayuda');
const botones = [...document.querySelectorAll('[data-progreso]')];
const preferenciaMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
const preferenciaMovil = window.matchMedia('(max-width: 600px)');
const vista = crearVista(42, -12);
const luz = normalizar([-0.38, 0.86, 0.34]);
const paleta = [
  crearTonos([27, 143, 151]),
  crearTonos([22, 48, 62]),
  crearTonos([7, 18, 28]),
  crearTonos([210, 235, 229]),
  crearTonos([229, 151, 51]),
];

let niveles = [];
let facetas = [];
let encuadre = null;
let ancho = 0;
let alto = 0;
let progreso = 0;
let reducirMovimiento = preferenciaMovimiento.matches;
let perfilMovilActual = null;
let bytesGeometria = 0;
let msCarga = 0;
const puntosProyectados = new Float64Array(9);

function normalizar(vector) {
  const longitud = Math.hypot(...vector);
  return vector.map((valor) => valor / longitud);
}

function crearTonos(base) {
  return Array.from({ length: 9 }, (_, indice) => {
    const iluminacion = 0.42 + 0.68 * indice / 8;
    return `rgb(${base.map((canal) => Math.min(255, Math.round(canal * iluminacion))).join(',')})`;
  });
}

function aleatorioFijo(indice, sal) {
  let valor = Math.imul(indice + 1, 0x45d9f3b) ^ sal;
  valor = Math.imul(valor ^ (valor >>> 16), 0x45d9f3b);
  valor = Math.imul(valor ^ (valor >>> 16), 0x45d9f3b);
  return ((valor ^ (valor >>> 16)) >>> 0) / 4294967296;
}

function crearVista(azimut, elevacion) {
  const az = azimut * Math.PI / 180;
  const el = elevacion * Math.PI / 180;
  const frente = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
  const derecha = normalizar([frente[2], 0, -frente[0]]);
  const arriba = [
    frente[1] * derecha[2] - frente[2] * derecha[1],
    frente[2] * derecha[0] - frente[0] * derecha[2],
    frente[0] * derecha[1] - frente[1] * derecha[0],
  ];
  return { frente, derecha, arriba };
}

function producto(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function crearFacetas(nivel) {
  const centroBus = [
    (nivel.minimo[0] + nivel.maximo[0]) / 2,
    (nivel.minimo[1] + nivel.maximo[1]) / 2,
    (nivel.minimo[2] + nivel.maximo[2]) / 2,
  ];
  const diagonal = Math.hypot(
    nivel.maximo[0] - nivel.minimo[0],
    nivel.maximo[1] - nivel.minimo[1],
    nivel.maximo[2] - nivel.minimo[2],
  );
  const resultado = new Array(nivel.triangulos);

  for (let indice = 0; indice < nivel.triangulos; indice++) {
    const puntos = [];
    for (let vertice = 0; vertice < 3; vertice++) {
      const posicion = nivel.indices[indice * 3 + vertice] * 3;
      puntos.push([
        nivel.posiciones[posicion],
        nivel.posiciones[posicion + 1],
        nivel.posiciones[posicion + 2],
      ]);
    }

    const centro = [
      (puntos[0][0] + puntos[1][0] + puntos[2][0]) / 3,
      (puntos[0][1] + puntos[1][1] + puntos[2][1]) / 3,
      (puntos[0][2] + puntos[1][2] + puntos[2][2]) / 3,
    ];
    const radial = [
      (centro[0] - centroBus[0]) / diagonal,
      (centro[1] - centroBus[1]) / diagonal,
      (centro[2] - centroBus[2]) / diagonal,
    ];
    // Normal de la faceta, orientada hacia fuera. El desprendimiento empieza
    // perpendicular a la superficie: se lee como pelado, no como inflado.
    const aristaA = [puntos[1][0] - puntos[0][0], puntos[1][1] - puntos[0][1], puntos[1][2] - puntos[0][2]];
    const aristaB = [puntos[2][0] - puntos[0][0], puntos[2][1] - puntos[0][1], puntos[2][2] - puntos[0][2]];
    const normal = normalizar([
      aristaA[1] * aristaB[2] - aristaA[2] * aristaB[1],
      aristaA[2] * aristaB[0] - aristaA[0] * aristaB[2],
      aristaA[0] * aristaB[1] - aristaA[1] * aristaB[0],
    ]);
    const haciaFuera = normal[0] * radial[0] + normal[1] * radial[1] + normal[2] * radial[2] < 0 ? -1 : 1;
    const empuje = [
      normal[0] * haciaFuera * 0.55,
      normal[1] * haciaFuera * 0.55,
      normal[2] * haciaFuera * 0.55,
    ];
    const desplazamiento = normalizar([
      radial[0] * 0.70 + empuje[0] + 0.04 + (aleatorioFijo(indice, 17) - 0.5) * 0.18,
      radial[1] * 0.70 + empuje[1] + 0.14 + (aleatorioFijo(indice, 29) - 0.5) * 0.18,
      radial[2] * 0.70 + empuje[2] + 0.08 + (aleatorioFijo(indice, 43) - 0.5) * 0.18,
    ]);
    const eje = normalizar([
      aleatorioFijo(indice, 61) * 2 - 1,
      aleatorioFijo(indice, 79) * 2 - 1,
      aleatorioFijo(indice, 97) * 2 - 1,
    ]);

    resultado[indice] = {
      orden: indice,
      puntos,
      centro,
      desplazamiento,
      eje,
      demora: Math.min(1, 0.62 * Math.sqrt(aleatorioFijo(indice, 113))
        + 0.38 * (centro[2] - nivel.minimo[2]) / Math.max(1e-6, nivel.maximo[2] - nivel.minimo[2])),
      distancia: diagonal * (0.10 + aleatorioFijo(indice, 131) * 0.14),
      giro: (aleatorioFijo(indice, 149) * 2 - 1) * 0.40,
      grupo: nivel.grupos[indice],
      transformados: new Float32Array(9),
      profundidad: 0,
      visible: false,
    };
  }

  return { facetas: resultado, centroBus, diagonal };
}

function proyectar(x, y, z, destino, offset = 0) {
  destino[offset] = x * vista.derecha[0] + y * vista.derecha[1] + z * vista.derecha[2];
  destino[offset + 1] = x * vista.arriba[0] + y * vista.arriba[1] + z * vista.arriba[2];
}

function calcularEncuadre(facetas) {
  const limites = [Infinity, -Infinity, Infinity, -Infinity];
  const proyectado = new Float64Array(2);

  function incluir(x, y, z) {
    proyectar(x, y, z, proyectado);
    limites[0] = Math.min(limites[0], proyectado[0]);
    limites[1] = Math.max(limites[1], proyectado[0]);
    limites[2] = Math.min(limites[2], proyectado[1]);
    limites[3] = Math.max(limites[3], proyectado[1]);
  }

  // El encuadre se calcula solo con el autobus integro: si se incluye el estado
  // disperso, el vehiculo queda diminuto para dejar sitio a fragmentos que casi
  // no se ven. Con este cambio el bus ocupa el escenario y los fragmentos salen
  // de cuadro, que es lo que se busca al final del recorrido.
  for (const faceta of facetas) {
    for (const punto of faceta.puntos) incluir(...punto);
  }

  const margenX = (limites[1] - limites[0]) * 0.22;
  const margenY = (limites[3] - limites[2]) * 0.22;
  return {
    minimoX: limites[0] - margenX,
    maximoX: limites[1] + margenX,
    minimoY: limites[2] - margenY,
    maximoY: limites[3] + margenY,
  };
}

function prepararFacetas() {
  const movil = preferenciaMovil.matches;
  perfilMovilActual = movil;
  const indiceNivel = movil ? niveles.length - 1 : 0;
  const nivel = niveles[indiceNivel];
  const preparacion = crearFacetas(nivel);
  facetas = preparacion.facetas;
  encuadre = calcularEncuadre(facetas);
  detalleActivo.textContent = `${indiceNivel === 0 ? 'Nivel amplio' : 'Nivel compacto'} · ${nivel.triangulos.toLocaleString('es')} facetas · facetas.bin ${bytesGeometria.toLocaleString('es')} bytes · carga ${msCarga.toFixed(1)} ms`;
  prepararLienzo();
}

function prepararLienzo() {
  const caja = canvas.getBoundingClientRect();
  if (!caja.width || !caja.height) return;
  ancho = caja.width;
  alto = caja.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const anchoReal = Math.round(ancho * dpr);
  const altoReal = Math.round(alto * dpr);
  if (canvas.width !== anchoReal || canvas.height !== altoReal) {
    canvas.width = anchoReal;
    canvas.height = altoReal;
  }
  contexto.setTransform(dpr, 0, 0, dpr, 0, 0);
  dibujar();
}

function dibujar() {
  if (!facetas.length || !ancho || !alto) return;
  contexto.clearRect(0, 0, ancho, alto);
  contexto.fillStyle = '#081b26';
  contexto.fillRect(0, 0, ancho, alto);

  const margen = Math.min(ancho, alto) * 0.09;
  const extensionX = encuadre.maximoX - encuadre.minimoX;
  const extensionY = encuadre.maximoY - encuadre.minimoY;
  const escala = Math.min((ancho - margen * 2) / extensionX, (alto - margen * 2) / extensionY);
  const izquierda = (ancho - extensionX * escala) / 2;
  const arriba = (alto - extensionY * escala) / 2;
  for (const faceta of facetas) {
    const cantidad = progresoFaceta(progreso, faceta.demora);
    faceta.progresoLocal = cantidad;
    for (let vertice = 0; vertice < 3; vertice++) {
      transformarVertice(
        faceta.puntos[vertice],
        faceta.centro,
        faceta.desplazamiento,
        faceta.eje,
        cantidad,
        faceta.distancia,
        faceta.giro,
        faceta.transformados,
        vertice * 3,
      );
    }

    const ax = faceta.transformados[3] - faceta.transformados[0];
    const ay = faceta.transformados[4] - faceta.transformados[1];
    const az = faceta.transformados[5] - faceta.transformados[2];
    const bx = faceta.transformados[6] - faceta.transformados[0];
    const by = faceta.transformados[7] - faceta.transformados[1];
    const bz = faceta.transformados[8] - faceta.transformados[2];
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    const largoNormal = Math.hypot(nx, ny, nz) || 1;
    const normalX = nx / largoNormal;
    const normalY = ny / largoNormal;
    const normalZ = nz / largoNormal;
    const frente = normalX * vista.frente[0] + normalY * vista.frente[1] + normalZ * vista.frente[2];
    faceta.visible = cantidad > 0.45 || frente < 0;
    faceta.profundidad = (
      faceta.transformados[0] * vista.frente[0]
      + faceta.transformados[1] * vista.frente[1]
      + faceta.transformados[2] * vista.frente[2]
      + faceta.transformados[3] * vista.frente[0]
      + faceta.transformados[4] * vista.frente[1]
      + faceta.transformados[5] * vista.frente[2]
      + faceta.transformados[6] * vista.frente[0]
      + faceta.transformados[7] * vista.frente[1]
      + faceta.transformados[8] * vista.frente[2]
    ) / 3;
    faceta.luz = Math.min(8, Math.max(0, Math.round(
      (0.30 + Math.abs(normalX * luz[0] + normalY * luz[1] + normalZ * luz[2]) * 0.70) * 8,
    )));
  }

  facetas.sort((a, b) => a.profundidad - b.profundidad || a.orden - b.orden);
  for (const faceta of facetas) {
    if (!faceta.visible) continue;
    for (let vertice = 0; vertice < 3; vertice++) {
      const origen = vertice * 3;
      proyectar(
        faceta.transformados[origen],
        faceta.transformados[origen + 1],
        faceta.transformados[origen + 2],
        puntosProyectados,
        vertice * 2,
      );
    }

    contexto.beginPath();
    contexto.moveTo(
      izquierda + (puntosProyectados[0] - encuadre.minimoX) * escala,
      alto - arriba - (puntosProyectados[1] - encuadre.minimoY) * escala,
    );
    contexto.lineTo(
      izquierda + (puntosProyectados[2] - encuadre.minimoX) * escala,
      alto - arriba - (puntosProyectados[3] - encuadre.minimoY) * escala,
    );
    contexto.lineTo(
      izquierda + (puntosProyectados[4] - encuadre.minimoX) * escala,
      alto - arriba - (puntosProyectados[5] - encuadre.minimoY) * escala,
    );
    contexto.closePath();
    const viaje = Math.max(0, (faceta.progresoLocal - 0.55) / 0.45);
    contexto.globalAlpha = 1 - 0.70 * viaje;
    contexto.fillStyle = paleta[faceta.grupo][faceta.luz];
    contexto.fill();

    if (progreso < 0.82) {
      contexto.strokeStyle = faceta.grupo === 4
        ? 'rgba(244, 179, 82, 0.36)'
        : 'rgba(75, 206, 211, 0.20)';
      contexto.lineWidth = 0.45;
      contexto.stroke();
    }
  }
  contexto.globalAlpha = 1;
}

function nombreFase(valor) {
  if (valor === 0) return 'Autobús íntegro';
  if (valor < 0.25) return 'Separación inicial';
  if (valor < 0.5) return 'Facetas desprendiéndose';
  if (valor < 0.75) return 'Dispersión intermedia';
  if (valor < 1) return 'Fragmentación avanzada';
  return 'Fragmentos dispersos';
}

function establecerProgreso(valor) {
  progreso = reducirMovimiento ? 0 : Math.max(0, Math.min(1, valor));
  control.value = String(Math.round(progreso * 1000));
  lectura.value = `p = ${progreso.toFixed(2)}`;
  fase.textContent = nombreFase(progreso);
  for (const boton of botones) {
    boton.setAttribute('aria-pressed', String(Number(boton.dataset.progreso) === progreso));
  }
  dibujar();
}

function configurarMovimientoReducido() {
  reducirMovimiento = preferenciaMovimiento.matches;
  control.disabled = reducirMovimiento;
  for (const boton of botones) boton.disabled = reducirMovimiento;
  if (reducirMovimiento) {
    ayuda.textContent = 'Movimiento reducido activo: se muestra el autobús íntegro y estático. No hay bucle de fotogramas.';
    establecerProgreso(0);
  } else {
    ayuda.textContent = 'Usa el control para avanzar o retroceder. Cada estado se calcula desde la geometría original; no hay reloj ni acumulación de transformaciones.';
  }
}

async function iniciar() {
  if (!contexto) throw new Error('Canvas 2D no está disponible en este navegador');
  const inicioCarga = performance.now();
  const respuesta = await fetch('../facetas-retexture/facetas.bin');
  if (!respuesta.ok) throw new Error(`No se pudo cargar facetas.bin: HTTP ${respuesta.status}`);
  const buffer = await respuesta.arrayBuffer();
  msCarga = performance.now() - inicioCarga;
  bytesGeometria = buffer.byteLength;
  niveles = decodificarFacetas(buffer);

  const estado = new URLSearchParams(location.search).get('p');
  const inicial = estado === null ? 0 : Number(estado);
  if (!Number.isFinite(inicial)) throw new Error('El parámetro p debe ser un número entre 0 y 1');

  prepararFacetas();
  control.addEventListener('input', () => establecerProgreso(Number(control.value) / 1000));
  for (const boton of botones) {
    boton.addEventListener('click', () => establecerProgreso(Number(boton.dataset.progreso)));
  }
  preferenciaMovimiento.addEventListener('change', configurarMovimientoReducido);
  preferenciaMovil.addEventListener('change', prepararFacetas);
  new ResizeObserver(() => {
    if (preferenciaMovil.matches !== perfilMovilActual) prepararFacetas();
    else prepararLienzo();
  }).observe(canvas);
  window.addEventListener('resize', prepararFacetas);

  estadoCarga.textContent = reducirMovimiento ? 'Movimiento reducido · estado estático' : 'Malla lista · control manual';
  configurarMovimientoReducido();
  if (!reducirMovimiento) establecerProgreso(Math.max(0, Math.min(1, inicial)));

  // Gancho de validación: recorre la secuencia y compara los píxeles del canvas
  // en los puntos que deben coincidir. No interviene en el uso normal.
  if (new URLSearchParams(location.search).get('secuencia') === '1' && !reducirMovimiento) {
    const captura = () => canvas.toDataURL();
    const recorrido = [0, 0.25, 0.5, 0.75, 1, 0.5, 0];
    const marcas = recorrido.map((valor) => {
      establecerProgreso(valor);
      return captura();
    });
    const iguales = marcas[2] === marcas[5] && marcas[0] === marcas[6];
    estadoCarga.textContent = `${iguales ? 'Reversibilidad OK' : 'Reversibilidad FALLO'} · p0.5 ${marcas[2] === marcas[5] ? 'coincide' : 'difiere'} · p0 ${marcas[0] === marcas[6] ? 'coincide' : 'difiere'}`;
    document.body.dataset.reversibilidad = iguales ? 'ok' : 'fallo';
  }
}

iniciar().catch((error) => {
  estadoCarga.textContent = `Error: ${error.message}`;
  detalleActivo.textContent = 'No se pudo iniciar el experimento; revisa el error de carga.';
  console.error(error);
});
