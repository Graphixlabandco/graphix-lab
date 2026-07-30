"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createBooking } from "@/lib/db";
import { Sparkles, Calendar, FileText, CheckCircle2, User, Mail, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

interface BookingFormProps {
  currentUser: any;
  onOpenAuth: () => void;
  onSuccessRedirect: () => void;
}

const services = [
  {
    id: "brand",
    name: "Logo/Brand Identity",
    description: "Custom corporate logo design, typographical rulesets, and elite luxury branding guidebooks.",
    badge: "Elite"
  },
  {
    id: "uiux",
    name: "UI/UX Design",
    description: "High-fidelity interactive mobile/web blueprints, design systems, and beautiful layout templates.",
    badge: "Premium"
  },
  {
    id: "illustration",
    name: "3D Illustrations",
    description: "Custom low-poly/high-fidelity isometric designs, custom models, and glass textures.",
    badge: "Bespoke"
  },
  {
    id: "motion",
    name: "Animations/Video Editing",
    description: "Video brand reveals, promotional clips, physics-based plasma/particle simulation animations.",
    badge: "Trending"
  }
];

export default function BookingForm({ currentUser, onOpenAuth, onSuccessRedirect }: BookingFormProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<string>("Logo/Brand Identity");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const defaultName = currentUser ? (currentUser.displayName || currentUser.name || "") : "";
  const defaultEmail = currentUser ? (currentUser.email || "") : "";

  const [customName, setCustomName] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState<string | null>(null);

  const clientName = customName !== null ? customName : defaultName;
  const clientEmail = customEmail !== null ? customEmail : defaultEmail;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>( "");

  const handleNextStep = () => {
    if (step === 1 && !selectedService) {
      setErrorMessage("Please select a design service.");
      return;
    }
    if (step === 2 && !bookingDate) {
      setErrorMessage("Please select a target booking date.");
      return;
    }
    setErrorMessage("");
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      setErrorMessage("Please provide your name and email address.");
      return;
    }

    if (!currentUser) {
      setErrorMessage("Please sign in or create an account to secure and monitor your booking.");
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const bookingId = await createBooking({
        userId: currentUser.uid,
        clientName,
        clientEmail,
        serviceType: selectedService,
        bookingDate,
        notes: notes || "No specifications provided."
      });

      // Trigger emails using Resend backend API securely
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: bookingId,
            clientName,
            clientEmail,
            serviceType: selectedService,
            bookingDate,
            notes: notes || "No specifications provided."
          })
        });
      } catch (emailErr) {
        console.error("Failed to send booking notifications:", emailErr);
      }

      setIsSuccess(true);
      setStep(4);
    } catch (error: any) {
      console.error("Booking failed:", error);
      setErrorMessage("Failed to submit booking. Please check database permissions or retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="booking-section"
      className="relative w-full py-24 bg-transparent overflow-hidden border-t border-purple-500/10"
    >
      {/* Visual background rings */}
      <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Title Block */}
        <div className="text-center mb-16">
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-400/20">
            SECURE ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
            BOOK A DESIGN <span className="text-gradient-neon">SESSION</span>
          </h2>
          <p className="text-purple-200/60 text-sm md:text-base max-w-xl mx-auto mt-4">
            Initialize your premium design contract today. Complete our secure 3-step dynamic glass booking wizard.
          </p>
        </div>

        {/* Outer Form Frame with Liquid Glass Style */}
        <div 
          id="booking-form-card"
          className="relative rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] border-purple-500/10"
        >
          {/* Progress Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 text-xs text-purple-300/60 font-semibold">
              <span className={step >= 1 ? "text-purple-300 font-extrabold" : ""}>1. SELECT SERVICE</span>
              <div className="w-12 h-[1px] bg-white/10" />
              <span className={step >= 2 ? "text-purple-300 font-extrabold" : ""}>2. SPECIFICATIONS</span>
              <div className="w-12 h-[1px] bg-white/10" />
              <span className={step >= 3 ? "text-purple-300 font-extrabold" : ""}>3. AUTHENTICATION</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {errorMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: SERVICE CHOICE */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedService(service.name)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        selectedService === service.name
                          ? "bg-purple-500/10 border-purple-400/50 shadow-[0_4px_24px_rgba(168,85,247,0.15)]"
                          : "bg-white/[0.02] border-white/5 hover:border-purple-400/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-end mb-2">
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                          selectedService === service.name ? "border-purple-400 bg-purple-400" : "border-white/20"
                        }`}>
                          {selectedService === service.name && <div className="w-2 h-2 rounded-full bg-[#131026]" />}
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white">{service.name}</h3>
                      <p className="text-purple-200/60 text-xs mt-1.5 leading-relaxed">{service.description}</p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNextStep}
                    className="btn-liquid-glass flex items-center gap-2 px-6 py-3 text-white font-semibold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4 text-purple-300" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATES & BRIEF */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Date Input */}
                <div className="space-y-2">
                  <label className="text-purple-300 text-xs font-bold uppercase tracking-widest block">
                    Target Booking Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-4.5 h-4.5 text-purple-400" />
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-sm"
                    />
                  </div>
                </div>

                {/* Brief specifications text area */}
                <div className="space-y-2">
                  <label className="text-purple-300 text-xs font-bold uppercase tracking-widest block">
                    Design Specifications / Brief
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-3.5 w-4.5 h-4.5 text-purple-400" />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify your target demographics, design styles, dimensions, references, color notes or logo directions..."
                      rows={5}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={handlePrevStep}
                    className="btn-liquid-glass-secondary flex items-center gap-2 px-6 py-3 text-purple-200 font-semibold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="btn-liquid-glass flex items-center gap-2 px-6 py-3 text-white font-semibold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4 text-purple-300" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONTACT & AUTH */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!currentUser ? (
                  <div className="text-center py-6 px-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 mb-6">
                    <span className="text-purple-300 font-bold text-sm block mb-2">Secure Client Account Required</span>
                    <p className="text-purple-200/60 text-xs leading-relaxed max-w-md mx-auto mb-4">
                      Authenticate to link this booking, track revision stages, view invoices, and communicate with our design team.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="btn-liquid-glass inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Authenticate Now</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-2">
                        <label className="text-purple-300 text-xs font-bold uppercase tracking-widest block">
                          Your Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 w-4.5 h-4.5 text-purple-400" />
                          <input
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-sm"
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div className="space-y-2">
                        <label className="text-purple-300 text-xs font-bold uppercase tracking-widest block">
                          Contact Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-purple-400" />
                          <input
                            type="email"
                            required
                            value={clientEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick review of details */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-purple-200/70">
                      <div className="flex justify-between">
                        <span>SELECTED SERVICE:</span>
                        <span className="font-bold text-purple-300">{selectedService}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TARGET BOOKING DATE:</span>
                        <span className="font-bold text-purple-300">{bookingDate}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn-liquid-glass-secondary flex items-center gap-2 px-6 py-3 text-purple-200 font-semibold text-xs tracking-wider uppercase cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-liquid-glass flex items-center gap-2 px-8 py-3 text-white font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Booking...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Confirm Design Session</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && isSuccess && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Booking Initiated Successfully!</h3>
                <p className="text-purple-200/70 text-sm max-w-md mx-auto leading-relaxed">
                  Your project booking is now active in our system as <span className="text-purple-300 font-bold">Pending</span>. The lead designer has been notified. Check your client hub for revision streams, and watch your email inbox for confirmation metrics!
                </p>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setStep(1);
                      setIsSuccess(false);
                      onSuccessRedirect();
                    }}
                    className="btn-liquid-glass px-6 py-3 text-white font-bold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Go to My Client Hub
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
