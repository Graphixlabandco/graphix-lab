"use client";

import React, { useEffect, useRef } from "react";

// 3D Value Noise Generator (High-performance Perlin-like noise field)
class ValueNoise3D {
  private p: number[] = [];
  
  constructor() {
    const src = Array.from({ length: 256 }, (_, i) => i);
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = src[i];
      src[i] = src[j];
      src[j] = temp;
    }
    this.p = [...src, ...src];
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  public noise(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.p[AA] / 255, this.p[BA] / 255),
        this.lerp(u, this.p[AB] / 255, this.p[BB] / 255)
      ),
      this.lerp(v,
        this.lerp(u, this.p[AA + 1] / 255, this.p[BA + 1] / 255),
        this.lerp(u, this.p[AB + 1] / 255, this.p[BB + 1] / 255)
      )
    );
  }
}

interface ClusterCentroid {
  x: number;
  y: number;
  z: number;
  phase: number;
}

interface Node3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  clusterIndex: number;
  noiseSeedX: number;
  noiseSeedY: number;
  noiseSeedZ: number;
  size: number;
  color: string;
  glowColor: string;
  screenX: number;
  screenY: number;
  screenScale: number;
  pulseTimer: number;
  energyLevel: number; // Energized state from waves
}

interface DataPulse {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
  color: string;
}

interface EnergyWave {
  x: number;
  y: number;
  z: number;
  radius: number;
  maxRadius: number;
  speed: number;
  active: boolean;
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

    // Initial Noise Instance
    const noise3d = new ValueNoise3D();

    const colors = [
      { node: "rgba(139, 92, 246, 0.85)", glow: "rgba(139, 92, 246, 0.35)", raw: "139, 92, 246" }, // Purple
      { node: "rgba(168, 85, 247, 0.85)", glow: "rgba(168, 85, 247, 0.35)", raw: "168, 85, 247" }, // Violet
      { node: "rgba(99, 102, 241, 0.85)", glow: "rgba(99, 102, 241, 0.35)", raw: "99, 102, 241" }, // Indigo
      { node: "rgba(255, 255, 255, 0.95)", glow: "rgba(255, 255, 255, 0.25)", raw: "255, 255, 255" } // Soft white
    ];

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false
    };

    const camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      ease: 0.035 // Even smoother slow parallax
    };

    // Performance adaptation
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || width < 768;
    const maxNodes = isMobile ? 70 : 160; // Slightly lower node count + batched rendering = massive GPU boost
    const connectionDist = isMobile ? 90 : 140;
    const fov = 400; // FOV for 3D projection

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Define Constellation / Intelligent Clusters
    const numClusters = isMobile ? 3 : 6;
    const clusters: ClusterCentroid[] = [];
    for (let c = 0; c < numClusters; c++) {
      clusters.push({
        x: (Math.random() - 0.5) * width * 1.1,
        y: (Math.random() - 0.5) * height * 1.1,
        z: (Math.random() - 0.5) * 200,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Initialize Nodes within Clusters
    const nodes: Node3D[] = [];
    for (let i = 0; i < maxNodes; i++) {
      // Pick random cluster centroid to cluster around
      const clusterIdx = i % numClusters;
      const cluster = clusters[clusterIdx];

      // Standard offset from centroid (Creates constellation clumps)
      const spread = isMobile ? 120 : 180;
      const x = cluster.x + (Math.random() - 0.5) * spread;
      const y = cluster.y + (Math.random() - 0.5) * spread;
      const z = cluster.z + (Math.random() - 0.5) * spread;
      const colorObj = colors[Math.floor(Math.random() * colors.length)];

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        clusterIndex: clusterIdx,
        noiseSeedX: Math.random() * 1000,
        noiseSeedY: Math.random() * 1000,
        noiseSeedZ: Math.random() * 1000,
        size: Math.random() * 1.8 + 1.2,
        color: colorObj.node,
        glowColor: colorObj.glow,
        screenX: 0,
        screenY: 0,
        screenScale: 0,
        pulseTimer: Math.random() * Math.PI * 2,
        energyLevel: 0
      });
    }

    // Active Data Pulses & Energy Waves
    let activePulses: DataPulse[] = [];
    const maxActivePulses = isMobile ? 6 : 16;
    const energyWaves: EnergyWave[] = [];

    // Volumetric soft glows behind nodes (Apple style radial gradient nodes)
    const auraGlows = [
      { x: width * 0.35, y: height * 0.35, targetX: width * 0.35, targetY: height * 0.35, vx: 0.15, vy: 0.1, radius: Math.max(width, height) * 0.45, color: "rgba(139, 92, 246, 0.025)" },
      { x: width * 0.65, y: height * 0.65, targetX: width * 0.65, targetY: height * 0.65, vx: -0.1, vy: -0.15, radius: Math.max(width, height) * 0.55, color: "rgba(99, 102, 241, 0.025)" }
    ];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      auraGlows[0].radius = Math.max(width, height) * 0.45;
      auraGlows[1].radius = Math.max(width, height) * 0.55;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      camera.targetX = (e.clientX - width / 2) * 0.08;
      camera.targetY = (e.clientY - height / 2) * 0.08;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;

        camera.targetX = (e.touches[0].clientX - width / 2) * 0.06;
        camera.targetY = (e.touches[0].clientY - height / 2) * 0.06;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      camera.targetX = 0;
      camera.targetY = 0;
    };

    // Add Energy Wave on click (Award-winning interaction feel)
    const handleClick = (e: MouseEvent) => {
      if (energyWaves.length < 3) {
        energyWaves.push({
          x: e.clientX,
          y: e.clientY,
          z: 0,
          radius: 0,
          maxRadius: Math.max(width, height) * 0.4,
          speed: 4.5,
          active: true,
          color: "rgba(168, 85, 247, 0.3)" // Purple/violet wave
        });
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Loop renderer
    const tick = () => {
      // 1. Draw solid luxurious space black (#09090B)
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, 0, width, height);

      // Damp mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;
      camera.x += (camera.targetX - camera.x) * camera.ease;
      camera.y += (camera.targetY - camera.y) * camera.ease;

      const time = Date.now();
      const centerX = width / 2;
      const centerY = height / 2;

      // 2. Render Volumetric Auras behind the neural system
      ctx.globalCompositeOperation = "screen";
      auraGlows.forEach((aura) => {
        if (!prefersReducedMotion) {
          aura.x += aura.vx;
          aura.y += aura.vy;
          
          if (aura.x < 0 || aura.x > width) aura.vx *= -1;
          if (aura.y < 0 || aura.y > height) aura.vy *= -1;
        }

        const radGrad = ctx.createRadialGradient(aura.x, aura.y, 0, aura.x, aura.y, aura.radius);
        radGrad.addColorStop(0, aura.color);
        radGrad.addColorStop(1, "rgba(9, 9, 11, 0)");
        
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(aura.x, aura.y, aura.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Update Cluster Centroids slowly using noise to keep clustering organic
      if (!prefersReducedMotion) {
        clusters.forEach((cluster, idx) => {
          const driftX = noise3d.noise(idx * 20, time * 0.00003, 0) - 0.5;
          const driftY = noise3d.noise(idx * 20 + 50, time * 0.00003, 0) - 0.5;
          cluster.x += driftX * 0.25;
          cluster.y += driftY * 0.25;
        });
      }

      // 4. Update Node Positions & Projection with 3D Perlin Noise Flow Fields
      nodes.forEach((node) => {
        if (!prefersReducedMotion) {
          const cluster = clusters[node.clusterIndex];
          // Use high quality Perlin/Value noise to flow baseline coordinate drifting
          const noiseX = noise3d.noise(node.noiseSeedX + time * 0.0001, 0, 0) - 0.5;
          const noiseY = noise3d.noise(node.noiseSeedY + time * 0.0001, 100, 0) - 0.5;
          const noiseZ = noise3d.noise(node.noiseSeedZ + time * 0.0001, 200, 0) - 0.5;

          // Float baseline slightly around cluster centroid
          node.x = cluster.x + (node.baseX - cluster.x) + noiseX * 60;
          node.y = cluster.y + (node.baseY - cluster.y) + noiseY * 60;
          node.z = cluster.z + (node.baseZ - cluster.z) + noiseZ * 40;
          node.pulseTimer += 0.012;
        }

        // Apply camera offsets
        const relativeX = node.x - camera.x;
        const relativeY = node.y - camera.y;
        const relativeZ = node.z;

        // Perspective Scale Factor
        const scale = fov / (fov + relativeZ);
        node.screenScale = scale;
        node.screenX = relativeX * scale + centerX;
        node.screenY = relativeY * scale + centerY;

        // Fade energy levels smoothly
        if (node.energyLevel > 0) {
          node.energyLevel -= 0.015;
        }

        // Mouse attraction pull
        if (mouse.active) {
          const dx = mouse.x - node.screenX;
          const dy = mouse.y - node.screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const threshold = isMobile ? 80 : 150;

          if (dist < threshold) {
            const pullForce = (threshold - dist) / threshold;
            node.screenX += dx * pullForce * 0.12;
            node.screenY += dy * pullForce * 0.12;
          }
        }
      });

      // 5. Update Energy Waves
      energyWaves.forEach((wave, wIdx) => {
        wave.radius += wave.speed;
        
        // Boost node energy levels when intersecting with shockwave
        nodes.forEach((node) => {
          const dx = node.screenX - wave.x;
          const dy = node.screenY - wave.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // If intersection lies in the wave shell band
          if (Math.abs(dist - wave.radius) < 20) {
            node.energyLevel = 1.0; // Fully energized!
          }
        });

        // Delete wave if bounds exceeded
        if (wave.radius >= wave.maxRadius) {
          energyWaves.splice(wIdx, 1);
        } else {
          // Draw wave outline
          const alpha = (1 - wave.radius / wave.maxRadius) * 0.35;
          const waveGrad = ctx.createRadialGradient(wave.x, wave.y, wave.radius - 8, wave.x, wave.y, wave.radius + 8);
          waveGrad.addColorStop(0, "rgba(168, 85, 247, 0)");
          waveGrad.addColorStop(0.5, "rgba(139, 92, 246, " + alpha + ")");
          waveGrad.addColorStop(1, "rgba(99, 102, 241, 0)");

          ctx.strokeStyle = waveGrad;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 6. Draw Connections with Subtle Depth Fog & GPU Draw-Call Batching
      // Group lines by opacity buckets to minimize canvas stroke state transitions!
      const opacityBuckets: { [key: string]: [number, number, string, number][] } = {
        low: [],   // opacity <= 0.1
        mid: [],   // 0.1 < opacity <= 0.2
        high: []   // opacity > 0.2
      };

      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        if (nodeA.screenX < -60 || nodeA.screenX > width + 60 || nodeA.screenY < -60 || nodeA.screenY > height + 60) {
          continue;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          if (nodeB.clusterIndex !== nodeA.clusterIndex) continue; // Only connect nodes within same cluster centroid (clean look!)

          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dz = nodeA.z - nodeB.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDist) {
            // Base connection opacity
            let opacity = (1 - dist / connectionDist) * 0.25;

            // Apply depth fog: nodes further back (z > 100) are faded smoothly into background
            const averageZ = (nodeA.z + nodeB.z) / 2;
            const fogFactor = Math.max(0, Math.min(1, (300 - averageZ) / 400));
            opacity *= fogFactor;

            // Boost opacity if either node is energized by wave
            const energyBoost = Math.max(nodeA.energyLevel, nodeB.energyLevel);
            opacity += energyBoost * 0.45;

            if (opacity > 0.015) {
              const bucket = opacity <= 0.1 ? "low" : opacity <= 0.22 ? "mid" : "high";
              opacityBuckets[bucket].push([i, j, nodeA.color, opacity]);
            }
          }
        }
      }

      // Draw batched lines
      Object.keys(opacityBuckets).forEach((key) => {
        const bucket = opacityBuckets[key];
        if (bucket.length === 0) return;

        ctx.beginPath();
        bucket.forEach(([i, j, baseColor, opacity]) => {
          const nodeA = nodes[i];
          const nodeB = nodes[j];

          ctx.moveTo(nodeA.screenX, nodeA.screenY);
          
          // Render curvature bending when mouse attractions displace them
          if (mouse.active) {
            const midX = (nodeA.screenX + nodeB.screenX) / 2;
            const midY = (nodeA.screenY + nodeB.screenY) / 2;
            
            const dx = mouse.x - midX;
            const dy = mouse.y - midY;
            const mDist = Math.sqrt(dx * dx + dy * dy);
            if (mDist < 120) {
              const bend = (120 - mDist) * 0.06;
              ctx.quadraticCurveTo(midX - dx * bend * 0.08, midY - dy * bend * 0.08, nodeB.screenX, nodeB.screenY);
              return;
            }
          }
          ctx.lineTo(nodeB.screenX, nodeB.screenY);
        });

        // Set opacity based on bucket class
        const opacityVal = key === "low" ? 0.08 : key === "mid" ? 0.18 : 0.4;
        ctx.strokeStyle = "rgba(139, 92, 246, " + opacityVal + ")";
        ctx.lineWidth = key === "high" ? 0.8 : 0.55;
        ctx.stroke();
      });

      // 7. Update and Draw Data Pulses
      if (opacityBuckets.high.length > 0 && activePulses.length < maxActivePulses && Math.random() < 0.06) {
        const randConn = opacityBuckets.high[Math.floor(Math.random() * opacityBuckets.high.length)];
        const fromIdx = randConn[0];
        const toIdx = randConn[1];

        const exists = activePulses.some(p => 
          (p.fromIndex === fromIdx && p.toIndex === toIdx) || 
          (p.fromIndex === toIdx && p.toIndex === fromIdx)
        );

        if (!exists) {
          activePulses.push({
            fromIndex: fromIdx,
            toIndex: toIdx,
            progress: 0,
            speed: 0.009 + Math.random() * 0.012,
            color: nodes[fromIdx].color.replace("0.85", "1")
          });
        }
      }

      // Draw data packets
      activePulses.forEach((pulse, index) => {
        pulse.progress += pulse.speed;

        const nodeA = nodes[pulse.fromIndex];
        const nodeB = nodes[pulse.toIndex];

        const x = nodeA.screenX + (nodeB.screenX - nodeA.screenX) * pulse.progress;
        const y = nodeA.screenY + (nodeB.screenY - nodeA.screenY) * pulse.progress;
        
        const alpha = Math.sin(pulse.progress * Math.PI) * 0.95;
        
        // Ambient soft flare glow behind packet
        const flareGrad = ctx.createRadialGradient(x, y, 0, x, y, 9);
        flareGrad.addColorStop(0, pulse.color.replace("1", String(alpha * 0.6)));
        flareGrad.addColorStop(1, "rgba(0,0,0,0)");
        
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        // Core bright point
        ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        if (pulse.progress >= 1) {
          activePulses.splice(index, 1);
        }
      });

      // 8. Draw Glowing Nodes with Depth Fog
      nodes.forEach((node) => {
        if (node.screenX < -20 || node.screenX > width + 20 || node.screenY < -20 || node.screenY > height + 20) {
          return;
        }

        // Apply breathing pulse + energy wave multiplier
        const pulse = 1 + Math.sin(node.pulseTimer) * 0.15;
        const energyMultiplier = 1 + node.energyLevel * 1.5;
        const finalSize = node.size * pulse * node.screenScale * energyMultiplier;

        // Depth fog factor for nodes
        const fogFactor = Math.max(0, Math.min(1, (300 - node.z) / 400));
        const alpha = (node.energyLevel > 0 ? 0.95 : 0.85) * fogFactor;

        // Core node circle
        ctx.fillStyle = node.color.replace("0.85", String(alpha));
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, finalSize, 0, Math.PI * 2);
        ctx.fill();

        // Volumetric Bloom Glow ring
        const glowRadius = finalSize * (node.energyLevel > 0 ? 6.5 : 4.5);
        const radGrad = ctx.createRadialGradient(
          node.screenX,
          node.screenY,
          finalSize * 0.5,
          node.screenX,
          node.screenY,
          glowRadius
        );
        const glowAlpha = (node.energyLevel > 0 ? 0.55 : 0.3) * fogFactor;
        radGrad.addColorStop(0, node.glowColor.replace("0.35", String(glowAlpha)));
        radGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
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
