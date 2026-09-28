import { audienceCards } from '@/data/audience-cards';

export function Audiences() {
  return (
    <section
      className="section"
      id="para-quien"
      aria-labelledby="audience-title"
    >
      <div className="wrap">
        <div className="section-intro reveal">
          <div>
            <span className="eyebrow">Tres perspectivas, un mismo recorrido</span>
            <h2 className="section-title" id="audience-title">
              La ruta mejora cuando todos tienen claridad.
            </h2>
          </div>
          <p className="section-copy">
            Enrutados ofrece acompañamiento para registrar los detalles: la
            parada, el turno, el pasaje y la cuenta al final del día,
            manteniendo la misma perspectiva operativa para cada usuario.
          </p>
        </div>

        <div className="audience-grid">
          {audienceCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <article
                className="audience-card reveal"
                key={card.kicker}
                data-role={card.role}
              >
                <header className="audience-card__head">
                  <div className="card-icon">
                    <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <span className="audience-card__num mono" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </header>

                <span className="card-kicker">{card.kicker}</span>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>

                <ul>
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}