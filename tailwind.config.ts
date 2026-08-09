import type { Config } from 'tailwindcss';

/**
 * Colour tokens resolve to CSS variables declared in `src/app/globals.css`.
 * Change the palette there and the whole site re-skins.
 *
 * Note: because these are raw colour strings (not channel triplets), Tailwind
 * opacity modifiers such as `bg-background/50` are not supported on them.
 * Use the `.glass` helpers or explicit `rgba()` values instead.
 */
const config: Config = {
  darkMode: ['class', '[data-theme="light"]'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2.5rem', xl: '3.5rem' },
      screens: { '2xl': '1440px' },
    },
    extend: {
      screens: {
        xs: '480px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        surface: 'var(--surface)',
        elevated: 'var(--elevated)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        hover: 'var(--hover)',
        // Brand neons — used for glows, gradients and accents.
        neon: {
          violet: 'var(--neon-violet)',
          pink: 'var(--neon-pink)',
          blue: 'var(--neon-blue)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fluid editorial scale — no media queries needed.
        'display-sm': ['clamp(2.25rem, 1.4rem + 4.2vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(2.75rem, 1.2rem + 7vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(3.25rem, 0.5rem + 11vw, 11rem)', { lineHeight: '0.88', letterSpacing: '-0.04em' }],
        'heading-sm': ['clamp(1.35rem, 1.1rem + 1vw, 1.9rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-md': ['clamp(1.75rem, 1.2rem + 2.4vw, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'body-lg': ['clamp(1.0625rem, 1rem + 0.4vw, 1.375rem)', { lineHeight: '1.65' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.24em' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.75rem',
      },
      spacing: {
        section: 'clamp(5rem, 3rem + 9vw, 11rem)',
        gutter: 'clamp(1.25rem, 0.5rem + 2.5vw, 4rem)',
      },
      maxWidth: {
        prose: '68ch',
        wide: '1680px',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
        '1400': '1400ms',
        '1600': '1600ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
        swift: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      boxShadow: {
        glow: '0 0 24px rgba(179,71,255,0.35), 0 0 64px rgba(179,71,255,0.18)',
        'glow-pink': '0 0 24px rgba(255,45,247,0.35), 0 0 64px rgba(255,45,247,0.16)',
        'glow-blue': '0 0 24px rgba(45,159,255,0.32), 0 0 64px rgba(45,159,255,0.16)',
        'glow-sm': '0 0 16px rgba(179,71,255,0.28)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'scroll-hint': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '35%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(4%, -6%, 0) scale(1.12)' },
          '66%': { transform: 'translate3d(-5%, 4%, 0) scale(0.94)' },
        },
        'border-spin': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'accordion-up': 'accordion-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        marquee: 'marquee 40s linear infinite',
        'scroll-hint': 'scroll-hint 2.2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3.5s ease-in-out infinite',
        'aurora-drift': 'aurora-drift 22s ease-in-out infinite',
        'border-spin': 'border-spin 6s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
