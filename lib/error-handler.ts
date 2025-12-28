import { toast } from "sonner";
import { FormattedError } from "./api/client";
import {
  getMessageFromCode,
  handleApiError as handleApiErrorWithCode,
} from "./api-response-handler";

/**
 * Error Handler Utility Module
 *
 * This module provides centralized error handling and user feedback functionality
 * for the application. It includes:
 *
 * - User-friendly error message mapping
 * - Toast notification helpers for success, error, info, warning, and loading states
 * - Consistent error handling for API calls
 * - Form field error extraction
 * - Code-based API error handling with translations
 *
 * Usage:
 * ```typescript
 * import { handleApiError, showSuccessToast } from '@/lib/error-handler';
 * import { useTranslations } from 'next-intl';
 *
 * const t = useTranslations('apiCodes');
 * try {
 *   await someApiCall();
 *   showSuccessToast('Operation completed successfully!', t);
 * } catch (error) {
 *   handleApiError(error, 'Operation Failed', t);
 * }
 * ```
 */

/**
 * Maps common error scenarios to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  "Invalid credentials": "The email or password you entered is incorrect.",
  "User not found": "No account found with this email address.",
  "Email already exists": "An account with this email already exists.",
  Unauthorized: "You need to be logged in to perform this action.",
  "Token expired": "Your session has expired. Please log in again.",

  // Event errors
  "Event not found": "The event you are looking for does not exist.",
  "Event is full": "This event has reached maximum capacity.",
  "Event has passed": "This event has already occurred.",
  "Cannot edit past event":
    "You cannot edit an event that has already occurred.",

  // Registration errors
  "Already registered": "You are already registered for this event.",
  "Registration not found": "Registration not found.",
  "Cannot cancel registration": "You cannot cancel this registration.",

  // Permission errors
  Forbidden: "You do not have permission to perform this action.",
  "Not authorized": "You are not authorized to access this resource.",

  // Network errors
  "Network Error":
    "Unable to connect to the server. Please check your internet connection.",
  "No response from server":
    "The server is not responding. Please try again later.",
  "Request timeout": "The request took too long. Please try again.",

  // Generic errors
  "Internal server error":
    "Something went wrong on our end. Please try again later.",
  "Bad request": "The request could not be processed. Please check your input.",
};

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyMessage(error: FormattedError | string): string {
  const errorMessage = typeof error === "string" ? error : error.message;

  // Check for exact match
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }

  // Check for partial match
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return original message if no match found
  return errorMessage || "An unexpected error occurred. Please try again.";
}

/**
 * Display error toast notification
 * @param error - Error object or message string or API code
 * @param title - Optional toast title
 * @param t - Optional translation function for code-based messages
 */
export function showErrorToast(
  error: FormattedError | string,
  title?: string,
  t?: (key: string) => string
) {
  let message: string;

  if (t) {
    // Try to use code-based translation
    if (typeof error === "string") {
      message = getMessageFromCode(error, t, getUserFriendlyMessage(error));
    } else {
      // Check if error has a code
      const errorWithCode = error as FormattedError & { code?: string };
      if (errorWithCode.code) {
        message = getMessageFromCode(
          errorWithCode.code,
          t,
          getUserFriendlyMessage(error)
        );
      } else {
        message = getUserFriendlyMessage(error);
      }
    }
  } else {
    message = getUserFriendlyMessage(error);
  }

  toast.error(title || "Error", {
    description: message,
    duration: 5000,
  });
}

/**
 * Display success toast notification
 * @param message - Success message or API code
 * @param title - Optional toast title
 * @param t - Optional translation function for code-based messages
 */
export function showSuccessToast(
  message: string,
  title?: string,
  t?: (key: string) => string
) {
  const translatedMessage = t
    ? getMessageFromCode(message, t, message)
    : message;
  toast.success(title || "Success", {
    description: translatedMessage,
    duration: 3000,
  });
}

/**
 * Display info toast notification
 */
export function showInfoToast(message: string, title?: string) {
  toast.info(title || "Info", {
    description: message,
    duration: 3000,
  });
}

/**
 * Display warning toast notification
 */
export function showWarningToast(message: string, title?: string) {
  toast.warning(title || "Warning", {
    description: message,
    duration: 4000,
  });
}

/**
 * Display loading toast notification
 */
export function showLoadingToast(message: string, title?: string) {
  return toast.loading(title || "Loading", {
    description: message,
  });
}

/**
 * Handle API errors with automatic toast notification
 * @param error - Error object from API call
 * @param customMessage - Optional custom error title
 * @param t - Optional translation function for code-based messages
 */
export function handleApiError(
  error: unknown,
  customMessage?: string,
  t?: (key: string) => string
) {
  console.error("API Error:", error);

  if (t) {
    // Use code-based error handling
    const errorInfo = handleApiErrorWithCode(error, t);
    showErrorToast(errorInfo.message, customMessage, t);
    return errorInfo;
  }

  // Fallback to legacy error handling
  if (typeof error === "object" && error !== null && "message" in error) {
    showErrorToast(error as FormattedError, customMessage);
  } else if (typeof error === "string") {
    showErrorToast(error, customMessage);
  } else {
    showErrorToast("An unexpected error occurred. Please try again.");
  }
}

/**
 * Get error message for form field validation
 */
export function getFieldErrorMessage(
  errors: Record<string, string[]> | undefined,
  field: string
): string | undefined {
  if (!errors || !errors[field]) return undefined;
  return errors[field][0];
}
