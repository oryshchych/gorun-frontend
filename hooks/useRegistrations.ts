import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  getRegistrations,
  getEventRegistrations,
  getMyRegistrations,
  createRegistration,
  cancelRegistration,
  checkRegistration,
  GetRegistrationsParams,
} from "@/lib/api/registrations";
import { Registration, CreateRegistrationRequest } from "@/types/registration";
import { PaginatedResponse } from "@/types/api";
import { Event } from "@/types/event";
import {
  handleApiError,
  showSuccessToast,
  showErrorToast,
} from "@/lib/error-handler";
import { eventKeys } from "./useEvents";

// Query keys for cache management
export const registrationKeys = {
  all: ["registrations"] as const,
  lists: () => [...registrationKeys.all, "list"] as const,
  list: (params: GetRegistrationsParams) =>
    [...registrationKeys.lists(), params] as const,
  myRegistrations: () => [...registrationKeys.all, "my"] as const,
  myRegistrationsList: (params: GetRegistrationsParams) =>
    [...registrationKeys.myRegistrations(), params] as const,
  eventRegistrations: (eventId: string) =>
    [...registrationKeys.all, "event", eventId] as const,
  eventRegistrationsList: (eventId: string, params: GetRegistrationsParams) =>
    [...registrationKeys.eventRegistrations(eventId), params] as const,
  check: (eventId: string) =>
    [...registrationKeys.all, "check", eventId] as const,
};

/**
 * Hook to fetch paginated registrations list
 */
export const useRegistrations = (params: GetRegistrationsParams = {}) => {
  return useQuery<PaginatedResponse<Registration>, Error>({
    queryKey: registrationKeys.list(params),
    queryFn: () => getRegistrations(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch registrations for a specific event
 */
export const useEventRegistrations = (
  eventId: string,
  params: GetRegistrationsParams = {}
) => {
  return useQuery<PaginatedResponse<Registration>, Error>({
    queryKey: registrationKeys.eventRegistrationsList(eventId, params),
    queryFn: () => getEventRegistrations(eventId, params),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch current user's registrations
 */
export const useMyRegistrations = (params: GetRegistrationsParams = {}) => {
  return useQuery<PaginatedResponse<Registration>, Error>({
    queryKey: registrationKeys.myRegistrationsList(params),
    queryFn: () => getMyRegistrations(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to check if user is registered for an event
 */
export const useCheckRegistration = (eventId: string) => {
  return useQuery<boolean, Error>({
    queryKey: registrationKeys.check(eventId),
    queryFn: () => checkRegistration(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to create a new registration
 */
export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Registration,
    Error,
    CreateRegistrationRequest,
    { previousEvent?: Event }
  >({
    mutationFn: async (data) => {
      // Get the event to check capacity before registration
      const event = queryClient.getQueryData<Event>(
        eventKeys.detail(data.eventId)
      );

      // Check if event is at capacity
      if (event && event.registeredCount >= event.capacity) {
        throw new Error("This event is at full capacity");
      }

      return createRegistration(data);
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: eventKeys.detail(data.eventId),
      });

      // Snapshot previous event
      const previousEvent = queryClient.getQueryData<Event>(
        eventKeys.detail(data.eventId)
      );

      // Optimistically update event's registered count
      if (previousEvent) {
        queryClient.setQueryData<Event>(eventKeys.detail(data.eventId), {
          ...previousEvent,
          registeredCount: previousEvent.registeredCount + 1,
        });
      }

      return { previousEvent };
    },
    onError: (error, data, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(
          eventKeys.detail(data.eventId),
          context.previousEvent
        );
      }

      handleApiError(error, "Registration Failed");
    },
    onSuccess: (newRegistration) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: registrationKeys.myRegistrations(),
      });
      queryClient.invalidateQueries({
        queryKey: registrationKeys.eventRegistrations(newRegistration.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: registrationKeys.check(newRegistration.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(newRegistration.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });

      showSuccessToast(
        "You have been successfully registered for this event!",
        "Registration Successful"
      );
    },
  });
};

/**
 * Hook to cancel a registration
 */
export const useCancelRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; eventId: string },
    { previousEvent?: Event }
  >({
    mutationFn: ({ id }) => cancelRegistration(id),
    onMutate: async ({ id, eventId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: eventKeys.detail(eventId),
      });

      // Snapshot previous event
      const previousEvent = queryClient.getQueryData<Event>(
        eventKeys.detail(eventId)
      );

      // Optimistically update event's registered count
      if (previousEvent && previousEvent.registeredCount > 0) {
        queryClient.setQueryData<Event>(eventKeys.detail(eventId), {
          ...previousEvent,
          registeredCount: previousEvent.registeredCount - 1,
        });
      }

      return { previousEvent };
    },
    onError: (error, { eventId }, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(
          eventKeys.detail(eventId),
          context.previousEvent
        );
      }
      handleApiError(error, "Failed to Cancel Registration");
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: registrationKeys.myRegistrations(),
      });
      queryClient.invalidateQueries({
        queryKey: registrationKeys.eventRegistrations(eventId),
      });
      queryClient.invalidateQueries({
        queryKey: registrationKeys.check(eventId),
      });
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(eventId),
      });
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });

      showSuccessToast(
        "Your registration has been cancelled successfully.",
        "Registration Cancelled"
      );
    },
  });
};
