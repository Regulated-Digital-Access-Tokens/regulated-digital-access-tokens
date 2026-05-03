import { useEffect, useRef } from "react";

export default function DotMatrixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spacing = 25; // Distance between dots
      const baseRadius = 2; // Normal size
      const hoverRadius = 8; // Max size when hovered
      const influenceRadius = 150; // How far mouse affects dots

      // Calculate offsets to center the grid perfectly
      const offsetX = (canvas.width % spacing) / 2;
      const offsetY = (canvas.height % spacing) / 2;

      // Use a slate color for the dots
      ctx.fillStyle = "rgba(117, 117, 138, 0.4)"; 

      for (let x = offsetX; x < canvas.width; x += spacing) {
        for (let y = offsetY; y < canvas.height; y += spacing) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let r = baseRadius;
          if (distance < influenceRadius) {
            // Calculate bulge effect
            const factor = 1 - distance / influenceRadius;
            // Easing for smoother bulge
            const easeFactor = factor * factor * (3 - 2 * factor); 
            r = baseRadius + easeFactor * (hoverRadius - baseRadius);
          }

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
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
