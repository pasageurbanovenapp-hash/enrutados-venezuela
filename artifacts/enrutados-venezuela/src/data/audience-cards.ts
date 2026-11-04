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
    title: 'Viajar con claridad.',
    copy:
      'Saber qué pasa con su viaje, qué respaldo tiene y cuál es el siguiente paso.',
    items: [],
    role: 'pasajero',
  },
  {
    icon: ClipboardCheck,
    kicker: 'CONDUCTOR',
    title: 'Validar sin frenar.',
    copy:
      'Un gesto breve al abordar. La tecnología acompaña la ruta, no la interrumpe.',
    items: [],
    role: 'conductor',
  },
  {
    icon: LayoutDashboard,
    kicker: 'ASOCIACIÓN',
    title: 'Leer la operación.',
    copy:
      'Ver lo que ocurrió sin tener que reconstruirlo desde planillas dispersas.',
    items: [],
    role: 'asociacion',
  },
];
