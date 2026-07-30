"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createTestimonial, getTestimonials, Testimonial } from "@/lib/db";
import { User, MessageSquare, Send, CheckCircle, Loader2, Star } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState<string>("");
  const [subject, setSubject] = useState<string>("Logo/Brand Identity");
  const [message, setMessage] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Testimonials display list
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);

  // Load reviews on mount
  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error("Failed to load testimonials:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    }
    loadReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please provide your name.");
      return;
    }
    if (!message.trim()) {
      setErrorMessage("Please enter your message brief.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const testimonialData = {
        name,
        subject,
        message,
        rating
      };
      
      const newId = await createTestimonial(testimonialData);
      
      // Update local state so it appears immediately below
      const addedReview: Testimonial = {
        id: newId,
        ...testimonialData,
        createdAt: new Date().toISOString()
      };
      
      setTestimonials((prev) => [addedReview, ...prev]);
      setIsSuccess(true);
      
      // Reset form
      setName("");
      setSubject("Logo/Brand Identity");
      setMessage("");
      setRating(5);
    } catch (error) {
      console.error("Testimonial submission failed:", error);
      setErrorMessage("Failed to submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceOptions = [
    "Logo/Brand Identity",
    "UI/UX Design",
    "3D Illustrations",
    "Animations/Video Editing",
    "Customised Service"
  ];

  return (
    <section 
      id="inquire-section"
      className="relative w-full py-24 bg-transparent overflow-hidden border-t border-purple-500/10"
    >
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Title block */}
        <div className="text-center mb-16">
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-400/20">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-4 uppercase">
            WHAT OUR <span className="text-gradient-neon">CLIENTS SAY</span>
          </h2>
          <p className="text-purple-200/60 text-sm md:text-base max-w-xl mx-auto mt-4">
            Honest feedback from the clients and team who trust us with their brands
          </p>
        </div>

        {/* Card containing centered Testimonial review submission form */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 md:p-8 shadow-xl">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form 
                  key="testimonial-form"
                  onSubmit={handleSubmit} 
                  className="space-y-5 text-left"
                >
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-purple-400" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Subject (Project / Service select option) */}
                  <div className="space-y-1.5">
                    <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                      Select Project or Service Chosen
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#131026]/90 border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs cursor-pointer"
                    >
                      {serviceOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#131026] text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message brief */}
                  <div className="space-y-1.5">
                    <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                      Message Brief
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-purple-400" />
                      <textarea
                        required
                        placeholder="Share your experience with Graphix Lab..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-purple-400 focus:bg-white/[0.04] transition-all duration-300 text-xs resize-none"
                      />
                    </div>
                  </div>

                  {/* Star Rating Selection */}
                  <div className="space-y-2">
                    <label className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => setRating(index)}
                          onMouseEnter={() => setHoverRating(index)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors duration-200 ${
                              index <= (hoverRating || rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-purple-300/30 fill-transparent"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Review Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-liquid-glass w-full flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white uppercase tracking-wider">Review Submitted!</h4>
                  <p className="text-purple-200/60 text-xs leading-relaxed max-w-sm mx-auto">
                    Your feedback has been successfully registered. Your review is displayed in the live list below.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="btn-liquid-glass-secondary px-4 py-2 text-purple-300 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Write Another Review
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Display Reviews Section below the Testimonial form */}
        <div className="mt-20 border-t border-white/5 pt-16">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider text-center mb-10">
            RECENT CLIENT FEEDBACK
          </h3>

          {isLoadingReviews ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              <p className="text-xs text-purple-200/40">Synchronizing testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white/[0.01] border border-white/5">
              <p className="text-xs text-purple-200/40 italic">No reviews submitted yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl bg-white/[0.01] backdrop-blur-md border border-white/5 p-5 flex flex-col justify-between text-left space-y-4 shadow-lg hover:border-purple-500/10 transition-colors duration-300"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white truncate max-w-[70%]">{review.name}</p>
                      {/* Star Display */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/10 fill-transparent"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <span className="inline-block text-[9px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded border border-purple-400/10">
                      {review.subject}
                    </span>

                    <p className="text-purple-200/70 text-xs leading-relaxed italic pt-1">
                      &ldquo;{review.message}&rdquo;
                    </p>
                  </div>

                  <div className="text-[9px] text-purple-400/30 flex justify-between items-center pt-3 border-t border-white/5">
                    <span>VERIFIED CLIENT</span>
                    <span suppressHydrationWarning>
                      {review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : "Recently"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
