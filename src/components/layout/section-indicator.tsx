'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { scrollTo } from '@/lib/lenis';
import { cn } from '@/lib/utils';

export interface SectionMarker {
  id: string;
  label: string;
}

/**
 * Vertical section rail on the right edge. Tracks the section currently
 * filling the viewport and doubles as navigation.
 *
 * Uses IntersectionObserver rather than scroll maths so it stays accurate
 * regardless of section height.
 */
export function SectionIndicator({ sections }: { sections: SectionMarker[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible section, not merely the first intersecting one.
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(best.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Section navigation"
      className="no-print fixed right-6 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-end gap-4 xl:flex"
    >
      {sections.map((section) => {
        const isActive = active === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(`#${section.id}`)}
            className="group flex items-center gap-3 outline-none"
            aria-current={isActive ? 'true' : undefined}
            aria-label={`Go to ${section.label}`}
          >
            <span
              className={cn(
                'text-[0.625rem] uppercase tracking-[0.18em] transition-all duration-500 ease-out-expo',
                isActive
                  ? 'translate-x-0 text-foreground opacity-100'
                  : 'translate-x-2 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'
              )}
            >
              {section.label}
            </span>
            <span className="relative flex h-px w-8 items-center">
              <span className="absolute inset-0 bg-border" />
              <motion.span
                className="absolute inset-y-0 left-0 bg-foreground"
                initial={false}
                animate={{ width: isActive ? '100%' : '35%' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
