export type Language = 'en' | 'zh';

export const translations = {
  // Common / 通用
  common: {
    appName: { en: 'SecBank CBS', zh: 'SecBank核心银行系统' },
    loading: { en: 'Loading...', zh: '加载中...' },
    save: { en: 'Save', zh: '保存' },
    cancel: { en: 'Cancel', zh: '取消' },
    delete: { en: 'Delete', zh: '删除' },
    edit: { en: 'Edit', zh: '编辑' },
    create: { en: 'Create', zh: '创建' },
    search: { en: 'Search', zh: '搜索' },
    actions: { en: 'Actions', zh: '操作' },
    status: { en: 'Status', zh: '状态' },
    active: { en: 'Active', zh: '活跃' },
    inactive: { en: 'Inactive', zh: '未激活' },
    locked: { en: 'Locked', zh: '已锁定' },
    closed: { en: 'Closed', zh: '已关闭' },
    yes: { en: 'Yes', zh: '是' },
    no: { en: 'No', zh: '否' },
    confirm: { en: 'Confirm', zh: '确认' },
    back: { en: 'Back', zh: '返回' },
    submit: { en: 'Submit', zh: '提交' },
    reset: { en: 'Reset', zh: '重置' },
    view: { en: 'View', zh: '查看' },
    noData: { en: 'No data available', zh: '暂无数据' },
    createdAt: { en: 'Created At', zh: '创建时间' },
    updatedAt: { en: 'Updated At', zh: '更新时间' },
  },

  // Auth / 认证
  auth: {
    login: { en: 'Login', zh: '登录' },
    logout: { en: 'Logout', zh: '登出' },
    username: { en: 'Username', zh: '用户名' },
    password: { en: 'Password', zh: '密码' },
    loginTitle: { en: 'Sign in to your account', zh: '登录您的账户' },
    loginButton: { en: 'Sign In', zh: '登录' },
    loginSuccess: { en: 'Login successful', zh: '登录成功' },
    loginFailed: { en: 'Login failed', zh: '登录失败' },
    logoutSuccess: { en: 'Logged out successfully', zh: '登出成功' },
    changePassword: { en: 'Change Password', zh: '修改密码' },
    currentPassword: { en: 'Current Password', zh: '当前密码' },
    newPassword: { en: 'New Password', zh: '新密码' },
    confirmPassword: { en: 'Confirm Password', zh: '确认密码' },
  },

  // Navigation / 导航
  nav: {
    dashboard: { en: 'Dashboard', zh: '仪表盘' },
    administration: { en: 'Administration', zh: '系统管理' },
    users: { en: 'Users', zh: '用户管理' },
    roles: { en: 'Roles', zh: '角色管理' },
    permissions: { en: 'Permissions', zh: '权限管理' },
    branches: { en: 'Branches', zh: '分行管理' },
    auditLogs: { en: 'Audit Logs', zh: '审计日志' },
    casa: { en: 'CASA', zh: '储蓄账户' },
    accounting: { en: 'Accounting', zh: '会计' },
    tellering: { en: 'Tellering', zh: '柜面交易' },
    nrps: { en: 'NRPS', zh: '国家零售支付' },
  },

  // Users / 用户
  users: {
    title: { en: 'User Management', zh: '用户管理' },
    createUser: { en: 'Create User', zh: '创建用户' },
    editUser: { en: 'Edit User', zh: '编辑用户' },
    deleteUser: { en: 'Delete User', zh: '删除用户' },
    fullName: { en: 'Full Name', zh: '全名' },
    fullNameCn: { en: 'Full Name (Chinese)', zh: '中文全名' },
    email: { en: 'Email', zh: '邮箱' },
    phone: { en: 'Phone', zh: '电话' },
    employeeId: { en: 'Employee ID', zh: '员工编号' },
    branch: { en: 'Branch', zh: '分行' },
    roles: { en: 'Roles', zh: '角色' },
    lastLogin: { en: 'Last Login', zh: '最后登录' },
    resetPassword: { en: 'Reset Password', zh: '重置密码' },
    confirmDelete: { en: 'Are you sure you want to delete this user?', zh: '确定要删除此用户吗？' },
  },

  // Roles / 角色
  roles: {
    title: { en: 'Role Management', zh: '角色管理' },
    createRole: { en: 'Create Role', zh: '创建角色' },
    editRole: { en: 'Edit Role', zh: '编辑角色' },
    deleteRole: { en: 'Delete Role', zh: '删除角色' },
    roleCode: { en: 'Role Code', zh: '角色代码' },
    roleName: { en: 'Role Name', zh: '角色名称' },
    roleNameCn: { en: 'Role Name (Chinese)', zh: '角色中文名称' },
    description: { en: 'Description', zh: '描述' },
    descriptionCn: { en: 'Description (Chinese)', zh: '中文描述' },
    permissions: { en: 'Permissions', zh: '权限' },
    isSystemRole: { en: 'System Role', zh: '系统角色' },
    confirmDelete: { en: 'Are you sure you want to delete this role?', zh: '确定要删除此角色吗？' },
  },

  // Branches / 分行
  branches: {
    title: { en: 'Branch Management', zh: '分行管理' },
    createBranch: { en: 'Create Branch', zh: '创建分行' },
    editBranch: { en: 'Edit Branch', zh: '编辑分行' },
    deleteBranch: { en: 'Delete Branch', zh: '删除分行' },
    branchCode: { en: 'Branch Code', zh: '分行代码' },
    branchName: { en: 'Branch Name', zh: '分行名称' },
    branchNameCn: { en: 'Branch Name (Chinese)', zh: '分行中文名称' },
    address: { en: 'Address', zh: '地址' },
    city: { en: 'City', zh: '城市' },
    province: { en: 'Province', zh: '省份' },
    postalCode: { en: 'Postal Code', zh: '邮编' },
    phone: { en: 'Phone', zh: '电话' },
    email: { en: 'Email', zh: '邮箱' },
    managerName: { en: 'Manager Name', zh: '经理姓名' },
    isHeadOffice: { en: 'Head Office', zh: '总行' },
    confirmDelete: { en: 'Are you sure you want to delete this branch?', zh: '确定要删除此分行吗？' },
  },

  // Permissions / 权限
  permissions: {
    title: { en: 'Permission Management', zh: '权限管理' },
    permissionCode: { en: 'Permission Code', zh: '权限代码' },
    permissionName: { en: 'Permission Name', zh: '权限名称' },
    module: { en: 'Module', zh: '模块' },
  },

  // Audit Logs / 审计日志
  auditLogs: {
    title: { en: 'Audit Logs', zh: '审计日志' },
    user: { en: 'User', zh: '用户' },
    action: { en: 'Action', zh: '操作' },
    module: { en: 'Module', zh: '模块' },
    entityType: { en: 'Entity Type', zh: '实体类型' },
    entityId: { en: 'Entity ID', zh: '实体ID' },
    ipAddress: { en: 'IP Address', zh: 'IP地址' },
    timestamp: { en: 'Timestamp', zh: '时间戳' },
    description: { en: 'Description', zh: '描述' },
    startDate: { en: 'Start Date', zh: '开始日期' },
    endDate: { en: 'End Date', zh: '结束日期' },
  },

  // Messages / 消息
  messages: {
    createSuccess: { en: 'Created successfully', zh: '创建成功' },
    updateSuccess: { en: 'Updated successfully', zh: '更新成功' },
    deleteSuccess: { en: 'Deleted successfully', zh: '删除成功' },
    operationFailed: { en: 'Operation failed', zh: '操作失败' },
    confirmAction: { en: 'Are you sure?', zh: '确定吗？' },
  },
};

export function t(key: string, lang: Language = 'en'): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  if (value && typeof value === 'object' && lang in value) {
    return value[lang];
  }
  
  return key;
}

export function getBilingual(en: string, zh: string | null | undefined, lang: Language = 'en'): string {
  if (lang === 'zh' && zh) {
    return zh;
  }
  return en;
}
