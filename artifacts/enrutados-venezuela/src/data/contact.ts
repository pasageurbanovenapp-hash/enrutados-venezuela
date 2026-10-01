export interface ContactChannel {
  type: 'email' | 'whatsapp';
  label: string;
  href: string;
  display: string;
}

/* ── Datos centralizados ──────────────────────────────────────────────── */

export const CONTACT_EMAIL = 'urbanpassage.mvp2025@gmail.com';

/**
 * Número de WhatsApp en formato E.164 sin el "+".
 * +58 414 471 9804 → "584144719804"
 */
export const CONTACT_WHATSAPP_NUMBER = '584144719804';

/* ── Mensajes pre-armados ─────────────────────────────────────────────── */

export const EMAIL_SUBJECT = 'Quiero conversar sobre un piloto';

export const buildEmailBody = (email: string): string =>
  `Hola, mi correo es ${email}. Me gustaría conversar sobre un piloto de Enrutados.`;

export const buildEmailHref = (email: string): string => {
  const subject = encodeURIComponent(EMAIL_SUBJECT);
  const body = encodeURIComponent(buildEmailBody(email));
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
};

export const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola, vi la landing de Enrutados y quiero conversar sobre un piloto.'
);

export const WHATSAPP_HREF = `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

/* ── Canales públicos ─────────────────────────────────────────────────── */

export const contactChannels: ContactChannel[] = [
  {
    type: 'email',
    label: 'Escríbenos',
    href: `mailto:${CONTACT_EMAIL}`,
    display: CONTACT_EMAIL,
  },
  {
    type: 'whatsapp',
    label: 'WhatsApp',
    href: WHATSAPP_HREF,
    display: 'Conversar por WhatsApp',
  },
];
