import { useEffect, useRef } from "react";

/**
 * LeafMatrixBackground
 * A "wind-blown" simulation where leaves whirl towards the North-East.
 * Mouse hover subtly attracts leaves without stopping their flow.
 */
export default function LeafMatrixBackground({ 
  count = 40, // Number of leaves (instead of rigid spacing)
  leafSize = 10, 
  color = "rgba(255, 255, 255, 0.15)",
  windSpeed = 0.8,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let mouse = { x: -2000, y: -2000 };
    let leaves = [];

    // Wind direction: North-East
    const windDirection = { x: 1, y: -0.6 }; 
    const attractionForce = 0.003; // Subtle pull
    const swirlAmount = 0.02; // How much they "whirl"

    const initLeaves = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Density-based count if not specified
      const finalCount = count || Math.floor((canvas.width * canvas.height) / 15000);
      
      leaves = [];
      for (let i = 0; i < finalCount; i++) {
        leaves.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() + 0.5) * windSpeed * windDirection.x,
          vy: (Math.random() + 0.5) * windSpeed * windDirection.y,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          phase: Math.random() * Math.PI * 2, // For whirling
          size: leafSize * (0.8 + Math.random() * 0.4)
        });
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -2000;
      mouse.y = -2000;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    const resizeObserver = new ResizeObserver(() => {
      // Re-init but try to keep positions if possible (or just reset)
      initLeaves();
    });
    if (container) resizeObserver.observe(container);

    const drawLeaf = (ctx, x, y, size, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.7, 0, 0, size);
      ctx.quadraticCurveTo(-size * 0.7, 0, 0, -size);
      ctx.fill();
      // Add a small vein line for detail
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.stroke();
      ctx.restore();
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      for (let i = 0; i < leaves.length; i++) {
        let leaf = leaves[i];

        // 1. Base Wind Velocity
        let targetVx = windDirection.x * windSpeed;
        let targetVy = windDirection.y * windSpeed;

        // 2. Whirling / Turbulence (using sine/cosine based on time and phase)
        const whirlX = Math.sin(time * 0.001 + leaf.phase) * 0.3;
        const whirlY = Math.cos(time * 0.001 + leaf.phase) * 0.3;
        
        leaf.vx += (targetVx + whirlX - leaf.vx) * 0.02;
        leaf.vy += (targetVy + whirlY - leaf.vy) * 0.02;

        // 3. Mouse Attraction (Subtle pull)
        const dx = mouse.x - leaf.x;
        const dy = mouse.y - leaf.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 250) {
          const force = (250 - dist) / 250;
          leaf.vx += dx * force * attractionForce;
          leaf.vy += dy * force * attractionForce;
          // Add extra spin when near mouse
          leaf.rotationSpeed += 0.0005 * force;
        }

        // Update Position
        leaf.x += leaf.vx;
        leaf.y += leaf.vy;
        leaf.rotation += leaf.rotationSpeed;
        leaf.rotationSpeed *= 0.98; // Decay extra spin

        // Wrap around logic (Matrix style)
        if (leaf.x > canvas.width + 20) leaf.x = -20;
        if (leaf.x < -20) leaf.x = canvas.width + 20;
        if (leaf.y > canvas.height + 20) leaf.y = -20;
        if (leaf.y < -20) leaf.y = canvas.height + 20;

        drawLeaf(ctx, leaf.x, leaf.y, leaf.size, leaf.rotation);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    initLeaves();
    draw(0);

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, leafSize, color, windSpeed]);

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
        pointerEvents: "auto",
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
