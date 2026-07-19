import React, { useEffect, useRef } from "react";

export default function HexVaultBackground({ theme = "dark" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let hexes = [];
    const hexRadius = 24;
    const hexHeight = hexRadius * Math.sqrt(3);
    const hexWidth = hexRadius * 2;
    const horizSpacing = hexWidth * 0.75;
    const vertSpacing = hexHeight;

    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastMouse = { x: -1000, y: -1000 };

    const initHexes = () => {
      const parent = canvas.parentElement;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      hexes = [];
      const cols = Math.ceil(canvas.width / horizSpacing) + 2;
      const rows = Math.ceil(canvas.height / vertSpacing) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * horizSpacing;
          let y = row * vertSpacing;
          // Offset odd columns
          if (col % 2 !== 0) {
            y += vertSpacing / 2;
          }

          hexes.push({
            ox: x,
            oy: y,
            x: x,
            y: y,
            scale: 1,
            targetScale: 1,
            glow: 0,
            targetGlow: 0,
          });
        }
      }
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
      initHexes();
    });
    const container = canvas.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    const drawHexagon = (cx, cy, r) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i;
        const angle_rad = (Math.PI / 180) * angle_deg;
        const hx = cx + r * Math.cos(angle_rad);
        const hy = cy + r * Math.sin(angle_rad);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    };

    const influenceRadius = 150;
    
    // Obsidian background, Ember glow
    const baseColor = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(7, 6, 7, 0.08)";
    const emberColorRgb = "252, 80, 0"; // #fc5000

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < hexes.length; i++) {
        let h = hexes[i];

        const dx = h.ox - mouse.x;
        const dy = h.oy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < influenceRadius) {
          const force = (influenceRadius - dist) / influenceRadius;
          h.targetScale = 1 - (force * 0.4); // shrink slightly to look like it's pressed in
          h.targetGlow = force;
        } else {
          h.targetScale = 1;
          h.targetGlow = 0;
        }

        // Lerp
        h.scale += (h.targetScale - h.scale) * 0.15;
        h.glow += (h.targetGlow - h.glow) * 0.15;

        // Draw
        drawHexagon(h.x, h.y, hexRadius * h.scale);
        
        ctx.lineWidth = 1.5;
        if (h.glow > 0.01) {
          ctx.strokeStyle = `rgba(${emberColorRgb}, ${h.glow})`;
          ctx.stroke();
          
          // Inner fill for intense heat
          ctx.fillStyle = `rgba(${emberColorRgb}, ${h.glow * 0.15})`;
          ctx.fill();
        } else {
          ctx.strokeStyle = baseColor;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    initHexes();
    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      if (container) resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

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
