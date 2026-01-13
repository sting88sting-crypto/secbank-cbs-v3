# SecBank CBS V2 - Issues Found During Testing
# SecBank CBS V2 - 测试中发现的问题

## API Test Results / API测试结果

| Endpoint | Status | Issue |
|----------|--------|-------|
| `/dashboard/stats` | ❌ 500 | Internal server error |
| `/users` | ✅ 200 | Working |
| `/users/search` | ✅ 200 | Working |
| `/roles` | ✅ 200 | Working |
| `/roles/active` | ✅ 200 | Working |
| `/permissions` | ❌ 403 | Access denied - Missing PERMISSION_VIEW |
| `/permissions/grouped` | ❌ 403 | Access denied - Missing PERMISSION_VIEW |
| `/permissions/modules` | ❌ 403 | Access denied - Missing PERMISSION_VIEW |
| `/branches` | ✅ 200 | Working |
| `/branches/active` | ✅ 200 | Working |
| `/audit-logs` | ❌ 403 | Access denied - Missing AUDIT_VIEW |

## Issues to Fix / 需要修复的问题

### 1. Dashboard Stats Endpoint (500 Error)
- **Endpoint**: `/api/v1/dashboard/stats`
- **Error**: Internal server error
- **Cause**: Need to check DashboardController implementation

### 2. Permissions Endpoints (403 Error)
- **Endpoints**: `/permissions`, `/permissions/grouped`, `/permissions/modules`
- **Error**: Access denied
- **Cause**: Admin user doesn't have PERMISSION_VIEW permission
- **Fix**: Add PERMISSION_VIEW to DataInitializer and update admin role

### 3. Audit Logs Endpoint (403 Error)
- **Endpoint**: `/audit-logs`
- **Error**: Access denied
- **Cause**: Admin user doesn't have AUDIT_VIEW permission (or permission not assigned)
- **Fix**: Verify AUDIT_VIEW permission exists and is assigned to admin role

## Root Cause Analysis / 根本原因分析

The DataInitializer creates permissions but the admin role was created BEFORE the new permissions were added. Since the role already exists, the new permissions are not automatically assigned.

DataInitializer创建权限，但admin角色是在添加新权限之前创建的。由于角色已经存在，新权限不会自动分配。

## Solution Options / 解决方案选项

### Option A: Reset Database (Quick but loses data)
1. Delete Postgres volume in Railway
2. Redeploy backend
3. DataInitializer will recreate everything

### Option B: Update DataInitializer Logic (Better)
1. Modify DataInitializer to UPDATE existing admin role with new permissions
2. Push changes and redeploy

### Option C: Add API to Update Role Permissions
1. Use existing API to add permissions to admin role
2. No code changes needed if API works

## Recommended Fix / 推荐修复

Option B - Update DataInitializer to always sync admin role permissions with all available permissions.
