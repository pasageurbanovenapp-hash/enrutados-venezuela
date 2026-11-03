import {
  decodificarFacetas,
  progresoFaceta,
  transformarVertice,
} from './motor.js';

const resultado = document.getElementById('resultado');
const pruebas = [];

function comprobar(nombre, condicion) {
  if (!condicion) throw new Error(nombre);
  pruebas.push(`OK ${nombre}`);
}

function casiIgual(a, b, tolerancia = 1e-10) {
  return Math.abs(a - b) <= tolerancia;
}

async function ejecutar() {
  comprobar('p=0 mantiene adherida cada faceta', progresoFaceta(0, 0.5) === 0);
  comprobar('p=1 completa la dispersión', progresoFaceta(1, 0.5) === 1);
  comprobar(
    'el progreso de una faceta crece monótonamente',
    progresoFaceta(0.25, 0.5) <= progresoFaceta(0.5, 0.5)
      && progresoFaceta(0.5, 0.5) <= progresoFaceta(0.75, 0.5),
  );
  comprobar(
    'el progreso fuera de rango se limita a [0, 1]',
    progresoFaceta(-1, 0) === 0 && progresoFaceta(2, 0) === 1,
  );

  const punto = [1, 2, 3];
  const centro = [0, 0, 0];
  const desplazamiento = [2, -1, 0.5];
  const eje = [0, 0, 1];
  const intacto = new Float64Array(3);
  transformarVertice(punto, centro, desplazamiento, eje, 0, 2, 1.2, intacto);
  comprobar(
    'p=0 conserva exactamente la posición original',
    intacto[0] === punto[0] && intacto[1] === punto[1] && intacto[2] === punto[2],
  );

  const primero = new Float64Array(3);
  const repetido = new Float64Array(3);
  transformarVertice(punto, centro, desplazamiento, eje, 0.65, 2, 1.2, primero);
  transformarVertice(punto, centro, desplazamiento, eje, 0.65, 2, 1.2, repetido);
  comprobar(
    'repetir p produce el mismo vértice transformado',
    primero.every((valor, indice) => casiIgual(valor, repetido[indice])),
  );
  comprobar(
    'la posición cambia al desprender el fragmento',
    primero.some((valor, indice) => !casiIgual(valor, punto[indice])),
  );

  const respuesta = await fetch('../facetas-retexture/facetas.bin');
  if (!respuesta.ok) throw new Error(`No se pudo cargar facetas.bin: HTTP ${respuesta.status}`);
  const niveles = decodificarFacetas(await respuesta.arrayBuffer());
  comprobar('el binario ENF1 contiene los dos niveles horneados', niveles.length === 2);
  comprobar(
    'ambos niveles contienen una malla de facetas con geometría finita',
    niveles.every((nivel) => nivel.triangulos > 0
      && nivel.posiciones.every(Number.isFinite)
      && nivel.grupos.every((grupo) => grupo <= 4)),
  );

  resultado.textContent = pruebas.join('\n');
  resultado.dataset.estado = 'aprobado';
}

ejecutar().catch((error) => {
  resultado.textContent = `${pruebas.join('\n')}\nFALLO ${error.message}`;
  resultado.dataset.estado = 'fallido';
  console.error(error);
});
