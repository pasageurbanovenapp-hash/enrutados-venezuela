import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Brand } from '@/components/layout/brand';

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <div className="wrap nav-row">
        <Brand />
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          data-testid="button-toggle-menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          <a href="#como-funciona" onClick={closeMenu} data-testid="link-how-it-works">
            Cómo funciona
          </a>
          <a href="#para-quien" onClick={closeMenu} data-testid="link-audiences">
            Para quién
          </a>
          <a href="#preguntas" onClick={closeMenu} data-testid="link-faq">
            Preguntas
          </a>
          <a className="nav-cta" href="#piloto" onClick={closeMenu} data-testid="link-start-pilot">
            Iniciar un piloto <ArrowRight size={15} />
          </a>
        </nav>
      </div>
    </header>
  );
}
