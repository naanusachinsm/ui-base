import { apiService } from "./apiService";
import type {
  Center,
  CreateCenterRequest,
  UpdateCenterRequest,
  GetCentersParams,
} from "./centerTypes";
import type { BaseResponse, PaginatedData } from "./types";

class CenterService {
  private baseUrl = "/api/v1/centers";

  /**
   * Get all centers with pagination and filtering
   */
  async getCenters(
    params: GetCentersParams = {}
  ): Promise<BaseResponse<PaginatedData<Center>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.organizationId)
      queryParams.append("organizationId", params.organizationId.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    return apiService.get(url);
  }

  /**
   * Get a single center by ID
   */
  async getCenter(id: number): Promise<BaseResponse<Center>> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new center
   */
  async createCenter(
    data: CreateCenterRequest
  ): Promise<BaseResponse<Center>> {
    return apiService.post(this.baseUrl, data);
  }

  /**
   * Update an existing center
   */
  async updateCenter(
    id: number,
    data: UpdateCenterRequest
  ): Promise<BaseResponse<Center>> {
    const url = `${this.baseUrl}/${id}`;
    return apiService.patch(url, data);
  }

  /**
   * Delete a center (soft delete)
   */
  async deleteCenter(id: number): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Restore a soft-deleted center
   */
  async restoreCenter(id: number): Promise<BaseResponse<Center>> {
    return apiService.post(`${this.baseUrl}/${id}/restore`);
  }

  /**
   * Permanently delete a center
   */
  async forceDeleteCenter(
    id: number
  ): Promise<BaseResponse<{ message: string }>> {
    return apiService.delete(`${this.baseUrl}/${id}/force`);
  }
}

export const centerService = new CenterService();