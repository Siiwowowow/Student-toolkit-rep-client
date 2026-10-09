import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 10, suffix: "K+", label: "Active Students" },
  { value: 95, suffix: "%", label: "User Satisfaction" },
  { value: 50, suffix: "K+", label: "Tasks Completed" },
  { value: 120, suffix: "K+", label: "Practice Questions" },
];

export default function StatsBand() {
  const bandRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return undefined;

    let frame;
    let started = false;

    const startCount = () => {
      if (started) return;
      started = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        frame = requestAnimationFrame(() => setProgress(1));
        return;
      }

      const start = performance.now();
      const duration = 1500;
      const tick = (now) => {
        const elapsed = Math.min((now - start) / duration, 1);
        setProgress(1 - (1 - elapsed) ** 3);
        if (elapsed < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      startCount();
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCount();
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(band);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="sh-stats-band" aria-label="TOOLKIT+ in numbers" ref={bandRef}>
      <svg className="sh-stats-scribble" viewBox="0 0 140 100" fill="none" aria-hidden="true">
        <path d="M-5 57C33 25 84 10 124 3 91 13 42 37 4 64c40-23 82-42 126-51C88 28 39 51-3 78c41-20 88-35 130-44C93 47 51 68 8 91M6 3C28 15 43 26 64 38" />
      </svg>

      <div className="sh-stats-inner sh-shell">
        <div className="sh-stats-grid">
          {stats.map(({ value, suffix, label }) => (
            <div className="sh-stats-item" key={label}>
              <strong aria-label={`${value}${suffix}`}>
                {Math.round(value * progress)}{suffix}
              </strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <svg className="sh-stats-star" viewBox="0 0 60 60" fill="none" aria-hidden="true">
          <path d="M30 2 33 22 54 12 39 28 58 36 36 36 39 57 28 39 12 55 20 34 2 28 23 25 18 6 29 22 30 2Z" />
          <path d="M30 7 28 51M7 29l44 6" />
        </svg>

        <div className="sh-stats-note" aria-hidden="true">
          <span>Better<br />Students<br />Brighter<br />Tomorrow.</span>
        </div>
      </div>
    </section>
  );
}
