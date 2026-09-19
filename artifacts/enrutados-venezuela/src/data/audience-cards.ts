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
    copy: 'Ve la unidad, registra tu pasaje y llega a destino. Una sola acción digital para todo el recorrido.',
    items: [
      'Ubicación de unidades en tiempo real',
      'Registro de pasaje al abordar',
      'Historial de viajes y gastos',
    ],
    role: 'pasajero',
  },
  {
    icon: ClipboardCheck,
    kicker: 'CONDUCTOR',
    title: 'Valida. Cuenta. Continúa.',
    copy: 'Confirma el viaje en segundos. El sistema registra; tú mantienes el ritmo de la ruta.',
    items: [
      'Validación al abordar sin fricción',
      'Cierre de turno automático',
      'Diseñado para la operación real',
    ],
    role: 'conductor',
  },
  {
    icon: LayoutDashboard,
    kicker: 'ASOCIACIÓN',
    title: 'Ruta. Turno. Decide.',
    copy: 'Una vista compartida: qué unidades salieron, qué rutas cubrieron, qué quedó registrado hoy.',
    items: [
      'Registros por ruta, unidad y turno',
      'Validaciones y trazabilidad operativa',
      'Información para decisiones de flota',
    ],
    role: 'asociacion',
  },
];
