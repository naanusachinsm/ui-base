import { apiService } from "./apiService";
import type {
  Class,
  CreateClassRequest,
  UpdateClassRequest,
  GetClassesParams,
} from "./classTypes";
import type { BaseResponse, PaginatedData } from "./types";

class ClassService {
  private baseUrl = "/api/v1/classes";

  /**
   * Get all classes with pagination and filtering
   */
  async getClasses(
    params: GetClassesParams = {}
  ): Promise<BaseResponse<PaginatedData<Class>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.mode) queryParams.append("mode", params.mode);
    if (params.cohortId)
      queryParams.append("cohortId", params.cohortId.toString());
    if (params.centerId)
      queryParams.append("centerId", params.centerId.toString());
    if (params.instructorEmployeeId)
      queryParams.append(
        "instructorEmployeeId",
        params.instructorEmployeeId.toString()
      );
    if (params.courseModuleId)
      queryParams.append("courseModuleId", params.courseModuleId.toString());
    if (params.courseChapterId)
      queryParams.append("courseChapterId", params.courseChapterId.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Get a single class by ID
   */
  async getClass(id: number): Promise<BaseResponse<Class>> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new class
   */
  async createClass(data: CreateClassRequest): Promise<BaseResponse<Class>> {
    return apiService.post(this.baseUrl, data);
  }

  /**
   * Update an existing class
   */
  async updateClass(
    id: number,
    data: UpdateClassRequest
  ): Promise<BaseResponse<Class>> {
    const url = `${this.baseUrl}/${id}`;
    return apiService.patch(url, data);
  }

  /**
   * Delete a class (soft delete)
   */
  async deleteClass(id: number): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Restore a soft-deleted class
   */
  async restoreClass(id: number): Promise<BaseResponse<Class>> {
    return apiService.post(`${this.baseUrl}/${id}/restore`);
  }

  /**
   * Permanently delete a class
   */
  async forceDeleteClass(
    id: number
  ): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}/force`);
  }

  /**
   * Get classes by cohort ID
   */
  async getClassesByCohort(
    cohortId: number,
    params: Omit<GetClassesParams, "cohortId"> = {}
  ): Promise<BaseResponse<PaginatedData<Class>>> {
    return this.getClasses({ ...params, cohortId });
  }

  /**
   * Get classes by instructor ID
   */
  async getClassesByInstructor(
    instructorEmployeeId: number,
    params: Omit<GetClassesParams, "instructorEmployeeId"> = {}
  ): Promise<BaseResponse<PaginatedData<Class>>> {
    return this.getClasses({ ...params, instructorEmployeeId });
  }

  /**
   * Get classes by center ID
   */
  async getClassesByCenter(
    centerId: number,
    params: Omit<GetClassesParams, "centerId"> = {}
  ): Promise<BaseResponse<PaginatedData<Class>>> {
    return this.getClasses({ ...params, centerId });
  }

  /**
   * Get upcoming classes
   */
  async getUpcomingClasses(
    params: Omit<GetClassesParams, "status"> = {}
  ): Promise<BaseResponse<PaginatedData<Class>>> {
    return this.getClasses({ ...params, status: "SCHEDULED" });
  }

  /**
   * Get completed classes
   */
  async getCompletedClasses(
    params: Omit<GetClassesParams, "status"> = {}
  ): Promise<BaseResponse<PaginatedData<Class>>> {
    return this.getClasses({ ...params, status: "COMPLETED" });
  }
}

export const classService = new ClassService();
