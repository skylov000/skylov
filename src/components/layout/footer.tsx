'use client';

import { ArrowUp } from 'lucide-react';

import { AnimatedText } from '@/components/shared/animated-text';
import { Logo } from '@/components/shared/logo';
import { Magnetic } from '@/components/shared/magnetic';
import { Reveal } from '@/components/shared/reveal';
import { SmartLink } from '@/components/shared/smart-link';
import { brand, footer, navLinks, socialLinks } from '@/content/content';
import type { ScrollOffset } from '@/hooks/use-scroll-reveal';
import { Icon } from '@/lib/icons';
import { scrollTo } from '@/lib/lenis';
import { toLines } from '@/lib/utils';

/**
 * Stopka stoi na samym dole dokumentu, więc jej elementy nigdy nie dojadą
 * do środka ekranu — domyślne okno odsłony zostałoby niedomknięte.
 * To okno kończy się, gdy dolna krawędź elementu dotknie dołu ekranu,
 * co jest osiągalne nawet dla ostatniego wiersza strony.
 */
const FOOTER_OFFSET: ScrollOffset = ['start end', 'end end'];

export function Footer() {
  return (
    // Odstęp od dołu robi miejsce dla zadokowanego odtwarzacza.
    <footer className="relative overflow-hidden border-t border-border pb-[var(--player-height)] pt-section">
      <div className="shell flex flex-col gap-16">
        {/* Wezwanie do kontaktu */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/*
            Świadomie BEZ `FOOTER_OFFSET`. To okno kończy się, gdy dolna
            krawędź elementu dotknie dołu ekranu — dla nagłówka na górze
            stopki to zaledwie ~130 px przewijania i animacji nie widać.
            Pod nagłówkiem jest cała reszta stopki, więc domyślne,
            dłuższe okno ma się gdzie rozwinąć.
          */}
          <h2 className="text-heading-md font-bold uppercase text-neon">
            <AnimatedText text={toLines(footer.headline)} mode="words" />
          </h2>

          <div className="flex flex-col gap-6">
            <Reveal y={30} blur={8} offset={FOOTER_OFFSET}>
              <p className="max-w-prose text-body-lg font-light text-muted-foreground">
                {footer.description}
              </p>
            </Reveal>

            <Reveal index={1} y={26} blur={6} offset={FOOTER_OFFSET}>
              <SmartLink
                href="/#kontakt"
                className="link-underline w-fit font-display text-heading-sm font-bold"
              >
                Napisz do mnie
              </SmartLink>
            </Reveal>
          </div>
        </div>

        <div className="hairline" />

        {/* Nawigacja + social */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal y={30} blur={8} offset={FOOTER_OFFSET} className="flex flex-col gap-5">
            {/* self-start: bez tego kolumnowy flex rozciągnąłby logo
                na całą szerokość i zepsuł proporcje. */}
            <Logo className="h-7 self-start" />
            <p className="max-w-[30ch] text-sm font-light leading-relaxed text-muted-foreground">
              {footer.credit}
            </p>
          </Reveal>

          <Reveal index={1} y={30} blur={8} offset={FOOTER_OFFSET} className="flex flex-col gap-5">
            <h3 className="eyebrow text-muted-foreground">Nawigacja</h3>
            <ul className="grid grid-cols-2 gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    className="link-underline text-sm font-light text-muted-foreground transition-colors duration-500 hover:text-foreground"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal index={2} y={30} blur={8} offset={FOOTER_OFFSET} className="flex flex-col gap-5">
            <h3 className="eyebrow text-muted-foreground">Social media</h3>
            <ul className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-700 ease-out-expo hover:border-[rgba(179,71,255,0.5)] hover:text-neon-violet hover:shadow-glow-sm"
                  >
                    <Icon name={social.icon} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Wielki znak wodny — kropka na końcu zdania */}
        <Reveal y={0} blur={18} scale={0.88} offset={FOOTER_OFFSET} className="pointer-events-none select-none pt-4">
          <span
            className="block text-center font-display font-bold uppercase leading-none tracking-[-0.03em] text-[rgba(179,71,255,0.09)]"
            style={{ fontSize: 'clamp(3.5rem, 18vw, 18rem)' }}
            aria-hidden="true"
          >
            {brand.wordmark}
          </span>
        </Reveal>
      </div>

      {/* Pasek dolny */}
      <div className="mt-10 border-t border-border">
        <div className="shell flex flex-col items-center justify-between gap-4 py-7 text-xs font-light text-muted-foreground sm:flex-row">
          <p>{footer.copyright}</p>

          <Magnetic strength={0.3}>
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="group flex items-center gap-2 rounded-full border border-border px-5 py-2.5 transition-all duration-500 hover:border-[rgba(179,71,255,0.5)] hover:text-foreground"
            >
              {footer.backToTop}
              <ArrowUp
                className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-1"
                aria-hidden="true"
              />
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}
