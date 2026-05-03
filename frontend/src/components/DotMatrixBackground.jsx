import { useEffect, useRef } from "react";

export default function DotMatrixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000 };
    let dots = [];

    const spacing = 25; // Distance between dots
    const baseRadius = 2; // Normal size
    const influenceRadius = 150; // How far mouse affects dots
    const dragFactor = 0.08; // How much the mouse drags the dots
    const spring = 0.05; // Spring back to original position
    const friction = 0.88; // Damping/friction

    const initDots = () => {
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
      if (mouse.lastX === -1000) {
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
      }
      mouse.vx = e.clientX - mouse.lastX;
      mouse.vy = e.clientY - mouse.lastY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Use a slate color for the dots
      ctx.fillStyle = "rgba(117, 117, 138, 0.4)"; 

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
      window.removeEventListener("resize", resize);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
