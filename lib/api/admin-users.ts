import apiClient from "./client";
import { ADMIN_USERS_PATH } from "@/lib/constants/admin-api";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AdminUserDetail,
  AdminUserListItem,
  AdminUserSource,
  CancelRegistrationResult,
  UpdateAdminUserRequest,
} from "@/types/user";

export interface AdminUsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: AdminUserSource;
}

export interface AdminUsersListResult {
  items: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function buildListParams(params?: AdminUsersListParams) {
  return {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.source && params.source !== "all"
      ? { source: params.source }
      : {}),
  };
}

export async function getAdminUsers(
  params?: AdminUsersListParams
): Promise<AdminUsersListResult> {
  const query = buildListParams(params);

  const response = await apiClient.get<ApiSuccessResponse<AdminUserListItem[]>>(
    ADMIN_USERS_PATH,
    { params: query }
  );

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

export async function getAdminUserById(id: string): Promise<AdminUserDetail> {
  const response = await apiClient.get<ApiSuccessResponse<AdminUserDetail>>(
    `${ADMIN_USERS_PATH}/${id}`
  );
  return response.data.data;
}

export async function updateAdminUser(
  id: string,
  body: UpdateAdminUserRequest
): Promise<AdminUserDetail> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminUserDetail>>(
    `${ADMIN_USERS_PATH}/${id}`,
    body
  );
  return response.data.data;
}

export async function softDeleteAdminUser(
  id: string
): Promise<{ id: string; deletedAt: string }> {
  const response = await apiClient.delete<
    ApiSuccessResponse<{ id: string; deletedAt: string }>
  >(`${ADMIN_USERS_PATH}/${id}`);
  return response.data.data;
}

export async function cancelUserRegistration(
  userId: string,
  registrationId: string
): Promise<CancelRegistrationResult> {
  const response = await apiClient.post<
    ApiSuccessResponse<CancelRegistrationResult>
  >(`${ADMIN_USERS_PATH}/${userId}/registrations/${registrationId}/cancel`);
  return response.data.data;
}

/** Fetches the filtered list as CSV and triggers a browser download. */
export async function exportAdminUsersCsv(
  params?: AdminUsersListParams
): Promise<void> {
  const { page: _page, limit: _limit, ...filters } = buildListParams(params);
  const response = await apiClient.get(`${ADMIN_USERS_PATH}/export`, {
    params: filters,
    responseType: "blob",
  });

  const blob = new Blob([response.data as BlobPart], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "users.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
