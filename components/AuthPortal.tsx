"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { createUserProfile } from "@/lib/db";
import { X, Mail, Lock, User, KeyRound, Sparkles, Loader2, Info, Eye, EyeOff, ArrowLeft, Hash } from "lucide-react";

export type AuthMode = 'signin' | 'signup' | 'forgot' | 'verify-otp' | 'reset';

interface AuthPortalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: AuthMode;
}

export default function AuthPortal({ onClose, onSuccess, initialMode = 'signin' }: AuthPortalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (mode === 'forgot') {
      if (!email) {
        setErrorMessage("Please enter your email address.");
        return;
      }
      setIsSubmitting(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/hub`,
        });
        if (error) throw error;
        setSuccessMessage("A verification link/code has been sent to your email. Please check your Inbox and Spam folder!");
        setTimeout(() => {
          setMode('verify-otp');
          setSuccessMessage("");
        }, 3000);
      } catch (error: any) {
        console.error("Reset password error:", error);
        const errMsg = error && typeof error === "object"
          ? error.message || error.error_description || JSON.stringify(error)
          : String(error);
        setErrorMessage(errMsg || "Could not send verification code. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'verify-otp') {
      if (!otpCode) {
        setErrorMessage("Please enter the verification code.");
        return;
      }
      setIsSubmitting(true);
      try {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode.trim(),
          type: 'recovery'
        });
        if (error) throw error;
        setSuccessMessage("Code verified successfully! Please enter your new password.");
        setTimeout(() => {
          setMode('reset');
          setSuccessMessage("");
        }, 1500);
      } catch (error: any) {
        console.error("OTP verification error:", error);
        const errMsg = error && typeof error === "object"
          ? error.message || error.error_description || JSON.stringify(error)
          : String(error);
        setErrorMessage(errMsg || "Invalid or expired verification code. Please check and try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'reset') {
      if (!password || !confirmPassword) {
        setErrorMessage("Please fill in both password fields.");
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
      setIsSubmitting(true);
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        
        // Log out user from temporary reset session so they must log in manually
        await supabase.auth.signOut();
        
        setSuccessMessage("Password saved successfully! Redirecting to login...");
        setTimeout(() => {
          setMode('signin');
          setSuccessMessage("");
          setPassword("");
          setConfirmPassword("");
          setOtpCode("");
        }, 2500);
      } catch (error: any) {
        console.error("Update password error:", error);
        setErrorMessage(error.message || "Could not update password. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    if (mode === 'signup') {
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
    try {
      if (mode === 'signup') {
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
        if (typeof window !== "undefined") {
          sessionStorage.setItem("just_signed_up", "true");
        }
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
        
        const isAdminEmail = data.user.email?.toLowerCase() === "graphixlab07@gmail.com" || data.user.email?.toLowerCase() === "admin@graphixlab.com";
        const userRole = isAdminEmail ? "admin" : "client";

        onSuccess({
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.name || data.user.email?.split("@")[0],
          role: userRole
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

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/hub`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      const errMsg = error && typeof error === "object"
        ? error.message || error.error_description || JSON.stringify(error)
        : String(error);
      setErrorMessage(errMsg || "Could not login with Google. Please try again.");
    }
  };


  const getTitle = () => {
    switch (mode) {
      case 'signup': return "Create User ID";
      case 'forgot': return "Recover Password";
      case 'verify-otp': return "Verify OTP Code";
      case 'reset': return "Reset Password";
      default: return "Secure User Portal";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return "Register your Graphix Lab account on our secure portal";
      case 'forgot': return "Enter your email to receive a secure verification code";
      case 'verify-otp': return "Type the 6-digit verification code sent to your inbox";
      case 'reset': return "Enter your new password to regain access to your account";
      default: return "Sign in to access your projects and manage design bookings";
    }
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
            {getTitle()}
          </h3>
          <p className="text-purple-200/50 text-xs mt-1 leading-relaxed">
            {getSubtitle()}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 mb-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-xs">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Sign Up Only) */}
          <AnimatePresence>
            {mode === 'signup' && (
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
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field (Sign In, Sign Up, and Forgot modes) */}
          {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
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
          )}

          {/* OTP Code Field (Verify OTP mode only) */}
          {mode === 'verify-otp' && (
            <div className="space-y-1">
              <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                Verification Code
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs tracking-widest text-center font-bold"
                />
              </div>
            </div>
          )}

          {/* Password Field (Sign In, Sign Up, and Reset modes) */}
          {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                  {mode === 'reset' ? "New Password" : "Password"}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-[9px] text-purple-400 hover:text-white transition-colors duration-200 font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
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
          )}

          {/* Confirm Password Field (Sign Up and Reset modes) */}
          <AnimatePresence>
            {(mode === 'signup' || mode === 'reset') && (
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
                    required
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
                  <span>
                    {mode === 'signup' && "Generate Account"}
                    {mode === 'forgot' && "Send Code"}
                    {mode === 'verify-otp' && "Verify Code"}
                    {mode === 'reset' && "Update Password"}
                    {mode === 'signin' && "Enter into Graphix Lab"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Google OAuth Divider & Button */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[10px] font-bold text-purple-400/40 uppercase tracking-widest">OR</span>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 text-white font-bold text-xs tracking-wider transition-all duration-300 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0 text-purple-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.565 0-6.452-2.887-6.452-6.452s2.887-6.452 6.452-6.452c1.611 0 3.08.59 4.218 1.558l3.14-3.14C19.347 2.226 15.935 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.262 0 11.36-4.506 11.36-11.24 0-.756-.067-1.488-.192-2.195H12.24z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Toggle and Info Section */}
        <div className="mt-5 border-t border-white/5 pt-4 text-center space-y-3">
          {mode === 'forgot' || mode === 'verify-otp' || mode === 'reset' ? (
            <button
              onClick={() => {
                setMode('signin');
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="text-xs text-purple-400 hover:text-white transition-colors duration-200 font-medium cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Log In</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="text-xs text-purple-400 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
            >
              {mode === 'signin' ? "Need a new account? Sign Up" : "Already have an account? Log In"}
            </button>
          )}

          <div className="flex items-start gap-2 text-[10px] text-purple-400/50 text-left p-2.5 rounded-xl bg-white/[0.01]">
            <Info className="w-3.5 h-3.5 shrink-0 text-purple-500/50" />
            <span>Logging in with <b>graphixlab07@gmail.com</b> automatically grants Graphix Lab Admin Management access.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
