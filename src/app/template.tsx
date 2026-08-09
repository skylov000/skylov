'use client';

import { motion } from 'framer-motion';

import { EASE_OUT_EXPO } from '@/lib/animations';

/**
 * Route transition.
 *
 * `template.tsx` (unlike `layout.tsx`) remounts on every navigation, which
 * is exactly what makes the enter animation replay. Kept short and subtle
 * so navigation never feels slower than it is.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
