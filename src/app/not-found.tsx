import type { Metadata } from 'next';

import { AnimatedText } from '@/components/shared/animated-text';
import { CtaButton } from '@/components/shared/cta-button';
import { Reveal } from '@/components/shared/reveal';

export const metadata: Metadata = {
  title: 'Nie znaleziono strony',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center py-section">
      <div className="shell flex flex-col gap-10">
        <span className="eyebrow">Błąd 404</span>

        <h1 className="text-display-md font-bold uppercase text-neon">
          <AnimatedText text={['Ta strona', 'zaginęła']} mode="lines" play delay={0.1} />
        </h1>

        <Reveal y={26} blur={8}>
          <p className="max-w-prose text-body-lg font-light text-muted-foreground">
            Link jest nieaktualny albo strona zmieniła adres. Muzyka czeka tam, gdzie ją zostawiłeś.
          </p>
        </Reveal>

        <Reveal index={1} y={24} blur={6} className="flex flex-wrap gap-3">
          <CtaButton href="/" label="Wróć na stronę główną" />
          <CtaButton href="/#kontakt" label="Napisz do mnie" variant="outline" />
        </Reveal>
      </div>
    </section>
  );
}
