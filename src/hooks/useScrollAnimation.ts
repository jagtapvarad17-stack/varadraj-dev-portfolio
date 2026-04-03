import { useEffect, useRef, RefObject } from "react";

/**
 * useScrollAnimation
 * Attaches an IntersectionObserver to a container ref.
 * When the container (or selected children) enters the viewport,
 * the "in-view" class is added, triggering CSS scroll animations.
 *
 * @param selector  - Optional CSS selector to observe child elements instead of the container itself.
 * @param threshold - Fraction of element visible before triggering (default 0.15).
 * @param once      - If true (default), animation only triggers once.
 */export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  selector?: string,
  threshold = 0.15,
  once = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets: Element[] = selector
      ? Array.from(container.querySelectorAll(selector))
      : [container];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("active");
          }
        });
      },
      { threshold }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector, threshold, once]);

  return ref;
}