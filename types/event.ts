import { User } from "./auth";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  registeredCount: number;
  organizerId?: string;
  organizer?: User;
  imageUrl?: string;
  speakers?: string[]; // For future expansion
  gallery?: string[]; // For future expansion
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  imageUrl?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: Date;
  location?: string;
  capacity?: number;
  imageUrl?: string;
}
