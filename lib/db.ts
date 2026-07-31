import { supabase } from "./supabase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  table: string;
}

export function handleSupabaseError(error: unknown, operationType: OperationType, table: string): never {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: SupabaseErrorInfo = {
    error: errMsg,
    operationType,
    table
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(errMsg);
}

// Test connection on boot
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.warn("Supabase connection check yielded error:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to connect to Supabase:", error);
    return false;
  }
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "client" | "admin";
  createdAt: string;
}

export interface Booking {
  id?: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  bookingDate: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

// --- Client Requests Collection Support ---
export interface ClientRequest {
  id?: string;
  userName: string;
  projectDescription: string;
  email: string;
  createdAt: string;
}

// --- Testimonials (Reviews) Collection Support ---
export interface Testimonial {
  id?: string;
  name: string;
  subject: string;
  message: string;
  rating: number; // 1 to 5 stars
  createdAt: string;
}

// Check and create a user profile in Supabase after authentication
export async function createUserProfile(uid: string, email: string, name: string): Promise<UserProfile> {
  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select()
      .eq("uid", uid)
      .single();
    
    if (existingUser) {
      return existingUser as UserProfile;
    }
    
    // Automatically assign 'admin' role if it's the owner's or admin's email
    const isAdminEmail = email.toLowerCase() === "graphixlab07@gmail.com" || email.toLowerCase() === "admin@graphixlab.com";
    const role = isAdminEmail ? "admin" : "client";
    
    const profile: UserProfile = {
      uid,
      email,
      name: name || "Valued Client",
      role,
      createdAt: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase.from("users").insert(profile);
    if (insertError) {
      throw insertError;
    }
    
    return profile;
  } catch (error) {
    handleSupabaseError(error, OperationType.WRITE, "users");
  }
}

// Get user profile details
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("uid", uid)
      .single();
    
    if (error) {
      // In Supabase, if row not found, it returns error. We can gracefully return null.
      return null;
    }
    return data as UserProfile;
  } catch (error) {
    handleSupabaseError(error, OperationType.GET, "users");
  }
}

// Add a new project booking
export async function createBooking(booking: Omit<Booking, "id" | "status" | "createdAt">): Promise<string> {
  const bookingId = "bk_" + Math.random().toString(36).substring(2, 11);
  const newBooking: Booking = {
    ...booking,
    id: bookingId,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  
  try {
    const { error } = await supabase.from("bookings").insert(newBooking);
    if (error) throw error;
    return bookingId;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, "bookings");
  }
}

// Get all bookings for a specific client
export async function getClientBookings(userId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select()
      .eq("userId", userId);
    
    if (error) throw error;
    if (!data) return [];
    
    return (data as Booking[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, "bookings");
  }
}

// Admin: Get all bookings
export async function getAllBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select();
    
    if (error) throw error;
    if (!data) return [];
    
    return (data as Booking[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, "bookings");
  }
}

// Admin: Update booking status
export async function updateBookingStatus(bookingId: string, status: "pending" | "confirmed" | "cancelled"): Promise<void> {
  try {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);
    
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, OperationType.UPDATE, "bookings");
  }
}

// Add contact form inquiry
export async function createInquiry(inquiry: Omit<Inquiry, "id" | "createdAt">): Promise<string> {
  const inquiryId = "inq_" + Math.random().toString(36).substring(2, 11);
  const newInquiry: Inquiry = {
    ...inquiry,
    id: inquiryId,
    createdAt: new Date().toISOString()
  };
  
  try {
    const { error } = await supabase.from("inquiries").insert(newInquiry);
    if (error) throw error;
    return inquiryId;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, "inquiries");
  }
}

// Admin: Get all inquiries
export async function getAllInquiries(): Promise<Inquiry[]> {
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .select();
    
    if (error) throw error;
    if (!data) return [];
    
    return (data as Inquiry[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, "inquiries");
  }
}

// --- Client Requests Collection Support ---
export async function createClientRequest(requestData: Omit<ClientRequest, "id" | "createdAt">): Promise<string> {
  const requestId = "req_" + Math.random().toString(36).substring(2, 11);
  const newRequest: ClientRequest = {
    ...requestData,
    id: requestId,
    createdAt: new Date().toISOString()
  };
  
  try {
    const { error } = await supabase.from("client_requests").insert(newRequest);
    if (error) throw error;
    return requestId;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, "client_requests");
  }
}

// --- Testimonials (Reviews) Collection Support ---
export async function createTestimonial(testimonialData: Omit<Testimonial, "id" | "createdAt">): Promise<string> {
  const testimonialId = "rev_" + Math.random().toString(36).substring(2, 11);
  const newTestimonial: Testimonial = {
    ...testimonialData,
    id: testimonialId,
    createdAt: new Date().toISOString()
  };
  
  try {
    const { error } = await supabase.from("testimonials").insert(newTestimonial);
    if (error) throw error;
    return testimonialId;
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, "testimonials");
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select();
    
    if (error) throw error;
    if (!data) return [];
    
    return (data as Testimonial[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleSupabaseError(error, OperationType.LIST, "testimonials");
  }
}

// --- Service Portfolio Images Support ---
export interface ServicePortfolioImage {
  id: string;
  service_id: string;
  image_url: string;
  created_at: string;
}

export async function getServicePortfolioImages(serviceId: string): Promise<ServicePortfolioImage[]> {
  try {
    const { data, error } = await supabase
      .from("service_portfolio_images")
      .select()
      .eq("service_id", serviceId);
    
    if (error) throw error;
    if (!data) return [];
    
    return (data as ServicePortfolioImage[]).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.warn("Could not load service portfolio images from Supabase. Falling back to local state.", error);
    throw error;
  }
}

export async function addServicePortfolioImage(serviceId: string, imageUrl: string): Promise<ServicePortfolioImage> {
  const newImage = {
    service_id: serviceId,
    image_url: imageUrl
  };
  
  try {
    const { data, error } = await supabase
      .from("service_portfolio_images")
      .insert(newImage)
      .select()
      .single();
      
    if (error) throw error;
    return data as ServicePortfolioImage;
  } catch (error) {
    console.error("Failed to add service portfolio image to Supabase:", error);
    throw error;
  }
}

export async function deleteServicePortfolioImage(imageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("service_portfolio_images")
      .delete()
      .eq("id", imageId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Failed to delete service portfolio image from Supabase:", error);
    throw error;
  }
}
