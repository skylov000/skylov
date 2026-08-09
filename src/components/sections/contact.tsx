'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import { AnimatedText } from '@/components/shared/animated-text';
import { Reveal, RevealGroup } from '@/components/shared/reveal';
import { TypeText } from '@/components/shared/type-text';
import { contact, socialLinks } from '@/content/content';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { Icon } from '@/lib/icons';
import { toLines } from '@/lib/utils';
import type { SocialLink } from '@/types';

/** Kafelek kanału — wjeżdża z głębi, z lekkim obrotem. */
function SocialCard({ social, index }: { social: SocialLink; index: number }) {
  const reveal = useScrollReveal<HTMLAnchorElement>({
    index,
    y: 52,
    blur: 11,
    scale: 0.92,
    rotateX: 12,
  });

  return (
    <motion.a
      ref={reveal.ref}
      style={reveal.style ? { ...reveal.style, transformPerspective: 900 } : undefined}
      href={social.href}
      target="_blank"
      rel="noreferrer noopener"
      className="surface-card group flex items-center justify-between gap-6 p-7 text-left md:p-8"
    >
      <span className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border bg-[rgba(179,71,255,0.07)] text-neon-violet transition-all duration-700 ease-out-expo group-hover:-translate-y-1 group-hover:shadow-glow-sm">
          <Icon name={social.icon} className="size-5" strokeWidth={1.5} />
        </span>
        <span className="flex flex-col">
          <span className="font-display text-base font-semibold">{social.label}</span>
          <span className="text-sm font-light text-muted-foreground">{social.handle}</span>
        </span>
      </span>

      <ArrowUpRight
        className="size-5 shrink-0 text-muted-foreground transition-all duration-700 ease-out-expo group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-neon-violet"
        aria-hidden="true"
      />
    </motion.a>
  );
}

/** Sekcja zamykająca: deklaracja i kanały social media. */
export function Contact() {
  return (
    <section
      id="kontakt"
      className="relative scroll-mt-28 py-section"
      aria-labelledby="kontakt-title"
    >
      <div className="shell flex flex-col items-center gap-14 text-center">
        <Reveal y={0} x={0} blur={6} scale={0.9}>
          <div className="flex items-center justify-center gap-4">
            <span className="eyebrow">06</span>
            <span className="h-px w-10 bg-border" aria-hidden="true" />
            <span className="eyebrow text-muted-foreground">{contact.eyebrow}</span>
          </div>
        </Reveal>

        {/* Dłuższe okno niż domyślne: to napis wielkości pół ekranu,
            więc potrzebuje więcej przewijania, żeby ruch był czytelny. */}
        <h2 id="kontakt-title" className="text-display-md font-bold uppercase text-neon">
          <AnimatedText text={toLines(contact.title)} mode="words" offset={['start end', 'start 30%']} />
        </h2>

        <p className="mx-auto max-w-prose text-body-lg font-light text-muted-foreground">
          <TypeText text={contact.description} />
        </p>

        <RevealGroup className="grid w-full gap-4 sm:grid-cols-3">
          {socialLinks.map((social, index) => (
            <SocialCard key={social.label} social={social} index={index} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
