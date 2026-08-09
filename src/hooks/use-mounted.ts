'use client';

import { useEffect, useState } from 'react';

/** `true` once the component has hydrated. Guards browser-only rendering. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
