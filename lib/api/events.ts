import apiClient from "./client";
import { Event, CreateEventRequest, UpdateEventRequest } from "@/types/event";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  lang?: string;
}

/**
 * Fetch paginated list of events
 */
export const getEvents = async (
  params: GetEventsParams = {}
): Promise<PaginatedResponse<Event>> => {
  const { page = 1, limit = 10, lang, ...filters } = params;

  const response = await apiClient.get<PaginatedResponse<Event>>("/events", {
    params: {
      page,
      limit,
      lang,
      ...filters,
    },
  });

  return response.data;
};

/**
 * Fetch a single event by ID
 */
export const getEventById = async (
  id: string,
  lang?: string
): Promise<Event> => {
  const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`, {
    params: lang ? { lang } : undefined,
  });
  return response.data.data;
};

/**
 * Create a new event
 */
export const createEvent = async (data: CreateEventRequest): Promise<Event> => {
  const response = await apiClient.post<ApiResponse<Event>>("/events", data);
  return response.data.data;
};

/**
 * Update an existing event
 */
export const updateEvent = async (
  id: string,
  data: UpdateEventRequest
): Promise<Event> => {
  const response = await apiClient.put<ApiResponse<Event>>(
    `/events/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Delete an event
 */
export const deleteEvent = async (id: string): Promise<void> => {
  await apiClient.delete(`/events/${id}`);
};

/**
 * Fetch events created by the current user
 */
export const getMyEvents = async (
  params: GetEventsParams = {}
): Promise<PaginatedResponse<Event>> => {
  const { page = 1, limit = 10, lang } = params;

  const response = await apiClient.get<PaginatedResponse<Event>>("/events/my", {
    params: {
      page,
      limit,
      lang,
    },
  });

  return response.data;
};
