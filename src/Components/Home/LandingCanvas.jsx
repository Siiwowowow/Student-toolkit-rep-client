import { useLayoutEffect, useRef } from "react";

const DESIGN_WIDTH = 1440;

// Keep the desktop composition intact while fitting it to the available width.
// The header stays outside the scaled canvas so its mobile controls stay usable.
export default function LandingCanvas({ children, header }) {
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    const navbar = viewport.querySelector(".sh-header");
    const resize = () => {
      const availableWidth = viewport.getBoundingClientRect().width;
      if (!availableWidth) return;

      const layoutWidth = Math.max(DESIGN_WIDTH, availableWidth);
      const scale = availableWidth / layoutWidth;
      canvas.style.width = `${layoutWidth}px`;
      canvas.style.zoom = scale;
      canvas.style.setProperty("--landing-scale", scale);
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
