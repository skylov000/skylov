import type { ComponentType, SVGProps } from 'react';
import {
  AudioWaveform,
  Disc3,
  Headphones,
  Instagram,
  Mail,
  Mic,
  Music4,
  Palette,
  Piano,
  Repeat,
  SlidersHorizontal,
  Sparkles,
  Youtube,
  Zap,
} from 'lucide-react';

import type { IconName } from '@/types';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * TikTok has no Lucide equivalent, so here is a stroke-matched glyph
 * drawn to sit alongside the rest of the set.
 */
function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 3v11.2a4.3 4.3 0 1 1-4.3-4.3c.35 0 .69.05 1.01.13" />
      <path d="M14.5 3c.5 2.6 2.7 4.6 5.4 4.8" />
    </svg>
  );
}

/**
 * Content files reference icons by name (a plain string), which keeps
 * `content.ts` free of JSX. This map turns those names into components.
 * To add an icon: import it, add the entry here, add the name to `IconName`.
 */
export const iconMap: Record<IconName, IconComponent> = {
  piano: Piano,
  sliders: SlidersHorizontal,
  mic: Mic,
  music: Music4,
  palette: Palette,
  repeat: Repeat,
  headphones: Headphones,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: TikTokIcon,
  disc: Disc3,
  waveform: AudioWaveform,
  sparkles: Sparkles,
  zap: Zap,
  mail: Mail,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

/** Renders an icon by content-file name. Decorative by default. */
export function Icon({ name, ...props }: IconProps) {
  const Component = iconMap[name];
  if (!Component) return null;
  return <Component aria-hidden="true" focusable="false" {...props} />;
}
