import { Event } from "./event";
import { User } from "./auth";

export interface Registration {
  id: string;
  eventId: string;
  event?: Event;
  userId?: string;
  user?: User;
  // Public registration fields (no auth required)
  name?: string;
  surname?: string;
  email?: string;
  city?: string;
  runningClub?: string;
  phone?: string;
  promoCode?: string;
  finalPrice: number;
  status: "confirmed" | "cancelled" | "pending";
  registeredAt: Date | string;
  paymentStatus?: "pending" | "completed" | "failed";
  paymentLink?: string;
}

export interface CreateRegistrationRequest {
  eventId: string;
  // Public registration fields (required for unauthenticated users)
  name?: string;
  surname?: string;
  email?: string;
  city?: string;
  runningClub?: string;
  phone?: string;
  promoCode?: string;
}

export interface CreateRegistrationResponse {
  success: boolean;
  data: Registration;
  paymentLink?: string;
}

// Public participant info (for display in participants list)
export interface Participant {
  id: string;
  name: string;
  surname: string;
  city: string;
  runningClub?: string;
  registeredAt: Date;
}
