export type PromoCodeDiscountType = "percentage" | "amount";

export interface PromoCodeValidationRequest {
  code: string;
  eventId?: string;
}

export interface PromoCodeValidationResponse {
  code: string;
  discountType: PromoCodeDiscountType;
  discountValue: number;
  isValid: boolean;
}
