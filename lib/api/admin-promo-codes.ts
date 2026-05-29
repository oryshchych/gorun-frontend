import apiClient from "./client";
import { ADMIN_PROMO_CODES_PATH } from "@/lib/constants/admin-api";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AdminPromoCode,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
} from "@/types/promo-code";

export interface AdminPromoCodesListResult {
  items: AdminPromoCode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAdminPromoCodes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
}): Promise<AdminPromoCodesListResult> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  const response = await apiClient.get<ApiSuccessResponse<AdminPromoCode[]>>(
    ADMIN_PROMO_CODES_PATH,
    {
      params: {
        page,
        limit,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.eventId ? { eventId: params.eventId } : {}),
      },
    }
  );

  const body = response.data;
  const items = Array.isArray(body.data) ? body.data : [];

  return {
    items,
    pagination: body.pagination ?? {
      page,
      limit,
      total: items.length,
      totalPages: 1,
    },
  };
}

export async function getAdminPromoCodeById(id: string): Promise<AdminPromoCode> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPromoCode>>(
    `${ADMIN_PROMO_CODES_PATH}/${id}`
  );
  return response.data.data;
}

export async function createAdminPromoCode(
  body: CreatePromoCodeRequest
): Promise<AdminPromoCode> {
  const response = await apiClient.post<ApiSuccessResponse<AdminPromoCode>>(
    ADMIN_PROMO_CODES_PATH,
    body
  );
  return response.data.data;
}

export async function updateAdminPromoCode(
  id: string,
  body: UpdatePromoCodeRequest
): Promise<AdminPromoCode> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminPromoCode>>(
    `${ADMIN_PROMO_CODES_PATH}/${id}`,
    body
  );
  return response.data.data;
}
