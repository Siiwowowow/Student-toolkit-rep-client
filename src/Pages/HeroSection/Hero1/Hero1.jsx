import { Link } from "react-router";
import { ArrowRight, Play } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

export default function Hero1({ startPath = "/signUp", signedIn = false }) {
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    const resize = () => {
      const availableWidth = viewport.getBoundingClientRect().width;
      if (!availableWidth) return;
      const layoutWidth = Math.max(1366, availableWidth);
      canvas.style.width = `${layoutWidth}px`;
      canvas.style.zoom = availableWidth / layoutWidth;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sh-hero-viewport" ref={viewportRef}>
      <div className="sh-hero-canvas" ref={canvasRef}>
    <section className="sh-banner" aria-labelledby="hero-heading">
      <div className="sh-banner-bg" aria-hidden="true">
        <img
          src="/images/landing/notre-dame-hero-banner.png"
          alt=""
          width="1672"
          height="941"
          fetchPriority="high"
        />
      </div>
      <div className="sh-banner-inner sh-shell">
        <div className="sh-banner-copy">
          <div className="sh-banner-meta">
            <span className="sh-pill">
              <span /> ALL-IN-ONE TOOLKIT
            </span>
            <span className="sh-banner-proof">
              <span className="sh-proof-dots" aria-hidden="true">
                ✦ ✧ ✦
              </span>
              For every part of student life
            </span>
          </div>
          <h1 id="hero-heading">
            PLAN.
            <br />
            STUDY.
            <br />
            <span className="sh-grow">GROW.</span>
            <br />
            REPEAT.
          </h1>
          <p>
            Everything you need for a smarter, healthier, and more organized
            student life — in one place.
          </p>
          <div className="sh-banner-actions">
            <Link to={startPath} className="sh-button sh-banner-primary">
              {signedIn ? "Open My Planner" : "Get Started Free"}{" "}
              <ArrowRight size={17} />
            </Link>
            <a className="sh-button sh-button-outline" href="#overview">
              <span className="sh-play">
                <Play size={10} fill="currentColor" />
              </span>
              See How It Works
            </a>
          </div>
        </div>
        <span className="sh-banner-note sh-banner-note-top">
          SAME
          <br />
          STUDENT.
          <br />
          DIFFERENT
          <br />
          ENERGY.
        </span>
        <span className="sh-banner-brand-stamp" aria-hidden="true">TOOLKIT+</span>
      </div>
    </section>
      </div>
    </div>
  );
}
