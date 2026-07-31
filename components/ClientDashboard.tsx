"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getClientBookings, Booking } from "@/lib/db";
import { parseNotes } from "@/lib/attachments";
import { Calendar, Layers, Clock, AlertCircle, Plus, RefreshCw, LogOut, CheckCircle, Flame, Paperclip } from "lucide-react";

interface ClientDashboardProps {
  currentUser: any;
  onLogout: () => void;
  onNavigateToBooking: () => void;
}

export default function ClientDashboard({ currentUser, onLogout, onNavigateToBooking }: ClientDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBookings = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await getClientBookings(currentUser.uid);
      setBookings(data);
    } catch (error) {
      console.error("Failed to load client bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentUser?.uid) return;
      setIsLoading(true);
      try {
        const data = await getClientBookings(currentUser.uid);
        if (active) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Failed to load client bookings:", error);
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
  }, [currentUser?.uid]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-300 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-300 border-red-500/20";
      default:
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    }
  };

  return (
    <div id="client-dashboard-hub" className="space-y-8">
      {/* Profile summary card */}
      <div className="rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">SECURE SESSION ID</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{currentUser?.displayName || currentUser?.name || "Valued Client"}</h3>
            <p className="text-purple-200/50 text-xs">{currentUser?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onNavigateToBooking}
            className="btn-liquid-glass flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
          
          <button
            onClick={onLogout}
            className="flex items-center justify-center p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-colors duration-300 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Bookings Tracker */}
      <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <h4 className="text-lg font-black text-white uppercase tracking-wider">Design Contract Registry</h4>
          <button
            onClick={fetchBookings}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-colors duration-300 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-purple-200/40 text-xs">
            <span className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-3" />
            <span>Synchronizing design database...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <AlertCircle className="w-10 h-10 text-purple-400/30 mx-auto" />
            <div>
              <p className="text-purple-200/60 font-semibold text-sm">No Active Design Bookings</p>
              <p className="text-purple-400/40 text-xs max-w-sm mx-auto mt-1">
                You haven&apos;t booked any design contracts with Graphix Lab yet. Start a session now to collaborate!
              </p>
            </div>
            <button
              onClick={onNavigateToBooking}
              className="btn-liquid-glass-secondary px-4 py-2.5 text-purple-300 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Start My First Booking
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all duration-300 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 uppercase tracking-widest border border-purple-500/20">
                      {booking.serviceType}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-purple-200/60 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Target Delivery: <b className="text-purple-200">{booking.bookingDate}</b></span>
                    </div>
                    <div className="flex flex-col gap-1.5 max-w-xl">
                      <div className="flex items-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        {(() => {
                          const { briefText, attachments } = parseNotes(booking.notes);
                          return (
                            <div className="space-y-1.5">
                              <span className="line-clamp-2">Project Brief: <i className="text-purple-300/80">&quot;{briefText}&quot;</i></span>
                              {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {attachments.map((file, idx) => (
                                    <a
                                      key={idx}
                                      href={file.base64}
                                      download={file.name}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/15 text-[9px] text-purple-300 hover:text-white transition-colors duration-200 cursor-pointer"
                                      title={`Download ${file.name}`}
                                    >
                                      <Paperclip className="w-2.5 h-2.5 text-purple-400" />
                                      <span className="max-w-[120px] truncate font-medium">{file.name}</span>
                                      <span className="text-[8px] text-purple-400/50">({file.size})</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-purple-400/40 text-right shrink-0">
                  <span className="block">CONTRACT INDEX: #{booking.id}</span>
                  <span className="block">CREATED: {new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
