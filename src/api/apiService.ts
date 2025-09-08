import type { BaseResponse, ModuleNames, ErrorTypes } from "./types";
import { API_CONFIG } from "@/config/constants";
import { toast } from "sonner";

/**
 * Simple and reusable API service for handling HTTP requests
 */
export class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(
    baseURL: string = API_CONFIG.baseUrl,
    defaultHeaders: Record<string, string> = {}
  ) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
    this.timeout = API_CONFIG.timeout;

    // Automatically load and set access token from localStorage on initialization
    this.initializeAuthToken();
  }

  /**
   * Initialize auth token from localStorage
   */
  private initializeAuthToken(): void {
    const token = this.getStoredToken();
    if (token) {
      this.setAuthToken(token);
    }
  }

  /**
   * Get stored access token from localStorage
   */
  private getStoredToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  /**
   * Store access token in localStorage
   */
  private storeToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  /**
   * Remove access token from localStorage
   */
  private removeStoredToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  /**
   * Set base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * Set authorization token and store it in localStorage
   */
  setAuthToken(token: string): void {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
    this.storeToken(token);
    console.log("API Service: Auth token set in headers and localStorage");
  }

  /**
   * Remove authorization token and clear from localStorage
   */
  removeAuthToken(): void {
    delete this.defaultHeaders["Authorization"];
    this.removeStoredToken();
  }

  /**
   * Set custom header
   */
  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Remove custom header
   */
  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Refresh token from localStorage (useful after login/logout)
   */
  refreshAuthToken(): void {
    const token = this.getStoredToken();
    if (token) {
      this.defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders["Authorization"];
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Debug method to check authentication status
   */
  debugAuthStatus(): void {
    const token = this.getStoredToken();
    const hasAuthHeader = !!this.defaultHeaders["Authorization"];
    console.log("=== API Service Auth Debug ===");
    console.log("Stored token exists:", !!token);
    console.log(
      "Token preview:",
      token ? token.substring(0, 20) + "..." : "None"
    );
    console.log("Authorization header exists:", hasAuthHeader);
    console.log(
      "Authorization header value:",
      this.defaultHeaders["Authorization"]
        ? this.defaultHeaders["Authorization"].substring(0, 30) + "..."
        : "None"
    );
    console.log("=============================");
  }

  /**
   * Generic request method
   */
  private async request<T = unknown>(
    method: string,
    url: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<BaseResponse<T>> {
    try {
      const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

      // Ensure we have the latest token from localStorage for each request
      const storedToken = this.getStoredToken();
      if (storedToken && !this.defaultHeaders["Authorization"]) {
        this.defaultHeaders["Authorization"] = `Bearer ${storedToken}`;
      }

      // Debug: Log if we have an auth token for this request
      if (this.defaultHeaders["Authorization"]) {
        console.log(
          "API Request: Authorization header present for",
          method,
          url
        );
      } else {
        console.log("API Request: No authorization header for", method, url);
      }

      const requestOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          ...this.defaultHeaders,
          ...customHeaders,
        },
        signal: AbortSignal.timeout(this.timeout),
      };

      // Add body for POST, PUT, PATCH requests
      if (["POST", "PUT", "PATCH"].includes(method.toUpperCase()) && data) {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(fullUrl, requestOptions);
      const responseData = (await response.json()) as BaseResponse<T>;

      // Handle error notifications only
      if (!responseData.success) {
        // Show error toast for all failed requests
        const errorMessage = responseData.message || "An error occurred";
        toast.error(errorMessage);
      }

      return responseData;
    } catch (error: unknown) {
      // Show network error toast
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
      toast.error(errorMessage);

      // Create a basic error response if the request fails
      return {
        success: false,
        statusCode: 500,
        message: errorMessage,
        module: "APP" as ModuleNames,
        error: {
          type: "TECHNICAL_ERROR" as ErrorTypes,
          code: "NETWORK_ERROR",
          details: error,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  ): Promise<BaseResponse<T>> {
    let finalUrl = url;
    if (params) {
      const stringParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        stringParams[key] = String(value);
      });
      const searchParams = new URLSearchParams(stringParams);
      finalUrl = `${url}?${searchParams}`;
    }
    return this.request<T>("GET", finalUrl, undefined, headers);
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<BaseResponse<T>> {
    return this.request<T>("POST", url, data, headers);
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<BaseResponse<T>> {
    return this.request<T>("PUT", url, data, headers);
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<BaseResponse<T>> {
    return this.request<T>("PATCH", url, data, headers);
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    headers?: Record<string, string>
  ): Promise<BaseResponse<T>> {
    return this.request<T>("DELETE", url, undefined, headers);
  }
}

// Default API service instance
export const apiService = new ApiService();

// Helper functions for common operations
export const ApiHelpers = {
  /**
   * Check if response is successful
   */
  isSuccess: <T>(
    response: BaseResponse<T>
  ): response is BaseResponse<T> & { success: true; data: T } => {
    return response.success === true;
  },

  /**
   * Check if response is an error
   */
  isError: (
    response: BaseResponse
  ): response is BaseResponse & {
    success: false;
    error: NonNullable<BaseResponse["error"]>;
  } => {
    return response.success === false;
  },

  /**
   * Extract data from successful response
   */
  getData: <T>(response: BaseResponse<T>): T | null => {
    return ApiHelpers.isSuccess(response) ? response.data : null;
  },

  /**
   * Extract error from error response
   */
  getError: (response: BaseResponse): BaseResponse["error"] | null => {
    return ApiHelpers.isError(response) ? response.error : null;
  },
};
