// API Response Types / API响应类型
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
}

// Auth Types / 认证类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId?: number;
  username?: string;
  fullName?: string;
  email?: string;
  branchId?: number | null;
  mustChangePassword?: boolean;
  user?: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  fullNameCn: string | null;
  phone: string | null;
  employeeId: string | null;
  branchId: number | null;
  branchName: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastLoginAt: string | null;
  mustChangePassword?: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  fullName: string;
  fullNameCn?: string;
  phone?: string;
  employeeId?: string;
  branchId?: number;
  roleIds: number[];
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  fullNameCn?: string;
  phone?: string;
  employeeId?: string;
  branchId?: number;
  roleIds?: number[];
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}

// Role Types / 角色类型
export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  roleNameCn: string | null;
  description: string | null;
  descriptionCn: string | null;
  isSystemRole: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  roleCode: string;
  roleName: string;
  roleNameCn?: string;
  description?: string;
  descriptionCn?: string;
  permissionIds: number[];
}

export interface UpdateRoleRequest {
  roleCode?: string;
  roleName?: string;
  roleNameCn?: string;
  description?: string;
  descriptionCn?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  permissionIds?: number[];
}

// Permission Types / 权限类型
export interface Permission {
  id: number;
  permissionCode: string;
  permissionName: string;
  permissionNameCn: string | null;
  module: string;
  description: string | null;
  descriptionCn: string | null;
}

// Branch Types / 分行类型
export interface Branch {
  id: number;
  branchCode: string;
  branchName: string;
  branchNameCn: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  managerName: string | null;
  isHeadOffice: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchRequest {
  branchCode: string;
  branchName: string;
  branchNameCn?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerName?: string;
}

export interface UpdateBranchRequest {
  branchName?: string;
  branchNameCn?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
}

// Audit Log Types / 审计日志类型
export interface AuditLog {
  id: number;
  userId: number | null;
  username: string | null;
  action: string;
  module: string;
  entityType: string | null;
  entityId: number | string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  description: string | null;
  createdAt: string;
}

// Language Types / 语言类型
export type Language = 'en' | 'zh';

// Common Types / 通用类型
export interface SelectOption {
  value: string | number;
  label: string;
  labelCn?: string;
}
