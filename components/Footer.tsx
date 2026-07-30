"use client";

import React from "react";
import { Mail, Instagram, Phone } from "lucide-react";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.9 9.9 0 0 0-6.98-2.879c-5.443 0-9.87 4.37-9.874 9.8.001 2.03.52 3.541 1.503 5.097l-.988 3.605 3.73-.969zm10.416-5.705c-.272-.136-1.61-.794-1.859-.885-.249-.09-.431-.136-.612.136-.181.272-.703.885-.861 1.067-.158.181-.317.204-.589.068-.272-.136-1.15-.424-2.19-1.353-.809-.721-1.355-1.614-1.514-1.886-.158-.272-.017-.419.119-.554.122-.122.272-.317.408-.476.136-.159.181-.272.272-.453.09-.181.045-.34-.023-.476-.068-.136-.612-1.475-.839-2.02-.221-.531-.443-.459-.612-.468-.158-.008-.34-.01-.522-.01s-.476.068-.725.34c-.249.272-.951.93-1.951 1.885s-1.449 1.885-1.449 3.812 1.404 3.786 1.6 4.036c.197.25 2.761 4.218 6.69 5.918.934.404 1.663.645 2.23.825.939.297 1.794.256 2.47.155.753-.113 2.31-.944 2.631-1.859.322-.915.322-1.701.226-1.859-.096-.158-.317-.249-.589-.385z" />
  </svg>
);

export default function Footer() {
  return (
    <footer 
      id="footer" 
      className="relative w-full py-16 bg-[#0D0B18]/90 backdrop-blur-md border-t border-white/5 overflow-hidden"
    >
      {/* Soft background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-72 h-72 bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center justify-between">
          
          {/* Left Column - Branding */}
          <div className="md:col-span-5 text-center md:text-left space-y-3">
            <h3 className="text-2xl font-black text-white tracking-widest uppercase flex items-center justify-center md:justify-start gap-3">
              <img
                src="https://cdn.postimage.me/2026/07/30/1000070682.png"
                alt="GraphixLab Logo"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-purple-500/30 bg-black/40"
              />
              <span>GRAPHIXLAB</span>
            </h3>
            <p className="text-purple-200/50 text-xs font-medium italic">
              Designing Experiences
            </p>
            <p className="text-purple-200/60 text-xs max-w-sm leading-relaxed pt-2">
              Transforming creative concepts into production-grade visual assets and robust digital environments. Crafting modern, immersive brand identity systems.
            </p>
          </div>

          {/* Right Column - Social Links & Quick Contact info */}
          <div className="md:col-span-7 flex flex-col items-center md:items-end space-y-5">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-400/20">
              Connect With Us
            </h4>

            {/* Horizontal Grid of Interactive Contact Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/graphix_lab07?igsh=NmVxdDF6eTFxdzF2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-purple-500/10 hover:border-purple-400/20 text-purple-200 hover:text-white transition-all duration-300 group text-center"
              >
                <Instagram className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300 shrink-0" />
                <span className="text-[11px] font-semibold tracking-wide truncate">Instagram</span>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/message/MTORVP6YP2XUP1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-purple-500/10 hover:border-purple-400/20 text-purple-200 hover:text-white transition-all duration-300 group text-center"
              >
                <WhatsAppIcon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300 shrink-0" />
                <span className="text-[11px] font-semibold tracking-wide truncate">WhatsApp</span>
              </a>

              {/* Gmail */}
              <a 
                href="mailto:graphixlab07@gmail.com" 
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-purple-500/10 hover:border-purple-400/20 text-purple-200 hover:text-white transition-all duration-300 group text-center"
              >
                <Mail className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300 shrink-0" />
                <span className="text-[11px] font-semibold tracking-wide truncate">Email</span>
              </a>

              {/* Phone */}
              <a 
                href="tel:+917013128881" 
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-purple-500/10 hover:border-purple-400/20 text-purple-200 hover:text-white transition-all duration-300 group text-center"
              >
                <Phone className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300 shrink-0" />
                <span className="text-[11px] font-semibold tracking-wide truncate">Call Us</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright details */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-purple-200/40">
            © 2026 Graphix Lab. All rights reserved.
          </p>
          <div className="flex gap-6 text-[11px] text-purple-200/40">
            <span className="hover:text-purple-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-purple-300 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
