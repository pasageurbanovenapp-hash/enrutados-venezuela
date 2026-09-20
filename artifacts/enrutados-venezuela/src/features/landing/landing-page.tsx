import { Topbar } from '@/components/layout/topbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { ProofBand } from '@/components/sections/proof-band';
import { Problem } from '@/components/sections/problem';
import { Audiences } from '@/components/sections/audiences';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Operations } from '@/components/sections/operations';
import { Honesty } from '@/components/sections/honesty';
import { FaqSection } from '@/components/sections/faq-section';
import { Contact } from '@/components/sections/contact';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';

export function LandingPage() {
  useDocumentTitle('Enrutados Venezuela | Un transporte más claro para todos');
  const pageRef = useRevealOnScroll<HTMLDivElement>();

  return (
    <div ref={pageRef} className="site-shell">
      <Topbar />
      <main>
        <Hero />
        <ProofBand />
        <Problem />
        <Audiences />
        <HowItWorks />
        <Operations />
        <Honesty />
        <FaqSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
