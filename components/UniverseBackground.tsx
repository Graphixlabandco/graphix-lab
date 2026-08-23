"use client";

import React, { useEffect, useRef } from "react";

interface Node3D {
  x: number; // 3D coordinates
  y: number;
  z: number;
  baseX: number; // baseline coordinates
  baseY: number;
  baseZ: number;
  phaseX: number; // phase shifts for organic waving
  phaseY: number;
  phaseZ: number;
  driftSpeed: number;
  size: number;
  color: string;
  glowColor: string;
  screenX: number; // projected coordinates
  screenY: number;
  pulseTimer: number;
}

interface DataPulse {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
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

    // Color definitions
    const colors = [
      { node: "rgba(139, 92, 246, 0.85)", glow: "rgba(139, 92, 246, 0.45)" }, // Purple (#8B5CF6)
      { node: "rgba(168, 85, 247, 0.85)", glow: "rgba(168, 85, 247, 0.45)" }, // Violet (#A855F7)
      { node: "rgba(99, 102, 241, 0.85)", glow: "rgba(99, 102, 241, 0.45)" }, // Indigo (#6366F1)
      { node: "rgba(255, 255, 255, 0.95)", glow: "rgba(255, 255, 255, 0.35)" } // Soft white
    ];

    // User interaction coordinates
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false
    };

    // Camera offset for smooth parallax
    const camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      ease: 0.05
    };

    // Performance adaptive settings
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || width < 768;
    const maxNodes = isMobile ? 80 : 220;
    const connectionDist = isMobile ? 85 : 120;
    const fov = 350; // Perspective depth

    // Check media queries for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Initialize 3D nodes
    const nodes: Node3D[] = [];
    const minZ = -200;
    const maxZ = 200;

    for (let i = 0; i < maxNodes; i++) {
      // Distribute nodes in a 3D box region
      const x = (Math.random() - 0.5) * width * 1.5;
      const y = (Math.random() - 0.5) * height * 1.5;
      const z = Math.random() * (maxZ - minZ) + minZ;
      const colorObj = colors[Math.floor(Math.random() * colors.length)];

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        driftSpeed: 0.0003 + Math.random() * 0.0006,
        size: Math.random() * 2 + 1.2,
        color: colorObj.node,
        glowColor: colorObj.glow,
        screenX: 0,
        screenY: 0,
        pulseTimer: Math.random() * Math.PI * 2
      });
    }

    // Active data pulses list
    let activePulses: DataPulse[] = [];
    const maxActivePulses = isMobile ? 8 : 24;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Update baseline spacing on resize
      nodes.forEach((node) => {
        if (Math.abs(node.baseX) > width * 0.8) {
          node.baseX = (Math.random() - 0.5) * width * 1.5;
        }
        if (Math.abs(node.baseY) > height * 0.8) {
          node.baseY = (Math.random() - 0.5) * height * 1.5;
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      // Parallax target offset
      camera.targetX = (e.clientX - width / 2) * 0.07;
      camera.targetY = (e.clientY - height / 2) * 0.07;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;

        camera.targetX = (e.touches[0].clientX - width / 2) * 0.05;
        camera.targetY = (e.touches[0].clientY - height / 2) * 0.05;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      camera.targetX = 0;
      camera.targetY = 0;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Loop renderer
    const tick = () => {
      // 1. Clear background with deep rich space black (#09090B)
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, 0, width, height);

      // Smoothly interpolate mouse and camera positions for organic damping
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      camera.x += (camera.targetX - camera.x) * camera.ease;
      camera.y += (camera.targetY - camera.y) * camera.ease;

      const time = Date.now();
      const centerX = width / 2;
      const centerY = height / 2;

      // Enable additive color blending for premium neural glows
      ctx.globalCompositeOperation = "screen";

      // 2. Update Node Positions & Projection
      nodes.forEach((node) => {
        if (!prefersReducedMotion) {
          // Organic drift using smooth sine wave combinations to simulate a living network
          node.x = node.baseX + Math.sin(node.phaseX + time * node.driftSpeed) * 35;
          node.y = node.baseY + Math.cos(node.phaseY + time * node.driftSpeed * 0.9) * 35;
          node.z = node.baseZ + Math.sin(node.phaseZ + time * node.driftSpeed * 1.1) * 20;
          node.pulseTimer += 0.015;
        }

        // Apply camera parallax rotation and depth offsets
        const relativeX = node.x - camera.x;
        const relativeY = node.y - camera.y;
        const relativeZ = node.z;

        // Project 3D coordinates onto 2D viewport
        const scale = fov / (fov + relativeZ);
        const projectedX = relativeX * scale + centerX;
        const projectedY = relativeY * scale + centerY;

        node.screenX = projectedX;
        node.screenY = projectedY;

        // Interactivity: gentle node pull when pointer is near
        if (mouse.active) {
          const dx = mouse.x - projectedX;
          const dy = mouse.y - projectedY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const threshold = isMobile ? 100 : 160;

          if (dist < threshold) {
            const pullForce = (threshold - dist) / threshold;
            // Draw slightly toward pointer coordinates
            node.screenX += dx * pullForce * 0.15;
            node.screenY += dy * pullForce * 0.15;
          }
        }
      });

      // 3. Draw Dynamic Connections
      const activeConnections: [number, number, number][] = []; // [fromIndex, toIndex, opacity]

      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        
        // Skip rendering if particle projects outside viewport
        if (nodeA.screenX < -50 || nodeA.screenX > width + 50 || nodeA.screenY < -50 || nodeA.screenY > height + 50) {
          continue;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];

          // Calculate 3D Euclidean distance
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dz = nodeA.z - nodeB.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDist) {
            // Smoothly fade line out as distance approaches threshold
            const opacity = (1 - dist / connectionDist) * 0.28;

            // Keep track of active connections
            activeConnections.push([i, j, opacity]);

            // Skip rendering lines that are too transparent
            if (opacity > 0.01) {
              const grad = ctx.createLinearGradient(nodeA.screenX, nodeA.screenY, nodeB.screenX, nodeB.screenY);
              grad.addColorStop(0, nodeA.color.replace("0.85", String(opacity)));
              grad.addColorStop(1, nodeB.color.replace("0.85", String(opacity)));

              ctx.strokeStyle = grad;
              ctx.lineWidth = 0.65;
              ctx.beginPath();
              ctx.moveTo(nodeA.screenX, nodeA.screenY);
              ctx.lineTo(nodeB.screenX, nodeB.screenY);
              ctx.stroke();
            }
          }
        }
      }

      // 4. Update and Draw Data Pulses
      // Periodically spawn new data pulses on active connections
      if (activeConnections.length > 0 && activePulses.length < maxActivePulses && Math.random() < (isMobile ? 0.03 : 0.08)) {
        const randConn = activeConnections[Math.floor(Math.random() * activeConnections.length)];
        const fromIdx = randConn[0];
        const toIdx = randConn[1];
        
        // Prevent duplicate pulses on same line
        const exists = activePulses.some(p => 
          (p.fromIndex === fromIdx && p.toIndex === toIdx) || 
          (p.fromIndex === toIdx && p.toIndex === fromIdx)
        );

        if (!exists) {
          activePulses.push({
            fromIndex: fromIdx,
            toIndex: toIdx,
            progress: 0,
            speed: 0.008 + Math.random() * 0.012,
            color: nodes[fromIdx].color.replace("0.85", "1")
          });
        }
      }

      // Render pulses
      activePulses.forEach((pulse, index) => {
        pulse.progress += pulse.speed;

        const nodeA = nodes[pulse.fromIndex];
        const nodeB = nodes[pulse.toIndex];

        // Smooth interpolation of coordinates
        const x = nodeA.screenX + (nodeB.screenX - nodeA.screenX) * pulse.progress;
        const y = nodeA.screenY + (nodeB.screenY - nodeA.screenY) * pulse.progress;

        // Draw pulsing data packet
        const alpha = Math.sin(pulse.progress * Math.PI) * 0.9;
        
        // Draw soft glow under the packet
        const radialGrad = ctx.createRadialGradient(x, y, 0, x, y, 7);
        radialGrad.addColorStop(0, pulse.color.replace("1", String(alpha)));
        radialGrad.addColorStop(1, "rgba(0,0,0,0)");
        
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Draw core packet point
        ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Remove pulse if destination reached
        if (pulse.progress >= 1) {
          activePulses.splice(index, 1);
        }
      });

      // 5. Draw Glowing Nodes
      nodes.forEach((node) => {
        // Skip rendering if particle projects outside viewport
        if (node.screenX < -20 || node.screenX > width + 20 || node.screenY < -20 || node.screenY > height + 20) {
          return;
        }

        // Apply a subtle breathing pulse to size for organic living effect
        const pulse = 1 + Math.sin(node.pulseTimer) * 0.15;
        const finalSize = node.size * pulse;

        // Core bright center
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, finalSize, 0, Math.PI * 2);
        ctx.fill();

        // Outer premium ambient bloom glow
        const glowRadius = finalSize * 4;
        const radGrad = ctx.createRadialGradient(
          node.screenX,
          node.screenY,
          finalSize * 0.5,
          node.screenX,
          node.screenY,
          glowRadius
        );
        radGrad.addColorStop(0, node.glowColor);
        radGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Restore normal blending for other elements
      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="universe-background-canvas"
      className="fixed inset-0 w-full h-full z-[-20] pointer-events-none bg-[#09090B]"
      style={{ mixBlendMode: "normal" }}
    />
  );
}
