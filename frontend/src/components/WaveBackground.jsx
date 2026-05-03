import { useEffect, useRef } from "react";

/**
 * WaveBackground
 * A fluid, multi-layered wave simulation for blue sections.
 * Layers move at different speeds to create depth.
 */
export default function WaveBackground({ 
  color = "rgba(255, 255, 255, 0.08)",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let mouse = { x: -1000, y: -1000 };
    
    // Wave layers
    const layers = [
      { amplitude: 20, frequency: 0.008, speed: 0.8, offset: 0 },
      { amplitude: 15, frequency: 0.012, speed: 1.2, offset: Math.PI },
      { amplitude: 25, frequency: 0.006, speed: 0.6, offset: Math.PI / 2 }
    ];

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    const resizeObserver = new ResizeObserver(() => {
      init();
    });
    if (container) resizeObserver.observe(container);

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      layers.forEach((layer, index) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 10) {
          // Base wave calculation with time-based phase shift
          const timePhase = time * 0.001 * layer.speed;
          let y = Math.sin(x * layer.frequency + timePhase + layer.offset) * layer.amplitude;
          
          // Additional slow vertical bobbing
          y += Math.cos(time * 0.0005 * layer.speed) * 5;
          
          // Mouse influence (add a "swell" near the mouse)
          const dist = Math.abs(x - mouse.x);
          if (dist < 250) {
            const force = (250 - dist) / 250;
            y += Math.sin(time * 0.004) * 15 * force;
          }

          // Vertically center waves or put them at bottom?
          // Let's stack them at different base heights
          const baseY = canvas.height * (0.4 + index * 0.15);
          ctx.lineTo(x, baseY + y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw(0);

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
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
