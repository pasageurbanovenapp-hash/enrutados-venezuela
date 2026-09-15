import { audienceCards } from '@/data/audience-cards';

export function Audiences() {
  return (
    <section className="section" id="para-quien" aria-labelledby="audience-title">
      <div className="wrap">
        <div className="section-intro reveal">
          <div>
            <span className="eyebrow">Tres miradas, un mismo viaje</span>
            <h2 className="section-title" id="audience-title">
              Queremos proponer y promover orden en la movilidad.
            </h2>
          </div>
          <p className="section-copy">
            La ruta funciona mejor cuando todos tienen claridad. Te ofrecemos acompañamiento para
            registrar los detalles: la parada, el turno, el pasaje y la cuenta al final del día.
          </p>
        </div>
        <div className="audience-grid">
          {audienceCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <article
                className={`audience-card reveal ${card.featured ? 'featured' : ''}`}
                key={card.kicker}
              >
                <div className="card-icon">
                  <Icon size={21} strokeWidth={1.8} />
                </div>
                <span className="card-kicker">{card.kicker}</span>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
                <ul>
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <span className="sr-only">
                  {`Beneficios para ${index === 0 ? 'pasajeros' : index === 1 ? 'conductores' : 'asociaciones'}`}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
