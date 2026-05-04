import { useEffect, useRef } from "react";

export default function DotMatrixBackground({ theme = "light", position = "absolute", zIndex = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000 };
    let dots = [];

    const spacing = 20; // Distance between dots
    const baseRadius = 2; // Normal size
    const influenceRadius = 250; // How far mouse affects dots
    const dragFactor = 0.8; // How much the mouse drags the dots
    const spring = 0.1; // Spring back to original position
    const friction = 0.7; // Damping/friction

    const initDots = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width+200;
      canvas.height = rect.height+200;
      
      dots = [];
      const offsetX = (canvas.width % spacing) / 2;
      const offsetY = (canvas.height % spacing) / 2;
      
      for (let x = offsetX; x < canvas.width; x += spacing) {
        for (let y = offsetY; y < canvas.height; y += spacing) {
          dots.push({ x, y, ox: 0, oy: 0, vx: 0, vy: 0 });
        }
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (mouse.lastX === -1000) {
        mouse.lastX = x;
        mouse.lastY = y;
      }
      mouse.vx = x - mouse.lastX;
      mouse.vy = y - mouse.lastY;
      mouse.lastX = x;
      mouse.lastY = y;
      mouse.x = x;
      mouse.y = y;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.vx = 0;
      mouse.vy = 0;
      mouse.lastX = -1000;
      mouse.lastY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    const container = canvas.parentElement;
    const resizeObserver = new ResizeObserver(() => {
      initDots();
    });
    if (container) {
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", initDots);
    }
    
    initDots();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Use a slate color for both, slightly more opaque on dark theme to remain visible
      ctx.fillStyle = theme === "dark" ? "rgba(117, 117, 138, 0.5)" : "rgba(117, 117, 138, 0.4)"; 

      // Apply decay to mouse velocity so it stops applying force when mouse stops
      mouse.vx *= 0.5;
      mouse.vy *= 0.5;

      for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];

        // Apply force from mouse
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < influenceRadius) {
          const force = (influenceRadius - dist) / influenceRadius;
          dot.vx += mouse.vx * force * dragFactor;
          dot.vy += mouse.vy * force * dragFactor;
        }

        // Apply spring physics
        dot.vx += -dot.ox * spring;
        dot.vy += -dot.oy * spring;

        // Apply friction
        dot.vx *= friction;
        dot.vy *= friction;

        // Update position offset
        dot.ox += dot.vx;
        dot.oy += dot.vy;

        // Dynamic radius based on movement to simulate catching light / ripples
        const speed = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy);
        const r = baseRadius + Math.min(speed * 0.5, 4);

        ctx.beginPath();
        ctx.arc(dot.x + dot.ox, dot.y + dot.oy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      if (container) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", initDots);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position, top: 0, left: 0, width: "100%", height: "100%", zIndex, overflow: "hidden", pointerEvents: "none" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
