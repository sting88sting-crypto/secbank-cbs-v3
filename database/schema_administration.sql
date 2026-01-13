-- ============================================================
-- SECBANK CBS V2 - Administration Module Database Schema
-- Module: Administration (管理模块)
-- Version: 2.0.0
-- Date: 2025-01-14
-- ============================================================

-- ============================================================
-- 1. BRANCHES TABLE (分行表)
-- ============================================================
CREATE TABLE IF NOT EXISTS branches (
    id BIGSERIAL PRIMARY KEY,
    branch_code VARCHAR(10) NOT NULL UNIQUE,          -- 分行代码 (e.g., '001')
    branch_name VARCHAR(100) NOT NULL,                -- 分行名称
    branch_name_cn VARCHAR(100),                      -- 分行中文名称
    address VARCHAR(500),                             -- 地址
    city VARCHAR(100),                                -- 城市
    province VARCHAR(100),                            -- 省份
    postal_code VARCHAR(20),                          -- 邮编
    phone VARCHAR(50),                                -- 电话
    email VARCHAR(100),                               -- 邮箱
    manager_name VARCHAR(100),                        -- 经理姓名
    is_head_office BOOLEAN DEFAULT FALSE,             -- 是否总行
    status VARCHAR(20) DEFAULT 'ACTIVE',              -- 状态: ACTIVE, INACTIVE, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

COMMENT ON TABLE branches IS 'Branch information table / 分行信息表';
COMMENT ON COLUMN branches.branch_code IS 'Unique branch code / 唯一分行代码';
COMMENT ON COLUMN branches.is_head_office IS 'Whether this is the head office / 是否为总行';

-- ============================================================
-- 2. PERMISSIONS TABLE (权限表)
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,     -- 权限代码 (e.g., 'USER_CREATE')
    permission_name VARCHAR(100) NOT NULL,            -- 权限名称
    permission_name_cn VARCHAR(100),                  -- 权限中文名称
    module VARCHAR(50) NOT NULL,                      -- 所属模块 (e.g., 'ADMINISTRATION')
    description VARCHAR(500),                         -- 描述
    description_cn VARCHAR(500),                      -- 中文描述
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE permissions IS 'System permissions table / 系统权限表';
COMMENT ON COLUMN permissions.permission_code IS 'Unique permission code / 唯一权限代码';
COMMENT ON COLUMN permissions.module IS 'Module this permission belongs to / 权限所属模块';

-- ============================================================
-- 3. ROLES TABLE (角色表)
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,            -- 角色代码 (e.g., 'ADMIN')
    role_name VARCHAR(100) NOT NULL,                  -- 角色名称
    role_name_cn VARCHAR(100),                        -- 角色中文名称
    description VARCHAR(500),                         -- 描述
    description_cn VARCHAR(500),                      -- 中文描述
    is_system_role BOOLEAN DEFAULT FALSE,             -- 是否系统角色（不可删除）
    status VARCHAR(20) DEFAULT 'ACTIVE',              -- 状态: ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

COMMENT ON TABLE roles IS 'User roles table / 用户角色表';
COMMENT ON COLUMN roles.is_system_role IS 'System roles cannot be deleted / 系统角色不可删除';

-- ============================================================
-- 4. ROLE_PERMISSIONS TABLE (角色权限关联表)
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

COMMENT ON TABLE role_permissions IS 'Role-Permission mapping table / 角色权限关联表';

-- ============================================================
-- 5. USERS TABLE (用户表)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,             -- 用户名
    password_hash VARCHAR(255) NOT NULL,              -- 密码哈希
    email VARCHAR(100) UNIQUE,                        -- 邮箱
    full_name VARCHAR(100) NOT NULL,                  -- 全名
    full_name_cn VARCHAR(100),                        -- 中文全名
    phone VARCHAR(50),                                -- 电话
    employee_id VARCHAR(50),                          -- 员工编号
    branch_id BIGINT REFERENCES branches(id),         -- 所属分行
    status VARCHAR(20) DEFAULT 'ACTIVE',              -- 状态: ACTIVE, INACTIVE, LOCKED
    failed_login_attempts INT DEFAULT 0,              -- 登录失败次数
    last_login_at TIMESTAMP,                          -- 最后登录时间
    last_login_ip VARCHAR(50),                        -- 最后登录IP
    password_changed_at TIMESTAMP,                    -- 密码修改时间
    must_change_password BOOLEAN DEFAULT TRUE,        -- 是否必须修改密码
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

COMMENT ON TABLE users IS 'System users table / 系统用户表';
COMMENT ON COLUMN users.must_change_password IS 'User must change password on next login / 用户下次登录必须修改密码';

-- ============================================================
-- 6. USER_ROLES TABLE (用户角色关联表)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'User-Role mapping table / 用户角色关联表';

-- ============================================================
-- 7. AUDIT_LOGS TABLE (审计日志表)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    username VARCHAR(50),                             -- 用户名（冗余存储）
    action VARCHAR(100) NOT NULL,                     -- 操作类型
    module VARCHAR(50) NOT NULL,                      -- 模块
    entity_type VARCHAR(100),                         -- 实体类型
    entity_id BIGINT,                                 -- 实体ID
    old_value TEXT,                                   -- 旧值 (JSON)
    new_value TEXT,                                   -- 新值 (JSON)
    ip_address VARCHAR(50),                           -- IP地址
    user_agent VARCHAR(500),                          -- 用户代理
    description VARCHAR(500),                         -- 描述
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'System audit logs table / 系统审计日志表';

-- ============================================================
-- INDEXES (索引)
-- ============================================================
CREATE INDEX idx_branches_status ON branches(status);
CREATE INDEX idx_branches_branch_code ON branches(branch_code);

CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_code ON permissions(permission_code);

CREATE INDEX idx_roles_status ON roles(status);
CREATE INDEX idx_roles_code ON roles(role_code);

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_branch ON users(branch_id);
CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- INITIAL DATA (初始数据)
-- ============================================================

-- Insert Head Office Branch / 插入总行
INSERT INTO branches (branch_code, branch_name, branch_name_cn, is_head_office, status)
VALUES ('000', 'Head Office', '总行', TRUE, 'ACTIVE');

-- Insert Default Permissions / 插入默认权限
INSERT INTO permissions (permission_code, permission_name, permission_name_cn, module, description, description_cn) VALUES
-- Administration Module Permissions
('BRANCH_VIEW', 'View Branches', '查看分行', 'ADMINISTRATION', 'View branch list and details', '查看分行列表和详情'),
('BRANCH_CREATE', 'Create Branch', '创建分行', 'ADMINISTRATION', 'Create new branch', '创建新分行'),
('BRANCH_UPDATE', 'Update Branch', '更新分行', 'ADMINISTRATION', 'Update branch information', '更新分行信息'),
('BRANCH_DELETE', 'Delete Branch', '删除分行', 'ADMINISTRATION', 'Delete branch', '删除分行'),

('USER_VIEW', 'View Users', '查看用户', 'ADMINISTRATION', 'View user list and details', '查看用户列表和详情'),
('USER_CREATE', 'Create User', '创建用户', 'ADMINISTRATION', 'Create new user', '创建新用户'),
('USER_UPDATE', 'Update User', '更新用户', 'ADMINISTRATION', 'Update user information', '更新用户信息'),
('USER_DELETE', 'Delete User', '删除用户', 'ADMINISTRATION', 'Delete user', '删除用户'),
('USER_RESET_PASSWORD', 'Reset User Password', '重置用户密码', 'ADMINISTRATION', 'Reset user password', '重置用户密码'),

('ROLE_VIEW', 'View Roles', '查看角色', 'ADMINISTRATION', 'View role list and details', '查看角色列表和详情'),
('ROLE_CREATE', 'Create Role', '创建角色', 'ADMINISTRATION', 'Create new role', '创建新角色'),
('ROLE_UPDATE', 'Update Role', '更新角色', 'ADMINISTRATION', 'Update role information', '更新角色信息'),
('ROLE_DELETE', 'Delete Role', '删除角色', 'ADMINISTRATION', 'Delete role', '删除角色'),

('PERMISSION_VIEW', 'View Permissions', '查看权限', 'ADMINISTRATION', 'View permission list', '查看权限列表'),

('AUDIT_LOG_VIEW', 'View Audit Logs', '查看审计日志', 'ADMINISTRATION', 'View system audit logs', '查看系统审计日志');

-- Insert Default Roles / 插入默认角色
INSERT INTO roles (role_code, role_name, role_name_cn, description, description_cn, is_system_role, status) VALUES
('SUPER_ADMIN', 'Super Administrator', '超级管理员', 'Full system access', '完全系统访问权限', TRUE, 'ACTIVE'),
('BRANCH_MANAGER', 'Branch Manager', '分行经理', 'Branch level management', '分行级别管理权限', TRUE, 'ACTIVE'),
('TELLER', 'Teller', '柜员', 'Teller operations', '柜员操作权限', TRUE, 'ACTIVE'),
('ACCOUNTANT', 'Accountant', '会计', 'Accounting operations', '会计操作权限', TRUE, 'ACTIVE'),
('AUDITOR', 'Auditor', '审计员', 'View and audit access', '查看和审计权限', TRUE, 'ACTIVE');

-- Assign all permissions to Super Admin / 为超级管理员分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_code = 'SUPER_ADMIN'),
    id
FROM permissions;

-- Assign view permissions to Auditor / 为审计员分配查看权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_code = 'AUDITOR'),
    id
FROM permissions
WHERE permission_code LIKE '%_VIEW';

-- Insert Default Admin User (password: admin123) / 插入默认管理员用户
-- Note: Password hash is BCrypt encoded 'admin123'
INSERT INTO users (username, password_hash, email, full_name, full_name_cn, branch_id, status, must_change_password)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqKnlJXuSFLnXOqVqJxqvKqKqKqKq',
    'admin@secbank.com',
    'System Administrator',
    '系统管理员',
    (SELECT id FROM branches WHERE branch_code = '000'),
    'ACTIVE',
    TRUE
);

-- Assign Super Admin role to admin user / 为admin用户分配超级管理员角色
INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE username = 'admin'),
    (SELECT id FROM roles WHERE role_code = 'SUPER_ADMIN')
);
