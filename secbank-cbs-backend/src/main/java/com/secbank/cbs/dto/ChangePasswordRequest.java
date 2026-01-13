package com.secbank.cbs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Change Password Request / 修改密码请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {
    
    @NotBlank(message = "Current password is required / 当前密码必填")
    private String currentPassword;
    
    @NotBlank(message = "New password is required / 新密码必填")
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters / 密码必须为8-100个字符")
    private String newPassword;
}
