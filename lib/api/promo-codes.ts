import apiClient from "./client";
import { ApiSuccessResponse } from "@/types/api";
import {
  PromoCodeValidationRequest,
  PromoCodeValidationResponse,
} from "@/types/promo-code";

const MAX_CODE_LENGTH = 50;
const MIN_CODE_LENGTH = 1;
const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeCode = (code: string) => code.trim().toUpperCase();

const isValidObjectIdOrUuid = (value: string) =>
  OBJECT_ID_REGEX.test(value) || UUID_REGEX.test(value);

const buildValidationError = (message: string, field: string) => ({
  message: "Validation error",
  statusCode: 400,
  errors: {
    [field]: [message],
  },
});

const validatePayload = ({
  code,
  eventId,
}: PromoCodeValidationRequest): PromoCodeValidationRequest => {
  const normalizedCode = normalizeCode(code);

  if (
    !normalizedCode ||
    normalizedCode.length < MIN_CODE_LENGTH ||
    normalizedCode.length > MAX_CODE_LENGTH
  ) {
    throw buildValidationError(
      "Code must be between 1 and 50 characters",
      "code"
    );
  }

  if (eventId && !isValidObjectIdOrUuid(eventId)) {
    throw buildValidationError(
      "eventId must be a valid UUID or MongoDB ObjectId",
      "eventId"
    );
  }

  return { code: normalizedCode, eventId };
};

/**
 * Validate a promo code and return discount details.
 * Returns null if validation fails (invalid/expired code).
 */
export const validatePromoCode = async (
  payload: PromoCodeValidationRequest
): Promise<PromoCodeValidationResponse | null> => {
  try {
    const validatedPayload = validatePayload(payload);

    const response = await apiClient.post<
      ApiSuccessResponse<PromoCodeValidationResponse>
    >("/promo-codes/validate", validatedPayload);

    return response.data.data;
  } catch (error: any) {
    // Return null for invalid/expired codes (400, 404, etc.)
    if (error?.response?.status === 400 || error?.response?.status === 404) {
      return null;
    }
    // Re-throw other errors (network, 500, etc.)
    throw error;
  }
};
