import apiClient from "./client";
import { ADMIN_REGISTRATIONS_PATH } from "@/lib/constants/admin-api";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AdminRegistrationDetail,
  AdminRegistrationListItem,
  AdminRegistrationsListParams,
} from "@/types/registration";

export interface AdminRegistrationsListResult {
  items: AdminRegistrationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function buildListParams(params?: AdminRegistrationsListParams) {
  return {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.paymentStatus ? { paymentStatus: params.paymentStatus } : {}),
    ...(params?.eventId ? { eventId: params.eventId } : {}),
  };
}

export async function getAdminRegistrations(
  params?: AdminRegistrationsListParams
): Promise<AdminRegistrationsListResult> {
  const query = buildListParams(params);

  const response = await apiClient.get<
    ApiSuccessResponse<AdminRegistrationListItem[]>
  >(ADMIN_REGISTRATIONS_PATH, { params: query });

  const body = response.data;
  const items = Array.isArray(body.data) ? body.data : [];

  return {
    items,
    pagination: body.pagination ?? {
      page: query.page,
      limit: query.limit,
      total: items.length,
      totalPages: 1,
    },
  };
}

export async function getAdminRegistrationById(
  id: string
): Promise<AdminRegistrationDetail> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminRegistrationDetail>
  >(`${ADMIN_REGISTRATIONS_PATH}/${id}`);
  return response.data.data;
}

export async function cancelAdminRegistration(id: string): Promise<void> {
  await apiClient.post(`${ADMIN_REGISTRATIONS_PATH}/${id}/cancel`);
}

/** Fetches the filtered list as CSV and triggers a browser download. */
export async function exportAdminRegistrationsCsv(
  params?: AdminRegistrationsListParams
): Promise<void> {
  const { page: _page, limit: _limit, ...filters } = buildListParams(params);
  const response = await apiClient.get(`${ADMIN_REGISTRATIONS_PATH}/export`, {
    params: filters,
    responseType: "blob",
  });

  const blob = new Blob([response.data as BlobPart], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "registrations.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
