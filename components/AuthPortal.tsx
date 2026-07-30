"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { createUserProfile } from "@/lib/db";
import { X, Mail, Lock, User, KeyRound, Sparkles, Loader2, Info, Eye, EyeOff } from "lucide-react";

interface AuthPortalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthPortal({ onClose, onSuccess }: AuthPortalProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    if (isSignUp) {
      if (!name) {
        setErrorMessage("Please enter your name.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please check and try again.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });
        if (error) throw error;
        if (!data?.user) throw new Error("Could not create user account.");
        
        // Save profile in Database
        const profile = await createUserProfile(data.user.id, email, name);
        onSuccess({
          uid: data.user.id,
          email: data.user.email,
          displayName: name,
          role: profile.role
        });
      } else {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (!data?.user) throw new Error("Could not authenticate user.");
        
        onSuccess({
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.name || data.user.email?.split("@")[0],
          role: data.user.role || "client"
        });
      }
      onClose();
    } catch (error: any) {
      console.error("Authentication error:", error);
      let msg = error.message || "Please check details and retry.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = (role: "admin" | "client") => {
    const demoUser = role === "admin" ? {
      uid: "demo_admin_uid",
      email: "rvprasad24d@gmail.com",
      displayName: "GraphixLab Owner (Demo)",
      role: "admin"
    } : {
      uid: "demo_client_uid",
      email: email || "client@example.com",
      displayName: name || "Demo Client",
      role: "client"
    };
    onSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Auth Box with Liquid Glass Theme */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl bg-[#131026]/95 backdrop-blur-2xl border border-white/10 p-6 md:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] border-purple-500/10 overflow-hidden"
      >
        {/* Glow circle */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 hover:text-white transition-colors duration-300 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 text-purple-300 mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
            {isSignUp ? "Create User ID" : "Secure User Portal"}
          </h3>
          <p className="text-purple-200/50 text-xs mt-1 leading-relaxed">
            {isSignUp ? "Register your Graphix Lab account on our secure portal" : "Sign in to access your projects and manage design bookings"}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Sign Up Only) */}
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                  <input
                    type="text"
                    required={isSignUp}
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs"
              />
            </div>
          </div>

          {/* Password Field with Eye Toggle */}
          <div className="space-y-1">
            <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-purple-400/70 hover:text-purple-200 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Sign Up Only) with Eye Toggle */}
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required={isSignUp}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-purple-400/70 hover:text-purple-200 transition-colors cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-liquid-glass w-full flex items-center justify-center gap-2 px-5 py-3 text-white font-bold text-xs tracking-widest uppercase disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isSignUp ? "Generate Account" : "Enter into Graphix Lab"}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toggle and Info Section */}
        <div className="mt-5 border-t border-white/5 pt-4 text-center space-y-3">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage("");
            }}
            className="text-xs text-purple-400 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
          >
            {isSignUp ? "Already have an account? Log In" : "Need a new account? Sign Up"}
          </button>

          {/* Quick Demo Mode Access */}
          <div className="pt-2">
            <p className="text-[10px] uppercase font-bold text-purple-300/60 tracking-wider mb-2">Instant Demo Session</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoAccess("client")}
                className="btn-liquid-glass-secondary py-2 px-3 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                Client Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess("admin")}
                className="btn-liquid-glass py-2 px-3 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                Admin Demo
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-[10px] text-purple-400/50 text-left p-2.5 rounded-xl bg-white/[0.01]">
            <Info className="w-3.5 h-3.5 shrink-0 text-purple-500/50" />
            <span>Logging in with <b>rvprasad24d@gmail.com</b> automatically grants Graphix Lab Admin Management access.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

