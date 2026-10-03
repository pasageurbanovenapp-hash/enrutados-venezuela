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
    title: 'Consulta. Paga. Viaja.',
    copy: 'Todo lo que necesitas antes de subir: cuánto te queda, dónde viene la unidad y si ya la tienes cerca.',
    items: [
      'No dependes exclusivamente del efectivo',
      'Muestras un código y ya estás dentro',
      'Cada viaje queda en tu historial',
    ],
    role: 'pasajero',
  },
  {
    icon: ClipboardCheck,
    kicker: 'CONDUCTOR / COLECTOR',
    title: 'Valida. Cuenta. Continúa.',
    copy: 'El sistema registra mientras tú mantienes el ritmo de la ruta. Nada más, nada menos.',
    items: [
      'Dejas de contar billetes al final del turno',
      'Escaneas y sigues, sin frenar la unidad',
      'Tu jornada queda respaldada, viaje por viaje.',
    ],
    role: 'conductor',
  },
  {
    icon: LayoutDashboard,
    kicker: 'ASOCIACIÓN',
    title: 'Ruta. Turno. Decide.',
    copy: 'Una vista compartida del día, sin planillas y sin conciliaciones. Lo que entró, lo que salió y lo que quedó registrado.',
    items: [
      'Sabes cuánto entró, unidad por unidad',
      'Cierras caja sin planillas ni conciliaciones',
      'El split 85/10/5 se calcula solo',
      'Historial de métricas para decidir con datos reales.',
    ],
    role: 'asociacion',
  },
];