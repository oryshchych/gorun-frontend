import { useQuery } from "@tanstack/react-query";
import { getEventParticipants } from "@/lib/api/registrations";
import { Participant } from "@/types/registration";

// Query keys for participants cache management
export const participantKeys = {
  all: ["participants"] as const,
  event: (eventId: string) =>
    [...participantKeys.all, "event", eventId] as const,
};

/**
 * Hook to fetch public participants list for an event
 */
export function useParticipants(eventId: string) {
  return useQuery<Participant[]>({
    queryKey: participantKeys.event(eventId),
    queryFn: () => getEventParticipants(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}
