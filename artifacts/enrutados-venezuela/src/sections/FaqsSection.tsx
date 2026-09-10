import { faqs } from '../content';

interface FaqsSectionProps {
  openFaq: number | null;
  onToggle: (index: number) => void;
}

export function FaqsSection({ openFaq, onToggle }: FaqsSectionProps) {
  // ...

  return (
    <section className="faqs-section">
      <h2>Preguntas Frecuentes</h2>
      {faqs.map((item, index) => (
        <div key={index} className="faq-item">
          <strong>{item.question}</strong>
          <p>{item.answer}</p>
        </div>
      ))}
    </section>
  );
}
