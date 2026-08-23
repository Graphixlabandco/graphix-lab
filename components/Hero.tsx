"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import SloMoReveal from "./SloMoReveal";

interface HeroProps {
  onActionClick: (section: string) => void;
}

export default function Hero({ onActionClick }: HeroProps) {
  return (
    <section 
      id="hero-section"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-transparent pt-20"
    >
      {/* Soft Radiant Ambient Glows to blend beautifully with the global universe background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[140px] pointer-events-none z-1" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none z-1" />

      {/* Centered Background Logo Video Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-w-[1000px] h-full max-h-[70vh] object-contain opacity-20 mix-blend-screen"
        >
          <source src="/logo.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Main Content Container */}
      <div 
        id="hero-content-wrapper"
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Overline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/15 text-purple-300 text-xs font-semibold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Next-Gen Graphic Designing Platform</span>
          </motion.div>
          
          {/* Subheading */}
          <div className="text-sm md:text-base font-bold bg-gradient-to-r from-purple-300 via-purple-100 to-purple-200 bg-clip-text text-transparent tracking-widest uppercase">
            <SloMoReveal text="Welcome to Graphix Lab" delay={0.2} />
          </div>

          {/* Main H1 Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-none">
            <span className="block overflow-hidden pb-1">
              <SloMoReveal text="WHERE IMAGINATION" delay={0.35} />
            </span>
            <span className="text-gradient-neon block overflow-hidden pb-1 mt-2">
              <SloMoReveal text="MEETS GRAPHIC SCIENCE" delay={0.5} />
            </span>
          </h1>

          {/* Description */}
          <p className="text-purple-200/50 text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto pb-4">
            <SloMoReveal text="We don't just design — we engineer experiences that turn visitors into loyal customers." delay={0.65} />
          </p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              id="hero-cta-booking"
              onClick={() => onActionClick("booking")}
              className="btn-liquid-glass w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
            >
              <span>Instant Project Booking</span>
              <ArrowRight className="w-4 h-4 text-purple-300" />
            </button>
            
            <button
              id="hero-cta-portfolio"
              onClick={() => onActionClick("portfolio")}
              className="btn-liquid-glass-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-purple-200 cursor-pointer"
            >
              <span>Explore Portfolio</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

