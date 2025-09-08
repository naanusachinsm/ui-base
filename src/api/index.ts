// API Module Exports

// Main API Service
export { ApiService, apiService } from "./apiService";

// Auth Service
export { AuthService, authService, AuthHelpers } from "./authService";
export type { LoginRequest, LoginResponse, User } from "./authService";

// Organization Service
export { OrganizationService, organizationService, OrganizationHelpers } from './organizationService';
export type { 
  Organization, 
  CreateOrganizationRequest, 
  UpdateOrganizationRequest,
  OrganizationType,
  OrganizationStatus,
  Currency,
  BillingContact,
  OrganizationSettings
} from './organizationService';

// Types and Interfaces
export * from "./types";

// Default export
export { apiService as default } from "./apiService";
