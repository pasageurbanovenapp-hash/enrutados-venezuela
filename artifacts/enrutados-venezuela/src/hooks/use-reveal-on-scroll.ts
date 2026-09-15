import { useEffect } from 'react';

/**
 * Adds an `is-visible` class to every element with the `.reveal` class as it
 * enters the viewport. Pair with the `.reveal` / `.reveal.is-visible` rules
 * already defined in index.css.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    const revealItems = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal'),
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
}
