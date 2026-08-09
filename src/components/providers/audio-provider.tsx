'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { player, tracks } from '@/content/content';
import type { Track } from '@/types';

const DEFAULT_VOLUME = player.defaultVolume;
// Wersja w kluczu: po zmianie domyślnej głośności w treści nikt nie zostaje
// z zapisaną starą wartością z poprzedniej wizyty.
const VOLUME_KEY = 'skylov:volume:v2';

interface AudioContextValue {
  tracks: Track[];
  current: Track;
  index: number;
  isPlaying: boolean;
  /** Ekran powitalny zniknął — strona jest odsłonięta. */
  hasEntered: boolean;
  volume: number;
  muted: boolean;
  progress: number;
  duration: number;
  /** Analyser Web Audio — null dopóki nie padnie gest użytkownika. */
  analyser: AnalyserNode | null;
  enter: (withSound: boolean) => void;
  toggle: () => void;
  select: (index: number) => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

const AudioPlayerContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudio must be used within <AudioProvider>');
  return context;
}

/**
 * Jedno źródło prawdy dla dźwięku na stronie.
 *
 * Element `<audio>` powstaje imperatywnie (nie w JSX), więc nie ma go
 * w markupie SSR — dzięki temu losowanie startowego utworu nie powoduje
 * niezgodności hydratacji.
 *
 * AudioContext tworzymy dopiero przy pierwszym geście użytkownika, bo
 * przeglądarki blokują go wcześniej. Bez niego wizualizator po prostu
 * nie rusza, a odtwarzanie działa normalnie.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  /**
   * Bramka dźwięku. Dopóki jest `false`, nic nie ma prawa zagrać —
   * ani zmiana utworu, ani koniec poprzedniego. Przestawia ją wyłącznie
   * przycisk „Wejdź na stronę" albo świadome kliknięcie play.
   *
   * To ref, nie state: sprawdzają ją callbacki, które nie mogą czekać
   * na kolejny render.
   */
  const soundEnabledRef = useRef(false);
  /** Czy pauzę wymusiło przełączenie karty (a nie sam użytkownik). */
  const autoPausedRef = useRef(false);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  /* --- utworzenie elementu audio + losowanie pierwszego utworu --- */
  useEffect(() => {
    const audio = new Audio();
    /*
     * `none`, nie `metadata`.
     *
     * Przy `metadata` przeglądarka sięga po plik już przy pierwszym
     * renderze i kilka megabajtów audio konkuruje o łącze z wideo hero
     * oraz zasobami krytycznymi. Na wolnym mobilnym łączu to właśnie
     * wypychało LCP w okolice 30 s. Pobranie rusza dopiero przy play().
     */
    audio.preload = 'none';
    audio.loop = false;
    audioRef.current = audio;

    const stored = Number(window.localStorage.getItem(VOLUME_KEY));
    const startVolume = Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_VOLUME;
    audio.volume = startVolume;
    setVolumeState(startVolume);

    // Jak w oryginale: przy każdym wejściu leci inny utwór.
    const startIndex = Math.floor(Math.random() * tracks.length);
    setIndex(startIndex);
    audio.src = tracks[startIndex].src;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  /* --- podpięcie zdarzeń odtwarzacza --- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => setIndex((value) => (value + 1) % tracks.length);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  /**
   * Pauza, gdy karta przestaje być widoczna — i powrót po jej odsłonięciu.
   *
   * Scenariusz: ktoś klika najnowszy film, YouTube otwiera się w nowej
   * karcie i dwie ścieżki grają naraz. Zatrzymujemy odtwarzanie zamiast
   * wyciszać, żeby po powrocie utwór podjął dokładnie od tego miejsca.
   *
   * Flaga `autoPausedRef` pilnuje, żeby nie wznawiać czegoś, co
   * użytkownik zatrzymał sam przed przełączeniem karty.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (!audio.paused) {
          autoPausedRef.current = true;
          audio.pause();
        }
        return;
      }

      if (autoPausedRef.current) {
        autoPausedRef.current = false;
        audio.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  /**
   * Analyser da się zbudować tylko raz na element i tylko po geście
   * użytkownika. Cicha porażka jest w porządku — wtedy wizualizator
   * przechodzi w tryb zastępczy.
   */
  const ensureAnalyser = useCallback(() => {
    if (ctxRef.current || !audioRef.current) return;

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    try {
      const ctx = new Ctor();
      const source = ctx.createMediaElementSource(audioRef.current);
      const node = ctx.createAnalyser();
      node.fftSize = 128;
      node.smoothingTimeConstant = 0.78;
      source.connect(node);
      node.connect(ctx.destination);
      ctxRef.current = ctx;
      setAnalyser(node);
    } catch {
      // Brak Web Audio — odtwarzanie i tak działa.
    }
  }, []);

  /* --- zmiana utworu --- */
  const applyTrack = useCallback((nextIndex: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[nextIndex].src;
    setProgress(0);
    // Autoodtwarzanie tylko za bramką dźwięku.
    if (soundEnabledRef.current) audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Utwór z pierwszego renderu jest już podpięty przy tworzeniu elementu.
    // Bez tego porównania podwójne wywołanie efektów w trybie StrictMode
    // przeładowywałoby ścieżkę (a wcześniej: puszczało ją przed bramką).
    if (audio.getAttribute('src') === tracks[index].src) return;

    applyTrack(index);
  }, [index, applyTrack]);

  /* --- API --- */
  const enter = useCallback(
    (withSound: boolean) => {
      setHasEntered(true);

      // „Wejdź bez dźwięku" znaczy dokładnie tyle: bramka zostaje
      // zamknięta i nic nie zagra, dopóki użytkownik sam nie wciśnie play.
      if (!withSound) return;

      soundEnabledRef.current = true;
      ensureAnalyser();
      ctxRef.current?.resume().catch(() => {});
      audioRef.current?.play().catch(() => {});
    },
    [ensureAnalyser]
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      // Świadome kliknięcie play też otwiera bramkę.
      soundEnabledRef.current = true;
      ensureAnalyser();
      ctxRef.current?.resume().catch(() => {});
      audio.play().catch(() => {});
    } else {
      // Świadoma pauza użytkownika kasuje pamięć o automatycznej —
      // po powrocie do karty nic nie ruszy bez jego zgody.
      autoPausedRef.current = false;
      audio.pause();
    }
  }, [ensureAnalyser]);

  /**
   * Wybór utworu i przyciski przewijania to świadome działanie
   * użytkownika, więc też otwierają bramkę dźwięku.
   */
  const openGate = useCallback(() => {
    soundEnabledRef.current = true;
    ensureAnalyser();
    ctxRef.current?.resume().catch(() => {});
  }, [ensureAnalyser]);

  const select = useCallback(
    (nextIndex: number) => {
      openGate();
      // Kliknięcie w utwór, który już jest wybrany, nie zmieni indeksu —
      // wtedy odtwarzamy wprost.
      if (nextIndex === index) {
        audioRef.current?.play().catch(() => {});
        return;
      }
      setIndex(nextIndex);
    },
    [openGate, index]
  );

  const next = useCallback(() => {
    openGate();
    setIndex((value) => (value + 1) % tracks.length);
  }, [openGate]);

  const prev = useCallback(() => {
    openGate();
    setIndex((value) => (value - 1 + tracks.length) % tracks.length);
  }, [openGate]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(seconds, 0), audio.duration);
    setProgress(audio.currentTime);
  }, []);

  const setVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    audio.muted = value === 0;
    setVolumeState(value);
    setMuted(value === 0);
    window.localStorage.setItem(VOLUME_KEY, String(value));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);
  }, []);

  const value = useMemo<AudioContextValue>(
    () => ({
      tracks,
      current: tracks[index],
      index,
      isPlaying,
      hasEntered,
      volume,
      muted,
      progress,
      duration,
      analyser,
      enter,
      toggle,
      select,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
    }),
    [
      index,
      isPlaying,
      hasEntered,
      volume,
      muted,
      progress,
      duration,
      analyser,
      enter,
      toggle,
      select,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
    ]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}
