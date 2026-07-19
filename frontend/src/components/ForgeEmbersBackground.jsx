import React, { useEffect, useRef } from "react";

export default function ForgeEmbersBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let particles = [];
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastMouse = { x: -1000, y: -1000 };

    const initCanvas = () => {
      const parent = canvas.parentElement;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Initialize particles based on screen size
      const density = Math.floor((canvas.width * canvas.height) / 10000);
      particles = [];
      for (let i = 0; i < density; i++) {
        particles.push(createParticle(true)); // true = spawn anywhere initially
      }
    };

    const createParticle = (spawnAnywhere = false) => {
      const isSpark = Math.random() > 0.6; // 40% sparks, 60% ash
      return {
        x: Math.random() * canvas.width,
        y: spawnAnywhere ? Math.random() * canvas.height : canvas.height + 10,
        vx: (Math.random() - 0.5) * 1.5, // Drift left/right
        vy: isSpark ? -(Math.random() * 2 + 2) : -(Math.random() * 1.5 + 0.5), // Rise up
        size: isSpark ? Math.random() * 2 + 1 : Math.random() * 6 + 2,
        isSpark,
        alpha: spawnAnywhere ? Math.random() : 0, // fade in if spawning at bottom
        targetAlpha: isSpark ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3 + 0.1,
      };
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      
      mouse.vx = mouse.x - lastMouse.x;
      mouse.vy = mouse.y - lastMouse.y;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });
    const container = canvas.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      mouse.vx *= 0.8;
      mouse.vy *= 0.8;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];

        // Apply mouse wind force
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (mouse.vx * force * 0.1) + (dx * force * 0.02);
          p.vy += (mouse.vy * force * 0.1) + (dy * force * 0.02);
        }

        // Add some turbulence (noise)
        p.vx += (Math.random() - 0.5) * 0.2;

        // Apply friction and base upward movement
        p.vx *= 0.96;
        p.vy *= 0.96;
        
        // Buoyancy / heat rising
        p.vy -= p.isSpark ? 0.08 : 0.04;

        p.x += p.vx;
        p.y += p.vy;

        // Fade in
        p.alpha += (p.targetAlpha - p.alpha) * 0.05;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        if (p.isSpark) {
          // White/Sulfur hot sparks
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#ffffff";
        } else {
          // Obsidian dark ash
          ctx.fillStyle = `rgba(7, 6, 7, ${p.alpha})`;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();

        // Respawn if out of bounds (top or sides)
        if (p.y < -50 || p.x < -50 || p.x > canvas.width + 50) {
          particles[i] = createParticle();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    initCanvas();
    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      if (container) resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
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
