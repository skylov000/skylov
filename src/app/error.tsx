'use client';

import { useEffect } from 'react';

import { CtaButton } from '@/components/shared/cta-button';

/**
 * Granica błędu na poziomie trasy. Z definicji komponent kliencki —
 * App Router tego wymaga dla `error.tsx`.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Podmień na swój system raportowania (Sentry, Highlight, …).
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[80svh] items-center py-section">
      <div className="shell flex flex-col gap-8">
        <span className="eyebrow">Coś się wysypało</span>

        <h1 className="text-display-sm font-bold uppercase text-neon">Nieoczekiwany błąd</h1>

        <p className="max-w-prose text-body-lg font-light text-muted-foreground">
          Przepraszam za to. Spróbuj jeszcze raz — a jeśli błąd wraca, daj znać.
        </p>

        {error.digest && (
          <p className="text-xs font-light text-muted-foreground">Identyfikator: {error.digest}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <CtaButton label="Spróbuj ponownie" onClick={reset} />
          <CtaButton href="/" label="Strona główna" variant="outline" />
        </div>
      </div>
    </section>
  );
}
