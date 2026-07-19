import { useEffect, useRef } from "react";
import handsImgSrc from "../assets/hands-silhouette.png";

/**
 * HalftoneHandsBackground — A visually striking interactive background.
 * Uses an offscreen canvas to analyze an image of hands and renders it
 * as a halftone grid of ASCII-style diamonds that react to the mouse.
 */
export default function HalftoneHandsBackground({ theme = "dark", position = "absolute", zIndex = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });

    let animationFrameId;
    let particles = [];
    const gridSize = 12; // Gap between diamonds

    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000 };

    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

    const img = new Image();
    const CHARS = "+-=>x<:.*♦01";

    const initParticles = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.width / imgAspect;

      if (drawHeight < canvas.height) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
      }

      const dx = (canvas.width - drawWidth) / 2;
      const dy = (canvas.height - drawHeight) / 2;

      offscreen.width = canvas.width;
      offscreen.height = canvas.height;

      offCtx.fillStyle = "black";
      offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
      offCtx.drawImage(img, dx, dy, drawWidth, drawHeight);

      const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
      const data = imageData.data;

      particles = [];

      for (let y = 0; y < canvas.height; y += gridSize) {
        for (let x = 0; x < canvas.width; x += gridSize) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          if (r > 100) {
            particles.push({
              x: x,
              y: y,
              ox: x,
              oy: y,
              vx: 0,
              vy: 0,
              char: CHARS[Math.floor(Math.random() * CHARS.length)],
              shuffleTimer: 0
            });
          }
        }
      }
    };

    img.onload = () => {
      initParticles();
      draw();
    };

    img.src = handsImgSrc;

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
      if (img.complete) initParticles();
    });
    if (container) {
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", initParticles);
    }

    const influenceRadius = 180;
    const dragFactor = 0.35;
    const spring = 0.1;
    const friction = 0.4;

    const draw = () => {
      ctx.fillStyle = "#070607"; // Obsidian
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff"; // Chalk
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      mouse.vx *= 0.5;
      mouse.vy *= 0.5;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < influenceRadius) {
          const force = (influenceRadius - dist) / influenceRadius;
          p.vx += (mouse.vx * force * dragFactor) + (dx * force * 0.04);
          p.vy += (mouse.vy * force * dragFactor) + (dy * force * 0.04);

          p.shuffleTimer += force;
          if (p.shuffleTimer > 1.5) {
            p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
            p.shuffleTimer = 0;
          }
        }

        p.vx += (p.ox - p.x) * spring;
        p.vy += (p.oy - p.y) * spring;

        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillText(p.char, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      if (container) resizeObserver.disconnect();
      else window.removeEventListener("resize", initParticles);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

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
