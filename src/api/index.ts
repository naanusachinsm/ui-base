// API Module Exports

// Main API Service
export { ApiService, apiService } from "./apiService";

// Auth Service
export { AuthService, authService, AuthHelpers } from "./authService";
export type { LoginRequest, LoginResponse, User } from "./authService";

// Organization Service
export {
  organizationService,
  OrganizationHelpers,
} from "./organizationService";
export type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  GetOrganizationsParams,
  GetOrganizationsResponse,
  OrganizationType,
  OrganizationStatus,
  Currency,
  BillingContact,
  OrganizationSettings,
} from "./organizationTypes";
export {
  OrganizationTypeLabels,
  OrganizationStatusLabels,
  CurrencyLabels,
  OrganizationStatusColors,
  OrganizationTypeColors,
  CommonTimezones,
} from "./organizationTypes";

// Employee Service
export { employeeService } from "./employeeService";
export type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  GetEmployeesParams,
  GetEmployeesResponse,
  EmployeeRole,
  EmployeeStatus,
} from "./employeeTypes";
export {
  EmployeeRoleLabels,
  EmployeeStatusLabels,
  EmployeeStatusColors,
  EmployeeHelpers,
} from "./employeeTypes";

// Center Service
export { centerService } from "./centerService";
export type {
  Center,
  CreateCenterRequest,
  UpdateCenterRequest,
  GetCentersParams,
  GetCentersResponse,
  CenterStatus,
} from "./centerTypes";
export { CenterStatusLabels, CenterStatusColors } from "./centerTypes";

// Course Service
export { courseService, CourseHelpers } from "./courseService";
export type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  GetCoursesParams,
  GetCoursesResponse,
  CourseStatus,
  CourseDifficulty,
} from "./courseTypes";
export {
  CourseStatusLabels,
  CourseDifficultyLabels,
  CourseStatusColors,
  CourseDifficultyColors,
} from "./courseTypes";

// Role Service (RBAC)
export { roleService } from "./roleService";
export type {
  Role,
  RoleAction,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  GetRolesParams,
  ModuleActionsResponse,
} from "./roleTypes";

// Enrollment Service
export { enrollmentService } from "./enrollmentService";
export type {
  Enrollment,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
  GetEnrollmentsParams,
  GetEnrollmentsResponse,
  EnrollmentStatus,
} from "./enrollmentTypes";
export {
  EnrollmentStatusLabels,
  EnrollmentStatusColors,
  EnrollmentHelpers,
} from "./enrollmentTypes";

// Enquiry Service
export { enquiryService } from "./enquiryService";
export type {
  Enquiry,
  CreateEnquiryRequest,
  UpdateEnquiryRequest,
  EnquiryFilters,
  PaginatedEnquiries,
  DocumentDto,
} from "./enquiryTypes";
export {
  EnquirySource,
  EnquiryStatus,
  Gender,
  ModeOfLearning,
  EnquirySourceLabels,
  EnquiryStatusLabels,
  GenderLabels,
  ModeOfLearningLabels,
  EnquirySourceColors,
  EnquiryStatusColors,
} from "./enquiryTypes";

// Payment Service
export { paymentService } from "./paymentService";
export type {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentFilters,
  PaginatedPayments,
  PaymentMethod,
  PaymentStatus,
} from "./paymentTypes";
export {
  PaymentMethodLabels,
  PaymentStatusLabels,
  PaymentMethodColors,
  PaymentStatusColors,
  PaymentHelpers,
} from "./paymentTypes";

// Types and Interfaces
export * from "./types";

// Default export
export { apiService as default } from "./apiService";
