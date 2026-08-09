'use client';

import { motion } from 'framer-motion';
import { AudioLines } from 'lucide-react';

import { Marquee } from '@/components/shared/marquee';
import { RevealGroup } from '@/components/shared/reveal';
import { SectionHeading } from '@/components/shared/section-heading';
import { artists, collaborationIntro } from '@/content/content';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { useTilt } from '@/hooks/use-tilt';
import { pad } from '@/lib/utils';
import type { Artist } from '@/types';

/**
 * Kafelek nazwiska.
 *
 * Wjeżdża naprzemiennie raz z lewej, raz z prawej — przy dziesięciu
 * elementach zwykłe „wszystko z dołu" wyglądałoby monotonnie.
 */
function ArtistTag({ artist, index }: { artist: Artist; index: number }) {
  const reveal = useScrollReveal({
    index,
    stagger: 0.05,
    x: index % 2 === 0 ? -34 : 34,
    y: 30,
    blur: 9,
    scale: 0.88,
  });
  const tilt = useTilt({ ref: reveal.ref, max: 7, perspective: 700 });

  return (
    <motion.div
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
      className="group relative flex min-w-[13rem] flex-col gap-5 rounded-3xl border border-border bg-card p-6 text-left transition-[border-color,box-shadow] duration-700 ease-out-expo hover:border-[rgba(179,71,255,0.55)] hover:shadow-glow sm:min-w-[15rem] sm:p-7"
    >
      {/* Przycinanie na dziecku — na karcie spłaszczyłoby `preserve-3d`. */}
      <span
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
        aria-hidden="true"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(179,71,255,0.22)] to-transparent transition-transform duration-1000 ease-out-expo group-hover:translate-x-full" />
      </span>

      <span
        className="relative flex items-center justify-between gap-4"
        style={tilt.enabled ? { transform: 'translateZ(26px)' } : undefined}
      >
        <span className="grid size-9 place-items-center rounded-full border border-border font-sans text-[0.625rem] tabular-nums text-neon-violet transition-colors duration-700 group-hover:bg-[rgba(179,71,255,0.12)]">
          {pad(index + 1)}
        </span>
        <AudioLines
          className="size-5 text-[rgba(199,179,230,0.3)] transition-colors duration-700 group-hover:text-neon-pink"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>

      <span
        className="relative font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl"
        style={tilt.enabled ? { transform: 'translateZ(18px)' } : undefined}
      >
        {artist.name}
      </span>

      <span
        className="relative h-px w-full bg-border transition-colors duration-700 group-hover:bg-[rgba(179,71,255,0.5)]"
        aria-hidden="true"
      />
    </motion.div>
  );
}

/**
 * Współprace: siatka nazwisk plus dwa przeciwbieżne pasy w tle.
 * Pasy są dekoracją (`aria-hidden` po stronie `Marquee`), listę
 * czyta się z kafelków.
 */
export function Collaboration() {
  const names = artists.map((artist) => artist.name);

  return (
    <section
      id="wspolpraca"
      className="relative scroll-mt-28 overflow-hidden py-section"
      aria-labelledby="wspolpraca-title"
    >
      {/* Tło: przeciwbieżne pasy nazwisk */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-6 opacity-[0.06]">
        <Marquee items={names} duration={52} separator="·" />
        <Marquee items={names} duration={64} reverse separator="·" />
      </div>

      <div className="shell relative flex flex-col gap-16">
        <SectionHeading
          index="04"
          titleId="wspolpraca-title"
          eyebrow={collaborationIntro.eyebrow}
          title={collaborationIntro.title}
          description={collaborationIntro.description}
          align="center"
          className="mx-auto max-w-3xl"
        />

        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {artists.map((artist, index) => (
            <ArtistTag key={artist.id} artist={artist} index={index} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
