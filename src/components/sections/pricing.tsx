'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { Reveal, RevealGroup } from '@/components/shared/reveal';
import { SectionHeading } from '@/components/shared/section-heading';
import { pricing, pricingFootnote, pricingIntro } from '@/content/content';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { useTilt } from '@/hooks/use-tilt';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { PricePlan } from '@/types';

/**
 * Karta cennika przechylająca się w 3D za kursorem.
 *
 * Wariant polecany dostaje dodatkowo animowaną neonową obwódkę —
 * obracający się gradient pod wewnętrzną maską, więc jest to jeden
 * element, a nie pętla w JS-ie.
 */
function PriceCard({ plan, index }: { plan: PricePlan; index: number }) {
  const reveal = useScrollReveal({ index, y: 60, blur: 12, scale: 0.93 });
  const tilt = useTilt({ ref: reveal.ref });

  const layer = (depth: number) =>
    tilt.enabled ? { transform: `translateZ(${depth}px)` } : undefined;

  return (
    <motion.article
      ref={reveal.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      style={{
        ...reveal.style,
        ...(tilt.enabled
          ? {
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
              transformPerspective: tilt.perspective,
              transformStyle: 'preserve-3d' as const,
            }
          : {}),
      }}
      className={cn(
        'group relative flex flex-col gap-7 rounded-3xl border p-8 transition-colors duration-700 ease-out-expo md:p-9',
        plan.featured ? 'border-transparent bg-elevated shadow-glow' : 'surface-card border-border'
      )}
    >
      {plan.featured && (
        <>
          {/* Obracająca się obwódka: gradient pod wewnętrzną maską. */}
          <span
            className="pointer-events-none absolute -inset-px overflow-hidden rounded-3xl"
            aria-hidden="true"
          >
            <span
              className="absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 animate-border-spin"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, #b347ff 60deg, #ff2df7 130deg, transparent 200deg, transparent 360deg)',
              }}
            />
            <span className="absolute inset-px rounded-3xl bg-elevated" />
          </span>

          <span
            className="relative w-fit rounded-full bg-primary px-3.5 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground"
            style={layer(40)}
          >
            Najczęściej wybierane
          </span>
        </>
      )}

      <div className="relative flex items-start justify-between gap-4" style={layer(36)}>
        <span className="grid size-12 place-items-center rounded-2xl border border-border bg-[rgba(179,71,255,0.07)] text-neon-violet transition-transform duration-700 ease-out-expo group-hover:-translate-y-1">
          <Icon name={plan.icon} className="size-5" strokeWidth={1.5} />
        </span>
      </div>

      <div className="relative flex flex-col gap-2" style={layer(28)}>
        <h3 className="text-heading-sm font-semibold">{plan.title}</h3>
        <span className="font-display text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)] font-bold leading-none text-neon">
          {plan.price}
        </span>
        <span className="text-sm font-light text-muted-foreground">{plan.note}</span>
      </div>

      <ul className="relative flex flex-col gap-3" style={layer(16)}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm font-light text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-neon-violet" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export function Pricing() {
  return (
    <section id="cennik" className="relative scroll-mt-28 py-section" aria-labelledby="cennik-title">
      <div className="shell flex flex-col gap-16 lg:gap-20">
        <SectionHeading
          index="03"
          titleId="cennik-title"
          eyebrow={pricingIntro.eyebrow}
          title={pricingIntro.title}
          description={pricingIntro.description}
        />

        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {pricing.map((plan, index) => (
            <PriceCard key={plan.id} plan={plan} index={index} />
          ))}
        </RevealGroup>

        <Reveal y={28} blur={8}>
          <p className="mx-auto max-w-2xl text-center text-sm font-light text-muted-foreground">
            {pricingFootnote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
