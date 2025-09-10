import { apiService } from "./apiService";
import type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  GetOrganizationsParams,
} from "./organizationTypes";
import type { BaseResponse, PaginatedData } from "./types";

class OrganizationService {
  private baseUrl = "/api/v1/organizations";

  /**
   * Get all organizations with pagination and filtering
   */
  async getOrganizations(
    params: GetOrganizationsParams = {}
  ): Promise<BaseResponse<PaginatedData<Organization>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.type) queryParams.append("type", params.type);
    if (params.currency) queryParams.append("currency", params.currency);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Get a single organization by ID
   */
  async getOrganization(id: number): Promise<BaseResponse<Organization>> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Get organization by code
   */
  async getOrganizationByCode(
    code: string
  ): Promise<BaseResponse<Organization>> {
    return apiService.get(`${this.baseUrl}/code/${code}`);
  }

  /**
   * Create a new organization
   */
  async createOrganization(
    data: CreateOrganizationRequest
  ): Promise<BaseResponse<Organization>> {
    return apiService.post(this.baseUrl, data);
  }

  /**
   * Update an existing organization
   */
  async updateOrganization(
    id: number,
    data: UpdateOrganizationRequest
  ): Promise<BaseResponse<Organization>> {
    const url = `${this.baseUrl}/${id}`;
    return apiService.patch(url, data);
  }

  /**
   * Delete an organization (soft delete)
   */
  async deleteOrganization(
    id: number
  ): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Restore a soft-deleted organization
   */
  async restoreOrganization(id: number): Promise<BaseResponse<Organization>> {
    return apiService.post(`${this.baseUrl}/${id}/restore`);
  }

  /**
   * Permanently delete an organization
   */
  async forceDeleteOrganization(
    id: number
  ): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}/force`);
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(id: number): Promise<
    BaseResponse<{
      totalCenters: number;
      totalEmployees: number;
      totalStudents: number;
      activeCenters: number;
      inactiveCenters: number;
    }>
  > {
    return apiService.get(`${this.baseUrl}/${id}/stats`);
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
    id: number,
    settings: Record<string, unknown>
  ): Promise<BaseResponse<Organization>> {
    return apiService.patch(`${this.baseUrl}/${id}/settings`, { settings });
  }

  /**
   * Update billing contact information
   */
  async updateBillingContact(
    id: number,
    billingContact: Record<string, unknown>
  ): Promise<BaseResponse<Organization>> {
    return apiService.patch(`${this.baseUrl}/${id}/billing`, {
      billingContact,
    });
  }

  /**
   * Get organizations by admin employee ID
   */
  async getOrganizationsByAdmin(
    adminEmployeeId: number
  ): Promise<BaseResponse<Organization[]>> {
    return apiService.get(`${this.baseUrl}/admin/${adminEmployeeId}`);
  }

  /**
   * Transfer organization admin
   */
  async transferAdmin(
    id: number,
    newAdminEmployeeId: number
  ): Promise<BaseResponse<Organization>> {
    return apiService.patch(`${this.baseUrl}/${id}/transfer-admin`, {
      adminEmployeeId: newAdminEmployeeId,
    });
  }

  /**
   * Validate organization code uniqueness
   */
  async validateCode(
    code: string,
    excludeId?: number
  ): Promise<BaseResponse<{ isUnique: boolean }>> {
    const queryParams = new URLSearchParams();
    queryParams.append("code", code);
    if (excludeId) queryParams.append("excludeId", excludeId.toString());

    return apiService.get(
      `${this.baseUrl}/validate-code?${queryParams.toString()}`
    );
  }

  /**
   * Validate organization email uniqueness
   */
  async validateEmail(
    email: string,
    excludeId?: number
  ): Promise<BaseResponse<{ isUnique: boolean }>> {
    const queryParams = new URLSearchParams();
    queryParams.append("email", email);
    if (excludeId) queryParams.append("excludeId", excludeId.toString());

    return apiService.get(
      `${this.baseUrl}/validate-email?${queryParams.toString()}`
    );
  }
}

export const organizationService = new OrganizationService();

// Helper functions for organization operations
export const OrganizationHelpers = {
  /**
   * Check if get organizations response was successful
   */
  isGetOrganizationsSuccess: (
    response: BaseResponse<PaginatedData<Organization>>
  ): boolean => {
    return response.success === true && !!response.data?.data;
  },

  /**
   * Extract organizations from response
   */
  getOrganizationsFromResponse: (
    response: BaseResponse<PaginatedData<Organization>>
  ): Organization[] => {
    if (response.success && response.data?.data) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Check if get organization response was successful
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
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  },

  /**
   * Check if create organization response was successful
   */
  isCreateOrganizationSuccess: (
    response: BaseResponse<Organization>
  ): boolean => {
    return response.success === true && !!response.data;
  },

  /**
   * Check if update organization response was successful
   */
  isUpdateOrganizationSuccess: (
    response: BaseResponse<Organization>
  ): boolean => {
    return response.success === true && !!response.data;
  },

  /**
   * Check if delete organization response was successful
   */
  isDeleteOrganizationSuccess: (
    response: BaseResponse<{ message: string }>
  ): boolean => {
    return response.success === true;
  },

  /**
   * Format organization name for display
   */
  formatOrganizationName: (organization: Organization): string => {
    return `${organization.name} (${organization.code})`;
  },

  /**
   * Get organization status color class
   */
  getStatusColorClass: (status: string): string => {
    const statusColors: Record<string, string> = {
      ACTIVE: "text-green-600 bg-green-50",
      INACTIVE: "text-gray-600 bg-gray-50",
      SUSPENDED: "text-red-600 bg-red-50",
    };
    return statusColors[status] || "text-gray-600 bg-gray-50";
  },

  /**
   * Get organization type color class
   */
  getTypeColorClass: (type: string): string => {
    const typeColors: Record<string, string> = {
      UNIVERSITY: "text-blue-600 bg-blue-50",
      CORPORATE: "text-purple-600 bg-purple-50",
      TRAINING: "text-orange-600 bg-orange-50",
      NON_PROFIT: "text-green-600 bg-green-50",
      OTHER: "text-gray-600 bg-gray-50",
    };
    return typeColors[type] || "text-gray-600 bg-gray-50";
  },
};
