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
  /** Assigned bib number once the registration is confirmed. */
  bib?: number | string;
  /** Distance label the runner registered for, e.g. "21K". */
  distance?: string;
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

// ============================================================================
// Admin-only types
// ============================================================================

export type AdminRegistrationStatus = "pending" | "confirmed" | "cancelled";
export type AdminPaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export interface AdminRegistrationListItem {
  id: string;
  /** name + ' ' + surname from the Registration document */
  fullName: string;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  eventId: string | null;
  eventName: string | null;
  distanceLabel: string | null;
  bib: string | null;
  finalPrice: number | null;
  paymentStatus: AdminPaymentStatus;
  status: AdminRegistrationStatus;
  registeredAt: string;
}

export interface AdminRegPayment {
  id: string;
  amount: number;
  currency: string;
  status: AdminPaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminKidRegistration {
  kidId: string;
  name: string;
  age: number | null;
  distanceId: string | null;
  distanceLabel: string | null;
  shirtSize: string | null;
}

export interface AdminRegistrationDetail extends AdminRegistrationListItem {
  city: string | null;
  runningClub: string | null;
  shirtSize: string | null;
  estimatedPace: string | null;
  promoCode: string | null;
  afuDonation: number | null;
  kidsRegistrations: AdminKidRegistration[];
  userId: string | null;
  userName: string | null;
  payments: AdminRegPayment[];
}

export interface AdminRegistrationsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminRegistrationStatus;
  paymentStatus?: AdminPaymentStatus;
  eventId?: string;
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
