import { Event } from "./event";
import { User } from "./auth";

export interface Registration {
  id: string;
  eventId: string;
  event: Event;
  userId?: string;
  user?: User;
  // Public registration fields (no auth required)
  name: string;
  surname: string;
  email: string;
  city: string;
  runningClub?: string;
  phone?: string;
  promoCode?: string;
  status: "confirmed" | "cancelled" | "pending";
  registeredAt: Date;
  paymentStatus?: "pending" | "completed" | "failed";
}

export interface CreateRegistrationRequest {
  eventId: string;
  name: string;
  surname: string;
  email: string;
  city: string;
  runningClub?: string;
  phone?: string;
  promoCode?: string;
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
