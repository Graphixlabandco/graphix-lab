"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

interface NebulaPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function UniverseBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize 3D Stars (Warp speed cosmic effect)
    const stars: Star[] = [];
    const maxStars = 200;
    const speed = 1.8; // Smooth travel speed
    const depth = 1000; // Maximum depth for 3D stars

    for (let i = 0; i < maxStars; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * depth,
        color: i % 8 === 0 
          ? "rgba(53, 0, 93, 0.85)" // Indigo Ink (#35005D)
          : i % 12 === 0 
            ? "rgba(216, 180, 254, 0.85)" // Light Violet (#D8B4FE)
            : "rgba(255, 255, 255, 0.9)", // White stars
        size: Math.random() * 1.5 + 0.5,
      });
    }

    // Slowly moving Nebula dust clouds for cosmic ambiance
    const nebulae: NebulaPoint[] = [
      {
        x: width * 0.25,
        y: height * 0.3,
        vx: 0.15,
        vy: 0.1,
        radius: Math.min(width, height) * 0.45,
        color: "rgba(31, 0, 55, 0.08)", // Dark Amethyst 2 (#1F0037)
      },
      {
        x: width * 0.75,
        y: height * 0.7,
        vx: -0.1,
        vy: -0.12,
        radius: Math.min(width, height) * 0.5,
        color: "rgba(21, 0, 37, 0.06)", // Midnight Violet (#150025)
      },
      {
        x: width * 0.5,
        y: height * 0.5,
        vx: 0.05,
        vy: -0.08,
        radius: Math.min(width, height) * 0.4,
        color: "rgba(53, 0, 93, 0.06)", // Indigo Ink (#35005D)
      },
    ];

    // Swirling Galaxy Spiral Dust Particles
    interface GalaxyParticle {
      angle: number;
      distance: number;
      speed: number;
      size: number;
      color: string;
    }
    const galaxyParticles: GalaxyParticle[] = [];
    const numGalaxyParticles = 120;
    const galaxyCenterX = width * 0.5;
    const galaxyCenterY = height * 0.5;

    for (let i = 0; i < numGalaxyParticles; i++) {
      // Two main spiral arms
      const armOffset = i % 2 === 0 ? 0 : Math.PI;
      const distance = Math.random() * 250 + 40;
      // Archimedean spiral formula: angle is proportional to distance
      const angle = distance * 0.04 + armOffset + Math.random() * 0.5;
      galaxyParticles.push({
        angle,
        distance,
        speed: (0.001 + (300 - distance) * 0.00002) * 0.6,
        size: Math.random() * 1.8 + 0.4,
        color: i % 4 === 0 
          ? "rgba(53, 0, 93, 0.6)" // Indigo Ink spiral dust (#35005D)
          : i % 3 === 0 
            ? "rgba(216, 180, 254, 0.5)" // Light Violet spiral dust (#D8B4FE)
            : "rgba(255, 255, 255, 0.6)",
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Update Nebulae sizes based on new screen size
      nebulae[0].radius = Math.min(width, height) * 0.45;
      nebulae[1].radius = Math.min(width, height) * 0.5;
      nebulae[2].radius = Math.min(width, height) * 0.4;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Loop renderer
    const tick = () => {
      // Very deep rich dark workspace background with absolute opacity control
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Nebulae dust clouds
      nebulae.forEach((neb) => {
        neb.x += neb.vx;
        neb.y += neb.vy;

        // Bounce from boundaries
        if (neb.x < 0 || neb.x > width) neb.vx *= -1;
        if (neb.y < 0 || neb.y > height) neb.vy *= -1;

        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(0.5, neb.color.replace("0.0", "0.01"));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Swirling Galaxy Arms
      const currentGalaxyX = width * 0.5;
      const currentGalaxyY = height * 0.4; // Center higher up near the Hero content

      galaxyParticles.forEach((p) => {
        p.angle += p.speed;
        
        // Calculate standard Cartesian coordinates based on spiral angle and distance
        const x = currentGalaxyX + Math.cos(p.angle) * p.distance;
        const y = currentGalaxyY + Math.sin(p.angle) * p.distance * 0.65; // Slightly skewed for 3D perspective

        // Particle size pulse
        const pulse = 1 + Math.sin(Date.now() * 0.002 + p.distance) * 0.15;
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw 3D Starfield (Warp Effect)
      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        // Move closer
        star.z -= speed;

        // Reset if star passes camera
        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = depth;
        }

        // Project 3D coordinates onto 2D screen coordinate space
        const px = (star.x / star.z) * width + cx;
        const py = (star.y / star.z) * height + cy;

        // Check bounds
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const factor = (depth - star.z) / depth; // Brighter & larger as it gets closer
          const size = star.size * (factor * 3.5 + 0.5);
          const opacity = factor * 0.9;

          ctx.fillStyle = star.color.replace(/[\d.]+\)$/, `${opacity})`);
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
       ref={canvasRef}
       id="universe-background-canvas"
       className="fixed inset-0 w-full h-full z-[-20] pointer-events-none bg-[#000000]"
       style={{ mixBlendMode: "normal" }}
    />
  );
}
