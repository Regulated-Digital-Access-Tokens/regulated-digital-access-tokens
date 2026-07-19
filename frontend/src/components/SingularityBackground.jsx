import React, { useEffect, useRef } from "react";

export default function SingularityBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let center = { x: 0, y: 0 };
    const numParticles = 800;

    const initCanvas = () => {
      const parent = canvas.parentElement;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      center.x = canvas.width / 2;
      center.y = canvas.height / 2;

      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(createParticle());
      }
    };

    const createParticle = () => {
      // 30% sparks, 70% dark matter/ash
      const isSpark = Math.random() > 0.7;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (canvas.width / 1.5) + 50; // Start far away
      
      return {
        angle,
        radius,
        speed: (Math.random() * 0.02 + 0.005) * (isSpark ? 1.5 : 1),
        size: isSpark ? Math.random() * 2 + 1 : Math.random() * 5 + 2,
        isSpark,
        z: Math.random() * 100, // For pseudo-3D
      };
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
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
      // Slight trail effect
      ctx.fillStyle = "rgba(252, 80, 0, 0.2)"; // Ember trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Determine the singularity center (pulls slightly toward mouse)
      let targetCx = center.x;
      let targetCy = center.y;
      
      if (mouse.x !== -1000) {
        targetCx += (mouse.x - center.x) * 0.15;
        targetCy += (mouse.y - center.y) * 0.15;
      }

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];

        // Orbit logic
        p.angle += p.speed;
        
        // Spiraling inward
        p.radius -= (p.speed * 40);

        // If it gets sucked in, respawn on the edge
        if (p.radius < 5) {
          particles[i] = createParticle();
          continue;
        }

        // Calculate position
        const x = targetCx + Math.cos(p.angle) * p.radius;
        const y = targetCy + Math.sin(p.angle) * p.radius * 0.6; // Elliptical (3D perspective)

        // Draw
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        
        if (p.isSpark) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, 50 / p.radius)})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#ffffff";
        } else {
          ctx.fillStyle = `rgba(7, 6, 7, ${Math.min(1, 100 / p.radius)})`;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      }

      // Draw the singularity core
      const coreGradient = ctx.createRadialGradient(targetCx, targetCy, 0, targetCx, targetCy, 60);
      coreGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      coreGradient.addColorStop(0.2, "rgba(245, 242, 142, 1)"); // Sulfur
      coreGradient.addColorStop(0.6, "rgba(7, 6, 7, 0.8)"); // Obsidian
      coreGradient.addColorStop(1, "rgba(7, 6, 7, 0)");
      
      ctx.beginPath();
      ctx.arc(targetCx, targetCy, 80, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

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
