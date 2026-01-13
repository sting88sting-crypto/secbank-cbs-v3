package com.secbank.cbs.config;

import com.secbank.cbs.entity.Permission;
import com.secbank.cbs.entity.Role;
import com.secbank.cbs.entity.User;
import com.secbank.cbs.entity.Branch;
import com.secbank.cbs.repository.PermissionRepository;
import com.secbank.cbs.repository.RoleRepository;
import com.secbank.cbs.repository.UserRepository;
import com.secbank.cbs.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/**
 * Data Initializer / 数据初始化器
 * Creates default admin user, roles, and permissions on application startup.
 * 在应用启动时创建默认管理员用户、角色和权限
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting data initialization... / 开始数据初始化...");
        
        // Create default branch if not exists
        Branch headquarters = createDefaultBranch();
        
        // Create default permissions (always runs to ensure all permissions exist)
        Set<Permission> allPermissions = createDefaultPermissions();
        
        // Create or update admin role with ALL permissions
        Role adminRole = createOrUpdateAdminRole(allPermissions);
        
        // Create default admin user
        createAdminUser(adminRole, headquarters);
        
        log.info("Data initialization completed! / 数据初始化完成!");
    }

    private Branch createDefaultBranch() {
        return branchRepository.findByBranchCode("HQ001").orElseGet(() -> {
            log.info("Creating default headquarters branch... / 创建默认总部分行...");
            Branch branch = Branch.builder()
                .branchCode("HQ001")
                .branchName("Headquarters")
                .branchNameCn("总部")
                .address("123 Main Street")
                .city("Metro City")
                .province("Metro Province")
                .postalCode("100000")
                .phone("+1-555-0100")
                .email("hq@secbank.com")
                .managerName("System Admin")
                .status("ACTIVE")
                .build();
            return branchRepository.save(branch);
        });
    }

    private Set<Permission> createDefaultPermissions() {
        Set<Permission> permissions = new HashSet<>();
        
        // User Management Permissions
        permissions.add(createPermissionIfNotExists("USER_VIEW", "View Users", "查看用户", "USER_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("USER_CREATE", "Create Users", "创建用户", "USER_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("USER_UPDATE", "Update Users", "更新用户", "USER_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("USER_DELETE", "Delete Users", "删除用户", "USER_MANAGEMENT"));
        
        // Permission Management Permissions
        permissions.add(createPermissionIfNotExists("PERMISSION_VIEW", "View Permissions", "查看权限", "PERMISSION_MANAGEMENT"));
        
        // Role Management Permissions
        permissions.add(createPermissionIfNotExists("ROLE_VIEW", "View Roles", "查看角色", "ROLE_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("ROLE_CREATE", "Create Roles", "创建角色", "ROLE_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("ROLE_UPDATE", "Update Roles", "更新角色", "ROLE_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("ROLE_DELETE", "Delete Roles", "删除角色", "ROLE_MANAGEMENT"));
        
        // Branch Management Permissions
        permissions.add(createPermissionIfNotExists("BRANCH_VIEW", "View Branches", "查看分行", "BRANCH_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("BRANCH_CREATE", "Create Branches", "创建分行", "BRANCH_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("BRANCH_UPDATE", "Update Branches", "更新分行", "BRANCH_MANAGEMENT"));
        permissions.add(createPermissionIfNotExists("BRANCH_DELETE", "Delete Branches", "删除分行", "BRANCH_MANAGEMENT"));
        
        // Audit Log Permissions
        permissions.add(createPermissionIfNotExists("AUDIT_VIEW", "View Audit Logs", "查看审计日志", "AUDIT_MANAGEMENT"));
        
        // System Settings Permissions
        permissions.add(createPermissionIfNotExists("SETTINGS_VIEW", "View Settings", "查看设置", "SYSTEM_SETTINGS"));
        permissions.add(createPermissionIfNotExists("SETTINGS_UPDATE", "Update Settings", "更新设置", "SYSTEM_SETTINGS"));
        
        // Dashboard Permissions
        permissions.add(createPermissionIfNotExists("DASHBOARD_VIEW", "View Dashboard", "查看仪表板", "DASHBOARD"));
        
        return permissions;
    }

    private Permission createPermissionIfNotExists(String code, String name, String nameCn, String module) {
        return permissionRepository.findByPermissionCode(code).orElseGet(() -> {
            log.info("Creating permission: {} / 创建权限: {}", code, nameCn);
            Permission permission = Permission.builder()
                .permissionCode(code)
                .permissionName(name)
                .permissionNameCn(nameCn)
                .module(module)
                .status("ACTIVE")
                .build();
            return permissionRepository.save(permission);
        });
    }

    private Role createOrUpdateAdminRole(Set<Permission> permissions) {
        Role existingRole = roleRepository.findByRoleCode("ADMIN").orElse(null);
        
        if (existingRole != null) {
            // Update existing role with all permissions
            log.info("Updating admin role with all permissions... / 更新管理员角色的所有权限...");
            existingRole.setPermissions(permissions);
            return roleRepository.save(existingRole);
        } else {
            // Create new admin role
            log.info("Creating admin role... / 创建管理员角色...");
            Role role = Role.builder()
                .roleCode("ADMIN")
                .roleName("System Administrator")
                .roleNameCn("系统管理员")
                .description("Full system access with all permissions")
                .descriptionCn("拥有所有权限的完整系统访问权限")
                .isSystemRole(true)
                .status("ACTIVE")
                .permissions(permissions)
                .build();
            return roleRepository.save(role);
        }
    }

    private void createAdminUser(Role adminRole, Branch branch) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            log.info("Creating admin user... / 创建管理员用户...");
            
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            
            User admin = User.builder()
                .username("admin")
                .passwordHash(passwordEncoder.encode("admin123"))
                .email("admin@secbank.com")
                .fullName("System Administrator")
                .fullNameCn("系统管理员")
                .phone("+1-555-0001")
                .employeeId("EMP001")
                .branch(branch)
                .status("ACTIVE")
                .mustChangePassword(false)
                .roles(roles)
                .build();
            
            userRepository.save(admin);
            log.info("Admin user created successfully! Username: admin, Password: admin123");
            log.info("管理员用户创建成功！用户名: admin, 密码: admin123");
        } else {
            log.info("Admin user already exists, skipping creation. / 管理员用户已存在，跳过创建。");
        }
    }
}
