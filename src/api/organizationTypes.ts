// Organization entity types and interfaces

export const OrganizationType = {
  UNIVERSITY: "UNIVERSITY",
  CORPORATE: "CORPORATE",
  TRAINING: "TRAINING",
  NON_PROFIT: "NON_PROFIT",
  OTHER: "OTHER",
} as const;

export type OrganizationType =
  (typeof OrganizationType)[keyof typeof OrganizationType];

export const OrganizationStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export type OrganizationStatus =
  (typeof OrganizationStatus)[keyof typeof OrganizationStatus];

export const Currency = {
  USD: "USD",
  EUR: "EUR",
  INR: "INR",
  GBP: "GBP",
  AUD: "AUD",
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];

export interface BillingContact {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrganizationSettings {
  allowStudentRegistration?: boolean;
  requireEmailVerification?: boolean;
  maxStudentsPerCenter?: number;
  defaultLanguage?: string;
  notificationSettings?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
  };
  academicSettings?: {
    academicYearStart?: string;
    academicYearEnd?: string;
    gradingSystem?: string;
  };
  [key: string]: unknown;
}

export interface Organization {
  id: number;
  name: string;
  code: string;
  type: OrganizationType;
  address?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  logoUrl?: string;
  establishedDate?: string;
  status: OrganizationStatus;
  currency: Currency;
  timezone: string;
  adminEmployeeId?: number;
  billingContact?: BillingContact;
  settings?: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  // Relations
  adminEmployee?: {
    id: number;
    name: string;
    email: string;
  };
  centers?: Array<{
    id: number;
    name: string;
    status: string;
  }>;
}

export interface CreateOrganizationRequest {
  name: string;
  code: string;
  type: OrganizationType;
  address?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  logoUrl?: string;
  establishedDate?: string;
  status?: OrganizationStatus;
  currency?: Currency;
  timezone?: string;
  adminEmployeeId?: number;
  billingContact?: BillingContact;
  settings?: OrganizationSettings;
}

export interface UpdateOrganizationRequest {
  name?: string;
  code?: string;
  type?: OrganizationType;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logoUrl?: string;
  establishedDate?: string;
  status?: OrganizationStatus;
  currency?: Currency;
  timezone?: string;
  adminEmployeeId?: number;
  billingContact?: BillingContact;
  settings?: OrganizationSettings;
}

export interface GetOrganizationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrganizationStatus;
  type?: OrganizationType;
  currency?: Currency;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetOrganizationsResponse {
  organizations: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Display labels for UI
export const OrganizationTypeLabels: Record<OrganizationType, string> = {
  [OrganizationType.UNIVERSITY]: "University",
  [OrganizationType.CORPORATE]: "Corporate",
  [OrganizationType.TRAINING]: "Training Institute",
  [OrganizationType.NON_PROFIT]: "Non-Profit",
  [OrganizationType.OTHER]: "Other",
};

export const OrganizationStatusLabels: Record<OrganizationStatus, string> = {
  [OrganizationStatus.ACTIVE]: "Active",
  [OrganizationStatus.INACTIVE]: "Inactive",
  [OrganizationStatus.SUSPENDED]: "Suspended",
};

export const CurrencyLabels: Record<Currency, string> = {
  [Currency.USD]: "US Dollar ($)",
  [Currency.EUR]: "Euro (€)",
  [Currency.INR]: "Indian Rupee (₹)",
  [Currency.GBP]: "British Pound (£)",
  [Currency.AUD]: "Australian Dollar (A$)",
};

// Status colors for UI
export const OrganizationStatusColors: Record<OrganizationStatus, string> = {
  [OrganizationStatus.ACTIVE]: "text-green-600 bg-green-50",
  [OrganizationStatus.INACTIVE]: "text-gray-600 bg-gray-50",
  [OrganizationStatus.SUSPENDED]: "text-red-600 bg-red-50",
};

export const OrganizationTypeColors: Record<OrganizationType, string> = {
  [OrganizationType.UNIVERSITY]: "text-blue-600 bg-blue-50",
  [OrganizationType.CORPORATE]: "text-purple-600 bg-purple-50",
  [OrganizationType.TRAINING]: "text-orange-600 bg-orange-50",
  [OrganizationType.NON_PROFIT]: "text-green-600 bg-green-50",
  [OrganizationType.OTHER]: "text-gray-600 bg-gray-50",
};

// Common timezones
export const CommonTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Australia/Melbourne",
] as const;

export type CommonTimezone = (typeof CommonTimezones)[number];
