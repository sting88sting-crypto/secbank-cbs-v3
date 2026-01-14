import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { mockApi } from './mockApi';
import { ApiResponse, LoginRequest, LoginResponse, PageResponse, User, Role, Permission, Branch, AuditLog, CreateUserRequest, UpdateUserRequest, CreateRoleRequest, UpdateRoleRequest, CreateBranchRequest, UpdateBranchRequest, Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerStats, CustomerType, CustomerStatus, AccountType, CreateAccountTypeRequest, AccountTypeStats, AccountCategory, AccountTypeStatus, Account, OpenAccountRequest, UpdateAccountRequest, AccountStats, BranchAccountStats, AccountStatus } from '@/types';

// Use mock API for development, real API for production
// 开发环境使用模拟API，生产环境使用真实API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance / 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor / 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor / 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Try to refresh token / 尝试刷新令牌
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request / 重试原始请求
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return axios(error.config);
          }
        } catch (refreshError) {
          // Refresh failed, logout / 刷新失败，登出
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API / 认证API
export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.login(data.username, data.password);
      return { success: true, data: result.data, message: 'Login successful' };
    }
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  logout: async (): Promise<ApiResponse<void>> => {
    if (USE_MOCK_API) {
      return { success: true, data: undefined, message: 'Logout successful' };
    }
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// User API / 用户API
export const userApi = {
  getAll: async (page = 0, size = 20): Promise<ApiResponse<PageResponse<User>>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getUsers(page, size);
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/users', { params: { page, size } });
    return response.data;
  },
  
  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  create: async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.createUser(data);
      return { success: true, data: result.data, message: 'User created successfully' };
    }
    const response = await api.post('/users', data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.updateUser(id, data);
      return { success: true, data: result.data, message: 'User updated successfully' };
    }
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<ApiResponse<void>> => {
    if (USE_MOCK_API) {
      await mockApi.deleteUser(id);
      return { success: true, data: undefined, message: 'User deleted successfully' };
    }
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  resetPassword: async (id: number, newPassword: string): Promise<ApiResponse<void>> => {
    if (USE_MOCK_API) {
      await mockApi.resetPassword(id, newPassword);
      return { success: true, data: undefined, message: 'Password reset successfully' };
    }
    const response = await api.post(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/users/change-password', { currentPassword, newPassword });
    return response.data;
  },
  
  search: async (keyword: string, page = 0, size = 20): Promise<ApiResponse<PageResponse<User>>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.searchUsers(keyword);
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/users/search', { params: { keyword, page, size } });
    return response.data;
  },
};

// Role API / 角色API
export const roleApi = {
  getAll: async (page = 0, size = 20): Promise<ApiResponse<PageResponse<Role>>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getRoles(page, size);
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/roles', { params: { page, size } });
    return response.data;
  },
  
  getActive: async (): Promise<ApiResponse<Role[]>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getActiveRoles();
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/roles/active');
    return response.data;
  },
  
  getById: async (id: number): Promise<ApiResponse<Role>> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  
  create: async (data: CreateRoleRequest): Promise<ApiResponse<Role>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.createRole(data);
      return { success: true, data: result.data, message: 'Role created successfully' };
    }
    const response = await api.post('/roles', data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateRoleRequest): Promise<ApiResponse<Role>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.updateRole(id, data);
      return { success: true, data: result.data, message: 'Role updated successfully' };
    }
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<ApiResponse<void>> => {
    if (USE_MOCK_API) {
      await mockApi.deleteRole(id);
      return { success: true, data: undefined, message: 'Role deleted successfully' };
    }
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

// Permission API / 权限API
export const permissionApi = {
  getAll: async (): Promise<ApiResponse<Permission[]>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getPermissions();
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/permissions');
    return response.data;
  },
  
  getGrouped: async (): Promise<ApiResponse<Record<string, Permission[]>>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getGroupedPermissions();
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/permissions/grouped');
    return response.data;
  },
  
  getModules: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/permissions/modules');
    return response.data;
  },
};

// Branch API / 分行API
export const branchApi = {
  getAll: async (page = 0, size = 20): Promise<ApiResponse<PageResponse<Branch>>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getBranches(page, size);
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/branches', { params: { page, size } });
    return response.data;
  },
  
  getActive: async (): Promise<ApiResponse<Branch[]>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getActiveBranches();
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/branches/active');
    return response.data;
  },
  
  getById: async (id: number): Promise<ApiResponse<Branch>> => {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },
  
  create: async (data: CreateBranchRequest): Promise<ApiResponse<Branch>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.createBranch(data);
      return { success: true, data: result.data, message: 'Branch created successfully' };
    }
    const response = await api.post('/branches', data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateBranchRequest): Promise<ApiResponse<Branch>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.updateBranch(id, data);
      return { success: true, data: result.data, message: 'Branch updated successfully' };
    }
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<ApiResponse<void>> => {
    if (USE_MOCK_API) {
      await mockApi.deleteBranch(id);
      return { success: true, data: undefined, message: 'Branch deleted successfully' };
    }
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },
  
  search: async (keyword: string, page = 0, size = 20): Promise<ApiResponse<PageResponse<Branch>>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.searchBranches(keyword);
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/branches/search', { params: { keyword, page, size } });
    return response.data;
  },
};

// Audit Log API / 审计日志API
export const auditLogApi = {
  getAll: async (page = 0, size = 20): Promise<ApiResponse<PageResponse<AuditLog>>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getAuditLogs(page, size);
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/audit-logs', { params: { page, size } });
    return response.data;
  },
  
  search: async (params: {
    userId?: number;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<AuditLog>>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.searchAuditLogs(params);
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/audit-logs/search', { params });
    return response.data;
  },
  
  getActions: async (): Promise<ApiResponse<string[]>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getAuditActions();
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/audit-logs/actions');
    return response.data;
  },
  
  getModules: async (): Promise<ApiResponse<string[]>> => {
    if (USE_MOCK_API) {
      const result = await mockApi.getAuditModules();
      return { success: true, data: result.data, message: 'Success' };
    }
    const response = await api.get('/audit-logs/modules');
    return response.data;
  },
};

export default api;


// ==================== CASA MODULE APIs ====================

// Customer API / 客户API
export const customerApi = {
  getAll: async (params: {
    keyword?: string;
    type?: CustomerType;
    status?: CustomerStatus;
    branchId?: number;
    page?: number;
    size?: number;
  } = {}): Promise<ApiResponse<PageResponse<Customer>>> => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<ApiResponse<Customer>> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  
  getByNumber: async (customerNumber: string): Promise<ApiResponse<Customer>> => {
    const response = await api.get(`/customers/number/${customerNumber}`);
    return response.data;
  },
  
  search: async (keyword: string, page = 0, size = 20): Promise<ApiResponse<PageResponse<Customer>>> => {
    const response = await api.get('/customers/search', { params: { keyword, page, size } });
    return response.data;
  },
  
  create: async (data: CreateCustomerRequest): Promise<ApiResponse<Customer>> => {
    const response = await api.post('/customers', data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateCustomerRequest): Promise<ApiResponse<Customer>> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: number, status: CustomerStatus): Promise<ApiResponse<Customer>> => {
    const response = await api.put(`/customers/${id}/status`, null, { params: { status } });
    return response.data;
  },
  
  verifyKyc: async (id: number): Promise<ApiResponse<Customer>> => {
    const response = await api.post(`/customers/${id}/verify-kyc`);
    return response.data;
  },
  
  getByBranch: async (branchId: number, page = 0, size = 20): Promise<ApiResponse<PageResponse<Customer>>> => {
    const response = await api.get(`/customers/branch/${branchId}`, { params: { page, size } });
    return response.data;
  },
  
  getStats: async (): Promise<ApiResponse<CustomerStats>> => {
    const response = await api.get('/customers/stats');
    return response.data;
  },
};

// Account Type API / 账户类型API
export const accountTypeApi = {
  getAll: async (params: {
    keyword?: string;
    category?: AccountCategory;
    status?: AccountTypeStatus;
    page?: number;
    size?: number;
  } = {}): Promise<ApiResponse<PageResponse<AccountType>>> => {
    const response = await api.get('/account-types', { params });
    return response.data;
  },
  
  getActive: async (): Promise<ApiResponse<AccountType[]>> => {
    const response = await api.get('/account-types/active');
    return response.data;
  },
  
  getByCategory: async (category: AccountCategory): Promise<ApiResponse<AccountType[]>> => {
    const response = await api.get(`/account-types/category/${category}`);
    return response.data;
  },
  
  getById: async (id: number): Promise<ApiResponse<AccountType>> => {
    const response = await api.get(`/account-types/${id}`);
    return response.data;
  },
  
  getByCode: async (typeCode: string): Promise<ApiResponse<AccountType>> => {
    const response = await api.get(`/account-types/code/${typeCode}`);
    return response.data;
  },
  
  create: async (data: CreateAccountTypeRequest): Promise<ApiResponse<AccountType>> => {
    const response = await api.post('/account-types', data);
    return response.data;
  },
  
  update: async (id: number, data: CreateAccountTypeRequest): Promise<ApiResponse<AccountType>> => {
    const response = await api.put(`/account-types/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: number, status: AccountTypeStatus): Promise<ApiResponse<AccountType>> => {
    const response = await api.put(`/account-types/${id}/status`, null, { params: { status } });
    return response.data;
  },
  
  getStats: async (): Promise<ApiResponse<AccountTypeStats>> => {
    const response = await api.get('/account-types/stats');
    return response.data;
  },
};

// Account API / 账户API
export const accountApi = {
  getAll: async (params: {
    keyword?: string;
    status?: AccountStatus;
    branchId?: number;
    accountTypeId?: number;
    customerId?: number;
    page?: number;
    size?: number;
  } = {}): Promise<ApiResponse<PageResponse<Account>>> => {
    const response = await api.get('/accounts', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<ApiResponse<Account>> => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },
  
  getByNumber: async (accountNumber: string): Promise<ApiResponse<Account>> => {
    const response = await api.get(`/accounts/number/${accountNumber}`);
    return response.data;
  },
  
  search: async (keyword: string, page = 0, size = 20): Promise<ApiResponse<PageResponse<Account>>> => {
    const response = await api.get('/accounts/search', { params: { keyword, page, size } });
    return response.data;
  },
  
  getByCustomer: async (customerId: number): Promise<ApiResponse<Account[]>> => {
    const response = await api.get(`/accounts/customer/${customerId}`);
    return response.data;
  },
  
  getByBranch: async (branchId: number, page = 0, size = 20): Promise<ApiResponse<PageResponse<Account>>> => {
    const response = await api.get(`/accounts/branch/${branchId}`, { params: { page, size } });
    return response.data;
  },
  
  open: async (data: OpenAccountRequest): Promise<ApiResponse<Account>> => {
    const response = await api.post('/accounts/open', data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateAccountRequest): Promise<ApiResponse<Account>> => {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: number, status: AccountStatus, reason?: string): Promise<ApiResponse<Account>> => {
    const response = await api.put(`/accounts/${id}/status`, null, { params: { status, reason } });
    return response.data;
  },
  
  freeze: async (id: number, reason: string): Promise<ApiResponse<Account>> => {
    const response = await api.post(`/accounts/${id}/freeze`, null, { params: { reason } });
    return response.data;
  },
  
  unfreeze: async (id: number): Promise<ApiResponse<Account>> => {
    const response = await api.post(`/accounts/${id}/unfreeze`);
    return response.data;
  },
  
  close: async (id: number, reason: string): Promise<ApiResponse<Account>> => {
    const response = await api.post(`/accounts/${id}/close`, null, { params: { reason } });
    return response.data;
  },
  
  getStats: async (): Promise<ApiResponse<AccountStats>> => {
    const response = await api.get('/accounts/stats');
    return response.data;
  },
  
  getBranchStats: async (branchId: number): Promise<ApiResponse<BranchAccountStats>> => {
    const response = await api.get(`/accounts/stats/branch/${branchId}`);
    return response.data;
  },
};
