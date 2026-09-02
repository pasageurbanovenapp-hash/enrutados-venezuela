import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDownRight, ArrowRight, Check, ChevronDown, ClipboardCheck, Clock3, LayoutDashboard, Mail, Menu, Network, Route as RouteIcon, ShieldCheck, Smartphone, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const audienceCards = [
  {
    icon: Smartphone,
    kicker: 'Para quien se mueve',
    title: 'Pago digital y viaje seguro',
    copy: 'Una forma sencilla de registrar tu pasaje y saber dónde va tu recorrido, sin perderte entre mensajes.',
    items: ['Consulta tus viajes desde el celular', 'Recibe una referencia clara de tu pago', 'Más tranquilidad en cada trayecto'],
    featured: true,
  },
  {
    icon: ClipboardCheck,
    kicker: 'Para quien conduce',
    title: 'Validación rápida y sin fricciones',
    copy: 'El conductor confirma el viaje en pocos pasos y sigue atendiendo a sus pasajeros.',
    items: ['Validación rápida al abordar', 'Cuantificación sistematica al final del día', 'Pensado para el ritmo de la calle'],
  },
  {
    icon: LayoutDashboard,
    kicker: 'Para asociaciones',
    title: 'Ordena lo que ya haces',
    copy: 'Una vista compartida para entender tus rutas, tus turnos y el movimiento real de la operación.',
    items: ['Registros por ruta y unidad', 'Información para decidir mejor', 'Acompañamiento durante el piloto'],
  },
];

const faqs = [
  {
    question: '¿Enrutados ya está disponible para todo el público?',
    answer: 'Todavía no. Estamos en etapa de prototipo y validación con asociaciones de transporte. Por eso buscamos aliados para iniciar pilotos reales, aprender en campo y ajustar la herramienta a cada operación.',
  },
  {
    question: '¿Esto elimina el pago en efectivo?',
    answer: 'No. Enrutados no parte de esa promesa. El piloto puede convivir con las formas de pago que ya usa cada asociación; la prioridad es registrar y validar mejor el viaje.',
  },
  {
    question: '¿Necesito un teléfono especial o internet perfecto?',
    answer: 'No buscamos poner una barrera nueva. Trabajamos con teléfonos Android habituales y revisamos junto a cada equipo qué conectividad tienen en sus rutas. La experiencia final se define durante el piloto.',
  },
  {
    question: '¿Qué necesita una asociación para comenzar?',
    answer: 'Un equipo responsable, una ruta o grupo de unidades para probar y disposición para conversar con nosotros sobre el día a día. El primer paso es una llamada corta para entender la operación.',
  },
  {
    question: '¿Cómo conversamos sobre un piloto?',
    answer: 'Escríbenos desde el formulario o directamente a pilotos@enrutados.ve. Cuéntanos tu ciudad, la ruta y cómo trabajan hoy. Te responderemos para coordinar una conversación sin compromiso.',
  },
];

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="Enrutados Venezuela, volver al inicio" data-testid="link-brand">
      <span className="brand-mark" aria-hidden="true"><span>e</span></span>
      <span>Enrutados <span style={{ color: 'var(--violet)' }}>Venezuela</span></span>
    </a>
  );
}

function PhoneMockup() {
  return (
    <div className="device-shell reveal" aria-label="Vista móvil del producto Enrutados">
      <div className="device-frame">
        <div className="device-notch" aria-hidden="true" />
        <div className="screen-header">
          <span className="pill-soft">Ruta 05</span>
          <span className="status-dot" aria-hidden="true" />
        </div>

        <div className="screen-card active">
          <div className="screen-label-row">
            <span>Viaje activo</span>
            <span className="status-tag">Validado</span>
          </div>
          <div className="trip-price">Bs. 85</div>
          <div className="trip-route">La Isabelica → Centro</div>
          <div className="trip-meta">
            <span>08:45 AM</span>
            <span>Pasajero #24</span>
          </div>
        </div>

        <div className="screen-section">
          <div className="mini-title">Resumen</div>
          <div className="mini-stats">
            <div>
              <small>Pagos</small>
              <strong>14</strong>
            </div>
            <div>
              <small>Rutas</small>
              <strong>3</strong>
            </div>
          </div>
        </div>

        <div className="route-list">
          <div className="route-item">
            <span className="dot cyan" aria-hidden="true" />
            <div>
              <strong>Parada 01</strong>
              <small>08:30</small>
            </div>
          </div>
          <div className="route-item">
            <span className="dot violet" aria-hidden="true" />
            <div>
              <strong>Centro</strong>
              <small>08:50</small>
            </div>
          </div>
          <div className="route-item">
            <span className="dot green" aria-hidden="true" />
            <div>
              <strong>Final</strong>
              <small>09:10</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState('');
  const [mailOpened, setMailOpened] = useState(false);

  useEffect(() => {
    document.title = 'Enrutados Venezuela | Un transporte más claro para todos';
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 },
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const handlePilotSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent('Quiero conversar sobre un piloto');
    const body = encodeURIComponent(`Hola, mi correo es ${email}. Me gustaría conversar sobre un piloto de Enrutados.`);
    setMailOpened(true);
    window.location.href = `mailto:pilotos@enrutados.ve?subject=${subject}&body=${body}`;
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
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
            <a href="#como-funciona" onClick={closeMenu} data-testid="link-how-it-works">Cómo funciona</a>
            <a href="#para-quien" onClick={closeMenu} data-testid="link-audiences">Para quién</a>
            <a href="#preguntas" onClick={closeMenu} data-testid="link-faq">Preguntas</a>
            <a className="nav-cta" href="#piloto" onClick={closeMenu} data-testid="link-start-pilot">Iniciar un piloto <ArrowRight size={15} /></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            <div className="hero-copy reveal">
              <span className="eyebrow">Movilidad hecha aquí</span>
              <h1 id="hero-title">Que moverse sea más <em>claro.</em></h1>
              <p className="hero-lede">Enrutados Venezuela digitaliza el transporte público: pagos sin efectivo, trazabilidad del viaje y mejor control operativo, todo desde el celular.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#piloto" data-testid="button-hero-pilot">Quiero iniciar un piloto <ArrowDownRight size={17} /></a>
                <a className="button button-quiet" href="#como-funciona" data-testid="link-hero-explanation">Conoce cómo funciona <ArrowRight size={16} /></a>
              </div>
              <div className="hero-proof">
                <div><strong>1.248</strong><span>viajes registrados</span></div>
                <div><strong>18</strong><span>unidades activas</span></div>
                <div><strong>3</strong><span>roles conectados</span></div>
              </div>
            </div>

            <div className="hero-visual reveal">
              <div className="orb orb-one" aria-hidden="true" />
              <div className="orb orb-two" aria-hidden="true" />
              <PhoneMockup />
              <div className="floating-panel panel-top">
                <span>Viajeto</span>
                <strong>Ruta 05</strong>
              </div>
              <div className="floating-panel panel-bottom">
                <span>Validado</span>
                <strong>+12%</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-band" aria-label="Enrutados en pocas palabras">
          <div className="wrap proof-inner">
            <span className="proof-lead">Una herramienta para el viaje completo</span>
            <div className="proof-stat"><strong>Pasajeros</strong><span>pagan y consultan</span></div>
            <div className="proof-stat"><strong>Conductores</strong><span>validan al abordar</span></div>
            <div className="proof-stat"><strong>Asociaciones</strong><span>entienden su operación</span></div>
          </div>
        </section>

        <section className="section" id="para-quien" aria-labelledby="audience-title">
          <div className="wrap">
            <div className="section-intro reveal">
              <div>
                <span className="eyebrow">Tres miradas, un mismo viaje</span>
                <h2 className="section-title" id="audience-title">La ruta funciona mejor cuando todos tienen claridad.</h2>
              </div>
              <p className="section-copy">No queremos cambiar por cambiar. Enrutados nace para quitar pasos confusos del transporte que ya conocemos: la parada, el turno, el pasaje y la cuenta al final del día.</p>
            </div>
            <div className="audience-grid">
              {audienceCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <article className={`audience-card reveal ${card.featured ? 'featured' : ''}`} key={card.kicker}>
                    <div className="card-icon"><Icon size={21} strokeWidth={1.8} /></div>
                    <span className="card-kicker">{card.kicker}</span>
                    <h3>{card.title}</h3>
                    <p>{card.copy}</p>
                    <ul>
                      {card.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <span className="sr-only">{`Beneficios para ${index === 0 ? 'pasajeros' : index === 1 ? 'conductores' : 'asociaciones'}`}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section flow-section" id="como-funciona" aria-labelledby="flow-title">
          <div className="wrap flow-grid">
            <div className="reveal">
              <span className="eyebrow">Sin vueltas</span>
              <h2 className="section-title" id="flow-title">Tres momentos. Una experiencia más ordenada.</h2>
              <p className="section-copy">La idea es sencilla: registrar lo que pasa en el viaje para que el siguiente paso sea más fácil, no más complicado.</p>
              <div className="flow-note">El piloto se adapta a la ruta y a la forma de trabajo de cada asociación. Primero escuchamos; después configuramos.</div>
            </div>
            <div className="steps reveal">
              <article className="step">
                <span className="step-number">01 / SUBE</span>
                <div><h3>El pasajero consulta ubicación de unidades</h3><p>Desde su celular puede visualizar unidades en el mapa, abordar y pagar de forma rápida y segura.</p></div>
              </article>
              <article className="step">
                <span className="step-number">02 / VALIDA</span>
                <div><h3>El conductor confirma</h3><p>Una validación breve al abordar deja constancia del viaje sin detener el ritmo de la unidad.</p></div>
              </article>
              <article className="step">
                <span className="step-number">03 / ENTIENDE</span>
                <div><h3>La asociación ve el movimiento</h3><p>Los registros se convierten en una lectura práctica de rutas, turnos y operación para decidir con más contexto.</p></div>
              </article>
            </div>
          </div>
        </section>

        <section className="section operations" aria-labelledby="operations-title">
          <div className="wrap operation-grid">
            <div className="reveal">
              <span className="eyebrow">Para decidir en equipo</span>
              <h2 className="section-title" id="operations-title">Del dato suelto a una conversación útil.</h2>
              <p className="section-copy">La tecnología aportará datos para conocer ¿Qué está pasando en la ruta? y ¿Cómo podemos trabajar mejor?.</p>
              <div className="operation-list" style={{ marginTop: 35 }}>
                <div className="operation-item"><div className="card-icon"><RouteIcon size={18} /></div><div><h3>Rutas con contexto</h3><p>Registra movimiento por recorrido, no en una hoja perdida.</p></div></div>
                <div className="operation-item"><div className="card-icon"><Clock3 size={18} /></div><div><h3>Turnos más visibles</h3><p>Ayuda a conversar sobre tiempos y operación con una base común.</p></div></div>
                <div className="operation-item"><div className="card-icon"><Network size={18} /></div><div><h3>Un mismo lenguaje</h3><p>Pasajeros, conductores y coordinación miran el viaje desde el mismo punto.</p></div></div>
              </div>
            </div>
            <div className="dashboard-card reveal" aria-label="Vista conceptual de un resumen operativo">
              <div className="dash-head"><span>RESUMEN DE OPERACIÓN / RUTA 05</span><span className="dash-status">Piloto activo</span></div>
              <div className="dash-body">
                <div><div className="bar-chart" aria-hidden="true"><span className="bar" style={{ height: '38%' }} /><span className="bar" style={{ height: '54%' }} /><span className="bar" style={{ height: '45%' }} /><span className="bar" style={{ height: '77%' }} /><span className="bar" style={{ height: '62%' }} /><span className="bar" style={{ height: '89%' }} /><span className="bar" style={{ height: '68%' }} /></div><p className="dash-caption">Registros por franja · lunes a domingo</p></div>
                <div style={{ display: 'grid', gap: 12 }}><div className="dash-metric"><small>Viajes registrados</small><strong>1.248</strong></div><div className="dash-metric"><small>Unidades activas</small><strong>18</strong></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="honesty" aria-labelledby="honesty-title">
          <div className="wrap honesty-grid">
            <div className="reveal"><span className="eyebrow">Hablemos claro</span><h2 className="section-title" id="honesty-title">Validamos en la práctica, no en teoría.</h2></div>
            <div className="reveal">
              <p className="honesty-copy">Enrutados está en <strong>etapa piloto</strong>. Validamos el modelo con asociaciones reales y ajustamos la solución a la realidad del transporte.</p>
              <p className="honesty-copy" style={{ marginTop: 20 }}>No buscamos cambiar la operación de un día para otro; buscamos acompañar una evolución gradual, útil y sostenible para pasajeros, conductores y organizaciones.</p>
              <div className="honesty-points">
                <div className="honesty-point"><strong>Validación real</strong>Probamos con operadores y rutas del mundo real.</div>
                <div className="honesty-point"><strong>Procesos respetados</strong>La operación no se rompe para adaptarse a la tecnología.</div>
                <div className="honesty-point"><strong>Evolución gradual</strong>Aprendemos en campo y ampliamos con criterio.</div>
                <div className="honesty-point"><strong>Solución útil</strong>Diseñamos para resolver fricciones de verdad.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section faq-section" id="preguntas" aria-labelledby="faq-title">
          <div className="wrap faq-grid">
            <div className="reveal">
              <span className="eyebrow">Preguntas reales</span>
              <h2 className="section-title" id="faq-title">Lo importante antes de empezar.</h2>
              <p className="section-copy">Si algo no está aquí, escríbenos. Preferimos una conversación honesta a una letra pequeña.</p>
            </div>
            <div className="faq-list reveal">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div className="faq-item" key={faq.question}>
                    <button className="faq-question" type="button" aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(isOpen ? null : index)} data-testid={`button-faq-${index}`}>
                      <span>{faq.question}</span><ChevronDown size={19} />
                    </button>
                    {isOpen && <div className="faq-answer" id={`faq-answer-${index}`}>{faq.answer}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="contact" id="piloto" aria-labelledby="contact-title">
          <div className="wrap contact-grid">
            <div className="reveal">
              <span className="eyebrow">Hagamos una primera ruta</span>
              <h2 className="section-title" id="contact-title">¿Tu asociación quiere probar algo distinto?</h2>
              <p className="contact-copy">Déjanos tu correo y abriremos un mensaje para coordinar una conversación. Cuéntanos tu ciudad, tu ruta y cómo trabajan hoy.</p>
              <p className="contact-copy" style={{ marginTop: 14 }}>También puedes escribir directamente a <a href="mailto:pilotos@enrutados.ve" style={{ color: 'var(--cyan)', fontWeight: 700 }} data-testid="link-pilot-email">pilotos@enrutados.ve</a>.</p>
            </div>
            <form className="contact-form reveal" onSubmit={handlePilotSubmit}>
              <label htmlFor="pilot-email">Correo de contacto</label>
              <input id="pilot-email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@asociacion.com" data-testid="input-pilot-email" />
              <button className="button button-primary" type="submit" data-testid="button-submit-pilot"><Mail size={17} /> Abrir correo para coordinar</button>
              <p className="form-note"><ShieldCheck size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Este formulario no guarda datos todavía: abre tu aplicación de correo con un mensaje listo para enviar.</p>
              {mailOpened && <p className="form-note" role="status" data-testid="status-mail-opened"><Check size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Si no se abrió tu correo, escribe directamente a pilotos@enrutados.ve.</p>}
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-row">
          <Brand />
          <span>Prototipo venezolano para movernos mejor.</span>
          <div className="footer-links"><a href="#inicio" data-testid="link-footer-home">Inicio</a><a href="#preguntas" data-testid="link-footer-faq">Preguntas frecuentes</a><a href="mailto:pilotos@enrutados.ve" data-testid="link-footer-contact">Contacto</a></div>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;