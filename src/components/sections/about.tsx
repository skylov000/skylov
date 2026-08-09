'use client';

import { motion } from 'framer-motion';

import { Counter } from '@/components/shared/counter';
import { CtaButton } from '@/components/shared/cta-button';
import { Reveal, RevealGroup } from '@/components/shared/reveal';
import { RichText } from '@/components/shared/rich-text';
import { TypeText } from '@/components/shared/type-text';
import { about } from '@/content/content';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import type { StatItem } from '@/types';

/** Kafelek liczby — wjeżdża z lekkim obrotem w głąb. */
function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const reveal = useScrollReveal({ index, y: 48, blur: 10, scale: 0.92, rotateX: 14 });

  return (
    <motion.div
      ref={reveal.ref}
      style={reveal.style ? { ...reveal.style, transformPerspective: 900 } : undefined}
      className="surface-card group flex flex-col justify-between gap-8 p-6 sm:p-8"
    >
      <span className="font-display text-display-sm font-bold leading-none text-neon">
        {stat.value === null ? (
          <>
            {/* Czytniki ekranu nie zawsze radzą sobie z symbolem ∞. */}
            <span className="sr-only">Nieskończenie wiele</span>
            <span aria-hidden="true">{stat.display}</span>
          </>
        ) : (
          <Counter value={stat.value} suffix={stat.suffix} />
        )}
      </span>

      <div className="flex flex-col gap-3">
        <span className="h-px w-full bg-border transition-colors duration-700 group-hover:bg-[rgba(179,71,255,0.5)]" />
        <span className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {stat.label}
        </span>
      </div>
    </motion.div>
  );
}

/** „O mnie" — historia po lewej, liczby po prawej. */
export function About() {
  return (
    <section
      id="o-mnie"
      className="relative scroll-mt-28 py-section"
      aria-labelledby="o-mnie-title"
    >
      <div className="shell grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-24">
        {/* ---------- Tekst ---------- */}
        <div className="flex flex-col gap-9">
          <Reveal x={-28} y={0} blur={6}>
            <div className="flex items-center gap-4">
              <span className="eyebrow">01</span>
              <span className="h-px w-10 bg-border" aria-hidden="true" />
              <span className="eyebrow text-muted-foreground">{about.eyebrow}</span>
            </div>
          </Reveal>

          {/* Tytuł zostaje dla konspektu dokumentu i `aria-labelledby`,
              wizualnie nazywa sekcję nadtytuł powyżej. */}
          <h2 id="o-mnie-title" className="sr-only">
            {about.title}
          </h2>

          <p className="max-w-prose font-display text-heading-md font-medium leading-tight text-foreground">
            <TypeText text={about.lead} />
          </p>

          <RevealGroup className="flex flex-col gap-6">
            {about.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} index={index} y={34} blur={9}>
                <p className="max-w-prose text-body-lg font-light leading-relaxed text-muted-foreground">
                  <RichText text={paragraph} />
                </p>
              </Reveal>
            ))}
          </RevealGroup>

          <Reveal index={2} y={26} blur={6}>
            <CtaButton href={about.cta.href} label={about.cta.label} variant="outline" />
          </Reveal>
        </div>

        {/* ---------- Liczby ---------- */}
        <RevealGroup className="grid grid-cols-2 gap-4 lg:sticky lg:top-28 lg:h-fit">
          {about.stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
