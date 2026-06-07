import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  cancelUserRegistration,
  getAdminUserById,
  getAdminUsers,
  softDeleteAdminUser,
  updateAdminUser,
  type AdminUsersListParams,
  type AdminUsersListResult,
} from "@/lib/api/admin-users";
import { handleApiError } from "@/lib/error-handler";
import type {
  AdminUserDetail,
  CancelRegistrationResult,
  UpdateAdminUserRequest,
} from "@/types/user";

export const userKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: AdminUsersListParams) =>
    [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const useAdminUsers = (params: AdminUsersListParams = {}) => {
  return useQuery<AdminUsersListResult, Error>({
    queryKey: userKeys.list(params),
    queryFn: () => getAdminUsers(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdminUserDetail = (id: string | null) => {
  return useQuery<AdminUserDetail, Error>({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => getAdminUserById(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateAdminUser = (id: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations("apiCodes");

  return useMutation<AdminUserDetail, Error, UpdateAdminUserRequest>({
    mutationFn: (data) => updateAdminUser(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(userKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      handleApiError(error, undefined, t);
    },
  });
};

export const useSoftDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("apiCodes");

  return useMutation<{ id: string; deletedAt: string }, Error, string>({
    mutationFn: (id) => softDeleteAdminUser(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      handleApiError(error, undefined, t);
    },
  });
};

export const useCancelUserRegistration = (userId: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations("apiCodes");

  return useMutation<CancelRegistrationResult, Error, string>({
    mutationFn: (registrationId) =>
      cancelUserRegistration(userId, registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      handleApiError(error, undefined, t);
    },
  });
};
