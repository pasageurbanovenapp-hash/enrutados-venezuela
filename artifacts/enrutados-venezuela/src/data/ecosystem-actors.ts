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
      'Saldo, código y viajes recientes en una sola pantalla.',
  },
  {
    role: 'conductor',
    name: 'Chofer',
    tagline: 'Escanea, valida y sigue',
    iconSrc: `${import.meta.env.BASE_URL}icons/conductor.webp`,
    context:
      'Escanea, valida y sigue. La ruta no se detiene.',
  },
  {
    role: 'asociacion',
    name: 'Asociación',
    tagline: 'Información para gestionar',
    iconSrc: `${import.meta.env.BASE_URL}icons/admin.webp`,
    context:
      'Flota, recargas y cierre en una misma vista.',
  },
];
