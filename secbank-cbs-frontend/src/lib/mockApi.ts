// Mock API Service for Demo / 演示用模拟API服务
// This simulates backend responses for testing the UI

import { User, Role, Permission, Branch, AuditLog } from '@/types';

// Simulated delay / 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data / 模拟数据
const mockPermissions: Permission[] = [
  { id: 1, permissionCode: 'USER_VIEW', permissionName: 'View Users', permissionNameCn: '查看用户', module: 'USER', description: 'View user list', descriptionCn: '查看用户列表' },
  { id: 2, permissionCode: 'USER_CREATE', permissionName: 'Create Users', permissionNameCn: '创建用户', module: 'USER', description: 'Create new users', descriptionCn: '创建新用户' },
  { id: 3, permissionCode: 'USER_UPDATE', permissionName: 'Update Users', permissionNameCn: '更新用户', module: 'USER', description: 'Update user information', descriptionCn: '更新用户信息' },
  { id: 4, permissionCode: 'USER_DELETE', permissionName: 'Delete Users', permissionNameCn: '删除用户', module: 'USER', description: 'Delete users', descriptionCn: '删除用户' },
  { id: 5, permissionCode: 'ROLE_VIEW', permissionName: 'View Roles', permissionNameCn: '查看角色', module: 'ROLE', description: 'View role list', descriptionCn: '查看角色列表' },
  { id: 6, permissionCode: 'ROLE_CREATE', permissionName: 'Create Roles', permissionNameCn: '创建角色', module: 'ROLE', description: 'Create new roles', descriptionCn: '创建新角色' },
  { id: 7, permissionCode: 'ROLE_UPDATE', permissionName: 'Update Roles', permissionNameCn: '更新角色', module: 'ROLE', description: 'Update role information', descriptionCn: '更新角色信息' },
  { id: 8, permissionCode: 'ROLE_DELETE', permissionName: 'Delete Roles', permissionNameCn: '删除角色', module: 'ROLE', description: 'Delete roles', descriptionCn: '删除角色' },
  { id: 9, permissionCode: 'BRANCH_VIEW', permissionName: 'View Branches', permissionNameCn: '查看分行', module: 'BRANCH', description: 'View branch list', descriptionCn: '查看分行列表' },
  { id: 10, permissionCode: 'BRANCH_CREATE', permissionName: 'Create Branches', permissionNameCn: '创建分行', module: 'BRANCH', description: 'Create new branches', descriptionCn: '创建新分行' },
  { id: 11, permissionCode: 'BRANCH_UPDATE', permissionName: 'Update Branches', permissionNameCn: '更新分行', module: 'BRANCH', description: 'Update branch information', descriptionCn: '更新分行信息' },
  { id: 12, permissionCode: 'BRANCH_DELETE', permissionName: 'Delete Branches', permissionNameCn: '删除分行', module: 'BRANCH', description: 'Delete branches', descriptionCn: '删除分行' },
  { id: 13, permissionCode: 'AUDIT_VIEW', permissionName: 'View Audit Logs', permissionNameCn: '查看审计日志', module: 'AUDIT_LOG', description: 'View audit logs', descriptionCn: '查看审计日志' },
  { id: 14, permissionCode: 'PERMISSION_VIEW', permissionName: 'View Permissions', permissionNameCn: '查看权限', module: 'PERMISSION', description: 'View permissions', descriptionCn: '查看权限列表' },
];

const mockRoles: Role[] = [
  { 
    id: 1, 
    roleCode: 'SUPER_ADMIN', 
    roleName: 'Super Administrator', 
    roleNameCn: '超级管理员',
    description: 'Full system access',
    descriptionCn: '完整系统访问权限',
    isSystemRole: true,
    status: 'ACTIVE',
    permissions: mockPermissions,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 2, 
    roleCode: 'BRANCH_MANAGER', 
    roleName: 'Branch Manager', 
    roleNameCn: '分行经理',
    description: 'Branch level management',
    descriptionCn: '分行级别管理',
    isSystemRole: false,
    status: 'ACTIVE',
    permissions: mockPermissions.filter(p => ['USER_VIEW', 'BRANCH_VIEW', 'AUDIT_VIEW'].includes(p.permissionCode)),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 3, 
    roleCode: 'TELLER', 
    roleName: 'Teller', 
    roleNameCn: '柜员',
    description: 'Basic teller operations',
    descriptionCn: '基本柜员操作',
    isSystemRole: false,
    status: 'ACTIVE',
    permissions: mockPermissions.filter(p => p.permissionCode.includes('VIEW')),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
];

const mockBranches: Branch[] = [
  { 
    id: 1, 
    branchCode: '001', 
    branchName: 'Head Office', 
    branchNameCn: '总行',
    address: '123 Main Street, Manila',
    city: 'Manila',
    province: 'Metro Manila',
    postalCode: '1000',
    phone: '+63 2 8888 1234',
    email: 'headoffice@secbank.ph',
    managerName: 'Juan Dela Cruz',
    isHeadOffice: true,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 2, 
    branchCode: '002', 
    branchName: 'Makati Branch', 
    branchNameCn: '马卡蒂分行',
    address: '456 Ayala Avenue, Makati',
    city: 'Makati',
    province: 'Metro Manila',
    postalCode: '1200',
    phone: '+63 2 8888 5678',
    email: 'makati@secbank.ph',
    managerName: 'Maria Santos',
    isHeadOffice: false,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 3, 
    branchCode: '003', 
    branchName: 'Cebu Branch', 
    branchNameCn: '宿务分行',
    address: '789 Osmena Boulevard, Cebu City',
    city: 'Cebu City',
    province: 'Cebu',
    postalCode: '6000',
    phone: '+63 32 888 9012',
    email: 'cebu@secbank.ph',
    managerName: 'Pedro Reyes',
    isHeadOffice: false,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
];

let mockUsers: User[] = [
  { 
    id: 1, 
    username: 'admin', 
    email: 'admin@secbank.ph',
    fullName: 'System Administrator',
    fullNameCn: '系统管理员',
    phone: '+63 917 123 4567',
    employeeId: 'EMP001',
    branchId: 1,
    branchName: 'Head Office',
    roles: [mockRoles[0]],
    status: 'ACTIVE',
    lastLoginAt: '2024-01-15T08:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 2, 
    username: 'jdelacruz', 
    email: 'jdelacruz@secbank.ph',
    fullName: 'Juan Dela Cruz',
    fullNameCn: '胡安·德拉克鲁兹',
    phone: '+63 917 234 5678',
    employeeId: 'EMP002',
    branchId: 1,
    branchName: 'Head Office',
    roles: [mockRoles[1]],
    status: 'ACTIVE',
    lastLoginAt: '2024-01-14T09:15:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 3, 
    username: 'msantos', 
    email: 'msantos@secbank.ph',
    fullName: 'Maria Santos',
    fullNameCn: '玛丽亚·桑托斯',
    phone: '+63 917 345 6789',
    employeeId: 'EMP003',
    branchId: 2,
    branchName: 'Makati Branch',
    roles: [mockRoles[1]],
    status: 'ACTIVE',
    lastLoginAt: '2024-01-13T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 4, 
    username: 'preyes', 
    email: 'preyes@secbank.ph',
    fullName: 'Pedro Reyes',
    fullNameCn: '佩德罗·雷耶斯',
    phone: '+63 917 456 7890',
    employeeId: 'EMP004',
    branchId: 3,
    branchName: 'Cebu Branch',
    roles: [mockRoles[2]],
    status: 'ACTIVE',
    lastLoginAt: '2024-01-12T11:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 5, 
    username: 'agarcia', 
    email: 'agarcia@secbank.ph',
    fullName: 'Ana Garcia',
    fullNameCn: '安娜·加西亚',
    phone: '+63 917 567 8901',
    employeeId: 'EMP005',
    branchId: 2,
    branchName: 'Makati Branch',
    roles: [mockRoles[2]],
    status: 'INACTIVE',
    lastLoginAt: '2024-01-10T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
];

const mockAuditLogs: AuditLog[] = [
  { id: 1, userId: 1, username: 'admin', action: 'LOGIN', module: 'AUTH', entityType: 'User', entityId: '1', description: 'User logged in successfully', oldValue: null, newValue: null, ipAddress: '192.168.1.100', createdAt: '2024-01-15T08:30:00Z' },
  { id: 2, userId: 1, username: 'admin', action: 'CREATE', module: 'USER', entityType: 'User', entityId: '5', description: 'Created new user: agarcia', oldValue: null, newValue: null, ipAddress: '192.168.1.100', createdAt: '2024-01-15T08:35:00Z' },
  { id: 3, userId: 1, username: 'admin', action: 'UPDATE', module: 'ROLE', entityType: 'Role', entityId: '2', description: 'Updated role permissions', oldValue: null, newValue: null, ipAddress: '192.168.1.100', createdAt: '2024-01-15T08:40:00Z' },
  { id: 4, userId: 2, username: 'jdelacruz', action: 'LOGIN', module: 'AUTH', entityType: 'User', entityId: '2', description: 'User logged in successfully', oldValue: null, newValue: null, ipAddress: '192.168.1.101', createdAt: '2024-01-14T09:15:00Z' },
  { id: 5, userId: 2, username: 'jdelacruz', action: 'VIEW', module: 'BRANCH', entityType: 'Branch', entityId: '1', description: 'Viewed branch details', oldValue: null, newValue: null, ipAddress: '192.168.1.101', createdAt: '2024-01-14T09:20:00Z' },
  { id: 6, userId: 3, username: 'msantos', action: 'LOGIN', module: 'AUTH', entityType: 'User', entityId: '3', description: 'User logged in successfully', oldValue: null, newValue: null, ipAddress: '192.168.1.102', createdAt: '2024-01-13T10:00:00Z' },
  { id: 7, userId: 1, username: 'admin', action: 'UPDATE', module: 'USER', entityType: 'User', entityId: '5', description: 'Updated user status to INACTIVE', oldValue: '{"status":"ACTIVE"}', newValue: '{"status":"INACTIVE"}', ipAddress: '192.168.1.100', createdAt: '2024-01-13T11:00:00Z' },
  { id: 8, userId: 1, username: 'admin', action: 'CREATE', module: 'BRANCH', entityType: 'Branch', entityId: '3', description: 'Created new branch: Cebu Branch', oldValue: null, newValue: null, ipAddress: '192.168.1.100', createdAt: '2024-01-12T14:00:00Z' },
  { id: 9, userId: 4, username: 'preyes', action: 'LOGIN', module: 'AUTH', entityType: 'User', entityId: '4', description: 'User logged in successfully', oldValue: null, newValue: null, ipAddress: '192.168.1.103', createdAt: '2024-01-12T11:30:00Z' },
  { id: 10, userId: 1, username: 'admin', action: 'LOGOUT', module: 'AUTH', entityType: 'User', entityId: '1', description: 'User logged out', oldValue: null, newValue: null, ipAddress: '192.168.1.100', createdAt: '2024-01-15T17:00:00Z' },
];

// Mock API Functions / 模拟API函数
export const mockApi = {
  // Auth / 认证
  login: async (username: string, password: string) => {
    await delay(500);
    if (username === 'admin' && password === 'admin123') {
      const user = mockUsers.find(u => u.username === 'admin');
      return {
        data: {
          accessToken: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: user,
        }
      };
    }
    throw { response: { data: { message: 'Invalid username or password / 用户名或密码错误' } } };
  },

  // Users / 用户
  getUsers: async (page = 0, size = 100) => {
    await delay(300);
    return { data: { content: mockUsers, totalElements: mockUsers.length, totalPages: 1 } };
  },

  searchUsers: async (keyword: string) => {
    await delay(300);
    const filtered = mockUsers.filter(u => 
      u.username.toLowerCase().includes(keyword.toLowerCase()) ||
      u.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email.toLowerCase().includes(keyword.toLowerCase())
    );
    return { data: { content: filtered, totalElements: filtered.length, totalPages: 1 } };
  },

  createUser: async (data: any) => {
    await delay(500);
    const newUser: User = {
      id: mockUsers.length + 1,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      fullNameCn: data.fullNameCn,
      phone: data.phone,
      employeeId: data.employeeId,
      branchId: data.branchId,
      branchName: mockBranches.find(b => b.id === data.branchId)?.branchName || '',
      roles: mockRoles.filter(r => data.roleIds?.includes(r.id)),
      status: 'ACTIVE',
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return { data: newUser };
  },

  updateUser: async (id: number, data: any) => {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { 
        ...mockUsers[index], 
        ...data,
        roles: data.roleIds ? mockRoles.filter(r => data.roleIds.includes(r.id)) : mockUsers[index].roles,
        branchName: data.branchId ? mockBranches.find(b => b.id === data.branchId)?.branchName : mockUsers[index].branchName,
        updatedAt: new Date().toISOString()
      };
      return { data: mockUsers[index] };
    }
    throw { response: { data: { message: 'User not found' } } };
  },

  deleteUser: async (id: number) => {
    await delay(500);
    mockUsers = mockUsers.filter(u => u.id !== id);
    return { data: { success: true } };
  },

  resetPassword: async (id: number, newPassword: string) => {
    await delay(500);
    return { data: { success: true, message: 'Password reset successfully' } };
  },

  // Roles / 角色
  getRoles: async (page = 0, size = 100) => {
    await delay(300);
    return { data: { content: mockRoles, totalElements: mockRoles.length, totalPages: 1 } };
  },

  getActiveRoles: async () => {
    await delay(200);
    return { data: mockRoles.filter(r => r.status === 'ACTIVE') };
  },

  createRole: async (data: any) => {
    await delay(500);
    const newRole: Role = {
      id: mockRoles.length + 1,
      roleCode: data.roleCode,
      roleName: data.roleName,
      roleNameCn: data.roleNameCn,
      description: data.description,
      descriptionCn: data.descriptionCn,
      isSystemRole: false,
      status: 'ACTIVE',
      permissions: mockPermissions.filter(p => data.permissionIds?.includes(p.id)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRoles.push(newRole);
    return { data: newRole };
  },

  updateRole: async (id: number, data: any) => {
    await delay(500);
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRoles[index] = { 
        ...mockRoles[index], 
        ...data,
        permissions: data.permissionIds ? mockPermissions.filter(p => data.permissionIds.includes(p.id)) : mockRoles[index].permissions,
        updatedAt: new Date().toISOString()
      };
      return { data: mockRoles[index] };
    }
    throw { response: { data: { message: 'Role not found' } } };
  },

  deleteRole: async (id: number) => {
    await delay(500);
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1 && !mockRoles[index].isSystemRole) {
      mockRoles.splice(index, 1);
      return { data: { success: true } };
    }
    throw { response: { data: { message: 'Cannot delete system role' } } };
  },

  // Branches / 分行
  getBranches: async (page = 0, size = 100) => {
    await delay(300);
    return { data: { content: mockBranches, totalElements: mockBranches.length, totalPages: 1 } };
  },

  getActiveBranches: async () => {
    await delay(200);
    return { data: mockBranches.filter(b => b.status === 'ACTIVE') };
  },

  searchBranches: async (keyword: string) => {
    await delay(300);
    const filtered = mockBranches.filter(b => 
      b.branchCode.toLowerCase().includes(keyword.toLowerCase()) ||
      b.branchName.toLowerCase().includes(keyword.toLowerCase())
    );
    return { data: { content: filtered, totalElements: filtered.length, totalPages: 1 } };
  },

  createBranch: async (data: any) => {
    await delay(500);
    const newBranch: Branch = {
      id: mockBranches.length + 1,
      ...data,
      isHeadOffice: false,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBranches.push(newBranch);
    return { data: newBranch };
  },

  updateBranch: async (id: number, data: any) => {
    await delay(500);
    const index = mockBranches.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBranches[index] = { 
        ...mockBranches[index], 
        ...data,
        updatedAt: new Date().toISOString()
      };
      return { data: mockBranches[index] };
    }
    throw { response: { data: { message: 'Branch not found' } } };
  },

  deleteBranch: async (id: number) => {
    await delay(500);
    const index = mockBranches.findIndex(b => b.id === id);
    if (index !== -1 && !mockBranches[index].isHeadOffice) {
      mockBranches.splice(index, 1);
      return { data: { success: true } };
    }
    throw { response: { data: { message: 'Cannot delete head office' } } };
  },

  // Permissions / 权限
  getPermissions: async () => {
    await delay(200);
    return { data: mockPermissions };
  },

  getGroupedPermissions: async () => {
    await delay(200);
    const grouped: Record<string, Permission[]> = {};
    mockPermissions.forEach(p => {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push(p);
    });
    return { data: grouped };
  },

  // Audit Logs / 审计日志
  getAuditLogs: async (page = 0, size = 100) => {
    await delay(300);
    return { data: { content: mockAuditLogs, totalElements: mockAuditLogs.length, totalPages: 1 } };
  },

  searchAuditLogs: async (params: any) => {
    await delay(300);
    let filtered = [...mockAuditLogs];
    if (params.module) filtered = filtered.filter(l => l.module === params.module);
    if (params.action) filtered = filtered.filter(l => l.action === params.action);
    return { data: { content: filtered, totalElements: filtered.length, totalPages: 1 } };
  },

  getAuditModules: async () => {
    await delay(100);
    return { data: ['AUTH', 'USER', 'ROLE', 'BRANCH', 'PERMISSION'] };
  },

  getAuditActions: async () => {
    await delay(100);
    return { data: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW'] };
  },
};

export default mockApi;
