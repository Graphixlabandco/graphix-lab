"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getAllBookings, 
  updateBookingStatus, 
  getAllClientRequests,
  updateClientRequestStatus,
  deleteClientRequest,
  deleteTestimonial,
  getTestimonials,
  getChatMessages,
  updateChatMessage,
  deleteChatMessage,
  Booking, 
  ClientRequest,
  Testimonial,
  ChatMessage
} from "@/lib/db";
import { 
  Calendar, 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  TrendingUp, 
  Inbox, 
  Sliders, 
  ShieldAlert,
  Search,
  MessageSquare,
  FileCheck,
  Paperclip,
  Trash2,
  Star,
  AlertCircle,
  Sparkles,
  Camera
} from "lucide-react";
import { parseNotes } from "@/lib/attachments";
import { supabase } from "@/lib/supabase";

interface AdminDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"bookings" | "requests" | "chat" | "reviews">("bookings");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actioningRequestId, setActioningRequestId] = useState<string | null>(null);
  const [actioningReviewId, setActioningReviewId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser?.uid) {
      const localAvatar = localStorage.getItem(`avatar_${currentUser.uid}`);
      if (localAvatar) {
        setAvatar(localAvatar);
      }
      
      const loadDbAvatar = async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("avatar_url, avatarUrl")
            .eq("uid", currentUser.uid)
            .single();
          if (!error && data) {
            const dbAvatar = data.avatar_url || data.avatarUrl;
            if (dbAvatar) {
              setAvatar(dbAvatar);
              localStorage.setItem(`avatar_${currentUser.uid}`, dbAvatar);
            }
          }
        } catch (e) {
          console.log("Error loading avatar from database:", e);
        }
      };
      loadDbAvatar();
    }
  }, [currentUser?.uid]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image file under 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setAvatar(base64String);
      localStorage.setItem(`avatar_${currentUser.uid}`, base64String);
      
      try {
        const { updateUserProfileAvatar } = await import("@/lib/db");
        await updateUserProfileAvatar(currentUser.uid, base64String);
      } catch (err) {
        console.error("Failed to update database avatar:", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const syncAdminData = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, chatData, requestsData, reviewsData] = await Promise.all([
        getAllBookings(),
        getChatMessages().catch(() => []),
        getAllClientRequests().catch(() => []),
        getTestimonials().catch(() => [])
      ]);
      setBookings(bookingsData);
      setChatMessages(chatData);
      setClientRequests(requestsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Admin sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [bookingsData, chatData, requestsData, reviewsData] = await Promise.all([
          getAllBookings(),
          getChatMessages().catch(() => []),
          getAllClientRequests().catch(() => []),
          getTestimonials().catch(() => [])
        ]);
        if (active) {
          setBookings(bookingsData);
          setChatMessages(chatData);
          setClientRequests(requestsData);
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error("Admin sync failed:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: "pending" | "confirmed" | "cancelled") => {
    setActioningId(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActioningId(null);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: "pending" | "approved" | "cancelled") => {
    setActioningRequestId(requestId);
    try {
      await updateClientRequestStatus(requestId, status);
      setClientRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    } catch (error) {
      console.error("Failed to update client request status:", error);
      alert("Failed to update status in Database. Admin, please make sure you ran the SQL query: 'alter table client_requests add column if not exists status text default 'pending';'");
    } finally {
      setActioningRequestId(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this client request?")) return;
    setActioningRequestId(requestId);
    try {
      await deleteClientRequest(requestId);
      setClientRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error("Failed to delete client request:", error);
    } finally {
      setActioningRequestId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this testimonial/review?")) return;
    setActioningReviewId(reviewId);
    try {
      await deleteTestimonial(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setActioningReviewId(null);
    }
  };

  const handleUpdateChatMessage = async (messageId: string) => {
    if (!editingText.trim()) return;
    try {
      await updateChatMessage(messageId, editingText);
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, message_text: editingText } : msg))
      );
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Failed to edit chat message:", error);
    }
  };

  const handleDeleteChatMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this chat message?")) return;
    try {
      await deleteChatMessage(messageId);
      setChatMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Failed to delete chat message:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-green-500/15 text-green-300 border border-green-500/20 uppercase tracking-wider">Confirmed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/20 uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20 uppercase tracking-wider">Pending Approval</span>;
    }
  };

  const getRequestStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-green-500/15 text-green-300 border border-green-500/20 uppercase tracking-wider">Approved</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/20 uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20 uppercase tracking-wider">Pending</span>;
    }
  };

  // Filter bookings based on search query (email or name)
  const filteredBookings = bookings.filter((b) =>
    b.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chat messages by session
  const chatSessions: { [key: string]: ChatMessage[] } = {};
  chatMessages.forEach((msg) => {
    if (!chatSessions[msg.session_id]) {
      chatSessions[msg.session_id] = [];
    }
    chatSessions[msg.session_id].push(msg);
  });

  const sessionIds = Object.keys(chatSessions).sort((a, b) => {
    const aMsgs = chatSessions[a];
    const bMsgs = chatSessions[b];
    const aTime = aMsgs.length > 0 ? new Date(aMsgs[aMsgs.length - 1].created_at).getTime() : 0;
    const bTime = bMsgs.length > 0 ? new Date(bMsgs[bMsgs.length - 1].created_at).getTime() : 0;
    return bTime - aTime;
  });

  const filteredSessionIds = sessionIds.filter((sessId) => {
    const msgs = chatSessions[sessId];
    return msgs.some((m) =>
      m.message_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.session_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter requests
  const filteredRequests = clientRequests.filter((req) =>
    req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.projectDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter reviews
  const filteredReviews = reviews.filter((rev) =>
    rev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rev.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rev.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics summaries
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const totalSessions = Object.keys(chatSessions).length;

  return (
    <div id="admin-management-console" className="space-y-8">
      {/* Admin Title Block */}
      <div className="rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="relative group w-12 h-12 shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="w-12 h-12 rounded-2xl object-cover border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold uppercase text-sm">
                {currentUser?.displayName?.[0] || currentUser?.email?.[0] || "A"}
              </div>
            )}
            
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer border border-purple-400/50">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl border border-purple-400/50">
                <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent animate-spin rounded-full" />
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>Graphix Lab Command Console</span>
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{currentUser?.displayName || "Founder Office"}</h3>
            <p className="text-purple-200/50 text-xs">Administrative account: {currentUser?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncAdminData}
            disabled={isLoading}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 hover:text-white transition-colors duration-300 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer"
          >
            Leave Console
          </button>
        </div>
      </div>

      {/* Hero Metrics Blocks (Mathematical scaling, no AI nested cards slop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
          <span className="text-purple-400/60 font-bold text-[10px] uppercase tracking-widest block">PENDING WORKLOAD</span>
          <span className="text-3xl font-black text-white block mt-2">{pendingCount} Session{pendingCount !== 1 && "s"}</span>
          <span className="text-xs text-amber-300 mt-1 block font-medium">Needs Action</span>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
          <span className="text-purple-400/60 font-bold text-[10px] uppercase tracking-widest block">CONFIRMED PROJECTS</span>
          <span className="text-3xl font-black text-white block mt-2">{confirmedCount} Active</span>
          <span className="text-xs text-green-300 mt-1 block font-medium">In Pipeline</span>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
          <span className="text-purple-400/60 font-bold text-[10px] uppercase tracking-widest block">AI CHAT SESSIONS</span>
          <span className="text-3xl font-black text-white block mt-2">{totalSessions} Session{totalSessions !== 1 && "s"}</span>
          <span className="text-xs text-purple-300 mt-1 block font-medium">From Riya Assist</span>
        </div>
      </div>

      {/* Main Console Tabbed Panel */}
      <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          {/* Tabs switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setActiveTab("bookings"); setSearchQuery(""); }}
              className={`px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer ${
                activeTab === "bookings"
                  ? "btn-liquid-glass text-purple-200"
                  : "btn-liquid-glass-secondary text-purple-200/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Bookings ({bookings.length})</span>
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("requests"); setSearchQuery(""); }}
              className={`px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer ${
                activeTab === "requests"
                  ? "btn-liquid-glass text-purple-200"
                  : "btn-liquid-glass-secondary text-purple-200/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Client Requests ({clientRequests.length})</span>
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("chat"); setSearchQuery(""); }}
              className={`px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer ${
                activeTab === "chat"
                  ? "btn-liquid-glass text-purple-200"
                  : "btn-liquid-glass-secondary text-purple-200/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assist ({totalSessions})</span>
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("reviews"); setSearchQuery(""); }}
              className={`px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer ${
                activeTab === "reviews"
                  ? "btn-liquid-glass text-purple-200"
                  : "btn-liquid-glass-secondary text-purple-200/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Reviews ({reviews.length})</span>
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-purple-400/60" />
            <input
              type="text"
              placeholder={`Search by client, email, etc...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
        </div>

        {/* Sync loading spinner */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-purple-200/40 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
            <span>Synchronizing master records from Firestore ledger...</span>
          </div>
        ) : activeTab === "bookings" ? (
          /* Bookings Tab */
          filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-purple-200/50 text-xs">
              <Inbox className="w-8 h-8 mx-auto mb-3 text-purple-500/30" />
              <span>No bookings found matching search query.</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 uppercase tracking-widest border border-purple-500/20">
                        {b.serviceType}
                      </span>
                      {getStatusBadge(b.status)}
                    </div>

                    <div className="text-xs text-purple-200/70 space-y-1">
                      <div>
                        CLIENT: <b className="text-white">{b.clientName}</b> ({b.clientEmail})
                      </div>
                      <div className="flex items-center gap-1 text-purple-400/80">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Target date: <b className="text-purple-300">{b.bookingDate}</b></span>
                      </div>
                      <div className="max-w-2xl bg-white/[0.01] p-2.5 rounded-lg border border-white/5 mt-2 space-y-2">
                        {(() => {
                          const { briefText, attachments } = parseNotes(b.notes);
                          return (
                            <>
                              <p className="italic text-purple-200/60 text-[11px]">&quot;{briefText}&quot;</p>
                              {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/5">
                                  {attachments.map((file, idx) => (
                                    <a
                                      key={idx}
                                      href={file.base64}
                                      download={file.name}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 text-[10px] text-purple-300 hover:text-white transition-colors duration-200 cursor-pointer"
                                      title={`Download ${file.name}`}
                                    >
                                      <Paperclip className="w-3 h-3 text-purple-400" />
                                      <span className="max-w-[150px] truncate font-medium">{file.name}</span>
                                      <span className="text-[8px] text-purple-400/50">({file.size})</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Approve / Reject) */}
                  <div className="flex flex-col items-end gap-3 self-end md:self-center shrink-0">
                    <span className="text-[10px] text-purple-400/40 block">INDEX: #{b.id}</span>
                    
                    {b.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={actioningId !== null}
                          onClick={() => handleUpdateStatus(b.id!, "cancelled")}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={actioningId !== null}
                          onClick={() => handleUpdateStatus(b.id!, "confirmed")}
                          className="px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                        >
                          Confirm
                        </button>
                      </div>
                    )}

                    {b.status !== "pending" && (
                      <button
                        disabled={actioningId !== null}
                        onClick={() => handleUpdateStatus(b.id!, "pending")}
                        className="text-[10px] text-purple-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "requests" ? (
          /* Client Requests Tab */
          filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-purple-200/50 text-xs">
              <Sliders className="w-8 h-8 mx-auto mb-3 text-purple-500/30" />
              <span>No client customized requests found.</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all duration-300 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 uppercase tracking-widest border border-purple-500/20">
                        Customised Service Idea
                      </span>
                      {getRequestStatusBadge(req.status)}
                    </div>
                    
                    <div className="text-xs text-purple-200/70 space-y-1">
                      <div>
                        CLIENT: <b className="text-white">{req.userName}</b> ({req.email})
                      </div>
                      <div className="text-[10px] text-purple-400/40">
                        DISPATCHED: {new Date(req.createdAt).toLocaleString()}
                      </div>
                      <div className="max-w-2xl bg-white/[0.01] p-2.5 rounded-lg border border-white/5 mt-2 space-y-2">
                        {(() => {
                          const { briefText, attachments } = parseNotes(req.projectDescription);
                          return (
                            <>
                              <p className="italic text-purple-200/60 text-[11px]">&quot;{briefText}&quot;</p>
                              {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/5">
                                  {attachments.map((file, idx) => (
                                    <a
                                      key={idx}
                                      href={file.base64}
                                      download={file.name}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 text-[10px] text-purple-300 hover:text-white transition-colors duration-200 cursor-pointer"
                                      title={`Download ${file.name}`}
                                    >
                                      <Paperclip className="w-3 h-3 text-purple-400" />
                                      <span className="max-w-[150px] truncate font-medium">{file.name}</span>
                                      <span className="text-[8px] text-purple-400/50">({file.size})</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Client Request */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      disabled={actioningRequestId !== null}
                      onClick={() => handleUpdateRequestStatus(req.id!, "cancelled")}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={actioningRequestId !== null}
                      onClick={() => handleUpdateRequestStatus(req.id!, "approved")}
                      className="px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/20 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      disabled={actioningRequestId !== null}
                      onClick={() => handleDeleteRequest(req.id!)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-purple-400 hover:text-red-300 border border-white/10 transition-all cursor-pointer"
                      title="Delete Request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "chat" ? (
          /* AI Assist Chats Tab */
          filteredSessionIds.length === 0 ? (
            <div className="py-16 text-center text-purple-200/50 text-xs">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-500/30 animate-pulse" />
              <span>No AI chat sessions found.</span>
            </div>
          ) : (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
              {filteredSessionIds.map((sessId) => {
                const sessionMsgs = chatSessions[sessId];
                const lastMsg = sessionMsgs[sessionMsgs.length - 1];
                return (
                  <div
                    key={sessId}
                    className="p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all duration-300 text-left space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-[#35005D]/20 text-purple-300 uppercase tracking-widest border border-purple-500/10">
                          Session: {sessId}
                        </span>
                      </div>
                      <span className="text-[9px] text-purple-400/40 font-mono">
                        LAST ACTIVITY: {new Date(lastMsg.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-3 pl-2">
                      {sessionMsgs.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`flex items-start justify-between gap-4 p-3 rounded-xl group/msg text-xs ${
                            msg.sender === "riya" 
                              ? "bg-[#1F0037]/45 border border-purple-950/20 text-purple-200" 
                              : "bg-[#35005D]/10 text-white"
                          }`}
                        >
                          <div className="space-y-1 w-[80%]">
                            <span className="text-[8px] font-bold uppercase tracking-widest block opacity-60">
                              {msg.sender === "riya" ? "Riya (AI Agent)" : "Client"}
                            </span>
                            
                            {editingMessageId === msg.id ? (
                              <div className="flex flex-col gap-2 mt-1">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#2A0049] border border-white/10 text-white focus:outline-none focus:border-purple-500 placeholder-purple-200/20 resize-none"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateChatMessage(msg.id!)}
                                    className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold uppercase cursor-pointer"
                                  >
                                    Save Override
                                  </button>
                                  <button
                                    onClick={() => { setEditingMessageId(null); setEditingText(""); }}
                                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-purple-300 text-[9px] font-bold uppercase cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>
                            )}
                          </div>

                          {/* Message Actions */}
                          {editingMessageId !== msg.id && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                              {msg.sender === "riya" && (
                                <button
                                  onClick={() => { setEditingMessageId(msg.id!); setEditingText(msg.message_text); }}
                                  className="px-2 py-1 rounded bg-[#35005D] hover:bg-purple-700 text-purple-200 hover:text-white text-[9px] font-bold uppercase transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteChatMessage(msg.id!)}
                                className="p-1 rounded bg-white/5 hover:bg-red-500/25 text-purple-400 hover:text-red-300 transition-colors cursor-pointer"
                                title="Delete Message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Reviews Tab */
          filteredReviews.length === 0 ? (
            <div className="py-16 text-center text-purple-200/50 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-purple-500/30" />
              <span>No client reviews found.</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all duration-300 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? "text-amber-400 fill-amber-400" : "text-white/10"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-purple-400/40">
                        POSTED: {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="text-xs text-purple-200/70">
                      <h5 className="text-sm font-bold text-white mb-1">
                        {rev.name} <span className="text-purple-400/60 font-normal">({rev.subject})</span>
                      </h5>
                      <p className="italic text-purple-200/60 text-[11px] bg-white/[0.01] p-2.5 rounded-lg border border-white/5 mt-2">
                        &quot;{rev.message}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Actions for Reviews (Admin-only deletion) */}
                  <div className="shrink-0 self-end md:self-center">
                    <button
                      disabled={actioningReviewId !== null}
                      onClick={() => handleDeleteReview(rev.id!)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-purple-400 hover:text-red-300 border border-white/10 transition-all cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
