import { apiService } from "./apiService";
import type {
  Enrollment,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
  GetEnrollmentsParams,
} from "./enrollmentTypes";
import type { BaseResponse, PaginatedData } from "./types";

class EnrollmentService {
  private baseUrl = "/api/v1/enrollments";

  /**
   * Get all enrollments with pagination and filtering
   */
  async getEnrollments(
    params: GetEnrollmentsParams = {}
  ): Promise<BaseResponse<PaginatedData<Enrollment>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.paymentStatus)
      queryParams.append("paymentStatus", params.paymentStatus);
    if (params.studentId)
      queryParams.append("studentId", params.studentId.toString());
    if (params.cohortId)
      queryParams.append("cohortId", params.cohortId.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Get a single enrollment by ID
   */
  async getEnrollment(id: number): Promise<BaseResponse<Enrollment>> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new enrollment
   */
  async createEnrollment(
    data: CreateEnrollmentRequest
  ): Promise<BaseResponse<Enrollment>> {
    return apiService.post(this.baseUrl, data);
  }

  /**
   * Update an existing enrollment
   */
  async updateEnrollment(
    id: number,
    data: UpdateEnrollmentRequest
  ): Promise<BaseResponse<Enrollment>> {
    const url = `${this.baseUrl}/${id}`;
    return apiService.patch(url, data);
  }

  /**
   * Delete an enrollment (soft delete)
   */
  async deleteEnrollment(
    id: number
  ): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Restore a soft-deleted enrollment
   */
  async restoreEnrollment(id: number): Promise<BaseResponse<Enrollment>> {
    return apiService.post(`${this.baseUrl}/${id}/restore`);
  }

  /**
   * Permanently delete an enrollment
   */
  async forceDeleteEnrollment(
    id: number
  ): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}/force`);
  }
}

export const enrollmentService = new EnrollmentService();

