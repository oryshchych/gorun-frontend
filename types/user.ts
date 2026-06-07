export type UserGender = "female" | "male" | "other" | "prefer_not_to_say";
export type UserAdminRole = "admin" | "super_admin";
export type AdminUserSource = "all" | "registered" | "app_only";

/** Row shape returned by the admin users list endpoint. */
export interface AdminUserListItem {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  registrationsCount: number;
  createdAt: string;
}

export interface AdminUserRegistration {
  id: string;
  eventId: string | null;
  eventName: string | null;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  distanceLabel: string | null;
  finalPrice: number | null;
  registeredAt: string;
}

export interface AdminUserPayment {
  id: string;
  registrationId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
}

/** Full user record returned by the admin detail endpoint. */
export interface AdminUserDetail {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  provider: "credentials" | "google";
  dateOfBirth: string | null;
  gender: UserGender | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  runningClub: string | null;
  city: string | null;
  deliveryAddress: string | null;
  isAdmin: boolean;
  adminRole: UserAdminRole | null;
  createdAt: string;
  updatedAt: string;
  registrations: AdminUserRegistration[];
  payments: AdminUserPayment[];
}

/** Profile/contact fields an admin may edit. `null` clears an optional field. */
export interface UpdateAdminUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  email?: string;
  dateOfBirth?: string | null;
  gender?: UserGender | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  runningClub?: string | null;
  city?: string | null;
  deliveryAddress?: string | null;
}

export interface CancelRegistrationResult {
  registration: AdminUserRegistration;
  payments: AdminUserPayment[];
}
