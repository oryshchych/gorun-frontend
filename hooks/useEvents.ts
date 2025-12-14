import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  GetEventsParams,
} from "@/lib/api/events";
import { Event, CreateEventRequest, UpdateEventRequest } from "@/types/event";
import { PaginatedResponse } from "@/types/api";
import { handleApiError, showSuccessToast } from "@/lib/error-handler";

// Query keys for cache management
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: GetEventsParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  myEvents: () => [...eventKeys.all, "my"] as const,
  myEventsList: (params: GetEventsParams) =>
    [...eventKeys.myEvents(), params] as const,
};

/**
 * Hook to fetch paginated events list
 */
export const useEvents = (params: GetEventsParams = {}) => {
  return useQuery<PaginatedResponse<Event>, Error>({
    queryKey: eventKeys.list(params),
    queryFn: () => getEvents(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch a single event by ID
 */
export const useEvent = (id: string) => {
  return useQuery<Event, Error>({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEventById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch current user's events
 */
export const useMyEvents = (params: GetEventsParams = {}) => {
  return useQuery<PaginatedResponse<Event>, Error>({
    queryKey: eventKeys.myEventsList(params),
    queryFn: () => getMyEvents(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create a new event
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, CreateEventRequest>({
    mutationFn: createEvent,
    onSuccess: (newEvent) => {
      // Invalidate events lists to refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });

      showSuccessToast(
        "Your event has been created successfully!",
        "Event Created"
      );
    },
    onError: (error) => {
      handleApiError(error, "Failed to Create Event");
    },
  });
};

/**
 * Hook to update an existing event
 */
export const useUpdateEvent = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    Event,
    Error,
    UpdateEventRequest,
    { previousEvent?: Event }
  >({
    mutationFn: (data) => updateEvent(id, data),
    onMutate: async (updatedData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id) });

      // Snapshot previous value
      const previousEvent = queryClient.getQueryData<Event>(
        eventKeys.detail(id)
      );

      // Optimistically update the cache
      if (previousEvent) {
        queryClient.setQueryData<Event>(eventKeys.detail(id), {
          ...previousEvent,
          ...updatedData,
        });
      }

      return { previousEvent };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(id), context.previousEvent);
      }
      handleApiError(error, "Failed to Update Event");
    },
    onSuccess: (updatedEvent) => {
      // Update cache with server response
      queryClient.setQueryData(eventKeys.detail(id), updatedEvent);

      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });

      showSuccessToast(
        "Your event has been updated successfully!",
        "Event Updated"
      );
    },
  });
};

/**
 * Hook to delete an event
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    string,
    { previousEvent?: Event; eventId: string }
  >({
    mutationFn: deleteEvent,
    onMutate: async (eventId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(eventId) });

      // Snapshot previous value
      const previousEvent = queryClient.getQueryData<Event>(
        eventKeys.detail(eventId)
      );

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) });

      return { previousEvent, eventId };
    },
    onError: (error, eventId, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(
          eventKeys.detail(eventId),
          context.previousEvent
        );
      }
      handleApiError(error, "Failed to Delete Event");
    },
    onSuccess: () => {
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });

      showSuccessToast(
        "The event has been deleted successfully!",
        "Event Deleted"
      );
    },
  });
};
