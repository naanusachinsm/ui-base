import { z } from "zod";

// Class mode enum
export const ClassMode = {
  ONLINE: "ONLINE",
  IN_PERSON: "IN PERSON",
  HYBRID: "HYBRID",
} as const;

export type ClassMode = (typeof ClassMode)[keyof typeof ClassMode];

// Class mode labels
export const ClassModeLabels: Record<ClassMode, string> = {
  [ClassMode.ONLINE]: "Online",
  [ClassMode.IN_PERSON]: "In Person",
  [ClassMode.HYBRID]: "Hybrid",
};

// Class mode colors for UI
export const ClassModeColors: Record<ClassMode, string> = {
  [ClassMode.ONLINE]: "bg-blue-100 text-blue-800 border-blue-200",
  [ClassMode.IN_PERSON]: "bg-green-100 text-green-800 border-green-200",
  [ClassMode.HYBRID]: "bg-purple-100 text-purple-800 border-purple-200",
};

// Class status enum
export const ClassStatus = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

// Class status labels
export const ClassStatusLabels: Record<ClassStatus, string> = {
  [ClassStatus.SCHEDULED]: "Scheduled",
  [ClassStatus.COMPLETED]: "Completed",
  [ClassStatus.CANCELLED]: "Cancelled",
};

// Class status colors for UI
export const ClassStatusColors: Record<ClassStatus, string> = {
  [ClassStatus.SCHEDULED]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [ClassStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
  [ClassStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
};

export interface Class {
  id: number;
  cohortId: number;
  centerId?: number;
  instructorEmployeeId?: number;
  courseModuleId?: number;
  courseChapterId?: number;
  name: string;
  startTime: string;
  endTime?: string;
  mode: ClassMode;
  meetingUrl?: string;
  resourceUrl?: string;
  videoUrl?: string;
  avatarUrl?: string;
  description?: string;
  status: ClassStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  cohort?: {
    id: number;
    name: string;
  };
  center?: {
    id: number;
    name: string;
  };
  instructor?: {
    id: number;
    name: string;
    email: string;
  };
  courseModule?: {
    id: number;
    name: string;
  };
  courseChapter?: {
    id: number;
    name: string;
  };
}

export interface CreateClassRequest {
  cohortId: number;
  centerId?: number;
  instructorEmployeeId?: number;
  courseModuleId?: number;
  courseChapterId?: number;
  name: string;
  startTime: string;
  endTime?: string;
  mode?: ClassMode;
  meetingUrl?: string;
  resourceUrl?: string;
  videoUrl?: string;
  avatarUrl?: string;
  description?: string;
  status?: ClassStatus;
}

export interface UpdateClassRequest {
  cohortId?: number;
  centerId?: number;
  instructorEmployeeId?: number;
  courseModuleId?: number;
  courseChapterId?: number;
  name?: string;
  startTime?: string;
  endTime?: string;
  mode?: ClassMode;
  meetingUrl?: string;
  resourceUrl?: string;
  videoUrl?: string;
  avatarUrl?: string;
  description?: string;
  status?: ClassStatus;
}

export interface GetClassesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClassStatus;
  mode?: ClassMode;
  cohortId?: number;
  centerId?: number;
  instructorEmployeeId?: number;
  courseModuleId?: number;
  courseChapterId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetClassesResponse {
  classes: Class[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation schemas
export const classFormSchema = z.object({
  cohortId: z.number().min(1, "Cohort is required"),
  centerId: z.number().min(1, "Center is required").optional(),
  instructorEmployeeId: z.number().min(1, "Instructor is required").optional(),
  courseModuleId: z.number().min(1, "Course Module is required").optional(),
  courseChapterId: z.number().min(1, "Course Chapter is required").optional(),
  name: z
    .string()
    .min(1, "Class name is required")
    .max(255, "Class name is too long"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  mode: z.nativeEnum(ClassMode),
  meetingUrl: z
    .string()
    .url("Invalid URL")
    .max(255, "URL is too long")
    .optional()
    .or(z.literal("")),
  resourceUrl: z
    .string()
    .url("Invalid URL")
    .max(255, "URL is too long")
    .optional()
    .or(z.literal("")),
  videoUrl: z
    .string()
    .url("Invalid URL")
    .max(255, "URL is too long")
    .optional()
    .or(z.literal("")),
  avatarUrl: z
    .string()
    .url("Invalid URL")
    .max(255, "URL is too long")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  status: z.nativeEnum(ClassStatus),
});

// Helper functions for class data
export const ClassHelpers = {
  isGetClassesSuccess: (
    response: unknown
  ): response is { success: true; data: GetClassesResponse } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: { classes?: unknown } }).data !== null &&
      "classes" in (response as { data: { classes?: unknown } }).data
    );
  },

  getClassesFromResponse: (response: { data: GetClassesResponse }): Class[] => {
    return response.data.classes;
  },

  getPaginationFromResponse: (response: { data: GetClassesResponse }) => {
    return response.data.pagination;
  },

  isCreateClassSuccess: (
    response: unknown
  ): response is { success: true; data: Class } => {
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

  isUpdateClassSuccess: (
    response: unknown
  ): response is { success: true; data: Class } => {
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

  isDeleteClassSuccess: (
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
};
