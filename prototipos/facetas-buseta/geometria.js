/* ==========================================================================
   Decodificador de facetas-web.bin a atributos listos para BufferGeometry.

   El archivo guarda 40 bytes por faceta. La GPU necesita un atributo por
   vertice, asi que aqui cada dato de faceta se repite tres veces. El resultado
   se puede subir tal cual:

     new THREE.BufferAttribute(geo.position, 3)
     new THREE.BufferAttribute(geo.aCentroid, 3)
     ...

   Disposicion por faceta (40 B):
     18  posiciones  3 vertices x 3 ejes, uint16 normalizado a la caja
      6  centroide   3 ejes, uint16
      3  normal      3 ejes, int8
      1  grupo       uint8  0 cuerpo 1 cristal 2 rueda 3 faro 4 ambar
      2  semilla     uint16 estable
      3  eje        3 ejes, int8  (eje de giro para la desintegracion)
      2  giro       uint16, (v/65535)*2-1
      2  espera     uint16, v/65535
      3  relleno
   ========================================================================== */

const VER = 'ENW1';

function leer(buf) {
  const dv = new DataView(buf);
  if (String.fromCharCode(...new Uint8Array(buf, 0, 4)) !== VER) throw new Error('cabecera desconocida');
  const nPresets = dv.getUint32(4, true);
  const mn = [0, 1, 2].map((a) => dv.getFloat32(8 + a * 4, true));
  const mx = [0, 1, 2].map((a) => dv.getFloat32(20 + a * 4, true));
  let o = 32;
  const presets = [];
  for (let p = 0; p < nPresets; p++) {
    const h = dv.getFloat32(o, true);
    const nT = dv.getUint32(o + 4, true);
    o += 8;
    const t0 = o;
    o += nT * 40;
    presets.push({ h, nT, offset: t0 });
  }
  return { dv, mn, mx, presets };
}

const u16 = (dv, o) => dv.getUint16(o, true) / 65535;
const i8 = (dv, o) => dv.getInt8(o);

/** Devuelve atributos por vertice (3 por faceta) listos para BufferGeometry. */
export function decodificarPreset(buf, indice = 0) {
  const { dv, mn, mx, presets } = leer(buf);
  const { nT, offset } = presets[indice];
  const nV = nT * 3;

  const position = new Float32Array(nV * 3);
  const aCentroid = new Float32Array(nV * 3);
  const aNormal = new Float32Array(nV * 3);
  const aGroup = new Uint8Array(nV);
  const aSeed = new Float32Array(nV);
  const aAxis = new Float32Array(nV * 3);
  const aSpin = new Float32Array(nV);
  const aDelay = new Float32Array(nV);

  const sx = mx[0] - mn[0], sy = mx[1] - mn[1], sz = mx[2] - mn[2];

  for (let t = 0; t < nT; t++) {
    const o = offset + t * 40;
    const cen = [0, 1, 2].map((a) => mn[a] + u16(dv, o + 18 + a * 2) * [sx, sy, sz][a]);
    const nrm = [0, 1, 2].map((a) => i8(dv, o + 24 + a) / 127);
    const grupo = dv.getUint8(o + 27);
    const semilla = dv.getUint16(o + 28, true) / 65535;
    const eje = [0, 1, 2].map((a) => i8(dv, o + 30 + a) / 127);
    const giro = u16(dv, o + 33) * 2 - 1;
    const espera = u16(dv, o + 35);

    for (let v = 0; v < 3; v++) {
      const i = t * 3 + v;
      const vb = o + v * 6;
      position[i * 3 + 0] = mn[0] + u16(dv, vb + 0) * sx;
      position[i * 3 + 1] = mn[1] + u16(dv, vb + 2) * sy;
      position[i * 3 + 2] = mn[2] + u16(dv, vb + 4) * sz;
      aCentroid[i * 3 + 0] = cen[0];
      aCentroid[i * 3 + 1] = cen[1];
      aCentroid[i * 3 + 2] = cen[2];
      aNormal[i * 3 + 0] = nrm[0];
      aNormal[i * 3 + 1] = nrm[1];
      aNormal[i * 3 + 2] = nrm[2];
      aGroup[i] = grupo;
      aSeed[i] = semilla;
      aAxis[i * 3 + 0] = eje[0];
      aAxis[i * 3 + 1] = eje[1];
      aAxis[i * 3 + 2] = eje[2];
      aSpin[i] = giro;
      aDelay[i] = espera;
    }
  }

  return {
    count: nT,
    vertices: nV,
    index: null, // no indexado a proposito
    position, aCentroid, aNormal, aGroup, aSeed, aAxis, aSpin, aDelay,
  };
}

/** Presets: 0 = 2.271 facetas (movil), 1 = 3.554 facetas (escritorio). */
export const PRESET_MOVIL = 0;
export const PRESET_ESCRITORIO = 1;
