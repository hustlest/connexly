"use client";

import { useEffect, useRef } from "react";

const CELL_SIZE = 17; // px, monospace grid cell
const PULSE_SPEED = 260; // px/sec, how fast each ring expands
const PULSE_RING_WIDTH = 90; // px, thickness of the bright ring
const PULSE_INTERVAL = [900, 2200] as const; // ms between new pulses, randomized
const AMBIENT_ALPHA = 0.08; // faint always-visible base grid

interface Pulse {
  x: number;
  y: number;
  bornAt: number;
  maxRadius: number;
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomIpv4(): string {
  return [
    Math.floor(randRange(1, 256)),
    Math.floor(randRange(0, 256)),
    Math.floor(randRange(0, 256)),
    Math.floor(randRange(0, 256)),
  ].join(".");
}

// A long tileable strip of real, randomly generated IPv4 addresses — digits
// and dots only, never letters. Rows slice through this at rotating offsets
// so the grid never visibly repeats.
function buildIpStrip(minLength: number): string {
  let strip = "";
  while (strip.length < minLength) {
    strip += randomIpv4() + "  ";
  }
  return strip;
}

export function HeroIpPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ipStrip = buildIpStrip(4000);

    let cols = 0;
    let rows = 0;
    let rowOffsets: number[] = [];
    let width = 0;
    let height = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.font = `${CELL_SIZE - 3}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx!.textBaseline = "middle";

      cols = Math.ceil(width / CELL_SIZE) + 1;
      rows = Math.ceil(height / CELL_SIZE) + 1;
      rowOffsets = Array.from({ length: rows }, () =>
        Math.floor(randRange(0, ipStrip.length))
      );
    }

    const pulses: Pulse[] = [];
    let nextPulseAt = 0;
    let raf = 0;

    function spawnPulse(time: number) {
      pulses.push({
        x: randRange(0, width),
        y: randRange(0, height),
        bornAt: time,
        maxRadius: Math.hypot(width, height) * 0.6,
      });
      nextPulseAt = time + randRange(PULSE_INTERVAL[0], PULSE_INTERVAL[1]);
    }

    function frame(time: number) {
      if (time >= nextPulseAt) spawnPulse(time);

      for (let i = pulses.length - 1; i >= 0; i--) {
        const age = (time - pulses[i].bornAt) / 1000;
        if (age * PULSE_SPEED - PULSE_RING_WIDTH > pulses[i].maxRadius) {
          pulses.splice(i, 1);
        }
      }

      ctx!.clearRect(0, 0, width, height);

      for (let r = 0; r < rows; r++) {
        const rowText = ipStrip;
        const offset = rowOffsets[r];
        const y = r * CELL_SIZE + CELL_SIZE / 2;

        for (let c = 0; c < cols; c++) {
          const ch = rowText[(offset + c) % rowText.length];
          if (ch === " ") continue;

          const x = c * CELL_SIZE + CELL_SIZE / 2;

          let alpha = AMBIENT_ALPHA;
          for (const pulse of pulses) {
            const age = (time - pulse.bornAt) / 1000;
            const radius = age * PULSE_SPEED;
            const dist = Math.hypot(x - pulse.x, y - pulse.y);
            const ring = 1 - Math.abs(dist - radius) / PULSE_RING_WIDTH;
            if (ring <= 0) continue;
            const fade = Math.max(0, 1 - radius / pulse.maxRadius);
            alpha = Math.max(alpha, ring * fade * 0.95);
          }

          // Dim bone -> bright orange as pulse intensity rises.
          const r0 = 90 + (237 - 90) * alpha;
          const g0 = 95 + (125 - 95) * alpha;
          const b0 = 110 + (49 - 110) * alpha;
          ctx!.fillStyle = `rgba(${r0 | 0}, ${g0 | 0}, ${b0 | 0}, ${Math.min(alpha + 0.05, 1)})`;
          ctx!.fillText(ch, x - CELL_SIZE * 0.32, y);
        }
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
    />
  );
}
