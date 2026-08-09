'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Youtube as YoutubeIcon } from 'lucide-react';

import { CtaButton } from '@/components/shared/cta-button';
import { Reveal, RevealGroup } from '@/components/shared/reveal';
import { youtube } from '@/content/content';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import type { LatestVideo } from '@/lib/youtube';

/** Pojedynczy znacznik gatunku — kaskada w poziomie. */
function StyleTag({ tag, index }: { tag: string; index: number }) {
  const reveal = useScrollReveal({ index, stagger: 0.04, y: 18, blur: 6, scale: 0.86 });

  return (
    <motion.span
      ref={reveal.ref}
      style={reveal.style}
      className="rounded-full border border-border px-4 py-2 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-500 hover:border-[rgba(179,71,255,0.5)] hover:text-foreground"
    >
      {tag}
    </motion.span>
  );
}

/**
 * Kafelek najnowszego filmu.
 *
 * Zamiast osadzać odtwarzacz pokazujemy miniaturę linkującą do YouTube:
 * iframe dociąga kilkaset kilobajtów skryptów i ustawia ciasteczka
 * jeszcze zanim ktokolwiek kliknie „play".
 */
function LatestVideoTile({ video, publishedLabel }: { video: LatestVideo; publishedLabel: string }) {
  const reveal = useScrollReveal<HTMLAnchorElement>({ y: 56, blur: 12, scale: 0.94 });

  return (
    <motion.a
      ref={reveal.ref}
      style={reveal.style}
      href={video.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group/video flex flex-col gap-4 rounded-3xl border border-border bg-[rgba(5,0,13,0.5)] p-4 transition-all duration-700 ease-out-expo hover:border-[rgba(179,71,255,0.5)] hover:shadow-glow-sm"
    >
      <span className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-card">
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-cover transition-transform duration-1000 ease-out-expo group-hover/video:scale-[1.06]"
        />

        <span className="absolute inset-0 bg-[rgba(5,0,13,0.35)] transition-opacity duration-700 group-hover/video:opacity-0" />

        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full bg-[#ff003c] shadow-[0_0_30px_rgba(255,0,60,0.55)] transition-transform duration-700 ease-out-expo group-hover/video:scale-110">
            <Play className="size-6 translate-x-px fill-white text-white" aria-hidden="true" />
          </span>
        </span>
      </span>

      <span className="flex flex-col gap-1.5 px-1 pb-1">
        <span className="eyebrow">{youtube.latestLabel}</span>
        <span className="line-clamp-2 font-display text-base font-semibold leading-snug transition-colors duration-500 group-hover/video:text-neon-violet">
          {video.title}
        </span>
        {publishedLabel && (
          <span className="text-xs font-light text-muted-foreground">{publishedLabel}</span>
        )}
      </span>
    </motion.a>
  );
}

interface YoutubeCardProps {
  latest: LatestVideo | null;
  publishedLabel: string;
}

/** Karta kanału: opis po lewej, najnowszy film po prawej. */
export function YoutubeCard({ latest, publishedLabel }: YoutubeCardProps) {
  return (
    <Reveal y={64} blur={14} scale={0.95}>
      <article className="surface-card group relative overflow-hidden p-8 md:p-12 lg:p-14">
        {/*
          Czerwona poświata YouTube, ledwo widoczna, budzi się przy hoverze.

          Miękkość niesie sam gradient — tak samo jak w tle strony
          (`NeonField`). Wcześniej było to `blur(100px)` na kole o boku
          576 px, czyli splot na ponad 300 tysiącach pikseli, żeby
          rozmyć coś, co i tak jest rozmyte z definicji.
        */}
        <div
          className="pointer-events-none absolute -right-[10%] -top-[40%] size-[36rem] rounded-full opacity-40 transition-opacity duration-1000 group-hover:opacity-70"
          style={{
            background:
              'radial-gradient(circle closest-side, rgba(255,0,60,0.26) 0%, rgba(224,26,140,0.17) 32%, rgba(179,71,255,0.08) 58%, rgba(179,71,255,0.02) 80%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div
          className={
            latest
              ? 'relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-14'
              : 'relative grid gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16'
          }
        >
          <div className="flex flex-col gap-7">
            <Reveal x={-40} y={0} blur={10}>
              <span className="grid size-20 place-items-center rounded-3xl border border-border bg-[rgba(255,0,60,0.08)] transition-transform duration-1000 ease-out-expo group-hover:scale-105 md:size-24">
                <YoutubeIcon
                  className="size-10 text-[#ff003c] md:size-12"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              </span>
            </Reveal>

            <Reveal index={1} y={30} blur={8} className="flex flex-col gap-3">
              <h3 className="text-heading-md font-bold">{youtube.cardTitle}</h3>
              <span className="font-display text-sm text-neon-violet">
                {youtube.channelHandle}
              </span>
            </Reveal>

            <Reveal index={2} y={28} blur={8}>
              <p className="max-w-prose text-body-lg font-light leading-relaxed text-muted-foreground">
                {youtube.description}
              </p>
            </Reveal>

            <RevealGroup className="flex flex-wrap gap-2">
              {youtube.styleTags.map((tag, index) => (
                <StyleTag key={tag} tag={tag} index={index} />
              ))}
            </RevealGroup>

            <Reveal index={3} y={24} blur={6} className="pt-2">
              <CtaButton
                href={youtube.cta.href}
                label={youtube.cta.label}
                external={youtube.cta.external}
                size="lg"
              />
            </Reveal>
          </div>

          {latest && (
            <div className="lg:self-center">
              <LatestVideoTile video={latest} publishedLabel={publishedLabel} />
            </div>
          )}
        </div>
      </article>
    </Reveal>
  );
}
