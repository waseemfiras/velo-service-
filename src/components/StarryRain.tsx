import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulsePhase: number;
  drift: number;
}

export function StarryRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    const maxStars = 60; // Soft, premium density

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize stars with slow speeds and soft organic twinkling properties
    for (let i = 0; i < maxStars; i++) {
      const baseOpacity = Math.random() * 0.4 + 0.15;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.6, // Soft sizes (0.6px to 2.1px)
        speed: Math.random() * 0.12 + 0.04, // Slower, elegant, starry flow (0.04 to 0.16px/frame)
        opacity: baseOpacity,
        baseOpacity,
        pulseSpeed: Math.random() * 0.02 + 0.005, // Very slow twinkling phase increment
        pulsePhase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.05 - 0.025, // Slight horizontal drifting for an organic feel
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Move star down slowly
        star.y += star.speed;
        star.x += star.drift;

        // Animate twinkling (pulsing opacity)
        star.pulsePhase += star.pulseSpeed;
        const pulse = Math.sin(star.pulsePhase) * 0.15;
        star.opacity = Math.max(0.08, Math.min(0.7, star.baseOpacity + pulse));

        // Draw star with soft ambient radial glow
        ctx.beginPath();
        const glowRadius = star.size * 3.5;
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          glowRadius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(0.2, `rgba(255, 255, 255, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.fillStyle = gradient;
        ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // If star goes off screen, reset to top smoothly
        if (star.y > canvas.height + 10 || star.x < -20 || star.x > canvas.width + 20) {
          star.y = -10;
          star.x = Math.random() * canvas.width;
          star.size = Math.random() * 1.5 + 0.6;
          star.speed = Math.random() * 0.12 + 0.04;
          const newBase = Math.random() * 0.4 + 0.15;
          star.baseOpacity = newBase;
          star.opacity = newBase;
          star.pulsePhase = Math.random() * Math.PI * 2;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 select-none opacity-80"
    />
  );
}
