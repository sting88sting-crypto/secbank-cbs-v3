package com.secbank.cbs.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Set;

/**
 * Update User Request / 更新用户请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {
    
    @Email(message = "Invalid email format / 邮箱格式无效")
    @Size(max = 100, message = "Email must not exceed 100 characters / 邮箱不能超过100个字符")
    private String email;
    
    @Size(max = 100, message = "Full name must not exceed 100 characters / 全名不能超过100个字符")
    private String fullName;
    
    @Size(max = 100, message = "Full name (CN) must not exceed 100 characters / 中文全名不能超过100个字符")
    private String fullNameCn;
    
    @Size(max = 50, message = "Phone must not exceed 50 characters / 电话不能超过50个字符")
    private String phone;
    
    @Size(max = 50, message = "Employee ID must not exceed 50 characters / 员工编号不能超过50个字符")
    private String employeeId;
    
    private Long branchId;
    
    private Set<Long> roleIds;
    
    @Pattern(regexp = "^(ACTIVE|INACTIVE|LOCKED)$", message = "Status must be ACTIVE, INACTIVE or LOCKED / 状态必须为ACTIVE、INACTIVE或LOCKED")
    private String status;
}
