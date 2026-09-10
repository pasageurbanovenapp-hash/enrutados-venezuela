import { type FormEvent } from 'react';

export type ContactSectionProps = {
  email: string;
  mailOpened: boolean;
  onEmailChange: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const ContactSection = ({ email, mailOpened, onEmailChange, onSubmit }: ContactSectionProps) => {
  return (
    <section className="contact-section">
      <h2>Contáctanos</h2>
      <p>¿Tienes preguntas o quieres iniciar un piloto?</p>
      <a href="mailto:pilotos@enrutados.ve">Correo directo</a>
      <a href="/como-funcionar">Iniciar un piloto</a>
    </section>
  );
};
