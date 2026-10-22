import { useLayoutEffect, useRef } from "react";

// Use the actual viewport width so container queries can reflow mobile content.
export default function LandingCanvas({ children, header }) {
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    const navbar = viewport.querySelector(".sh-header");
    const resize = () => {
      canvas.style.setProperty(
        "--landing-header-height",
        `${navbar?.getBoundingClientRect().height ?? 0}px`,
      );
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    if (navbar) observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sh-landing-viewport" ref={viewportRef}>
      {header}
      <div className="sh-landing-canvas" ref={canvasRef}>
        <div className="studyhub-landing">{children}</div>
      </div>
    </div>
  );
}
