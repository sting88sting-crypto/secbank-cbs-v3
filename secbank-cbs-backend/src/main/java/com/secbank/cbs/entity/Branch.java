package com.secbank.cbs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Branch Entity / 分行实体
 * Represents a bank branch in the system.
 */
@Entity
@Table(name = "branches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_code", nullable = false, unique = true, length = 10)
    private String branchCode;

    @Column(name = "branch_name", nullable = false, length = 100)
    private String branchName;

    @Column(name = "branch_name_cn", length = 100)
    private String branchNameCn;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String province;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "manager_name", length = 100)
    private String managerName;

    @Column(name = "is_head_office")
    @Builder.Default
    private Boolean isHeadOffice = false;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

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
}
