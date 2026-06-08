/** Analytics domain types — mirror gorun-backend/src/services/adminAnalytics. */

export type AnalyticsPreset = "week" | "month" | "3months" | "year" | "custom";

export interface AnalyticsParams {
  preset: AnalyticsPreset;
  /** ISO date (YYYY-MM-DD). Required when preset === "custom". */
  from?: string;
  to?: string;
  /** When set, scopes every metric to a single event (drill-in). */
  eventId?: string;
}

export interface SummaryResponse {
  totalRegistrations: number;
  paidRegistrations: number;
  moneyGathered: number;
  /** paidRegistrations / totalRegistrations (0..1). */
  conversionRate: number;
  averageCheck: number;
  afuDonationsTotal: number;
  refundsTotal: number;
  refundsCount: number;
  netRevenue: number;
  cancelledRegistrations: number;
  kidsRegistrations: number;
  newParticipants: number;
  returningParticipants: number;
}

export interface RegistrationDayPoint {
  date: string;
  count: number;
  cumulative: number;
}

export interface PaymentDayPoint {
  date: string;
  count: number;
  sum: number;
}

export interface CombinedDayPoint {
  date: string;
  registrations: number;
  payments: number;
  revenue: number;
}

export interface TimeseriesResponse {
  registrationsByDay: RegistrationDayPoint[];
  paymentsByDay: PaymentDayPoint[];
  combinedByDay: CombinedDayPoint[];
}

export interface Bucket {
  label: string;
  count: number;
}

export interface DemographicsResponse {
  gender: Bucket[];
  ageCategory: Bucket[];
  adultsVsKids: { adults: number; kids: number };
  kidAgeBuckets: Bucket[];
  topCities: Bucket[];
  topRunningClubs: Bucket[];
  topDistances: Bucket[];
  promoUsage: { withPromo: number; withoutPromo: number };
  gaps: { country: boolean; benefit: boolean };
}

export interface ByEventRow {
  eventId: string;
  title: string;
  titleEn: string | null;
  titleUk: string | null;
  date: string | null;
  registrations: number;
  paid: number;
  conversionRate: number;
  revenue: number;
  capacity: number;
  capacityFillPct: number;
}

export type ByEventResponse = ByEventRow[];
