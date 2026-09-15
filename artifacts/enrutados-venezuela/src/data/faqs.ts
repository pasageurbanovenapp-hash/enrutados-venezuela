export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: '¿Enrutados ya está disponible para todo el público?',
    answer:
      'Todavía no. Estamos en etapa de prototipo y validación con asociaciones de transporte. Por eso buscamos aliados para iniciar pilotos reales, aprender en campo y ajustar la herramienta a cada operación.',
  },
  {
    question: '¿Esto elimina el pago en efectivo?',
    answer:
      'No. Enrutados no parte de esa promesa. El piloto puede convivir con las formas de pago que ya usa cada asociación; la prioridad es registrar y validar mejor el viaje.',
  },
  {
    question: '¿Necesito un teléfono especial o internet perfecto?',
    answer:
      'No buscamos poner una barrera nueva. Trabajamos con teléfonos Android habituales y revisamos junto a cada equipo qué conectividad tienen en sus rutas. La experiencia final se define durante el piloto.',
  },
  {
    question: '¿Qué necesita una asociación para comenzar?',
    answer:
      'Un equipo responsable, una ruta o grupo de unidades para probar y disposición para conversar con nosotros sobre el día a día. El primer paso es una llamada corta para entender la operación.',
  },
  {
    question: '¿Cómo conversamos sobre un piloto?',
    answer:
      'Escríbenos desde el formulario o directamente a pilotos@enrutados.ve. Cuéntanos tu ciudad, la ruta y cómo trabajan hoy. Te responderemos para coordinar una conversación sin compromiso.',
  },
];
