import { z } from "zod";

// Course status enum
export const CourseStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DRAFT: "DRAFT",
  ARCHIVED: "ARCHIVED",
} as const;

export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

// Course difficulty enum
export const CourseDifficulty = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} as const;

export type CourseDifficulty =
  (typeof CourseDifficulty)[keyof typeof CourseDifficulty];

// Course status labels
export const CourseStatusLabels: Record<CourseStatus, string> = {
  [CourseStatus.ACTIVE]: "Active",
  [CourseStatus.INACTIVE]: "Inactive",
  [CourseStatus.DRAFT]: "Draft",
  [CourseStatus.ARCHIVED]: "Archived",
};

// Course difficulty labels
export const CourseDifficultyLabels: Record<CourseDifficulty, string> = {
  [CourseDifficulty.BEGINNER]: "Beginner",
  [CourseDifficulty.INTERMEDIATE]: "Intermediate",
  [CourseDifficulty.ADVANCED]: "Advanced",
  [CourseDifficulty.EXPERT]: "Expert",
};

// Course status colors for UI
export const CourseStatusColors: Record<CourseStatus, string> = {
  [CourseStatus.ACTIVE]: "bg-green-100 text-green-800 border-green-200",
  [CourseStatus.INACTIVE]: "bg-gray-100 text-gray-800 border-gray-200",
  [CourseStatus.DRAFT]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [CourseStatus.ARCHIVED]: "bg-red-100 text-red-800 border-red-200",
};

// Course difficulty colors for UI
export const CourseDifficultyColors: Record<CourseDifficulty, string> = {
  [CourseDifficulty.BEGINNER]: "bg-blue-100 text-blue-800 border-blue-200",
  [CourseDifficulty.INTERMEDIATE]:
    "bg-orange-100 text-orange-800 border-orange-200",
  [CourseDifficulty.ADVANCED]:
    "bg-purple-100 text-purple-800 border-purple-200",
  [CourseDifficulty.EXPERT]: "bg-red-100 text-red-800 border-red-200",
};

export interface Course {
  id: number;
  centerId: number;
  name: string;
  code: string;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  duration: number; // in hours
  difficulty: CourseDifficulty;
  status: CourseStatus;
  price: number;
  currency: string;
  maxStudents?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  syllabus?: string;
  instructorId?: number;
  categoryId?: number;
  tags?: string[];
  isPublic: boolean;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  courseStartDate?: string;
  courseEndDate?: string;
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
  instructor?: {
    id: number;
    name: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
  };
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface CourseModule {
  id: number;
  courseId: number;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseChapter {
  id: number;
  courseModuleId: number;
  name: string;
  description?: string;
  content?: string;
  order: number;
  duration?: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  centerId: number;
  name: string;
  code: string;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  duration: number;
  difficulty: CourseDifficulty;
  status?: CourseStatus;
  price: number;
  currency?: string;
  maxStudents?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  syllabus?: string;
  instructorId?: number;
  categoryId?: number;
  tags?: string[];
  isPublic?: boolean;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  courseStartDate?: string;
  courseEndDate?: string;
}

export interface UpdateCourseRequest {
  centerId?: number;
  name?: string;
  code?: string;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  duration?: number;
  difficulty?: CourseDifficulty;
  status?: CourseStatus;
  price?: number;
  currency?: string;
  maxStudents?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  syllabus?: string;
  instructorId?: number;
  categoryId?: number;
  tags?: string[];
  isPublic?: boolean;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  courseStartDate?: string;
  courseEndDate?: string;
}

export interface GetCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CourseStatus;
  difficulty?: CourseDifficulty;
  centerId?: number;
  instructorId?: number;
  categoryId?: number;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetCoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation schemas
export const courseFormSchema = z.object({
  centerId: z.number().min(1, "Center is required"),
  name: z
    .string()
    .min(1, "Course name is required")
    .max(255, "Course name is too long"),
  code: z
    .string()
    .min(1, "Course code is required")
    .max(50, "Course code is too long"),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .max(500, "Short description is too long")
    .optional(),
  thumbnailUrl: z
    .string()
    .url("Invalid URL")
    .max(255, "URL is too long")
    .optional(),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  difficulty: z.nativeEnum(CourseDifficulty),
  status: z.nativeEnum(CourseStatus).default(CourseStatus.DRAFT),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.string().default("INR"),
  maxStudents: z.number().min(1, "Max students must be at least 1").optional(),
  prerequisites: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  syllabus: z.string().optional(),
  instructorId: z.number().optional(),
  categoryId: z.number().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
  enrollmentStartDate: z.string().optional(),
  enrollmentEndDate: z.string().optional(),
  courseStartDate: z.string().optional(),
  courseEndDate: z.string().optional(),
});

// Helper functions for course data
export const CourseHelpers = {
  isGetCoursesSuccess: (
    response: unknown
  ): response is { success: true; data: GetCoursesResponse } => {
    return (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: unknown }).success === true &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: { courses?: unknown } }).data !== null &&
      "courses" in (response as { data: { courses?: unknown } }).data
    );
  },

  getCoursesFromResponse: (response: {
    data: GetCoursesResponse;
  }): Course[] => {
    return response.data.courses;
  },

  getPaginationFromResponse: (response: { data: GetCoursesResponse }) => {
    return response.data.pagination;
  },

  isCreateCourseSuccess: (
    response: unknown
  ): response is { success: true; data: Course } => {
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

  isUpdateCourseSuccess: (
    response: unknown
  ): response is { success: true; data: Course } => {
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

  isDeleteCourseSuccess: (
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

  formatCourseName: (course: Course): string => {
    return course.name;
  },

  getStatusColorClass: (status: CourseStatus): string => {
    return (
      CourseStatusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
    );
  },

  getDifficultyColorClass: (difficulty: CourseDifficulty): string => {
    return (
      CourseDifficultyColors[difficulty] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  },

  formatPrice: (price: number, currency: string = "INR"): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(price);
  },

  formatDuration: (duration: number): string => {
    if (duration < 60) {
      return `${duration} hours`;
    }
    const days = Math.floor(duration / 8); // Assuming 8 hours per day
    const remainingHours = duration % 8;
    if (remainingHours === 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    }
    return `${days} day${days > 1 ? "s" : ""} ${remainingHours} hour${
      remainingHours > 1 ? "s" : ""
    }`;
  },
};
