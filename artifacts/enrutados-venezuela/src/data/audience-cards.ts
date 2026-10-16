import {
  ClipboardCheck,
  LayoutDashboard,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

export interface AudienceCard {
  icon: LucideIcon;
  kicker: string;
  title: string;
  copy: string;
  items: string[];
  role: 'pasajero' | 'conductor' | 'asociacion';
}

export const audienceCards: AudienceCard[] = [
  {
    icon: Smartphone,
    kicker: 'PASAJERO',
    title: 'Viajar con más confianza.',
    copy:
      'Las herramientas digitales pueden ayudar al pasajero a consultar la información disponible y comprender mejor su recorrido.',
    items: [
      'Más claridad para preparar el viaje',
      'Información accesible desde su experiencia digital',
      'Herramientas para acompañar el recorrido',
    ],
    role: 'pasajero',
  },
  {
    icon: ClipboardCheck,
    kicker: 'CONDUCTOR',
    title: 'Trabajar sin perder el ritmo.',
    copy:
      'La jornada exige atención y coordinación. Enrutados incorpora herramientas para procesar los viajes digitales desde el teléfono autorizado por la asociación, procurando que la tecnología acompañe el servicio.',
    items: [
      'Un flujo digital para procesar los viajes',
      'Herramientas pensadas para el trabajo en ruta',
      'Información de la operación disponible para consulta',
    ],
    role: 'conductor',
  },
  {
    icon: LayoutDashboard,
    kicker: 'ASOCIACIÓN',
    title: 'Gestionar con mejor contexto.',
    copy:
      'La asociación autoriza y administra la operación. La información generada por los viajes digitales puede ayudar a revisar la actividad y aportar contexto para las decisiones, junto con los procesos de control existentes.',
    items: [
      'Información organizada sobre la operación digital',
      'Elementos de consulta para revisar la actividad',
      'Más contexto para apoyar las decisiones de gestión',
    ],
    role: 'asociacion',
  },
];