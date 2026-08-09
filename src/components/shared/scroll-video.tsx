'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';

import { usePerfProfile } from '@/hooks/use-perf-profile';
import { primeHeroVideo, registerHeroVideo } from '@/lib/hero-video';
import {
  getMediaProgress,
  getServerMediaProgress,
  markMediaReady,
  setMediaProgress,
  subscribeMediaProgress,
} from '@/lib/media-progress';
import { cn, prefersReducedMotion } from '@/lib/utils';

/**
 * Górna granica rozmycia startowego w trybie oszczędnym.
 *
 * `blur()` na wideo w pełnym ekranie jest z całej strony najdroższym
 * pojedynczym efektem: przeglądarka musi rozmyć każdą wyświetloną klatkę
 * z osobna, a koszt splotu rośnie z promieniem. Przy 34 px na materiale
 * 1080p iPhone nie wyrabia się w budżecie klatki i zaczyna gubić ich
 * całe serie. 12 px czyta się w hero praktycznie tak samo, a mieści się
 * w budżecie z zapasem.
 */
const LITE_MAX_BLUR = 12;

/** Wysokość strefy przewijania, gdy wideo w ogóle nie leci. */
const STATIC_HEIGHT_VH = 250;

export interface ScrollVideoState {
  /** Postęp przewijania sekcji, 0–1. */
  progress: MotionValue<number>;
  /** Długość filmu w sekundach. 0 dopóki nie wczytają się metadane. */
  duration: number;
}

interface ScrollVideoProps {
  src: string;
  /** Lekki wariant materiału dla telefonów i słabszego sprzętu. */
  srcMobile?: string;
  /** Klatka pokazywana zanim wideo się zdekoduje. */
  poster?: string;
  /** Plakat w rozmiarze telefonu. */
  posterMobile?: string;
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
  srcMobile,
  poster,
  posterMobile,
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

  const perf = usePerfProfile();

  /**
   * Wybór materiału. `off` znaczy: nie pobieraj ani bajta wideo —
   * zostaje sam plakat. Wchodzi przy oszczędzaniu danych, na łączu 2G
   * i przy `prefers-reduced-motion`.
   */
  const staticMode = perf.video === 'off';
  const activeSrc = perf.video === 'mobile' && srcMobile ? srcMobile : src;
  const activePoster = (perf.lite && posterMobile) || poster;

  /** Rozmycie startowe przycięte do budżetu klatki na słabszym sprzęcie. */
  const effectiveBlur = perf.lite ? Math.min(blurStart, LITE_MAX_BLUR) : blurStart;

  const [duration, setDuration] = useState(0);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  /** Adres Blob z pobranym materiałem — dopóki null, wideo nie ma źródła. */
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  /** Awaryjne odtwarzanie prosto z sieci (oszczędzanie danych albo błąd). */
  const [directSrc, setDirectSrc] = useState(false);

  /** Czy materiał jest już gotowy — decyduje o doklejeniu plakatu. */
  const { ready } = useSyncExternalStore(
    subscribeMediaProgress,
    getMediaProgress,
    getServerMediaProgress
  );

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  /**
   * Pobranie materiału własnymi siłami.
   *
   * Element `<video preload="auto">` **nie** ściąga całego pliku: po
   * zbuforowaniu ułamka sekundy przechodzi w `networkState: IDLE`,
   * uznając, że ma dość danych do odtwarzania. Dla zwykłego odtwarzania
   * to rozsądne, ale my przewijamy klatki — każdy skok poza bufor to
   * wtedy osobne zapytanie zakresowe i właśnie stąd szarpanie na wolnym
   * łączu.
   *
   * Dlatego czytamy plik strumieniem: mamy uczciwy postęp w bajtach,
   * a gotowy materiał podajemy jako Blob, czyli z pamięci — przewijanie
   * nie dotyka już sieci.
   *
   * Przy `saveData` rezygnujemy z tego: 30 MB na łączu z włączonym
   * oszczędzaniem danych byłoby nadużyciem.
   */
  useEffect(() => {
    setReduced(prefersReducedMotion());

    /*
     * Tryb statyczny nie pobiera niczego. Bramka wejściowa dostaje
     * `ready` natychmiast, więc na wolnym łączu nikt nie czeka na
     * megabajty, których i tak nie zobaczy.
     */
    /*
     * Dopóki nie wiemy, na czym strona faktycznie działa, nie ruszamy
     * sieci. Pierwszy przebieg po hydratacji ma jeszcze migawkę serwerową
     * („pełne możliwości"), a pobranie zaczęte na jej podstawie byłoby
     * zwyczajnie nie tym plikiem.
     */
    if (!perf.resolved) return;

    if (staticMode) {
      markMediaReady();
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;

    (async () => {
      try {
        const response = await fetch(activeSrc, { signal: controller.signal });
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        const total = Number(response.headers.get('content-length')) || 0;
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total > 0) {
            setMediaProgress({ progress: Math.min(received / total, 0.999) });
          }
        }

        const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        markMediaReady();
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        // Nie blokuj wejścia, gdy pobranie padnie — wideo poleci wtedy
        // prosto z sieci, w trybie dociągania na żądanie.
        setDirectSrc(true);
        markMediaReady();
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeSrc, staticMode, perf.resolved]);

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
  const blur = useTransform(scrollYProgress, [0, blurEndProgress], [effectiveBlur, 0], {
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
    [mediaScale * (effectiveBlur > 0 ? 1 + BLUR_OVERSCAN : 1), mediaScale],
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

  /**
   * Czas trwania znamy dopiero po metadanych.
   *
   * Zależność od źródła jest tu istotna: element dostaje `src` dopiero
   * po pobraniu materiału, więc efekt zamontowany raz, przy pustym wideo,
   * przegapiłby zdarzenie. Ponowne uruchomienie po zmianie źródła sprawia,
   * że stan czasu trwania zawsze się ustawi — a bez niego pętla
   * przewijania klatek w ogóle nie startuje.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
    };

    if (video.readyState >= 1) onMeta();
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('durationchange', onMeta);

    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('durationchange', onMeta);
    };
  }, [blobUrl, directSrc]);

  /*
   * Kiedy pętla ma prawo chodzić.
   *
   * Dwa warunki, oba konieczne:
   *
   * 1. Hero jest w okolicy ekranu (IntersectionObserver).
   * 2. Karta jest widoczna (`visibilitychange`).
   *
   * Drugi warunek nie jest teoretyczny. Na stronie gra muzyka, więc karta
   * pozostaje „aktywna" nawet po przełączeniu na inną — a wtedy pętla
   * przewijania klatek i dekoder wideo dalej pracowały w tle. To jest
   * dokładnie ten scenariusz, w którym telefon robi się gorący i mulisty,
   * choć strony nie widać.
   */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let onScreen = true;
    const sync = () => setActive(onScreen && document.visibilityState === 'visible');

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: '10% 0px' }
    );
    observer.observe(wrapper);
    document.addEventListener('visibilitychange', sync);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  /* Udostępnij element, żeby ekran powitalny mógł go rozgrzać przy kliknięciu. */
  useEffect(() => {
    registerHeroVideo(videoRef.current);
    return () => registerHeroVideo(null);
  }, []);

  /*
   * Rozgrzewanie wideo na iOS.
   *
   * Nasłuch **nie** jest jednorazowy i nie odpina się po pierwszej próbie:
   * dopóki materiał nie ma źródła, `play()` odrzuca obietnicę i gest
   * przepada. Poprzednia wersja rejestrowała `once: true`, przez co
   * na telefonie wideo nigdy nie zostawało zdekodowane — przewijanie
   * dawało czarny ekran zamiast klatek.
   */
  useEffect(() => {
    if (staticMode || (!blobUrl && !directSrc)) return;

    const attempt = () => {
      void primeHeroVideo().then((ok) => {
        if (!ok) return;
        window.removeEventListener('pointerdown', attempt);
        window.removeEventListener('touchstart', attempt);
      });
    };

    attempt(); // gest mógł już paść na ekranie powitalnym
    window.addEventListener('pointerdown', attempt);
    window.addEventListener('touchstart', attempt);

    return () => {
      window.removeEventListener('pointerdown', attempt);
      window.removeEventListener('touchstart', attempt);
    };
  }, [blobUrl, directSrc, staticMode]);

  /* Pętla dociągająca klatkę do celu. */
  useEffect(() => {
    if (reduced || staticMode || duration <= 0 || !active) return;

    let frame = 0;
    /*
     * Minimalny odstęp między przewinięciami, w milisekundach.
     *
     * Każde ustawienie `currentTime` to zlecenie dla dekodera. Przy 60
     * klatkach na sekundę zlecamy je szybciej, niż telefon jest w stanie
     * je obsłużyć — kolejka rośnie, a razem z nią opóźnienie i zużycie
     * prądu. 24 przewinięcia na sekundę wystarczają, żeby ruch był
     * płynny dla oka, i mieszczą się w możliwościach dekodera.
     */
    const minSeekInterval = perf.lite ? 1000 / 24 : 0;
    let lastSeek = 0;

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

    const tick = (now: number) => {
      const video = videoRef.current;
      // `readyState < 2` znaczy, że nie ma nawet bieżącej klatki —
      // przewijanie w tym stanie tylko dokłada dekoderowi pracy.
      if (video && video.readyState >= 2 && now - lastSeek >= minSeekInterval) {
        const target = timeFor(targetRef.current);
        const diff = target - video.currentTime;

        // Zbyt małe skoki nie są warte kosztu seeka; `seeking` chroni
        // przed kolejkowaniem żądań szybciej, niż dekoder je obsłuży.
        if (Math.abs(diff) > 0.02 && !video.seeking) {
          video.currentTime += diff * 0.2;
          lastSeek = now;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, active, reduced, staticMode, perf.lite, freezeSeconds, blurEndProgress]);

  return (
    <div
      ref={wrapperRef}
      className={cn('relative', className)}
      style={{
        height: reduced
          ? '100svh'
          : // Bez filmu nie ma czego przewijać klatka po klatce, więc
            // strefa jest krótsza — hasła zdążą przelecieć, a użytkownik
            // nie brnie przez sześć ekranów nieruchomego obrazu.
            `${staticMode ? STATIC_HEIGHT_VH : heightVh}svh`,
      }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/*
          Warstwa awaryjna pod wideo.
          Gdyby przeglądarka nie zdołała zdekodować klatki (zdarza się na
          iOS przy przewijaniu bez odtwarzania), użytkownik zobaczy kadr
          zamiast czerni. W trybie statycznym to jedyna warstwa obrazu,
          więc wchodzi od razu; przy wideo — dopiero po pobraniu materiału,
          żeby nie konkurowała o łącze i nie zawyżała LCP.
        */}
        {(staticMode || ready) && activePoster && (
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${activePoster})`,
              // W trybie statycznym plakat przejmuje rolę filmu: dostaje
              // to samo rozmycie schodzące przewijaniem, więc otwarcie
              // strony czyta się tak samo, tylko bez dekodera wideo.
              ...(staticMode && !reduced ? { scale, filter } : null),
            }}
            aria-hidden="true"
          />
        )}

        {!staticMode && (
          <motion.video
            ref={videoRef}
            // Bez `will-change`: stała warstwa kompozycyjna na wideo w pełnym
            // ekranie zjada pamięć i potrafi ustalić raster na niższej
            // rozdzielczości. Rozmycie i tak jest przyspieszane sprzętowo.
            className="absolute inset-0 size-full object-cover"
            style={reduced ? { transform: `scale(${mediaScale})` } : { scale, filter }}
            // Źródło pojawia się dopiero po pobraniu materiału do pamięci.
            // Dzięki temu element nie generuje własnych zapytań zakresowych
            // równolegle do naszego strumienia.
            src={blobUrl ?? (directSrc ? activeSrc : undefined)}
            // Plakat dokładamy dopiero, gdy materiał jest gotowy. Wcześniej
            // ekran powitalny i tak go zasłania, a pełnoekranowy obraz
            // wczytany na starcie stawał się elementem LCP — mierzonym
            // wtedy, gdy dociągnie się przez zapchane łącze (30 s na 4G).
            poster={ready && activePoster ? activePoster : undefined}
            muted
            playsInline
            // Materiał jest dekoracją bez dźwięku — nie ma czego rzucać
            // na telewizor. Bez tego iOS dokłada do warstwy wideo własne
            // sterowanie AirPlay i trzyma je aktywne przez całą sesję.
            disableRemotePlayback
            disablePictureInPicture
            preload="auto"
            // Bez pętli i bez autoplay — klatkę wyznacza scroll, nie zegar.
            aria-hidden="true"
            tabIndex={-1}
          />
        )}

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
