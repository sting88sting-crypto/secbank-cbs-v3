package com.secbank.cbs.dto;

import lombok.*;

/**
 * Token Refresh Response / 令牌刷新响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRefreshResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
}
