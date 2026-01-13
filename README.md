# SecBank CBS V2 - Core Banking System
# SecBank CBS V2 - 核心银行系统

## Overview / 概述

SecBank CBS V2 is a comprehensive Core Banking System designed for Philippine rural banks. This project implements a modern, bilingual (English/Chinese) banking solution with a robust backend and intuitive frontend.

SecBank CBS V2 是一个为菲律宾农村银行设计的综合核心银行系统。该项目实现了一个现代化的双语（英文/中文）银行解决方案，具有强大的后端和直观的前端。

## Project Structure / 项目结构

```
secbank-cbs-v2/
├── database/                    # Database scripts / 数据库脚本
│   ├── schema_administration.sql
│   └── erd_administration.mmd
├── secbank-cbs-backend/         # Java Spring Boot Backend / Java后端
│   ├── src/main/java/com/secbank/cbs/
│   │   ├── config/              # Configuration / 配置
│   │   ├── controller/          # REST Controllers / REST控制器
│   │   ├── dto/                 # Data Transfer Objects / 数据传输对象
│   │   ├── entity/              # JPA Entities / JPA实体
│   │   ├── exception/           # Exception Handling / 异常处理
│   │   ├── repository/          # JPA Repositories / JPA仓库
│   │   ├── security/            # Security (JWT) / 安全认证
│   │   └── service/             # Business Services / 业务服务
│   └── pom.xml
└── secbank-cbs-frontend/        # React TypeScript Frontend / React前端
    ├── src/
    │   ├── components/          # UI Components / UI组件
    │   ├── contexts/            # React Contexts / React上下文
    │   ├── hooks/               # Custom Hooks / 自定义钩子
    │   ├── lib/                 # Utilities & API / 工具和API
    │   ├── pages/               # Page Components / 页面组件
    │   └── types/               # TypeScript Types / TypeScript类型
    └── package.json
```

## Technology Stack / 技术栈

### Backend / 后端
| Component / 组件 | Technology / 技术 | Version / 版本 |
|-----------------|-------------------|----------------|
| Language | Java | 21 |
| Framework | Spring Boot | 3.2.x |
| Security | Spring Security + JWT | 6.x |
| Database | PostgreSQL | 15+ |
| ORM | Spring Data JPA | 3.2.x |
| Build Tool | Maven | 3.9.x |

### Frontend / 前端
| Component / 组件 | Technology / 技术 | Version / 版本 |
|-----------------|-------------------|----------------|
| Language | TypeScript | 5.x |
| Framework | React | 19.x |
| Build Tool | Vite | 6.x |
| UI Framework | TailwindCSS | 3.x |
| UI Components | shadcn/ui | Latest |
| State Management | React Context | - |
| HTTP Client | Axios | 1.x |
| Form Validation | React Hook Form + Zod | - |

## Module 1: Administration / 模块1：系统管理

### Features Implemented / 已实现功能

#### 1. User Management / 用户管理
- Create, Read, Update, Delete users / 创建、读取、更新、删除用户
- Search users by keyword / 按关键字搜索用户
- Assign roles to users / 为用户分配角色
- Reset user passwords / 重置用户密码
- User status management (Active/Inactive/Locked) / 用户状态管理

#### 2. Role Management / 角色管理
- Create, Read, Update, Delete roles / 创建、读取、更新、删除角色
- Assign permissions to roles / 为角色分配权限
- System role protection / 系统角色保护
- Role status management / 角色状态管理

#### 3. Permission Management / 权限管理
- View all permissions by module / 按模块查看所有权限
- Permission grouping / 权限分组
- Bilingual permission names / 双语权限名称

#### 4. Branch Management / 分行管理
- Create, Read, Update, Delete branches / 创建、读取、更新、删除分行
- Head office designation / 总行标识
- Branch contact information / 分行联系信息
- Branch status management / 分行状态管理

#### 5. Audit Logging / 审计日志
- Track all system activities / 跟踪所有系统活动
- Filter by module, action, date range / 按模块、操作、日期范围筛选
- View detailed audit information / 查看详细审计信息
- IP address tracking / IP地址跟踪

### API Endpoints / API端点

#### Authentication / 认证
| Method | Endpoint | Description / 描述 |
|--------|----------|-------------------|
| POST | `/api/v1/auth/login` | User login / 用户登录 |
| POST | `/api/v1/auth/refresh` | Refresh token / 刷新令牌 |
| POST | `/api/v1/auth/logout` | User logout / 用户登出 |

#### Users / 用户
| Method | Endpoint | Description / 描述 |
|--------|----------|-------------------|
| GET | `/api/v1/users` | Get all users / 获取所有用户 |
| GET | `/api/v1/users/{id}` | Get user by ID / 按ID获取用户 |
| POST | `/api/v1/users` | Create user / 创建用户 |
| PUT | `/api/v1/users/{id}` | Update user / 更新用户 |
| DELETE | `/api/v1/users/{id}` | Delete user / 删除用户 |
| POST | `/api/v1/users/{id}/reset-password` | Reset password / 重置密码 |

#### Roles / 角色
| Method | Endpoint | Description / 描述 |
|--------|----------|-------------------|
| GET | `/api/v1/roles` | Get all roles / 获取所有角色 |
| GET | `/api/v1/roles/{id}` | Get role by ID / 按ID获取角色 |
| POST | `/api/v1/roles` | Create role / 创建角色 |
| PUT | `/api/v1/roles/{id}` | Update role / 更新角色 |
| DELETE | `/api/v1/roles/{id}` | Delete role / 删除角色 |

#### Branches / 分行
| Method | Endpoint | Description / 描述 |
|--------|----------|-------------------|
| GET | `/api/v1/branches` | Get all branches / 获取所有分行 |
| GET | `/api/v1/branches/{id}` | Get branch by ID / 按ID获取分行 |
| POST | `/api/v1/branches` | Create branch / 创建分行 |
| PUT | `/api/v1/branches/{id}` | Update branch / 更新分行 |
| DELETE | `/api/v1/branches/{id}` | Delete branch / 删除分行 |

#### Permissions / 权限
| Method | Endpoint | Description / 描述 |
|--------|----------|-------------------|
| GET | `/api/v1/permissions` | Get all permissions / 获取所有权限 |
| GET | `/api/v1/permissions/grouped` | Get permissions by module / 按模块获取权限 |

#### Audit Logs / 审计日志
| Method | Endpoint | Description / 描述 |
|--------|----------|-------------------|
| GET | `/api/v1/audit-logs` | Get audit logs / 获取审计日志 |
| GET | `/api/v1/audit-logs/search` | Search audit logs / 搜索审计日志 |

## Getting Started / 开始使用

### Prerequisites / 前提条件
- Java 21+
- Node.js 22+
- PostgreSQL 15+
- Maven 3.9+

### Backend Setup / 后端设置

```bash
cd secbank-cbs-backend

# Configure database in application.yml
# 在 application.yml 中配置数据库

# Build and run
mvn clean install
mvn spring-boot:run
```

### Frontend Setup / 前端设置

```bash
cd secbank-cbs-frontend

# Install dependencies / 安装依赖
npm install

# Start development server / 启动开发服务器
npm run dev
```

### Database Setup / 数据库设置

```bash
# Create database / 创建数据库
createdb secbank_cbs

# Run schema script / 运行架构脚本
psql -d secbank_cbs -f database/schema_administration.sql
```

## Development Progress / 开发进度

| Module / 模块 | Status / 状态 | Progress / 进度 |
|--------------|---------------|-----------------|
| Administration / 系统管理 | ✅ Completed / 已完成 | 100% |
| CASA / 储蓄账户 | 🔜 Planned / 计划中 | 0% |
| Accounting / 会计 | 🔜 Planned / 计划中 | 0% |
| Tellering / 柜员 | 🔜 Planned / 计划中 | 0% |
| NRPS / 支付系统 | 🔜 Planned / 计划中 | 0% |

## Next Steps / 下一步

1. **CASA Module / CASA模块**
   - Customer management / 客户管理
   - Account management / 账户管理
   - Savings products / 储蓄产品
   - KYC management / KYC管理

2. **Accounting Module / 会计模块**
   - Chart of Accounts / 会计科目表
   - Journal Entries / 日记账
   - General Ledger / 总账

## License / 许可证

This project is proprietary software for SecBank.
本项目是SecBank的专有软件。

---

**SecBank CBS V2** - Built with ❤️ for Philippine Rural Banks
**SecBank CBS V2** - 为菲律宾农村银行精心打造
