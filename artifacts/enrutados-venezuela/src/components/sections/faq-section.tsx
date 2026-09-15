import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs } from '@/data/faqs';

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="section faq-section" id="preguntas" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <div className="reveal">
          <span className="eyebrow">Preguntas reales</span>
          <h2 className="section-title" id="faq-title">
            Lo importante antes de empezar.
          </h2>
          <p className="section-copy">
            Si algo no está aquí, escríbenos. Preferimos una conversación honesta a una letra
            pequeña.
          </p>
        </div>
        <div className="faq-list reveal">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div className="faq-item" key={faq.question}>
                <button
                  className="faq-question"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  data-testid={`button-faq-${index}`}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={19} />
                </button>
                {isOpen && (
                  <div className="faq-answer" id={`faq-answer-${index}`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
