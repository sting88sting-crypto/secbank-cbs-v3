package com.secbank.cbs.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Role DTO / 角色数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleDTO {
    private Long id;
    private String roleCode;
    private String roleName;
    private String roleNameCn;
    private String description;
    private String descriptionCn;
    private Boolean isSystemRole;
    private String status;
    private Set<PermissionDTO> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
