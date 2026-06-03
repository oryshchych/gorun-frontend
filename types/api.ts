export interface ApiSuccessResponse<T = unknown> {
  success: true;
  code: string;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Legacy support - keep for backward compatibility
export interface ApiError {
  success: false;
  error: {
    message: string;
    errors?: Record<string, string[]>;
  };
  statusCode?: number;
  code?: string; // Add code field for legacy support
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
