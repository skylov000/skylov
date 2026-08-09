import type Lenis from 'lenis';

/**
 * Tiny module-level registry for the single Lenis instance.
 *
 * Anything that needs to drive the scroll (nav links, "back to top",
 * the mobile menu, the lightbox) imports these helpers instead of
 * threading a React context through the whole tree.
 */

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Pause scrolling — used while overlays are open. */
export function stopScroll() {
  instance?.stop();
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('lenis-stopped');
  }
}

export function startScroll() {
  instance?.start();
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('lenis-stopped');
  }
}

interface ScrollOptions {
  offset?: number;
  immediate?: boolean;
}

/**
 * Scroll to an element, a selector, or the top of the page.
 * Falls back to the native API when Lenis is not running
 * (reduced motion, or before hydration).
 */
export function scrollTo(target: string | number | HTMLElement, options: ScrollOptions = {}) {
  const { offset = 0, immediate = false } = options;
  const lenis = getLenis();

  if (lenis) {
    lenis.scrollTo(target, {
      offset,
      immediate,
      duration: immediate ? 0 : 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    return;
  }

  if (typeof window === 'undefined') return;

  const behavior: ScrollBehavior = immediate ? 'auto' : 'smooth';

  if (typeof target === 'number') {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }

  const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior });
}

/**
 * Resolves an anchor href (`/#about`, `#about`) to a section id.
 * Returns null when the href is a normal route.
 */
export function hashFromHref(href: string): string | null {
  const index = href.indexOf('#');
  if (index === -1) return null;
  const hash = href.slice(index + 1);
  return hash.length > 0 ? hash : null;
}
