package com.secbank.cbs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Login Request / 登录请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    
    @NotBlank(message = "Username is required / 用户名必填")
    private String username;
    
    @NotBlank(message = "Password is required / 密码必填")
    private String password;
}
