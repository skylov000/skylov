'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** Hairline progress bar pinned under the navbar. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 top-0 z-[95] h-[2px] w-full origin-left bg-foreground no-print"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
