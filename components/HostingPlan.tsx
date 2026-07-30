"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Palette, 
  Layout, 
  Box, 
  Zap, 
  Video, 
  ChevronRight, 
  CheckCircle,
  Sparkles,
  Layers,
  Flame
} from "lucide-react";

interface ServiceBlueprint {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  deliverables: string[];
  recommendation: string;
}

const blueprintServices: ServiceBlueprint[] = [
  {
    id: "branding",
    icon: Palette,
    title: "Brand Identity & Logo Design",
    subtitle: "Visual identity, logo architecture, & brand systems",
    badge: "SERVICE 01 | BRANDING",
    description: "Building memorable visual foundations from the ground up. We create unique logo marks, color systems, typography pairs, and complete brand guidelines that give your business a distinct market presence.",
    deliverables: [
      "Vector Logo Design & Brandmarks",
      "Color Palettes & Typography Systems",
      "Comprehensive Brand Identity Guidelines"
    ],
    recommendation: "Phase 1 Baseline: Establishing core visual DNA and scalable vector assets for omni-channel deployment."
  },
  {
    id: "product-design",
    icon: Layout,
    title: "UI/UX & Digital Product Design",
    subtitle: "User-centric interfaces, wireframes, & interactive prototypes",
    badge: "SERVICE 02 | PRODUCT DESIGN",
    description: "Designing intuitive, aesthetically rich digital experiences. We bridge user needs with business goals using research-backed wireframing, modern visual design, and interactive web/app prototyping.",
    deliverables: [
      "User Research & Interactive Wireframes",
      "High-Fidelity UI Design & Design Systems",
      "Clickable Prototypes & UX Documentation"
    ],
    recommendation: "Phase 2 Architecture: Structuring seamless user flows with pixel-perfect component libraries."
  },
  {
    id: "3d-creative",
    icon: Box,
    title: "3D Illustrations & Structural Design",
    subtitle: "3D spatial design, stylized illustrations, & holographic concepts",
    badge: "SERVICE 03 | 3D CREATIVE",
    description: "Translating flat ideas into immersive 3D visual assets. From modern 3D website illustrations and product renders to holographic structures and environment designs.",
    deliverables: [
      "Custom 3D Asset & Scene Modeling",
      "Stylized & Photorealistic 3D Illustrations",
      "Texturing, Lighting, & Material Development"
    ],
    recommendation: "Phase 3 Spatial: Adding volumetric depth, realistic studio lighting, and custom visual materials."
  },
  {
    id: "motion-design",
    icon: Zap,
    title: "Motion Graphics & Visual Effects (VFX)",
    subtitle: "Kinetic typography, animated logos, & energy physics",
    badge: "SERVICE 04 | MOTION DESIGN",
    description: "Bringing graphics to life through precise timing, kinetic motion, and VFX. We specialize in dynamic 2D/3D logo animations, parallel line energy simulations, holographic effects, and UI animation.",
    deliverables: [
      "2D & 3D Logo Reveal Animations",
      "Custom Particle & Lightning VFX",
      "Animated UI Components & Micro-Interactions"
    ],
    recommendation: "Phase 4 Dynamics: Elevating static graphics into fluid, high-energy kinetic motion experiences."
  },
  {
    id: "video-editing",
    icon: Video,
    title: "Post-Production & Video Editing",
    subtitle: "Cinematic cuts, sound design, & color grading",
    badge: "SERVICE 05 | VIDEO EDITING",
    description: "Transforming raw footage into high-impact visual stories. We handle seamless pacing, sound assembly, visual polish, and color grading for promotional content, ads, and showreels.",
    deliverables: [
      "Commercial & Promotional Video Cuts",
      "Sound Design & Audio Synchronization",
      "Color Grading & Final Delivery Formats"
    ],
    recommendation: "Phase 5 Master: Finalizing cinematic cuts, audio spatial mastering, and broadcast-ready delivery."
  }
];

export default function HostingPlan() {
  const [activeServiceId, setActiveServiceId] = useState<string>("branding");

  const activeService = blueprintServices.find((s) => s.id === activeServiceId) || blueprintServices[0];

  return (
    <section 
      id="hosting-plan-section"
      className="relative w-full py-24 bg-transparent overflow-hidden border-t border-purple-500/10"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-purple-300 text-xs font-bold uppercase tracking-widest bg-purple-500/15 px-3.5 py-1.5 rounded-full border border-purple-400/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            STUDIO WORKFLOW
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
            OUR PRODUCTION STRATEGY & <span className="text-gradient-neon">BLUEPRINT</span>
          </h2>
          <p className="text-purple-200/70 text-sm md:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            How Graphix Lab crafts end-to-end brand identity, digital product design, 3D illustrations, dynamic video, and motion graphics.
          </p>
        </div>

        {/* Dynamic Interactive Split Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Services Selector List (Left Col) */}
          <div className="md:col-span-5 space-y-3">
            {blueprintServices.map((service) => {
              const IconComp = service.icon;
              const isActive = activeServiceId === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveServiceId(service.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer ${
                    isActive 
                      ? "bg-purple-500/20 border-purple-400/50 shadow-[0_4px_25px_rgba(168,85,247,0.15)] ring-1 ring-purple-400/30"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                      isActive ? "bg-purple-500/30 border-purple-400/60 text-purple-200" : "bg-white/5 border-white/10 text-purple-400/60"
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider block">
                        {service.badge.split("|")[0].trim()}
                      </span>
                      <h4 className={`text-sm font-bold tracking-tight truncate ${isActive ? "text-white" : "text-purple-200/70"}`}>
                        {service.title}
                      </h4>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 text-purple-400 transition-transform ${isActive ? "rotate-90 text-purple-300" : "opacity-40"}`} />
                </button>
              );
            })}
          </div>

          {/* Details Panel (Right Col) */}
          <div className="md:col-span-7">
            {blueprintServices.map((service) => {
              if (activeServiceId !== service.id) return null;
              const IconComp = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 md:p-8 space-y-6 text-left shadow-2xl"
                >
                  {/* Step Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-400/40 text-purple-200 shadow-inner">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{service.title}</h3>
                        <p className="text-xs text-purple-300 font-medium mt-1">{service.subtitle}</p>
                      </div>
                    </div>
                    <div className="self-start sm:self-center shrink-0">
                      <span className="text-[11px] uppercase font-extrabold text-purple-300 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full tracking-wider block">
                        {service.badge}
                      </span>
                    </div>
                  </div>

                  {/* Body Description */}
                  <p className="text-purple-100/80 text-sm leading-relaxed font-normal">
                    {service.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] uppercase font-bold text-purple-300 tracking-widest flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      CORE DELIVERABLES & ASSETS
                    </span>
                    <div className="space-y-2.5 bg-black/20 p-4 rounded-2xl border border-white/5">
                      {service.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs md:text-sm text-purple-100 font-medium">
                          <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Studio Workflow Milestone Banner */}
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-400/20 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-purple-400" />
                      <span>Pipeline Milestone & Scope</span>
                    </span>
                    <p className="text-xs text-purple-200/70 leading-relaxed font-normal">
                      {service.recommendation}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
