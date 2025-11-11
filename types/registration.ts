import { Event } from './event';
import { User } from './auth';

export interface Registration {
  id: string;
  eventId: string;
  event: Event;
  userId: string;
  user: User;
  status: 'confirmed' | 'cancelled';
  registeredAt: Date;
}

export interface CreateRegistrationRequest {
  eventId: string;
}
