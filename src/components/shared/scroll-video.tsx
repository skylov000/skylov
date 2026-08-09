'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';

import { cn, prefersReducedMotion } from '@/lib/utils';

export interface ScrollVideoState {
  /** Postęp przewijania sekcji, 0–1. */
  progress: MotionValue<number>;
  /** Długość filmu w sekundach. 0 dopóki nie wczytają się metadane. */
  duration: number;
}

interface ScrollVideoProps {
  src: string;
  /** Klatka pokazywana zanim wideo się zdekoduje. */
  poster?: string;
  /** Wysokość strefy przewijania w jednostkach ekranu (100 = jeden ekran). */
  heightVh?: number;
  /**
   * Treść nałożona na wideo — dostaje pełną wysokość przyklejonej sceny.
   * Jako funkcja otrzymuje postęp przewijania i długość filmu, dzięki
   * czemu warstwa tekstowa może być cue'owana w sekundach materiału.
   */
  children?: ReactNode | ((state: ScrollVideoState) => ReactNode);
  className?: string;
  /** Nakładki przyciemniające pod treścią. */
  overlay?: ReactNode;
  /** Powiększenie kadru. 1 = bez zmian, 1.75 = 175%. */
  mediaScale?: number;
  /** Rozmycie w px przy pozycji 0. */
  blurStart?: number;
  /** Postęp przewijania (0–1), przy którym rozmycie ma zniknąć. */
  blurEndProgress?: number;
  /**
   * Ile sekund na początku pliku to zamrożona klatka. Wideo stoi na niej,
   * dopóki treść hero nie zniknie i nie zejdzie rozmycie — dopiero potem
   * zaczyna się właściwa animacja.
   */
  freezeSeconds?: number;
  /**
   * Nieprzezroczystość nakładek przyciemniających, gdy obraz jest już ostry.
   * 1 = bez zmian. Niżej = po odsłonięciu filmu widać go wyraźniej.
   */
  overlayFadeTo?: number;
  /**
   * Od tego postępu (0–1) scena rozpływa się w tło strony. Dzięki temu
   * następna sekcja wyłania się z ciemności zamiast wskakiwać cięciem.
   * `1` wyłącza efekt.
   */
  outroFadeFrom?: number;
}

/**
 * Wideo, którego klatka jest sterowana pozycją scrolla.
 *
 * Scena jest `sticky` w wysokim wrapperze: przewijasz stronę, a zamiast
 * przesuwać kadr — przewijasz film. Zamiast ustawiać `currentTime` prosto
 * z eventu scrolla (co przy zwykłym mp4 daje szarpanie na klatkach
 * kluczowych), trzymamy wartość docelową i dociągamy do niej `currentTime`
 * interpolacją w pętli rAF. Stąd „równo leci".
 *
 * Pętla chodzi wyłącznie gdy sekcja jest widoczna, a przy `prefers-reduced-
 * motion` nie startuje wcale — zostaje statyczna pierwsza klatka.
 */
export function ScrollVideo({
  src,
  poster,
  heightVh = 300,
  children,
  className,
  overlay,
  mediaScale = 1,
  blurStart = 0,
  blurEndProgress = 0.3,
  freezeSeconds = 0,
  overlayFadeTo = 1,
  outroFadeFrom = 1,
}: ScrollVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** Docelowy postęp 0–1. Ref, nie state — zmienia się co klatkę. */
  const targetRef = useRef(0);

  const [duration, setDuration] = useState(0);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  /**
   * Ile wideo ściągać z góry. Na desktopie `auto` — pełny bufor daje
   * najgładsze przewijanie klatek. Na wąskich ekranach i przy włączonym
   * oszczędzaniu danych `metadata`: przeglądarka dociąga wtedy tylko te
   * zakresy bajtów, które są potrzebne do aktualnej klatki.
   */
  const [preload, setPreload] = useState<'auto' | 'metadata'>('metadata');

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    setReduced(prefersReducedMotion());

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const saveData = connection?.saveData === true;
    const narrow = window.matchMedia('(max-width: 767px)').matches;

    setPreload(saveData || narrow ? 'metadata' : 'auto');
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    targetRef.current = Math.min(Math.max(value, 0), 1);
  });

  /**
   * Rozmycie zdejmowane przewijaniem.
   *
   * Na starcie kadr jest mocno rozmyty, więc logotyp, hasło i przyciski
   * są w pełni czytelne. W miarę przewijania rozmycie schodzi do zera —
   * i wychodzi już na ostro dokładnie wtedy, gdy warstwa tekstowa
   * zdążyła zniknąć.
   *
   * Filtr jest na tym samym elemencie co powiększenie kadru: nadmiar
   * skali chowa rozmyte krawędzie, które inaczej byłyby widoczne.
   */
  const blur = useTransform(scrollYProgress, [0, blurEndProgress], [blurStart, 0], {
    clamp: true,
  });
  /**
   * Poniżej progu zwracamy `none`, a nie `blur(0px)`.
   *
   * To nie kosmetyka: `blur(0px)` nadal przepuszcza obraz przez potok
   * filtrów i każe przeglądarce rastrować warstwę. Zdjęcie filtra
   * całkowicie oddaje wideo natywnemu kompozytorowi — czyli ostrzej.
   */
  const filter = useTransform(blur, (value) =>
    value < 0.05 ? 'none' : `blur(${value.toFixed(2)}px)`
  );

  /**
   * `blur()` próbkuje też piksele spoza elementu, więc przy skali 1
   * krawędzie kadru robią się przezroczyste i prześwituje przez nie tło.
   *
   * Dokładamy więc minimalny nadmiar skali, który **zanika razem
   * z rozmyciem**: gdy obraz jest już ostry, skala wynosi dokładnie tyle,
   * ile ustawiono w treści (domyślnie 100%). Bez rozmycia (`blurStart: 0`)
   * kompensacji nie ma wcale.
   */
  const BLUR_OVERSCAN = 0.09;
  const scale = useTransform(
    scrollYProgress,
    [0, blurEndProgress],
    [mediaScale * (blurStart > 0 ? 1 + BLUR_OVERSCAN : 1), mediaScale],
    { clamp: true }
  );

  /**
   * Przyciemnienie jest potrzebne tylko wtedy, gdy na filmie leży
   * typografia. Gdy hero się rozejdzie, nakładki gasną — obraz zyskuje
   * kontrast i szczegóły, których wcześniej nie byłoby widać.
   */
  const overlayOpacity = useTransform(scrollYProgress, [0, blurEndProgress], [1, overlayFadeTo], {
    clamp: true,
  });

  /**
   * Wygaszenie na wyjściu: pod koniec sekcji scena rozpływa się w kolorze
   * tła strony, więc następna sekcja wyłania się z ciemności, zamiast
   * pojawiać się twardym cięciem po ostatniej klatce.
   */
  const outroOpacity = useTransform(scrollYProgress, [outroFadeFrom, 1], [0, 1], { clamp: true });

  /* Czas trwania znamy dopiero po metadanych. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => {
      if (Number.isFinite(video.duration)) setDuration(video.duration);
    };

    if (video.readyState >= 1) onMeta();
    video.addEventListener('loadedmetadata', onMeta);
    return () => video.removeEventListener('loadedmetadata', onMeta);
  }, []);

  /* Nie marnuj klatek, gdy hero jest poza ekranem. */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '10% 0px' }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  /*
   * iOS nie dekoduje wideo, dopóki nie padnie gest użytkownika. Jedno
   * play()/pause() przy pierwszym dotknięciu odblokowuje przewijanie klatek.
   */
  useEffect(() => {
    const prime = () => {
      const video = videoRef.current;
      if (!video) return;
      video.play().then(() => video.pause()).catch(() => {});
    };
    window.addEventListener('pointerdown', prime, { once: true });
    window.addEventListener('touchstart', prime, { once: true });
    return () => {
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('touchstart', prime);
    };
  }, []);

  /* Pętla dociągająca klatkę do celu. */
  useEffect(() => {
    if (reduced || duration <= 0 || !active) return;

    let frame = 0;

    /**
     * Mapowanie postępu przewijania na sekundę filmu.
     *
     * Bez zamrożonej klatki jest to zwykła proporcja. Z nią — wideo stoi
     * na starcie, dopóki nie zejdzie rozmycie (`blurEndProgress`),
     * a właściwa animacja rozkłada się dopiero na pozostałym przewijaniu.
     * Dzięki temu film rusza dokładnie wtedy, gdy przestaje go cokolwiek
     * zasłaniać.
     */
    const animated = Math.max(duration - freezeSeconds, 0.01);
    const timeFor = (progress: number) => {
      if (freezeSeconds <= 0) return progress * duration;
      if (progress <= blurEndProgress) return 0;
      const rest = (progress - blurEndProgress) / Math.max(1 - blurEndProgress, 0.01);
      return freezeSeconds + rest * animated;
    };

    const tick = () => {
      const video = videoRef.current;
      if (video) {
        const target = timeFor(targetRef.current);
        const diff = target - video.currentTime;

        // Zbyt małe skoki nie są warte kosztu seeka; `seeking` chroni
        // przed kolejkowaniem żądań szybciej, niż dekoder je obsłuży.
        if (Math.abs(diff) > 0.02 && !video.seeking) {
          video.currentTime += diff * 0.2;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, active, reduced, freezeSeconds, blurEndProgress]);

  return (
    <div
      ref={wrapperRef}
      className={cn('relative', className)}
      style={{ height: reduced ? '100svh' : `${heightVh}svh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.video
          ref={videoRef}
          // Bez `will-change`: stała warstwa kompozycyjna na wideo w pełnym
          // ekranie zjada pamięć i potrafi ustalić raster na niższej
          // rozdzielczości. Rozmycie i tak jest przyspieszane sprzętowo.
          className="absolute inset-0 size-full object-cover"
          style={reduced ? { transform: `scale(${mediaScale})` } : { scale, filter }}
          src={src}
          poster={poster || undefined}
          muted
          playsInline
          preload={preload}
          // Bez pętli i bez autoplay — klatkę wyznacza scroll, nie zegar.
          aria-hidden="true"
          tabIndex={-1}
        />

        {overlay && (
          <motion.div
            className="absolute inset-0"
            style={reduced ? { opacity: overlayFadeTo } : { opacity: overlayOpacity }}
            aria-hidden="true"
          >
            {overlay}
          </motion.div>
        )}

        {outroFadeFrom < 1 && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[5] bg-background"
            style={{ opacity: outroOpacity }}
            aria-hidden="true"
          />
        )}

        {children && (
          <div className="relative z-10 flex h-full flex-col">
            {typeof children === 'function'
              ? children({ progress: scrollYProgress, duration })
              : children}
          </div>
        )}
      </div>
    </div>
  );
}
