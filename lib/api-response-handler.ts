/**
 * API Response Handler Utility
 *
 * This module provides utilities for handling API responses with code-based
 * translations using next-intl. It extracts codes from API responses and
 * translates them to user-friendly messages.
 *
 * Usage:
 * ```typescript
 * import { getMessageFromCode, handleApiResponse } from '@/lib/api-response-handler';
 * import { useTranslations } from 'next-intl';
 *
 * const t = useTranslations('apiCodes');
 * const message = getMessageFromCode('ERROR_REGISTRATION_DUPLICATE_EMAIL', t);
 * ```
 */

import { ApiResponse, ApiSuccessResponse } from "@/types/api";

/**
 * Shape of an extracted API error payload after narrowing an unknown error.
 * Covers axios response bodies, axios-interceptor-formatted errors, and the
 * legacy `{ error: { message, errors } }` format.
 */
interface ExtractedApiError {
  code?: string;
  message?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  error?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
}

/** Type guard: value is a non-null object we can read properties from. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Coerce an unknown value into an ExtractedApiError shape via narrowing. */
function toExtractedApiError(value: unknown): ExtractedApiError {
  if (!isRecord(value)) return {};

  const result: ExtractedApiError = {};

  if (typeof value.code === "string") result.code = value.code;
  if (typeof value.message === "string") result.message = value.message;
  if (typeof value.statusCode === "number")
    result.statusCode = value.statusCode;
  if (isRecord(value.errors)) {
    result.errors = value.errors as Record<string, string[]>;
  }
  if (isRecord(value.error)) {
    const nested = value.error;
    result.error = {
      message: typeof nested.message === "string" ? nested.message : undefined,
      errors: isRecord(nested.errors)
        ? (nested.errors as Record<string, string[]>)
        : undefined,
    };
  }

  return result;
}

/**
 * Get user-friendly message from API code using translation function
 * @param code - API response code
 * @param t - Translation function from next-intl
 * @param fallback - Fallback message if translation is missing
 * @returns Translated message or fallback
 */
export function getMessageFromCode(
  code: string,
  t: (key: string) => string,
  fallback?: string
): string {
  // If code already starts with "apiCodes.", remove the prefix
  // (translation function is already scoped to "apiCodes" namespace)
  const cleanCode = code.startsWith("apiCodes.")
    ? code.replace("apiCodes.", "")
    : code;

  // Translation function is already scoped to "apiCodes" namespace,
  // so we just pass the code directly
  const translated = t(cleanCode);

  // If translation exists and is different from the key, return it
  // (next-intl returns the key if translation is missing)
  if (
    translated &&
    translated !== cleanCode &&
    !translated.startsWith("apiCodes.")
  ) {
    return translated;
  }

  // Fallback to provided message or code itself
  return fallback || cleanCode;
}

/**
 * Handle API response and extract user-friendly messages
 * @param response - API response object
 * @param t - Translation function from next-intl
 * @returns Processed response with translated message
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  t: (key: string) => string
): {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
  pagination?: ApiSuccessResponse<T>["pagination"];
} {
  if (response.success) {
    return {
      success: true,
      data: response.data,
      message: getMessageFromCode(response.code, t),
      code: response.code,
      pagination: (response as ApiSuccessResponse<T>).pagination,
    };
  } else {
    return {
      success: false,
      message: getMessageFromCode(response.code, t, response.message),
      code: response.code,
      errors: response.errors,
    };
  }
}

/**
 * Handle API error (for try-catch blocks)
 * @param error - Error object from axios/fetch
 * @param t - Translation function from next-intl
 * @returns Error information with translated message
 */
export function handleApiError(
  error: unknown,
  t: (key: string) => string
): {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
} {
  // First, try to get the original response data (before axios interceptor formatting)
  let apiError: ExtractedApiError | null = null;
  let statusCode: number | undefined;

  const errorRecord = isRecord(error) ? error : undefined;
  const response = isRecord(errorRecord?.response)
    ? errorRecord.response
    : undefined;

  // Check if error has original response data (from axios, before formatting)
  if (response?.data) {
    apiError = toExtractedApiError(response.data);
    statusCode =
      typeof response.status === "number" ? response.status : undefined;
    console.log("handleApiError - using response.data:", {
      apiError,
      statusCode,
    });
  }
  // Check if error is already formatted (from axios interceptor)
  // The interceptor formats errors but preserves the code field
  else if (
    errorRecord?.code ||
    errorRecord?.statusCode ||
    errorRecord?.message
  ) {
    // Error was already formatted by axios interceptor
    // The formatted error has: { message, statusCode, errors?, code? }
    apiError = toExtractedApiError(errorRecord);
    statusCode = apiError.statusCode;
    console.log("handleApiError - using formatted error:", {
      apiError,
      statusCode,
      originalError: error,
    });
  }

  if (apiError) {
    console.log(
      "handleApiError - apiError.code:",
      apiError.code,
      "type:",
      typeof apiError.code
    );
    // Check if it's the new format with code (prioritize code field)
    // This handles both new format and mixed format (with both code and error fields)
    if (apiError.code && typeof apiError.code === "string") {
      console.log("handleApiError - found code, translating:", apiError.code);
      return {
        message: getMessageFromCode(
          apiError.code,
          t,
          apiError.message || "An error occurred"
        ),
        code: apiError.code,
        errors: apiError.errors,
        statusCode: apiError.statusCode || statusCode,
      };
    }

    // Legacy format support - error is an object with message and errors
    if (
      "error" in apiError &&
      apiError.error &&
      typeof apiError.error === "object" &&
      !Array.isArray(apiError.error)
    ) {
      return {
        message: getMessageFromCode(
          apiError.code || "ERROR_INTERNAL_SERVER",
          t,
          apiError.error.message || "An error occurred"
        ),
        code: apiError.code,
        errors: apiError.error.errors,
        statusCode: apiError.statusCode || statusCode,
      };
    }

    // Fallback for other error formats
    return {
      message: getMessageFromCode(
        apiError.code || "ERROR_INTERNAL_SERVER",
        t,
        apiError.message || "An error occurred"
      ),
      code: apiError.code,
      statusCode: statusCode,
    };
  }

  // Network errors or other errors without response
  if (errorRecord?.request) {
    return {
      message: getMessageFromCode(
        "ERROR_INTERNAL_SERVER",
        t,
        "No response from server. Please check your connection."
      ),
      code: "ERROR_INTERNAL_SERVER",
    };
  }

  // Fallback for other errors
  const fallbackMessage =
    typeof errorRecord?.message === "string"
      ? errorRecord.message
      : "An unexpected error occurred";
  return {
    message: getMessageFromCode("ERROR_INTERNAL_SERVER", t, fallbackMessage),
    code: "ERROR_INTERNAL_SERVER",
  };
}

/**
 * Handle validation errors and translate field-specific errors
 * @param errors - Validation errors object
 * @param t - Translation function from next-intl
 * @returns Object with translated field errors
 */
export function handleValidationErrors(
  errors: Record<string, string[]>,
  t: (key: string) => string
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  Object.keys(errors).forEach((field) => {
    // Get translated message for each field error
    const errorMessages = errors[field].map((msg) =>
      getMessageFromCode(msg, t, msg)
    );
    fieldErrors[field] = errorMessages.join(", ");
  });

  return fieldErrors;
}
