import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes without specificity fights. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** `true` when the OS asks for reduced motion. Safe to call during SSR. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Coarse pointer / no hover — i.e. do not run cursor or magnet effects. */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

/** Clamp a number between two bounds. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation. */
export function lerp(start: number, end: number, amount: number): number {
  return start * (1 - amount) + end * amount;
}

/** Zero-pad an index for editorial numbering: 1 → "01". */
export function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/** Locale-aware thousands separator for the animated counters. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

/** Split a string on newlines — lets content.ts carry multi-line copy. */
export function toLines(value: string): string[] {
  return value.split('\n').filter(Boolean);
}

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(base: string, path = ''): string {
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
