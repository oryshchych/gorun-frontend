/** Values accepted by API / profile form (must stay in sync with backend OpenAPI). */
export type UserGender = "female" | "male" | "other" | "prefer_not_to_say";

export type AdminRole = "admin" | "super_admin";

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
