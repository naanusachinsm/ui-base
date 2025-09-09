/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "./apiService";
import type { BaseResponse, PaginatedData } from "./types";

// Organization types
export type OrganizationType =
  | "UNIVERSITY"
  | "CORPORATE"
  | "TRAINING"
  | "NON_PROFIT"
  | "OTHER";
export type OrganizationStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AUD";

export interface BillingContact {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface OrganizationSettings {
  [key: string]: any;
}

export interface Organization {
  // Core Identity
  id: number;
  name: string;
  code: string;
  type: OrganizationType;
  status: OrganizationStatus;

  // Contact Information
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  address?: string;

  // Branding
  logoUrl?: string;
  establishedDate?: string;

  // Configuration
  currency: Currency;
  timezone: string;
  adminEmployeeId?: number;

  // Extended Data
  billingContact?: BillingContact;
  settings?: OrganizationSettings;

  // Audit Trail
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
}

export interface CreateOrganizationRequest {
  // Core Identity (required)
  name: string;
  code: string;
  type: OrganizationType;
  status?: OrganizationStatus; // defaults to ACTIVE

  // Contact Information (required)
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  address?: string;

  // Branding
  logoUrl?: string;
  establishedDate?: string;

  // Configuration
  currency?: Currency; // defaults to INR
  timezone?: string; // defaults to UTC
  adminEmployeeId?: number;

  // Extended Data
  billingContact?: BillingContact;
  settings?: OrganizationSettings;
}

export interface UpdateOrganizationRequest {
  // Core Identity
  name?: string;
  code?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;

  // Contact Information
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;

  // Branding
  logoUrl?: string;
  establishedDate?: string;

  // Configuration
  currency?: Currency;
  timezone?: string;
  adminEmployeeId?: number;

  // Extended Data
  billingContact?: BillingContact;
  settings?: OrganizationSettings;
}

/**
 * Organization Service
 * Handles all organization-related API calls
 */
export class OrganizationService {
  private readonly basePath = "/api/v1/organizations";

  /**
   * Get all organizations with optional pagination
   */
  async getOrganizations(params?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<BaseResponse<PaginatedData<Organization>>> {
    return await apiService.get<PaginatedData<Organization>>(
      this.basePath,
      params
    );
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id: number): Promise<BaseResponse<Organization>> {
    return await apiService.get<Organization>(`${this.basePath}/${id}`);
  }

  /**
   * Create new organization
   */
  async createOrganization(
    data: CreateOrganizationRequest
  ): Promise<BaseResponse<Organization>> {
    return await apiService.post<Organization>(this.basePath, data);
  }

  /**
   * Update organization
   */
  async updateOrganization(
    id: number,
    data: UpdateOrganizationRequest
  ): Promise<BaseResponse<Organization>> {
    return await apiService.put<Organization>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id: number): Promise<BaseResponse<void>> {
    return await apiService.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Get organizations for dropdown/selector (simplified data)
   */
  async getOrganizationsForSelector(): Promise<
    BaseResponse<Array<{ id: number; name: string }>>
  > {
    return await apiService.get<Array<{ id: number; name: string }>>(
      `${this.basePath}/selector`
    );
  }
}

// Export a singleton instance
export const organizationService = new OrganizationService();

// Export helper functions
export const OrganizationHelpers = {
  /**
   * Check if organizations fetch was successful
   */
  isGetOrganizationsSuccess: (
    response: BaseResponse<PaginatedData<Organization>>
  ): boolean => {
    return response.success === true && !!response.data?.data;
  },

  /**
   * Extract organizations array from paginated response
   */
  getOrganizationsFromResponse: (
    response: BaseResponse<PaginatedData<Organization>>
  ): Organization[] => {
    if (response.success === true && response.data?.data) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Check if single organization fetch was successful
   */
  isGetOrganizationSuccess: (response: BaseResponse<Organization>): boolean => {
    return response.success === true && !!response.data;
  },

  /**
   * Extract organization from response
   */
  getOrganizationFromResponse: (
    response: BaseResponse<Organization>
  ): Organization | null => {
    return response.data ?? null;
  },

  /**
   * Transform organization for team switcher component
   */
  transformForTeamSwitcher: (
    organizations: Organization[]
  ): Array<{ id: number; name: string; logo: any; plan: string }> => {
    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      logo: null, // Will be set by the component
      plan: org.status || "Active",
    }));
  },
};
