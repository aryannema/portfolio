"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

const NUM_STARS = 250;
const SPEED = 10;

function makeStar(w: number, h: number): Star {
  const z = Math.random() * w;
  return { x: Math.random() * w - w / 2, y: Math.random() * h - h / 2, z, pz: z };
}

export default function Screensaver({ onDismiss }: { onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.width;
    const h = () => canvas.height;

    const stars: Star[] = Array.from({ length: NUM_STARS }, () => makeStar(w(), h()));

    // Text bounce state for the "DevOS 98" label
    let labelX = w() / 2;
    let labelY = h() / 2;
    let vx = 1.2;
    let vy = 0.9;
    const LABEL = "DevOS 98";

    let rafId: number;

    const draw = () => {
      const cw = w();
      const ch = h();

      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, cw, ch);

      // Stars
      stars.forEach((star) => {
        star.pz = star.z;
        star.z -= SPEED;

        if (star.z <= 1) {
          Object.assign(star, makeStar(cw, ch));
          return;
        }

        const sx = (star.x / star.z) * cw + cw / 2;
        const sy = (star.y / star.z) * ch + ch / 2;
        const px = (star.x / star.pz) * cw + cw / 2;
        const py = (star.y / star.pz) * ch + ch / 2;

        if (sx < 0 || sx > cw || sy < 0 || sy > ch) {
          Object.assign(star, makeStar(cw, ch));
          return;
        }

        const alpha = Math.min(1, 1 - star.z / cw);
        const size = Math.max(0.4, alpha * 2.5);

        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      });

      // Bouncing "DevOS 98" label
      ctx.font = "bold 32px VT323, monospace";
      const metrics = ctx.measureText(LABEL);
      const lw = metrics.width;
      const lh = 32;

      labelX += vx;
      labelY += vy;
      if (labelX + lw >= cw || labelX <= 0) vx *= -1;
      if (labelY >= ch || labelY - lh <= 0) vy *= -1;

      // Cycle color through hue
      const hue = (Date.now() / 30) % 360;
      ctx.fillStyle = `hsl(${hue},80%,65%)`;
      ctx.fillText(LABEL, labelX, labelY);

      // Dismiss hint
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "14px VT323, monospace";
      ctx.textAlign = "center";
      ctx.fillText("Move mouse or press any key to continue", cw / 2, ch - 18);
      ctx.textAlign = "left";

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Dismiss on any interaction
  useEffect(() => {
    const dismiss = () => onDismiss();
    window.addEventListener("keydown", dismiss);
    window.addEventListener("mousedown", dismiss);
    window.addEventListener("touchstart", dismiss);
    return () => {
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("mousedown", dismiss);
      window.removeEventListener("touchstart", dismiss);
    };
  }, [onDismiss]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 5000, cursor: "none" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
