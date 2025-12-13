import apiClient from './client';
import { Registration, CreateRegistrationRequest } from '@/types/registration';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export interface GetRegistrationsParams {
  page?: number;
  limit?: number;
  eventId?: string;
  status?: 'confirmed' | 'cancelled';
}

/**
 * Fetch paginated list of registrations
 */
export const getRegistrations = async (
  params: GetRegistrationsParams = {}
): Promise<PaginatedResponse<Registration>> => {
  const { page = 1, limit = 10, ...filters } = params;
  
  const response = await apiClient.get<PaginatedResponse<Registration>>(
    '/api/registrations',
    {
      params: {
        page,
        limit,
        ...filters,
      },
    }
  );
  
  return response.data;
};

/**
 * Fetch registrations for a specific event
 */
export const getEventRegistrations = async (
  eventId: string,
  params: GetRegistrationsParams = {}
): Promise<PaginatedResponse<Registration>> => {
  const { page = 1, limit = 10 } = params;
  
  const response = await apiClient.get<PaginatedResponse<Registration>>(
    `/api/events/${eventId}/registrations`,
    {
      params: {
        page,
        limit,
      },
    }
  );
  
  return response.data;
};

/**
 * Fetch current user's registrations
 */
export const getMyRegistrations = async (
  params: GetRegistrationsParams = {}
): Promise<PaginatedResponse<Registration>> => {
  const { page = 1, limit = 10 } = params;
  
  const response = await apiClient.get<PaginatedResponse<Registration>>(
    '/api/registrations/my',
    {
      params: {
        page,
        limit,
      },
    }
  );
  
  return response.data;
};

/**
 * Create a new registration for an event
 */
export const createRegistration = async (
  data: CreateRegistrationRequest
): Promise<Registration> => {
  const response = await apiClient.post<ApiResponse<Registration>>(
    '/api/registrations',
    data
  );
  return response.data.data;
};

/**
 * Cancel a registration
 */
export const cancelRegistration = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/registrations/${id}`);
};

/**
 * Check if user is registered for an event
 */
export const checkRegistration = async (eventId: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<ApiResponse<{ isRegistered: boolean }>>(
      `/api/events/${eventId}/check-registration`
    );
    return response.data.data.isRegistered;
  } catch (error) {
    return false;
  }
};
