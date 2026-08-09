'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';

import { useAudio } from '@/components/providers/audio-provider';
import { CtaButton } from '@/components/shared/cta-button';
import { Logo } from '@/components/shared/logo';
import { ScrollVideo, type ScrollVideoState } from '@/components/shared/scroll-video';
import { hero } from '@/content/content';
import { usePerfProfile } from '@/hooks/use-perf-profile';
import { EASE_OUT_EXPO } from '@/lib/animations';
import { scrollTo } from '@/lib/lenis';
import { clamp } from '@/lib/utils';

/**
 * Fazy hero podane są w treści jako liczba ekranów przewijania, a nie
 * jako ułamek całości — tutaj przeliczamy je na postęp 0–1.
 *
 * Dzięki temu `scrubHeightVh` spowalnia wyłącznie film: wstęp znika
 * i rozmycie schodzi zawsze po tym samym dystansie przewijania.
 */
const SCRUB_RANGE_VH = Math.max(hero.scrubHeightVh - 100, 1);
const INTRO_END = Math.min(hero.introScrollVh / SCRUB_RANGE_VH, 0.9);
const BLUR_END = Math.min(hero.blurScrollVh / SCRUB_RANGE_VH, 0.95);

/** Awaryjna długość filmu, zanim wczytają się metadane. */
const FALLBACK_DURATION = 25;

/**
 * Zamienia sekundę filmu na postęp przewijania.
 *
 * Odwraca to samo mapowanie, którego używa `ScrollVideo`: przez cały czas
 * rozmycia film stoi na zamrożonej klatce, a dopiero potem sekundy
 * rozkładają się na resztę przewijania.
 */
function progressForSecond(second: number, duration: number): number {
  const total = duration > 0 ? duration : FALLBACK_DURATION;
  const animated = Math.max(total - hero.freezeSeconds, 0.01);
  const share = clamp((second - hero.freezeSeconds) / animated, 0, 1);
  return BLUR_END + share * (1 - BLUR_END);
}

function HeroStage({ progress, duration }: ScrollVideoState) {
  const { hasEntered } = useAudio();
  const { lite } = usePerfProfile();

  // Blok wejściowy ustępuje miejsca filmowi.
  const introOpacity = useTransform(progress, [0, INTRO_END], [1, 0]);
  const introY = useTransform(progress, [0, INTRO_END], ['0%', '-14%']);
  const introBlur = useTransform(progress, [0, INTRO_END], ['blur(0px)', 'blur(12px)']);

  return (
    <div className="relative flex h-full flex-col">
      {/* ---------- Blok wejściowy ---------- */}
      <motion.div
        className="shell flex flex-1 flex-col items-center justify-center gap-9 text-center"
        // Rozmycie na wyjściu tylko tam, gdzie jest na nie budżet: blok
        // zawiera logotyp i przyciski, więc filtr obejmuje spory kawałek
        // ekranu i przelicza się przy każdej klatce przewijania. Samo
        // wygaszenie z odjazdem czyta się niemal tak samo.
        //
        // `'none'` podane jawnie, a nie pominięte — patrz komentarz
        // w `useScrollReveal`: profil znamy dopiero po hydratacji, więc
        // trzeba nadpisać to, co zdążył wpisać pierwszy render.
        style={{ opacity: introOpacity, y: introY, filter: lite ? 'none' : introBlur }}
      >
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={hasEntered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.2 }}
        >
          {hero.eyebrow}
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          // Koniec na `none`, nie `blur(0px)`: zerowe rozmycie nadal
          // przepuszcza warstwę przez potok filtrów i każe ją rastrować
          // przez resztę wizyty. Zdjęcie filtra oddaje logotyp wprost
          // kompozytorowi — i przy okazji wychodzi ostrzej.
          animate={hasEntered ? { opacity: 1, scale: 1, filter: 'none' } : {}}
          transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.3 }}
        >
          {/* Logotyp niesie nazwę wizualnie; <h1> niesie ją dla czytników. */}
          <h1 className="sr-only">{hero.title}</h1>
          {/*
            Logo ma proporcję 5,7:1, więc na telefonie ogranicza je
            szerokość, nie wysokość — inaczej wychodzi poza ekran.
          */}
          <Logo priority className="h-auto w-[min(74vw,340px)] sm:w-[420px] lg:w-[560px]" />
        </motion.div>

        <motion.p
          className="max-w-2xl text-body-lg font-light text-muted-foreground"
          initial={{ opacity: 0, y: 24 }}
          animate={hasEntered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.6 }}
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 24 }}
          animate={hasEntered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.75 }}
        >
          <CtaButton href={hero.primaryCta.href} label={hero.primaryCta.label} size="xl" />
          <CtaButton
            href={hero.secondaryCta.href}
            label={hero.secondaryCta.label}
            variant="outline"
            size="xl"
            external={hero.secondaryCta.external}
          />
        </motion.div>
      </motion.div>

      {/* ---------- Hasła cue'owane na sekundy filmu ---------- */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {hero.tagline.map((cue) => (
          <TaglineLine key={cue.text} cue={cue} progress={progress} duration={duration} />
        ))}
      </div>

      {/* ---------- Wskaźnik przewijania ---------- */}
      <motion.button
        type="button"
        onClick={() => scrollTo('#o-mnie')}
        className="group absolute inset-x-0 bottom-8 mx-auto flex w-fit flex-col items-center gap-3"
        style={{ opacity: introOpacity }}
        initial={{ opacity: 0 }}
        animate={hasEntered ? { opacity: 1 } : {}}
        transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 1 }}
        aria-label={`${hero.scrollLabel} — przejdź do sekcji o mnie`}
      >
        <span className="eyebrow transition-colors duration-500 group-hover:text-foreground">
          {hero.scrollLabel}
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-border">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-hint bg-neon-violet" />
        </span>
      </motion.button>
    </div>
  );
}

/**
 * Pojedyncze hasło. Wjeżdża, stoi i wyjeżdża — wszystko wyznaczone
 * sekundami filmu z pliku treści, więc trafia zawsze w ten sam kadr.
 */
function TaglineLine({
  cue,
  progress,
  duration,
}: {
  cue: (typeof hero.tagline)[number];
  progress: MotionValue<number>;
  duration: number;
}) {
  const from = progressForSecond(cue.fromSecond, duration);
  const to = progressForSecond(cue.toSecond, duration);
  // Wejście i wyjście zajmują po 26% okna, reszta to postój.
  const ease = (to - from) * 0.26;

  const range = [from, from + ease, to - ease, to];
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, ['42%', '0%', '0%', '-42%']);

  const { lite } = usePerfProfile();

  /*
   * Rozmycie wejścia/wyjścia i cień jadą jedną własnością `filter`.
   *
   * Cień musi być `drop-shadow`, a nie `text-shadow`: przy
   * `background-clip: text` gradient jest tłem elementu, a text-shadow
   * maluje się już po nim — czarna plama wychodziła w środku liter.
   * `drop-shadow` operuje na gotowym renderze, więc otacza glify.
   *
   * W trybie oszczędnym zostaje sam cień pod czytelność, i to stały.
   * Animowany `blur` na napisie wielkości pół ekranu każe przeliczać
   * splot w każdej klatce przewijania — a leży on jeszcze na rozmytym
   * wideo, więc telefon liczy dwa pełnoekranowe rozmycia naraz.
   */
  const blurPx = useTransform(progress, range, [16, 0, 0, 16]);
  const animatedFilter = useTransform(
    blurPx,
    (value) =>
      `blur(${value.toFixed(2)}px) drop-shadow(0 4px 16px rgba(0,0,0,0.9)) drop-shadow(0 0 44px rgba(179,71,255,0.55))`
  );
  const filter = lite ? 'drop-shadow(0 3px 12px rgba(0,0,0,0.92))' : animatedFilter;

  return (
    <motion.span
      // `max-w` + `text-balance`: hasła są teraz dłuższe („Zobacz moje
      // prace"), więc na wąskich ekranach muszą się ładnie łamać,
      // a nie wyjeżdżać poza kadr.
      className="text-neon absolute max-w-[min(92vw,60rem)] text-balance px-gutter text-center font-display text-display-md font-bold uppercase leading-[0.95]"
      style={{ opacity, y, filter }}
      aria-hidden="true"
    >
      {cue.text}
    </motion.span>
  );
}

/** Sekcja otwierająca: wideo w tle przewijane scrollem. */
export function Hero() {
  return (
    <section id="hero" aria-label="Wprowadzenie">
      <ScrollVideo
        src={hero.video}
        srcMobile={hero.videoMobile}
        poster={hero.poster}
        posterMobile={hero.posterMobile}
        heightVh={hero.scrubHeightVh}
        mediaScale={hero.mediaScale}
        blurStart={hero.blurStart}
        blurEndProgress={BLUR_END}
        freezeSeconds={hero.freezeSeconds}
        overlayFadeTo={hero.overlayFadeTo}
        outroFadeFrom={hero.outroFadeFrom}
        overlay={
          <>
            {/* Przyciemnienie pod typografię */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-[rgba(5,0,13,0.72)] via-[rgba(5,0,13,0.55)] to-[rgba(5,0,13,0.96)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 70% at 50% 45%, transparent 20%, rgba(5,0,13,0.75) 100%)',
              }}
              aria-hidden="true"
            />
            {/* Neonowy refleks — delikatny, bo materiał ma już własny fiolet */}
            <div
              className="absolute inset-0 mix-blend-soft-light"
              style={{
                background:
                  'linear-gradient(135deg, rgba(179,71,255,0.18) 0%, transparent 50%, rgba(45,159,255,0.14) 100%)',
              }}
              aria-hidden="true"
            />
          </>
        }
      >
        {(state) => <HeroStage {...state} />}
      </ScrollVideo>
    </section>
  );
}
