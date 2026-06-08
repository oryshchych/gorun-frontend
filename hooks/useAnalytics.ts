import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsByEvent,
  getAnalyticsDemographics,
  getAnalyticsSummary,
  getAnalyticsTimeseries,
} from "@/lib/api/analytics";
import type {
  AnalyticsParams,
  ByEventResponse,
  DemographicsResponse,
  SummaryResponse,
  TimeseriesResponse,
} from "@/types/analytics";

export const analyticsKeys = {
  all: ["admin", "analytics"] as const,
  summary: (params: AnalyticsParams) =>
    [...analyticsKeys.all, "summary", params] as const,
  timeseries: (params: AnalyticsParams) =>
    [...analyticsKeys.all, "timeseries", params] as const,
  demographics: (params: AnalyticsParams) =>
    [...analyticsKeys.all, "demographics", params] as const,
  byEvent: (params: AnalyticsParams) =>
    [...analyticsKeys.all, "by-event", params] as const,
};

const STALE_TIME = 1000 * 60 * 5;

export const useAnalyticsSummary = (params: AnalyticsParams) =>
  useQuery<SummaryResponse, Error>({
    queryKey: analyticsKeys.summary(params),
    queryFn: () => getAnalyticsSummary(params),
    staleTime: STALE_TIME,
  });

export const useAnalyticsTimeseries = (params: AnalyticsParams) =>
  useQuery<TimeseriesResponse, Error>({
    queryKey: analyticsKeys.timeseries(params),
    queryFn: () => getAnalyticsTimeseries(params),
    staleTime: STALE_TIME,
  });

export const useAnalyticsDemographics = (params: AnalyticsParams) =>
  useQuery<DemographicsResponse, Error>({
    queryKey: analyticsKeys.demographics(params),
    queryFn: () => getAnalyticsDemographics(params),
    staleTime: STALE_TIME,
  });

export const useAnalyticsByEvent = (params: AnalyticsParams) =>
  useQuery<ByEventResponse, Error>({
    queryKey: analyticsKeys.byEvent(params),
    queryFn: () => getAnalyticsByEvent(params),
    staleTime: STALE_TIME,
  });
