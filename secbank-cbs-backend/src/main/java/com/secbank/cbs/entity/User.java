package com.secbank.cbs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * User Entity / 用户实体
 * Represents a system user with authentication and authorization details.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"roles", "branch"})
@ToString(exclude = {"roles", "branch", "passwordHash"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(unique = true, length = 100)
    private String email;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "full_name_cn", length = 100)
    private String fullNameCn;

    @Column(length = 50)
    private String phone;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_login_ip", length = 50)
    private String lastLoginIp;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    @Column(name = "must_change_password")
    @Builder.Default
    private Boolean mustChangePassword = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Get all permissions from all assigned roles.
     * 获取所有分配角色的所有权限
     */
    public Set<Permission> getAllPermissions() {
        Set<Permission> allPermissions = new HashSet<>();
        for (Role role : roles) {
            allPermissions.addAll(role.getPermissions());
        }
        return allPermissions;
    }

    /**
     * Check if user has a specific permission.
     * 检查用户是否拥有特定权限
     */
    public boolean hasPermission(String permissionCode) {
        return getAllPermissions().stream()
            .anyMatch(p -> p.getPermissionCode().equals(permissionCode));
    }

    /**
     * Check if user has a specific role.
     * 检查用户是否拥有特定角色
     */
    public boolean hasRole(String roleCode) {
        return roles.stream()
            .anyMatch(r -> r.getRoleCode().equals(roleCode));
    }
}
