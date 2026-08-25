"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Observes when an element enters the viewport.
 * Returns a ref to attach and a boolean that flips to true once visible.
 */
export function useInView(options?: IntersectionObserverInit & { once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableOpts = useMemo(() => options, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (stableOpts?.once !== false) observer.disconnect();
        }
      },
      { threshold: 0.1, ...stableOpts },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stableOpts]);

  return { ref, visible };
}
