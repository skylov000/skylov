import Image from 'next/image';

import { brand, site } from '@/content/content';
import { cn } from '@/lib/utils';

interface LogoProps {
  /**
   * Rozmiar ustawiasz wyłącznie klasami (np. `h-7`, `w-[min(70vw,460px)]`).
   * Świadomie nie ma tu propsa liczbowego ze stylem inline — inline
   * wygrywa z klasami, więc responsywne warianty przestałyby działać.
   */
  className?: string;
  priority?: boolean;
  /** Neonowa poświata pod logotypem. */
  glow?: boolean;
}

/**
 * Logotyp SKYLOV z `public/logo/logo.png`.
 *
 * Proporcje pilnuje `brand.logoWidth/logoHeight` (1413×249). Ustawiasz
 * tylko jeden wymiar, drugi dolicza się sam — logo nigdy się nie rozjedzie.
 */
export function Logo({ className, priority = false, glow = true }: LogoProps) {
  return (
    <Image
      src={brand.logo}
      alt={site.name}
      width={brand.logoWidth}
      height={brand.logoHeight}
      priority={priority}
      sizes="(max-width: 640px) 70vw, 560px"
      className={cn(
        // `max-w-full` chroni przed wyjściem poza kontener na wąskich
        // ekranach; wysokość dolicza się z proporcji, więc nie zniekształca.
        'h-auto w-auto max-w-full select-none',
        glow && 'drop-shadow-[0_0_16px_rgba(179,71,255,0.45)]',
        className
      )}
      draggable={false}
    />
  );
}
