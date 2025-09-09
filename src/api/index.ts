// API Module Exports

// Main API Service
export { ApiService, apiService } from "./apiService";

// Auth Service
export { AuthService, authService, AuthHelpers } from "./authService";
export type { LoginRequest, LoginResponse, User } from "./authService";

// Organization Service
export {
  OrganizationService,
  organizationService,
  OrganizationHelpers,
} from "./organizationService";
export type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationType,
  OrganizationStatus,
  Currency,
  BillingContact,
  OrganizationSettings,
} from "./organizationService";

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
