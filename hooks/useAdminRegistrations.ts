import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  cancelAdminRegistration,
  getAdminRegistrationById,
  getAdminRegistrations,
  type AdminRegistrationsListResult,
} from "@/lib/api/admin-registrations";
import { handleApiError } from "@/lib/error-handler";
import type {
  AdminRegistrationDetail,
  AdminRegistrationsListParams,
} from "@/types/registration";

export const registrationKeys = {
  all: ["admin", "registrations"] as const,
  lists: () => [...registrationKeys.all, "list"] as const,
  list: (params: AdminRegistrationsListParams) =>
    [...registrationKeys.lists(), params] as const,
  details: () => [...registrationKeys.all, "detail"] as const,
  detail: (id: string) => [...registrationKeys.details(), id] as const,
};

export const useAdminRegistrations = (
  params: AdminRegistrationsListParams = {}
) => {
  return useQuery<AdminRegistrationsListResult, Error>({
    queryKey: registrationKeys.list(params),
    queryFn: () => getAdminRegistrations(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdminRegistrationDetail = (id: string | null) => {
  return useQuery<AdminRegistrationDetail, Error>({
    queryKey: registrationKeys.detail(id ?? ""),
    queryFn: () => getAdminRegistrationById(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCancelAdminRegistration = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("apiCodes");

  return useMutation<void, Error, string>({
    mutationFn: (id) => cancelAdminRegistration(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
    },
    onError: (error) => {
      handleApiError(error, undefined, t);
    },
  });
};
