'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronUp,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { useAudio } from '@/components/providers/audio-provider';
import { EASE_OUT_EXPO } from '@/lib/animations';
import { cn, pad } from '@/lib/utils';

const BAR_COUNT = 28;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

/**
 * Wizualizator widma.
 *
 * Rysuje realne pasma z AnalyserNode. Jeśli Web Audio nie wystartowało
 * (brak gestu, brak wsparcia), rysuje spokojną falę zastępczą, żeby pasek
 * nigdy nie wyglądał na zepsuty.
 */
function Visualizer({ playing }: { playing: boolean }) {
  const { analyser } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let frame = 0;
    let time = 0;

    const draw = () => {
      const { width, height } = canvas;
      const gap = 2 * dpr;
      const barWidth = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;

      // Poniżej `lg` kontener wizualizatora jest ukryty, więc canvas ma
      // zerową szerokość — a wtedy `barWidth` schodzi poniżej zera
      // i `roundRect` rzuca wyjątkiem na ujemnym promieniu.
      if (width <= 0 || height <= 0 || barWidth <= 0) {
        frame = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (analyser && data) {
        analyser.getByteFrequencyData(data);
      }
      time += 0.05;

      for (let i = 0; i < BAR_COUNT; i += 1) {
        let level: number;

        if (analyser && data && playing) {
          // Niskie pasma dominują — logarytmiczne próbkowanie wygląda równiej.
          const bin = Math.floor((i / BAR_COUNT) ** 1.6 * data.length);
          level = data[bin] / 255;
        } else {
          level = playing ? 0.25 + Math.sin(time + i * 0.4) * 0.2 : 0.06;
        }

        const barHeight = Math.max(2 * dpr, level * height);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, 'rgba(255,45,247,0.95)');
        gradient.addColorStop(1, 'rgba(179,71,255,0.6)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [analyser, playing]);

  return <canvas ref={canvasRef} className="h-8 w-full" aria-hidden="true" />;
}

/** Dokowany na dole pasek odtwarzacza z playlistą i wizualizatorem. */
export function AudioPlayer() {
  const {
    tracks,
    current,
    index,
    isPlaying,
    hasEntered,
    volume,
    muted,
    progress,
    duration,
    toggle,
    select,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
  } = useAudio();

  const [playlistOpen, setPlaylistOpen] = useState(false);

  // Pasek pojawia się dopiero po przejściu przez ekran powitalny.
  if (!hasEntered) return null;

  return (
    <>
      <AnimatePresence>
        {playlistOpen && (
          <motion.div
            className="fixed inset-0 z-[104]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlaylistOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="no-print fixed inset-x-0 bottom-0 z-[105]"
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.4 }}
      >
        {/* --- Playlista --- */}
        <AnimatePresence>
          {playlistOpen && (
            <motion.div
              id="playlist"
              className="glass mx-auto mb-2 max-h-[52svh] w-[min(100%-1.5rem,34rem)] overflow-y-auto rounded-3xl border p-2"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              data-lenis-prevent
            >
              <ul role="listbox" aria-label="Playlista">
                {tracks.map((track, trackIndex) => {
                  const isCurrent = trackIndex === index;
                  return (
                    <li key={track.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => {
                          select(trackIndex);
                          setPlaylistOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-300',
                          isCurrent ? 'bg-hover text-foreground' : 'text-muted-foreground hover:bg-hover'
                        )}
                      >
                        <span className="font-display text-xs tabular-nums text-neon-violet">
                          {pad(trackIndex + 1)}
                        </span>
                        <span className="flex-1 truncate text-sm">{track.title}</span>
                        {isCurrent && isPlaying && (
                          <span className="flex items-end gap-0.5" aria-label="Teraz gra">
                            {[0, 1, 2].map((bar) => (
                              <span
                                key={bar}
                                className="w-0.5 animate-pulse-glow bg-neon-pink"
                                style={{ height: `${6 + bar * 4}px`, animationDelay: `${bar * 0.15}s` }}
                              />
                            ))}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Pasek --- */}
        <div className="glass border-t">
          {/* Pasek postępu na samej krawędzi */}
          <label className="sr-only" htmlFor="seek">
            Pozycja w utworze
          </label>
          <input
            id="seek"
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={progress}
            onChange={(event) => seek(Number(event.target.value))}
            className="block h-1 w-full cursor-pointer appearance-none bg-[rgba(179,71,255,0.16)] accent-neon-violet"
            style={{
              background: `linear-gradient(90deg, var(--neon-pink) 0%, var(--neon-violet) ${
                duration ? (progress / duration) * 100 : 0
              }%, rgba(179,71,255,0.16) ${duration ? (progress / duration) * 100 : 0}%)`,
            }}
          />

          <div className="mx-auto flex h-[var(--player-height)] w-full max-w-wide items-center gap-3 px-gutter sm:gap-5">
            {/* Transport */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prev}
                aria-label="Poprzedni utwór"
                className="hidden size-9 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-hover hover:text-foreground sm:grid"
              >
                <SkipBack className="size-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? 'Pauza' : 'Odtwórz'}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow-sm transition-transform duration-300 hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="size-4 fill-current" aria-hidden="true" />
                ) : (
                  <Play className="size-4 translate-x-px fill-current" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Następny utwór"
                className="hidden size-9 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-hover hover:text-foreground sm:grid"
              >
                <SkipForward className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Tytuł */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold" aria-live="polite">
                {current.title}
              </p>
              <p className="truncate text-xs font-light text-muted-foreground">
                {current.artist}
                <span className="tabular-nums"> · {formatTime(progress)} / {formatTime(duration)}</span>
              </p>
            </div>

            {/* Widmo */}
            <div className="hidden w-40 lg:block xl:w-56">
              <Visualizer playing={isPlaying} />
            </div>

            {/* Głośność */}
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'Włącz dźwięk' : 'Wycisz'}
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-hover hover:text-foreground"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="size-4" aria-hidden="true" />
                )}
              </button>
              <label className="sr-only" htmlFor="volume">
                Głośność
              </label>
              <input
                id="volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-[rgba(179,71,255,0.2)] accent-neon-violet"
              />
            </div>

            {/* Playlista */}
            <button
              type="button"
              onClick={() => setPlaylistOpen((value) => !value)}
              aria-expanded={playlistOpen}
              aria-controls="playlist"
              className="flex shrink-0 items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground transition-colors duration-300 hover:bg-hover hover:text-foreground sm:px-4"
            >
              <ListMusic className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Playlista</span>
              <ChevronUp
                className={cn(
                  'size-3.5 transition-transform duration-500 ease-out-expo',
                  playlistOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
