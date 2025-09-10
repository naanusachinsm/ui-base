import { z } from "zod";

// Student status enum
export const StudentStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

// Student status labels
export const StudentStatusLabels: Record<StudentStatus, string> = {
  [StudentStatus.ACTIVE]: "Active",
  [StudentStatus.INACTIVE]: "Inactive",
  [StudentStatus.SUSPENDED]: "Suspended",
};

// Student status colors for UI
export const StudentStatusColors: Record<StudentStatus, string> = {
  [StudentStatus.ACTIVE]: "bg-green-100 text-green-800 border-green-200",
  [StudentStatus.INACTIVE]: "bg-gray-100 text-gray-800 border-gray-200",
  [StudentStatus.SUSPENDED]: "bg-red-100 text-red-800 border-red-200",
};

export interface Student {
  id: number;
  centerId: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  education?: string;
  profession?: string;
  interests?: string;
  avatarUrl?: string;
  docsUrl?: string[];
  description?: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  center?: {
    id: number;
    name: string;
  };
}

export interface CreateStudentRequest {
  centerId: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  education?: string;
  profession?: string;
  interests?: string;
  avatarUrl?: string;
  docsUrl?: string[];
  description?: string;
  status?: StudentStatus;
}

export interface UpdateStudentRequest {
  centerId?: number;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  education?: string;
  profession?: string;
  interests?: string;
  avatarUrl?: string;
  docsUrl?: string[];
  description?: string;
  status?: StudentStatus;
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  centerId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetStudentsResponse {
  students: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation schemas
export const studentFormSchema = z.object({
  centerId: z.number().min(1, "Center is required"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z.string().email("Invalid email address").max(255, "Email is too long"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  phone: z.string().max(20, "Phone number is too long").optional(),
  street: z.string().max(255, "Street address is too long").optional(),
  city: z.string().max(100, "City name is too long").optional(),
  state: z.string().max(100, "State name is too long").optional(),
  postalCode: z.string().max(20, "Postal code is too long").optional(),
  country: z.string().max(100, "Country name is too long").optional(),
  education: z.string().optional(),
  profession: z.string().max(100, "Profession is too long").optional(),
  interests: z.string().optional(),
  avatarUrl: z.string().url("Invalid URL").max(255, "URL is too long").optional(),
  docsUrl: z.array(z.string().url("Invalid URL")).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(StudentStatus).default(StudentStatus.ACTIVE),
});

// Helper functions for student data
export const StudentHelpers = {
  isGetStudentsSuccess: (
    response: unknown
  ): response is { success: true; data: GetStudentsResponse } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: { students?: unknown } }).data !== null &&
      "students" in (response as { data: { students?: unknown } }).data
    );
  },

  getStudentsFromResponse: (response: {
    data: GetStudentsResponse;
  }): Student[] => {
    return response.data.students;
  },

  getPaginationFromResponse: (response: { data: GetStudentsResponse }) => {
    return response.data.pagination;
  },

  isCreateStudentSuccess: (
    response: unknown
  ): response is { success: true; data: Student } => {
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

  isUpdateStudentSuccess: (
    response: unknown
  ): response is { success: true; data: Student } => {
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

  isDeleteStudentSuccess: (
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

