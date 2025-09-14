// Payment entity types and interfaces

export const PaymentMethod = {
  CREDIT_CARD: "CREDIT CARD",
  DEBIT_CARD: "DEBIT CARD",
  PAYPAL: "PAYPAL",
  UPI: "UPI",
  NET_BANKING: "NET BANKING",
  DIRECT_BILL: "DIRECT BILL",
  OTHER: "OTHER",
} as const;

export const PaymentStatus = {
  COMPLETED: "COMPLETED",
  PENDING: "PENDING",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface Payment {
  id: number;
  studentId: number;
  enrollmentId: number;
  courseId: number;
  cohortId: number;
  centerId: number;
  processedByEmployeeId: number;
  amount: number;
  balance: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate: string;
  status: PaymentStatus;
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
  enrollment?: {
    id: number;
    enrollmentDate: string;
    status: string;
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
  center?: {
    id: number;
    name: string;
  };
  processedByEmployee?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreatePaymentRequest {
  studentId: number;
  enrollmentId: number;
  courseId: number;
  cohortId: number;
  centerId: number;
  processedByEmployeeId: number;
  amount: number;
  balance: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate: string;
  status?: PaymentStatus;
  description?: string;
}

export interface UpdatePaymentRequest {
  studentId?: number;
  enrollmentId?: number;
  courseId?: number;
  cohortId?: number;
  centerId?: number;
  processedByEmployeeId?: number;
  amount?: number;
  balance?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentDate?: string;
  status?: PaymentStatus;
  description?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  studentId?: number;
  enrollmentId?: number;
  courseId?: number;
  cohortId?: number;
  centerId?: number;
  processedByEmployeeId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedPayments {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper functions for payment data
export const PaymentHelpers = {
  isGetPaymentsSuccess: (
    response: unknown
  ): response is { success: true; data: PaginatedPayments } => {
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

  getPaymentsFromResponse: (response: {
    data: PaginatedPayments;
  }): Payment[] => {
    return response.data.data;
  },

  getPaginationFromResponse: (response: { data: PaginatedPayments }) => {
    return {
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
    };
  },

  isCreatePaymentSuccess: (
    response: unknown
  ): response is { success: true; data: Payment } => {
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

  isUpdatePaymentSuccess: (
    response: unknown
  ): response is { success: true; data: Payment } => {
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

  isDeletePaymentSuccess: (
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

  getPaymentFromResponse: (response: { data: Payment }): Payment => {
    return response.data;
  },
};

// Payment method display names
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CREDIT_CARD]: "CREDIT CARD",
  [PaymentMethod.DEBIT_CARD]: "DEBIT CARD",
  [PaymentMethod.PAYPAL]: "PAYPAL",
  [PaymentMethod.UPI]: "UPI",
  [PaymentMethod.NET_BANKING]: "NET BANKING",
  [PaymentMethod.DIRECT_BILL]: "DIRECT BILL",
  [PaymentMethod.OTHER]: "OTHER",
};

// Payment status display names
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.COMPLETED]: "Completed",
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.REFUNDED]: "Refunded",
};

// Payment method colors for UI
export const PaymentMethodColors: Record<PaymentMethod, string> = {
  [PaymentMethod.CREDIT_CARD]: "text-black bg-white border border-gray-300",
  [PaymentMethod.DEBIT_CARD]: "text-black bg-white border border-gray-300",
  [PaymentMethod.PAYPAL]: "text-black bg-white border border-gray-300",
  [PaymentMethod.UPI]: "text-black bg-white border border-gray-300",
  [PaymentMethod.NET_BANKING]: "text-black bg-white border border-gray-300",
  [PaymentMethod.DIRECT_BILL]: "text-black bg-white border border-gray-300",
  [PaymentMethod.OTHER]: "text-black bg-white border border-gray-300",
};

// Payment status colors for UI
export const PaymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.COMPLETED]: "text-white bg-emerald-600",
  [PaymentStatus.PENDING]: "text-black bg-amber-200",
  [PaymentStatus.FAILED]: "text-white bg-red-700",
  [PaymentStatus.REFUNDED]: "text-white bg-slate-600",
};
