'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Headphones, Play, VolumeX } from 'lucide-react';

import { useAudio } from '@/components/providers/audio-provider';
import { brand, intro, site } from '@/content/content';
import { EASE_IN_OUT_EXPO, EASE_OUT_EXPO } from '@/lib/animations';
import { startScroll, stopScroll } from '@/lib/lenis';

/**
 * Ekran powitalny „załóż słuchawki".
 *
 * Pełni podwójną rolę: jest zasłoną ładowania i — co ważniejsze — gestem
 * użytkownika, którego przeglądarka wymaga, żeby w ogóle wolno było
 * odtworzyć dźwięk i zbudować AudioContext.
 *
 * Drugie wyjście („bez dźwięku") jest obowiązkowe: nie każdy chce, żeby
 * strona zaczęła grać, a wejście na treść nie może zależeć od zgody na audio.
 */
export function IntroGate() {
  const { enter, hasEntered } = useAudio();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;

    stopScroll();
    document.body.style.overflow = 'hidden';

    return () => {
      startScroll();
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handleEnter = (withSound: boolean) => {
    enter(withSound);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && !hasEntered && (
        <motion.div
          className="grain fixed inset-0 z-[130] flex flex-col items-center justify-center gap-10 overflow-hidden bg-background px-gutter text-center"
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 1, ease: EASE_IN_OUT_EXPO }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
        >
          {/* Poświata w tle */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[110vmin] -translate-x-1/2 -translate-y-1/2 animate-aurora-drift rounded-full opacity-70 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(179,71,255,0.28) 0%, rgba(255,45,247,0.14) 45%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          <motion.div
            className="relative flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.15 }}
          >
            {/* Szerokość wiedzie prym — logotyp jest bardzo szeroki (5,7:1),
                więc na wąskich ekranach ograniczamy go bokiem, nie wysokością. */}
            <Image
              src={brand.logo}
              alt={site.name}
              width={brand.logoWidth}
              height={brand.logoHeight}
              priority
              sizes="(max-width: 640px) 68vw, 380px"
              className="h-auto w-[min(68vw,380px)] drop-shadow-[0_0_30px_rgba(179,71,255,0.55)]"
            />

            <span className="relative grid size-16 place-items-center rounded-full border border-border">
              <span className="absolute inset-0 animate-pulse-glow rounded-full shadow-glow" aria-hidden="true" />
              <Headphones className="size-6 text-neon-violet" aria-hidden="true" />
            </span>

            <div className="flex flex-col gap-4">
              <h1
                id="intro-title"
                className="text-display-sm font-bold uppercase tracking-tight text-neon"
              >
                {intro.title}
              </h1>
              <p className="mx-auto max-w-md text-body-lg font-light text-muted-foreground">
                {intro.body}{' '}
                <strong className="font-semibold text-foreground">{intro.emphasis}</strong>
              </p>
            </div>
          </motion.div>

          <motion.div
            className="relative flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.4 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleEnter(true)}
                autoFocus
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-primary px-9 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform duration-500 ease-out-expo hover:scale-[1.04]"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                {intro.button}
              </button>

              <button
                type="button"
                onClick={() => handleEnter(false)}
                className="inline-flex h-14 items-center gap-3 rounded-full border border-border px-7 text-sm text-muted-foreground transition-colors duration-500 hover:bg-hover hover:text-foreground"
              >
                <VolumeX className="size-4" aria-hidden="true" />
                {intro.skip}
              </button>
            </div>

            <p className="max-w-sm text-xs font-light text-muted-foreground">{intro.note}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
