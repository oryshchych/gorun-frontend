import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPromoCodes,
  getAdminPromoCodeById,
  createAdminPromoCode,
  updateAdminPromoCode,
} from "@/lib/api/admin-promo-codes";
import type {
  AdminPromoCode,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
} from "@/types/promo-code";
import type { AdminPromoCodesListResult } from "@/lib/api/admin-promo-codes";
import { handleApiError } from "@/lib/error-handler";
import { useTranslations } from "next-intl";

export interface AdminPromoCodesListParams {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
}

export const promoCodeKeys = {
  all: ["admin", "promo-codes"] as const,
  lists: () => [...promoCodeKeys.all, "list"] as const,
  list: (params: AdminPromoCodesListParams) =>
    [...promoCodeKeys.lists(), params] as const,
  details: () => [...promoCodeKeys.all, "detail"] as const,
  detail: (id: string) => [...promoCodeKeys.details(), id] as const,
};

export const useAdminPromoCodes = (params: AdminPromoCodesListParams = {}) => {
  return useQuery<AdminPromoCodesListResult, Error>({
    queryKey: promoCodeKeys.list(params),
    queryFn: () => getAdminPromoCodes(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdminPromoCode = (id: string) => {
  return useQuery<AdminPromoCode, Error>({
    queryKey: promoCodeKeys.detail(id),
    queryFn: () => getAdminPromoCodeById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateAdminPromoCode = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("apiCodes");

  return useMutation<AdminPromoCode, Error, CreatePromoCodeRequest>({
    mutationFn: createAdminPromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.lists() });
    },
    onError: (error) => {
      handleApiError(error, undefined, t);
    },
  });
};

export const useUpdateAdminPromoCode = (id: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations("apiCodes");

  return useMutation<AdminPromoCode, Error, UpdatePromoCodeRequest>({
    mutationFn: (data) => updateAdminPromoCode(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(promoCodeKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.lists() });
    },
    onError: (error) => {
      handleApiError(error, undefined, t);
    },
  });
};
