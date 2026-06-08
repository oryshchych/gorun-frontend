import apiClient from "./client";
import { ADMIN_ANALYTICS_PATH } from "@/lib/constants/admin-api";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AnalyticsParams,
  ByEventResponse,
  DemographicsResponse,
  SummaryResponse,
  TimeseriesResponse,
} from "@/types/analytics";

/** Only the params the backend understands, omitting empty values. */
function buildQuery(params: AnalyticsParams) {
  return {
    preset: params.preset,
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
    ...(params.eventId ? { eventId: params.eventId } : {}),
  };
}

async function get<T>(path: string, params: AnalyticsParams): Promise<T> {
  const response = await apiClient.get<ApiSuccessResponse<T>>(
    `${ADMIN_ANALYTICS_PATH}/${path}`,
    { params: buildQuery(params) }
  );
  return response.data.data;
}

export function getAnalyticsSummary(
  params: AnalyticsParams
): Promise<SummaryResponse> {
  return get<SummaryResponse>("summary", params);
}

export function getAnalyticsTimeseries(
  params: AnalyticsParams
): Promise<TimeseriesResponse> {
  return get<TimeseriesResponse>("timeseries", params);
}

export function getAnalyticsDemographics(
  params: AnalyticsParams
): Promise<DemographicsResponse> {
  return get<DemographicsResponse>("demographics", params);
}

export function getAnalyticsByEvent(
  params: AnalyticsParams
): Promise<ByEventResponse> {
  return get<ByEventResponse>("by-event", params);
}
