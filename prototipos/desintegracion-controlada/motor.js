const FIRMA = 'ENF1';

function exigirBytes(buffer, offset, cantidad) {
  if (offset + cantidad > buffer.byteLength) {
    throw new RangeError('facetas.bin está truncado');
  }
}

export function decodificarFacetas(buffer) {
  if (buffer.byteLength < 8) throw new Error('facetas.bin no contiene una cabecera ENF1 válida');

  const vista = new DataView(buffer);
  const firma = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
  if (firma !== FIRMA) throw new Error(`Formato de facetas no compatible: ${firma}`);

  const cuentaNiveles = vista.getUint32(4, true);
  if (cuentaNiveles === 0) throw new Error('facetas.bin no contiene niveles');

  let offset = 8;
  const niveles = [];

  for (let nivel = 0; nivel < cuentaNiveles; nivel++) {
    exigirBytes(buffer, offset, 44);
    const tamanoCelda = vista.getFloat32(offset, true);
    const vertices = vista.getUint32(offset + 4, true);
    const triangulos = vista.getUint32(offset + 8, true);
    offset += 12;

    if (vertices === 0 || triangulos === 0) {
      throw new Error(`El nivel ${nivel} no contiene geometría`);
    }

    const minimo = new Float32Array(3);
    const maximo = new Float32Array(3);
    for (let eje = 0; eje < 3; eje++) {
      minimo[eje] = vista.getFloat32(offset + eje * 4, true);
      maximo[eje] = vista.getFloat32(offset + 12 + eje * 4, true);
    }
    offset += 24;

    const tamanoGeometria = vertices * 6 + triangulos * 10;
    exigirBytes(buffer, offset, tamanoGeometria);

    const posiciones = new Float32Array(vertices * 3);
    const escala = [
      maximo[0] - minimo[0],
      maximo[1] - minimo[1],
      maximo[2] - minimo[2],
    ];
    for (let i = 0; i < posiciones.length; i++) {
      const cuantizado = vista.getUint16(offset + i * 2, true) / 65535;
      posiciones[i] = minimo[i % 3] + cuantizado * escala[i % 3];
    }
    offset += vertices * 6;

    const indices = new Uint16Array(triangulos * 3);
    for (let i = 0; i < indices.length; i++) {
      const indice = vista.getUint16(offset + i * 2, true);
      if (indice >= vertices) throw new Error(`Índice fuera de rango en nivel ${nivel}`);
      indices[i] = indice;
    }
    offset += triangulos * 6;

    const grupos = new Uint8Array(buffer, offset, triangulos);
    offset += triangulos;
    const colores = new Uint8Array(buffer, offset, triangulos * 3);
    offset += triangulos * 3;

    niveles.push({
      tamanoCelda,
      triangulos,
      minimo,
      maximo,
      posiciones,
      indices,
      grupos,
      colores,
    });
  }

  if (offset !== buffer.byteLength) throw new Error('facetas.bin contiene datos sobrantes');
  return niveles;
}

export function progresoFaceta(progreso, retraso) {
  if (!Number.isFinite(progreso) || !Number.isFinite(retraso)) {
    throw new TypeError('El progreso y el retraso deben ser números finitos');
  }

  const p = Math.max(0, Math.min(1, progreso));
  const espera = Math.max(0, Math.min(1, retraso));
  const inicio = 0.14 + espera * 0.78;
  const tramo = Math.max(0, Math.min(1, (p - inicio) / (1 - inicio)));
  return tramo * tramo * (3 - 2 * tramo);
}

export function transformarVertice(
  punto,
  centro,
  desplazamiento,
  eje,
  progreso,
  distancia,
  giro,
  destino,
  offset = 0,
) {
  const angulo = giro * progreso;
  const coseno = Math.cos(angulo);
  const seno = Math.sin(angulo);
  const x = punto[0] - centro[0];
  const y = punto[1] - centro[1];
  const z = punto[2] - centro[2];
  const producto = eje[0] * x + eje[1] * y + eje[2] * z;
  const cruzX = eje[1] * z - eje[2] * y;
  const cruzY = eje[2] * x - eje[0] * z;
  const cruzZ = eje[0] * y - eje[1] * x;
  const complemento = 1 - coseno;

  destino[offset] = centro[0] + x * coseno + cruzX * seno + eje[0] * producto * complemento
    + desplazamiento[0] * distancia * progreso;
  destino[offset + 1] = centro[1] + y * coseno + cruzY * seno + eje[1] * producto * complemento
    + desplazamiento[1] * distancia * progreso;
  destino[offset + 2] = centro[2] + z * coseno + cruzZ * seno + eje[2] * producto * complemento
    + desplazamiento[2] * distancia * progreso;
}
