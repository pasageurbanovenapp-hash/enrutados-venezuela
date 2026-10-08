export type EcosystemRole = 'pasajero' | 'conductor' | 'asociacion';

export interface EcosystemActor {
  role: EcosystemRole;
  name: string;
  tagline: string;
  iconSrc: string;
  /** Frase corta de contexto. El mockup hace el resto. */
  context: string;
}

export const ecosystemActors: EcosystemActor[] = [
  {
    role: 'pasajero',
    name: 'Pasajero',
    tagline: 'Consulta, paga y viaja',
    iconSrc: `${import.meta.env.BASE_URL}icons/pasajero.webp`,
    context:
      'El pasajero ve su saldo, su QR y su historial — todo en una sola pantalla.',
  },
  {
    role: 'conductor',
    name: 'Conductor / Colector',
    tagline: 'Valida, no administra caja',
    iconSrc: `${import.meta.env.BASE_URL}icons/conductor.webp`,
    context:
      'El colector escanea el QR y registra el viaje. El conductor sigue su ruta.',
  },
  {
    role: 'asociacion',
    name: 'Asociación',
    tagline: 'Información para gestionar',
    iconSrc: `${import.meta.env.BASE_URL}icons/admin.webp`,
    context:
      'La asociación ve su flota, sus recargas y su cierre de caja en una sola vista.',
  },
];