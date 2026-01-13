package com.secbank.cbs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Token Refresh Request / 令牌刷新请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRefreshRequest {
    
    @NotBlank(message = "Refresh token is required / 刷新令牌必填")
    private String refreshToken;
}
