'use client';

import { Fragment } from 'react';

import { cn } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
  className?: string;
  /** Seconds for one full pass. Higher = slower. */
  duration?: number;
  reverse?: boolean;
  separator?: string;
}

/**
 * Seamless ticker. The track holds two identical copies and slides by
 * exactly -50%, so the loop point is invisible.
 *
 * Pauses on hover, and stops entirely under reduced motion (the CSS
 * override in globals.css collapses the animation duration).
 */
export function Marquee({
  items,
  className,
  duration = 42,
  reverse = false,
  separator = '—',
}: MarqueeProps) {
  const track = [...items, ...items];

  return (
    <div
      className={cn('group relative flex w-full overflow-hidden', className)}
      aria-hidden="true"
    >
      <div
        className="flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {track.map((item, index) => (
          <Fragment key={`${item}-${index}`}>
            <span className="px-6 font-display text-heading-sm font-semibold uppercase text-muted-foreground">
              {item}
            </span>
            <span className="text-heading-sm font-light text-neon-violet">{separator}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
