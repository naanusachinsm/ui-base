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

// Types and Interfaces
export * from "./types";

// Default export
export { apiService as default } from "./apiService";
