"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendChatMessage, ChatMessage } from "@/lib/db";

export default function RiyaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize unique session ID
  useEffect(() => {
    let storedSession = localStorage.getItem("riya_chat_session_id");
    if (!storedSession) {
      storedSession = "sess_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("riya_chat_session_id", storedSession);
    }
    setSessionId(storedSession);

    // Initial greeting message
    setMessages([
      {
        session_id: storedSession,
        sender: "riya",
        message_text: "Hello! I am Riya, your 24/7 Graphix Lab AI Assistant. How can I help you today with your logo branding, UI/UX prototype, 3D animations, or customized service request?",
        created_at: new Date().toISOString()
      }
    ]);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");

    // Add user message locally
    const clientMsg: ChatMessage = {
      session_id: sessionId,
      sender: "client",
      message_text: userText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, clientMsg]);

    // Save user message to Supabase (non-blocking)
    try {
      await sendChatMessage(sessionId, "client", userText);
    } catch (err) {
      console.warn("Could not save message in Supabase. Running in offline/local state.");
    }

    // Trigger Riya's typing status
    setIsTyping(true);

    try {
      // Post to Gemini chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages
        })
      });

      const data = await response.json();
      const riyaReply = data.reply || "I'm here to assist you! Feel free to ask me anything about Graphix Lab's elite branding or animations.";

      // Add Riya's message locally
      const riyaMsg: ChatMessage = {
        session_id: sessionId,
        sender: "riya",
        message_text: riyaReply,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, riyaMsg]);

      // Save Riya's reply to Supabase (non-blocking)
      try {
        await sendChatMessage(sessionId, "riya", riyaReply);
      } catch (err) {
        console.warn("Could not save Riya's message in Supabase.");
      }
    } catch (err) {
      console.error("AI response error:", err);
      // Fallback message
      const fallbackReply = "I'm sorry, I'm currently experiencing a connection issue. Can you please try asking again?";
      setMessages(prev => [...prev, {
        session_id: sessionId,
        sender: "riya",
        message_text: fallbackReply,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[340px] sm:w-[380px] h-[500px] rounded-3xl bg-[#150025]/95 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden mb-4 border-purple-500/10 text-left"
          >
            {/* Header */}
            <div className="p-4 bg-[#1F0037] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#35005D] border border-purple-400/20 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-5 h-5 text-gradient-neon animate-pulse" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1F0037]" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wider text-white">RIYA</h4>
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">24/7 AI Agent</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "client"
                        ? "bg-[#35005D] text-white rounded-tr-none"
                        : "bg-[#1F0037] text-purple-200 rounded-tl-none border border-white/5"
                    }`}
                  >
                    {msg.message_text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1F0037] text-purple-400 rounded-2xl rounded-tl-none border border-white/5 p-3 flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse">Riya is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-[#1F0037]/50 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Message Riya..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[#2A0049] border border-white/5 text-white focus:outline-none focus:border-purple-500 placeholder-purple-200/20"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl btn-liquid-glass text-white disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full btn-liquid-glass text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer relative group"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        
        {/* Tooltip tooltip */}
        <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-[#1F0037] border border-white/10 text-[10px] font-bold text-purple-300 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl">
          Chat with Riya
        </span>
      </button>
    </div>
  );
}
