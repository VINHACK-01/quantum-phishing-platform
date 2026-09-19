import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playQuantumPulse, playClick } from '@/lib/soundFx';
import { Sparkles, Zap, Shield, Eye, RefreshCw } from 'lucide-react';

/**
 * Bruno Simon inspired interactive 3D particle physics & quantum lattice canvas.
 * Simulates quantum entanglement states, mouse repulsion physics, and expanding shockwaves.
 */
export default function QuantumCanvas({ className = '' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mode, setMode] = useState('quantum'); // 'quantum' | 'matrix' | 'sphere'
  const [particleCount, setParticleCount] = useState(85);
  const [pulseCount, setPulseCount] = useState(0);
  const [fps, setFps] = useState(60);

  // Mouse & physics tracking
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    isHovered: false,
    radius: 140,
  });

  const shockwavesRef = useRef([]);

  // Shockwave trigger
  const triggerShockwave = useCallback((cx, cy) => {
    playQuantumPulse();
    shockwavesRef.current.push({
      x: cx,
      y: cy,
      radius: 5,
      maxRadius: 320,
      opacity: 0.9,
      speed: 9,
    });
    setPulseCount((c) => c + 1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 340);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 340;
    };

    window.addEventListener('resize', handleResize);

    // Initialize 3D Quantum Particles
    const particles = [];
    const focalLength = 300;

    for (let i = 0; i < particleCount; i++) {
      // 3D coordinates in a simulated cube / sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 120 + Math.random() * 160;

      particles.push({
        // 3D coordinates relative to center
        x3d: r * Math.sin(phi) * Math.cos(theta),
        y3d: r * Math.sin(phi) * Math.sin(theta),
        z3d: r * Math.cos(phi),
        // Velocities
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.8,
        // Base projected 2D screen positions
        x: width / 2,
        y: height / 2,
        // Physics displacement from mouse/shockwaves
        dx: 0,
        dy: 0,
        baseSize: 2 + Math.random() * 2.5,
        color: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#dc2626' : '#ffffff',
        pulse: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.02,
      });
    }

    let rotX = 0;
    let rotY = 0;
    let lastTime = performance.now();
    let frameCounter = 0;

    const render = (time) => {
      // FPS calculation
      frameCounter++;
      if (time - lastTime >= 1000) {
        setFps(Math.round((frameCounter * 1000) / (time - lastTime)));
        frameCounter = 0;
        lastTime = time;
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Rotate camera gently over time + follow mouse tilt
      rotX += 0.002;
      rotY += 0.003;

      const targetRotX = (mouseRef.current.y / height - 0.5) * 0.4;
      const targetRotY = (mouseRef.current.x / width - 0.5) * 0.4;

      const currentRotX = rotX + targetRotX;
      const currentRotY = rotY + targetRotY;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      // Smooth mouse lerp
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      // Update and draw shockwaves
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += sw.speed;
        sw.opacity *= 0.95;

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${sw.opacity})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220, 38, 38, ${sw.opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (sw.radius > sw.maxRadius || sw.opacity < 0.02) {
          shockwavesRef.current.splice(s, 1);
        }
      }

      // Update particles
      particles.forEach((p) => {
        // Natural 3D rotation
        let x1 = p.x3d * cosY - p.z3d * sinY;
        let z1 = p.z3d * cosY + p.x3d * sinY;

        let y1 = p.y3d * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y3d * sinX;

        // 3D Perspective Projection
        const scale = focalLength / (focalLength + z2 + 200);
        const projX = centerX + x1 * scale;
        const projY = centerY + y1 * scale;

        // Physics: Spring back to projected position
        p.dx *= 0.88;
        p.dy *= 0.88;

        // Interactive Mouse Repulsion Physics
        if (mouse.isHovered) {
          const mdx = (projX + p.dx) - mouse.x;
          const mdy = (projY + p.dy) - mouse.y;
          const dist = Math.hypot(mdx, mdy);

          if (dist < mouse.radius && dist > 1) {
            const force = ((mouse.radius - dist) / mouse.radius) * 14;
            p.dx += (mdx / dist) * force;
            p.dy += (mdy / dist) * force;
          }
        }

        // Interactive Shockwave Physics
        shockwavesRef.current.forEach((sw) => {
          const sdx = (projX + p.dx) - sw.x;
          const sdy = (projY + p.dy) - sw.y;
          const sDist = Math.hypot(sdx, sdy);
          const diff = Math.abs(sDist - sw.radius);

          if (diff < 40 && sDist > 1) {
            const push = ((40 - diff) / 40) * 18 * sw.opacity;
            p.dx += (sdx / sDist) * push;
            p.dy += (sdy / sDist) * push;
          }
        });

        p.x = projX + p.dx;
        p.y = projY + p.dy;
        p.scale = Math.max(0.2, scale);
        p.pulse += p.speed;
      });

      // Draw Entanglement Lines between nearby particles (3D Quantum Network)
      const maxDistance = mode === 'sphere' ? 65 : 85;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.35 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
            gradient.addColorStop(1, `rgba(220, 38, 38, ${alpha})`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.75 * p1.scale;
            ctx.stroke();
          }
        }
      }

      // Draw Particles with Glowing Quantum Halos
      particles.forEach((p) => {
        const rad = p.baseSize * p.scale * (1 + Math.sin(p.pulse) * 0.25);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);

        // Core fill
        ctx.fillStyle = p.color;
        ctx.fill();

        // Subtle Quantum Halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = p.color === '#ef4444'
          ? 'rgba(239, 68, 68, 0.2)'
          : p.color === '#dc2626'
          ? 'rgba(220, 38, 38, 0.2)'
          : 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, mode, triggerShockwave]);

  // Handle Mouse Events
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.targetX = e.clientX - rect.left;
    mouseRef.current.targetY = e.clientY - rect.top;
    mouseRef.current.isHovered = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.isHovered = false;
    mouseRef.current.targetX = -1000;
    mouseRef.current.targetY = -1000;
  };

  const handleClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    triggerShockwave(cx, cy);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative w-full h-[320px] rounded-2xl overflow-hidden border border-red-900/40 bg-[#080808] shadow-[0_0_40px_rgba(239,68,68,0.15)] cursor-crosshair select-none ${className}`}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />

      {/* Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Top Left HUD Telemetry */}
      <div className="absolute top-3.5 left-4 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#050505]/90 backdrop-blur-md border border-red-900/40 text-[11px] font-mono text-red-300 shadow">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>VQC LATTICE: SIMULATING</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400">
          <span>FPS:</span>
          <span className="text-white font-bold">{fps}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400">
          <span>PULSES:</span>
          <span className="text-red-400 font-bold">{pulseCount}</span>
        </div>
      </div>

      {/* Top Right Interactive Controls */}
      <div className="absolute top-3.5 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => {
            playClick();
            setMode(mode === 'quantum' ? 'sphere' : 'quantum');
          }}
          className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono border border-neutral-800 hover:border-red-900/50 transition-all flex items-center gap-1.5 cursor-pointer shadow"
          title="Toggle Lattice Geometry"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span className="capitalize">{mode} Mode</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              triggerShockwave(rect.width / 2, rect.height / 2);
            }
          }}
          className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-semibold border border-red-500/40 shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>Shockwave</span>
        </button>
      </div>

      {/* Bottom Center Click Instruction Pill */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-[#050505]/90 backdrop-blur-md border border-neutral-800 text-[10px] font-mono text-neutral-400 flex items-center gap-2">
          <span className="text-red-500">⚡ Interactive Bruno Simon Canvas</span>
          <span className="text-neutral-600">•</span>
          <span>Hover to repel • Click to blast shockwave</span>
        </div>
      </div>
    </div>
  );
}
