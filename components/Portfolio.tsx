"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, X, ExternalLink, Sparkles, Send, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { createClientRequest } from "@/lib/db";

interface PortfolioItem {
  id: string;
  title: string;       // Represents Heading H1
  category: string;    // Represents Service Category/Pill Badge
  description: string; // Service description text
  image: string;       // Custom stock image related to the service
  serviceTitle?: string; // Original service card title if distinct from heading (e.g. "vibe coding")
}

const portfolioItems: PortfolioItem[] = [
  {
    id: "service-1",
    title: "Strategic Brand Design",
    category: "Logo/Brand Identity",
    description: "Defining your brand's visual DNA through clean typographic, iconic logos and seamless systems.",
    image: "https://cdn.postimage.me/2026/07/30/1000072108.png"
  },
  {
    id: "service-2",
    title: "Digital Experiences",
    category: "UI/UX Design",
    description: "Crafting human-centered digital experiences through precise user research,modern Ui and sleek interaction design",
    image: "https://cdn.postimage.me/2026/07/30/1000072107.jpg"
  },
  {
    id: "service-3",
    title: "Dimension Visuals",
    category: "3D Illustrations",
    description: "Transforming flat concepts into vibrant hyper-realistic, 3D visual engineering to elevate your brand into digital presence",
    image: "https://cdn.postimage.me/2026/07/30/1000072104.jpg"
  },
  {
    id: "service-4",
    title: "Intelligent Code",
    category: "Vibe Coding",
    serviceTitle: "vibe coding",
    description: "Leveraging advanced AI orchestration and rapid flow-state development to transform raw ideas into production ready. software at lighting speed",
    image: "https://cdn.postimage.me/2026/07/30/1000072109.png"
  },
  {
    id: "service-5",
    title: "Cinematic Motion/Dynamic Story Telling",
    category: "Animations/Video Editing",
    description: "Elevating digital content through precise video editing,custom motion graphics and high-production visual story, telling",
    image: "https://cdn.postimage.me/2026/07/30/1000072102.jpg"
  }
];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Featured Works");
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);

  // Categories requested in the specific menu:
  const categories = [
    "Featured Works",
    "Logo/Brand Identity",
    "UI/UX Design",
    "3D Illustrations",
    "Animations/Video Editing",
    "Vibe Coding",
    "Customised Service"
  ];

  // Logic to filter. Featured Works shows ALL cards. Other categories show only 1 card corresponding to that category.
  const getFilteredItems = () => {
    if (selectedCategory === "Featured Works") {
      return portfolioItems;
    }
    // Filter by category
    return portfolioItems.filter(item => item.category === selectedCategory);
  };

  const filteredItems = getFilteredItems();

  return (
    <section 
      id="portfolio-section" 
      className="relative w-full py-24 bg-transparent overflow-hidden border-t border-purple-500/10"
    >
      {/* Background blurs */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-400/20">
            GENERATIVE LABS
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-4 uppercase">
            OUR BRAND & DESIGN <span className="text-gradient-neon">SERVICES</span>
          </h2>
          <p className="text-purple-200/60 text-sm md:text-base max-w-2xl mx-auto mt-4">
            browse through our projects crafted with pixel-level, mathematical precision and premium design schemes
          </p>
        </div>

        {/* Category Filters */}
        <div 
          id="portfolio-categories"
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 text-xs font-semibold tracking-wide cursor-pointer ${
                selectedCategory === cat
                  ? "btn-liquid-glass text-purple-200"
                  : "btn-liquid-glass-secondary text-purple-200/60 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid layout */}
        <motion.div 
          layout
          id="portfolio-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {/* Render core filtered service cards */}
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="group relative rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.04] p-5 overflow-hidden shadow-lg shadow-black/40 hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Hover Scale */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-5 bg-[#131026]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-w-768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-all duration-500 opacity-80 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    
                    {/* Floating Action Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setSelectedProject(item)}
                        className="flex items-center justify-center w-11 h-11 rounded-xl bg-purple-500 text-white shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Info Text */}
                  <div className="space-y-2 text-left">
                    <span className="inline-flex text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                      {item.serviceTitle || item.category}
                    </span>
                    <h3 className="text-xl font-black text-white group-hover:text-purple-200 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-purple-200/60 text-xs leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setSelectedProject(item)}
                    className="p-1.5 rounded-lg text-purple-400 hover:text-white bg-white/5 border border-white/10 transition-colors duration-300 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Special Client Request Form Card: Shown in "Featured Works" and "Customised Service" */}
            {(selectedCategory === "Featured Works" || selectedCategory === "Customised Service") && (
              <motion.div
                layout
                key="client-request-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="col-span-1"
              >
                <ClientRequestFormCard />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Case Study Detail Modal (Simplified to exclude Client, Year, Tech Medium) */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full max-w-2xl rounded-3xl bg-[#131026]/95 backdrop-blur-2xl border border-white/10 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 hover:text-white transition-colors duration-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Image Section */}
                <div className="relative aspect-video md:aspect-square w-full rounded-2xl overflow-hidden bg-black border border-white/5">
                  <Image
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-4">
                      <Sparkles className="w-3 h-3" />
                      <span>{selectedProject.serviceTitle || selectedProject.category}</span>
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                      {selectedProject.title}
                    </h3>
                    <p className="text-purple-200/70 text-sm leading-relaxed mb-6">
                      {selectedProject.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* Reusable Interactive Client Request Card Form */
function ClientRequestFormCard() {
  const [userName, setUserName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !projectDesc || !email) {
      setError("Please fill in all fields.");
      return;
    }
    setIsSending(true);
    setError("");
    try {
      await createClientRequest({
        userName,
        projectDescription: projectDesc,
        email
      });
      setIsSuccess(true);
      setUserName("");
      setProjectDesc("");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Failed to dispatch your idea. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="group relative rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/10 p-5 overflow-hidden shadow-lg shadow-black/40 hover:shadow-purple-500/5 hover:border-purple-500/20 transition-all duration-300 flex flex-col justify-between h-full min-h-[460px]">
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-400/20">
            client request
          </span>
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
        </div>
        <h3 className="text-xl font-black text-white tracking-tight uppercase">
          add your own idea
        </h3>
        <p className="text-purple-200/50 text-[11px] leading-relaxed italic">
          Describe your vision, and we will translate it into high-fidelity visual products.
        </p>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-3 bg-purple-500/5 rounded-xl border border-purple-500/20 p-4"
          >
            <CheckCircle className="w-8 h-8 text-purple-400 mx-auto" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Idea Received!</h4>
            <p className="text-[10px] text-purple-200/60 leading-relaxed">
              We&apos;ve dispatched your idea to <strong>graphixlab07@gmail.com</strong>. We&apos;ll check the project description in our gmail to start the project.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="text-[10px] font-bold text-purple-300 hover:text-white underline cursor-pointer"
            >
              Submit another idea
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3">
            {error && (
              <p className="text-red-400 text-[10px] bg-red-500/5 border border-red-500/10 p-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-semibold text-purple-300 block">User Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alexander Pierce"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.02] border border-white/5 text-white focus:outline-none focus:border-purple-500 transition-all placeholder-purple-200/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-semibold text-purple-300 block">Project Description</label>
              <textarea
                required
                placeholder="Describe your design vision in detail..."
                rows={3}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.02] border border-white/5 text-white focus:outline-none focus:border-purple-500 transition-all placeholder-purple-200/20 resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-semibold text-purple-300 block">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. client@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.02] border border-white/5 text-white focus:outline-none focus:border-purple-500 transition-all placeholder-purple-200/20"
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="btn-liquid-glass w-full py-2.5 text-white font-bold text-[10px] uppercase tracking-wider disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Dispersing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>Send Idea</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
