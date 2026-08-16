import { useEffect } from 'react';

function runCounters(scope) {
  scope.querySelectorAll('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    let cur = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = cur;
    }, 26);
  });
}

// Call this once per page render. It watches every .reveal / .stagger
// element currently in the DOM and fades them in as they scroll into view,
// same as the original observeReveals() did.
export function useReveal(deps = []) {
  useEffect(() => {
    const id = setTimeout(() => {
      const els = document.querySelectorAll('.reveal:not(.in), .stagger:not(.in)');
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            if (entry.target.querySelector('[data-count]')) runCounters(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }, 50);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
