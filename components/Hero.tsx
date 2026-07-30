"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-1" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-1" />

      {/* Main Content Container - Reduced glassmorphism opacity so the background video is highly visible */}
      <div 
        id="hero-content-wrapper"
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-3xl bg-black/40 backdrop-blur-md border border-white/5 p-8 md:p-12 shadow-[0_16px_48px_rgba(0,0,0,0.6)] max-w-3xl mx-auto"
        >
          {/* Overline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/20 text-purple-200 text-xs font-semibold mb-4 uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>Next-Gen Graphic Designing Platform</span>
          </motion.div>
          
          {/* Subheading with Popup Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.25 }}
            className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-200 via-white to-purple-300 bg-clip-text text-transparent mb-5 tracking-wide drop-shadow-md"
          >
            Welcome to Graphix Lab
          </motion.div>

          {/* Main H1 Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-none mb-6 drop-shadow-lg"
          >
            WHERE IMAGINATION
            <br />
            <span className="text-gradient-neon">
              MEETS GRAPHIC SCIENCE
            </span>
          </motion.h1>

          {/* Updated Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-purple-100/90 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-10 drop-shadow-sm"
          >
            We don&apos;t just design — we engineer experiences that turn visitors into loyal customers.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-none"
          >
            <button
              id="hero-cta-booking"
              onClick={() => onActionClick("booking")}
              className="btn-liquid-glass w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white cursor-pointer"
            >
              <span>Instant Project Booking</span>
              <ArrowRight className="w-4 h-4 text-purple-300" />
            </button>
            
            <button
              id="hero-cta-portfolio"
              onClick={() => onActionClick("portfolio")}
              className="btn-liquid-glass-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-wider text-purple-200 cursor-pointer"
            >
              <span>Explore Portfolio</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

