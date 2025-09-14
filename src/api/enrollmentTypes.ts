// Enrollment entity types and interfaces

import type { Cohort } from "./cohortTypes";

export const EnrollmentStatus = {
  ENROLLED: "ENROLLED",
  COMPLETED: "COMPLETED",
  DROPPED: "DROPPED",
  PENDING: "PENDING",
} as const;

export type EnrollmentStatus =
  (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface Enrollment {
  id: number;
  studentId: number;
  cohortId: number;
  enrollmentDate: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  avatarUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  student?: {
    id: number;
    name: string;
    email: string;
  };
  cohort?: Cohort;
}

export interface CreateEnrollmentRequest {
  studentId: number;
  cohortId: number;
  enrollmentDate: string;
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  avatarUrl?: string;
  description?: string;
}

export interface UpdateEnrollmentRequest {
  studentId?: number;
  cohortId?: number;
  enrollmentDate?: string;
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  avatarUrl?: string;
  description?: string;
}

export interface GetEnrollmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  studentId?: number;
  cohortId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetEnrollmentsResponse {
  enrollments: Enrollment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper functions for enrollment data
export const EnrollmentHelpers = {
  isGetEnrollmentsSuccess: (
    response: unknown
  ): response is { success: true; data: GetEnrollmentsResponse } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: { enrollments?: unknown } }).data !== null &&
      "enrollments" in (response as { data: { enrollments?: unknown } }).data
    );
  },

  getEnrollmentsFromResponse: (response: {
    data: GetEnrollmentsResponse;
  }): Enrollment[] => {
    return response.data.enrollments;
  },

  getPaginationFromResponse: (response: { data: GetEnrollmentsResponse }) => {
    return response.data.pagination;
  },

  isCreateEnrollmentSuccess: (
    response: unknown
  ): response is { success: true; data: Enrollment } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: { id?: unknown } }).data !== null &&
      "id" in (response as { data: { id?: unknown } }).data
    );
  },

  isUpdateEnrollmentSuccess: (
    response: unknown
  ): response is { success: true; data: Enrollment } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: { id?: unknown } }).data !== null &&
      "id" in (response as { data: { id?: unknown } }).data
    );
  },

  isDeleteEnrollmentSuccess: (
    response: unknown
  ): response is { success: true; message: string } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "message" in response &&
      typeof (response as { message: unknown }).message === "string"
    );
  },

  getEnrollmentFromResponse: (response: { data: Enrollment }): Enrollment => {
    return response.data;
  },
};

// Status display names
export const EnrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.ENROLLED]: "Enrolled",
  [EnrollmentStatus.COMPLETED]: "Completed",
  [EnrollmentStatus.DROPPED]: "Dropped",
  [EnrollmentStatus.PENDING]: "Pending",
};

// Payment status display names
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.PAID]: "Paid",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.REFUNDED]: "Refunded",
  [PaymentStatus.CANCELLED]: "Cancelled",
};

// Status colors for UI
export const EnrollmentStatusColors: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.ENROLLED]: "text-blue-600 bg-blue-50",
  [EnrollmentStatus.COMPLETED]: "text-green-600 bg-green-50",
  [EnrollmentStatus.DROPPED]: "text-red-600 bg-red-50",
  [EnrollmentStatus.PENDING]: "text-yellow-600 bg-yellow-50",
};

// Payment status colors for UI
export const PaymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "text-yellow-600 bg-yellow-50",
  [PaymentStatus.PAID]: "text-green-600 bg-green-50",
  [PaymentStatus.FAILED]: "text-red-600 bg-red-50",
  [PaymentStatus.REFUNDED]: "text-blue-600 bg-blue-50",
  [PaymentStatus.CANCELLED]: "text-gray-600 bg-gray-50",
};
