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
  name: string;
  nameCn: string | null;
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

// ==================== CASA MODULE TYPES ====================

// Customer Types / 客户类型
export type CustomerType = 'INDIVIDUAL' | 'CORPORATE';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'DECEASED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type IdType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'SSS' | 'GSIS' | 'TIN' | 'COMPANY_ID' | 'OTHER';
export type RiskRating = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Customer {
  id: number;
  customerNumber: string;
  customerType: CustomerType;
  
  // Individual fields
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  firstNameCn: string | null;
  lastNameCn: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  nationality: string | null;
  
  // Corporate fields
  companyName: string | null;
  companyNameCn: string | null;
  registrationNumber: string | null;
  dateOfIncorporation: string | null;
  industry: string | null;
  
  // Contact
  email: string | null;
  phone: string | null;
  mobile: string | null;
  mobilePhone: string | null;
  homePhone: string | null;
  workPhone: string | null;
  
  // Address
  address: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
  
  // ID
  idType: IdType | null;
  idNumber: string | null;
  idExpiryDate: string | null;
  taxId: string | null;
  
  // Risk & Compliance
  riskRating: RiskRating | null;
  kycVerified: boolean;
  kycVerifiedDate: string | null;
  kycVerifiedBy: number | null;
  
  // Branch
  branchId: number | null;
  branchName: string | null;
  relationshipManager: number | null;
  
  // Status
  status: CustomerStatus;
  remarks: string | null;
  
  // Computed
  displayName: string;
  displayNameCn: string | null;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface CreateCustomerRequest {
  customerType: CustomerType;
  
  // Individual fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  firstNameCn?: string;
  lastNameCn?: string;
  dateOfBirth?: string;
  gender?: Gender;
  nationality?: string;
  
  // Corporate fields
  companyName?: string;
  companyNameCn?: string;
  registrationNumber?: string;
  dateOfIncorporation?: string;
  industry?: string;
  businessType?: string;
  
  // Contact
  email?: string;
  phone?: string;
  mobile?: string;
  mobilePhone?: string;
  homePhone?: string;
  workPhone?: string;
  
  // Address
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  
  // ID
  idType: IdType;
  idNumber: string;
  idExpiryDate?: string;
  taxId?: string;
  
  // Risk
  riskRating?: RiskRating;
  
  // Branch
  branchId: number;
  relationshipManager?: number;
  
  remarks?: string;
}

export interface UpdateCustomerRequest {
  // Individual fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  firstNameCn?: string;
  lastNameCn?: string;
  dateOfBirth?: string;
  gender?: Gender;
  nationality?: string;
  
  // Corporate fields
  companyName?: string;
  companyNameCn?: string;
  registrationNumber?: string;
  dateOfIncorporation?: string;
  industry?: string;
  businessType?: string;
  
  // Contact
  email?: string;
  phone?: string;
  mobile?: string;
  mobilePhone?: string;
  homePhone?: string;
  workPhone?: string;
  
  // Address
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  
  // ID
  idType?: IdType;
  idNumber?: string;
  idExpiryDate?: string;
  taxId?: string;
  
  // Risk
  riskRating?: RiskRating;
  relationshipManager?: number;
  
  remarks?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  individualCustomers: number;
  corporateCustomers: number;
  activeCustomers: number;
  kycVerifiedCustomers: number;
}

// Account Type Types / 账户类型
export type AccountCategory = 'SAVINGS' | 'CURRENT' | 'TIME_DEPOSIT';
export type InterestCalculation = 'DAILY_BALANCE' | 'MINIMUM_BALANCE' | 'AVERAGE_BALANCE';
export type PostingFrequency = 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY' | 'AT_MATURITY';
export type AccountTypeStatus = 'ACTIVE' | 'INACTIVE';

export interface AccountType {
  id: number;
  typeCode: string;
  typeName: string;
  typeNameCn: string | null;
  category: AccountCategory;
  description: string | null;
  descriptionCn: string | null;
  
  // Interest
  interestRate: number | null;
  interestCalculation: InterestCalculation | null;
  interestPostingFrequency: PostingFrequency | null;
  
  // Balance
  minimumBalance: number | null;
  minimumOpeningBalance: number | null;
  maximumBalance: number | null;
  
  // Fees
  monthlyFee: number | null;
  belowMinimumFee: number | null;
  dormancyFee: number | null;
  
  // Limits
  dailyWithdrawalLimit: number | null;
  dailyTransferLimit: number | null;
  maxTransactionsPerDay: number | null;
  
  // Time deposit
  termDays: number | null;
  earlyWithdrawalPenaltyRate: number | null;
  
  // Eligibility
  allowIndividual: boolean;
  allowCorporate: boolean;
  minimumAge: number | null;
  maximumAge: number | null;
  
  currency: string;
  status: AccountTypeStatus;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface CreateAccountTypeRequest {
  typeCode: string;
  typeName: string;
  typeNameCn?: string;
  category: AccountCategory;
  description?: string;
  descriptionCn?: string;
  
  // Interest
  interestRate?: number;
  interestCalculation?: InterestCalculation;
  interestPostingFrequency?: PostingFrequency;
  
  // Balance
  minimumBalance?: number;
  minimumOpeningBalance?: number;
  maximumBalance?: number;
  
  // Fees
  monthlyFee?: number;
  belowMinimumFee?: number;
  dormancyFee?: number;
  
  // Limits
  dailyWithdrawalLimit?: number;
  dailyTransferLimit?: number;
  maxTransactionsPerDay?: number;
  
  // Time deposit
  termDays?: number;
  earlyWithdrawalPenaltyRate?: number;
  
  // Eligibility
  allowIndividual?: boolean;
  allowCorporate?: boolean;
  minimumAge?: number;
  maximumAge?: number;
  
  currency?: string;
}

export interface AccountTypeStats {
  totalActive: number;
  totalInactive: number;
  totalSavings: number;
  totalCurrent: number;
  totalTimeDeposit: number;
}

// Account Types / 账户类型
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'DORMANT' | 'FROZEN' | 'BLOCKED' | 'CLOSED';

export interface Account {
  id: number;
  accountNumber: string;
  accountName: string;
  accountNameCn: string | null;
  
  // Customer
  customerId: number;
  customerNumber: string;
  customerName: string;
  
  // Account Type
  accountTypeId: number;
  accountTypeCode: string;
  accountTypeName: string;
  
  // Branch
  branchId: number;
  branchCode: string;
  branchName: string;
  
  // Balance
  currency: string;
  currentBalance: number;
  availableBalance: number;
  holdBalance: number;
  overdraftLimit: number;
  
  // Interest
  accruedInterest: number;
  lastInterestDate: string | null;
  interestRate: number | null;
  
  // Time Deposit
  maturityDate: string | null;
  principalAmount: number | null;
  maturityInstruction: string | null;
  
  // Dates
  openDate: string;
  closeDate: string | null;
  lastTransactionDate: string | null;
  dormantDate: string | null;
  
  // Status
  status: AccountStatus;
  statusReason: string | null;
  
  // Flags
  isJointAccount: boolean;
  allowDebit: boolean;
  allowCredit: boolean;
  atmEnabled: boolean;
  onlineBankingEnabled: boolean;
  smsNotificationEnabled: boolean;
  emailNotificationEnabled: boolean;
  
  signatureType: string | null;
  passbookNumber: string | null;
  checkbookNumber: string | null;
  remarks: string | null;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
  approvedBy: number | null;
  approvedAt: string | null;
  closedBy: number | null;
}

export interface OpenAccountRequest {
  customerId: number;
  accountTypeId: number;
  branchId: number;
  initialDeposit: number;
  accountName?: string;
  accountNameCn?: string;
  isJointAccount?: boolean;
  atmEnabled?: boolean;
  onlineBankingEnabled?: boolean;
  smsNotificationEnabled?: boolean;
  emailNotificationEnabled?: boolean;
  signatureType?: string;
  remarks?: string;
}

export interface UpdateAccountRequest {
  accountName?: string;
  accountNameCn?: string;
  atmEnabled?: boolean;
  onlineBankingEnabled?: boolean;
  smsNotificationEnabled?: boolean;
  emailNotificationEnabled?: boolean;
  remarks?: string;
}

export interface AccountStats {
  totalActive: number;
  totalDormant: number;
  totalFrozen: number;
  totalClosed: number;
  totalActiveBalance: number;
}

export interface BranchAccountStats {
  branchId: number;
  totalAccounts: number;
  totalBalance: number;
}
