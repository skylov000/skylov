'use client';

import { Reveal } from '@/components/shared/reveal';
import { TypeText } from '@/components/shared/type-text';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Numer porządkowy sekcji, np. „02". */
  index?: string;
  align?: 'left' | 'center';
  className?: string;
  /** Cel dla `aria-labelledby` sekcji nadrzędnej. */
  titleId?: string;
  children?: React.ReactNode;
}

/**
 * Nagłówek sekcji: numer, nadtytuł i lid wystukiwany na maszynie.
 *
 * Wielki tytuł sekcji został usunięty z warstwy wizualnej — nadtytuł
 * („MOJE PRODUKCJE", „CO OFERUJĘ") nazywa sekcję wystarczająco jasno,
 * a dwa napisy jeden nad drugim tylko konkurowały o uwagę.
 *
 * `<h2>` zostaje w dokumencie jako `sr-only`: bez niego rozsypałby się
 * konspekt strony, `aria-labelledby` sekcji wskazywałoby w pustkę,
 * a wyszukiwarki straciłyby nagłówki drugiego poziomu.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  index,
  align = 'left',
  className,
  titleId,
  children,
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div className={cn('flex flex-col gap-6', centered && 'items-center text-center', className)}>
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>

      <Reveal x={centered ? 0 : -28} y={0} blur={6}>
        <div className={cn('flex items-center gap-4', centered && 'justify-center')}>
          {index && <span className="eyebrow">{index}</span>}
          <span className="h-px w-10 bg-border" aria-hidden="true" />
          <span className="eyebrow text-muted-foreground">{eyebrow}</span>
        </div>
      </Reveal>

      {description && (
        <p
          className={cn(
            'max-w-prose font-display text-heading-sm font-medium leading-snug text-foreground',
            centered && 'mx-auto'
          )}
        >
          <TypeText text={description} />
        </p>
      )}

      {children}
    </div>
  );
}
