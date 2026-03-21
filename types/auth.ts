/** Authenticated user from `/auth/me` or embedded in login/register responses */
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  image?: string;
  provider?: "credentials" | "google";
  providerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
