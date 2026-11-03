import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const canvas = document.getElementById('escena');
const copyUno = document.getElementById('copy-uno');
const copyDos = document.getElementById('copy-dos');
const ciudadNotaEl = copyDos.querySelector('.nota');
const contadorEl = document.getElementById('contador');
const detalleEl = document.getElementById('detalle');
const barraEl = document.getElementById('barra');
const sonidoBtn = document.getElementById('sonido');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x050e15, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050e15, 0.018);
const MOVIL = window.matchMedia('(max-width: 760px)').matches; // mismo corte que el CSS
const CAM_FINAL = new THREE.Vector3(0, MOVIL ? 3.0 : 2.6, MOVIL ? 9.0 : 10.8);
const CAM_MIRA = new THREE.Vector3(MOVIL ? 1.6 : 0, MOVIL ? 1.4 : 1.3, MOVIL ? -0.8 : -0.3);
// PARCHE 6: en pantallas muy anchas (1920×938 → 82° de campo horizontal) los bordes se deforman. Se cierra el campo
// vertical a 32° y se aleja la cámara lo equivalente: mismo encuadre en el centro, mucho menos estiramiento al entrar.
const FOV = MOVIL ? 45 : 32;
const BASE_FOV = FOV;
const K_FOV = Math.tan(THREE.MathUtils.degToRad(22.5)) / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
CAM_FINAL.sub(CAM_MIRA).multiplyScalar(K_FOV).add(CAM_MIRA);
const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
camera.position.copy(CAM_FINAL);
camera.lookAt(CAM_MIRA);
// PARCHE 1: el buffer y el aspecto salen de la caja REAL del canvas (en móvil mide 54vh, no 100vh).
function medir() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
medir();
scene.add(new THREE.HemisphereLight(0x9fdbe4, 0x071018, 1.2));
const luz = new THREE.DirectionalLight(0xe8fbff, 2.0);
luz.position.set(4, 6, 7);
scene.add(luz);

// PARCHE 6: BUS_X / BUS_Y / BUS_SCALE se calculan al cargar midiendo el bus real en pantalla
// (ver ajustarEncuadre). Estos son solo valores iniciales.
let BUS_X = MOVIL ? 0.2 : -2.5;
let BUS_Y = MOVIL ? 1.6 : 1.7;
const BUS_Z = 0;
let BUS_SCALE = MOVIL ? 3.8 : 4.2;
let BUS_ROT = MOVIL ? 0.38 : 0.55;   // valor inicial: ajustarEncuadre() lo recalcula (ver BUS_DELTA)
const BUS_FWD = [Math.sin(BUS_ROT), 0, Math.cos(BUS_ROT)];
// ============================================================================
// PARCHE 6 · ENCUADRE POR PANTALLA + ENTRADA RECTA
// ----------------------------------------------------------------------------
// Tamaños y posiciones se piden en unidades de PANTALLA (NDC: el canvas va de -1 a +1):
//   ancho  = fracción de su mitad (escritorio) o del ancho total (móvil)   [1.0 = la mitad / 2.0 = todo]
//   ndc    = dónde cae el centro (−0.5 = centro de la mitad izquierda, +0.5 = de la derecha)
//   cy     = altura del centro en pantalla (0 = al medio)
// El código mide el bus y la ciudad reales y calcula escala/posición para cumplirlo.
// ============================================================================
const ENCUADRE = MOVIL
  ? { busAncho: 1.50, busAlto: 1.45, busNdc: -0.06, busCy: 0.02, ciudadAncho: 1.55, ciudadAlto: 1.55, ciudadNdc: 0.08, ciudadCy: 0.06 }
  : { busAncho: 0.68, busAlto: 1.30, busNdc: -0.50, busCy: 0.00, ciudadAncho: 0.82, ciudadAlto: 1.50, ciudadNdc: 0.50, ciudadCy: 0.06 };
// Ángulo entre el eje del bus y la línea de visión hacia la cámara: ~20° = un 3/4 que se lee (lado largo + frontal).
// Al mover el bus hacia la izquierda, el ángulo del bus se recalcula para conservar ese 3/4.
const BUS_DELTA = THREE.MathUtils.degToRad(MOVIL ? 22 : 20);
const SUELO_Y = 0.02;                                  // las ruedas del bus tocan el suelo
const ENTRY_LARGOS = 1.0;                              // recorrido de entrada = ENTRY_LARGOS × largo del bus
const DOLLY = (MOVIL ? new THREE.Vector3(0, -0.2, -1.1) : new THREE.Vector3(0, -0.30, -1.6)).multiplyScalar(K_FOV); // la cámara "empuja" hacia la ciudad
const DOLLY_INICIO = 0.15, DOLLY_FIN = 0.97;                    // PARCHE 8: ahora sobre el progreso de reintegración (ur)
let ENTRY_D = 0, ENTRY_YAW0 = 0;                       // se calculan en ajustarEncuadre()
let CAM_CITY_POS = null, CAM_CITY_MIRA = null;         // cámara con el empuje completo (para encuadrar la ciudad)
let ASPECTO_AJUSTE = 1;
let BASE_ASPECTO = 1;
const ENCUADRE_INFO = {};
const EJE_Y = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
const _dir = new THREE.Vector3();

function usarCamara(pos, mira) {
  camera.position.copy(pos);
  camera.lookAt(mira);
  camera.updateMatrixWorld(true);
}
function ndcDeCaja(esquinas) {            // esquinas en mundo → caja en NDC con la cámara actual
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (const c of esquinas) {
    _v.set(c[0], c[1], c[2]).project(camera);
    minx = Math.min(minx, _v.x); maxx = Math.max(maxx, _v.x);
    miny = Math.min(miny, _v.y); maxy = Math.max(maxy, _v.y);
  }
  return { minx, maxx, miny, maxy, cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, w: maxx - minx, h: maxy - miny };
}
function esquinasBus(escala, x, y, z, rumbo) {
  const a = level.minimo, b = level.maximo, c = Math.cos(rumbo), s = Math.sin(rumbo);
  const out = [];
  for (const lx of [a[0], b[0]]) for (const ly of [a[1], b[1]]) for (const lz of [a[2], b[2]]) {
    out.push([x + (lx * c + lz * s) * escala, y + ly * escala, z + (-lx * s + lz * c) * escala]);
  }
  return out;
}
function ajustarEncuadre() {
  const E = ENCUADRE;
  const camPos = CAM_FINAL.clone(), camMira = CAM_MIRA.clone();
  let escala = BUS_SCALE, x = BUS_X, y = BUS_Y;
  // 1) tamaño y posición horizontal del bus; luego centrar en vertical moviendo la cámara (sin cambiar su pitch)
  for (let pasada = 0; pasada < 3; pasada++) {
    usarCamara(camPos, camMira);
    for (let it = 0; it < 30; it++) {
      y = SUELO_Y - level.minimo[1] * escala;
      let m = ndcDeCaja(esquinasBus(escala, x, y, BUS_Z, BUS_ROT));
      escala *= Math.min(E.busAncho / m.w, E.busAlto / m.h);
      y = SUELO_Y - level.minimo[1] * escala;
      m = ndcDeCaja(esquinasBus(escala, x, y, BUS_Z, BUS_ROT));
      const m2 = ndcDeCaja(esquinasBus(escala, x + 0.5, y, BUS_Z, BUS_ROT));
      const pend = (m2.cx - m.cx) / 0.5;
      if (Math.abs(pend) > 1e-6) x += (E.busNdc - m.cx) / pend;
      BUS_ROT = Math.atan2(camPos.x - x, camPos.z - BUS_Z) + BUS_DELTA;
    }
    const m = ndcDeCaja(esquinasBus(escala, x, y, BUS_Z, BUS_ROT));
    const prof = camPos.distanceTo(_v.set(x, y, BUS_Z));
    const dy = (m.cy - E.busCy) * prof * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camPos.y += dy; camMira.y += dy;
  }
  BUS_SCALE = escala; BUS_X = x; BUS_Y = y;
  BUS_FWD[0] = Math.sin(BUS_ROT); BUS_FWD[2] = Math.cos(BUS_ROT);
  laneGroup.rotation.y = BUS_ROT;
  CAM_FINAL.copy(camPos); CAM_MIRA.copy(camMira);
  CAM_CITY_POS = CAM_FINAL.clone().add(DOLLY);
  CAM_CITY_MIRA = CAM_MIRA.clone().add(DOLLY);
  // 2) entrada: recta por el eje (rumbo constante = BUS_ROT) + paneo mínimo para que arranque FUERA de cuadro
  const largo = (level.maximo[2] - level.minimo[2]) * BUS_SCALE;
  ENTRY_D = ENTRY_LARGOS * largo;
  const ix = BUS_X - BUS_FWD[0] * ENTRY_D, iz = BUS_Z - BUS_FWD[2] * ENTRY_D;
  const dir0 = CAM_MIRA.clone().sub(CAM_FINAL);
  ENTRY_YAW0 = 0;
  for (let g = 0; g <= 55; g += 0.5) {
    _dir.copy(dir0).applyAxisAngle(EJE_Y, -THREE.MathUtils.degToRad(g));
    usarCamara(CAM_FINAL, CAM_FINAL.clone().add(_dir));
    ENTRY_YAW0 = g;
    if (ndcDeCaja(esquinasBus(BUS_SCALE, ix, BUS_Y, iz, BUS_ROT)).maxx <= -1.04) break;
  }
  // 3) lo que depende de la escala del bus
  laneGroup.position.set(BUS_X, 0, BUS_Z);
  laneGroup.scale.setScalar(BUS_SCALE / 4.2);
  usarCamara(CAM_FINAL, CAM_MIRA);
  const mf = ndcDeCaja(esquinasBus(BUS_SCALE, BUS_X, BUS_Y, BUS_Z, BUS_ROT));
  ASPECTO_AJUSTE = camera.aspect;
  BASE_ASPECTO = camera.aspect;
  Object.assign(ENCUADRE_INFO, {
    aspecto: +camera.aspect.toFixed(3), movil: MOVIL,
    bus: { escala: +BUS_SCALE.toFixed(3), x: +BUS_X.toFixed(3), y: +BUS_Y.toFixed(3), ndcCentro: +mf.cx.toFixed(3), ndcAncho: +mf.w.toFixed(3), ndcAlto: +mf.h.toFixed(3) },
    entrada: { recorrido: +ENTRY_D.toFixed(2), paneoInicialGrados: ENTRY_YAW0, rumboBusGrados: +THREE.MathUtils.radToDeg(BUS_ROT).toFixed(1) },
  });
}
// recta por el eje con freno (ease-out); el rumbo NO cambia: nada de curva ni derrape
function busPath(e) {
  const s = 1 - (1 - e) * (1 - e);
  const r = (1 - s) * ENTRY_D;
  return { x: BUS_X - BUS_FWD[0] * r, z: BUS_Z - BUS_FWD[2] * r, rumbo: BUS_ROT, yaw: ENTRY_YAW0 * (1 - s) };
}
const BUS_ENTRY_END = 0.17;                // antes 0.24: la entrada ahora es corta
const FRENO = BUS_ENTRY_END - 0.004;       // freno + humo atados al final de la entrada
// ============================================================================
// PARCHE 8 · DOS RELOJES
// Reloj A (TIEMPO): al detenerse el bus, freno + humo, erosión y deriva del viento corren SOLOS durante ERODE_SECS.
//                   El scroll solo dispara (BUS_ENTRY_END); si se sube, la erosión se revierte.
// Reloj B (SCROLL): en la sección 2 el scroll gobierna la reintegración (ur): recogida → texto → ciudad.
// ============================================================================
const ERODE_SECS = 5.0;                                 // duración total del acto en segundos
const E_INI = 0.15, E_FRENTE = 0.45, E_DRIFT = 0.40;    // fracciones de ERODE_SECS: freno+humo | frente de erosión | deriva (suman 1.0)
const REFORM_START = 0.38;                              // scroll donde empieza la sección 2 (entre 0.17 y aquí el scroll no hace nada)
const E_COMPUERTA = 0.75;                               // la reintegración no avanza hasta que la erosión pase de este punto
const REFORM_SECS = 4.0;                                // reloj B: ensamble automático de la ciudad
const LLEG0 = 0.45, LLEG1 = 0.40;                       // llegada de materia a la ciudad, en progreso ur: 0.45 … 0.85
const llegada = (ad) => LLEG0 + ad * LLEG1;
const REDUCIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COUNT = 10000;

const rng = mulberry32(0x8d3a41);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };
const mix = (a, b, v) => a + (b - a) * v;
function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function scale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function length(a) { return Math.hypot(a[0], a[1], a[2]); }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

// --- carril local del bus, sin avenida ---
const laneGroup = new THREE.Group();
const laneMaterial = new THREE.MeshBasicMaterial({ color: 0x04121a, transparent: true, opacity: 0.85, depthWrite: false });
let laneLineMat; // PARCHE 6: ahora también se desvanece (antes quedaba una diagonal en la ciudad)
{
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 6.4), laneMaterial);
  lane.rotation.x = -Math.PI / 2;
  lane.position.set(0, 0.012, -1.2);
  laneGroup.add(lane);
  laneLineMat = new THREE.LineBasicMaterial({ color: 0x4bdde5, transparent: true, opacity: 0.35, depthWrite: false });
  for (const x of [-2.65, 2.65]) {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0.022, 1.5), new THREE.Vector3(x, 0.022, -4.4),
    ]);
    laneGroup.add(new THREE.Line(g, laneLineMat));
  }
  laneGroup.position.set(BUS_X, 0, BUS_Z);
  laneGroup.rotation.y = BUS_ROT;
  scene.add(laneGroup);
}

// PARCHE 2: referencia de suelo FIJA en el mundo. Sin ella, el avance del bus no tiene
// con qué compararse (antes el carril viajaba pegado al bus y sus líneas eran paralelas al eje).
const groundMat = new THREE.PointsMaterial({ color: 0x4bdde5, size: 0.05, transparent: true, opacity: 0.5, depthWrite: false });
{
  const pts = [];
  for (let gx = -48; gx <= 10; gx += 1.7) for (let gz = -24; gz <= 10; gz += 1.7) pts.push(gx, 0.02, gz);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const ground = new THREE.Points(g, groundMat);
  ground.frustumCulled = false;
  scene.add(ground);
}

// --- activo GLB (bus texturizado con normales y UV) ---
const gltfLoader = new GLTFLoader();
let busSourceMesh = null;
let busTexture = null;
try {
  const gltf = await gltfLoader.loadAsync('./assets/bus_1024.glb');
  gltf.scene.traverse((o) => { if (o.isMesh && !busSourceMesh) busSourceMesh = o; });
  if (!busSourceMesh) throw new Error('El GLB no contiene una malla');
  const mat = Array.isArray(busSourceMesh.material) ? busSourceMesh.material[0] : busSourceMesh.material;
  busTexture = mat && mat.map ? mat.map : null;
  if (!busTexture || !busTexture.image) throw new Error('El GLB no trae textura base');
  busTexture.colorSpace = THREE.SRGBColorSpace;
  busTexture.needsUpdate = true;
} catch (err) {
  mostrarError('No se pudo cargar el bus GLB: ' + err.message);
  throw err;
}

// Adaptador mínimo: el resto de la V15 sigue esperando `level` (posiciones, índices, colores, caja).
const srcGeo = busSourceMesh.geometry;
const srcPos = srcGeo.getAttribute('position');
const srcUv = srcGeo.getAttribute('uv');
if (!srcUv) throw new Error('El GLB no trae TEXCOORD_0');
const srcIdx = srcGeo.index ? srcGeo.index.array : Uint32Array.from({ length: srcPos.count }, (_, i) => i);
const P = new Float32Array(srcPos.count * 3);
const U = new Float32Array(srcUv.count * 2);
for (let i = 0; i < srcPos.count; i++) {
  P[i*3] = srcPos.getX(i); P[i*3+1] = srcPos.getY(i); P[i*3+2] = srcPos.getZ(i);
}
for (let i = 0; i < srcUv.count; i++) {
  U[i*2] = srcUv.getX(i); U[i*2+1] = srcUv.getY(i);
}
const level = {
  posiciones: P,
  indices: srcIdx,
  colores: new Uint8Array((srcIdx.length / 3) * 3),
  minimo: [Infinity, Infinity, Infinity],
  maximo: [-Infinity, -Infinity, -Infinity],
};
for (let i = 0; i < srcPos.count; i++) {
  for (let a = 0; a < 3; a++) {
    const v = P[i * 3 + a];
    if (v < level.minimo[a]) level.minimo[a] = v;
    if (v > level.maximo[a]) level.maximo[a] = v;
  }
}
const triCount = srcIdx.length / 3;
const minZ = level.minimo[2], maxZ = level.maximo[2];
ajustarEncuadre();
function punto(i, v) {
  const k = level.indices[i * 3 + v] * 3;
  return [level.posiciones[k], level.posiciones[k + 1], level.posiciones[k + 2]];
}
function color(i, v) {
  const k = level.indices[i * 3 + v];
  return [level.colores[k * 3] / 255, level.colores[k * 3 + 1] / 255, level.colores[k * 3 + 2] / 255];
}

// Horneado único de la textura a color por triángulo para el sistema de partículas.
{
  const img = busTexture.image;
  if (typeof img.decode === 'function') await img.decode();
  const cv = document.createElement('canvas');
  cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.drawImage(img, 0, 0);
  const data = cx.getImageData(0, 0, cv.width, cv.height).data;
  const uvs = U;
  for (let t = 0; t < triCount; t++) {
    const a = srcIdx[t * 3], b = srcIdx[t * 3 + 1], c = srcIdx[t * 3 + 2];
    const u = (uvs[a * 2] + uvs[b * 2] + uvs[c * 2]) / 3;
    const v = (uvs[a * 2 + 1] + uvs[b * 2 + 1] + uvs[c * 2 + 1]) / 3;
    const x = Math.max(0, Math.min(cv.width - 1, Math.floor(u * cv.width)));
    const y = Math.max(0, Math.min(cv.height - 1, Math.floor((busTexture.flipY ? 1 - v : v) * cv.height)));
    const p = (y * cv.width + x) * 4;
    level.colores[t * 3] = data[p];
    level.colores[t * 3 + 1] = data[p + 1];
    level.colores[t * 3 + 2] = data[p + 2];
  }
}

// --- malla del bus con erosión trasera y textura real ---
const busGroup = new THREE.Group();
busGroup.position.set(BUS_X, BUS_Y, BUS_Z);
busGroup.rotation.y = BUS_ROT;
busGroup.scale.setScalar(BUS_SCALE);
scene.add(busGroup);
const busUniforms = { uThreshold: { value: minZ - 0.01 }, uMinZ: { value: minZ }, uMaxZ: { value: maxZ }, uWheelAngle: { value: 0 }, uMap: { value: busTexture } };
{
  const geo = busSourceMesh.geometry;
  const mat = new THREE.ShaderMaterial({
    uniforms: busUniforms,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vLocalZ;
      varying vec3 vLocal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vLocalZ = position.z;
        vLocal = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uThreshold;
      uniform float uMinZ;
      uniform float uMaxZ;
      uniform sampler2D uMap;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vLocalZ;
      varying vec3 vLocal;
      void main() {
        float ruido = sin(vLocal.x * 23.0 + vLocal.y * 17.0) * 0.012
                    + sin(vLocal.y * 41.0 + vLocal.z * 13.0) * 0.008;
        float umbral = uThreshold + ruido;
        if (vLocalZ < umbral) discard;
        float borde = smoothstep(0.045, 0.0, abs(vLocalZ - umbral))
                    * smoothstep(uMinZ + 0.01, uMinZ + 0.10, uThreshold)
                    * (1.0 - smoothstep(uMaxZ - 0.12, uMaxZ - 0.02, uThreshold));
        vec3 emision = vec3(0.20, 0.78, 0.88) * borde * 0.85;
        vec3 base = texture2D(uMap, vUv).rgb;
        float l = 0.72 + 0.62 * abs(dot(normalize(vNormal), normalize(vec3(0.4, 0.8, 0.45))));
        gl_FragColor = vec4(base * l + emision, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  busGroup.add(mesh);
}

function busWorld(local) {
  const c = Math.cos(BUS_ROT), s = Math.sin(BUS_ROT);
  const x = local[0] * c + local[2] * s;
  const z = -local[0] * s + local[2] * c;
  return [x * BUS_SCALE + BUS_X, local[1] * BUS_SCALE + BUS_Y, z * BUS_SCALE + BUS_Z];
}

// --- ciudad flotante de píxeles, sin base ---
// PARCHE 7. (1) Más cerca y a medida de pantalla (mismo sistema de encuadre que el bus).
// (2) Volumen: cuerpo oscuro que ocluye lo de atrás, caras con luz propia y solo fachadas visibles.
// (3) Fachadas de píxeles cuadrados con ventanas por pisos (como la referencia).
// (4) La base se deshace en píxeles que caen: flota sin plataforma. (5) Hilos verticales con cabeza luminosa.
const CITY_PALETTE = [
  [0.10, 0.42, 0.92],
  [0.06, 0.32, 0.80],
  [0.14, 0.52, 0.98],
  [0.08, 0.38, 0.88],
  [0.18, 0.58, 1.00],
];
const CITY_ACENTO = [0.46, 0.92, 1.0];
const CITY_OBJETIVO = 30000;          // puntos encendidos aproximados (se ajusta el tamaño de celda para lograrlo)
const CITY_Z = MOVIL ? 0.4 : 0.6;     // profundidad del centro de la ciudad (el bus está en z=0)

// 1) torres en coordenadas locales: cuatro capas de profundidad, escalonadas, con una dominante
const torresLocal = [];
{
  const filas = [
    { z: -3.0, n: 7, h0: 3.4, hr: 2.4 },
    { z: -1.6, n: 7, h0: 2.7, hr: 2.0 },
    { z: -0.2, n: 6, h0: 2.0, hr: 1.7 },
    { z: 1.2, n: 5, h0: 1.3, hr: 1.4 },
  ];
  const SPAN = 8.0;
  filas.forEach((f, fi) => {
    const paso = SPAN / f.n;
    for (let k = 0; k < f.n; k++) {
      let w = paso * (0.60 + rng() * 0.26);
      const cx = (k + 0.5) * paso + (rng() - 0.5) * paso * 0.16 + (fi % 2 ? paso * 0.22 : -paso * 0.12);
      const d = 0.9 + rng() * 0.5;
      const y0 = 0.2 + rng() * 0.5;
      let h = f.h0 + rng() * f.hr;
      if (fi === 1 && k === Math.floor(f.n * 0.62)) { h *= 1.5; w *= 1.15; }   // torre dominante
      torresLocal.push({ x0: cx - w / 2, x1: cx + w / 2, z0: f.z - d / 2, z1: f.z + d / 2, y0, y1: y0 + h, color: (fi + k) % CITY_PALETTE.length });
    }
  });
}

// 2) escala y posición para cumplir el encuadre pedido, vista desde la cámara con el empuje completo
let CIUDAD_CAJA = [];
let CIUDAD_AJUSTE;
{
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ0 = Infinity, maxZ0 = -Infinity;
  for (const t of torresLocal) {
    minX = Math.min(minX, t.x0); maxX = Math.max(maxX, t.x1);
    minY = Math.min(minY, t.y0); maxY = Math.max(maxY, t.y1);
    minZ0 = Math.min(minZ0, t.z0); maxZ0 = Math.max(maxZ0, t.z1);
  }
  const cx0 = (minX + maxX) / 2, cz0 = (minZ0 + maxZ0) / 2;
  const caja = (S, tx, ty) => {
    const out = [];
    for (const X of [minX, maxX]) for (const Y of [minY, maxY]) for (const Z of [minZ0, maxZ0]) {
      out.push([(X - cx0) * S + tx, (Y - minY) * S + ty, (Z - cz0) * S + CITY_Z]);
    }
    return out;
  };
  usarCamara(CAM_CITY_POS, CAM_CITY_MIRA);
  let S = 1.3, tx = CAM_CITY_POS.x + 4, ty = 1.0;
  for (let it = 0; it < 40; it++) {
    let m = ndcDeCaja(caja(S, tx, ty));
    S *= Math.min(ENCUADRE.ciudadAncho / m.w, ENCUADRE.ciudadAlto / m.h);
    m = ndcDeCaja(caja(S, tx, ty));
    const mx = ndcDeCaja(caja(S, tx + 0.5, ty)), my = ndcDeCaja(caja(S, tx, ty + 0.5));
    const px = (mx.cx - m.cx) / 0.5, py = (my.cy - m.cy) / 0.5;
    if (Math.abs(px) > 1e-6) tx += (ENCUADRE.ciudadNdc - m.cx) / px;
    if (Math.abs(py) > 1e-6) ty += (ENCUADRE.ciudadCy - m.cy) / py;
  }
  CIUDAD_AJUSTE = { S, tx, ty, cx0, cz0, minY };
  CIUDAD_CAJA = caja(S, tx, ty);
  const mf = ndcDeCaja(CIUDAD_CAJA);
  ENCUADRE_INFO.ciudad = { escala: +S.toFixed(3), x: +tx.toFixed(3), y: +ty.toFixed(3), z: CITY_Z, ndcCentro: +mf.cx.toFixed(3), ndcAncho: +mf.w.toFixed(3), ndcAlto: +mf.h.toFixed(3), nota: 'medido con la cámara al final del empuje' };
  usarCamara(CAM_FINAL, CAM_MIRA);
}
const torres = torresLocal.map((t) => {
  const { S, tx, ty, cx0, cz0, minY } = CIUDAD_AJUSTE;
  return { x0: (t.x0 - cx0) * S + tx, x1: (t.x1 - cx0) * S + tx, y0: (t.y0 - minY) * S + ty, y1: (t.y1 - minY) * S + ty, z0: (t.z0 - cz0) * S + CITY_Z, z1: (t.z1 - cz0) * S + CITY_Z, color: t.color };
});

// 3) solo las fachadas que ve la cámara (desde el inicio o el final del empuje) y solo las celdas no tapadas por otra torre
const CAMS = [CAM_FINAL, CAM_CITY_POS].map((v) => [v.x, v.y, v.z]);
function carasDe(b) {
  const out = [];
  const h = b.y1 - b.y0;
  if (CAMS.some((c) => c[2] > b.z1)) out.push({ p: [b.x0, b.y0, b.z1], u: [b.x1 - b.x0, 0, 0], v: [0, h, 0], sombra: 1.0, lado: true, c: b.color });      // frontal
  if (CAMS.some((c) => c[0] < b.x0)) out.push({ p: [b.x0, b.y0, b.z1], u: [0, 0, b.z0 - b.z1], v: [0, h, 0], sombra: 0.62, lado: true, c: b.color });    // izquierda
  if (CAMS.some((c) => c[0] > b.x1)) out.push({ p: [b.x1, b.y0, b.z0], u: [0, 0, b.z1 - b.z0], v: [0, h, 0], sombra: 0.62, lado: true, c: b.color });    // derecha
  if (CAMS.some((c) => c[1] > b.y1)) out.push({ p: [b.x0, b.y1, b.z1], u: [b.x1 - b.x0, 0, 0], v: [0, 0, b.z0 - b.z1], sombra: 1.18, lado: false, c: b.color }); // tapa
  return out;
}
const todasCaras = torres.flatMap((b, bi) => carasDe(b).map((f) => ({ ...f, bi })));
const EPS_OC = 0.002;
function ocluyeOtra(cam, P, bi) {
  for (let k = 0; k < torres.length; k++) {
    if (k === bi) continue;
    const b = torres[k];
    const lo = [b.x0 + EPS_OC, b.y0 + EPS_OC, b.z0 + EPS_OC], hi = [b.x1 - EPS_OC, b.y1 - EPS_OC, b.z1 - EPS_OC];
    let t0 = 0, t1 = 0.999, choca = true;
    for (let a = 0; a < 3; a++) {
      const d = P[a] - cam[a];
      if (Math.abs(d) < 1e-9) { if (cam[a] < lo[a] || cam[a] > hi[a]) { choca = false; break; } }
      else {
        let ta = (lo[a] - cam[a]) / d, tb = (hi[a] - cam[a]) / d;
        if (ta > tb) { const tmp = ta; ta = tb; tb = tmp; }
        if (ta > t0) t0 = ta;
        if (tb < t1) t1 = tb;
        if (t0 > t1) { choca = false; break; }
      }
    }
    if (choca) return true;
  }
  return false;
}
const h01 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
function recorrerCeldas(g, cb) {
  todasCaras.forEach((f, fi) => {
    const nu = Math.max(1, Math.round(length(f.u) / g)), nv = Math.max(1, Math.round(length(f.v) / g));
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = (i + 0.5) / nu, b = (j + 0.5) / nv;
      const P = [f.p[0] + f.u[0] * a + f.v[0] * b, f.p[1] + f.u[1] * a + f.v[1] * b, f.p[2] + f.u[2] * a + f.v[2] * b];
      if (CAMS.every((cam) => ocluyeOtra(cam, P, f.bi))) continue;
      cb(f, fi, P, i, j, nu, nv, a, b);
    }
  });
}
// tamaño de celda: dos pasadas (la primera solo cuenta celdas visibles) para acercarse a CITY_OBJETIVO puntos
const LIT_MEDIO = 0.62;
const areaTotal = todasCaras.reduce((s, f) => s + length(cross(f.u, f.v)), 0);
let g = Math.sqrt(areaTotal * LIT_MEDIO / CITY_OBJETIVO) * 0.8;
{
  let n1 = 0;
  recorrerCeldas(g, () => { n1++; });
  g = Math.min(0.16, Math.max(0.012, g * Math.sqrt(n1 / (CITY_OBJETIVO / LIT_MEDIO))));
}

// 4) píxeles de fachada: ventanas por pisos, base que se deshace, acentos cian
const cPos = [], cCol = [], cSize = [];
const empujar = (p, c, s) => { cPos.push(p[0], p[1], p[2]); cCol.push(c[0], c[1], c[2]); cSize.push(s); };
recorrerCeldas(g, (f, fi, P, i, j, nu, nv, a, b) => {
  const hh = f.lado ? b : 0.5;                                        // 0 = base … 1 = tope de la fachada
  const disolver = f.lado ? 0.10 + 0.90 * smooth(hh / 0.30) : 1.0;     // la base se va deshaciendo
  const pPiso = 0.50 + 0.42 * h01(fi, j);                              // cada piso tiene su propia densidad de luces
  if (rng() > pPiso * disolver) return;
  const acento = rng() < 0.05;
  const base = acento ? CITY_ACENTO : CITY_PALETTE[f.c];
  const brillo = acento ? 0.95 + 0.1 * rng() : (0.62 + 0.38 * rng()) * (0.85 + 0.35 * hh) * 1.12;
  const k = f.sombra * brillo;
  empujar(P, [Math.min(1, base[0] * k), Math.min(1, base[1] * k), Math.min(1, base[2] * k)], g * (acento ? 0.86 : 0.72));
});
// píxeles que caen desde la base (así flota sin plataforma)
torres.forEach((b, bi) => {
  const caras = todasCaras.filter((f) => f.bi === bi && f.lado);
  if (!caras.length) return;
  const n = Math.floor(14 + 34 * rng());
  for (let s = 0; s < n; s++) {
    const f = caras[Math.floor(rng() * caras.length)];
    const a = 0.08 + 0.84 * rng();
    const largo = 2 + Math.floor(rng() * 5);
    let y = b.y0 - g * (0.6 + 1.6 * rng());
    for (let k = 0; k < largo; k++) {
      if (k > 0 && rng() < 0.25) { y -= g * 1.6; continue; }
      const f1 = 1 - k / largo;
      const base = CITY_PALETTE[f.c];
      const q = f.sombra * (0.45 + 0.4 * f1);
      empujar([f.p[0] + f.u[0] * a, y, f.p[2] + f.u[2] * a], [base[0] * q, base[1] * q, base[2] * q], g * (0.46 + 0.26 * f1));
      y -= g * (1.2 + 1.2 * rng());
    }
  }
});
// hilos verticales con cabeza luminosa
const cityLinePositions = [];
torres.forEach((b) => {
  const nCol = rng() < 0.6 ? 2 : 1;
  for (let c = 0; c < nCol; c++) {
    const x = b.x0 + (b.x1 - b.x0) * (0.15 + 0.7 * rng());
    const z = b.z0 + (b.z1 - b.z0) * rng();
    const yb = b.y0 - (0.5 + 1.3 * rng()) * CIUDAD_AJUSTE.S;
    const yt = b.y1 + (0.7 + 2.8 * rng()) * CIUDAD_AJUSTE.S;
    cityLinePositions.push(x, yb, z, x, yt, z);
    empujar([x, yt, z], CITY_ACENTO, g * 1.05);
  }
});
const CITY_COUNT = cPos.length / 3;
const cityPos = new Float32Array(cPos);
const cityCol = new Float32Array(cCol);
const citySize = new Float32Array(cSize);
const cityDelay = new Float32Array(CITY_COUNT);
const cityArrival = new Float32Array(CITY_COUNT);
cityArrival.fill(1.0); // oculta hasta que una partícula aterrice
let cityMinX = Infinity, cityMaxX = -Infinity;
for (let i = 0; i < CITY_COUNT; i++) { cityMinX = Math.min(cityMinX, cityPos[i * 3]); cityMaxX = Math.max(cityMaxX, cityPos[i * 3]); }
for (let i = 0; i < CITY_COUNT; i++) cityDelay[i] = (cityPos[i * 3] - cityMinX) / Math.max(0.0001, cityMaxX - cityMinX);
ENCUADRE_INFO.ciudadPuntos = { total: CITY_COUNT, celdaMundo: +g.toFixed(4) };
ciudadNotaEl.textContent = `Ciudad provisional · ${CITY_COUNT.toLocaleString('es')} puntos · sin base`;

const cityGeo = new THREE.BufferGeometry();
cityGeo.setAttribute('position', new THREE.BufferAttribute(cityPos, 3));
cityGeo.setAttribute('aColor', new THREE.BufferAttribute(cityCol, 3));
cityGeo.setAttribute('aDelay', new THREE.BufferAttribute(cityDelay, 1));
cityGeo.setAttribute('aArrival', new THREE.BufferAttribute(cityArrival, 1));
cityGeo.setAttribute('aSize', new THREE.BufferAttribute(citySize, 1));
const cityUniforms = {
  uReveal: { value: 0 },       // compatibilidad de diagnóstico; el revelado ya es por llegada
  uPhase: { value: 0 },        // fase real que decide qué celdas ya aterrizaron
  uDpr: { value: Math.min(window.devicePixelRatio || 1, 2) },
  uPx: { value: renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) },
};
const cityMat = new THREE.ShaderMaterial({
  uniforms: cityUniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending,
  vertexShader: `
    attribute vec3 aColor;
    attribute float aArrival;
    attribute float aSize;
    uniform float uPhase;
    uniform float uDpr;
    uniform float uPx;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec4 mv = viewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      // tamaño en el MUNDO (aSize) → píxeles: los píxeles de fachada crecen al acercarse y respetan la densidad de pantalla
      gl_PointSize = max(1.5 * uDpr, uPx * aSize / max(0.5, -mv.z));
      // CONSTRUCCIÓN CAUSAL: una celda no existe hasta que su partícula sembradora aterriza.
      vAlpha = smoothstep(aArrival, aArrival + 0.03, uPhase);
      vColor = aColor;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      if (vAlpha < 0.01) discard;
      gl_FragColor = vec4(vColor, vAlpha * 0.96);   // cuadrado completo: píxel de fachada
    }
  `,
});
const cityPoints = new THREE.Points(cityGeo, cityMat);
cityPoints.frustumCulled = false;
cityPoints.renderOrder = 2;
scene.add(cityPoints);

// cuerpo de las torres: oscuro, ocluye lo que queda detrás y se deshace por la base
{
  const mp = [], mn = [], mh = [], md = [];
  const ins = g * 0.30;
  for (const b of torres) {
    const x0 = b.x0 + ins, x1 = b.x1 - ins, y0 = b.y0 + ins, y1 = b.y1 - ins, z0 = b.z0 + ins, z1 = b.z1 - ins;
    const dly = ((b.x0 + b.x1) / 2 - cityMinX) / Math.max(0.0001, cityMaxX - cityMinX);
    const arr = llegada(dly); // el cuerpo aparece con la primera materia de su franja
    const alto = (y) => clamp01((y - b.y0) / (b.y1 - b.y0));
    const quad = (A, B, C, D, n) => { for (const P of [A, B, C, A, C, D]) { mp.push(P[0], P[1], P[2]); mn.push(n[0], n[1], n[2]); mh.push(alto(P[1])); md.push(arr); } };
    quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
    quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
    quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
    quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
    quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
  }
  const mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.Float32BufferAttribute(mp, 3));
  mg.setAttribute('normal', new THREE.Float32BufferAttribute(mn, 3));
  mg.setAttribute('aH', new THREE.Float32BufferAttribute(mh, 1));
  mg.setAttribute('aArrival', new THREE.Float32BufferAttribute(md, 1));
  const mm = new THREE.ShaderMaterial({
    uniforms: { uPhase: cityUniforms.uPhase },
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    vertexShader: `
      attribute float aH;
      attribute float aArrival;
      uniform float uPhase;
      varying float vA;
      varying vec3 vC;
      void main() {
        gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
        float vis = smoothstep(aArrival, aArrival + 0.04, uPhase);
        vA = vis * smoothstep(0.0, 0.32, aH) * 0.94;
        float luz = 0.55 + 0.45 * max(0.0, dot(normal, normalize(vec3(-0.3, 0.7, 0.65))));
        vC = mix(vec3(0.012, 0.050, 0.110), vec3(0.030, 0.140, 0.300), luz);
      }
    `,
    fragmentShader: `
      varying float vA;
      varying vec3 vC;
      void main() {
        if (vA < 0.04) discard;
        gl_FragColor = vec4(vC, vA);
      }
    `,
  });
  const masa = new THREE.Mesh(mg, mm);
  masa.frustumCulled = false;
  masa.renderOrder = 1;
  scene.add(masa);
}

// hilos verticales (las aristas de caja se eliminaron: con cuerpo y píxeles ya no hacen falta); cada hilo aparece con su torre
const lineArrival = [];
for (let i = 0; i < cityLinePositions.length; i += 3) {
  const dly = (cityLinePositions[i] - cityMinX) / Math.max(0.0001, cityMaxX - cityMinX);
  lineArrival.push(0.55 + dly * 0.40);
}
const cityLineGeo = new THREE.BufferGeometry();
cityLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(cityLinePositions, 3));
cityLineGeo.setAttribute('aArrival', new THREE.Float32BufferAttribute(lineArrival, 1));
const cityLineMat = new THREE.ShaderMaterial({
  uniforms: { uPhase: cityUniforms.uPhase },
  transparent: true,
  depthWrite: false,
  vertexShader: `
    attribute float aArrival;
    uniform float uPhase;
    varying float vA;
    void main() {
      gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
      vA = smoothstep(aArrival, aArrival + 0.04, uPhase) * 0.42;
    }
  `,
  fragmentShader: `
    varying float vA;
    void main() {
      if (vA < 0.01) discard;
      gl_FragColor = vec4(0.44, 0.86, 0.96, vA);
    }
  `,
});
const cityLines = new THREE.LineSegments(cityLineGeo, cityLineMat);
cityLines.renderOrder = 3;
scene.add(cityLines);

// --- partículas del bus ---
const start = new Float32Array(COUNT * 3);
const floating = new Float32Array(COUNT * 3);
const target = new Float32Array(COUNT * 3);
const cStart = new Float32Array(COUNT * 3);
const cTarget = new Float32Array(COUNT * 3);
const delay = new Float32Array(COUNT);
const scales = new Float32Array(COUNT);
const spins = new Float32Array(COUNT);
const axes = new Float32Array(COUNT * 3);

// muestreo ponderado del bus
const cum = new Float32Array(triCount);
let busArea = 0;
for (let i = 0; i < triCount; i++) {
  const a = punto(i, 0), b = punto(i, 1), c = punto(i, 2);
  const ar = length(cross([b[0]-a[0], b[1]-a[1], b[2]-a[2]], [c[0]-a[0], c[1]-a[1], c[2]-a[2]]));
  busArea += ar; cum[i] = busArea;
}
function sampleBus() {
  let r = rng() * busArea;
  let lo = 0, hi = triCount - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid; }
  const a = punto(lo, 0), b = punto(lo, 1), c = punto(lo, 2);
  const r1 = Math.sqrt(rng()), r2 = rng();
  const u = 1 - r1, v = r1 * (1 - r2), w = r1 * r2;
  const p = [a[0]*u + b[0]*v + c[0]*w, a[1]*u + b[1]*v + c[1]*w, a[2]*u + b[2]*v + c[2]*w];
  const ca = color(lo,0), cb = color(lo,1), cc = color(lo,2);
  return { local: p, color: [ca[0]*u + cb[0]*v + cc[0]*w, ca[1]*u + cb[1]*v + cc[1]*w, ca[2]*u + cb[2]*v + cc[2]*w] };
}
for (let i = 0; i < COUNT; i++) {
  const s = sampleBus();
  const w = busWorld(s.local);
  start[i*3] = w[0]; start[i*3+1] = w[1]; start[i*3+2] = w[2];
  const wind = [2.0 + rng() * 2.8, 0.2 + rng() * 1.4, (rng() - 0.5) * 1.2];
  floating[i*3] = w[0] + wind[0]; floating[i*3+1] = w[1] + wind[1]; floating[i*3+2] = w[2] + wind[2];
  cStart[i*3] = s.color[0]; cStart[i*3+1] = s.color[1]; cStart[i*3+2] = s.color[2];
  delay[i] = clamp01((s.local[2] - minZ) / Math.max(0.0001, maxZ - minZ)); // atrás primero, frontal al final
  scales[i] = 0.7 + rng() * 0.6;
  spins[i] = (rng() - 0.5) * 2.4;
  const ax = [rng() - 0.5, rng() - 0.5, rng() - 0.5];
  const al = Math.max(0.0001, length(ax));
  axes[i*3] = ax[0]/al; axes[i*3+1] = ax[1]/al; axes[i*3+2] = ax[2]/al;
}

// PARCHE 4: la corriente forma la ciudad. Las partículas traseras salen primero y
// aterrizan en las torres de la izquierda; las delanteras, en las de la derecha.
// Así los trayectos no se cruzan y la ciudad se enciende en el mismo sentido del viento.
const cityOrder = Array.from({ length: CITY_COUNT }, (_, i) => i)
  .sort((a, b) => (cityPos[a * 3] - cityPos[b * 3]) || (cityPos[a * 3 + 1] - cityPos[b * 3 + 1]));
const particleOrder = Array.from({ length: COUNT }, (_, i) => i)
  .sort((a, b) => delay[a] - delay[b]);
for (let rank = 0; rank < COUNT; rank++) {
  const i = particleOrder[rank];
  // PROPÓSITO B: cada partícula siembra una banda de 3–4 celdas de ciudad.
  const a0 = Math.floor(rank * CITY_COUNT / COUNT);
  const a1 = Math.floor((rank + 1) * CITY_COUNT / COUNT);
  const mid = cityOrder[Math.min(CITY_COUNT - 1, Math.floor((a0 + a1 - 1) / 2))];
  const ci = mid * 3;
  target[i * 3] = cityPos[ci];
  target[i * 3 + 1] = cityPos[ci + 1];
  target[i * 3 + 2] = cityPos[ci + 2];
  cTarget[i * 3] = cityCol[ci];
  cTarget[i * 3 + 1] = cityCol[ci + 1];
  cTarget[i * 3 + 2] = cityCol[ci + 2];
  const arrival = llegada(delay[i]);
  for (let q = a0; q < a1; q++) cityArrival[cityOrder[q]] = arrival;
}
cityGeo.attributes.aArrival.needsUpdate = true;

const start4 = new Float32Array(COUNT * 4);
const target4 = new Float32Array(COUNT * 4);
const axis4 = new Float32Array(COUNT * 4);
for (let i = 0; i < COUNT; i++) {
  start4[i*4] = start[i*3]; start4[i*4+1] = start[i*3+1]; start4[i*4+2] = start[i*3+2]; start4[i*4+3] = delay[i];
  target4[i*4] = target[i*3]; target4[i*4+1] = target[i*3+1]; target4[i*4+2] = target[i*3+2]; target4[i*4+3] = scales[i];
  axis4[i*4] = axes[i*3]; axis4[i*4+1] = axes[i*3+1]; axis4[i*4+2] = axes[i*3+2]; axis4[i*4+3] = spins[i];
}
// PARCHE 9: el tamaño de la partícula se mide contra el LARGO del bus, no contra BUS_SCALE.
// Antes (0.06 * BUS_SCALE / 4.2) crecía ~1,57× al cambiar al bus nuevo, que es más corto (1,15 vs 1,80) y recibe más BUS_SCALE.
// TETRA_REL = 0.0079 reproduce el tamaño relativo de la V15 aprobada. Subir/bajar para más/menos "confeti".
const TETRA_REL = 0.0079;
const tetraGeo = new THREE.TetrahedronGeometry(TETRA_REL * (maxZ - minZ) * BUS_SCALE, 0);
tetraGeo.setAttribute('aStart', new THREE.InstancedBufferAttribute(start4, 4));
tetraGeo.setAttribute('aFloat', new THREE.InstancedBufferAttribute(floating, 3));
tetraGeo.setAttribute('aTarget', new THREE.InstancedBufferAttribute(target4, 4));
tetraGeo.setAttribute('aColorStart', new THREE.InstancedBufferAttribute(cStart, 3));
tetraGeo.setAttribute('aColorTarget', new THREE.InstancedBufferAttribute(cTarget, 3));
tetraGeo.setAttribute('aAxis', new THREE.InstancedBufferAttribute(axis4, 4));
// PARCHE 8: comportamiento en la dispersión (<0.30 se desvanece · <0.65 flota · resto se dispersa lejos)
const modos = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) modos[i] = h01(i, 3.7);
tetraGeo.setAttribute('aMode', new THREE.InstancedBufferAttribute(modos, 1));
const DISPERSION = 1.65;   // PARCHE 9: perilla de apertura de la nube (1.65 = valor aprobado en la V15; probar 1.2 si llena demasiado el cuadro)
const particleUniforms = { uErode: { value: 0 }, uFront: { value: 0 }, uReform: { value: 0 }, uTime: { value: 0 }, uDispersion: { value: DISPERSION } };
const particleMat = new THREE.ShaderMaterial({
  uniforms: particleUniforms,
  transparent: true,
  depthWrite: true,
  side: THREE.DoubleSide,
  vertexShader: `
    attribute vec4 aStart;
    attribute vec3 aFloat;
    attribute vec4 aTarget;
    attribute vec3 aColorStart;
    attribute vec3 aColorTarget;
    attribute vec4 aAxis;
    attribute float aMode;
    uniform float uErode;    // reloj A (tiempo)
    uniform float uFront;    // frente de erosión 0..1 (atrás → adelante); la malla usa el mismo valor
    uniform float uReform;   // reloj B (scroll): reintegración
    uniform float uTime;
    uniform float uDispersion;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying float vAlpha;
    mat3 rot(vec3 axis, float angle) {
      vec3 a = normalize(axis);
      float s = sin(angle), c = cos(angle), oc = 1.0 - c;
      return mat3(
        oc*a.x*a.x + c, oc*a.x*a.y - a.z*s, oc*a.z*a.x + a.y*s,
        oc*a.x*a.y + a.z*s, oc*a.y*a.y + c, oc*a.y*a.z - a.x*s,
        oc*a.z*a.x - a.y*s, oc*a.y*a.z + a.x*s, oc*a.z*a.z + c
      );
    }
    void main() {
      float ad = aStart.w;   // 0 = trasera … 1 = frontal

      // ACTO 1 · TIEMPO: la partícula nace cuando el frente de erosión pasa por su Z y deriva con el viento
      float eRel = ${E_INI.toFixed(3)} + ad * ${E_FRENTE.toFixed(3)};
      float ld = smoothstep(0.0, 1.0, clamp((uErode - eRel) / ${E_DRIFT.toFixed(3)}, 0.0, 1.0));
      float aparece = smoothstep(ad, ad + 0.03, uFront);

      // comportamiento: se desvanece (<0.30) · flota (<0.65) · se dispersa lejos (resto)
      float m = aMode;
      float alcance = m < 0.30 ? 0.95 : (m < 0.60 ? 0.55 : 2.15);
      float agita = m < 0.30 ? 1.0 : (m < 0.60 ? 0.85 : 1.8);
      float lejos = m < 0.60 ? 1.1 : 2.0;
      vec3 desp = (aFloat - aStart.xyz) * vec3(alcance, alcance * lejos, alcance * lejos);
      float ang = ad * 6.283 + m * 9.0;
      vec3 radial = vec3(sin(ang), 0.55 * cos(ang * 1.3), 0.45 * sin(ang * 0.7));
      float extra = m < 0.30 ? 0.45 : (m < 0.60 ? 1.15 : 2.5);
      desp += radial * extra * (0.8 + 1.2 * ld) * uDispersion;
      vec3 p = aStart.xyz + desp * ld;

      // ACTO 2 · SCROLL: recogida hacia la ciudad, escalonada (traseras primero → izquierda de la ciudad)
      float llegada = ${LLEG0.toFixed(3)} + ad * ${LLEG1.toFixed(3)};
      float lu = smoothstep(llegada - 0.35, llegada, uReform);
      float polvo = smoothstep(llegada - 0.02, llegada, uReform);

      // la nube sigue viva mientras espera (turbulencia) y se aquieta al ser recogida
      p.x += sin(uTime * 1.7 + ad * 11.0) * 0.13 * agita * ld * (1.0 - lu);
      p.y += cos(uTime * 1.3 + ad * 7.0) * 0.07 * agita * ld * (1.0 - lu);
      p.z += sin(uTime * 1.1 + ad * 5.0) * 0.06 * agita * ld * (1.0 - lu);
      float deriva = (m < 0.60 ? 0.16 : 0.28) * ld * (1.0 - lu);
      p += vec3(sin(uTime * 0.55 + ad * 8.0), cos(uTime * 0.45 + ad * 6.3) * 0.6, sin(uTime * 0.35 + ad * 4.1) * 0.5) * deriva;
      p = mix(p, aTarget.xyz, lu);

      float angle = uTime * aAxis.w + ad * 6.283;
      mat3 R = rot(aAxis.xyz, angle);
      vec3 local = R * (position * (aTarget.w * mix(1.0, 0.72, polvo)));
      vec4 mv = viewMatrix * vec4(p, 1.0);
      mv.xyz += local;
      gl_Position = projectionMatrix * mv;
      vNormal = normalize(normalMatrix * (R * normal));
      vColor = mix(aColorStart, aColorTarget, lu);

      // las que se desvanecen se apagan en la deriva y reaparecen como polvo al ser recogidas
      float desv = m < 0.30 ? smoothstep(0.35, 1.0, ld) : 0.0;
      float vis = 1.0 - desv * (1.0 - smoothstep(0.0, 0.6, lu));
      float fin = 1.0 - smoothstep(0.93, 0.99, uReform);
      vAlpha = aparece * vis * fin * (1.0 - 0.18 * polvo);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying vec3 vNormal;
    varying float vAlpha;
    void main() {
      if (vAlpha < 0.01) discard;
      float l = 0.55 + 0.55 * abs(dot(normalize(vNormal), normalize(vec3(0.35, 0.8, 0.45))));
      gl_FragColor = vec4(vColor * (l + 0.2), vAlpha);
    }
  `,
});
const particles = new THREE.InstancedMesh(tetraGeo, particleMat, COUNT);
particles.frustumCulled = false;
{
  const m = new THREE.Matrix4();
  for (let i = 0; i < COUNT; i++) particles.setMatrixAt(i, m);
  particles.instanceMatrix.needsUpdate = true;
}
scene.add(particles);

// --- humo local ---
const SMOKE = 80;
const smokeBase = new Float32Array(SMOKE * 3);
const smokePos = new Float32Array(SMOKE * 3);
const kHumo = BUS_SCALE / 4.2;
for (let i = 0; i < SMOKE; i++) {
  const x = BUS_X + (rng() - 0.5) * 2.2 * kHumo;
  const y = 0.08 + rng() * 0.35 * kHumo;
  const z = BUS_Z + (rng() - 0.5) * 1.6 * kHumo;
  smokeBase[i*3] = x; smokeBase[i*3+1] = y; smokeBase[i*3+2] = z;
  smokePos[i*3] = x; smokePos[i*3+1] = y; smokePos[i*3+2] = z;
}
const smokeGeo = new THREE.BufferGeometry();
smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
const smokeMat = new THREE.PointsMaterial({ color: 0xa8c2c8, size: 0.16 * kHumo, transparent: true, opacity: 0, depthWrite: false });
const smokePoints = new THREE.Points(smokeGeo, smokeMat);
smokePoints.frustumCulled = false;
scene.add(smokePoints);

// --- texto por líneas ---
const unoLines = [...copyUno.querySelectorAll('.line > span')];
const dosLines = [...copyDos.querySelectorAll('.line > span')];
copyDos.style.opacity = '0';
unoLines.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
dosLines.forEach((el) => { el.style.opacity = '0'; el.style.transform = 'translateX(-28px)'; });
function updateText(e, ur) {
  // sección 1: se despeja con la erosión (tiempo), para no tapar la nube que deriva a la derecha
  copyUno.style.opacity = String(1 - smooth((e - 0.12) / 0.30));
  // sección 2: aparece mientras la materia se recoge (scroll), antes de que la ciudad cierre
  copyDos.style.opacity = String(smooth((ur - 0.28) / 0.14) * smooth((phase - REFORM_START) / 0.04));
  unoLines.forEach((el, i) => {
    const a = smooth((e - 0.12 - i * 0.03) / 0.26);
    el.style.opacity = String(1 - a);
    el.style.transform = `translateX(${a * 34}px)`;
  });
  dosLines.forEach((el, i) => {
    const a = smooth((ur - 0.30 - i * 0.05) / 0.25);
    el.style.opacity = String(a);
    el.style.transform = `translateX(${(1 - a) * -28}px)`;
  });
}

// --- sonido opcional de freno ---
let audioCtx = null;
let audioOn = false;
let brakePlayed = false;
function toggleSonido() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioOn = !audioOn;
    sonidoBtn.setAttribute('aria-pressed', String(audioOn));
    sonidoBtn.textContent = audioOn ? 'Sonido activado' : 'Activar sonido';
    if (audioOn && audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { sonidoBtn.textContent = 'Sonido no disponible'; }
}
sonidoBtn.addEventListener('click', toggleSonido);
function playBrake() {
  if (!audioOn || !audioCtx) return;
  try {
    const sr = audioCtx.sampleRate;
    const duration = 0.55;
    const buffer = audioCtx.createBuffer(1, Math.floor(sr * duration), sr);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const band = audioCtx.createBiquadFilter();
    band.type = 'bandpass'; band.frequency.value = 1500; band.Q.value = 0.7;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    src.connect(band).connect(gain).connect(audioCtx.destination);
    src.start();
    const osc = audioCtx.createOscillator();
    const og = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = 58;
    og.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    og.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.02);
    og.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
    osc.connect(og).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) { /* audio no disponible */ }
}

// --- estado, scroll y render ---
let phase = 0;
let erode = 0;
let reform = 0;                      // reloj B: ensamble automático y reversible                       // PARCHE 8: reloj A (0..1), avanza solo con el tiempo
let tiempo = 0;
let raf = 0;
let ultimo = performance.now();
let manual = false;
let pausado = false;
const mira = new THREE.Vector3(0, 1.3, -0.3);
// PARCHE 8 · reloj A: el scroll solo dispara; la erosión corre sola. Reversa 2.5× más rápida si se sube.
function avanzarErosion(dt) {
  const destino = phase >= BUS_ENTRY_END ? 1 : 0;
  if (REDUCIDO) { erode = destino; return; }
  const paso = (dt / ERODE_SECS) * (destino ? 1 : 2.5);
  erode += Math.max(-paso, Math.min(paso, destino - erode));
}
// Reloj B automático: arranca cuando la sección 2 está en pantalla y la erosión pasó la compuerta.
// No depende del scroll una vez iniciado y no se reinicia si el usuario sube.
function avanzarReform(dt) {
  // Reloj B reversible: avanza si la sección 2 está activa y la erosión pasó la compuerta;
  // retrocede si el usuario vuelve a la sección 1 o si la erosión se revierte.
  const quiere = phase >= REFORM_START && erode >= E_COMPUERTA;
  if (REDUCIDO) { reform = quiere ? 1 : 0; return; }
  const destino = quiere ? 1 : 0;
  const paso = (dt / REFORM_SECS) * (destino ? 1 : 2.5);
  reform += Math.max(-paso, Math.min(paso, destino - reform));
  reform = clamp01(reform);
}
function updatePhase(value) {
  phase = clamp01(value);
  const entrada = clamp01(phase / BUS_ENTRY_END);
  const ruta = busPath(entrada);
  busGroup.position.set(ruta.x, BUS_Y, ruta.z);
  // Giro de rueda por distancia recorrida: no hay tracción si el bus está quieto.
  const giroEntrada = 1 - (1 - entrada) * (1 - entrada);
  busUniforms.uWheelAngle.value = -(1 - giroEntrada) * ENTRY_D / (0.185 * BUS_SCALE);
  busGroup.rotation.y = ruta.rumbo;
  // reloj B: ensamble automático, ya disparado; no depende del scroll
  const ur = reform;
  // cámara: posición fija + paneo corto que se cierra al llegar el bus + empuje (dolly) hacia la ciudad durante la reintegración
  const dolly = smooth((ur - DOLLY_INICIO) / (DOLLY_FIN - DOLLY_INICIO));
  camera.position.copy(CAM_FINAL).addScaledVector(DOLLY, dolly);
  _dir.copy(CAM_MIRA).sub(CAM_FINAL).applyAxisAngle(EJE_Y, -THREE.MathUtils.degToRad(ruta.yaw));
  mira.copy(camera.position).add(_dir);
  camera.lookAt(mira);
  // frente de erosión (por tiempo): lo comparten la malla y las partículas, así nacen exactamente donde la superficie desaparece
  const frente = clamp01((erode - E_INI) / E_FRENTE);
  busUniforms.uThreshold.value = minZ + frente * (maxZ - minZ) + 0.0001;
  busGroup.visible = frente < 0.999;
  particleUniforms.uErode.value = erode;
  particleUniforms.uFront.value = frente;
  particleUniforms.uReform.value = ur;
  cityUniforms.uPhase.value = ur;
  cityUniforms.uReveal.value = smooth((ur - 0.45) / 0.40);
  const fondo = 1 - smooth((erode - E_INI) / 0.35);
  laneMaterial.opacity = 0.85 * fondo;
  laneLineMat.opacity = 0.35 * fondo;
  groundMat.opacity = 0.5 * fondo;
  // humo de freno: también por tiempo
  const humo = smooth(erode / 0.08) * (1 - smooth((erode - 0.30) / 0.45));
  smokeMat.opacity = 0.22 * humo;
  if (humo > 0.01) {
    const t = clamp01(erode / 0.70);
    for (let i = 0; i < SMOKE; i++) {
      smokePos[i*3] = smokeBase[i*3] + t * (0.5 + (i % 5) * 0.08);
      smokePos[i*3+1] = smokeBase[i*3+1] + t * (0.25 + (i % 3) * 0.05);
      smokePos[i*3+2] = smokeBase[i*3+2] + t * 0.2;
    }
    smokeGeo.attributes.position.needsUpdate = true;
  }
  updateText(erode, ur);
  barraEl.style.width = `${(phase * 100).toFixed(1)}%`;
  detalleEl.textContent = `t ${phase.toFixed(2)} · e ${erode.toFixed(2)} · r ${ur.toFixed(2)} · ${COUNT.toLocaleString('es')} partículas · ${CITY_COUNT.toLocaleString('es')} puntos`;
  if (phase < FRENO - 0.05) brakePlayed = false;
  if (!brakePlayed && phase >= FRENO) { brakePlayed = true; playBrake(); }
}
function render() {
  particleUniforms.uTime.value = tiempo;
  renderer.render(scene, camera);
}
function loop(now) {
  raf = 0;
  const dt = Math.min(0.25, (now - ultimo) / 1000);
  ultimo = now;
  if (pausado) return;
  tiempo += dt;
  if (!manual) {
    avanzarErosion(dt);
    avanzarReform(dt);
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    updatePhase(clamp01(scrollY / max));
  }
  render();
  if (!pausado) raf = requestAnimationFrame(loop);
}
function solicitarFrame() {
  if (!raf && !pausado) raf = requestAnimationFrame(loop);
}
function onScroll() {
  if (manual || pausado) return;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  updatePhase(clamp01(scrollY / max));
  solicitarFrame();
}
function onResize() {
  medir();
  // Sin location.reload: se conserva el encuadre horizontal base ajustando el FOV vertical.
  const tanH = Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * BASE_ASPECTO;
  camera.fov = Math.min(82, Math.max(20, 2 * Math.atan(tanH / Math.max(0.2, camera.aspect)) * 180 / Math.PI));
  camera.updateProjectionMatrix();
  cityUniforms.uDpr.value = renderer.getPixelRatio();
  cityUniforms.uPx.value = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  render();
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onResize);
document.addEventListener('visibilitychange', () => { /* keep loop; rAF pauses in background */ });
contadorEl.textContent = COUNT.toLocaleString('es');
updatePhase(0);
render();
requestAnimationFrame((t) => { ultimo = t; loop(t); });

window.__v4 = {
  ready: true,
  count: COUNT,
  cityCount: CITY_COUNT,
  // setT(scroll, erosion?): fija el scroll y, opcionalmente, el reloj de tiempo (0..1); sin 2.º argumento: 0 antes del freno, 1 después
  setT(value, e, r) { manual = true; pausado = true; tiempo = 0; erode = (e === undefined) ? (value >= BUS_ENTRY_END ? 1 : 0) : clamp01(e); reform = (r === undefined) ? 0 : clamp01(r); updatePhase(value); render(); },
  setManual(value) { manual = !!value; if (!manual) { pausado = false; solicitarFrame(); } },
  // mide, con la cámara y el bus tal como están AHORA, cuánto ocupan bus y ciudad (NDC: el canvas va de -1 a 1)
  medirEncuadre() {
    camera.updateMatrixWorld(true);
    const r = (m) => m && ({ centro: +m.cx.toFixed(3), ancho: +m.w.toFixed(3), alto: +m.h.toFixed(3), cy: +m.cy.toFixed(3), minx: +m.minx.toFixed(3), maxx: +m.maxx.toFixed(3) });
    return {
      aspecto: +camera.aspect.toFixed(3),
      bus: busGroup.visible ? r(ndcDeCaja(esquinasBus(BUS_SCALE, busGroup.position.x, busGroup.position.y, busGroup.position.z, busGroup.rotation.y))) : null,
      ciudad: r(ndcDeCaja(CIUDAD_CAJA)),
    };
  },
  state() {
    return {
      phase, erode, reform, paused: pausado, count: COUNT, cityCount: CITY_COUNT,
      busX: busGroup.position.x, busOpacity: busGroup.visible ? 1 : 0,
      rumbo: busGroup.rotation.y,
      busNdc: busGroup.position.clone().project(camera).toArray().slice(0, 2), // a t=0 debe quedar |x|>1,2
      erosion: busUniforms.uThreshold.value, cityReveal: cityUniforms.uPhase.value,
      camera: camera.position.toArray(),
      rafActivo: !!raf,
      fov: camera.fov,
      encuadre: ENCUADRE_INFO,
      renderer: { ...renderer.info.render },
      audio: audioOn,
    };
  },
  destroy() {
    if (window.__v14Destruido) return;
    window.__v14Destruido = true;
    cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    sonidoBtn.removeEventListener('click', toggleSonido);
    if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
    renderer.dispose();
  },
};
window.__spike = window.__v4; // alias: test.mjs y README usan __spike

function mostrarError(msg) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:#050e15;color:#ffb7a8;font:13px ui-monospace,monospace;padding:24px;text-align:center;z-index:10';
  div.textContent = msg;
  document.body.appendChild(div);
  window.__v4 = window.__spike = { ready: false, error: msg };
}
