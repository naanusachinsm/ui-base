// Enquiry types and interfaces

export const EnquirySource = {
  WEBSITE: "WEBSITE",
  REFERRAL: "REFERRAL",
  ADVERTISEMENT: "ADVERTISEMENT",
  WALK_IN: "WALK IN",
  SOCIAL_MEDIA: "SOCIAL MEDIA",
  OTHER: "OTHER",
} as const;

export const EnquiryStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  INTERESTED: "INTERESTED",
  CONVERTED: "CONVERTED",
  LOST: "LOST",
} as const;

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export const ModeOfLearning = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
} as const;

export type EnquirySource = (typeof EnquirySource)[keyof typeof EnquirySource];
export type EnquiryStatus = (typeof EnquiryStatus)[keyof typeof EnquiryStatus];
export type Gender = (typeof Gender)[keyof typeof Gender];
export type ModeOfLearning =
  (typeof ModeOfLearning)[keyof typeof ModeOfLearning];

export const EnquirySourceLabels: Record<EnquirySource, string> = {
  [EnquirySource.WEBSITE]: "Website",
  [EnquirySource.REFERRAL]: "Referral",
  [EnquirySource.ADVERTISEMENT]: "Advertisement",
  [EnquirySource.WALK_IN]: "Walk In",
  [EnquirySource.SOCIAL_MEDIA]: "Social Media",
  [EnquirySource.OTHER]: "Other",
};

export const EnquiryStatusLabels: Record<EnquiryStatus, string> = {
  [EnquiryStatus.NEW]: "New",
  [EnquiryStatus.CONTACTED]: "Contacted",
  [EnquiryStatus.INTERESTED]: "Interested",
  [EnquiryStatus.CONVERTED]: "Converted",
  [EnquiryStatus.LOST]: "Lost",
};

export const GenderLabels: Record<Gender, string> = {
  [Gender.MALE]: "Male",
  [Gender.FEMALE]: "Female",
  [Gender.OTHER]: "Other",
};

export const ModeOfLearningLabels: Record<ModeOfLearning, string> = {
  [ModeOfLearning.ONLINE]: "Online",
  [ModeOfLearning.OFFLINE]: "Offline",
};

export const EnquirySourceColors: Record<EnquirySource, string> = {
  [EnquirySource.WEBSITE]: "bg-blue-100 text-blue-800",
  [EnquirySource.REFERRAL]: "bg-green-100 text-green-800",
  [EnquirySource.ADVERTISEMENT]: "bg-yellow-100 text-yellow-800",
  [EnquirySource.WALK_IN]: "bg-purple-100 text-purple-800",
  [EnquirySource.SOCIAL_MEDIA]: "bg-pink-100 text-pink-800",
  [EnquirySource.OTHER]: "bg-gray-100 text-gray-800",
};

export const EnquiryStatusColors: Record<EnquiryStatus, string> = {
  [EnquiryStatus.NEW]: "bg-blue-100 text-blue-800",
  [EnquiryStatus.CONTACTED]: "bg-yellow-100 text-yellow-800",
  [EnquiryStatus.INTERESTED]: "bg-green-100 text-green-800",
  [EnquiryStatus.CONVERTED]: "bg-emerald-100 text-emerald-800",
  [EnquiryStatus.LOST]: "bg-red-100 text-red-800",
};

// Document structure for file uploads
export interface DocumentDto {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
  description?: string;
  category?: string;
}

// Related entities
export interface Center {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  name: string;
}

// Main Enquiry interface
export interface Enquiry {
  id: number;
  name: string;
  phone?: string;
  enquiryDate: string;
  description?: string;
  centerId?: number;
  courseId?: number;
  assignedEmployeeId?: number;
  source: EnquirySource;
  status: EnquiryStatus;

  // Address Information
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Personal Information
  dateOfBirth?: string;
  gender?: Gender;
  whatsappNumber?: string;
  nationality?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactNumber?: string;

  // Educational Background
  education?: string;
  collegeUniversity?: string;
  yearOfCompletion?: number;
  specializedSubjects?: string;

  // Professional Details
  profession?: string;
  companyOrganization?: string;
  designation?: string;
  yearsOfExperience?: number;
  industry?: string;
  currentSkillsTools?: string;
  currentSalaryRange?: string;
  careerGoalAfterCourse?: string;

  // Course Preferences
  programApplyingFor?: string;
  preferredBatchTiming?: string;
  modeOfLearning?: ModeOfLearning;

  // Technical Requirements
  hasLaptopPc?: boolean;
  hasInternetConnectivity?: boolean;

  // Additional Information
  whyLearnDigitalMarketing?: string;

  // Payment Information
  paymentPreference?: string;
  preferredPaymentMethod?: string;

  // Document Management
  hasIdProof?: boolean;
  hasPassportPhoto?: boolean;
  hasEducationalCertificate?: boolean;
  docsUrl?: DocumentDto[];

  // Declaration & Signature
  preferredJobRole?: string;
  signature?: string;
  declarationDate?: string;

  // Timestamps and Audit
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;

  // Relations
  center?: Center;
  course?: Course;
  assignedEmployee?: Employee;
}

// API Request/Response types
export interface CreateEnquiryRequest {
  name: string;
  phone?: string;
  enquiryDate: string;
  description?: string;
  centerId?: number;
  courseId?: number;
  assignedEmployeeId?: number;
  source: EnquirySource;
  status: EnquiryStatus;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: Gender;
  whatsappNumber?: string;
  nationality?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactNumber?: string;
  education?: string;
  collegeUniversity?: string;
  yearOfCompletion?: number;
  specializedSubjects?: string;
  profession?: string;
  companyOrganization?: string;
  designation?: string;
  yearsOfExperience?: number;
  industry?: string;
  currentSkillsTools?: string;
  currentSalaryRange?: string;
  careerGoalAfterCourse?: string;
  programApplyingFor?: string;
  preferredBatchTiming?: string;
  modeOfLearning?: ModeOfLearning;
  hasLaptopPc?: boolean;
  hasInternetConnectivity?: boolean;
  whyLearnDigitalMarketing?: string;
  paymentPreference?: string;
  preferredPaymentMethod?: string;
  hasIdProof?: boolean;
  hasPassportPhoto?: boolean;
  hasEducationalCertificate?: boolean;
  preferredJobRole?: string;
  signature?: string;
  declarationDate?: string;
}

export type UpdateEnquiryRequest = Partial<CreateEnquiryRequest>;

export interface EnquiryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: EnquiryStatus;
  source?: EnquirySource;
  centerId?: number;
  courseId?: number;
  assignedEmployeeId?: number;
}

export interface PaginatedEnquiries {
  data: Enquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
