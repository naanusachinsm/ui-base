import { apiService } from "./apiService";
import type {
  Enquiry,
  CreateEnquiryRequest,
  UpdateEnquiryRequest,
  EnquiryFilters,
  PaginatedEnquiries,
} from "./enquiryTypes";
import type { BaseResponse } from "./types";

class EnquiryService {
  private baseUrl = "/api/v1/enquiries";

  // Get all enquiries with pagination and filters
  async getEnquiries(
    filters: EnquiryFilters = {}
  ): Promise<BaseResponse<PaginatedEnquiries>> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.source) queryParams.append("source", filters.source);
    if (filters.centerId)
      queryParams.append("centerId", filters.centerId.toString());
    if (filters.courseId)
      queryParams.append("courseId", filters.courseId.toString());
    if (filters.assignedEmployeeId)
      queryParams.append(
        "assignedEmployeeId",
        filters.assignedEmployeeId.toString()
      );

    const url = `${this.baseUrl}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiService.get<PaginatedEnquiries>(url);
  }

  // Get enquiry by ID
  async getEnquiryById(id: number): Promise<BaseResponse<Enquiry>> {
    return apiService.get<Enquiry>(`${this.baseUrl}/${id}`);
  }

  // Create new enquiry
  async createEnquiry(
    data: CreateEnquiryRequest
  ): Promise<BaseResponse<Enquiry>> {
    return apiService.post<Enquiry>(this.baseUrl, data);
  }

  // Update existing enquiry
  async updateEnquiry(
    id: number,
    data: UpdateEnquiryRequest
  ): Promise<BaseResponse<Enquiry>> {
    return apiService.patch<Enquiry>(`${this.baseUrl}/${id}`, data);
  }

  // Delete enquiry (soft delete)
  async deleteEnquiry(id: number): Promise<BaseResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Bulk delete enquiries
  async bulkDeleteEnquiries(ids: number[]): Promise<BaseResponse<void>> {
    return apiService.post<void>(`${this.baseUrl}/bulk-delete`, { ids });
  }

  // Update enquiry status
  async updateEnquiryStatus(
    id: number,
    status: string
  ): Promise<BaseResponse<Enquiry>> {
    return apiService.patch<Enquiry>(`${this.baseUrl}/${id}/status`, {
      status,
    });
  }

  // Assign enquiry to employee
  async assignEnquiry(
    id: number,
    employeeId: number
  ): Promise<BaseResponse<Enquiry>> {
    return apiService.patch<Enquiry>(`${this.baseUrl}/${id}/assign`, {
      employeeId,
    });
  }

  // Convert enquiry to enrollment
  async convertToEnrollment(
    id: number,
    enrollmentData: Record<string, unknown>
  ): Promise<BaseResponse<Enquiry>> {
    return apiService.post<Enquiry>(
      `${this.baseUrl}/${id}/convert`,
      enrollmentData
    );
  }

  // Export enquiries to CSV
  async exportEnquiries(filters: EnquiryFilters = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.source) queryParams.append("source", filters.source);
    if (filters.centerId)
      queryParams.append("centerId", filters.centerId.toString());
    if (filters.courseId)
      queryParams.append("courseId", filters.courseId.toString());
    if (filters.assignedEmployeeId)
      queryParams.append(
        "assignedEmployeeId",
        filters.assignedEmployeeId.toString()
      );

    const url = `${this.baseUrl}/export${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${url}`,
      {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export enquiries");
    }

    return response.blob();
  }

  // Get enquiry statistics
  async getEnquiryStats(): Promise<
    BaseResponse<{
      total: number;
      byStatus: Record<string, number>;
      bySource: Record<string, number>;
      thisMonth: number;
      conversionRate: number;
    }>
  > {
    return apiService.get<{
      total: number;
      byStatus: Record<string, number>;
      bySource: Record<string, number>;
      thisMonth: number;
      conversionRate: number;
    }>(`${this.baseUrl}/stats`);
  }
}

// Create and export a singleton instance
export const enquiryService = new EnquiryService();
