'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Headphones, Play, VolumeX } from 'lucide-react';

import { useAudio } from '@/components/providers/audio-provider';
import { brand, intro, site } from '@/content/content';
import { EASE_IN_OUT_EXPO, EASE_OUT_EXPO } from '@/lib/animations';
import { startScroll, stopScroll } from '@/lib/lenis';
import {
  getMediaProgress,
  getServerMediaProgress,
  subscribeMediaProgress,
} from '@/lib/media-progress';
import { cn } from '@/lib/utils';

/**
 * Ekran powitalny „załóż słuchawki".
 *
 * Pełni trzy role naraz:
 *
 * 1. Jest gestem użytkownika, którego przeglądarka wymaga, żeby wolno
 *    było odtworzyć dźwięk i zbudować AudioContext.
 * 2. Przytrzymuje wejście, dopóki wideo hero nie znajdzie się w buforze —
 *    bez tego na wolnym łączu strona wchodzi w scroll z niedociągniętym
 *    materiałem i przewijanie klatek szarpie.
 * 3. Daje wyjście awaryjne, gdy wczytywanie się przeciąga. Nikt nie może
 *    zostać uwięziony na ekranie ładowania.
 */
export function IntroGate() {
  const { enter, hasEntered } = useAudio();
  const [visible, setVisible] = useState(true);
  const [bypassVisible, setBypassVisible] = useState(false);

  const { progress, ready } = useSyncExternalStore(
    subscribeMediaProgress,
    getMediaProgress,
    getServerMediaProgress
  );

  const percent = Math.round(progress * 100);
  const unlocked = ready || bypassVisible;

  useEffect(() => {
    if (!visible) return;

    stopScroll();
    document.body.style.overflow = 'hidden';

    return () => {
      startScroll();
      document.body.style.overflow = '';
    };
  }, [visible]);

  /* Wyjście awaryjne po czasie — na wypadek bardzo wolnego łącza. */
  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(
      () => setBypassVisible(true),
      intro.bypassAfterSeconds * 1000
    );
    return () => window.clearTimeout(timer);
  }, [ready]);

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
            {/*
              Logotyp jest tu największym elementem, więc to on wyznacza LCP.
              `priority` sprawia, że idzie w pierwszej fali zapytań.
            */}
            <Image
              src={brand.logo}
              alt={site.name}
              width={brand.logoWidth}
              height={brand.logoHeight}
              priority
              fetchPriority="high"
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
            className="relative flex w-full max-w-md flex-col items-center gap-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.4 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleEnter(true)}
                disabled={!unlocked}
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-primary px-9 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-all duration-500 ease-out-expo enabled:hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                {intro.button}
              </button>

              <button
                type="button"
                onClick={() => handleEnter(false)}
                disabled={!unlocked}
                className="inline-flex h-14 items-center gap-3 rounded-full border border-border px-7 text-sm text-muted-foreground transition-colors duration-500 enabled:hover:bg-hover enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <VolumeX className="size-4" aria-hidden="true" />
                {intro.skip}
              </button>
            </div>

            {/* ---------- Pasek wczytywania ---------- */}
            <div
              className={cn(
                'flex w-full flex-col gap-2 transition-opacity duration-700',
                ready ? 'pointer-events-none opacity-0' : 'opacity-100'
              )}
              aria-hidden={ready}
            >
              <div className="flex items-baseline justify-between text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
                <span>{intro.loading}</span>
                <span className="font-display tabular-nums text-neon-violet">{percent}%</span>
              </div>

              <div
                className="h-px w-full overflow-hidden bg-border"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={intro.loading}
              >
                <div
                  className="h-full bg-gradient-to-r from-neon-violet to-neon-pink transition-[width] duration-300 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Po przekroczeniu progu czasu przyciski się odblokowują,
                  więc komunikat musi to wytłumaczyć. */}
              <p className="text-xs font-light text-muted-foreground">
                {bypassVisible ? intro.bypass : intro.loadingHint}
              </p>
            </div>

            <p
              className={cn(
                'max-w-sm text-xs font-light text-muted-foreground transition-opacity duration-700',
                ready ? 'opacity-100' : 'opacity-0'
              )}
            >
              {intro.note}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
