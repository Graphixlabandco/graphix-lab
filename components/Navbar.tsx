"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, User, Menu, X, Compass, Calendar, Phone, Sparkles, Home, ArrowRight } from "lucide-react";

interface NavbarProps {
  onNavigate: (section: string) => void;
  onOpenAuth: () => void;
  currentUser: any;
  onLogout: () => void;
}

export default function Navbar({ onNavigate, onOpenAuth, currentUser, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: string) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4"
      >
        <div 
          id="navbar-container"
          className="max-w-7xl mx-auto rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 px-4 md:px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_0_rgba(147,51,234,0.07)]"
        >
          {/* Left Hand Menu Trigger for Mobile */}
          <button
            id="nav-menu-toggle-left"
            onClick={() => setMobileMenuOpen(true)}
            className="btn-liquid-glass md:hidden flex items-center justify-center p-2.5 text-purple-200 cursor-pointer mr-2"
            aria-label="Open menu drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo & Title Section */}
          <button 
            id="nav-logo"
            onClick={() => handleNavClick("hero")} 
            className="flex items-center gap-2.5 text-white font-bold text-xl tracking-wider cursor-pointer group"
          >
            <img
              src="https://cdn.postimage.me/2026/07/30/1000070682.png"
              alt="GraphixLab Logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-purple-500/30 group-hover:border-purple-400 transition-colors bg-black/40"
            />
            <span className="text-gradient-neon font-extrabold uppercase text-lg tracking-wider">
              Graphix Lab
            </span>
          </button>

          {/* Center Navigation links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick("home")}
              className="text-purple-200/80 hover:text-white transition-all duration-300 font-medium cursor-pointer"
            >
              Home
            </button>
            <button
              id="nav-link-portfolio"
              onClick={() => handleNavClick("portfolio")}
              className="text-purple-200/80 hover:text-white transition-all duration-300 font-medium cursor-pointer"
            >
              Services
            </button>
            <button
              id="nav-link-booking"
              onClick={() => handleNavClick("booking")}
              className="text-purple-200/80 hover:text-white transition-all duration-300 font-medium cursor-pointer"
            >
              Book Design
            </button>
            <button
              id="nav-link-workflow"
              onClick={() => handleNavClick("workflow")}
              className="text-purple-200/80 hover:text-white transition-all duration-300 font-medium cursor-pointer"
            >
              Workflow
            </button>
            <button
              id="nav-link-inquire"
              onClick={() => handleNavClick("inquire")}
              className="text-purple-200/80 hover:text-white transition-all duration-300 font-medium cursor-pointer"
            >
              Reviews
            </button>
          </nav>

          {/* Right CTA / Auth Status */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-btn-dashboard"
                  onClick={() => handleNavClick("portal")}
                  className="btn-liquid-glass flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-200 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Hub</span>
                </button>
                <button
                  id="nav-btn-logout"
                  onClick={onLogout}
                  className="hidden md:block px-3 py-1.5 text-xs text-red-300/80 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                id="nav-btn-auth"
                onClick={onOpenAuth}
                className="btn-liquid-glass flex items-center justify-center gap-1.5 w-[110px] sm:w-auto h-[38px] px-3 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white cursor-pointer shrink-0 text-center"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap truncate">Login/Signup</span>
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Left-Sliding Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Quick-closing touch dismisser backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm md:hidden"
            />

            {/* Glassmorphic Sliding Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-[300px] max-w-[85vw] h-full bg-[#131026]/95 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl z-50 md:hidden"
            >
              <div className="space-y-8">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-gradient-neon font-extrabold uppercase text-sm tracking-wider">
                      Graphix Lab
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-liquid-glass p-1.5 text-purple-200 cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Complete Set of Navigation Options */}
                <nav className="flex flex-col gap-2">
                  <button
                    onClick={() => handleNavClick("home")}
                    className="btn-liquid-glass w-full justify-start gap-3 py-3 px-4 text-sm font-semibold text-purple-100 hover:text-white transition-all"
                  >
                    <Home className="w-4 h-4 text-purple-400" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("portfolio")}
                    className="btn-liquid-glass w-full justify-start gap-3 py-3 px-4 text-sm font-semibold text-purple-100 hover:text-white transition-all"
                  >
                    <Compass className="w-4 h-4 text-purple-400" />
                    <span>Services</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("booking")}
                    className="btn-liquid-glass w-full justify-start gap-3 py-3 px-4 text-sm font-semibold text-purple-100 hover:text-white transition-all"
                  >
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Book Design</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("workflow")}
                    className="btn-liquid-glass w-full justify-start gap-3 py-3 px-4 text-sm font-semibold text-purple-100 hover:text-white transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Workflow</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("inquire")}
                    className="btn-liquid-glass w-full justify-start gap-3 py-3 px-4 text-sm font-semibold text-purple-100 hover:text-white transition-all"
                  >
                    <Phone className="w-4 h-4 text-purple-400" />
                    <span>Reviews</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Drawer Footer with Live User Profile Details */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-400/20">
                      <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-bold text-sm">
                        {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : "U"}
                      </div>
                      <div className="truncate text-left">
                        <p className="text-xs font-bold text-white truncate">
                          {currentUser.displayName || "User"}
                        </p>
                        <p className="text-[10px] text-purple-300/60 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNavClick("portal")}
                      className="btn-liquid-glass flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-purple-200"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>My Hub</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-center py-2 rounded-xl text-xs font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="btn-liquid-glass flex items-center justify-center gap-2 w-full py-3 text-xs font-bold uppercase tracking-wider text-white"
                  >
                    <span>Login / Signup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <p className="text-[10px] text-purple-400/30 text-center select-none">
                  Graphix Lab Secure Portal v1.2
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}



