import { type LucideIcon } from 'lucide-react';

import { audienceCards } from '../content';

export type AudienceCard = {
  icon: LucideIcon;
  kicker: string;
  title: string;
  copy: string;
  items: readonly string[];
  featured?: boolean;
};

export function AudienceSection({ cards = audienceCards }: { cards?: readonly AudienceCard[] }) {
  return (
    <section id="para-quien" className="audience-section">
      <h2>Para quién es útil</h2>
      <div className="audience-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className={`audience-card ${card.featured ? 'featured' : ''}`}>
              <div className="card-icon">
                <Icon size={22} />
              </div>
              <p className="kicker">{card.kicker}</p>
              <h3>{card.title}</h3>
              <p className="copy">{card.copy}</p>
              <ul>
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
