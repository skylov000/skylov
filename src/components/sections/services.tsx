'use client';

import { motion } from 'framer-motion';

import { RevealGroup } from '@/components/shared/reveal';
import { SectionHeading } from '@/components/shared/section-heading';
import { services, servicesIntro } from '@/content/content';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { useTilt } from '@/hooks/use-tilt';
import { Icon } from '@/lib/icons';
import { pad } from '@/lib/utils';
import type { Service } from '@/types';

/**
 * Karta usługi.
 *
 * Trzy rzeczy dzieją się na jednym elemencie: odsłona sterowana
 * przewijaniem (odwracalna), przechył 3D za kursorem i światło
 * podążające po powierzchni. Odsłona i przechył współdzielą referencję,
 * żeby nie mnożyć opakowań w DOM.
 */
function ServiceCard({ service, index }: { service: Service; index: number }) {
  // Bez `rotateX` w odsłonie — tę oś przejmuje przechył za kursorem,
  // a obie nie mogą pisać do tej samej własności stylu.
  const reveal = useScrollReveal({ index, y: 56, blur: 12, scale: 0.94 });
  const tilt = useTilt({ ref: reveal.ref });

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    tilt.onPointerMove(event);

    const element = reveal.ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    element.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    <motion.article
      ref={reveal.ref}
      onPointerMove={handlePointerMove}
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
      className="surface-card group relative flex flex-col justify-between gap-10 p-8 md:p-10"
    >
      {/* Przycinanie musi siedzieć na dziecku, nie na karcie: `overflow`
          inny niż `visible` wymusza spłaszczenie `preserve-3d`. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(179,71,255,0.16), transparent 70%)',
          }}
        />
      </div>

      <div
        className="relative flex items-start justify-between gap-6"
        style={tilt.enabled ? { transform: 'translateZ(34px)' } : undefined}
      >
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-border bg-[rgba(179,71,255,0.07)] text-neon-violet transition-all duration-700 ease-out-expo group-hover:-translate-y-1 group-hover:shadow-glow-sm">
          <Icon name={service.icon} className="size-5" strokeWidth={1.5} />
        </span>
        <span className="font-display text-sm font-semibold tabular-nums text-[rgba(199,179,230,0.35)] transition-colors duration-700 group-hover:text-neon-violet">
          {pad(index + 1)}
        </span>
      </div>

      <div
        className="relative flex flex-col gap-4"
        style={tilt.enabled ? { transform: 'translateZ(22px)' } : undefined}
      >
        <h3 className="text-heading-sm font-semibold">{service.title}</h3>
        <p className="text-base font-light leading-relaxed text-muted-foreground">
          {service.description}
        </p>
      </div>
    </motion.article>
  );
}

export function Services() {
  return (
    <section
      id="uslugi"
      className="relative scroll-mt-28 py-section"
      aria-labelledby="uslugi-title"
    >
      <div className="shell flex flex-col gap-16 lg:gap-20">
        <SectionHeading
          index="02"
          titleId="uslugi-title"
          eyebrow={servicesIntro.eyebrow}
          title={servicesIntro.title}
          description={servicesIntro.description}
        />

        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
