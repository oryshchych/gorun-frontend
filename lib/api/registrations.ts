import apiClient from "./client";
import {
  Registration,
  CreateRegistrationRequest,
  Participant,
} from "@/types/registration";
import {
  ApiResponse,
  ApiSuccessResponse,
  PaginatedResponse,
} from "@/types/api";

export interface GetRegistrationsParams {
  page?: number;
  limit?: number;
  eventId?: string;
  status?: "confirmed" | "cancelled";
}

/**
 * Fetch paginated list of registrations
 */
export const getRegistrations = async (
  params: GetRegistrationsParams = {}
): Promise<PaginatedResponse<Registration>> => {
  const { page = 1, limit = 10, ...filters } = params;

  const response = await apiClient.get<PaginatedResponse<Registration>>(
    "/registrations",
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
    `/events/${eventId}/registrations`,
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
    "/registrations/my",
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
 * - Public registration: requires name, surname, email, city (no auth)
 * - Authenticated registration: only requires eventId and optional promoCode
 */
export const createRegistration = async (
  data: CreateRegistrationRequest
): Promise<{ registration: Registration; paymentLink?: string }> => {
  const response = await apiClient.post<
    ApiSuccessResponse<Registration> & { paymentLink?: string }
  >("/registrations", data);

  // Backend returns { success: true, data: Registration, paymentLink?: string }
  // paymentLink is at the root level of response.data, not nested in data
  const responseData = response.data;

  // Debug: log the response structure
  console.log("Registration response:", {
    hasData: !!responseData.data,
    hasPaymentLink: !!responseData.paymentLink,
    paymentLink: responseData.paymentLink,
  });

  return {
    registration: responseData.data,
    paymentLink: responseData.paymentLink,
  };
};

/**
 * Get public participants list for an event (no auth required)
 */
export const getEventParticipants = async (
  eventId: string
): Promise<Participant[]> => {
  const response = await apiClient.get<ApiSuccessResponse<Participant[]>>(
    `/events/${eventId}/participants`
  );
  return response.data.data;
};

/**
 * Cancel a registration
 */
export const cancelRegistration = async (id: string): Promise<void> => {
  await apiClient.delete(`/registrations/${id}`);
};

/**
 * Check if user is registered for an event
 */
export const checkRegistration = async (eventId: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<{ isRegistered: boolean }>
    >(`/events/${eventId}/check-registration`);
    return response.data.data.isRegistered;
  } catch (error) {
    return false;
  }
};
