"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getUserProfile, createUserProfile, UserProfile } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UniverseBackground from "@/components/UniverseBackground";
import Portfolio from "@/components/Portfolio";
import BookingForm from "@/components/BookingForm";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import AuthPortal from "@/components/AuthPortal";
import ClientDashboard from "@/components/ClientDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import HostingPlan from "@/components/HostingPlan";
import { motion, AnimatePresence } from "motion/react";
import { Sliders, Sparkles, LayoutDashboard, CalendarRange, FolderLock } from "lucide-react";
import RiyaChatbot from "@/components/RiyaChatbot";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Greeting Toast Notification States
  const isInitialAuthCheck = useRef(true);
  const [welcomeToast, setWelcomeToast] = useState<{ message: string; visible: boolean } | null>(null);

  // References for scrolling
  const heroRef = useRef<HTMLDivElement | null>(null);
  const portfolioRef = useRef<HTMLDivElement | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);
  const inquireRef = useRef<HTMLDivElement | null>(null);
  const planRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  // Synchronize Supabase Auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("reset");
        setIsAuthOpen(true);
        return;
      }

      const user = session?.user;
      if (user) {
        // Fetch detailed profile for roles (admin vs client)
        try {
          let profile = await getUserProfile(user.id);
          let isNewUser = false;
          if (!profile) {
            isNewUser = true;
            // Automatically provision a client profile for OAuth sign-in users
            const displayName = user.user_metadata?.name || user.email?.split("@")[0];
            profile = await createUserProfile(user.id, user.email!, displayName);
          }
          const isAdminEmail = user.email?.toLowerCase() === "graphixlab07@gmail.com" || user.email?.toLowerCase() === "admin@graphixlab.com";
          const userRole = isAdminEmail ? "admin" : (profile?.role || "client");

          setUserProfile({
            ...(profile || {}),
            role: userRole
          } as UserProfile);

          setCurrentUser({
            uid: user.id,
            email: user.email,
            displayName: user.user_metadata?.name || user.email?.split("@")[0],
            role: userRole
          });

          // Trigger floating toast message on explicit user logins / signups
          if (!isInitialAuthCheck.current) {
            const justSignedUp = typeof window !== "undefined" && sessionStorage.getItem("just_signed_up") === "true";
            if (justSignedUp) {
              sessionStorage.removeItem("just_signed_up");
              isNewUser = true;
            }

            const displayName = user.user_metadata?.name || user.email?.split("@")[0];
            const message = isNewUser
              ? `Hello ${displayName}, welcome to Graphix Lab`
              : `Hello ${displayName}, welcome back to Graphix Lab`;

            setWelcomeToast({ message, visible: true });

            // Auto-hide the welcome message after 5 seconds
            setTimeout(() => {
              setWelcomeToast(prev => prev ? { ...prev, visible: false } : null);
            }, 5000);
          }
        } catch (error) {
          console.error("Error loading or provisioning user profile:", error);
          setCurrentUser({
            uid: user.id,
            email: user.email,
            displayName: user.user_metadata?.name || user.email?.split("@")[0],
            role: "client"
          });
        } finally {
          setIsLoadingAuth(false);
          isInitialAuthCheck.current = false;
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsLoadingAuth(false);
        isInitialAuthCheck.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setUserProfile(null);
      setActiveSection("hero");
      scrollToSection("hero");
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  const handleAuthSuccess = (user: any) => {
    // Auth portal updates state, trigger automatic redirection to user hub
    setActiveSection("portal");
    setTimeout(() => {
      scrollToSection("portal");
    }, 200);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    
    let targetRef: React.RefObject<HTMLDivElement | null> | null = null;
    if (sectionId === "hero" || sectionId === "home") targetRef = heroRef;
    if (sectionId === "portfolio") targetRef = portfolioRef;
    if (sectionId === "booking") targetRef = bookingRef;
    if (sectionId === "workflow" || sectionId === "hosting-plan") targetRef = planRef;
    if (sectionId === "inquire") targetRef = inquireRef;
    if (sectionId === "portal") targetRef = portalRef;

    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Premium 3D cosmic background */}
      <UniverseBackground />

      {/* Sticky frosted glass navbar */}
      <Navbar
        onNavigate={scrollToSection}
        onOpenAuth={() => { setAuthMode('signin'); setIsAuthOpen(true); }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Hero Section Container */}
      <div ref={heroRef} id="home">
        <Hero onActionClick={scrollToSection} />
      </div>

      {/* Portfolio Section */}
      <div ref={portfolioRef} id="portfolio">
        <Portfolio currentUser={currentUser} />
      </div>

      {/* Booking Form Wizard */}
      <div ref={bookingRef} id="booking">
        <BookingForm
          key={currentUser ? currentUser.uid : "guest"}
          currentUser={currentUser}
          onOpenAuth={() => { setAuthMode('signin'); setIsAuthOpen(true); }}
          onSuccessRedirect={() => scrollToSection("portal")}
        />
      </div>

      {/* User & Admin Portal Section (Glow frosted card layout) */}
      <div 
        ref={portalRef} 
        id="portal"
        className="relative w-full py-24 bg-transparent overflow-hidden border-t border-purple-500/10"
      >
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <AnimatePresence mode="wait">
            {isLoadingAuth ? (
              <motion.div
                key="loading-auth"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 flex flex-col items-center justify-center text-purple-200/40 text-xs"
              >
                <span className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-3" />
                <span>Checking secure access credentials...</span>
              </motion.div>
            ) : currentUser ? (
              <motion.div
                key="active-session"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Title */}
                <div className="text-center mb-10">
                  <span className="text-purple-400 text-xs font-bold uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-400/20">
                    {currentUser.role === "admin" ? "MASTER COMMAND" : "CLIENT CENTER"}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
                    {currentUser.role === "admin" ? "FOUNDER BOARD" : "MY CLIENT HUB"}
                  </h2>
                  <p className="text-purple-200/60 text-sm max-w-lg mx-auto mt-2">
                    {currentUser.role === "admin" 
                      ? "Manage client design bookings, approve timelines, and analyze incoming project briefs."
                      : "Track your creative contract pipeline and design specs in real-time."
                    }
                  </p>
                </div>

                {/* Switch Render based on user role */}
                {currentUser.role === "admin" ? (
                  <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
                ) : (
                  <ClientDashboard
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onNavigateToBooking={() => scrollToSection("booking")}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="unauthenticated-prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-2xl border-purple-500/10 space-y-6"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/20 text-purple-300">
                  <FolderLock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white">Graphix Lab Client & Founder Hub</h3>
                  <p className="text-purple-200/60 text-sm max-w-md mx-auto mt-2 leading-relaxed">
                    access your service booking details, reviews, personal inform, service delivery time and more...
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => { setAuthMode('signin'); setIsAuthOpen(true); }}
                    className="btn-liquid-glass px-6 py-3.5 text-white font-bold text-xs tracking-widest uppercase cursor-pointer"
                  >
                    Enter Private Hub
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Studio Production Strategy & Blueprint */}
      <div ref={planRef} id="workflow">
        <HostingPlan />
      </div>

      {/* Inquiry Form */}
      <div ref={inquireRef} id="inquire">
        <ContactForm />
      </div>

      {/* Full-width Footer at the bottom of the page */}
      <Footer />

      {/* Authentication Modal Dialog */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthPortal
            onClose={() => setIsAuthOpen(false)}
            onSuccess={handleAuthSuccess}
            initialMode={authMode}
          />
        )}
      </AnimatePresence>

      {/* Floating AI Chatbot Widget */}
      <RiyaChatbot />

      {/* Floating Greeting Welcome Toast */}
      <AnimatePresence>
        {welcomeToast && welcomeToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-24 right-6 z-[9999] flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-purple-500/20 max-w-sm"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] shrink-0">
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold leading-snug">
                {welcomeToast.message}
              </p>
              <p className="text-[10px] text-purple-300/50 font-bold uppercase tracking-widest mt-0.5">
                Session Active
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
