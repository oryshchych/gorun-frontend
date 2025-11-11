export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  provider: 'credentials' | 'google';
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
