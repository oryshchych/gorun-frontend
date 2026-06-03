export type PromoCodeDiscountType = "percentage" | "fixed";

export interface PromoCodeValidationRequest {
  code: string;
  eventId: string;
}

export interface PromoCodeValidationResponse {
  id: string;
  code: string;
  discountType: PromoCodeDiscountType;
  discountValue: number;
  eventId: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
  expirationDate?: string;
}

/** Promo code as returned by admin list/detail APIs */
export interface AdminPromoCode {
  id: string;
  code: string;
  discountType: PromoCodeDiscountType;
  discountValue: number;
  eventId: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
  expirationDate?: string | null;
  notes?: string | null;
}

export interface CreatePromoCodeRequest {
  code: string;
  discountType: PromoCodeDiscountType;
  discountValue: number;
  eventId: string;
  isActive: boolean;
  usageLimit?: number;
  /** ISO date string (e.g. YYYY-MM-DD) or null to clear */
  expirationDate?: string | null;
  notes?: string | null;
}

export type UpdatePromoCodeRequest = Omit<
  Partial<CreatePromoCodeRequest>,
  "usageLimit" | "expirationDate" | "notes"
> & {
  usageLimit?: number | null;
  expirationDate?: string | null;
  notes?: string | null;
};
