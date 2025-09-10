// Center entity types and interfaces

export const CenterStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export type CenterStatus = (typeof CenterStatus)[keyof typeof CenterStatus];

export interface Center {
  id: number;
  organizationId: number;
  name: string;
  street?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity: number;
  description?: string;
  logoUrl?: string;
  status: CenterStatus;
  organization?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
}

export interface CreateCenterRequest {
  organizationId: number;
  name: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity?: number;
  description?: string;
  logoUrl?: string;
  status?: CenterStatus;
}

export interface UpdateCenterRequest {
  organizationId?: number;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity?: number;
  description?: string;
  logoUrl?: string;
  status?: CenterStatus;
}

export interface GetCentersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CenterStatus;
  organizationId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetCentersResponse {
  centers: Center[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Status display names
export const CenterStatusLabels: Record<CenterStatus, string> = {
  [CenterStatus.ACTIVE]: "Active",
  [CenterStatus.INACTIVE]: "Inactive",
  [CenterStatus.SUSPENDED]: "Suspended",
};

// Status colors for UI
export const CenterStatusColors: Record<CenterStatus, string> = {
  [CenterStatus.ACTIVE]: "text-green-600 bg-green-50",
  [CenterStatus.INACTIVE]: "text-gray-600 bg-gray-50",
  [CenterStatus.SUSPENDED]: "text-red-600 bg-red-50",
};
