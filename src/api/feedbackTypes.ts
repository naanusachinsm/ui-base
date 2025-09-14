// Feedback entity types and interfaces

export const FeedbackStatus = {
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
  CLOSED: "CLOSED",
} as const;

export type FeedbackStatus = (typeof FeedbackStatus)[keyof typeof FeedbackStatus];

export interface Feedback {
  id: number;
  studentId: number;
  courseId?: number;
  cohortId?: number;
  rating: number;
  comment?: string;
  description?: string;
  status: FeedbackStatus;
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
  course?: {
    id: number;
    name: string;
  };
  cohort?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreateFeedbackRequest {
  studentId: number;
  courseId?: number;
  cohortId?: number;
  rating: number;
  comment?: string;
  description?: string;
  status?: FeedbackStatus;
}

export interface UpdateFeedbackRequest {
  studentId?: number;
  courseId?: number;
  cohortId?: number;
  rating?: number;
  comment?: string;
  description?: string;
  status?: FeedbackStatus;
}

export interface FeedbackFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: FeedbackStatus;
  studentId?: number;
  courseId?: number;
  cohortId?: number;
  minRating?: number;
  maxRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedFeedbacks {
  data: Feedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper functions for feedback data
export const FeedbackHelpers = {
  isGetFeedbacksSuccess: (
    response: unknown
  ): response is { success: true; data: PaginatedFeedbacks } => {
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

  getFeedbacksFromResponse: (response: {
    data: PaginatedFeedbacks;
  }): Feedback[] => {
    return response.data.data;
  },

  getPaginationFromResponse: (response: { data: PaginatedFeedbacks }) => {
    return {
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
    };
  },

  isCreateFeedbackSuccess: (
    response: unknown
  ): response is { success: true; data: Feedback } => {
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

  isUpdateFeedbackSuccess: (
    response: unknown
  ): response is { success: true; data: Feedback } => {
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

  isDeleteFeedbackSuccess: (
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

  getFeedbackFromResponse: (response: { data: Feedback }): Feedback => {
    return response.data;
  },
};

// Feedback status display names
export const FeedbackStatusLabels: Record<FeedbackStatus, string> = {
  [FeedbackStatus.SUBMITTED]: "SUBMITTED",
  [FeedbackStatus.REVIEWED]: "REVIEWED",
  [FeedbackStatus.CLOSED]: "CLOSED",
};

// Feedback status colors for UI
export const FeedbackStatusColors: Record<FeedbackStatus, string> = {
  [FeedbackStatus.SUBMITTED]: "text-white bg-emerald-600",
  [FeedbackStatus.REVIEWED]: "text-black bg-amber-200",
  [FeedbackStatus.CLOSED]: "text-white bg-slate-600",
};

