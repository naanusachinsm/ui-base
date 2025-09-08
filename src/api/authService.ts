import { apiService, ApiHelpers } from "./apiService";
import type { BaseResponse } from "./types";

// Auth request/response types
export interface LoginRequest {
  email: string;
  password: string;
  userType: "employee" | "student";
}

export interface LoginResponse {
  access_token: {
    token: string;
    expiresIn?: number;
  };
  employee: {
    id: number;
    email: string;
    name: string;
    role: string;
    centerId: number;
  };
  userType: "employee" | "student";
}

export interface User {
  id: number;
  email: string;
  name: string;
  userType: "employee" | "student";
  role: string;
  centerId: number;
  token?: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  private baseURL = "http://localhost:4000/api/v1";

  constructor() {
    // Set the base URL for the API service
    apiService.setBaseURL(this.baseURL);
  }

  /**
   * Login user with email, password, and user type
   */
  async login(credentials: LoginRequest): Promise<BaseResponse<LoginResponse>> {
    try {
      const response = await apiService.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      // If login is successful, store the auth token
      if (
        ApiHelpers.isSuccess(response) &&
        response.data?.access_token?.token
      ) {
        apiService.setAuthToken(response.data.access_token.token);
      }

      return response;
    } catch (error) {
      // Handle any unexpected errors
      return {
        success: false,
        statusCode: 500,
        message: "Login failed due to network error",
        module: "AUTH",
        error: {
          type: "TECHNICAL_ERROR",
          code: "NETWORK_ERROR",
          details: error,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Logout user and clear stored tokens
   */
  async logout(): Promise<void> {
    try {
      await apiService.post("/auth/logout");
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
    try {
      const response = await apiService.post<{ token: string }>(
        "/auth/refresh",
        {
          refreshToken,
        }
      );

      // If refresh is successful, update the auth token
      if (ApiHelpers.isSuccess(response) && response.data?.token) {
        apiService.setAuthToken(response.data.token);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: "Token refresh failed",
        module: "AUTH",
        error: {
          type: "TECHNICAL_ERROR",
          code: "NETWORK_ERROR",
          details: error,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<BaseResponse<User>> {
    try {
      return await apiService.get<User>("/auth/me");
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: "Failed to fetch user profile",
        module: "AUTH",
        error: {
          type: "TECHNICAL_ERROR",
          code: "NETWORK_ERROR",
          details: error,
        },
        timestamp: new Date().toISOString(),
      };
    }
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
        token: access_token?.token,
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
    if (ApiHelpers.isSuccess(response) && response.data?.access_token?.token) {
      return response.data.access_token.token;
    }
    return null;
  },

  /**
   * Check if login was successful
   */
  isLoginSuccess: (response: BaseResponse<LoginResponse>): boolean => {
    return (
      ApiHelpers.isSuccess(response) && !!response.data?.access_token?.token
    );
  },
};
