import { Brand } from '@/components/layout/brand';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-row">
        <Brand />
        <span>Prototipo venezolano para movernos mejor.</span>
        <div className="footer-links">
          <a href="#inicio" data-testid="link-footer-home">
            Inicio
          </a>
          <a href="#preguntas" data-testid="link-footer-faq">
            Preguntas frecuentes
          </a>
          <a href="mailto:pilotos@enrutados.ve" data-testid="link-footer-contact">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
}
