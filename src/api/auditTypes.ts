// Audit log entity types and interfaces

export const AuditAction = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const AuditModule = {
  AUTH: "AUTH",
  ORGANIZATION: "ORGANIZATION",
  CENTER: "CENTER",
  EMPLOYEE: "EMPLOYEE",
  STUDENT: "STUDENT",
  COURSE: "COURSE",
  COHORT: "COHORT",
  ENROLLMENT: "ENROLLMENT",
  ENQUIRY: "ENQUIRY",
  PAYMENT: "PAYMENT",
  FEEDBACK: "FEEDBACK",
  AUDIT: "AUDIT",
} as const;

export type AuditModule = (typeof AuditModule)[keyof typeof AuditModule];

export const AuditStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  PENDING: "PENDING",
} as const;

export type AuditStatus = (typeof AuditStatus)[keyof typeof AuditStatus];

export interface AuditLog {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  deletedBy?: number | null;
  centerId: number;
  performedByEmployeeId: number;
  module: string;
  action: string;
  recordId: number;
  details?: Record<string, any>;
  description: string;
  eventTimestamp: string;
  center: {
    id: number;
    name: string;
    street: string;
    city: string;
    state: string;
    contactPhone: string;
    contactEmail: string;
  };
  performedByEmployee: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  action?: AuditAction;
  module?: AuditModule;
  status?: AuditStatus;
  userId?: number;
  entityId?: number;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper functions for audit log data
export const AuditLogHelpers = {
  isGetAuditLogsSuccess: (
    response: unknown
  ): response is { success: true; data: PaginatedAuditLogs } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: { data?: unknown } }).data !== null &&
      "data" in (response as { data: { data?: unknown } }).data
    );
  },

  getAuditLogsFromResponse: (response: {
    data: PaginatedAuditLogs;
  }): AuditLog[] => {
    return response.data.data;
  },

  getPaginationFromResponse: (response: { data: PaginatedAuditLogs }) => {
    return {
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
    };
  },
};

// Audit action display names
export const AuditActionLabels: Record<AuditAction, string> = {
  [AuditAction.CREATE]: "CREATE",
  [AuditAction.READ]: "READ",
  [AuditAction.UPDATE]: "UPDATE",
  [AuditAction.DELETE]: "DELETE",
  [AuditAction.LOGIN]: "LOGIN",
  [AuditAction.LOGOUT]: "LOGOUT",
  [AuditAction.EXPORT]: "EXPORT",
  [AuditAction.IMPORT]: "IMPORT",
};

// Audit module display names
export const AuditModuleLabels: Record<AuditModule, string> = {
  [AuditModule.AUTH]: "Authentication",
  [AuditModule.ORGANIZATION]: "Organization",
  [AuditModule.CENTER]: "Center",
  [AuditModule.EMPLOYEE]: "Employee",
  [AuditModule.STUDENT]: "Student",
  [AuditModule.COURSE]: "Course",
  [AuditModule.COHORT]: "Cohort",
  [AuditModule.ENROLLMENT]: "Enrollment",
  [AuditModule.ENQUIRY]: "Enquiry",
  [AuditModule.PAYMENT]: "Payment",
  [AuditModule.FEEDBACK]: "Feedback",
  [AuditModule.AUDIT]: "Audit",
};

// Audit status display names
export const AuditStatusLabels: Record<AuditStatus, string> = {
  [AuditStatus.SUCCESS]: "SUCCESS",
  [AuditStatus.FAILED]: "FAILED",
  [AuditStatus.PENDING]: "PENDING",
};

// Audit status colors for UI
export const AuditStatusColors: Record<AuditStatus, string> = {
  [AuditStatus.SUCCESS]: "text-white bg-green-600",
  [AuditStatus.FAILED]: "text-white bg-red-600",
  [AuditStatus.PENDING]: "text-black bg-yellow-200",
};

// Audit action colors for UI
export const AuditActionColors: Record<AuditAction, string> = {
  [AuditAction.CREATE]: "text-white bg-green-600",
  [AuditAction.READ]: "text-white bg-blue-600",
  [AuditAction.UPDATE]: "text-white bg-yellow-600",
  [AuditAction.DELETE]: "text-white bg-red-600",
  [AuditAction.LOGIN]: "text-white bg-purple-600",
  [AuditAction.LOGOUT]: "text-white bg-gray-600",
  [AuditAction.EXPORT]: "text-white bg-indigo-600",
  [AuditAction.IMPORT]: "text-white bg-pink-600",
};
