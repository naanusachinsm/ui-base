import { z } from "zod";

// Cohort status enum
export const CohortStatus = {
  PLANNING: "PLANNING",
  ENROLLING: "ENROLLING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type CohortStatus = (typeof CohortStatus)[keyof typeof CohortStatus];

// Cohort status labels
export const CohortStatusLabels: Record<CohortStatus, string> = {
  [CohortStatus.PLANNING]: "Planning",
  [CohortStatus.ENROLLING]: "Enrolling",
  [CohortStatus.ACTIVE]: "Active",
  [CohortStatus.COMPLETED]: "Completed",
  [CohortStatus.CANCELLED]: "Cancelled",
};

// Cohort status colors for UI
export const CohortStatusColors: Record<CohortStatus, string> = {
  [CohortStatus.PLANNING]: "bg-blue-100 text-blue-800 border-blue-200",
  [CohortStatus.ENROLLING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [CohortStatus.ACTIVE]: "bg-green-100 text-green-800 border-green-200",
  [CohortStatus.COMPLETED]: "bg-gray-100 text-gray-800 border-gray-200",
  [CohortStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
};

export interface Enrollment {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  studentId: number;
  cohortId: number;
  enrollmentDate: string;
  status: string;
  paymentStatus: string;
  paymentId?: string;
  avatarUrl?: string;
  description?: string;
  student?: {
    name: string;
  };
}

export interface Cohort {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  courseId: number;
  centerId: number;
  instructorEmployeeId: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  mode: string;
  capacity: number;
  avatarUrl?: string;
  description?: string;
  status: CohortStatus;
  course?: {
    name: string;
  };
  center?: {
    name: string;
  };
  instructor?: {
    name: string;
  };
  enrollments?: Enrollment[];
  enrollmentCount?: number;
}

export interface CreateCohortRequest {
  centerId: number;
  courseId: number;
  name: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  maxStudents?: number;
  status?: CohortStatus;
  isPublic?: boolean;
}

export interface UpdateCohortRequest {
  centerId?: number;
  courseId?: number;
  name?: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  maxStudents?: number;
  status?: CohortStatus;
  isPublic?: boolean;
}

export interface GetCohortsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CohortStatus;
  centerId?: number;
  courseId?: number;
  instructorId?: number;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetCohortsResponse {
  cohorts: Cohort[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation schemas
export const cohortFormSchema = z.object({
  centerId: z.number().min(1, "Center is required"),
  courseId: z.number().min(1, "Course is required"),
  name: z
    .string()
    .min(1, "Cohort name is required")
    .max(255, "Cohort name is too long"),
  code: z
    .string()
    .min(1, "Cohort code is required")
    .max(50, "Cohort code is too long"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  enrollmentStartDate: z.string().optional(),
  enrollmentEndDate: z.string().optional(),
  maxStudents: z.number().min(1, "Max students must be at least 1").optional(),
  status: z.nativeEnum(CohortStatus).default(CohortStatus.PLANNING),
  isPublic: z.boolean().default(false),
});

// Helper functions for cohort data
export const CohortHelpers = {
  isGetCohortsSuccess: (
    response: unknown
  ): response is { success: true; data: GetCohortsResponse } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: { cohorts?: unknown } }).data !== null &&
      "cohorts" in (response as { data: { cohorts?: unknown } }).data
    );
  },

  getCohortsFromResponse: (response: {
    data: GetCohortsResponse;
  }): Cohort[] => {
    return response.data.cohorts;
  },

  getPaginationFromResponse: (response: { data: GetCohortsResponse }) => {
    return response.data.pagination;
  },

  isCreateCohortSuccess: (
    response: unknown
  ): response is { success: true; data: Cohort } => {
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

  isUpdateCohortSuccess: (
    response: unknown
  ): response is { success: true; data: Cohort } => {
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

  isDeleteCohortSuccess: (
    response: unknown
  ): response is { success: true; message: string } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "message" in response
    );
  },

  formatCohortName: (cohort: Cohort): string => {
    return cohort.name;
  },

  getStatusColorClass: (status: CohortStatus): string => {
    return (
      CohortStatusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
    );
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  formatDateRange: (startDate: string, endDate: string): string => {
    const start = new Date(startDate).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  },

  getDuration: (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  formatDuration: (startDate: string, endDate: string): string => {
    const days = CohortHelpers.getDuration(startDate, endDate);
    if (days < 7) {
      return `${days} day${days > 1 ? "s" : ""}`;
    }
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return `${weeks} week${weeks > 1 ? "s" : ""}`;
    }
    return `${weeks} week${weeks > 1 ? "s" : ""} ${remainingDays} day${
      remainingDays > 1 ? "s" : ""
    }`;
  },

  isEnrollmentOpen: (cohort: Cohort): boolean => {
    if (cohort.status !== CohortStatus.ENROLLING) return false;
    // Since enrollmentStartDate and enrollmentEndDate are not in the API response,
    // we'll assume enrollment is open when status is ENROLLING
    return true;
  },

  isCohortActive: (cohort: Cohort): boolean => {
    if (cohort.status !== CohortStatus.ACTIVE) return false;

    const now = new Date();
    const start = new Date(cohort.startDate);
    const end = new Date(cohort.endDate);

    return now >= start && now <= end;
  },

  getEnrollmentProgress: (cohort: Cohort): number => {
    if (!cohort.capacity || cohort.capacity === 0) return 0;
    const current = cohort.enrollments?.length || 0;
    return Math.round((current / cohort.capacity) * 100);
  },
};
