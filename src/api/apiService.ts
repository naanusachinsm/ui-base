import type { BaseResponse, ModuleNames, ErrorTypes } from './types';
import { API_CONFIG } from '@/config/constants';
import { toast } from 'sonner';

/**
 * Simple and reusable API service for handling HTTP requests
 */
export class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(baseURL: string = API_CONFIG.baseUrl, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Set base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
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
   * Generic request method
   */
  private async request<T = unknown>(
    method: string,
    url: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<BaseResponse<T>> {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      
      const requestOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          ...this.defaultHeaders,
          ...customHeaders,
        },
        signal: AbortSignal.timeout(this.timeout),
      };

      // Add body for POST, PUT, PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(fullUrl, requestOptions);
      const responseData = await response.json() as BaseResponse<T>;

      // Handle error notifications only
      if (!responseData.success) {
        // Show error toast for all failed requests
        const errorMessage = responseData.message || 'An error occurred';
        toast.error(errorMessage);
      }

      return responseData;
    } catch (error: unknown) {
      // Show network error toast
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      toast.error(errorMessage);
      
      // Create a basic error response if the request fails
      return {
        success: false,
        statusCode: 500,
        message: errorMessage,
        module: 'APP' as ModuleNames,
        error: {
          type: 'TECHNICAL_ERROR' as ErrorTypes,
          code: 'NETWORK_ERROR',
          details: error,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, params?: Record<string, string | number | boolean>, headers?: Record<string, string>): Promise<BaseResponse<T>> {
    let finalUrl = url;
    if (params) {
      const stringParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        stringParams[key] = String(value);
      });
      const searchParams = new URLSearchParams(stringParams);
      finalUrl = `${url}?${searchParams}`;
    }
    return this.request<T>('GET', finalUrl, undefined, headers);
  }

  /**
   * POST request
   */
  async post<T = unknown>(url: string, data?: unknown, headers?: Record<string, string>): Promise<BaseResponse<T>> {
    return this.request<T>('POST', url, data, headers);
  }

  /**
   * PUT request
   */
  async put<T = unknown>(url: string, data?: unknown, headers?: Record<string, string>): Promise<BaseResponse<T>> {
    return this.request<T>('PUT', url, data, headers);
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(url: string, data?: unknown, headers?: Record<string, string>): Promise<BaseResponse<T>> {
    return this.request<T>('PATCH', url, data, headers);
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, headers?: Record<string, string>): Promise<BaseResponse<T>> {
    return this.request<T>('DELETE', url, undefined, headers);
  }
}

// Default API service instance
export const apiService = new ApiService();

// Helper functions for common operations
export const ApiHelpers = {
  /**
   * Check if response is successful
   */
  isSuccess: <T>(response: BaseResponse<T>): response is BaseResponse<T> & { success: true; data: T } => {
    return response.success === true;
  },

  /**
   * Check if response is an error
   */
  isError: (response: BaseResponse): response is BaseResponse & { success: false; error: NonNullable<BaseResponse['error']> } => {
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
  getError: (response: BaseResponse): BaseResponse['error'] | null => {
    return ApiHelpers.isError(response) ? response.error : null;
  },
};