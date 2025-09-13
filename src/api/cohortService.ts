import { apiService } from "./apiService";
import type {
  Cohort,
  CreateCohortRequest,
  UpdateCohortRequest,
  GetCohortsParams,
} from "./cohortTypes";
import { CohortHelpers } from "./cohortTypes";
import type { BaseResponse, PaginatedData } from "./types";

class CohortService {
  private baseUrl = "/api/v1/cohorts";

  /**
   * Get cohort by ID with students and course details
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCohortById(id: number): Promise<BaseResponse<any>> {
    return await apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all cohorts with pagination and filtering
   */
  async getCohorts(
    params: GetCohortsParams = {}
  ): Promise<BaseResponse<PaginatedData<Cohort>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.centerId)
      queryParams.append("centerId", params.centerId.toString());
    if (params.courseId)
      queryParams.append("courseId", params.courseId.toString());
    if (params.instructorId)
      queryParams.append("instructorId", params.instructorId.toString());
    if (params.isPublic !== undefined)
      queryParams.append("isPublic", params.isPublic.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Get a single cohort by ID
   */
  async getCohort(id: number): Promise<BaseResponse<Cohort>> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new cohort
   */
  async createCohort(data: CreateCohortRequest): Promise<BaseResponse<Cohort>> {
    return apiService.post(this.baseUrl, data);
  }

  /**
   * Update an existing cohort
   */
  async updateCohort(
    id: number,
    data: UpdateCohortRequest
  ): Promise<BaseResponse<Cohort>> {
    const url = `${this.baseUrl}/${id}`;
    return apiService.patch(url, data);
  }

  /**
   * Delete a cohort (soft delete)
   */
  async deleteCohort(id: number): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Restore a soft-deleted cohort
   */
  async restoreCohort(id: number): Promise<BaseResponse<Cohort>> {
    return apiService.post(`${this.baseUrl}/${id}/restore`);
  }

  /**
   * Permanently delete a cohort
   */
  async forceDeleteCohort(
    id: number
  ): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}/force`);
  }

  /**
   * Get cohort statistics
   */
  async getCohortStats(centerId?: number): Promise<
    BaseResponse<{
      totalCohorts: number;
      activeCohorts: number;
      planningCohorts: number;
      enrollingCohorts: number;
      completedCohorts: number;
      totalEnrollments: number;
      averageCompletionRate: number;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (centerId) queryParams.append("centerId", centerId.toString());

    const url = `${this.baseUrl}/stats?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Validate cohort code uniqueness
   */
  async validateCohortCode(
    code: string,
    excludeId?: number
  ): Promise<BaseResponse<{ isUnique: boolean }>> {
    const queryParams = new URLSearchParams();
    queryParams.append("code", code);
    if (excludeId) queryParams.append("excludeId", excludeId.toString());

    const url = `${this.baseUrl}/validate-code?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Get cohorts by course
   */
  async getCohortsByCourse(
    courseId: number,
    params: Omit<GetCohortsParams, "courseId"> = {}
  ): Promise<BaseResponse<PaginatedData<Cohort>>> {
    return this.getCohorts({ ...params, courseId });
  }

  /**
   * Get cohorts by instructor
   */
  async getCohortsByInstructor(
    instructorId: number,
    params: Omit<GetCohortsParams, "instructorId"> = {}
  ): Promise<BaseResponse<PaginatedData<Cohort>>> {
    return this.getCohorts({ ...params, instructorId });
  }

  /**
   * Get public cohorts
   */
  async getPublicCohorts(
    params: Omit<GetCohortsParams, "isPublic"> = {}
  ): Promise<BaseResponse<PaginatedData<Cohort>>> {
    return this.getCohorts({ ...params, isPublic: true });
  }

  /**
   * Get active cohorts (currently running)
   */
  async getActiveCohorts(
    params: Omit<GetCohortsParams, "status"> = {}
  ): Promise<BaseResponse<PaginatedData<Cohort>>> {
    return this.getCohorts({ ...params, status: "ACTIVE" });
  }

  /**
   * Get enrolling cohorts (open for enrollment)
   */
  async getEnrollingCohorts(
    params: Omit<GetCohortsParams, "status"> = {}
  ): Promise<BaseResponse<PaginatedData<Cohort>>> {
    return this.getCohorts({ ...params, status: "ENROLLING" });
  }

  /**
   * Start a cohort (change status from PLANNING/ENROLLING to ACTIVE)
   */
  async startCohort(id: number): Promise<BaseResponse<Cohort>> {
    return apiService.post(`${this.baseUrl}/${id}/start`);
  }

  /**
   * Complete a cohort (change status to COMPLETED)
   */
  async completeCohort(id: number): Promise<BaseResponse<Cohort>> {
    return apiService.post(`${this.baseUrl}/${id}/complete`);
  }

  /**
   * Cancel a cohort (change status to CANCELLED)
   */
  async cancelCohort(id: number): Promise<BaseResponse<Cohort>> {
    return apiService.post(`${this.baseUrl}/${id}/cancel`);
  }

  /**
   * Open enrollment for a cohort (change status to ENROLLING)
   */
  async openEnrollment(id: number): Promise<BaseResponse<Cohort>> {
    return apiService.post(`${this.baseUrl}/${id}/open-enrollment`);
  }

  /**
   * Close enrollment for a cohort (change status to PLANNING)
   */
  async closeEnrollment(id: number): Promise<BaseResponse<Cohort>> {
    return apiService.post(`${this.baseUrl}/${id}/close-enrollment`);
  }
}

export const cohortService = new CohortService();
export { CohortHelpers };

