package com.secbank.cbs.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Set;

/**
 * Create User Request / 创建用户请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {
    
    @NotBlank(message = "Username is required / 用户名必填")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters / 用户名必须为3-50个字符")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores / 用户名只能包含字母、数字和下划线")
    private String username;
    
    @NotBlank(message = "Password is required / 密码必填")
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters / 密码必须为8-100个字符")
    private String password;
    
    @Email(message = "Invalid email format / 邮箱格式无效")
    @Size(max = 100, message = "Email must not exceed 100 characters / 邮箱不能超过100个字符")
    private String email;
    
    @NotBlank(message = "Full name is required / 全名必填")
    @Size(max = 100, message = "Full name must not exceed 100 characters / 全名不能超过100个字符")
    private String fullName;
    
    @Size(max = 100, message = "Full name (CN) must not exceed 100 characters / 中文全名不能超过100个字符")
    private String fullNameCn;
    
    @Size(max = 50, message = "Phone must not exceed 50 characters / 电话不能超过50个字符")
    private String phone;
    
    @Size(max = 50, message = "Employee ID must not exceed 50 characters / 员工编号不能超过50个字符")
    private String employeeId;
    
    private Long branchId;
    
    @NotEmpty(message = "At least one role is required / 至少需要一个角色")
    private Set<Long> roleIds;
}
