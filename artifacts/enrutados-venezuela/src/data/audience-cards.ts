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
  featured?: boolean;
}

export const audienceCards: AudienceCard[] = [
  {
    icon: Smartphone,
    kicker: 'Para quien se mueve',
    title: 'Pago digital y viaje seguro',
    copy: 'Una forma sencilla de registrar tu pasaje y saber dónde va tu recorrido, sin perderte entre mensajes.',
    items: [
      'Consulta tus viajes desde el celular',
      'Control total sobre tu pago',
      'Más tranquilidad en cada trayecto',
    ],
    featured: true,
  },
  {
    icon: ClipboardCheck,
    kicker: 'Para quien conduce',
    title: 'Validación rápida y sin fricciones',
    copy: 'El conductor confirma el viaje en pocos pasos y sigue atendiendo a sus pasajeros.',
    items: [
      'Validación rápida al abordar',
      'Cuantificación sistematica al final del día',
      'Pensado para el ritmo de la calle',
    ],
  },
  {
    icon: LayoutDashboard,
    kicker: 'Para asociaciones',
    title: 'Ordena lo que ya haces',
    copy: 'Una vista compartida para entender tus rutas, tus turnos y el movimiento real de la operación.',
    items: [
      'Registros por ruta y unidad',
      'Información para decidir mejor',
      'Acompañamiento durante el piloto',
    ],
  },
];
