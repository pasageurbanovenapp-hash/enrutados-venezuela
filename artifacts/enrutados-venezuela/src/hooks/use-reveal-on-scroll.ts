import { useEffect, useRef, type RefObject } from 'react';

/**
 * Adds an `is-visible` class to every element with the `.reveal` class as it
 * enters the viewport. Pair with the `.reveal` / `.reveal.is-visible` rules
 * already defined in index.css.
 */
export function useRevealOnScroll<T extends HTMLElement>(): RefObject<T | null> {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>('.reveal'),
    );

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return rootRef;
}
