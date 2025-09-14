import { apiService } from "./apiService";
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  GetCoursesParams,
} from "./courseTypes";
import { CourseHelpers } from "./courseTypes";
import type { BaseResponse, PaginatedData } from "./types";

class CourseService {
  private baseUrl = "/api/v1/courses";

  /**
   * Get course by ID with modules and chapters
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCourseById(id: number): Promise<BaseResponse<any>> {
    return await apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all courses with pagination and filtering
   */
  async getCourses(
    params: GetCoursesParams = {}
  ): Promise<BaseResponse<PaginatedData<Course>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params.centerId)
      queryParams.append("centerId", params.centerId.toString());
    if (params.instructorId)
      queryParams.append("instructorId", params.instructorId.toString());
    if (params.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());
    if (params.isPublic !== undefined)
      queryParams.append("isPublic", params.isPublic.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Get a single course by ID
   */
  async getCourse(id: number): Promise<BaseResponse<Course>> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new course
   */
  async createCourse(data: CreateCourseRequest): Promise<BaseResponse<Course>> {
    return apiService.post(this.baseUrl, data);
  }

  /**
   * Update an existing course
   */
  async updateCourse(
    id: number,
    data: UpdateCourseRequest
  ): Promise<BaseResponse<Course>> {
    const url = `${this.baseUrl}/${id}`;
    return apiService.patch(url, data);
  }

  /**
   * Delete a course (soft delete)
   */
  async deleteCourse(id: number): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Restore a soft-deleted course
   */
  async restoreCourse(id: number): Promise<BaseResponse<Course>> {
    return apiService.post(`${this.baseUrl}/${id}/restore`);
  }

  /**
   * Permanently delete a course
   */
  async forceDeleteCourse(
    id: number
  ): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}/force`);
  }

  /**
   * Get course statistics
   */
  async getCourseStats(centerId?: number): Promise<
    BaseResponse<{
      totalCourses: number;
      activeCourses: number;
      draftCourses: number;
      totalEnrollments: number;
      averageRating: number;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (centerId) queryParams.append("centerId", centerId.toString());

    const url = `${this.baseUrl}/stats?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Validate course code uniqueness
   */
  async validateCourseCode(
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
   * Get courses by instructor
   */
  async getCoursesByInstructor(
    instructorId: number,
    params: Omit<GetCoursesParams, "instructorId"> = {}
  ): Promise<BaseResponse<PaginatedData<Course>>> {
    return this.getCourses({ ...params, instructorId });
  }

  /**
   * Get courses by category
   */
  async getCoursesByCategory(
    categoryId: number,
    params: Omit<GetCoursesParams, "categoryId"> = {}
  ): Promise<BaseResponse<PaginatedData<Course>>> {
    return this.getCourses({ ...params, categoryId });
  }

  /**
   * Get public courses
   */
  async getPublicCourses(
    params: Omit<GetCoursesParams, "isPublic"> = {}
  ): Promise<BaseResponse<PaginatedData<Course>>> {
    return this.getCourses({ ...params, isPublic: true });
  }

  /**
   * Get course modules
   */
  async getCourseModules(
    params: { courseId?: number; page?: number; limit?: number } = {}
  ): Promise<BaseResponse<PaginatedData<any>>> {
    const queryParams = new URLSearchParams();
    
    if (params.courseId) queryParams.append("courseId", params.courseId.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.baseUrl}/modules?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Get course chapters
   */
  async getCourseChapters(
    params: { courseModuleId?: number; page?: number; limit?: number } = {}
  ): Promise<BaseResponse<PaginatedData<any>>> {
    const queryParams = new URLSearchParams();
    
    if (params.courseModuleId) queryParams.append("courseModuleId", params.courseModuleId.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.baseUrl}/chapters?${queryParams.toString()}`;
    return apiService.get(url);
  }
}

export const courseService = new CourseService();
export { CourseHelpers };
