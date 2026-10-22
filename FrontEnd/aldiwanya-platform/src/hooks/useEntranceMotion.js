import { useEffect, useRef } from "react";

const targets = [
  ".section-title",
  ".feature-strip > div",
  ".benefits > div",
  ".course-card",
  ".pdf-card",
  ".video-card",
  ".grade-card",
  ".plan-card",
  ".auth-heading",
  ".support-banner",
  ".join-banner",
  ".home-trial-card",
  ".home-benefit",
  ".home-grades-intro",
].join(",");

export default function useEntranceMotion(pathname) {
  const root = useRef(null);

  useEffect(() => {
    const content = root.current;
    if (!content || !window.IntersectionObserver || !Element.prototype.animate)
      return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet();
    const animations = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting);
        entering.forEach(({ target }, index) => {
          observer.unobserve(target);
          if (preference.matches || target.contains(document.activeElement))
            return;
          // Animate only visible elements; content is never hidden while waiting to scroll.
          const animation = target.animate(
            [
              { opacity: 0, translate: "0 18px" },
              { opacity: 1, translate: "0 0" },
            ],
            {
              duration: 550,
              delay: Math.min(index * 65, 195),
              easing: "cubic-bezier(.22, 1, .36, 1)",
              fill: "backwards",
            },
          );
          animations.add(animation);
          animation.finished.then(
            () => animations.delete(animation),
            () => animations.delete(animation),
          );
        });
      },
      { threshold: 0.08 },
    );

    const collect = () => {
      content.querySelectorAll(targets).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        observer.observe(element);
      });
    };
    collect();
    // Include cards loaded from the API without changing their loading or error states.
    const updates = new MutationObserver(collect);
    updates.observe(content, { childList: true, subtree: true });
    const stopMotion = () => {
      if (preference.matches)
        animations.forEach((animation) => animation.cancel());
    };
    const showFocusedContent = () => {
      animations.forEach((animation) => {
        if (animation.effect?.target?.contains(document.activeElement))
          animation.cancel();
      });
    };
    preference.addEventListener("change", stopMotion);
    content.addEventListener("focusin", showFocusedContent);
    return () => {
      observer.disconnect();
      updates.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", stopMotion);
      content.removeEventListener("focusin", showFocusedContent);
    };
  }, [pathname]);

  return root;
}
