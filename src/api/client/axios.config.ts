import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  API_BASE_URL,
  API_TIMEOUT,
  ERROR_MESSAGES,
} from "@/constants/api.constants";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "@/services/storage.service";
import { logger } from "@/services/logger.service";
import { CustomAxiosError } from "@/types/api.types";

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // CSRF Protection
        const csrfToken = document.querySelector<HTMLMetaElement>(
          'meta[name="csrf-token"]'
        )?.content;
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken;
        }

        // Add request ID for tracking
        config.headers["X-Request-ID"] = this.generateRequestId();

        logger.apiRequest(
          config.method?.toUpperCase() || "UNKNOWN",
          config.url || "",
          config.data
        );

        return config;
      },
      (error) => {
        logger.error("Request Error", error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.apiResponse(
          response.config.method?.toUpperCase() || "UNKNOWN",
          response.config.url || "",
          response.status,
          response.data
        );
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Log the error
        logger.error("API Error", {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          message: error.message,
        });

        // Handle timeout
        if (error.code === "ECONNABORTED") {
          const timeoutError: CustomAxiosError = {
            ...error,
            response: {
              data: {
                message: ERROR_MESSAGES.TIMEOUT_ERROR,
                statusCode: 408,
                timestamp: new Date().toISOString(),
                path: originalRequest?.url || "",
              },
              status: 408,
              statusText: "Request Timeout",
              headers: {},
              config: {},
            },
          };
          return Promise.reject(timeoutError);
        }

        // Handle network error
        if (!error.response) {
          const networkError: CustomAxiosError = {
            ...error,
            response: {
              data: {
                message: ERROR_MESSAGES.NETWORK_ERROR,
                statusCode: 0,
                timestamp: new Date().toISOString(),
                path: originalRequest?.url || "",
              },
              status: 0,
              statusText: "Network Error",
              headers: {},
              config: {},
            },
          };
          return Promise.reject(networkError);
        }

        // Handle 401 Unauthorized - Token Refresh
        if (error.response?.status === 401 && !originalRequest?._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest!);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest!._retry = true;
          this.isRefreshing = true;

          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            this.handleAuthError();
            return Promise.reject(error);
          }

          try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data;
            setAccessToken(accessToken);

            this.failedQueue.forEach((promise) => promise.resolve());
            this.failedQueue = [];

            return this.client(originalRequest!);
          } catch (refreshError) {
            this.failedQueue.forEach((promise) => promise.reject(refreshError));
            this.failedQueue = [];
            this.handleAuthError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          const forbiddenError: CustomAxiosError = {
            ...error,
            response: {
              data: {
                message: ERROR_MESSAGES.FORBIDDEN,
                statusCode: 403,
                timestamp: new Date().toISOString(),
                path: originalRequest?.url || "",
              },
              status: 403,
              statusText: "Forbidden",
              headers: error.response.headers || {},
              config: originalRequest || {},
            },
          };
          return Promise.reject(forbiddenError);
        }

        // Handle 404 Not Found
        if (error.response?.status === 404) {
          const notFoundError: CustomAxiosError = {
            ...error,
            response: {
              data: {
                message: ERROR_MESSAGES.NOT_FOUND,
                statusCode: 404,
                timestamp: new Date().toISOString(),
                path: originalRequest?.url || "",
              },
              status: 404,
              statusText: "Not Found",
              headers: error.response.headers || {},
              config: originalRequest || {},
            },
          };
          return Promise.reject(notFoundError);
        }

        // Handle 500 Internal Server Error
        if (error.response?.status >= 500) {
          const serverError: CustomAxiosError = {
            ...error,
            response: {
              data: {
                message: ERROR_MESSAGES.SERVER_ERROR,
                statusCode: error.response.status,
                timestamp: new Date().toISOString(),
                path: originalRequest?.url || "",
              },
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers || {},
              config: originalRequest || {},
            },
          };
          return Promise.reject(serverError);
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private handleAuthError(): void {
    clearTokens();

    // Only redirect if we're not already on the login page
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login";
    }
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }

  // Request cancellation support
  public createCancelToken() {
    return axios.CancelToken.source();
  }

  // Utility methods
  public setAuthToken(token: string): void {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  public clearAuthToken(): void {
    delete this.client.defaults.headers.Authorization;
  }

  public updateBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  public setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export const axiosInstance = apiClient.getInstance();
