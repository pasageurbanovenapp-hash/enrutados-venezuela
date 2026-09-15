import { type FormEvent, useState } from 'react';
import { Check, Mail, ShieldCheck } from 'lucide-react';

export function Contact() {
  const [email, setEmail] = useState('');
  const [mailOpened, setMailOpened] = useState(false);

  const handlePilotSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent('Quiero conversar sobre un piloto');
    const body = encodeURIComponent(
      `Hola, mi correo es ${email}. Me gustaría conversar sobre un piloto de Enrutados.`,
    );
    setMailOpened(true);
    window.location.href = `mailto:pilotos@enrutados.ve?subject=${subject}&body=${body}`;
  };

  return (
    <section className="contact" id="piloto" aria-labelledby="contact-title">
      <div className="wrap contact-grid">
        <div className="reveal">
          <span className="eyebrow">Hagamos una primera ruta</span>
          <h2 className="section-title" id="contact-title">
            ¿Tu asociación quiere probar algo distinto?
          </h2>
          <p className="contact-copy">
            Déjanos tu correo y abriremos un mensaje para coordinar una conversación. Cuéntanos
            tu ciudad, tu ruta y cómo trabajan hoy.
          </p>
          <p className="contact-copy" style={{ marginTop: 14 }}>
            También puedes escribir directamente a{' '}
            <a
              href="mailto:pilotos@enrutados.ve"
              style={{ color: 'var(--cyan)', fontWeight: 700 }}
              data-testid="link-pilot-email"
            >
              pilotos@enrutados.ve
            </a>
            .
          </p>
        </div>
        <form className="contact-form reveal" onSubmit={handlePilotSubmit}>
          <label htmlFor="pilot-email">Correo de contacto</label>
          <input
            id="pilot-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@asociacion.com"
            data-testid="input-pilot-email"
          />
          <button className="button button-primary" type="submit" data-testid="button-submit-pilot">
            <Mail size={17} /> Abrir correo para coordinar
          </button>
          <p className="form-note">
            <ShieldCheck size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Este formulario no guarda datos todavía: abre tu aplicación de correo con un mensaje
            listo para enviar.
          </p>
          {mailOpened && (
            <p className="form-note" role="status" data-testid="status-mail-opened">
              <Check size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />
              Si no se abrió tu correo, escribe directamente a pilotos@enrutados.ve.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
