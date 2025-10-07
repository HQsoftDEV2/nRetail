import { AxiosError } from 'axios';

// Base API Response
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Response
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
  timestamp: string;
  path: string;
}

// Custom Error Type
export interface CustomAxiosError extends AxiosError {
  response?: {
    data: ApiErrorResponse;
    status: number;
    statusText: string;
    headers: any;
    config: any;
  };
}

// Request Config Extensions
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// API Hook Options
export interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  enabled?: boolean;
}

// Query Options
export interface QueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
}

// Mutation Options
export interface MutationOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}
