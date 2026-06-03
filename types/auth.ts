/** Values accepted by API / profile form (must stay in sync with backend OpenAPI). */
export type UserGender = "female" | "male" | "other" | "prefer_not_to_say";

export type AdminRole = "admin" | "super_admin";

/** A child saved to a user's profile, used for kids-race registration. */
export interface ProfileKid {
  id: string;
  name: string;
  age: number;
  shirt?: string;
}

/** Authenticated user from `/auth/me` or embedded in login/register responses */
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  image?: string;
  /** When true, user may access `/admin/*`. Set on the backend / in DB. */
  isAdmin?: boolean;
  /** Present when `isAdmin` is true. Permissions may diverge by role later. */
  adminRole?: AdminRole | null;
  provider?: "credentials" | "google";
  providerId?: string;
  dateOfBirth?: string | null;
  gender?: UserGender | string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  runningClub?: string | null;
  city?: string | null;
  deliveryAddress?: string | null;
  /** Aggregate distance run across all events (km), shown on profile stats. */
  totalKm?: number;
  /** Aggregate amount donated to AFU (UAH), shown on profile stats. */
  totalDonated?: number;
  /** Children saved to the profile for kids-race registration. */
  kids?: ProfileKid[];
  createdAt?: Date;
  updatedAt?: Date;
}

/** PATCH `/auth/me` body (no `email`) */
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: string | null;
  gender?: UserGender | string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  runningClub?: string | null;
  city?: string | null;
  deliveryAddress?: string | null;
}
