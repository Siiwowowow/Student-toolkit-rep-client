import { useLayoutEffect, useRef } from "react";

// Preserve the desktop arrangement of artwork and copy on smaller screens.
export default function DesktopComposition({ children }) {
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
    <div className="sh-composition-viewport" ref={viewportRef}>
      <div className="sh-composition-canvas" ref={canvasRef}>
        {children}
      </div>
    </div>
  );
}
