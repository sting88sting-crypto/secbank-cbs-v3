package com.secbank.cbs.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.Set;

/**
 * Update Role Request / 更新角色请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRoleRequest {
    
    @Size(min = 2, max = 50, message = "Role code must be 2-50 characters / 角色代码必须为2-50个字符")
    @Pattern(regexp = "^[A-Z_]+$", message = "Role code must contain only uppercase letters and underscores / 角色代码只能包含大写字母和下划线")
    private String roleCode;
    
    @Size(max = 100, message = "Role name must not exceed 100 characters / 角色名称不能超过100个字符")
    private String roleName;
    
    @Size(max = 100, message = "Role name (CN) must not exceed 100 characters / 角色中文名称不能超过100个字符")
    private String roleNameCn;
    
    @Size(max = 500, message = "Description must not exceed 500 characters / 描述不能超过500个字符")
    private String description;
    
    @Size(max = 500, message = "Description (CN) must not exceed 500 characters / 中文描述不能超过500个字符")
    private String descriptionCn;
    
    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Status must be ACTIVE or INACTIVE / 状态必须为ACTIVE或INACTIVE")
    private String status;
    
    private Set<Long> permissionIds;
}
