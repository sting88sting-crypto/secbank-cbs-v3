package com.secbank.cbs.dto;

import lombok.*;

/**
 * Login Response / 登录响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private Long branchId;
    private Boolean mustChangePassword;
}
