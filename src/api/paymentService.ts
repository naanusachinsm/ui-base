import { apiService } from "./apiService";
import type {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentFilters,
  PaginatedPayments,
} from "./paymentTypes";
import type { BaseResponse } from "./types";

class PaymentService {
  private baseUrl = "/api/v1/payments";

  // Get all payments with pagination and filters
  async getPayments(
    filters: PaymentFilters = {}
  ): Promise<BaseResponse<PaginatedPayments>> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.paymentMethod)
      queryParams.append("paymentMethod", filters.paymentMethod);
    if (filters.studentId)
      queryParams.append("studentId", filters.studentId.toString());
    if (filters.enrollmentId)
      queryParams.append("enrollmentId", filters.enrollmentId.toString());
    if (filters.courseId)
      queryParams.append("courseId", filters.courseId.toString());
    if (filters.cohortId)
      queryParams.append("cohortId", filters.cohortId.toString());
    if (filters.centerId)
      queryParams.append("centerId", filters.centerId.toString());
    if (filters.processedByEmployeeId)
      queryParams.append(
        "processedByEmployeeId",
        filters.processedByEmployeeId.toString()
      );
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

    const url = `${this.baseUrl}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiService.get<PaginatedPayments>(url);
  }

  // Get payment by ID
  async getPaymentById(id: number): Promise<BaseResponse<Payment>> {
    return apiService.get<Payment>(`${this.baseUrl}/${id}`);
  }

  // Create new payment
  async createPayment(
    data: CreatePaymentRequest
  ): Promise<BaseResponse<Payment>> {
    return apiService.post<Payment>(this.baseUrl, data);
  }

  // Update existing payment
  async updatePayment(
    id: number,
    data: UpdatePaymentRequest
  ): Promise<BaseResponse<Payment>> {
    return apiService.patch<Payment>(`${this.baseUrl}/${id}`, data);
  }

  // Delete payment (soft delete)
  async deletePayment(id: number): Promise<BaseResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Bulk delete payments
  async bulkDeletePayments(ids: number[]): Promise<BaseResponse<void>> {
    return apiService.post<void>(`${this.baseUrl}/bulk-delete`, { ids });
  }

  // Update payment status
  async updatePaymentStatus(
    id: number,
    status: string
  ): Promise<BaseResponse<Payment>> {
    return apiService.patch<Payment>(`${this.baseUrl}/${id}/status`, {
      status,
    });
  }

  // Process payment
  async processPayment(
    id: number,
    paymentData: Record<string, unknown>
  ): Promise<BaseResponse<Payment>> {
    return apiService.patch<Payment>(
      `${this.baseUrl}/${id}/process`,
      paymentData
    );
  }

  // Refund payment
  async refundPayment(
    id: number,
    refundData: Record<string, unknown>
  ): Promise<BaseResponse<Payment>> {
    return apiService.patch<Payment>(
      `${this.baseUrl}/${id}/refund`,
      refundData
    );
  }

  // Export payments to CSV
  async exportPayments(filters: PaymentFilters = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.paymentMethod)
      queryParams.append("paymentMethod", filters.paymentMethod);
    if (filters.studentId)
      queryParams.append("studentId", filters.studentId.toString());
    if (filters.enrollmentId)
      queryParams.append("enrollmentId", filters.enrollmentId.toString());
    if (filters.courseId)
      queryParams.append("courseId", filters.courseId.toString());
    if (filters.cohortId)
      queryParams.append("cohortId", filters.cohortId.toString());
    if (filters.centerId)
      queryParams.append("centerId", filters.centerId.toString());
    if (filters.processedByEmployeeId)
      queryParams.append(
        "processedByEmployeeId",
        filters.processedByEmployeeId.toString()
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
      throw new Error("Failed to export payments");
    }

    return response.blob();
  }

  // Get payment statistics
  async getPaymentStats(): Promise<
    BaseResponse<{
      total: number;
      totalAmount: number;
      byStatus: Record<string, number>;
      byPaymentMethod: Record<string, number>;
      thisMonth: number;
      thisMonthAmount: number;
    }>
  > {
    return apiService.get<{
      total: number;
      totalAmount: number;
      byStatus: Record<string, number>;
      byPaymentMethod: Record<string, number>;
      thisMonth: number;
      thisMonthAmount: number;
    }>(`${this.baseUrl}/stats`);
  }
}

// Create and export a singleton instance
export const paymentService = new PaymentService();
