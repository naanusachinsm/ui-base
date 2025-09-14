import { apiService } from "./apiService";
import type {
  Feedback,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  FeedbackFilters,
  PaginatedFeedbacks,
} from "./feedbackTypes";
import type { BaseResponse } from "./types";

class FeedbackService {
  private baseUrl = "/api/v1/feedbacks";

  // Get all feedbacks with pagination and filters
  async getFeedbacks(
    filters: FeedbackFilters = {}
  ): Promise<BaseResponse<PaginatedFeedbacks>> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.studentId)
      queryParams.append("studentId", filters.studentId.toString());
    if (filters.courseId)
      queryParams.append("courseId", filters.courseId.toString());
    if (filters.cohortId)
      queryParams.append("cohortId", filters.cohortId.toString());
    if (filters.minRating)
      queryParams.append("minRating", filters.minRating.toString());
    if (filters.maxRating)
      queryParams.append("maxRating", filters.maxRating.toString());
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

    const url = `${this.baseUrl}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiService.get<PaginatedFeedbacks>(url);
  }

  // Get feedback by ID
  async getFeedbackById(id: number): Promise<BaseResponse<Feedback>> {
    return apiService.get<Feedback>(`${this.baseUrl}/${id}`);
  }

  // Create new feedback
  async createFeedback(
    data: CreateFeedbackRequest
  ): Promise<BaseResponse<Feedback>> {
    return apiService.post<Feedback>(this.baseUrl, data);
  }

  // Update existing feedback
  async updateFeedback(
    id: number,
    data: UpdateFeedbackRequest
  ): Promise<BaseResponse<Feedback>> {
    return apiService.patch<Feedback>(`${this.baseUrl}/${id}`, data);
  }

  // Delete feedback (soft delete)
  async deleteFeedback(id: number): Promise<BaseResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Bulk delete feedbacks
  async bulkDeleteFeedbacks(ids: number[]): Promise<BaseResponse<void>> {
    return apiService.post<void>(`${this.baseUrl}/bulk-delete`, { ids });
  }

  // Update feedback status
  async updateFeedbackStatus(
    id: number,
    status: string
  ): Promise<BaseResponse<Feedback>> {
    return apiService.patch<Feedback>(`${this.baseUrl}/${id}/status`, {
      status,
    });
  }

  // Mark feedback as reviewed
  async markAsReviewed(
    id: number,
    reviewData: Record<string, unknown>
  ): Promise<BaseResponse<Feedback>> {
    return apiService.patch<Feedback>(`${this.baseUrl}/${id}/review`, reviewData);
  }

  // Close feedback
  async closeFeedback(
    id: number,
    closeData: Record<string, unknown>
  ): Promise<BaseResponse<Feedback>> {
    return apiService.patch<Feedback>(`${this.baseUrl}/${id}/close`, closeData);
  }

  // Export feedbacks to CSV
  async exportFeedbacks(filters: FeedbackFilters = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.studentId)
      queryParams.append("studentId", filters.studentId.toString());
    if (filters.courseId)
      queryParams.append("courseId", filters.courseId.toString());
    if (filters.cohortId)
      queryParams.append("cohortId", filters.cohortId.toString());
    if (filters.minRating)
      queryParams.append("minRating", filters.minRating.toString());
    if (filters.maxRating)
      queryParams.append("maxRating", filters.maxRating.toString());

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
      throw new Error("Failed to export feedbacks");
    }

    return response.blob();
  }

  // Get feedback statistics
  async getFeedbackStats(): Promise<
    BaseResponse<{
      total: number;
      averageRating: number;
      byStatus: Record<string, number>;
      byRating: Record<string, number>;
      thisMonth: number;
      topRatedCourses: Array<{ courseId: number; courseName: string; averageRating: number }>;
    }>
  > {
    return apiService.get<{
      total: number;
      averageRating: number;
      byStatus: Record<string, number>;
      byRating: Record<string, number>;
      thisMonth: number;
      topRatedCourses: Array<{ courseId: number; courseName: string; averageRating: number }>;
    }>(`${this.baseUrl}/stats`);
  }
}

// Create and export a singleton instance
export const feedbackService = new FeedbackService();

