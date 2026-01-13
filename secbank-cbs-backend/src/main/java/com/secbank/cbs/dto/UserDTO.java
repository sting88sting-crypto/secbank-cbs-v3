package com.secbank.cbs.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * User DTO / 用户数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String fullNameCn;
    private String phone;
    private String employeeId;
    private Long branchId;
    private String branchName;
    private String status;
    private LocalDateTime lastLoginAt;
    private Boolean mustChangePassword;
    private Set<RoleDTO> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
