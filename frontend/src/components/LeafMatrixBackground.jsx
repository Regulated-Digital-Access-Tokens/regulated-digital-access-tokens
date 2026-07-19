import { useEffect, useRef } from "react";

/**
 * LeafMatrixBackground — Caldera Edition
 *
 * Wind-blown ember particles that whirl towards the North-East.
 * Uses warm Ember-tinted translucent color.
 */
export default function LeafMatrixBackground({
  count = 40,
  leafSize = 10,
  color = "rgba(252, 80, 0, 0.12)",
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

    const windDirection = { x: 1, y: -0.6 };
    const attractionForce = 0.003;

    const initLeaves = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

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
          phase: Math.random() * Math.PI * 2,
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
      // Ember vein
      ctx.strokeStyle = "rgba(252, 80, 0, 0.06)";
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

        let targetVx = windDirection.x * windSpeed;
        let targetVy = windDirection.y * windSpeed;

        const whirlX = Math.sin(time * 0.001 + leaf.phase) * 0.3;
        const whirlY = Math.cos(time * 0.001 + leaf.phase) * 0.3;

        leaf.vx += (targetVx + whirlX - leaf.vx) * 0.02;
        leaf.vy += (targetVy + whirlY - leaf.vy) * 0.02;

        const dx = mouse.x - leaf.x;
        const dy = mouse.y - leaf.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 250) {
          const force = (250 - dist) / 250;
          leaf.vx += dx * force * attractionForce;
          leaf.vy += dy * force * attractionForce;
          leaf.rotationSpeed += 0.0005 * force;
        }

        leaf.x += leaf.vx;
        leaf.y += leaf.vy;
        leaf.rotation += leaf.rotationSpeed;
        leaf.rotationSpeed *= 0.98;

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
