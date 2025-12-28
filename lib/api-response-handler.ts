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

import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from "@/types/api";

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
  const translationKey = `apiCodes.${code}`;
  const translated = t(translationKey);

  // If translation exists and is different from the key, return it
  if (translated && translated !== translationKey) {
    return translated;
  }

  // Fallback to provided message or code itself
  return fallback || code;
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
  error: any,
  t: (key: string) => string
): {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
} {
  // If error has response data (from axios/fetch)
  if (error?.response?.data) {
    const apiError = error.response.data as
      | ApiErrorResponse
      | {
          error?: { message: string; errors?: Record<string, string[]> };
          code?: string;
          message?: string;
          statusCode?: number;
        };

    // Check if it's the new format with code
    if ("code" in apiError && apiError.code) {
      return {
        message: getMessageFromCode(
          apiError.code,
          t,
          apiError.message || "An error occurred"
        ),
        code: apiError.code,
        errors: "errors" in apiError ? apiError.errors : undefined,
        statusCode:
          "statusCode" in apiError
            ? apiError.statusCode
            : error.response.status,
      };
    }

    // Legacy format support
    if ("error" in apiError && apiError.error) {
      return {
        message: getMessageFromCode(
          apiError.code || "ERROR_INTERNAL_SERVER",
          t,
          apiError.error.message || "An error occurred"
        ),
        code: apiError.code,
        errors: apiError.error.errors,
        statusCode: apiError.statusCode || error.response.status,
      };
    }

    // Fallback for other error formats
    return {
      message: getMessageFromCode(
        apiError.code || "ERROR_INTERNAL_SERVER",
        t,
        (apiError as any).message || "An error occurred"
      ),
      code: apiError.code,
      statusCode: error.response.status,
    };
  }

  // Network errors or other errors without response
  if (error?.request) {
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
  return {
    message: getMessageFromCode(
      "ERROR_INTERNAL_SERVER",
      t,
      error?.message || "An unexpected error occurred"
    ),
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
