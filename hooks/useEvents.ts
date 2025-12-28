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
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventImageUrl,
} from "@/types/event";
import { PaginatedResponse } from "@/types/api";
import { handleApiError, showSuccessToast } from "@/lib/error-handler";
import { useTranslations } from "next-intl";

// Query keys for cache management
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: GetEventsParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detailAllLocales: (id: string) => [...eventKeys.details(), id] as const,
  detail: (id: string, lang?: string) =>
    [...eventKeys.detailAllLocales(id), lang || "all"] as const,
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
export const useEvent = (id: string, lang?: string) => {
  return useQuery<Event, Error>({
    queryKey: eventKeys.detail(id, lang),
    queryFn: () => getEventById(id, lang),
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
  const t = useTranslations("apiCodes");

  return useMutation<Event, Error, CreateEventRequest>({
    mutationFn: createEvent,
    onSuccess: (newEvent) => {
      // Invalidate events lists to refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });

      showSuccessToast("SUCCESS_EVENTS_CREATED", "Event Created", t);
    },
    onError: (error) => {
      handleApiError(error, "Failed to Create Event", t);
    },
  });
};

/**
 * Hook to update an existing event
 */
export const useUpdateEvent = (id: string, lang?: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations("apiCodes");

  return useMutation<
    Event,
    Error,
    UpdateEventRequest,
    { previousEvent?: Event }
  >({
    mutationFn: (data) => updateEvent(id, data),
    onMutate: async (updatedData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id, lang) });

      // Snapshot previous value
      const previousEvent = queryClient.getQueryData<Event>(
        eventKeys.detail(id, lang)
      );

      // Optimistically update the cache
      if (previousEvent) {
        // Merge imageUrl properly if provided (UpdateEventRequest has Partial<EventImageUrl>)
        const mergedImageUrl: EventImageUrl | undefined =
          updatedData.imageUrl !== undefined
            ? {
                portrait:
                  updatedData.imageUrl.portrait ??
                  previousEvent.imageUrl?.portrait ??
                  "",
                landscape:
                  updatedData.imageUrl.landscape ??
                  previousEvent.imageUrl?.landscape ??
                  "",
              }
            : previousEvent.imageUrl;

        queryClient.setQueryData<Event>(eventKeys.detail(id, lang), {
          ...previousEvent,
          ...updatedData,
          imageUrl: mergedImageUrl,
        });
      }

      return { previousEvent };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(
          eventKeys.detail(id, lang),
          context.previousEvent
        );
      }
      handleApiError(error, "Failed to Update Event", t);
    },
    onSuccess: (updatedEvent) => {
      // Update cache with server response
      queryClient.setQueryData(eventKeys.detail(id, lang), updatedEvent);

      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });

      showSuccessToast("SUCCESS_EVENTS_UPDATED", "Event Updated", t);
    },
  });
};

/**
 * Hook to delete an event
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("apiCodes");

  return useMutation<
    void,
    Error,
    string,
    { previousEvent?: Event; eventId: string }
  >({
    mutationFn: deleteEvent,
    onMutate: async (eventId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: eventKeys.detailAllLocales(eventId),
      });

      // Snapshot previous value
      const previousEvent = queryClient.getQueryData<Event>(
        eventKeys.detailAllLocales(eventId)
      );

      // Optimistically remove from cache
      queryClient.removeQueries({
        queryKey: eventKeys.detailAllLocales(eventId),
      });

      return { previousEvent, eventId };
    },
    onError: (error, eventId, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(
          eventKeys.detailAllLocales(eventId),
          context.previousEvent
        );
      }
      handleApiError(error, "Failed to Delete Event", t);
    },
    onSuccess: () => {
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });

      showSuccessToast("SUCCESS_EVENTS_DELETED", "Event Deleted", t);
    },
  });
};
