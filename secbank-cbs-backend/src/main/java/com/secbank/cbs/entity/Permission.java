package com.secbank.cbs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Permission Entity / 权限实体
 * Represents a system permission that can be assigned to roles.
 */
@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "permission_code", nullable = false, unique = true, length = 100)
    private String permissionCode;

    @Column(name = "permission_name", nullable = false, length = 100)
    private String permissionName;

    @Column(name = "permission_name_cn", length = 100)
    private String permissionNameCn;

    @Column(nullable = false, length = 50)
    private String module;

    @Column(length = 500)
    private String description;

    @Column(name = "description_cn", length = 500)
    private String descriptionCn;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
