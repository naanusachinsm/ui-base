import { apiService, ApiHelpers } from "./apiService";
import type { BaseResponse } from "./types";

// API Configuration
const API_BASE_URL = "http://localhost:4000";
const API_VERSION_PATH = "/api/v1";

// Auth request/response types
export interface LoginRequest {
  email: string;
  password: string;
  userType: "employee" | "student";
}

export interface LoginResponse {
  access_token: {
    accessToken: string;
    refreshToken: string;
  };
  employee: {
    id: number;
    email: string;
    name: string;
    role: string;
    centerId: number;
    status: string;
  };
  userType: "employee" | "student";
}

export interface User {
  id: number;
  email: string;
  name: string;
  userType: "employee" | "student";
  role: string;
  centerId?: number;
  accessToken?: string;
  refreshToken?: string;
  status?: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  constructor() {
    // Set the base URL for the API service
    apiService.setBaseURL(API_BASE_URL);
  }

  /**
   * Login user with email, password, and user type
   */
  async login(credentials: LoginRequest): Promise<BaseResponse<LoginResponse>> {
    const response = await apiService.post<LoginResponse>(
      `${API_VERSION_PATH}/auth/login`,
      credentials
    );

    // If login is successful, store the auth token
    if (
      ApiHelpers.isSuccess(response) &&
      response.data?.access_token?.accessToken
    ) {
      apiService.setAuthToken(response.data.access_token.accessToken);
    }

    return response;
  }

  /**
   * Logout user and clear stored tokens
   */
  async logout(): Promise<void> {
    try {
      await apiService.post("/api/v1/auth/logout");
    } catch (error) {
      // Even if logout API fails, we should clear local tokens
      console.warn("Logout API call failed:", error);
    } finally {
      // Always clear the auth token from the service
      apiService.removeAuthToken();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(
    refreshToken: string
  ): Promise<BaseResponse<{ token: string }>> {
    const response = await apiService.post<{ token: string }>(
      "/api/v1/auth/refresh",
      {
        refreshToken,
      }
    );

    // If refresh is successful, update the auth token
    if (ApiHelpers.isSuccess(response) && response.data?.token) {
      apiService.setAuthToken(response.data.token);
    }

    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<BaseResponse<User>> {
    return await apiService.get<User>("/api/v1/auth/me");
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    // This is a simple check - in a real app, you might want to validate the token
    return !!localStorage.getItem("auth-token");
  }
}

// Export a singleton instance
export const authService = new AuthService();

// Export helper functions
export const AuthHelpers = {
  /**
   * Extract user data from login response
   */
  getUserFromResponse: (response: BaseResponse<LoginResponse>): User | null => {
    if (ApiHelpers.isSuccess(response) && response.data?.employee) {
      const { employee, access_token, userType } = response.data;
      return {
        id: employee.id,
        email: employee.email,
        name: employee.name,
        userType: userType,
        role: employee.role,
        centerId: employee.centerId,
        accessToken: access_token?.accessToken,
        refreshToken: access_token?.refreshToken,
        status: employee.status,
      };
    }
    return null;
  },

  /**
   * Extract token from login response
   */
  getTokenFromResponse: (
    response: BaseResponse<LoginResponse>
  ): string | null => {
    if (
      ApiHelpers.isSuccess(response) &&
      response.data?.access_token?.accessToken
    ) {
      return response.data.access_token.accessToken;
    }
    return null;
  },

  /**
   * Check if login was successful
   */
  isLoginSuccess: (response: BaseResponse<LoginResponse>): boolean => {
    return (
      ApiHelpers.isSuccess(response) &&
      !!response.data?.access_token?.accessToken
    );
  },
};
