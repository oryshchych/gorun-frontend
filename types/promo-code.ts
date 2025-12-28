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
